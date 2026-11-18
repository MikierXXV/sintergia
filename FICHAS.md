# FICHAS DE EJECUCIÓN · Sintergia (S4 piloto, S5 lote)

Cada ficha dice qué secciones de `DECISIONES.md` (DEC) leer. **Solo esas;** lo demás, con Grep. Contenido: `investigacion/INVESTIGACION.md` (INV), también con Grep por código (P11, S8…) en vez de leerlo entero.

**Reglas comunes a todas las fichas:**
- RAM justa: un solo render, build o navegador a la vez (antes, `Get-Process` para ver si hay otro). Salidas de build, render y logs siempre recortadas (`| tail -n 30`).
- Capturas y fotogramas los mira un subagente (sonnet o haiku) que devuelve el veredicto en texto, a partir de una hoja de contacto.
- No tocar nunca: `investigacion/`, `DECISIONES.md` (si algo no encaja, se pregunta a Sócrates), las salidas publicadas de otros reels en `videos-cortos`, ni nada de `mentalista`, `plantilla-sitio` o el rincón (solo lectura).
- Sin push ni publicación: eso es del humano tras la PARADA.
- Reclamar ficheros antes de tocar varios (`reclamar_ficheros`) y soltarlos al acabar.

---

## S4 · Piloto: sitio + `potencial-transferido` + su reel

**Leer:** DEC §1, §3, §4, §5, §6 (filas `secuencia` y presupuesto 3D), §7, §8. Skills: `nuevo-sitio`, `modelo-de-contenido`, `sistema-visual`, `mecanica-de-visualizacion`, `reel-divulgativo` (en videos-cortos).

**Objetivo:** el sitio arranca con la plantilla y el modelo de contenido de DEC §3, tiene las 4 familias y la paleta, y una ficha completa (`potencial-transferido`) con su visualización `secuencia` y su reel, que pasa toda la QA de DEC §8. Es la prueba del modelo: lo que falle aquí se corrige antes del lote.

### S4a · Esqueleto
1. `crear.mjs` **no escribe en una carpeta que ya existe**, y `C:\Users\migue\sintergia` ya tiene `investigacion/` y estos `.md`. Crea el sitio en tu scratchpad:
   `node C:/Users/migue/plantilla-sitio/crear.mjs <scratchpad>/sintergia --titulo "Sintergia" --descripcion "Los conceptos de Jacobo Grinberg y lo que se sabe de ellos"`
2. Copia su contenido a `C:\Users\migue\sintergia` **sin sobrescribir** (`cp -rn`). Comprueba antes que no hay colisiones de nombre con `investigacion/`, `DECISIONES.md` o `FICHAS.md`.
3. `npm install && npm run validar` en verde **antes** de tocar nada (si falla aquí, es la plantilla: avisa a Sócrates).
4. Borra las piezas de ejemplo (`ejemplo-eje.json`, `ejemplo-con-cita.json`): son de la plantilla recién copiada, no del proyecto.

### S4b · Modelo de contenido
1. `content/schema/pieza.schema.json`: quita `desarrollo`; añade `respaldo` (entero 0-4, opcional en el schema por el marco: DEC §3), `propone`, `se_sabe`, `disputa` (obligatorios), `cita.traduccion`, `fuentes[].ref|tipo|anio|nota`, `reel` (opcional). Exactamente como DEC §3.
2. `content/reglas.json`: longitudes de DEC §3, `citas.atribuciones: ["directa"]`, `presupuesto_3d: 2`, `idiomas: ["es"]`. Si el validador no sabe exigir «al menos una fuente que no sea de Grinberg en `lo-medido`» ni la longitud de `se_sabe` por familia, **no toques el guion genérico**: anótalo como comprobación manual de C3 y díselo a Sócrates.
3. `content/es/familias.json`: las 4 familias de DEC §2 con su escenografía de DEC §5.
4. Las 4 familias necesitan al menos una pieza para validar (`exigir_uso`). Para las otras 14 fichas crea **stubs** con `id`, `familia_id`, `orden`, `titulo`, `respaldo` de DEC §2 y textos de relleno marcados `"BORRADOR"`; en S5 se reescriben enteros. Si el validador rechaza stubs por longitud, desactiva temporalmente esa familia en `familias.json` y apúntalo en `docs/PENDIENTES.md`.

### S4c · Paleta y componentes comunes
1. Tokens de DEC §5 en `design/tokens.json`. `npm run validar:contraste -- --sugerir`; acepta solo cambios de luminosidad.
2. Componente de cabecera de ficha: badge de respaldo (escala gris de 0-4 segmentos + rótulo de DEC §4) y los cuatro bloques con sus rótulos fijos.
3. Pie fijo de visualización «Esquema de una idea, no de un fenómeno medido» para `el-campo` y `la-conciencia` (se ve en S5, pero el componente va aquí).
4. Pie global del sitio (DEC §4).

### S4d · Ficha y visualización
1. `content/es/piezas/potencial-transferido.json` completa, con INV A2, P10, P11 y las reservas: 25 % (P11) frente a ~57 % de 14 sujetos (P10) presentados como discrepancia, el DOI discrepante, y S8 como punto de la disputa (sin confirmar en el original). `respaldo: 2`. Cita: el propósito declarado de P11 («to verify if the brain has a macroscopic quantum component»), con traducción, `autor` con los cuatro firmantes y `fuente` «P11, resumen» (DEC §3). Respeta la frontera de DEC §4: las réplicas en una frase con enlace; nada de EPR ni Bell aquí.
2. Mecánica `src/vis/mecanicas/secuencia.ts` (svg) y su registro: 6 pasos de DEC §6, avance con botón, sin autoplay; preparar también el modo `lista` (lo usará `vision-extraocular`).
3. `alternativa` y `resolucion` escritas.

