/**
 * Mecánica «eje»: un continuo entre dos polos, con una marca que se desliza.
 *
 * Sirve para todo contenido que se entienda como un grado: un espectro, un umbral, un término
 * medio. Con `pasos` usa el mando común (pista, «Paso n de N», Reproducir, Paso y Reiniciar, flechas)
 * y cada paso coloca la marca y su rótulo; con `deslizador` el visitante la mueve él, y entonces el
 * guion se pausa y la etiqueta pasa a «Tu turno». Sin `pasos` ni `deslizador` es el eje de siempre.
 *
 * LO QUE ESTA PIEZA DEMUESTRA, Y QUE TODA MECÁNICA DEBE CUMPLIR:
 *  - todos los rótulos llegan en `parametros`, ninguno escrito aquí (ver src/app/textos.ts);
 *  - usa la paleta de su familia y solo tres roles de color (ver `Paleta` en lenguaje.ts);
 *  - los objetivos táctiles no bajan de RADIO_TACTIL;
 *  - se puede recorrer con teclado, no solo con el ratón (flechas sobre la marca);
 *  - tiene alternativa textual y resolución;
 *  - con `prefers-reduced-motion` va directa al estado final en vez de animar;
 *  - `destruir()` deja el contenedor como estaba y se da de baja de todo.
 */

import {
  ATENUADO, RADIO_TACTIL, TRAZO,
  alAjustarEscala, alternativaTextual, crearSvg, movimientoReducido, nodo, paletaDe, resolver,
  temaActual,
} from '../lenguaje';
import { alCambiarTema } from '../../app/tema';
import { crearMando, type Control, type Mando } from '../controles';
import type { Visualizacion } from '../lenguaje';

export interface PasoEje {
  texto: string;
  /** Posición de la marca en este paso, de 0 a 1. */
  posicion: number;
  /** Rótulo de la marca en este paso; si falta, el de `marca`. */
  marca?: string;
}

export interface ParametrosEje {
  /** Id de la familia de contenido: de ahí sale el acento. */
  familia_id: string;
  /** Rótulo del extremo izquierdo (el defecto). */
  polo_a: string;
  /** Rótulo del extremo derecho (el exceso). */
  polo_b: string;
  /** Rótulo de la marca (la virtud, el punto justo). */
  marca: string;
  /** Posición de la marca en el eje, de 0 a 1. Por defecto 0.5. */
  posicion?: number;
  /** Rótulo del deslizador: si está, el visitante puede mover la marca. */
  deslizador?: string;
  /** Pasos guiados con el mando común. */
  pasos?: PasoEje[];
  alternativa: string;
  resolucion: string;
}

const ANCHO = 700;
const ALTO = 300;
/** Aire mínimo, en píxeles de pantalla, entre la marca y cualquier rótulo. */
const SEPARACION_PX = 6;
const PASO_TECLA = 0.05;

