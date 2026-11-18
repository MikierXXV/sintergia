/**
 * El motor común de interacción de las máquinas.
 *
 * LO QUE UNA MÁQUINA NO VUELVE A ESCRIBIR. Cada mecánica tocable repetía lo mismo con otras palabras:
 * un temporizador que se cancela mal, un «si el usuario toca esto, que se pare el guion», una onda,
 * un mensaje que viaja a velocidad fija, un contador con barra. Aquí está una vez:
 *
 *   · `crearMotor`    tiempo cancelable. `reiniciar()` corta en seco todo lo que se estaba moviendo, y con
 *                     `rapido` (salto a un paso, o movimiento reducido) las esperas valen cero.
 *   · `crearGuion`    el guion es una LISTA DE ACCIONES, las mismas que el usuario puede hacer. Pasar al
 *                     paso N reinicia y las ejecuta sin animar; un toque del usuario pausa el guion y
 *                     pone «Tu turno»; Reproducir empieza de nuevo.
 *   · `onda`, `insignia`, `viajar`   los gestos visuales comunes. Un mensaje tarda lo que mide el camino.
 *   · `crearMedidores`   contador + barra, con alerta.
 *   · `tocable`       un elemento SVG que se puede tocar, enfocar y activar con Intro o espacio.
 *
 * Todo respeta `prefers-reduced-motion` aquí, en un solo sitio: con movimiento reducido las esperas
 * valen cero, así que ninguna máquina tiene que acordarse.
 */

import { icono, type Icono, type Mando, type ModoIr } from './controles';
import { movimientoReducido, nodo } from './lenguaje';

/* ----------------------------------------------------------------- tiempo -- */

/** Lo que falla una espera cuando se corta porque la máquina se ha reiniciado. */
export class Cancelado extends Error {
  constructor() { super('cancelado'); }
}

interface Pendiente { corta(): void }
export interface Punto { x: number; y: number }

export interface Motor {
  /** Si es verdadero, `dormir` y `tween` no esperan: se usa al saltar a un paso. */
  rapido: boolean;
  /** Cuenta los reinicios. Lo que empezó en otra época ya no vale. */
  epoca(): number;
  dormir(ms: number): Promise<void>;
  /** Llama a `f` con el progreso 0→1 suavizado durante `ms`. */
  tween(ms: number, f: (t: number) => void): Promise<void>;
  /** Mueve `el` por la poligonal `puntos` a velocidad constante: tarda lo que mide el camino. */
  viajar(el: SVGElement, puntos: Punto[], velocidad?: number): Promise<void>;
  /** Corta todo lo que se estaba moviendo. Las esperas pendientes fallan con `Cancelado`. */
  reiniciar(): void;
  /** Ejecuta `f` y se traga el `Cancelado`: lo que se cortó por un reinicio no es un error. */
  ejecutar(f: () => Promise<void>): Promise<void>;
  destruir(): void;
}

const suave = (t: number): number => 1 - (1 - t) ** 3;

/** Velocidad de los mensajes, en px por ms: un viaje largo tarda más que uno corto. */
export const VELOCIDAD = 0.5;
/** Lo que tarda un viaje de `distancia`, acotado para que ni un salto minúsculo ni uno enorme desentonen. */
export const duracionViaje = (distancia: number, velocidad = VELOCIDAD): number => Math.max(260, Math.min(1400, distancia / velocidad));

