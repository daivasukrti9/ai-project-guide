# Checklist E2E manual — AI Project Guide

Sin framework de tests todavía; verificación manual con datos sintéticos.
Marca cada ítem tras probarlo en el navegador (`src/index.html`).

Hay un expediente de ejemplo listo para usar en las pruebas o la demo:
[`docs/expediente-ejemplo-conciliacion-facturas.json`](../docs/expediente-ejemplo-conciliacion-facturas.json)
("Conciliación de facturas de proveedores" — 3 tareas habituales, 4 colaboradores
con los 4 estados de carga, cronograma con desvío real, clasificación completa,
comparativo manual vs. herramienta y skills seleccionadas).

## Gestión de avance y expediente
- [x] El bloque "Gestión de avance y expediente" aparece como card fija arriba de cada sección (no flotando bajo la nav), con ícono, título y texto explicativo.
- [x] "Cargar expediente" es botón outline/secundario, "Descargar estado" es primario/resaltado, "Descargar resumen (PDF)" es outline/secundario.
- [x] El departamento incluye "Soporte" además de Contabilidad, Finanzas, RRHH, Operaciones, Servicios compartidos/BPO, Tecnología, Ventas, Logística, Otro.
- [x] Al descargar el `.json` aparece un toast flotante ("Expediente guardado correctamente...") que se autooculta a los ~4s.
- [x] Al cargar un `.json` válido aparece un toast confirmando que el avance fue restaurado.
- [x] El bloque se oculta completo (card + toast) en la vista de impresión/PDF.

## Navegación
- [x] Los 4 pasos del tracker horizontal cambian de panel al hacer clic.
- [x] El anillo de progreso (arriba a la izquierda) muestra "X/4" y se rellena según el paso actual.
- [x] El hero muestra, en una fila: anillo de progreso · título+bajada · ilustración; y el tracker de 4 pasos debajo.
- [x] El título y la bajada del hero cambian según la sección activa (cada sección tiene su propio texto).
- [x] Al bajar el scroll (>40px), el anillo, la ilustración y el texto del hero desaparecen primero (opacidad) y RECIÉN después se achica la caja (sin salto/brinco, sin estado "fantasma" semitransparente); al subir por debajo de 12px, primero crece la caja y recién después aparece el contenido. Histéresis entre 12-40px evita el parpadeo con scroll lento/de trackpad. **Confirmado visualmente por el usuario el 2026-09-09.**
  > 💡 Si el achique se ve instantáneo (sin animación), no es un bug: revisar en Windows `Configuración > Accesibilidad > Efectos visuales > Efectos de animación`. Si está apagado, el navegador activa `prefers-reduced-motion`, que desactiva todas las transiciones del sitio a propósito (accesibilidad).
- [x] El badge del paso activo se resalta; los pasos completados muestran ✓ y la línea conectora se pinta de verde.
- [x] "Continuar" avanza de sección y guarda los datos ingresados.
- [x] "Volver" regresa sin perder lo ya escrito.

## Sección 1 — mapeo de entradas y salidas
- [ ] Cada entrada/salida es una fila con "qué es" + canal + formato, y se agregan/quitan con sus botones.
- [ ] El semáforo de la fila pasa a 🟢 solo cuando están los tres campos; con alguno vacío queda 🟡.
- [ ] Escribir un término ambiguo ("facturas", "datos", "reportes") con canal o formato sin elegir muestra la pista de concreción; al completar ambos, la pista desaparece.
- [ ] La pista sale de una tabla local: no hay ninguna petición de red (verificar en la pestaña Network del navegador).
- [ ] El resumen bajo cada lista cuenta cuántas filas están completas.
- [ ] Un expediente `.json` exportado **antes** de este cambio (entradas como lista de textos) se carga sin errores: conserva los textos y deja canal/formato vacíos.
- [ ] El prompt maestro de la Sección 3 lista cada entrada con su canal y formato entre paréntesis.
- [ ] `node tests/verificar-textos.js` termina sin errores.

