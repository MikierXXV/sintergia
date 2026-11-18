# DECISIONES · Sintergia: conceptos de Jacobo Grinberg

Lo que hay aquí **no se vuelve a discutir** en S4-S6. Si algo no encaja al ejecutar, se para y se pregunta a Sócrates; no se reinterpreta.
Fuente única de contenido: `investigacion/INVESTIGACION.md` (en adelante, INV). Los códigos P1-P12 y S1-S13 son los de INV §1-2.
Fecha: 2026-11-13 · Autor: Diseño-sintergia (S2).
**Revisión S4-D (2026-11-15, Diseño-sintergia-v2, tarea t-3ca327):** el humano pidió que el contenido se presente «más como en software-engineer». Se han reescrito §1 (tipo de sitio), §3 (estructura de la ficha), §5 (tipografía y escenografía), §6 (máquinas), §7 (dónde va el reel) y §8 (criterios nuevos), y se ha añadido §10 con la comparación. **El rigor no cambia:** siguen igual los tres rótulos, la escala de respaldo, las citas, las prohibiciones de §4 y los chamanes en una sola frase del marco. Lo que cambia es la forma de presentar ese mismo contenido.

---

## §1. Alcance

- **Dentro:** las ideas de Grinberg y su estado científico. Nada más.
- **Fuera, sin excepción:** biografía, desaparición (1994), vida personal, anécdotas, chamanes como relato y relación con figuras públicas. El marco presenta a Grinberg en una línea: «investigador mexicano en psicofisiología de la conciencia que publicó la teoría entre 1981 y 1997» (P2-P4, P12; «neurofisiólogo» y «UNAM» no tienen fuente en INV y no se usan). Ni una línea sobre el caso.
- **Fuera también:**
  - «función de onda» como término de Grinberg: no aparece en sus textos (INV §3 B). Se menciona solo en la ficha `que-es-la-teoria-sintergica`, en «Lo que está en disputa», como atribución de la divulgación;
  - lecturas cabalísticas del factor de direccionalidad (*kavanah*): son de la divulgación. Una frase en «Lo que está en disputa» de `factor-de-direccionalidad`, marcada como tal;
  - chamanes y meditación: una frase en el marco («fuente declarada de sus ideas, P8»). Sin ficha propia, porque no hay contenido verificable.
- **Visión extraocular:** entra, con advertencia visible (§4, nivel 1). Es una afirmación empírica suya y el visitante la buscará; mejor explicarla con su falta de controles que callarla.
- **Solo español.** `reglas.json` → `"idiomas": ["es"]`. Las citas de Grinberg están en inglés (P5, P12): se dan traducidas en el texto y el original va en `cita` (§3).
- **Tipo de sitio** (S4-D, como software-engineer): una **portada** con tarjetas agrupadas por familia y una **página por concepto** (`#/c/<id>`). Sustituye al recorrido de scroll único con todas las fichas en línea.
  - **El orden pedagógico se mantiene.** Las familias van en el orden de §2, de lo medido a lo postulado, y hay una ruta única, «El recorrido», con las 15 fichas en ese orden y botones «anterior» y «siguiente» en el pie de cada concepto.
  - **Rutas del fragmento:** `#/` (portada), `#/c/<id>` (concepto), `#/limites` (página de límites). Los enlaces antiguos `#<id>` redirigen a `#/c/<id>`.
  - Sin buscador ⌘K ni filtros: con 15 fichas no hacen falta. Se reconsidera si algún día pasan de 40.

## §2. Familias y lista de fichas

Agrupación **por distancia al dato** (respuesta a INV §5 p1): va de lo que se midió a lo que solo se postula. Así el propio recorrido enseña el estado científico. Se descarta seguir la arquitectura de Grinberg (cerebro → campo → lattice → experiencia) porque lo presenta como más integrado y probado de lo que está.

| Orden | Familia (`id`) | Nombre en pantalla | Qué agrupa |
|---|---|---|---|
| 0 | `marco` | El mapa | Puerta del sitio: qué es la teoría y cómo leer este sitio |
| 1 | `lo-medido` | Lo que se midió | Experimentos y su replicación (INV familia A) |
| 2 | `el-campo` | La teoría del campo | Constructos teóricos, solo con fuentes de Grinberg (INV B) |
| 3 | `la-conciencia` | Conciencia y experiencia | Tesis filosóficas (INV C) |

**Fichas (15).** `id` = nombre del fichero JSON. «Respaldo» es el nivel de §4.

| Fam. | Ord. | `id` | Título | Respaldo | INV | Visualización (§6) | Reel (§7) |
|---|---|---|---|---|---|---|---|
| marco | 1 | `que-es-la-teoria-sintergica` | Qué es la teoría sintérgica y cómo leer este sitio | — (mapa) | §3, §4 n.º 1 | `mapa-respaldo` | sí |
| lo-medido | 1 | `correlacion-interhemisferica` | ¿Se parecen dos cerebros al comunicarse? | 3 | A1, P7 | `dos-figuras` | — |
| lo-medido | 2 | `potencial-transferido` | El potencial transferido: el experimento | 2 | A2, P10, P11 | `secuencia` | **piloto** |
| lo-medido | 3 | `replicas-del-potencial-transferido` | ¿Se replicó? El balance de las réplicas | 2 | A2, S1-S10 | `balance` | sí |
| lo-medido | 4 | `epr-en-el-cerebro` | «La paradoja EPR en el cerebro» y por qué no es una prueba de Bell | 1 | A3, P11, S10 | `dos-figuras` | sí |
| lo-medido | 5 | `vision-extraocular` | Visión extraocular: lo que faltaría controlar | 1 | A4, P6 | `secuencia` (modo lista de controles) | — |
| el-campo | 1 | `sintergia` | Sintergia: síntesis más energía | 1 | B, P5 | `eje` | sí |
| el-campo | 2 | `campo-neuronal` | El campo neuronal | 1 | B, P5, P12 | `capas` | — |
| el-campo | 3 | `lattice` | El lattice: la retícula que Grinberg supone en el espacio | 1 | B, P5 | `reticula-3d` | sí |
| el-campo | 4 | `distorsion-del-espacio-tiempo` | Distorsión del espacio-tiempo | 1 | B, P12, S13 | `reticula-3d` (modo deformación) | — |
| el-campo | 5 | `patron-de-interferencia` | El patrón de interferencia | 1 | B, P5 | `ondas` | sí |
| el-campo | 6 | `factor-de-direccionalidad` | El factor de direccionalidad | 1 | B, P5 | `ondas` (modo foco) | — |
| la-conciencia | 1 | `procesador-central` | El procesador central o «conciencia pura» | 0 | C, P5 | `capas` (concéntricas) | sí |
| la-conciencia | 2 | `orbitales-de-conciencia` | Los orbitales de conciencia | 0 | C, P5 | `capas` (concéntricas, modo niveles) | — |
| la-conciencia | 3 | `percepcion-campo-lattice` | Percibir como interferencia entre campo y lattice | 0 | C, S13 | `ondas` + rótulo | — |

Contexto histórico (Bohm 1980, Pribram, Goswami 1993-94: INV §3 «Contexto») va **dentro** de las fichas donde toca (`patron-de-interferencia`, `epr-en-el-cerebro`, `que-es-la-teoria-sintergica`), no en ficha propia.

**Fronteras entre fichas vecinas** (para no escribir lo mismo dos veces):
- `patron-de-interferencia` = el mecanismo propuesto (campo y lattice interfieren; P5). `percepcion-campo-lattice` = la consecuencia filosófica (lo que percibimos sería ese patrón; S13) y su cercanía al idealismo y a Bohm. La segunda enlaza a la primera y no repite el mecanismo.
- `procesador-central` = lo que permanece («conciencia pura»). `orbitales-de-conciencia` = los niveles que cambian alrededor. Cada una enlaza a la otra; la definición de cada concepto solo en su ficha.
- `lattice` = qué es la retícula. `distorsion-del-espacio-tiempo` = qué le haría el campo. Comparten escena, no texto.

## §3. Estructura de cada ficha

**S4-D: la ficha pasa al modelo de software-engineer** («concepto + máquina»). Hay dos ficheros por concepto:
- `content/es/conceptos/<id>.json`: el texto, en bloques con estructura en lugar de tres párrafos largos;
- `content/es/maquinas/<id>.json`: la máquina, que se declara y no se programa (§6).

`content/es/piezas/` desaparece. Los tres bloques de rigor siguen siendo obligatorios y siguen en el mismo orden, pero ahora tienen pasos, hallazgos y puntos, cada uno con sus refs.

**Orden fijo de la página de concepto**, el esqueleto de software-engineer con los bloques de Sintergia:
1. **Migas:** «El mapa / ‹familia›».
2. **Cabecera:**
   - símbolo (≤ 5 caracteres, texto, nunca emoji);
   - `h1`;
   - **insignia de respaldo** (§4);
   - «En una frase» (`idea`);
   - botón «Ver el reel», solo si la ficha tiene reel, que salta a la sección del reel.
3. **La máquina** (§6), que entra en el primer pantallazo en escritorio y, en móvil, justo bajo la cabecera.
4. **Qué estás viendo:** la `alternativa` de la máquina, que aparece cuando la máquina se monta (como en software-engineer).
5. **Lo que propone Grinberg:**
   - `propone.intro` (opcional, ≤ 300 car.);
   - `propone.pasos`, una lista numerada al modo de «Cómo funciona»;
   - la `cita` en un bloque con barra al final, si la ficha la tiene.
