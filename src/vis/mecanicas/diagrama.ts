/**
 * Mecánica «diagrama»: un esquema de cajas y flechas que se recorre paso a paso.
 *
 * ES LA MECÁNICA MAYORITARIA, y lo es a propósito. Casi todo concepto de este sitio se entiende como
 * «unos actores, unos mensajes y un orden»: quién habla con quién, qué cambia en cada paso, qué ocurre
 * si quito una pieza. Una sola mecánica que lo sepa dibujar bien —en escritorio y en móvil, con
 * teclado, con movimiento reducido— vale más que sesenta dibujos a medida, y mantiene las máquinas
 * como DATOS: añadir un concepto es escribir un JSON, no TypeScript.
 *
 * LO QUE DECLARA LA FICHA
 *  - `elementos`: cajas, círculos, cilindros, fichas, grupos, texto suelto, fragmentos de código y
 *    tablas, con su posición en porcentaje (0–100). Los rótulos llegan de la ficha, nunca de aquí.
 *  - `enlaces`: flechas o líneas entre elementos. Su id es «de>a».
 *  - `pasos`: la secuencia guiada. Cada paso dice qué se ilumina, qué mensajes viajan, qué estados
 *    cambian y qué se muestra u oculta; `muestra`, `oculta`, `mueve`, `sub` y `celdas` son
 *    ACUMULATIVOS (lo que un paso deja hecho se queda), el resto vale solo para ese paso.
 *  - `controles`: hasta dos selectores. Cada opción puede traer un `parche` que añade o cambia
 *    elementos y enlaces, o sustituye los pasos: así «antes ⇄ después», «pull ⇄ push» o «con caché ⇄
 *    sin caché» son datos, y los elementos con el mismo id se deslizan de una posición a otra.
 *
 * MÓVIL. El dibujo se hace en píxeles reales, no en un viewBox escalado: los rótulos miden 15 px en
 * cualquier pantalla. Bajo 560 px de ancho las posiciones se TRANSPONEN (x↔y) y el lienzo se hace más
 * alto: una fila de cuatro cajas pasa a ser una columna. `movil: [x, y]` fija una posición propia.
 */

import {
  TRAZO, alternativaTextual, crearLienzo, movimientoReducido, nodo, paletaDe, resolver,
  temaActual,
} from '../lenguaje';
import { alCambiarTema } from '../../app/tema';
import { crearMando, type Control } from '../controles';
import { proporcionMovil, type Visualizacion } from '../lenguaje';

/* ------------------------------------------------------------------ tipos -- */

export type TipoElemento = 'caja' | 'circulo' | 'cilindro' | 'ficha' | 'grupo' | 'texto' | 'codigo' | 'tabla' | 'traza';

export interface ElementoD {
  id: string;
  tipo?: TipoElemento;
  x: number;
  y: number;
  etiqueta?: string;
  sub?: string;
  /** Ancho (y alto, en grupos) como porcentaje del lienzo. Sin él, la caja se ajusta al texto. */
  w?: number;
  h?: number;
  /**
   * `dato` es lo medido (trazo continuo); `propuesta` es una idea que el texto atribuye (trazo
   * discontinuo, nunca el acento de la familia). Es la regla de rigor de DEC §6, hecha forma.
   */
  rol?: 'acento' | 'neutro' | 'dato' | 'propuesta';
  /** Solo `traza`: una respuesta con su deflexión, o una línea plana (la hipótesis nula). */
  forma?: 'respuesta' | 'plana';
  oculto?: boolean;
  /** Posición propia en pantallas estrechas, en lugar de la transpuesta. */
  movil?: [number, number];
  lineas?: string[];
  columnas?: string[];
  filas?: string[][];
  quitar?: boolean;
}

export interface EnlaceD {
  de: string;
  a: string;
  tipo?: 'flecha' | 'linea' | 'doble';
  estilo?: 'continuo' | 'punteado';
  etiqueta?: string;
  grosor?: 1 | 2 | 3;
  oculto?: boolean;
  quitar?: boolean;
}

export interface PasoD {
  texto: string;
  activos?: string[];
  mensajes?: Array<{ de: string; a: string; etiqueta?: string }>;
  estados?: Record<string, 'atenuado' | 'error' | 'ok'>;
  sub?: Record<string, string>;
  muestra?: string[];
  oculta?: string[];
  mueve?: Record<string, [number, number]>;
  resalta?: Record<string, Array<number | [number, number]>>;
  celdas?: Record<string, Record<string, string>>;
}

interface Parche {
  elementos?: ElementoD[];
  enlaces?: EnlaceD[];
  pasos?: PasoD[];
}

export interface ControlD {
  id: string;
  etiqueta: string;
  opciones: Array<{ id: string; etiqueta: string; parche?: Parche }>;
}

export interface ParametrosDiagrama {
  familia_id: string;
  alternativa: string;
  resolucion: string;
  elementos: ElementoD[];
  enlaces?: EnlaceD[];
  pasos: PasoD[];
  controles?: ControlD[];
  /** Proporción del lienzo en escritorio y móvil (ancho/alto). Por defecto 7/3 y 5/6. */
  proporcion?: [number, number];
}

/* ------------------------------------------------------------- utilidades -- */