## Sección 1
- [x] La tabla del Paso 3 no desborda la página en ventanas angostas (probado en 375px); la columna queda en un contenedor con scroll propio (`data-scrollable`) en vez de desbordar el body.
- [x] La Matriz de capacidad de equipo está oculta por defecto; tildar "Estoy planificando para un equipo" la muestra y oculta la nota de "usá el Paso 1"; destildar hace lo inverso.
- [x] Agregar/quitar colaboradores recalcula la matriz 80/20, los badges (🔴🟡🟢🔵) y el resumen.
- [x] Los 4 estados de badge se disparan según horas/semana: 🔴 sobrecargado, 🟡 carga alta, 🟢 balance ideal, 🔵 capacidad ociosa (probado con 44h/38h/32h/20h).
- [x] El resumen de sprint (2 semanas) muestra la velocidad estimada = disponibilidad semanal total × 2 (probado: 18h libres → "36.0h"; y con 3 colaboradores, 26h libres → "52.0h").
- [x] Agregar/quitar puntos de dolor funciona sin errores en consola.
- [x] Agregar/quitar filas del Gantt funciona; los selects (jerarquía, urgencia, estado) guardan el valor.
- [x] Paso 1 — Tareas habituales: alternar tipo Repetitiva/Fijo cambia los inputs de detalle; "cantidad × minutos" y "horas fijas" calculan bien las hrs/día.
- [x] El balance de disponibilidad: con carga total < jornada muestra 🟢 y el tiempo libre correcto; con carga = jornada muestra 🟡; con carga > jornada muestra 🔴 (y NO bloquea seguir cargando el Gantt).
- [x] Cada tarea del Gantt muestra "≈Xd hábiles sugeridos" = ceil(horas_estimadas / tiempo_libre_diario); si no hay tiempo libre, muestra "—".
- [x] Pestañas Tabla/Gantt/Kanban del cronograma cambian de vista y muestran los mismos datos cargados.
- [x] El Gantt visual muestra primero la sección "Operación base" (una banda por tarea habitual) y después "Proyecto" con las tareas de la tabla.
- [x] Cargar fecha de inicio/fin real en una tarea agrega una segunda barra ("Real") con el desvío en días: rojo si se atrasó, verde si se adelantó, gris si coincide con el plan.
- [x] El Kanban visual agrupa las tareas en las 4 columnas de estado correctamente (probado con una tarea en cada estado).
- [x] "Descargar Gantt/Kanban (HTML)" genera un archivo standalone (`<!DOCTYPE html>`, estilos inline) con el Gantt y el Kanban embebidos.
- [x] Un nombre de tarea con caracteres `<`, `>` o `&` no rompe el render ni el archivo exportado (se escapa correctamente: `&lt;script&gt;` en vez de ejecutarse).
- [x] "Descargar Gantt (CSV para Excel)" genera un CSV con BOM (se abre bien en Excel, tildes y emojis legibles) y separado por comas.
- [x] Editar el CSV (agregar fechas reales, cambiar estado, agregar una fila nueva) y volver a cargarlo reconstruye la tabla exactamente, reemplazando lo anterior.
- [x] Un nombre de tarea con comas o comillas en el CSV no rompe el import (columnas entrecomilladas correctamente, comillas dobles escapadas).
- [x] Cargar un CSV sin las columnas esperadas muestra un error claro y NO borra las tareas ya cargadas.

## Sección 2
- [x] Las 5 preguntas se renderizan con sus opciones; elegir una la resalta y muestra el punto/radio relleno — no queda más de una marcada por pregunta.
- [x] Las opciones se muestran como lista vertical (radio a la izquierda, título+descripción a la derecha), sin tarjetas/bordes/columnas paralelas — el diseño de tarjetas se mantiene sin cambios en Tipo de desarrollo (Sección 3) y en la Evaluación de ecosistema.
- [x] Los ejemplos de cada opción son universales para Contabilidad, RRHH, Operaciones y Soporte (no específicos de un solo rubro).
- [x] Combinación "Automatización o Script + Repetitiva con pasos fijos + Lógica mínima" recomienda "Automatización basada en reglas (Apps Script / Webhooks)".
- [x] Combinación "Razonamiento complejo + Sistemas de la empresa" recomienda "Agente con herramientas (tool use / MCP)", incluso si otras respuestas cambian.
- [x] Marcar "Financiero o RRHH / alto riesgo" agrega la advertencia de seguridad sin cambiar la recomendación principal.
- [x] El subtítulo de la Sección 2 no menciona "Claude" ni "reglas fijas, sin IA".
- [x] El expediente de ejemplo (con los campos nuevos: entregable/mapeo_proceso/nivel_logica/fuente_datos/confidencialidad) carga y restaura la recomendación correctamente.
- [x] Con menos de 5 respuestas, la recomendación indica "Basado en X/5 respuestas".
- [x] La recomendación técnica muestra "Requisitos previos" y "Puntos a vigilar" acordes a la combinación elegida; ambas listas se ocultan si no hay respuestas.
- [x] La Evaluación de complejidad del ecosistema (5 preguntas A-D) muestra el puntaje en vivo; 5-8 pts = Nivel 1, 9-13 = Nivel 2, 14-17 = Nivel 3, 18-20 = Nivel 4.
- [x] El puntaje de ecosistema persiste en el `.json` exportado y se restaura correctamente al recargarlo.