6. **Piénsalo así** (opcional, solo `origen: "editorial"`). Una comparación nuestra, con el aviso fijo «Comparación nuestra para entenderlo; no es de Grinberg». Prohibido usarla para hacer verosímil la tesis: compara la **forma** de la idea, nunca su verdad. Para decidir si una ficha la lleva, mira si deja la idea más clara sin hacerla parecer más probada.
7. **Lo que se sabe:** `se_sabe` es una lista de hallazgos `{ texto, refs[] }`; cada hallazgo muestra sus refs como chips que enlazan a «Fuentes». Si no hay nada, un solo hallazgo con el texto fijo de la regla de abajo.
8. **Lo que está en disputa:** `disputa` es una lista de puntos `{ titulo, texto, refs[] }`, en caja con icono de aviso (la del «Error típico» de software-engineer, con el acento neutro, nunca rojo). **Nunca plegada.**
9. **Para ir más lejos** (opcional, plegado): `detalles[] { titulo, texto, refs[] }`. Solo para contexto histórico (Bohm, Pribram, Goswami) y cifras finas que ya están, con su reserva, en un bloque visible. Nada que matice el estado de la evidencia puede ir solo aquí.
10. **Para recordar:** `puntos_clave` (2-4). El **primero es siempre el estado de la evidencia** en una frase con el rótulo de respaldo («Disputado: …»).
11. **El reel** (§7), si lo hay.
12. **Relacionados:** las tarjetas de `enlaces`.
13. **Fuentes:** la lista tipada de siempre, plegable a partir de 6 entradas, con las 3 primeras visibles.
14. **Pie de ruta:** «El recorrido · n de 15», con anterior y siguiente.

En escritorio, a la derecha, va el índice lateral **«En esta página»**, que marca la sección que se está leyendo (`activarIndice` de software-engineer).

Esquema del concepto (`content/es/conceptos/<id>.json`):

```json
{
  "id": "potencial-transferido",
  "familia_id": "lo-medido",
  "orden": 2,
  "simbolo": "PT",
  "titulo": "El potencial transferido: el experimento",
  "resumen": "60-400 car. Qué es y en qué estado está. Va en la tarjeta de la portada (primera frase) y en <meta description>.",
  "idea": "40-160 car. En condicional o atribuida: «Grinberg dijo haber medido…».",
  "respaldo": 2,
  "propone": { "intro": "≤300 car., opcional", "pasos": [ { "titulo": "≤60 car.", "texto": "40-300 car., condicional o atribuido" } ] },
  "analogia": { "origen": "editorial", "titulo": "…", "texto": "…" },
  "se_sabe": [ { "texto": "40-400 car.", "refs": ["P11"] } ],
  "disputa": [ { "titulo": "≤70 car.", "texto": "40-400 car.", "refs": ["S8"] } ],
  "detalles": [ { "titulo": "…", "texto": "…", "refs": ["…"] } ],
  "puntos_clave": [ "Disputado: …", "…" ],
  "cita": { "texto": "to verify if the brain has a macroscopic quantum component", "traduccion": "traducción propia", "autor": "Grinberg-Zylberbaum, Delaflor, Attie y Goswami", "atribucion": "directa", "fuente": "P11, resumen, Physics Essays 7(4) (1994)" },
  "fuentes": [ { "ref": "P11", "tipo": "primaria", "titulo": "…", "autor": "…", "anio": 1994, "url": "…", "nota": "DOI discrepante" } ],
  "enlaces": [ { "id": "replicas-del-potencial-transferido", "rotulo": "…" } ],
  "maquina": "potencial-transferido",
  "reel": "potencial-transferido"
}
```

Reglas del contenido (las hace cumplir `validar-contenido.mjs` vía `reglas.json`):
- **Los rótulos en pantalla no cambian nunca:** «Lo que propone Grinberg» · «Lo que se sabe» · «Lo que está en disputa» · «Fuentes». Sin variantes. Los rótulos de software-engineer («Piénsalo así», «Para ir más lejos», «Para recordar», «Qué estás viendo», «La máquina», «En una frase», «En esta página») se usan tal cual.
- **Cada `ref` de `se_sabe`, `disputa` y `detalles` existe en `fuentes`**, y cada `fuente` está citada por al menos un bloque. Esto lo comprueba el validador, en los dos sentidos: lo que antes era la revisión a mano de C3 pasa a ser una comprobación que bloquea.
- **«Lo que propone»** se escribe en estilo indirecto y condicional: «Grinberg propone que…», «según él, sería…». Nunca en indicativo de hecho («el cerebro crea un campo…»). **La misma regla vale para `titulo`, `resumen`, `idea`, cada paso de `propone.pasos`, `puntos_clave`, `analogia`, y para `alternativa`, `resolucion`, pasos y rótulos de la máquina:** cualquier idea de Grinberg que aparezca ahí va atribuida o en condicional.
- **«Lo que se sabe»** solo contiene afirmaciones con fuente en INV. Si no hay nada, se dice: «No hay estudios independientes que lo hayan puesto a prueba». Ese hueco **es** el contenido, no se rellena con nada inventado. Como apoyo se usa solo lo que INV da: dónde se publicó la idea y qué fiabilidad tiene ese medio (INV §6), que la Psi Encyclopedia dice que sus ideas «never received much academic attention» (S13) y que existe un análisis de demarcación (S12) **cuyo veredicto no hemos leído** (nunca se resume ni se insinúa su conclusión).
- **«Lo que está en disputa»** recoge las críticas metodológicas, las atribuciones dudosas y lo que no he podido verificar («sin verificar» de INV pasa tal cual, con esas palabras).
- `respaldo` 0-4 (§4) se pinta en la cabecera de la ficha. Es obligatorio en todas menos `que-es-la-teoria-sintergica` (el marco no tiene nivel propio); como el validador no distingue por familia, en el schema va opcional y C5 lo comprueba.
- `fuentes`: mínimo 1, con `ref` que exista en INV §1-2. `tipo` ∈ `primaria | replica | critica | contexto`. Las fichas de `lo-medido` necesitan al menos una fuente que no sea de Grinberg.
- **Citas:** solo las que están literales en INV: P5 (texto OCR) y los resúmenes de P11 y P12. **No se citan los libros** (P2, P3, P9): no hay texto ni página (INV §5 p4). `atribucion` siempre `directa`. Máximo 15 palabras. Si la fuente tiene coautores (P11), `autor` los nombra a todos; no se atribuye a Grinberg solo.
- **`cita` es opcional.** Solo la llevan las fichas con literal en INV; las demás van sin cita. **Nunca se escribe una cita que no esté en INV**, ni se traduce una paráfrasis como si fuera cita. Reparto (cada literal en una sola ficha): `potencial-transferido` → P11 «to verify if the brain has a macroscopic quantum component»; `campo-neuronal` → P5 «The neuronal field appears as a result of all the neuronal interactions»; `lattice` → P5 «a crystalline structure whose lattice dimensions are of the order of the wavelength of x-rays»; `sintergia` → P5 «each one of its elements contains high amounts of information»; `patron-de-interferencia` → P5 «This interference pattern constitutes the energetic structure of perceptual experience»; `factor-de-direccionalidad` → P5 «a hypothetical directionality factor»; `procesador-central` → P5 «The central processor can be conceived as pure consciousness». El resto, sin cita.
- Ninguna cifra que no esté en INV. Las que INV marca como dudosas (25 % frente a 57 %, 20-25 % de falsos positivos de S8) van con su reserva escrita al lado.
- **Longitudes en `reglas.json`** (S4-D: por elemento, no por párrafo).

  | Campo | Límite |
  |---|---|
  | `titulo` | 3-80 car. |
  | `resumen` | 60-400 car. |
  | `idea` | 40-160 car. |
  | `propone.pasos` | 3-6 pasos (`titulo` ≤ 60, `texto` 40-300) |
  | `se_sabe` en `lo-medido` | 2-6 hallazgos |
  | `se_sabe` en el resto | 1-6 hallazgos |
  | `disputa` | 1-5 puntos |
  | `puntos_clave` | 2-4 puntos, ≤ 200 car. cada uno |

  **Tope de lectura:** la suma de `propone`, `se_sabe` y `disputa` no pasa de 2400 car. Si no cabe, sobra algo o falta otra ficha.
- **El hueco de `se_sabe` vacío:** un solo hallazgo, «No hay estudios independientes que lo hayan puesto a prueba». Se le añaden, como hallazgos aparte, solo los apoyos que ya permite la regla de «Lo que se sabe» (INV §6, S13, existencia de S12). Ya no hace falta llegar a 120 car.: ese mínimo desaparece.

## §4. Voz, tono y listón de rigor

**Voz:** de tú, clara, sin jerga sin explicar y sin ironía. El modelo es un buen museo de ciencia: explica con interés lo que alguien pensó y dice con la misma calma lo que no se sostiene. Ni divulgación entusiasta ni desmontaje burlón.

