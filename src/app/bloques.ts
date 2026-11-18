/**
 * El texto de un concepto en bloques (DEC §3): En una frase → Qué estás viendo (la máquina) → Lo que
 * propone Grinberg → Piénsalo así → Lo que se sabe → Lo que está en disputa → Para ir más lejos →
 * Para recordar → Fuentes.
 *
 * Todo el texto fijo sale de ui.json (`bloques.*`); lo que se lee sale de la ficha. Los límites de cada
 * campo los vigila scripts/comprobar-fichas.mjs con content/reglas.json → ficha, no este módulo.
 *
 * Markdown mínimo —**negrita**, *cursiva*— con un solo intérprete, `md()`. Se escapa ANTES de marcar,
 * así que ningún texto de la ficha puede colar HTML.
 *
 * «Lo que está en disputa» es una caja con aviso y NUNCA se pliega (DEC §3): una reserva escondida en
 * un bloque plegado es una reserva que no existe.
 */
import { t } from './textos';
import type { Concepto } from './contenido';
import type { Reel } from './reels';


const escapar = (s: string): string =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function md(texto: string): string {
  return escapar(texto).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
}

/** Trazos de 24×24 de los títulos de bloque. */
const TRAZOS = {
  aviso: '<path d="M12 4 3 19.5h18z"/><path d="M12 10v4M12 17v.5"/>',
  ok: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  pasos: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  recordar: '<path d="M6 4h12v17l-6-4-6 4z"/>',
  idea: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  libro: '<path d="M12 6.5C10.5 5 8 4.2 4 4.2V18c4 0 6.5.8 8 2.3 1.5-1.5 4-2.3 8-2.3V4.2c-4 0-6.5.8-8 2.3z"/><path d="M12 6.5v13.8"/>',
  lupa: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
} as const;
type Trazo = keyof typeof TRAZOS;
const ico = (n: Trazo, clase = 'ico'): string => `<svg class="${clase}" viewBox="0 0 24 24" aria-hidden="true">${TRAZOS[n]}</svg>`;

const SEGMENTOS = 4;

/** Insignia de respaldo: escala de un solo tono (0-4 segmentos) más el rótulo en texto. DEC §4-§5. */
export function insigniaHtml(c: Concepto): string {
  if (c.borrador) return `<p class="badge-respaldo borrador"><span class="badge-prefijo">${escapar(t('ficha.borrador'))}</span></p>`;
  if (c.respaldo === undefined) return '';
  const seg = Array.from({ length: SEGMENTOS }, (_, i) => `<span class="badge-segmento" data-lleno="${i < c.respaldo! ? 'si' : 'no'}"></span>`).join('');
  return `<p class="badge-respaldo" data-nivel="${c.respaldo}"><span class="badge-segmentos" aria-hidden="true">${seg}</span>`
    + `<span class="badge-prefijo">${escapar(t('ficha.respaldo'))}:</span> <span class="badge-rotulo">${escapar(t(`respaldo.${c.respaldo}`))}</span>`
    + ` <span class="badge-prefijo">${c.respaldo} ${escapar(t('respaldo.de'))}</span></p>`;
}

/** La entradilla «En una frase». */
export function ideaHtml(c: Concepto): string {
  return c.idea ? `<div class="idea"><small>${escapar(t('bloques.en_una_frase'))}</small><p>${md(c.idea)}</p></div>` : '';
}

interface Entrada { id: string; titulo: string }

/** Las secciones de texto, en orden, con el título que lleva su entrada del índice «En esta página». */
export function entradasBloques(c: Concepto): Entrada[] {
  if (c.borrador) return [];
  return [
    ...(c.propone ? [{ id: 'propone', titulo: t('bloques.propone') }] : []),
    ...(c.analogia ? [{ id: 'analogia', titulo: t('bloques.piensalo_asi') }] : []),
    ...(c.se_sabe?.length ? [{ id: 'se-sabe', titulo: t('bloques.se_sabe') }] : []),
    ...(c.disputa?.length ? [{ id: 'disputa', titulo: t('bloques.disputa') }] : []),
    ...(c.detalles?.length ? [{ id: 'detalles', titulo: t('bloques.para_ir_mas_lejos') }] : []),
    ...(c.puntos_clave?.length ? [{ id: 'recordar', titulo: t('bloques.para_recordar') }] : []),
  ];
}