### S4e · Reel `potencial-transferido`
1. En `C:/Users/migue/videos-cortos/reel/reels/sintergia-potencial-transferido/`, siguiendo `reel-divulgativo` y DEC §7 (reglas 1-7 por encima de la skill). Parte del kit `rincon-kit` en vez de escribir la escena desde cero.
2. Ficha del reel antes del código: guion, `guion-fuentes.md` con códigos INV, escenas, portada, criterios.
3. Render en primer plano, de uno en uno. Máximo 2 peticiones a Gemini; si da 429, para y apúntalo en `pasos_humano`.
4. Copia `mentalista/scripts/importar-reels.mjs` a `sintergia/scripts/`, adáptalo a las rutas de este proyecto e importa el reel a `content/reels.json` + `public/reels/`. Que la ficha lo muestre tras la visualización.

### Qué no tocar (S4)
`scripts/validar-contenido.mjs`, `capturar-sitio.mjs` y `auditar.mjs` (genéricos de la plantilla), `src/vis/lenguaje.ts`, `escena3d.ts`, el flujo de despliegue. El `lib/` de videos-cortos.

### Criterios de aceptación (S4)
- `npm run validar`, `npm run build`, `npm run capturar` y `npm run auditar` en verde (con los stubs marcados).
- La ficha piloto pasa C1-C10, V1-V8 y R1-R3 de DEC §8. Informe de `revisor-de-contenido` sin problemas abiertos.
- El reel cumple la QA de la skill y tiene hoja de escucha.
- `docs/` con un fichero por decisión estructural tomada al ejecutar (skill `nuevo-sitio` paso 6), incluidas las comprobaciones que quedaron manuales.

### Cómo comprobarlo
1. Comandos de arriba, de uno en uno, con la salida recortada.
2. Hoja de contacto de capturas (ficha piloto, 2 temas × 2 anchos) revisada por subagente: V2, V5, V7.
3. Grep de C6 y C8 sobre `content/`.
4. Hoja de escucha y hoja de fotogramas del reel → **PARADA del humano** (lo pide Sócrates). Sin visto bueno no empieza S5.

---

## S4-E · Rehacer la presentación del piloto al modo de software-engineer

**Por qué:** el humano (15-11): «debería mostrarse el contenido más como en el proyecto de software-engineer». La decisión está en DEC §10 y las reglas en DEC §1, §3, §5, §6, §7 y §8 (V9-V11, C11), todas con la marca «S4-D».
**Leer:** DEC §1, §3, §5, §6 (encabezado S4-D y «Máquina del piloto») y §7. Skills: `modelo-de-contenido`, `mecanica-de-visualizacion`, `sistema-visual`, `escenografia`.
**En software-engineer (SE), solo lectura:** `C:\Users\migue\software-engineer`. Se copia y no se escribe nunca allí.
**Antes de empezar:** que el humano haya hecho la PARADA de escucha de S4 o la haya aplazado. El reel no se toca en S4-E, pero su entrada en `reels.json` sí cambia.

### Qué se reutiliza tal cual desde SE (copiar y ajustar los imports)
- **Motor y mando de las máquinas:**
  - `src/vis/controles.ts`
  - `src/vis/motor.ts`
  - `src/vis/montaje.ts`
  - `src/vis/mecanicas/diagrama.ts`
  - `src/vis/mecanicas/marco.ts`

  Sus `lenguaje.ts` y el de Sintergia exponen lo mismo salvo `proporcionMovil`: se **añade** esa función al `lenguaje.ts` de Sintergia, copiada de SE. Es la única excepción a la regla de no tocar `lenguaje.ts` y queda anotada en `docs/`.
- **Fuentes y escala:**
  - `public/fuentes/` (Inter, Newsreader y sus licencias OFL);
  - de `design/tokens.css`, el bloque `@font-face`, la escala `--t-*`, las alturas, los radios y `--vis-proporcion-movil`. La **paleta no se toca**: es la de DEC §5.
- **Validación:**
  - `content/schema/ruta.schema.json`;
  - `scripts/validar-maquinas.mjs`, con el par de idiomas desactivado porque aquí solo hay español;
  - `scripts/probar-maquinas.mjs`, si no necesita navegador. Si lo necesita, se deja para cuando haya RAM.
- **Página de concepto:** de `src/main.ts`, las funciones `activarIndice`, `pagerRuta`, `tarjeta` y `soltarMaquina`, y el esqueleto de `pintarConcepto`. De `src/app/rutas.ts`, el enrutado por fragmento.

### Qué se adapta
- **`src/app/bloques.ts` → `src/app/bloques.ts` de Sintergia.**
  - Secciones, en el orden de DEC §3: propone (pasos + cita), analogía editorial con aviso, se sabe (hallazgos + chips de ref), disputa (caja con aviso, nunca `<details>`), detalles (plegados), para recordar.
  - Fuera: código, «cuándo sí/no» y ejemplo.
- **`content/schema/concepto.schema.json`:** el de SE, con los campos de DEC §3: `respaldo`, `propone`, `se_sabe`, `disputa`, `cita`, `fuentes` tipadas y `enlaces`. Fuera: `video`, `sinonimos` y `tambien_en`.
- **`content/reglas.json` y `validar-contenido.mjs`:**
  - las longitudes por elemento y el tope de 2400 car. de DEC §3;
  - las refs en los dos sentidos;
  - el primer `puntos_clave` empieza por el rótulo del `respaldo`;
  - `analogia.origen` solo puede ser `editorial`.

  Este cambio de schema y reglas **lo autoriza esta ficha**. La regla de S5 («no tocar schema») vale a partir de que S4-E se cierre.
- **`src/estilos/`:**
  - de `app.css` de SE, los bloques de concepto, cabecera, tarjetas, toc y pager;
  - de `visualizacion.css`, el marco de la máquina;
  - de `ficha.css`, la insignia de respaldo y el reel en dos columnas;
  - `escenografia.css`, solo para la portada.
- **`src/main.ts`:**
  - la portada con tarjetas por familia (DEC §5), la ruta «El recorrido» generada desde el `orden` de familias y fichas, y la página `#/limites`;
  - la redirección de `#<id>` a `#/c/<id>`.
