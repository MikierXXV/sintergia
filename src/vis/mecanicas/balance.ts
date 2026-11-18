/**
 * Mecánica «balance»: una fila por estudio, con su resultado en forma y en texto.
 *
 * Es la forma de contar un estado de la evidencia sin dar un veredicto: el visitante ve quién
 * repitió qué, con qué resultado y qué reservas hay, y el filtro decide qué estudios cuentan.
 *
 * LO QUE DECLARA LA FICHA
 *  - `estudios`: ref, autores, año, grupo (`diseno`, `emparentado`, `aparte`), resultado y un texto de
 *    paso atribuido. El resultado se dibuja con una FORMA además de escribirse: nunca solo color.
 *  - `resultados`: para cada resultado, su rótulo y su forma.
 *  - `rotulos` y `pasos`: todo el texto visible. Nada se escribe aquí.
 *
 * Pasos: una introducción, los estudios del diseño por orden de año, el balance, y —si el filtro es
 * «todos»— los emparentados y, al final, el que no es una réplica. Reproducir se para en el último.
 * El alto se calcula con TODAS las filas del filtro, para que revelarlas no mueva la página.
 */

import { crearMando, type Control, type Mando } from '../controles';
import { alternativaTextual, nodo, resolver, type Visualizacion } from '../lenguaje';
import {
  LH, SLH, PX_ROTULO, PX_SUB, ancho, crearMarco, envolver, lector, texto, linea,
  type Marco, type ParamsBase,
} from './marco';

type Grupo = 'diseno' | 'emparentado' | 'aparte';
type Forma = 'triangulo' | 'rombo' | 'cuadrado' | 'circulo' | 'barra' | 'interrogacion';

export interface EstudioB {
  ref: string;
  autores: string;
  anio: number;
  grupo: Grupo;
  resultado: string;
  /** Una reserva o un dato (n, método), tal como lo da la investigación. */
  detalle?: string;
  /** Texto del paso al llegar a este estudio: atribuido, nunca como hecho. */
  texto: string;
}

export interface ParametrosBalance extends ParamsBase {
  rotulos: Record<string, string>;
  resultados: Record<string, { etiqueta: string; forma: Forma; cuenta?: 'positivo' | 'negativo' | 'mixto' }>;
  estudios: EstudioB[];
  textos: { intro: string; balance: string };
}

const MARGEN = 14;
const COL_FORMA = 30; // centro de la forma
const COL_TEXTO = 52;
const ANCHO_REF = 34;
const GRUPOS: Grupo[] = ['diseno', 'emparentado', 'aparte'];

interface PasoB { texto: string; estudio?: EstudioB; balance?: boolean }

