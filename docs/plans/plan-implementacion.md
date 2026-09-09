# Plan de implementación — AI Project Guide

## Alcance de esta primera versión (MVP)
Wizard de 4 secciones, 100% cliente, sin IA embebida, con import/export de
estado vía JSON. Ver `CLAUDE.md` para restricciones.

## Fases

| Fase | Entregable | Estado |
|---|---|---|
| 1 | Estructura de proyecto (`docs/`, `knowledge/`, `src/`, `tests/`) | ✅ Hecho |
| 2 | JSON Schema de persistencia (`docs/architecture/schema-persistencia.json`) | ✅ Hecho |
| 3 | App wizard funcional (`src/index.html`, `styles.css`, `app.js`) | ✅ Hecho |
| 4 | Guía de prompts (`docs/guia-prompts-claude.md`) | ✅ Hecho |
| 5 | Notebook Colab puente | ✅ Hecho |
| 6 | Prueba manual E2E (`tests/checklist-e2e.md`) | ⏳ Pendiente de correr con datos sintéticos |
| 7 | Mantenimiento del vault Obsidian (`Empresa-Knowledge/`) | ⏳ Pendiente |
| 8 | Commit local en `Downloads\Drive` | ⏳ Pendiente de tu aprobación |
| 9 | Copia + commit a `G:\Mi unidad\Proyectos\Integración & Desarrollo` | ⏳ Pendiente de tu aprobación explícita |

## Próximos 3 pasos sugeridos
1. Abrir `src/index.html` en el navegador y completar un expediente de
   prueba con datos sintéticos (ver `tests/checklist-e2e.md`).
2. Revisar el diff completo antes de aprobar el commit local.
3. Decidir si el mockup visual (`/design`, canvas editable) se hace como
   fase 2 opcional para presentar a dirección, separado del código real.

## Fuera de alcance (explícitamente no incluido)
- Conexión a APIs de IA de pago (Gemini, Claude API, OpenAI) en tiempo real.
- Base de datos o backend persistente.
- Autenticación de usuarios (la app es de uso interno, sin login).
- Integración automática con Google Sheets/Looker Studio (queda como
  instrucción manual en la guía de prompts, no como código en esta versión).
