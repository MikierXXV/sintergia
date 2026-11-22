# QA estricta de los 8 reels v3 — estado conocido (deuda)

2026-11-22. Fuente: `reel.mjs --qa-estricta` (`salida-v3/*-comprobaciones.json` de cada reel en `videos-cortos/reel/reels/`).
El humano aprobó los reels tal cual (cambio de plan de t-001207): **no se re-renderizó nada**; esto es lo visto, no un verde.
Verde = Q2 y Q6 en los 8. Todo lo demás queda abierto.

| Reel | Q1 texto | Q3 pausas | Q4 anclas | Q5 cajas | alineado |
|---|---|---|---|---|---|
| epr-en-el-cerebro | rojo f5 («EPR» → «entre las hadas») | verde | rojo | rojo: 11 pares <24 px, 4 fuera de borde, 3 en zona de interfaz | verde |
| lattice | verde | verde | rojo | rojo: 15 / 2 / 1 | verde |
| patron-de-interferencia | verde | verde | rojo | rojo: 3 / 3 / 2 | verde |
| potencial-transferido (piloto) | rojo f6 (cifras) | verde | rojo | rojo: 32 / 0 / 0 | rojo: «mente.» f9 dura 25 ms |
| procesador-central | rojo f7, f8 («Grinberg» → «Greenberg») | verde | rojo | rojo: 13 / 2 / 1 | verde |
| que-es-la-teoria-sintergica | rojo f1-f3 | verde | rojo | rojo: 8 / 3 / 2 | rojo: «sintérgica?» f2 dura 97 ms |
| replicas-del-potencial-transferido | rojo f4, f6 («Backe-Arman», «Radin») | verde | rojo | rojo: 269 / 4 / 3 | verde |
| sintergia | rojo f3, f7, f8 | rojo: pausa 6-7 mide 130 ms (pide 400) | rojo | rojo: 6 / 2 / 1 | verde |

Sin sobre-subtítulo en ninguno (0 cajas sobre el subtítulo).

## Lo comprobado

- **Q4 «sin medir» no era un fallo de los reels, era que el kit no exponía `window.__kit.entradas()`.** Se añadió a
  `videos-cortos/reel/escena/kit-comun/v1/escena-maniquies.js` (barrido a 10 fps + bisección de cuándo empieza a verse cada rótulo).
  Probado solo en `sintergia`: ahora **mide** y da rojo de verdad. 6 de 17 rótulos caen entre 0,3 y 1,9 s *después* del inicio de energía de voz
  (p. ej. «Especulativo» +1,93 s, «Sin unidad» +1,10 s) y 2 *antes* («Solo lo sostiene Grinberg» −1,07 s, «Según Grinberg» −0,32 s): van anclados a palabras
  a mitad de frase, no al arranque tras silencio que exige Q4. Arreglarlo = mover anclas de rótulo en cada `escena-v3.js` y re-renderizar. Pendiente en los otros 7.
  Nota: la copia de `sintergia` se re-montó en `salida-v3/` (5,96 MB); **`public/reels/` no se tocó**.
- **Q1:** el motor oye mal nombres propios y siglas (EPR, Grinberg→Greenberg, Radin, Backe-Arman) y términos ingleses («Psi Encyclopedia»).
  No se ha escuchado el audio ni se ha probado con vocabulario: no hay prueba de que la voz sea correcta, solo la hipótesis. Queda sin verificar.
  `epr-en-el-cerebro` ya estaba apuntado para que el humano compruebe que se entiende «entrelazadas».
- **Q3 `sintergia` 6-7:** el plan lleva 360 ms entre frases, pero la energía de `voz.wav` cae a ~12 dB bajo el pico solo ~130 ms (con un tramo de 3-9 dB de relleno).
  No se ha decidido si es audible; es la voz de una sola toma, no se regrabó.
- **Q5:** el kit de maniquíes ignora `__cajas(t, {sub:true})` y devuelve una caja por figura/pieza; las parejas en cabina (269 pares en `replicas`) suman cajas contiguas a propósito.
  No se han revisado los fotogramas con un subagente, así que no se sabe cuántos son solapes visibles y cuántos falsos positivos del medidor.
- **alineado:** palabras de 25 y 97 ms en `potencial-transferido` («mente.») y `que-es` («sintérgica?»); no se evaluó si se oye comprimido.

## Para cerrarlo (en este orden)

1. Q4: re-anclar rótulos al inicio de frase / tras pausa, o relajar la regla; correr en los 7 reels (3 min cada uno, en cola con `render.lock`).
2. Q1: pasar vocabulario propio (`q1_vocabulario` → `--prompt` de whisper) y escuchar `epr` y `que-es`.
3. Q5: hoja de contacto con subagente por reel; decidir falsos positivos.
4. Q3/alineado: escuchar `sintergia` 33.1 s y los dos finales cortos.
