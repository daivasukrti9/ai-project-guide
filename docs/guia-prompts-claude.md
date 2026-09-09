# Guía de prompts para Claude — AI Project Guide

Plantillas listas para copiar y pegar en Claude o Claude Code. La app las
autogenera (Sección 4) con los datos que cargaste, pero puedes usarlas
manualmente. **Antes de pegar cualquiera de estos prompts, revisa que no
contengan datos confidenciales.**

---

## 1. Prompt de diagnóstico (Sandbox)

Úsalo para validar la idea con datos sintéticos antes de tocar el proceso real.

```
Actúa como consultor técnico. Voy a describirte un proceso operativo de
forma genérica (sin datos confidenciales). Quiero que:

1. Identifiques qué micropasos son mecánicos, analíticos o de decisión humana.
2. Sugieras si esto necesita: presentación, automatización fija, skill/prompt
   o agente autónomo — en ese orden de preferencia (lo más simple que funcione).
3. Señales qué información me falta antes de poder construir algo.

No propongas código todavía. Solo diagnóstico.

Proceso: [DESCRIPCIÓN GENÉRICA DEL PROCESO]
Departamento: [DEPARTAMENTO]
Frecuencia: [DIARIA/SEMANAL/MENSUAL]
Puntos de dolor: [LISTA GENÉRICA]
```

---

## 2. Prompt de construcción — Nivel 1 (Presentación/Documento)

```
Genera un [documento/presentación] estandarizado para comunicar este
proceso a dirección. Usa la estructura: Situación actual → Puntos de
dolor → Oportunidad → Próximos pasos. Datos sintéticos únicamente.
```

## 3. Prompt de construcción — Nivel 2 (Automatización fija)

```
Ayúdame a diseñar un flujo con Google Forms + Google Apps Script + Google
Sheets para automatizar: [DESCRIPCIÓN DEL FLUJO].
Restricciones:
- Sin IA generativa embebida; solo reglas fijas.
- Permisos mínimos (least privilege), sin scopes innecesarios.
- Incluye función de dry-run antes de cualquier envío/escritura real.
Muéstrame primero el diseño; no escribas el script hasta que lo apruebe.
```

## 4. Prompt de construcción — Nivel 3 (Skill / Prompt estructurado)

```
Quiero crear una skill reutilizable para: [TAREA ANALÍTICA/CREATIVA].
Diseña:
1. El objetivo y alcance de la skill (qué NO debe hacer).
2. El formato de entrada y salida esperado.
3. El prompt/instrucción final, listo para cargar como configuración
   personalizada en Claude.
No incluyas datos reales de la empresa en los ejemplos; usa datos sintéticos.
```

## 5. Prompt de construcción — Nivel 4 (Agente autónomo)

```
Quiero evaluar si este proceso está listo para un agente autónomo:
[DESCRIPCIÓN DEL PROCESO Y HERRAMIENTAS INVOLUCRADAS].

Antes de proponer arquitectura, evalúa con la skill `autonomy-readiness`:
- ¿Existen datos estructurados y métricas previas? (requisito obligatorio)
- ¿Qué límites, timeout, logs, dry-run, rollback y mecanismo STOP necesita?
- ¿Qué nivel de autonomía es razonable hoy (L0 a L5)? No saltes a L5.

Preséntame la propuesta por niveles crecientes de autonomía, no la solución
final de una vez.
```

---

## 6. Prompt de gestión del cambio / piloto

```
Ayúdame a armar el plan de gestión del cambio para pilotear esta solución
sin generar sobrecarga en el equipo:
- Sponsor responsable: [NOMBRE/ROL]
- Fecha de revisión del piloto: [FECHA]
- Checklist de salida a producción (usa la skill `release-checklist`)
- Cómo comunicar el "antes/después" en horas ahorradas sin sobre-prometer.
```

---

## Reglas transversales para todos los prompts

1. Nunca pegues nombres reales de clientes, cifras financieras reales,
   contraseñas ni credenciales.
2. Empieza siempre pidiendo diagnóstico antes que código.
3. Pide que la implementación sea incremental — "no construyas todo de una vez".
4. Exige evidencia antes de dar por terminado (skill `verification-gate`).
5. Cualquier automatización que escriba o envíe algo real necesita `dry-run`
   y aprobación humana antes de ejecutarse en producción.