**Prohibido:**
- presentar como hecho cualquier constructo de `el-campo` o `la-conciencia`;
- «la ciencia ha demostrado», «la física cuántica confirma», «los científicos ocultan»;
- «cuántico» como adjetivo explicativo («energía cuántica de la mente»): solo se usa al hablar de física de verdad, en `epr-en-el-cerebro`, o al atribuir lo que dice P11 (su cita y «según el artículo, buscaba un componente cuántico»), en `potencial-transferido`;
- resumir o insinuar el veredicto de S12: no lo hemos leído;
- descalificar a Grinberg o a sus seguidores («pseudocientífico» como insulto). Se describe el estado de la evidencia; el veredicto lo saca el lector;
- dar S8 o S10 como sentencia (respuesta a INV §5 p6): son puntos de la disputa. Se dice qué encontró cada uno y qué reservas hay;
- sacar a un autor de su sitio: S11 (Novella) no habla de Grinberg, y así se dice si se usa;
- llamar «réplicas independientes» a S1, S2, S6 y S7: comparten autores (INV §2 aviso).

**Réplicas (respuesta a INV §5 p2):** en `replicas-del-potencial-transferido` hay dos grupos visibles y separados: «Réplicas del diseño» (S2, S3, S8) y «Estudios emparentados» (S1, S5, S6, S10; S7 se cita aparte como «no es una réplica»). El balance se hace solo con el primer grupo. S4 (Wackermann 2004) y S9 (Hinterberger 2010, no leído) son revisiones: van en el texto, no como filas del `balance`. S10 sí es fila de «Estudios emparentados», con el resultado «revisión: 29 estudios, no metaanalizables». S1 no tiene resumen leído: su fila dice «resultado no leído», no se le supone ninguno.

**Frontera entre fichas del potencial transferido:** `potencial-transferido` explica el diseño y los números de P10/P11, y despacha las réplicas en una frase que enlaza a `replicas-del-potencial-transferido`; el detalle de S1-S10 vive solo en esta última. La interpretación cuántica (EPR, Bell, no comunicación) vive solo en `epr-en-el-cerebro`; el piloto solo cita el propósito declarado de P11.

**Escala de respaldo** (badge en la cabecera, también en el mapa del marco):

| Nivel | Rótulo en pantalla | Cuándo |
|---|---|---|
| 4 | Establecido | Replicado de forma robusta (ninguna ficha llega) |
| 3 | Publicado, sin réplica | Revista convencional con revisión, sin réplica independiente |
| 2 | Disputado | Hay réplicas, pero mixtas o débiles |
| 1 | Especulativo | Solo lo sostiene el propio Grinberg, o una inferencia sin prueba |
| 0 | Tesis filosófica | No se puede comprobar con un experimento |

El rótulo va siempre en texto; el color solo lo acompaña (§5).

**Avisos fijos:**
- Pie de toda visualización de `el-campo` y `la-conciencia`: «Esquema de una idea, no de un fenómeno medido».
- `vision-extraocular` abre con: «Solo tenemos la referencia del artículo, no su contenido».
- Pie global del sitio: «Este sitio explica ideas; no las avala. Fuentes y límites: investigación de 2026-11».

**Página «Límites de este sitio»** (al final del recorrido, en `ui.json`, no es ficha): copia en prosa de INV «Límites del trabajo» y §5 p4-5, con lo que no se pudo leer. Es parte del rigor, no letra pequeña.

## §5. Estilo visual y paleta

**Tono:** cuaderno de laboratorio de noche. Fondo azul tinta, retículas finas, trazos de osciloscopio, tipografía sobria. Nada de místico: ni ojos que brillan, ni mandalas, ni cerebros con rayos, ni degradados violeta-galaxia. La estética no debe vender lo que el texto matiza.

**Tipografía y densidad (S4-D, como software-engineer):**
- **Fuentes:** Newsreader (serif) para los titulares y «En una frase»; Inter para la interfaz y el cuerpo. Las dos autoalojadas, con sus respaldos métricos.
- **Escala:** se copia la de `software-engineer/design/tokens.css` (`--t-xs` … `--t-hero`), junto con las alturas, los radios y `--vis-proporcion-movil`.
- **Columna y cajas:** columna de lectura de ~68 ch con el índice lateral a la derecha, e iconos de trazo pequeños en los `h2` de sección. Cajas distintas para cada bloque: los pasos numerados, la disputa con su aviso y «Para recordar» con sus marcas.
- **Cifras tabulares** en tablas, en el balance y en la pista de pasos.
- **El color, como en software-engineer:** la página va casi en monocromo y el acento de la familia solo marca el símbolo, las migas, la pista y el botón primario. Las secciones no se tiñen de color.

**Paleta** (S4 la fija en `design/tokens.json` con la skill `sistema-visual` y la verifica con `npm run validar:contraste -- --sugerir`; se aceptan los ajustes de luminosidad que proponga, no los cambios de tono):

| Token | Uso | Tono (H) | Punto de partida claro / oscuro |
|---|---|---|---|
| `fondo` | Fondo | 225° | `#F6F7FA` / `#0E1220` |
| `acento-marco` | Familia `marco` | 220° (gris azulado) | `#4A5670` / `#A9B4CC` |
| `acento-lo-medido` | Familia `lo-medido` | 180° (cian de osciloscopio) | `#00727A` / `#4FD1D9` |
| `acento-el-campo` | Familia `el-campo` | 265° (violeta frío) | `#5B45B0` / `#A99BF0` |
| `acento-la-conciencia` | Familia `la-conciencia` | 38° (ámbar) | `#8A5A00` / `#F2B544` |

**Badge de respaldo:** no usa los acentos de familia. Es una escala de **un solo tono** (gris azulado) que va de hueco a lleno (0 a 4 segmentos rellenos) más el rótulo de §4. Así no hay rojo-verde que juzgue y no choca con las familias.

**Escenografía (skill `escenografia`), S4-D: solo en la portada.**
- **Portada:**
  - una cubierta breve con el titular y la línea del marco;
  - una tarjeta destacada «Empieza aquí» → `que-es-la-teoria-sintergica`;
  - la leyenda de la escala de respaldo, estática y en texto;
  - después, una banda por familia con su rejilla de tarjetas.
- **Tarjeta:** símbolo, título, primera frase del `resumen` e insignia de respaldo (segmentos y rótulo).
- **Tono y entradas:** la banda de `el-campo` lleva el tono contrario, que sigue avisando de que ahí empieza la especulación. Entradas: `lo-medido` = corte, `el-campo` = deriva, `la-conciencia` = deriva.
- **Página de concepto:** sin escenografía. Es una página quieta, como en software-engineer, sin entradas al hacer scroll, para que ningún efecto pueda dejar la máquina sin montar.
- **Fichas en borrador:** no salen como tarjetas. Una banda sin fichas listas muestra «En preparación · n fichas», sin enlace.
- Sin paralaje en las máquinas.

## §6. Visualizaciones

**S4-D: «máquinas que se tocan», al modo de software-engineer.**

- **Una máquina por concepto,** en `content/es/maquinas/<id>.json`, con el formato `{ mecanica, tipo, parametros: { alternativa, resolucion, controles, elementos, enlaces, pasos } }`. Se declara en JSON y no toca TypeScript.
- **Mando común:** se usa `src/vis/controles.ts` (`crearMando`), igual que en software-engineer, y ninguna mecánica se lo inventa. Lleva:
  - la pista de pasos;
  - «Paso n de N» con el texto del paso en cuerpo grande;
  - los botones Reproducir, Paso y Reiniciar;
  - el teclado: flechas, y espacio sobre el lienzo;
  - selectores segmentados para los `controles`.
- **Reproducir: se corrige lo que decía §6.** Antes había que avanzar siempre a mano. Ahora Reproducir está permitido, porque lo pulsa el visitante y se para en el último paso. Nunca hace bucle ni arranca solo, y con `prefers-reduced-motion` salta de paso en paso sin animar.
- **Los elementos se tocan:** tocar un nodo hace algo que se explica en el texto del paso (`aria-label` en cada uno).
- **La mayoría de las máquinas son `diagrama`,** que se copia de software-engineer y ya mueve 68 de sus 86 máquinas: nodos, enlaces, mensajes que viajan, y `activos`, `muestra` y `sub` por paso. Con eso se cubren `secuencia`, `dos-figuras` y `capas`, que dejan de ser mecánicas propias y pasan a ser configuraciones de `diagrama`.
- **Siguen como mecánicas aparte:**
  - `eje`;
  - `balance`, una fila por estudio;
  - `ondas`, en canvas;
  - `reticula-3d`;
  - `mapa-respaldo`.

  Todas pasan a usar el mando común.
- **Reglas de rigor en la máquina:**
  - **Los elementos que son idea de Grinberg** llevan `rol: "propuesta"`: trazo discontinuo y rótulo atribuido («según Grinberg»).
  - **Lo medido** lleva `rol: "dato"`, con trazo continuo.
  - **Nunca cian para una propuesta.**
  - **Un control solo puede enseñar alternativas que estén en INV o que sean la hipótesis nula por definición** (p. ej. «si no hubiera efecto, B no mostraría nada»). No se inventan escenarios.
  - **Los pasos de la máquina repiten el orden de `propone.pasos`,** que pueden ser más, pero nunca otro orden.

Las tablas de abajo dicen qué hace cada ficha. La columna «Mecánica» se lee ahora como «configuración de `diagrama`» en las filas `secuencia`, `dos-figuras` y `capas`. Todas llevan `alternativa` (texto que explica lo mismo sin la imagen) y `resolucion` (la idea en una frase), con el lenguaje de `src/vis/lenguaje.ts` (skill `mecanica-de-visualizacion`).

