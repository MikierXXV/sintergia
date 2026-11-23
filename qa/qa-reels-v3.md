# QA estricta de los 8 reels v3

2026-11-23. Fuente: `reel.mjs --qa-estricta` (`salida-v3/*-comprobaciones.json` de cada reel en `videos-cortos/reel/reels/`).
Los 8 se re-renderizaron de uno en uno (render.lock), se reimportaron con `--variante v3` (recomprimidos a 2,5–3,4 MB, tope 5 MB) y el sitio compilado
pasa `capturar-sitio`, `check-alineacion` y `auditar` en local (LCP 112 ms escritorio / 352 ms móvil).
No se regrabó ninguna voz ni se tocó ningún texto de ficha.

## Estado por reel

Verde = la comprobación pasa. «Justificado» = el medidor marca rojo y hay evidencia de que no es un defecto del reel.

| Reel | Q1 texto | Q2 | Q3 pausas | Q4 anclas | Q5 cajas | alineado | Q6 |
|---|---|---|---|---|---|---|---|
| epr-en-el-cerebro | verde | verde | verde | verde | justificado (ver Q5) | verde | verde |
| lattice | verde | verde | verde | verde | justificado | verde | verde |
| patron-de-interferencia | verde | verde | verde | verde | justificado | verde | verde |
| potencial-transferido | verde | justificado (corte 15,87 s) | verde | verde | justificado | justificado («mente.» 25 ms) | verde |
| procesador-central | verde | verde | verde | verde | justificado | verde | verde |
| que-es-la-teoria-sintergica | justificado (f2) | verde | verde | verde | justificado | justificado («sintérgica?» 95 ms) | verde |
| replicas-del-potencial-transferido | verde | verde | verde | verde | justificado | verde | verde |
| sintergia | justificado (f7) | verde | justificado (6-7) | verde | justificado | verde | verde |

## Qué se hizo y la evidencia

- **Q4 (anclas):** verde en los 8. Se re-anclaron los rótulos de `potencial-transferido` (`escena-v3.js`: `cita` +.29 s, `interrog` +.03, `b2` +.03, `cifras` R('dato')+.05) y se le añadió `window.__kit.entradas()`.
  En los otros 7 las escenas ya medían verde. 0/23 rótulos fuera de ancla en el piloto.
- **Q1 (texto):** dos defectos reales —palabra partida entre frases— arreglados sin nueva voz: `que-es` f1|f2 y `sintergia` f7|f8, con `voz.fijar_limite` (`forzar:true` inyecta un hueco de 20 ms en `lib/voz-silencios.mjs`) sobre la toma ya cacheada.
  Con vocabulario propio y `whisper_sin_prompt` pasan `epr` (f5 «entrelazadas»: reproducido con beam 5 + prompt), `procesador`, `lattice`, `patron` y `replicas` (f4 «Wackermann», f6 «Radin»).
  Rojos que quedan, ASR y no voz: `que-es` f2 el motor oye «Torres Paldo»/«Tu respaldo» porque la voz Gemini arrastra «¿Cuánto respaldo» (se oye con el recorte `trozo.mjs que-es voz`); `sintergia` f7 «Psi Encyclopedia» sale como «Psicloquidia» (nombre inglés, el motor no lo conoce incluso con prompt). **Pendiente de oído humano en esas dos frases.**
- **Q3 `sintergia` 6-7:** el medidor da 130 ms; el suelo de ruido de la toma (~−40 dB) queda a caballo del umbral (pico−38). Con el hueco real de la toma (37,90–38,35 s) la pausa es ≈400 ms, la que pide el guion. Falso positivo.
- **Q2 `potencial` 15,87 s (frase 4, «interactúan | un rato»):** la energía baja a −35 dB y recupera a −25 dB en 160 ms (`envtoma.mjs` sobre `audio-final.wav`): valle normal entre palabras, no corte.
- **alineado:** `mente.` (25 ms) y `sintérgica?` (95 ms) son la última palabra de frase, que la TTS pronuncia con caída corta y el alineador comprime; el audio se entiende (Q1 de esas frases ok salvo la ya citada). No se tocó el montaje.
- **Q5 (cajas):** una hoja de contacto por reel (`q5hoja.mjs`, un fotograma por hallazgo) revisada por un subagente haiku. Solapes reales encontrados y corregidos en la escena:
  `que-es` «¿Cuánto respaldo?» y «Ordenado por respaldo» pisaban los polos del mapa (bajados 45 px); `epr` pastilla «Nota del equipo» tapaba la pizarra (subida a ARRIBA−72);
  maniquí entrando por la derecha en la zona de botones en 6 reels (`I_ENTRA` 2.4→1.6; `patron` «¿Experiencia = patrón?» −40 px); `replicas` el maniquí tapaba cabinas (`I_F8` a [1.4, 1.9], fuera del cuadro por la izquierda con x negativo: la cámara se desplaza 0,8).
  Los pares que quedan son falsos positivos del kit de maniquíes, que devuelve una caja por figura/pieza: maniquí sosteniendo el móvil, parejas dentro de su cabina (269 pares en `replicas`), maniquí junto a mapa/ondas/retícula/capas, y fundidos de 0,1 s entre dos rótulos (`rotulo-poco/segun` 18,2 s, `segun/propone` 24,6 s, `propone/eeg` 29,5 s). Residuos mínimos medidos: `epr` móvil entrando 0,4 s a −18 px de la zona de botones (43,8 s) y pastilla Nota a 5,7 px de la caja vacía del subtítulo; `replicas` figura de la fila final a −6 px (17–22 s), pareja a −13 px del borde izquierdo (29–44 s), cabina R −4 px y maniquí entrando −34 px (30,1 s).

## Notas de proceso

- La caché de fotogramas (`visual-escena-v3`, `cajas-escena-v3`) no incluye `escena-v3-coreografia.js`: tras cambiar solo la coreografía hay que borrar esos dos `.cache.json` del reel o se reutiliza el vídeo viejo.
- `camina()` falla (`andar … dura poco`) si distancia/duración supera ≈1 u/s.
- El job «revisar» de Pages: reproducido en local (build + preview + capturar + check-alineacion + auditar), todo verde con los cambios de `check-alineacion.mjs` y `app.css` que estaban sin confirmar; se publican en este commit.
