/* ==========================================================================
   Batería funcional — AI Project Guide

   Uso:   cd tests && npm install && node probar-funcional.js

   Es la ÚNICA parte del proyecto con dependencia (jsdom) y es opcional: la
   app sigue sin build ni librerías. Sirve para ejecutar el código real sin
   navegador — arranque, cambio de idioma, cálculos, exportables y el
   round-trip del expediente — y atrapar lo que la sintaxis no ve.

   Si no querés instalar nada, los otros dos verificadores no necesitan nada:
     node tests/verificar-textos.js
     node tests/verificar-referencias.js
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const SRC = path.join(__dirname, "..", "src");

const resultados = [];
function ok(nombre, cond, detalle) {
  resultados.push({ nombre, cond: !!cond, detalle: detalle === undefined ? "" : String(detalle) });
}

function arrancar(archivo = "index.html") {
  const html = fs.readFileSync(path.join(SRC, archivo), "utf8");
  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: undefined,
    url: "http://localhost/",
    pretendToBeVisual: true
  });
  const { window } = dom;

  window.URL.revokeObjectURL = () => {};
  window.scrollTo = () => {};
  // Idioma fijo: jsdom dice en-US y la app respeta el idioma del navegador.
  try { window.localStorage.setItem("aipg-idioma", "es"); } catch (e) {}
  // Los <script src> no se cargan solos (resources desactivado): se inyectan.
  for (const js of ["i18n.js", "contenido-guias.js", "contenido-en.js", "contenido-pt.js", "app.js"]) {
    const code = fs.readFileSync(path.join(SRC, js), "utf8");
    const el = window.document.createElement("script");
    el.textContent = code;
    window.document.body.appendChild(el);
  }
  // Disparar DOMContentLoaded
  window.document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));
  return window;
}

const erroresConsola = [];
let window;
try {
  window = arrancar();
} catch (e) {
  console.error("FALLO AL ARRANCAR:", e.message);
  process.exit(1);
}
window.addEventListener("error", e => erroresConsola.push(String(e.error || e.message)));

const $ = sel => window.document.querySelector(sel);
const $$ = sel => [...window.document.querySelectorAll(sel)];
const id = x => window.document.getElementById(x);

/* ============================ 1. Arranque ============================ */
ok("La app arranca sin excepciones", true);
ok("El selector de idioma existe", !!id("idiomaSelect"));
ok("Arranca en español", window.document.documentElement.getAttribute("lang") === "es",
   window.document.documentElement.getAttribute("lang"));
ok("Hay filas de entrada y salida", $$("#entradasRows .row-card").length === 1 && $$("#salidasRows .row-card").length === 1);
ok("Las 4 opciones de tipo de desarrollo se dibujan", $$("#levelPicker .level-option").length === 4,
   $$("#levelPicker .level-option").length);
ok("Las 5 preguntas de clasificación tienen opciones",
   $$("#panel-2 .level-picker[data-pregunta]").every(c => c.children.length >= 3));
ok("Las 5 preguntas de ecosistema se dibujan", $$("#ecoPreguntas .eco-pregunta").length === 5,
   $$("#ecoPreguntas .eco-pregunta").length);
/* Solo el texto de hojas visibles: body.textContent incluiría el código de
   los <script> que inyecta este arnés. */
const textoVisible = () => [...window.document.querySelectorAll("body *")]
  .filter(el => el.children.length === 0 && el.tagName !== "SCRIPT")
  .map(el => (el.textContent || "").trim());
const esClaveCruda = x => /^[a-z][a-zA-Z0-9]*\.[a-zA-Z0-9._-]+$/.test(x);
ok("No quedan claves i18n sin traducir a la vista",
   !textoVisible().some(esClaveCruda), textoVisible().find(esClaveCruda));

/* ============================ 2. Sección 1 ============================ */
function escribir(el, valor) {
  el.value = valor;
  el.dispatchEvent(new window.Event("input", { bubbles: true }));
  el.dispatchEvent(new window.Event("change", { bubbles: true }));
}