const seccion = (id: string, icono: Trazo, titulo: string, cuerpo: string, clase = ''): string =>
  `<section class="bloque${clase ? ` ${clase}` : ''}" id="${id}" aria-labelledby="${id}-h"><h2 id="${id}-h"><span class="ico-t">${ico(icono)}</span>${escapar(titulo)}</h2>${cuerpo}</section>`;

/** Chips de referencia: cada uno lleva a la fuente de la lista de abajo. */
const chips = (refs: string[] | undefined): string =>
  refs?.length
    ? `<span class="refs">${refs.map((r) => `<a class="ref" href="#fuente-${escapar(r)}" data-ref="${escapar(r)}" aria-label="${escapar(t('bloques.ref_aria').replace('{ref}', r))}">${escapar(r)}</a>`).join('')}</span>`
    : '';

function propone(c: Concepto): string {
  const p = c.propone;
  if (!p) return '';
  const intro = p.intro ? `<p class="propone-intro">${md(p.intro)}</p>` : '';
  const pasos = `<ol class="pasos">${p.pasos.map((s) => `<li><b>${md(s.titulo)}</b><span>${md(s.texto)}</span></li>`).join('')}</ol>`;
  let cita = '';
  if (c.cita) {
    cita = `<blockquote class="cita"><p class="cita-texto" lang="en">${escapar(t('bloques.cita_original').replace('{texto}', c.cita.texto))}</p>`
      + `<p class="cita-traduccion">${escapar(t('bloques.cita_traduccion').replace('{texto}', c.cita.traduccion))}</p>`
      + `<footer>${escapar(`${c.cita.autor}. ${c.cita.fuente ?? ''}`.trim())}</footer></blockquote>`;
  }
  return seccion('propone', 'pasos', t('bloques.propone'), intro + pasos + cita);
}

function analogia(c: Concepto): string {
  const a = c.analogia;
  if (!a) return '';
  return seccion('analogia', 'idea', t('bloques.piensalo_asi'),
    `<div class="anal"><h3>${md(a.titulo)}</h3><p>${md(a.texto)}</p></div><p class="anal-origen">${escapar(t('bloques.analogia_editorial'))}</p>`);
}

function seSabe(c: Concepto): string {
  if (!c.se_sabe?.length) return '';
  return seccion('se-sabe', 'ok', t('bloques.se_sabe'),
    `<ul class="se-sabe">${c.se_sabe.map((s) => `<li><span>${md(s.texto)}</span>${chips(s.refs)}</li>`).join('')}</ul>`);
}

function disputa(c: Concepto): string {
  if (!c.disputa?.length) return '';
  const cuerpo = `<div class="aviso-disputa" role="note">${ico('aviso')}<p>${escapar(t('bloques.disputa_aviso'))}</p></div>`
    + c.disputa.map((d) => `<div class="disp"><h3>${md(d.titulo)}</h3><p>${md(d.texto)}</p>${chips(d.refs)}</div>`).join('');
  return seccion('disputa', 'aviso', t('bloques.disputa'), cuerpo, 'caja-disputa');
}

function detalles(c: Concepto): string {
  if (!c.detalles?.length) return '';
  return seccion('detalles', 'mas', t('bloques.para_ir_mas_lejos'), `<div class="det">${c.detalles.map((d) =>
    `<details><summary>${md(d.titulo)}${ico('chev')}</summary><div class="det-cuerpo"><p>${md(d.texto)}</p>${chips(d.refs)}</div></details>`).join('')}</div>`);
}

function recordar(c: Concepto): string {
  if (!c.puntos_clave?.length) return '';
  return seccion('recordar', 'recordar', t('bloques.para_recordar'),
    `<ul class="recordar">${c.puntos_clave.map((p) => `<li>${ico('ok')}<span>${md(p)}</span></li>`).join('')}</ul>`);
}

const TIPOS = ['primaria', 'replica', 'critica', 'contexto'] as const;
const PLEGAR_DESDE = 6;

