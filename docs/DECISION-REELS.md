# Decisión: cómo entran los reels en el sitio

Estado: **tomada en S4** (piloto), 14-11-2026.

## Dónde se hacen
En `videos-cortos/reel/reels/sintergia-<id>/` con el kit del rincón (`rincon-kit`), no en este repo.
El kit se amplió de forma aditiva a **v3.14.2** (documentado en su `LEEME.md`):
- corriente `sintergia` en `corrientes.json`, acento oro `#D4A23A` (DEC §7 regla 6: lo de Grinberg
  en oro o neutro, nunca cian);
- `cierre({ sigueme })`: el «Sígueme para más filosofía» estaba escrito a fuego;
- `vacios.mjs` y `web.mjs` aceptan ids `sintergia-*`.
Los reels del rincón no cambian (el valor por defecto es el de antes).

## Cómo llegan al sitio
`npm run importar-reels` (`scripts/importar-reels.mjs`, copia del de mentalista): lee el `-web.mp4`,
los pósters y la transcripción de cada reel de la lista `REELS` y escribe `content/reels.json` y
`public/reels/`. Los reels que aún no existen se listan como «aún no disponibles» y no fallan. La
ficha enlaza su reel con `"reel": "<id>"`.

## Lo aprendido en el reel piloto (para S5-S6)
- **Q1 compara la voz con `voz ?? texto`**: si la voz dice el año en letras, ponlo en `voz` y deja
  las cifras en `texto` (subtítulo).
- **Q1 da falsas alarmas** cuando whisper escribe en cifras lo que se dijo en letras («14,5 metros»).
  En el piloto, la frase 1 queda así: hace falta `q1_excepcion_humano` tras escuchar.
- **Cambiar `atempo` cambia la clave de la caché de voz y vuelve a llamar a Gemini.** Fija el
  ritmo antes de la primera síntesis y pon `voz_congelada: true` en cuanto haya una toma buena.
- **Q4:** todo rótulo empieza en un ancla fiable (inicio de frase o palabra tras ≥120 ms de
  silencio). Si no, muévelo a la palabra siguiente que lo sea.
- **Q5:** un rótulo `tag` de más de ~30 caracteres pasa a dos líneas y sale del escenario seguro
  con los golpes de cámara. La llamada final completa no cabe: «Sígueme: ciencia de la mente».
- Las reservas de INV (agregador, «~», «sin confirmar») deben estar **en la voz** al escribir el
  guion: después solo se pueden poner en pantalla sin gastar otra petición a Gemini.
- Pausas: el piloto tiene 8 pausas > 0,4 s, todas `pausa_antes_ms` deliberadas entre escenas; la
  skill sugiere 1-3. Para los 7 reels del lote, usar 300-400 ms salvo en 2-3 cambios de bloque.
