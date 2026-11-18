# Sintergia

Los conceptos de Jacobo Grinberg y lo que se sabe de ellos

Sitio divulgativo dirigido por contenido, con visualizaciones interactivas. Vite + TypeScript
estricto + Three.js, sin framework. Se publica en GitHub Pages.

## Las seis reglas que no se negocian

1. **El contenido es datos, no código.** Cada pieza es un JSON en `content/<idioma>/piezas/`.
   Añadir contenido no debe tocar TypeScript.
2. **Ningún texto visible dentro del código.** Sale de `content/<idioma>/ui.json` vía `t()`, o de la
   ficha en `parametros`/`textos`. Lo vigila `check-idiomas.mjs` y bloquea el despliegue.
3. **Toda visualización pasa por `src/vis/lenguaje.ts`.** Es lo que hace que N piezas distintas se
   sientan del mismo sistema. Una pieza que necesita saltarse una regla del lenguaje está mal, o la
   regla lo está; no se arregla con una excepción local.
4. **Un solo contexto WebGL vivo a la vez.** Lo garantizan `destruir()` en `escena3d.ts` y el
   desmontaje al salir de pantalla en `main.ts`. Lo comprueba `auditar.mjs`.
5. **Ningún efecto puede dejar contenido invisible.** El estado final de una entrada está siempre en
   el bloque; el estado inicial solo se aplica si la escenografía arrancó. Ver abajo.
6. **Las comprobaciones bloquean el despliegue.** Un aviso que no bloquea acaba ignorándose.

## Mapa

| Dónde | Qué |
|---|---|
| `content/<idioma>/piezas/*.json` | El contenido. Una ficha por pieza. |
| `content/<idioma>/familias.json` | Las agrupaciones y sus **dos** acentos (claro y oscuro). |
| `content/<idioma>/ui.json` | Todo el texto de interfaz. |
| `content/reglas.json` | Qué valida `validar-contenido.mjs`. **Se edita esto, no el guion.** |
| `design/tokens.json` · `tokens.css` | Sistema de diseño. Los valores no se escriben sueltos en CSS. |
| `presupuestos.json` | Compromisos de rendimiento que vigila `auditar.mjs`. |
| `src/vis/lenguaje.ts` | Lenguaje gráfico común. |
| `src/vis/escena3d.ts` | Andamiaje de las escenas 3D. |
| `src/vis/registro.ts` | Despacho de mecánicas y piezas propias. |
| `src/vis/mecanicas/` | Las mecánicas parametrizadas. **Aquí debe estar la mayoría.** |
| `src/app/efectos.ts` | Registro de la escenografía: qué efectos puede pedir el contenido. |
| `src/estilos/escenografia.css` | Los efectos, enteros. Ni una animación en TypeScript. |

## Escenografía

El movimiento del documento —tono de cada parada, portadas, entradas al hacer scroll— se declara
desde la ficha de la familia y de la pieza, igual que una mecánica:

```json
"escena": { "tipo": "cubierta", "tono": "oscuro", "velo": "grano", "entrada": "deriva" }
```

Los valores válidos están en `src/app/efectos.ts` y `validar-contenido.mjs` los comprueba contra el
contenido: un efecto que no existe no compila.

**El reparto, y no se cruza:** `src/app/escenografia.ts` publica dos cosas —`data-visto` cuando un
bloque entra en pantalla y `--avance` (0→1) en las paradas que lo piden— y nada más.
`escenografia.css` hace el efecto. Si hay que animar algo desde TypeScript, casi siempre es que el
efecto está mal planteado.

**Las tres reglas del movimiento:**

1. **Solo se anima `opacity`, `transform`, `filter` y las máscaras.** Animar `height`, `top` o
   `margin` recalcula la maqueta en cada fotograma y sube el CLS. `capturar-sitio.mjs` recorre el
   CSS real y falla si aparece una de esas —o un `transition: all`—.
2. **El estado inicial solo existe si el motor está vivo** (`[data-escenografia="viva"]`). Sin
   JavaScript, o con `prefers-reduced-motion`, el sitio se ve entero y quieto. El fallo contrario
   —contenido en opacidad 0 para siempre— no da ningún error y deja la página en blanco.
3. **Nada que oculte un bloque puede tocar su geometría.** Un `clip-path` a cero deja al
   `IntersectionObserver` sin intersección: el bloque no entra nunca, y además no se monta la
   visualización que tenga dentro. Por eso `corte` usa máscara y no recorte.

Y una cosa que esta plantilla **no** copia de los sitios de los que sale la idea: atenuar
permanentemente el texto que no está en foco. Es vistoso y es exactamente lo que prohíbe la nota de
`atenuado` en `design/tokens.json`: a 0.35 un texto secundario que daba 6:1 se queda en 1.7.

## Mecánica o pieza propia

Una **mecánica** se declara desde la ficha y no toca código:

```json
"visualizacion": { "tecnica": "svg", "mecanica": "eje", "parametros": { … } }
```

Es el caso que debe ser mayoritario: el parecido de familia queda garantizado por construcción en
vez de por disciplina. Una **pieza propia** (`src/vis/registro.ts` → `PROPIAS`) solo cuando el
contenido no encaja en ninguna mecánica. Si las propias empiezan a ser mayoría, lo que falta es una
mecánica nueva, no otra excepción.

## Cuándo 3D

Solo si la comprensión depende de **profundidad, oclusión o punto de vista del observador**. Exige
`justificacion_3d` en la ficha: hay que decir por qué no vale 2D. Meter en 3D algo que no es
espacial le añade una dimensión que no tiene —aparecen oclusiones, la perspectiva distorsiona las
magnitudes que hay que comparar— y el usuario acaba gestionando una cámara en vez de pensando.

La mayoría de contenidos son relacionales, lógicos o temporales: eso es SVG, donde cada elemento es
un nodo del DOM —enfocable, etiquetable, legible por lector de pantalla y tematizable con variables
CSS—. Ver `docs/CRITERIO-TECNICA.md`.

## Comandos

```bash
npm run dev                  # desarrollo
npm run validar              # contenido + contraste + idiomas. Es lo que corre CI.
npm run build                # validar + tsc --noEmit + vite build
npm run validar:contraste -- --sugerir   # propone colores que sí pasan AA
npm run auditar              # presupuestos de rendimiento, sobre el build servido
npm run capturar             # recorre el sitio en 2 temas × 2 anchos y caza errores mudos
npm run modelo -- assets-originales/x.glb public/modelos/x.glb --sin-texturas
```

`auditar` y `capturar` necesitan el sitio compilado y servido:
`npm run build && npx vite preview --port 4173`.

## Al añadir una pieza de contenido

1. Ficha JSON en `content/<idioma>/piezas/`, con `orden` contiguo dentro de su familia.
2. Elegir mecánica existente. Si de verdad no hay ninguna, plantear una nueva antes de una propia.
3. `npm run validar`.
4. Alternativa textual y resolución: **obligatorias**, también en las piezas 2D. Si la alternativa
   no se puede escribir, la pieza no está explicando nada explicable.

## Al añadir una familia

Dos acentos, uno por tema —el modo oscuro no es invertir—, con al menos 15° de separación de tono
respecto a las demás. `npm run validar:contraste -- --sugerir` da valores que pasan AA sin cambiar
el tono.
