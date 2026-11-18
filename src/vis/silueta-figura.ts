/** Silueta de la figura de la portada, en su propio módulo para que la portada no arrastre Three.js. */

/**
 * Silueta de espera. El mismo contorno que el busto visto desde la cámara del hero, a mano: es un
 * óvalo de cabeza, un cuello y unos hombros. Va en el marcado con la opacidad como atributo de
 * presentación, para que sin CSS el peor caso sea un contorno tenue y no una mancha negra.
 */
export function siluetaFigura(etiqueta: string): string {
  const cuerpo = 'M20 98 C20 80 30 72 42 69 L42 61 C34 57 31 49 31 40 C31 24 39 14 50 14 C61 14 69 24 69 40 C69 49 66 57 58 61 L58 69 C70 72 80 80 80 98 Z';
  return `<svg class="silueta" viewBox="0 0 100 100" role="img" aria-label="${etiqueta}">`
    + `<ellipse class="anillo" cx="50" cy="42" rx="40" ry="14" transform="rotate(-18 50 42)" fill="none" stroke="currentColor" stroke-width="0.4" opacity="0.5"/>`
    + `<ellipse class="anillo" cx="50" cy="42" rx="34" ry="34" fill="none" stroke="currentColor" stroke-width="0.3" opacity="0.35"/>`
    + `<path class="masa" d="${cuerpo}" fill="currentColor" opacity="0.1"/>`
    + `<path class="linea" d="${cuerpo}" fill="none" stroke="currentColor" stroke-width="0.5" stroke-linejoin="round"/>`
    + `</svg>`;
}
