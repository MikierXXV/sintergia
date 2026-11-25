/**
 * Arranque del sitio.
 *
 * Una sola página que se repinta al cambiar la ruta del fragmento (`#/`, `#/c/<id>`, `#/limites`).
 * Todo texto visible sale de ui.json vía t(), o de la ficha.
 *
 * LA ESCENOGRAFÍA SOLO VIVE EN LA PORTADA (DEC §5). La página de concepto es una página quieta: sin
 * entradas al hacer scroll, para que ningún efecto pueda dejar la máquina sin montar. El reparto de
 * siempre se mantiene: aquí solo se traducen los campos de la ficha a atributos del DOM; el efecto
 * está en src/estilos/escenografia.css y el estado que necesita lo publica src/app/escenografia.ts.
 */

import './estilos/sitio.css';
import './estilos/escenografia.css';
import './estilos/app.css';
import './estilos/ficha.css';
import {
  FAMILIAS, conceptoPorId, conceptosDe, recorrido, type Concepto, type Familia,
} from './app/contenido';
import { ENTRADA_POR_DEFECTO, ESCENAS_CON_AVANCE, type Tono } from './app/efectos';
import { montarEscenografia } from './app/escenografia';
import { activarBloques, bloquesHtml, entradasBloques, fuentesHtml, ideaHtml, insigniaHtml, reelHtml } from './app/bloques';
import { reelDe, reelDePortada } from './app/reels';
import { siluetaFigura } from './vis/silueta-figura';
import type { Visualizacion } from './vis/lenguaje';
import { alCambiarRuta, anclaAntigua, enlace, rutaActual } from './app/rutas';
import { alCambiarTema, cambiarTema, temaActual } from './app/tema';
import { t } from './app/textos';
import { irA, montarScrollSuave, subirArriba } from './app/scroll-suave';
import { montarTextoVivo } from './app/texto-vivo';
import { montarMaquina, type Montaje } from './vis/montaje';

const cabeceraBuscada = document.querySelector<HTMLElement>('#cabecera');
const sitioBuscado = document.querySelector<HTMLElement>('#sitio');
if (!cabeceraBuscada || !sitioBuscado) throw new Error('Faltan #cabecera y #sitio en index.html');
const cabeceraEl: HTMLElement = cabeceraBuscada;
const sitio: HTMLElement = sitioBuscado;

const escapar = (s: string): string =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const con = (plantilla: string, datos: Record<string, string | number>): string =>
  plantilla.replace(/\{(\w+)\}/g, (_, k: string) => String(datos[k] ?? ''));
/** La primera frase del resumen: es lo que enseña la tarjeta, sin texto nuevo en el contenido. */
const primeraFrase = (s: string): string => s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s;

