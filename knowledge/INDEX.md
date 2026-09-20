# Índice de conocimiento — AI Project Guide

- **Arquitectura:** [`docs/architecture/schema-persistencia.json`](../docs/architecture/schema-persistencia.json)
- **Plan de implementación:** [`docs/plans/plan-implementacion.md`](../docs/plans/plan-implementacion.md)
- **Guía de prompts:** [`docs/guia-prompts-claude.md`](../docs/guia-prompts-claude.md)
- **Notebook Colab:** [`docs/notebook_colab_ai_project_guide.ipynb`](../docs/notebook_colab_ai_project_guide.ipynb)
- **Catálogo de skills:** [`src/skills-catalog.json`](../src/skills-catalog.json)
- **Fuente de las galerías (Sección 3):** [`sugerencias-desarrollo-pagina3.md`](sugerencias-desarrollo-pagina3.md)
- **Fuente del catálogo PDF:** [`catalogo-recursos-proyecto-usuario.md`](catalogo-recursos-proyecto-usuario.md)
  > Ambos se editan primero acá y después se reflejan en `src/contenido-guias.js`, que es lo que lee la app.
- **Checklist de pruebas:** [`tests/checklist-e2e.md`](../tests/checklist-e2e.md)

## Procesos
- (vacío — se llena a medida que se completan expedientes reales de la empresa)

## Decisiones
- **ADR-000 (implícito):** app 100% client-side, sin backend, sin IA embebida.
  Motivo: confidencialidad total + simplicidad de mantenimiento. Ver `CLAUDE.md`.

## Integraciones
- Google Workspace: solo como *sugerencia de siguiente paso* dentro de los
  prompts (Forms, Sheets, Apps Script, Looker Studio). No hay conexión real
  desde la app — eso queda para cuando el usuario lo construya con Claude.

## Glosario
- **Expediente:** el JSON de estado de un proceso, con sus 4 secciones.
- **Tipo de desarrollo:** las 4 opciones de la Sección 3 (A documento, B automatización,
  C herramienta/visualización, D agente). Se guardan con el prefijo `Nivel N:` por
  compatibilidad con los expedientes ya exportados.
- **Prompt maestro:** el texto que arma la Sección 3 con el proceso + las ideas marcadas,
  para pegar en el asistente de IA. La app nunca lo envía: lo copia el usuario.
- **Nivel de madurez:** clasificación 1–4 de qué tan lista está una tarea
  para automatizarse (ver `docs/architecture/schema-persistencia.json`).
