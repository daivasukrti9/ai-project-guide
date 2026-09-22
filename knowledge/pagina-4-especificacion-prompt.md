# Especificación Técnica y Prompt Maestro: Página 4 - Wizard AI (v3 - Completa con Generador de Presentaciones)

## 📋 Resumen del Módulo
La **Página 4 de Wizard AI** tiene como objetivo medir y consolidar los resultados obtenidos del método o solución aplicado en la Página 3, comparándolos directamente con la situación inicial (*Baseline*) registrada en la Página 1.

**Filosofía de este módulo:** Sin complicaciones técnicas ni generación de documentos pesados (sin SOPs ni planes de escalado complejos). Se enfoca 100% en:
1. Capturar el entregable generado en la Página 3.
2. Comparar el "Antes vs. Después" mediante un Gantt visual de doble barra y métricas automáticas de ROI.
3. Brindar un espacio de consulta para identificar y resolver **puntos confusos o dudas** sobre el resultado.
4. **Ofrecer un descargable/prompt listo (.md)** para que el usuario pueda generar una **Presentación Ejecutiva Rápida** en cualquier IA (ChatGPT, Claude, Gemini, Gamma.app) y mostrar sus logros al equipo o jefatura de forma puntual.

---

## 🏗️ Estructura Funcional de la Página 4

### Módulo 1: Registro del Entregable
* **Campo de Texto / Adjunto:** Registro del resultado obtenido en la P3 (código, script, prompt maestro, tabla, macro, etc.).
* **Notas de Ejecución:** Espacio breve para anotar si funcionó al primer intento o requirió ajustes.

### Módulo 2: Matriz Diferencial (Antes vs. Después)
* Carga automáticamente las tareas y horas semanales definidas en la **Página 1**.
* Solicita al usuario únicamente dos valores por tarea:
  * **Nuevas Horas/Semana (P4)**
  * **Nueva Tasa de Error/Retrabajo (%)**

### Módulo 3: Visualización Gantt Comparativo y Calculadora de ROI
* **Gantt Doble Barra:** Cada tarea muestra dos barras superpuestas/paralelas:
  * 🔴 **Barra Roja:** Tiempo invertido inicial (Página 1).
  * 🟢 **Barra Verde:** Tiempo invertido actual con la solución (Página 4).
* **Métricas Principales:**
  * **Horas Ahorradas Semanales:** $\sum \text{Horas}_{P1} - \sum \text{Horas}_{P4}$
  * **Horas Ahorradas al Año:** $\text{Horas Ahorradas Semanales} \times 52$
  * **Ahorro Económico Estimado ($):** $\text{Horas Ahorradas/Año} \times \text{Costo Hora Usuario}$
  * **% Eficiencia Ganada:** Porcentaje de tiempo liberado.

### Módulo 4: Diagnóstico de Puntos Confusos y Resolución de Dudas
* **Identificación de Bloqueos:** El usuario escribe o selecciona qué aspectos del resultado le resultan confusos.
* **Generador de Consultas Claras para IA:** Construye una pregunta amigable lista para copiar y resolver dudas en cualquier IA sin tecnicismos.

### Módulo 5: Generador de Presentación Ejecutiva Rápida (.md / Prompt)
* **Botón "Descargar Prompt para Presentación (.md)":** Exporta un archivo de texto con las métricas consolidadas y las instrucciones para que una IA cree una presentación de diapositivas sintetizada de alto impacto.

---

## 🎯 Prompt Maestro para la IA de Desarrollo de la Aplicación (Cursor / Claude / ChatGPT)

```text
Actúa como un desarrollador Frontend Senior experto en JavaScript (Vanilla/React) y Tailwind CSS. Tu tarea es implementar la Página 4 de la aplicación web "Wizard AI" con un enfoque limpio, visual e intuitivo, sin añadir sobrecarga de documentación (sin generación de SOPs ni opciones de escalado complejo).

### Objetivo de la Página 4:
Medir el impacto de la solución aplicada en la Página 3 comparándola con el punto de partida de la Página 1, mostrar un Gantt comparativo, calcular el ahorro de tiempo y dinero, ofrecer una sección para aclarar cualquier punto confuso y un botón para exportar un prompt listo (.md) para generar una presentación ejecutiva.

### Requerimientos Interactivos y de UI:

1. CAPTURA DEL ENTREGABLE (Página 3):
   - Un área de texto enriquecido o bloque de código para pegar la solución obtenida (script, prompt, tabla, etc.).

2. TABLA COMPARATIVA "ANTES VS. DESPUÉS":
   - Muestra las actividades cargadas desde la Página 1 (Nombre de la tarea, Horas P1).
   - Añade un campo numérico editable para "Nuevas Horas/semana (P4)".
   - Recalcula dinámicamente el ahorro por tarea.

3. GANTT COMPARATIVO (Visualización en HTML/CSS):
   - Genera una vista estilo Diagrama de Gantt/Barras dobles donde cada tarea tenga:
     * Una barra superior roja/naranja con la duración original (P1).
     * Una barra inferior verde/azul con la nueva duración (P4).
   - Incluye indicadores numéricos claros de las horas ahorradas.

4. PANEL DE ROI E IMPACTO:
   - Tarjetas de resumen destacadas:
     * Total de Horas Liberadas/Semana y al Año.
     * % Ahorro de Tiempo Total.
     * Ahorro Económico Anual ($ USD) basado en un input de costo por hora del empleado.

5. SECCIÓN DE ACLARACIÓN DE DUDAS Y PUNTOS CONFUSOS:
   - Formulario sencillo con las preguntas:
     * "¿Hubo alguna parte del resultado o código que no te quedó clara?"
     * "¿El resultado final tiene algún detalle que no sabes cómo usar?"
   - Botón "Generar Explicación para IA": Toma el entregable y la duda registrada, y genera un texto amigable y directo listo para copiar y consultar en ChatGPT/Gemini/Claude para despejar la confusión al instante.

6. BOTÓN "DESCARGAR PROMPT PARA PRESENTACIÓN (.MD)":
   - Botón destacado con ícono de presentación/slides.
   - Genera y descarga dinámicamente un archivo `.md` con el prompt estructurado relleno con los datos reales del proyecto (Proceso P1, Solución P3, Horas ahorradas P4, ROI).

### Reglas de Diseño:
- Responsive, moderno y limpio utilizando Tailwind CSS.
- Integración completa con el objeto global/JSON del proyecto para actualizar los datos en tiempo real.
```

