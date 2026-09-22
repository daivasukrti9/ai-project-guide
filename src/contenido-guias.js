/* ==========================================================================
   AI Project Guide — contenido editorial (datos, sin lógica)

   Se carga antes de app.js y registra window.AIPG_CONTENIDO.es. Vive en su propio
   archivo para que app.js siga siendo legible: aquí solo hay texto.

   Fuentes (copiadas en knowledge/):
     - sugerencias-desarrollo-pagina3.md      → SUGERENCIAS + IA_GUIA
     - catalogo-recursos-proyecto-usuario.md  → CATALOGO
   ========================================================================== */

(() => {
  "use strict";

  /* ------------------------------------------------------------------
     Galerías de ideas por nivel de solución.
     La clave es el prefijo del id de LEVELS ("Nivel 1"… "Nivel 4"), no el
     id completo, para que renombrar la etiqueta de un nivel no rompa nada.
     ------------------------------------------------------------------ */
  const SUGERENCIAS = {
    "Nivel 1": {
      etiqueta: "Opción A · Presentación / Documento",
      lede: "Ideal para transformar notas sueltas, datos o ideas dispersas en un entregable formal de lectura clara y presentación impecable.",
      estrategia: [
        { t: "Enfoque de audiencia", d: "Definir si el documento es para Alta Dirección (sintético), clientes (comercial), equipo operativo (paso a paso) o auditoría (riguroso)." },
        { t: "Estructura narrativa modular", d: "Elegir un esquema probado: Problema → Diagnóstico → Solución → ROI → Plan de acción; o Resumen ejecutivo → Estado actual → Matriz de opciones → Recomendación." },
        { t: "Tono y estilo corporativo", d: "Fijar de antemano el registro: ejecutivo directo, técnico divulgativo, persuasivo comercial o memo formal." },
        { t: "Descomposición narrativa (prompt chaining)", d: "Pedir primero el índice estructurado y aprobarlo, antes de que la IA redacte el contenido extenso." }
      ],
      recursos: [
        { t: "Formato del entregable", d: "Borrador en Markdown (.md), documento en Word (.docx), guion por diapositivas (.pptx) o borrador de correo directivo." },
        { t: "Insumos de origen", d: "Notas de reuniones, transcripciones de audio, PDFs de referencia o tablas de datos iniciales." }
      ],
      ideas: [
        { id: "a1", t: "Propuesta ejecutiva en 5 secciones", d: "Problema, diagnóstico, solución, ROI y plan de acción, con resumen de una página al inicio." },
        { id: "a2", t: "Acta de reunión → lista de acuerdos", d: "Convertir una transcripción larga en acuerdos, responsables y fechas límite." },
        { id: "a3", t: "Informe de estado periódico", d: "Plantilla fija que se rellena cada semana/mes con los mismos indicadores para poder compararlos." },
        { id: "a4", t: "Presentación para dirección", d: "Guion por diapositiva: mensaje clave, dato que lo respalda y qué decisión se pide." },
        { id: "a5", t: "Instructivo / SOP para el equipo", d: "Paso a paso del procedimiento con capturas, excepciones y a quién escalar." },
        { id: "a6", t: "Resumen de documento extenso", d: "Contrato, normativa o manual reducido a lo que afecta a tu área, con citas al apartado original." },
        { id: "a7", t: "Reescritura con tono corporativo", d: "Adaptar borradores propios al registro oficial de la empresa antes de enviarlos." }
      ],
      prompt: {
        rol: "un Consultor Estratégico Senior",
        encargo: "Ayúdame a redactar una Propuesta Ejecutiva estructurada por secciones. Usa un tono profesional, conciso y verificable.",
        exigencia: "Muéstrame primero el esquema/índice y espera mi aprobación antes de desarrollar cada sección. Marca con [PENDIENTE DE VALIDACIÓN] cualquier dato que no te haya entregado yo."
      }
    },

    "Nivel 2": {
      etiqueta: "Opción B · Automatización",
      lede: "Ideal para eliminar la carga repetitiva de oficina: copiar/pegar entre hojas, mover o renombrar archivos, enviar correos periódicos o procesar datos.",
      estrategia: [
        { t: "Disparador o frecuencia (triggers)", d: "Definir si el flujo se activa a una hora fija, al recibir un correo con adjunto, o manualmente con un botón." },
        { t: "Secuencia lógica limpia", d: "Mapear el flujo con el esquema universal: Entrada de datos → Regla de transformación → Punto de validación → Guardado/Envío." },
        { t: "Revisión humana obligatoria", d: "Configurar una pausa que pida autorización antes de acciones irreversibles: enviar correos a clientes, borrar registros o modificar la base principal." },
        { t: "Simulación sin riesgo (dry run)", d: "Pedir un modo de prueba que imprima lo que haría el flujo sin alterar ningún dato real." }
      ],
      recursos: [
        { t: "Ecosistema accesible de oficina", d: "Scripts de Python en local, macros VBA o fórmulas avanzadas de Excel, Google Apps Script o flujos en Power Automate." },
        { t: "Manejo amigable de errores", d: "Decidir de antemano qué pasa si falta un archivo o una celda viene vacía: notificar, saltar la fila y continuar, o detenerse." }
      ],
      ideas: [
        { id: "b1", t: "Consolidar varias planillas en una", d: "Unir archivos con la misma estructura en una tabla maestra, avisando de filas que no encajan." },
        { id: "b2", t: "Renombrar y archivar documentos", d: "Mover archivos a carpetas por fecha/cliente aplicando una convención de nombres única." },
        { id: "b3", t: "Correo periódico automático", d: "Enviar un resumen recurrente a una lista fija, con pausa de aprobación antes del envío." },
        { id: "b4", t: "Extraer datos de adjuntos", d: "Leer facturas o formularios que llegan por correo y volcar los campos a una hoja de cálculo." },
        { id: "b5", t: "Validador de datos antes de cargar", d: "Revisar duplicados, formatos de fecha y campos vacíos, y devolver un reporte de errores." },
        { id: "b6", t: "Recordatorios por vencimiento", d: "Detectar fechas próximas a vencer y generar los avisos correspondientes." },
        { id: "b7", t: "Conciliación entre dos fuentes", d: "Comparar dos listados y marcar diferencias, faltantes y coincidencias parciales." }
      ],
      prompt: {
        rol: "un Especialista en Automatización de Oficina",
        encargo: "Diseña una secuencia lógica paso a paso (y el script correspondiente) que automatice el proceso descrito.",
        exigencia: "Entrégamelo en funciones pequeñas de una sola responsabilidad, abundantemente comentadas. Incluye un modo dry-run y una pausa de validación humana antes de guardar o enviar nada."
      }
    },

    "Nivel 3": {
      etiqueta: "Opción C · Herramienta / Visualización",
      lede: "Ideal para construir utilidades interactivas de oficina: calculadoras dinámicas, dashboards, plantillas interactivas, buscadores o simuladores.",
      estrategia: [
        { t: "Tipo de interfaz", d: "Libro de Excel con botones/macros, calculadora web local en un solo archivo HTML/JS sin servidor, o dashboard interactivo de gráficos." },
        { t: "Controles e interacción", d: "Filtros de búsqueda rápida, listas desplegables condicionadas, campos numéricos con cálculo automático o barras de progreso." },
        { t: "Métricas y KPIs principales", d: "Elegir de 3 a 5 indicadores clave destacados: total procesado, % de desviación, semáforo de alertas." },
        { t: "Portabilidad y simplicidad", d: "Garantizar que abra en cualquier computadora de la empresa sin instalar programas ni permisos de administrador." },
        { t: "Instrucción reutilizable (skill)", d: "Si la herramienta incluye un paso de análisis con IA, fijar ese paso como plantilla de instrucciones con formato de salida exacto, en vez de escribirlo distinto cada vez." }
      ],
      recursos: [
        { t: "Origen de datos", d: "Listas o tablas CSV/Excel cargadas directamente en la herramienta, sin base de datos." },
        { t: "Visualización dinámica", d: "Gráficos sencillos integrados (Chart.js para web local, gráficos nativos de Excel) y botón de exportación a PDF o Excel." }
      ],
      ideas: [
        { id: "c1", t: "Calculadora de un solo archivo HTML", d: "Formulario de entrada + cálculo + resultado destacado, abre con doble clic y sin internet." },
        { id: "c2", t: "Dashboard de seguimiento", d: "Tres a cinco KPIs arriba y el detalle filtrable debajo, alimentado por un CSV exportado." },
        { id: "c3", t: "Buscador interno de información", d: "Caja de búsqueda sobre un listado propio (precios, códigos, normativa) con resultados al instante." },
        { id: "c4", t: "Simulador de escenarios", d: "Mover variables y ver el impacto en el resultado, para comparar opciones antes de decidir." },
        { id: "c5", t: "Plantilla de Excel con botones", d: "Formulario de carga, validaciones y una macro que arma el reporte final." },
        { id: "c6", t: "Checklist interactiva con progreso", d: "Lista de verificación que guarda el avance y muestra el porcentaje completado." },
        { id: "c7", t: "Visor comparativo antes/después", d: "Gráfico que contrasta la operativa manual actual contra la propuesta, para defender el proyecto." }
      ],
      prompt: {
        rol: "un Diseñador de Herramientas y UX de Oficina",
        encargo: "Ayúdame a crear una herramienta interactiva en un solo archivo HTML/JS local (o como plantilla de Excel) que calcule y visualice los indicadores descritos.",
        exigencia: "Incluye un formulario de entrada intuitivo, un gráfico de resumen y validación de los datos cargados. Sin dependencias de red: debe funcionar abriendo el archivo directamente."
      }
    },

    "Nivel 4": {
      etiqueta: "Opción D · Agente / Autónomo",
      lede: "Ideal para configurar un asistente con un rol experto específico (asesor de compras, auditor de contratos, tutor de normativas) capaz de razonar en varios pasos.",
      estrategia: [
        { t: "Asignación de rol y personalidad", d: "Definir la identidad del agente en su instrucción de sistema: «Eres un Auditor Senior especializado en Control Interno»." },
        { t: "Reglas y límites de seguridad (guardrails)", d: "Establecer qué temas puede responder, cuáles debe rechazar y qué datos no debe revelar jamás." },
        { t: "Descomposición del razonamiento", d: "Indicarle que, ante una consulta compleja, primero divida la solicitud en sub-pasos y los muestre." },
        { t: "Base de conocimiento (context engineering)", d: "Adjuntar guías, reglamentos, manuales o preguntas frecuentes de la empresa como marco de referencia estricto." },
        { t: "Instrucción reutilizable (skill)", d: "Versionar el system prompt como un archivo más del proyecto: se corrige con los fallos reales detectados, no se reescribe de memoria." }
      ],
      recursos: [
        { t: "Entorno de configuración", d: "GPTs personalizados en ChatGPT, Proyectos en Claude, Gems en Gemini o asistentes en plataformas internas." },
        { t: "Conectores técnicos opcionales (MCP / APIs)", d: "Enlace con almacenamiento (Drive, carpetas de red) siempre bajo revisión previa de permisos de seguridad." }
      ],
      ideas: [
        { id: "d1", t: "Asistente de consulta normativa", d: "Responde solo con base en los reglamentos cargados y cita el apartado exacto de donde sale la respuesta." },
        { id: "d2", t: "Auditor de documentos", d: "Revisa contratos o expedientes contra una checklist fija y devuelve hallazgos clasificados por severidad." },
        { id: "d3", t: "Asesor de compras / proveedores", d: "Compara cotizaciones según criterios definidos y justifica la recomendación." },
        { id: "d4", t: "Tutor de onboarding", d: "Acompaña a personas nuevas resolviendo dudas del procedimiento con el material oficial del área." },
        { id: "d5", t: "Triaje de solicitudes entrantes", d: "Clasifica pedidos por tipo y urgencia, y propone el responsable, siempre con aprobación humana final." },
        { id: "d6", t: "Agente con escalamiento humano", d: "Se detiene y avisa cuando detecta un caso fuera de lo mapeado, en vez de improvisar." },
        { id: "d7", t: "Revisor previo a envío", d: "Último control de calidad sobre entregables: formato, datos sensibles y criterios de aceptación." }
      ],
      prompt: {
        rol: "un Arquitecto de Agentes de IA",
        encargo: "Redacta las «Instrucciones del Sistema» (system instructions) para un asistente virtual experto en lo descrito.",
        exigencia: "Define su rol, tono corporativo, metodología de razonamiento paso a paso, qué debe rechazar, y el mecanismo de escalamiento humano cuando detecte incertidumbre. Añade un tope de intentos antes de detenerse."
      }
    }
  };

  /* ------------------------------------------------------------------
     Guía de selección de IA. `ideal` usa los prefijos de nivel.
     ------------------------------------------------------------------ */
  const IA_GUIA = [
    { id: "chatgpt", nombre: "ChatGPT (OpenAI)", fortaleza: "Redacción fluida, estructuración conceptual y primeros borradores de scripts.", ideal: ["Nivel 1", "Nivel 2"] },
    { id: "claude", nombre: "Claude (Anthropic)", fortaleza: "Análisis profundo de documentos extensos, redacción pulida y lógica/código limpio.", ideal: ["Nivel 1", "Nivel 3"] },
    { id: "gemini", nombre: "Gemini (Google)", fortaleza: "Integración con el ecosistema Google (Docs, Drive, Gmail) y búsqueda de información.", ideal: ["Nivel 1", "Nivel 4"] },
    { id: "deepseek", nombre: "DeepSeek / Cursor", fortaleza: "Desarrollo de código, macros avanzadas y scripts de automatización técnica.", ideal: ["Nivel 2", "Nivel 3"] }
  ];

  /* ------------------------------------------------------------------
     Catálogo de recursos — contenido del PDF descargable.
     Fuente: knowledge/catalogo-recursos-proyecto-usuario.md
     ------------------------------------------------------------------ */
  const CATALOGO = {
    titulo: "Catálogo de Recursos para Tu Proyecto",
    bajada: "Wizard AI no es una aplicación que reemplaza tu trabajo: es la guía metodológica y la caja de herramientas que te da las estructuras, habilidades (skills) y conceptos clave para transformar cualquier idea en una hoja de ruta clara, lista para automatizar o potenciar con IA a tu propio ritmo.",

    esquema: {
      titulo: "Esquema universal de operación",
      lede: "Estructura metodológica de 4 etapas que define la ruta lógica para abordar tu proyecto o proceso digital, sea cual sea tu área o tu nivel técnico. Transforma insumos desordenados (correos, planillas, archivos) en un proyecto estructurado, con trazabilidad y control humano en cada paso.",
      pasos: [
        { icono: "📥", clave: "Entradas (Input)", d: "Los datos de origen, documentos maestros, planillas, correos o solicitudes con los que ya trabajas en tu área." },
        { icono: "⚙️", clave: "Transformación (Skill)", d: "Las reglas de negocio y la lógica paso a paso que le enseñan a la herramienta cómo procesar tu información sin ambigüedades.", glosario: 4 },
        { icono: "🛡️", clave: "Punto de control (Gate)", d: "Las barreras de revisión donde tú verificas la calidad, proteges datos sensibles y apruebas los resultados.", glosario: 6 },
        { icono: "📤", clave: "Salida (Output)", d: "El entregable final: un informe, un script, una tabla de decisión o un archivo JSON portátil — sin dejar datos en servidores externos.", glosario: 10 }
      ]
    },

    areas: [
      {
        n: 1,
        titulo: "Gestión, estrategia y descubrimiento de procesos",
        descripcion: "Herramientas para diagnosticar el estado actual de tu trabajo, medir el tiempo real que le dedicas a cada tarea y enfocar el alcance de tu proyecto.",
        valor: "Antes de construir o aplicar cualquier tecnología, esta sección te ayuda a entender la realidad de tu proceso diario, identificar sobrecarga y aplicar la regla 80/20 para liberar tiempo libre real.",
        filas: [
          { skill: "Project Intake", proposito: "Transforma tu idea dispersa en objetivo claro, problema central, alcance y restricciones.", input: "Descripción en texto libre de lo que quieres resolver.", output: "Expediente base y estructurado de tu proyecto." },
          { skill: "Capacity & Workload Planner", proposito: "Mapea tus tareas cotidianas, calcula tu tiempo libre real y prioriza qué conviene automatizar.", input: "Lista de tus actividades semanales y horas estimadas.", output: "Matriz de disponibilidad y lista priorizada de automatizaciones." },
          { skill: "Phase Gate Control", proposito: "Establece los requisitos mínimos que debe cumplir tu proyecto antes de pasar de fase.", input: "Checklist de verificación y evidencias.", output: "Aprobación o pausa guiada de tu desarrollo." }
        ]
      },
      {
        n: 2,
        titulo: "Construcción, lógica y claridad técnica",
        descripcion: "Recursos para estructurar la lógica de tu solución con plantillas limpias y diagnosticar errores sin ruido informático.",
        valor: "Te ofrece esqueletos de trabajo prediseñados (scaffolding) para evitar el desorden en tus archivos, fórmulas o código, y te guía para entender por qué ocurren los errores al trabajar con una IA — sin necesidad de ser programador.",
        filas: [
          { skill: "Intelligent Scaffolding", glosario: 9, proposito: "Proporciona la plantilla o estructura base ideal para tu tipo de proyecto, evitando empezar de cero.", input: "Tipo de solución elegida y parámetros de tu área.", output: "Estructura modular y limpia lista para personalizar." },
          { skill: "GitHub Repositories", glosario: 3, proposito: "Almacenes digitales seguros donde guardar, versionar y compartir el código o plantillas de tu proyecto.", input: "Scripts, códigos, plantillas o documentos de tu trabajo.", output: "Repositorio organizado con historial de versiones." },
          { skill: "Clean Logic & Refactoring", proposito: "Revisa y simplifica las reglas de negocio de tu proyecto, eliminando pasos redundantes.", input: "Borrador de lógica, fórmulas de Excel o prompts iniciales.", output: "Lógica optimizada, fácil de leer y mantener por tu equipo." },
          { skill: "Bug & Error Diagnostic", proposito: "Te guía para interpretar mensajes de error e identificar la causa raíz al desarrollar con IA.", input: "Texto del error + contexto del paso que falló.", output: "Explicación sencilla del problema y opciones claras de solución." }
        ]
      },
      {
        n: 3,
        titulo: "Automatización y flujos de trabajo",
        descripcion: "Mecanismos para conectar las herramientas de tu oficina y delegar tareas repetitivas mediante flujos de ejecución seguros.",
        valor: "Te permite conectar tu proyecto con lo que ya usas (Excel, Drive, correo) mediante integraciones y conectores directos, con pruebas simuladas que no alteran datos reales y control humano en los puntos críticos.",
        filas: [
          { skill: "Workflow Simulator (Dry Run)", glosario: 7, proposito: "Simula la ejecución de tu automatización sin modificar datos reales.", input: "Pasos del flujo y datos de prueba.", output: "Reporte de ensayo sin ningún riesgo para tu información." },
          { skill: "Plugins (Integraciones)", glosario: 1, proposito: "Agrupa funciones para que la IA que elijas pueda realizar tareas avanzadas dentro de tu proyecto.", input: "Permisos y herramientas que necesita tu proyecto.", output: "Capacidades extendidas para ejecutar tareas específicas." },
          { skill: "MCP Connectors", glosario: 2, proposito: "Conexión técnica directa y segura entre tu IA y los archivos de tu empresa.", input: "Configuración y parámetros de acceso de tu herramienta.", output: "Acceso a información en tiempo real para tu proyecto." },
          { skill: "Human-in-the-Loop Gate", glosario: 6, proposito: "Detiene el proceso automático en puntos críticos para requerir tu aprobación explícita.", input: "Condición de decisión delicada o acción de impacto.", output: "Alerta de aprobación para que tú mantengas el control." }
        ]
      },
      {
        n: 4,
        titulo: "Calidad, gobernanza y seguridad",
        descripcion: "Verificación de resultados, protección de datos confidenciales de tu área e inspección de seguridad.",
        valor: "Garantiza que la información confidencial esté protegida mediante enmascaramiento de datos personales y auditoría de claves digitales, e introduce una compuerta de verificación que asegura que tu proyecto solo se dé por concluido cuando funcione.",
        filas: [
          { skill: "Synthetic Data & Privacy Guard", proposito: "Oculta o anonimiza información personal (PII) o confidencial antes de consultar a una IA.", input: "Documentos o planillas con datos sensibles.", output: "Insumo seguro y protegido para usar en tu desarrollo." },
          { skill: "Secrets & Security Audit", glosario: 8, proposito: "Revisa que tu proyecto no exponga llaves de API, contraseñas ni accesos no autorizados.", input: "Archivos de configuración, scripts o prompts.", output: "Reporte de seguridad con recomendaciones concretas." },
          { skill: "Verification Gate", proposito: "Asegura que tu proyecto cumpla los criterios de éxito acordados antes de ponerlo en marcha.", input: "Resultado final + tus criterios de aceptación.", output: "Matriz de validación con evidencia de funcionamiento." }
        ]
      },
      {
        n: 5,
        titulo: "Documentación, comunicación y portabilidad",
        descripcion: "Herramientas para empaquetar el conocimiento de tu desarrollo, presentar avances a tu equipo y llevar tu proyecto a donde quieras.",
        valor: "Te facilita compartir los logros con colegas o superiores mediante informes ejecutivos e instructivos sencillos, y con el archivo JSON portátil puedes descargar el estado exacto de tu proyecto y reanudarlo cuando quieras, sin depender de servidores.",
        filas: [
          { skill: "SOP Generator", proposito: "Convierte el flujo validado de tu proyecto en un Procedimiento Operativo Estándar para tu equipo.", input: "Pasos y reglas ya probados.", output: "Documento de instructivo claro y aplicable para tu área." },
          { skill: "Executive Presentation Builder", proposito: "Transforma la historia y los resultados de tu proyecto en una presentación estructurada para dirección.", input: "Datos, tiempos ahorrados y lógica de tu proyecto.", output: "Guion e informe ejecutivo listo para presentar." },
          { skill: "JSON Project Expedition", glosario: 10, proposito: "Empaqueta todo el avance de tu proyecto en un archivo .json liviano para guardarlo y cargarlo cuando quieras.", input: "Tus respuestas y avances guardados en la guía.", output: "Archivo .json portátil: la memoria de tu proyecto en tus manos." }
        ]
      }
    ],

    gobernanza: [
      { t: "Tu información es tuya (sin servidor central)", d: "La app no almacena tus datos ni credenciales en servidores. Toda la memoria de tu proyecto viaja contigo en tu archivo .json." },
      { t: "Claridad antes de construir", d: "Ninguna tarea de tu área debería automatizarse sin haber definido antes sus entradas, sus pasos de transformación y sus puntos de revisión humana." },
      { t: "Crecimiento progresivo", d: "Puedes empezar resolviendo una tarea sencilla de redacción (Nivel 1) e ir evolucionando hacia automatizaciones o asistentes más avanzados (Niveles 2, 3 y 4) según tus necesidades." }
    ],

    glosario: [
      {
        n: 1, termino: "Plugins (integraciones de funciones)",
        que: "Un paquete o extensión adicional que le conectas a tu IA para que aprenda a realizar acciones específicas.",
        para: "Le otorga habilidades avanzadas a tu asistente: convertir archivos a PDF, enviar correos corporativos o procesar planillas.",
        ej: "Un plugin que permite a la IA leer tu tabla de pendientes en Excel, identificar las tareas vencidas y preparar un borrador de notificación."
      },
      {
        n: 2, termino: "MCP — Model Context Protocol (conectores técnicos)",
        que: "Un «enchufe de seguridad» estandarizado que une a la IA directamente con los archivos y sistemas de tu empresa.",
        para: "Permite que la IA consulte o actualice información real de tu trabajo en tiempo real, sin copiar y pegar a mano.",
        ej: "Un conector que accede a la carpeta de tu departamento en Drive, busca el informe de ventas del mes y extrae los indicadores clave."
      },
      {
        n: 3, termino: "Repositorios de GitHub",
        que: "Una carpeta digital segura donde guardas, organizas y mantienes el registro de todos los cambios de tu proyecto.",
        para: "Evita perder el historial de tus archivos o el desorden de carpetas con nombres como proyecto_final_FINAL.docx.",
        ej: "Un repositorio privado donde tu equipo guarda los prompts maestros y scripts de la oficina, sabiendo siempre cuál es la versión vigente."
      },
      {
        n: 4, termino: "Skills (instrucciones reutilizables)",
        que: "Guías de conducta o «recetas» predefinidas que le enseñan a la IA a resolver una tarea siguiendo siempre el mismo estándar.",
        para: "Garantiza que las respuestas para tu área mantengan el mismo tono, estructura y nivel de calidad.",
        ej: "Una skill con las normas de tu empresa que revisa los borradores de correos y los adapta al tono oficial antes de enviarlos."
      },
      {
        n: 5, termino: "Prompt chaining (cadenas de instrucciones)",
        que: "Dividir el trabajo en varios pasos consecutivos, donde el resultado de uno es el insumo del siguiente.",
        para: "Evita que la IA se confunda o entregue resultados incompletos en tareas largas o complejas.",
        ej: "Paso 1: extraer los acuerdos de un acta. Paso 2: redactar la lista de tareas. Paso 3: asignar responsables y fechas en una tabla."
      },
      {
        n: 6, termino: "Human-in-the-Loop (control humano)",
        que: "Una regla donde el sistema se detiene y pide tu revisión y aprobación explícita antes de una acción importante.",
        para: "Te da la tranquilidad de que la automatización no tomará decisiones delicadas sin tu consentimiento.",
        ej: "La IA prepara el resumen de gastos del mes, pero requiere que hagas clic en «Aprobar» antes de enviarlo a Contabilidad."
      },
      {
        n: 7, termino: "Dry run (simulación sin riesgo)",
        que: "Una prueba donde tu automatización ejecuta todos sus pasos pero sin modificar, guardar ni enviar datos reales.",
        para: "Te permite comprobar que la lógica funciona sin riesgo de alterar archivos importantes de tu departamento.",
        ej: "Probar el flujo de recordatorios a clientes para verificar nombres y saldos, sin enviar ningún correo real."
      },
      {
        n: 8, termino: "API Keys y secretos (llaves digitales)",
        que: "Un código confidencial que actúa como la contraseña para que tu proyecto se conecte con un servicio de IA.",
        para: "Identifica a tu usuario o empresa y permite gestionar el consumo autorizado de forma segura.",
        ej: "Guardar la llave de tu cuenta institucional en un lugar protegido, nunca escrita dentro de un archivo que se comparte."
      },
      {
        n: 9, termino: "Scaffolding (plantillas estructuradas)",
        que: "El esqueleto o estructura prediseñada que le da orden, jerarquía y formato limpio a tu proyecto desde el primer momento.",
        para: "Te libera del bloqueo de la página en blanco y asegura que tu desarrollo siga un estándar profesional.",
        ej: "Una plantilla base para análisis de datos que ya trae las carpetas de archivos de origen, prompts y reportes finales."
      },
      {
        n: 10, termino: "JSON portátil (avance sin memoria en servidor)",
        que: "Un archivo de texto liviano y ordenado que contiene todas las respuestas, configuraciones e ideas de tu proyecto.",
        para: "Te permite guardar tu avance en tu computadora y volver a cargarlo al día siguiente, con total privacidad.",
        ej: "Descargar mi_proyecto_area_finanzas.json al terminar la jornada y cargarlo a la mañana siguiente para continuar donde quedaste."
      }
    ]
  };


  /* ------------------------------------------------------------------
     Sección 4 — cierre: consulta de dudas y presentación ejecutiva.
     Fuente: knowledge/pagina-4-especificacion-prompt.md
     ------------------------------------------------------------------ */
  const PRESENTACION = {
    audiencias: [
      { id: "jefatura", nombre: "Jefatura / dirección", enfoque: "Van directo al resultado y al costo. Pon el número grande primero y el detalle técnico al final, solo si lo piden.", pide: "Usa lenguaje de negocio, no técnico. Abre con el ahorro anual y cierra con qué decisión necesito de ellos." },
      { id: "equipo", nombre: "Mi equipo", enfoque: "Les importa cómo les cambia el día a día y si van a tener que aprender algo nuevo.", pide: "Usa un tono cercano y concreto. Explica qué tarea deja de hacerse a mano y qué pasos nuevos aparecen." },
      { id: "comite", nombre: "Comité o varias áreas", enfoque: "Mezcla de perfiles: alguien mide plata, alguien mide riesgo y alguien mide esfuerzo.", pide: "Equilibra las tres miradas: resultado económico, control de calidad/seguridad y esfuerzo de adopción." },
      { id: "cliente-interno", nombre: "Cliente interno", enfoque: "Le interesa qué recibe distinto y cuándo, no cómo está hecho por dentro.", pide: "Enfócate en el servicio que recibe: qué mejora, en cuánto tiempo y a quién reclama si algo falla." }
    ],
    objetivos: [
      { id: "escalar", nombre: "Escalar a otras áreas", pide: "El cierre debe proponer replicar esto en otras áreas: qué haría falta, en qué orden y qué se puede reutilizar tal cual." },
      { id: "consolidar", nombre: "Consolidar el piloto", pide: "El cierre debe pedir pasar de prueba a uso estable: qué queda por validar, quién lo aprueba y desde cuándo." },
      { id: "recursos", nombre: "Pedir tiempo o recursos", pide: "El cierre debe hacer un pedido concreto y acotado (horas, licencia, apoyo técnico), justificado con el retorno ya medido." },
      { id: "compartir", nombre: "Compartir el aprendizaje", pide: "El cierre debe dejar el método replicable: qué aprendí, qué volvería a hacer igual y qué evitaría." }
    ],
    /* Estilo por defecto del guion. La app lo muestra y el usuario puede
       reemplazarlo: es texto dentro del prompt, no una regla del sistema. */
    estilo: [
      "Paleta sobria de tres colores: un azul profundo para los títulos, gris neutro para el cuerpo y un solo acento (verde) reservado para las cifras de ahorro.",
      "Una idea por diapositiva. Si algo necesita dos, son dos diapositivas.",
      "Una sola cifra protagonista por diapositiva, en tamaño mucho mayor que el resto.",
      "Máximo 3 viñetas por diapositiva y máximo 2 líneas por viñeta.",
      "Sin logos genéricos, sin fotos de stock y sin íconos decorativos que no aporten información.",
      "Comparaciones antes/después siempre en el mismo orden y con la misma escala, para que se lean de un vistazo."
    ],
    slides: [
      { n: 1, icono: "🟢", titulo: "Portada e impacto principal", enfoque: "El titular del proyecto y el número que resume todo. Quien solo vea esta diapositiva tiene que entender el resultado." },
      { n: 2, icono: "🔴", titulo: "El punto de partida", enfoque: "Cómo se trabajaba antes: las tareas manuales, cuánto tiempo consumían y qué se rompía seguido. Sin dramatizar, con el dato." },
      { n: 3, icono: "⚙️", titulo: "La solución implementada", enfoque: "Qué se construyó, con qué enfoque y qué controles de calidad y privacidad tiene. En lenguaje de oficina, no técnico." },
      { n: 4, icono: "📊", titulo: "Antes vs. después", enfoque: "El contraste tarea por tarea entre el tiempo original y el actual, con el total destacado." },
      { n: 5, icono: "🚀", titulo: "Retorno y qué sigue", enfoque: "El retorno acumulado, en qué se usa el tiempo liberado y el pedido concreto del cierre." }
    ]
  };

  /* Bloqueos típicos al recibir un entregable hecho con IA. Sirven de
     disparador: la persona marca los que le pasan y escribe el resto. */
  const DUDAS_FRECUENTES = [
    { id: "no-entiendo", t: "No entiendo qué hace una parte del resultado" },
    { id: "no-se-usar", t: "No sé cómo usarlo en mi día a día" },
    { id: "falla", t: "Falla o da un error que no sé interpretar" },
    { id: "datos", t: "No sé dónde va cada dato de entrada" },
    { id: "modificar", t: "No sé dónde tocar si cambia una regla" },
    { id: "compartir", t: "No sé si puedo compartirlo con mi equipo tal como está" },
    { id: "mantener", t: "No sé quién lo mantiene si yo no estoy" }
  ];

  /* ------------------------------------------------------------------
     Guía larga que se muestra al elegir un tipo de desarrollo. Es HTML
     porque ya venía así; al traducir, conservar las etiquetas.
     ------------------------------------------------------------------ */
  const GUIAS = {
    "Nivel 1": `
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
      `,
    "Nivel 2": `
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
      `,
    "Nivel 3": `
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
      `,
    "Nivel 4": `
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
      `
  };

  /* Cada idioma registra su propio contenido con la MISMA estructura.
     tests/verificar-contenido.js falla si alguno se desvía. */
  window.AIPG_CONTENIDO = window.AIPG_CONTENIDO || {};
  window.AIPG_CONTENIDO.es = { SUGERENCIAS, IA_GUIA, CATALOGO, PRESENTACION, DUDAS_FRECUENTES, GUIAS };
})();
