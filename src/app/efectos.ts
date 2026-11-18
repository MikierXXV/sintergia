/**
 * Registro de la escenografía: qué puede declarar el contenido y nada más.
 *
 * MISMO TRATO QUE LAS MECÁNICAS. Un efecto se elige desde la ficha, igual que una mecánica, y la
 * lista de efectos válidos vive en un solo sitio: aquí. `scripts/validar-contenido.mjs` LEE ESTE
 * FICHERO y comprueba que todo lo declarado en el contenido exista, así que las listas se escriben
 * literales y no se generan; si se calcularan, el validador no podría verlas.
 *
 * Por qué un registro cerrado y no una clase CSS libre en la ficha: con clases libres, el día que
 * alguien renombra una regla de CSS el contenido sigue pidiéndola, no falla nada y el efecto
 * simplemente deja de existir. Un valor fuera del registro, en cambio, no compila el contenido.
 */

/**
 * Cómo aparece un bloque al entrar en pantalla.
 *
 *  · `velo`   — opacidad y un desplazamiento corto hacia arriba. El caso normal.
 *  · `deriva` — entra de lado. Para bloques que se leen como una secuencia lateral.
 *  · `foco`   — llega desenfocado y se afina. Para imágenes y escenas, NO para párrafos: el texto
 *               desenfocado durante medio segundo es texto que no se puede empezar a leer.
 *  · `corte`  — se descubre tras una máscara, de abajo arriba.
 *  · `ninguna`— aparece y ya está. Es lo que hay que elegir cuando el bloque es la respuesta a algo
 *               que el usuario acaba de leer y no se le debe hacer esperar.
 */
export const ENTRADAS = ['velo', 'deriva', 'foco', 'corte', 'ninguna'] as const;

/**
 * Qué forma tiene una parada entera.
 *
 *  · `normal`   — columna de lectura. El 90 % de las paradas.
 *  · `cubierta`— a sangre, alto de pantalla, con capas decorativas que se mueven con el scroll.
 *  · `franja`   — las piezas en fila horizontal con desplazamiento real y anclaje.
 */
export const ESCENAS = ['normal', 'cubierta', 'franja'] as const;

/** Tono forzado de una parada, contra el tema del sitio. Usa los mismos colores; ver tokens.css. */
export const TONOS = ['claro', 'oscuro'] as const;

/** Cómo se pasa de una parada a la siguiente cuando cambian de tono. */
export const VELOS = ['ninguno', 'suave', 'grano'] as const;

export type Entrada = (typeof ENTRADAS)[number];
export type Escena = (typeof ESCENAS)[number];
export type Tono = (typeof TONOS)[number];
export type Velo = (typeof VELOS)[number];

/**
 * Escenas que publican `--avance` y por tanto trabajan en cada fotograma de scroll.
 *
 * El validador cuenta cuántas hay y las limita con `presupuesto_escenas` de content/reglas.json.
 * No es una manía de purista: cada una añade lectura de geometría en el bucle de scroll, y el
 * escenario donde eso se nota no es el portátil sino el móvil de gama baja de presupuestos.json.
 */
export const ESCENAS_CON_AVANCE: readonly Escena[] = ['cubierta'];

export const ENTRADA_POR_DEFECTO: Entrada = 'velo';
export const ESCENA_POR_DEFECTO: Escena = 'normal';
