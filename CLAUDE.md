# AI Project Guide — CLAUDE.md

## Objetivo
Guía interna de 4 etapas (wizard estilo Google Forms) para que cualquier
persona de la empresa ordene un proceso, empaquete skills de Claude, evalúe
madurez/ROI y salga con un plan de desarrollo listo para copiar en Claude.
**No es una app con IA embebida.** Es un formulario estructurado con lógica
determinística (reglas 80/20, clasificación de niveles, generación de
prompts de texto). Crea dependencia sana: la gente vuelve a usarla como
punto de partida de cada proyecto nuevo.

## Stack
- HTML/CSS/JS vanilla, sin build step, sin framework, sin backend.
- Persistencia por archivo: JSON descargable/importable (drag&drop).
- Exportables: `.json` (estado), `.md` (resúmenes/diccionario/manual/prompt maestro), PDF vía impresión
  del navegador (el catálogo de la Sección 3 se imprime desde `#docCatalogo`, un documento oculto que
  `@media print` deja como único contenido visible).
- Prototipado/puente opcional: notebook de Google Colab (ver `docs/notebook_colab_ai_project_guide.ipynb`).

## Comandos principales
- Ejecutar la app: abrir `src/index.html` directamente en el navegador (no requiere servidor).
- No hay `npm install` ni build: es intencional, para minimizar dependencias.

## Reglas de seguridad
- **Zero-Data Exposure:** ninguna llamada de red, ninguna API de IA de pago, nada sale del navegador.
- Datos sintéticos u obligatoriamente generalizados; nunca credenciales, PII ni cifras confidenciales reales.
- No instalar MCPs/plugins/dependencias sin revisión previa (ver `diccionario_herramientas_IA_proyectos_empresariales.md` en Drive).
- No hacer push/commit a `G:\Mi unidad\Proyectos\Integración & Desarrollo` sin aprobación explícita del usuario.

## Arquitectura resumida
```
src/
├── index.html            # 4 secciones del wizard + sidebar de progreso
├── styles.css            # tema claro/oscuro, accesible, print-friendly
├── app.js                # estado en memoria, cálculos, import/export JSON
├── i18n.js               # textos de interfaz + vocabulario de canales/formatos y términos ambiguos
├── contenido-guias.js    # solo datos: galerías de ideas por nivel, guía de IA y catálogo del PDF
├── skills-catalog.json   # catálogo de skills (fuente portable, también embebido en app.js)
├── ilustracion-chica.png # hero del wizard
└── ilustracion-catalogo.png # portada del catálogo descargable
knowledge/
├── sugerencias-desarrollo-pagina3.md        # fuente editorial de las galerías de la Sección 3
├── catalogo-recursos-proyecto-usuario.md    # fuente editorial del catálogo PDF
└── pagina-4-especificacion-prompt.md        # fuente del cierre: dudas + presentación ejecutiva
docs/
├── architecture/schema-persistencia.json   # JSON Schema del payload de estado
├── guia-prompts-claude.md                   # plantillas de prompts (Sección 4)
├── notebook_colab_ai_project_guide.ipynb    # puente a Colab/Antigravity/Claude Code
└── plans/plan-implementacion.md
```

## Reglas de testing
- Sin framework de tests (no hay build/CI todavía). Verificación manual vía `tests/checklist-e2e.md`.
- `node tests/verificar-textos.js` comprueba que no falte ninguna clave de interfaz
  y que los idiomas estén parejos. Correrlo después de tocar textos.
- Cubrir siempre: import/export JSON, las 4 secciones, cálculo 80/20, generación de prompt.

## Idiomas
- La interfaz se sirve en español, inglés y portugués desde `src/i18n.js`.
- El **estado nunca guarda etiquetas traducidas**, solo ids (canal, formato,
  nivel, audiencia…). Un expediente creado en un idioma se abre igual en otro.
- El contenido editorial largo (galerías de ideas, guías por nivel, catálogo
  del PDF y los prompts generados) se mantiene en español a propósito.
- Siguen en español, a propósito, los **valores que se persisten** y viajan en
  el CSV: estados del Gantt (`No Iniciado`…), urgencias (`⚡ Urgente`…), tipo de
  tarea y frecuencia de KPI. Traducir su etiqueta rompería el contrato del CSV.
- Al agregar un texto nuevo: sumar la clave a los tres diccionarios y correr
  `node tests/verificar-textos.js`. **No llamar `t` a una variable de callback**:
  sombrea la función de traducción y el verificador lo rechaza.

## Convención de documentación
- Markdown en `docs/` y `knowledge/`. Un archivo por decisión/tema, sin acumular todo en un solo documento gigante.

## Qué NO hacer
- No agregar llamadas a APIs de IA (Gemini, Claude API, OpenAI, etc.) dentro de la app — es una guía, no un asistente.
- No agregar base de datos ni backend salvo necesidad justificada y aprobada.
- No commitear a `G:\Mi unidad\...` sin revisión previa del diff.