export function crearBalance(contenedor: HTMLElement, p: ParametrosBalance): Visualizacion {
  const r = lector(p.rotulos);
  let filtro: 'diseno' | 'todos' = 'diseno';
  let pasos: PasoB[] = [];
  let actual = 0;
  let mando!: Mando;
  let marco!: Marco;

  const porAnio = (a: EstudioB, b: EstudioB): number => a.anio - b.anio || a.ref.localeCompare(b.ref, 'es', { numeric: true });
  const visibles = (): EstudioB[] =>
    p.estudios.filter((e) => filtro === 'todos' || e.grupo === 'diseno');

  function construirPasos(): void {
    const vis = visibles();
    const de = (g: Grupo) => vis.filter((e) => e.grupo === g).sort(porAnio);
    pasos = [
      { texto: p.textos.intro },
      ...de('diseno').map((e) => ({ texto: e.texto, estudio: e })),
      { texto: p.textos.balance, balance: true },
      ...de('emparentado').map((e) => ({ texto: e.texto, estudio: e })),
      ...de('aparte').map((e) => ({ texto: e.texto, estudio: e })),
    ];
  }

  /** Cuántas réplicas del diseño hay de cada clase: el balance solo cuenta este grupo. */
  function cuentas(): { n: number; positivo: number; negativo: number } {
    const d = p.estudios.filter((e) => e.grupo === 'diseno');
    const cuenta = (c: string) => d.filter((e) => p.resultados[e.resultado]?.cuenta === c).length;
    return { n: d.length, positivo: cuenta('positivo'), negativo: cuenta('negativo') };
  }

  interface Fila { e: EstudioB; y: number; h: number; l1: string; sub: string[] }
  interface Disposicion { filas: Fila[]; cabeceras: Array<{ g: Grupo; y: number }>; resumenY: number; alto: number }

  function disponer(): Disposicion {
    const W = marco.W();
    const maxL1 = W - COL_TEXTO - MARGEN - ANCHO_REF;
    const maxSub = W - COL_TEXTO - MARGEN;
    const filas: Fila[] = [];
    const cabeceras: Array<{ g: Grupo; y: number }> = [];
    const resumenY = MARGEN + 12;
    let y = MARGEN + 34; // el resumen del balance va arriba y ocupa su sitio desde el principio
    for (const g of GRUPOS) {
      const del = visibles().filter((e) => e.grupo === g).sort(porAnio);
      if (!del.length) continue;
      cabeceras.push({ g, y: y + 10 });
      y += 28;
      for (const e of del) {
        const l1 = `${e.autores} · ${e.anio}`;
        const res = p.resultados[e.resultado]?.etiqueta ?? e.resultado;
        const sub = envolver(e.detalle ? `${res} · ${e.detalle}` : res, maxSub, PX_SUB);
        const lineas1 = Math.max(1, Math.ceil(ancho(l1, PX_ROTULO) / maxL1));
        const h = Math.max(48, 10 + lineas1 * LH + sub.length * SLH + 8);
        filas.push({ e, y, h, l1, sub });
        y += h;
      }
      y += 6;
    }
    return { filas, cabeceras, resumenY, alto: y + MARGEN };
  }

  function forma(g: SVGElement, tipo: Forma, cx: number, cy: number): void {
    const c = 'forma rol-dato';
    const grupo = nodo('g', { transform: `translate(${cx} ${cy})`, 'aria-hidden': 'true' });
    if (tipo === 'triangulo') grupo.append(nodo('path', { d: 'M0,-9 L9,7 L-9,7 Z', class: c }));
    else if (tipo === 'rombo') grupo.append(nodo('path', { d: 'M0,-9 L9,0 L0,9 L-9,0 Z', class: c }));
    else if (tipo === 'cuadrado') grupo.append(nodo('rect', { x: -8, y: -8, width: 16, height: 16, rx: 2, class: c }));
    else if (tipo === 'barra') grupo.append(nodo('rect', { x: -10, y: -4, width: 20, height: 8, rx: 2, class: c }));
    else {
      grupo.append(nodo('circle', { r: 8, class: c }));
      if (tipo === 'interrogacion') texto(grupo, 0, 0.5, '?', 'd-sub d-cab');
    }
    g.append(grupo);
  }

  function dibujar(i: number): void {
    actual = i;
    const capa = marco.capa;
    capa.replaceChildren();
    const W = marco.W();
    const d = disponer();
    marco.alto(d.alto);
    const reveladas = new Set<EstudioB>();
    let balance = false;
    pasos.slice(0, i + 1).forEach((s) => { if (s.estudio) reveladas.add(s.estudio); if (s.balance) balance = true; });
    const enFoco = pasos[i]?.estudio;

    // Resumen del balance: solo cuenta las réplicas del diseño.
    if (balance) {
      const c = cuentas();
      texto(capa, MARGEN, d.resumenY, r('balance', { n: c.n, positivas: c.positivo, negativas: c.negativo }), 'd-rotulo', 'start');
    } else if (i === 0) {
      texto(capa, MARGEN, d.resumenY, r('vacio'), 'd-sub', 'start');
    }

    for (const cab of d.cabeceras) {
      const primera = d.filas.find((f) => f.e.grupo === cab.g);
      if (!primera || !reveladas.has(primera.e)) continue;
      texto(capa, MARGEN, cab.y, r(`grupo_${cab.g}`), 'd-rotulo-grupo d-sub d-cab', 'start');
      linea(capa, MARGEN, cab.y + 12, W - MARGEN, cab.y + 12, 'd-enlace');
    }

    for (const f of d.filas) {
      if (!reveladas.has(f.e)) continue;
      const res = p.resultados[f.e.resultado];
      const g = nodo('g', { class: 'nodo', tabindex: 0, role: 'button', 'aria-label': `${f.l1}: ${res?.etiqueta ?? f.e.resultado}` });
      const idx = pasos.findIndex((s) => s.estudio === f.e);
      g.append(nodo('rect', { x: 4, y: f.y, width: Math.max(0, W - 8), height: Math.max(0, f.h - 4), rx: 8, class: `forma d-fila${f.e === enFoco ? ' on' : ''}` }));
      forma(g, res?.forma ?? 'circulo', COL_FORMA, f.y + f.h / 2 - 2);
      let ty = f.y + 10 + LH / 2;
      for (const l of envolver(f.l1, W - COL_TEXTO - MARGEN - ANCHO_REF, PX_ROTULO)) {
        texto(g, COL_TEXTO, ty, l, 'd-rotulo', 'start');
        ty += LH;
      }
      texto(g, W - MARGEN, f.y + 10 + LH / 2, f.e.ref, 'd-sub', 'end');
      for (const l of f.sub) {
        texto(g, COL_TEXTO, ty - 2 + SLH / 2, l, 'd-sub', 'start');
        ty += SLH;
      }
      const ir = (): void => { mando.ir(idx); };
      g.addEventListener('click', ir);
      g.addEventListener('keydown', (ev) => {
        if ((ev as KeyboardEvent).key === 'Enter' || (ev as KeyboardEvent).key === ' ') { ev.preventDefault(); ev.stopPropagation(); ir(); }
      });
      capa.append(g);
    }
  }

  construirPasos();
  marco = crearMarco(contenedor, p, { dibujar: () => dibujar(actual) });
  dibujar(0);

  const controles: Control[] = [{
    tipo: 'opciones',
    id: 'estudios',
    etiqueta: r('filtro_etiqueta'),
    opciones: [
      { id: 'diseno', etiqueta: r('filtro_diseno') },
      { id: 'todos', etiqueta: r('filtro_todos') },
    ],
    valor: filtro,
    alCambiar(v: string) {
      filtro = v === 'todos' ? 'todos' : 'diseno';
      construirPasos();
      mando.ir(0);
      mando.refrescar();
    },
  }];

  mando = crearMando(contenedor, {
    total: () => pasos.length,
    ir: (i) => dibujar(i),
    texto: (i) => pasos[i]?.texto ?? '',
    controles,
  });

  alternativaTextual(contenedor, p.alternativa);
  resolver(contenedor, p.resolucion);

  return {
    destruir(): void {
      marco.destruir();
      mando.destruir();
      contenedor.replaceChildren();
    },
  };
}