- **Contenido del piloto:** `content/es/piezas/potencial-transferido.json` → `content/es/conceptos/potencial-transferido.json` y `content/es/maquinas/potencial-transferido.json`.
  - **El texto se reparte, no se reescribe:**
    - los 6 pasos de la `secuencia` pasan a `propone.pasos` y a los pasos de la máquina;
    - cada frase de `se_sabe` y `disputa` pasa a ser un hallazgo o un punto con las refs que ya tenía;
    - `idea` sale de `resolucion`.
  - **Una frase nueva solo con una fuente que ya esté en la ficha.**
  - Máquina: la de DEC §6, «Máquina del piloto».
- **Los 14 stubs:** pasan al formato nuevo con `BORRADOR`, con lo mínimo para validar. No se escribe contenido de S5.
- **`content/reels.json`:** `pieza` → `concepto`, y `src/app/reels.ts` a juego.

### Qué no se toca
- `investigacion/`, el guion, el audio y el vídeo del reel, y `public/reels/`.
- Los literales de las citas, el reparto de citas de DEC §3 y las prohibiciones de DEC §4.
- `escena3d.ts` y el flujo de despliegue, y `capturar-sitio.mjs` y `auditar.mjs`, salvo las rutas de las páginas que recorren: pasan a `#/` y `#/c/potencial-transferido`.
- Todo `software-engineer`, `mentalista` y `plantilla-sitio`.

### Criterios de aceptación
- `npm run validar` y `npm run build` en verde.
- Ficha piloto: C1-C11 y V1-V11 de DEC §8.
- `revisor-de-contenido`, con el concepto piloto como entrada, sin problemas abiertos. Sobre todo:
  - que ningún paso, punto ni rótulo nuevo afirme en indicativo una idea de Grinberg;
  - que no quede ninguna reserva solo en un bloque plegado.
- Antes y después, en la misma hoja de contacto (antes: `qa/capturas/vis-*`; después: las capturas nuevas):
  - primer pantallazo a 1280 y a 360, en los dos temas;
  - página entera a 1280.

  La revisa un subagente, con el veredicto de V7, V9 y V10.
- `qa/VISIONADO-PILOTO.html` actualizado con las capturas nuevas, la tabla de DEC §10 y el enlace `#/c/potencial-transferido`.

### Cómo comprobarlo
1. **Con RAM disponible** (`Get-Process` antes: ningún otro build, render ni navegador): `npm run validar | tail -n 30` → `npm run build | tail -n 30` → `npx vite preview --port 4173` → `npm run capturar` → `npm run auditar`. De uno en uno.
2. **Grep de C6 y C8** sobre `content/es/conceptos` y `content/es/maquinas`.
3. **Teclado sobre la máquina:** flechas, espacio y tab hasta un nodo, comprobado con `probar-maquinas.mjs` o a mano en el informe.
4. **PARADA:** el humano mira `VISIONADO-PILOTO.html` antes de S5. El formato que apruebe es el que copia S5.

---

## S5 · Lote: las 14 fichas restantes y los 7 reels v3 (rehecho en S5-D, 2026-11-18)

> **Sustituye a la versión anterior de S5**, que daba por hecho el reel v2 y la ficha de §3. Ahora manda: DEC §10 (formato de software-engineer), §11.1-11.3 (portada, tema oscuro, ficha con el reel lo primero) y §11.4 (reel v3 con maniquíes), elegido por el humano el 18-11 (DEC §7).

### Punto de partida (comprobado el 18-11 sobre los ficheros, sin build)
- **Sitio:** las 15 fichas existen en `content/es/conceptos/` y `content/es/maquinas/`, ninguna con `BORRADOR`. Las mecánicas que pedía S5 ya están en `src/vis/mecanicas/` (`balance`, `eje`, `ondas`, `reticula-3d`, `mapa-respaldo`; `diagrama` cubre `dos-figuras`, `capas` y `secuencia`).
- **§11.1-11.3, ya en el código:** `kicker_familia` en `main.ts`, `aria-describedby` y transcripción `.oculto` en `src/app/bloques.ts`, y `familias.json` sin `tono` ni `velo`.
- **Reels del lote:** los 7 tienen `guion-v2.json` (9 frases, `pendiente_voz: true`, sin voz ni render), `guion-fuentes.md` y un `FICHA.md` con plan de objetos. **Ese plan queda anulado**: lo sustituye el mapa frase → acción de abajo.
- **Piloto:** el v3 está en `videos-cortos/reel/reels/sintergia-potencial-transferido/salida-v3/sintergia-potencial-transferido-v3.mp4` (9,4 MB). Pero `public/reels/potencial-transferido.mp4` sigue siendo el v1 del 14-11 (3,2 MB), y `scripts/importar-reels.mjs` solo lee `salida/<carpeta>.mp4`.
- **Conclusión:** en el sitio, S5 ya no es escribir sino **comprobar** cada tanda con §8 + §11.6. El trabajo de verdad son los 7 reels.

**Leer siempre:** DEC §2 («Fronteras entre fichas vecinas»), §4, §7, §8, §11.3, §11.4 y §11.6. Para los reels: `FICHA-v3.md` del piloto y la skill `reel-divulgativo`.
**Qué no tocar en todo S5:**
- lo de S4 «Qué no tocar»;
- el concepto, la máquina y todos los ficheros del reel `sintergia-potencial-transferido` (también `escena-v3*.js`, `comprobar-v3.mjs` y `salida-v3/`): se **copian**, no se editan;
- `kit-comun/v1/maniqui-articulado.js`, salvo gestos nuevos **añadidos** (aditivo, sin cambiar los que hay);
- el schema y `reglas.json`: si hay que cambiarlos, se pregunta a Sócrates;
- el **texto** de los guiones, salvo lo que dice cada reel abajo. Las anclas del mapa dependen de esas palabras.