| Mecánica | Técnica | Qué hace | Fichas |
|---|---|---|---|
| `eje` (viene en la plantilla) | svg | Polo A ↔ polo B con marca deslizable | `sintergia` (de baja a alta sintergia; la marca indica «cada elemento contiene mucha información», P5, rotulada «esquema») |
| `secuencia` | svg | Pasos numerados con avance manual (botón «siguiente», nunca automático). Modo `lista`: casillas de control marcadas/no marcadas | `potencial-transferido` (1 interacción entre los dos sujetos → 2 separación en cámaras de Faraday a 14,5 m → 3 100 destellos a A → 4 PE en A → 5 ¿PT en B? → 6 el análisis; el orden sale de INV A2: el PT aparece «tras interactuar»), `vision-extraocular` (lista de controles: venda, ciego, juez ciego, registro previo, control de fugas sensoriales. No hemos leído P6: la venda se marca «descrita en la referencia» y **todas las demás** «no consta en lo que hemos podido leer»; ninguna se marca como hecha ni como ausente en el artículo) |
| `dos-figuras` | svg | Dos siluetas o trazas EEG lado a lado con un parámetro de correlación | `correlacion-interhemisferica` (dos trazas que se parecen más en la fase de comunicación), `epr-en-el-cerebro` (izquierda: lo que propone; derecha: lo que exigiría una prueba de Bell y el teorema de no comunicación; marcado como «nota del equipo» porque INV lo da como nota propia) |
| `balance` | svg | Fila de estudios por año, cada uno con su resultado (positivo débil / mixto / negativo / no es réplica / revisión / resultado no leído) en **forma y texto**, no solo color; filtro «solo réplicas del diseño» activado por defecto | `replicas-del-potencial-transferido` |
| `capas` | svg | Capas apiladas o concéntricas que se despliegan al tocar | `campo-neuronal` (neuronas → interacciones → «campo», la última dibujada con trazo discontinuo), `procesador-central`, `orbitales-de-conciencia` |
| `ondas` | canvas | Dos frentes de onda y su interferencia; modo `foco`: un haz que ilumina una porción del patrón | `patron-de-interferencia`, `factor-de-direccionalidad`, `percepcion-campo-lattice` |
| `mapa-respaldo` | svg (pieza propia) | Las 14 fichas como puntos en una banda vertical por nivel de respaldo, coloreados por familia; cada punto enlaza a su ficha | `que-es-la-teoria-sintergica` |
| `reticula-3d` | 3d (skill `escena-3d`) | Malla 3D que un campo deforma; modo `lattice` (malla en reposo, punto de vista orbitable) y modo `deformacion` (microdistorsiones que se suman) | `lattice`, `distorsion-del-espacio-tiempo` |

- **Presupuesto 3D: 2 fichas, 1 sola escena** (`reglas.json` → `"presupuesto_3d": 2`). `justificacion_3d`: «la idea es una retícula espacial que se deforma: se entiende al girarla». Fallback 2D estático si no hay WebGL.
- **Nada de animaciones en bucle que «respiren»:** sugieren algo vivo y real. Todo se mueve por acción del visitante; Reproducir es una acción del visitante y se detiene en el último paso.
- **Máquina del piloto (`potencial-transferido`, `diagrama`)** — ejemplo de referencia para S5:
  - **Elementos:**
    - Sujeto A y Sujeto B, cada uno en su cámara de Faraday;
    - una regla «14,5 m» entre las dos cámaras;
    - «100 destellos», que llegan solo a A;
    - la traza «potencial evocado» en A, con `rol: "dato"`;
    - la traza «¿potencial transferido?» en B, con `rol: "propuesta"`, discontinua.
  - **Pasos:** los 6 de antes (interacción → separación → destellos → PE en A → ¿PT en B? → análisis en disputa).
  - **Control «Qué muestra B»:** dos opciones, «Lo que dice el artículo (P11)» y «Si no hubiera efecto». La segunda borra la traza de B y deja el rótulo «sin respuesta: lo que se esperaría si no hay transferencia».
  - **Tocar la traza de B** abre en el texto del paso el aviso «~25 % (P11) frente a ~57 % (P10, según un agregador): no coinciden».
- Todas las cifras de las visualizaciones (14,5 m, 100 destellos, n de cada estudio) salen de INV y la ficha las cita.

## §7. Reels

> **Decisión del humano (2026-11-18): estilo de los reels = «v3 con maniquíes» (§11.4)**, elegido entre los 5 de `videos-cortos/reel/qa/comparar-estilos-sintergia.html` (piloto publicado, mentalista v2, HUD, pixel y v3). Vale para los 8 reels: el piloto se queda en su versión v3 (`salida-v3/`) y los 7 del lote se hacen igual. Se mantienen la voz, el ritmo, el volumen, las reglas 1-7 y la cuota. (S5-D, 18-11: esta sección se ha reescrito para que no quede nada del estilo v2 que contradiga §11.3 y §11.4.)

**Estilo:** el de §11.4 (v3): el lenguaje de rótulos, franjas y colores del reel v2 de mentalista (D1), con maniquíes articulados de `kit-comun/v1/maniqui-articulado.js` que hacen lo que dice cada frase, sobre fondo `#0E1220`. De la skill `reel-divulgativo` (`C:/Users/migue/videos-cortos`) se mantienen la voz Gemini Orus, 3,2-3,6 palabras/s, −14 LUFS, los subtítulos quemados en dos franjas y el cierre con el móvil.
- **Dónde se construyen:** en `videos-cortos/reel/reels/sintergia-<id>/` (`guion-v3.json`, `escena-v3*.js`, `FICHA-v3.md`, `salida-v3/`).
- **Cómo llegan al sitio:** con `scripts/importar-reels.mjs --variante v3` → `content/reels.json` + `public/reels/`.
- **El plan de cada reel** (qué hace cada maniquí en cada frase) está en FICHAS.md §S5, y las piezas comunes en `kit-comun/v1/escena-maniquies.js` y `atrezo-sintergia.js`.
- **En la página de concepto** el reel va lo primero, a todo el ancho y sin transcripción visible: lo dice §11.3, que sustituye al orden de S4-D (reel tras «Para recordar», botón «Ver el reel», transcripción desplegable y dos columnas). La transcripción sigue en `reels.json` y en el DOM con `.oculto`. Las fuentes del reel van en una línea visible bajo el vídeo.

**El reel del piloto es el v3** (`salida-v3/sintergia-potencial-transferido-v3.mp4`), aprobado por el humano al elegir el estilo el 18-11:
- voz y texto congelados, los de `guion-v2.json`, sin gastar cuota de Gemini;
- la excepción de Q1 en la frase 1 («catorce metros y medio» frente a «14,5») queda aceptada solo para el piloto. Los 7 del lote ponen las cifras en `voz` y no tienen excepciones;
- sustituye en `public/reels/` al v1 del 14-11 (E0 de FICHAS §S5), recomprimido a ≤ 5 MB. Su entrada de `reels.json` usa `concepto`, con el mismo id;
- no se vuelve a renderizar ni se toca su escena.

**Cuántos:** 8 (1 piloto + 7 de lote), uno por ficha marcada «sí» o «piloto» en §2. Piloto: `potencial-transferido`. Lote: `que-es-la-teoria-sintergica`, `replicas-del-potencial-transferido`, `epr-en-el-cerebro`, `sintergia`, `lattice`, `patron-de-interferencia`, `procesador-central`. Las otras 7 fichas no llevan reel: se eligieron las que tienen una pregunta que engancha sin vender nada.

**Reglas propias de este sitio (por encima de las de la skill):**
1. **El gancho es una pregunta o un hecho verificable, nunca la tesis de Grinberg afirmada.** Sí: «En 1994 un investigador mexicano dijo haber medido en un cerebro una respuesta parecida a la de otro, a 14,5 metros» (P11; «sincronizarse» no es lo que dice INV). No: «Tu cerebro está conectado al de los demás».
2. **Cada reel dice su nivel de respaldo en voz,** con las palabras de §4 («esto es especulativo», «nadie lo ha replicado de forma robusta»), y antes del último tercio.
3. La respuesta contundente de la estructura de la skill es **sobre el estado de la evidencia**, no sobre la idea.
4. **Cierre:** el móvil muestra el título del reel, nunca la tesis. Llamada final: «Sígueme para más ciencia de la mente» (provisional, ver §9).
5. `guion-fuentes.md` usa los códigos de INV. Nada sin fila.
6. Rótulos y colores del reel: los del reel v2 (cian = correcto, coral = error, oro = foco). Las ideas de Grinberg **no se pintan en cian** (cian = verificado); van en oro (foco) o en el acento neutro. **En los reels v3 (§11.4 D4):** ninguna idea de Grinberg sale en cian, y la que se dibuja va en oro **discontinuo** con «según Grinberg» o «según los autores» a la vista. Los datos van en neutro brillante continuo y los maniquíes en neutros. Ningún maniquí medita, lleva halo ni emite nada.
7. Cuota de Gemini: 1 petición por reel, máximo 2. Se comparte con el rincón: el lote va de 2 en 2 por día como mucho.

## §8. QA: lista de comprobación

S6 marca cada casilla por ficha (contenido) y una vez por sitio (visual). En S4 se pasa entera sobre la ficha piloto.

