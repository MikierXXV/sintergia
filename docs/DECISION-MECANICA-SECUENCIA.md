# Decisión: mecánica `secuencia`

Estado: **tomada en S4** (piloto), 14-11-2026. Código: `src/vis/mecanicas/secuencia.ts`.

- Modo `pasos`: nodos numerados que se avanzan **solo** a mano (botón o tocando un nodo), nunca en
  bucle (DEC §6, V8). El texto del paso va en HTML bajo el lienzo: un SVG no reparte líneas.
- Modo `lista`: casillas marcadas o no según `estados`; para `vision-extraocular` en S5.

## Dos fallos que salieron al pasar `capturar` y una captura con la vista montada
1. **Número dentro del nodo**: en móvil el cuerpo de letra crece más que el círculo y
   `capturar-sitio` da «rótulo encima de una marca». El número va **encima** del nodo, con la misma
   fórmula que `eje` (radio + hueco + ¼ del cuerpo).
2. **Nodos sin relleno que no se podían tocar**: con `fill="none"` el interior no recibe el toque y
   lo recogía la línea de debajo. Los nodos llevan `pointer-events="all"` y las líneas `none`.
   `capturar` no lo detecta; salió al automatizar un clic.

## Ojo con las capturas de página entera
`capturar` saca la página entera con el scroll arriba y `main.ts` desmonta las visualizaciones
fuera de pantalla: en esas capturas **toda visualización sale vacía, y es lo correcto**. Para
revisarlas a ojo, captura el artículo tras `scrollIntoView` (ver `qa/`).
