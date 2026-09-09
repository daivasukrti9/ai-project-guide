# AI Project Guide

Wizard interno de 4 secciones para ordenar un proceso operativo, empaquetar
las skills de Claude que necesita, evaluar su nivel de madurez/ROI y salir
con un plan de desarrollo listo para copiar en un chat con Claude.

**No incluye IA embebida.** Toda la lógica (clasificación, capacidad 80/20,
generación de prompts) es determinística y corre en el navegador.

## Uso
Abre [`src/index.html`](src/index.html) directamente en el navegador. No
requiere instalación, servidor ni conexión a internet.

## Persistencia
El progreso se guarda descargando un `.json` (botón "Descargar estado") y
se reanuda cargándolo de nuevo (botón "Cargar expediente" o arrastrándolo
sobre la ventana). Ver el esquema completo en
[`docs/architecture/schema-persistencia.json`](docs/architecture/schema-persistencia.json).

## Estructura
Ver [`CLAUDE.md`](CLAUDE.md) y [`knowledge/INDEX.md`](knowledge/INDEX.md).

## Estado del proyecto
Ver [`docs/plans/plan-implementacion.md`](docs/plans/plan-implementacion.md).
