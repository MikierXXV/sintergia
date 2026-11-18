# Decisión: stubs en borrador y comprobaciones propias del sitio

Estado: **tomada en S4** (piloto), 14-11-2026.

## Stubs
Las 14 fichas que no son el piloto existen como stubs para que las 4 familias validen (`exigir_uso`):
`id`, `familia_id`, `orden`, `titulo`, `respaldo` de DEC §2 y textos `"BORRADOR"`. Sin visualización
(el validador da 14 avisos «todavía sin visualización», que son esperables y no bloquean). No hizo
falta desactivar ninguna familia, así que no hay `docs/PENDIENTES.md`. En S5 se reescriben enteras.
`orbitales-de-conciencia` y `percepcion-campo-lattice` llevan `respaldo` 0 (decisión del jefe).

## Comprobaciones que el validador genérico no sabe hacer
`scripts/validar-contenido.mjs` es de la plantilla y no se toca. Lo propio de este sitio va en
`scripts/comprobar-fichas.mjs`, que corre dentro de `npm run validar` y **bloquea** igual:

- C1/C5: tres bloques en toda ficha no borrador; `respaldo` igual a la tabla de DEC §2.
- `se_sabe` ≥ 300 car. en `lo-medido` (el validador solo admite un rango por campo).
- `lo-medido` con al menos una fuente que no sea de Grinberg (P*).
- `fuentes[].ref` existe en INV; C7 (la cita es la asignada y literal); `enlaces[].pieza` existe.
- C6/C8: expresiones prohibidas = error; expresiones a revisar = **aviso** que lista cada aparición.

## Lo que sigue siendo manual
- C2 (condicional en «Lo que propone»), C4 (reservas escritas), C9 (alternativa útil): agente
  `revisor-de-contenido`.
- Los avisos de C6/C8: revisar cada aparición a ojo. En el piloto, «cuántico» solo en la cita de P11
  y «1994» solo como año de P11. Pendiente para S5: el stub `sintergia` se titula «síntesis más
  energía» (aparece «energía»).
- Que S5/S6 (y S1, S10) no se llamen réplicas: el revisor lo cazó en el piloto; no hay regla
  automática. Réplicas del diseño = S2, S3, S8 (DEC §4); los demás van con `tipo: "contexto"`.
- Las cifras de INV con «~» deben conservarlo (el revisor cazó «25 %» por «~25 %»).
