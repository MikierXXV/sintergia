/**
 * Mecánica «ondas»: dos frentes de onda y su interferencia, en canvas 2D.
 *
 * Es canvas y no SVG porque lo que se enseña es un campo continuo, un valor por píxel, y no una
 * lista de elementos que se puedan enfocar uno a uno: la alternativa textual y los controles cubren
 * lo que el SVG cubriría con nodos.
 *
 * Modos:
 *  - `interferencia`: cada paso fija una `fase` del guion. 0 = dos ondas por separado, 1 = su suma
 *    en movimiento, 2 = el patrón fijo de franjas (la intensidad promediada en el tiempo).
 *  - `foco`: lo anterior más un haz que ilumina una porción del patrón (`fase` 3). El haz es una
 *    propuesta, así que se dibuja con trazo discontinuo y nunca en cian (ver `rol` en lenguaje.ts).
 *
 * Con `prefers-reduced-motion` no hay animación: se pinta un único fotograma.
 * Todos los rótulos llegan en `parametros`.
 */

import {
  alternativaTextual, crearLienzo, movimientoReducido, paletaDe, resolver, temaActual, ATENUADO,
} from '../lenguaje';
import { alCambiarTema } from '../../app/tema';
import { crearMando, type Mando } from '../controles';
import type { Visualizacion } from '../lenguaje';

export interface PasoOndas {
  texto: string;
  /** 0 ondas por separado · 1 suma en movimiento · 2 patrón fijo · 3 patrón con haz. */
  fase: 0 | 1 | 2 | 3;
}

export interface ParametrosOndas {
  familia_id: string;
  modo: 'interferencia' | 'foco';
  rotulo_a: string;
  rotulo_b: string;
  rotulo_patron: string;
  /** Solo en modo `foco`. */
  rotulo_foco?: string;
  /** Rótulo del deslizador: separación de las fuentes, o dirección del haz en modo `foco`. */
  separacion: string;
  pasos: PasoOndas[];
  alternativa: string;
  resolucion: string;
}

/** Resolución interna del campo: se pinta pequeño y el navegador lo escala. */
const COLS = 140;
const FILAS = 60;
const LONGITUD_ONDA = 9;
const VELOCIDAD = 2.2;

function rgb(color: string): [number, number, number] {
  const c = document.createElement('canvas').getContext('2d');
  if (!c) return [128, 128, 128];
  c.fillStyle = color;
  c.fillRect(0, 0, 1, 1);
  const d = c.getImageData(0, 0, 1, 1).data;
  return [d[0] ?? 128, d[1] ?? 128, d[2] ?? 128];
}

