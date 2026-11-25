/**
 * Carga de la capa de contenido.
 *
 * EL CONTENIDO ES DATOS, NO CÓDIGO. Cada concepto es un JSON en content/<idioma>/conceptos/, validado por
 * scripts/validar-contenido.mjs antes de cada compilación. Esa separación es lo que permite añadir
 * contenido sin tocar TypeScript, traducir sin duplicar lógica, y comprobar reglas editoriales en
 * CI en vez de confiar en que nadie se despiste.
 *
 * Se cargan con import.meta.glob en modo `eager`: entran en el paquete en compilación, así que no
 * hay una petición por ficha ni un estado de carga que gestionar. Si el catálogo llegara a pesar lo
 * suficiente como para que eso importe, el cambio es quitar `eager` aquí; nada más del sitio se
 * entera.
 */

import { registrarAcentos } from '../vis/lenguaje';
import type { Entrada, Escena, Tono, Velo } from './efectos';

/**
 * Cómo se pone en escena una parada. Los valores los registra src/app/efectos.ts y los verifica
 * validar-contenido.mjs contra el contenido, así que aquí basta con reflejar la forma.
 */
export interface EscenaFamilia {
  tipo?: Escena;
  tono?: Tono;
  velo?: Velo;
  entrada?: Entrada;
  capas?: { profundidad: number; imagen?: string }[];
}

export interface Familia {
  id: string;
  nombre: string;
  orden: number;
  /** Dos acentos, uno por tema. Ver la nota de paletaDe() en src/vis/lenguaje.ts. */
  color_acento: { claro: string; oscuro: string };
  descripcion?: string;
  /** Si es true, toda visualización de la familia lleva el pie fijo de DEC §4. */
  pie_visualizacion?: boolean;
  escena?: EscenaFamilia;
}

export interface Ref { ref: string; tipo: string; titulo: string; autor?: string; anio?: number; url?: string; nota?: string }
export interface Paso { titulo: string; texto: string }
export interface Punto { titulo: string; texto: string; refs?: string[] }

export interface Concepto {
  id: string;
  familia_id: string;
  titulo: string;
  orden: number;
  simbolo: string;
  resumen: string;
  /** Ficha de relleno: no sale como tarjeta de la portada. Se escribe entera en S5. */
  borrador?: boolean;
  /** «En una frase». */
  idea?: string;
  /** Escala de DEC §4, de 0 (tesis filosófica) a 4 (establecido). */
  respaldo?: number;
  propone?: { intro?: string; pasos: Paso[] };
  analogia?: { origen: 'editorial'; titulo: string; texto: string };
  se_sabe?: { texto: string; refs: string[] }[];
  disputa?: Punto[];
  detalles?: Punto[];
  puntos_clave?: string[];
  cita?: { texto: string; traduccion: string; autor: string; atribucion: string; fuente?: string };
  fuentes?: Ref[];
  /** Frases del texto cuyos números son cifras de estudios y cuentan al aparecer. */
  cifras?: string[];
  enlaces?: { id: string; rotulo: string }[];
  /** Id de la máquina en content/<idioma>/maquinas/. */
  maquina?: string;
  reel?: string;
}

function idioma(): string {
  return document.documentElement.lang || 'es';
}

function delIdioma<T>(ficheros: Record<string, { default: T }>): T[] {
  return Object.entries(ficheros)
    .filter(([ruta]) => ruta.includes(`/${idioma()}/`))
    .map(([, m]) => m.default);
}

const ficherosFamilias = import.meta.glob<{ default: { familias: Familia[] } }>(
  '../../content/*/familias.json', { eager: true },
);
const ficherosConceptos = import.meta.glob<{ default: Concepto }>(
  '../../content/*/conceptos/*.json', { eager: true },
);

export const FAMILIAS: Familia[] = (delIdioma(ficherosFamilias)[0]?.familias ?? [])
  .slice()
  .sort((a, b) => a.orden - b.orden);

export const CONCEPTOS: Concepto[] = delIdioma(ficherosConceptos)
  .slice()
  .sort((a, b) => a.orden - b.orden);

/**
 * Los acentos se registran aquí, al cargar el contenido, y no se importan desde lenguaje.ts.
 *
 * Es lo que mantiene el lenguaje gráfico reutilizable entre proyectos: `lenguaje.ts` sabe que hay
 * familias con dos acentos, pero no cuáles son. Un import directo del JSON lo ataría a este
 * proyecto y habría que editarlo en el siguiente.
 */
registrarAcentos(
  Object.fromEntries(FAMILIAS.map((f) => [f.id, f.color_acento])),
);

export function conceptosDe(familiaId: string): Concepto[] {
  return CONCEPTOS.filter((c) => c.familia_id === familiaId).sort((a, b) => a.orden - b.orden);
}

export function conceptoPorId(id: string): Concepto | undefined {
  return CONCEPTOS.find((c) => c.id === id);
}

/** El orden de «El recorrido»: familia por familia, concepto por concepto (15 paradas, borradores incluidos). */
export function recorrido(): Concepto[] {
  return FAMILIAS.flatMap((f) => conceptosDe(f.id));
}