const TRAZOS = {
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  luna: '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>',
  atras: '<path d="m15 5-7 7 7 7"/>',
  siguiente: '<path d="m9 5 7 7-7 7"/>',
  reel: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9.5 5 2.5-5 2.5z"/>',
} as const;
const ico = (n: keyof typeof TRAZOS): string => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${TRAZOS[n]}</svg>`;

const acentoDe = (familiaId: string): string => {
  const f = FAMILIAS.find((x) => x.id === familiaId);
  return f ? f.color_acento[temaActual()] : 'var(--texto-secundario)';
};

/* ------------------------------------------------------------- cabecera/pie -- */

function cabecera(): string {
  return `
    <header class="top"><div class="top-in">
      <a class="logo" href="${enlace({ vista: 'portada' })}" aria-label="${escapar(t('sitio.inicio'))}">${escapar(t('sitio.titulo'))}</a>
      <nav class="top-der" aria-label="${escapar(t('sitio.navegacion'))}">
        <a class="btn-texto" href="${enlace({ vista: 'limites' })}">${escapar(t('sitio.limites'))}</a>
        <button type="button" class="btn-icono" data-accion="tema" aria-label="${escapar(temaActual() === 'claro' ? t('sitio.tema_oscuro') : t('sitio.tema_claro'))}">${ico(temaActual() === 'oscuro' ? 'sol' : 'luna')}</button>
      </nav>
    </div></header>`;
}

function pie(): string {
  // «Límites» ya está en la barra superior: en el pie es un enlace dentro de la propia frase (DEC §11.1 P7).
  const enlaceLimites = `<a href="${enlace({ vista: 'limites' })}">${escapar(t('sitio.pie_enlace'))}</a>`;
  return `<footer class="pie"><p class="pie-aviso">${escapar(t('sitio.pie')).replace('{enlace}', enlaceLimites)}</p></footer>`;
}

/* ----------------------------------------------------------------- tarjeta -- */

function tarjeta(c: Concepto): string {
  return `
    <li style="--acento: ${acentoDe(c.familia_id)}">
      <a class="card" href="${enlace({ vista: 'concepto', id: c.id })}">
        <span class="card-sim" aria-hidden="true">${escapar(c.simbolo)}</span>
        <span class="card-cuerpo">
          <span class="card-tit">${escapar(c.titulo)}</span>
          <span class="card-res">${escapar(primeraFrase(c.resumen))}</span>
          ${insigniaHtml(c)}
        </span>
        <span class="card-flecha" aria-hidden="true">${ico('siguiente')}</span>
      </a>
    </li>`;
}

/* ----------------------------------------------------------------- portada -- */

/** El tono con el que se ve realmente una parada: el que pide, y si no pide, el del sitio. */
function tonoEfectivo(familia: Familia): Tono {
  return familia.escena?.tono ?? temaActual();
}

/** Capas decorativas de la cubierta: `aria-hidden` y sin texto. Son atmósfera, no explicación. */
function crearCapas(familia: Familia): HTMLElement {
  const capas = document.createElement('div');
  capas.className = 'parada-capas';
  capas.setAttribute('aria-hidden', 'true');
  for (const capa of familia.escena?.capas ?? [{ profundidad: 0.6 }]) {
    const el = document.createElement('div');
    el.className = 'parada-capa';
    el.style.setProperty('--profundidad', String(capa.profundidad));
    if (capa.imagen) {
      el.dataset.imagen = 'si';
      el.style.backgroundImage = `url(${import.meta.env.BASE_URL}${capa.imagen.replace(/^\//, '')})`;
    }
    capas.append(el);
  }
  return capas;
}

/** La leyenda de la escala de respaldo, estática y en texto (DEC §5). */
function leyenda(): string {
  return `<section class="leyenda" aria-labelledby="leyenda-h"><h2 id="leyenda-h">${escapar(t('portada.leyenda_titulo'))}</h2>`
    + `<ol>${[4, 3, 2, 1, 0].map((n) => `<li><span class="badge-segmentos" aria-hidden="true">${[0, 1, 2, 3].map((i) => `<span class="badge-segmento" data-lleno="${i < n ? 'si' : 'no'}"></span>`).join('')}</span> <strong>${escapar(t(`respaldo.${n}`))}</strong></li>`).join('')}</ol></section>`;
}

/**
 * El rótulo de una banda: número, recuento y rango de respaldo, calculados a partir de las fichas
 * (DEC §11.1 P5). Dice en texto lo que antes decía el tono de la banda.
 */
function kickerFamilia(posicion: number, fichas: Concepto[]): string {
  const niveles = fichas.map((c) => c.respaldo).filter((n): n is number => n !== undefined);
  const min = Math.min(...niveles);
  const max = Math.max(...niveles);
  const respaldo = !niveles.length ? ''
    : min === max ? t(`respaldo.${min}`)
    : con(t('portada.rango_respaldo'), { min: t(`respaldo.${min}`), max: t(`respaldo.${max}`) });
  return con(t('portada.kicker_familia'), { n: posicion, fichas: fichas.length, respaldo });
}