### Qué se reutiliza del piloto v3 y qué se hace nuevo
Rutas relativas a `C:/Users/migue/videos-cortos/reel/`.

| Pieza | Origen | Uso en el lote |
|---|---|---|
| Maniquí articulado | `escena/kit-comun/v1/maniqui-articulado.js` | Tal cual: `crearManiqui`, 13 gestos de catálogo y los extra `sostener`, `cruzar-brazos`, `enseñar` y `mirar`. Si falta un gesto, se **añade** y se prueba con `probar-maniqui.mjs`. |
| Tiempo y curvas | `escena/kit-comun/v1/tiempo.js` | Tal cual. |
| Andamio de escena | `reels/sintergia-potencial-transferido/escena-v3.js` (renderer 1080×1920, cámara, luces, fondo `#0E1220`, halos ≤ 20 %, franjas ARRIBA 568, CENTRO 1330 y ABAJO 1500, etiquetas, `window.__cajas`, `presencia`, `ventana`, CTA con móvil) | **Nuevo, por copia:** `escena/kit-comun/v1/escena-maniquies.js`, con el contrato `montarEscena({ guion, crearFiguras, crearAtrezo, programar, halos })`. El piloto conserva su `escena-v3.js` y no se toca. |
| Atrezo del piloto | El mismo `escena-v3.js`: cabina, taburete, pantalla de destellos, regla, balanza, barra con contorno del 100 %, fila de N, hojas, bocadillos y móvil | **Nuevo, por copia:** `escena/kit-comun/v1/atrezo-sintergia.js`, con cada pieza como `crearX(opciones) → { obj, pintar(t) }`. |
| Atrezo nuevo | — | En el mismo fichero: `pizarra` (texto en dos columnas), `eje` (dos polos sin escala), `racimo` (puntos), `reticula` (puntos y aristas **discontinuas**, oro), `ondas` (dos trenes y franjas; modo `fisica` en neutro y modo `propuesta` en oro discontinuo), `capas` (anillos concéntricos con el centro vacío), `lupa`, `mapa` (5 niveles de respaldo en el suelo) y `tarjeta` (ficha pequeña). |
| Coreografía | `escena-v3-coreografia.js` (`programar(R, F)`, `POS`) y `escena-v3-figuras.js` | Mismo formato, **uno por reel**: `escena-v3-coreografia.js`, `escena-v3-figuras.js` y un `escena-v3.js` corto que llama a `montarEscena`. |
| QA sin navegador | `comprobar-v3.mjs` | **Nuevo, por copia:** `escena/kit-comun/v1/comprobar-maniquies.mjs <carpeta-del-reel>`. Hace R-v3-1 a R-v3-5, lee las exenciones de R-v3-2 de un `EXENCIONES` exportado por la coreografía y escribe `trabajo-v3/qa-v3-tabla.md`. |
| Guion | `guion-v2.json` de cada reel | Copia en `guion-v3.json` con `"escena": "escena-v3"`, el mismo texto y, en cada frase con cifras, un campo `voz` con la cifra en palabras (como la frase 1 de `sintergia`). |
| Ficha del reel | `FICHA-v3.md` del piloto | Mismo formato. El `FICHA.md` viejo se queda, con una línea arriba: «Plan de escena sustituido por FICHA-v3.md». |
| Importador | `sintergia/scripts/importar-reels.mjs` | Opción nueva `--variante v3`, que lee `salida-v3/<carpeta>-v3.mp4` y su portada, **recomprime** a ≤ 5 MB (H.264, CRF) y escribe con el nombre de siempre en `public/reels/`. Sin la opción, se comporta igual que ahora. |

### Cadena de cada reel (igual para los 7)
1. `guion-v3.json` y `FICHA-v3.md` con el mapa de abajo, **antes de la voz**.
2. **Voz:** 1 petición a Gemini, 2 como mucho. En cuanto haya una toma buena, `voz_congelada: true`. Si da 429, se para y se apunta en `pasos_humano`.
3. Tabla «frase | ancla | gesto | maniquí» con las anclas reales. Coreografía, figuras y atrezo. `comprobar-maniquies.mjs` en verde **antes** de renderizar.
4. Render en primer plano, **solo**: antes, `Get-Process` para ver que no hay otro render, build ni navegador. Salida recortada.
5. Hoja de contacto con 9 fotogramas, uno por frase en su ancla, que revisa un subagente (R-v3-8). QA de `reel-divulgativo`. Hoja de escucha y visionado.
6. **PARADA del humano.** Después, `importar-reels.mjs --variante v3` y comprobación de la ficha (V14).

### Mapa frase → acción de los 7 reels
**Leyenda:**
- `I` = investigador con tablilla. `A`/`B` = la pareja del piloto. `L` = lector. `O` = observador.
- Entre paréntesis, la palabra ancla.
- Las ideas de Grinberg van en oro discontinuo con «según Grinberg» (o «según los autores») visible mientras estén en plano. Los datos van en neutro, y lo que falta o falla en coral. **Nada en cian.**

Reglas comunes de los 7 (DEC §11.4, D4 y «Regla de reparto»):
- nada sale de una cabeza;
- tras separarse, nada une a A con B;
- ningún maniquí sentado en un centro, meditando o con halo;
- en la frase 9, el maniquí principal saca el móvil con el título del reel (`enseñar`) y hace `saludar` en (`sígueme`).

