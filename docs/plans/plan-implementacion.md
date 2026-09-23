# Estado del proyecto — AI Project Guide

Actualizado: 22 de septiembre de 2026 · Rama `main`

---

## Qué es

Una guía interna de 4 secciones que acompaña a cualquier persona de la
empresa desde una idea suelta hasta una hoja de ruta con números para
defenderla. **No es una aplicación con IA adentro:** es un formulario
estructurado con lógica determinística que produce, al final, los prompts
para que esa persona trabaje con el asistente de IA que prefiera.

La restricción que define todo lo demás: **nada sale del navegador.** Sin
servidor, sin base de datos, sin llamadas de red, sin IA embebida. Se abre
con doble clic sobre `src/index.html` y funciona sin internet. Toda la
memoria del proyecto viaja en un archivo `.json` que la persona descarga.

---

## Las 4 secciones

| # | Sección | Qué resuelve |
|---|---|---|
| 1 | **Organiza tu trabajo** | Mapea entradas y salidas del proceso (qué es, por dónde llega, en qué formato), mide la carga habitual, calcula el tiempo libre real con la regla 80/20 y arma el cronograma. |
| 2 | **Información de tu proyecto** | Cinco preguntas de clasificación que devuelven una recomendación técnica concreta, más una evaluación aparte de complejidad del ecosistema. |
| 3 | **Tipo de desarrollo** | Cuatro caminos posibles (documento, automatización, herramienta, agente), cada uno con su guía, 7 ideas marcables y un prompt maestro armado con el contexto real. Incluye el catálogo de recursos descargable en PDF. |
| 4 | **Resultados e impacto** | Registra lo que se construyó, contrasta las mismas tareas de la Sección 1 contra el resultado, calcula el ROI y genera el guion de una presentación ejecutiva de 5 diapositivas. |

---

## Estado por entregable

| Entregable | Estado |
|---|---|
| App wizard de 4 secciones | ✅ Completa |
| Persistencia por archivo `.json` (exportar / importar / arrastrar) | ✅ Completa |
| Mapeo estructurado de entradas y salidas, con semáforo de calidad | ✅ Completa |
| Catálogo de recursos descargable (PDF de 7 páginas y `.md`) | ✅ Completa |
| Los tres prompts generados (maestro, dudas, presentación ejecutiva) | ✅ Completos |
| Resumen ejecutivo y plan de proyecto en `.md` | ✅ Completos |
| Gantt y Kanban, con ida y vuelta a Excel por CSV | ✅ Completos |
| Español, inglés y portugués — interfaz, contenido y descargables | ✅ Completo |
| Tema claro y oscuro, impresión, uso en teléfono | ✅ Completo |
| Versión con la marca de STT Group | ✅ Completa (temporal, ver abajo) |
| Verificación automática | ✅ 5 verificadores, 62 comprobaciones funcionales |
| Checklist manual (`tests/checklist-e2e.md`) | ⏳ Pendiente de recorrer con ojos humanos |

---

## Cómo se verifica

La app no tiene dependencias ni compilación. Los verificadores viven en
`tests/`; los tres primeros no necesitan instalar nada:

| Comando | Qué comprueba |
|---|---|
| `node tests/verificar-textos.js` | Que no falte ninguna clave de interfaz y que los tres idiomas estén parejos (586 claves cada uno). |
| `node tests/verificar-contenido.js` | Que los tres archivos de contenido tengan la misma forma: ids, cantidades y claves. |
| `node tests/verificar-referencias.js` | Que cada `getElementById` tenga su elemento en el HTML. |
| `cd tests && npm install && node probar-funcional.js` | 62 comprobaciones sobre el código real en un DOM simulado: arranque, cálculos, cambio de idioma, exportables, round-trip del expediente. |
| `cd tests && npx playwright install chromium && node probar-navegador.js` | Navegador real: render, impresión, y que los prompts salgan enteros en cada idioma. |

Las dos últimas traen dependencias (`jsdom`, `playwright`), son **opcionales**
y viven solo en `tests/`. La app sigue sin ninguna.

---

## Decisiones que conviene conocer

**El `.json` es independiente del idioma.** Los valores se guardan siempre en
español (canónicos) y se traducen al mostrarlos. Un expediente creado en
portugués se abre igual en español sin perder nada.

**Los valores del CSV se mantienen en español.** Los estados del Gantt, las
urgencias y la frecuencia de KPI viajan a Excel y vuelven: traducir su
etiqueta rompería ese contrato.

**La pista de términos ambiguos no usa IA.** Cuando alguien escribe "facturas"
y aparece la sugerencia de concretar canal y formato, eso sale de una tabla
local de 22 términos. Es determinístico y no hace ninguna llamada de red.

**El cálculo de impacto declara su base.** 5 días hábiles por semana, 22 por
mes, 264 por año. El mismo número en todas las tarjetas, prompts y
exportables.

---

## Versión con marca

`src/index-stt.html` es la misma app con el logo de STT Group arriba a la
derecha. **Es un archivo generado**, no una bifurcación: comparte el código,
los estilos y los diccionarios con la versión neutra.

- Regenerar: `python tools/generar-version-marca.py`
- Comprobar que no se desincronizó: `python tools/generar-version-marca.py --verificar`

**Para quitarla** cuando ya no haga falta, alcanza con borrar tres archivos
(`src/index-stt.html`, `src/logo-stt.png`, `tools/generar-version-marca.py`)
y las cinco reglas `.brand-logo` de `styles.css`. La versión neutra no se
entera.

---

## Fuera de alcance, a propósito

- Llamadas a APIs de IA (Gemini, Claude API, OpenAI) desde la app.
- Base de datos o backend.
- Autenticación de usuarios.
- Integración automática con Google Sheets o Looker Studio: queda como
  instrucción dentro de los prompts, no como código.

---

## Limitaciones conocidas

- **El checklist manual está sin recorrer.** Lo automático cubre la lógica;
  lo visual, la impresión en papel y el copiado al portapapeles necesitan una
  persona mirando.
- **El copiado al portapapeles no se puede automatizar:** exige un gesto real
  de usuario. Hay un método alternativo para cuando el navegador lo bloquea.
- **Sin control de versiones del expediente.** Si alguien abre un `.json`
  sobre otro ya cargado, lo reemplaza. No hay historial ni fusión.
- **El catálogo en PDF depende del diálogo de impresión del navegador.** Hay
  que activar «Gráficos de fondo» para que salgan los colores.

---

## Próximos pasos sugeridos

1. Recorrer `tests/checklist-e2e.md` con un expediente de prueba y datos
   sintéticos, en los tres idiomas.
2. Decidir si la versión con marca se queda o se retira después de la
   presentación.
3. Evaluar si conviene traducir también los valores del CSV, lo que exigiría
   versionar ese contrato.
