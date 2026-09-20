# Sugerencias Generales y Catálogo de Ideas por Opción de Desarrollo — Página 3 (Wizard AI)

Este documento complementa la **Página 3 de Wizard AI**. En esta sección de la aplicación web, cuando el usuario elige una de las **4 alternativas de desarrollo**, no se le abruma con cuestionarios complejos ni código, sino que se le presenta un **menú interactivo de sugerencias e ideas inspiradoras** (las cuales pueden o no ser de su interés).

La persona simplemente selecciona o marca las ideas que mejor se adaptan a su necesidad diaria, elige la herramienta de Inteligencia Artificial que prefiere utilizar (ChatGPT, Claude, Gemini, Copilot, DeepSeek, etc.) y Wizard AI le empaqueta un **Prompt Maestro listo para copiar y pegar**.

---

## 📐 Estructura de Interacción en la Página 3

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PÁGINA 3: WIZARD AI                             │
│                                                                        │
│  [1. Conceptos Clave (Skill, Plugin, MCP) + Precauciones de Seguridad] │
│  [2. Formación de Criterio: Cómo investigar Bugs con la IA]            │
│                                                                        │
│  ────────────────────────────────────────────────────────────────────  │
│  SELECCIONA EL TIPO DE DESARROLLO QUE DESEAS EXPLORAR:                 │
│                                                                        │
│   [ A. Presentación/Doc ]  [ B. Automatización ]                       │
│   [ C. Herramienta/Visual ] [ D. Agente/Autónomo ]                     │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│            GALERÍA DE IDEAS Y SUGERENCIAS (Elegir 1 o varias)          │
│  ☑ Sugerencia / Idea 1                                                 │
│  ☑ Sugerencia / Idea 2                                                 │
│  ☐ Sugerencia / Idea 3                                                 │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│            LANZADOR DE PROMPT Y SELECCIÓN DE IA                       │
│  1. Elige tu IA: [ ChatGPT ] [ Claude ] [ Gemini ] [ Cursor / Otra ]    │
│  2. Botón: [ 📋 COPIAR PROMPT MAESTRO PARA MI IA ]                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🅰️ Opción A: Presentación / Documento
*Ideal para transformar notas sueltas, datos o ideas dispersas en un entregable formal de lectura clara, ejecución estructurada y presentación impecable.*

### 💡 Sugerencias Generales de Construcción y Estrategia
* **Enfoque de Audiencia:** Definir si el documento es para la Alta Dirección (sintético), Clientes (comercial/persuasivo), Equipo Operativo (guía paso a paso) o Auditoría (riguroso).
* **Estructura Narrativa Modular:** Elegir esquemas probados como:
  * *Problema → Diagnóstico → Solución Propuesta → ROI/Beneficios → Plan de Acción*.
  * *Resumen Ejecutivo → Estado Actual → Matriz de Opciones → Recomendación Final*.
* **Tono y Estilo Corporativo:** Opciones predefinidas (Ej. Ejecutivo directo, técnico divulgativo, persuasivo comercial, memo formal).
* **Descomposición Narrativa (*Prompt Chaining*):** Solicitar a la IA que primero genere la tabla de contenidos e índice estructurado para aprobación antes de redactar el contenido extenso.

### 🛠️ Sugerencias de Recursos y Enfoque Técnico
* **Formato del Entregable:** Borrador en Markdown (`.md`), documento ejecutable en Microsoft Word (`.docx`), guion por diapositivas (`.pptx`) o borrador de correo directivo.
* **Insumos de Origen:** Notas de reuniones, transcripciones de audio, archivos PDF de referencia o tablas de datos iniciales.

### 📋 Ejemplo de Prompt Generado para la IA
> *"Actúa como un Consultor Estratégico Senior. Revisa la información de mi proceso [Insertar Proceso] y las siguientes ideas seleccionadas: [Insertar Ideas]. Ayúdame a redactar una Propuesta Ejecutiva en 5 secciones. Utiliza un tono profesional, conciso y estructurado. Muestra primero el esquema antes de desarrollar cada sección."*

---

## 🅱️ Opción B: Automatización
*Ideal para eliminar la carga de trabajo repetitiva en tareas de oficina: copiar/pegar entre hojas de cálculo, mover o renombrar archivos, enviar correos periódicos o procesar datos.*

### 💡 Sugerencias Generales de Construcción y Estrategia
* **Disparador o Frecuencia (*Triggers*):** Definir si el flujo se activa diariamente a una hora fija, al recibir un correo con archivo adjunto, o manualmente mediante un botón.
* **Secuencia Lógica LImpia:** Mapear el flujo bajo el esquema universal: *Entrada de Datos → Regla de Transformación → Punto de Validación → Guardado/Envío*.
* **Revisión Humana Obligatoria (*Human-in-the-Loop*):** Configurar una pausa donde la automatización pida autorización humana antes de realizar acciones irreversibles (enviar correos a clientes, borrar registros o modificar la base principal).
* **Simulación sin Riesgo (*Dry Run*):** Solicitar un modo de prueba donde la herramienta simule la ejecución e imprima un reporte de lo que haría sin alterar los datos reales.

### 🛠️ Sugerencias de Recursos y Enfoque Técnico
* **Ecosistema Accesible de Oficina:** Scripts de Python para ejecución local, macros VBA o fórmulas avanzadas en Excel, secuencias en Google Apps Script o flujos en Power Automate.
* **Manejo Amigable de Errores:** Definir qué hacer si falta un archivo en la carpeta o si una celda viene vacía (ej. notificar por correo o saltar la fila y continuar).