---

## 🚀 Prompt Exportable (.md) para Generar la Presentación Ejecutiva en Cualquier IA

A continuación se muestra el contenido exacto del prompt que la aplicación genera o que la persona puede copiar directamente para pegarlo en ChatGPT, Claude, Gemini, Gamma.app o Canva:

```markdown
# PROMPT MAESTRO: Generador de Presentación Ejecutiva Rápida

## Instrucciones para la Inteligencia Artificial:
Actúa como un **Consultor Senior en Estrategia Digital y Comunicación Ejecutiva**. Tu objetivo es tomar la información resumida de mi proyecto y transformarla en un guion para una **presentación ejecutiva de 5 diapositivas**, ultra puntual, visual y orientada a resultados de negocio para mostrar a mi equipo o jefatura.

---

### Insumos del Proyecto (Datos de Wizard AI):

- **Nombre del Proyecto:** [Insertar Nombre del Proyecto]
- **Área / Departamento:** [Insertar Área, ej. Finanzas / Operaciones / HR]
- **Proceso Original (Página 1):** [Descripción breve del proceso manual previo]
- **Carga de Tiempo Inicial:** [X] horas/semana en [N] tareas repetitivas.
- **Alternativa Seleccionada (Página 3):** [A. Documento/Presentación | B. Automatización | C. Herramienta/Visualización | D. Agente Autónomo]
- **Solución / Entregable Desarrollado:** [Breve resumen del script, prompt maestro, macro o plantilla creada]
- **Nuevas Horas con Solución (Página 4):** [Y] horas/semana.
- **Impacto y ROI Liberado:**
  - **Horas Ahorradas/Semana:** [X - Y] horas.
  - **Horas Liberadas al Año:** [(X - Y) * 52] horas.
  - **% Eficiencia Ganada:** [% de reducción de tiempo].
  - **Ahorro Financiero Estimado:** [$ USD/Año].

---

### Formato de Salida Requerido:
Genera el contenido diapositiva por diapositiva. Cada diapositiva debe incluir:
1. **Título Impactante:** Máximo 6 palabras.
2. **3 Puntos Clave (Bullet Points):** Máximo 2 líneas por punto. Directos al grano.
3. **Métrica o Elemento Visual Destacado:** Una cifra o comparación en caja destacada.
4. **Nota del Orador:** 1 frase corta con lo que debo decir en voz alta.

---

### Estructura de las 5 Diapositivas:

#### 🟢 Diapositiva 1: Portada e Impacto Principal
* **Título:** [Nombre del Proyecto]: Optimización Digital en [Área]
* **Subtítulo:** Cómo liberamos [Horas/Año] horas al año mediante estructuración de procesos.
* **Métrica Destacada:** +[% Eficiencia]% de Ganancia en Tiempo de Operación.

#### 🔴 Diapositiva 2: El Cuello de Botella Inicial (Baseline)
* **Enfoque:** Explicar brevemente cómo se trabajaba antes (Página 1), las tareas manuales y la sobrecarga de tiempo.
* **Métrica Destacada:** Carga inicial de [X] horas/semana dedicadas a tareas repetitivas.

#### ⚙️ Diapositiva 3: La Solución Implementada
* **Enfoque:** Presentar la alternativa seleccionada (Página 3), el método aplicado y la herramienta o plantilla resultante.
* **Métrica Destacada:** Solución basada en [Categoría A/B/C/D] con control de calidad y privacidad de datos.

#### 📊 Diapositiva 4: Resultados y Comparativa "Antes vs. Después"
* **Enfoque:** Mostrar el contraste directo de tiempo por tarea entre el punto de partida y la situación actual.
* **Métrica Destacada:** Reducción de tiempo de [X]h/semana a solo [Y]h/semana.

#### 🚀 Diapositiva 5: Retorno de Inversión y Valor de Oficina
* **Enfoque:** Resumir el ROI total, el tiempo liberado para labores estratégicas y el beneficio directo para la empresa.
* **Métrica Destacada:** [Horas Ahorradas/Año] horas/año liberadas = [$ Ahorro Estimado] USD de retorno implícito.

---

### Reglas de Estilo:
- Tono profesional, moderno, directo y convincente.
- Sin palabras de relleno ("es importante destacar", "en conclusión").
- Listo para copiar y pegar en herramientas de presentaciones automáticas (Gamma.app, Canva, Marp o PowerPoint).
```