#### `replicas-del-potencial-transferido` (tanda 1)
1. **Tres parejas pequeñas** entran en fila con su investigador (`andar`). En (`repetir`) cada pareja hace `sentarse` en su cabina. Rótulo «2003-2008».
2. I, en primer plano, hace `mirar-alterno` entre las tres cabinas y `encogerse` en (`replicó`).
3. En (`mixta`), I pone en la balanza dos pesos pequeños y un platillo vacío, y la balanza oscila. `negar` en (`negativo`) y `pensar` en (`disputa`). Rótulo «Uno negativo» en coral.
4. En (`Wackermann`) se adelanta la cabina 1. En (`diecisiete`) aparece una fila de 17 parejas diminutas. En (`correlaciones`), la traza oro de B parpadea con «según los autores». En (`mecanismo`), su investigador hace `encogerse`. Rótulo «Sin mecanismo biofísico conocido».
5. En (`Standish`), la cabina 2: traza de B oro discontinua a media altura, y su investigador hace `asentir` despacio. En (`Ambach`), la cabina 3: traza plana, y su investigador hace `negar`. Rótulos «débil o parcial» y «negativa» (coral).
6. En (`Radin`), una cuarta cabina **aparte**, tras una línea discontinua. En (`trece`), una fila de 13 parejas mini con 3 encendidas. En (`emparentado`), I hace `señalar` a la línea. Rótulo «Emparentado, no réplica».
7. En (`mismos`), un investigador de tablilla marcada `andar` de la cabina 1 a la 2. En (`independientes`), I hace `negar`. **Sin nombres de autores en pantalla**: la frase no dice cuáles.
8. En (`cuáles`), I hace `señalar` cabina por cabina. En (`cuentan`) aparta la de Radin (`andar`). En (`dicen`) hace `pensar` junto a la balanza, que no se asienta.
9. CTA con I.
- **Texto:** la frase 1 lleva `voz` («Entre dos mil tres y dos mil ocho…»).
- **Exención R-v3-2:** ninguna.

#### `epr-en-el-cerebro` (tanda 1)
1. A y B en cabinas separadas, como en el plano del piloto. I hace `sostener` una hoja «1994». En (`paradoja`), en la pizarra: «EPR» y dos partículas neutras.
2. I hace `mirar-alterno` entre las cabinas A y B y `encogerse` en (`entrelazamiento`).
3. `negar` en (`no`). En (`Bell`), `señalar` a la pizarra: «Prueba de Bell: sin hacer» (coral). `pensar` en (`especulativo`).
4. En (`distinguir`), la pizarra se parte en dos columnas, «clásica» y «no local», en neutro. I hace `mirar-alterno` entre ellas.
5. En (`correlación`), traza continua neutra sobre A y traza oro discontinua sobre B, con «según los autores». En (`entrelazadas`), las partículas de la pizarra. **Ninguna línea entre A y B ni entre las partículas y los maniquíes.**
6. I hace `sostener` una hoja «2016» y `asentir` en (`admite`). En (`distingue`), las dos columnas se quedan con el mismo «?» e I hace `encogerse`.
7. En (`existe`), la traza oro de B parpadea sin fijarse. En (`disputa`), la balanza oscila e I hace `pensar`.
8. En (`analogía`) se apaga la pizarra. En (`explicar`), I hace `señalar` a la cabina B y luego `pensar`.
9. CTA con I.
- **Texto:** la frase 1 lleva `voz` para «1994».

#### `sintergia` (tanda 2)
1. I hace `sostener` una hoja «1981» y `andar` hasta el eje, vacío y sin marcas. En (`sintergia`) aparece el rótulo oro «sintergia» sobre el eje.
2. En (`medir`), I acerca la regla al eje: no hay marcas que leer. `mirar-alterno`.
3. `negar` en (`medirla`) y baja la regla. `encogerse` en (`especulativo`). Rótulo «Sin forma de medirla» (coral).
4. En (`síntesis`) y (`energía`) se rotulan los dos polos (neutro). En (`organización`) aparece un racimo oro discontinuo, «según Grinberg», e I hace `señalar`. **Ninguna persona «más sintérgica».**
5. En (`unidad`), I coloca dos racimos y hace `mirar-alterno` entre ellos. En (`menos`), `encogerse`. Rótulo «Sin unidad».
6. En (`fuentes`), una pila de hojas, todas con la misma marca «G». En (`independientes`), un hueco vacío en la balda, e I hace `negar`.
7. En (`Psi`), una hoja «Psi Encyclopedia». En (`atención`), una fila de 4 maniquíes pequeños pasa de largo con `andar`, sin pararse.
8. En (`medible`), I vuelve a acercar la regla al eje y hace `pensar`.
9. CTA con I.
- **Texto:** ya tiene `voz` en la frase 1. No cambia nada más.

#### `patron-de-interferencia` (tanda 2)
1. O, de pie ante una cubeta. En (`cruzan`), dos trenes de ondas en **neutro** (es física). En (`patrón`), las franjas. O hace `asentir`.
2. O mira las franjas y luego a cámara. `pensar` en (`experiencia`).
3. En (`analogía`), las franjas se encierran en un marco «analogía». Entra I y hace `negar` en (`modelo`). Rótulo «No es un modelo» (coral).
4. Dos trenes **oro discontinuos**, «campo neuronal» y «lattice», con «según Grinberg». **Nacen de los bordes del plano, no de O.** I hace `señalar`.
5. Las franjas oro aparecen **junto a** O, nunca sobre su cabeza. O hace `mirar-alterno` entre las franjas y la cámara. Rótulo «sería, según Grinberg».
6. I hace `sostener` una hoja en blanco. `negar` en (`ecuaciones`) y `encogerse` en (`predicciones`). Rótulo «Sin ecuaciones ni predicciones» (coral).
7. Los trenes oro se atenúan. I hace `señalar` en (`campo`) y en (`lattice`), y `negar` en (`prueba`).
8. En (`predecir`), I hace `pensar` con la hoja en blanco, y O mira la hoja.
9. CTA con O.
- **Texto:** sin cifras. No cambia.