### 📋 Ejemplo de Prompt Generado para la IA
> *"Actúa como un Especialista en Automatización de Oficina. Revisa mi proceso actual [Insertar Proceso] y las ideas seleccionadas: [Insertar Ideas]. Diseña una secuencia lógica paso a paso (o script) que automatice la consolidación de datos entre [Archivo A] y [Archivo B]. Incluye una pausa de validación humana antes de guardar el archivo final."*

---

## Ⓒ Opción C: Herramienta / Visualización / Conjunto de Funciones
*Ideal para construir utilidades interactivas de oficina: calculadoras dinámicas, dashboards visuales, plantillas interactivas, buscadores de información o simuladores.*

### 💡 Sugerencias Generales de Construcción y Estrategia
* **Tipo de Interfaz:** Opciones como Libro de Excel dinámico con botones/macros, Calculadora Web local en HTML/JS (un solo archivo funcional sin servidor) o Dashboard interactivo de gráficos.
* **Controles e Interacción:** Sugerir componentes como filtros de búsqueda rápida, listas desplegables condicionadas, campos numéricos con cálculo automático o barras de progreso.
* **Métricas y KPIs Principales:** Elegir de 3 a 5 indicadores clave para mostrar de forma destacada (Ej. Total procesado, % de desviación, semáforo de alertas verde/rojo).
* **Portabilidad y Simplicidad:** Garantizar que la herramienta pueda abrirse y usarse en cualquier computadora de la empresa sin instalar programas avanzados.

### 🛠️ Sugerencias de Recursos y Enfoque Técnico
* **Origen de Datos:** Listas o tablas CSV/Excel cargadas directamente en la herramienta.
* **Visualización Dinámica:** Gráficos sencillos integrados (Chart.js para web local o gráficos nativos de Excel) y botón de exportación a PDF o Excel.

### 📋 Ejemplo de Prompt Generado para la IA
> *"Actúa como un Diseñador de Herramientas y UX de Oficina. Basado en mi proceso [Insertar Proceso] y las ideas seleccionadas: [Insertar Ideas], ayúdame a crear una herramienta interactiva en un solo archivo HTML/JS local (o plantilla de Excel) para calcular y visualizar [KPIs]. Incluye un formulario de entrada intuitivo y un gráfico de resumen."*

---

## Ⓓ Opción D: Agente / Autónomo
*Ideal para configurar un asistente inteligente con un rol experto específico (Ej. Asesor de Compras, Auditor de Contratos, Tutor de Normativas) capaz de razonar en varios pasos.*

### 💡 Sugerencias Generales de Construcción y Estrategia
* **Asignación de Rol y Personalidad (*System Prompt/Skill*):** Definir la identidad del agente (Ej. *"Eres un Auditor Senior especializado en Control Interno y Procedimientos"*).
* **Reglas y Límites de Seguridad (*Guardrails*):** Establecer claramente qué temas puede responder, cuáles debe rechazar y qué datos no debe revelar jamás.
* **Descomposición de Razonamiento (*Planning*):** Indicar al agente que, antes de responder a una consulta compleja, analice la solicitud dividiéndola en sub-pasos.
* **Base de Conocimiento (*Context Engineering*):** Sugerir adjuntar guías, reglamentos, manuales o preguntas frecuentes de la empresa como marco de referencia estricto.

### 🛠️ Sugerencias de Recursos y Enfoque Técnico
* **Entorno de Configuración:** GPTs personalizados en ChatGPT, Proyectos en Claude, Gems en Gemini o Asistentes en plataformas internas.
* **Conectores Técnicos Opcionales (MCP / APIs):** Enlace con herramientas de almacenamiento (Google Drive, carpetas de red) siempre bajo revisión previa de permisos de seguridad.

### 📋 Ejemplo de Prompt Generado para la IA
> *"Actúa como un Arquitecto de Agentes de IA. Con base en mi necesidad [Insertar Proceso] y las opciones elegidas: [Insertar Ideas], redacta las 'Instrucciones del Sistema' (System Instructions) para un asistente virtual experto. Define su rol, tono corporativo, metodología de razonamiento paso a paso y reglas de seguridad para evitar respuestas incorrectas."*

---

## 🎯 Guía de Selección de IA según la Necesidad del Usuario

Wizard AI recomienda al usuario qué Inteligencia Artificial elegir según sus opciones seleccionadas:

| Herramienta IA | Fortaleza Principal | Ideal para la Opción |
| :--- | :--- | :--- |
| **ChatGPT (OpenAI)** | Redacción fluida, estructuración conceptual y primeros borradores de scripts. | **A (Documentos)** y **B (Automatizaciones)** |
| **Claude (Anthropic)** | Análisis profundo de documentos extensos, redacción pulida y lógica/código limpio. | **A (Presentaciones)** y **C (Herramientas)** |
| **Gemini (Google)** | Integración con el ecosistema Google (Docs, Drive, Gmail) y búsqueda de información. | **A (Documentos)** y **D (Agentes)** |
| **DeepSeek / Cursor** | Desarrollo de código, macros avanzadas y scripts de automatización técnica. | **B (Automatizaciones)** y **C (Herramientas)** |

---

## 💾 Portabilidad JSON y Lanzamiento del Prompt

Cuando el usuario finaliza la interacción en la Página 3:
1. Wizard AI empaqueta las opciones elegidas en el objeto JSON del proyecto (`selected_ideas_page3`).
2. Genera el **Prompt Maestro** adaptado a la IA seleccionada.
3. El usuario hace clic en **"Copiar Prompt"**, lo pega en su chat con la IA y comienza a construir con claridad y sin fricción.
