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

  const LEVELS = [
    { id: "Nivel 1: Presentación / Documento de Asistencia", titulo: "Nivel 1 · Presentación / Documento", desc: "Resumen de actas, diapositivas automatizadas.", why: "Suficiente cuando el proceso es puntual y de bajo volumen: solo necesitas comunicar mejor, no automatizar." },
    { id: "Nivel 2: Herramienta / Script de Automatización Fija", titulo: "Nivel 2 · Automatización", desc: "Script, macro o flujo que hace la tarea repetitiva.", why: "Ideal cuando el proceso ya está limpio y es repetitivo, pero sigue reglas fijas sin criterio subjetivo." },
    { id: "Nivel 3: Herramienta / Visualización / Conjunto de Funciones", titulo: "Nivel 3 · Herramienta / Visualización", desc: "Calculadora, dashboard o plantilla interactiva.", why: "Conviene cuando varias personas necesitan consultar, calcular o comparar lo mismo: en vez de explicarlo cada vez, les das la herramienta." },
    { id: "Nivel 4: Agente Autónomo / Multi-herramienta", titulo: "Nivel 4 · Agente / Autónomo", desc: "Asistente con rol experto y varios pasos de razonamiento.", why: "Solo si ya existen datos estructurados, métricas y aprobación de seguridad. Requiere límites, logs y STOP." }
  ];

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
    btn.setAttribute("aria-label", theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  }

  /* ------------------------------------------------------------------ NAV */
  const HERO_COPY = {
    1: {
      titulo: "Ordena tu trabajo antes de automatizarlo",
      lede: "Mapea tus tareas, descubre tu tiempo libre real y convierte esa idea cotidiana en una hoja de ruta clara — lista para automatizar o potenciar con IA cuando quieras."
    },
    2: {
      titulo: "¿Qué tipo de proyecto necesitas?",
      lede: "Responde estas preguntas para obtener una recomendación técnica concreta: qué construir y qué investigar en tu próxima interacción con la IA."
    },
    3: {
      titulo: "Elige qué vas a construir",
      lede: "Cuatro caminos posibles, con ideas concretas para cada uno. Marca las que se parezcan a tu necesidad y te armamos el prompt para el asistente de IA que prefieras."
    },
    4: {
      titulo: "Mide el impacto y cuéntalo",
      lede: "Compara las mismas tareas de la Sección 1 contra cómo quedaron con tu solución, calcula el retorno y llévate el guion de la presentación. La app nunca envía nada por ti."
    }
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
    const copy = HERO_COPY[step];
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
      <div class="summary-card"><div class="value">${colaboradores.length}</div><div class="label">Colaboradores</div></div>
      <div class="summary-card"><div class="value">${totalDisponible.toFixed(1)}h</div><div class="label">Disponibles/semana para mejora</div></div>
      <div class="summary-card"><div class="value">${colorPct} ${pctCarga}%</div><div class="label">% Promedio para innovación</div></div>`;

    const velocidadEl = document.getElementById("velocidadSprint");
    if (velocidadEl) {
      const velocidadSprint = (totalDisponible * 2).toFixed(1);
      velocidadEl.textContent = colaboradores.length
        ? `📊 Velocidad estimada del sprint: ${velocidadSprint} horas-hombre totales para desarrollo en 2 semanas (aproximado: suma la disponibilidad semanal x 2).`
        : "Agrega al menos un colaborador para estimar la velocidad del sprint.";
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
      <button type="button" class="btn-icon" data-remove aria-label="Eliminar tarea">🗑️</button>`;

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
        <h4>🔴 Sobrecarga detectada: ${d.cargaOperativa.toFixed(1)} hrs/día en funciones actuales</h4>
        <p>Estás excedido en <strong>${Math.abs(d.tiempoLibre).toFixed(1)}h</strong> de tu jornada (${pct.toFixed(0)}%). Todavía no hay tiempo libre para un proyecto nuevo.</p>
        <p><em>Sugerencia:</em> estandariza o delega algo de tu operación actual antes de programar entregables en el Gantt. Puedes seguir cargando el plan igual, pero tenlo en cuenta.</p>`;
    } else if (d.tiempoLibre === 0) {
      box.className = "status-box warning";
      box.innerHTML = `<h4>🟡 Capacidad al 100%: ${d.jornada.toFixed(1)} hrs/día ocupadas</h4><p>No te queda margen para el proyecto sin hacer horas extra.</p>`;
    } else {
      box.className = "status-box success";
      box.innerHTML = `
        <h4>🟢 Tiempo libre disponible: ${d.tiempoLibre.toFixed(1)} hrs/día para el proyecto</h4>
        <p>Tu carga operativa actual es de ${d.cargaOperativa.toFixed(1)}h (${pct.toFixed(0)}% de tu jornada).</p>
        <p>👉 Vas a ver esta cifra como referencia en cada tarea del Gantt para estimar cuántos días hábiles necesita.</p>`;
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
      <td><button type="button" class="btn-icon" aria-label="Eliminar tarea">🗑️</button></td>`;
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
      .map(t => ({
        ...t,
        _inicioPlan: t.fecha_inicio_plan ? new Date(t.fecha_inicio_plan + "T00:00:00") : null,
        _finPlan: t.fecha_fin_plan ? new Date(t.fecha_fin_plan + "T00:00:00") : null,
        _inicioReal: t.fecha_inicio_real ? new Date(t.fecha_inicio_real + "T00:00:00") : null,
        _finReal: t.fecha_fin_real ? new Date(t.fecha_fin_real + "T00:00:00") : null
      }))
      .filter(t => t._inicioPlan && t._finPlan && !isNaN(t._inicioPlan) && !isNaN(t._finPlan) && t._finPlan >= t._inicioPlan);

    if (!validas.length && !tareasHabituales.length) {
      return '<p class="gantt-empty">Agrega tareas del proyecto con fechas (pestaña Tabla) o funciones habituales (Paso 1) para ver el Gantt.</p>';
    }

    const allDates = [];
    validas.forEach(t => {
      allDates.push(t._inicioPlan, t._finPlan);
      if (t._inicioReal && !isNaN(t._inicioReal)) allDates.push(t._inicioReal);
      if (t._finReal && !isNaN(t._finReal)) allDates.push(t._finReal);
    });
    const min = allDates.length ? new Date(Math.min(...allDates)) : null;
    const max = allDates.length ? new Date(Math.max(...allDates)) : null;
    const rangeMs = min && max ? Math.max(max - min, 24 * 60 * 60 * 1000) : null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayPct = min && today >= min && today <= max ? ((today - min) / rangeMs) * 100 : null;

    let html = "";

    if (tareasHabituales.length) {
      html += `<div class="gantt-operacion-section"><p class="gantt-section-title">🔵 Operación base (funciones habituales)</p>`;
      html += tareasHabituales.map(t => `
        <div class="gantt-band-row">
          <div class="gantt-row-label"><span class="id">${t.horas_dia.toFixed(1)}h/día</span>${escHtml(t.nombre || "(sin nombre)")}</div>
          <div class="gantt-band">Carga recurrente${t.tipo === "Repetitiva" ? ` — ${t.cantidad}× ${t.minutos_por_unidad}min` : " — tiempo fijo"}</div>
        </div>`).join("");
      html += `</div>`;
    }

    if (validas.length) {
      html += `<p class="gantt-section-title">🟢 Proyecto</p>`;
      html += `<div class="gantt-range">Del ${fmtFecha(min)} al ${fmtFecha(max)}${todayPct !== null ? " · línea roja = hoy" : ""}</div>`;
      html += validas.map(t => {
        const estado = t.estado || "No Iniciado";
        const avance = Math.min(100, Math.max(0, Number(t.porcentaje_avance) || 0));
        const leftPlan = ((t._inicioPlan - min) / rangeMs) * 100;
        const widthPlan = Math.max(((t._finPlan - t._inicioPlan) / rangeMs) * 100, 2);

        let realRow = "";
        if (t._inicioReal && t._finReal && !isNaN(t._inicioReal) && !isNaN(t._finReal) && t._finReal >= t._inicioReal) {
          const leftReal = ((t._inicioReal - min) / rangeMs) * 100;
          const widthReal = Math.max(((t._finReal - t._inicioReal) / rangeMs) * 100, 2);
          const diffDays = Math.round((t._finReal - t._finPlan) / 86400000);
          const variance = diffDays > 0 ? "tarde" : diffDays < 0 ? "temprano" : "ok";
          const varLabel = diffDays > 0 ? `🔴 +${diffDays}d` : diffDays < 0 ? `🟢 ${diffDays}d` : "⚪ en fecha";
          realRow = `
            <div class="gantt-subrow">
              <span class="gantt-subrow-label">Real</span>
              <div class="gantt-track gantt-track--real">
                <div class="gantt-bar" data-variance="${variance}" style="left:${leftReal.toFixed(2)}%;width:${widthReal.toFixed(2)}%" title="${fmtFecha(t._inicioReal)} → ${fmtFecha(t._finReal)}"></div>
              </div>
              <span class="gantt-variance-badge" data-variance="${variance}">${varLabel}</span>
            </div>`;
        }

        return `
          <div class="gantt-task-group">
            <div class="gantt-task-title"><span class="id">${escHtml(t.id_tarea)}</span>${escHtml(t.simbolo_urgencia || "")} ${escHtml(t.nombre || "(sin nombre)")}</div>
            <div class="gantt-subrow">
              <span class="gantt-subrow-label">Plan</span>
              <div class="gantt-track gantt-track--plan">
                ${todayPct !== null ? `<div class="gantt-today" style="left:${todayPct.toFixed(2)}%"></div>` : ""}
                <div class="gantt-bar" data-estado="${escAttr(estado)}" style="left:${leftPlan.toFixed(2)}%;width:${widthPlan.toFixed(2)}%" title="${fmtFecha(t._inicioPlan)} → ${fmtFecha(t._finPlan)} · ${avance}%">
                  <div class="gantt-bar-fill" style="width:${avance}%"></div><span>${avance}%</span>
                </div>
              </div>
              <span></span>
            </div>
            ${realRow}
          </div>`;
      }).join("");
    } else if (tareasHabituales.length) {
      html += '<p class="gantt-empty">Agrega fechas a tus tareas del proyecto (pestaña Tabla) para verlas junto a tu operación base.</p>';
    }

    return html;
  }

  function kanbanMarkup(tasks) {
    if (!tasks.length) return '<p class="kanban-empty">Agrega tareas en la pestaña Tabla para ver el Kanban.</p>';
    return KANBAN_COLUMNAS.map(col => {
      const items = tasks.filter(t => (t.estado || "No Iniciado") === col);
      const cards = items.length
        ? items.map(t => `
            <div class="kanban-card" data-estado="${escAttr(col)}">
              <strong>${escHtml(t.simbolo_urgencia || "")} ${escHtml(t.id_tarea)} — ${escHtml(t.nombre || "(sin nombre)")}</strong>
              <div class="meta">${escHtml(t.encargado_proceso || "Sin encargado")} · ${Number(t.porcentaje_avance) || 0}% avance</div>
            </div>`).join("")
        : '<p class="kanban-empty">Sin tareas</p>';
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
    const tareas = readTareasHabituales().filter(t => t.nombre);
    const previas = new Map((state.seccion_3_compresion_proyecto.comparativo_automatizacion || []).map(p => [p.nombre, p.horas_automatizado]));
    container.innerHTML = "";
    tareas.forEach(t => {
      const prev = previas.get(t.nombre);
      const row = document.createElement("div");
      row.className = "row-card row-card--comparativo";
      row.dataset.nombre = t.nombre;
      row.dataset.horasManual = t.horas_dia;
      row.innerHTML = `
        <span class="comparativo-nombre">${escHtml(t.nombre)}</span>
        <span class="row-result">${t.horas_dia.toFixed(1)} h/día</span>
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
        ? '<p class="comparativo-empty">Carga cuánto tarda ahora cada tarea con tu solución (To-Be) para ver el comparativo.</p>'
        : '<p class="comparativo-empty">Todavía no hay tareas para comparar. Vuelve al <button type="button" class="btn-link" data-goto="1">Paso 1</button> y carga tus tareas habituales: son las mismas que se miden aquí.</p>';
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
        <span class="comparativo-pct${peor ? " comparativo-pct--peor" : ""}">⚡ ${peor ? "+" : "-"}${Math.abs(ahorroPct)}% de tiempo</span>
      </div>`;
    }).join("");

    const totalManual = datos.reduce((s, d) => s + d.manual, 0);
    const totalAuto = datos.reduce((s, d) => s + d.auto, 0);
    const cargaPrevia = totalManual * 22;
    const nuevaCarga = totalAuto * 22;
    const capacidadLiberada = cargaPrevia - nuevaCarga;
    if (impacto) {
      impacto.innerHTML = `
        <div class="impacto-card"><div class="value">${cargaPrevia.toFixed(0)}h</div><div class="label">Carga de trabajo previa (As-Is) / mes</div></div>
        <div class="impacto-card"><div class="value">${nuevaCarga.toFixed(0)}h</div><div class="label">Nueva carga estimada (To-Be) / mes</div></div>
        <div class="impacto-card impacto-card--liberada"><div class="value">${capacidadLiberada.toFixed(0)}h</div><div class="label">Capacidad liberada para tareas de mayor valor</div></div>
        <div class="impacto-card"><div class="value">${totalManual > 0 ? Math.round((capacidadLiberada / cargaPrevia) * 100) : 0}%</div><div class="label">Eficiencia ganada sobre la carga original</div></div>`;
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
    setIoStatus("Gantt descargado en CSV. Complétalo en Excel/Sheets y vuelve a cargarlo cuando quieras.");
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
        if (!lines.length) throw new Error("el archivo está vacío.");
        const headers = parseCsvLine(lines[0]).map(h => h.trim());
        const colIndex = {};
        GANTT_CSV_COLUMNS.forEach(c => {
          const idx = headers.findIndex(h => h.toLowerCase() === c.header.toLowerCase());
          if (idx >= 0) colIndex[c.field] = idx;
        });
        if (colIndex.nombre === undefined && colIndex.id_tarea === undefined) {
          throw new Error("no encontré las columnas esperadas (ID, Nombre, ...). Usa la plantilla descargada con \"Descargar Gantt (CSV para Excel)\".");
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
        setIoStatus(`Se cargaron ${nuevasFilas.length} tarea(s) desde el CSV, reemplazando la tabla anterior.`);
      } catch (e) {
        setIoStatus("⚠️ No se pudo leer el CSV: " + e.message);
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
  <p class="meta">Generado por AI Project Guide el ${fmtFecha(new Date())} · Archivo autocontenido, sin conexión a internet.</p>
  <h2>📊 Gantt (operación base + proyecto, plan vs. ejecución real)</h2>
  <div class="gantt-visual">${ganttMarkup(tasks, habituales)}</div>
  <h2>🗂️ Kanban</h2>
  <div class="kanban-board">${kanbanMarkup(tasks)}</div>
</body></html>`;
    downloadBlob(`gantt-kanban-${state.app_meta.id_expediente}.html`, html, "text/html");
    setIoStatus("Gantt/Kanban descargado.");
  }

  /* ------------------------------------------------------------------ SECCIÓN 2 */
  const PREGUNTAS_CLASIFICACION = [
    {
      id: "entregable", opciones: [
        { value: "documento", label: "Documento o Presentación", desc: "Reporte, resumen, propuesta, plantilla o diapositivas — ej. informe contable, manual de onboarding en RRHH." },
        { value: "datos", label: "Procesamiento de Datos", desc: "Extracción, validación, conciliación o clasificación de datos — ej. revisión de facturas, análisis de nómina, tablas dinámicas." },
        { value: "automatizacion", label: "Automatización o Script", desc: "Tarea repetitiva que conecta sistemas o ejecuta acciones — ej. envío masivo de correos, sincronización entre planillas y ERP." },
        { value: "agente", label: "Asistente Conversacional o Agente", desc: "Chatbot o flujo autónomo para responder dudas o ejecutar tareas — ej. atención a consultas internas, soporte a empleados o clientes." }
      ]
    },
    {
      id: "mapeo_proceso", opciones: [
        { value: "eventual", label: "Eventual o manual", desc: "Se hace de forma aislada cuando surge la necesidad." },
        { value: "fija", label: "Repetitiva con pasos fijos", desc: "Sigue una lista de verificación o instructivo paso a paso claro." },
        { value: "criterio", label: "Variable con criterio humano", desc: "Cada caso cambia y requiere revisar reglas o políticas de la empresa." },
        { value: "interdepartamental", label: "Flujo continuo interdepartamental", desc: "Involucra a varias personas o áreas y múltiples aprobaciones." }
      ]
    },
    {
      id: "nivel_logica", opciones: [
        { value: "minima", label: "Mínima (operativa)", desc: "Copiar, mover, formatear o calcular datos estandarizados." },
        { value: "interpretacion", label: "Interpretación de texto o documentos", desc: "Leer PDFs, correos, contratos o políticas para extraer lo relevante." },
        { value: "decision", label: "Toma de decisiones / reglas de negocio", desc: "Aplicar políticas (ej. aprobar/rechazar solicitudes, evaluar excepciones)." },
        { value: "razonamiento", label: "Razonamiento complejo", desc: "Comparar escenarios, proyectar estados financieros o planificar recursos." }
      ]
    },
    {
      id: "fuente_datos", opciones: [
        { value: "plantillas", label: "Plantillas o formularios estandarizados", desc: "Excel, Google Sheets, Forms." },
        { value: "desestructurados", label: "Documentos desestructurados", desc: "PDFs, escaneos, correos, chats o notas de voz." },
        { value: "sistemas", label: "Sistemas de la empresa", desc: "ERP, CRM, software de nómina, bases de datos o APIs." },
        { value: "mezcla", label: "Mezcla de fuentes", desc: "Múltiples fuentes desordenadas." }
      ]
    },
    {
      id: "confidencialidad", opciones: [
        { value: "bajo", label: "Uso interno / bajo riesgo", desc: "Formatos genéricos, minutas, redacción." },
        { value: "moderado", label: "Operativo / riesgo moderado", desc: "Requiere revisión humana antes de enviar o aplicar." },
        { value: "alto", label: "Financiero o RRHH / alto riesgo", desc: "Datos sensibles, nóminas, estados financieros o datos personales (requiere validación estricta y seguridad)." }
      ]
    }
  ];

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
    document.querySelectorAll("#panel-2 .level-picker[data-pregunta]").forEach(container => {
      const pregunta = PREGUNTAS_CLASIFICACION.find(p => p.id === container.dataset.pregunta);
      pregunta.opciones.forEach(op => {
        const opt = document.createElement("div");
        opt.className = "level-option";
        opt.setAttribute("role", "radio");
        opt.setAttribute("tabindex", "0");
        opt.setAttribute("aria-checked", "false");
        opt.dataset.valor = op.value;
        opt.innerHTML = `<strong>${escHtml(op.label)}</strong>${op.desc ? `<span>${escHtml(op.desc)}</span>` : ""}`;
        opt.addEventListener("click", () => seleccionarRespuesta(pregunta.id, op.value));
        opt.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); seleccionarRespuesta(pregunta.id, op.value); } });
        container.appendChild(opt);
      });
    });
    initEcosistema();
  }

  /* -------------------------------------------------- Evaluación de ecosistema (puntaje) */
  const PREGUNTAS_ECOSISTEMA = [
    {
      id: "eco_frecuencia", pregunta: "1. Frecuencia y naturaleza del proceso", opciones: [
        { value: "a", label: "Algo puntual, para mostrar una idea", puntos: 1 },
        { value: "b", label: "Se repite, pero necesita que alguien decida o intervenga", puntos: 2 },
        { value: "c", label: "Se repite siempre igual, con reglas fijas", puntos: 3 },
        { value: "d", label: "Es dinámico, de varios pasos, con decisiones autónomas", puntos: 4 }
      ]
    },
    {
      id: "eco_datos", pregunta: "2. Formato de los datos de entrada", opciones: [
        { value: "a", label: "Diapositivas, PDFs o notas de voz", puntos: 1 },
        { value: "b", label: "Planillas (Excel, CSV, Google Sheets)", puntos: 2 },
        { value: "c", label: "Formularios web, webhooks o archivos JSON/XML", puntos: 3 },
        { value: "d", label: "APIs REST, bases de datos o scraping web", puntos: 4 }
      ]
    },
    {
      id: "eco_ecosistema", pregunta: "3. Ecosistema tecnológico disponible", opciones: [
        { value: "a", label: "Solo herramientas de oficina (PowerPoint, Word)", puntos: 1 },
        { value: "b", label: "Scripts simples (Google Apps Script, VBA)", puntos: 2 },
        { value: "c", label: "Plataformas iPaaS (Make, Zapier, n8n) o Node.js/Python", puntos: 3 },
        { value: "d", label: "Servidores dedicados, contenedores o entorno cloud", puntos: 4 }
      ]
    },
    {
      id: "eco_tolerancia", pregunta: "4. Tolerancia al error", opciones: [
        { value: "a", label: "Indiferente, solo para visualizar", puntos: 1 },
        { value: "b", label: "Moderada — revisas los resultados antes de usarlos", puntos: 2 },
        { value: "c", label: "Baja — necesita reglas y validación estricta", puntos: 3 },
        { value: "d", label: "Cero tolerancia — ejecuta acciones directas en otros sistemas", puntos: 4 }
      ]
    },
    {
      id: "eco_complejidad", pregunta: "5. Complejidad de las tareas actuales", opciones: [
        { value: "a", label: "Estética o de presentación", puntos: 1 },
        { value: "b", label: "Manipulación o limpieza de datos", puntos: 2 },
        { value: "c", label: "Flujo de trabajo entre varios sistemas", puntos: 3 },
        { value: "d", label: "Acciones contextuales complejas", puntos: 4 }
      ]
    }
  ];

  function calcularNivelEcosistema(puntaje) {
    if (puntaje <= 8) return { tier: "Nivel 1", nombre: "Presentación o prototipo de concepto", recomendacion: "Un mockup en HTML/JS o una presentación dinámica alcanza para validar la idea antes de programar nada." };
    if (puntaje <= 13) return { tier: "Nivel 2", nombre: "Herramienta de uso manual", recomendacion: "Una app standalone (un solo HTML) o un script simple que procese datos localmente." };
    if (puntaje <= 17) return { tier: "Nivel 3", nombre: "Automatización de flujo de trabajo", recomendacion: "Conviene iPaaS (Make, n8n), Google Apps Script o Python con webhooks para sacarte de encima las tareas repetitivas." };
    return { tier: "Nivel 4", nombre: "Agente autónomo / multi-sistema", recomendacion: "Necesitas una arquitectura con manejo de estados, memoria de contexto y llamadas a herramientas (tool calling)." };
  }

  function initEcosistema() {
    const wrap = document.getElementById("ecoPreguntas");
    PREGUNTAS_ECOSISTEMA.forEach(pregunta => {
      const card = document.createElement("div");
      card.className = "eco-pregunta";
      card.innerHTML = `<p class="hint-title">${escHtml(pregunta.pregunta)}</p>`;
      const picker = document.createElement("div");
      picker.className = "level-picker level-picker--compact";
      picker.setAttribute("role", "radiogroup");
      picker.setAttribute("aria-label", pregunta.pregunta);
      picker.dataset.ecoId = pregunta.id;
      pregunta.opciones.forEach(op => {
        const opt = document.createElement("div");
        opt.className = "level-option";
        opt.setAttribute("role", "radio");
        opt.setAttribute("tabindex", "0");
        opt.setAttribute("aria-checked", "false");
        opt.dataset.valor = op.value;
        opt.innerHTML = `<strong>${escHtml(op.label)}</strong>`;
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
      box.innerHTML = `<p style="margin:0;color:var(--color-text-muted);">Responde las 5 preguntas para ver tu puntaje (${completas}/5).</p>`;
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
      box.innerHTML = `<p style="margin:0;color:var(--color-text-muted);">Responde las preguntas de arriba para ver tu recomendación.</p>`;
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
      <p><strong>Investigar con IA:</strong> ${escHtml(rec.investigar_con_ia)}</p>
      ${rec.advertencia_seguridad ? `<p style="color:var(--color-danger);margin-top:.5rem;">${escHtml(rec.advertencia_seguridad)}</p>` : ""}
      ${completas < 5 ? `<p style="margin-top:.5rem;font-size:.78rem;opacity:.75;">Basado en ${completas}/5 respuestas — completa todas para una recomendación más precisa.</p>` : ""}`;
    renderMatrizRiesgos(rec);
  }

  function renderMatrizRiesgos(rec) {
    const box = document.getElementById("matrizRiesgos");
    if (!box) return;
    if (!rec.requisitos || !rec.requisitos.length) { box.hidden = true; box.innerHTML = ""; return; }
    box.hidden = false;
    box.innerHTML = `
      <div class="riesgos-col">
        <p class="hint-title">✅ Requisitos previos</p>
        <ul class="hint-list">${rec.requisitos.map(x => `<li>${escHtml(x)}</li>`).join("")}</ul>
      </div>
      <div class="riesgos-col">
        <p class="hint-title">⚠️ Puntos a vigilar</p>
        <ul class="hint-list">${(rec.riesgos || []).map(x => `<li>${escHtml(x)}</li>`).join("")}</ul>
      </div>`;
  }

  function exportSkillsDictionary() {
    const cat = CONTENIDO.CATALOGO;
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
    setIoStatus("Catálogo descargado en Markdown.");
  }

  /* ------------------------------------------------------------------ SECCIÓN 3 */
  function initSeccion3() {
    const picker = document.getElementById("levelPicker");
    LEVELS.forEach(lv => {
      const opt = document.createElement("div");
      opt.className = "level-option";
      opt.setAttribute("role", "radio");
      opt.setAttribute("tabindex", "0");
      opt.setAttribute("aria-checked", "false");
      opt.dataset.level = lv.id;
      opt.innerHTML = `<strong>${lv.titulo}</strong><span>${lv.desc}</span>`;
      opt.addEventListener("click", () => selectLevel(lv.id));
      opt.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectLevel(lv.id); } });
      picker.appendChild(opt);
    });

    document.getElementById("btnExportSkills").addEventListener("click", exportSkillsDictionary);
    document.getElementById("btnCatalogoPdf").addEventListener("click", imprimirCatalogo);
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
    document.getElementById("levelWhy").textContent = lv ? `💡 ${lv.why}` : "";
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
      <td><button type="button" class="btn-icon" aria-label="Eliminar KPI">🗑️</button></td>`;
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
      <div class="summary-card"><div class="value">${horasMes.toFixed(1)}h</div><div class="label">Horas liberadas / mes</div></div>
      <div class="summary-card"><div class="value">${horasAnio.toFixed(0)}h</div><div class="label">Horas liberadas / año</div></div>
      <div class="summary-card"><div class="value">${dinero(horasMes * costo)}</div><div class="label">Retorno estimado / mes (USD)</div></div>
      <div class="summary-card summary-card--destacada"><div class="value">${dinero(horasAnio * costo)}</div><div class="label">Retorno estimado / año (USD)</div></div>`;
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
    btn.textContent = `⤵ Usar el ahorro del comparativo (${sugerido.toFixed(1)} h/semana)`;
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
      `# Resumen ejecutivo — ${s1.metadata_proceso.nombre_proceso || "(sin nombre)"}`,
      `**Departamento:** ${s1.metadata_proceso.departamento || "—"}  `,
      `**Tipo de desarrollo elegido:** ${s3.nivel_solucion || "—"}`,
      ""
    ];
    if (ent.tipo || ent.resultado) {
      md.push("## Qué se construyó",
        `- **Tipo de entregable:** ${ent.tipo || "—"}`,
        `- **Puesta en marcha:** ${ent.estado_ejecucion || "—"}`,
        ent.resultado ? `- **Resultado:** ${resumirEntregable(ent.resultado)}` : null,
        ent.notas_ejecucion ? `- **Notas de ejecución:** ${ent.notas_ejecucion}` : null,
        "");
    }
    if (imp.hayDatos) {
      md.push("## Impacto medido (antes vs. después)",
        `- **Carga original:** ${n1(imp.semanaAsIs)} h/semana en ${imp.filas.length} tarea(s).`,
        `- **Carga actual:** ${n1(imp.semanaToBe)} h/semana.`,
        `- **Ahorro:** ${n1(imp.ahorroSemana)} h/semana · ${n1(imp.ahorroMes)} h/mes · ${imp.ahorroAnio.toFixed(0)} h/año.`,
        `- **Eficiencia ganada:** ${Math.round(imp.pct)}%.`,
        imp.costoHora > 0 ? `- **Retorno estimado:** ${dinero(imp.ahorroUsdAnio)} USD/año (costo hora ${dinero(imp.costoHora)}).` : null,
        "",
        "| Tarea | Antes (h/sem) | Ahora (h/sem) | Ahorro |",
        "|---|---|---|---|",
        ...imp.filas.map(f => {
          const antes = f.horas_manual * DIAS_HABILES.semana;
          const ahora = f.horas_automatizado * DIAS_HABILES.semana;
          const pct = antes > 0 ? Math.round(((antes - ahora) / antes) * 100) : 0;
          return `| ${f.nombre} | ${n1(antes)} | ${n1(ahora)} | ${pct >= 0 ? "-" : "+"}${Math.abs(pct)}% |`;
        }),
        `\n_Base de cálculo: ${DIAS_HABILES.semana} días hábiles por semana, ${DIAS_HABILES.mes} por mes, ${DIAS_HABILES.anio} por año._`,
        "");
    }
    md.push(
      "## KPIs As-Is vs. To-Be",
      "| KPI | Unidad | As-Is | To-Be | Frecuencia |",
      "|---|---|---|---|---|",
      ...s3.kpis_y_metricas_clave.map(k => `| ${k.nombre_kpi} | ${k.unidad_medida} | ${k.valor_actual_as_is} | ${k.meta_esperada_to_be} | ${k.frecuencia_medicion} |`),
      "",
      "## ROI estimado",
      `- Ahorro potencial: ${s3.roi_estimado.potencial_ahorro_horas_mes} h/mes`,
      `- ROI estimado: $${s3.roi_estimado.roi_estimado_mensual_usd} USD/mes`,
      `- Tiempo estimado de implementación: ${s3.roi_estimado.tiempo_estimado_implementacion || "—"}`,
      "",
      "## Puntos de dolor",
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
    ["Validar que no se incluyó información confidencial", "Probar con datos sintéticos en sandbox", "Revisar permisos mínimos (least privilege)", "Definir rollback / mecanismo STOP", "Obtener aprobación del sponsor"].forEach(item => addRow("checklistRows", "tpl-checklist-row", { item }, () => { }));

    document.getElementById("btnFinalize").addEventListener("click", exportManualCompleto);

    document.getElementById("btnRoiDesdeComparativo").addEventListener("click", () => {
      const imp = calcularImpacto();
      setVal("s3_ahorro_horas", n1(imp.ahorroSemana));
      updateRoi();
      setIoStatus("Ahorro traído del comparativo. Puedes ajustarlo a mano si quieres ser más conservador.");
    });

    // El entregable y las dudas alimentan los dos prompts de cierre.
    ["s4_entregable_tipo", "s4_entregable_estado", "s4_entregable_resultado", "s4_entregable_notas"].forEach(id => {
      const el = document.getElementById(id);
      el.addEventListener("input", () => { renderConsultaDudas(); renderPresentacion(); });
      el.addEventListener("change", () => { renderConsultaDudas(); renderPresentacion(); });
    });
    document.getElementById("s4_dudas_detalle").addEventListener("input", renderConsultaDudas);
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
    cont.innerHTML = CONTENIDO.DUDAS_FRECUENTES.map(d => `
      <label class="idea-card" data-duda="${escAttr(d.id)}">
        <input type="checkbox" data-duda-check="${escAttr(d.id)}" />
        <span class="idea-texto"><strong>${escHtml(d.t)}</strong></span>
      </label>`).join("");
    cont.querySelectorAll("[data-duda-check]").forEach(chk => {
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
    dudas.detalle = val("s4_dudas_detalle");
    const marcadas = dudas.puntos_confusos || [];
    if (!marcadas.length && !dudas.detalle.trim()) {
      box.innerHTML = `<p class="hint-footnote" style="margin-top:.9rem">Marca al menos una casilla o escribe tu duda para que armemos la consulta.</p>`;
      return;
    }
    const yaEstaba = !!document.getElementById("promptDudas");
    if (!yaEstaba) {
      box.innerHTML = `
        <p class="hint-title" style="margin-top:1.1rem">Tu consulta, lista para pegar</p>
        <pre class="prompt-box" id="promptDudas"></pre>
        <div class="panel-actions" style="margin-top:.6rem; justify-content:flex-start; gap:.6rem;">
          <button type="button" class="btn-primary" id="btnCopiarDudas">📋 Copiar consulta</button>
          <button type="button" class="btn-secondary" id="btnDescargarDudas">⬇️ Descargar (.md)</button>
        </div>`;
      document.getElementById("btnCopiarDudas").addEventListener("click", () => copiarTexto(construirConsultaDudas(), "Consulta copiada. Pegala en tu asistente de IA."));
      document.getElementById("btnDescargarDudas").addEventListener("click", () => {
        downloadText(`consulta-dudas-${state.app_meta.id_expediente}.md`, construirConsultaDudas());
        setIoStatus("Consulta descargada.");
      });
    }
    document.getElementById("promptDudas").textContent = construirConsultaDudas();
  }

  function construirConsultaDudas() {
    const s1 = state.seccion_1_ordenar_trabajo.metadata_proceso;
    const s3 = state.seccion_3_compresion_proyecto;
    const ent = leerEntregable();
    const dudas = state.seccion_4_indicadores_desarrollo.dudas;
    const marcadas = CONTENIDO.DUDAS_FRECUENTES.filter(d => (dudas.puntos_confusos || []).includes(d.id));

    const L = [];
    L.push("Actúa como un mentor técnico que explica sin tecnicismos, como si fuera mi primer proyecto con IA.");
    L.push("");
    L.push("## Qué construí");
    L.push(`- Proceso: ${s1.nombre_proceso || "(sin nombre)"}`);
    if (s3.nivel_solucion) L.push(`- Tipo de desarrollo: ${s3.nivel_solucion}`);
    if (ent.tipo) L.push(`- Qué obtuve: ${ent.tipo}`);
    if (ent.estado_ejecucion) L.push(`- Cómo salió: ${ent.estado_ejecucion}`);
    if (ent.notas_ejecucion) L.push(`- Notas de ejecución: ${ent.notas_ejecucion}`);
    L.push("");
    if (ent.resultado) {
      L.push("## El resultado que tengo");
      L.push("```");
      L.push(ent.resultado);
      L.push("```");
      L.push("");
    } else {
      L.push("## El resultado que tengo");
      L.push("[PENDIENTE: pega aquí el script, el prompt o la plantilla sobre la que preguntas]");
      L.push("");
    }
    L.push("## Qué no me queda claro");
    marcadas.forEach(d => L.push(`- ${d.t}`));
    if (dudas.detalle.trim()) L.push(`- ${dudas.detalle.trim()}`);
    L.push("");
    L.push("## Cómo quiero que me respondas");
    L.push("- Explícamelo en lenguaje de oficina, sin jerga. Si usas un término técnico, defínelo en la misma línea.");
    L.push("- Usa un ejemplo concreto con datos inventados para que vea qué entra y qué sale.");
    L.push("- Si hay que cambiar algo, dime exactamente en qué parte y con qué lo reemplazo.");
    L.push("- No reescribas todo de cero: quiero entender lo que ya tengo funcionando.");
    L.push("- Si mi duda parte de un malentendido, corrígeme primero y después responde.");
    L.push("- Termina con una prueba concreta que pueda hacer yo para confirmar que entendí bien.");
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
    const pres = CONTENIDO.PRESENTACION;
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

    document.getElementById("btnCopiarPresentacion").addEventListener("click", () => copiarTexto(construirPromptPresentacion(), "Prompt de presentación copiado."));
    document.getElementById("btnDescargarPresentacion").addEventListener("click", () => {
      downloadText(`prompt-presentacion-${state.app_meta.id_expediente}.md`, construirPromptPresentacion());
      setIoStatus("Prompt de presentación descargado.");
    });
    renderPresentacion();
  }

  function renderPresentacion() {
    const cont = document.getElementById("presentacionMetricas");
    if (!cont) return;
    const imp = calcularImpacto();
    if (!imp.hayDatos) {
      cont.innerHTML = `<p class="comparativo-empty" style="grid-column:1/-1">Todavía no hay números que mostrar: carga arriba cuánto tarda ahora cada tarea. El prompt se arma igual, pero con los tiempos en blanco.</p>`;
    } else {
      cont.innerHTML = `
        <div class="impacto-card"><div class="value">${n1(imp.semanaAsIs)}h</div><div class="label">Antes · por semana</div></div>
        <div class="impacto-card"><div class="value">${n1(imp.semanaToBe)}h</div><div class="label">Ahora · por semana</div></div>
        <div class="impacto-card impacto-card--liberada"><div class="value">${imp.ahorroAnio.toFixed(0)}h</div><div class="label">Horas liberadas al año</div></div>
        <div class="impacto-card"><div class="value">${Math.round(imp.pct)}%</div><div class="label">Eficiencia ganada</div></div>
        ${imp.costoHora > 0 ? `<div class="impacto-card impacto-card--liberada"><div class="value">${dinero(imp.ahorroUsdAnio)}</div><div class="label">Retorno estimado al año</div></div>` : ""}`;
    }
    const pres = asegurarCierreSeccion4().presentacion;
    const aud = (CONTENIDO.PRESENTACION.audiencias || []).find(a => a.id === pres.audiencia);
    const nota = document.getElementById("audienciaNota");
    if (nota) nota.textContent = aud ? aud.enfoque : "Elige a quién se lo vas a mostrar: cambia el énfasis del guion, no los números.";
    document.querySelectorAll("#audienciaPicker [data-valor]").forEach(o => o.setAttribute("aria-checked", o.dataset.valor === pres.audiencia ? "true" : "false"));
    document.querySelectorAll("#objetivoPicker [data-valor]").forEach(o => o.setAttribute("aria-checked", o.dataset.valor === pres.objetivo ? "true" : "false"));
    actualizarPromptPresentacion();
  }

  function actualizarPromptPresentacion() {
    const pre = document.getElementById("promptPresentacion");
    if (pre) pre.textContent = construirPromptPresentacion();
  }

  function construirPromptPresentacion() {
    const pres = CONTENIDO.PRESENTACION;
    if (!pres) return "";
    const meta = state.seccion_1_ordenar_trabajo.metadata_proceso;
    const s1 = state.seccion_1_ordenar_trabajo;
    const s3 = state.seccion_3_compresion_proyecto;
    const cfg = asegurarCierreSeccion4().presentacion;
    const ent = leerEntregable();
    const imp = calcularImpacto();
    const aud = pres.audiencias.find(a => a.id === cfg.audiencia);
    const obj = pres.objetivos.find(o => o.id === cfg.objetivo);
    const dolores = (s1.puntos_de_dolor || []).filter(d => d.descripcion);
    const kpis = (s3.kpis_y_metricas_clave || []).filter(k => k.nombre_kpi);
    const controles = readRows("checklistRows", ["item", "completado"]).filter(c => c.item && c.completado);

    const L = [];
    L.push("# Prompt: presentación ejecutiva de 5 diapositivas");
    L.push("");
    L.push("Actúa como un Consultor Senior en Estrategia Digital y Comunicación Ejecutiva. Convierte la información de mi proyecto en el guion de una presentación de 5 diapositivas: puntual, visual y orientada a resultados de negocio.");
    L.push("");
    L.push("## A quién se lo voy a presentar");
    if (aud) { L.push(`${aud.nombre}. ${aud.enfoque}`); L.push(aud.pide); }
    else L.push("[PENDIENTE: elige la audiencia — jefatura, equipo, comité o cliente interno]");
    L.push("");
    L.push("## Qué quiero conseguir");
    if (obj) L.push(`${obj.nombre}. ${obj.pide}`);
    else L.push("[PENDIENTE: elige el objetivo — escalar, consolidar el piloto, pedir recursos o compartir el aprendizaje]");
    L.push("");
    L.push("## Datos del proyecto");
    L.push(`- Proyecto / proceso: ${meta.nombre_proceso || "[PENDIENTE]"}`);
    if (meta.departamento) L.push(`- Área: ${meta.departamento}`);
    if (meta.responsable_proceso) L.push(`- Responsable: ${meta.responsable_proceso}`);
    if (s3.nivel_solucion) L.push(`- Tipo de desarrollo elegido: ${s3.nivel_solucion}`);
    if (ent.tipo) L.push(`- Qué se construyó: ${ent.tipo}`);
    if (ent.resultado) L.push(`- Descripción del entregable: ${resumirEntregable(ent.resultado)}`);
    if (ent.estado_ejecucion) L.push(`- Cómo salió la puesta en marcha: ${ent.estado_ejecucion}`);
    if (ent.notas_ejecucion) L.push(`- Notas de ejecución: ${ent.notas_ejecucion}`);
    L.push("");
    L.push("## Punto de partida y resultado medido");
    if (imp.hayDatos) {
      L.push(`- Carga original: ${n1(imp.semanaAsIs)} h/semana repartidas en ${imp.filas.length} tarea(s) habitual(es).`);
      L.push(`- Carga actual con la solución: ${n1(imp.semanaToBe)} h/semana.`);
      L.push(`- Ahorro: ${n1(imp.ahorroSemana)} h/semana · ${n1(imp.ahorroMes)} h/mes · ${imp.ahorroAnio.toFixed(0)} h/año.`);
      L.push(`- Eficiencia ganada: ${Math.round(imp.pct)}% del tiempo que consumía el proceso.`);
      if (imp.costoHora > 0) L.push(`- Retorno económico estimado: ${dinero(imp.ahorroUsdAnio)} USD al año (costo hora de referencia: ${dinero(imp.costoHora)}).`);
      L.push("- Detalle por tarea (horas por semana, antes → ahora):");
      imp.filas.forEach(f => {
        const antes = f.horas_manual * DIAS_HABILES.semana;
        const ahora = f.horas_automatizado * DIAS_HABILES.semana;
        const pct = antes > 0 ? Math.round(((antes - ahora) / antes) * 100) : 0;
        L.push(`  - ${f.nombre}: ${n1(antes)} h → ${n1(ahora)} h (${pct >= 0 ? "-" : "+"}${Math.abs(pct)}%)`);
      });
      L.push(`- Base de cálculo: ${DIAS_HABILES.semana} días hábiles por semana, ${DIAS_HABILES.mes} por mes, ${DIAS_HABILES.anio} por año.`);
    } else {
      L.push("- [PENDIENTE: todavía no cargué el contraste de horas antes/después en la guía]");
    }
    if (dolores.length) {
      L.push("- Problemas que motivaron el proyecto:");
      dolores.forEach(d => L.push(`  - [${d.nivel_severidad || "—"}] ${d.categoria || ""}: ${d.descripcion}`));
    }
    if (kpis.length) {
      L.push("- Métricas comprometidas:");
      kpis.forEach(k => L.push(`  - ${k.nombre_kpi}: ${k.valor_actual_as_is} → ${k.meta_esperada_to_be} ${k.unidad_medida || ""} (medición ${k.frecuencia_medicion || "—"})`));
    }
    if (controles.length) {
      L.push("- Controles de calidad y seguridad ya validados:");
      controles.forEach(c => L.push(`  - ${c.item}`));
    }
    const sponsor = val("s4_sponsor"), fecha = val("s4_fecha_revision");
    if (sponsor) L.push(`- Sponsor que aprueba: ${sponsor}`);
    if (fecha) L.push(`- Revisión de resultados prevista: ${fecha}`);
    L.push("");
    L.push("## Formato de cada diapositiva");
    L.push("1. **Título impactante:** máximo 6 palabras.");
    L.push("2. **Hasta 3 viñetas:** máximo 2 líneas cada una, directas al grano.");
    L.push("3. **Una métrica protagonista:** una sola cifra en caja destacada.");
    L.push("4. **Nota del orador:** una frase corta con lo que digo en voz alta.");
    L.push("");
    L.push("## Las 5 diapositivas");
    pres.slides.forEach(sl => L.push(`${sl.n}. ${sl.icono} **${sl.titulo}** — ${sl.enfoque}`));
    L.push("");
    L.push("## Estilo visual");
    pres.estilo.forEach(x => L.push(`- ${x}`));
    if (cfg.incluir_logo) {
      L.push("- Reserva un espacio libre para el logo de mi empresa en la esquina superior derecha de cada diapositiva. No inventes ni describas un logo: solo deja el lugar.");
    }
    L.push("");
    L.push("## Reglas");
    L.push("- Tono profesional, moderno y directo. Sin relleno: nada de «es importante destacar» ni «en conclusión».");
    L.push("- No inventes datos. Si falta un número, escribe [PENDIENTE DE VALIDACIÓN] en su lugar.");
    L.push("- Los números son estimaciones internas de mi área: preséntalos como estimaciones, no como cifras auditadas.");
    L.push("- Entrega el guion en texto plano, listo para pegar en Gamma, Canva, Marp o PowerPoint.");
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
      else setIoStatus("⚠️ Tu navegador bloqueó el copiado: selecciona el texto del recuadro y cópialo a mano.");
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

    let guiaAvanzada = "";

    if (s3.nivel_solucion.includes("Nivel 1")) {
      guiaAvanzada = `
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>Arquitectura y Conceptos Básicos</strong></p>
          <p style="font-size: .85rem; color: var(--color-text);">Para este nivel, el enfoque es conversacional (Chat). La IA actúa como un analista o revisor. No necesitas integraciones técnicas complejas, simplemente debes proporcionar contexto claro y el borrador de lo que deseas mejorar.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>💡 Qué pedir a la IA para generar el material</strong></p>
          <ul class="hint-list">
            <li>Pide que te sugiera una estructura óptima para el tipo de documento o presentación (índice, capítulos).</li>
            <li>Define la <strong>audiencia</strong> (ej. directivos, clientes) y pídele que ajuste el tono y el vocabulario.</li>
            <li>Solicita una iteración tipo <em>Brainstorming</em> (lluvia de ideas guiada) antes de que la IA genere el contenido final estructurado.</li>
          </ul>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>⚠️ Prevenciones y Criterio</strong></p>
          <ul class="hint-list">
            <li><strong>Desarrollo del Criterio:</strong> No puedes desarrollar criterio si no lees y analizas las discrepancias en lo que la IA te responde. Revisa cuidadosamente cada respuesta, la IA es propensa a inventar datos que suenan convincentes.</li>
            <li><strong>Seguridad de Datos:</strong> Bajo ningún motivo incluyas datos confidenciales de la empresa (márgenes comerciales reales, balances puros, contraseñas) en la ventana de chat. Usa nombres inventados (datos sintéticos) como "Empresa X".</li>
            <li><strong>Convierte lo que funcionó en plantilla:</strong> cuando un documento te quede bien, guarda esas instrucciones como una <em>skill</em> reutilizable (instrucciones del sistema o proyecto) en vez de reescribirlas de memoria la próxima vez.</li>
          </ul>
        </div>
      `;
    } else if (s3.nivel_solucion.includes("Nivel 2")) {
      guiaAvanzada = `
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>Arquitectura y Conceptos Básicos</strong></p>
          <p style="font-size: .85rem; color: var(--color-text);">La IA actuará como tu desarrollador copiloto. Se trata de construir automatizaciones mediante código simple (ej. Macros, Python, Google Apps Script) en la cual la IA genera el código y tú lo pruebas y pones en funcionamiento en un sistema tradicional.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>💡 Qué pedir a la IA para tu Prompt</strong></p>
          <ul class="hint-list">
            <li>Pídele que diseñe pequeños <strong>bloques de código</strong> ("funciones") que hagan una sola cosa a la vez (Divide y Vencerás). No pidas el sistema completo en tu primer mensaje.</li>
            <li>Solicita que el código esté abundantemente <strong>comentado</strong>. Si no entiendes qué hace una línea crucial, exígele que te la explique con metáforas simples antes de ejecutarla.</li>
          </ul>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>⚠️ Prevenciones y Criterio</strong></p>
          <ul class="hint-list">
            <li><strong>Ahorro de Tokens y Contexto:</strong> No envíes sábanas de código gigantes si sabes que el error está en una sola línea. Al aislar las secciones, liberas tokens y reduces confusión.</li>
            <li><strong>Test de Código:</strong> Prueba cada paso (Unit Test manual) usando planillas y variables de prueba (sandbox). <em>Nunca ejecutes un código nuevo directamente sobre bases de datos o sistemas de producción reales</em>.</li>
            <li><strong>Formar el Criterio:</strong> Al usar la IA para depurar (debugging), no copies/pegues los errores ciegamente; reflexiona con la herramienta. Así formarás tu intuición algorítmica sobre por qué fallan ciertas cosas.</li>
          </ul>
        </div>
      `;
    } else if (s3.nivel_solucion.includes("Nivel 3")) {
      guiaAvanzada = `
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>Arquitectura y Conceptos Básicos</strong></p>
          <p style="font-size: .85rem; color: var(--color-text);">La IA actúa aquí como diseñadora de herramientas. Vas a construir una utilidad que otras personas usan sin saber qué hay debajo: un archivo HTML/JS local que abre con doble clic, un libro de Excel con botones o un panel de indicadores. La lógica deja de vivir en una conversación y pasa a vivir dentro de la herramienta, que siempre calcula igual.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>💡 Qué pedir a la IA para tu Prompt</strong></p>
          <ul class="hint-list">
            <li>Exige un <strong>único archivo autocontenido</strong>, sin instalaciones ni dependencias de internet: en muchas oficinas no vas a poder instalar nada ni abrir puertos.</li>
            <li>Define de entrada los <strong>3 a 5 indicadores</strong> que van arriba y bien visibles; el resto es detalle secundario.</li>
            <li>Pide que <strong>valide lo que carga el usuario</strong> (campos vacíos, fechas mal escritas, duplicados) y que avise con un mensaje claro en vez de mostrar un resultado equivocado.</li>
            <li>Solicita que te señale <strong>exactamente dónde tocar</strong> para cambiar una fórmula o un umbral, para no depender de la IA cada vez que cambie una regla.</li>
            <li>Si algún paso de la herramienta implica análisis con IA, pídele que ese paso quede como <strong>plantilla de instrucciones fija</strong> (una skill), con formato de salida exacto, en lugar de redactarlo distinto cada vez.</li>
          </ul>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>⚠️ Prevenciones y Criterio</strong></p>
          <ul class="hint-list">
            <li><strong>Datos dentro del archivo:</strong> si vas a compartir la herramienta, revisa que no lleve datos reales pegados adentro. Distribúyela vacía y que cada quien cargue su propio archivo.</li>
            <li><strong>Prueba con casos límite:</strong> cero registros, un registro, valores negativos y textos donde esperabas números. Una herramienta que se rompe delante de tu jefe pierde toda credibilidad.</li>
            <li><strong>Formar el criterio:</strong> pídele que te explique la fórmula en palabras y verifícala a mano con un caso que ya conozcas. Si el número no coincide con tu cálculo manual, el error está en la regla, no en quien la usa.</li>
          </ul>
        </div>
      `;
    } else if (s3.nivel_solucion.includes("Nivel 4")) {
      guiaAvanzada = `
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>Arquitectura y Conceptos Básicos</strong></p>
          <p style="font-size: .85rem; color: var(--color-text);">Implementación de Agentes Autónomos integrados con herramientas (MCP, APIs, Plugins directos). La IA actuará como orquestador cognitivo: lee opciones, genera su propio razonamiento interno, llama a los sistemas para extraer datos u operar, e interactúa con el usuario final de manera independiente (Agentic Workflow). Requiere profunda gobernanza.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>💡 Qué pedir a la IA al planificar</strong></p>
          <ul class="hint-list">
            <li>Pídele a la IA en tu iteración inicial que actúe como un arquitecto enterprise: que diagrame y audite la arquitectura modular detallando cada componente y herramienta externa requerida (bases de datos a afectar, APIs a llamar).</li>
            <li>Solicita la generación de instrucciones de "Self-Correction" y mecanismos de <em>Escalamiento Humano</em>, forzando a la autonomía a detenerse y generar un trigger si detecta un margen de incertidumbre no mapeado.</li>
          </ul>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>⚠️ Prevenciones y Criterio Estricto</strong></p>
          <ul class="hint-list">
            <li><strong>Micro-Gestión a Macro-Gestión:</strong> Formarte un criterio como orquestador en este nivel implica entender los patrones de fallos, y no operar los flujos por tu cuenta. Se requiere delegar basándote en los reportes del agente, pero supervisando la métrica real.</li>
            <li><strong>Límites y Consumo (Cortocircuitos):</strong> Un agente atascado puede entrar en un <em>loop o bucle</em> infinito que quema la cuota de tokens. Debes forzar logs robustos y fijar topes duros de intentos antes de un apagado preventivo (Kill Switch).</li>
            <li><strong>Least Privilege y Aprobación:</strong> Nunca expongas la mutación de bases de datos críticas sin un middleware de aprobación humana incrustado en el flujo (Human-in-the-Loop) como norma absoluta para este tipo de pilotos iniciales.</li>
          </ul>
        </div>
      `;
    }

    let html = `<h4>Comprensión Estratégica del Nivel de Solución</h4>`;
    html += `<p style="margin-bottom: 1rem; font-size: 0.85rem; color: var(--color-text-muted);">
      Proceso: <strong>${escHtml(s1.nombre_proceso || 'tu proceso')}</strong> <br> Recomendación detectada: <strong>${escHtml(s2.nombre_tecnico || 'esperando datos de la Etapa 2')}</strong>.
    </p>`;
    html += guiaAvanzada;

    document.getElementById("guiaDesarrollo").innerHTML = html;
  }

  /* ---------------- Galería de ideas y sugerencias (Sección 3) ---------------- */
  const CONTENIDO = Object.assign(
    { SUGERENCIAS: {}, IA_GUIA: [], CATALOGO: null, DUDAS_FRECUENTES: [], PRESENTACION: { audiencias: [], objetivos: [], estilo: [], slides: [] } },
    window.AIPG_CONTENT || {}
  );

  function sugerenciasDelNivel() {
    return CONTENIDO.SUGERENCIAS[claveNivel(state.seccion_3_compresion_proyecto.nivel_solucion)] || null;
  }

  function renderGaleriaIdeas() {
    const box = document.getElementById("galeriaIdeas");
    if (!box) return;
    const data = sugerenciasDelNivel();
    if (!data) {
      box.innerHTML = `<p style="margin:0;color:var(--color-text-muted);font-size:.85rem;">Selecciona un tipo de desarrollo para ver las ideas sugeridas.</p>`;
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
        ${bloque("💡 Construcción y estrategia", data.estrategia)}
        ${bloque("🛠️ Recursos y enfoque técnico", data.recursos)}
      </div>
      <p class="hint-title" style="margin-top:1.1rem">Elige las ideas que se parezcan a lo que necesitas</p>
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
    el.textContent = n === 0
      ? "Ninguna idea marcada todavía — el prompt saldrá más genérico."
      : `${n} idea${n === 1 ? "" : "s"} marcada${n === 1 ? "" : "s"}: van a entrar en el prompt maestro.`;
  }

  /* ---------------- Lanzador de prompt y selección de IA ---------------- */
  function renderPromptLauncher() {
    const box = document.getElementById("promptLauncher");
    if (!box) return;
    const data = sugerenciasDelNivel();
    if (!data) {
      box.innerHTML = `<p style="margin:0;color:var(--color-text-muted);font-size:.85rem;">Disponible en cuanto selecciones un tipo de desarrollo.</p>`;
      return;
    }
    const s3 = state.seccion_3_compresion_proyecto;
    const nivel = claveNivel(s3.nivel_solucion);
    const iaElegida = s3.ia_preferida;

    box.innerHTML = `
      <p class="hint-title">1 · Elige tu asistente de IA</p>
      <div class="level-picker level-picker--compact" id="iaPicker" role="radiogroup" aria-label="Asistente de IA">
        ${CONTENIDO.IA_GUIA.map(ia => `
          <div class="level-option" role="radio" tabindex="0" aria-checked="${ia.id === iaElegida ? "true" : "false"}" data-ia="${escAttr(ia.id)}">
            <strong>${escHtml(ia.nombre)}${ia.ideal.includes(nivel) ? ' <span class="ia-badge">sugerida</span>' : ""}</strong>
          </div>`).join("")}
      </div>
      <p class="ia-fortaleza" id="iaFortaleza"></p>
      <p class="hint-title" style="margin-top:1.1rem">2 · Copia tu prompt maestro</p>
      <pre class="prompt-box" id="promptMaestro"></pre>
      <div class="panel-actions" style="margin-top:.6rem; justify-content:flex-start; gap:.6rem;">
        <button type="button" class="btn-primary" id="btnCopiarPrompt">📋 Copiar prompt maestro</button>
        <button type="button" class="btn-secondary" id="btnDescargarPrompt">⬇️ Descargar prompt (.md)</button>
      </div>
      <p class="hint-footnote" style="margin-top:.6rem">🛡️ Antes de pegarlo: revisa que no lleve nombres de clientes,
        cifras confidenciales ni credenciales. Generaliza o usa datos inventados.</p>`;

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
      setIoStatus("Prompt maestro descargado.");
    });
    actualizarPromptMaestro();
  }

  function actualizarPromptMaestro() {
    const pre = document.getElementById("promptMaestro");
    if (pre) pre.textContent = construirPromptMaestro();
    const ia = CONTENIDO.IA_GUIA.find(x => x.id === state.seccion_3_compresion_proyecto.ia_preferida);
    const nota = document.getElementById("iaFortaleza");
    if (nota) nota.textContent = ia
      ? `${ia.nombre}: ${ia.fortaleza}`
      : "Elige un asistente para ver su punto fuerte — el prompt funciona igual en cualquiera de ellos.";
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
    const ia = CONTENIDO.IA_GUIA.find(x => x.id === s3.ia_preferida);
    const dolores = (s1.puntos_de_dolor || []).filter(d => d.descripcion);

    const L = [];
    L.push(`Actúa como ${data.prompt.rol}.`);
    L.push("");
    L.push("## Contexto de mi trabajo");
    L.push(`- Proceso: ${meta.nombre_proceso || "(pendiente de completar en la Sección 1)"}`);
    if (meta.departamento) L.push(`- Área: ${meta.departamento}`);
    const entradas = normalizarMapeo(s1.mapeo_entradas_salidas.entradas);
    const salidas = normalizarMapeo(s1.mapeo_entradas_salidas.salidas);
    if (entradas.length) {
      L.push("- Entradas con las que trabajo:");
      entradas.forEach(e => L.push(`  - ${describirMapeo(e, "entrada")}`));
    }
    if (salidas.length) {
      L.push("- Salidas que se esperan de mí:");
      salidas.forEach(x => L.push(`  - ${describirMapeo(x, "salida")}`));
    }
    if (dolores.length) {
      L.push("- Principales problemas actuales:");
      dolores.forEach(d => L.push(`  - [${d.nivel_severidad || "—"}] ${d.categoria || ""}: ${d.descripcion}`));
    }
    if (rec.nombre_tecnico) L.push(`- Recomendación técnica del diagnóstico previo: ${rec.nombre_tecnico}`);
    L.push(`- Tipo de desarrollo elegido: ${s3.nivel_solucion} (${data.etiqueta})`);
    L.push("");
    L.push("## Lo que necesito");
    L.push(data.prompt.encargo);
    L.push("");
    if (ideas.length) {
      L.push("## Ideas que quiero incorporar");
      ideas.forEach(i => L.push(`- **${i.t}**: ${i.d}`));
      L.push("");
    }
    L.push("## Cómo quiero que trabajes");
    L.push(data.prompt.exigencia);
    L.push("- Antes de producir nada, hazme las preguntas que te falten. No inventes datos que no te di.");
    L.push("- Marca con [PENDIENTE DE VALIDACIÓN] cualquier supuesto que hayas tenido que asumir.");
    L.push("- Trabajo con datos generalizados o sintéticos: no voy a compartir información confidencial, credenciales ni datos personales reales.");
    L.push("- Explícame las decisiones en lenguaje sencillo: necesito poder defender esto ante mi equipo.");
    if (ia) {
      L.push("");
      L.push(`> Preparado para ${ia.nombre} — ${ia.fortaleza}`);
    }
    return L.join("\n");
  }

  function copiarPromptMaestro() {
    // copiarTexto() cae a execCommand porque con file:// algunos navegadores
    // bloquean la Clipboard API.
    copiarTexto(construirPromptMaestro(), "Prompt maestro copiado. Pégalo en tu asistente de IA.");
  }

  /* ---------------- Catálogo de recursos: documento imprimible (PDF) ---------------- */
  function refGlosario(n) {
    return n ? ` <sup class="doc-ref">glosario #${n}</sup>` : "";
  }

  function renderDocCatalogo() {
    const cat = CONTENIDO.CATALOGO;
    const cont = document.getElementById("docCatalogo");
    if (!cat || !cont) return;
    const meta = state.seccion_1_ordenar_trabajo.metadata_proceso;
    const hoy = new Date().toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" });

    const portada = `
      <header class="doc-portada">
        <div class="doc-portada-texto">
          <p class="doc-kicker">AI Project Guide · Documento de consulta</p>
          <h1>${escHtml(cat.titulo)}</h1>
          <p class="doc-bajada">${escHtml(cat.bajada)}</p>
          <dl class="doc-meta">
            <div><dt>Proyecto</dt><dd>${escHtml(meta.nombre_proceso || "—")}</dd></div>
            <div><dt>Área</dt><dd>${escHtml(meta.departamento || "—")}</dd></div>
            <div><dt>Responsable</dt><dd>${escHtml(meta.responsable_proceso || "—")}</dd></div>
            <div><dt>Expediente</dt><dd>${escHtml(state.app_meta.id_expediente)}</dd></div>
            <div><dt>Generado</dt><dd>${escHtml(hoy)}</dd></div>
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
        <h2><span class="doc-num">2</span> Catálogo de recursos por área</h2>
        ${cat.areas.map(a => `
          <article class="doc-area">
            <h3>Área ${a.n} · ${escHtml(a.titulo)}</h3>
            <p class="doc-area-desc">${escHtml(a.descripcion)}</p>
            <p class="doc-area-valor"><strong>Valor para tu proyecto:</strong> ${escHtml(a.valor)}</p>
            <table class="doc-tabla">
              <thead>
                <tr><th>Skill / Recurso</th><th>Para qué sirve</th><th>Qué necesita (input)</th><th>Qué te devuelve (output)</th></tr>
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
        <h2><span class="doc-num">3</span> Gobernanza digital en la empresa</h2>
        <ol class="doc-gobernanza">
          ${cat.gobernanza.map(g => `<li><strong>${escHtml(g.t)}:</strong> ${escHtml(g.d)}</li>`).join("")}
        </ol>
      </section>`;

    const glosario = `
      <section class="doc-seccion doc-seccion--glosario">
        <h2><span class="doc-num">4</span> Glosario en lenguaje de oficina</h2>
        <div class="doc-glosario">
          ${cat.glosario.map(g => `
            <article class="doc-termino">
              <h3><span class="doc-termino-num">${g.n}</span> ${escHtml(g.termino)}</h3>
              <p><strong>¿Qué es?</strong> ${escHtml(g.que)}</p>
              <p><strong>¿Para qué sirve?</strong> ${escHtml(g.para)}</p>
              <p class="doc-ejemplo"><strong>Ejemplo de oficina:</strong> ${escHtml(g.ej)}</p>
            </article>`).join("")}
        </div>
      </section>`;

    cont.innerHTML = portada + esquema + areas + gobernanza + glosario +
      `<footer class="doc-pie">AI Project Guide · Documento generado en tu navegador, sin enviar datos a ningún servidor.</footer>`;
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
    setIoStatus("En el diálogo de impresión elige «Guardar como PDF» y activa «Gráficos de fondo».");
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
    setIoStatus("Plan de proyecto descargado.");
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

    const s4 = state.seccion_4_indicadores_desarrollo;
    document.getElementById("checklistRows").innerHTML = "";
    (s4.plan_gestion_cambio.checklist.length ? s4.plan_gestion_cambio.checklist : []).forEach(c => addRow("checklistRows", "tpl-checklist-row", c, () => { }));
    setVal("s4_sponsor", s4.plan_gestion_cambio.responsable_sponsor);
    setVal("s4_fecha_revision", s4.plan_gestion_cambio.fecha_revision_piloto);

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
    renderConsultaDudas();

    document.getElementById("s4_pres_logo").checked = !!s4.presentacion.incluir_logo;
    renderPresentacion();

    goToStep(state.app_meta.etapa_actual || 1);
    setIoStatus(`Expediente ${state.app_meta.id_expediente} cargado — tu avance fue restaurado.`);
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
        if (!data.schema_version) throw new Error("El archivo no tiene schema_version.");
        hydrateState(data);
      } catch (e) {
        setIoStatus("⚠️ No se pudo cargar el archivo: " + e.message);
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
      setIoStatus("Expediente guardado correctamente. Puedes volver a cargarlo cuando gustes.");
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
    goToStep(1);
    window.addEventListener("resize", actualizarScrollTabla);
    document.querySelector("#view-tabla .table-scroll").addEventListener("scroll", actualizarScrollTabla);
    actualizarScrollTabla();
  });
})();
