/**
 * La figura de la portada: un busto de bronce con contraluz, polvo en suspensión y un campo de
 * anillos a su alrededor. Mismo formato que la figura del hero de `elrincondelarefllexion` —escena
 * Three.js cuadrada y transparente, bronce con entorno generado, halo detrás, polvo, giro atado al
 * scroll, silueta SVG mientras carga y como respaldo sin WebGL—.
 *
 * ES UN BUSTO ABSTRACTO, NO UN RETRATO. No hay ningún retrato de Jacobo Grinberg con licencia libre
 * (se buscó en Wikimedia Commons y en Wikidata: ninguna imagen) y una cara inventada sería peor que
 * ninguna: pondría rasgos que nadie le ha visto en la boca de un divulgador que dice qué se midió y
 * qué no. Así que la figura es una evocación sin rasgos, hecha por código, sin derechos de terceros
 * —ver assets-originales/CREDITOS.md— y el campo de anillos que la rodea es la idea del sitio dibujada
 * como lo que es: algo que se postula alrededor de una cabeza, no algo que se vea.
 *
 * Todo el aspecto es función de la posición de scroll, no del reloj: volver arriba devuelve la
 * escena exacta, y no hay nada que se mueva si el visitante no se mueve.
 */

import { movimientoReducido, temaActual } from './lenguaje';
import { crearEscena3D, cargarModelo } from './escena3d';
import { t } from '../app/textos';
import { siluetaFigura } from './silueta-figura';
import type { Visualizacion } from './lenguaje';

type THREE_ = typeof import('three');

const BRONCE = {
  claro: { color: 0xa87a3e, rugosidad: 0.38, metalico: 0.92, entorno: 1.15 },
  oscuro: { color: 0xa07440, rugosidad: 0.36, metalico: 0.94, entorno: 1.0 },
} as const;

/** Atmósfera invertida entre temas: sobre fondo claro lo que separa una figura es una penumbra. */
const ATMOSFERA = {
  claro: { halo: '', centro: 0.42, medio: 0.16, aditiva: false, polvo: 0, opPolvo: 0.22, opLinea: 0.85 },
  oscuro: { halo: '', centro: 0.34, medio: 0.1, aditiva: true, polvo: 0, opPolvo: 0.7, opLinea: 0.8 },
} as const;

/** «#rrggbb» → «r, g, b»: el resplandor y el polvo llevan el acento de la familia, no un gris. */
function rgbDe(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function fondoAcento(el: HTMLElement): string {
  return getComputedStyle(el).getPropertyValue('--acento').trim() || '#A9B4CC';
}

function crearEntorno(THREE: THREE_, render: import('three').WebGLRenderer, tema: 'claro' | 'oscuro') {
  const ancho = 32;
  const alto = 16;
  const datos = new Uint8Array(ancho * alto * 4);
  const cielo = tema === 'claro' ? [255, 244, 226] : [160, 168, 196];
  const suelo = tema === 'claro' ? [58, 46, 34] : [14, 12, 16];
  for (let y = 0; y < alto; y++) {
    const k = (1 - y / (alto - 1)) ** 2;
    for (let x = 0; x < ancho; x++) {
      const i = (y * ancho + x) * 4;
      for (let c = 0; c < 3; c++) datos[i + c] = suelo[c]! + (cielo[c]! - suelo[c]!) * k;
      datos[i + 3] = 255;
    }
  }
  // Dos franjas de «softbox» verticales: lo que da al bronce su lectura de metal pulido.
  for (let y = 3; y < 12; y++) {
    for (const x of [4, 5, 13, 14]) {
      const i = (y * ancho + x) * 4;
      datos[i] = 190; datos[i + 1] = 178; datos[i + 2] = 158;
    }
  }
  // Una zona clara concentrada para el especular; nunca blanco puro, o el bronce sale dorado.
  for (let y = 1; y < 4; y++) {
    for (let x = 20; x < 27; x++) {
      const i = (y * ancho + x) * 4;
      datos[i] = 206; datos[i + 1] = 196; datos[i + 2] = 178;
    }
  }
  const textura = new THREE.DataTexture(datos, ancho, alto, THREE.RGBAFormat);
  textura.mapping = THREE.EquirectangularReflectionMapping;
  textura.needsUpdate = true;
  const pmrem = new THREE.PMREMGenerator(render);
  const entorno = pmrem.fromEquirectangular(textura).texture;
  pmrem.dispose();
  textura.dispose();
  return entorno;
}

function crearHalo(THREE: THREE_, a: (typeof ATMOSFERA)['claro' | 'oscuro'], rgb: string) {
  const lado = 256;
  const lienzo = document.createElement('canvas');
  lienzo.width = lienzo.height = lado;
  const ctx = lienzo.getContext('2d')!;
  const g = ctx.createRadialGradient(lado / 2, lado / 2, 0, lado / 2, lado / 2, lado / 2);
  const parada = (v: number) => `rgba(${rgb}, ${v})`;
  g.addColorStop(0, parada(a.centro));
  g.addColorStop(0.22, parada(a.medio));
  g.addColorStop(0.55, parada(a.medio * 0.18));
  g.addColorStop(1, parada(0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, lado, lado);
  return new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(lienzo),
    blending: a.aditiva ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: false,
    transparent: true,
  }));
}

