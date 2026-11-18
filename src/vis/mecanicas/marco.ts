/**
 * Marco común de las mecánicas propias (traza-array, estructura-viva, recorrido-grafo…).
 *
 * `diagrama.ts` dibuja en píxeles reales y no en un viewBox escalado, para que los rótulos midan
 * 15 px en cualquier pantalla. Las mecánicas propias hacen lo mismo y por eso comparten esto:
 * lienzo SVG con la clase `vis-diagrama` (así heredan los estilos de formas, rótulos y celdas),
 * variables de color de la familia, redibujado al cambiar el ancho, y utilidades de dibujo.
 *
 * Cada mecánica pinta con `dibujar()` y este marco la vuelve a llamar al redimensionar. Se
 * reconstruye todo en cada llamada: son pocos elementos y evita estados a medias.
 */

import { alternativaTextual, crearLienzo, nodo, paletaDe, resolver, temaActual, t } from '../lenguaje';
import { alCambiarTema } from '../../app/tema';

export const ESTRECHO = 560;
export const LH = 19;
export const SLH = 17;
export const PX_ROTULO = 15;
export const PX_SUB = 13;
const FUENTE = 'Inter, "Inter respaldo", system-ui, sans-serif';

const medidor = document.createElement('canvas').getContext('2d');
export function ancho(texto: string, px: number, peso = 500): number {
  if (!medidor) return texto.length * px * 0.58;
  medidor.font = `${peso} ${px}px ${FUENTE}`;
  return medidor.measureText(texto).width;
}

export function envolver(texto: string, maximo: number, px = PX_SUB, peso = 500): string[] {
  if (!texto) return [];
  const palabras = texto.split(/\s+/);
  const lineas: string[] = [];
  let actual = '';
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (actual && ancho(prueba, px, peso) > maximo) { lineas.push(actual); actual = p; }
    else actual = prueba;
  }
  if (actual) lineas.push(actual);
  return lineas;
}

/** Sustituye {nombre} por su valor y {n|uno|otros} por la forma que toca según n. */
export function plantilla(texto: string, vars: Record<string, string | number> = {}): string {
  return texto
    .replace(/\{(\w+)\|([^|}]*)\|([^|}]*)\}/g, (_, k: string, uno: string, otros: string) => (Number(vars[k]) === 1 ? uno : otros))
    .replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}

/**
 * Lector de rótulos de una máquina. Si falta uno, se grita por consola (lo caza probar-maquinas)
 * en vez de pintar un hueco: un rótulo ausente tiene que notarse.
 */
export function lector(rotulos: Record<string, string> | undefined): (clave: string, vars?: Record<string, string | number>) => string {
  return (clave, vars) => {
    const v = rotulos?.[clave];
    if (v == null) { console.error(`[maquina] falta el rótulo "${clave}"`); return clave; }
    return plantilla(v, vars);
  };
}

export interface ParamsBase {
  familia_id: string;
  alternativa: string;
  resolucion: string;
}

export interface Marco {
  svg: SVGSVGElement;
  lienzo: HTMLElement;
  /** Capa donde dibuja la mecánica; se vacía antes de cada dibujo. */
  capa: SVGGElement;
  W(): number;
  H(): number;
  estrecho(): boolean;
  /** Fija el alto del lienzo (se llama desde `dibujar`). */
  alto(h: number): void;
  /** Centra en el lienzo la caja de lo ya dibujado en `capa`. Se llama al final de `dibujar`. */
  centrar(): void;
  /** Id de un marcador de flecha ya definido. */
  flecha: string;
  destruir(): void;
}

export interface OpcionesMarco {
  /** Alto deseado según el ancho, para cuando no se quiera la proporción 7/3. */
  altoPara?(ancho: number, estrecho: boolean): number;
  dibujar(): void;
}