#### `lattice` (tanda 3)
1. I hace `sostener` una hoja «1983». En (`lattice`), una retícula oro discontinua al fondo, con «según Grinberg».
2. `mirar-alterno` alrededor y `encogerse` en (`espacio`).
3. `negar` en (`prueba`). Rótulo «Sin prueba» (coral). `pensar` en (`especulativo`).
4. En (`campo`), una mancha oro discontinua rotulada, junto a la retícula y sin salir de nadie. En (`retícula`), I hace `señalar`.
5. En (`cristalografía`), I hace `sostener` un cristal pequeño (red de puntos en neutro: es real). En (`rayos`), rótulo «escala: rayos X», **sin cifra**.
6. En (`hecha`), I acerca la lupa a un nudo: está vacío. `encogerse` en (`detectarla`). Rótulo «Sin detector» (coral).
7. Balanza con los platillos vacíos y quieta. I hace `mirar-alterno` y `negar` en (`independientes`).
8. En (`sabría`), I anda con la lupa entre los nudos y hace `pensar`.
9. CTA con I.
- **Texto:** la frase 1 lleva `voz` para «1983».
- **Exención R-v3-2:** la balanza no es un maniquí, así que no cuenta. Ninguna.

#### `procesador-central` (tanda 4)
1. I hace `sostener` una hoja «1983». En (`procesador`), capas concéntricas oro discontinuas con el **centro vacío**, con «según Grinberg». **I siempre fuera del anillo exterior.**
2. Los anillos exteriores cambian de forma y el centro no. I hace `mirar-alterno` entre un anillo y el centro y `pensar` en (`permanece`).
3. `negar` en (`comprobar`). Rótulos «No comprobable» (coral) y «Tesis filosófica».
4. En (`niveles`), los anillos se encienden uno a uno, mientras I hace `andar` por fuera y `señalar` cada uno.
5. En (`centro`), el punto central se marca «estaría» (oro discontinuo). I hace `señalar` desde fuera. **Prohibido cualquier maniquí dentro.**
6. Tablilla de I en blanco. En (`confirmaría`), `mirar-alterno` entre dos casillas vacías, «confirma» y «refuta». `encogerse` en (`razón`).
7. En (`antigua`), una pila de libros en neutro, sin símbolos. I hace `asentir`.
8. En (`prueba`), `pensar`, con la tablilla aún en blanco.
9. CTA con I.
- **Texto:** la frase 1 lleva `voz` para «1983».

#### `que-es-la-teoria-sintergica` (tanda 4, la última)
1. L entra con `andar` hasta el mapa: 5 niveles en el suelo, de «medido» a «postulado». Rótulo «1981-1997». **Ningún maniquí representa a Grinberg** (no es un retrato).
2. `mirar-alterno` a lo largo del mapa y `encogerse` en (`respaldo`).
3. En (`establecida`), el nivel «establecido» se queda vacío y L hace `negar`. En (`medido`), L va al nivel 2 y hace `señalar`. `pensar` en (`disputa`).
4. L anda al extremo «postulado». En (`campo`), una onda oro discontinua. En (`lattice`), una retícula oro discontinua. `señalar`, con «según Grinberg».
5. Franjas oro en (`interferencia`). `negar` en (`comprobado`).
6. L vuelve al nivel «medido». En (`personas`), dos parejas mini en cabinas, reutilizadas. En (`ochenta`) y (`noventa`), los rótulos «1987» y «1994».
7. En (`mixtas`), una balanza pequeña oscila bajo la pareja 2. En (`independientes`), L se gira hacia el extremo «postulado», donde no hay nada. `encogerse`.
8. En (`ordena`), tarjetas pequeñas caen cada una en su nivel, mientras L anda de «medido» a «postulado» con `señalar`.
9. CTA con L.
- **Texto:** la frase 1 pasa de «En 1981-1997, un investigador…» a «Entre 1981 y 1997, un investigador…», con su `voz` en palabras. Es el único cambio de texto del lote: así como está no se puede leer en voz alta.

### Orden de las tareas (RAM justa: un render, build o navegador a la vez)
La voz va como mucho a 2 reels por día (cuota compartida con el rincón). El render va de uno en uno. El sitio se comprueba en los huecos en que no hay render.

| # | Tarea | Necesita | Pesado |
|---|---|---|---|
| E0 | **Kit y piloto:** `escena-maniquies.js`, `atrezo-sintergia.js` y `comprobar-maniquies.mjs`; `--variante v3` en el importador; importar el v3 del piloto. | — | 1 navegador: captura de una página de prueba del atrezo |
| E1 | Reel `replicas-del-potencial-transferido` | E0 | voz + render |
| E2 | Reel `epr-en-el-cerebro` | E0 (voz el mismo día que E1) | render, después de E1 |
| E3 | Reel `sintergia` | E1 (que el kit haya servido) | voz + render |
| E4 | Reel `patron-de-interferencia` | E3 (voz el mismo día) | render |
| E5 | Reel `lattice` | E4 | voz + render |
| E6 | Reel `procesador-central` | E5 (voz el mismo día) | render |
| E7 | Reel `que-es-la-teoria-sintergica` | E6, porque reutiliza casi todo el atrezo | voz + render |
| QT1-QT4 | Comprobación del sitio, una por tanda (abajo) | Cuando no haya render en curso | build + navegador |

- **Por qué empieza réplicas:** reutiliza casi todo el atrezo del piloto (cabinas, balanza, fila de N). Si el kit falla, se ve con lo mínimo nuevo.
- **Por qué cierra el marco:** usa el atrezo de todos los demás.
- **Las PARADAS de escucha** se pueden juntar de dos en dos (E1+E2, E3+E4, E5+E6) para no parar al humano 7 veces.

### Comprobación del sitio por tanda (QT1-QT4)
Las fichas ya están escritas. Cada QT es comprobar, y arreglar solo lo que falle.

