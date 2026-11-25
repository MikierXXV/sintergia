/**
 * Scroll suave con Lenis (MIT). Portado de la plantilla, con lo que este sitio necesita de más.
 *
 * QUÉ HACE Y QUÉ NO. Lenis solo suaviza la rueda; sigue moviendo el scroll nativo, así que
 * escenografia.ts, el índice fijo y los observadores reciben los mismos eventos de siempre.
 *
 * CUÁNDO NO SE ACTIVA:
 *  · prefers-reduced-motion: reduce. Quien lo pide no quiere inercia.
 *  · Táctil: Lenis, por defecto, no toca el scroll del dedo (syncTouch desactivado).
 *
 * LAS ANCLAS. Aquí el fragmento es la RUTA (`#/c/<id>`), así que no hay un oyente genérico para
 * `a[href^="#"]` como en la plantilla: escribir el ancla en la dirección rompería la navegación. Los
 * dos saltos internos que existen (el índice «En esta página» y las referencias a fuentes) llaman a
 * `irA()`. Lenis ya descuenta `scroll-margin-top` del destino: no hay que restarlo otra vez.
 */
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { movimientoReducido } from '../vis/lenguaje';

let lenis: Lenis | null = null;

export function montarScrollSuave(): void {
  if (lenis || movimientoReducido()) return;
  lenis = new Lenis({ autoRaf: true, allowNestedScroll: true });

  // Si el usuario activa «reducir movimiento» con la página abierta, Lenis se va y queda el nativo.
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (!e.matches) return;
    lenis?.destroy();
    lenis = null;
  });
}

/** Salta a un elemento de la página: al principio (respetando su scroll-margin) o centrado. */
export function irA(destino: HTMLElement, donde: 'start' | 'center' = 'start'): void {
  if (!lenis) {
    const suave = donde === 'start' && !movimientoReducido();
    destino.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: donde });
    return;
  }
  // La página puede haber crecido ahora mismo (un <details> recién abierto) y Lenis la mide con retardo.
  lenis.resize();
  const offset = donde === 'center' ? -(window.innerHeight - destino.offsetHeight) / 2 : 0;
  lenis.scrollTo(destino, { offset });
}

/** Al cambiar de página: arriba del todo, cortando la inercia que quedara de la anterior. */
export function subirArriba(): void {
  if (!lenis) {
    window.scrollTo(0, 0);
    return;
  }
  lenis.resize();
  lenis.scrollTo(0, { immediate: true, force: true });
}
