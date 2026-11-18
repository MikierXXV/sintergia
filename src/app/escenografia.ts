/**
 * Escenografía: el movimiento del documento.
 *
 * DOS NÚMEROS Y NINGUNA ANIMACIÓN. Este módulo no anima nada. Lo único que hace es publicar estado:
 * marca un bloque como visto cuando entra en pantalla, y escribe `--avance` (0 al entrar por abajo,
 * 1 al salir por arriba) en las paradas que lo piden. El efecto —qué se desplaza, cuánto y con qué
 * curva— está entero en src/estilos/escenografia.css.
 *
 * Se hace así por tres motivos que se pagaron aprendiendo:
 *
 *  1. Una animación escrita en JavaScript corre en el hilo principal y compite con el montaje de las
 *     visualizaciones. Una transición CSS de opacidad o transform la compone el navegador aparte.
 *  2. Cambiar el tono del sitio no debería obligar a tocar TypeScript. Con el efecto en CSS, ajustar
 *     una entrada es editar una regla.
 *  3. Lo que no se escribe no se puede desincronizar del contenido: la ficha elige un nombre del
 *     registro de src/app/efectos.ts y aquí no hay un `if` por efecto.
 *
 * LA RED DE SEGURIDAD, que es lo importante de todo el fichero: el estado inicial oculto de una
 * entrada SOLO se aplica si este módulo ha arrancado, porque lo condiciona `data-escenografia` en
 * <html>. Si el módulo falla, no llega o el sistema pide no moverse, el sitio se ve entero y quieto.
 * El fallo contrario —contenido que se queda en opacidad 0 para siempre porque el observador nunca
 * disparó— es el defecto clásico de este patrón, no da ningún error en consola y deja la página en
 * blanco para quien lo sufre. Lo comprueba scripts/capturar-sitio.mjs en cada despliegue.
 */

import { movimientoReducido } from '../vis/lenguaje';

/* ------------------------------------------------ planificador compartido -- */

const tareas = new Set<() => void>();
let pedido = false;
let escuchando = false;

function ejecutar(): void {
  pedido = false;
  for (const tarea of tareas) tarea();
}

function pedir(): void {
  if (pedido) return;
  pedido = true;
  requestAnimationFrame(ejecutar);
}

/**
 * Registra trabajo que depende del scroll. Un solo oyente y un solo fotograma para todos.
 *
 * `passive: true` no es decorativo: sin él, el navegador tiene que esperar a que el oyente termine
 * por si llama a preventDefault, y el scroll se queda pegado al dedo en móvil.
 *
 * Y el trabajo va DENTRO del requestAnimationFrame, nunca en el propio evento. Medir una caja en el
 * oyente de scroll obliga al navegador a recalcular la maqueta en mitad del desplazamiento, varias
 * veces por fotograma; es la forma más fácil de convertir un efecto bonito en un scroll a tirones.
 */
export function alDesplazar(tarea: () => void): void {
  tareas.add(tarea);
  if (!escuchando) {
    escuchando = true;
    addEventListener('scroll', pedir, { passive: true });
    addEventListener('resize', pedir, { passive: true });
  }
  pedir();
}

/* --------------------------------------------------------------- montaje -- */

export function montarEscenografia(raiz: HTMLElement): void {
  const quieto = movimientoReducido();

  // El CSS lee esto. Mientras no esté puesto, ninguna regla esconde nada.
  document.documentElement.dataset.escenografia = quieto ? 'quieta' : 'viva';

  if (quieto) return;

  observarEntradas(raiz);
  seguirAvance(raiz);
}

/**
 * Marca cada bloque la primera vez que entra en pantalla, y deja de mirarlo.
 *
 * UNA VEZ Y NO MÁS. Volver a animar al subir parece más rico y se siente como que la página pelea
 * con el usuario: quien vuelve atrás está buscando algo que ya leyó, y se lo encuentra apareciendo
 * otra vez. Además, dejar de observar el bloque quita trabajo del hilo principal en un recorrido
 * largo, que es donde este sitio tiene que seguir yendo fino.
 *
 * El margen inferior negativo hace que la entrada no salte con el bloque asomando un píxel, sino
 * cuando ya se ve de verdad.
 */
function observarEntradas(raiz: HTMLElement): void {
  const bloques = [...raiz.querySelectorAll<HTMLElement>('[data-entrada]')]
    .filter((b) => b.dataset.entrada !== 'ninguna');
  if (!bloques.length) return;

  const observador = new IntersectionObserver(
    (entradas, obs) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        const bloque = entrada.target as HTMLElement;
        bloque.dataset.visto = 'si';
        obs.unobserve(bloque);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
  );

  for (const bloque of bloques) observador.observe(bloque);
}

/**
 * Publica `--avance` en las paradas que lo declaran.
 *
 * Solo se miden las que están en pantalla: mantener la lista con un IntersectionObserver cuesta una
 * vez, y medir todas las paradas en cada fotograma cuesta en todos. Con veinte paradas la diferencia
 * no se ve en el portátil y sí en el móvil de gama baja del escenario de auditoría.
 */
function seguirAvance(raiz: HTMLElement): void {
  const paradas = [...raiz.querySelectorAll<HTMLElement>('[data-avance="si"]')];
  if (!paradas.length) return;

  const enPantalla = new Set<HTMLElement>();

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        const parada = entrada.target as HTMLElement;
        if (entrada.isIntersecting) enPantalla.add(parada);
        else {
          enPantalla.delete(parada);
          // Al salir se deja el extremo al que se fue, no el valor a medias en el que se dejó de
          // mirar: si no, al volver a entrar la capa da un salto desde donde se quedó.
          parada.style.setProperty('--avance', entrada.boundingClientRect.top > 0 ? '0' : '1');
        }
      }
      pedir();
    },
    { rootMargin: '10% 0px' },
  );

  for (const parada of paradas) observador.observe(parada);

  alDesplazar(() => {
    const alto = window.innerHeight;
    for (const parada of enPantalla) {
      const caja = parada.getBoundingClientRect();
      const recorrido = alto + caja.height;
      const bruto = recorrido > 0 ? (alto - caja.top) / recorrido : 0;
      parada.style.setProperty('--avance', Math.min(1, Math.max(0, bruto)).toFixed(3));
    }
  });
}
