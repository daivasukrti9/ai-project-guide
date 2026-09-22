/* ==========================================================================
   Verificación en navegador real — AI Project Guide

   Uso:   cd tests && npm install && npx playwright install chromium
          node probar-navegador.js

   Opcional, como la batería de jsdom. Cubre lo que un DOM simulado no puede:
   render real, impresión y, sobre todo, que los tres prompts y el catálogo
   salgan enteros en el idioma elegido.
   ========================================================================== */

const { chromium } = require("playwright");

const path = require("path");
const SRC = "file:///" + path.join(__dirname, "..", "src", "index.html").split(path.sep).join("/");

/* Marcas EXCLUSIVAS del español. No sirven las palabras comunes (el, para,
   que…) porque el portugués comparte casi todas: usarlas daba falsos
   positivos en cada línea. Estas no existen en portugués:
     ñ · ¿ · ¡ · terminación -ción (en portugués es -ção) · más · también… */
const RASTROS_ES = /[ñ¿¡]|ción\b|ciones\b|\b(qué|cómo|más|también|está|están|después|desarrollo|hacia|aquí|ahora bien)\b/i;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "es-ES" });
  const page = await ctx.newPage();
  const errores = [];
  page.on("pageerror", e => errores.push("PAGEERROR: " + e.message));
  page.on("console", m => { if (m.type() === "error") errores.push("CONSOLE: " + m.text()); });

  await page.goto(SRC);
  await page.waitForTimeout(300);

  // Datos mínimos
  await page.fill("#s1_nombre_proceso", "Conciliacion de facturas");
  await page.fill('#entradasRows [data-field="texto"]', "Facturas");
  await page.selectOption('#entradasRows [data-field="canal"]', "correo");
  await page.selectOption('#entradasRows [data-field="formato"]', "pdf");
  await page.fill('#tareasHabitualesRows [data-f="nombre"]', "Cotejar");
  await page.fill('#tareasHabitualesRows [data-f="cantidad"]', "20");
  await page.fill('#tareasHabitualesRows [data-f="minutos_por_unidad"]', "12");

  await page.click('[data-goto="3"]');
  await page.waitForTimeout(200);
  const niveles = await page.$$("#levelPicker .level-option");
  await niveles[2].click();
  await page.waitForTimeout(150);
  const ideas = await page.$$("[data-idea-check]");
  await ideas[0].click();

  await page.click('[data-goto="4"]');
  await page.waitForTimeout(200);
  const comp = await page.$("#comparativoRows [data-f='horas_automatizado']");
  if (comp) await comp.fill("1");
  await page.fill("#s3_costo_hora", "28");
  await page.selectOption("#s4_entregable_tipo", { index: 2 });
  await page.fill("#s4_entregable_resultado", "Apps Script");
  const dudas = await page.$$("[data-duda-check]");
  await dudas[0].click();
  await page.click('#audienciaPicker [data-valor="jefatura"]');
  await page.click('#objetivoPicker [data-valor="escalar"]');
  await page.waitForTimeout(200);

  for (const idioma of ["es", "en", "pt"]) {
    await page.selectOption("#idiomaSelect", idioma);
    await page.waitForTimeout(350);

    await page.click('[data-goto="3"]');
    await page.waitForTimeout(200);
    const maestro = await page.textContent("#promptMaestro");
    await page.click('[data-goto="4"]');
    await page.waitForTimeout(200);
    const consulta = await page.textContent("#promptDudas");
    const presentacion = await page.textContent("#promptPresentacion");

    console.log(`\n===== ${idioma.toUpperCase()} =====`);
    console.log("prompt maestro, primeras lineas:");
    console.log("   " + maestro.split("\n").slice(0, 3).join("\n   "));
    console.log("consulta de dudas, 1a linea: " + consulta.split("\n")[0]);
    console.log("presentacion, 1a linea:      " + presentacion.split("\n")[0]);

    if (idioma !== "es") {
      /* Se quitan los datos que escribió el usuario (están en español a
         propósito) y se revisa lo que queda. */
      const limpiar = txt => txt
        .split("\n")
        .filter(l => !/Conciliacion|Facturas|Cotejar|Apps Script|Contabilidad/.test(l))
        .join("\n");
      [["maestro", maestro], ["consulta", consulta], ["presentacion", presentacion]].forEach(([nombre, txt]) => {
        const sospechosas = limpiar(txt).split("\n").filter(l => l.trim() && RASTROS_ES.test(l));
        if (sospechosas.length) {
          console.log(`   ⚠ ${nombre}: ${sospechosas.length} linea(s) con aspecto de español`);
          sospechosas.slice(0, 3).forEach(l => console.log("      · " + l.trim().slice(0, 95)));
        } else {
          console.log(`   ✓ ${nombre}: sin restos de español`);
        }
      });
    }
  }

  // Catálogo en el idioma activo
  await page.selectOption("#idiomaSelect", "en");
  await page.waitForTimeout(300);
  await page.evaluate(() => { window.print = () => {}; document.getElementById("btnCatalogoPdf").click(); });
  await page.waitForTimeout(200);
  const doc = await page.textContent("#docCatalogo");
  console.log("\ncatalogo en EN, titulo:", doc.trim().split("\n")[0].trim().slice(0, 60));
  console.log("catalogo contiene 'Resource Catalog':", doc.includes("Resource Catalog"));
  console.log("catalogo contiene 'Glossary':", doc.includes("Glossary"));

  console.log("\nerrores de consola:", errores.length ? errores.join(" | ") : "ninguno");
  await browser.close();
})();