/** Mayor nivel de respaldo de una familia; 4 si no hay datos, para no marcarla como especulativa por error. */
function respaldoMaximo(fichas: Concepto[]): number {
  const niveles = fichas.map((c) => c.respaldo).filter((n): n is number => n !== undefined);
  return niveles.length ? Math.max(...niveles) : 4;
}

function pintarPortada(): void {
  soltarFigura();
  sitio.className = 'es-portada';
  document.title = t('sitio.titulo');
  const frag = document.createDocumentFragment();
  const secciones = new Map<string, HTMLElement>();
  const empieza = conceptoPorId('que-es-la-teoria-sintergica');

  const pendientes: { nombre: string; titulos: string[] }[] = [];
  let primeraEspeculativa = true;
  FAMILIAS.forEach((familia, i) => {
    // Una familia cuyas fichas son todas borrador no pinta parada: iría vacía. Sus títulos salen en
    // una sola franja compacta al final, y vuelve a ser parada con tarjetas en cuanto haya una ficha.
    if (i > 0 && !conceptosDe(familia.id).some((c) => !c.borrador)) {
      pendientes.push({ nombre: familia.nombre, titulos: conceptosDe(familia.id).map((c) => c.titulo) });
      return;
    }
    const escena = familia.escena ?? {};
    const tipo = escena.tipo ?? 'normal';
    const seccion = document.createElement('section');
    seccion.className = 'parada';
    seccion.dataset.familia = familia.id;
    seccion.dataset.escena = tipo;
    seccion.setAttribute('aria-labelledby', `fam-${familia.id}`);
    if (escena.tono) seccion.dataset.tono = escena.tono;
    if (ESCENAS_CON_AVANCE.includes(tipo)) seccion.dataset.avance = 'si';
    if (tipo === 'cubierta') seccion.prepend(crearCapas(familia));

    const cuerpo = document.createElement('div');
    cuerpo.className = 'parada-cuerpo';
    const encabezado = document.createElement('header');
    encabezado.className = 'parada-encabezado';
    encabezado.dataset.entrada = escena.entrada ?? ENTRADA_POR_DEFECTO;
    encabezado.style.setProperty('--orden', '0');

    const listas = conceptosDe(familia.id);
    const visibles = listas.filter((c) => !c.borrador);
    const enPreparacion = listas.length - visibles.length;

    if (i === 0) {
      // La cubierta: a la izquierda el titular, la entrada a las fichas y al reel, y la leyenda; a la
      // derecha la figura. El hueco de la figura se reserva desde el principio (cuadrado) para que ni
      // la carga de Three.js ni su ausencia muevan la maqueta.
      cuerpo.classList.add('portada-hero');
      const texto = document.createElement('div');
      texto.className = 'hero-texto';
      encabezado.innerHTML = `<p class="kicker">${escapar(t('portada.kicker'))}</p>`
        + `<h1 id="fam-${familia.id}" data-titulo-vivo>${escapar(t('portada.titular'))}</h1>`;
      const intro = document.createElement('p');
      intro.className = 'descripcion-familia';
      intro.textContent = t('portada.intro');
      texto.append(encabezado, intro);
      const reel = reelDePortada();
      if (empieza) {
        const e = document.createElement('div');
        e.className = 'empieza';
        e.dataset.entrada = escena.entrada ?? ENTRADA_POR_DEFECTO;
        e.style.setProperty('--orden', '1');
        // La nota «Qué es la teoría…» es el subtítulo del botón «Empieza aquí», no un párrafo suelto.
        e.innerHTML = `<div class="empieza-principal"><a class="btn pri" href="${enlace({ vista: 'concepto', id: empieza.id })}"><span>${escapar(t('portada.empieza_aqui'))}</span>${ico('siguiente')}</a>`
          + `<p class="empieza-nota">${escapar(t('portada.empieza_aqui_texto'))}</p></div>`
          + (reel ? `<a class="btn sec video" href="${enlace({ vista: 'concepto', id: reel.concepto })}">${ico('reel')}<span>${escapar(t('portada.ver_reel'))}</span></a>` : '');
        texto.append(e);
      }
      const figura = document.createElement('figure');
      figura.className = 'hero-figura';
      figura.dataset.entrada = escena.entrada ?? ENTRADA_POR_DEFECTO;
      figura.style.setProperty('--orden', '2');
      figura.innerHTML = `<div id="figura" class="figura-hueco">${siluetaFigura(escapar(t('portada.figura_aria')))}</div>`
        + `<figcaption class="pie-figura">“<a href="https://sketchfab.com/3d-models/souls-e1ea2db7ab6f4b7989375a91c38f19a3" rel="noopener">${escapar(t('portada.figura_credito_modelo'))}</a>” ${escapar(t('portada.figura_credito_texto'))} <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener">${escapar(t('portada.figura_credito_licencia'))}</a>. ${escapar(t('portada.figura_credito_cambios'))}</figcaption>`;
      cuerpo.append(texto, figura);
    } else {
      // Filete discontinuo en la primera banda cuyo respaldo máximo es ≤ 1: «aquí empieza lo postulado».
      // Es el mismo código que `rol: "propuesta"` en las máquinas, y sale de los datos, no de un nombre.
      if (primeraEspeculativa && respaldoMaximo(visibles) <= 1) {
        seccion.dataset.postulado = 'si';
        primeraEspeculativa = false;
      }
      encabezado.innerHTML = `<p class="kicker kicker-familia">${escapar(kickerFamilia(i + 1, visibles))}</p><h2 id="fam-${familia.id}" data-titulo-vivo>${escapar(familia.nombre)}</h2>${familia.descripcion ? `<p class="descripcion-familia">${escapar(familia.descripcion)}</p>` : ''}`;
      cuerpo.append(encabezado);
      if (visibles.length) {
        const ul = document.createElement('ul');
        ul.className = 'rejilla';
        ul.innerHTML = visibles.map(tarjeta).join('');
        ul.dataset.entrada = escena.entrada ?? ENTRADA_POR_DEFECTO;
        ul.style.setProperty('--orden', '1');
        cuerpo.append(ul);
      }
      if (enPreparacion) {
        const p = document.createElement('p');
        p.className = 'en-preparacion';
        p.textContent = con(t('portada.en_preparacion'), { n: enPreparacion });
        cuerpo.append(p);
      }
    }
    seccion.append(cuerpo);
    // La leyenda sale de la columna del héroe: franja propia justo debajo, a todo el ancho (DEC §11.1 P2).
    if (i === 0) seccion.insertAdjacentHTML('beforeend', `<div class="parada-cuerpo leyenda-franja">${leyenda()}</div>`);
    frag.append(seccion);
    secciones.set(familia.id, seccion);
  });

  if (pendientes.length) {
    const franja = document.createElement('section');
    franja.className = 'parada proximas';
    franja.setAttribute('aria-labelledby', 'proximas-h');
    franja.innerHTML = `<div class="parada-cuerpo"><h2 id="proximas-h">${escapar(t('portada.proximas_titulo'))}</h2><ul class="proximas-lista">`
      + pendientes.map((f) => `<li><strong>${escapar(f.nombre)}</strong><span>${f.titulos.map(escapar).join(' · ')}</span></li>`).join('')
      + `</ul></div>`;
    frag.append(franja);
  }

  sitio.replaceChildren(frag, Object.assign(document.createElement('div'), { className: 'pie-caja', innerHTML: pie() }));
  aplicarColorDeEscena(secciones);
  montarEscenografia(sitio);
  vigilarFigura();
}