## Sección 3
- [x] Seleccionar un nivel resalta la tarjeta y muestra el texto "¿Por qué?".
- [x] Los 4 tipos de desarrollo son A Presentación/Documento, B Automatización, C Herramienta/Visualización y D Agente/Autónomo (alineados con el catálogo de recursos).
- [x] Al elegir un tipo se despliega su galería: etiqueta ("Opción C · Herramienta / Visualización"), bloque de estrategia, bloque de recursos técnicos y 7 ideas marcables.
- [x] Marcar/desmarcar ideas resalta la tarjeta, actualiza el contador ("N ideas marcadas…") y regenera el prompt maestro en vivo.
- [x] Cambiar de tipo de desarrollo vacía las ideas marcadas (pertenecen al nivel anterior) y muestra la galería nueva.
- [x] El selector de IA marca una sola opción, muestra su punto fuerte debajo y agrega la nota "> Preparado para …" al final del prompt.
- [x] Las IA sugeridas para el nivel activo muestran el badge "sugerida" (ej. Claude y DeepSeek en Nivel 3).
- [x] El prompt maestro incluye proceso, área, entradas/salidas, puntos de dolor, la recomendación de la Sección 2, el nivel elegido y las ideas marcadas.
- [ ] "Copiar prompt maestro" copia al portapapeles (requiere gesto real de usuario; con `file://` cae al fallback de `execCommand`).
- [x] "Descargar prompt (.md)" genera el mismo texto que muestra el recuadro.
- [x] "Descargar catálogo (PDF)" abre el diálogo de impresión mostrando SOLO el documento del catálogo (portada + esquema + 5 áreas + gobernanza + glosario de 10 términos): ni el wizard, ni el header, ni el footer.
- [x] La portada del catálogo trae el nombre del proyecto, área, responsable, id de expediente y fecha, más la ilustración.
- [x] Al cerrar/cancelar el diálogo de impresión, la app vuelve a la vista normal (el documento se oculta de nuevo).
- [x] El catálogo se imprime en claro aunque la app esté en modo oscuro.
- [x] "Descargar catálogo (.md)" genera el mismo contenido que el PDF, en Markdown con tablas.
- [x] La Matriz KPI & ROI muestra el hint de qué significa As-Is vs. To-Be.
- [x] Agregar/quitar KPIs funciona.
- [x] El ROI estimado se recalcula al cambiar horas/costo.
- [x] El "Gantt comparativo As-Is vs. To-Be" lista las mismas tareas habituales de la Sección 1 (se actualiza si agregás/renombrás una); barra As-Is en rojo suave, barra To-Be en azul primario (ambos temas).
- [x] Cargar horas "con IA (To-Be)" calcula la etiqueta "⚡ -X% de tiempo" por tarea (rojo si el resultado es peor que el manual) y el resumen.
- [x] La tarjeta de impacto sobre el Gantt muestra carga previa (As-Is), nueva carga (To-Be) y capacidad liberada, en horas/mes.
- [x] El comparativo persiste en el `.json` exportado y, al recargarlo, conserva los valores por nombre de tarea (aunque se hayan cargado en otra sesión) — incluido un expediente con solo los tiempos manuales (As-Is), cargado antes de tener los datos con IA.
- [x] "Descargar resumen ejecutivo" genera un `.md` coherente con lo cargado.
- [x] "Seguimiento: Plan base vs. Ejecución" muestra el mismo Gantt/Kanban de la Sección 1 (solo lectura), incluida la barra "Real" con el desvío en días.
- [x] Editar una tarea en la Sección 1 (fecha, nombre, estado) actualiza el seguimiento de la Sección 3 sin recargar la página.

## Sección 4
- [x] El catálogo de skills se renderiza agrupado por categoría (12 grupos, 27 skills en total).
- [x] "Descargar diccionario seleccionado" genera un `.md` con solo las skills marcadas.
- [x] La tarjeta "Configuración global" explica skill/plugin/MCP sin llamar a ninguna IA.
- [x] El prompt generado incluye nombre del proceso, nivel, la recomendación técnica de la Sección 2 y las skills seleccionadas.
- [ ] "Copiar prompt" copia al portapapeles (verificar con Ctrl+V en otro lugar — requiere gesto real de usuario, no se puede automatizar).
- [x] Los prompts secundarios (Depuración, Plan de pruebas) se generan junto con el principal y cada uno copia por separado.
- [x] "Descargar manual de implementación completo" genera `.md` con checklist, prompt, prompts secundarios y JSON completo.

