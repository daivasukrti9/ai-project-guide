/* ==========================================================================
   AI Project Guide — lógica de la app
   100% cliente. Sin llamadas a IA ni a servicios externos.
   Todo el estado vive en memoria y se persiste manualmente vía JSON
   (descarga/carga). No hay backend ni base de datos.
   ========================================================================== */

(() => {
  "use strict";

  const SCHEMA_VERSION = "1.0.0";
  const APP_VERSION = "1.0.0";

  /* ------------------------------------------------------------------
     Textos de interfaz. El idioma activo se resuelve acá; el estado nunca
     guarda etiquetas traducidas, solo ids.
     ------------------------------------------------------------------ */
  const I18N = window.AIPG_I18N || { idiomaPorDefecto: "es", idiomas: { es: {} }, ambiguos: { es: {} }, vocabulario: { entrada: { canales: [], formatos: [] }, salida: { canales: [], formatos: [] } } };
  let idiomaActivo = I18N.idiomaPorDefecto;

  function t(clave, vars) {
    const tabla = I18N.idiomas[idiomaActivo] || I18N.idiomas[I18N.idiomaPorDefecto] || {};
    let texto = tabla[clave];
    if (texto == null) texto = (I18N.idiomas[I18N.idiomaPorDefecto] || {})[clave];
    if (texto == null) return clave; // clave sin traducir: visible a propósito
    if (vars) Object.keys(vars).forEach(k => { texto = texto.split("{" + k + "}").join(vars[k]); });
    return texto;
  }

  /* Aplica el idioma a todo el DOM marcado con data-i18n*. El estado no se
     toca: solo cambian las etiquetas que ve la persona. */
  function aplicarIdioma(codigo) {
    idiomaActivo = I18N.idiomas[codigo] ? codigo : I18N.idiomaPorDefecto;
    document.documentElement.setAttribute("lang", idiomaActivo);
    document.title = t("ui.tituloDocumento");

    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    document.querySelectorAll("[data-i18n-title]").forEach(el => { el.setAttribute("title", t(el.dataset.i18nTitle)); });

    try { localStorage.setItem("aipg-idioma", idiomaActivo); } catch (e) { /* modo privado */ }
    const sel = document.getElementById("idiomaSelect");
    if (sel && sel.value !== idiomaActivo) sel.value = idiomaActivo;
    rerenderizarPorIdioma();
  }

  /* Lo que se dibuja desde JS hay que volver a dibujarlo: se guarda el estado
     antes para no perder lo cargado. */
  function rerenderizarPorIdioma() {
    if (!document.getElementById("entradasRows")) return; // todavía no inicializó
    mapaOpciones = null;
    collectState();
    applyTheme(document.documentElement.getAttribute("data-theme") || "light");

    const copy = heroCopy(currentStep);
    document.getElementById("heroTitle").textContent = copy.titulo;
    document.getElementById("heroLede").textContent = copy.lede;

    // Sección 1
    renderMapeoCompleto();
    renderDiagnosticoCarga();
    calcularCapacidad();
    refrescarVistaActiva();

    // Sección 2 — se reconstruyen las opciones y se recalculan los cuadros
    renderPickersClasificacion();
    initEcosistema();
    renderRecomendacion();
    renderEcosistema();

    // Sección 3
    renderLevelPicker();
    const lvActual = LEVELS.find(l => l.id === state.seccion_3_compresion_proyecto.nivel_solucion);
    document.getElementById("levelWhy").textContent = lvActual ? `💡 ${textoNivel(lvActual.id, "why")}` : "";
    renderGuiaDesarrollo();
    renderGaleriaIdeas();
    renderPromptLauncher();

    // Sección 4
    renderComparativoAutomatizacion();
    updateRoi();
    initDudas();
    renderPresentacion();
  }

  function initIdioma() {
    let guardado = null;
    try { guardado = localStorage.getItem("aipg-idioma"); } catch (e) { /* modo privado */ }
    const navegador = (navigator.language || "es").slice(0, 2).toLowerCase();
    const inicial = guardado || (I18N.idiomas[navegador] ? navegador : I18N.idiomaPorDefecto);
    const sel = document.getElementById("idiomaSelect");
    if (sel) sel.addEventListener("change", () => aplicarIdioma(sel.value));
    aplicarIdioma(inicial);
  }

  /* Los <option> guardan su texto en español como value (canónico) y su
     etiqueta traducida vía data-i18n. Para mostrar uno de esos valores en un
     prompt o documento hay que volver a traducirlo. El mapa se construye del
     propio DOM: si mañana se agrega una opción, se resuelve sola. */
  let mapaOpciones = null;
  function etiquetaOpcion(valor) {
    if (!valor) return valor;
    if (!mapaOpciones) {
      mapaOpciones = {};
      document.querySelectorAll("option[data-i18n][value]").forEach(op => {
        if (op.value) mapaOpciones[op.value] = op.dataset.i18n;
      });
    }
    const clave = mapaOpciones[valor];
    return clave ? t(clave) : valor;
  }

  function escAttr(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  const escHtml = escAttr;

  /* ------------------------------------------------------------------
     Catálogo de skills (copia embebida de src/skills-catalog.json para
     que la app funcione abriendo index.html directamente con file://,
     sin servidor y sin peticiones fetch bloqueadas por CORS).
     ------------------------------------------------------------------ */
  const SKILLS_CATALOG = {
    schema_version: "1.0.0",
    categorias: [
      {
        id: "00-core", nombre: "Núcleo del proceso", skills: [
          { id: "project-intake", nombre: "Project Intake", proposito: "Convierte una idea en objetivo, problema, alcance y preguntas pendientes.", momento: "Etapa 1" },
          { id: "phase-gate", nombre: "Phase Gate", proposito: "Controla qué requisitos deben estar completos para pasar de etapa.", momento: "Todas" },
          { id: "project-export-import", nombre: "Project Export/Import", proposito: "Exporta/importa el expediente portable y reanuda desde la última etapa.", momento: "Todas" }
        ]
      },
      {
        id: "01-planning", nombre: "Planificación", skills: [
          { id: "capacity-planner", nombre: "Capacity Planner", proposito: "Calcula capacidad laboral real y distribuye horas (regla 80/20).", momento: "Etapa 1" },
          { id: "gantt-generator", nombre: "Gantt Generator", proposito: "Crea Gantt a partir de tareas, dependencias, esfuerzo y capacidad.", momento: "Etapa 1-2" },
          { id: "kanban-generator", nombre: "Kanban Generator", proposito: "Crea Kanban con WIP, prioridad y dependencias.", momento: "Etapa 1-2" }
        ]
      },
      {
        id: "02-research", nombre: "Investigación", skills: [
          { id: "research-plan", nombre: "Research Plan", proposito: "Convierte vacíos de información en preguntas, fuentes y entregables.", momento: "Etapa 1" },
          { id: "google-research", nombre: "Google Research", proposito: "Guía la investigación con Drive, Docs, Sheets y recursos Google.", momento: "Etapa 2" }
        ]
      },
      {
        id: "03-architecture", nombre: "Arquitectura de solución", skills: [
          { id: "solution-assessment", nombre: "Solution Assessment", proposito: "Compara automatización, script, aplicación, datos e IA.", momento: "Etapa 2-3" },
          { id: "google-solution-architect", nombre: "Google Solution Architect", proposito: "Diseña primero con Workspace cuando sea suficiente.", momento: "Etapa 3" },
          { id: "adr-writer", nombre: "ADR Writer", proposito: "Crea Architecture Decision Records.", momento: "Etapa 3" }
        ]
      },
      {
        id: "04-code", nombre: "Desarrollo", skills: [
          { id: "clean-code", nombre: "Clean Code", proposito: "Revisa nombres, responsabilidades, acoplamiento y duplicación.", momento: "Desarrollo" },
          { id: "tdd", nombre: "TDD", proposito: "Aplica RED-GREEN-REFACTOR.", momento: "Desarrollo" }
        ]
      },
      {
        id: "05-quality", nombre: "Calidad", skills: [
          { id: "webapp-e2e", nombre: "Webapp E2E", proposito: "Ejecuta smoke/E2E sobre los flujos críticos.", momento: "Validación" },
          { id: "verification-gate", nombre: "Verification Gate", proposito: "No declara terminado hasta disponer de evidencia.", momento: "Todas" }
        ]
      },
      {
        id: "06-security", nombre: "Seguridad", skills: [
          { id: "synthetic-data-guard", nombre: "Synthetic Data Guard", proposito: "Impide/advierte sobre datos confidenciales.", momento: "Todas" },
          { id: "secrets-audit", nombre: "Secrets Audit", proposito: "Busca secretos en archivos, logs y repositorio.", momento: "Antes de compartir/commit" }
        ]
      },
      {
        id: "07-knowledge", nombre: "Conocimiento", skills: [
          { id: "obsidian-vault-manager", nombre: "Obsidian Vault Manager", proposito: "Organiza conocimiento en Markdown con índices y enlaces.", momento: "Todas" }
        ]
      },
      {
        id: "08-docs", nombre: "Documentación y comunicación", skills: [
          { id: "sop-generator", nombre: "SOP Generator", proposito: "Genera SOP con marcadores [PENDIENTE DE VALIDACIÓN].", momento: "Final" },
          { id: "presentation-builder", nombre: "Presentation Builder", proposito: "Convierte el expediente validado en presentación ejecutiva.", momento: "Final" },
          { id: "validation-pack", nombre: "Validation Pack", proposito: "Crea checklist de aprobación empresarial.", momento: "Final" }
        ]
      },
      {
        id: "09-agent", nombre: "Autonomía (avanzado)", skills: [
          { id: "autonomy-readiness", nombre: "Autonomy Readiness", proposito: "Evalúa si una automatización puede pasar a agente/autónomo.", momento: "Avanzado" },
          { id: "human-in-loop", nombre: "Human in the Loop", proposito: "Fuerza aprobación humana para acciones sensibles.", momento: "Avanzado" },
          { id: "dry-run", nombre: "Dry Run", proposito: "Simula acciones antes de ejecutar.", momento: "Automatización" }
        ]
      },
      {
        id: "10-ops", nombre: "Operación", skills: [
          { id: "drive-archive", nombre: "Drive Archive", proposito: "Archiva entregables por proyecto, etapa y versión.", momento: "Todas" },
          { id: "release-checklist", nombre: "Release Checklist", proposito: "Checklist de versión, backup, pruebas y rollback.", momento: "Antes de producción" }
        ]
      },
      {
        id: "11-ux", nombre: "Experiencia de usuario", skills: [
          { id: "ux-clarity", nombre: "UX Clarity", proposito: "Revisa lenguaje, carga cognitiva, accesibilidad.", momento: "Portal y apps" }
        ]
      }
    ]
  };

  /* Base de cálculo de todo el impacto de la Sección 4. Un solo lugar para
     que semana/mes/año no se contradigan entre tarjetas y prompts. */
  const DIAS_HABILES = { semana: 5, mes: 22, anio: 264 };
  const SEMANAS_MES = DIAS_HABILES.mes / DIAS_HABILES.semana; // 4.4

  /* El id se persiste en el expediente: no se traduce nunca. El resto de
     las etiquetas sale de i18n.js (claves nivel.N.*). */
  const LEVELS = [
    { id: "Nivel 1: Presentación / Documento de Asistencia" },
    { id: "Nivel 2: Herramienta / Script de Automatización Fija" },
    { id: "Nivel 3: Herramienta / Visualización / Conjunto de Funciones" },
    { id: "Nivel 4: Agente Autónomo / Multi-herramienta" }
  ];

  function textoNivel(levelId, campo) {
    const n = (claveNivel(levelId) || "Nivel 1").replace("Nivel ", "");
    return t(`nivel.${n}.${campo}`);
  }
;

  /* ------------------------------------------------------------------ STATE */
  function emptyState() {
    return {
      schema_version: SCHEMA_VERSION,
      app_meta: {
        id_expediente: "PROC-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        nombre_proyecto: "",
        etapa_actual: 1,
        etapas_completadas: [],
        generado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
        version_app: APP_VERSION
      },
      seccion_1_ordenar_trabajo: {
        metadata_proceso: { id_proceso: "", nombre_proceso: "", departamento: "", responsable_proceso: "", fecha_evaluacion: "", nivel_madurez_actual: "Nivel 1: Asistencia / Presentaciones" },
        mapeo_entradas_salidas: { entradas: [], salidas: [], punto_entrada_unico_definido: false },
        // entradas/salidas: [{ texto, canal, formato }] — ver normalizarMapeo()
        metricas_tiempo_y_costos: { frecuencia_ejecucion: "Diaria", volumen_ejecuciones_mes: 0, horas_hombre_por_ejecucion: 0, horas_hombre_totales_mes: 0, numero_personas_involucradas: 0, costo_hora_promedio_usd: 0, tiempo_espera_o_bloqueo_horas: 0, jornada_laboral_horas_dia: 8 },
        tareas_habituales: [],
        capacidad_80_20: { modo_equipo: false, horas_jornada_semanal: 40, porcentaje_innovacion: 0.2, colaboradores: [] },
        puntos_de_dolor: [],
        cronograma_gantt: []
      },
      seccion_2_clasificacion_proyecto: {
        respuestas: { entregable: "", mapeo_proceso: "", nivel_logica: "", fuente_datos: "", confidencialidad: "" },
        recomendacion: { nombre_tecnico: "", guia: "", investigar_con_ia: "", advertencia_seguridad: "" },
        evaluacion_ecosistema: { respuestas: {}, puntaje: 0, nivel: "" }
      },
      seccion_3_compresion_proyecto: { nivel_solucion: "", sugerencias_seleccionadas: [], ia_preferida: "", tecnologias_sugeridas: [], kpis_y_metricas_clave: [], roi_estimado: { potencial_ahorro_horas_mes: 0, roi_estimado_mensual_usd: 0, tiempo_estimado_implementacion: "", requiere_aprobacion_seguridad: false }, comparativo_automatizacion: [] },
      seccion_4_indicadores_desarrollo: {
        skills_seleccionadas: [], diccionario_exportado_formato: "JSON",
        prompts_generados: [], plan_gestion_cambio: { checklist: [], responsable_sponsor: "", fecha_revision_piloto: "" },
        entregable: { tipo: "", estado_ejecucion: "", resultado: "", notas_ejecucion: "" },
        dudas: { puntos_confusos: [], detalle: "" },
        presentacion: { audiencia: "", objetivo: "", incluir_logo: false }
      }
    };
  }

  let state = emptyState();
  let currentStep = 1;

  /* ------------------------------------------------------------------ THEME */
  function initTheme() {
    const saved = localStorage.getItem("aipg-theme");
    const theme = saved || "light";
    applyTheme(theme);
    document.getElementById("themeToggle").addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("aipg-theme", next);
    });
  }

  function actualizarScrollTabla() {
    const el = document.querySelector("#view-tabla .table-scroll");
    if (!el) return;
    const restante = el.scrollWidth - el.scrollLeft - el.clientWidth;
    el.dataset.scrollable = restante > 2 ? "true" : "false";
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.getElementById("themeToggle");
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
    btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    btn.setAttribute("aria-label", t(theme === "dark" ? "ui.modoClaro" : "ui.modoOscuro"));
  }

  /* ------------------------------------------------------------------ NAV */
  /* El texto del encabezado por sección vive en i18n.js (claves hero.N.*). */
  function heroCopy(step) {
    return { titulo: t(`hero.${step}.titulo`), lede: t(`hero.${step}.lede`) };
  };

  function goToStep(step) {
    currentStep = step;
    document.querySelectorAll(".wizard-panel").forEach(p => { p.hidden = Number(p.dataset.panel) !== step; });
    document.querySelectorAll(".step-item").forEach(li => {
      const s = Number(li.dataset.step);
      const btn = li.querySelector(".step-btn");
      li.removeAttribute("data-state");
      btn.removeAttribute("aria-current");
      if (s === step) { li.setAttribute("data-state", "active"); btn.setAttribute("aria-current", "step"); }
      else if (state.app_meta.etapas_completadas.includes(s)) { li.setAttribute("data-state", "done"); }
    });
    state.app_meta.etapa_actual = step;
    const circunferencia = 351.9;
    document.getElementById("progressRingFill").setAttribute("stroke-dashoffset", (circunferencia * (1 - step / 4)).toFixed(1));
    document.getElementById("progressRingStep").textContent = step;
    document.querySelector(".progress-ring-wrap").setAttribute("aria-label", `Progreso: paso ${step} de 4`);
    const copy = heroCopy(step);
    if (copy) {
      document.getElementById("heroTitle").textContent = copy.titulo;
      document.getElementById("heroLede").textContent = copy.lede;
    }
    document.getElementById("main-content").focus?.();
    window.scrollTo({ top: 0, behavior: "auto" });
    if (step === 3) {
      if (typeof renderGuiaDesarrollo === 'function') renderGuiaDesarrollo();
    }
    if (step === 4) {
      actualizarScrollTabla();
      if (typeof renderConsultaDudas === "function") renderConsultaDudas();
      if (typeof renderPresentacion === "function") renderPresentacion();
    }
  }

  function markStepComplete(step) {
    if (!state.app_meta.etapas_completadas.includes(step)) state.app_meta.etapas_completadas.push(step);
  }

  /* ------------------------------------------------------------------ REPEATABLE ROWS */
  function addRow(containerId, tplId, data, onChange) {
    const tpl = document.getElementById(tplId);
    const node = tpl.content.firstElementChild.cloneNode(true);
    Object.keys(data || {}).forEach(k => {
      const el = node.querySelector(`[data-field="${k}"]`);
      if (!el) return;
      if (el.type === "checkbox") el.checked = !!data[k]; else if (el.tagName !== "SPAN") el.value = data[k];
    });
    node.querySelectorAll("input, select").forEach(el => el.addEventListener("input", onChange));
    node.querySelector("[data-remove-row]").addEventListener("click", () => { node.remove(); onChange(); });
    document.getElementById(containerId).appendChild(node);
    return node;
  }

  function readRows(containerId, fields) {
    const rows = Array.from(document.getElementById(containerId).children);
    return rows.map(row => {
      const obj = {};
      fields.forEach(f => {
        const el = row.querySelector(`[data-field="${f}"]`);
        if (!el || el.tagName === "SPAN") return;
        obj[f] = el.type === "checkbox" ? el.checked : el.type === "number" ? Number(el.value || 0) : el.value;
      });
      return obj;
    });
  }

  /* ------------------------------------------------------------------ SECCIÓN 1 */
  function calcularCapacidad() {
    const jornada = state.seccion_1_ordenar_trabajo.capacidad_80_20.horas_jornada_semanal || 40;
    const pct = state.seccion_1_ordenar_trabajo.capacidad_80_20.porcentaje_innovacion || 0.2;
    const objetivoInnovacion = jornada * pct; // ej. 8h/semana

    const rows = Array.from(document.getElementById("capacidadRows").children);
    let totalOperativas = 0, totalDisponible = 0;
    const colaboradores = rows.map(row => {
      const nombre = row.querySelector('[data-field="nombre_o_rol"]').value;
      const horasOps = Number(row.querySelector('[data-field="horas_operativas_actuales"]').value || 0);
      totalOperativas += horasOps;
      const horasLibres = Math.max(0, jornada - horasOps);
      totalDisponible += horasLibres;

      let estado, colorState;
      if (horasOps > jornada) {
        estado = `Sobrecargado (+${(horasOps - jornada).toFixed(1)}h)`; colorState = "rojo";
      } else if (horasLibres < objetivoInnovacion * 0.5) {
        estado = "Carga Alta · casi sin margen"; colorState = "amarillo";
      } else if (horasLibres <= objetivoInnovacion * 1.5) {
        estado = "Balance Ideal 80/20"; colorState = "verde";
      } else {
        estado = "Capacidad ociosa alta"; colorState = "azul";
      }

      row.querySelector('[data-field="horas_libres"]').textContent = `${horasLibres.toFixed(1)}h libres`;
      const badge = row.querySelector('[data-field="badge"]');
      badge.textContent = `${{ rojo: "🔴", amarillo: "🟡", verde: "🟢", azul: "🔵" }[colorState]} ${estado}`;
      badge.dataset.state = colorState;

      return { nombre_o_rol: nombre, horas_operativas_actuales: horasOps, horas_disponibles_para_mejora: Number(horasLibres.toFixed(1)), estado_carga: estado };
    });

    const resumenEl = document.getElementById("capacidadResumen");
    const pctCarga = colaboradores.length ? ((totalDisponible / (colaboradores.length * jornada)) * 100).toFixed(1) : "0";
    const colorPct = Number(pctCarga) < 10 ? "🟡" : Number(pctCarga) > 40 ? "🔵" : "🟢";
    resumenEl.innerHTML = `
      <div class="summary-card"><div class="value">${colaboradores.length}</div><div class="label">${escHtml(t("cap.colaboradores"))}</div></div>
      <div class="summary-card"><div class="value">${totalDisponible.toFixed(1)}h</div><div class="label">${escHtml(t("cap.disponibles"))}</div></div>
      <div class="summary-card"><div class="value">${colorPct} ${pctCarga}%</div><div class="label">${escHtml(t("cap.promedioInnovacion"))}</div></div>`;

    const velocidadEl = document.getElementById("velocidadSprint");
    if (velocidadEl) {
      const velocidadSprint = (totalDisponible * 2).toFixed(1);
      velocidadEl.textContent = colaboradores.length
        ? `📊 Velocidad estimada del sprint: ${velocidadSprint} horas-hombre totales para desarrollo en 2 semanas (aproximado: suma la disponibilidad semanal x 2).`
        : t("cap.sinColaboradores");
    }
    return colaboradores;
  }

  function initSeccion1() {
    document.getElementById("btnAddColaborador").addEventListener("click", () => addRow("capacidadRows", "tpl-colaborador-row", {}, calcularCapacidad));
    document.getElementById("btnAddEntrada").addEventListener("click", () => { addMapeoRow("entrada"); renderResumenMapeo("entrada"); });
    document.getElementById("btnAddSalida").addEventListener("click", () => { addMapeoRow("salida"); renderResumenMapeo("salida"); });
    renderMapeoCompleto();

    document.getElementById("btnAddDolor").addEventListener("click", () => addRow("dolorRows", "tpl-dolor-row", { id_dolor: "" }, () => { }));
    document.getElementById("btnAddTarea").addEventListener("click", () => addGanttRow());
    addRow("capacidadRows", "tpl-colaborador-row", {}, calcularCapacidad);
    initTareasHabituales();
    addGanttRow();
    initCronogramaViews();
    initModoEquipo();
  }

  function initModoEquipo() {
    document.getElementById("esManagerEquipo").addEventListener("change", e => aplicarModoEquipo(e.target.checked));
  }

  function aplicarModoEquipo(activo) {
    document.getElementById("equipoContenido").hidden = !activo;
    document.getElementById("notaSoloIndividual").hidden = activo;
  }

  /* -------------------------------------------------- Paso 1: tareas habituales / diagnóstico de carga */
  function addTareaHabitualRow(data) {
    data = data || {};
    const tipo = data.tipo === "Fijo" ? "Fijo" : "Repetitiva";
    const row = document.createElement("div");
    row.className = "row-card row-card--habitual";
    row.innerHTML = `
      <input data-f="nombre" value="${escAttr(data.nombre || "")}" placeholder="Ej. Procesar facturas" />
      <select data-f="tipo">
        <option value="Repetitiva"${tipo === "Repetitiva" ? " selected" : ""}>Repetitiva</option>
        <option value="Fijo"${tipo === "Fijo" ? " selected" : ""}>Tiempo fijo</option>
      </select>
      <span class="tarea-detalle" data-f="detalle-wrap"></span>
      <span class="row-result" data-f="horas_dia">—</span>
      <button type="button" class="btn-icon" data-remove aria-label="${escAttr(t("aria.eliminarTarea"))}">🗑️</button>`;

    const detalleWrap = row.querySelector('[data-f="detalle-wrap"]');
    function pintarDetalle(t) {
      if (t === "Repetitiva") {
        detalleWrap.innerHTML = `<input type="number" data-f="cantidad" min="0" step="1" value="${escAttr(data.cantidad ?? 10)}" /> ×
          <input type="number" data-f="minutos_por_unidad" min="0" step="1" value="${escAttr(data.minutos_por_unidad ?? 10)}" /> min`;
      } else {
        detalleWrap.innerHTML = `<input type="number" data-f="horas_fijas" min="0" step="0.5" value="${escAttr(data.horas_fijas ?? 1)}" /> hrs/día`;
      }
      detalleWrap.querySelectorAll("input").forEach(el => el.addEventListener("input", () => { actualizarTareaHabitual(row); renderDiagnosticoCarga(); }));
    }
    pintarDetalle(tipo);
    row.querySelector('[data-f="tipo"]').addEventListener("change", e => { pintarDetalle(e.target.value); actualizarTareaHabitual(row); renderDiagnosticoCarga(); });
    row.querySelector('[data-f="nombre"]').addEventListener("input", () => renderDiagnosticoCarga());
    row.querySelector('[data-remove]').addEventListener("click", () => { row.remove(); renderDiagnosticoCarga(); });

    document.getElementById("tareasHabitualesRows").appendChild(row);
    actualizarTareaHabitual(row);
    return row;
  }

  function actualizarTareaHabitual(row) {
    const tipo = row.querySelector('[data-f="tipo"]').value;
    let horas;
    if (tipo === "Repetitiva") {
      const cant = Number(row.querySelector('[data-f="cantidad"]')?.value || 0);
      const mins = Number(row.querySelector('[data-f="minutos_por_unidad"]')?.value || 0);
      horas = (cant * mins) / 60;
    } else {
      horas = Number(row.querySelector('[data-f="horas_fijas"]')?.value || 0);
    }
    row.querySelector('[data-f="horas_dia"]').textContent = `${horas.toFixed(1)} hrs/día`;
    return horas;
  }

  function readTareasHabituales() {
    return Array.from(document.getElementById("tareasHabitualesRows").children).map(row => {
      const tipo = row.querySelector('[data-f="tipo"]').value;
      const obj = {
        nombre: row.querySelector('[data-f="nombre"]').value,
        tipo,
        horas_dia: Number(actualizarTareaHabitual(row).toFixed(2))
      };
      if (tipo === "Repetitiva") {
        obj.cantidad = Number(row.querySelector('[data-f="cantidad"]')?.value || 0);
        obj.minutos_por_unidad = Number(row.querySelector('[data-f="minutos_por_unidad"]')?.value || 0);
      } else {
        obj.horas_fijas = Number(row.querySelector('[data-f="horas_fijas"]')?.value || 0);
      }
      return obj;
    });
  }

  function calcularDiagnostico() {
    const jornada = Number(document.getElementById("carga_jornada").value || 8) || 8;
    const tareas = readTareasHabituales();
    const cargaOperativa = tareas.reduce((sum, t) => sum + t.horas_dia, 0);
    const tiempoLibre = jornada - cargaOperativa;
    return { jornada, tareas, cargaOperativa, tiempoLibre };
  }

  /* -------------------------------------------------- Mapeo de entradas y salidas */

  /* Un expediente viejo guardaba ["Correo del cliente", "Planilla"] como
     texto suelto. Se convierte a la forma estructurada sin perder lo escrito:
     el texto se conserva y canal/formato quedan vacíos para completar. */
  function normalizarMapeo(lista) {
    return (lista || []).map(item => {
      if (typeof item === "string") return { texto: item, canal: "", formato: "" };
      return { texto: item.texto || "", canal: item.canal || "", formato: item.formato || "" };
    }).filter(x => x.texto || x.canal || x.formato);
  }

  function opcionesSelect(items, prefijo, seleccionado) {
    const vacia = `<option value="">${escHtml(t("s1.mapeo.elegir"))}</option>`;
    return vacia + items.map(it =>
      `<option value="${escAttr(it.id)}"${it.id === seleccionado ? " selected" : ""}>${it.icono} ${escHtml(t(prefijo + it.id))}</option>`
    ).join("");
  }

  function addMapeoRow(tipo, data) {
    data = data || { texto: "", canal: "", formato: "" };
    const contenedor = tipo === "entrada" ? "entradasRows" : "salidasRows";
    const vocab = I18N.vocabulario[tipo];
    const tpl = document.getElementById("tpl-mapeo-row");
    const node = tpl.content.firstElementChild.cloneNode(true);

    const inputTexto = node.querySelector('[data-field="texto"]');
    inputTexto.value = data.texto || "";
    inputTexto.placeholder = t(tipo === "entrada" ? "s1.mapeo.phEntrada" : "s1.mapeo.phSalida");

    const selCanal = node.querySelector('[data-field="canal"]');
    selCanal.innerHTML = opcionesSelect(vocab.canales, `canal.${tipo}.`, data.canal);
    selCanal.setAttribute("aria-label", t(tipo === "entrada" ? "s1.mapeo.col.canal" : "s1.mapeo.col.canalSalida"));

    const selFormato = node.querySelector('[data-field="formato"]');
    selFormato.innerHTML = opcionesSelect(vocab.formatos, `formato.${tipo}.`, data.formato);
    selFormato.setAttribute("aria-label", t("s1.mapeo.col.formato"));

    node.querySelector("[data-remove-row]").setAttribute("aria-label", t("s1.mapeo.quitar"));
    node.dataset.tipo = tipo;

    const alCambiar = () => { actualizarFilaMapeo(node); renderResumenMapeo(tipo); };
    node.querySelectorAll("input, select").forEach(el => el.addEventListener("input", alCambiar));
    node.querySelector("[data-remove-row]").addEventListener("click", () => { node.remove(); renderResumenMapeo(tipo); });

    document.getElementById(contenedor).appendChild(node);
    actualizarFilaMapeo(node);
    return node;
  }

  /* Semáforo y pista de concreción de una fila. No hay heurística de
     "palabras cortas": una fila está completa cuando tiene las tres cosas. */
  function actualizarFilaMapeo(node) {
    const texto = node.querySelector('[data-field="texto"]').value.trim();
    const canal = node.querySelector('[data-field="canal"]').value;
    const formato = node.querySelector('[data-field="formato"]').value;
    const estado = node.querySelector('[data-field="estado"]');
    const pista = node.querySelector('[data-field="pista"]');

    if (!texto && !canal && !formato) {
      estado.textContent = "";
      estado.removeAttribute("aria-label");
      estado.removeAttribute("title");
      pista.hidden = true;
      return;
    }
    const completa = !!(texto && canal && formato);
    estado.textContent = completa ? "🟢" : "🟡";
    estado.setAttribute("aria-label", t(completa ? "s1.mapeo.completo" : "s1.mapeo.parcial"));
    estado.setAttribute("title", t(completa ? "s1.mapeo.completoDetalle" : "s1.mapeo.parcialDetalle"));

    const sugerencia = completa ? null : sugerenciaAmbiguedad(texto);
    if (sugerencia) { pista.textContent = "💡 " + sugerencia; pista.hidden = false; }
    else { pista.hidden = true; pista.textContent = ""; }
  }

  /* Tabla de búsqueda local, sin red ni IA: si el texto menciona un término
     ambiguo conocido, se ofrece la pregunta que lo concreta. */
  function sugerenciaAmbiguedad(texto) {
    const tabla = I18N.ambiguos[idiomaActivo] || I18N.ambiguos[I18N.idiomaPorDefecto] || {};
    const normalizado = String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const palabras = normalizado.split(/[^a-z0-9]+/).filter(Boolean);
    for (const palabra of palabras) {
      // Se prueba la palabra y su singular simple, para que "facturas" caiga en "factura".
      const candidatos = [palabra, palabra.replace(/es$/, ""), palabra.replace(/s$/, "")];
      for (const c of candidatos) if (tabla[c]) return tabla[c];
    }
    return null;
  }

  function leerMapeo(tipo) {
    const contenedor = document.getElementById(tipo === "entrada" ? "entradasRows" : "salidasRows");
    return Array.from(contenedor?.children || []).map(row => ({
      texto: row.querySelector('[data-field="texto"]').value.trim(),
      canal: row.querySelector('[data-field="canal"]').value,
      formato: row.querySelector('[data-field="formato"]').value
    })).filter(x => x.texto || x.canal || x.formato);
  }

  function renderResumenMapeo(tipo) {
    const el = document.getElementById(tipo === "entrada" ? "entradasResumen" : "salidasResumen");
    if (!el) return;
    const filas = leerMapeo(tipo);
    if (!filas.length) {
      el.textContent = t(tipo === "entrada" ? "s1.mapeo.vacioEntradas" : "s1.mapeo.vacioSalidas");
      el.dataset.estado = "vacio";
      return;
    }
    const completas = filas.filter(f => f.texto && f.canal && f.formato).length;
    el.textContent = t("s1.mapeo.resumen", { completas, total: filas.length });
    el.dataset.estado = completas === filas.length ? "completo" : "parcial";
  }

  function renderMapeoCompleto() {
    ["entrada", "salida"].forEach(tipo => {
      const contenedor = document.getElementById(tipo === "entrada" ? "entradasRows" : "salidasRows");
      const datos = normalizarMapeo(state.seccion_1_ordenar_trabajo.mapeo_entradas_salidas[tipo === "entrada" ? "entradas" : "salidas"]);
      contenedor.innerHTML = "";
      (datos.length ? datos : [null]).forEach(d => addMapeoRow(tipo, d));
      renderResumenMapeo(tipo);
    });
  }

  /* Texto legible de una entrada/salida para los prompts y exportables:
     "Facturas de proveedores (llega por Correo electrónico, en PDF)". */
  function describirMapeo(item, tipo) {
    const vocab = I18N.vocabulario[tipo];
    const canal = vocab.canales.find(c => c.id === item.canal);
    const formato = vocab.formatos.find(f => f.id === item.formato);
    const partes = [];
    if (canal) partes.push(t(`canal.${tipo}.` + canal.id).toLowerCase());
    if (formato) partes.push(t(`formato.${tipo}.` + formato.id));
    if (!partes.length) return item.texto;
    return `${item.texto} (${partes.join(", ")})`;
  }

  function renderDiagnosticoCarga() {
    const d = calcularDiagnostico();
    const box = document.getElementById("diagnosticoCarga");
    const pct = d.jornada > 0 ? (d.cargaOperativa / d.jornada) * 100 : 0;

    if (d.tiempoLibre < 0) {
      box.className = "status-box error";
      box.innerHTML = `
        <h4>${escHtml(t("carga.sobrecarga", { h: d.cargaOperativa.toFixed(1) }))}</h4>
        <p>${escHtml(t("carga.excedido", { h: Math.abs(d.tiempoLibre).toFixed(1), pct: pct.toFixed(0) }))}</p>
        <p><em>${escHtml(t("carga.sugerencia"))}</em> ${escHtml(t("carga.sugerenciaTexto"))}</p>`;
    } else if (d.tiempoLibre === 0) {
      box.className = "status-box warning";
      box.innerHTML = `<h4>${escHtml(t("carga.alCien", { h: d.jornada.toFixed(1) }))}</h4><p>${escHtml(t("carga.sinMargen"))}</p>`;
    } else {
      box.className = "status-box success";
      box.innerHTML = `
        <h4>${escHtml(t("carga.libre", { h: d.tiempoLibre.toFixed(1) }))}</h4>
        <p>${escHtml(t("carga.actual", { h: d.cargaOperativa.toFixed(1), pct: pct.toFixed(0) }))}</p>
        <p>${escHtml(t("carga.referencia"))}</p>`;
    }

    actualizarSugerenciasDias();
    refrescarVistaActiva();
    renderComparativoAutomatizacion();
  }

  function actualizarSugerenciasDias() {
    const d = calcularDiagnostico();
    Array.from(document.getElementById("ganttBody").children).forEach(tr => {
      const horasEst = Number(tr.querySelector('[data-f="horas_estimadas"]')?.value || 0);
      const sugerido = tr.querySelector('[data-suggest]');
      if (!sugerido) return;
      sugerido.textContent = horasEst > 0 && d.tiempoLibre > 0 ? `≈${Math.ceil(horasEst / d.tiempoLibre)}d hábiles` : "—";
    });
  }

  function initTareasHabituales() {
    document.getElementById("btnAddTareaHabitual").addEventListener("click", () => { addTareaHabitualRow(); renderDiagnosticoCarga(); });
    document.getElementById("carga_jornada").addEventListener("input", renderDiagnosticoCarga);
    addTareaHabitualRow({ nombre: "", tipo: "Repetitiva", cantidad: 10, minutos_por_unidad: 10 });
    renderDiagnosticoCarga();
  }

  function addGanttRow(data) {
    data = data || {};
    const tbody = document.getElementById("ganttBody");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input data-f="id_tarea" value="${escAttr(data.id_tarea || `T-${tbody.children.length + 1}`)}" /></td>
      <td><select data-f="jerarquia"><option${data.jerarquia === "Objetivo" ? " selected" : ""}>Objetivo</option><option${!data.jerarquia || data.jerarquia === "Tarea" ? " selected" : ""}>Tarea</option><option${data.jerarquia === "Subtarea" ? " selected" : ""}>Subtarea</option></select></td>
      <td><input data-f="nombre" value="${escAttr(data.nombre || "")}" /></td>
      <td><input data-f="encargado_proceso" value="${escAttr(data.encargado_proceso || "")}" /></td>
      <td><select data-f="simbolo_urgencia">
            <option${data.simbolo_urgencia === "⚡ Urgente" ? " selected" : ""}>⚡ Urgente</option>
            <option${data.simbolo_urgencia === "🔥 Alta" ? " selected" : ""}>🔥 Alta</option>
            <option${!data.simbolo_urgencia || data.simbolo_urgencia === "➡️ Normal" ? " selected" : ""}>➡️ Normal</option>
            <option${data.simbolo_urgencia === "🧊 Baja" ? " selected" : ""}>🧊 Baja</option>
          </select></td>
      <td><input data-f="dependencia_id" value="${escAttr(data.dependencia_id || "")}" placeholder="ID" /></td>
      <td><input type="number" min="0" step="0.5" data-f="horas_estimadas" value="${escAttr(data.horas_estimadas || 0)}" style="width:4.5rem" /></td>
      <td><span data-suggest class="row-result">—</span></td>
      <td><input type="date" data-f="fecha_inicio_plan" value="${escAttr(data.fecha_inicio_plan || "")}" /></td>
      <td><input type="date" data-f="fecha_fin_plan" value="${escAttr(data.fecha_fin_plan || "")}" /></td>
      <td><input type="date" data-f="fecha_inicio_real" value="${escAttr(data.fecha_inicio_real || "")}" /></td>
      <td><input type="date" data-f="fecha_fin_real" value="${escAttr(data.fecha_fin_real || "")}" /></td>
      <td><input type="number" min="0" max="100" data-f="porcentaje_avance" value="${escAttr(data.porcentaje_avance || 0)}" /></td>
      <td><select data-f="estado">
            <option${!data.estado || data.estado === "No Iniciado" ? " selected" : ""}>No Iniciado</option>
            <option${data.estado === "En Proceso" ? " selected" : ""}>En Proceso</option>
            <option${data.estado === "En Riesgo" ? " selected" : ""}>En Riesgo</option>
            <option${data.estado === "Completado" ? " selected" : ""}>Completado</option>
          </select></td>
      <td><button type="button" class="btn-icon" aria-label="${escAttr(t("aria.eliminarTarea"))}">🗑️</button></td>`;
    tr.querySelector("button").addEventListener("click", () => { tr.remove(); refrescarVistaActiva(); actualizarScrollTabla(); });
    tr.querySelectorAll("input, select").forEach(el => el.addEventListener("input", () => { actualizarSugerenciasDias(); refrescarVistaActiva(); }));
    tbody.appendChild(tr);
    actualizarSugerenciasDias();
    refrescarVistaActiva();
    actualizarScrollTabla();
  }

  function readGantt() {
    return Array.from(document.getElementById("ganttBody").children).map(tr => {
      const obj = {};
      tr.querySelectorAll("[data-f]").forEach(el => { obj[el.dataset.f] = el.type === "number" ? Number(el.value || 0) : el.value; });
      return obj;
    });
  }

  /* -------------------------------------------------- Vistas Gantt / Kanban */
  const KANBAN_COLUMNAS = ["No Iniciado", "En Proceso", "En Riesgo", "Completado"];

  function fmtFecha(d) {
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function ganttMarkup(tasks, tareasHabituales) {
    tareasHabituales = tareasHabituales || [];
    const validas = tasks
      .map(tarea => ({
        ...tarea,
        _inicioPlan: tarea.fecha_inicio_plan ? new Date(tarea.fecha_inicio_plan + "T00:00:00") : null,
        _finPlan: tarea.fecha_fin_plan ? new Date(tarea.fecha_fin_plan + "T00:00:00") : null,
        _inicioReal: tarea.fecha_inicio_real ? new Date(tarea.fecha_inicio_real + "T00:00:00") : null,
        _finReal: tarea.fecha_fin_real ? new Date(tarea.fecha_fin_real + "T00:00:00") : null
      }))
      .filter(tarea => tarea._inicioPlan && tarea._finPlan && !isNaN(tarea._inicioPlan) && !isNaN(tarea._finPlan) && tarea._finPlan >= tarea._inicioPlan);

    if (!validas.length && !tareasHabituales.length) {
      return `<p class="gantt-empty">${escHtml(t("gantt.vacio"))}</p>`;
    }

    const allDates = [];
    validas.forEach(tarea => {
      allDates.push(tarea._inicioPlan, tarea._finPlan);
      if (tarea._inicioReal && !isNaN(tarea._inicioReal)) allDates.push(tarea._inicioReal);
      if (tarea._finReal && !isNaN(tarea._finReal)) allDates.push(tarea._finReal);
    });
    const min = allDates.length ? new Date(Math.min(...allDates)) : null;
    const max = allDates.length ? new Date(Math.max(...allDates)) : null;
    const rangeMs = min && max ? Math.max(max - min, 24 * 60 * 60 * 1000) : null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayPct = min && today >= min && today <= max ? ((today - min) / rangeMs) * 100 : null;

    let html = "";

    if (tareasHabituales.length) {
      html += `<div class="gantt-operacion-section"><p class="gantt-section-title">${escHtml(t("gantt.operacionBase"))}</p>`;
      html += tareasHabituales.map(tarea => `
        <div class="gantt-band-row">
          <div class="gantt-row-label"><span class="id">${tarea.horas_dia.toFixed(1)}${escHtml(t("unidad.horasDia"))}</span>${escHtml(tarea.nombre || t("gantt.sinNombre"))}</div>
          <div class="gantt-band">Carga recurrente${tarea.tipo === "Repetitiva" ? ` — ${tarea.cantidad}× ${tarea.minutos_por_unidad}min` : " — tiempo fijo"}</div>
        </div>`).join("");
      html += `</div>`;
    }

    if (validas.length) {
      html += `<p class="gantt-section-title">${escHtml(t("gantt.proyecto"))}</p>`;
      html += `<div class="gantt-range">${escHtml(t("gantt.rango", { desde: fmtFecha(min), hasta: fmtFecha(max) }))}${todayPct !== null ? escHtml(t("gantt.hoy")) : ""}</div>`;
      html += validas.map(tarea => {
        const estado = tarea.estado || "No Iniciado";
        const avance = Math.min(100, Math.max(0, Number(tarea.porcentaje_avance) || 0));
        const leftPlan = ((tarea._inicioPlan - min) / rangeMs) * 100;
        const widthPlan = Math.max(((tarea._finPlan - tarea._inicioPlan) / rangeMs) * 100, 2);

        let realRow = "";
        if (tarea._inicioReal && tarea._finReal && !isNaN(tarea._inicioReal) && !isNaN(tarea._finReal) && tarea._finReal >= tarea._inicioReal) {
          const leftReal = ((tarea._inicioReal - min) / rangeMs) * 100;
          const widthReal = Math.max(((tarea._finReal - tarea._inicioReal) / rangeMs) * 100, 2);
          const diffDays = Math.round((tarea._finReal - tarea._finPlan) / 86400000);
          const variance = diffDays > 0 ? "tarde" : diffDays < 0 ? "temprano" : "ok";
          const varLabel = diffDays > 0 ? `🔴 +${diffDays}d` : diffDays < 0 ? `🟢 ${diffDays}d` : t("gantt.enFecha");
          realRow = `
            <div class="gantt-subrow">
              <span class="gantt-subrow-label">${escHtml(t("gantt.real"))}</span>
              <div class="gantt-track gantt-track--real">
                <div class="gantt-bar" data-variance="${variance}" style="left:${leftReal.toFixed(2)}%;width:${widthReal.toFixed(2)}%" title="${fmtFecha(tarea._inicioReal)} → ${fmtFecha(tarea._finReal)}"></div>
              </div>
              <span class="gantt-variance-badge" data-variance="${variance}">${varLabel}</span>
            </div>`;
        }

        return `
          <div class="gantt-task-group">
            <div class="gantt-task-title"><span class="id">${escHtml(tarea.id_tarea)}</span>${escHtml(tarea.simbolo_urgencia || "")} ${escHtml(tarea.nombre || t("gantt.sinNombre"))}</div>
            <div class="gantt-subrow">
              <span class="gantt-subrow-label">${escHtml(t("gantt.plan"))}</span>
              <div class="gantt-track gantt-track--plan">
                ${todayPct !== null ? `<div class="gantt-today" style="left:${todayPct.toFixed(2)}%"></div>` : ""}
                <div class="gantt-bar" data-estado="${escAttr(estado)}" style="left:${leftPlan.toFixed(2)}%;width:${widthPlan.toFixed(2)}%" title="${fmtFecha(tarea._inicioPlan)} → ${fmtFecha(tarea._finPlan)} · ${avance}%">
                  <div class="gantt-bar-fill" style="width:${avance}%"></div><span>${avance}%</span>
                </div>
              </div>
              <span></span>
            </div>
            ${realRow}
          </div>`;
      }).join("");
    } else if (tareasHabituales.length) {
      html += `<p class="gantt-empty">${escHtml(t("gantt.sinFechas"))}</p>`;
    }

    return html;
  }

  function kanbanMarkup(tasks) {
    if (!tasks.length) return `<p class="kanban-empty">${escHtml(t("kanban.vacio"))}</p>`;
    return KANBAN_COLUMNAS.map(col => {
      const items = tasks.filter(tarea => (tarea.estado || "No Iniciado") === col);
      const cards = items.length
        ? items.map(tarea => `
            <div class="kanban-card" data-estado="${escAttr(col)}">
              <strong>${escHtml(tarea.simbolo_urgencia || "")} ${escHtml(tarea.id_tarea)} — ${escHtml(tarea.nombre || t("gantt.sinNombre"))}</strong>
              <div class="meta">${escHtml(tarea.encargado_proceso || t("gantt.sinEncargado"))} · ${escHtml(t("gantt.avance", { pct: Number(tarea.porcentaje_avance) || 0 }))}</div>
            </div>`).join("")
        : `<p class="kanban-empty">${escHtml(t("kanban.sinTareas"))}</p>`;
      return `<div class="kanban-col"><h4>${col} <span>${items.length}</span></h4>${cards}</div>`;
    }).join("");
  }

  function refrescarVistaActiva() {
    const activa = document.querySelector(".view-tab[aria-selected=\"true\"]");
    const tasks = readGantt();
    if (activa) {
      if (activa.dataset.view === "gantt") document.getElementById("ganttVisual").innerHTML = ganttMarkup(tasks, readTareasHabituales());
      if (activa.dataset.view === "kanban") document.getElementById("kanbanVisual").innerHTML = kanbanMarkup(tasks);
    }
    renderSeguimientoSeccion3(tasks);
  }

  function renderSeguimientoSeccion3(tasks) {
    const elGantt = document.getElementById("seguimientoGanttVisual");
    const elKanban = document.getElementById("seguimientoKanbanVisual");
    if (!elGantt || !elKanban) return;
    tasks = tasks || readGantt();
    elGantt.innerHTML = ganttMarkup(tasks, readTareasHabituales());
    elKanban.innerHTML = kanbanMarkup(tasks);
  }

  /* -------------------------------------------------- Gantt comparativo: manual (As-Is) vs. con IA (To-Be) */
  function renderComparativoAutomatizacion() {
    const container = document.getElementById("comparativoRows");
    if (!container) return;
    const tareas = readTareasHabituales().filter(x => x.nombre);
    const previas = new Map((state.seccion_3_compresion_proyecto.comparativo_automatizacion || []).map(p => [p.nombre, p.horas_automatizado]));
    container.innerHTML = "";
    tareas.forEach(tarea => {
      const prev = previas.get(tarea.nombre);
      const row = document.createElement("div");
      row.className = "row-card row-card--comparativo";
      row.dataset.nombre = tarea.nombre;
      row.dataset.horasManual = tarea.horas_dia;
      row.innerHTML = `
        <span class="comparativo-nombre">${escHtml(tarea.nombre)}</span>
        <span class="row-result">${tarea.horas_dia.toFixed(1)} ${escHtml(t("unidad.horasDia"))}</span>
        <input type="number" min="0" step="0.1" data-f="horas_automatizado" placeholder="—" value="${prev != null && prev !== "" ? escAttr(prev) : ""}" />
        <span class="row-result" data-f="ahorro">—</span>`;
      row.querySelector('[data-f="horas_automatizado"]').addEventListener("input", () => { actualizarAhorroRow(row); renderComparativoVisual(); });
      container.appendChild(row);
      actualizarAhorroRow(row);
    });
    renderComparativoVisual();
  }

  function actualizarAhorroRow(row) {
    const manual = Number(row.dataset.horasManual || 0);
    const val = row.querySelector('[data-f="horas_automatizado"]').value;
    const el = row.querySelector('[data-f="ahorro"]');
    if (val === "") { el.textContent = "—"; el.style.color = ""; return; }
    const auto = Number(val);
    const ahorro = manual - auto;
    const pct = manual > 0 ? (ahorro / manual) * 100 : 0;
    el.textContent = `${ahorro >= 0 ? "−" : "+"}${Math.abs(ahorro).toFixed(1)}h (${pct.toFixed(0)}%)`;
    el.style.color = ahorro >= 0 ? "var(--color-success)" : "var(--color-danger)";
  }

  function readComparativoAutomatizacion() {
    return Array.from(document.getElementById("comparativoRows")?.children || []).map(row => {
      const val = row.querySelector('[data-f="horas_automatizado"]').value;
      return {
        nombre: row.dataset.nombre,
        horas_manual: Number(row.dataset.horasManual || 0),
        horas_automatizado: val === "" ? null : Number(val)
      };
    });
  }

  function renderComparativoVisual() {
    const el = document.getElementById("comparativoVisual");
    const impacto = document.getElementById("comparativoImpacto");
    if (!el) return;
    const filas = Array.from(document.getElementById("comparativoRows")?.children || []);
    const datos = filas.map(row => {
      const val = row.querySelector('[data-f="horas_automatizado"]').value;
      return {
        nombre: row.dataset.nombre,
        manual: Number(row.dataset.horasManual || 0),
        auto: val === "" ? null : Number(val)
      };
    }).filter(d => d.auto != null && !isNaN(d.auto));

    if (!datos.length) {
      el.innerHTML = filas.length
        ? `<p class="comparativo-empty">${escHtml(t("comp.vacioToBe"))}</p>`
        : `<p class="comparativo-empty">${escHtml(t("comp.vacioTareas1"))} <button type="button" class="btn-link" data-goto="1">${escHtml(t("comp.paso1"))}</button> ${escHtml(t("comp.vacioTareas2"))}</p>`;
      el.querySelectorAll("[data-goto]").forEach(b => b.addEventListener("click", () => { collectState(); goToStep(1); }));
      if (impacto) impacto.innerHTML = "";
      if (typeof actualizarAtajoRoi === "function") actualizarAtajoRoi();
      if (typeof renderPresentacion === "function") renderPresentacion();
      return;
    }

    const maxHoras = Math.max(...datos.map(d => Math.max(d.manual, d.auto)), 1);
    el.innerHTML = datos.map(d => {
      const ahorroPct = d.manual > 0 ? Math.round(((d.manual - d.auto) / d.manual) * 100) : 0;
      const peor = ahorroPct < 0;
      return `
      <div class="comparativo-row">
        <div class="comparativo-row-main">
          <div class="comparativo-label">${escHtml(d.nombre)}</div>
          <div class="comparativo-bars">
            <div class="comparativo-bar comparativo-bar--manual" style="width:${Math.max((d.manual / maxHoras) * 100, 8).toFixed(1)}%">${d.manual.toFixed(1)}h · As-Is</div>
            <div class="comparativo-bar comparativo-bar--auto" style="width:${Math.max((d.auto / maxHoras) * 100, 8).toFixed(1)}%">${d.auto.toFixed(1)}h · To-Be</div>
          </div>
        </div>
        <span class="comparativo-pct${peor ? " comparativo-pct--peor" : ""}">⚡ ${peor ? "+" : "-"}${Math.abs(ahorroPct)}% ${escHtml(t("comp.deTiempo"))}</span>
      </div>`;
    }).join("");

    const totalManual = datos.reduce((s, d) => s + d.manual, 0);
    const totalAuto = datos.reduce((s, d) => s + d.auto, 0);
    const cargaPrevia = totalManual * 22;
    const nuevaCarga = totalAuto * 22;
    const capacidadLiberada = cargaPrevia - nuevaCarga;
    if (impacto) {
      impacto.innerHTML = `
        <div class="impacto-card"><div class="value">${cargaPrevia.toFixed(0)}h</div><div class="label">${escHtml(t("card.cargaPrevia"))}</div></div>
        <div class="impacto-card"><div class="value">${nuevaCarga.toFixed(0)}h</div><div class="label">${escHtml(t("card.nuevaCarga"))}</div></div>
        <div class="impacto-card impacto-card--liberada"><div class="value">${capacidadLiberada.toFixed(0)}h</div><div class="label">${escHtml(t("card.capacidadLiberada"))}</div></div>
        <div class="impacto-card"><div class="value">${totalManual > 0 ? Math.round((capacidadLiberada / cargaPrevia) * 100) : 0}%</div><div class="label">${escHtml(t("card.eficienciaGanada"))}</div></div>`;
    }
    // El resto de la Sección 4 (ROI, métricas y presentación) vive de estos números.
    if (typeof actualizarAtajoRoi === "function") actualizarAtajoRoi();
    if (typeof renderPresentacion === "function") renderPresentacion();
  }

  function initCronogramaViews() {
    document.querySelectorAll(".view-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".view-tab").forEach(t => t.setAttribute("aria-selected", "false"));
        tab.setAttribute("aria-selected", "true");
        document.querySelectorAll(".cronograma-view").forEach(v => { v.hidden = true; });
        document.getElementById(`view-${tab.dataset.view}`).hidden = false;
        refrescarVistaActiva();
      });
    });
    document.getElementById("btnExportGanttKanban").addEventListener("click", exportGanttKanban);
    document.getElementById("btnExportGanttCsv").addEventListener("click", exportGanttCsv);
    document.getElementById("btnImportGanttCsvTrigger").addEventListener("click", () => document.getElementById("ganttCsvInput").click());
    document.getElementById("ganttCsvInput").addEventListener("change", e => {
      if (e.target.files[0]) importGanttCsv(e.target.files[0]);
      e.target.value = "";
    });
  }

  /* -------------------------------------------------- Loop con Excel: CSV del Gantt */
  const GANTT_CSV_COLUMNS = [
    { header: "ID", field: "id_tarea" },
    { header: "Jerarquia", field: "jerarquia" },
    { header: "Nombre", field: "nombre" },
    { header: "Encargado", field: "encargado_proceso" },
    { header: "Urgencia", field: "simbolo_urgencia" },
    { header: "Dependencia", field: "dependencia_id" },
    { header: "Horas_Estimadas", field: "horas_estimadas" },
    { header: "Inicio_Plan", field: "fecha_inicio_plan" },
    { header: "Fin_Plan", field: "fecha_fin_plan" },
    { header: "Inicio_Real", field: "fecha_inicio_real" },
    { header: "Fin_Real", field: "fecha_fin_real" },
    { header: "Porcentaje_Avance", field: "porcentaje_avance" },
    { header: "Estado", field: "estado" }
  ];

  function csvField(value) {
    const str = String(value == null ? "" : value);
    return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  }

  function exportGanttCsv() {
    collectState();
    const tasks = readGantt();
    const rows = [GANTT_CSV_COLUMNS.map(c => c.header).join(",")];
    tasks.forEach(t => rows.push(GANTT_CSV_COLUMNS.map(c => csvField(t[c.field])).join(",")));
    const csv = "﻿" + rows.join("\r\n") + "\r\n";
    downloadBlob(`gantt-${state.app_meta.id_expediente}.csv`, csv, "text/csv");
    setIoStatus(t("toast.ganttCsv"));
  }

  function parseCsvLine(line) {
    const result = [];
    let cur = "", inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQuotes) {
        if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else { inQuotes = false; } }
        else { cur += c; }
      } else if (c === '"') { inQuotes = true; }
      else if (c === ",") { result.push(cur); cur = ""; }
      else { cur += c; }
    }
    result.push(cur);
    return result;
  }

  function importGanttCsv(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        let text = reader.result;
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
        const lines = text.split(/\r\n|\n/).filter(l => l.trim().length);
        if (!lines.length) throw new Error(t("error.csvVacio"));
        const headers = parseCsvLine(lines[0]).map(h => h.trim());
        const colIndex = {};
        GANTT_CSV_COLUMNS.forEach(c => {
          const idx = headers.findIndex(h => h.toLowerCase() === c.header.toLowerCase());
          if (idx >= 0) colIndex[c.field] = idx;
        });
        if (colIndex.nombre === undefined && colIndex.id_tarea === undefined) {
          throw new Error(t("error.csvColumnas"));
        }
        const nuevasFilas = lines.slice(1)
          .map(line => {
            const cols = parseCsvLine(line);
            const obj = {};
            GANTT_CSV_COLUMNS.forEach(c => { obj[c.field] = colIndex[c.field] !== undefined ? (cols[colIndex[c.field]] || "").trim() : ""; });
            return obj;
          })
          .filter(o => o.nombre || o.id_tarea);

        document.getElementById("ganttBody").innerHTML = "";
        nuevasFilas.forEach(addGanttRow);
        if (!nuevasFilas.length) addGanttRow();
        actualizarSugerenciasDias();
        refrescarVistaActiva();
        setIoStatus(t("toast.csvCargado", { n: nuevasFilas.length }));
      } catch (e) {
        setIoStatus(t("toast.csvError", { msg: e.message }));
      }
    };
    reader.readAsText(file, "UTF-8");
  }

  const EXPORT_CSS = `
    body{font-family:-apple-system,"Segoe UI",Roboto,Arial,sans-serif;background:#f4f6fb;color:#1a1d29;margin:0;padding:2rem;max-width:900px;margin-inline:auto}
    h1{font-size:1.4rem} .meta{color:#5b6072;font-size:.85rem;margin-bottom:1.5rem}
    h2{font-size:1.05rem;margin-top:2rem;border-bottom:1px solid #e2e5ee;padding-bottom:.4rem}
    .gantt-range{font-size:.78rem;color:#5b6072;margin-bottom:.5rem}
    .gantt-row{display:grid;grid-template-columns:200px 1fr;gap:.75rem;align-items:center;margin-bottom:.5rem}
    .gantt-row-label{font-size:.8rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .gantt-row-label .id{color:#5b6072;margin-right:.3rem}
    .gantt-track{position:relative;height:1.6rem;background:#f8f9fc;border-radius:999px;border:1px solid #e2e5ee}
    .gantt-bar{position:absolute;top:2px;bottom:2px;border-radius:999px;display:flex;align-items:center;padding:0 .5rem;font-size:.72rem;color:#fff;white-space:nowrap;overflow:hidden;min-width:1.4rem}
    .gantt-bar[data-estado="No Iniciado"]{background:#5b6072} .gantt-bar[data-estado="En Proceso"]{background:#2f5fdb}
    .gantt-bar[data-estado="En Riesgo"]{background:#b5790a;color:#1a1200} .gantt-bar[data-estado="Completado"]{background:#1c8a5a}
    .gantt-bar-fill{position:absolute;inset:0;background:rgba(255,255,255,.35);border-radius:999px}
    .gantt-today{position:absolute;top:-4px;bottom:-4px;width:2px;background:#c53838}
    .gantt-task-group{padding-bottom:.6rem;margin-bottom:.4rem;border-bottom:1px dashed #e2e5ee}
    .gantt-task-group:last-child{border-bottom:none;margin-bottom:0}
    .gantt-task-title{font-size:.8rem;font-weight:600;margin-bottom:.3rem}
    .gantt-task-title .id{color:#5b6072;font-weight:400;margin-right:.3rem}
    .gantt-subrow{display:grid;grid-template-columns:70px 1fr auto;gap:.6rem;align-items:center;margin-top:.25rem}
    .gantt-subrow-label{font-size:.68rem;color:#5b6072;text-transform:uppercase;letter-spacing:.02em}
    .gantt-track--plan .gantt-bar{background:#f8f9fc;border:1px dashed #5b6072;color:#5b6072}
    .gantt-track--real .gantt-bar[data-variance="tarde"]{background:#c53838}
    .gantt-track--real .gantt-bar[data-variance="temprano"]{background:#1c8a5a}
    .gantt-track--real .gantt-bar[data-variance="ok"]{background:#2f5fdb}
    .gantt-variance-badge{font-size:.7rem;font-weight:700;white-space:nowrap}
    .gantt-variance-badge[data-variance="tarde"]{color:#c53838}
    .gantt-variance-badge[data-variance="temprano"]{color:#1c8a5a}
    .gantt-variance-badge[data-variance="ok"]{color:#5b6072}
    .gantt-operacion-section{margin-bottom:1rem;padding-bottom:.8rem;border-bottom:2px solid #e2e5ee}
    .gantt-section-title{font-size:.72rem;text-transform:uppercase;letter-spacing:.03em;color:#5b6072;margin:0 0 .5rem;font-weight:700}
    .gantt-band-row{display:grid;grid-template-columns:200px 1fr;gap:.75rem;align-items:center;margin-bottom:.35rem}
    .gantt-band{height:1.1rem;border-radius:999px;background:#2f5fdb;opacity:.6;display:flex;align-items:center;padding:0 .6rem;font-size:.68rem;color:#fff;font-weight:600;white-space:nowrap;overflow:hidden}
    .kanban-board{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem}
    .kanban-col{background:#f8f9fc;border:1px solid #e2e5ee;border-radius:12px;padding:.6rem;min-height:80px}
    .kanban-col h4{margin:0 0 .6rem;font-size:.8rem;display:flex;justify-content:space-between;color:#5b6072}
    .kanban-card{background:#fff;border:1px solid #e2e5ee;border-left:4px solid #2f5fdb;border-radius:8px;padding:.5rem .6rem;margin-bottom:.5rem;font-size:.8rem}
    .kanban-card[data-estado="En Riesgo"]{border-left-color:#b5790a} .kanban-card[data-estado="Completado"]{border-left-color:#1c8a5a}
    .kanban-card strong{display:block;margin-bottom:.15rem} .kanban-card .meta{color:#5b6072;font-size:.75rem}
    .gantt-empty,.kanban-empty{color:#5b6072;font-size:.85rem;padding:1rem;text-align:center}
    @media (max-width:700px){ .kanban-board{grid-template-columns:1fr} }
  `;

  function exportGanttKanban() {
    collectState();
    const tasks = readGantt();
    const habituales = readTareasHabituales();
    const nombre = state.seccion_1_ordenar_trabajo.metadata_proceso.nombre_proceso || "Proceso sin nombre";
    const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8" /><title>Gantt / Kanban — ${escHtml(nombre)}</title><style>${EXPORT_CSS}</style></head>
<body>
  <h1>Gantt / Kanban — ${escHtml(nombre)}</h1>
  <p class="meta">${escHtml(t("export.pie", { fecha: fmtFecha(new Date()) }))}</p>
  <h2>${escHtml(t("export.gantt"))}</h2>
  <div class="gantt-visual">${ganttMarkup(tasks, habituales)}</div>
  <h2>${escHtml(t("export.kanban"))}</h2>
  <div class="kanban-board">${kanbanMarkup(tasks)}</div>
</body></html>`;
    downloadBlob(`gantt-kanban-${state.app_meta.id_expediente}.html`, html, "text/html");
    setIoStatus(t("toast.ganttKanban"));
  }

  /* ------------------------------------------------------------------ SECCIÓN 2 */
  /* Las etiquetas salen de i18n.js (claves s2.<pregunta>.<valor>.*). */
  const PREGUNTAS_CLASIFICACION = [
    {
      id: "entregable", opciones: [
        { value: "documento" },
        { value: "datos" },
        { value: "automatizacion" },
        { value: "agente" }
      ]
    },
    {
      id: "mapeo_proceso", opciones: [
        { value: "eventual" },
        { value: "fija" },
        { value: "criterio" },
        { value: "interdepartamental" }
      ]
    },
    {
      id: "nivel_logica", opciones: [
        { value: "minima" },
        { value: "interpretacion" },
        { value: "decision" },
        { value: "razonamiento" }
      ]
    },
    {
      id: "fuente_datos", opciones: [
        { value: "plantillas" },
        { value: "desestructurados" },
        { value: "sistemas" },
        { value: "mezcla" }
      ]
    },
    {
      id: "confidencialidad", opciones: [
        { value: "bajo" },
        { value: "moderado" },
        { value: "alto" }
      ]
    }
  ];
;

  function calcularRecomendacionTecnica(r) {
    let rec;
    if (r.nivel_logica === "decision") {
      rec = {
        nombre_tecnico: "Asistencia con aprobación humana (human-in-the-loop)", guia: "La IA prepara un borrador; una persona aprueba antes de ejecutar. No automatices la decisión final.", investigar_con_ia: "Patrones human-in-the-loop para aprobaciones con Claude.",
        requisitos: ["Un flujo de aprobación claro: quién revisa y cuándo.", "Acceso de Claude solo a los datos necesarios para el borrador."],
        riesgos: ["Si nadie revisa a tiempo, el borrador se acumula sin usarse.", "Define qué pasa si alguien aprueba sin leer con atención."]
      };
    } else if (r.nivel_logica === "razonamiento" && r.fuente_datos === "sistemas") {
      rec = {
        nombre_tecnico: "Agente con herramientas (tool use / MCP)", guia: "Define qué herramientas puede llamar el agente y sus límites: alcance, timeout, logs, mecanismo STOP.", investigar_con_ia: "Model Context Protocol (MCP) y tool use para conectar sistemas existentes.",
        requisitos: ["Acceso técnico a las herramientas/sistemas que el agente va a llamar.", "Un mecanismo STOP y logs de cada acción ejecutada."],
        riesgos: ["Mayor superficie de error: una herramienta mal definida puede ejecutar acciones no deseadas.", "Necesita pruebas en sandbox antes de tocar datos reales."]
      };
    } else if (r.entregable === "automatizacion" && r.mapeo_proceso === "fija" && r.nivel_logica === "minima") {
      rec = {
        nombre_tecnico: "Automatización basada en reglas (Apps Script / Webhooks)", guia: "Conecta triggers fijos con Google Apps Script o un webhook simple. Sin IA generativa.", investigar_con_ia: "Cómo estructurar un trigger de Google Apps Script para esta tarea.",
        requisitos: ["Permisos de edición en Google Workspace o el sistema que dispara el webhook.", "Reglas de negocio ya estables — si cambian seguido, este nivel no alcanza."],
        riesgos: ["No tiene criterio propio: un caso fuera de regla rompe el flujo en silencio.", "Necesita revisión manual periódica."]
      };
    } else if (r.entregable === "datos" && (r.fuente_datos === "desestructurados" || r.fuente_datos === "mezcla")) {
      rec = {
        nombre_tecnico: "Extracción estructurada (structured output)", guia: "Define un schema de salida (JSON) claro y un prompt de extracción con ejemplos.", investigar_con_ia: "Structured output / JSON mode para extraer datos de documentos.",
        requisitos: ["Ejemplos reales (o sintéticos) de los documentos a procesar.", "Un schema de salida acordado con quien consume los datos."],
        riesgos: ["Documentos con formato muy variable bajan la precisión.", "Revisa una muestra antes de confiar en el resultado."]
      };
    } else if (r.nivel_logica === "interpretacion" && r.mapeo_proceso === "criterio") {
      rec = {
        nombre_tecnico: "Skill / prompt estructurado (Claude)", guia: "Crea una skill reutilizable con instrucciones claras, ejemplos y límites de alcance.", investigar_con_ia: "Cómo escribir un system prompt / skill para esta tarea.",
        requisitos: ["Instrucciones claras y ejemplos de los casos típicos.", "Un lugar donde guardar la skill (repositorio o carpeta compartida)."],
        riesgos: ["Sin límites de alcance definidos, la skill puede usarse para tareas que no fue pensada.", "Depende de que el equipo la mantenga actualizada."]
      };
    } else if (r.entregable === "agente") {
      rec = {
        nombre_tecnico: "Chat asistido en canal existente", guia: "Evalúa Claude en el canal donde ya trabaja tu equipo (Slack, chat interno) antes de construir algo nuevo.", investigar_con_ia: "Claude Tag / Claude en Slack.",
        requisitos: ["Acceso de Claude al canal, con permisos acotados.", "Una guía de qué preguntas responder y cuáles escalar a una persona."],
        riesgos: ["Puede generar expectativa de disponibilidad 24/7 que no se puede sostener.", "Aclara que no reemplaza al responsable humano."]
      };
    } else {
      rec = {
        nombre_tecnico: "Presentación o documento de asistencia", guia: "Empieza simple: un documento o resumen generado a partir de este diagnóstico.", investigar_con_ia: "Cómo estructurar un prompt de resumen ejecutivo.",
        requisitos: ["Ninguno técnico — alcanza con acceso a Claude web o Claude Code."],
        riesgos: ["Es el nivel más simple: si el proceso crece, vas a necesitar pasar a otro nivel."]
      };
    }
    rec.advertencia_seguridad = r.confidencialidad === "alto"
      ? "⚠️ Datos confidenciales/personales: se requiere aprobación de seguridad antes de conectar datos reales. Prototipa con datos sintéticos."
      : "";
    return rec;
  }

  function initSeccion2() {
    renderPickersClasificacion();
    initEcosistema();
  }

  /* Vacía y reconstruye las opciones: se llama también al cambiar de idioma,
     restaurando lo que la persona ya había elegido. */
  function renderPickersClasificacion() {
    const elegidas = state.seccion_2_clasificacion_proyecto.respuestas || {};
    document.querySelectorAll("#panel-2 .level-picker[data-pregunta]").forEach(container => {
      container.innerHTML = "";
      const pregunta = PREGUNTAS_CLASIFICACION.find(p => p.id === container.dataset.pregunta);
      pregunta.opciones.forEach(op => {
        const opt = document.createElement("div");
        opt.className = "level-option";
        opt.setAttribute("role", "radio");
        opt.setAttribute("tabindex", "0");
        opt.setAttribute("aria-checked", "false");
        opt.dataset.valor = op.value;
        opt.innerHTML = `<strong>${escHtml(t(`s2.${pregunta.id}.${op.value}.label`))}</strong><span>${escHtml(t(`s2.${pregunta.id}.${op.value}.desc`))}</span>`;
        opt.addEventListener("click", () => seleccionarRespuesta(pregunta.id, op.value));
        opt.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); seleccionarRespuesta(pregunta.id, op.value); } });
        opt.setAttribute("aria-checked", elegidas[pregunta.id] === op.value ? "true" : "false");
        container.appendChild(opt);
      });
    });
  }

  /* -------------------------------------------------- Evaluación de ecosistema (puntaje) */
  /* Las etiquetas salen de i18n.js (claves eco.*). Los puntos son lógica. */
  const PREGUNTAS_ECOSISTEMA = [
    {
      id: "eco_frecuencia", opciones: [
        { value: "a", puntos: 1 },
        { value: "b", puntos: 2 },
        { value: "c", puntos: 3 },
        { value: "d", puntos: 4 }
      ]
    },
    {
      id: "eco_datos", opciones: [
        { value: "a", puntos: 1 },
        { value: "b", puntos: 2 },
        { value: "c", puntos: 3 },
        { value: "d", puntos: 4 }
      ]
    },
    {
      id: "eco_ecosistema", opciones: [
        { value: "a", puntos: 1 },
        { value: "b", puntos: 2 },
        { value: "c", puntos: 3 },
        { value: "d", puntos: 4 }
      ]
    },
    {
      id: "eco_tolerancia", opciones: [
        { value: "a", puntos: 1 },
        { value: "b", puntos: 2 },
        { value: "c", puntos: 3 },
        { value: "d", puntos: 4 }
      ]
    },
    {
      id: "eco_complejidad", opciones: [
        { value: "a", puntos: 1 },
        { value: "b", puntos: 2 },
        { value: "c", puntos: 3 },
        { value: "d", puntos: 4 }
      ]
    }
  ];
;

  function calcularNivelEcosistema(puntaje) {
    if (puntaje <= 8) return { tier: "Nivel 1", nombre: "Presentación o prototipo de concepto", recomendacion: "Un mockup en HTML/JS o una presentación dinámica alcanza para validar la idea antes de programar nada." };
    if (puntaje <= 13) return { tier: "Nivel 2", nombre: "Herramienta de uso manual", recomendacion: "Una app standalone (un solo HTML) o un script simple que procese datos localmente." };
    if (puntaje <= 17) return { tier: "Nivel 3", nombre: "Automatización de flujo de trabajo", recomendacion: "Conviene iPaaS (Make, n8n), Google Apps Script o Python con webhooks para sacarte de encima las tareas repetitivas." };
    return { tier: "Nivel 4", nombre: "Agente autónomo / multi-sistema", recomendacion: "Necesitas una arquitectura con manejo de estados, memoria de contexto y llamadas a herramientas (tool calling)." };
  }

  function initEcosistema() {
    const wrap = document.getElementById("ecoPreguntas");
    const elegidas = state.seccion_2_clasificacion_proyecto.evaluacion_ecosistema.respuestas || {};
    wrap.innerHTML = "";
    PREGUNTAS_ECOSISTEMA.forEach(pregunta => {
      const card = document.createElement("div");
      card.className = "eco-pregunta";
      card.innerHTML = `<p class="hint-title">${escHtml(t(`eco.${pregunta.id}.pregunta`))}</p>`;
      const picker = document.createElement("div");
      picker.className = "level-picker level-picker--compact";
      picker.setAttribute("role", "radiogroup");
      picker.setAttribute("aria-label", t(`eco.${pregunta.id}.pregunta`));
      picker.dataset.ecoId = pregunta.id;
      pregunta.opciones.forEach(op => {
        const opt = document.createElement("div");
        opt.className = "level-option";
        opt.setAttribute("role", "radio");
        opt.setAttribute("tabindex", "0");
        opt.setAttribute("aria-checked", "false");
        opt.dataset.valor = op.value;
        opt.setAttribute("aria-checked", (elegidas[pregunta.id] || {}).valor === op.value ? "true" : "false");
        opt.innerHTML = `<strong>${escHtml(t(`eco.${pregunta.id}.${op.value}`))}</strong>`;
        opt.addEventListener("click", () => seleccionarEcosistema(pregunta.id, op.value, op.puntos, picker));
        opt.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); seleccionarEcosistema(pregunta.id, op.value, op.puntos, picker); } });
        picker.appendChild(opt);
      });
      card.appendChild(picker);
      wrap.appendChild(card);
    });
  }

  function seleccionarEcosistema(preguntaId, valor, puntos, picker) {
    state.seccion_2_clasificacion_proyecto.evaluacion_ecosistema.respuestas[preguntaId] = { valor, puntos };
    picker.querySelectorAll(".level-option").forEach(el => el.setAttribute("aria-checked", el.dataset.valor === valor ? "true" : "false"));
    renderEcosistema();
  }

  function renderEcosistema() {
    const respuestas = state.seccion_2_clasificacion_proyecto.evaluacion_ecosistema.respuestas;
    const box = document.getElementById("ecoResultado");
    const completas = Object.keys(respuestas).length;
    if (completas < 5) {
      box.className = "status-box";
      box.innerHTML = `<p style="margin:0;color:var(--color-text-muted);">${escHtml(t("eco.faltan", { n: completas }))}</p>`;
      state.seccion_2_clasificacion_proyecto.evaluacion_ecosistema.puntaje = 0;
      state.seccion_2_clasificacion_proyecto.evaluacion_ecosistema.nivel = "";
      return;
    }
    const puntaje = Object.values(respuestas).reduce((sum, r) => sum + r.puntos, 0);
    const nivel = calcularNivelEcosistema(puntaje);
    state.seccion_2_clasificacion_proyecto.evaluacion_ecosistema.puntaje = puntaje;
    state.seccion_2_clasificacion_proyecto.evaluacion_ecosistema.nivel = nivel.tier;
    box.className = "status-box success";
    box.innerHTML = `
      <h4>📐 ${puntaje}/20 pts — ${escHtml(nivel.tier)}: ${escHtml(nivel.nombre)}</h4>
      <p>${escHtml(nivel.recomendacion)}</p>`;
  }

  function seleccionarRespuesta(preguntaId, valor) {
    state.seccion_2_clasificacion_proyecto.respuestas[preguntaId] = valor;
    document.querySelector(`#panel-2 .level-picker[data-pregunta="${preguntaId}"]`).querySelectorAll(".level-option")
      .forEach(el => el.setAttribute("aria-checked", el.dataset.valor === valor ? "true" : "false"));
    renderRecomendacion();
  }

  function renderRecomendacion() {
    const respuestas = state.seccion_2_clasificacion_proyecto.respuestas;
    const box = document.getElementById("recomendacionTecnica");
    const completas = Object.values(respuestas).filter(Boolean).length;
    if (completas === 0) {
      box.className = "status-box";
      box.innerHTML = `<p style="margin:0;color:var(--color-text-muted);">${escHtml(t("s2.sinRespuestas"))}</p>`;
      state.seccion_2_clasificacion_proyecto.recomendacion = { nombre_tecnico: "", guia: "", investigar_con_ia: "", advertencia_seguridad: "" };
      renderMatrizRiesgos({ requisitos: [] });
      return;
    }
    const rec = calcularRecomendacionTecnica(respuestas);
    state.seccion_2_clasificacion_proyecto.recomendacion = rec;
    box.className = "status-box success";
    box.innerHTML = `
      <h4>🎯 ${escHtml(rec.nombre_tecnico)}</h4>
      <p>${escHtml(rec.guia)}</p>
      <p><strong>${escHtml(t("s2.investigar"))}</strong> ${escHtml(rec.investigar_con_ia)}</p>
      ${rec.advertencia_seguridad ? `<p style="color:var(--color-danger);margin-top:.5rem;">${escHtml(rec.advertencia_seguridad)}</p>` : ""}
      ${completas < 5 ? `<p style="margin-top:.5rem;font-size:.78rem;opacity:.75;">${escHtml(t("s2.basadoEn", { n: completas }))}</p>` : ""}`;
    renderMatrizRiesgos(rec);
  }

  function renderMatrizRiesgos(rec) {
    const box = document.getElementById("matrizRiesgos");
    if (!box) return;
    if (!rec.requisitos || !rec.requisitos.length) { box.hidden = true; box.innerHTML = ""; return; }
    box.hidden = false;
    box.innerHTML = `
      <div class="riesgos-col">
        <p class="hint-title">${escHtml(t("s2.requisitos"))}</p>
        <ul class="hint-list">${rec.requisitos.map(x => `<li>${escHtml(x)}</li>`).join("")}</ul>
      </div>
      <div class="riesgos-col">
        <p class="hint-title">${escHtml(t("s2.riesgos"))}</p>
        <ul class="hint-list">${(rec.riesgos || []).map(x => `<li>${escHtml(x)}</li>`).join("")}</ul>
      </div>`;
  }

  function exportSkillsDictionary() {
    const cat = contenido().CATALOGO;
    const meta = state.seccion_1_ordenar_trabajo.metadata_proceso;
    const nombre = meta.nombre_proceso || "proceso";
    if (!cat) { setIoStatus("⚠️ No se pudo cargar el contenido del catálogo."); return; }

    const md = [
      `# ${cat.titulo} — ${nombre}`,
      "",
      `> Expediente ${state.app_meta.id_expediente} · Generado el ${new Date().toLocaleDateString()}`,
      "",
      cat.bajada,
      "",
      `## 1. ${cat.esquema.titulo}`,
      "",
      cat.esquema.lede,
      "",
      ...cat.esquema.pasos.map((x, i) => `${i + 1}. **${x.clave}:** ${x.d}`),
      "",
      "## 2. Catálogo de recursos por área",
      ""
    ];
    cat.areas.forEach(a => {
      md.push(`### Área ${a.n} · ${a.titulo}`, "", a.descripcion, "", `**Valor para tu proyecto:** ${a.valor}`, "");
      md.push("| Skill / Recurso | Para qué sirve | Qué necesita (input) | Qué te devuelve (output) |", "| :--- | :--- | :--- | :--- |");
      a.filas.forEach(f => md.push(`| **${f.skill}**${f.glosario ? ` (glosario #${f.glosario})` : ""} | ${f.proposito} | ${f.input} | ${f.output} |`));
      md.push("");
    });
    md.push("## 3. Gobernanza digital en la empresa", "");
    cat.gobernanza.forEach((g, i) => md.push(`${i + 1}. **${g.t}:** ${g.d}`));
    md.push("", "## 4. Glosario en lenguaje de oficina", "");
    cat.glosario.forEach(g => {
      md.push(`### #${g.n}. ${g.termino}`, "", `- **¿Qué es?:** ${g.que}`, `- **¿Para qué sirve?:** ${g.para}`, `- **Ejemplo de oficina:** ${g.ej}`, "");
    });

    downloadText(`catalogo-recursos-${nombre.replace(/\s+/g, "-").toLowerCase() || "proceso"}.md`, md.join("\n"));
    setIoStatus(t("toast.catalogoMd"));
  }

  /* ------------------------------------------------------------------ SECCIÓN 3 */
  function initSeccion3() {
    renderLevelPicker();
    document.getElementById("btnExportSkills").addEventListener("click", exportSkillsDictionary);
    document.getElementById("btnCatalogoPdf").addEventListener("click", imprimirCatalogo);
  }

  function renderLevelPicker() {
    const picker = document.getElementById("levelPicker");
    const elegido = state.seccion_3_compresion_proyecto.nivel_solucion;
    picker.innerHTML = "";
    LEVELS.forEach(lv => {
      const opt = document.createElement("div");
      opt.className = "level-option";
      opt.setAttribute("role", "radio");
      opt.setAttribute("tabindex", "0");
      opt.setAttribute("aria-checked", "false");
      opt.dataset.level = lv.id;
      opt.setAttribute("aria-checked", lv.id === elegido ? "true" : "false");
      opt.innerHTML = `<strong>${escHtml(textoNivel(lv.id, "titulo"))}</strong><span>${escHtml(textoNivel(lv.id, "desc"))}</span>`;
      opt.addEventListener("click", () => selectLevel(lv.id));
      opt.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectLevel(lv.id); } });
      picker.appendChild(opt);
    });
  }

  function selectLevel(levelId) {
    const s3 = state.seccion_3_compresion_proyecto;
    // Un expediente exportado antes puede traer el rótulo viejo de un nivel
    // (ej. "Nivel 3: Skill / Prompt Estructurado"): se reconoce por el número
    // y se migra al rótulo vigente para que la tarjeta quede marcada.
    const equivalente = LEVELS.find(l => l.id === levelId) || LEVELS.find(l => claveNivel(l.id) === claveNivel(levelId));
    if (equivalente) levelId = equivalente.id;
    // Las ideas marcadas pertenecen a la galería de un nivel concreto: si se
    // cambia de nivel dejan de tener sentido. Al rehidratar un expediente el
    // nivel llega igual al que ya está en el estado, así que no se pierden.
    if (s3.nivel_solucion && s3.nivel_solucion !== levelId) s3.sugerencias_seleccionadas = [];
    s3.nivel_solucion = levelId;
    document.querySelectorAll("#levelPicker .level-option").forEach(el => el.setAttribute("aria-checked", el.dataset.level === levelId ? "true" : "false"));
    const lv = LEVELS.find(l => l.id === levelId);
    document.getElementById("levelWhy").textContent = lv ? `💡 ${textoNivel(lv.id, "why")}` : "";
    renderGuiaDesarrollo();
    renderGaleriaIdeas();
    renderPromptLauncher();
  }

  /* Prefijo "Nivel N" que usan SUGERENCIAS e IA_GUIA como clave. */
  function claveNivel(levelId) {
    const m = /Nivel\s*([1-4])/.exec(levelId || "");
    return m ? `Nivel ${m[1]}` : "";
  }

  function addKpiRow(data) {
    data = data || {};
    const tbody = document.getElementById("kpiBody");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input data-f="nombre_kpi" value="${data.nombre_kpi || ""}" /></td>
      <td><input data-f="unidad_medida" value="${data.unidad_medida || ""}" /></td>
      <td><input type="number" step="0.1" data-f="valor_actual_as_is" value="${data.valor_actual_as_is || 0}" /></td>
      <td><input type="number" step="0.1" data-f="meta_esperada_to_be" value="${data.meta_esperada_to_be || 0}" /></td>
      <td><select data-f="frecuencia_medicion"><option${!data.frecuencia_medicion || data.frecuencia_medicion === "Diario" ? " selected" : ""}>Diario</option><option${data.frecuencia_medicion === "Semanal" ? " selected" : ""}>Semanal</option><option${data.frecuencia_medicion === "Mensual" ? " selected" : ""}>Mensual</option></select></td>
      <td><input data-f="origen_datos_google" value="${data.origen_datos_google || ""}" placeholder="Sheets, Looker…" /></td>
      <td><button type="button" class="btn-icon" aria-label="${escAttr(t("aria.eliminarKpi"))}">🗑️</button></td>`;
    tr.querySelector("button").addEventListener("click", () => tr.remove());
    tbody.appendChild(tr);
  }

  function readKpis() {
    return Array.from(document.getElementById("kpiBody").children).map(tr => {
      const obj = {};
      tr.querySelectorAll("[data-f]").forEach(el => { obj[el.dataset.f] = el.type === "number" ? Number(el.value || 0) : el.value; });
      return obj;
    });
  }

  function updateRoi() {
    const horasSemana = Number(document.getElementById("s3_ahorro_horas").value || 0);
    const costo = Number(document.getElementById("s3_costo_hora").value || 0);
    const horasMes = horasSemana * SEMANAS_MES;
    const horasAnio = horasSemana * DIAS_HABILES.anio / DIAS_HABILES.semana;
    document.getElementById("roiResumen").innerHTML = `
      <div class="summary-card"><div class="value">${horasMes.toFixed(1)}h</div><div class="label">${escHtml(t("card.horasMes"))}</div></div>
      <div class="summary-card"><div class="value">${horasAnio.toFixed(0)}h</div><div class="label">${escHtml(t("card.horasAnio"))}</div></div>
      <div class="summary-card"><div class="value">${dinero(horasMes * costo)}</div><div class="label">${escHtml(t("card.retornoMes"))}</div></div>
      <div class="summary-card summary-card--destacada"><div class="value">${dinero(horasAnio * costo)}</div><div class="label">${escHtml(t("card.retornoAnio"))}</div></div>`;
    actualizarAtajoRoi();
    renderPresentacion();
  }

  /* Ofrece traer el ahorro ya calculado en el comparativo, sin pisar lo que
     la persona haya escrito a mano: es un botón, no un autocompletado. */
  function actualizarAtajoRoi() {
    const btn = document.getElementById("btnRoiDesdeComparativo");
    if (!btn) return;
    const imp = calcularImpacto();
    const actual = Number(document.getElementById("s3_ahorro_horas").value || 0);
    const sugerido = Number(imp.ahorroSemana.toFixed(1));
    if (!imp.hayDatos || sugerido <= 0 || Math.abs(sugerido - actual) < 0.05) { btn.hidden = true; return; }
    btn.hidden = false;
    btn.textContent = t("s4.atajoRoi", { h: sugerido.toFixed(1) });
  }

  function dinero(n) {
    if (!isFinite(n) || n <= 0) return "$0";
    return "$" + Math.round(n).toLocaleString("es-AR");
  }

  function n1(n) { return (Math.round(n * 10) / 10).toFixed(1); }

  /* -------------------------------------------------- Impacto medido (Sección 4) */
  function calcularImpacto() {
    const filas = readComparativoAutomatizacion().filter(d => d.horas_automatizado != null && !isNaN(d.horas_automatizado));
    const diaAsIs = filas.reduce((acc, d) => acc + (d.horas_manual || 0), 0);
    const diaToBe = filas.reduce((acc, d) => acc + d.horas_automatizado, 0);
    const ahorroDia = diaAsIs - diaToBe;
    const costoHora = Number(val("s3_costo_hora") || 0);
    return {
      hayDatos: filas.length > 0,
      filas,
      semanaAsIs: diaAsIs * DIAS_HABILES.semana,
      semanaToBe: diaToBe * DIAS_HABILES.semana,
      mesAsIs: diaAsIs * DIAS_HABILES.mes,
      mesToBe: diaToBe * DIAS_HABILES.mes,
      ahorroSemana: ahorroDia * DIAS_HABILES.semana,
      ahorroMes: ahorroDia * DIAS_HABILES.mes,
      ahorroAnio: ahorroDia * DIAS_HABILES.anio,
      pct: diaAsIs > 0 ? (ahorroDia / diaAsIs) * 100 : 0,
      costoHora,
      ahorroUsdAnio: ahorroDia * DIAS_HABILES.anio * costoHora
    };
  }

  function exportResumenEjecutivo() {
    collectState();
    const s1 = state.seccion_1_ordenar_trabajo, s3 = state.seccion_3_compresion_proyecto;
    const ent = asegurarCierreSeccion4().entregable;
    const imp = calcularImpacto();
    const md = [
      t("re.titulo", { x: s1.metadata_proceso.nombre_proceso || t("gantt.sinNombre") }),
      t("re.departamento", { x: etiquetaOpcion(s1.metadata_proceso.departamento) || "—" }),
      t("re.tipo", { x: s3.nivel_solucion ? textoNivel(s3.nivel_solucion, "titulo") : "—" }),
      ""
    ];
    if (ent.tipo || ent.resultado) {
      md.push(t("re.construido"),
        t("re.tipoEntregable", { x: etiquetaOpcion(ent.tipo) || "—" }),
        t("re.puesta", { x: etiquetaOpcion(ent.estado_ejecucion) || "—" }),
        ent.resultado ? t("re.resultado", { x: resumirEntregable(ent.resultado) }) : null,
        ent.notas_ejecucion ? t("re.notas", { x: ent.notas_ejecucion }) : null,
        "");
    }
    if (imp.hayDatos) {
      md.push(t("re.impacto"),
        t("re.cargaOriginal", { h: n1(imp.semanaAsIs), n: imp.filas.length }),
        t("re.cargaActual", { h: n1(imp.semanaToBe) }),
        t("re.ahorro", { sem: n1(imp.ahorroSemana), mes: n1(imp.ahorroMes), anio: imp.ahorroAnio.toFixed(0) }),
        t("re.eficiencia", { pct: Math.round(imp.pct) }),
        imp.costoHora > 0 ? t("re.retorno", { total: dinero(imp.ahorroUsdAnio), hora: dinero(imp.costoHora) }) : null,
        "",
        t("re.tablaTareas"),
        "|---|---|---|---|",
        ...imp.filas.map(f => {
          const antes = f.horas_manual * DIAS_HABILES.semana;
          const ahora = f.horas_automatizado * DIAS_HABILES.semana;
          const pct = antes > 0 ? Math.round(((antes - ahora) / antes) * 100) : 0;
          return `| ${f.nombre} | ${n1(antes)} | ${n1(ahora)} | ${pct >= 0 ? "-" : "+"}${Math.abs(pct)}% |`;
        }),
        "\n" + t("re.base", { sem: DIAS_HABILES.semana, mes: DIAS_HABILES.mes, anio: DIAS_HABILES.anio }),
        "");
    }
    md.push(
      t("re.kpis"),
      "| KPI | Unidad | As-Is | To-Be | Frecuencia |",
      "|---|---|---|---|---|",
      ...s3.kpis_y_metricas_clave.map(k => `| ${k.nombre_kpi} | ${k.unidad_medida} | ${k.valor_actual_as_is} | ${k.meta_esperada_to_be} | ${k.frecuencia_medicion} |`),
      "",
      t("re.roi"),
      `- Ahorro potencial: ${s3.roi_estimado.potencial_ahorro_horas_mes} h/mes`,
      `- ROI estimado: $${s3.roi_estimado.roi_estimado_mensual_usd} USD/mes`,
      `- Tiempo estimado de implementación: ${s3.roi_estimado.tiempo_estimado_implementacion || "—"}`,
      "",
      t("re.dolores"),
      ...s1.puntos_de_dolor.map(p => `- **[${p.nivel_severidad}] ${p.categoria}:** ${p.descripcion}`)
    );
    downloadText(`resumen-ejecutivo-${state.app_meta.id_expediente}.md`, md.filter(x => x !== null).join("\n"));
  }

  /* ------------------------------------------------------------------ SECCIÓN 4 */
  function initSeccion4() {
    document.getElementById("btnAddKpi").addEventListener("click", addKpiRow);

    ["s3_ahorro_horas", "s3_costo_hora"].forEach(id => document.getElementById(id).addEventListener("input", updateRoi));

    document.getElementById("btnExportResumen").addEventListener("click", exportResumenEjecutivo);

    document.getElementById("btnAddChecklist").addEventListener("click", () => addRow("checklistRows", "tpl-checklist-row", { item: "" }, () => { }));
    [t("check.confidencial"), t("check.sandbox"), t("check.permisos"), t("check.rollback"), t("check.sponsor")].forEach(item => addRow("checklistRows", "tpl-checklist-row", { item }, () => { }));

    document.getElementById("btnFinalize").addEventListener("click", exportManualCompleto);

    document.getElementById("btnRoiDesdeComparativo").addEventListener("click", () => {
      const imp = calcularImpacto();
      setVal("s3_ahorro_horas", n1(imp.ahorroSemana));
      updateRoi();
      setIoStatus(t("toast.ahorroTraido"));
    });

    // El entregable y las dudas alimentan los dos prompts de cierre.
    ["s4_entregable_tipo", "s4_entregable_estado", "s4_entregable_resultado", "s4_entregable_notas"].forEach(id => {
      const el = document.getElementById(id);
      const alEditar = () => { leerEntregable(); renderConsultaDudas(); renderPresentacion(); };
      el.addEventListener("input", alEditar);
      el.addEventListener("change", alEditar);
    });
    document.getElementById("s4_dudas_detalle").addEventListener("input", () => {
      asegurarCierreSeccion4().dudas.detalle = val("s4_dudas_detalle");
      renderConsultaDudas();
    });
    document.getElementById("s4_pres_logo").addEventListener("change", () => {
      asegurarCierreSeccion4().presentacion.incluir_logo = document.getElementById("s4_pres_logo").checked;
      actualizarPromptPresentacion();
    });

    initDudas();
    initPresentacion();
  }

  /* ---------------- Módulo de dudas: consulta lista para la IA ---------------- */
  function initDudas() {
    const cont = document.getElementById("dudasFrecuentes");
    if (!cont) return;
    cont.innerHTML = contenido().DUDAS_FRECUENTES.map(d => `
      <label class="idea-card" data-duda="${escAttr(d.id)}">
        <input type="checkbox" data-duda-check="${escAttr(d.id)}" />
        <span class="idea-texto"><strong>${escHtml(d.t)}</strong></span>
      </label>`).join("");
    const marcadas = asegurarCierreSeccion4().dudas.puntos_confusos || [];
    cont.querySelectorAll("[data-duda-check]").forEach(chk => {
      chk.checked = marcadas.includes(chk.dataset.dudaCheck);
      chk.closest(".idea-card").classList.toggle("is-selected", chk.checked);
      chk.addEventListener("change", () => {
        const id = chk.dataset.dudaCheck;
        const dudas = asegurarCierreSeccion4().dudas;
        dudas.puntos_confusos = chk.checked
          ? Array.from(new Set((dudas.puntos_confusos || []).concat(id)))
          : (dudas.puntos_confusos || []).filter(x => x !== id);
        chk.closest(".idea-card").classList.toggle("is-selected", chk.checked);
        renderConsultaDudas();
      });
    });
    renderConsultaDudas();
  }

  function renderConsultaDudas() {
    const box = document.getElementById("consultaDudas");
    if (!box) return;
    const dudas = asegurarCierreSeccion4().dudas;
    const marcadas = dudas.puntos_confusos || [];
    if (!marcadas.length && !dudas.detalle.trim()) {
      box.innerHTML = `<p class="hint-footnote" style="margin-top:.9rem">${escHtml(t("s4.dudasVacio"))}</p>`;
      return;
    }
    const yaEstaba = !!document.getElementById("promptDudas");
    if (!yaEstaba) {
      box.innerHTML = `
        <p class="hint-title" style="margin-top:1.1rem">${escHtml(t("s4.consultaLista"))}</p>
        <pre class="prompt-box" id="promptDudas"></pre>
        <div class="panel-actions" style="margin-top:.6rem; justify-content:flex-start; gap:.6rem;">
          <button type="button" class="btn-primary" id="btnCopiarDudas">${escHtml(t("s4.btnCopiarConsulta"))}</button>
          <button type="button" class="btn-secondary" id="btnDescargarDudas">${escHtml(t("s4.btnDescargarMd"))}</button>
        </div>`;
      document.getElementById("btnCopiarDudas").addEventListener("click", () => copiarTexto(construirConsultaDudas(), t("toast.consultaCopiada")));
      document.getElementById("btnDescargarDudas").addEventListener("click", () => {
        downloadText(`consulta-dudas-${state.app_meta.id_expediente}.md`, construirConsultaDudas());
        setIoStatus(t("toast.consultaDescargada"));
      });
    }
    document.getElementById("promptDudas").textContent = construirConsultaDudas();
  }

  function construirConsultaDudas() {
    const s1 = state.seccion_1_ordenar_trabajo.metadata_proceso;
    const s3 = state.seccion_3_compresion_proyecto;
    const ent = asegurarCierreSeccion4().entregable;   // solo lectura
    const dudas = state.seccion_4_indicadores_desarrollo.dudas;
    const marcadas = contenido().DUDAS_FRECUENTES.filter(d => (dudas.puntos_confusos || []).includes(d.id));

    const L = [];
    L.push(t("cd.actua"));
    L.push("");
    L.push(t("cd.construi"));
    L.push(t("cd.proceso", { x: s1.nombre_proceso || t("gantt.sinNombre") }));
    if (s3.nivel_solucion) L.push(t("cd.tipo", { x: textoNivel(s3.nivel_solucion, "titulo") }));
    if (ent.tipo) L.push(t("cd.obtuve", { x: etiquetaOpcion(ent.tipo) }));
    if (ent.estado_ejecucion) L.push(t("cd.salio", { x: etiquetaOpcion(ent.estado_ejecucion) }));
    if (ent.notas_ejecucion) L.push(t("cd.notas", { x: ent.notas_ejecucion }));
    L.push("");
    if (ent.resultado) {
      L.push(t("cd.resultado"));
      L.push("```");
      L.push(ent.resultado);
      L.push("```");
      L.push("");
    } else {
      L.push(t("cd.resultado"));
      L.push(t("cd.pendiente"));
      L.push("");
    }
    L.push(t("cd.noClaro"));
    marcadas.forEach(d => L.push(`- ${d.t}`));
    if (dudas.detalle.trim()) L.push(`- ${dudas.detalle.trim()}`);
    L.push("");
    L.push(t("cd.comoResponder"));
    L.push(t("cd.regla1"));
    L.push(t("cd.regla2"));
    L.push(t("cd.regla3"));
    L.push(t("cd.regla4"));
    L.push(t("cd.regla5"));
    L.push(t("cd.regla6"));
    return L.join("\n");
  }

  /* Un expediente exportado antes de esta versión no trae los sub-objetos del
     cierre. Se completan con los valores por defecto en vez de asumirlos. */
  function asegurarCierreSeccion4() {
    const s4 = state.seccion_4_indicadores_desarrollo;
    s4.entregable = Object.assign({ tipo: "", estado_ejecucion: "", resultado: "", notas_ejecucion: "" }, s4.entregable);
    s4.dudas = Object.assign({ puntos_confusos: [], detalle: "" }, s4.dudas);
    s4.presentacion = Object.assign({ audiencia: "", objetivo: "", incluir_logo: false }, s4.presentacion);
    return s4;
  }

  /* Vuelca el DOM al estado. Llamarla SOLO desde los listeners de edición y
     desde collectState: si la llama un render, puede pisar con campos vacíos
     lo que todavía no se dibujó (pasaba al cargar un expediente). */
  function leerEntregable() {
    const ent = asegurarCierreSeccion4().entregable;
    ent.tipo = val("s4_entregable_tipo");
    ent.estado_ejecucion = val("s4_entregable_estado");
    ent.resultado = val("s4_entregable_resultado");
    ent.notas_ejecucion = val("s4_entregable_notas");
    return ent;
  }

  /* ---------------- Presentación ejecutiva ---------------- */
  function initPresentacion() {
    const pres = contenido().PRESENTACION;
    if (!pres) return;
    const estilo = document.getElementById("estiloDefecto");
    if (estilo) estilo.innerHTML = pres.estilo.map(x => `<li>${escHtml(x)}</li>`).join("");

    const armarPicker = (contenedorId, items, campo) => {
      const cont = document.getElementById(contenedorId);
      if (!cont) return;
      cont.innerHTML = items.map(it => `
        <div class="level-option" role="radio" tabindex="0" aria-checked="false" data-valor="${escAttr(it.id)}">
          <strong>${escHtml(it.nombre)}</strong>
        </div>`).join("");
      cont.querySelectorAll("[data-valor]").forEach(el => {
        const elegir = () => {
          state.seccion_4_indicadores_desarrollo.presentacion[campo] = el.dataset.valor;
          cont.querySelectorAll("[data-valor]").forEach(o => o.setAttribute("aria-checked", o === el ? "true" : "false"));
          renderPresentacion();
        };
        el.addEventListener("click", elegir);
        el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); elegir(); } });
      });
    };
    armarPicker("audienciaPicker", pres.audiencias, "audiencia");
    armarPicker("objetivoPicker", pres.objetivos, "objetivo");

    document.getElementById("btnCopiarPresentacion").addEventListener("click", () => copiarTexto(construirPromptPresentacion(), t("toast.presentacionCopiada")));
    document.getElementById("btnDescargarPresentacion").addEventListener("click", () => {
      downloadText(`prompt-presentacion-${state.app_meta.id_expediente}.md`, construirPromptPresentacion());
      setIoStatus(t("toast.presentacionDescargada"));
    });
    renderPresentacion();
  }

  function renderPresentacion() {
    const cont = document.getElementById("presentacionMetricas");
    if (!cont) return;
    const imp = calcularImpacto();
    if (!imp.hayDatos) {
      cont.innerHTML = `<p class="comparativo-empty" style="grid-column:1/-1">${escHtml(t("s4.sinNumeros"))}</p>`;
    } else {
      cont.innerHTML = `
        <div class="impacto-card"><div class="value">${n1(imp.semanaAsIs)}h</div><div class="label">${escHtml(t("card.antesSemana"))}</div></div>
        <div class="impacto-card"><div class="value">${n1(imp.semanaToBe)}h</div><div class="label">${escHtml(t("card.ahoraSemana"))}</div></div>
        <div class="impacto-card impacto-card--liberada"><div class="value">${imp.ahorroAnio.toFixed(0)}h</div><div class="label">${escHtml(t("card.horasLiberadasAnio"))}</div></div>
        <div class="impacto-card"><div class="value">${Math.round(imp.pct)}%</div><div class="label">${escHtml(t("card.eficiencia"))}</div></div>
        ${imp.costoHora > 0 ? `<div class="impacto-card impacto-card--liberada"><div class="value">${dinero(imp.ahorroUsdAnio)}</div><div class="label">${escHtml(t("card.retornoAnual"))}</div></div>` : ""}`;
    }
    const pres = asegurarCierreSeccion4().presentacion;
    const aud = (contenido().PRESENTACION.audiencias || []).find(a => a.id === pres.audiencia);
    const nota = document.getElementById("audienciaNota");
    if (nota) nota.textContent = aud ? aud.enfoque : t("s4.elegiAudiencia");
    document.querySelectorAll("#audienciaPicker [data-valor]").forEach(o => o.setAttribute("aria-checked", o.dataset.valor === pres.audiencia ? "true" : "false"));
    document.querySelectorAll("#objetivoPicker [data-valor]").forEach(o => o.setAttribute("aria-checked", o.dataset.valor === pres.objetivo ? "true" : "false"));
    actualizarPromptPresentacion();
  }

  function actualizarPromptPresentacion() {
    const pre = document.getElementById("promptPresentacion");
    if (pre) pre.textContent = construirPromptPresentacion();
  }

  function construirPromptPresentacion() {
    const pres = contenido().PRESENTACION;
    if (!pres) return "";
    const meta = state.seccion_1_ordenar_trabajo.metadata_proceso;
    const s1 = state.seccion_1_ordenar_trabajo;
    const s3 = state.seccion_3_compresion_proyecto;
    const cfg = asegurarCierreSeccion4().presentacion;
    const ent = asegurarCierreSeccion4().entregable;   // solo lectura
    const imp = calcularImpacto();
    const aud = pres.audiencias.find(a => a.id === cfg.audiencia);
    const obj = pres.objetivos.find(o => o.id === cfg.objetivo);
    const dolores = (s1.puntos_de_dolor || []).filter(d => d.descripcion);
    const kpis = (s3.kpis_y_metricas_clave || []).filter(k => k.nombre_kpi);
    const controles = readRows("checklistRows", ["item", "completado"]).filter(c => c.item && c.completado);

    const L = [];
    L.push(t("pp.titulo"));
    L.push("");
    L.push(t("pp.actua"));
    L.push("");
    L.push(t("pp.audiencia"));
    if (aud) { L.push(`${aud.nombre}. ${aud.enfoque}`); L.push(aud.pide); }
    else L.push(t("pp.sinAudiencia"));
    L.push("");
    L.push(t("pp.objetivo"));
    if (obj) L.push(`${obj.nombre}. ${obj.pide}`);
    else L.push(t("pp.sinObjetivo"));
    L.push("");
    L.push(t("pp.datos"));
    L.push(t("pp.proyecto", { x: meta.nombre_proceso || t("pp.pendiente") }));
    if (meta.departamento) L.push(t("pm.area", { x: etiquetaOpcion(meta.departamento) }));
    if (meta.responsable_proceso) L.push(t("pp.responsable", { x: meta.responsable_proceso }));
    if (s3.nivel_solucion) L.push(t("pp.tipoElegido", { x: textoNivel(s3.nivel_solucion, "titulo") }));
    if (ent.tipo) L.push(t("pp.construido", { x: etiquetaOpcion(ent.tipo) }));
    if (ent.resultado) L.push(t("pp.entregable", { x: resumirEntregable(ent.resultado) }));
    if (ent.estado_ejecucion) L.push(t("pp.puestaMarcha", { x: etiquetaOpcion(ent.estado_ejecucion) }));
    if (ent.notas_ejecucion) L.push(t("cd.notas", { x: ent.notas_ejecucion }));
    L.push("");
    L.push(t("pp.partida"));
    if (imp.hayDatos) {
      L.push(t("pp.cargaOriginal", { h: n1(imp.semanaAsIs), n: imp.filas.length }));
      L.push(t("pp.cargaActual", { h: n1(imp.semanaToBe) }));
      L.push(t("pp.ahorro", { sem: n1(imp.ahorroSemana), mes: n1(imp.ahorroMes), anio: imp.ahorroAnio.toFixed(0) }));
      L.push(t("pp.eficiencia", { pct: Math.round(imp.pct) }));
      if (imp.costoHora > 0) L.push(t("pp.retorno", { total: dinero(imp.ahorroUsdAnio), hora: dinero(imp.costoHora) }));
      L.push(t("pp.detalleTarea"));
      imp.filas.forEach(f => {
        const antes = f.horas_manual * DIAS_HABILES.semana;
        const ahora = f.horas_automatizado * DIAS_HABILES.semana;
        const pct = antes > 0 ? Math.round(((antes - ahora) / antes) * 100) : 0;
        L.push(`  - ${f.nombre}: ${n1(antes)} h → ${n1(ahora)} h (${pct >= 0 ? "-" : "+"}${Math.abs(pct)}%)`);
      });
      L.push(t("pp.base", { sem: DIAS_HABILES.semana, mes: DIAS_HABILES.mes, anio: DIAS_HABILES.anio }));
    } else {
      L.push(t("pp.sinContraste"));
    }
    if (dolores.length) {
      L.push(t("pp.problemas"));
      dolores.forEach(d => L.push(`  - [${etiquetaOpcion(d.nivel_severidad) || "—"}] ${etiquetaOpcion(d.categoria) || ""}: ${d.descripcion}`));
    }
    if (kpis.length) {
      L.push(t("pp.metricas"));
      kpis.forEach(k => L.push(`  - ${k.nombre_kpi}: ${k.valor_actual_as_is} → ${k.meta_esperada_to_be} ${k.unidad_medida || ""} (medición ${k.frecuencia_medicion || "—"})`));
    }
    if (controles.length) {
      L.push(t("pp.controles"));
      controles.forEach(c => L.push(`  - ${c.item}`));
    }
    const sponsor = val("s4_sponsor"), fecha = val("s4_fecha_revision");
    if (sponsor) L.push(t("pp.sponsor", { x: sponsor }));
    if (fecha) L.push(t("pp.revision", { x: fecha }));
    L.push("");
    L.push(t("pp.formato"));
    L.push(t("pp.formato1"));
    L.push(t("pp.formato2"));
    L.push(t("pp.formato3"));
    L.push(t("pp.formato4"));
    L.push("");
    L.push(t("pp.slides"));
    pres.slides.forEach(sl => L.push(`${sl.n}. ${sl.icono} **${sl.titulo}** — ${sl.enfoque}`));
    L.push("");
    L.push(t("pp.estilo"));
    pres.estilo.forEach(x => L.push(`- ${x}`));
    if (cfg.incluir_logo) {
      L.push(t("pp.logo"));
    }
    L.push("");
    L.push(t("pp.reglas"));
    L.push(t("pp.regla1"));
    L.push(t("pp.regla2"));
    L.push(t("pp.regla3"));
    L.push(t("pp.regla4"));
    return L.join("\n");
  }

  /* Un entregable puede ser un script largo: en la presentación entra un
     resumen, no el código entero. */
  function resumirEntregable(texto) {
    const limpio = String(texto).replace(/\s+/g, " ").trim();
    return limpio.length > 300 ? limpio.slice(0, 300) + "… (recortado)" : limpio;
  }

  function copiarTexto(texto, mensajeOk) {
    const ok = () => setIoStatus(mensajeOk);
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = texto;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let copiado = false;
      try { copiado = document.execCommand("copy"); } catch (e) { copiado = false; }
      document.body.removeChild(ta);
      if (copiado) ok();
      else setIoStatus(t("toast.copiadoBloqueado"));
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(ok).catch(fallback);
    else fallback();
  }

  function renderGuiaDesarrollo() {
    collectState();
    const s1 = state.seccion_1_ordenar_trabajo.metadata_proceso;
    const s2 = state.seccion_2_clasificacion_proyecto.recomendacion;
    const s3 = state.seccion_3_compresion_proyecto;

    if (!s3.nivel_solucion) return;

    const guiaAvanzada = (contenido().GUIAS || {})[claveNivel(s3.nivel_solucion)] || "";

    let html = `<h4>${escHtml(t("gd.titulo"))}</h4>`;
    html += `<p style="margin-bottom: 1rem; font-size: 0.85rem; color: var(--color-text-muted);">
      ${escHtml(t("gd.proceso"))} <strong>${escHtml(s1.nombre_proceso || t("gd.tuProceso"))}</strong> <br> ${escHtml(t("gd.recomendacion"))} <strong>${escHtml(s2.nombre_tecnico || t("gd.esperando"))}</strong>.
    </p>`;
    html += guiaAvanzada;

    document.getElementById("guiaDesarrollo").innerHTML = html;
  }

  /* ---------------- Galería de ideas y sugerencias (Sección 3) ---------------- */
  /* El contenido editorial (galerías, guías, catálogo y prompts) tiene una
     versión por idioma. Se resuelve en cada llamada porque el idioma cambia
     en caliente. */
  const CONTENIDO_VACIO = { SUGERENCIAS: {}, IA_GUIA: [], CATALOGO: null, DUDAS_FRECUENTES: [], GUIAS: {}, PRESENTACION: { audiencias: [], objetivos: [], estilo: [], slides: [] } };
  function contenido() {
    const todos = window.AIPG_CONTENIDO || {};
    return todos[idiomaActivo] || todos[I18N.idiomaPorDefecto] || CONTENIDO_VACIO;
  }

  function sugerenciasDelNivel() {
    return contenido().SUGERENCIAS[claveNivel(state.seccion_3_compresion_proyecto.nivel_solucion)] || null;
  }

  function renderGaleriaIdeas() {
    const box = document.getElementById("galeriaIdeas");
    if (!box) return;
    const data = sugerenciasDelNivel();
    if (!data) {
      box.innerHTML = `<p style="margin:0;color:var(--color-text-muted);font-size:.85rem;">${escHtml(t("s3.sinTipoIdeas"))}</p>`;
      return;
    }
    const marcadas = new Set(state.seccion_3_compresion_proyecto.sugerencias_seleccionadas || []);

    const bloque = (titulo, items) => `
      <div class="sugerencias-bloque">
        <p class="hint-title">${titulo}</p>
        <ul class="hint-list">
          ${items.map(i => `<li><strong>${escHtml(i.t)}:</strong> ${escHtml(i.d)}</li>`).join("")}
        </ul>
      </div>`;

    box.innerHTML = `
      <p class="sugerencias-etiqueta">${escHtml(data.etiqueta)}</p>
      <p class="sugerencias-lede">${escHtml(data.lede)}</p>
      <div class="sugerencias-grid">
        ${bloque(t("s3.bloqueEstrategia"), data.estrategia)}
        ${bloque(t("s3.bloqueRecursos"), data.recursos)}
      </div>
      <p class="hint-title" style="margin-top:1.1rem">${escHtml(t("s3.eligeIdeas"))}</p>
      <div class="idea-grid">
        ${data.ideas.map(idea => `
          <label class="idea-card" data-idea="${escAttr(idea.id)}">
            <input type="checkbox" data-idea-check="${escAttr(idea.id)}"${marcadas.has(idea.id) ? " checked" : ""} />
            <span class="idea-texto">
              <strong>${escHtml(idea.t)}</strong>
              <span class="idea-desc">${escHtml(idea.d)}</span>
            </span>
          </label>`).join("")}
      </div>
      <p class="idea-contador" id="ideaContador"></p>`;

    box.querySelectorAll("[data-idea-check]").forEach(chk => {
      chk.addEventListener("change", () => {
        const id = chk.dataset.ideaCheck;
        const sel = state.seccion_3_compresion_proyecto.sugerencias_seleccionadas || [];
        state.seccion_3_compresion_proyecto.sugerencias_seleccionadas =
          chk.checked ? Array.from(new Set(sel.concat(id))) : sel.filter(x => x !== id);
        chk.closest(".idea-card").classList.toggle("is-selected", chk.checked);
        actualizarContadorIdeas();
        renderPromptLauncher();
      });
      chk.closest(".idea-card").classList.toggle("is-selected", chk.checked);
    });
    actualizarContadorIdeas();
  }

  function actualizarContadorIdeas() {
    const el = document.getElementById("ideaContador");
    if (!el) return;
    const n = (state.seccion_3_compresion_proyecto.sugerencias_seleccionadas || []).length;
    el.textContent = n === 0 ? t("s3.sinIdeas") : t("s3.ideasMarcadas", { n });
  }

  /* ---------------- Lanzador de prompt y selección de IA ---------------- */
  function renderPromptLauncher() {
    const box = document.getElementById("promptLauncher");
    if (!box) return;
    const data = sugerenciasDelNivel();
    if (!data) {
      box.innerHTML = `<p style="margin:0;color:var(--color-text-muted);font-size:.85rem;">${escHtml(t("s3.sinTipoPrompt"))}</p>`;
      return;
    }
    const s3 = state.seccion_3_compresion_proyecto;
    const nivel = claveNivel(s3.nivel_solucion);
    const iaElegida = s3.ia_preferida;

    box.innerHTML = `
      <p class="hint-title">${escHtml(t("s3.pasoIA"))}</p>
      <div class="level-picker level-picker--compact" id="iaPicker" role="radiogroup" aria-label="${escAttr(t("s3.ariaAsistente"))}">
        ${contenido().IA_GUIA.map(ia => `
          <div class="level-option" role="radio" tabindex="0" aria-checked="${ia.id === iaElegida ? "true" : "false"}" data-ia="${escAttr(ia.id)}">
            <strong>${escHtml(ia.nombre)}${ia.ideal.includes(nivel) ? ` <span class="ia-badge">${escHtml(t("s3.sugerida"))}</span>` : ""}</strong>
          </div>`).join("")}
      </div>
      <p class="ia-fortaleza" id="iaFortaleza"></p>
      <p class="hint-title" style="margin-top:1.1rem">${escHtml(t("s3.pasoPrompt"))}</p>
      <pre class="prompt-box" id="promptMaestro"></pre>
      <div class="panel-actions" style="margin-top:.6rem; justify-content:flex-start; gap:.6rem;">
        <button type="button" class="btn-primary" id="btnCopiarPrompt">${escHtml(t("s3.btnCopiarMaestro"))}</button>
        <button type="button" class="btn-secondary" id="btnDescargarPrompt">${escHtml(t("s3.btnDescargarPrompt"))}</button>
      </div>
      <p class="hint-footnote" style="margin-top:.6rem">${escHtml(t("s3.avisoPegar"))}</p>`;

    box.querySelectorAll("[data-ia]").forEach(el => {
      const elegir = () => {
        state.seccion_3_compresion_proyecto.ia_preferida = el.dataset.ia;
        box.querySelectorAll("[data-ia]").forEach(o => o.setAttribute("aria-checked", o === el ? "true" : "false"));
        actualizarPromptMaestro();
      };
      el.addEventListener("click", elegir);
      el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); elegir(); } });
    });
    document.getElementById("btnCopiarPrompt").addEventListener("click", copiarPromptMaestro);
    document.getElementById("btnDescargarPrompt").addEventListener("click", () => {
      downloadText(`prompt-maestro-${state.app_meta.id_expediente}.md`, construirPromptMaestro());
      setIoStatus(t("toast.promptDescargado"));
    });
    actualizarPromptMaestro();
  }

  function actualizarPromptMaestro() {
    const pre = document.getElementById("promptMaestro");
    if (pre) pre.textContent = construirPromptMaestro();
    const ia = contenido().IA_GUIA.find(x => x.id === state.seccion_3_compresion_proyecto.ia_preferida);
    const nota = document.getElementById("iaFortaleza");
    if (nota) nota.textContent = ia
      ? `${ia.nombre}: ${ia.fortaleza}`
      : t("s3.elegiAsistente");
  }

  function construirPromptMaestro() {
    const data = sugerenciasDelNivel();
    if (!data) return "";
    const s1 = state.seccion_1_ordenar_trabajo;
    const meta = s1.metadata_proceso;
    const rec = state.seccion_2_clasificacion_proyecto.recomendacion || {};
    const s3 = state.seccion_3_compresion_proyecto;
    const marcadas = new Set(s3.sugerencias_seleccionadas || []);
    const ideas = data.ideas.filter(i => marcadas.has(i.id));
    const ia = contenido().IA_GUIA.find(x => x.id === s3.ia_preferida);
    const dolores = (s1.puntos_de_dolor || []).filter(d => d.descripcion);

    const L = [];
    L.push(t("pm.actua", { rol: data.prompt.rol }));
    L.push("");
    L.push(t("pm.contexto"));
    L.push(t("pm.proceso", { x: meta.nombre_proceso || t("pm.sinProceso") }));
    if (meta.departamento) L.push(t("pm.area", { x: etiquetaOpcion(meta.departamento) }));
    const entradas = normalizarMapeo(s1.mapeo_entradas_salidas.entradas);
    const salidas = normalizarMapeo(s1.mapeo_entradas_salidas.salidas);
    if (entradas.length) {
      L.push(t("pm.entradas"));
      entradas.forEach(e => L.push(`  - ${describirMapeo(e, "entrada")}`));
    }
    if (salidas.length) {
      L.push(t("pm.salidas"));
      salidas.forEach(x => L.push(`  - ${describirMapeo(x, "salida")}`));
    }
    if (dolores.length) {
      L.push(t("pm.problemas"));
      dolores.forEach(d => L.push(`  - [${etiquetaOpcion(d.nivel_severidad) || "—"}] ${etiquetaOpcion(d.categoria) || ""}: ${d.descripcion}`));
    }
    if (rec.nombre_tecnico) L.push(t("pm.recomendacion", { x: rec.nombre_tecnico }));
    L.push(t("pm.tipo", { nivel: textoNivel(s3.nivel_solucion, "titulo"), etiqueta: data.etiqueta }));
    L.push("");
    L.push(t("pm.necesito"));
    L.push(data.prompt.encargo);
    L.push("");
    if (ideas.length) {
      L.push(t("pm.ideas"));
      ideas.forEach(i => L.push(`- **${i.t}**: ${i.d}`));
      L.push("");
    }
    L.push(t("pm.comoTrabajes"));
    L.push(data.prompt.exigencia);
    L.push(t("pm.regla1"));
    L.push(t("pm.regla2"));
    L.push(t("pm.regla3"));
    L.push(t("pm.regla4"));
    if (ia) {
      L.push("");
      L.push(t("pm.preparado", { ia: ia.nombre, fuerte: ia.fortaleza }));
    }
    return L.join("\n");
  }

  function copiarPromptMaestro() {
    // copiarTexto() cae a execCommand porque con file:// algunos navegadores
    // bloquean la Clipboard API.
    copiarTexto(construirPromptMaestro(), t("toast.promptCopiado"));
  }

  /* ---------------- Catálogo de recursos: documento imprimible (PDF) ---------------- */
  function refGlosario(n) {
    return n ? ` <sup class="doc-ref">${escHtml(t("doc.refGlosario", { n }))}</sup>` : "";
  }

  function renderDocCatalogo() {
    const cat = contenido().CATALOGO;
    const cont = document.getElementById("docCatalogo");
    if (!cat || !cont) return;
    const meta = state.seccion_1_ordenar_trabajo.metadata_proceso;
    const hoy = new Date().toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" });

    const portada = `
      <header class="doc-portada">
        <div class="doc-portada-texto">
          <p class="doc-kicker">${escHtml(t("doc.kicker"))}</p>
          <h1>${escHtml(cat.titulo)}</h1>
          <p class="doc-bajada">${escHtml(cat.bajada)}</p>
          <dl class="doc-meta">
            <div><dt>${escHtml(t("doc.proyecto"))}</dt><dd>${escHtml(meta.nombre_proceso || "—")}</dd></div>
            <div><dt>${escHtml(t("doc.area"))}</dt><dd>${escHtml(etiquetaOpcion(meta.departamento) || "—")}</dd></div>
            <div><dt>${escHtml(t("doc.responsable"))}</dt><dd>${escHtml(meta.responsable_proceso || "—")}</dd></div>
            <div><dt>${escHtml(t("doc.expediente"))}</dt><dd>${escHtml(state.app_meta.id_expediente)}</dd></div>
            <div><dt>${escHtml(t("doc.generado"))}</dt><dd>${escHtml(hoy)}</dd></div>
          </dl>
        </div>
        <img class="doc-portada-img" src="ilustracion-catalogo.png" width="800" height="600" alt="" />
      </header>`;

    const esquema = `
      <section class="doc-seccion">
        <h2><span class="doc-num">1</span> ${escHtml(cat.esquema.titulo)}</h2>
        <p class="doc-lede">${escHtml(cat.esquema.lede)}</p>
        <div class="doc-flujo">
          ${cat.esquema.pasos.map((paso, i) => `
            <div class="doc-flujo-paso">
              <span class="doc-flujo-icono" aria-hidden="true">${paso.icono}</span>
              <strong>${escHtml(paso.clave)}</strong>
              <span>${escHtml(paso.d)}</span>
            </div>
            ${i < cat.esquema.pasos.length - 1 ? '<span class="doc-flujo-flecha" aria-hidden="true">→</span>' : ""}`).join("")}
        </div>
      </section>`;

    const areas = `
      <section class="doc-seccion">
        <h2><span class="doc-num">2</span> ${escHtml(t("doc.areas"))}</h2>
        ${cat.areas.map(a => `
          <article class="doc-area">
            <h3>${escHtml(t("doc.area_n", { n: a.n }))} · ${escHtml(a.titulo)}</h3>
            <p class="doc-area-desc">${escHtml(a.descripcion)}</p>
            <p class="doc-area-valor"><strong>${escHtml(t("doc.valor"))}</strong> ${escHtml(a.valor)}</p>
            <table class="doc-tabla">
              <thead>
                <tr><th>${escHtml(t("doc.colSkill"))}</th><th>${escHtml(t("doc.colPara"))}</th><th>${escHtml(t("doc.colInput"))}</th><th>${escHtml(t("doc.colOutput"))}</th></tr>
              </thead>
              <tbody>
                ${a.filas.map(f => `
                  <tr>
                    <td><strong>${escHtml(f.skill)}</strong>${refGlosario(f.glosario)}</td>
                    <td>${escHtml(f.proposito)}</td>
                    <td>${escHtml(f.input)}</td>
                    <td>${escHtml(f.output)}</td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </article>`).join("")}
      </section>`;

    const gobernanza = `
      <section class="doc-seccion">
        <h2><span class="doc-num">3</span> ${escHtml(t("doc.gobernanza"))}</h2>
        <ol class="doc-gobernanza">
          ${cat.gobernanza.map(g => `<li><strong>${escHtml(g.t)}:</strong> ${escHtml(g.d)}</li>`).join("")}
        </ol>
      </section>`;

    const glosario = `
      <section class="doc-seccion doc-seccion--glosario">
        <h2><span class="doc-num">4</span> ${escHtml(t("doc.glosario"))}</h2>
        <div class="doc-glosario">
          ${cat.glosario.map(g => `
            <article class="doc-termino">
              <h3><span class="doc-termino-num">${g.n}</span> ${escHtml(g.termino)}</h3>
              <p><strong>${escHtml(t("doc.quees"))}</strong> ${escHtml(g.que)}</p>
              <p><strong>${escHtml(t("doc.parasirve"))}</strong> ${escHtml(g.para)}</p>
              <p class="doc-ejemplo"><strong>${escHtml(t("doc.ejemplo"))}</strong> ${escHtml(g.ej)}</p>
            </article>`).join("")}
        </div>
      </section>`;

    cont.innerHTML = portada + esquema + areas + gobernanza + glosario +
      `<footer class="doc-pie">${escHtml(t("doc.pie"))}</footer>`;
  }

  function imprimirCatalogo() {
    collectState();
    renderDocCatalogo();
    const doc = document.getElementById("docCatalogo");
    doc.hidden = false;
    document.body.classList.add("imprimiendo-catalogo");
    const restaurar = () => {
      document.body.classList.remove("imprimiendo-catalogo");
      doc.hidden = true;
      window.removeEventListener("afterprint", restaurar);
    };
    window.addEventListener("afterprint", restaurar);
    setIoStatus(t("toast.imprimirCatalogo"));
    window.print();
    // Algunos navegadores no disparan afterprint de forma fiable: red de seguridad.
    setTimeout(() => { if (document.body.classList.contains("imprimiendo-catalogo")) restaurar(); }, 3000);
  }

  function exportManualCompleto() {
    collectState();
    markStepComplete(4);
    const s = state;
    const impacto = calcularImpacto();
    const md = [
      `# Manual de Implementación — ${s.seccion_1_ordenar_trabajo.metadata_proceso.nombre_proceso || s.app_meta.id_expediente}`,
      `Expediente: ${s.app_meta.id_expediente} · Generado: ${new Date().toLocaleDateString()}`,
      "",
      "## 1. Recomendación y Nivel de Solución",
      `- **Recomendación Técnica:** ${s.seccion_2_clasificacion_proyecto.recomendacion?.nombre_tecnico || "—"}`,
      `- **Nivel:** ${s.seccion_3_compresion_proyecto.nivel_solucion || "—"}`,
      `- **Entregable construido:** ${s.seccion_4_indicadores_desarrollo.entregable.tipo || "—"} (${s.seccion_4_indicadores_desarrollo.entregable.estado_ejecucion || "sin registrar"})`,
      "",
      "## 1.b Impacto medido",
      ...(impacto.hayDatos
        ? [
          `- Carga original: ${n1(impacto.semanaAsIs)} h/semana · actual: ${n1(impacto.semanaToBe)} h/semana.`,
          `- Ahorro: ${n1(impacto.ahorroSemana)} h/semana · ${impacto.ahorroAnio.toFixed(0)} h/año (${Math.round(impacto.pct)}% de eficiencia ganada).`,
          impacto.costoHora > 0 ? `- Retorno estimado: ${dinero(impacto.ahorroUsdAnio)} USD/año.` : "- Retorno económico: sin costo hora cargado."
        ]
        : ["- Sin contraste de horas cargado en la Sección 4."]),
      "",
      "## 2. Checklist de Seguridad / Emisión al Piloto",
      ...readRows("checklistRows", ["item", "completado"]).map(c => `- [${c.completado ? "x" : " "}] ${c.item}`),
      "",
      "## 3. Gestión del Cambio",
      `- Sponsor: ${document.getElementById("s4_sponsor").value || "—"}`,
      `- Fecha de revisión del piloto: ${document.getElementById("s4_fecha_revision").value || "—"}`,
      "",
      "## 4. Prompt para la presentación ejecutiva",
      "```markdown",
      construirPromptPresentacion(),
      "```",
      "",
      "## 5. Estado completo del expediente",
      "```json",
      JSON.stringify(s, null, 2),
      "```"
    ];
    downloadText(`plan-proyecto-${s.app_meta.id_expediente}.md`, md.join("\n"));
    setIoStatus(t("toast.planProyecto"));
  }

  /* ------------------------------------------------------------------ COLLECT / HYDRATE */
  function collectState() {
    const s1 = state.seccion_1_ordenar_trabajo;
    s1.metadata_proceso = {
      id_proceso: s1.metadata_proceso.id_proceso || state.app_meta.id_expediente,
      nombre_proceso: val("s1_nombre_proceso"),
      departamento: val("s1_departamento"),
      responsable_proceso: val("s1_responsable"),
      fecha_evaluacion: val("s1_fecha"),
      nivel_madurez_actual: s1.metadata_proceso.nivel_madurez_actual
    };
    s1.mapeo_entradas_salidas = {
      entradas: leerMapeo("entrada"),
      salidas: leerMapeo("salida"),
      punto_entrada_unico_definido: document.getElementById("s1_punto_entrada_unico").checked
    };
    s1.metricas_tiempo_y_costos.jornada_laboral_horas_dia = Number(val("carga_jornada") || 8);
    s1.tareas_habituales = readTareasHabituales();
    s1.capacidad_80_20.modo_equipo = document.getElementById("esManagerEquipo").checked;
    s1.capacidad_80_20.colaboradores = calcularCapacidad();
    s1.puntos_de_dolor = readRows("dolorRows", ["categoria", "descripcion", "nivel_severidad"]).map((d, i) => ({ id_dolor: `PAIN-${String(i + 1).padStart(2, "0")}`, ...d }));
    s1.cronograma_gantt = readGantt();

    // skills_seleccionadas ya no se gestiona mediante UI. Se eliminó la colección manual

    state.seccion_3_compresion_proyecto.kpis_y_metricas_clave = readKpis();
    state.seccion_3_compresion_proyecto.comparativo_automatizacion = readComparativoAutomatizacion();
    const ahorroSemanal = Number(val("s3_ahorro_horas") || 0);
    const costoHora = Number(val("s3_costo_hora") || 0);
    state.seccion_3_compresion_proyecto.roi_estimado = {
      potencial_ahorro_horas_mes: Number((ahorroSemanal * SEMANAS_MES).toFixed(1)),
      roi_estimado_mensual_usd: Number((ahorroSemanal * SEMANAS_MES * costoHora).toFixed(0)),
      costo_hora_usd: costoHora,
      tiempo_estimado_implementacion: val("s3_tiempo_impl"),
      requiere_aprobacion_seguridad: document.getElementById("s3_requiere_seguridad").checked
    };

    leerEntregable();
    const cierre = asegurarCierreSeccion4();
    cierre.dudas.detalle = val("s4_dudas_detalle");
    cierre.presentacion.incluir_logo = document.getElementById("s4_pres_logo").checked;
    state.seccion_4_indicadores_desarrollo.plan_gestion_cambio.checklist = readRows("checklistRows", ["item", "completado"]);
    state.seccion_4_indicadores_desarrollo.plan_gestion_cambio.responsable_sponsor = val("s4_sponsor");
    state.seccion_4_indicadores_desarrollo.plan_gestion_cambio.fecha_revision_piloto = val("s4_fecha_revision");

    state.app_meta.actualizado_en = new Date().toISOString();
    state.app_meta.nombre_proyecto = s1.metadata_proceso.nombre_proceso;
    return state;
  }

  function val(id) { return document.getElementById(id).value || ""; }
  function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v ?? ""; }

  function hydrateState(loaded) {
    state = Object.assign(emptyState(), loaded);
    state.seccion_2_clasificacion_proyecto.evaluacion_ecosistema = state.seccion_2_clasificacion_proyecto.evaluacion_ecosistema || { respuestas: {}, puntaje: 0, nivel: "" };
    state.seccion_4_indicadores_desarrollo = Object.assign(emptyState().seccion_4_indicadores_desarrollo, state.seccion_4_indicadores_desarrollo);
    asegurarCierreSeccion4();
    const s1 = state.seccion_1_ordenar_trabajo;
    setVal("s1_nombre_proceso", s1.metadata_proceso.nombre_proceso);
    setVal("s1_departamento", s1.metadata_proceso.departamento);
    setVal("s1_responsable", s1.metadata_proceso.responsable_proceso);
    setVal("s1_fecha", s1.metadata_proceso.fecha_evaluacion);
    s1.mapeo_entradas_salidas.entradas = normalizarMapeo(s1.mapeo_entradas_salidas.entradas);
    s1.mapeo_entradas_salidas.salidas = normalizarMapeo(s1.mapeo_entradas_salidas.salidas);
    renderMapeoCompleto();
    document.getElementById("s1_punto_entrada_unico").checked = !!s1.mapeo_entradas_salidas.punto_entrada_unico_definido;
    const mt = s1.metricas_tiempo_y_costos;
    setVal("carga_jornada", mt.jornada_laboral_horas_dia ?? 8);
    document.getElementById("tareasHabitualesRows").innerHTML = "";
    (s1.tareas_habituales && s1.tareas_habituales.length ? s1.tareas_habituales : [{ tipo: "Repetitiva", cantidad: 10, minutos_por_unidad: 10 }]).forEach(addTareaHabitualRow);
    renderDiagnosticoCarga();

    document.getElementById("esManagerEquipo").checked = !!s1.capacidad_80_20.modo_equipo;
    aplicarModoEquipo(!!s1.capacidad_80_20.modo_equipo);
    document.getElementById("capacidadRows").innerHTML = "";
    (s1.capacidad_80_20.colaboradores.length ? s1.capacidad_80_20.colaboradores : [{}]).forEach(c => addRow("capacidadRows", "tpl-colaborador-row", c, calcularCapacidad));
    calcularCapacidad();

    document.getElementById("dolorRows").innerHTML = "";
    s1.puntos_de_dolor.forEach(d => addRow("dolorRows", "tpl-dolor-row", d, () => { }));

    document.getElementById("ganttBody").innerHTML = "";
    (s1.cronograma_gantt.length ? s1.cronograma_gantt : []).forEach(addGanttRow);
    if (!s1.cronograma_gantt.length) addGanttRow();

    const respuestas = state.seccion_2_clasificacion_proyecto.respuestas || {};
    Object.keys(respuestas).forEach(preguntaId => { if (respuestas[preguntaId]) seleccionarRespuesta(preguntaId, respuestas[preguntaId]); });
    if (!Object.values(respuestas).some(Boolean)) renderRecomendacion();

    const ecoRespuestas = state.seccion_2_clasificacion_proyecto.evaluacion_ecosistema.respuestas || {};
    Object.keys(ecoRespuestas).forEach(preguntaId => {
      const picker = document.querySelector(`#ecoPreguntas .level-picker[data-eco-id="${preguntaId}"]`);
      if (picker) seleccionarEcosistema(preguntaId, ecoRespuestas[preguntaId].valor, ecoRespuestas[preguntaId].puntos, picker);
    });
    if (!Object.keys(ecoRespuestas).length) renderEcosistema();

    // skills_seleccionadas dependencias removidas

    /* El entregable y las dudas se vuelcan primero: updateRoi() (más abajo)
       encadena renderPresentacion() -> leerEntregable(), que lee el DOM y
       sobrescribe el estado. Si los campos estuvieran vacíos, se perdería lo
       que acaba de venir del archivo. */
    const s4 = state.seccion_4_indicadores_desarrollo;
    asegurarCierreSeccion4();
    setVal("s4_entregable_tipo", s4.entregable.tipo);
    setVal("s4_entregable_estado", s4.entregable.estado_ejecucion);
    setVal("s4_entregable_resultado", s4.entregable.resultado);
    setVal("s4_entregable_notas", s4.entregable.notas_ejecucion);
    setVal("s4_dudas_detalle", s4.dudas.detalle);
    document.querySelectorAll("[data-duda-check]").forEach(chk => {
      chk.checked = (s4.dudas.puntos_confusos || []).includes(chk.dataset.dudaCheck);
      chk.closest(".idea-card").classList.toggle("is-selected", chk.checked);
    });
    document.getElementById("s4_pres_logo").checked = !!s4.presentacion.incluir_logo;

    const s3 = state.seccion_3_compresion_proyecto;
    s3.sugerencias_seleccionadas = s3.sugerencias_seleccionadas || [];
    if (s3.nivel_solucion) selectLevel(s3.nivel_solucion);
    document.getElementById("kpiBody").innerHTML = "";
    (s3.kpis_y_metricas_clave.length ? s3.kpis_y_metricas_clave : []).forEach(addKpiRow);
    if (!s3.kpis_y_metricas_clave.length) addKpiRow();
    setVal("s3_tiempo_impl", s3.roi_estimado.tiempo_estimado_implementacion);
    document.getElementById("s3_requiere_seguridad").checked = !!s3.roi_estimado.requiere_aprobacion_seguridad;
    // El ahorro se guarda mensual pero se carga por semana, que es como se pide.
    const ahorroMes = Number(s3.roi_estimado.potencial_ahorro_horas_mes || 0);
    setVal("s3_ahorro_horas", ahorroMes ? n1(ahorroMes / SEMANAS_MES) : "");
    setVal("s3_costo_hora", s3.roi_estimado.costo_hora_usd || "");
    updateRoi();

    document.getElementById("checklistRows").innerHTML = "";
    (s4.plan_gestion_cambio.checklist.length ? s4.plan_gestion_cambio.checklist : []).forEach(c => addRow("checklistRows", "tpl-checklist-row", c, () => { }));
    setVal("s4_sponsor", s4.plan_gestion_cambio.responsable_sponsor);
    setVal("s4_fecha_revision", s4.plan_gestion_cambio.fecha_revision_piloto);

    renderConsultaDudas();
    renderPresentacion();

    goToStep(state.app_meta.etapa_actual || 1);
    setIoStatus(t("toast.expedienteCargado", { id: state.app_meta.id_expediente }));
  }

  /* ------------------------------------------------------------------ IMPORT / EXPORT */
  function downloadJSON(filename, obj) { downloadBlob(filename, JSON.stringify(obj, null, 2), "application/json"); }
  function downloadText(filename, text) { downloadBlob(filename, text, "text/markdown"); }
  function downloadBlob(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    a.remove(); URL.revokeObjectURL(url);
  }

  function setIoStatus(msg) {
    const el = document.getElementById("ioStatus");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => { el.classList.remove("show"); }, 4000);
  }

  function loadFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.schema_version) throw new Error(t("error.sinSchema"));
        hydrateState(data);
      } catch (e) {
        setIoStatus(t("toast.archivoError", { msg: e.message }));
      }
    };
    reader.readAsText(file);
  }

  function initIO() {
    document.getElementById("btnImport").addEventListener("click", () => document.getElementById("fileInput").click());
    document.getElementById("fileInput").addEventListener("change", e => { if (e.target.files[0]) loadFile(e.target.files[0]); });
    document.getElementById("btnExportJson").addEventListener("click", () => {
      collectState();
      downloadJSON(`expediente-${state.app_meta.id_expediente}-etapa${state.app_meta.etapa_actual}.json`, state);
      markStepComplete(state.app_meta.etapa_actual);
      goToStep(currentStep);
      setIoStatus(t("toast.expedienteGuardado"));
    });
    document.getElementById("btnExportPrint").addEventListener("click", () => {
      collectState();
      const panels = document.querySelectorAll(".wizard-panel");
      panels.forEach(p => p.dataset.wasHidden = p.hidden ? "1" : "0");
      panels.forEach(p => { p.hidden = false; });
      window.print();
      window.addEventListener("afterprint", function restore() {
        panels.forEach(p => { p.hidden = p.dataset.wasHidden === "1"; });
        window.removeEventListener("afterprint", restore);
      });
    });

    const dropZone = document.getElementById("dropZone");
    ["dragenter", "dragover"].forEach(evt => window.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.add("active"); }));
    ["dragleave", "drop"].forEach(evt => window.addEventListener(evt, e => { e.preventDefault(); if (evt === "drop") return; dropZone.classList.remove("active"); }));
    window.addEventListener("drop", e => {
      e.preventDefault();
      dropZone.classList.remove("active");
      const file = e.dataTransfer.files[0];
      if (file) loadFile(file);
    });
  }

  /* ------------------------------------------------------------------ INIT */
  function initNav() {
    document.querySelectorAll("[data-goto]").forEach(btn => btn.addEventListener("click", () => { collectState(); goToStep(Number(btn.dataset.goto)); }));
    document.querySelectorAll("[data-next]").forEach(btn => btn.addEventListener("click", () => {
      collectState();
      markStepComplete(currentStep);
      goToStep(Number(btn.dataset.next));
    }));
    document.querySelectorAll("[data-prev]").forEach(btn => btn.addEventListener("click", () => { collectState(); goToStep(Number(btn.dataset.prev)); }));
  }

  function initHeroCompacto() {
    const wrap = document.getElementById("appTopSticky");
    // Histéresis: entra en compacto pasando 40px, sale recién por debajo de 12px.
    // Evita que el scroll lento/con inercia (trackpad) cruce un único umbral varias
    // veces seguidas y prenda/apague la clase en un parpadeo ("brinco" percibido).
    let compacto = false;
    const actualizar = () => {
      const y = window.scrollY;
      if (!compacto && y > 40) compacto = true;
      else if (compacto && y < 12) compacto = false;
      wrap.classList.toggle("is-compact", compacto);
    };
    window.addEventListener("scroll", actualizar, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initIO();
    initNav();
    initHeroCompacto();
    initSeccion1();
    initSeccion2();
    initSeccion3();
    initSeccion4();
    initIdioma();
    goToStep(1);
    window.addEventListener("resize", actualizarScrollTabla);
    document.querySelector("#view-tabla .table-scroll").addEventListener("scroll", actualizarScrollTabla);
    actualizarScrollTabla();
  });
})();
