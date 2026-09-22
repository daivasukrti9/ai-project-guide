/* ==========================================================================
   Verificador del contenido editorial — AI Project Guide

   Uso:  node tests/verificar-contenido.js

   El contenido (galerías, guías, catálogo, prompts) tiene una versión por
   idioma en archivos separados. Este script comprueba que los tres tengan
   exactamente la misma forma: mismas claves, mismos ids, misma cantidad de
   elementos y ningún texto sin traducir.

   Los ids, los números de glosario y las claves "Nivel N" son datos, no
   texto: si se desvían, la app deja de encontrar lo que busca.
   ========================================================================== */

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const raiz = path.join(__dirname, "..", "src");
const errores = [];
const avisos = [];

/* Los tres archivos se evalúan en un mismo contexto: cada uno se registra. */
const contexto = { window: {} };
vm.createContext(contexto);
for (const archivo of ["contenido-guias.js", "contenido-en.js", "contenido-pt.js"]) {
  const ruta = path.join(raiz, archivo);
  if (!fs.existsSync(ruta)) { errores.push(`falta ${archivo}`); continue; }
  vm.runInContext(fs.readFileSync(ruta, "utf8"), contexto, { filename: archivo });
}
const todos = contexto.window.AIPG_CONTENIDO || {};
const idiomas = Object.keys(todos);
const base = "es";

if (!todos[base]) {
  console.error("✗ No se registró el contenido en español.");
  process.exit(1);
}

/* Claves que son DATOS y no texto: la app los usa para encontrar cosas, así
   que tienen que coincidir literalmente entre idiomas.
   Ojo: "glosario" se usa con dos sentidos — como número de referencia dentro
   de una fila, y como el array de 10 términos del catálogo. Solo el número
   es un dato. */
function esDato(clave, valor) {
  if (clave === "id" || clave === "n" || clave === "icono") return typeof valor !== "object";
  if (clave === "glosario") return typeof valor === "number";
  if (clave === "ideal") return Array.isArray(valor);
  return false;
}

/* ---- Forma de un objeto: claves, ids y longitudes, sin mirar el texto ---- */
function forma(valor, ruta) {
  if (Array.isArray(valor)) {
    return { tipo: "array", largo: valor.length, items: valor.map((v, i) => forma(v, `${ruta}[${i}]`)) };
  }
  if (valor && typeof valor === "object") {
    const salida = { tipo: "objeto", claves: Object.keys(valor).sort(), hijos: {} };
    for (const k of Object.keys(valor).sort()) {
      salida.hijos[k] = esDato(k, valor[k])
        ? { tipo: "dato", valor: JSON.stringify(valor[k]) }
        : forma(valor[k], `${ruta}.${k}`);
    }
    return salida;
  }
  return { tipo: "texto" };
}

function comparar(a, b, ruta, idioma) {
  if (a.tipo !== b.tipo) {
    errores.push(`${idioma}: ${ruta} es ${b.tipo} y en ${base} es ${a.tipo}`);
    return;
  }
  if (a.tipo === "dato") {
    if (a.valor !== b.valor) errores.push(`${idioma}: ${ruta} vale ${b.valor} y en ${base} vale ${a.valor}`);
    return;
  }
  if (a.tipo === "array") {
    if (a.largo !== b.largo) {
      errores.push(`${idioma}: ${ruta} tiene ${b.largo} elementos y en ${base} tiene ${a.largo}`);
      return;
    }
    a.items.forEach((item, i) => comparar(item, b.items[i], `${ruta}[${i}]`, idioma));
    return;
  }
  if (a.tipo === "objeto") {
    const faltan = a.claves.filter(k => !b.claves.includes(k));
    const sobran = b.claves.filter(k => !a.claves.includes(k));
    faltan.forEach(k => errores.push(`${idioma}: a ${ruta} le falta "${k}"`));
    sobran.forEach(k => errores.push(`${idioma}: ${ruta} define "${k}", que no existe en ${base}`));
    a.claves.filter(k => b.claves.includes(k)).forEach(k => comparar(a.hijos[k], b.hijos[k], `${ruta}.${k}`, idioma));
  }
}

const formaBase = forma(todos[base], "contenido");
for (const idioma of idiomas) {
  if (idioma === base) continue;
  comparar(formaBase, forma(todos[idioma], "contenido"), "contenido", idioma);
}

/* ---- Textos que quedaron idénticos al español (probable falta de traducir) ---- */
function textos(valor, ruta, acc) {
  if (Array.isArray(valor)) valor.forEach((v, i) => textos(v, `${ruta}[${i}]`, acc));
  else if (valor && typeof valor === "object") {
    for (const k of Object.keys(valor)) {
      if (esDato(k, valor[k])) continue;
      textos(valor[k], `${ruta}.${k}`, acc);
    }
  } else if (typeof valor === "string" && valor.trim().length > 25) acc[ruta] = valor;
  return acc;
}

const textosBase = textos(todos[base], "contenido", {});
for (const idioma of idiomas) {
  if (idioma === base) continue;
  const suyos = textos(todos[idioma], "contenido", {});
  const iguales = Object.keys(textosBase).filter(k => suyos[k] === textosBase[k]);
  /* Algunos coinciden legítimamente (nombres propios, siglas). Se avisa. */
  iguales
    .filter(k => !k.endsWith(".skill"))   // los nombres de skill son nombres propios
    .forEach(k => avisos.push(`${idioma}: ${k} es idéntico al español — ¿falta traducir?`));
}

/* ---- Cobertura mínima: que la app encuentre lo que busca ---- */
for (const idioma of idiomas) {
  const c = todos[idioma];
  ["Nivel 1", "Nivel 2", "Nivel 3", "Nivel 4"].forEach(nivel => {
    if (!c.SUGERENCIAS[nivel]) errores.push(`${idioma}: falta la galería de "${nivel}"`);
    if (!c.GUIAS[nivel]) errores.push(`${idioma}: falta la guía de "${nivel}"`);
  });
  if (!c.CATALOGO || !c.CATALOGO.glosario || c.CATALOGO.glosario.length !== 10) {
    errores.push(`${idioma}: el glosario del catálogo no tiene 10 términos`);
  }
}

console.log(`Idiomas del contenido: ${idiomas.join(", ")}`);
avisos.forEach(a => console.log("  aviso: " + a));
if (errores.length) {
  console.error(`\n${errores.length} problema(s):`);
  errores.forEach(e => console.error("  ✗ " + e));
  process.exit(1);
}
console.log("✓ Los tres idiomas tienen la misma estructura.");