const filaEnt = $("#entradasRows .row-card");
escribir(filaEnt.querySelector('[data-field="texto"]'), "Facturas de proveedores");
ok("Fila incompleta muestra 🟡", filaEnt.querySelector('[data-field="estado"]').textContent === "🟡",
   filaEnt.querySelector('[data-field="estado"]').textContent);
ok("Término ambiguo dispara la pista", !filaEnt.querySelector('[data-field="pista"]').hidden);
escribir(filaEnt.querySelector('[data-field="canal"]'), "correo");
escribir(filaEnt.querySelector('[data-field="formato"]'), "pdf");
ok("Con canal y formato pasa a 🟢", filaEnt.querySelector('[data-field="estado"]').textContent === "🟢",
   filaEnt.querySelector('[data-field="estado"]').textContent);
ok("La pista desaparece al completar", filaEnt.querySelector('[data-field="pista"]').hidden);
ok("El resumen cuenta las completas", /1/.test(id("entradasResumen").textContent), id("entradasResumen").textContent.trim());

id("btnAddEntrada").click();
ok("El botón agrega una fila", $$("#entradasRows .row-card").length === 2);
$$("#entradasRows .row-card")[1].querySelector("[data-remove-row]").click();
ok("El botón de la papelera la quita", $$("#entradasRows .row-card").length === 1);

const filaSal = $("#salidasRows .row-card");
escribir(filaSal.querySelector('[data-field="texto"]'), "Reporte de conciliación");
escribir(filaSal.querySelector('[data-field="canal"]'), "correo");
escribir(filaSal.querySelector('[data-field="formato"]'), "pdf");

escribir(id("s1_nombre_proceso"), "Conciliación de facturas");
const dep = id("s1_departamento"); dep.selectedIndex = 1;
dep.dispatchEvent(new window.Event("change", { bubbles: true }));

const tarea = $("#tareasHabitualesRows .row-card");
escribir(tarea.querySelector('[data-f="nombre"]'), "Cotejar facturas");
escribir(tarea.querySelector('[data-f="cantidad"]'), "20");
escribir(tarea.querySelector('[data-f="minutos_por_unidad"]'), "12");
ok("Calcula horas/día de la tarea habitual", /4\.0/.test(tarea.querySelector('[data-f="horas_dia"]').textContent),
   tarea.querySelector('[data-f="horas_dia"]').textContent);

/* ============================ 3. Secciones 2 a 4 ============================ */
$('#panel-2 .level-picker[data-pregunta="entregable"] .level-option').click();
ok("Elegir una opción la marca",
   $('#panel-2 .level-picker[data-pregunta="entregable"] .level-option').getAttribute("aria-checked") === "true");
ok("Aparece la recomendación técnica", /recomendacionTecnica/.test(id("recomendacionTecnica").id) && id("recomendacionTecnica").textContent.length > 20);

$$("#ecoPreguntas .eco-pregunta").forEach(card => card.querySelector(".level-option").click());
ok("La evaluación de ecosistema puntúa con las 5 respuestas",
   id("ecoResultado").textContent.includes("/20"), id("ecoResultado").textContent.trim().slice(0, 40));

$$("#levelPicker .level-option").find(o => o.dataset.level.includes("Nivel 3")).click();
ok("Al elegir tipo aparece la galería", $$("[data-idea-check]").length === 7, $$("[data-idea-check]").length);
$$("[data-idea-check]")[0].click();
ok("Marcar una idea actualiza el contador", /1/.test(id("ideaContador").textContent), id("ideaContador").textContent.trim());
$('[data-ia="claude"]').click();
ok("El prompt maestro incluye el proceso", id("promptMaestro").textContent.includes("Conciliación de facturas"));
ok("El prompt incluye canal y formato de la entrada",
   /Facturas de proveedores \(correo electrónico, PDF\)/i.test(id("promptMaestro").textContent),
   (id("promptMaestro").textContent.match(/- Facturas.*/) || [""])[0]);

