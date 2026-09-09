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
      { id: "00-core", nombre: "Núcleo del proceso", skills: [
        { id: "project-intake", nombre: "Project Intake", proposito: "Convierte una idea en objetivo, problema, alcance y preguntas pendientes.", momento: "Etapa 1" },
        { id: "phase-gate", nombre: "Phase Gate", proposito: "Controla qué requisitos deben estar completos para pasar de etapa.", momento: "Todas" },
        { id: "project-export-import", nombre: "Project Export/Import", proposito: "Exporta/importa el expediente portable y reanuda desde la última etapa.", momento: "Todas" }
      ]},
      { id: "01-planning", nombre: "Planificación", skills: [
        { id: "capacity-planner", nombre: "Capacity Planner", proposito: "Calcula capacidad laboral real y distribuye horas (regla 80/20).", momento: "Etapa 1" },
        { id: "gantt-generator", nombre: "Gantt Generator", proposito: "Crea Gantt a partir de tareas, dependencias, esfuerzo y capacidad.", momento: "Etapa 1-2" },
        { id: "kanban-generator", nombre: "Kanban Generator", proposito: "Crea Kanban con WIP, prioridad y dependencias.", momento: "Etapa 1-2" }
      ]},
      { id: "02-research", nombre: "Investigación", skills: [
        { id: "research-plan", nombre: "Research Plan", proposito: "Convierte vacíos de información en preguntas, fuentes y entregables.", momento: "Etapa 1" },
        { id: "google-research", nombre: "Google Research", proposito: "Guía la investigación con Drive, Docs, Sheets y recursos Google.", momento: "Etapa 2" }
      ]},
      { id: "03-architecture", nombre: "Arquitectura de solución", skills: [
        { id: "solution-assessment", nombre: "Solution Assessment", proposito: "Compara automatización, script, aplicación, datos e IA.", momento: "Etapa 2-3" },
        { id: "google-solution-architect", nombre: "Google Solution Architect", proposito: "Diseña primero con Workspace cuando sea suficiente.", momento: "Etapa 3" },
        { id: "adr-writer", nombre: "ADR Writer", proposito: "Crea Architecture Decision Records.", momento: "Etapa 3" }
      ]},
      { id: "04-code", nombre: "Desarrollo", skills: [
        { id: "clean-code", nombre: "Clean Code", proposito: "Revisa nombres, responsabilidades, acoplamiento y duplicación.", momento: "Desarrollo" },
        { id: "tdd", nombre: "TDD", proposito: "Aplica RED-GREEN-REFACTOR.", momento: "Desarrollo" }
      ]},
      { id: "05-quality", nombre: "Calidad", skills: [
        { id: "webapp-e2e", nombre: "Webapp E2E", proposito: "Ejecuta smoke/E2E sobre los flujos críticos.", momento: "Validación" },
        { id: "verification-gate", nombre: "Verification Gate", proposito: "No declara terminado hasta disponer de evidencia.", momento: "Todas" }
      ]},
      { id: "06-security", nombre: "Seguridad", skills: [
        { id: "synthetic-data-guard", nombre: "Synthetic Data Guard", proposito: "Impide/advierte sobre datos confidenciales.", momento: "Todas" },
        { id: "secrets-audit", nombre: "Secrets Audit", proposito: "Busca secretos en archivos, logs y repositorio.", momento: "Antes de compartir/commit" }
      ]},
      { id: "07-knowledge", nombre: "Conocimiento", skills: [
        { id: "obsidian-vault-manager", nombre: "Obsidian Vault Manager", proposito: "Organiza conocimiento en Markdown con índices y enlaces.", momento: "Todas" }
      ]},
      { id: "08-docs", nombre: "Documentación y comunicación", skills: [
        { id: "sop-generator", nombre: "SOP Generator", proposito: "Genera SOP con marcadores [PENDIENTE DE VALIDACIÓN].", momento: "Final" },
        { id: "presentation-builder", nombre: "Presentation Builder", proposito: "Convierte el expediente validado en presentación ejecutiva.", momento: "Final" },
        { id: "validation-pack", nombre: "Validation Pack", proposito: "Crea checklist de aprobación empresarial.", momento: "Final" }
      ]},
      { id: "09-agent", nombre: "Autonomía (avanzado)", skills: [
        { id: "autonomy-readiness", nombre: "Autonomy Readiness", proposito: "Evalúa si una automatización puede pasar a agente/autónomo.", momento: "Avanzado" },
        { id: "human-in-loop", nombre: "Human in the Loop", proposito: "Fuerza aprobación humana para acciones sensibles.", momento: "Avanzado" },
        { id: "dry-run", nombre: "Dry Run", proposito: "Simula acciones antes de ejecutar.", momento: "Automatización" }
      ]},
      { id: "10-ops", nombre: "Operación", skills: [
        { id: "drive-archive", nombre: "Drive Archive", proposito: "Archiva entregables por proyecto, etapa y versión.", momento: "Todas" },
        { id: "release-checklist", nombre: "Release Checklist", proposito: "Checklist de versión, backup, pruebas y rollback.", momento: "Antes de producción" }
      ]},
      { id: "11-ux", nombre: "Experiencia de usuario", skills: [
        { id: "ux-clarity", nombre: "UX Clarity", proposito: "Revisa lenguaje, carga cognitiva, accesibilidad.", momento: "Portal y apps" }
      ]}
    ]
  };

  const LEVELS = [
    { id: "Nivel 1: Presentación / Documento de Asistencia", titulo: "Nivel 1 · Presentación / Documento", desc: "Resumen de actas, diapositivas automatizadas.", why: "Suficiente cuando el proceso es puntual y de bajo volumen: solo necesitas comunicar mejor, no automatizar." },
    { id: "Nivel 2: Herramienta / Script de Automatización Fija", titulo: "Nivel 2 · Automatización fija", desc: "Google Forms + Apps Script + Sheets.", why: "Ideal cuando el proceso ya está limpio y es repetitivo, pero sigue reglas fijas sin criterio subjetivo." },
    { id: "Nivel 3: Skill / Prompt Estructurado", titulo: "Nivel 3 · Skill / Prompt estructurado", desc: "Prompt reutilizable por el equipo vía Claude.", why: "Adecuado cuando hay tareas analíticas/creativas repetidas (resumir, redactar, clasificar texto)." },
    { id: "Nivel 4: Agente Autónomo / Multi-herramienta", titulo: "Nivel 4 · Agente autónomo", desc: "Sistema multi-herramienta para tareas complejas.", why: "Solo si ya existen datos estructurados, métricas y aprobación de seguridad. Requiere límites, logs y STOP." }
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
      seccion_3_compresion_proyecto: { nivel_solucion: "", tecnologias_sugeridas: [], kpis_y_metricas_clave: [], roi_estimado: { potencial_ahorro_horas_mes: 0, roi_estimado_mensual_usd: 0, tiempo_estimado_implementacion: "", requiere_aprobacion_seguridad: false }, comparativo_automatizacion: [] },
      seccion_4_indicadores_desarrollo: {
        skills_seleccionadas: [], diccionario_exportado_formato: "JSON",
        prompts_generados: [], plan_gestion_cambio: { checklist: [], responsable_sponsor: "", fecha_revision_piloto: "" }
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
      titulo: "Mide el retorno antes de construir",
      lede: "Clasifica el proyecto según su madurez y calcula el ahorro esperado, para poder defenderlo con números frente a dirección."
    },
    4: {
      titulo: "Lleva tu plan a Claude",
      lede: "Copia el prompt generado en Claude o Claude Code para construir la solución. La app nunca envía nada por ti: tú controlas qué se comparte."
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
    if (step === 4) renderPrompt();
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
    document.getElementById("btnAddDolor").addEventListener("click", () => addRow("dolorRows", "tpl-dolor-row", { id_dolor: "" }, () => {}));
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
      <td><select data-f="jerarquia"><option${data.jerarquia==="Objetivo"?" selected":""}>Objetivo</option><option${!data.jerarquia||data.jerarquia==="Tarea"?" selected":""}>Tarea</option><option${data.jerarquia==="Subtarea"?" selected":""}>Subtarea</option></select></td>
      <td><input data-f="nombre" value="${escAttr(data.nombre || "")}" /></td>
      <td><input data-f="encargado_proceso" value="${escAttr(data.encargado_proceso || "")}" /></td>
      <td><select data-f="simbolo_urgencia">
            <option${data.simbolo_urgencia==="⚡ Urgente"?" selected":""}>⚡ Urgente</option>
            <option${data.simbolo_urgencia==="🔥 Alta"?" selected":""}>🔥 Alta</option>
            <option${!data.simbolo_urgencia||data.simbolo_urgencia==="➡️ Normal"?" selected":""}>➡️ Normal</option>
            <option${data.simbolo_urgencia==="🧊 Baja"?" selected":""}>🧊 Baja</option>
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
            <option${!data.estado||data.estado==="No Iniciado"?" selected":""}>No Iniciado</option>
            <option${data.estado==="En Proceso"?" selected":""}>En Proceso</option>
            <option${data.estado==="En Riesgo"?" selected":""}>En Riesgo</option>
            <option${data.estado==="Completado"?" selected":""}>Completado</option>
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

  /* -------------------------------------------------- Comparativo: manual vs. con la herramienta */
  const PALETA_TAREAS = [210, 160, 340, 30, 265, 50, 190, 320, 100, 5];
  function huePorIndice(i) { return PALETA_TAREAS[i % PALETA_TAREAS.length]; }

  function renderComparativoAutomatizacion() {
    const container = document.getElementById("comparativoRows");
    if (!container) return;
    const tareas = readTareasHabituales().filter(t => t.nombre);
    const previas = new Map((state.seccion_3_compresion_proyecto.comparativo_automatizacion || []).map(p => [p.nombre, p.horas_automatizado]));
    container.innerHTML = "";
    tareas.forEach((t, i) => {
      const hue = huePorIndice(i);
      const prev = previas.get(t.nombre);
      const row = document.createElement("div");
      row.className = "row-card row-card--comparativo";
      row.style.setProperty("--tarea-hue", hue);
      row.dataset.nombre = t.nombre;
      row.dataset.horasManual = t.horas_dia;
      row.innerHTML = `
        <span class="comparativo-nombre"><span class="comparativo-swatch"></span>${escHtml(t.nombre)}</span>
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
    const resumen = document.getElementById("comparativoResumen");
    if (!el) return;
    const filas = Array.from(document.getElementById("comparativoRows")?.children || []);
    const datos = filas.map((row, i) => {
      const val = row.querySelector('[data-f="horas_automatizado"]').value;
      return {
        nombre: row.dataset.nombre,
        hue: huePorIndice(i),
        manual: Number(row.dataset.horasManual || 0),
        auto: val === "" ? null : Number(val)
      };
    }).filter(d => d.auto != null && !isNaN(d.auto));

    if (!datos.length) {
      el.innerHTML = '<p class="comparativo-empty">Carga cuánto tarda cada tarea con la herramienta para ver la comparación.</p>';
      resumen.innerHTML = "";
      return;
    }

    const maxHoras = Math.max(...datos.map(d => Math.max(d.manual, d.auto)), 1);
    el.innerHTML = datos.map(d => `
      <div class="comparativo-row" style="--tarea-hue:${d.hue}">
        <div class="comparativo-label"><span class="comparativo-swatch"></span>${escHtml(d.nombre)}</div>
        <div class="comparativo-bars">
          <div class="comparativo-bar comparativo-bar--manual" style="width:${Math.max((d.manual / maxHoras) * 100, 8).toFixed(1)}%">${d.manual.toFixed(1)}h manual</div>
          <div class="comparativo-bar comparativo-bar--auto" style="width:${Math.max((d.auto / maxHoras) * 100, 8).toFixed(1)}%">${d.auto.toFixed(1)}h con la herramienta</div>
        </div>
      </div>`).join("");

    const totalManual = datos.reduce((s, d) => s + d.manual, 0);
    const totalAuto = datos.reduce((s, d) => s + d.auto, 0);
    const ahorroDia = totalManual - totalAuto;
    const pctAhorro = totalManual > 0 ? (ahorroDia / totalManual) * 100 : 0;
    resumen.innerHTML = `
      <div class="summary-card"><div class="value">${ahorroDia.toFixed(1)}h</div><div class="label">Ahorro estimado / día</div></div>
      <div class="summary-card"><div class="value">${(ahorroDia * 22).toFixed(0)}h</div><div class="label">Ahorro estimado / mes</div></div>
      <div class="summary-card"><div class="value">${pctAhorro.toFixed(0)}%</div><div class="label">Reducción de tiempo</div></div>`;
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
    { id: "entregable", opciones: [
      { value: "documento", label: "Documento o Presentación", desc: "Reporte, resumen, propuesta, plantilla o diapositivas — ej. informe contable, manual de onboarding en RRHH." },
      { value: "datos", label: "Procesamiento de Datos", desc: "Extracción, validación, conciliación o clasificación de datos — ej. revisión de facturas, análisis de nómina, tablas dinámicas." },
      { value: "automatizacion", label: "Automatización o Script", desc: "Tarea repetitiva que conecta sistemas o ejecuta acciones — ej. envío masivo de correos, sincronización entre planillas y ERP." },
      { value: "agente", label: "Asistente Conversacional o Agente", desc: "Chatbot o flujo autónomo para responder dudas o ejecutar tareas — ej. atención a consultas internas, soporte a empleados o clientes." }
    ]},
    { id: "mapeo_proceso", opciones: [
      { value: "eventual", label: "Eventual o manual", desc: "Se hace de forma aislada cuando surge la necesidad." },
      { value: "fija", label: "Repetitiva con pasos fijos", desc: "Sigue una lista de verificación o instructivo paso a paso claro." },
      { value: "criterio", label: "Variable con criterio humano", desc: "Cada caso cambia y requiere revisar reglas o políticas de la empresa." },
      { value: "interdepartamental", label: "Flujo continuo interdepartamental", desc: "Involucra a varias personas o áreas y múltiples aprobaciones." }
    ]},
    { id: "nivel_logica", opciones: [
      { value: "minima", label: "Mínima (operativa)", desc: "Copiar, mover, formatear o calcular datos estandarizados." },
      { value: "interpretacion", label: "Interpretación de texto o documentos", desc: "Leer PDFs, correos, contratos o políticas para extraer lo relevante." },
      { value: "decision", label: "Toma de decisiones / reglas de negocio", desc: "Aplicar políticas (ej. aprobar/rechazar solicitudes, evaluar excepciones)." },
      { value: "razonamiento", label: "Razonamiento complejo", desc: "Comparar escenarios, proyectar estados financieros o planificar recursos." }
    ]},
    { id: "fuente_datos", opciones: [
      { value: "plantillas", label: "Plantillas o formularios estandarizados", desc: "Excel, Google Sheets, Forms." },
      { value: "desestructurados", label: "Documentos desestructurados", desc: "PDFs, escaneos, correos, chats o notas de voz." },
      { value: "sistemas", label: "Sistemas de la empresa", desc: "ERP, CRM, software de nómina, bases de datos o APIs." },
      { value: "mezcla", label: "Mezcla de fuentes", desc: "Múltiples fuentes desordenadas." }
    ]},
    { id: "confidencialidad", opciones: [
      { value: "bajo", label: "Uso interno / bajo riesgo", desc: "Formatos genéricos, minutas, redacción." },
      { value: "moderado", label: "Operativo / riesgo moderado", desc: "Requiere revisión humana antes de enviar o aplicar." },
      { value: "alto", label: "Financiero o RRHH / alto riesgo", desc: "Datos sensibles, nóminas, estados financieros o datos personales (requiere validación estricta y seguridad)." }
    ]}
  ];

  function calcularRecomendacionTecnica(r) {
    let rec;
    if (r.nivel_logica === "decision") {
      rec = { nombre_tecnico: "Asistencia con aprobación humana (human-in-the-loop)", guia: "La IA prepara un borrador; una persona aprueba antes de ejecutar. No automatices la decisión final.", investigar_con_ia: "Patrones human-in-the-loop para aprobaciones con Claude.",
        requisitos: ["Un flujo de aprobación claro: quién revisa y cuándo.", "Acceso de Claude solo a los datos necesarios para el borrador."],
        riesgos: ["Si nadie revisa a tiempo, el borrador se acumula sin usarse.", "Define qué pasa si alguien aprueba sin leer con atención."] };
    } else if (r.nivel_logica === "razonamiento" && r.fuente_datos === "sistemas") {
      rec = { nombre_tecnico: "Agente con herramientas (tool use / MCP)", guia: "Define qué herramientas puede llamar el agente y sus límites: alcance, timeout, logs, mecanismo STOP.", investigar_con_ia: "Model Context Protocol (MCP) y tool use para conectar sistemas existentes.",
        requisitos: ["Acceso técnico a las herramientas/sistemas que el agente va a llamar.", "Un mecanismo STOP y logs de cada acción ejecutada."],
        riesgos: ["Mayor superficie de error: una herramienta mal definida puede ejecutar acciones no deseadas.", "Necesita pruebas en sandbox antes de tocar datos reales."] };
    } else if (r.entregable === "automatizacion" && r.mapeo_proceso === "fija" && r.nivel_logica === "minima") {
      rec = { nombre_tecnico: "Automatización basada en reglas (Apps Script / Webhooks)", guia: "Conecta triggers fijos con Google Apps Script o un webhook simple. Sin IA generativa.", investigar_con_ia: "Cómo estructurar un trigger de Google Apps Script para esta tarea.",
        requisitos: ["Permisos de edición en Google Workspace o el sistema que dispara el webhook.", "Reglas de negocio ya estables — si cambian seguido, este nivel no alcanza."],
        riesgos: ["No tiene criterio propio: un caso fuera de regla rompe el flujo en silencio.", "Necesita revisión manual periódica."] };
    } else if (r.entregable === "datos" && (r.fuente_datos === "desestructurados" || r.fuente_datos === "mezcla")) {
      rec = { nombre_tecnico: "Extracción estructurada (structured output)", guia: "Define un schema de salida (JSON) claro y un prompt de extracción con ejemplos.", investigar_con_ia: "Structured output / JSON mode para extraer datos de documentos.",
        requisitos: ["Ejemplos reales (o sintéticos) de los documentos a procesar.", "Un schema de salida acordado con quien consume los datos."],
        riesgos: ["Documentos con formato muy variable bajan la precisión.", "Revisa una muestra antes de confiar en el resultado."] };
    } else if (r.nivel_logica === "interpretacion" && r.mapeo_proceso === "criterio") {
      rec = { nombre_tecnico: "Skill / prompt estructurado (Claude)", guia: "Crea una skill reutilizable con instrucciones claras, ejemplos y límites de alcance.", investigar_con_ia: "Cómo escribir un system prompt / skill para esta tarea.",
        requisitos: ["Instrucciones claras y ejemplos de los casos típicos.", "Un lugar donde guardar la skill (repositorio o carpeta compartida)."],
        riesgos: ["Sin límites de alcance definidos, la skill puede usarse para tareas que no fue pensada.", "Depende de que el equipo la mantenga actualizada."] };
    } else if (r.entregable === "agente") {
      rec = { nombre_tecnico: "Chat asistido en canal existente", guia: "Evalúa Claude en el canal donde ya trabaja tu equipo (Slack, chat interno) antes de construir algo nuevo.", investigar_con_ia: "Claude Tag / Claude en Slack.",
        requisitos: ["Acceso de Claude al canal, con permisos acotados.", "Una guía de qué preguntas responder y cuáles escalar a una persona."],
        riesgos: ["Puede generar expectativa de disponibilidad 24/7 que no se puede sostener.", "Aclara que no reemplaza al responsable humano."] };
    } else {
      rec = { nombre_tecnico: "Presentación o documento de asistencia", guia: "Empieza simple: un documento o resumen generado a partir de este diagnóstico.", investigar_con_ia: "Cómo estructurar un prompt de resumen ejecutivo.",
        requisitos: ["Ninguno técnico — alcanza con acceso a Claude web o Claude Code."],
        riesgos: ["Es el nivel más simple: si el proceso crece, vas a necesitar pasar a otro nivel."] };
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
    { id: "eco_frecuencia", pregunta: "1. Frecuencia y naturaleza del proceso", opciones: [
      { value: "a", label: "Algo puntual, para mostrar una idea", puntos: 1 },
      { value: "b", label: "Se repite, pero necesita que alguien decida o intervenga", puntos: 2 },
      { value: "c", label: "Se repite siempre igual, con reglas fijas", puntos: 3 },
      { value: "d", label: "Es dinámico, de varios pasos, con decisiones autónomas", puntos: 4 }
    ]},
    { id: "eco_datos", pregunta: "2. Formato de los datos de entrada", opciones: [
      { value: "a", label: "Diapositivas, PDFs o notas de voz", puntos: 1 },
      { value: "b", label: "Planillas (Excel, CSV, Google Sheets)", puntos: 2 },
      { value: "c", label: "Formularios web, webhooks o archivos JSON/XML", puntos: 3 },
      { value: "d", label: "APIs REST, bases de datos o scraping web", puntos: 4 }
    ]},
    { id: "eco_ecosistema", pregunta: "3. Ecosistema tecnológico disponible", opciones: [
      { value: "a", label: "Solo herramientas de oficina (PowerPoint, Word)", puntos: 1 },
      { value: "b", label: "Scripts simples (Google Apps Script, VBA)", puntos: 2 },
      { value: "c", label: "Plataformas iPaaS (Make, Zapier, n8n) o Node.js/Python", puntos: 3 },
      { value: "d", label: "Servidores dedicados, contenedores o entorno cloud", puntos: 4 }
    ]},
    { id: "eco_tolerancia", pregunta: "4. Tolerancia al error", opciones: [
      { value: "a", label: "Indiferente, solo para visualizar", puntos: 1 },
      { value: "b", label: "Moderada — revisas los resultados antes de usarlos", puntos: 2 },
      { value: "c", label: "Baja — necesita reglas y validación estricta", puntos: 3 },
      { value: "d", label: "Cero tolerancia — ejecuta acciones directas en otros sistemas", puntos: 4 }
    ]},
    { id: "eco_complejidad", pregunta: "5. Complejidad de las tareas actuales", opciones: [
      { value: "a", label: "Estética o de presentación", puntos: 1 },
      { value: "b", label: "Manipulación o limpieza de datos", puntos: 2 },
      { value: "c", label: "Flujo de trabajo entre varios sistemas", puntos: 3 },
      { value: "d", label: "Acciones contextuales complejas", puntos: 4 }
    ]}
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

  function renderSkillsCatalog() {
    const wrap = document.getElementById("skillsCatalog");
    wrap.innerHTML = "";
    SKILLS_CATALOG.categorias.forEach(cat => {
      const group = document.createElement("div");
      group.className = "skills-group";
      group.innerHTML = `<h3>${cat.nombre}</h3>`;
      cat.skills.forEach(sk => {
        const card = document.createElement("label");
        card.className = "skill-card";
        card.innerHTML = `<input type="checkbox" data-skill-id="${sk.id}" />
          <span><strong>${sk.nombre}</strong><span>${sk.proposito} · ${sk.momento}</span></span>`;
        group.appendChild(card);
      });
      wrap.appendChild(group);
    });
  }

  function readSelectedSkills() {
    return Array.from(document.querySelectorAll("#skillsCatalog input[type=checkbox]:checked")).map(cb => ({
      skill_id: cb.dataset.skillId, justificacion: "", prioridad: "Media"
    }));
  }

  function exportSkillsDictionary() {
    const seleccion = readSelectedSkills();
    const nombre = state.seccion_1_ordenar_trabajo.metadata_proceso.nombre_proceso || "proceso";
    const md = [
      `# Diccionario de skills — ${nombre}`,
      "",
      "> Cargar como instrucciones personalizadas / system prompt en Claude.",
      ""
    ];
    seleccion.forEach(s => {
      const found = SKILLS_CATALOG.categorias.flatMap(c => c.skills).find(sk => sk.id === s.skill_id);
      if (found) md.push(`## ${found.nombre}\n- **Propósito:** ${found.proposito}\n- **Momento:** ${found.momento}\n`);
    });
    if (!seleccion.length) md.push("_(Ninguna skill seleccionada aún)_");
    downloadText(`diccionario-skills-${nombre.replace(/\s+/g, "-").toLowerCase() || "proceso"}.md`, md.join("\n"));
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

    document.getElementById("btnAddKpi").addEventListener("click", addKpiRow);
    addKpiRow();

    ["s3_ahorro_horas", "s3_costo_hora"].forEach(id => document.getElementById(id).addEventListener("input", updateRoi));
    updateRoi();

    document.getElementById("btnExportResumen").addEventListener("click", exportResumenEjecutivo);
  }

  function selectLevel(levelId) {
    state.seccion_3_compresion_proyecto.nivel_solucion = levelId;
    document.querySelectorAll(".level-option").forEach(el => el.setAttribute("aria-checked", el.dataset.level === levelId ? "true" : "false"));
    const lv = LEVELS.find(l => l.id === levelId);
    document.getElementById("levelWhy").textContent = lv ? `💡 ${lv.why}` : "";
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
      <td><select data-f="frecuencia_medicion"><option${!data.frecuencia_medicion||data.frecuencia_medicion==="Diario"?" selected":""}>Diario</option><option${data.frecuencia_medicion==="Semanal"?" selected":""}>Semanal</option><option${data.frecuencia_medicion==="Mensual"?" selected":""}>Mensual</option></select></td>
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
    const horas = Number(document.getElementById("s3_ahorro_horas").value || 0);
    const costo = Number(document.getElementById("s3_costo_hora").value || 0);
    const roiMensual = horas * 4.33 * costo;
    document.getElementById("roiResumen").innerHTML = `
      <div class="summary-card"><div class="value">${(horas * 4.33).toFixed(1)}h</div><div class="label">Ahorro estimado / mes</div></div>
      <div class="summary-card"><div class="value">$${roiMensual.toFixed(0)}</div><div class="label">ROI estimado / mes (USD)</div></div>`;
  }

  function exportResumenEjecutivo() {
    collectState();
    const s1 = state.seccion_1_ordenar_trabajo, s3 = state.seccion_3_compresion_proyecto;
    const md = [
      `# Resumen ejecutivo — ${s1.metadata_proceso.nombre_proceso || "(sin nombre)"}`,
      `**Departamento:** ${s1.metadata_proceso.departamento || "—"}  `,
      `**Nivel de solución recomendado:** ${s3.nivel_solucion || "—"}`,
      "",
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
    ];
    downloadText(`resumen-ejecutivo-${state.app_meta.id_expediente}.md`, md.join("\n"));
  }

  /* ------------------------------------------------------------------ SECCIÓN 4 */
  function initSeccion4() {
    renderSkillsCatalog();
    document.getElementById("btnExportSkills").addEventListener("click", exportSkillsDictionary);
    document.getElementById("btnAddChecklist").addEventListener("click", () => addRow("checklistRows", "tpl-checklist-row", { item: "" }, () => {}));
    ["Validar que no se incluyó información confidencial", "Probar con datos sintéticos en sandbox", "Revisar permisos mínimos (least privilege)", "Definir rollback / mecanismo STOP", "Obtener aprobación del sponsor"].forEach(item => addRow("checklistRows", "tpl-checklist-row", { item }, () => {}));
    document.getElementById("btnCopyPrompt").addEventListener("click", () => {
      navigator.clipboard?.writeText(document.getElementById("promptOutput").textContent);
      setIoStatus("Prompt copiado al portapapeles.");
    });
    document.getElementById("btnCopyPromptDebug").addEventListener("click", () => {
      navigator.clipboard?.writeText(document.getElementById("promptDebugOutput").textContent);
      setIoStatus("Prompt de depuración copiado al portapapeles.");
    });
    document.getElementById("btnCopyPromptTest").addEventListener("click", () => {
      navigator.clipboard?.writeText(document.getElementById("promptTestOutput").textContent);
      setIoStatus("Prompt de pruebas copiado al portapapeles.");
    });
    document.getElementById("btnFinalize").addEventListener("click", exportManualCompleto);
  }

  function renderPrompt() {
    collectState();
    const s1 = state.seccion_1_ordenar_trabajo.metadata_proceso;
    const s2 = state.seccion_2_clasificacion_proyecto.recomendacion;
    const s3 = state.seccion_3_compresion_proyecto;
    const skills = state.seccion_4_indicadores_desarrollo.skills_seleccionadas
      .map(s => SKILLS_CATALOG.categorias.flatMap(c => c.skills).find(sk => sk.id === s.skill_id))
      .filter(Boolean);

    const prompt = [
      `Actúa como mi arquitecto/desarrollador para construir la siguiente solución interna.`,
      ``,
      `### Contexto (desinfectado, sin datos confidenciales)`,
      `- Proceso: ${s1.nombre_proceso || "[COMPLETAR]"}`,
      `- Departamento: ${s1.departamento || "[COMPLETAR]"}`,
      `- Nivel de solución objetivo: ${s3.nivel_solucion || "[COMPLETAR]"}`,
      `- Recomendación técnica (Sección 2): ${s2.nombre_tecnico || "[COMPLETAR — responde la Sección 2]"}`,
      s2.investigar_con_ia ? `- Para profundizar, investiga: ${s2.investigar_con_ia}` : "",
      s2.advertencia_seguridad ? `- ${s2.advertencia_seguridad}` : "",
      ``,
      `### Restricciones`,
      `- No usar datos reales de clientes, empleados ni cifras confidenciales; usar datos sintéticos.`,
      `- No instalar herramientas externas sin mostrar antes el plan.`,
      `- No ejecutar acciones destructivas sin mi aprobación explícita.`,
      `- Preferir Google Workspace (Forms, Sheets, Apps Script) antes que infraestructura nueva.`,
      ``,
      `### Skills a cargar como contexto`,
      skills.length ? skills.map(sk => `- ${sk.id}: ${sk.proposito}`).join("\n") : "- (ninguna seleccionada aún en la Sección 4)",
      ``,
      `### Paso 1 — Diagnóstico`,
      `Antes de escribir código, confirma que entendiste el proceso y lista qué información falta.`,
      ``,
      `### Paso 2 — Propuesta`,
      `Propón la arquitectura mínima viable acorde al nivel de solución indicado. Sin backend salvo que sea estrictamente necesario.`,
      ``,
      `### Paso 3 — Plan de pruebas`,
      `Define cómo se probará en sandbox con datos sintéticos antes de tocar el proceso real.`,
      ``,
      `### Resultado esperado`,
      `Entrega incremental: primero el mínimo funcionando, luego pregunta qué bloque activar a continuación. No construyas todo de una vez.`
    ].join("\n");

    document.getElementById("promptOutput").textContent = prompt;
    renderPromptsSecundarios();
  }

  function renderPromptsSecundarios() {
    const promptDebug = [
      `Actúa como ingeniero de software senior haciendo debugging sobre la solución que construiste a partir del prompt principal.`,
      ``,
      `Te voy a describir un error o comportamiento inesperado. Antes de proponer una corrección:`,
      `1. Reproduce el problema paso a paso con la información que te doy.`,
      `2. Identifica la causa raíz, no el síntoma.`,
      `3. Propón el fix mínimo necesario — no reescribas código que no esté relacionado con el error.`,
      ``,
      `Si te falta información para reproducir el error, pregúntamela antes de adivinar.`
    ].join("\n");

    const promptTest = [
      `Actúa como ingeniero de QA sobre la solución que construiste a partir del prompt principal.`,
      ``,
      `Genera un plan de pruebas breve:`,
      `1. Casos felices (el flujo esperado funcionando bien).`,
      `2. Casos límite (datos vacíos, muy grandes, formato inesperado).`,
      `3. Casos con datos sintéticos que simulen los reales, sin usar información confidencial.`,
      ``,
      `Si la solución no tiene un framework de testing configurado, prioriza pruebas manuales simples y dime paso a paso cómo ejecutarlas.`
    ].join("\n");

    document.getElementById("promptDebugOutput").textContent = promptDebug;
    document.getElementById("promptTestOutput").textContent = promptTest;
  }

  function exportManualCompleto() {
    collectState();
    markStepComplete(4);
    const s = state;
    const md = [
      `# Manual de implementación — ${s.seccion_1_ordenar_trabajo.metadata_proceso.nombre_proceso || s.app_meta.id_expediente}`,
      `Expediente: ${s.app_meta.id_expediente} · Generado: ${new Date().toLocaleDateString()}`,
      "",
      "## 1. Prompt para Claude / Claude Code",
      "```",
      document.getElementById("promptOutput").textContent,
      "```",
      "",
      "## 2. Prompts secundarios",
      "### Depuración de errores",
      "```",
      document.getElementById("promptDebugOutput").textContent,
      "```",
      "### Plan de pruebas",
      "```",
      document.getElementById("promptTestOutput").textContent,
      "```",
      "",
      "## 3. Checklist de sandbox",
      ...readRows("checklistRows", ["item", "completado"]).map(c => `- [${c.completado ? "x" : " "}] ${c.item}`),
      "",
      "## 4. Gestión del cambio",
      `- Sponsor: ${document.getElementById("s4_sponsor").value || "—"}`,
      `- Fecha de revisión del piloto: ${document.getElementById("s4_fecha_revision").value || "—"}`,
      "",
      "## 5. Estado completo del expediente",
      "```json",
      JSON.stringify(s, null, 2),
      "```"
    ];
    downloadText(`manual-implementacion-${s.app_meta.id_expediente}.md`, md.join("\n"));
    setIoStatus("Manual de implementación descargado.");
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
      entradas: val("s1_entradas").split("\n").filter(Boolean),
      salidas: val("s1_salidas").split("\n").filter(Boolean),
      punto_entrada_unico_definido: document.getElementById("s1_punto_entrada_unico").checked
    };
    s1.metricas_tiempo_y_costos.jornada_laboral_horas_dia = Number(val("carga_jornada") || 8);
    s1.tareas_habituales = readTareasHabituales();
    s1.capacidad_80_20.modo_equipo = document.getElementById("esManagerEquipo").checked;
    s1.capacidad_80_20.colaboradores = calcularCapacidad();
    s1.puntos_de_dolor = readRows("dolorRows", ["categoria", "descripcion", "nivel_severidad"]).map((d, i) => ({ id_dolor: `PAIN-${String(i + 1).padStart(2, "0")}`, ...d }));
    s1.cronograma_gantt = readGantt();

    state.seccion_4_indicadores_desarrollo.skills_seleccionadas = readSelectedSkills();

    state.seccion_3_compresion_proyecto.kpis_y_metricas_clave = readKpis();
    state.seccion_3_compresion_proyecto.comparativo_automatizacion = readComparativoAutomatizacion();
    state.seccion_3_compresion_proyecto.roi_estimado = {
      potencial_ahorro_horas_mes: Number((Number(val("s3_ahorro_horas") || 0) * 4.33).toFixed(1)),
      roi_estimado_mensual_usd: Number((Number(val("s3_ahorro_horas") || 0) * 4.33 * Number(val("s3_costo_hora") || 0)).toFixed(0)),
      tiempo_estimado_implementacion: val("s3_tiempo_impl"),
      requiere_aprobacion_seguridad: document.getElementById("s3_requiere_seguridad").checked
    };

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
    const s1 = state.seccion_1_ordenar_trabajo;
    setVal("s1_nombre_proceso", s1.metadata_proceso.nombre_proceso);
    setVal("s1_departamento", s1.metadata_proceso.departamento);
    setVal("s1_responsable", s1.metadata_proceso.responsable_proceso);
    setVal("s1_fecha", s1.metadata_proceso.fecha_evaluacion);
    setVal("s1_entradas", (s1.mapeo_entradas_salidas.entradas || []).join("\n"));
    setVal("s1_salidas", (s1.mapeo_entradas_salidas.salidas || []).join("\n"));
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
    s1.puntos_de_dolor.forEach(d => addRow("dolorRows", "tpl-dolor-row", d, () => {}));

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

    const selectedIds = new Set((state.seccion_4_indicadores_desarrollo.skills_seleccionadas || []).map(s => s.skill_id));
    document.querySelectorAll("#skillsCatalog input[type=checkbox]").forEach(cb => { cb.checked = selectedIds.has(cb.dataset.skillId); });

    const s3 = state.seccion_3_compresion_proyecto;
    if (s3.nivel_solucion) selectLevel(s3.nivel_solucion);
    document.getElementById("kpiBody").innerHTML = "";
    (s3.kpis_y_metricas_clave.length ? s3.kpis_y_metricas_clave : []).forEach(addKpiRow);
    if (!s3.kpis_y_metricas_clave.length) addKpiRow();
    setVal("s3_tiempo_impl", s3.roi_estimado.tiempo_estimado_implementacion);
    document.getElementById("s3_requiere_seguridad").checked = !!s3.roi_estimado.requiere_aprobacion_seguridad;
    updateRoi();

    const s4 = state.seccion_4_indicadores_desarrollo;
    document.getElementById("checklistRows").innerHTML = "";
    (s4.plan_gestion_cambio.checklist.length ? s4.plan_gestion_cambio.checklist : []).forEach(c => addRow("checklistRows", "tpl-checklist-row", c, () => {}));
    setVal("s4_sponsor", s4.plan_gestion_cambio.responsable_sponsor);
    setVal("s4_fecha_revision", s4.plan_gestion_cambio.fecha_revision_piloto);

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