/* ------------------------------------------------------------------ figura -- */

let figuraViva: Visualizacion | null = null;
let vigilanteFigura: IntersectionObserver | null = null;

/** Libera el contexto WebGL de la figura: solo puede haber uno vivo (regla 4). */
function soltarFigura(): void {
  vigilanteFigura?.disconnect();
  vigilanteFigura = null;
  figuraViva?.destruir();
  figuraViva = null;
}

/** La figura se monta al entrar en pantalla y se destruye al salir; Three.js no se pide hasta entonces. */
function vigilarFigura(): void {
  const hueco = sitio.querySelector<HTMLElement>('#figura');
  if (!hueco) return;
  let montando = false;
  let visible = false;
  const montar = (): void => {
    if (!visible || figuraViva || montando) return;
    montando = true;
    void import('./vis/hero-figura')
      .then((m) => m.crearHeroFigura(hueco))
      .then((v) => { if (visible && hueco.isConnected) figuraViva = v; else v?.destruir(); })
      .finally(() => { montando = false; montar(); });
  };
  vigilanteFigura = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      visible = e.isIntersecting;
      if (visible) montar();
      else if (figuraViva) {
        figuraViva.destruir();
        figuraViva = null;
        // El destruir() vacía el hueco: se restituye la silueta, que es lo que ocupa su sitio.
        hueco.innerHTML = siluetaFigura(escapar(t('portada.figura_aria')));
      }
    }
  });
  vigilanteFigura.observe(hueco);
}