| QT | Tanda | Fichas | Además de §8 |
|---|---|---|---|
| QT1 | `lo-medido` | `correlacion-interhemisferica`, `replicas-del-potencial-transferido`, `epr-en-el-cerebro`, `vision-extraocular` | En `balance`, cada resultado se distingue sin color y el filtro «solo réplicas del diseño» viene activado. En `epr`, «Bell» explicado en una frase y ningún «demuestra». |
| QT2 | `el-campo` 2D | `sintergia`, `campo-neuronal`, `patron-de-interferencia`, `factor-de-direccionalidad` | Las cuatro dicen que no hay prueba independiente. V6 (pie «Esquema de una idea…»). V8 (ninguna onda se mueve sola). Banda de la portada **sin tono contrario** (§11.2 B1) y con filete discontinuo (§11.1 P5). |
| QT3 | `el-campo` 3D | `lattice`, `distorsion-del-espacio-tiempo` | `auditar`: 1 contexto WebGL vivo como mucho al recorrer las dos fichas, y liberado al salir. La escena no se anima sola. |
| QT4 | `la-conciencia` y `marco` | `procesador-central`, `orbitales-de-conciencia`, `percepcion-campo-lattice`, `que-es-la-teoria-sintergica` | El mapa coincide con el `respaldo` de los 14 JSON (comprobado con un script de una línea). Grep de C8 limpio en todo `content/`. Página «Límites». |

- **En cada QT:** C1-C11 y V1-V14 sobre sus fichas; `revisor-de-contenido` sobre sus 4 conceptos; capturas en 2 temas × 2 anchos, revisadas por un subagente en una hoja de contacto.
- **V14 (reel lo primero):** se marca en la QT de la tanda **solo cuando su reel ya esté importado**. Si todavía no lo está, se marca la ficha sin reel (orden de §3) y V14 se pasa en el paso 6 del reel.

### Criterios de aceptación
- **E0:**
  - `comprobar-maniquies.mjs` sobre la carpeta del piloto da la misma tabla que `trabajo-v3/qa-v3-tabla.md`, sin diferencias de gesto ni de ancla.
  - La página de prueba del atrezo pinta cada pieza nueva sin errores de consola, en una captura que revisa un subagente.
  - Las fechas de modificación muestran que no se ha tocado ningún fichero del piloto (no hay git).
  - `public/reels/potencial-transferido.mp4` es el v3, pesa ≤ 5 MB y en la hoja de contacto los subtítulos se leen.
  - La ficha del piloto pasa V14.
- **Cada reel E1-E7:**
  - R-v3-1 a R-v3-10 (DEC §11.4) con N = 9 frases;
  - R1-R4 de DEC §8;
  - las reglas comunes del mapa, comprobadas en la hoja de contacto;
  - 1 o 2 peticiones a Gemini como mucho, anotadas en `FICHA-v3.md`;
  - el control Q1 de la QA estricta de la skill en verde: las cifras van en `voz`, sin excepciones nuevas;
  - mp4 importado ≤ 5 MB, y la ficha correspondiente pasa V14.
- **S5 cerrado:** E0-E7 y QT1-QT4 hechas. `npm run validar`, `build`, `capturar` y `auditar` en verde sobre el sitio entero, y `content/reels.json` con 8 entradas. Es la entrada a S6.

### Cómo comprobarlo
1. **Sin navegador:**
   - `node escena/kit-comun/v1/comprobar-maniquies.mjs reels/sintergia-<id>` (R-v3-1 a R-v3-5);
   - grep de `cian`/`#00` y del color cian del kit en `escena-v3*.js` de cada reel (R-v3-6);
   - `npm run validar | tail -n 30`.
2. **Con un solo proceso pesado a la vez** (antes, `Get-Process`): render → QA de `reel-divulgativo` → `npm run build` → `npx vite preview --port 4173` → `npm run capturar` / `npm run auditar`, con la salida recortada.
3. **Fotogramas y capturas:** siempre en hoja de contacto, revisada por un subagente que contesta frase por frase (R-v3-8) o criterio por criterio (V14 y §11.2).
4. **PARADA del humano** con la hoja de escucha y visionado de cada par de reels, antes de importarlos.

### Notas de rigor por ficha (de la versión anterior de S5; siguen valiendo en QT1-QT4)
Son lo que el revisor tiene que buscar en cada ficha ya escrita. Las líneas de «Mecánicas nuevas» y «Reels» de cada tanda ya no aplican: esas mecánicas existen y los reels van por E1-E7. La referencia de la tanda 2 al tono contrario de §5 queda anulada por §11.2 B1.

### Tanda 1 · `lo-medido` (4 fichas, 2 reels)
**Leer además:** DEC §2 (filas `lo-medido`), §6 (filas `dos-figuras`, `balance`, `secuencia` modo lista), §7. INV A1-A4, §2, §6.
- **Fichas:** `correlacion-interhemisferica` (P7; volumen y páginas pendientes de DOI: decirlo), `replicas-del-potencial-transferido` (dos grupos de DEC §4; S7 aparte; S4 y S9 solo en texto; S1 «resultado no leído»), `epr-en-el-cerebro` (la nota sobre el teorema de no comunicación va como «nota del equipo», INV la da como propia), `vision-extraocular` (con el aviso fijo de DEC §4).
- **Mecánicas nuevas:** `dos-figuras`, `balance`. `vision-extraocular` reutiliza `secuencia` en modo `lista`.
- **Reels:** `replicas-del-potencial-transferido`, `epr-en-el-cerebro`.
- **Aceptación propia:** en `balance`, el resultado de cada estudio se distingue sin color (forma y texto) y el filtro «solo réplicas del diseño» viene activado. En `epr-en-el-cerebro` aparece la palabra «Bell» explicada en una frase y nada de «demuestra».

### Tanda 2 · `el-campo` en 2D (4 fichas, 2 reels)
**Leer además:** DEC §2 (filas `el-campo`), §11.2 (sin tono contrario), §6 (filas `eje`, `capas`, `ondas`), §7. INV §3 familia B.
- **Fichas:** `sintergia`, `campo-neuronal`, `patron-de-interferencia` (con el contexto de Bohm y Pribram: contemporáneos, no fuente), `factor-de-direccionalidad` (él mismo lo llama «hipotético», P5; *kavanah* solo en disputa, como divulgación).
- **Mecánicas nuevas:** `capas`, `ondas` (canvas). `sintergia` usa `eje` de la plantilla.
- **Reels:** `sintergia`, `patron-de-interferencia`.
- **Aceptación propia:** en «Lo que se sabe» de las cuatro aparece de forma explícita que no hay prueba independiente. Pie «Esquema de una idea…» visible (V6). Ninguna onda se mueve sola (V8).

