/**
 * Mecánica «reticula-3d»: una malla tridimensional que se puede girar y que un campo deforma.
 *
 * Es 3D porque la idea es espacial: una retícula regular se reconoce al girarla, y una deformación
 * se ve de lado, no de frente (ver `justificacion_3d` en la ficha y docs/CRITERIO-TECNICA.md).
 * Sin WebGL, o con movimiento reducido, `crearEscena3D` devuelve el respaldo con la alternativa.
 *
 * Modos:
 *  - `lattice`: la malla en reposo, con el punto de vista orbitable.
 *  - `deformacion`: microdistorsiones que se suman. Cada paso fija cuántas hay (`distorsiones`) y el
 *    deslizador deja al visitante elegirlas.
 *
 * Es una propuesta, no algo observado: las aristas van en trazo discontinuo, nunca en cian.
 * Todos los rótulos llegan en `parametros`.
 */

import { crearEscena3D } from '../escena3d';
import { paletaDe, resolver, temaActual } from '../lenguaje';
import { alCambiarTema } from '../../app/tema';
import { crearMando, type Control, type Mando } from '../controles';
import type { Visualizacion } from '../lenguaje';

export interface PasoReticula {
  texto: string;
  /** Solo en modo `deformacion`: cuántas microdistorsiones hay en este paso. */
  distorsiones?: number;
}

export interface ParametrosReticula {
  familia_id: string;
  modo: 'lattice' | 'deformacion';
  justificacion_3d: string;
  /** Rótulo del deslizador de giro. */
  giro: string;
  /** Rótulo del deslizador de microdistorsiones (solo en modo `deformacion`). */
  suma?: string;
  pasos: PasoReticula[];
  alternativa: string;
  resolucion: string;
}

const N = 6; // puntos por lado
const SEPARACION = 1;
const MAX_DISTORSIONES = 20;
/** Posiciones fijas de las microdistorsiones, en índices de la malla: así el esquema es reproducible. */
const CENTROS: Array<[number, number, number]> = [
  [2, 2, 2], [3, 1, 3], [1, 3, 2], [4, 3, 1], [2, 4, 3], [3, 3, 4], [1, 1, 1], [4, 1, 4], [2, 1, 4], [4, 4, 3],
  [1, 4, 4], [3, 2, 0], [0, 2, 3], [4, 0, 2], [2, 3, 5], [5, 2, 2], [1, 2, 5], [3, 5, 1], [0, 4, 1], [5, 4, 5],
];