/** Acentos y velos, recalculados cada vez que cambia el tema (un acento escrito una sola vez se queda con el del tema anterior). */
function aplicarColorDeEscena(secciones: Map<string, HTMLElement>): void {
  FAMILIAS.forEach((familia, i) => {
    const seccion = secciones.get(familia.id);
    if (!seccion) return;
    const tono = tonoEfectivo(familia);
    seccion.style.setProperty('--acento', familia.color_acento[tono]);
    const anterior = FAMILIAS[i - 1];
    const tonoAnterior = anterior ? tonoEfectivo(anterior) : temaActual();
    const velo = familia.escena?.velo ?? 'ninguno';
    if (velo !== 'ninguno' && tonoAnterior !== tono) {
      seccion.dataset.velo = velo;
      seccion.style.setProperty('--velo-desde', `var(--${tonoAnterior}-fondo)`);
    } else {
      delete seccion.dataset.velo;
      seccion.style.removeProperty('--velo-desde');
    }
  });
}

/* ---------------------------------------------------------------- concepto -- */

let maquinaViva: Montaje | null = null;
let vigilanteToc: IntersectionObserver | null = null;
function soltarMaquina(): void {
  maquinaViva?.destruir();
  maquinaViva = null;
  vigilanteToc?.disconnect();
  vigilanteToc = null;
}

/** Pie de la ruta única: «El recorrido · n de 15», con anterior y siguiente. */
function pagerRuta(c: Concepto): string {
  const lista = recorrido();
  const n = lista.findIndex((x) => x.id === c.id);
  if (n < 0) return '';
  const vecino = (v: Concepto | undefined, etiqueta: string, der: boolean): string =>
    v ? `<a class="pg${der ? ' der' : ''}" href="${enlace({ vista: 'concepto', id: v.id })}"><small>${escapar(etiqueta)}</small><span>${escapar(v.titulo)}</span></a>` : '';
  return `<nav class="pager" aria-label="${escapar(t('concepto.ruta_aria'))}">
    <p class="pager-ruta">${escapar(con(t('concepto.pie_ruta'), { n: n + 1, total: lista.length }))}</p>
    <div class="pager-bt">${vecino(lista[n - 1], t('concepto.anterior'), false)}${vecino(lista[n + 1], t('concepto.siguiente'), true)}</div></nav>`;
}