export function crearMotor(): Motor {
  let epoca = 0;
  let vivo = true;
  const pendientes = new Set<Pendiente>();
  const sinEspera = (mia: number): Promise<void> => Promise.resolve().then(() => { if (mia !== epoca || !vivo) throw new Cancelado(); });

  const m: Motor = {
    rapido: false,
    epoca: () => epoca,
    dormir(ms) {
      const mia = epoca;
      if (m.rapido || movimientoReducido() || ms <= 0) return sinEspera(mia);
      return new Promise<void>((ok, mal) => {
        const p: Pendiente = { corta() { clearTimeout(id); pendientes.delete(p); mal(new Cancelado()); } };
        const id = window.setTimeout(() => { pendientes.delete(p); if (mia !== epoca || !vivo) mal(new Cancelado()); else ok(); }, ms);
        pendientes.add(p);
      });
    },
    tween(ms, f) {
      const mia = epoca;
      if (m.rapido || movimientoReducido() || ms <= 0) { f(1); return sinEspera(mia); }
      return new Promise<void>((ok, mal) => {
        let marco = 0;
        const p: Pendiente = { corta() { cancelAnimationFrame(marco); pendientes.delete(p); mal(new Cancelado()); } };
        const t0 = performance.now();
        const paso = (ahora: number): void => {
          const t = Math.min(1, (ahora - t0) / ms);
          f(suave(t));
          if (t < 1) marco = requestAnimationFrame(paso);
          else { pendientes.delete(p); ok(); }
        };
        pendientes.add(p);
        marco = requestAnimationFrame(paso);
      });
    },
    viajar(el, puntos, velocidad) {
      const tramos: number[] = [];
      let total = 0;
      for (let i = 1; i < puntos.length; i++) {
        const d = Math.hypot(puntos[i]!.x - puntos[i - 1]!.x, puntos[i]!.y - puntos[i - 1]!.y);
        tramos.push(d);
        total += d;
      }
      return m.tween(duracionViaje(total, velocidad), (t) => {
        let d = t * total;
        let i = 0;
        while (i < tramos.length - 1 && d > tramos[i]!) { d -= tramos[i]!; i++; }
        const a = puntos[i]!;
        const b = puntos[i + 1] ?? a;
        const f = tramos[i] ? d / tramos[i]! : 1;
        el.setAttribute('transform', `translate(${a.x + (b.x - a.x) * f},${a.y + (b.y - a.y) * f})`);
      });
    },
    reiniciar() {
      epoca++;
      for (const p of [...pendientes]) p.corta();
    },
    async ejecutar(f) {
      try { await f(); } catch (e) { if (!(e instanceof Cancelado)) throw e; }
    },
    destruir() { vivo = false; m.reiniciar(); },
  };
  return m;
}

/* ------------------------------------------------------------------ guion -- */

/** Un paso del guion tal como lo declara la ficha: la acción y, si la lleva, su argumento. */
export interface PasoGuion { accion: string; arg?: number | string }

export interface OpcionesGuion {
  motor: Motor;
  /** Deja el estado y el dibujo como al principio, de golpe. */
  reiniciar(): void;
  /** Lo que se puede hacer. El guion las nombra y el usuario las dispara tocando: son las mismas. */
  acciones: Record<string, (arg?: number | string) => Promise<void>>;
  /** La lista de pasos; puede cambiar (una variante tiene su propio guion), por eso se admite una función. */
  guion: PasoGuion[] | (() => PasoGuion[]);
  mando(): Mando | undefined;
}

export interface Guion {
  total(): number;
  ir(indice: number, modo: ModoIr): void;
  /** Para `OpcionesMando.texto`: la máquina narra ella misma, así que nunca devuelve texto. */
  texto(): null;
  /** ¿Se está moviendo algo? Mientras sea así, un toque del usuario se encola y la reproducción espera. */
  ocupado(): boolean;
  /**
   * Una acción del usuario. Pausa el guion, pone «Tu turno» y ejecuta `f`. Si la máquina está en medio
   * de un movimiento el toque se ENCOLA (hasta `MAX_COLA`) y se ejecuta al acabar: dos animaciones a la
   * vez sobre el mismo estado atascan la máquina, pero perder el toque parece que no responde.
   */
  tocar(f: () => Promise<void> | void, opciones?: { turno?: boolean }): void;
}

/** Cuántos toques seguidos se guardan mientras algo se mueve; los siguientes se descartan. */
const MAX_COLA = 5;