export function crearOndas(contenedor: HTMLElement, p: ParametrosOndas): Visualizacion {
  const lienzo = crearLienzo(contenedor);
  const canvas = document.createElement('canvas');
  canvas.className = 'vis-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', p.alternativa);
  lienzo.append(canvas);

  const campo = document.createElement('canvas');
  campo.width = COLS;
  campo.height = FILAS;
  const cc = campo.getContext('2d');
  const cx = canvas.getContext('2d');
  if (!cc || !cx) {
    alternativaTextual(contenedor, p.alternativa);
    resolver(contenedor, p.resolucion);
    return { destruir: () => contenedor.replaceChildren() };
  }
  const imagen = cc.createImageData(COLS, FILAS);

  const foco = p.modo === 'foco';
  let fase = p.pasos[0]?.fase ?? 0;
  /** Separación de las fuentes (0-1) o dirección del haz (0-1, de izquierda a derecha). */
  let ajuste = 0.5;
  let acento: [number, number, number] = [0, 0, 0];
  let neutro: [number, number, number] = [0, 0, 0];
  let senal = '#000';
  let marco = 0;
  let mando: Mando | undefined;
  let ancho = 0;
  let alto = 0;

  function colores(): void {
    const pal = paletaDe(p.familia_id, temaActual());
    acento = rgb(pal.acento);
    neutro = rgb(pal.neutro);
    senal = pal.senal;
  }
  colores();
  const bajaTema = alCambiarTema(() => { colores(); pintar(performance.now() / 1000); });

  const fuentes = (): { ax: number; bx: number; y: number } => {
    const sep = (foco ? 0.5 : ajuste) * 0.5 + 0.1; // de 0.1 a 0.6 del ancho
    return { ax: COLS * (0.5 - sep / 2), bx: COLS * (0.5 + sep / 2), y: FILAS * 0.5 };
  };

  function pintar(t: number): void {
    const { ax, bx, y } = fuentes();
    const k = (2 * Math.PI) / LONGITUD_ONDA;
    const w = movimientoReducido() ? 0 : VELOCIDAD * t;
    const haz = ajuste * COLS; // centro del haz en x
    const d = imagen.data;
    for (let j = 0; j < FILAS; j++) {
      for (let i = 0; i < COLS; i++) {
        const r1 = Math.hypot(i - ax, (j - y) * 1.0);
        const r2 = Math.hypot(i - bx, (j - y) * 1.0);
        const o1 = Math.cos(k * r1 - w);
        const o2 = Math.cos(k * r2 - w);
        let color: [number, number, number];
        let a: number;
        if (fase === 0) {
          // Por separado: cada onda con su color, en el mismo punto se mezclan.
          const a1 = Math.max(0, o1) * Math.exp(-r1 / 70);
          const a2 = Math.max(0, o2) * Math.exp(-r2 / 70);
          const s = a1 + a2 || 1;
          color = [
            (acento[0] * a1 + neutro[0] * a2) / s,
            (acento[1] * a1 + neutro[1] * a2) / s,
            (acento[2] * a1 + neutro[2] * a2) / s,
          ];
          a = Math.min(1, a1 + a2) * 0.85;
        } else if (fase === 1) {
          const suma = (o1 + o2) / 2;
          color = suma >= 0 ? acento : neutro;
          a = Math.abs(suma) * 0.9;
        } else {
          // Patrón fijo: intensidad promediada en el tiempo, cos² de la diferencia de caminos.
          const q = Math.cos((k * (r1 - r2)) / 2);
          color = acento;
          a = q * q * 0.85;
          if (fase === 3) {
            const dentro = Math.exp(-(((i - haz) / (COLS * 0.12)) ** 2));
            a *= ATENUADO + (1 - ATENUADO) * dentro;
          }
        }
        const n = (j * COLS + i) * 4;
        d[n] = color[0];
        d[n + 1] = color[1];
        d[n + 2] = color[2];
        d[n + 3] = Math.round(a * 255);
      }
    }
    cc!.putImageData(imagen, 0, 0);
    cx!.clearRect(0, 0, ancho, alto);
    cx!.imageSmoothingEnabled = true;
    cx!.drawImage(campo, 0, 0, ancho, alto);

    // Rótulos y marcas, en píxeles de pantalla para que se lean igual en cualquier ancho.
    const px = ancho / COLS;
    const fuente = getComputedStyle(canvas).getPropertyValue('--fuente-texto') || 'sans-serif';
    cx!.font = `600 15px ${fuente}`;
    cx!.textBaseline = 'alphabetic';
    cx!.fillStyle = getComputedStyle(canvas).getPropertyValue('--texto') || senal;
    const rotular = (texto: string, x: number, yy: number, alinear: CanvasTextAlign): void => {
      cx!.textAlign = alinear;
      cx!.fillText(texto, x, yy);
    };
    const nodoFuente = (x: number, color: [number, number, number]): void => {
      cx!.beginPath();
      cx!.arc(x * px, y * px, 7, 0, Math.PI * 2);
      cx!.fillStyle = `rgb(${color[0]} ${color[1]} ${color[2]})`;
      cx!.fill();
      cx!.lineWidth = 2;
      cx!.strokeStyle = senal;
      cx!.stroke();
    };
    nodoFuente(ax, acento);
    nodoFuente(bx, neutro);
    cx!.fillStyle = getComputedStyle(canvas).getPropertyValue('--texto') || senal;
    rotular(p.rotulo_a, Math.max(6, ax * px), y * px - 16, ax * px < 90 ? 'left' : 'center');
    rotular(p.rotulo_b, Math.min(ancho - 6, bx * px), y * px + 28, ancho - bx * px < 90 ? 'right' : 'center');
    if (fase >= 2) rotular(p.rotulo_patron, ancho / 2, alto - 12, 'center');
    if (foco && fase === 3) {
      // El haz es una hipótesis: trazo discontinuo, no continuo.
      const hx = haz * px;
      const ancha = COLS * 0.12 * px;
      cx!.save();
      cx!.setLineDash([7, 5]);
      cx!.lineWidth = 2;
      cx!.strokeStyle = senal;
      cx!.strokeRect(hx - ancha, 6, ancha * 2, alto - 12);
      cx!.restore();
      if (p.rotulo_foco) {
        cx!.fillStyle = getComputedStyle(canvas).getPropertyValue('--texto') || senal;
        rotular(p.rotulo_foco, Math.min(Math.max(hx, 100), ancho - 100), 22, 'center');
      }
    }
  }

  function ajustarTamano(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = lienzo.getBoundingClientRect();
    if (!r.width) return;
    ancho = Math.round(r.width * dpr);
    alto = Math.round(r.height * dpr);
    canvas.width = ancho;
    canvas.height = alto;
    // El texto se dibuja a 15 px de pantalla: se compensa el dpr con una escala del contexto.
    cx!.setTransform(1, 0, 0, 1, 0, 0);
    ancho /= dpr; alto /= dpr;
    cx!.scale(dpr, dpr);
    pintar(performance.now() / 1000);
  }
  const observador = new ResizeObserver(ajustarTamano);
  observador.observe(lienzo);

  // Bucle solo mientras la fase se mueve (0 y 1) y el visitante admite movimiento.
  let t0 = performance.now();
  function bucle(): void {
    pintar((performance.now() - t0) / 1000);
    marco = requestAnimationFrame(bucle);
  }
  function arrancarOParar(): void {
    cancelAnimationFrame(marco);
    marco = 0;
    t0 = performance.now();
    const seMueve = fase <= 1 && !movimientoReducido();
    if (seMueve) bucle(); else pintar(0);
  }

  mando = crearMando(contenedor, {
    total: () => p.pasos.length,
    ir: (i) => { fase = p.pasos[i]?.fase ?? 0; arrancarOParar(); },
    texto: (i) => p.pasos[i]?.texto ?? '',
    controles: [{
      tipo: 'deslizador',
      id: 'ajuste',
      etiqueta: p.separacion,
      min: 0,
      max: 100,
      paso: 1,
      valor: 50,
      formato: (v: number) => `${v} %`,
      alCambiar(v: number) {
        ajuste = v / 100;
        mando?.manual();
        if (!marco) pintar(0);
      },
    }],
  });

  // Los controles se añaden tras el lienzo; la alternativa y la resolución, debajo.
  alternativaTextual(contenedor, p.alternativa);
  resolver(contenedor, p.resolucion);

  // Si la pieza sale de pantalla el bucle sobra: solo corre mientras se ve.
  const visible = new IntersectionObserver((es) => {
    for (const e of es) {
      if (e.isIntersecting) arrancarOParar();
      else { cancelAnimationFrame(marco); marco = 0; }
    }
  });
  visible.observe(lienzo);

  return {
    destruir(): void {
      cancelAnimationFrame(marco);
      observador.disconnect();
      visible.disconnect();
      bajaTema();
      mando?.destruir();
      contenedor.replaceChildren();
    },
  };
}
