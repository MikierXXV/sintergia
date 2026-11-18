/**
 * Reels importados desde `videos-cortos` por scripts/importar-reels.mjs (content/reels.json).
 * Las rutas son relativas a `public/`; el id del reel es el de la ficha que lo muestra.
 */
import reelsRaw from '../../content/reels.json';

export interface Reel {
  concepto: string;
  titulo: string;
  descripcion: string;
  fuentes: string;
  transcripcion: string[];
  duracion: number;
  video: string;
  poster: string;
  miniatura: string;
}

const REELS: Reel[] = (reelsRaw as { reels: Reel[] }).reels;

/** El reel que enseña la portada: el primero del contenido. */
export function reelDePortada(): Reel | undefined {
  return REELS[0];
}

export function reelDe(id: string): Reel | undefined {
  return REELS.find((r) => r.concepto === id);
}