## Sección 4 — resultados e impacto
- [x] "Lo que construiste" guarda tipo, estado, entregable y notas, y sobrevive al exportar/importar el `.json`.
- [x] Los nombres de las 4 secciones coinciden en el tracker, el hero y los exportables: Organiza tu trabajo · Información de tu proyecto · Tipo de desarrollo · Resultados e impacto.
- [x] Toda la interfaz trata al usuario de "tú", sin mezclar voseo, incluidos los prompts que genera.
- [x] El comparativo carga automáticamente las mismas tareas habituales de la Sección 1 (por nombre).
- [x] Si no hay tareas cargadas en la Sección 1, el comparativo muestra el aviso con el enlace "Paso 1" y el enlace navega.
- [x] Cargar las horas To-Be recalcula las 4 tarjetas de impacto, incluida "Eficiencia ganada sobre la carga original".
- [x] El botón "⤵ Usar el ahorro del comparativo" aparece solo si hay diferencia con lo escrito a mano, y desaparece al aplicarlo (no pisa un valor propio sin que lo pidas).
- [x] El ROI muestra horas/mes, horas/año, retorno mensual y retorno anual; el costo hora ahora se guarda y se restaura al cargar el expediente.
- [x] Base de cálculo declarada y coherente en tarjetas, resumen y prompts: 5 días hábiles/semana, 22/mes, 264/año.
- [x] Marcar dudas frecuentes y/o escribir el detalle genera la consulta para IA con el entregable incrustado.
- [x] Sin dudas marcadas ni texto, la consulta no se muestra (aparece el aviso de que falta marcar algo).
- [x] La presentación muestra las métricas reales (antes/ahora por semana, horas al año, % eficiencia y retorno si hay costo hora).
- [x] Elegir audiencia y objetivo cambia el énfasis del prompt, no los números; la nota bajo el selector explica a qué apunta esa audiencia.
- [x] Marcar "voy a sumar el logo" agrega al prompt la instrucción de reservar el espacio sin inventar un logo.
- [x] Sin audiencia u objetivo elegidos, el prompt sale igual pero con marcas `[PENDIENTE: …]` en vez de inventar.
- [ ] "Copiar prompt" de dudas y de presentación copian al portapapeles (requiere gesto real de usuario).
- [x] "Descargar (.md)" de ambos genera el mismo texto que muestra el recuadro.
- [x] "Descargar resumen ejecutivo (.md)" incluye qué se construyó, el impacto medido y la tabla por tarea, con el Markdown bien formado (líneas en blanco antes de cada título y tabla).
- [x] "Completar Plan de Proyecto" incluye el impacto medido y el prompt de presentación además del JSON completo.

## Persistencia (import/export)
- [x] "Descargar estado (.json)" en la Sección 1 genera un archivo válido.
- [x] Recargar la página y cargar ese `.json` (botón o drag&drop) reconstruye exactamente las 4 secciones.
- [x] Cargar un archivo sin `schema_version` muestra el mensaje de error, sin romper la app.

## Accesibilidad y tema
- [x] Navegación completa solo con teclado (Tab, Enter, Espacio) incluyendo el selector de nivel — foco visible, Enter y Espacio seleccionan la opción.
- [x] El botón de tema alterna claro/oscuro y persiste al recargar (localStorage).
- [x] Contraste de texto legible en ambos temas — verificado con la fórmula WCAG (texto principal, texto muted y botón primario), todos ≥4.5:1 en claro y oscuro.
- [x] "Descargar resumen (PDF)" muestra las 4 secciones antes de llamar a `window.print()` y restaura el panel activo después.

## Evidencia
Registrar aquí: fecha, navegador/versión, resultado (OK/observaciones).

| Fecha | Navegador | Resultado |
|---|---|---|
| 2026-09-08 | Chromium (herramienta de pruebas), vía servidor estático local | Recorrido completo de las 4 secciones con el expediente de ejemplo (Conciliación de facturas de proveedores): carga de datos, los 4 estados de badge de capacidad, clasificador + evaluación de ecosistema, nivel/KPI/ROI, comparativo manual vs. herramienta, seguimiento Plan vs. Ejecución, catálogo de skills, generación de prompt + secundarios, y las 5 exportaciones (.json, CSV Gantt, resumen ejecutivo, diccionario de skills, manual completo). Sin errores en consola. |
| 2026-09-08 | Chromium (herramienta de pruebas) | Segunda pasada: los ítems restantes del checklist — "Volver", tabla angosta, resumen de sprint, pestañas Tabla/Gantt/Kanban, Kanban 4 columnas, export HTML standalone, escape de `<script>`, loop de CSV completo (editar/reimportar, comas/comillas, columnas faltantes), Sección 2 (razonar+API, confidencial, <5 respuestas), Sección 4 (catálogo agrupado, config global), JSON sin `schema_version`, teclado, tema oscuro persistente, contraste WCAG y el flujo de impresión. Todo OK, sin errores de consola. Solo queda "Copiar prompt" sin poder automatizarse (requiere gesto real de usuario) y la confirmación visual del scroll compacto (ver nota en Navegación). |
