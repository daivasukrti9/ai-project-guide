# Índice de conocimiento — AI Project Guide

- **Arquitectura:** [`docs/architecture/schema-persistencia.json`](../docs/architecture/schema-persistencia.json)
- **Plan de implementación:** [`docs/plans/plan-implementacion.md`](../docs/plans/plan-implementacion.md)
- **Guía de prompts:** [`docs/guia-prompts-claude.md`](../docs/guia-prompts-claude.md)
- **Notebook Colab:** [`docs/notebook_colab_ai_project_guide.ipynb`](../docs/notebook_colab_ai_project_guide.ipynb)
- **Catálogo de skills:** [`src/skills-catalog.json`](../src/skills-catalog.json)
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
- **Nivel de madurez:** clasificación 1–4 de qué tan lista está una tarea
  para automatizarse (ver `docs/architecture/schema-persistencia.json`).
