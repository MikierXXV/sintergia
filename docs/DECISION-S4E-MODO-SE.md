# S4-E · El piloto, al modo de software-engineer

Decisiones tomadas al rehacer la presentación (tarea t-57f9fe). El contenido y el rigor (DEC §3, §4, §6)
no cambian: lo que cambia es la forma de presentarlos.

## Excepción: `proporcionMovil()` en `src/vis/lenguaje.ts`

La regla 3 dice que toda visualización pasa por `lenguaje.ts` y que ese fichero no se toca para
acomodar a una pieza. Se hace **una** excepción, aprobada por el jefe en la ficha S4-E:

- `diagrama.ts` y el mando común (`controles.ts`) se copian tal cual de software-engineer, y piden
  `proporcionMovil()` para dar al lienzo otra proporción (`--vis-proporcion-movil`) en pantallas estrechas.
- Se añade esa función, que lee el token. No cambia nada de lo existente.
- No es una puerta abierta: la proporción sigue siendo un token de `design/tokens.css`, no un número en
  una mecánica.

## Mecánica `diagrama` con rigor

Se reutiliza `diagrama` en vez de crear otra mecánica, y se le añaden dos cosas para la regla de DEC §6:

- `rol: "dato"` (trazo continuo) frente a `rol: "propuesta"` (discontinuo, nunca el acento cian): lo
  medido y lo que el texto atribuye a Grinberg no se dibujan igual.
- `tipo: "traza"`: una respuesta con su deflexión, o una línea plana (la hipótesis nula).

`scripts/validar-maquinas.mjs` exige que toda traza declare su rol.

## «Reproducir» lo pulsa el visitante

La máquina no arranca sola: «Reproducir» es del visitante y se detiene en el último paso. En el piloto,
tocar la traza B salta al paso donde se dicen las dos cifras (25 % frente a 57 %).

## Reglas por elemento

El validador genérico no expresa «entre 2 y 6 puntos» ni refs en dos sentidos. Esas reglas viven en
`content/reglas.json → ficha` y las lee `scripts/comprobar-fichas.mjs`.

## Una sola ruta

«El recorrido»: las 15 fichas en el orden de DEC §2, con «El recorrido · n de 15» al pie de cada
concepto. Los borradores (14 fichas a la espera de S5) tienen página pero no salen como tarjetas.