export function crearGuion(op: OpcionesGuion): Guion {
  const cola: Array<{ f: () => Promise<void> | void; turno: boolean }> = [];
  let ocupado = false;
  /** Último paso del guion ejecutado entero desde el último reinicio; −1 si ninguno, −99 si el usuario ha tocado. */
  let hecho = -1;
  const { motor } = op;
  const lista = (): PasoGuion[] => (typeof op.guion === 'function' ? op.guion() : op.guion);

  const correr = async (i: number, rapido: boolean): Promise<void> => {
    motor.rapido = rapido;
    const paso = lista()[i];
    const accion = paso && op.acciones[paso.accion];
    if (!accion) throw new Error(`El guion nombra una acción que no existe: «${paso?.accion}»`);
    await accion(paso.arg);
  };

  return {
    total: () => lista().length,
    texto: () => null,
    ocupado: () => ocupado,
    ir(i, modo) {
      const siguiente = modo === 'animar' && !ocupado && hecho === i - 1;
      if (!siguiente) {
        cola.length = 0;
        motor.reiniciar();
        op.reiniciar();
        hecho = -1;
      }
      ocupado = true;
      const mia = motor.epoca();
      void motor.ejecutar(async () => {
        try {
          // Saltar al paso N: los anteriores, de golpe. El N se enseña moviéndose si se llegó andando.
          if (!siguiente) for (let j = 0; j < i; j++) await correr(j, true);
          await correr(i, modo === 'salto');
          hecho = i;
        } finally {
          // Si hubo un reinicio por medio, manda el recorrido nuevo: no se le pisa el estado.
          if (mia === motor.epoca()) { ocupado = false; motor.rapido = false; vaciarCola(); }
        }
      });
    },
    tocar(f, opciones) {
      const turno = opciones?.turno ?? true;
      if (ocupado) {
        // El usuario manda desde ya: se pausa la reproducción y el toque espera su turno.
        op.mando()?.manual(turno);
        hecho = -99;
        if (cola.length < MAX_COLA) cola.push({ f, turno });
        return;
      }
      ejecutarToque(f, turno);
    },
  };

  function ejecutarToque(f: () => Promise<void> | void, turno: boolean): void {
    op.mando()?.manual(turno);
    hecho = -99;
    ocupado = true;
    motor.rapido = false;
    const mia = motor.epoca();
    void motor.ejecutar(async () => {
      try { await f(); } finally { if (mia === motor.epoca()) { ocupado = false; vaciarCola(); } }
    });
  }

  function vaciarCola(): void {
    const s = cola.shift();
    if (s) ejecutarToque(s.f, s.turno);
  }
}

/* ------------------------------------------------------ gestos visuales -- */

/** Un aro que se abre desde `(cx, cy)` y se apaga: «aquí acaba de pasar algo». */
export async function onda(motor: Motor, capa: SVGElement, cx: number, cy: number, r0: number, alcance = 44): Promise<void> {
  const aro = nodo('circle', { cx, cy, r: r0, class: 'm-onda' });
  capa.append(aro);
  try {
    await motor.tween(700, (t) => { aro.setAttribute('r', String(r0 + t * alcance)); aro.setAttribute('opacity', String(1 - t)); });
  } finally {
    aro.remove();
  }
}

/** La insignia numerada del orden: 1, 2, 3… Notificar es recorrer una lista y el orden importa. */
export function insignia(g: SVGElement, x: number, y: number, n: number): void {
  g.append(nodo('circle', { cx: x, cy: y, r: 11, class: 'm-insignia' }));
  const tx = nodo('text', { x, y: y + 1, class: 'm-txt m-sobre m-mono', 'text-anchor': 'middle' });
  tx.textContent = String(n);
  g.append(tx);
}

/**
 * Un elemento SVG que se toca, se enfoca y se activa con Intro o espacio. El rótulo accesible lo cambia
 * quien lo usa cuando cambia el estado («Luis, suscrito. Pulsa para que se vaya»).
 */
export function tocable(g: SVGElement, etiqueta: string, activar: () => void): void {
  g.setAttribute('class', `${g.getAttribute('class') ?? ''} m-tocable`.trim());
  g.setAttribute('role', 'button');
  g.setAttribute('tabindex', '0');
  g.setAttribute('aria-label', etiqueta);
  g.addEventListener('click', activar);
  g.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); activar(); }
  });
}

/** Coloca un elemento persistente: la transición de `transform` la hace el navegador (CSS, `.m-it`). */
export function colocar(g: SVGElement, x: number, y: number): void {
  g.style.transform = `translate(${x}px,${y}px)`;
}

