/**
 * Los dos efectos sobre texto: el título que se enfoca palabra a palabra (BlurText) y la cifra de un
 * estudio que cuenta hasta su valor (CountUp). Adaptados de React Bits (MIT + Commons Clause,
 * © David Haz), reescritos sin React.
 *
 * El reparto de siempre: aquí solo se publica estado y se prepara el marcado; la animación está
 * entera en src/estilos/escenografia.css.
 *
 * NADA QUEDA OCULTO NI A MEDIAS. El estado normal del título y de la cifra es el texto final, visible.
 * Los dos efectos son animaciones CSS sin `forwards`: al acabar —o si no llegan a correr— queda lo que
 * dice la ficha. La cifra real no se reescribe nunca; lo que cuenta es un pseudo-elemento encima.
 */
import { movimientoReducido } from '../vis/lenguaje';

let observadores: IntersectionObserver[] = [];

/** Llama a `hacer` la primera vez que cada elemento asoma. */
function alAsomar(elementos: HTMLElement[], margen: string, hacer: (el: HTMLElement) => void): void {
  if (!elementos.length) return;
  const observador = new IntersectionObserver((entradas, obs) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      obs.unobserve(entrada.target);
      hacer(entrada.target as HTMLElement);
    }
  }, { rootMargin: margen });
  for (const el of elementos) observador.observe(el);
  observadores.push(observador);
}

/**
 * Parte el título en palabras (cortando también tras un guion, para no cambiar dónde puede saltar de
 * línea) y lo devuelve a texto corriente cuando la última termina.
 */
function enfocarTitulo(titulo: HTMLElement): void {
  const texto = titulo.textContent ?? '';
  const trozos = texto.match(/\s+|[^\s-]*-|[^\s-]+/g);
  if (!trozos) return;
  let n = 0;
  const nodos = trozos.map((trozo) => {
    if (/^\s+$/.test(trozo)) return document.createTextNode(' ');
    const palabra = document.createElement('span');
    palabra.className = 'bt-palabra';
    palabra.setAttribute('aria-hidden', 'true');
    palabra.style.setProperty('--i', String(n++));
    palabra.textContent = trozo;
    return palabra;
  });
  // Mientras dura, el lector de pantalla oye el título entero y no una palabra por nodo.
  titulo.setAttribute('aria-label', texto);
  titulo.replaceChildren(...nodos);

  let pendientes = n;
  titulo.addEventListener('animationend', function alAcabar(e) {
    if (!(e.target as HTMLElement).classList.contains('bt-palabra') || --pendientes > 0) return;
    titulo.removeEventListener('animationend', alAcabar);
    titulo.textContent = texto;
    titulo.removeAttribute('aria-label');
  });
}

function contar(cifra: HTMLElement): void {
  cifra.dataset.contando = 'si';
  // Se retira al acabar: una cifra dentro de un plegable volvería a contar cada vez que se abre.
  cifra.addEventListener('animationend', () => delete cifra.dataset.contando, { once: true });
}

/** Se llama una vez por página pintada, con el scroll ya en su sitio. */
export function montarTextoVivo(raiz: HTMLElement): void {
  for (const o of observadores) o.disconnect();
  observadores = [];
  if (movimientoReducido()) return;

  const titulos = [...raiz.querySelectorAll<HTMLElement>('[data-titulo-vivo]')];
  // Un título que ya está en pantalla se prepara en este mismo fotograma: esperar al observador lo
  // enseñaría nítido un instante y luego lo borraría.
  const aLaVista = titulos.filter((x) => x.getBoundingClientRect().top < window.innerHeight);
  aLaVista.forEach(enfocarTitulo);
  const resto = titulos.filter((x) => !aLaVista.includes(x));
  // Dentro de una entrada de la escenografía, con su mismo margen: el título se enfoca cuando su
  // bloque aparece, no antes.
  alAsomar(resto.filter((x) => x.closest('[data-entrada]')), '0px 0px -10% 0px', enfocarTitulo);
  alAsomar(resto.filter((x) => !x.closest('[data-entrada]')), '0px', enfocarTitulo);

  alAsomar([...raiz.querySelectorAll<HTMLElement>('.cifra')], '0px', contar);
}