export function crearEje(contenedor: HTMLElement, p: ParametrosEje): Visualizacion {
  const svg = crearSvg(contenedor, p.alternativa, ANCHO);
  const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
  let posicion = clamp01(p.posicion ?? p.pasos?.[0]?.posicion ?? 0.5);
  let textoMarca = p.pasos?.[0]?.marca ?? p.marca;
  let tamRotulo = 15;
  let radio = RADIO_TACTIL;
  let mando: Mando | undefined;

  const margen = 90;
  const y = ALTO * 0.55;
  const x = (fraccion: number) => margen + fraccion * (ANCHO - margen * 2);

  // ---- estructura ----
  const linea = nodo('line', {
    x1: x(0), y1: y, x2: x(1), y2: y,
    'stroke-width': TRAZO.base, 'stroke-linecap': 'round',
  });
  const topeA = nodo('line', { x1: x(0), y1: y - 14, x2: x(0), y2: y + 14, 'stroke-width': TRAZO.fino });
  const topeB = nodo('line', { x1: x(1), y1: y - 14, x2: x(1), y2: y + 14, 'stroke-width': TRAZO.fino });

  // Los polos se atenúan como FORMA: sus rótulos van a plena opacidad. Ver la nota de ATENUADO.
  const formaAtenuada = [topeA, topeB];

  /*
   * Los rótulos de los extremos se anclan HACIA DENTRO —el izquierdo por su inicio, el derecho por
   * su final—, no centrados sobre el tope. Centrados, la mitad del texto queda fuera del eje y, en
   * un móvil, fuera del lienzo: se recorta y el visitante lee «El otro extrem».
   */
  const rotuloA = nodo('text', { x: x(0), y: y + 44, 'text-anchor': 'start', class: 'vis-rotulo' });
  rotuloA.textContent = p.polo_a;
  const rotuloB = nodo('text', { x: x(1), y: y + 44, 'text-anchor': 'end', class: 'vis-rotulo' });
  rotuloB.textContent = p.polo_b;

  // ---- la marca ----
  const punto = nodo('circle', { cx: x(posicion), cy: y, r: RADIO_TACTIL, class: 'vis-marca' });
  punto.setAttribute('tabindex', '0');
  punto.setAttribute('role', 'img');
  punto.setAttribute('aria-label', textoMarca);

  const rotuloMarca = nodo('text', {
    x: x(posicion), y: y - 30, 'text-anchor': 'middle', class: 'vis-rotulo vis-rotulo-enfasis',
  });

  svg.append(linea, topeA, topeB, rotuloA, rotuloB, punto, rotuloMarca);

  /**
   * Coloca el rótulo de la marca encima de ella. Si es largo se parte en líneas que quepan en el
   * lienzo, y se desplaza lo justo para no salirse por los lados: el texto manda, no la marca.
   */
  function colocarRotulo(): void {
    const maximo = ANCHO - 16;
    const palabras = textoMarca.split(/\s+/);
    const lineas: string[] = [];
    let actual = '';
    for (const w of palabras) {
      const prueba = actual ? `${actual} ${w}` : w;
      rotuloMarca.textContent = prueba;
      if (actual && rotuloMarca.getComputedTextLength() > maximo) { lineas.push(actual); actual = w; } else actual = prueba;
    }
    if (actual) lineas.push(actual);
    let mayor = 0;
    for (const l of lineas) {
      rotuloMarca.textContent = l;
      mayor = Math.max(mayor, rotuloMarca.getComputedTextLength());
    }
    const cx = Math.min(Math.max(x(posicion), 8 + mayor / 2), ANCHO - 8 - mayor / 2);
    const hueco = SEPARACION_PX / (svg.getBoundingClientRect().width / ANCHO || 1);
    const alto = Math.max(30, radio + hueco + tamRotulo * 0.25);
    const interlinea = tamRotulo * 1.25;
    rotuloMarca.textContent = '';
    lineas.forEach((l, i) => {
      const ts = nodo('tspan', { x: cx, y: y - alto - (lineas.length - 1 - i) * interlinea });
      ts.textContent = l;
      rotuloMarca.append(ts);
    });
    rotuloMarca.setAttribute('x', String(cx));
    punto.setAttribute('aria-label', textoMarca);
  }

  // ---- color, que depende del tema y por tanto se repinta ----
  function pintar(): void {
    const paleta = paletaDe(p.familia_id, temaActual());
    linea.setAttribute('stroke', paleta.neutro);
    topeA.setAttribute('stroke', paleta.neutro);
    topeB.setAttribute('stroke', paleta.neutro);
    formaAtenuada.forEach((el) => el.setAttribute('opacity', String(ATENUADO)));
    punto.setAttribute('fill', paleta.acento);
    punto.setAttribute('stroke', paleta.senal);
    punto.setAttribute('stroke-width', String(TRAZO.base));
  }
  pintar();
  const bajaTema = alCambiarTema(pintar);

  /*
   * El radio y la colocación de los rótulos se recalculan con el ancho real. Cada separación es «lo
   * que mide lo de al lado + un hueco», con las de antes como mínimo para que el escritorio no cambie.
   */
  const bajaEscala = alAjustarEscala(svg, ({ escala, radioTactil, tamRotulo: tam }) => {
    radio = radioTactil;
    tamRotulo = tam;
    punto.setAttribute('r', String(radioTactil));
    const hueco = SEPARACION_PX / escala;
    // Debajo, la línea base va a un cuerpo entero del borde de la marca: el texto cuelga por arriba.
    const bajo = Math.max(44, radioTactil + hueco + tamRotulo);
    rotuloA.setAttribute('y', String(y + bajo));
    rotuloB.setAttribute('y', String(y + bajo));
    colocarRotulo();
  });

  /** Mueve la marca. `animar` solo si el visitante no ha pedido menos movimiento. */
  function ponerMarca(nueva: number, animar: boolean): void {
    const anterior = posicion;
    posicion = clamp01(nueva);
    punto.setAttribute('cx', String(x(posicion)));
    colocarRotulo();
    if (animar && !movimientoReducido() && anterior !== posicion) {
      punto.animate(
        [{ transform: `translateX(${x(anterior) - x(posicion)}px)` }, { transform: 'none' }],
        { duration: 450, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      );
    }
  }

  // ---- movimiento de entrada ----
  // Con movimiento reducido, la marca aparece ya en su sitio. Una animación "más corta" sigue siendo
  // movimiento; lo que pide la preferencia es no moverse.
  if (!movimientoReducido() && !p.pasos) {
    punto.animate(
      [{ transform: `translateX(${x(0) - x(posicion)}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' },
    );
  }

  // ---- mando común: pasos y deslizador ----
  if (p.pasos?.length || p.deslizador) {
    const pasos = p.pasos ?? [];
    const controles: Control[] = p.deslizador
      ? [{
        tipo: 'deslizador',
        id: 'grado',
        etiqueta: p.deslizador,
        min: 0,
        max: 100,
        paso: 1,
        valor: Math.round(posicion * 100),
        formato: (v: number) => `${v} %`,
        alCambiar(v: number) {
          ponerMarca(v / 100, false);
          mando?.manual();
        },
      }]
      : [];
    mando = crearMando(contenedor, {
      total: () => pasos.length,
      ir: (i, modo) => {
        const s = pasos[i];
        if (!s) return;
        textoMarca = s.marca ?? p.marca;
        ponerMarca(s.posicion, modo === 'animar');
      },
      texto: (i) => pasos[i]?.texto ?? '',
      controles,
    });
    // Teclado sobre la marca: las flechas la mueven, y con ello el guion cede el mando.
    punto.addEventListener('keydown', (e) => {
      const k = (e as KeyboardEvent).key;
      if (k !== 'ArrowLeft' && k !== 'ArrowRight') return;
      e.preventDefault();
      e.stopPropagation();
      ponerMarca(posicion + (k === 'ArrowRight' ? PASO_TECLA : -PASO_TECLA), false);
      mando?.manual();
    });
    // Tocar la marca lleva al último paso, que es el que habla de ella.
    punto.addEventListener('click', () => { if (pasos.length) mando?.ir(pasos.length - 1); });
  } else {
    colocarRotulo();
  }

  alternativaTextual(contenedor, p.alternativa);
  resolver(contenedor, p.resolucion);

  return {
    destruir(): void {
      bajaTema();
      bajaEscala();
      mando?.destruir();
      contenedor.replaceChildren();
    },
  };
}