export function crearMarco(contenedor: HTMLElement, p: ParamsBase, op: OpcionesMarco): Marco {
  const lienzo = crearLienzo(contenedor);
  const svg = nodo('svg', { class: 'vis-svg vis-diagrama vis-mq', role: 'group', 'aria-label': p.alternativa });
  svg.style.setProperty('--tam-rotulo', `${PX_ROTULO}px`);
  lienzo.append(svg);

  const defs = nodo('defs');
  const idFlecha = `fl-${Math.random().toString(36).slice(2, 7)}`;
  const marca = nodo('marker', { id: idFlecha, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, orient: 'auto-start-reverse' });
  marca.append(nodo('path', { d: 'M0,1 L9,5 L0,9 z', class: 'd-punta' }));
  defs.append(marca);
  svg.append(defs);
  const capa = nodo('g', { class: 'mq-capa' });
  svg.append(capa);

  let W = 0;
  let H = 0;
  let estrecho = false;

  function pintarPaleta(): void {
    const pal = paletaDe(p.familia_id, temaActual());
    svg.style.setProperty('--d-neutro', pal.neutro);
    svg.style.setProperty('--d-acento', pal.acento);
    svg.style.setProperty('--d-senal', pal.senal);
  }
  pintarPaleta();
  const bajaTema = alCambiarTema(pintarPaleta);

  function medir(): boolean {
    const a = lienzo.clientWidth;
    if (!a) return false;
    const est = a < ESTRECHO;
    const h = Math.round(op.altoPara ? op.altoPara(a, est) : a * (est ? 6 / 5 : 3 / 7));
    const cambia = a !== W || h !== H || est !== estrecho;
    W = a; H = h; estrecho = est;
    aplicarAlto();
    return cambia;
  }
  function aplicarAlto(): void {
    lienzo.style.aspectRatio = `${W} / ${H}`;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  }

  const observador = new ResizeObserver(() => { if (medir()) { capa.replaceChildren(); op.dibujar(); } });
  observador.observe(lienzo);
  medir();

  return {
    svg, lienzo, capa,
    W: () => W,
    H: () => H,
    estrecho: () => estrecho,
    alto(h: number) {
      const r = Math.round(h);
      if (r !== H) { H = r; aplicarAlto(); }
    },
    centrar() {
      capa.removeAttribute('transform');
      if (!W || !H) return;
      const b = capa.getBBox();
      if (!b.width || !b.height) return;
      // Solo se mueve en el eje en que sobra sitio: lo que ya llena el lienzo no se toca.
      const dx = b.width < W ? Math.round(W / 2 - (b.x + b.width / 2)) : 0;
      const dy = b.height < H ? Math.round(H / 2 - (b.y + b.height / 2)) : 0;
      if (dx || dy) capa.setAttribute('transform', `translate(${dx} ${dy})`);
    },
    flecha: idFlecha,
    destruir() {
      bajaTema();
      observador.disconnect();
    },
  };
}

/** Cierra la pieza con la alternativa textual y la resolución. */
export function cerrarPieza(contenedor: HTMLElement, p: ParamsBase): void {
  alternativaTextual(contenedor, p.alternativa);
  resolver(contenedor, p.resolucion);
}

/* ----------------------------------------------------------- dibujo -- */

type Attr = Record<string, string | number>;

export function caja(g: SVGElement, x: number, y: number, w: number, h: number, clase = 'forma', rx = 6): SVGRectElement {
  const r = nodo('rect', { x, y, width: Math.max(0, w), height: Math.max(0, h), rx, class: clase });
  g.append(r);
  return r;
}

export function texto(
  g: SVGElement, x: number, y: number, s: string,
  clase = 'd-rotulo', anchor: 'start' | 'middle' | 'end' = 'middle', extra: Attr = {},
): SVGTextElement {
  const tx = nodo('text', { x, y, class: clase, 'text-anchor': anchor, 'dominant-baseline': 'central', ...extra });
  tx.textContent = s;
  g.append(tx);
  return tx;
}

export function linea(g: SVGElement, x1: number, y1: number, x2: number, y2: number, clase = 'd-enlace', extra: Attr = {}): SVGLineElement {
  const l = nodo('line', { x1, y1, x2, y2, class: clase, ...extra });
  g.append(l);
  return l;
}

export function circulo(g: SVGElement, cx: number, cy: number, r: number, clase = 'forma'): SVGCircleElement {
  const c = nodo('circle', { cx, cy, r, class: clase });
  g.append(c);
  return c;
}

export { t };