**Contenido (por ficha):**
- [ ] C1. Los cuatro bloques (los tres de texto + «Fuentes») existen, en el orden y con los rótulos de §3.
- [ ] C2. «Lo que propone» está en condicional o estilo indirecto en todas sus frases.
- [ ] C3. Cada afirmación de «Lo que se sabe» tiene `ref` en INV; ninguna cifra sin fuente.
- [ ] C4. Las reservas de INV («sin verificar», DOI discrepante, «sin confirmar en el original») están escritas.
- [ ] C5. `respaldo` coincide con la tabla de §2.
- [ ] C6. Sin ninguna expresión prohibida de §4 (grep: `demostr`, `cuántic`, `pseudocien`, `realidad`, `energía`, revisando cada aparición).
- [ ] C7. Si hay cita: es la que §3 asigna a esa ficha, ≤15 palabras, literal de INV, con traducción y autores completos. Si §3 no le asigna ninguna, la ficha no tiene `cita`.
- [ ] C8. Nada de biografía ni desaparición (grep: `desapareci`, `1994` salvo como año de P11, `chamán` salvo la frase del marco de §1).
- [ ] C9. `alternativa` y `resolucion` explican la idea sin ver la imagen.
- [ ] C10. `npm run validar` en verde. Revisión del agente `revisor-de-contenido` sin problemas abiertos.

**Visual (por sitio, y por ficha nueva en S4/S5):**
- [ ] V1. `npm run build` sin errores ni avisos nuevos.
- [ ] V2. `npm run capturar` (2 temas × 2 anchos): sin huecos vacíos, rótulos recortados ni bloques invisibles; objetivos táctiles ≥ 44 px en móvil.
- [ ] V3. `npm run auditar` dentro de presupuesto; como mucho 1 contexto WebGL vivo.
- [ ] V4. `npm run validar:contraste` en verde en los dos temas.
- [ ] V5. Badge de respaldo legible sin color (rótulo en texto) y visible en móvil sin hacer scroll en la cabecera.
- [ ] V6. Pie «Esquema de una idea…» en todas las visualizaciones de `el-campo` y `la-conciencia`.
- [ ] V7. Nada de iconografía mística (§5), revisado en la hoja de contacto de capturas.
- [ ] V8. Sin animación en bucle (§6). Reproducir se para en el último paso.
- [ ] V9 (S4-D). Página de concepto en el orden fijo de §3, con «En esta página» en escritorio. La máquina empieza en el primer pantallazo a 1280 × 800, y en móvil (360 × 740) justo bajo la cabecera, con la insignia de respaldo visible sin scroll.
- [ ] V10 (S4-D). La máquina usa el mando común: pista, «Paso n de N», Reproducir, Paso y Reiniciar, flechas. Al menos un elemento tocable con `aria-label`. Los elementos `propuesta` van discontinuos y nunca en cian.
- [ ] V11 (S4-D). Portada: tarjetas por familia en el orden de §2, tarjeta «Empieza aquí» y ningún «BORRADOR» visible. `#potencial-transferido` redirige a `#/c/potencial-transferido`.
- [ ] C11 (S4-D). Validador en verde con las refs en los dos sentidos. «Lo que está en disputa» nunca está plegado. El primer punto de «Para recordar» lleva el rótulo de respaldo de la ficha.

**Reel (por reel):**
- [ ] R1. QA completa de la skill `reel-divulgativo` en verde.
- [ ] R2. Reglas 1-6 de §7 cumplidas (gancho, respaldo en voz, cierre).
- [ ] R3. Transcripción y fuentes en `reels.json`; el reel carga en la ficha y tiene póster.
- [ ] R4. Hoja de escucha para el humano y **PARADA**.

## §9. Pendiente del humano (no bloquea S4)

1. Llamada final de los reels y cuenta donde se publican (provisional: «Sígueme para más ciencia de la mente»).
2. Nombre del repositorio y del dominio de Pages (provisional: `sintergia`).
3. (sin cambios) Si se consigue texto de *La teoría sintérgica* o del PDF de *Physics Essays*/EJP (INV §5 p4-5): se podrían subir citas y cerrar las reservas de A2. Hasta entonces, las reservas se quedan escritas.

## §10. Antes y después (S4-D, 2026-11-15)

Comparación hecha sobre el código y las capturas que ya existían, sin build ni navegador:
- de software-engineer: `capturas/` y `src/main.ts`, `src/app/bloques.ts`, `src/vis/controles.ts` y `content/es/{conceptos,maquinas}`;
- de Sintergia: `qa/capturas/`, `capturas/` y `content/es/piezas/potencial-transferido.json`.

| Aspecto | Piloto S4 (antes) | software-engineer | Sintergia S4-E (después) |
|---|---|---|---|
| Navegación | Un solo scroll con las 15 fichas en línea; 14 dicen «BORRADOR» | Portada de tarjetas por familia, página por concepto, migas, rutas con anterior y siguiente | Portada de tarjetas en el orden de §2, `#/c/<id>`, migas, ruta única «El recorrido» con anterior y siguiente; los borradores no se ven |
| Cabecera | Título, insignia y párrafo de resumen | Símbolo, familia, título serif, «En una frase», «Ver el vídeo» | Símbolo, título serif, **insignia de respaldo**, «En una frase» (condicional), «Ver el reel» |
| Interactivo | `secuencia`: pista de 6 puntos y «Siguiente», sin figura | Máquina declarada en `maquinas/<id>.json`, figura tocable, mando común | `diagrama` con figura (cámaras, destellos, trazas A/B), mando común y control «Qué muestra B» |
| Lugar de la máquina | Tras el resumen; luego cita y reel antes del texto | Lo primero tras la cabecera, en el primer pantallazo | Igual que software-engineer; «Qué estás viendo» debajo |
| Texto | Tres párrafos de 575-683 car. seguidos, sin jerarquía | Bloques con forma: pasos, caja de error, cuándo sí/no, plegables, para recordar | Los tres rótulos fijos, pero con forma: pasos numerados, hallazgos con refs, disputa en caja con aviso, «Para recordar» |
| Fuentes | Lista larga, casi tan larga como el texto | Una línea al final | Lista tipada, con 3 visibles y el resto plegado; refs como chips en cada hallazgo |
| Reel | Tras la máquina, ocupa una pantalla en móvil | Enlace externo al vídeo | Tras «Para recordar», vídeo y transcripción en dos columnas, botón en la cabecera; el vídeo no cambia |
| Tipografía | La de la plantilla, párrafos densos | Newsreader + Inter, escala `--t-*`, iconos en `h2` | La de software-engineer, con la paleta de §5 |
| Color | Cada parada teñida de su acento | Casi monocromo, el acento solo en la acción | Casi monocromo; el tono contrario de `el-campo` solo en su banda de la portada |
| Escenografía | En todo el recorrido | Ninguna | Solo en la portada |

---

## §11. Retoques piloto v2 (S5-R1, 2026-11-17, Diseño-retoques-sintergia, tarea t-6f8068)

Lo pidió el humano el 2026-11-17: arreglar la portada, que en el tema oscuro todo vaya en ese tono, poner el reel lo primero en la ficha sin transcripción visible y hacer más amenas las animaciones de los maniquíes, ajustadas a lo que se narra. Además propuso usar el modelo «souls» de Sketchfab.

**Esta sección corrige** la escenografía de §5 (el tono contrario de `el-campo`), el orden de la ficha de §3 (puntos 2, 3 y 11), §7 (dónde va el reel y su transcripción) y el criterio V9 de §8. Todo lo demás de §1-§10 sigue vigente. Sobre todo el rigor: las ideas de Grinberg nunca van en cian, siempre van atribuidas, y el respaldo está a la vista sin hacer scroll.

**De dónde sale el diagnóstico.**
- Capturas `qa/capturas/portada-v4-*` y `capturas/*-c-potencial-transferido.png`, revisadas por un subagente.
- El código: `src/main.ts` (`pintarPortada`, `pintarConcepto`), `src/app/bloques.ts` (`reelHtml`), `src/estilos/*.css`, `design/tokens.css`, `src/vis/lenguaje.ts` y `content/es/familias.json`.
- **Aviso:** las capturas v4 son de cuando solo había una ficha publicada. Ahora las 15 tienen contenido y ninguna es borrador, así que la rejilla de una sola tarjeta y la franja «Próximamente» ya no salen, y la banda clara de `el-campo` (11.2) **no aparece en las capturas pero sí saldrá** en cuanto se compile.

### 11.1 Portada: crítica y arreglos por prioridad

**Crítica, de arriba abajo.**
- **(a) Columna izquierda del héroe, saturada.**
  - Lleva siete cosas seguidas: kicker, H1, bajada, dos botones, la nota «Qué es la teoría sintérgica…», el rótulo «Cuánto respaldo…» y la leyenda de cinco filas en dos columnas desiguales.
  - Debajo del botón principal se lee como un bloque de notas al pie, y la leyenda queda apretada y débil.
- **(b) Pie de la figura.** Son dos líneas de ~13 px con poco contraste («Busto abstracto hecho por código…»): es la aclaración que menos importa y la que más cuesta leer.
- **(c) Móvil (360).**
  - El busto va primero y ocupa ~45 % del primer pantallazo, así que el H1 baja.
  - La bajada queda después de los botones, al revés que en escritorio.
  - La leyenda, a una columna, ocupa ~130 px antes de la primera familia.
