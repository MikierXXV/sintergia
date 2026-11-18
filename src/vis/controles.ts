/**
 * Los controles comunes de toda máquina.
 *
 *   parámetros con rótulo (encima del lienzo)
 *   pista de progreso, una marca por paso  ·  PASO 3 DE 7 + texto
 *   [▶ Reproducir]  [◀] [▶| Paso]  [⟲ Reiniciar]
 *
 * ESTÁN AQUÍ Y NO EN CADA MECÁNICA porque son lo que hace que el sitio se aprenda una sola vez: quien
 * ha usado la máquina del Observer sabe usar la del hash sin mirar. Tampoco el teclado es de cada
 * pieza: espacio reproduce o pausa, las flechas avanzan y retroceden un paso, con el lienzo enfocado.
 *
 * El texto del paso va en una región `aria-live="polite"`: es lo que oye quien no ve el dibujo, y
 * por eso cada mecánica tiene que escribir pasos que se entiendan sin él.
 */

import { movimientoReducido, t } from './lenguaje';

export type ControlOpciones = {
  tipo: 'opciones';
  id: string;
  etiqueta: string;
  opciones: Array<{ id: string; etiqueta: string }>;
  valor: string;
  alCambiar(valor: string): void;
  /**
   * Si cambiar la opción reinicia el ciclo (por defecto sí: el paso 4 de una variante no es el paso 4
   * de otra). Con `false` la máquina sigue como estaba y el cambio cuenta como «tu turno»: se usa en
   * las máquinas de juego libre, donde cambiar la política con la caché llena no tiene por qué vaciarla.
   */
  reinicia?: boolean;
  /** Si las opciones no caben en una línea pasan a dos, en vez de desplazarse (pocas opciones y largas). */
  envolver?: boolean;
};

export type ControlDeslizador = {
  tipo: 'deslizador';
  id: string;
  etiqueta: string;
  min: number;
  max: number;
  paso?: number;
  valor: number;
  /** Cómo se escribe el valor junto al deslizador. */
  formato?(v: number): string;
  alCambiar(valor: number): void;
};

export type Control = ControlOpciones | ControlDeslizador;

/**
 * Cómo se llega a un paso. `animar`: es el siguiente de la secuencia y se enseña moviéndose. `salto`:
 * se llega desde cualquier otro sitio (marca de la pista, anterior, reinicio, cambio de parámetro) y la
 * máquina reinicia y ejecuta hasta ahí SIN animar. Las mecánicas que no distinguen lo ignoran.
 */
export type ModoIr = 'animar' | 'salto';

export interface OpcionesMando {
  /** Pasos de la secuencia guiada. 0 oculta los botones de paso (simuladores y calculadoras). */
  total(): number;
  ir(indice: number, modo: ModoIr): void;
  /** Texto del paso. `null`: no se toca la región viva (la máquina narra ella misma con `narrar`). */
  texto(indice: number): string | null;
  controles?: Control[];
  /** Intervalo de la reproducción automática, en ms. */
  intervalo?: number;
  /** ¿Sigue animándose el paso anterior? Mientras sea así la reproducción espera en vez de avanzar. */
  ocupado?(): boolean;
  /** Botones propios que se añaden a la fila (p. ej. «tirar un servidor»). */
  acciones?: Array<{ id?: string; etiqueta: string; icono?: Icono; alPulsar(): void }>;
}

export interface Mando {
  indice(): number;
  ir(indice: number): void;
  /** Vuelve a pintar contador y texto: se llama cuando cambia el número de pasos. */
  refrescar(): void;
  /** Texto libre para la región viva, en simuladores sin pasos. */
  anunciar(texto: string): void;
  /**
   * Narra en la región viva sin tocar el contador: lo que la máquina cuenta mientras se mueve. Admite
   * `**negrita**` (nada más: se convierte en nodos, nunca en HTML).
   */
  narrar(texto: string): void;
  /**
   * El usuario ha tocado algo: el guion se pausa y la etiqueta pasa a «Tu turno». Reproducir empieza
   * de nuevo desde el paso 1.
   */
  manual(mostrarTurno?: boolean): void;
  /** ¿Está el usuario al mando (ha tocado algo desde el último reinicio del guion)? */
  enManual(): boolean;
  /** Un botón de `acciones`, por su `id`, para desactivarlo, cambiarle el rótulo o marcarlo pulsado. */
  boton(id: string): HTMLButtonElement | undefined;
  controles(): HTMLElement;
  destruir(): void;
}