### Tanda 3 · `el-campo` en 3D (2 fichas, 1 reel)
**Leer además:** DEC §6 (fila `reticula-3d` y presupuesto 3D), §7. Skill `escena-3d`. INV §3 B (lattice, distorsión).
- **Fichas:** `lattice` (aclarar que es un término de cristalografía usado como metáfora, y la cita de P5 sobre la longitud de onda de los rayos X), `distorsion-del-espacio-tiempo` (usa el vocabulario de la relatividad general sin su formalismo: decirlo así).
- **Mecánica nueva:** escena `reticula-3d` con dos modos, una sola escena para las dos fichas, con fallback 2D estático y `justificacion_3d` de DEC §6.
- **Reel:** `lattice`.
- **Aceptación propia:** `auditar` con 1 contexto WebGL vivo como máximo al recorrer las dos fichas; el contexto se libera al salir (skill `escena-3d`). La escena no se anima sola.

### Tanda 4 · `la-conciencia`, el `marco` y el cierre (4 fichas, 2 reels)
**Leer además:** DEC §1, §2 (filas `la-conciencia` y `marco`, y «Fronteras entre fichas vecinas»), §4 (página «Límites de este sitio»), §6 (filas `capas`, `ondas`, `mapa-respaldo`), §7. INV §3 C, «Contexto», §5.
- **Fichas:** `procesador-central`, `orbitales-de-conciencia`, `percepcion-campo-lattice` (respaldo 0, «tesis filosófica»: decir por qué no se puede poner a prueba, sin despreciarla), y **al final** `que-es-la-teoria-sintergica`, porque su mapa necesita las 14 fichas cerradas. El marco incluye la frase sobre chamanes y la de «función de onda» de DEC §1.
- **Mecánica nueva:** `mapa-respaldo` (pieza propia, svg): cada punto enlaza a su ficha y tiene nombre accesible.
- **Página «Límites de este sitio»** en `ui.json` (DEC §4).
- **Reels:** `procesador-central`, `que-es-la-teoria-sintergica`.
- **Aceptación propia:** el mapa coincide con el `respaldo` de los otros 14 JSON, y todos lo tienen (comprobar con un script de una línea, no a ojo). Grep de C8 sobre todo `content/` limpio. Con esta tanda se pasa la lista de DEC §8 entera al sitio → entrada a S6.

---

## Revisión S3 (2026-11-13, Revisión-sintergia)

**Cambiado en DECISIONES.md** (ya aplicado; el ejecutor lo toma como DEC):
1. §1 marco: «neurofisiólogo (UNAM)» → «investigador mexicano en psicofisiología de la conciencia» (lo primero no tenía fuente en INV).
2. §2 títulos: `correlacion-interhemisferica` → «¿Se parecen dos cerebros al comunicarse?» y `lattice` → «…la retícula que Grinberg supone en el espacio» (afirmaban como hecho). `retícula-3d` → `reticula-3d` (id sin tilde, igual que en §6).
3. §2 nuevo bloque «Fronteras entre fichas vecinas» (patrón/percepción, procesador/orbitales, lattice/distorsión) y §4 frontera piloto/réplicas/EPR: evita escribir lo mismo dos veces.
4. §3 citas: el piloto citaba P11, que §3 prohibía (solo P5/P12). Ahora se permiten los literales de INV (P5 texto; P11 y P12 resumen), `cita` pasa a opcional, hay reparto fijo de literales por ficha y P11 va con sus cuatro autores. Riesgo que cierra: un sonnet inventando citas para cumplir C7.
5. §3 la regla del condicional se extiende a `titulo`, `resumen`, `alternativa`, `resolucion` y rótulos; se dice con qué se llega al mínimo de 120 car. de `se_sabe` sin inventar (INV §6, S13, existencia de S12).
6. §4: prohibido resumir el veredicto de S12 (no leído); «cuántico» permitido al atribuir P11 en el piloto; S4, S9, S10 y S1 colocados en el `balance` (antes no tenían sitio ni resultado).
7. §6: orden de pasos del piloto corregido (INV A2: interacción **antes** de separar); `vision-extraocular` ya no marca controles como «no documentado» (no hemos leído P6), sino «no consta en lo que hemos podido leer»; recuento de mecánicas corregido.
8. §7: eran 8 reels (1+7), no 7; ejemplo de gancho sin «neurofisiólogo» ni «sincronizarse», con 14,5 m. §8: C1, C7 y C8 ajustados (C8 ya no salta con P11 ni con la frase de chamanes del marco).

**Cambiado en FICHAS.md:** S4d (autoría y frontera de la cita), S5 «Leer siempre» y tanda 4 con las fronteras, tanda 1 con la colocación de S1/S4/S9.

**Queda para decidir (Sócrates):**
- **Respaldo de `orbitales-de-conciencia` y `percepcion-campo-lattice`:** DEC les da 0 («tesis filosófica»); INV §3 C los etiqueta «Especulativo» (=1). Solo `procesador-central` es tesis filosófica en INV. No lo he cambiado porque altera el mapa y el reparto de la escala.
- **S4b paso 4:** si el validador rechaza stubs, desactivar familias puede dejar `exigir_uso` en rojo; mejor rellenar stubs con texto `BORRADOR` de longitud válida. Lo dejo al ejecutor del piloto, pero conviene confirmarlo.
- **Chamanes «fuente declarada» (P8):** INV solo tiene la ficha bibliográfica; «declarada» es una inferencia. Propongo «fuente de sus ideas según su bibliografía (P8)».
- El encargo t-e90a60 pedía las correcciones en `REVISION-PLAN.md`; el encargo de Sócrates, aplicarlas directamente. He hecho lo segundo; `REVISION-PLAN.md` solo remite aquí.