const ESTRECHO = 560;
const LH = 19;      // alto de línea del rótulo
const SLH = 17;     // alto de línea del subrótulo
const HUECO_ROTULO = 24; // alto libre entre dos cajas unidas por una flecha con rótulo (en pantalla estrecha)
const MARGEN = 14;   // margen interior del encuadre: ninguna caja toca el borde del lienzo
const PX_ROTULO = 15;
const PX_SUB = 13;
const PX_CODIGO = 13;
const TRAZA_ALTO = 34; // alto que se añade a la caja para dibujar la traza bajo el rótulo
const FUENTE = 'Inter, "Inter respaldo", system-ui, sans-serif';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const lienzoMedida = document.createElement('canvas').getContext('2d');
function ancho(texto: string, px: number, mono = false, peso = 500): number {
  if (!lienzoMedida) return texto.length * px * 0.58;
  lienzoMedida.font = mono ? `${px}px ${MONO}` : `${peso} ${px}px ${FUENTE}`;
  return lienzoMedida.measureText(texto).width;
}

/** Parte un texto en líneas que quepan en `maximo` píxeles. Una palabra más larga se queda entera. */
function envolver(texto: string, maximo: number, px: number, peso = 500): string[] {
  if (!texto) return [];
  const palabras = texto.split(/\s+/);
  const lineas: string[] = [];
  let actual = '';
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (actual && ancho(prueba, px, false, peso) > maximo) { lineas.push(actual); actual = p; }
    else actual = prueba;
  }
  if (actual) lineas.push(actual);
  return lineas;
}

function clonar<T>(x: T): T { return x === undefined ? x : (JSON.parse(JSON.stringify(x)) as T); }

function fusionar<T extends { id?: string; de?: string; a?: string; quitar?: boolean }>(
  base: T[], cambios: T[] | undefined, clave: (x: T) => string,
): T[] {
  const mapa = new Map(base.map((x) => [clave(x), x]));
  for (const c of cambios ?? []) {
    if (c.quitar) mapa.delete(clave(c));
    else mapa.set(clave(c), { ...(mapa.get(clave(c)) ?? {}), ...c } as T);
  }
  return [...mapa.values()];
}

interface Efectivo { elementos: ElementoD[]; enlaces: EnlaceD[]; pasos: PasoD[] }

function efectivo(p: ParametrosDiagrama, elegidas: Record<string, string>): Efectivo {
  let e: Efectivo = { elementos: clonar(p.elementos), enlaces: clonar(p.enlaces ?? []), pasos: clonar(p.pasos) };
  for (const c of p.controles ?? []) {
    const parche = c.opciones.find((o) => o.id === elegidas[c.id])?.parche;
    if (!parche) continue;
    e = {
      elementos: fusionar(e.elementos, clonar(parche.elementos), (x) => x.id),
      enlaces: fusionar(e.enlaces, clonar(parche.enlaces), (x) => `${x.de}>${x.a}`),
      pasos: parche.pasos ? clonar(parche.pasos) : e.pasos,
    };
  }
  return e;
}

/* --------------------------------------------------------------- geometría -- */

interface Geo {
  el: ElementoD;
  cx: number;
  cy: number;
  w: number;
  h: number;
  etiquetas: string[];
  /** Líneas reservadas para el subrótulo (el máximo entre todos sus valores posibles). */
  subLineas: number;
  /** Alto del subrótulo que cuelga fuera de la forma (fichas y círculos); cuenta al separar cajas. */
  hs: number;
  anchoSub: number;
  celdas?: { cols: number[]; filaAlto: number };
  /** Empujón que separa cajas que se montan (ver `relajar`). */
  nx: number;
  ny: number;
}

