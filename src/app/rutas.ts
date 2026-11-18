/**
 * Rutas en el fragmento (`#/...`), porque el sitio se publica en GitHub Pages, que solo sirve
 * ficheros: una ruta normal recargada daría un 404 del propio servidor.
 *
 *   #/            portada (tarjetas por familia, ruta «El recorrido»)
 *   #/c/<id>      concepto
 *   #/limites     lo que este sitio no puede decir
 *   #<id>         antiguo ancla de una pieza: se redirige a #/c/<id>
 */

export interface RutaActual {
  vista: 'portada' | 'concepto' | 'limites';
  id?: string;
}

export function rutaActual(): RutaActual {
  const [camino = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const partes = camino.split('/').filter(Boolean);
  if (partes[0] === 'c' && partes[1]) return { vista: 'concepto', id: partes[1] };
  if (partes[0] === 'limites') return { vista: 'limites' };
  return { vista: 'portada' };
}

export function enlace(r: RutaActual): string {
  return r.vista === 'concepto' ? `#/c/${r.id}` : r.vista === 'limites' ? '#/limites' : '#/';
}

/** `#<id>` (sin barra) era el ancla de la antigua pieza: se lleva a su página de concepto. */
export function anclaAntigua(): string | null {
  const h = location.hash.replace(/^#/, '');
  return h && !h.startsWith('/') ? h : null;
}

export function alCambiarRuta(fn: (r: RutaActual) => void): void {
  addEventListener('hashchange', () => fn(rutaActual()));
}
