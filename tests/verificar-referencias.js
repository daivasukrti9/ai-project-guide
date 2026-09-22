/* ==========================================================================
   Verificador de referencias DOM — AI Project Guide

   Uso:  node tests/verificar-referencias.js

   Sin navegador no hay forma de ver un `null` explotando en runtime, así que
   este script cruza lo que app.js pide contra lo que index.html realmente
   tiene:

     1. Todo getElementById("x") existe como id="x" en el HTML o en un
        <template>.
     2. Todo <template id="tpl-…"> que se clona existe.
     3. Los data-field / data-f que se leen existen en su plantilla.
     4. Avisa de ids declarados en el HTML que nadie usa (puede ser basura).

   Devuelve 1 si algo falta.
   ========================================================================== */

"use strict";

const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..", "src");
const app = fs.readFileSync(path.join(raiz, "app.js"), "utf8");
const html = fs.readFileSync(path.join(raiz, "index.html"), "utf8");

const errores = [];
const avisos = [];

/* ---- ids declarados: en el HTML (incluidos los <template>) y también en el
       marcado que app.js construye con innerHTML ---- */
const idsHtml = new Set();
for (const m of html.matchAll(/\bid="([^"]+)"/g)) idsHtml.add(m[1]);
const idsGenerados = new Set();
for (const m of app.matchAll(/\bid="([^"$]+)"/g)) idsGenerados.add(m[1]);
const idsDisponibles = new Set([...idsHtml, ...idsGenerados]);

/* ---- ids que pide app.js ---- */
const idsPedidos = new Map(); // id -> cantidad de usos
for (const m of app.matchAll(/getElementById\(\s*"([^"]+)"\s*\)/g)) {
  idsPedidos.set(m[1], (idsPedidos.get(m[1]) || 0) + 1);
}
/* querySelector("#x") también cuenta */
for (const m of app.matchAll(/querySelector(?:All)?\(\s*["'`]#([\w-]+)/g)) {
  idsPedidos.set(m[1], (idsPedidos.get(m[1]) || 0) + 1);
}

for (const [id, usos] of idsPedidos) {
  if (!idsDisponibles.has(id)) {
    errores.push(`app.js pide el id "${id}" (${usos} uso/s) y no lo declara ni index.html ni el marcado que genera app.js`);
  }
}

/* ---- ids del HTML que nadie usa ---- */
for (const id of idsHtml) {
  if (!idsPedidos.has(id) && !app.includes(`"${id}"`) && !html.includes(`for="${id}"`) && !id.startsWith("panel-") && !id.startsWith("view-")) {
    avisos.push(`el id "${id}" está en el HTML y app.js no lo usa`);
  }
}

/* ---- plantillas ---- */
const plantillas = new Set();
for (const m of html.matchAll(/<template\s+id="([^"]+)"/g)) plantillas.add(m[1]);
for (const m of app.matchAll(/getElementById\(\s*"(tpl-[^"]+)"\s*\)/g)) {
  if (!plantillas.has(m[1])) errores.push(`app.js clona la plantilla "${m[1]}" y no existe`);
}
for (const m of app.matchAll(/addRow\(\s*"[^"]+"\s*,\s*"([^"]+)"/g)) {
  if (!plantillas.has(m[1])) errores.push(`addRow usa la plantilla "${m[1]}" y no existe`);
}

/* ---- campos de las filas: data-field / data-f ---- */
const camposDeclarados = new Set();
for (const m of html.matchAll(/data-f(?:ield)?="([^"$]+)"/g)) camposDeclarados.add(m[1]);
for (const m of app.matchAll(/data-f(?:ield)?="([^"$\\]+)"/g)) camposDeclarados.add(m[1]);
for (const m of app.matchAll(/\[data-f(?:ield)?="([^"]+)"\]/g)) {
  const campo = m[1];
  if (campo.includes("${")) continue;           // selector armado en runtime
  if (!camposDeclarados.has(campo)) {
    errores.push(`app.js busca el campo [data-field="${campo}"] y nadie lo declara`);
  }
}

/* ---- salida ---- */
console.log(`ids pedidos por app.js: ${idsPedidos.size} · en el HTML: ${idsHtml.size} · generados por app.js: ${idsGenerados.size} · plantillas: ${plantillas.size}`);
avisos.forEach(a => console.log("  aviso: " + a));
if (errores.length) {
  console.error(`\n${errores.length} problema(s):`);
  errores.forEach(e => console.error("  ✗ " + e));
  process.exit(1);
}
console.log("✓ Todas las referencias del DOM existen.");