export function crearDiagrama(contenedor: HTMLElement, p: ParametrosDiagrama): Visualizacion {
  const lienzo = crearLienzo(contenedor);
  const [propD, propM] = p.proporcion ?? [7 / 3, proporcionMovil()];
  const svg = nodo('svg', { class: 'vis-svg vis-diagrama', role: 'group', 'aria-label': p.alternativa });
  svg.style.setProperty('--tam-rotulo', `${PX_ROTULO}px`);
  lienzo.append(svg);

  // Marcador de flecha, una sola vez.
  const defs = nodo('defs');
  const marca = nodo('marker', { id: `flecha-${Math.random().toString(36).slice(2, 7)}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, orient: 'auto-start-reverse' });
  marca.append(nodo('path', { d: 'M0,1 L9,5 L0,9 z', class: 'd-punta' }));
  defs.append(marca);
  svg.append(defs);
  const idMarca = marca.getAttribute('id')!;

  const capaEnlaces = nodo('g', { class: 'd-enlaces' });
  const capaNodos = nodo('g', { class: 'd-nodos' });
  const capaMensajes = nodo('g', { class: 'd-mensajes' });
  svg.append(capaEnlaces, capaNodos, capaMensajes);

  const elegidas: Record<string, string> = {};
  for (const c of p.controles ?? []) elegidas[c.id] = c.opciones[0]!.id;

  let datos = efectivo(p, elegidas);
  let W = 0;
  let H = 0;
  let altoBase = 0;
  /** Holgura horizontal de una caja respecto a su texto; baja solo si, ni creciendo en alto, caben. */
  let relleno = 24;
  let estrecho = false;
  let geos = new Map<string, Geo>();
  const gNodo = new Map<string, SVGGElement>();
  let pasoActual = 0;
  let primerDibujo = true;

  /* ---- colores, que dependen del tema ---- */
  function pintarPaleta(): void {
    const pal = paletaDe(p.familia_id, temaActual());
    svg.style.setProperty('--d-neutro', pal.neutro);
    svg.style.setProperty('--d-acento', pal.acento);
    svg.style.setProperty('--d-senal', pal.senal);
  }
  pintarPaleta();
  const bajaTema = alCambiarTema(pintarPaleta);

  /* ---- medida ---- */
  function posicion(el: ElementoD, xy?: [number, number]): [number, number] {
    const base: [number, number] = xy ?? [el.x, el.y];
    if (!estrecho) return base;
    if (el.movil && !xy) return el.movil;
    return [base[1], base[0]];
  }

  function textosDe(el: ElementoD): string[] {
    const out = [el.sub ?? ''];
    for (const s of datos.pasos) if (s.sub?.[el.id] != null) out.push(s.sub[el.id]!);
    return out.filter(Boolean);
  }

  function medirConTopes(topes: Map<string, number>): void {
    geos = new Map();
    for (const el of datos.elementos) {
      const tipo = el.tipo ?? 'caja';
      const [px, py] = posicion(el);
      const g: Geo = { el, cx: 0, cy: 0, w: 0, h: 0, etiquetas: [], subLineas: 0, hs: 0, anchoSub: 0, nx: 0, ny: 0 };
      const maxCaja = el.w ? (el.w / 100) * W : Math.min((W - 2 * MARGEN) * 0.46, 250, topes.get(el.id) ?? Infinity);
      const interior = Math.max(40, maxCaja - 24);

      if (tipo === 'grupo') {
        g.w = ((el.w ?? 40) / 100) * W;
        g.h = ((el.h ?? 40) / 100) * H;
      } else if (tipo === 'codigo') {
        const ls = el.lineas ?? [];
        const mayor = Math.max(40, ...ls.map((l) => ancho(l, PX_CODIGO, true)));
        g.w = Math.min(W - 2 * MARGEN, mayor + 24);
        g.h = ls.length * SLH + 16 + (el.etiqueta ? LH : 0);
        g.etiquetas = el.etiqueta ? [el.etiqueta] : [];
      } else if (tipo === 'tabla') {
        const todasCeldas = datos.pasos.flatMap((s) => Object.entries(s.celdas?.[el.id] ?? {}));
        // Holgura de 16 px por columna; si así la tabla no cabe a lo ancho, baja a 8 (el texto manda).
        const columnas = (hol: number): number[] => {
          const cs = (el.columnas ?? []).map((c, i) =>
            Math.max(ancho(c, PX_SUB, false, 600), ...(el.filas ?? []).map((f) => ancho(f[i] ?? '', PX_SUB))) + hol);
          for (const [k, v] of todasCeldas) {
            const c = Number(k.split(',')[1]);
            if (!Number.isNaN(c) && cs[c] != null) cs[c] = Math.max(cs[c]!, ancho(v, PX_SUB) + hol);
          }
          return cs;
        };
        let cols = columnas(16);
        if (cols.reduce((a, b) => a + b, 0) > W - 2 * MARGEN) cols = columnas(8);
        g.celdas = { cols, filaAlto: 26 };
        g.w = cols.reduce((a, b) => a + b, 0);
        g.h = ((el.filas?.length ?? 0) + 1) * 26 + (el.etiqueta ? LH : 0) + 2;
        g.etiquetas = el.etiqueta ? [el.etiqueta] : [];
      } else {
        const etiq = el.etiqueta ?? '';
        const subs = textosDe(el);
        if (tipo === 'circulo' || tipo === 'ficha') {
          g.etiquetas = etiq ? (tipo === 'ficha' ? envolver(etiq, interior, PX_ROTULO) : [etiq]) : [];
          const tw = Math.max(0, ...g.etiquetas.map((x) => ancho(x, PX_ROTULO)));
          if (tipo === 'circulo') { g.w = g.h = Math.max(44, tw + 16); }
          else { g.w = Math.max(34, tw + 14); g.h = Math.max(30, g.etiquetas.length * LH + 12); }
          g.subLineas = 0;
          if (subs.length) {
            // El subrótulo de un círculo o una ficha va debajo, sin caja.
            const l = Math.max(...subs.map((s) => envolver(s, Math.max(interior, 90), PX_SUB).length));
            g.subLineas = l;
            g.hs = l * SLH + 4;
            g.anchoSub = Math.max(...subs.map((s) => Math.max(...envolver(s, Math.max(interior, 90), PX_SUB).map((x) => ancho(x, PX_SUB)))));
          }
        } else {
          g.etiquetas = envolver(etiq, interior, PX_ROTULO);
          const lsub = subs.map((s) => envolver(s, interior, PX_SUB));
          g.subLineas = Math.max(0, ...lsub.map((l) => l.length));
          g.anchoSub = Math.max(0, ...lsub.flat().map((x) => ancho(x, PX_SUB)));
          const tw = Math.max(0, ...g.etiquetas.map((x) => ancho(x, PX_ROTULO)), g.anchoSub);
          g.w = el.w ? (el.w / 100) * W : Math.max(tw + relleno, 52);
          g.h = Math.max(tipo === 'texto' ? 0 : 38, g.etiquetas.length * LH + g.subLineas * SLH + (tipo === 'texto' ? 0 : 16));
          if (tipo === 'cilindro') g.h += 10;
          if (tipo === 'traza') g.h += TRAZA_ALTO;
        }
      }

      g.w = Math.max(0, Math.min(g.w, W - 2 * MARGEN));
      g.h = Math.max(0, g.h);
      g.cx = Math.min(W - g.w / 2 - MARGEN, Math.max(g.w / 2 + MARGEN, MARGEN + (px / 100) * (W - 2 * MARGEN)));
      g.cy = Math.min(H - g.h / 2 - MARGEN, Math.max(g.h / 2 + MARGEN, MARGEN + (py / 100) * (H - 2 * MARGEN)));
      geos.set(el.id, g);
    }
  }

  /**
   * Mide en dos pasadas. En la primera se conocen los centros; en la segunda, cada caja se limita al
   * 90 % de la distancia a su vecina de la misma fila, y el texto se reparte en más líneas si hace
   * falta. Así dos cajas contiguas nunca se montan, sea cual sea el ancho de la pantalla.
   */
  function medir(): void {
    if (H !== altoBase) { H = altoBase; aplicarAlto(); }
    relleno = 24;
    calcularEnlazadas();
    medirConTopes(new Map());
    const topes = new Map<string, number>();
    const lista = [...geos.values()].filter((g) => !g.el.w && !['grupo', 'texto'].includes(g.el.tipo ?? 'caja'));
    for (const a of lista) {
      for (const b of lista) {
        if (a === b) continue;
        const mismaFila = Math.abs(a.cy - b.cy) < (a.h + b.h) / 2 + 6;
        if (!mismaFila) continue;
        const d = Math.abs(a.cx - b.cx);
        if (d < 8) continue;
        topes.set(a.el.id, Math.min(topes.get(a.el.id) ?? Infinity, d * 0.9));
      }
    }
    if (topes.size) medirConTopes(topes);
    relajar();
    /*
     * En pantalla estrecha hay fichas con más cajas de las que caben en el cuadrado: en vez de
     * dejarlas montadas, el lienzo crece en alto (las posiciones son porcentajes) hasta que dejan de
     * pisarse. Solo ocurre cuando de verdad no caben; el resto conserva la proporción del token.
     */
    if (estrecho) {
      let vueltas = 0;
      while (hayCajasMontadas() && H < W * 1.9 && vueltas++ < 20) {
        H += Math.round(W * 0.08);
        medirConTopes(topes);
        relajar();
      }
      if (hayCajasMontadas()) {
        // Una fila con más cajas de las que caben a lo ancho: crecer en alto no la separa. Se estrecha la holgura.
        relleno = 12;
        medirConTopes(topes);
        relajar();
      }
      if (H !== altoBase) aplicarAlto();
    }
  }
  /**
   * Las cajas que hay que mantener separadas. En pantalla estrecha cuentan también las ocultas que un
   * paso acaba mostrando («Hacha» aparece junto a «Magia»): si no, se montan cuando aparecen.
   */
  function cajasQueCuentan(): Geo[] {
    const aparecen = new Set<string>();
    if (estrecho) for (const st of datos.pasos) st.muestra?.forEach((id) => aparecen.add(id));
    return [...geos.values()].filter((g) => !(estrecho ? ['grupo'] : ['grupo', 'texto']).includes(g.el.tipo ?? 'caja') && (!g.el.oculto || aparecen.has(g.el.id)));
  }
  /** Una oculta que ocupa el mismo sitio que otra caja la sustituye (un código que se amplía): no se separan. */
  function sustituyen(a: Geo, b: Geo): boolean {
    return !!(a.el.oculto || b.el.oculto) && Math.abs(a.cx - b.cx) < 8 && Math.abs(a.cy - b.cy) < 8;
  }
  /** Pares (en ambos sentidos) unidos por una flecha o un mensaje con rótulo, en cualquier paso. */
  let enlazadasConRotulo = new Set<string>();
  function calcularEnlazadas(): void {
    enlazadasConRotulo = new Set();
    const par = (a: string, b: string): void => { enlazadasConRotulo.add(`${a}|${b}`); enlazadasConRotulo.add(`${b}|${a}`); };
    for (const e of datos.enlaces) if (e.etiqueta) par(e.de, e.a);
    for (const st of datos.pasos) for (const m of st.mensajes ?? []) if (m.etiqueta) par(m.de, m.a);
  }
  function hayCajasMontadas(): boolean {
    const lista = cajasQueCuentan();
    for (let i = 0; i < lista.length; i++) for (let j = i + 1; j < lista.length; j++) {
      const a = lista[i]!;
      const b = lista[j]!;
      if (sustituyen(a, b)) continue;
      const dx = Math.abs(b.cx - a.cx);
      const dy = Math.abs((b.cy + b.hs / 2) - (a.cy + a.hs / 2));
      const holguraX = dx - (a.w + b.w) / 2;
      const holguraY = dy - (a.h + a.hs + b.h + b.hs) / 2;
      if (holguraX < -0.5 && holguraY < -0.5) return true;
      // Dos cajas unidas por una flecha con rótulo, una sobre otra, necesitan sitio entre ellas para el rótulo.
      if (enlazadasConRotulo.has(`${a.el.id}|${b.el.id}`) && holguraY >= holguraX && holguraY < HUECO_ROTULO) return true;
    }
    return false;
  }

  /**
   * Último recurso contra cajas que se montan: si dos siguen pisándose tras ajustar los anchos, se
   * apartan por el eje en que menos se penetran. Es un empujón, no un algoritmo de disposición: las
   * posiciones de la ficha mandan, y esto solo corrige lo que una pantalla estrecha no deja cumplir.
   */
  function relajar(): void {
    const lista = cajasQueCuentan();
    for (let vuelta = 0; vuelta < 8; vuelta++) {
      let movido = false;
      for (let i = 0; i < lista.length; i++) {
        for (let j = i + 1; j < lista.length; j++) {
          const a = lista[i]!;
          const b = lista[j]!;
          const dx = b.cx - a.cx;
          const dy = (b.cy + b.hs / 2) - (a.cy + a.hs / 2);
          if (sustituyen(a, b)) continue;
          const ox = (a.w + b.w) / 2 + 6 - Math.abs(dx);
          const oy = (a.h + a.hs + b.h + b.hs) / 2 + 6 - Math.abs(dy);
          if (ox <= 0 || oy <= 0) continue;
          movido = true;
          if (ox <= oy) {
            const m = (ox / 2 + 0.5) * (dx >= 0 ? 1 : -1);
            a.nx -= m; b.nx += m; a.cx -= m; b.cx += m;
          } else {
            const m = (oy / 2 + 0.5) * (dy >= 0 ? 1 : -1);
            a.ny -= m; b.ny += m; a.cy -= m; b.cy += m;
          }
          for (const g of [a, b]) {
            const cx = Math.min(W - g.w / 2 - MARGEN, Math.max(g.w / 2 + MARGEN, g.cx));
            const cy = Math.min(H - g.h / 2 - MARGEN, Math.max(g.h / 2 + MARGEN, g.cy));
            g.nx += cx - g.cx; g.ny += cy - g.cy; g.cx = cx; g.cy = cy;
          }
        }
      }
      if (!movido) break;
    }
  }

  /** Punto del borde del elemento `g` en dirección a (tx, ty). */
  function borde(g: Geo, tx: number, ty: number): [number, number] {
    const dx = tx - g.cx;
    const dy = ty - g.cy;
    if (dx === 0 && dy === 0) return [g.cx, g.cy];
    const tipo = g.el.tipo ?? 'caja';
    if (tipo === 'circulo') {
      const r = g.w / 2;
      const d = Math.hypot(dx, dy);
      return [g.cx + (dx / d) * r, g.cy + (dy / d) * r];
    }
    const hx = g.w / 2;
    const hy = g.h / 2;
    const s = Math.min(dx === 0 ? Infinity : hx / Math.abs(dx), dy === 0 ? Infinity : hy / Math.abs(dy));
    return [g.cx + dx * s, g.cy + dy * s];
  }

  /* ---- estado acumulado hasta un paso ---- */
  interface Estado {
    visibles: Set<string>;
    posiciones: Map<string, [number, number]>;
    subs: Map<string, string>;
    celdas: Map<string, Map<string, string>>;
    paso: PasoD;
  }
  function estadoEn(i: number): Estado {
    const visibles = new Set<string>();
    for (const el of datos.elementos) if (!el.oculto) visibles.add(el.id);
    for (const e of datos.enlaces) if (!e.oculto) visibles.add(`${e.de}>${e.a}`);
    const posiciones = new Map<string, [number, number]>();
    const subs = new Map<string, string>();
    const celdas = new Map<string, Map<string, string>>();
    for (let k = 0; k <= i && k < datos.pasos.length; k++) {
      const s = datos.pasos[k]!;
      s.muestra?.forEach((id) => visibles.add(id));
      s.oculta?.forEach((id) => visibles.delete(id));
      for (const [id, xy] of Object.entries(s.mueve ?? {})) posiciones.set(id, xy);
      for (const [id, v] of Object.entries(s.sub ?? {})) subs.set(id, v);
      for (const [id, m] of Object.entries(s.celdas ?? {})) {
        const dest = celdas.get(id) ?? new Map<string, string>();
        for (const [kk, v] of Object.entries(m)) dest.set(kk, v);
        celdas.set(id, dest);
      }
    }
    return { visibles, posiciones, subs, celdas, paso: datos.pasos[i] ?? { texto: '' } };
  }

  /* ---- dibujo de un elemento ---- */
  function cuerpo(g: Geo, st: Estado): SVGGElement {
    const el = g.el;
    const tipo = el.tipo ?? 'caja';
    const grupo = nodo('g', { class: 'forma-grupo' });
    const hw = g.w / 2;
    const hh = g.h / 2;
    const rol = el.rol ? ` rol-${el.rol}` : '';

    if (tipo === 'grupo') {
      grupo.append(nodo('rect', { x: -hw, y: -hh, width: g.w, height: g.h, rx: 12, class: 'forma d-grupo' }));
      if (el.etiqueta) {
        const tx = nodo('text', { x: -hw + 10, y: -hh + 14, class: 'd-rotulo d-rotulo-grupo', 'text-anchor': 'start', 'dominant-baseline': 'central' });
        tx.textContent = el.etiqueta;
        grupo.append(tx);
      }
      return grupo;
    }

    if (tipo === 'codigo') {
      const marco = nodo('rect', { x: -hw, y: -hh, width: g.w, height: g.h, rx: 8, class: `forma d-codigo${rol}` });
      grupo.append(marco);
      let y0 = -hh + 8;
      if (el.etiqueta) {
        const tx = nodo('text', { x: -hw + 12, y: y0 + LH / 2, class: 'd-sub', 'text-anchor': 'start', 'dominant-baseline': 'central' });
        tx.textContent = el.etiqueta;
        grupo.append(tx);
        y0 += LH;
      }
      const marcadas = new Set((st.paso.resalta?.[el.id] ?? []).map((v) => (Array.isArray(v) ? v[0] : v)));
      (el.lineas ?? []).forEach((l, i) => {
        const y = y0 + i * SLH;
        const on = marcadas.has(i);
        if (on) grupo.append(nodo('rect', { x: -hw + 4, y, width: Math.max(0, g.w - 8), height: SLH, rx: 4, class: 'd-linea-activa' }));
        const tx = nodo('text', { x: -hw + 12, y: y + SLH / 2, class: `d-codigo-texto${on ? ' on' : ''}`, 'text-anchor': 'start', 'dominant-baseline': 'central', 'xml:space': 'preserve' });
        tx.textContent = l;
        grupo.append(tx);
      });
      return grupo;
    }

    if (tipo === 'tabla' && g.celdas) {
      const { cols, filaAlto } = g.celdas;
      let y0 = -hh;
      if (el.etiqueta) {
        const tx = nodo('text', { x: -hw, y: y0 + LH / 2, class: 'd-sub', 'text-anchor': 'start', 'dominant-baseline': 'central' });
        tx.textContent = el.etiqueta;
        grupo.append(tx);
        y0 += LH;
      }
      const textos = st.celdas.get(el.id);
      const marcadas = new Set((st.paso.resalta?.[el.id] ?? []).map((v) => (Array.isArray(v) ? `${v[0]},${v[1]}` : `${v},*`)));
      const filas = [el.columnas ?? [], ...(el.filas ?? [])];
      filas.forEach((fila, r) => {
        let x = -hw;
        fila.forEach((valor, c) => {
          const clave = `${r - 1},${c}`;
          const on = r > 0 && (marcadas.has(clave) || marcadas.has(`${r - 1},*`));
          grupo.append(nodo('rect', {
            x, y: y0 + r * filaAlto, width: cols[c]!, height: filaAlto,
            class: `d-celda${r === 0 ? ' cab' : ''}${on ? ' on' : ''}`,
          }));
          const tx = nodo('text', { x: x + cols[c]! / 2, y: y0 + r * filaAlto + filaAlto / 2, class: `d-sub${r === 0 ? ' d-cab' : ''}`, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
          tx.textContent = r > 0 ? (textos?.get(clave) ?? valor) : valor;
          grupo.append(tx);
          x += cols[c]!;
        });
      });
      return grupo;
    }

    // Formas con rótulo.
    let forma: SVGElement;
    if (tipo === 'circulo') forma = nodo('circle', { r: hw, class: `forma${rol}` });
    else if (tipo === 'ficha') forma = nodo('rect', { x: -hw, y: -hh, width: g.w, height: g.h, rx: 8, class: `forma${rol}` });
    else if (tipo === 'cilindro') {
      const ry = 7;
      forma = nodo('path', {
        class: `forma${rol}`,
        d: `M${-hw},${-hh + ry} a${hw},${ry} 0 0 1 ${g.w},0 v${g.h - 2 * ry} a${hw},${ry} 0 0 1 ${-g.w},0 z M${-hw},${-hh + ry} a${hw},${ry} 0 0 0 ${g.w},0`,
      });
    } else if (tipo === 'texto') forma = nodo('rect', { x: -hw, y: -hh, width: g.w, height: g.h, class: 'forma d-vacia' });
    else forma = nodo('rect', { x: -hw, y: -hh, width: g.w, height: g.h, rx: 10, class: `forma${rol}` });
    grupo.append(forma);

    const sub = st.subs.get(el.id) ?? el.sub ?? '';
    const subL = sub ? envolver(sub, Math.max(40, g.w - 20), PX_SUB) : [];
    // El cilindro centra solo lo que se ve: reservar líneas de subrótulo ausentes lo dejaba pegado a la tapa.
    const lineasSub = tipo === 'cilindro' ? subL.length : g.subLineas;
    const total = g.etiquetas.length * LH + (tipo === 'circulo' || tipo === 'ficha' ? 0 : lineasSub * SLH);
    // En un cilindro el cuerpo visible empieza bajo la tapa: el texto se centra ahí, no en la caja entera.
    let y = tipo === 'circulo' || tipo === 'ficha' ? 0 : tipo === 'traza' ? -hh + 8 : -total / 2 + (tipo === 'cilindro' ? 7 : 0);
    g.etiquetas.forEach((l, i) => {
      const tx = nodo('text', {
        x: 0, y: tipo === 'circulo' ? 0 : tipo === 'ficha' ? (i - (g.etiquetas.length - 1) / 2) * LH : y + LH / 2 + i * LH,
        class: 'd-rotulo', 'text-anchor': 'middle', 'dominant-baseline': 'central',
      });
      tx.textContent = l;
      grupo.append(tx);
    });
    if (tipo === 'circulo' || tipo === 'ficha') {
      subL.forEach((l, i) => {
        const tx = nodo('text', { x: 0, y: hh + 12 + i * SLH, class: 'd-sub', 'text-anchor': 'middle', 'dominant-baseline': 'central' });
        tx.textContent = l;
        grupo.append(tx);
      });
    } else {
      y += g.etiquetas.length * LH;
      subL.forEach((l, i) => {
        const tx = nodo('text', { x: 0, y: y + SLH / 2 + i * SLH, class: 'd-sub', 'text-anchor': 'middle', 'dominant-baseline': 'central' });
        tx.textContent = l;
        grupo.append(tx);
      });
    }
    if (tipo === 'traza') {
      // Línea de base y, si es una respuesta, una deflexión amortiguada: es un esquema, no un registro.
      const base = hh - 14;
      const x0 = -hw + 14;
      const x1 = hw - 14;
      let d = `M${x0},${base}`;
      if (el.forma === 'plana') d += ` L${x1},${base}`;
      else {
        const n = 36;
        for (let k = 1; k <= n; k++) {
          const u = k / n;
          const amp = u < 0.25 ? 0 : 13 * Math.exp(-(u - 0.25) * 5) * Math.sin((u - 0.25) * 22);
          d += ` L${x0 + u * (x1 - x0)},${base - amp}`;
        }
      }
      grupo.append(nodo('path', { d, class: 'd-traza' }));
    }
    return grupo;
  }

  /* ---- composición completa de un paso ---- */
  const activables = new Map<string, number>();
  function indexarActivables(): void {
    activables.clear();
    datos.pasos.forEach((s, i) => {
      for (const id of [...(s.activos ?? []), ...(s.mensajes ?? []).flatMap((m) => [m.de, m.a])]) {
        if (!activables.has(id)) activables.set(id, i);
      }
    });
  }

  let mando: ReturnType<typeof crearMando>;
  const animaciones: Animation[] = [];

  function dibujar(i: number, animar: boolean): void {
    pasoActual = i;
    animaciones.splice(0).forEach((a) => a.cancel());
    const st = estadoEn(i);
    const activos = new Set(st.paso.activos ?? []);
    for (const m of st.paso.mensajes ?? []) { activos.add(m.de); activos.add(m.a); activos.add(`${m.de}>${m.a}`); activos.add(`${m.a}>${m.de}`); }

    // Posiciones efectivas (con `mueve`) → geometría definitiva de este paso.
    for (const [id, g] of geos) {
      const xy = st.posiciones.get(id);
      const [px, py] = posicion(g.el, xy);
      const nx = xy ? 0 : g.nx;
      const ny = xy ? 0 : g.ny;
      g.cx = Math.min(W - g.w / 2 - MARGEN, Math.max(g.w / 2 + MARGEN, MARGEN + (px / 100) * (W - 2 * MARGEN) + nx));
      g.cy = Math.min(H - g.h / 2 - MARGEN, Math.max(g.h / 2 + MARGEN, MARGEN + (py / 100) * (H - 2 * MARGEN) + ny));
    }

    // Nodos: se reutilizan los <g> existentes para que se deslicen entre variantes y pasos.
    const vivos = new Set<string>();
    for (const el of datos.elementos) {
      const g = geos.get(el.id);
      if (!g) continue;
      vivos.add(el.id);
      let nodoG = gNodo.get(el.id);
      const nuevo = !nodoG;
      if (!nodoG) {
        nodoG = nodo('g', { class: 'nodo' });
        gNodo.set(el.id, nodoG);
        capaNodos.append(nodoG);
      }
      // El grupo va al fondo: se reordena.
      if ((el.tipo ?? 'caja') === 'grupo') capaNodos.prepend(nodoG);
      nodoG.replaceChildren(cuerpo(g, st));
      const visible = st.visibles.has(el.id);
      const estado = st.paso.estados?.[el.id];
      const activo = activos.has(el.id);
      nodoG.setAttribute('class',
        `nodo${activo ? ' n-activo' : ''}${estado ? ` n-${estado}` : ''}${visible ? '' : ' n-oculto'}`);
      if (nuevo && primerDibujo) nodoG.style.transition = 'none';
      nodoG.style.transform = `translate(${g.cx}px, ${g.cy}px)`;
      if (nuevo) requestAnimationFrame(() => { nodoG!.style.transition = ''; });
      nodoG.setAttribute('aria-hidden', visible ? 'false' : 'true');
      const salto = activables.get(el.id);
      const interactivo = visible && salto != null && (el.tipo ?? 'caja') !== 'grupo' && (el.tipo ?? 'caja') !== 'texto';
      if (interactivo) {
        nodoG.setAttribute('tabindex', '0');
        nodoG.setAttribute('role', 'button');
        nodoG.setAttribute('aria-label', el.etiqueta ?? el.id);
      } else {
        nodoG.removeAttribute('tabindex');
        nodoG.removeAttribute('role');
        nodoG.removeAttribute('aria-label');
      }
    }
    for (const [id, g] of gNodo) if (!vivos.has(id)) { g.remove(); gNodo.delete(id); }

    // Enlaces.
    capaEnlaces.replaceChildren();
    capaMensajes.replaceChildren();

    /*
     * Los rótulos de flechas y mensajes se colocan esquivando las cajas visibles y los rótulos ya
     * puestos. Sin esto, tres mensajes que salen del mismo nodo se pisan en cuanto la pantalla se
     * estrecha, y hay que corregir a mano los datos de cada concepto para cada ancho.
     */
    type Rect = [number, number, number, number];
    const ocupados: Rect[] = [];
    for (const [id, g] of geos) {
      if (!st.visibles.has(id) || (g.el.tipo ?? 'caja') === 'grupo') continue;
      ocupados.push([g.cx - g.w / 2 - 2, g.cy - g.h / 2 - 2, g.cx + g.w / 2 + 2, g.cy + g.h / 2 + g.hs + 2]);
    }
    const choca = (r: Rect): boolean =>
      ocupados.some((o) => r[0] < o[2] && o[0] < r[2] && r[1] < o[3] && o[1] < r[3]);
    function rotuloEn(x1: number, y1: number, x2: number, y2: number, fraccion: number, texto: string, clase: string): void {
      const ancho2 = ancho(texto, PX_SUB, false, 600) / 2 + 4;
      const x = Math.min(W - ancho2 - MARGEN + 4, Math.max(ancho2 + MARGEN - 4, x1 + (x2 - x1) * fraccion));
      const y0 = y1 + (y2 - y1) * fraccion;
      let y = y0 - 14;
      let xr = x;
      let libre = false;
      for (const dy of [-14, 14, -30, 30, -46, 46, -62, 62]) {
        const cy = Math.min(H - 16, Math.max(16, y0 + dy));
        if (!choca([x - ancho2, cy - 9, x + ancho2, cy + 9])) { y = cy; libre = true; break; }
      }
      // Sin hueco sobre la línea (cajas muy juntas en una pantalla estrecha): se busca al lado de
      // ella, lo más cerca posible, en vez de dejar el rótulo encima de una caja.
      if (!libre) {
        let mejor = Infinity;
        for (const dy of [0, -14, 14, -30, 30, -46, 46]) {
          for (let dx = 0; dx <= W; dx += 8) {
            for (const sg of dx ? [1, -1] : [1]) {
              const cx = x + sg * dx;
              const cy = Math.min(H - 16, Math.max(16, y0 + dy));
              if (cx - ancho2 < MARGEN - 4 || cx + ancho2 > W - MARGEN + 4) continue;
              const coste = dx * 1.5 + Math.abs(dy);
              if (coste < mejor && !choca([cx - ancho2, cy - 9, cx + ancho2, cy + 9])) { mejor = coste; xr = cx; y = cy; libre = true; }
            }
          }
        }
      }
      ocupados.push([xr - ancho2, y - 9, xr + ancho2, y + 9]);
      const tx = nodo('text', { x: xr, y, class: clase, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
      tx.textContent = texto;
      capaMensajes.append(tx);
    }

    for (const e of datos.enlaces) {
      const clave = `${e.de}>${e.a}`;
      const a = geos.get(e.de);
      const b = geos.get(e.a);
      if (!a || !b) continue;
      const visible = st.visibles.has(clave) && st.visibles.has(e.de) && st.visibles.has(e.a);
      const [x1, y1] = borde(a, b.cx, b.cy);
      const [x2, y2] = borde(b, a.cx, a.cy);
      const on = activos.has(clave);
      const l = nodo('line', {
        x1, y1, x2, y2,
        class: `d-enlace${on ? ' on' : ''}${e.estilo === 'punteado' ? ' punteado' : ''}${visible ? '' : ' oculto'}`,
        'stroke-width': on ? TRAZO.enfasis : e.grosor ? [0, 1, 2.2, 3.6][e.grosor]! : TRAZO.base,
      });
      const tipo = e.tipo ?? 'flecha';
      if (tipo !== 'linea') l.setAttribute('marker-end', `url(#${idMarca})`);
      if (tipo === 'doble') l.setAttribute('marker-start', `url(#${idMarca})`);
      capaEnlaces.append(l);
      if (e.etiqueta && visible) rotuloEn(x1, y1, x2, y2, 0.5, e.etiqueta, 'd-sub d-halo');
    }

    // Mensajes del paso: un punto que viaja y su rótulo a media altura de la línea.
    for (const m of st.paso.mensajes ?? []) {
      const a = geos.get(m.de);
      const b = geos.get(m.a);
      if (!a || !b) continue;
      const [x1, y1] = borde(a, b.cx, b.cy);
      const [x2, y2] = borde(b, a.cx, a.cy);
      if (!datos.enlaces.some((e) => (e.de === m.de && e.a === m.a) || (e.de === m.a && e.a === m.de))) {
        capaEnlaces.append(nodo('line', { x1, y1, x2, y2, class: ['d-enlace', 'on', 'punteado'].join(' '), 'stroke-width': TRAZO.enfasis, 'marker-end': `url(#${idMarca})` }));
      }
      const punto = nodo('circle', { r: 6, class: 'd-punto', cx: 0, cy: 0 });
      capaMensajes.append(punto);
      if (animar && !movimientoReducido()) {
        animaciones.push(punto.animate(
          [{ transform: `translate(${x1}px, ${y1}px)` }, { transform: `translate(${x2}px, ${y2}px)` }],
          { duration: 750, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' },
        ));
      } else {
        punto.style.transform = `translate(${x2}px, ${y2}px)`;
      }
      if (m.etiqueta) rotuloEn(x1, y1, x2, y2, 0.6, m.etiqueta, 'd-sub d-halo d-mensaje');
    }
    primerDibujo = false;
  }

  /* ---- ciclo de vida ---- */
  function ajustarTamano(): boolean {
    const a = lienzo.clientWidth;
    if (!a) return false;
    const est = a < ESTRECHO;
    const alto = Math.round(a / (est ? propM : propD));
    // `H` puede haber crecido en `medir()`; lo que se compara es el alto que toca por proporción.
    const cambia = a !== W || alto !== altoBase || est !== estrecho;
    if (cambia) { W = a; H = alto; altoBase = alto; estrecho = est; aplicarAlto(); }
    return cambia;
  }
  function aplicarAlto(): void {
    lienzo.style.aspectRatio = `${W} / ${H}`;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  }

  const observador = new ResizeObserver(() => { if (ajustarTamano()) { medir(); dibujar(pasoActual, false); } });
  observador.observe(lienzo);
  ajustarTamano();
  medir();
  indexarActivables();

  // Tocar o pulsar un elemento lleva al primer paso donde interviene.
  const alActivar = (e: Event): void => {
    const g = (e.target as Element).closest<SVGGElement>('.nodo[tabindex]');
    if (!g) return;
    const id = [...gNodo].find(([, v]) => v === g)?.[0];
    const salto = id ? activables.get(id) : undefined;
    if (salto != null) mando.ir(salto);
  };
  svg.addEventListener('click', alActivar);
  svg.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && (e.target as Element).closest('.nodo[tabindex]')) {
      e.preventDefault();
      e.stopPropagation();
      alActivar(e);
    }
  });

  const controles: Control[] = (p.controles ?? []).map((c) => ({
    tipo: 'opciones' as const,
    id: c.id,
    etiqueta: c.etiqueta,
    opciones: c.opciones.map((o) => ({ id: o.id, etiqueta: o.etiqueta })),
    valor: elegidas[c.id]!,
    alCambiar(v: string) {
      elegidas[c.id] = v;
      datos = efectivo(p, elegidas);
      pasoActual = 0;
      medir();
      indexarActivables();
      mando.ir(0);
      mando.refrescar();
    },
  }));

  mando = crearMando(contenedor, {
    total: () => datos.pasos.length,
    ir: (i) => dibujar(i, true),
    texto: (i) => datos.pasos[i]?.texto ?? '',
    controles,
  });

  alternativaTextual(contenedor, p.alternativa);
  resolver(contenedor, p.resolucion);

  return {
    destruir(): void {
      bajaTema();
      observador.disconnect();
      animaciones.forEach((a) => a.cancel());
      mando.destruir();
      contenedor.replaceChildren();
    },
  };
}
