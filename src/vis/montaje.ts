/**
 * Monta la máquina de un concepto en su hueco, y la desmonta al salir.
 *
 * Lo decide el hueco, no la página: la máquina se pide cuando el hueco está a punto de verse (así la
 * portada del concepto no espera a un módulo que quizá nadie llegue a ver) y, si es de las que
 * reservan un contexto WebGL, se destruye al salir de pantalla. Es lo que cumple en la práctica la
 * regla de un solo contexto vivo: no depende de que cada escena se acuerde de soltarlo.
 *
 * Si algo falla se avisa por consola —lo caza capturar-sitio.mjs— y el visitante ve un mensaje en
 * lugar de un hueco vacío: una máquina que no arranca tiene que notarse, no desaparecer en silencio.
 */

import { crearVisualizacion, type FichaVisualizacion } from './registro';
import { t, type Visualizacion } from './lenguaje';

export interface FichaMaquina extends FichaVisualizacion {
  mecanica: string;
  /** Tipo de máquina para el filtro de la Tabla: flujo, estructura, simulador… */
  tipo: string;
  parametros: Record<string, unknown>;
}

const cargadores = import.meta.glob<{ default: FichaMaquina }>('../../content/*/maquinas/*.json');
const idioma = (): string => document.documentElement.lang || 'es';

/** La máquina en el idioma del documento; si aún no está traducida, la española. */
export async function cargarMaquina(id: string): Promise<FichaMaquina | undefined> {
  const buscar = (lang: string) => Object.entries(cargadores).find(([ruta]) => ruta.endsWith(`/${lang}/maquinas/${id}.json`))?.[1];
  const cargar = buscar(idioma()) ?? buscar('es');
  return cargar ? (await cargar()).default : undefined;
}

/**
 * La alternativa textual y la resolución se leen mejor fuera de la tarjeta de la máquina: la página
 * tiene una sección «Qué estás viendo» (`[data-vision]`) que las recibe. Si no existe, se quedan donde
 * están (la alternativa, oculta a la vista pero presente para el lector de pantalla).
 */
function llevarALaPagina(hueco: HTMLElement): void {
  const destino = hueco.closest('.concepto')?.querySelector<HTMLElement>('[data-vision]');
  const alt = hueco.querySelector<HTMLElement>('.vis-alternativa');
  const res = hueco.querySelector<HTMLElement>('.vis-resolucion');
  if (!destino || !alt) return;
  destino.append(alt);
  if (res) {
    const idea = document.createElement('strong');
    idea.textContent = t('concepto.idea');
    res.prepend(idea);
    destino.append(res);
  }
  destino.hidden = false;
  destino.dispatchEvent(new Event('vision-lista'));
}

/** Mecánicas que ocupan un contexto WebGL y por tanto se sueltan al salir de pantalla. */
const CON_WEBGL = new Set(['espacio-vectorial', 'reticula-3d']);

export interface Montaje { destruir(): void }

export function montarMaquina(hueco: HTMLElement, id: string, familiaId: string): Montaje {
  let viva: Visualizacion | null = null;
  let montando = false;
  let destruido = false;

  async function montar(): Promise<void> {
    if (viva || montando || destruido) return;
    montando = true;
    try {
      const ficha = await cargarMaquina(id);
      if (!ficha) throw new Error(`"${id}" no tiene máquina`);
      if (destruido) return;
      hueco.dataset.mecanica = ficha.mecanica;
      viva = await crearVisualizacion(id, { mecanica: ficha.mecanica, parametros: { ...ficha.parametros, familia_id: familiaId } }, hueco);
      if (destruido) { viva.destruir(); viva = null; return; }
      llevarALaPagina(hueco);
    } catch (e) {
      console.error(`[maquina] "${id}" no ha podido arrancar`, e);
      const aviso = document.createElement('p');
      aviso.className = 'vis-respaldo';
      aviso.textContent = t('vis.error');
      hueco.replaceChildren(aviso);
    } finally {
      montando = false;
    }
  }

  function soltar(): void {
    viva?.destruir();
    viva = null;
  }

  const observador = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (e.isIntersecting) void montar();
      else if (viva && hueco.dataset.mecanica && CON_WEBGL.has(hueco.dataset.mecanica)) soltar();
    }
  }, { rootMargin: '300px 0px' });
  observador.observe(hueco);

  return {
    destruir(): void {
      destruido = true;
      observador.disconnect();
      soltar();
    },
  };
}