/** Dos fotogramas: lo que se acaba de insertar ya tiene su estilo y puede transicionar. */
export const siguienteFotograma = (): Promise<void> => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(() => ok())));

/* ---------------------------------------------------------- escala de diseño -- */

/**
 * Una máquina propia se diseña en una caja fija (por ejemplo 700×300 en ancho y 360×360 en estrecho) y
 * se escala al lienzo real. Los rótulos NO se escalan con ella: `--tam-rotulo` se recalcula para que
 * midan 15 px de pantalla, la misma regla que `crearSvg`.
 */
export interface CajaDiseno { ancho: number; alto: number }
export interface Escalada { g: SVGGElement; s: number; estrecho: boolean; D: CajaDiseno }

/** Por debajo de este ancho de lienzo se usa la caja estrecha. */
const UMBRAL_ESTRECHO = 640;

export function escalar(capa: SVGGElement, W: number, anchoD: CajaDiseno, estrechoD: CajaDiseno): Escalada {
  const estrecho = W < UMBRAL_ESTRECHO;
  const D = estrecho ? estrechoD : anchoD;
  const s = W / D.ancho;
  const g = nodo('g', { transform: `scale(${s})` });
  g.style.setProperty('--tam-rotulo', `${15 / s}px`);
  capa.append(g);
  return { g, s, estrecho, D };
}

/** El alto del lienzo para un ancho dado, conservando la proporción de la caja de diseño que toque. */
export const altoDiseno = (W: number, anchoD: CajaDiseno, estrechoD: CajaDiseno): number => {
  const D = W < UMBRAL_ESTRECHO ? estrechoD : anchoD;
  return W * (D.alto / D.ancho);
};

/* ---------------------------------------------------------------- medidores -- */

export interface DefMedidor { id: string; etiqueta: string; barra?: boolean }
export interface Medidores {
  /** Pone el valor escrito y, si lleva barra, su proporción (0–1). `alerta` lo marca. */
  poner(id: string, texto: string, proporcion?: number, alerta?: boolean): void;
  destruir(): void;
}

/** Contadores con barra bajo el lienzo. Son HTML y no SVG: se leen como texto y no dependen de la escala. */
export function crearMedidores(donde: HTMLElement, defs: DefMedidor[]): Medidores {
  const fila = document.createElement('div');
  fila.className = 'vis-medidores';
  const celdas = new Map<string, { raiz: HTMLElement; valor: HTMLElement; barra: HTMLElement | null }>();
  for (const d of defs) {
    const raiz = document.createElement('div');
    raiz.className = 'vis-medidor';
    const et = document.createElement('small');
    et.textContent = d.etiqueta;
    const valor = document.createElement('b');
    valor.textContent = '—';
    raiz.append(et, valor);
    let barra: HTMLElement | null = null;
    if (d.barra) {
      const pista = document.createElement('div');
      pista.className = 'vis-medidor-barra';
      barra = document.createElement('i');
      pista.append(barra);
      raiz.append(pista);
    }
    celdas.set(d.id, { raiz, valor, barra });
    fila.append(raiz);
  }
  donde.append(fila);
  return {
    poner(id, texto, proporcion, alerta = false) {
      const c = celdas.get(id);
      if (!c) return;
      c.valor.textContent = texto;
      if (c.barra && proporcion != null) c.barra.style.width = `${Math.round(Math.max(0, Math.min(1, proporcion)) * 100)}%`;
      c.raiz.classList.toggle('alerta', alerta);
    },
    destruir() { fila.remove(); },
  };
}

/* ------------------------------------------------------------------- varios -- */

/** Cambia el rótulo de un botón de la fila de acciones y, si se da, su icono (play ↔ pausa). */
export function rotularBoton(b: HTMLButtonElement | undefined, texto: string, ic?: Icono): void {
  const s = b?.querySelector('span');
  if (s) s.textContent = texto;
  if (ic && b) b.querySelector('svg')?.replaceWith(icono(ic));
}

/** Pone una clase durante `ms` (un rebote, un temblor). Con movimiento reducido no hace nada. */
export function destello(el: Element, clase: string, ms = 450): void {
  if (movimientoReducido()) return;
  el.classList.add(clase);
  window.setTimeout(() => el.classList.remove(clase), ms);
}
