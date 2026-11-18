/**
 * Mecánica «mapa-respaldo»: todas las fichas colocadas por su nivel de respaldo.
 *
 * Es el mapa del sitio: una banda por nivel, de «Establecido» (arriba) a «Tesis filosófica»
 * (abajo), y en cada banda las fichas que lo tienen. Mostrarlo así enseña de un vistazo lo que el
 * resto de la web dice por partes: las bandas altas están casi vacías y casi todo el peso cae abajo.
 *
 * LO QUE DECLARA LA FICHA
 *  - `niveles`: para cada nivel (0-4), su rótulo y, si está vacío, lo que se dice de ello.
 *  - `puntos`: id, rótulo corto, nivel y familia de cada ficha. Cada punto enlaza a su ficha.
 *  - `familias`: el nombre de cada familia, para la leyenda.
 *  - `pasos`: qué bandas resalta cada paso (`niveles`). Las demás NO se ocultan ni se atenúan: el
 *    mapa entero está siempre a la vista.
 *
 * La familia se ve por el color de la franja de cada ficha y se lee en la leyenda; el nivel, por la
 * banda y por su rótulo. Ninguna de las dos cosas depende solo del color.
 */

import { crearMando } from '../controles';
import { nodo, paletaDe, temaActual, type Visualizacion } from '../lenguaje';
import { alCambiarTema } from '../../app/tema';
import { LH, PX_ROTULO, PX_SUB, ancho, crearMarco, cerrarPieza, texto, type Marco, type ParamsBase } from './marco';

export interface ParametrosMapa extends ParamsBase {
  niveles: Array<{ nivel: number; rotulo: string; vacio?: string }>;
  puntos: Array<{ id: string; rotulo: string; nivel: number; familia_id: string }>;
  familias: Array<{ familia_id: string; nombre: string }>;
  pasos: Array<{ texto: string; niveles: number[] }>;
}

const MARGEN = 14;
const ALTO_PILDORA = 32;
const HUECO = 8;
const FRANJA = 7;

export function crearMapaRespaldo(contenedor: HTMLElement, p: ParametrosMapa): Visualizacion {
  let resaltados = new Set<number>(p.pasos[0]?.niveles ?? []);
  let marco!: Marco;

  function dibujar(): void {
    const W = marco.W();
    const capa = marco.capa;
    const util = W - 2 * MARGEN;
    let y = MARGEN;
    const niveles = [...p.niveles].sort((a, b) => b.nivel - a.nivel);

    for (const n of niveles) {
      const g = nodo('g', { class: 'mapa-banda' });
      const fichas = p.puntos.filter((q) => q.nivel === n.nivel);
      // Primero se miden las filas para saber cuánto mide la banda.
      const filas: Array<Array<{ q: typeof fichas[number]; w: number }>> = [[]];
      let usado = 0;
      for (const q of fichas) {
        const w = Math.min(util, ancho(q.rotulo, PX_SUB, 600) + FRANJA + 24);
        if (usado + w > util && filas[filas.length - 1]!.length) { filas.push([]); usado = 0; }
        filas[filas.length - 1]!.push({ q, w });
        usado += w + HUECO;
      }
      const cuerpo = fichas.length === 0 ? LH : filas.length * (ALTO_PILDORA + HUECO) - HUECO;
      const alto = LH + 10 + cuerpo + 12;
      const fondo = nodo('rect', {
        x: 4, y, width: Math.max(0, W - 8), height: alto, rx: 8,
        class: `forma d-fila${resaltados.has(n.nivel) ? ' on' : ''}`,
      });
      g.append(fondo);
      texto(g, MARGEN, y + 8 + LH / 2, n.rotulo, 'd-rotulo', 'start', { 'font-weight': 600 });
      let yy = y + LH + 10;
      if (fichas.length === 0) {
        if (n.vacio) texto(g, MARGEN, yy + LH / 2, n.vacio, 'd-sub', 'start');
      } else {
        for (const fila of filas) {
          let x = MARGEN;
          for (const { q, w } of fila) {
            const pal = paletaDe(q.familia_id, temaActual());
            const enlace = nodo('g', {
              class: 'nodo', tabindex: 0, role: 'link',
              'aria-label': `${q.rotulo}. ${n.rotulo}`,
            });
            enlace.style.cursor = 'pointer';
            enlace.append(nodo('rect', { x, y: yy, width: Math.max(0, w), height: ALTO_PILDORA, rx: 8, class: 'forma' }));
            enlace.append(nodo('rect', { x: x + 1, y: yy + 1, width: FRANJA, height: ALTO_PILDORA - 2, rx: 3, fill: pal.acento, stroke: 'none' }));
            const tx = texto(enlace, x + FRANJA + 10, yy + ALTO_PILDORA / 2, q.rotulo, 'd-sub', 'start', { 'font-weight': 600 });
            tx.setAttribute('font-size', String(PX_SUB));
            const ir = (): void => { window.location.hash = `#/c/${q.id}`; };
            enlace.addEventListener('click', ir);
            enlace.addEventListener('keydown', (ev) => {
              if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ir(); }
            });
            g.append(enlace);
            x += w + HUECO;
          }
          yy += ALTO_PILDORA + HUECO;
        }
      }
      capa.append(g);
      y += alto + 8;
    }

    // Leyenda de familias: color + nombre, para que el color no sea la única pista.
    const leyenda = nodo('g', { class: 'mapa-leyenda' });
    let lx = MARGEN;
    let ly = y + 6 + LH / 2;
    for (const f of p.familias) {
      const pal = paletaDe(f.familia_id, temaActual());
      const w = ancho(f.nombre, PX_SUB, 500) + 22;
      if (lx + w > W - MARGEN && lx > MARGEN) { lx = MARGEN; ly += LH + 4; }
      leyenda.append(nodo('rect', { x: lx, y: ly - 6, width: 12, height: 12, rx: 3, fill: pal.acento }));
      texto(leyenda, lx + 18, ly, f.nombre, 'd-sub', 'start');
      lx += w + 14;
    }
    capa.append(leyenda);
    marco.alto(ly + LH);
  }

  marco = crearMarco(contenedor, p, { dibujar, altoPara: () => 400 });
  // `PX_ROTULO` queda como referencia del tamaño de los rótulos de banda.
  void PX_ROTULO;
  dibujar();

  const mando = crearMando(contenedor, {
    total: () => p.pasos.length,
    ir: (i) => {
      resaltados = new Set(p.pasos[i]?.niveles ?? []);
      marco.capa.replaceChildren();
      dibujar();
    },
    texto: (i) => p.pasos[i]?.texto ?? '',
  });
  const bajaTema = alCambiarTema(() => { marco.capa.replaceChildren(); dibujar(); });
  cerrarPieza(contenedor, p);

  return {
    destruir(): void {
      bajaTema();
      mando.destruir();
      marco.destruir();
      contenedor.replaceChildren();
    },
  };
}
