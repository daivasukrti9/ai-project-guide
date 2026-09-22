/* ==========================================================================
   Verificador de textos de interfaz — AI Project Guide

   Uso:  node tests/verificar-textos.js

   Sin framework de tests (es una decisión del proyecto). Este script hace
   las comprobaciones que un typo rompe en silencio:

     1. Toda clave usada en index.html (data-i18n*) existe en el diccionario.
     2. Toda clave usada en app.js vía t("…") existe en el diccionario.
     3. Todo canal/formato del vocabulario tiene su etiqueta.
     4. Los tres idiomas tienen exactamente el mismo juego de claves.
     5. No quedan claves definidas que nadie use (avisa, no falla).

   Devuelve código 1 si encuentra algo roto, para poder encadenarlo.
   ========================================================================== */

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const raiz = path.join(__dirname, "..", "src");
const leer = f => fs.readFileSync(path.join(raiz, f), "utf8");

/* i18n.js se evalúa en un contexto mínimo: solo necesita `window`. */
function cargarI18n() {
  const contexto = { window: {} };
  vm.createContext(contexto);
  vm.runInContext(leer("i18n.js"), contexto, { filename: "i18n.js" });
  if (!contexto.window.AIPG_I18N) throw new Error("i18n.js no expuso window.AIPG_I18N");
  return contexto.window.AIPG_I18N;
}

const errores = [];
const avisos = [];

const I18N = cargarI18n();
const idiomas = Object.keys(I18N.idiomas);
const base = I18N.idiomaPorDefecto;
const claves = new Set(Object.keys(I18N.idiomas[base]));
const usadas = new Set();

/* ---- 1. Claves referenciadas desde el HTML ---- */
const html = leer("index.html");
for (const m of html.matchAll(/data-i18n(?:-ph|-aria|-html)?="([^"]+)"/g)) {
  usadas.add(m[1]);
  if (!claves.has(m[1])) errores.push(`index.html usa la clave "${m[1]}" y no está en el diccionario ${base}`);
}

/* ---- 2. Claves referenciadas desde app.js ---- */
const app = leer("app.js");
/* Clave literal pegada a la llamada: t("s1.mapeo.col.que"). */
for (const m of app.matchAll(/\bt\(\s*"([^"]+)"/g)) {
  usadas.add(m[1]);
  if (!claves.has(m[1])) errores.push(`app.js usa la clave "${m[1]}" y no está en el diccionario ${base}`);
}
/* Clave elegida con un ternario dentro de t(...). Se marca como usada
   cualquier cadena del archivo que coincida exacto con una clave conocida. */
for (const m of app.matchAll(/"([^"\n]+)"/g)) if (claves.has(m[1])) usadas.add(m[1]);
/* Claves armadas por concatenación: t(`canal.${tipo}.` + id) y similares. */
for (const tipo of ["entrada", "salida"]) {
  for (const c of I18N.vocabulario[tipo].canales) {
    const clave = `canal.${tipo}.${c.id}`;
    usadas.add(clave);
    if (!claves.has(clave)) errores.push(`falta la etiqueta "${clave}" para el canal "${c.id}"`);
  }
  for (const f of I18N.vocabulario[tipo].formatos) {
    const clave = `formato.${tipo}.${f.id}`;
    usadas.add(clave);
    if (!claves.has(clave)) errores.push(`falta la etiqueta "${clave}" para el formato "${f.id}"`);
  }
}

/* ---- 2.b Estructura: data-i18n reemplaza textContent, así que el elemento
        no puede tener hijos (los borraría). Para eso está data-i18n-html. ---- */
