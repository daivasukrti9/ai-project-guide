/* ==========================================================================
   AI Project Guide — textos de interfaz (i18n)

   Se carga antes de app.js y expone window.AIPG_I18N.

   Reglas:
   - El ESTADO guarda ids (ej. canal "correo"), nunca etiquetas traducidas.
     Así un expediente creado en portugués se abre igual en español.
   - Acá vive solo la INTERFAZ. El contenido editorial largo (galerías de
     ideas, catálogo del PDF, prompts generados) vive en contenido-guias.js
     y se mantiene en español a propósito.
   ========================================================================== */

(() => {
  "use strict";

  /* ------------------------------------------------------------------
     Vocabulario de canales y formatos de la Sección 1.
     El `id` es lo que se persiste; el icono acompaña a la etiqueta.
     ------------------------------------------------------------------ */
  const CANALES_ENTRADA = [
    { id: "correo", icono: "✉️" },
    { id: "chat", icono: "💬" },
    { id: "verbal", icono: "🗣️" },
    { id: "formulario", icono: "📋" },
    { id: "carpeta", icono: "🗂️" },
    { id: "sistema", icono: "🖥️" },
    { id: "papel", icono: "📠" },
    { id: "otro", icono: "📦" }
  ];

  const FORMATOS_ENTRADA = [
    { id: "pdf", icono: "📄" },
    { id: "excel", icono: "📊" },
    { id: "texto", icono: "📝" },
    { id: "imagen", icono: "🖼️" },
    { id: "mensaje", icono: "✍️" },
    { id: "registro", icono: "🔢" },
    { id: "otro", icono: "📦" }
  ];

  const CANALES_SALIDA = [
    { id: "correo", icono: "✉️" },
    { id: "carpeta", icono: "🗂️" },
    { id: "sistema", icono: "🖥️" },
    { id: "chat", icono: "💬" },
    { id: "tablero", icono: "📊" },
    { id: "impreso", icono: "🖨️" },
    { id: "otro", icono: "📦" }
  ];

  const FORMATOS_SALIDA = [
    { id: "excel", icono: "📊" },
    { id: "pdf", icono: "📄" },
    { id: "correo-confirmacion", icono: "📧" },
    { id: "registro", icono: "🔢" },
    { id: "texto", icono: "📝" },
    { id: "grafico", icono: "🖼️" },
    { id: "otro", icono: "📦" }
  ];

  /* ------------------------------------------------------------------
     Diccionario de términos ambiguos. NO es IA: es una tabla de búsqueda
     local. Si el texto de una fila coincide con uno de estos términos y
     todavía no eligió canal o formato, se le muestra la pregunta para que
     concrete. La clave se compara normalizada (sin tildes, minúsculas).
     ------------------------------------------------------------------ */
  const AMBIGUOS_ES = {
    "factura": "¿Llegan como PDF adjunto por correo, en papel, o ya cargadas en el sistema?",
    "dato": "«Datos» puede ser casi cualquier cosa: ¿una planilla, una exportación del sistema, o números sueltos en un mensaje?",
    "reporte": "¿Lo recibís como Excel, como PDF armado, o lo tenés que generar vos desde el sistema?",
    "informe": "¿Es un documento que te mandan, o uno que armás vos a partir de otros datos?",
    "pedido": "¿Entran por correo, por un formulario, por chat, o alguien te los pide de palabra?",
    "solicitud": "¿Entran por correo, por formulario, o te las piden en una reunión?",
    "archivo": "¿De qué tipo y por dónde llega? No es lo mismo un Excel en una carpeta compartida que un PDF adjunto.",
    "documento": "¿Word, PDF, o papel escaneado? ¿Y por dónde te llega?",
    "planilla": "¿Excel o Google Sheets? ¿La recibís, o la mantenés vos?",
    "correo": "El correo es el canal, no el contenido: ¿qué viene adentro, un PDF, una planilla o solo texto?",
    "informacion": "Es muy amplio: ¿qué documento concreto y por qué vía llega?",
    "registro": "¿Es una fila que cargás en un sistema, o una planilla que mantenés aparte?",
    "formulario": "¿Formulario web, PDF para completar, o papel?",
    "comprobante": "¿PDF adjunto, foto del papel, o registro en el sistema?",
    "orden": "¿Órdenes de compra en PDF, cargadas en el ERP, o pedidas por correo?",
    "contrato": "¿PDF firmado, Word en revisión, o papel archivado?",
    "ticket": "¿Salen de una mesa de ayuda, de un correo, o de un chat?",
    "consulta": "¿Llegan por correo, por chat, o te las hacen de palabra?",
    "listado": "¿Excel, exportación del sistema, o una lista pegada en un mensaje?",
    "novedad": "¿Cómo te avisan: correo, chat, reunión? ¿Y queda algo escrito?",
    "reclamo": "¿Entran por correo, por formulario, o por teléfono?",
    "expediente": "¿Carpeta de archivos, PDF único, o registro en un sistema?"
  };

  /* ------------------------------------------------------------------
     Diccionario de interfaz. Por ahora solo español: los otros dos idiomas
     se agregan en la misma estructura, con las mismas claves.
     ------------------------------------------------------------------ */
  const ES = {
    // --- Sección 1: mapeo de entradas y salidas ---
    "s1.mapeo.entradas.titulo": "Entradas — lo que recibís para trabajar",
    "s1.mapeo.salidas.titulo": "Salidas — lo que entregás al terminar",
    "s1.mapeo.agregarEntrada": "+ Agregar entrada",
    "s1.mapeo.agregarSalida": "+ Agregar salida",
    "s1.mapeo.col.que": "¿Qué es?",
    "s1.mapeo.col.canal": "¿Por dónde llega?",
    "s1.mapeo.col.canalSalida": "¿Por dónde se entrega?",
    "s1.mapeo.col.formato": "¿En qué formato?",
    "s1.mapeo.elegir": "Elegir…",
    "s1.mapeo.quitar": "Quitar esta fila",
    "s1.mapeo.phEntrada": "Ej. Facturas de proveedores",
    "s1.mapeo.phSalida": "Ej. Reporte de conciliación del mes",
    "s1.mapeo.completo": "Mapeo estructurado",
    "s1.mapeo.completoDetalle": "Sabemos qué es, por dónde llega y en qué formato.",
    "s1.mapeo.parcial": "Falta detalle",
    "s1.mapeo.parcialDetalle": "Elegí canal y formato: es lo que después hace concreto el prompt.",
    "s1.mapeo.vacioEntradas": "Todavía no cargaste ninguna entrada. Agregá al menos una: es el insumo con el que arranca tu proceso.",
    "s1.mapeo.vacioSalidas": "Todavía no cargaste ninguna salida. Agregá al menos una: es lo que tu proceso tiene que producir.",
    "s1.mapeo.resumen": "{completas} de {total} con canal y formato definidos.",

    // --- Etiquetas de canales (entradas) ---
    "canal.entrada.correo": "Correo electrónico",
    "canal.entrada.chat": "Chat / Teams / WhatsApp",
    "canal.entrada.verbal": "Pedido verbal o reunión",
    "canal.entrada.formulario": "Formulario web",
    "canal.entrada.carpeta": "Carpeta compartida / Drive",
    "canal.entrada.sistema": "Sistema interno o ERP",
    "canal.entrada.papel": "Papel físico",
    "canal.entrada.otro": "Otro",

    // --- Etiquetas de formatos (entradas) ---
    "formato.entrada.pdf": "PDF",
    "formato.entrada.excel": "Excel / CSV",
    "formato.entrada.texto": "Documento de texto",
    "formato.entrada.imagen": "Imagen o escaneo",
    "formato.entrada.mensaje": "Texto suelto en el mensaje",
    "formato.entrada.registro": "Registro cargado en un sistema",
    "formato.entrada.otro": "Otro",

    // --- Etiquetas de canales (salidas) ---
    "canal.salida.correo": "Correo electrónico",
    "canal.salida.carpeta": "Carpeta compartida / Drive",
    "canal.salida.sistema": "Carga en sistema o ERP",
    "canal.salida.chat": "Chat / Teams",
    "canal.salida.tablero": "Tablero o dashboard",
    "canal.salida.impreso": "Impreso",
    "canal.salida.otro": "Otro",

    // --- Etiquetas de formatos (salidas) ---
    "formato.salida.excel": "Excel formateado",
    "formato.salida.pdf": "Reporte en PDF",
    "formato.salida.correo-confirmacion": "Correo de confirmación",
    "formato.salida.registro": "Registro en el sistema",
    "formato.salida.texto": "Documento de texto",
    "formato.salida.grafico": "Gráfico o imagen",
    "formato.salida.otro": "Otro"
  };

  window.AIPG_I18N = {
    idiomaPorDefecto: "es",
    idiomas: { es: ES },
    ambiguos: { es: AMBIGUOS_ES },
    vocabulario: {
      entrada: { canales: CANALES_ENTRADA, formatos: FORMATOS_ENTRADA },
      salida: { canales: CANALES_SALIDA, formatos: FORMATOS_SALIDA }
    }
  };
})();