/** Busto abstracto: cabeza y mandíbula en dos volúmenes, cuello y hombros torneados y aplanados. */
function crearBusto(THREE: THREE_, material: import('three').Material): import('three').Group {
  const g = new THREE.Group();

  // Cabeza de una sola pieza (perfil de huevo, más estrecho hacia la barbilla): sin la costura que dejaban
  // dos esferas solapadas.
  const perfilCabeza: import('three').Vector2[] = [];
  for (let i = 0; i <= 32; i++) {
    const u = -1 + (i / 32) * 2;
    const r = 0.5 * Math.sqrt(Math.max(0, 1 - u * u)) * (1 - 0.24 * Math.max(0, -u));
    perfilCabeza.push(new THREE.Vector2(r, u * 0.62));
  }
  const cabeza = new THREE.Mesh(new THREE.LatheGeometry(perfilCabeza, 48), material);
  cabeza.scale.set(1, 1, 1.1);
  cabeza.position.set(0, 0.42, 0);

  const cuello = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.75, 40, 1, false), material);
  cuello.position.set(0, -0.38, 0);

  // Hombros: perfil de revolución y luego aplanado en profundidad. Un busto clásico termina en un
  // corte plano; aquí cae en una pendiente suave hacia abajo para no dejar un borde duro.
  const perfil = [
    [0.0, -1.7], [0.9, -1.7], [1.12, -1.55], [1.1, -1.25], [0.92, -1.0], [0.66, -0.88], [0.46, -0.72], [0.34, -0.6], [0.0, -0.55],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  // Suavizado: con los puntos a secas los hombros salían facetados.
  const suave = new THREE.SplineCurve(perfil).getPoints(48);
  const hombros = new THREE.Mesh(new THREE.LatheGeometry(suave, 72), material);
  hombros.scale.set(1, 1, 0.5);

  g.add(cabeza, cuello, hombros);
  return g;
}

/** Un anillo del campo: elipse inclinada, hecha de línea y no de tubo, que es lo que cuesta menos. */
function crearAnillo(THREE: THREE_, radio: number, giroY: number, color: string, opacidad: number, aditiva: boolean) {
  const rx = radio;
  const rz = radio;
  const puntos: import('three').Vector3[] = [];
  const n = 120;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    puntos.push(new THREE.Vector3(Math.cos(a) * rx, 0, Math.sin(a) * rz));
  }
  const linea = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(puntos),
    new THREE.LineBasicMaterial({
      color, transparent: true, opacity: opacidad, depthWrite: false,
      blending: aditiva ? THREE.AdditiveBlending : THREE.NormalBlending,
    }),
  );
  // El anillo vive en el plano de la imagen (XY) y se inclina solo sobre el eje vertical: así rodea la
  // cabeza como una órbita y el busto lo tapa por delante en vez de cruzarlo.
  linea.rotation.x = Math.PI / 2;
  const grupo = new THREE.Group();
  grupo.rotation.y = giroY;
  grupo.add(linea);
  return grupo;
}