$('[data-goto="4"]').click();
const comp = $("#comparativoRows [data-f='horas_automatizado']");
ok("El comparativo trae la tarea de la Sección 1", !!comp);
if (comp) escribir(comp, "1");
escribir(id("s3_costo_hora"), "28");
ok("Calcula el impacto", id("comparativoImpacto").textContent.includes("%"), id("comparativoImpacto").textContent.trim().slice(0, 60));
ok("El atajo de ROI aparece", !id("btnRoiDesdeComparativo").hidden, id("btnRoiDesdeComparativo").textContent.trim());
id("btnRoiDesdeComparativo").click();
ok("El ROI se completa", parseFloat(id("s3_ahorro_horas").value) > 0, id("s3_ahorro_horas").value);
ok("El atajo se oculta tras aplicarlo", id("btnRoiDesdeComparativo").hidden);

$$("[data-duda-check]")[0].click();
ok("La consulta de dudas se genera", !!id("promptDudas") && id("promptDudas").textContent.length > 100);
$('#audienciaPicker [data-valor="jefatura"]').click();
$('#objetivoPicker [data-valor="escalar"]').click();
ok("El prompt de presentación trae los números",
   /22\.5 h\/semana|h\/semana/.test(id("promptPresentacion").textContent));

/* ============================ 4. Cambio de idioma ============================ */
const antesES = {
  paso3: $$(".step-title")[2].textContent,
  nivel: $$("#levelPicker .level-option strong")[0].textContent,
  s2: $('#panel-2 .level-picker[data-pregunta="entregable"] .level-option strong').textContent,
  eco: $("#ecoPreguntas .hint-title").textContent,
  card: $("#comparativoImpacto .label") ? $("#comparativoImpacto .label").textContent : "",
  hero: id("heroTitle").textContent
};
escribir(id("idiomaSelect"), "en");

const despuesEN = {
  paso3: $$(".step-title")[2].textContent,
  nivel: $$("#levelPicker .level-option strong")[0].textContent,
  s2: $('#panel-2 .level-picker[data-pregunta="entregable"] .level-option strong').textContent,
  eco: $("#ecoPreguntas .hint-title").textContent,
  card: $("#comparativoImpacto .label") ? $("#comparativoImpacto .label").textContent : "",
  hero: id("heroTitle").textContent
};
for (const k of Object.keys(antesES)) {
  ok(`Cambia a inglés: ${k}`, antesES[k] !== despuesEN[k], `"${antesES[k]}" -> "${despuesEN[k]}"`);
}
ok("El idioma queda en el documento", window.document.documentElement.getAttribute("lang") === "en");
ok("No duplica opciones al cambiar idioma", $$("#levelPicker .level-option").length === 4,
   $$("#levelPicker .level-option").length);
ok("No duplica preguntas de ecosistema", $$("#ecoPreguntas .eco-pregunta").length === 5,
   $$("#ecoPreguntas .eco-pregunta").length);
ok("Conserva el tipo de desarrollo elegido",
   $$("#levelPicker .level-option").some(o => o.getAttribute("aria-checked") === "true"));
ok("Conserva la respuesta de la Sección 2",
   $('#panel-2 .level-picker[data-pregunta="entregable"] .level-option').getAttribute("aria-checked") === "true");
ok("Conserva la idea marcada", $$("[data-idea-check]").some(c => c.checked));
ok("Conserva la duda marcada", $$("[data-duda-check]").some(c => c.checked));
ok("Conserva lo escrito en la Sección 1", id("s1_nombre_proceso").value === "Conciliación de facturas");
ok("Conserva la fila de entrada con canal y formato",
   $("#entradasRows [data-field=\"canal\"]").value === "correo" && $("#entradasRows [data-field=\"texto\"]").value === "Facturas de proveedores");
