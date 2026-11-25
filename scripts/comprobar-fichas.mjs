#!/usr/bin/env node
/**
 * Comprobaciones propias de ESTE sitio que el validador genérico no sabe hacer (DEC §3 y §8).
 * No toca scripts/validar-contenido.mjs: lo complementa y corre justo después en `npm run validar`.
 *
 *  - C1/C5: toda ficha no borrador lleva propone, se_sabe y disputa; `respaldo` (salvo en el marco) y
 *    coincide con la tabla de DEC §2.
 *  - Reglas por elemento de content/reglas.json → ficha: pasos, se_sabe, disputa, puntos_clave, tope
 *    de caracteres y analogía solo editorial.
 *  - Refs en los dos sentidos: toda ref de un bloque está en fuentes y toda fuente la cita algún bloque.
 *  - El primer punto de «Para recordar» lleva el rótulo de respaldo de la ficha (C11).
 *  - `lo-medido` necesita al menos una fuente que no sea de Grinberg (S*).
 *  - `fuentes[].ref` existe en INV §1-2.
 *  - C7: la cita es la que DEC §3 asigna a esa ficha, y es literal.
 *  - C6/C8: grep de expresiones prohibidas (errores) y de expresiones a revisar (avisos).
 *  - `enlaces[].id` existe; `maquina` existe en content/es/maquinas.
 *  - Los borradores no llevan cuerpo.
 *
 * Los avisos son comprobaciones MANUALES: listan cada aparición para revisarla a ojo (DEC §8 C6).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(RAIZ, 'content', 'es', 'conceptos');
const MAQUINAS = join(RAIZ, 'content', 'es', 'maquinas');
const R = JSON.parse(readFileSync(join(RAIZ, 'content', 'reglas.json'), 'utf8')).ficha;

const RESPALDO = {
  'correlacion-interhemisferica': 3, 'potencial-transferido': 2, 'replicas-del-potencial-transferido': 2,
  'epr-en-el-cerebro': 1, 'vision-extraocular': 1, sintergia: 1, 'campo-neuronal': 1, lattice: 1,
  'distorsion-del-espacio-tiempo': 1, 'patron-de-interferencia': 1, 'factor-de-direccionalidad': 1,
  'procesador-central': 0, 'orbitales-de-conciencia': 0, 'percepcion-campo-lattice': 0,
};
const ROTULO = ['Tesis filosófica', 'Especulativo', 'Disputado', 'Publicado, sin réplica', 'Establecido'];
const CITAS = {
  'potencial-transferido': 'to verify if the brain has a macroscopic quantum component',
  'campo-neuronal': 'The neuronal field appears as a result of all the neuronal interactions',
  lattice: 'a crystalline structure whose lattice dimensions are of the order of the wavelength of x-rays',
  sintergia: 'each one of its elements contains high amounts of information',
  'patron-de-interferencia': 'This interference pattern constitutes the energetic structure of perceptual experience',
  'factor-de-direccionalidad': 'a hypothetical directionality factor',
  'procesador-central': 'The central processor can be conceived as pure consciousness',
};
const PROHIBIDAS = [/demostr/i, /pseudocien/i, /la ciencia ha/i, /los cient[ií]ficos ocultan/i];
const A_REVISAR = [/cu[aá]ntic/i, /realidad/i, /energ[ií]a/i, /1994/, /desapareci/i, /cham[aá]n/i];

const errores = [];
const avisos = [];
const conceptos = readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')));
const ids = new Set(conceptos.map((p) => p.id));
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const entre = (n, [a, b]) => n >= a && n <= b;

for (const p of conceptos) {
  const e = (m) => errores.push(`${p.id}: ${m}`);
  const textos = [];
  const add = (k, v) => { if (typeof v === 'string') textos.push([k, v]); };
  add('titulo', p.titulo); add('resumen', p.resumen); add('idea', p.idea);
  add('propone.intro', p.propone?.intro);
  (p.propone?.pasos ?? []).forEach((x, i) => { add(`propone.pasos[${i}]`, x.titulo); add(`propone.pasos[${i}]`, x.texto); });
  add('analogia', p.analogia?.texto);
  (p.se_sabe ?? []).forEach((x, i) => add(`se_sabe[${i}]`, x.texto));
  for (const k of ['disputa', 'detalles']) (p[k] ?? []).forEach((x, i) => { add(`${k}[${i}]`, x.titulo); add(`${k}[${i}]`, x.texto); });
  (p.puntos_clave ?? []).forEach((x, i) => add(`puntos_clave[${i}]`, x));
  add('cita.traduccion', p.cita?.traduccion);

  if (p.maquina) {
    let mq;
    try { mq = JSON.parse(readFileSync(join(MAQUINAS, `${p.maquina}.json`), 'utf8')); } catch { e(`la máquina "${p.maquina}" no existe en content/es/maquinas`); }
    if (mq) {
      add('maquina.alternativa', mq.parametros?.alternativa);
      add('maquina.resolucion', mq.parametros?.resolucion);
      (mq.parametros?.pasos ?? []).forEach((s, i) => add(`maquina.pasos[${i}]`, s.texto));
      // Mecánicas con textos propios (balance): sus pasos salen de los estudios y de `textos`.
      (mq.parametros?.estudios ?? []).forEach((s, i) => add(`maquina.estudios[${i}]`, s.texto));
      for (const [k, v] of Object.entries(mq.parametros?.textos ?? {})) add(`maquina.textos.${k}`, v);
    }
  }

  if (p.borrador) {
    for (const k of ['propone', 'se_sabe', 'disputa', 'detalles', 'analogia', 'puntos_clave', 'cita', 'fuentes', 'idea', 'maquina']) if (p[k] !== undefined) e(`es un borrador y lleva "${k}"`);
    if (!/^BORRADOR/.test(p.resumen)) e('un borrador empieza su resumen por «BORRADOR»');
    continue;
  }

  if (!p.maquina) e('falta la máquina (solo un borrador puede no tenerla)');
  if (!p.idea) e('falta «idea» (En una frase)');

  // C1 / C5
  for (const k of ['propone', 'se_sabe', 'disputa']) if (!p[k]) e(`falta el bloque "${k}" (C1)`);
  if (p.familia_id !== 'marco') {
    if (p.respaldo === undefined) e('falta "respaldo" (C5)');
    else if (RESPALDO[p.id] !== undefined && RESPALDO[p.id] !== p.respaldo) e(`respaldo ${p.respaldo}, DEC §2 dice ${RESPALDO[p.id]} (C5)`);
  } else if (p.respaldo !== undefined) e('el marco no lleva respaldo (DEC §3)');

  // Reglas por elemento
  const pasos = p.propone?.pasos ?? [];
  if (!entre(pasos.length, [R.pasos.min, R.pasos.max])) e(`${pasos.length} pasos, se esperaban entre ${R.pasos.min} y ${R.pasos.max}`);
  pasos.forEach((x, i) => {
    if (x.titulo.length > R.pasos.titulo) e(`paso ${i + 1}: título de ${x.titulo.length} car. (máx. ${R.pasos.titulo})`);
    if (!entre(x.texto.length, R.pasos.texto)) e(`paso ${i + 1}: texto de ${x.texto.length} car. (${R.pasos.texto.join('–')})`);
  });
  const ss = p.se_sabe ?? [];
  const rangoSs = R.se_sabe[p.familia_id] ?? R.se_sabe.resto;
  if (!entre(ss.length, rangoSs)) e(`se_sabe: ${ss.length} puntos, se esperaban entre ${rangoSs.join(' y ')}`);
  const ds = p.disputa ?? [];
  if (!entre(ds.length, [R.disputa.min, R.disputa.max])) e(`disputa: ${ds.length} puntos, se esperaban entre ${R.disputa.min} y ${R.disputa.max}`);
  ds.forEach((x, i) => {
    if (x.titulo.length > R.disputa.titulo) e(`disputa ${i + 1}: título de ${x.titulo.length} car. (máx. ${R.disputa.titulo})`);
    if (!entre(x.texto.length, R.disputa.texto)) e(`disputa ${i + 1}: texto de ${x.texto.length} car. (${R.disputa.texto.join('–')})`);
  });
  const pk = p.puntos_clave ?? [];
  if (!entre(pk.length, [R.puntos_clave.min, R.puntos_clave.max])) e(`puntos_clave: ${pk.length}, se esperaban entre ${R.puntos_clave.min} y ${R.puntos_clave.max}`);
  pk.forEach((x, i) => { if (x.length > R.puntos_clave.max_car) e(`punto ${i + 1}: ${x.length} car. (máx. ${R.puntos_clave.max_car})`); });
  if (pk[0] && p.respaldo !== undefined && !pk[0].startsWith(ROTULO[p.respaldo])) e(`el primer punto de «Para recordar» debe empezar por el rótulo de respaldo «${ROTULO[p.respaldo]}» (C11)`);
  if (p.analogia && !R.analogia_origen.includes(p.analogia.origen)) e('la analogía solo puede ser editorial');
  const tope = (p.propone?.intro ?? '').length + pasos.reduce((a, x) => a + x.titulo.length + x.texto.length, 0)
    + ss.reduce((a, x) => a + x.texto.length, 0) + ds.reduce((a, x) => a + x.titulo.length + x.texto.length, 0);
  if (tope > R.tope_car) e(`propone + se_sabe + disputa suman ${tope} car. (tope ${R.tope_car})`);

  // Fuentes y refs en los dos sentidos
  if (!p.fuentes?.length) e('sin fuentes');
  const declaradas = new Set((p.fuentes ?? []).map((f) => f.ref));
  for (const f of p.fuentes ?? []) if (!/^(P([1-9]|1[0-2])|S([1-9]|1[0-3]))$/.test(f.ref)) e(`fuente con ref "${f.ref}" que no existe en INV §1-2`);
  const citadas = new Set();
  for (const [k, lista] of [['se_sabe', ss], ['disputa', ds], ['detalles', p.detalles ?? []]]) {
    lista.forEach((x, i) => {
      for (const r of x.refs ?? []) { citadas.add(r); if (!declaradas.has(r)) e(`${k}[${i}] cita ${r}, que no está en fuentes`); }
    });
  }
  for (const r of declaradas) if (!citadas.has(r)) e(`la fuente ${r} no la cita ningún bloque`);
  if (p.familia_id === 'lo-medido' && ![...declaradas].some((r) => r.startsWith('S'))) e('lo-medido necesita al menos una fuente que no sea de Grinberg (S*)');

  // C7
  if (p.cita) {
    const esperada = CITAS[p.id];
    if (!esperada) e('lleva cita pero DEC §3 no le asigna ninguna (C7)');
    else if (norm(p.cita.texto) !== norm(esperada)) e('la cita no es el literal que DEC §3 asigna a esta ficha (C7)');
    if (p.id === 'potencial-transferido' && !/Grinberg-Zylberbaum.*Delaflor.*Attie.*Goswami/.test(p.cita.autor)) e('la cita de P11 debe nombrar a los cuatro firmantes (C7)');
  } else if (CITAS[p.id]) {
    avisos.push(`${p.id}: DEC §3 le asigna una cita y no la lleva (permitido: cita es opcional)`);
  }

  for (const en of p.enlaces ?? []) if (!ids.has(en.id)) e(`enlace a un concepto que no existe: ${en.id}`);

  // Cifras que cuentan: cada frase está literal en un bloque de la ficha, con enteros y sin años.
  const bloques = textos.filter(([k]) => /^(idea|propone|analogia|se_sabe|disputa|detalles|puntos_clave)/.test(k));
  for (const f of p.cifras ?? []) {
    if (!/\d/.test(f)) e(`cifras: «${f}» no lleva ningún número`);
    if (/\d[.,]\d|\b(19|20)\d\d\b/.test(f)) e(`cifras: «${f}» lleva un decimal o un año; el contador es de enteros`);
    if (!bloques.some(([, v]) => v.includes(f))) e(`cifras: «${f}» no aparece en ningún bloque de la ficha`);
  }

  // C6 / C8
  for (const [campo, v] of textos) {
    for (const re of PROHIBIDAS) if (re.test(v)) e(`${campo}: expresión prohibida ${re}`);
    for (const re of A_REVISAR) {
      const m = v.match(new RegExp(re.source, `${re.flags}g`));
      if (m) avisos.push(`${p.id} · ${campo}: «${[...new Set(m)].join('», «')}» ×${m.length} (revisar a ojo, C6/C8)`);
    }
  }
}

if (avisos.length) {
  console.log(`Comprobaciones manuales pendientes (${avisos.length}) — solo informan:`);
  for (const a of avisos) console.log(`  · ${a}`);
}
if (errores.length) {
  console.error(`\nErrores (${errores.length}):`);
  for (const x of errores) console.error(`  ✗ ${x}`);
  process.exit(1);
}
console.log(`\n✓ ${conceptos.length} fichas comprobadas (${conceptos.filter((p) => p.borrador).length} borradores).`);