export async function crearReticula3d(contenedor: HTMLElement, p: ParametrosReticula): Promise<Visualizacion> {
  const r = await crearEscena3D({
    contenedor,
    etiqueta: p.alternativa,
    alternativaTexto: p.alternativa,
    resolucionRespaldo: p.resolucion,
    transparente: true,
  });
  if ('respaldo' in r) return r.respaldo;
  const { THREE, escena, camara, visualizacion } = r.escena3d;
  const deformacion = p.modo === 'deformacion';

  // ---- geometría: puntos y aristas entre vecinos ----
  const base: Array<[number, number, number]> = [];
  const centro = ((N - 1) * SEPARACION) / 2;
  const idx = (i: number, j: number, k: number): number => (i * N + j) * N + k;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) for (let k = 0; k < N; k++) {
    base.push([i * SEPARACION - centro, j * SEPARACION - centro, k * SEPARACION - centro]);
  }
  const pares: number[] = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) for (let k = 0; k < N; k++) {
    if (i + 1 < N) pares.push(idx(i, j, k), idx(i + 1, j, k));
    if (j + 1 < N) pares.push(idx(i, j, k), idx(i, j + 1, k));
    if (k + 1 < N) pares.push(idx(i, j, k), idx(i, j, k + 1));
  }

  const posiciones = new Float32Array(base.length * 3);
  const geoPuntos = new THREE.BufferGeometry();
  geoPuntos.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  const matPuntos = new THREE.PointsMaterial({ size: 0.16, sizeAttenuation: true });
  const puntos = new THREE.Points(geoPuntos, matPuntos);

  const posAristas = new Float32Array(pares.length * 3);
  const geoAristas = new THREE.BufferGeometry();
  geoAristas.setAttribute('position', new THREE.BufferAttribute(posAristas, 3));
  // Discontinuo: es una propuesta, no un objeto observado.
  const matAristas = new THREE.LineDashedMaterial({ dashSize: 0.22, gapSize: 0.14, transparent: true, opacity: 0.8 });
  const aristas = new THREE.LineSegments(geoAristas, matAristas);

  const grupo = new THREE.Group();
  grupo.add(aristas, puntos);
  escena.add(grupo);
  camara.position.set(0, 0, N * 2.3);
  camara.lookAt(0, 0, 0);

  let distorsiones = 0;
  function deformar(): void {
    const n = deformacion ? Math.min(distorsiones, MAX_DISTORSIONES) : 0;
    for (let q = 0; q < base.length; q++) {
      let [x, y, z] = base[q]!;
      for (let c = 0; c < n; c++) {
        const [ci, cj, ck] = CENTROS[c]!;
        const cxp = ci * SEPARACION - centro, cyp = cj * SEPARACION - centro, czp = ck * SEPARACION - centro;
        const dx = cxp - x, dy = cyp - y, dz = czp - z;
        const g = Math.exp(-(dx * dx + dy * dy + dz * dz) / 1.6);
        // Cada microdistorsión atrae los puntos cercanos hacia su centro: una abolladura de la malla.
        x += dx * g * 0.55; y += dy * g * 0.55; z += dz * g * 0.55;
      }
      posiciones[q * 3] = x; posiciones[q * 3 + 1] = y; posiciones[q * 3 + 2] = z;
    }
    for (let a = 0; a < pares.length; a++) {
      const q = pares[a]!;
      posAristas[a * 3] = posiciones[q * 3]!;
      posAristas[a * 3 + 1] = posiciones[q * 3 + 1]!;
      posAristas[a * 3 + 2] = posiciones[q * 3 + 2]!;
    }
    geoPuntos.attributes.position!.needsUpdate = true;
    geoAristas.attributes.position!.needsUpdate = true;
    aristas.computeLineDistances();
  }
  deformar();

  function colorear(): void {
    const pal = paletaDe(p.familia_id, temaActual());
    matPuntos.color.set(pal.acento);
    matAristas.color.set(pal.neutro);
  }
  colorear();
  const bajaTema = alCambiarTema(colorear);

  // ---- punto de vista: arrastrar o flechas; antes de tocarlo, gira despacio ----
  let giroY = 0.5;
  let giroX = 0.35;
  let manual = false;
  const canvas = r.escena3d.render.domElement;
  canvas.tabIndex = 0;
  canvas.style.touchAction = 'none';
  let previo: { x: number; y: number } | null = null;
  const alBajar = (e: PointerEvent): void => { previo = { x: e.clientX, y: e.clientY }; manual = true; canvas.setPointerCapture(e.pointerId); };
  const alMover = (e: PointerEvent): void => {
    if (!previo) return;
    giroY += (e.clientX - previo.x) * 0.01;
    giroX = Math.max(-1.4, Math.min(1.4, giroX + (e.clientY - previo.y) * 0.01));
    previo = { x: e.clientX, y: e.clientY };
  };
  const alSoltar = (): void => { previo = null; };
  const alTecla = (e: KeyboardEvent): void => {
    const paso = 0.12;
    if (e.key === 'ArrowLeft') giroY -= paso;
    else if (e.key === 'ArrowRight') giroY += paso;
    else if (e.key === 'ArrowUp') giroX = Math.max(-1.4, giroX - paso);
    else if (e.key === 'ArrowDown') giroX = Math.min(1.4, giroX + paso);
    else return;
    e.preventDefault();
    manual = true;
  };
  canvas.addEventListener('pointerdown', alBajar);
  canvas.addEventListener('pointermove', alMover);
  canvas.addEventListener('pointerup', alSoltar);
  canvas.addEventListener('pointercancel', alSoltar);
  canvas.addEventListener('keydown', alTecla);

  r.escena3d.animar((t) => {
    if (!manual) giroY = 0.5 + t * 0.15;
    grupo.rotation.y = giroY;
    grupo.rotation.x = giroX;
  });

  // ---- mando común ----
  let mando: Mando | undefined;
  const controles: Control[] = [{
    tipo: 'deslizador',
    id: 'giro',
    etiqueta: p.giro,
    min: 0,
    max: 360,
    paso: 5,
    valor: 29,
    formato: (v: number) => `${v}°`,
    alCambiar(v: number) { giroY = (v * Math.PI) / 180; manual = true; mando?.manual(false); },
  }];
  if (deformacion && p.suma) {
    controles.push({
      tipo: 'deslizador',
      id: 'suma',
      etiqueta: p.suma,
      min: 0,
      max: MAX_DISTORSIONES,
      paso: 1,
      valor: 0,
      formato: (v: number) => String(v),
      alCambiar(v: number) { distorsiones = v; deformar(); mando?.manual(); },
    });
  }
  mando = crearMando(contenedor, {
    total: () => p.pasos.length,
    ir: (i) => {
      const n = p.pasos[i]?.distorsiones;
      if (deformacion && n !== undefined) { distorsiones = n; deformar(); }
    },
    texto: (i) => p.pasos[i]?.texto ?? '',
    controles,
  });
  resolver(contenedor, p.resolucion);

  return {
    destruir(): void {
      bajaTema();
      canvas.removeEventListener('pointerdown', alBajar);
      canvas.removeEventListener('pointermove', alMover);
      canvas.removeEventListener('pointerup', alSoltar);
      canvas.removeEventListener('pointercancel', alSoltar);
      canvas.removeEventListener('keydown', alTecla);
      mando?.destruir();
      geoPuntos.dispose(); geoAristas.dispose(); matPuntos.dispose(); matAristas.dispose();
      visualizacion.destruir();
    },
  };
}
