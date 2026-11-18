#!/usr/bin/env node
/**
 * Valida las máquinas de content/<idioma>/maquinas/<id>.json.
 *
 * Una máquina es DATOS, así que su corrección se puede comprobar sin abrir un navegador: que cada
 * paso nombre elementos que existen, que ninguna mecánica sea desconocida, que las dos lenguas
 * cuenten lo mismo con la misma estructura. Lo que esto NO ve —si el dibujo se entiende, si algo se
 * pisa en móvil— lo mira scripts/probar-maquinas.mjs sobre el sitio compilado.
 *
 *   node scripts/validar-maquinas.mjs           # lo que haya
 *   node scripts/validar-maquinas.mjs --todos   # además exige una máquina por cada concepto
 *
 * (Sintergia es solo en español: la paridad de abajo no se ejecuta mientras no haya otro idioma.)
 * PARIDAD ES/EN. La traducción cambia los textos y NADA MÁS: mismos ids, mismas posiciones, mismos
 * pasos en el mismo orden. Si una corrección de estructura se hace en un idioma y no en el otro, aquí
 * salta, en vez de descubrirse el día que alguien abre la versión inglesa y ve otra máquina.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const leer = (r) => JSON.parse(readFileSync(join(RAIZ, r), 'utf8').replace(/^﻿/, ''));
const todos = process.argv.includes('--todos');

const TIPOS = ['flujo', 'estructura', 'simulador', 'comparar', 'ciclo', 'codigo', 'espacial'];
const ROLES = new Set(['acento', 'neutro', 'dato', 'propuesta']);
const registro = readFileSync(join(RAIZ, 'src/vis/registro.ts'), 'utf8');
const MECANICAS = new Set([...registro.matchAll(/^\s{2}'?([a-z][\w-]*)'?: async \(\) =>/gm)].map((m) => m[1]));
const TIPOS_ELEMENTO = new Set(['caja', 'circulo', 'cilindro', 'ficha', 'grupo', 'texto', 'codigo', 'tabla', 'traza']);

const conceptos = readdirSync(join(RAIZ, 'content/es/conceptos')).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
const idiomas = readdirSync(join(RAIZ, 'content')).filter((d) => existsSync(join(RAIZ, 'content', d, 'maquinas')));
const errores = [];
const err = (idioma, id, m) => errores.push(`[${idioma}] ${id}: ${m}`);

/* ----------------------------------------------------------------- diagrama -- */

function fusionar(base, cambios, clave) {
  const mapa = new Map(base.map((x) => [clave(x), x]));
  for (const c of cambios ?? []) {
    if (c.quitar) mapa.delete(clave(c));
    else mapa.set(clave(c), { ...(mapa.get(clave(c)) ?? {}), ...c });
  }
  return [...mapa.values()];
}

/** Las combinaciones que el visitante puede ver: cada control en cada una de sus opciones. */
function combinaciones(p) {
  const out = [{ nombre: 'base', elementos: p.elementos ?? [], enlaces: p.enlaces ?? [], pasos: p.pasos ?? [] }];
  const controles = p.controles ?? [];
  const recorrer = (i, e, nombre) => {
    if (i === controles.length) { out.push({ nombre, ...e }); return; }
    for (const o of controles[i].opciones) {
      const parche = o.parche ?? {};
      recorrer(i + 1, {
        elementos: fusionar(e.elementos, parche.elementos, (x) => x.id),
        enlaces: fusionar(e.enlaces, parche.enlaces, (x) => `${x.de}>${x.a}`),
        pasos: parche.pasos ?? e.pasos,
      }, `${nombre}/${controles[i].id}=${o.id}`);
    }
  };
  recorrer(0, { elementos: p.elementos ?? [], enlaces: p.enlaces ?? [], pasos: p.pasos ?? [] }, '');
  return out.slice(1);
}