for (const m of html.matchAll(/<([a-zA-Z0-9]+)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)) {
  if (/<[a-zA-Z]/.test(m[3])) {
    errores.push(`<${m[1]}> con data-i18n="${m[2]}" tiene etiquetas hijas: usar data-i18n-html, o se borrarían al cambiar de idioma`);
  }
}
/* ---- 2.c data-i18n-ph solo tiene sentido en campos de texto ---- */
for (const m of html.matchAll(/<([a-zA-Z0-9]+)\b[^>]*\bdata-i18n-ph="([^"]+)"/g)) {
  if (!["input", "textarea"].includes(m[1].toLowerCase())) {
    errores.push(`<${m[1]}> usa data-i18n-ph="${m[2]}" pero no es un campo de texto`);
  }
}

/* ---- 2.d Familias de claves que se arman por concatenación.
        app.js las construye como t(`s2.${id}.${valor}.label`), así que el
        rastreo literal no las ve: se derivan de los propios bancos de datos. ---- */
function bloqueDe(nombre) {
  const i = app.indexOf(`const ${nombre} = [`);
  if (i === -1) return "";
  const fin = app.indexOf("\n  ];", i);
  return app.slice(i, fin === -1 ? i : fin);
}

function exigir(clave, motivo) {
  usadas.add(clave);
  if (!claves.has(clave)) errores.push(`falta la clave "${clave}" (${motivo})`);
}

/* Pasos del asistente: encabezado de cada sección. */
for (let n = 1; n <= 4; n++) {
  exigir(`hero.${n}.titulo`, "encabezado de sección");
  exigir(`hero.${n}.lede`, "encabezado de sección");
  exigir(`nivel.${n}.titulo`, "tipo de desarrollo");
  exigir(`nivel.${n}.desc`, "tipo de desarrollo");
  exigir(`nivel.${n}.why`, "tipo de desarrollo");
}

/* Preguntas de clasificación: id + valores de cada opción. */
{
  const bloque = bloqueDe("PREGUNTAS_CLASIFICACION");
  for (const m of bloque.matchAll(/id:\s*"([^"]+)",\s*opciones:\s*\[([\s\S]*?)\]/g)) {
    const id = m[1];
    for (const v of m[2].matchAll(/value:\s*"([^"]+)"/g)) {
      exigir(`s2.${id}.${v[1]}.label`, "opción de clasificación");
      exigir(`s2.${id}.${v[1]}.desc`, "opción de clasificación");
    }
  }
}

/* Evaluación de ecosistema: enunciado + opciones. */
{
  const bloque = bloqueDe("PREGUNTAS_ECOSISTEMA");
  for (const m of bloque.matchAll(/id:\s*"([^"]+)",\s*opciones:\s*\[([\s\S]*?)\]/g)) {
    const id = m[1];
    exigir(`eco.${id}.pregunta`, "enunciado de ecosistema");
    for (const v of m[2].matchAll(/value:\s*"([^"]+)"/g)) {
      exigir(`eco.${id}.${v[1]}`, "opción de ecosistema");
    }
  }
}

/* ---- 3. Paridad entre idiomas ---- */
for (const idioma of idiomas) {
  if (idioma === base) continue;
  const suyas = new Set(Object.keys(I18N.idiomas[idioma]));
  for (const k of claves) if (!suyas.has(k)) errores.push(`el idioma "${idioma}" no tiene la clave "${k}"`);
  for (const k of suyas) if (!claves.has(k)) errores.push(`el idioma "${idioma}" define "${k}", que no existe en "${base}"`);
}

/* ---- 4. Claves definidas que nadie usa (solo aviso) ---- */
for (const k of claves) if (!usadas.has(k)) avisos.push(`la clave "${k}" está definida pero no se usa en ningún lado`);

/* ---- Salida ---- */
console.log(`Idiomas: ${idiomas.join(", ")} · claves por idioma: ${claves.size} · usadas: ${usadas.size}`);
avisos.forEach(a => console.log("  aviso: " + a));
if (errores.length) {
  console.error(`\n${errores.length} problema(s):`);
  errores.forEach(e => console.error("  ✗ " + e));
  process.exit(1);
}
console.log("✓ Textos de interfaz coherentes.");