- **(d) Halo del héroe en oscuro.** Es un degradado gris azulado claro detrás del busto: `color-mix(acento 45 %)` en `.parada-capa:not([data-imagen])`. En oscuro es la zona de tono más distinto de la página (ver 11.2).
- **(e) Bandas de familia.** Solo llevan h2 y descripción. Nada dice cuántas fichas hay ni que la segunda banda ya es especulativa, salvo el tono contrario, que se quita en 11.2.
- **(f) Pie.**
  - «Este sitio explica ideas; no las avala» va en letra muy pequeña, y es el aviso más importante del sitio.
  - «Límites» sale dos veces, en la barra superior y en el pie.

**Arreglos, por orden de prioridad.**
- **P1. Quitar la banda clara de `el-campo` en oscuro.** Ver 11.2 (B1). Es lo que más se ve y lo que pidió el humano.
- **P2. Descargar el héroe.**
  - La columna queda en: kicker, H1, bajada (≤ 2 líneas a 1280) y los dos botones.
  - La nota «Qué es la teoría…» pasa a ser el subtítulo de la tarjeta «Empieza aquí», no un párrafo suelto.
  - **La leyenda de respaldo sale del héroe:** va en una franja propia, justo debajo y a todo el ancho de la columna, con los 5 niveles en una fila, cada uno con sus segmentos y su rótulo. En móvil va en dos filas o con scroll horizontal real (`overflow-x: auto`), nunca como lista de cinco filas.
- **P3. Móvil: el texto primero.**
  - Orden: kicker, H1, bajada, botones y luego la figura.
  - La figura, con `max-inline-size: 70vw` y centrada.
  - Criterio: a 360 × 740 el H1 y el botón «Empieza aquí» entran en el primer pantallazo.
- **P4. Figura del héroe: el modelo «souls».**
  - Sustituye al busto hecho por código (11.5).
  - El pie de figura pasa a ser solo la atribución CC BY, en `--t-xs` con `--texto-secundario`, que cumple AA.
  - El texto «no es un retrato» se queda en `figura_aria`.
- **P5. Las bandas dicen lo que el tono ya no dice.**
  - Cada encabezado lleva un kicker en texto con el número y el recuento, p. ej. «2 · 6 fichas · Especulativo».
  - La de `el-campo` lleva además un filete superior **discontinuo**, el mismo código que `rol: "propuesta"` en las máquinas: «aquí empieza lo postulado».
  - Textos nuevos en `ui.json` (`portada.kicker_familia` con `{n}`, `{fichas}` y `{respaldo}`). El rango de respaldo se calcula a partir de las fichas, no se escribe a mano.
- **P6. Ritmo vertical.**
  - Entre bandas, `--e16` fijo; dentro de una banda, `--e6` entre el encabezado y la rejilla.
  - Rejilla de 3 columnas a ≥ 1024 px y de 2 a ≥ 640 px. Con 5, 6 y 3 fichas queda en 3+2, 3+3 y 3, sin huecos de una tarjeta suelta en fila de cuatro.
  - Criterio: ninguna fila con más del 50 % vacío.
- **P7. Pie.**
  - El aviso «explica ideas; no las avala» en `--t-sm`, como primera línea del pie.
  - «Límites» solo en la barra superior. En el pie, como enlace dentro de la propia frase («Fuentes y límites»).
- **Qué no se toca:** el orden de las familias de §2, las entradas `corte` y `deriva`, el titular y la bajada de `ui.json` (solo cambia dónde van), las tarjetas en sí y la regla de que en la página de concepto no hay escenografía.

### 11.2 Tema oscuro: todo en el mismo tono

**Qué significa «mismo tono», como criterio comprobable.**
- En oscuro, todo fondo pintado (sección, banda, tarjeta, caja, figura, lienzo, póster, control) es uno de `--oscuro-fondo`, `--oscuro-fondo-elevado` o `--oscuro-fondo-hundido` (H ≈ 225°, L ≤ 14 %), o una mezcla de esos con el acento de la familia **al 16 % como mucho**.
- Ningún fondo con L > 20 % ni con un tono fuera de 215-235° que no sea esa mezcla.
- Interpreto que los tres niveles de elevación del mismo azul tinta están permitidos (son el mismo tono). Lo que el humano rechaza son las zonas claras o de otro color.

**Componentes que hoy lo rompen:**

| # | Componente | Dónde | Qué pasa | Arreglo |
|---|---|---|---|---|
| B1 | Banda de `el-campo` | `content/es/familias.json` → `escena.tono: "claro"`; `design/tokens.css:217-218` `[data-tono="claro"]` | En oscuro, toda la banda de las 6 fichas sale con el fondo claro `#F6F7FA`, y los velos `suave` (`--velo-desde`) degradan de tinta a blanco. | Quitar `tono` de la familia; el aviso pasa a P5. Si `validar-contenido.mjs` o el schema exigen algo, solo se quita la propiedad: el soporte de `tono` en el motor se queda, sin usar. |
| B2 | Velos entre bandas | `src/main.ts:276-293` (`aplicarColorDeEscena`) | Con B1 dejan de hacer falta, porque no hay cambio de tono. | Quitar `velo` de `la-conciencia` y `el-campo`. El código se queda. |
| B3 | Halo de la cubierta | `src/estilos/escenografia.css:180-186` (`acento 45 %`) | Mancha gris azulada clara detrás de la figura, ~0-50 % de la portada en escritorio. | En oscuro, `color-mix(acento 14 %)`. El valor nuevo va en `design/tokens.json` como token, no suelto. |
| B4 | Halo del héroe | `src/estilos/ficha.css:136` (`acento 30 %`) | Lo mismo, tras la figura. | El mismo token de B3. |
| B5 | Neutros de las visualizaciones | `src/vis/lenguaje.ts:105-107`: `neutro #A8A39A` y `senal #EDEBE6` en oscuro (`#5C5850` y `#1A1917` en claro) | Son grises **cálidos** (H ≈ 40°), heredados de la plantilla, sobre el fondo azul tinta: trazos y rótulos de todas las máquinas en otro tono. | En oscuro, `--oscuro-texto-secundario` `#9EA8C0` para neutro y `--oscuro-texto` `#EEF1F8` para señal; en claro, sus equivalentes `--claro-*`. Mejor leídos de las variables CSS que duplicados. Es un cambio en `lenguaje.ts`: afecta a todas las máquinas por igual, que es lo que manda la regla 3. |
| B6 | `ondas.ts` | `src/vis/mecanicas/ondas.ts:87` (`senal = '#000'`) | Es un valor por defecto. Si no se sobrescribe antes de pintar, el canvas pinta en negro puro. | Que lo tome de `lenguaje.ts` como el resto. Hay que comprobarlo en el código. |
| B7 | Respaldo sin JavaScript | `design/tokens.css:267-278` | El bloque de `prefers-color-scheme: dark` solo copia 8 variables. Faltan `--enlace`, `--accion`, `--sobre-accion`, `--sombra` y `color-scheme: dark`, así que sin JS los botones primarios y los enlaces salen con el color del tema claro y los controles nativos salen blancos. | Completar el bloque con las 12 variables y `color-scheme`. |
| B8 | Póster y vídeo del reel | `public/reels/potencial-transferido.webp` / `.mp4` | Fondo negro con halo ámbar, que no es azul tinta. | No se toca en CSS. El reel v3 sale sobre `#0E1220` (11.4, criterio R-v3-9). Hasta entonces, el marco `.reel video` va en `--fondo-hundido`, sin borde claro. |
| B9 | Lienzo dentro de la máquina | `.maq` (`--fondo-elevado`) con `.vis-lienzo` (`--fondo-hundido` y la retícula de puntos) | Se ve como un panel más claro con un hueco casi negro dentro. Es el mismo tono, pero tiene mucho salto. | El lienzo pasa a `--fondo`; el marco sigue en `--fondo-elevado`. |
| B10 | Cubierta en claro | `src/estilos/ficha.css:142` | No rompe el oscuro. | No se toca. Se cita para que nadie la confunda con B3. |

Las cajas de cita, disputa, «Para recordar», «Relacionados» y «Fuentes» usan `--tinte` (acento ≤ 16 % sobre el fondo elevado) o `--aviso-tinte`: cumplen. Solo hay que verificar que `--aviso-tinte` en oscuro cumpla el criterio. Si no lo cumple, se baja su porcentaje en `tokens.json`.

**Vigilancia que bloquea (regla 6).** `capturar-sitio.mjs` recorre, en tema oscuro, todos los elementos con `background-color` o `background-image` calculados y no transparentes, y falla si alguno incumple el criterio de arriba. Para un degradado se mira el color de cada parada del degradado. Los `<video>`, `<img>` y `<canvas>` se excluyen: se miden aparte, por muestreo de píxeles en la captura (luminancia media < 20 %).

### 11.3 Ficha: el reel lo primero y sin transcripción visible

> **Decidido por el humano 2026-11-17 (corrige el orden y la maqueta de abajo):**
> 1. **El vídeo va lo primero, arriba del todo y a todo el ancho, también en móvil.** Debajo: h1 + insignia + «En una frase». Anula el «h1 e insignia antes que el vídeo» y la maqueta de dos columnas de esta sección.
> 2. **Oscuro:** el mismo azul tinta con 3 elevaciones (como en 11.2). No hace falta ninguna fila más en B9.

**Orden nuevo**, solo para las 8 fichas con reel. Las 7 sin reel siguen como en §3.
1. Migas.
2. Cabecera: símbolo, `h1` e insignia de respaldo. «En una frase» y el botón «Ver el reel» salen de aquí.
   - **«En una frase» pasa debajo del reel.**
   - **El botón «Ver el reel» se elimina**, porque el reel ya está en el sitio al que llevaba.