ok("No quedan textos en español en el encabezado inglés",
   !/Organiza tu trabajo|Resultados e impacto/.test($(".step-tracker").textContent),
   $(".step-tracker").textContent.replace(/\s+/g, " ").trim());

escribir(id("idiomaSelect"), "pt");
ok("Cambia a portugués", /Organize|Resultados/.test($(".step-tracker").textContent),
   $(".step-tracker").textContent.replace(/\s+/g, " ").trim().slice(0, 60));
escribir(id("idiomaSelect"), "es");
ok("Vuelve a español", $$(".step-title")[2].textContent === antesES.paso3, $$(".step-title")[2].textContent);

/* ============================ 5. Expediente ============================ */
let capturado = null;
window.URL.createObjectURL = blob => { capturado = blob; return "blob:x"; };
window.HTMLAnchorElement.prototype.click = function () { };
id("btnExportJson").click();

(async () => {
  let json = null;
  if (capturado) {
    const texto = await capturado.text();
    json = JSON.parse(texto);
  }
  ok("Exporta el expediente", !!json);
  if (json) {
    const s1 = json.seccion_1_ordenar_trabajo.mapeo_entradas_salidas;
    ok("Guarda entradas estructuradas", s1.entradas[0] && s1.entradas[0].canal === "correo",
       JSON.stringify(s1.entradas[0]));
    ok("Guarda ids, no etiquetas traducidas",
       !JSON.stringify(json).includes("Correo electrónico") && !JSON.stringify(json).includes("Email"));
    ok("Guarda el costo hora", json.seccion_3_compresion_proyecto.roi_estimado.costo_hora_usd === 28,
       json.seccion_3_compresion_proyecto.roi_estimado.costo_hora_usd);
  }

  /* ---- Round-trip: cargar el mismo expediente ---- */
  if (json) {
    const w2 = arrancar();
    const archivo = new w2.File([JSON.stringify(json)], "exp.json", { type: "application/json" });
    const input = w2.document.getElementById("fileInput");
    Object.defineProperty(input, "files", { value: [archivo], configurable: true });
    input.dispatchEvent(new w2.Event("change", { bubbles: true }));
    await new Promise(r => setTimeout(r, 400));
    ok("Reabre el expediente sin romperse",
       w2.document.getElementById("s1_nombre_proceso").value === "Conciliación de facturas",
       w2.document.getElementById("ioStatus").textContent.trim().slice(0, 60));
    ok("Restaura la fila con canal y formato",
       w2.document.querySelector('#entradasRows [data-field="canal"]').value === "correo");
  }

  /* ---- Expediente viejo (formato anterior) ---- */
  const viejo = {
    schema_version: "1.0.0",
    app_meta: { id_expediente: "PROC-VIEJO", etapa_actual: 1, etapas_completadas: [] },
    seccion_1_ordenar_trabajo: {
      metadata_proceso: { nombre_proceso: "Proceso heredado" },
      mapeo_entradas_salidas: { entradas: ["Correo del cliente", "Planilla Excel"], salidas: ["Reporte"] },
      metricas_tiempo_y_costos: {}, tareas_habituales: [], capacidad_80_20: { colaboradores: [] },
      puntos_de_dolor: [], cronograma_gantt: []
    },
    seccion_2_clasificacion_proyecto: { respuestas: {}, recomendacion: {}, evaluacion_ecosistema: { respuestas: {} } },
    seccion_3_compresion_proyecto: { nivel_solucion: "Nivel 3: Skill / Prompt Estructurado", kpis_y_metricas_clave: [], roi_estimado: {}, comparativo_automatizacion: [] },
    seccion_4_indicadores_desarrollo: { skills_seleccionadas: [], plan_gestion_cambio: { checklist: [] } }
  };
  const w3 = arrancar();
  const arch3 = new w3.File([JSON.stringify(viejo)], "viejo.json", { type: "application/json" });
  const in3 = w3.document.getElementById("fileInput");
  Object.defineProperty(in3, "files", { value: [arch3], configurable: true });
  in3.dispatchEvent(new w3.Event("change", { bubbles: true }));
  await new Promise(r => setTimeout(r, 400));
  ok("Migra un expediente del formato viejo",
     w3.document.getElementById("s1_nombre_proceso").value === "Proceso heredado",
     w3.document.getElementById("ioStatus").textContent.trim().slice(0, 70));
  ok("Convierte las entradas de texto a filas",
     w3.document.querySelector('#entradasRows [data-field="texto"]').value === "Correo del cliente",
     w3.document.querySelector('#entradasRows [data-field="texto"]') ? w3.document.querySelector('#entradasRows [data-field="texto"]').value : "(sin fila)");
  ok("Migra el rótulo viejo del Nivel 3",
     [...w3.document.querySelectorAll("#levelPicker .level-option")].some(o => o.getAttribute("aria-checked") === "true"));

  /* ---- Un archivo guardado en un idioma se abre en otro ---- */
  const wEN = arrancar();
  try { wEN.localStorage.setItem("aipg-idioma", "en"); } catch (e) {}
  const selEN = wEN.document.getElementById("idiomaSelect");
  selEN.value = "en"; selEN.dispatchEvent(new wEN.Event("change", { bubbles: true }));
  const depEN = wEN.document.getElementById("s1_departamento");
  depEN.selectedIndex = 1; depEN.dispatchEvent(new wEN.Event("change", { bubbles: true }));
  const tipoEN = wEN.document.getElementById("s4_entregable_tipo");
  tipoEN.selectedIndex = 2; tipoEN.dispatchEvent(new wEN.Event("change", { bubbles: true }));
  let blobEN = null;
  wEN.URL.createObjectURL = b => { blobEN = b; return "blob:x"; };
  wEN.HTMLAnchorElement.prototype.click = function () { };
  wEN.document.getElementById("btnExportJson").click();
  const jsonEN = JSON.parse(await blobEN.text());
  ok("Un archivo guardado en inglés no guarda etiquetas traducidas",
     jsonEN.seccion_1_ordenar_trabajo.metadata_proceso.departamento === "Contabilidad" &&
     jsonEN.seccion_4_indicadores_desarrollo.entregable.tipo === "Automatización o script",
     JSON.stringify([jsonEN.seccion_1_ordenar_trabajo.metadata_proceso.departamento,
                     jsonEN.seccion_4_indicadores_desarrollo.entregable.tipo]));

  const wES = arrancar();
  const fES = new wES.File([JSON.stringify(jsonEN)], "en.json", { type: "application/json" });
  const inES = wES.document.getElementById("fileInput");
  Object.defineProperty(inES, "files", { value: [fES], configurable: true });
  inES.dispatchEvent(new wES.Event("change", { bubbles: true }));
  await new Promise(r => setTimeout(r, 400));
  ok("Ese archivo se abre en español sin perder el departamento",
     wES.document.getElementById("s1_departamento").value === "Contabilidad",
     wES.document.getElementById("s1_departamento").value);
  ok("Ese archivo se abre en español sin perder el tipo de entregable",
     wES.document.getElementById("s4_entregable_tipo").value === "Automatización o script",
     wES.document.getElementById("s4_entregable_tipo").value);

  /* ============================ Informe ============================ */
  const fallos = resultados.filter(r => !r.cond);
  console.log(`\n${resultados.length - fallos.length}/${resultados.length} comprobaciones OK\n`);
  resultados.forEach(r => {
    if (!r.cond) console.log(`  ✗ ${r.nombre}${r.detalle ? "  ·  " + r.detalle : ""}`);
  });
  if (erroresConsola.length) {
    console.log("\nErrores de runtime:");
    erroresConsola.forEach(e => console.log("  ! " + e));
  }
  if (fallos.length || erroresConsola.length) process.exit(1);
  console.log("Todo en verde.");
})();