function crearPolvo(THREE: THREE_, radio: number, a: (typeof ATMOSFERA)['claro' | 'oscuro'], color: string) {
  const n = 240;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = radio * (1.15 + Math.random() * 1.5);
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph) * 0.85;
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    color, size: radio * 0.014, transparent: true, opacity: a.opPolvo, depthWrite: false,
    blending: a.aditiva ? THREE.AdditiveBlending : THREE.NormalBlending, sizeAttenuation: true,
  }));
}

export async function crearHeroFigura(contenedor: HTMLElement): Promise<Visualizacion | null> {
  if (movimientoReducido()) return null;

  // El modelo se pide ANTES de crear el contexto WebGL: mientras carga no hay contexto que se pueda
  // quedar vivo si el visitante cambia de pantalla (regla 4: uno solo a la vez). Si no carga, el busto
  // generado por código es el respaldo (modelo = null).
  // Y después del primer pintado: Three.js no puede competir con el H1 (`three_no_bloquea_pintado`).
  for (let i = 0; i < 120 && !performance.getEntriesByName('first-contentful-paint').length; i++) {
    await new Promise<void>((res) => requestAnimationFrame(() => res()));
  }
  const modelo = await cargarModelo(`${import.meta.env.BASE_URL}modelos/souls.glb`).catch(() => null);
  if (!contenedor.isConnected) return null;

  const r = await crearEscena3D({
    contenedor,
    etiqueta: t('portada.figura_aria'),
    alternativaTexto: '',
    resolucionRespaldo: '',
    transparente: true,
  });
  // Sin WebGL el andamiaje deja su aviso; aquí el respaldo es la silueta, que ya cumplía ese papel.
  if ('respaldo' in r) { contenedor.innerHTML = siluetaFigura(t('portada.figura_aria')); return null; }

  const { THREE, escena, camara, render, animar, visualizacion } = r.escena3d;
  r.escena3d.controles.remove();
  contenedor.querySelector('.vis-alternativa')?.remove();

  const tema = temaActual();
  const bronce = BRONCE[tema];
  const atm = ATMOSFERA[tema];
  render.toneMapping = THREE.NoToneMapping;

  const entorno = crearEntorno(THREE, render, tema);
  escena.environment = entorno;

  const material = new THREE.MeshStandardMaterial({
    color: bronce.color, metalness: bronce.metalico, roughness: bronce.rugosidad, envMapIntensity: bronce.entorno,
  });

  const pivote = new THREE.Group();
  // «souls» (CC BY 4.0, Hermetic Bucky): sin texturas, lo ilumina el bronce propio.
  let busto: import('three').Object3D;
  if (modelo) {
    modelo.traverse((o) => { if ((o as import('three').Mesh).isMesh) (o as import('three').Mesh).material = material; });
    const medida = new THREE.Box3().setFromObject(modelo).getSize(new THREE.Vector3());
    modelo.scale.setScalar(3.4 / (medida.y || 1));
    busto = new THREE.Group();
    busto.add(modelo);
  } else {
    busto = crearBusto(THREE, material);
  }
  pivote.add(busto);
  escena.add(pivote);

  const caja = new THREE.Box3().setFromObject(busto);
  const centro = caja.getCenter(new THREE.Vector3());
  const tam = caja.getSize(new THREE.Vector3());
  busto.position.sub(centro);
  const radio = Math.max(tam.x, tam.y) * 0.5;

  // Campo de anillos en torno a la cabeza. Solo tiene su acento, no lleva texto.
  const acento = fondoAcento(contenedor);
  const campo = new THREE.Group();
  // Centrado en la cabeza y un poco detrás: los anillos asoman por los lados y por encima, y la masa
  // del busto los oculta donde se superpondrían (el depth test hace el trabajo).
  campo.position.set(0, 0.42 - centro.y, -0.3);
  campo.add(
    crearAnillo(THREE, 0.85, 0, acento, atm.opLinea, atm.aditiva),
    crearAnillo(THREE, 1.05, 0, acento, atm.opLinea * 0.7, atm.aditiva),
    crearAnillo(THREE, 1.22, 0, acento, atm.opLinea * 0.5, atm.aditiva),
  );
  pivote.add(campo);

  const rgbAcento = rgbDe(acento);
  const halo = crearHalo(THREE, atm, rgbAcento.join(', '));
  halo.scale.setScalar(radio * 3.2);
  escena.add(halo);

  const polvo = crearPolvo(THREE, radio, atm, acento);
  escena.add(polvo);

  const clave = new THREE.DirectionalLight(0xffe8c8, tema === 'claro' ? 1.5 : 1.15);
  clave.position.set(-2.4, 2.2, 3.2);
  const contra = new THREE.DirectionalLight(0xcfe0ff, tema === 'claro' ? 1.1 : 2.1);
  contra.position.set(2.6, 1.4, -3.0);
  const relleno = new THREE.DirectionalLight(0xffd9a8, tema === 'claro' ? 0.55 : 0.5);
  relleno.position.set(0.4, -2.6, 2.4);
  escena.add(clave, contra, relleno, new THREE.HemisphereLight(0xfff1dc, 0x4a3a28, tema === 'claro' ? 0.5 : 0.35), new THREE.AmbientLight(0xffffff, tema === 'claro' ? 0.3 : 0.18));

  camara.fov = 34;
  camara.aspect = 1;
  const encuadre = Math.max(tam.y * 0.5, 1.65);
  const distancia = (encuadre / Math.sin((camara.fov * Math.PI) / 360)) * 1.18;
  camara.position.set(0.25, 0.14, 1).normalize().multiplyScalar(distancia);
  camara.lookAt(0, 0, 0);
  camara.updateProjectionMatrix();
  halo.position.copy(camara.position).normalize().multiplyScalar(-radio * 1.5);
  halo.position.y += radio * 0.2;

  const GIRO = 0.7;
  const progreso = (): number => {
    const alto = document.querySelector<HTMLElement>('[data-escena="cubierta"]')?.offsetHeight ?? window.innerHeight;
    return Math.min(1, Math.max(0, window.scrollY / alto));
  };
  const BASE = -0.28;

  function medir(): void {
    const lado = contenedor.clientWidth;
    if (!lado) return;
    render.setSize(lado, lado, false);
    camara.aspect = 1;
    camara.updateProjectionMatrix();
  }
  window.addEventListener('resize', medir);
  medir();

  pivote.rotation.y = BASE + progreso() * GIRO;
  animar(() => {
    const p = progreso();
    const objetivo = BASE + p * GIRO;
    const resto = objetivo - pivote.rotation.y;
    pivote.rotation.y = Math.abs(resto) < 0.0004 ? objetivo : pivote.rotation.y + resto * 0.08;
    campo.rotation.y = -p * 0.3;
    polvo.rotation.y = -p * 0.42;
  });

  contenedor.dataset.listo = 'si';
  // Con la escena viva, el lienzo ya lleva la etiqueta: la silueta pasa a ser decorado.
  contenedor.querySelector('.silueta')?.setAttribute('aria-hidden', 'true');

  const original = visualizacion.destruir;
  return {
    destruir(): void {
      window.removeEventListener('resize', medir);
      entorno.dispose();
      halo.material.map?.dispose();
      halo.material.dispose();
      polvo.geometry.dispose();
      (polvo.material as import('three').Material).dispose();
      campo.children.forEach((g) => {
        const l = g.children[0] as import('three').Line;
        l.geometry.dispose();
        (l.material as import('three').Material).dispose();
      });
      busto.traverse((o) => { (o as import('three').Mesh).geometry?.dispose(); });
      material.dispose();
      delete contenedor.dataset.listo;
      original();
    },
  };
}