3. **El reel:** vídeo vertical, póster, `controls`, `preload="none"`, `playsinline`. **Sin `autoplay`:** nada se mueve sin que lo pida el visitante (§6). Debajo, una línea con sus fuentes (rigor: «Fuentes del reel: …», visible).
4. «En una frase».
5. La máquina, y luego todo como en §3, del punto 4 en adelante.

**Por qué el `h1` y la insignia van antes que el vídeo:**
- La insignia tiene que verse sin scroll (V5): es la regla de rigor que dice cuánto respaldo tiene lo que el vídeo cuenta.
- El `h1` es el nombre de la página para el lector de pantalla y para el título.
- Por eso el reel es «lo primero» del contenido, no del documento.

**Maqueta:**
- **Escritorio (≥ 1024):**
  - Dos columnas en la cabecera: el vídeo a la izquierda (`inline-size: 300px`, 9:16, unos 533 px de alto) y a su derecha las migas, el `h1`, la insignia y «En una frase».
  - La máquina empieza debajo. En la práctica se ve el borde de su cabecera a 1280 × 800.
  - **V9 se corrige para las fichas con reel:** «el reel y la insignia en el primer pantallazo; la máquina empieza en el segundo».
- **Móvil (360):**
  - Migas, `h1` e insignia compactos. Después el vídeo a ancho completo con `max-block-size: 70svh`, así que a 360 de ancho sale centrado a unos 290 px.
  - Criterio: insignia y póster visibles sin scroll a 360 × 740.

**Accesibilidad sin transcripción visible:**
- **La transcripción sigue en el DOM, oculta solo a la vista,** con la clase `.oculto` que ya existe (`src/estilos/sitio.css:58`).
  - Va en un `<div id="reel-texto-<id>" class="oculto">` con el encabezado `bloques.transcripcion` y las frases.
  - El `<video>` lleva `aria-describedby` apuntando a él.
  - Así cuenta como alternativa del medio para quien usa lector de pantalla (WCAG 1.2.1 y 1.2.3, nivel A).
- **No se usa un desplegable:** el humano pidió «sin transcripción», y un `<details>` cerrado sigue siendo una transcripción en pantalla.
- **Las personas sordas tienen los subtítulos quemados** del estilo v2 (reel-divulgativo), que reproducen la locución palabra a palabra (las dos franjas). Queda anotado como requisito: **un reel sin subtítulos quemados no puede ir en la ficha.**
- `aria-label` del vídeo = `reel.descripcion` (ya existe).
- **Riesgo aceptado:** quien ve, oye mal y no puede reproducir vídeo no tiene texto a la vista. Se mitiga con «En una frase» y el resto de la ficha, que cubren lo mismo con más detalle.
- **Índice «En esta página»:** «El reel» pasa a ser la primera entrada.
- **`reels.json` no cambia:** `transcripcion` se sigue generando y usando.

### 11.4 Reel piloto v3: maniquíes amenos y ajustados a cada frase

**Qué hay ahora.**
- El vídeo publicado (`public/reels/potencial-transferido.mp4`, 51 s, 2026-11-14 19:25) sale de `escena.js` y `guion.json`, que usan el kit `rincon-kit`. Sus figuras son peones o cápsulas que casi no se mueven: aparecen, se iluminan y desaparecen.
- Hay otras dos variantes renderizadas que no se publicaron:
  - `escena-v2.js`: lenguaje mentalista v2, con columnas y esferas en lugar de personas;
  - `escena-hud.js`: con `kit-hud/maniqui.js` 0.2, cápsulas con solo dos poses, `pie` y `sentado`.
- **El problema de fondo:** ningún kit tiene un maniquí articulado con gestos, así que las figuras no pueden «hacer» lo que dice la frase.

**Decisiones.**
- **D1. Base de la v3:** `escena-v2.js`, el lenguaje de §7 (estilo publicado de mentalista v2), con las mismas franjas de rótulos, zonas prohibidas y colores. Se le añaden personas. Se descarta el HUD porque no es el estilo de §7.
- **D2. Maniquí articulado nuevo,** en `videos-cortos/reel/escena/kit-comun/v1/maniqui-articulado.js`. Es un cambio aditivo: no toca `kit-hud/maniqui.js` ni a quien lo usa, y va a `kit-comun` porque lo van a usar los 7 reels del lote.
  - **Articulaciones:** pelvis, torso, cuello, cabeza, y en cada lado hombro, codo, cadera y rodilla. Mano y pie van como remate, sin articulación.
  - **Contrato:** `crearManiqui({ nombre, tono, escala })` → `{ obj, gesto(nombre, t0, dur, opciones), mirar(punto, t0), andar(desde, hasta, t0, dur), pintar(t), poses(t) }`.
  - Todo es función cerrada de `t`: sin `Math.random` ni reloj. `poses(t)` devuelve los ángulos, para la QA.
  - Entre gestos, transición con `eio` ≥ 250 ms. Nunca un salto de pose.
  - **Catálogo mínimo (12):** `hablar` (mano abierta que acompaña), `asentir`, `negar`, `encogerse`, `pensar` (mano a la barbilla), `taparse-ojos`, `sobresalto` (la cabeza atrás 8°, 200 ms), `mirar-alterno`, `señalar`, `sentarse` y `levantarse`, `andar` (ciclo de paso que avanza con la distancia: los pies no patinan), `saludar`.
  - **Aspecto:** cápsulas lisas en el neutro del reel, sin cara.
    - A, la que ve la luz: neutro claro.
    - B: neutro algo más oscuro.
    - Investigador: neutro con una tablilla.
    - **Nada de halos, ojos ni posturas de meditación** (§5).
- **D3. Voz congelada.** El texto de `guion-v2.json` no cambia: se reutilizan su voz y sus anclas por palabra de `trabajo-v2`. **Sin petición a Gemini.** La duración sigue en ~51 s.
- **D4. Rigor en la imagen:**
  - Tras la separación, ninguna línea, hilo ni partícula une a A con B. Dibujar la conexión sería presentar la tesis como hecho, y el hilo oro de v2 se quita.
  - La respuesta de B solo en oro y discontinua, con el rótulo «según Grinberg» visible todo el tiempo que esté.
  - La de A en neutro brillante y continua: es el dato. **Nada en cian.**

**Mapa frase → acción.** Entre paréntesis, la palabra ancla (`escena:palabra`) en la que empieza cada acción.

| # | Frase (resumida) | Qué hacen los maniquíes | Apoyo y rótulos |
|---|---|---|---|
| 1 | «En 1994, un investigador mexicano dijo haber medido… a catorce metros y medio» | A y B de pie, frente a frente, charlando: `hablar` alterno, y B `asentir` (gancho). En (`medido`), A gira la cabeza a cámara y le aparece un casquete de electrodos. En (`otro`), B se da la vuelta y se aleja con `andar` hacia la derecha. En (`metros`), B se para y se gira. | Regla que se despliega entre los dos con «14,5 m» al llegar B; «1994 · Physics Essays». |
| 2 | «¿Puede un cerebro responder a una luz que no ve?» | En (`cerebro`), B se `encoge` de hombros, mirando a cámara. En (`luz`), destello frente a A, y A tiene un `sobresalto` leve. En (`ve`), B hace `taparse-ojos`. | Titular «¿Responde sin ver la luz?» en oro. |
| 3 | «La respuesta corta: nadie lo ha replicado de forma robusta. Está en disputa.» | Entra el investigador con su tablilla junto a una balanza. En (`nadie`), `negar`. En (`robusta`), pone un peso en la balanza, que oscila. En (`disputa`), `pensar`. | «Sin réplica robusta» en coral; «Respaldo: disputado». |
| 4 | «Dos personas interactúan un rato, y luego se separan, cada una en una cámara aislada.» | En (`interactúan`), A y B `sentarse` frente a frente y conversan con `hablar` alterno, dos turnos o más, con bocadillos vacíos. En (`separan`), `levantarse` y `andar` cada uno hacia un lado. En (`cámara`), cada uno entra en su cabina. En (`aislada`), se cierra la malla de Faraday. | Pasos 1-2; «Cámaras de Faraday». |
| 5 | «A una le muestran cien destellos… su cerebro responde. Según Grinberg, en la otra… aparecería una respuesta parecida.» | Desde (`destellos`), una pantalla frente a A destella (contador 1 → 100 acelerado) y A tiene un `sobresalto` breve cada pocos destellos. En (`responde`), traza continua sobre la cabeza de A. En (`Grinberg`), corte a B, sentado, quieto y con los ojos tapados. En (`aparecería`), traza oro discontinua sobre B con «¿?». | Pasos 3-4; «Potencial transferido» en oro, con «según Grinberg». |
| 6 | «Pero las cifras no cuadran: … veinticinco por ciento…; otro, más de la mitad de catorce sujetos.» | El investigador sostiene dos hojas. En (`cuadran`), `mirar-alterno` entre las dos y `encogerse`. En (`veinticinco`), crece la barra del 25 %. En (`catorce`), aparece una fila de 14 maniquíes pequeños y se iluminan 8 (más de la mitad ≈ 57 %). | «~25 % (1994)» · «~57 % de 14: dato de un agregador»; «Dos cifras que no coinciden» en neutro. |
| 7 | «Las réplicas dan resultados mixtos, y una de ellas no encontró el efecto.» | Tres parejas pequeñas (S2, S3, S8) repiten en miniatura la escena de las cabinas. En (`mixtos`), las dos primeras muestran en B una señal que parpadea y no se fija: ninguna se queda encendida. En (`encontró`), en la tercera la traza de B se queda plana y su investigador se `encoge`. | «Réplicas: resultados mixtos»; «Una, sin efecto» en coral. Sin atribuir a S2 ni a S3 ningún resultado concreto. |
| 8 | «Lo abierto no es qué propuso Grinberg, sino si sus datos lo sostienen.» | En (`propuso`), la traza oro de B aparece pequeña, arriba. En (`datos`), las barras y la fila de 14 caen en la balanza, que oscila y no se asienta. El investigador, de brazos cruzados, `pensar`. | «¿Lo sostienen los datos?» |
| 9 | «Envíaselo a alguien curioso, y sígueme…» | En (`Envíaselo`), A saca el móvil y lo enseña a cámara, con el título del reel. En (`sígueme`), `saludar`. | Móvil con el título; «Sígueme para más ciencia de la mente». |

