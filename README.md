# AI Project Guide

Wizard interno de 4 secciones para ordenar un proceso operativo, elegir qué
tipo de solución construir, y cerrar midiendo el impacto real:

1. **Organiza tu trabajo** — mapeo de tareas, capacidad 80/20 y cronograma.
2. **Información de tu proyecto** — clasificación y recomendación técnica.
3. **Tipo de desarrollo** — galería de ideas por tipo de desarrollo y prompt
   maestro listo para copiar, más el catálogo de recursos en PDF.
4. **Resultados e impacto** — el entregable que salió de la Sección 3, el
   contraste antes/después sobre las mismas tareas de la Sección 1, el ROI,
   una consulta para despejar dudas y el prompt para armar la presentación
   ejecutiva.

**No incluye IA embebida.** Toda la lógica (clasificación, capacidad 80/20,
generación de prompts) es determinística y corre en el navegador.

## Uso
Doble clic en [`Iniciar-AI-Project-Guide.bat`](Iniciar-AI-Project-Guide.bat)
(Windows): un menú de una tecla abre la guía, la guía con el logo, la
presentación, o la guía y la presentación juntas.

También se puede abrir [`src/index.html`](src/index.html) directamente en el
navegador. No requiere instalación, servidor ni conexión a internet.

Disponible en **español, inglés y portugués** — se elige desde el selector del
encabezado y la preferencia se recuerda. Se traduce todo: la interfaz, las
guías, los prompts que genera y los descargables.

Hay además una versión con el logo corporativo en
[`src/index-stt.html`](src/index-stt.html), generada desde la neutra con
`python tools/generar-version-marca.py`.

## Presentación
[`docs/presentacion.html`](docs/presentacion.html) — 11 diapositivas que
explican qué resuelve, cómo funciona y qué entrega, con el mismo diseño de la
app. Se abre con doble clic, funciona sin internet y se exporta a PDF con la
tecla **P**. Flechas ← → para avanzar.

## Persistencia
El progreso se guarda descargando un `.json` (botón "Descargar estado") y
se reanuda cargándolo de nuevo (botón "Cargar expediente" o arrastrándolo
sobre la ventana). Ver el esquema completo en
[`docs/architecture/schema-persistencia.json`](docs/architecture/schema-persistencia.json).

## Estructura
Ver [`CLAUDE.md`](CLAUDE.md) y [`knowledge/INDEX.md`](knowledge/INDEX.md).

## Estado del proyecto
Reporte completo en
[`docs/plans/plan-implementacion.md`](docs/plans/plan-implementacion.md):
qué hace cada sección, qué está terminado, cómo se verifica y qué queda
fuera de alcance.