function validarDiagrama(idioma, id, p) {
  if ((p.controles ?? []).length > 2) err(idioma, id, 'más de 2 controles');
  for (const c of p.controles ?? []) {
    if ((c.opciones ?? []).length < 2) err(idioma, id, `el control ${c.id} necesita al menos 2 opciones`);
  }
  for (const v of combinaciones(p)) {
    const donde = `variante ${v.nombre}`;
    const ids = new Set();
    for (const e of v.elementos) {
      if (ids.has(e.id)) err(idioma, id, `${donde}: elemento repetido «${e.id}»`);
      ids.add(e.id);
      if (e.tipo && !TIPOS_ELEMENTO.has(e.tipo)) err(idioma, id, `${donde}: tipo de elemento desconocido «${e.tipo}»`);
      if (e.x == null || e.y == null || e.x < 0 || e.x > 100 || e.y < 0 || e.y > 100) err(idioma, id, `${donde}: posición fuera de 0–100 en «${e.id}»`);
      if (e.rol && !ROLES.has(e.rol)) err(idioma, id, `${donde}: rol desconocido «${e.rol}» en «${e.id}»`);
      // Rigor (DEC §6): lo que el texto atribuye a Grinberg no puede dibujarse como dato medido.
      if (e.tipo === 'traza' && !e.rol) err(idioma, id, `${donde}: la traza «${e.id}» debe declarar rol dato o propuesta`);
      if ((e.tipo ?? 'caja') === 'codigo' && !(e.lineas?.length)) err(idioma, id, `${donde}: «${e.id}» es código y no tiene líneas`);
      if ((e.tipo ?? 'caja') === 'tabla' && !(e.columnas?.length)) err(idioma, id, `${donde}: «${e.id}» es tabla y no tiene columnas`);
      if (!['codigo', 'tabla', 'grupo'].includes(e.tipo ?? 'caja') && !e.etiqueta && !e.oculto) err(idioma, id, `${donde}: «${e.id}» sin etiqueta`);
    }
    const claves = new Set();
    for (const e of v.enlaces) {
      if (!ids.has(e.de) || !ids.has(e.a)) err(idioma, id, `${donde}: enlace ${e.de}>${e.a} con un extremo que no existe`);
      claves.add(`${e.de}>${e.a}`);
    }
    const existe = (x) => ids.has(x) || claves.has(x);
    if (v.pasos.length < 1) err(idioma, id, `${donde}: sin pasos`);
    v.pasos.forEach((s, i) => {
      const cual = `${donde}, paso ${i + 1}`;
      if (!s.texto || s.texto.length < 4) err(idioma, id, `${cual}: sin texto`);
      if (s.texto && s.texto.length > 260) err(idioma, id, `${cual}: texto de ${s.texto.length} caracteres (máx. 260)`);
      for (const k of ['activos', 'muestra', 'oculta']) for (const x of s[k] ?? []) if (!existe(x)) err(idioma, id, `${cual}: ${k} nombra «${x}», que no existe`);
      for (const m of s.mensajes ?? []) {
        if (!ids.has(m.de) || !ids.has(m.a)) err(idioma, id, `${cual}: mensaje ${m.de}→${m.a} con un extremo que no existe`);
        if (m.etiqueta && m.etiqueta.length > 18) err(idioma, id, `${cual}: etiqueta de mensaje «${m.etiqueta}» demasiado larga (máx. 18)`);
      }
      for (const k of ['estados', 'sub', 'mueve', 'resalta', 'celdas']) {
        for (const x of Object.keys(s[k] ?? {})) if (!ids.has(x)) err(idioma, id, `${cual}: ${k} nombra «${x}», que no existe`);
      }
    });
  }
}

/* ----------------------------------------------------------------- paridad -- */

const TRADUCIBLES = new Set(['alternativa', 'resolucion', 'texto', 'etiqueta', 'lineas', 'columnas', 'filas', 'sub', 'celdas', 'rotulos', 'formato']);