**Criterios comprobables (R-v3).**
- **R-v3-1.** Cada una de las 9 frases tiene al menos una acción de maniquí que empieza a ±150 ms de una palabra de esa frase.
  - Los anclajes están en `FICHA-v3.md`, en una tabla «frase | ancla | gesto | maniquí».
  - Lo comprueba un script que cruza `poses(t)` con las anclas del plan.
- **R-v3-2.** Ningún maniquí en plano está quieto más de 2,5 s: en cualquier ventana de 2,5 s, la suma del cambio angular de sus articulaciones es > 15°.
  - Se muestrea `poses(t)` cada 0,1 s.
  - Excepción: B en la frase 5 tras (`Grinberg`). La quietud es el contenido («no ve nada») y va anotada.
- **R-v3-3.** Al menos 8 gestos distintos del catálogo usados en el reel.
- **R-v3-4.** Sin saltos: entre dos muestras de 1/30 s, ninguna articulación cambia más de 12°.
- **R-v3-5.** Determinismo: la misma `t` da las mismas `poses(t)`, en dos ejecuciones.
- **R-v3-6.** Rigor (D4), por inspección del código y de la hoja de contacto:
  - tras (`separan`), ningún objeto une a A con B;
  - la traza de B es oro y discontinua, y sale con el rótulo «según Grinberg»;
  - nada en cian.
- **R-v3-7.** QA de `reel-divulgativo` en verde (ritmo, −14 LUFS, subtítulos, solapes, cajas con `window.__cajas`) y la regla 1-6 de §7.
- **R-v3-8.** Hoja de contacto con un fotograma por frase, tomado en su palabra ancla. Un subagente revisor contesta, frase por frase, «¿lo que hacen los maniquíes ilustra esta frase?». Hace falta 9/9 «sí».
- **R-v3-9.** Fondo base del vídeo `#0E1220` (el azul tinta del sitio), con halos ≤ 20 % y nunca un fondo claro. El póster sale del mismo plano.
- **R-v3-10.** PARADA: la hoja de escucha y visionado va al humano antes de importar con `importar-reels.mjs`.

**Los 7 reels del lote: sí hay que cambiar su plan de escena.**
- Sus `FICHA.md` describen objetos («retícula que gira», «lupa que no encuentra nada»), no una acción por frase.
- Las escenas llevan los nombres fijos del motor (`mecanismo`, `replicas`…) aunque el contenido no tenga réplicas. Con ese plan saldría el mismo problema que con el piloto.
- **Cuándo:** cuando el humano apruebe la v3, y antes de su voz (todavía no la tienen, así que no cuesta cuota). A cada `FICHA.md` se le añade:
  - el mapa frase → acción, con el mismo formato que la tabla de arriba;
  - los criterios R-v3-1 a R-v3-9.
- **Regla de reparto:** salen maniquíes cuando la frase habla de personas (sujetos, investigadores, quien percibe). En las frases puramente teóricas, como mucho el investigador que busca, mide o duda. **Nunca un maniquí «meditando», con halo o emanando nada** (§5).

| Reel | Cambio de plan |
|---|---|
| `que-es-la-teoria-sintergica` | Un maniquí lector recorre el mapa de respaldo de nivel en nivel (`andar` y `señalar`) a medida que se nombra cada uno. |
| `replicas-del-potencial-transferido` | Reutiliza las parejas en cabina de la frase 7 del piloto: una por estudio, en el orden de la frase. |
| `epr-en-el-cerebro` | Las parejas A y B, más el investigador que `señalar` la nota «lo que exigiría una prueba de Bell». Las cosas de física, en neutro. |
| `sintergia` | El investigador junto al eje; `mirar-alterno` entre los dos polos. Sin personas «más sintérgicas». |
| `lattice` | El investigador con lupa busca en la retícula (`andar` y `pensar`) y `encogerse` en «sin detector». |
| `patron-de-interferencia` | Maniquí observador con las ondas delante; `pensar`. Nada que salga de su cabeza. |
| `procesador-central` | El investigador ante las capas concéntricas, fuera de ellas. **Prohibido el maniquí sentado en el centro.** |

### 11.5 Modelo 3D «souls» (Sketchfab) en el héroe

**Qué es:**
- «souls», de Hermetic Bucky (@Ianbucky_): https://sketchfab.com/3d-models/souls-e1ea2db7ab6f4b7989375a91c38f19a3
- Licencia CC BY 4.0, 62 k triángulos, 6 texturas, sin animación.
- Lo propone el humano.

**Dónde va:** en el héroe de la portada, en el hueco `#figura` (cuadrado, ya reservado), en lugar del busto de `crearBusto` en `src/vis/hero-figura.ts`.
- Se conservan el entorno, el halo (con el token de B3/B4) y la carga diferida que ya existe: `import()` al entrar en pantalla y `destruir()` al salir (`main.ts:246-273`). Con eso, a la vez hay un solo contexto WebGL vivo.
- La silueta SVG sigue ocupando el hueco mientras carga y sirve de respaldo sin WebGL.

**Conversión:**
```
node scripts/optimizar-modelo.mjs assets-originales/souls.glb public/modelos/souls.glb --sin-texturas --triangulos 25000
```
- **Sin texturas:**
  - lo ilumina el material propio de la escena, en bronce o en un monocromo que siga el acento de `marco`, igual que el busto;
  - las 6 texturas de color son las que más pesan y las que más pueden «vender» (§5).
- **Diezmado de 62 k a 25 k triángulos** con métrica de error, y cuantizado y meshopt, que el guion ya aplica.

**Presupuesto:**
- el `.glb` servido ≤ 1 MB;
- Three.js y el modelo fuera del JS crítico, pedidos solo al entrar en pantalla (`three_no_bloquea_pintado`);
- LCP ≤ 2,5 s en «móvil de gama baja»: el LCP es el H1, no el modelo;
- en móvil, `devicePixelRatio` máximo de 1,5.

**Atribución (CC BY: título, autor, fuente, licencia y cambios):**
- **Pie de la figura** (`ui.json` → `portada.figura_credito`, que se reescribe): «“souls”, de Hermetic Bucky (Sketchfab), CC BY 4.0. Modificado: sin texturas y simplificado.», con enlaces al modelo y a la licencia.
- **`assets-originales/CREDITOS.md`:** una entrada con la plantilla y el comando literal. La sección «Figura de la portada» se reescribe, porque ya no es «hecho por código».
- **`portada.figura_aria`:** describe lo que se ve, una vez visto el modelo, y mantiene la frase «una evocación, no un retrato».

**Riesgo, y lo decide el humano:**
- Por el nombre, «souls» puede leerse como iconografía mística (almas, figuras etéreas), que §5 prohíbe («nada de místico»).
- Quitar las texturas y usar el material propio reduce ese riesgo, pero no lo elimina.
- **Criterio:** captura del héroe en los dos temas con el modelo convertido. La aceptación de §5 la da el humano. Si no pasa, se vuelve al busto, que se queda en el código como respaldo hasta entonces.

**Descarga (la hace el humano):**
- En Sketchfab, «Download 3D Model» → formato **GLB**.
- Se guarda en `C:\Users\migue\sintergia\assets-originales\souls.glb`.
- Si solo se ofrece glTF en zip, se descomprime en `C:\Users\migue\sintergia\assets-originales\souls\` y se avisa: el guion espera un `.glb`, y hay que empaquetarlo antes.

### 11.6 Criterios de QA añadidos a §8

- [ ] V12. En tema oscuro, ningún fondo incumple 11.2. Lo comprueba `capturar-sitio.mjs` y bloquea.
- [ ] V13. Portada a 360 × 740: H1 y «Empieza aquí» en el primer pantallazo. A 1280: la leyenda en una fila y ninguna fila de la rejilla con más del 50 % vacío.
- [ ] V14. Ficha con reel: reel e insignia en el primer pantallazo (1280 × 800 y 360 × 740); sin transcripción visible; `aria-describedby` del vídeo apuntando a la transcripción `.oculto`; sin `autoplay`.
- [ ] V15. Atribución CC BY de «souls» en el pie de figura y en `CREDITOS.md`; captura del héroe aprobada por el humano (§5).
- [ ] R5. Criterios R-v3-1 a R-v3-10 en el piloto y, después, en cada reel del lote.