/** Por encima de este número de pasos la pista deja de ser una marca por paso y pasa a barra continua. */
const MAX_MARCAS = 16;
/** Por encima de este número de marcas, en móvil la pista se parte en dos filas (si no, miden menos de 24 px). */
const MAX_MARCAS_FILA = 10;

const ICONOS = {
  play: '<path d="M8 5.5v13l11-6.5z"/>',
  pausa: '<path d="M8 5.5v13M16 5.5v13" stroke-width="3.2"/>',
  atras: '<path d="M18 6l-8 6 8 6zM6 6v12"/>',
  paso: '<path d="M6 6l8 6-8 6zM18 6v12"/>',
  reiniciar: '<path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5M4.5 4.5v4h4"/>',
  mas: '<path d="M9 6l6 6-6 6"/>',
  menos: '<path d="M15 6l-6 6 6 6"/>',
  enviar: '<path d="M4 12l16-8-6 16-3-7z"/>',
  sumar: '<path d="M12 5v14M5 12h14"/>',
  salir: '<path d="M10 5H5v14h5M15 8l4 4-4 4M19 12H9"/>',
  reto: '<path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3zM9.5 20h5"/>',
} as const;
export type Icono = keyof typeof ICONOS;

export function icono(nombre: Icono): SVGSVGElement {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('class', nombre === 'play' || nombre === 'pausa' ? 'ico lleno' : 'ico');
  s.innerHTML = ICONOS[nombre];
  return s;
}

function boton(clase: string, ic: Icono | null, texto: string, alPulsar: () => void, soloIcono = false): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `btn ${clase}${soloIcono ? ' ico-solo' : ''}`;
  if (ic) b.append(icono(ic));
  if (soloIcono) b.setAttribute('aria-label', texto);
  else {
    const s = document.createElement('span');
    s.textContent = texto;
    b.append(s);
  }
  b.addEventListener('click', alPulsar);
  return b;
}

/**
 * Un control segmentado con muchas opciones se desplaza, y sin indicio nadie sabe que hay más: se le
 * ponen un fundido y una flecha en el borde por el que aún queda contenido.
 */
function envolverSeg(seg: HTMLElement, bajas: Array<() => void>): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'vis-seg-wrap';
  const flecha = (lado: 'mas' | 'menos'): HTMLButtonElement => {
    const b = document.createElement('button');
    b.type = 'button';
    b.tabIndex = -1;
    b.setAttribute('aria-label', t(lado === 'mas' ? 'vis.opciones_siguientes' : 'vis.opciones_anteriores'));
    b.className = `vis-seg-${lado}`;
    b.append(icono(lado));
    b.addEventListener('click', () => seg.scrollBy({ left: (lado === 'mas' ? 1 : -1) * seg.clientWidth * 0.6, behavior: movimientoReducido() ? 'auto' : 'smooth' }));
    return b;
  };
  wrap.append(flecha('menos'), seg, flecha('mas'));
  const actualizar = (): void => {
    // ¿Caben todas las opciones en el sitio disponible? Se mide contra el contenedor, no contra el
    // propio control, para que mostrar las flechas (que le quitan ancho) no cambie la decisión.
    const fila = wrap.closest<HTMLElement>('.vis-parametros');
    const est = fila ? getComputedStyle(fila) : null;
    const disponible = fila && est ? fila.clientWidth - parseFloat(est.paddingLeft) - parseFloat(est.paddingRight) - 2 : 0;
    const contenido = Array.from(seg.children).reduce((a, c) => a + (c as HTMLElement).offsetWidth, 0) + 2 * (seg.children.length - 1) + 6;
    if (disponible > 0) wrap.classList.toggle('con-scroll', contenido > disponible);
    wrap.classList.toggle('hay-menos', seg.scrollLeft > 8);
    wrap.classList.toggle('hay-mas', seg.scrollWidth - seg.clientWidth - seg.scrollLeft > 8);
  };
  seg.addEventListener('scroll', actualizar, { passive: true });
  const ro = new ResizeObserver(actualizar);
  ro.observe(seg);
  bajas.push(() => ro.disconnect());
  // La opción elegida tiene que verse al montar.
  queueMicrotask(() => {
    const fila = wrap.closest('.vis-parametros');
    if (fila) ro.observe(fila);
    const on = seg.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (on && on.offsetLeft + on.offsetWidth > seg.clientWidth) seg.scrollLeft = on.offsetLeft - 8;
    actualizar();
  });
  return wrap;
}