function comparar(a, b, ruta, clave, enTraducible, fallos) {
  const tr = enTraducible || TRADUCIBLES.has(clave);
  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b) || (a === null) !== (b === null)) { fallos.push(`${ruta}: no coincide el tipo`); return; }
  if (typeof a === 'string') { if (!tr && a !== b) fallos.push(`${ruta}: «${a}» ≠ «${b}»`); return; }
  if (Array.isArray(a)) {
    if (a.length !== b.length) { fallos.push(`${ruta}: ${a.length} elementos frente a ${b.length}`); return; }
    a.forEach((x, i) => comparar(x, b[i], `${ruta}[${i}]`, clave, tr, fallos));
    return;
  }
  if (a && typeof a === 'object') {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    if (ka.join() !== kb.join()) { fallos.push(`${ruta}: claves distintas (${ka.filter((k) => !kb.includes(k)).join(',') || '—'} / ${kb.filter((k) => !ka.includes(k)).join(',') || '—'})`); return; }
    for (const k of ka) comparar(a[k], b[k], `${ruta}.${k}`, k, tr && (k !== 'id' && k !== 'de' && k !== 'a'), fallos);
    return;
  }
  if (a !== b) fallos.push(`${ruta}: ${a} ≠ ${b}`);
}

/* ------------------------------------------------------------------- bucle -- */

const fichas = {};
for (const idioma of idiomas) {
  const dir = join(RAIZ, 'content', idioma, 'maquinas');
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const id = f.replace(/\.json$/, '');
    let m;
    try { m = leer(`content/${idioma}/maquinas/${f}`); } catch (e) { err(idioma, id, `JSON inválido: ${e.message}`); continue; }
    (fichas[idioma] ??= {})[id] = m;
    if (!conceptos.includes(id)) err(idioma, id, 'no hay concepto con ese id');
    if (!MECANICAS.has(m.mecanica)) err(idioma, id, `mecánica desconocida «${m.mecanica}» (¿falta en src/vis/registro.ts?)`);
    if (!TIPOS.includes(m.tipo)) err(idioma, id, `tipo «${m.tipo}» no válido (${TIPOS.join(', ')})`);
    const p = m.parametros;
    if (!p) { err(idioma, id, 'sin parametros'); continue; }
    if (!p.alternativa || p.alternativa.length < 60) err(idioma, id, 'alternativa textual ausente o demasiado corta (mín. 60)');
    if (!p.resolucion || p.resolucion.length < 40) err(idioma, id, 'resolución ausente o demasiado corta (mín. 40)');
    if (m.mecanica === 'diagrama') validarDiagrama(idioma, id, p);
  }
}

if (todos) {
  for (const idioma of idiomas) for (const c of conceptos) if (!fichas[idioma]?.[c]) err(idioma, c, 'el concepto no tiene máquina');
}

// Paridad: lo que existe en español debe existir en los demás, con la misma estructura.
for (const idioma of idiomas.filter((i) => i !== 'es')) {
  for (const [id, es] of Object.entries(fichas.es ?? {})) {
    const otro = fichas[idioma]?.[id];
    if (!otro) { if (todos) err(idioma, id, 'falta la traducción de la máquina'); continue; }
    const fallos = [];
    comparar(es, otro, id, '', false, fallos);
    for (const f of fallos.slice(0, 5)) err(idioma, id, `estructura distinta al español → ${f}`);
    if (fallos.length > 5) err(idioma, id, `…y ${fallos.length - 5} diferencias más`);
  }
  for (const id of Object.keys(fichas[idioma] ?? {})) if (!fichas.es?.[id]) err(idioma, id, 'existe en este idioma pero no en español');
}

if (errores.length) {
  console.error(`\n${errores.length} problema(s) en las máquinas:\n`);
  for (const e of errores) console.error(`  ✗ ${e}`);
  console.error('');
  process.exit(1);
}
const n = Object.values(fichas).map((o) => Object.keys(o).length);
console.log(`\n✓ Máquinas válidas (${idiomas.map((i, k) => `${i}: ${n[k]}`).join(', ')}${todos ? `; los ${conceptos.length} conceptos cubiertos` : ''}).\n`);