/** Fuentes tipadas; con más de seis, plegadas (DEC §3). Cada una lleva el id al que apuntan los chips. */
export function fuentesHtml(c: Concepto): string {
  const fs = c.fuentes;
  if (!fs?.length) return '';
  const grupos = TIPOS.map((tipo) => {
    const lista = fs.filter((f) => f.tipo === tipo);
    if (!lista.length) return '';
    const lis = lista.map((f) => {
      const titulo = f.url
        ? `<a href="${escapar(f.url)}" target="_blank" rel="noopener">${escapar(f.titulo)}<span class="oculto"> ${escapar(t('bloques.abrir_fuera'))}</span></a>`
        : escapar(f.titulo);
      return `<li id="fuente-${escapar(f.ref)}"><span class="fuente-ref">${escapar(f.ref)}</span>${titulo}`
        + (f.nota ? `<span class="fuente-nota">${escapar(t('bloques.nota'))}: ${escapar(f.nota)}</span>` : '') + '</li>';
    }).join('');
    return `<h3>${escapar(t(`bloques.tipo_${tipo}`))}</h3><ul class="fuentes">${lis}</ul>`;
  }).join('');
  if (fs.length > PLEGAR_DESDE) {
    return seccion('fuentes', 'libro', t('bloques.fuentes'),
      `<details class="det-fuentes"><summary>${escapar(t('bloques.fuentes_n').replace('{n}', String(fs.length)))}${ico('chev')}</summary>${grupos}</details>`);
  }
  return seccion('fuentes', 'libro', t('bloques.fuentes'), grupos);
}

/** El cuerpo: de «Lo que propone» a «Para recordar». La cabecera, la máquina, el reel y el pie los pone main.ts. */
export function bloquesHtml(c: Concepto): string {
  if (c.borrador) return `<p class="aviso-borrador">${escapar(t('concepto.borrador'))}</p>`;
  return [propone(c), analogia(c), seSabe(c), disputa(c), detalles(c), recordar(c)].join('');
}

/**
 * El reel, lo primero de la ficha (DEC §11.3, decidido por el humano 2026-11-17): arriba del todo, en una
 * escena a todo el ancho y también en móvil. Sin `autoplay` y sin botón «Ver el reel»: nada se mueve
 * hasta que lo pide el visitante.
 *
 * La transcripción NO se ve, pero sigue en el DOM con la clase `.oculto` y el vídeo apunta a ella con
 * `aria-describedby`: es la alternativa del medio para el lector de pantalla (WCAG 1.2.1 y 1.2.3). Un
 * `<details>` no vale, porque cerrado sigue siendo una transcripción en pantalla. Las personas sordas
 * tienen los subtítulos quemados en el vídeo; un reel sin ellos no puede ir en la ficha.
 *
 * El título accesible va en `aria-label` y no en un h2: este bloque precede al h1 en el documento.
 */
export function reelHtml(reel: Reel, conceptoId: string): string {
  const base = import.meta.env.BASE_URL;
  const idTexto = `reel-texto-${conceptoId}`;
  const frases = reel.transcripcion.map((f) => `<p>${escapar(f)}</p>`).join('');
  return `<section class="reel" id="reel" aria-label="${escapar(t('bloques.reel_titulo'))}: ${escapar(reel.titulo)}">`
    + `<div class="reel-escena"><video controls preload="none" playsinline poster="${escapar(base + reel.poster)}" src="${escapar(base + reel.video)}" aria-label="${escapar(reel.descripcion)}" aria-describedby="${idTexto}"></video></div>`
    + `<p class="reel-fuentes"><strong>${escapar(t('bloques.reel_fuentes'))}:</strong> ${escapar(reel.fuentes)}</p>`
    + `<div id="${idTexto}" class="oculto"><h3>${escapar(t('bloques.transcripcion'))}</h3>${frases}</div></section>`;
}

/** Los refs de los chips saltan a la fuente aunque estén plegadas: se abre el <details> que la contiene. */
export function activarBloques(raiz: HTMLElement): void {
  raiz.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a.ref');
    if (!a) return;
    const destino = raiz.querySelector<HTMLElement>(`#fuente-${a.dataset.ref}`);
    if (!destino) return;
    e.preventDefault();
    const det = destino.closest('details');
    if (det) det.open = true;
    destino.scrollIntoView({ block: 'center' });
    destino.classList.add('resaltada');
    setTimeout(() => destino.classList.remove('resaltada'), 1800);
  });
}