/** `**negrita**` → nodos de texto y <strong>. Es el único formato de las narraciones. */
export function conNegritas(destino: HTMLElement, texto: string): void {
  destino.replaceChildren(...texto.split('**').map((trozo, i) => {
    if (i % 2 === 0) return document.createTextNode(trozo);
    const b = document.createElement('strong');
    b.textContent = trozo;
    return b;
  }));
}

export function crearMando(contenedor: HTMLElement, op: OpcionesMando): Mando {
  // Dos piezas: los parámetros van ENCIMA del lienzo y el transporte debajo.
  const raiz = document.createElement('div');
  raiz.className = 'vis-mando';
  const params = document.createElement('div');
  params.className = 'vis-parametros';

  let indice = 0;
  let temporizador = 0;
  let reproduciendo = false;
  /** El usuario ha tocado algo y el guion ya no manda. */
  let manualActivo = false;
  /** El usuario ha puesto algo en marcha (el tráfico) sin tocar el dibujo: no hay paso ni «Tu turno» que mostrar. */
  let sinRotulo = false;

  const pista = document.createElement('div');
  pista.className = 'vis-pista';
  pista.setAttribute('role', 'group');
  const estado = document.createElement('p');
  estado.className = 'vis-estado';
  estado.setAttribute('aria-live', 'polite');
  estado.setAttribute('role', 'status');
  const contador = document.createElement('span');
  contador.className = 'vis-contador';
  const narracion = document.createElement('span');
  narracion.className = 'vis-narracion';
  estado.append(contador, narracion);

  const total = (): number => op.total();

  /**
   * Una marca por paso; se reconstruye si cambia el número de pasos. Con muchos pasos las marcas serían
   * puntos imposibles de tocar: entonces la pista es una barra continua (un deslizador) con objetivo de 44 px.
   */
  function pintarPista(): void {
    const n = total();
    if (n > MAX_MARCAS) {
      let r = pista.querySelector<HTMLInputElement>('input');
      if (!r) {
        r = document.createElement('input');
        r.type = 'range';
        r.min = '0';
        r.step = '1';
        r.addEventListener('input', () => { parar(); ir(Number(r!.value), 'salto'); });
        pista.replaceChildren(r);
        pista.classList.add('continua');
      }
      r.max = String(n - 1);
      r.value = String(indice);
      r.style.setProperty('--p', `${(indice / (n - 1)) * 100}%`);
      r.setAttribute('aria-label', t('vis.ir_al_paso').replace('{n}', String(indice + 1)).replace('{total}', String(n)));
      return;
    }
    pista.classList.remove('continua');
    pista.style.setProperty('--n', String(n));
    pista.style.setProperty('--mitad', String(Math.ceil(n / 2)));
    pista.classList.toggle('larga', n > MAX_MARCAS_FILA);
    if (pista.querySelector('input') || pista.children.length !== n) {
      pista.replaceChildren(...Array.from({ length: n }, (_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', t('vis.ir_al_paso').replace('{n}', String(i + 1)).replace('{total}', String(n)));
        b.addEventListener('click', () => { parar(); ir(i, 'salto'); });
        return b;
      }));
    }
    Array.from(pista.children).forEach((b, j) => {
      b.className = manualActivo ? '' : j < indice ? 'hecho' : j === indice ? 'ahora' : '';
      if (j === indice && !manualActivo) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    });
  }

  function pintarEstado(): void {
    const n = total();
    if (n === 0) return;
    contador.textContent = sinRotulo ? '' : manualActivo ? t('vis.tu_turno') : t('vis.paso').replace('{n}', String(indice + 1)).replace('{total}', String(n));
    const texto = op.texto(indice);
    if (texto !== null) narracion.textContent = texto;
    btnPaso.disabled = n <= 1;
    btnAtras.disabled = indice === 0;
    pintarPista();
  }

  function ir(i: number, forzado?: ModoIr): void {
    const n = total();
    if (n === 0) return;
    const destino = Math.max(0, Math.min(n - 1, i));
    // Solo el paso siguiente de una secuencia que sigue su curso se enseña moviéndose.
    const modo: ModoIr = forzado ?? (destino === indice + 1 && !manualActivo ? 'animar' : 'salto');
    indice = destino;
    manualActivo = false;
    sinRotulo = false;
    op.ir(indice, modo);
    pintarEstado();
    if (reproduciendo && indice >= n - 1) parar();
  }

  function manual(mostrarTurno = true): void {
    if (total() === 0) return;
    parar();
    manualActivo = true;
    sinRotulo = !mostrarTurno;
    pintarEstado();
  }

  function etiquetaPlay(ic: Icono, texto: string): void {
    const s = document.createElement('span');
    s.textContent = texto;
    btnPlay.replaceChildren(icono(ic), s);
  }

  function parar(): void {
    reproduciendo = false;
    clearTimeout(temporizador);
    etiquetaPlay('play', t('vis.reproducir'));
  }

  function siguiente(retraso = op.intervalo ?? 1900): void {
    temporizador = window.setTimeout(() => {
      if (!reproduciendo) return;
      // El paso anterior aún se está moviendo: se espera en lugar de cortarlo.
      if (op.ocupado?.()) { siguiente(150); return; }
      if (indice >= total() - 1) { parar(); return; }
      ir(indice + 1, 'animar');
      if (reproduciendo) siguiente();
    }, retraso);
  }

  function reproducir(): void {
    if (reproduciendo) { parar(); return; }
    // Con el usuario al mando, o al final del guion, Reproducir empieza de nuevo desde el paso 1.
    if (manualActivo || indice >= total() - 1) ir(0, 'salto');
    reproduciendo = true;
    etiquetaPlay('pausa', t('vis.pausa'));
    siguiente();
  }

  const btnPlay = boton('pri', 'play', t('vis.reproducir'), reproducir);
  const btnAtras = boton('sec', 'atras', t('vis.paso_anterior'), () => { parar(); ir(indice - 1, 'salto'); }, true);
  const btnPaso = boton('sec', 'paso', t('vis.paso_siguiente'), () => { parar(); ir(manualActivo || indice >= total() - 1 ? 0 : indice + 1); });
  const btnReiniciar = boton('fantasma', 'reiniciar', t('vis.reiniciar'), () => { parar(); ir(0, 'salto'); });
  const fila = document.createElement('div');
  fila.className = 'vis-botones';
  const filaSec = document.createElement('div');
  filaSec.className = 'vis-botones-sec';
  if (total() > 0) {
    filaSec.append(btnAtras, btnPaso, btnReiniciar);
    fila.append(btnPlay, filaSec);
  }
  const botonesAccion = new Map<string, HTMLButtonElement>();
  // Las acciones propias van en su contenedor: en móvil, si son 4 o más, se reparten en dos columnas
  // (en una sola apilarían medio alto de pantalla); en escritorio el contenedor no existe (`contents`).
  const acciones = document.createElement('div');
  acciones.className = 'vis-acciones';
  if ((op.acciones?.length ?? 0) >= 4) acciones.classList.add('en-rejilla');
  for (const a of op.acciones ?? []) {
    const b = boton('sec', a.icono ?? null, a.etiqueta, a.alPulsar);
    if (a.id) botonesAccion.set(a.id, b);
    acciones.append(b);
  }
  if (acciones.children.length) fila.append(acciones);

  // ---- parámetros propios ----
  const bajas: Array<() => void> = [];
  for (const c of op.controles ?? []) {
    const grupo = document.createElement('div');
    grupo.className = 'vis-parametro';
    if (c.tipo === 'opciones') {
      grupo.setAttribute('role', 'group');
      const rotulo = document.createElement('span');
      rotulo.className = 'vis-parametro-nombre';
      rotulo.id = `vis-p-${c.id}-${Math.random().toString(36).slice(2, 7)}`;
      rotulo.textContent = c.etiqueta;
      grupo.setAttribute('aria-labelledby', rotulo.id);
      const seg = document.createElement('div');
      seg.className = 'vis-seg';
      const botones = c.opciones.map((o) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'vis-opcion';
        b.textContent = o.etiqueta;
        b.setAttribute('aria-pressed', String(o.id === c.valor));
        b.addEventListener('click', () => {
          if (c.valor === o.id) return;
          parar();
          c.valor = o.id;
          botones.forEach((x, k) => x.setAttribute('aria-pressed', String(c.opciones[k]!.id === o.id)));
          c.alCambiar(o.id);
          // Cambiar un parámetro reinicia el ciclo: el paso 4 de una variante no es el paso 4 de otra.
          // Salvo en las máquinas de juego libre (`reinicia: false`), donde cuenta como «tu turno».
          if (total() > 0) { if (c.reinicia === false) manual(); else ir(0, 'salto'); }
        });
        return b;
      });
      seg.append(...botones);
      if (c.envolver) { seg.classList.add('envuelve'); grupo.append(rotulo, seg); } else grupo.append(rotulo, envolverSeg(seg, bajas));
    } else {
      const et = document.createElement('label');
      et.className = 'vis-parametro-nombre';
      const campo = document.createElement('input');
      campo.type = 'range';
      campo.min = String(c.min);
      campo.max = String(c.max);
      campo.step = String(c.paso ?? 1);
      campo.value = String(c.valor);
      const lectura = document.createElement('output');
      lectura.className = 'vis-lectura';
      const fmt = c.formato ?? ((v: number) => String(v));
      lectura.textContent = fmt(c.valor);
      const nombre = document.createElement('span');
      nombre.textContent = c.etiqueta;
      et.append(nombre, campo, lectura);
      campo.addEventListener('input', () => {
        c.valor = Number(campo.value);
        lectura.textContent = fmt(c.valor);
        c.alCambiar(c.valor);
      });
      grupo.append(et);
    }
    params.append(grupo);
  }

  if (total() > 0) { raiz.classList.add('con-pasos'); raiz.append(pista); }
  raiz.append(estado);
  if (fila.children.length) raiz.append(fila);
  if (params.children.length) contenedor.prepend(params);
  contenedor.append(raiz);

  // El lienzo se puede enfocar para usar el teclado sobre él.
  const lienzo = contenedor.querySelector<HTMLElement>('.vis-lienzo');
  if (lienzo && total() > 0) {
    lienzo.tabIndex = 0;
    lienzo.setAttribute('role', 'group');
    lienzo.setAttribute('aria-label', t('vis.lienzo'));
  }

  // Teclado: vale desde cualquier punto de la máquina, no solo desde los botones.
  const alTeclear = (e: KeyboardEvent): void => {
    const objetivo = e.target as HTMLElement;
    if (objetivo.closest('input, select, textarea')) return;
    if (total() === 0) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); parar(); ir(manualActivo ? 0 : indice + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); parar(); ir(indice - 1, 'salto'); }
    else if (e.key === ' ' && !objetivo.closest('button')) { e.preventDefault(); reproducir(); }
  };
  contenedor.addEventListener('keydown', alTeclear);
  bajas.push(() => contenedor.removeEventListener('keydown', alTeclear));

  // Con movimiento reducido se enseña ya el estado final y el paso a paso queda manual.
  queueMicrotask(() => ir(movimientoReducido() ? Math.max(0, total() - 1) : 0, 'salto'));

  return {
    indice: () => indice,
    ir,
    refrescar() { pintarEstado(); },
    anunciar(texto: string) { narracion.textContent = texto; contador.textContent = ''; },
    narrar(texto: string) { conNegritas(narracion, texto); },
    manual,
    enManual: () => manualActivo,
    boton: (id: string) => botonesAccion.get(id),
    controles: () => raiz,
    destruir() {
      parar();
      bajas.forEach((b) => b());
      raiz.remove();
      params.remove();
    },
  };
}