/** «En esta página»: salta a la sección sin tocar el fragmento (que es la ruta) y marca la que se lee. */
function activarIndice(): void {
  const ir = (id: string | undefined): void => {
    const destino = id ? sitio.querySelector<HTMLElement>(`#${id}`) : null;
    if (destino) irA(destino);
  };
  for (const a of sitio.querySelectorAll<HTMLElement>('[data-ir]')) {
    a.addEventListener('click', (e) => { e.preventDefault(); ir(a.dataset.ir); });
  }
  const enlaces = [...sitio.querySelectorAll<HTMLAnchorElement>('.toc a[data-ir]')];
  const secciones = enlaces.map((a) => sitio.querySelector<HTMLElement>(`#${a.dataset.ir}`)).filter((x): x is HTMLElement => !!x);
  const marcar = (id: string): void => enlaces.forEach((a) => {
    if (a.dataset.ir === id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });
  vigilanteToc = new IntersectionObserver((entradas) => {
    const visible = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (visible) marcar(visible.target.id);
  }, { rootMargin: '-15% 0px -70% 0px' });
  secciones.forEach((s) => vigilanteToc!.observe(s));
  marcar(enlaces[0]?.dataset.ir ?? '');
}

function pintarConcepto(id: string): void {
  const c = conceptoPorId(id);
  if (!c) { sitio.className = ''; sitio.innerHTML = `<p class="vacio">${escapar(t('concepto.no_existe'))} <a href="${enlace({ vista: 'portada' })}">${escapar(t('concepto.volver'))}</a></p>${pie()}`; return; }
  soltarMaquina();
  sitio.className = '';
  const fam = FAMILIAS.find((f) => f.id === c.familia_id);
  const reel = c.reel ? reelDe(c.reel) : undefined;
  const relacionados = (c.enlaces ?? []).map((e) => ({ e, c: conceptoPorId(e.id) })).filter((x): x is { e: { id: string; rotulo: string }; c: Concepto } => !!x.c);
  const conMaquina = !!c.maquina && !c.borrador;

  const entradas: Array<{ id: string; titulo: string; oculta?: boolean }> = [
    ...(reel ? [{ id: 'reel', titulo: t('bloques.reel_titulo') }] : []),
    ...(conMaquina ? [{ id: 'maquina', titulo: t('concepto.maquina') }, { id: 'vision', titulo: t('concepto.que_estas_viendo'), oculta: true }] : []),
    ...entradasBloques(c),
    ...(relacionados.length ? [{ id: 'relacionados', titulo: t('concepto.relacionados') }] : []),
    ...(c.fuentes?.length ? [{ id: 'fuentes', titulo: t('bloques.fuentes') }] : []),
  ];

  sitio.innerHTML = `
    <div class="concepto" style="--acento: ${acentoDe(c.familia_id)}">
      <article class="col">
        ${reel ? reelHtml(reel, c.id) : ''}
        <nav class="migas" aria-label="${escapar(t('concepto.migas'))}">
          <a href="${enlace({ vista: 'portada' })}">${ico('atras')}<span>${escapar(t('concepto.inicio'))}</span></a>
          <span aria-hidden="true">/</span>
          <span class="miga-fam"><span class="punto" aria-hidden="true"></span>${escapar(fam?.nombre ?? '')}</span>
        </nav>
        <header class="cab">
          <div class="cab-meta">
            <span class="card-sim grande" role="img" aria-label="${escapar(t('concepto.simbolo_aria'))}">${escapar(c.simbolo)}</span>
            ${insigniaHtml(c)}
          </div>
          <h1 data-titulo-vivo>${escapar(c.titulo)}</h1>
          ${c.idea ? ideaHtml(c) : `<p class="resumen">${escapar(c.resumen)}</p>`}
        </header>
        ${conMaquina ? `<section class="maq" id="maquina" aria-labelledby="h-maquina">
          <div class="maq-cab"><h2 id="h-maquina">${escapar(t('concepto.maquina'))}</h2></div>
          <div class="vis-hueco" data-pieza="${escapar(c.id)}"></div>
        </section>
        <section id="vision" class="bloque vision" data-vision hidden><h2>${escapar(t('concepto.que_estas_viendo'))}</h2></section>` : ''}
        ${bloquesHtml(c)}
        ${relacionados.length ? `<section id="relacionados" class="bloque"><h2>${escapar(t('concepto.relacionados'))}</h2>
          <ul class="rejilla rel">${relacionados.map((r) => tarjeta(r.c)).join('')}</ul></section>` : ''}
        ${fuentesHtml(c)}
        ${pagerRuta(c)}
      </article>
      ${entradas.length ? `<aside class="toc" aria-label="${escapar(t('concepto.en_esta_pagina'))}"><p>${escapar(t('concepto.en_esta_pagina'))}</p>
        <ol>${entradas.map((s) => `<li ${s.oculta ? 'hidden' : ''} data-toc="${s.id}"><a href="${enlace({ vista: 'concepto', id: c.id })}" data-ir="${s.id}">${escapar(s.titulo)}</a></li>`).join('')}</ol></aside>` : ''}
    </div>
    ${pie()}`;
  document.title = `${c.titulo} · ${t('sitio.titulo')}`;
  sitio.querySelector('[data-vision]')?.addEventListener('vision-lista', () => {
    sitio.querySelector<HTMLElement>('[data-toc="vision"]')?.removeAttribute('hidden');
  });
  activarBloques(sitio);
  activarIndice();
  const hueco = sitio.querySelector<HTMLElement>('.vis-hueco');
  if (hueco) maquinaViva = montarMaquina(hueco, c.id, c.familia_id);
}

/* ------------------------------------------------------------------ límites -- */

function pintarLimites(): void {
  sitio.className = '';
  document.title = `${t('limites.titulo')} · ${t('sitio.titulo')}`;
  sitio.innerHTML = `
    <article class="col limites">
      <nav class="migas" aria-label="${escapar(t('concepto.migas'))}"><a href="${enlace({ vista: 'portada' })}">${ico('atras')}<span>${escapar(t('concepto.inicio'))}</span></a></nav>
      <h1>${escapar(t('limites.titulo'))}</h1>
      <p class="idea-limites">${escapar(t('limites.intro'))}</p>
      <ul class="lista">${['p1', 'p2', 'p3', 'p4', 'p5'].map((k) => `<li>${escapar(t(`limites.${k}`))}</li>`).join('')}</ul>
    </article>
    ${pie()}`;
}

/* ------------------------------------------------------------------- pintar -- */

function pintar(): void {
  const ruta = rutaActual();
  cabeceraEl!.innerHTML = cabecera();
  if (ruta.vista !== 'concepto') soltarMaquina();
  if (ruta.vista !== 'portada') soltarFigura();
  if (ruta.vista === 'concepto') pintarConcepto(ruta.id ?? '');
  else if (ruta.vista === 'limites') pintarLimites();
  else pintarPortada();
}

/** `#<id>` (sin barra) era el ancla de la antigua pieza: se redirige a `#/c/<id>`. */
function redirigirAnclaAntigua(): boolean {
  const id = anclaAntigua();
  if (!id) return false;
  if (conceptoPorId(id)) location.replace(enlace({ vista: 'concepto', id }));
  else location.replace(enlace({ vista: 'portada' }));
  return true;
}

cabeceraEl.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('[data-accion="tema"]')) cambiarTema();
});

/** Al cambiar de tema el concepto abierto NO se repinta: la máquina lleva su estado y se recolorea sola. */
alCambiarTema(() => {
  cabeceraEl.innerHTML = cabecera();
  const ruta = rutaActual();
  if (ruta.vista !== 'concepto') { pintar(); return; }
  const c = conceptoPorId(ruta.id ?? '');
  const art = sitio.querySelector<HTMLElement>('.concepto');
  if (c && art) art.style.setProperty('--acento', acentoDe(c.familia_id));
});

alCambiarRuta(() => {
  if (redirigirAnclaAntigua()) return;
  pintar();
  subirArriba();
  montarTextoVivo(sitio);
});

montarScrollSuave();
if (!redirigirAnclaAntigua()) {
  pintar();
  montarTextoVivo(sitio);
}
