/* ==========================================================================
   AI Project Guide — editorial content (English)

   Same structure as contenido-guias.js (Spanish), which is the source of
   truth. Ids, level keys and glossary numbers must match exactly:
   tests/verificar-contenido.js fails if any of them drifts.
   ========================================================================== */

(() => {
  "use strict";

  const SUGERENCIAS = {
    "Nivel 1": {
      etiqueta: "Option A · Presentation / Document",
      lede: "Ideal for turning loose notes, data or scattered ideas into a formal deliverable that reads clearly and looks polished.",
      estrategia: [
        { t: "Audience focus", d: "Decide whether the document is for senior management (concise), clients (commercial), the operating team (step by step) or audit (rigorous)." },
        { t: "Modular narrative structure", d: "Pick a proven outline: Problem → Diagnosis → Solution → ROI → Action plan; or Executive summary → Current state → Options matrix → Recommendation." },
        { t: "Corporate tone and style", d: "Set the register up front: direct executive, explanatory technical, persuasive commercial, or formal memo." },
        { t: "Narrative breakdown (prompt chaining)", d: "Ask for the structured table of contents first and approve it, before the AI writes the long content." }
      ],
      recursos: [
        { t: "Deliverable format", d: "Markdown draft (.md), Word document (.docx), slide-by-slide script (.pptx) or a draft email to management." },
        { t: "Source material", d: "Meeting notes, audio transcripts, reference PDFs or initial data tables." }
      ],
      ideas: [
        { id: "a1", t: "Executive proposal in 5 sections", d: "Problem, diagnosis, solution, ROI and action plan, with a one-page summary up front." },
        { id: "a2", t: "Meeting minutes → list of agreements", d: "Turn a long transcript into agreements, owners and deadlines." },
        { id: "a3", t: "Recurring status report", d: "A fixed template filled in every week or month with the same indicators, so they can be compared." },
        { id: "a4", t: "Presentation for management", d: "A per-slide script: key message, the figure that backs it, and what decision is being asked for." },
        { id: "a5", t: "Team instructions / SOP", d: "Step-by-step procedure with screenshots, exceptions and who to escalate to." },
        { id: "a6", t: "Summary of a long document", d: "A contract, regulation or manual reduced to what affects your area, citing the original section." },
        { id: "a7", t: "Rewrite in corporate tone", d: "Adapt your own drafts to the company's official register before sending them." }
      ],
      prompt: {
        rol: "a Senior Strategy Consultant",
        encargo: "Help me write an Executive Proposal structured in sections. Use a professional, concise and verifiable tone.",
        exigencia: "Show me the outline first and wait for my approval before developing each section. Mark with [PENDING VALIDATION] any data I did not give you."
      }
    },

    "Nivel 2": {
      etiqueta: "Option B · Automation",
      lede: "Ideal for removing repetitive office work: copying and pasting between sheets, moving or renaming files, sending recurring emails or processing data.",
      estrategia: [
        { t: "Trigger or frequency", d: "Decide whether the flow fires at a fixed time, when an email with an attachment arrives, or manually with a button." },
        { t: "Clean logical sequence", d: "Map the flow with the universal scheme: Data input → Transformation rule → Validation point → Save/Send." },
        { t: "Mandatory human review", d: "Set a pause that asks for authorization before irreversible actions: emailing clients, deleting records or modifying the main database." },
        { t: "Risk-free simulation (dry run)", d: "Ask for a test mode that prints what the flow would do without altering any real data." }
      ],
      recursos: [
        { t: "Accessible office ecosystem", d: "Python scripts run locally, VBA macros or advanced Excel formulas, Google Apps Script, or Power Automate flows." },
        { t: "Friendly error handling", d: "Decide in advance what happens if a file is missing or a cell comes in empty: notify, skip the row and continue, or stop." }
      ],
      ideas: [
        { id: "b1", t: "Consolidate several spreadsheets into one", d: "Merge files with the same structure into a master table, flagging rows that do not fit." },
        { id: "b2", t: "Rename and file documents", d: "Move files into folders by date or client, applying a single naming convention." },
        { id: "b3", t: "Automatic recurring email", d: "Send a recurring summary to a fixed list, with an approval pause before sending." },
        { id: "b4", t: "Extract data from attachments", d: "Read invoices or forms arriving by email and dump the fields into a spreadsheet." },
        { id: "b5", t: "Data validator before loading", d: "Check duplicates, date formats and empty fields, and return an error report." },
        { id: "b6", t: "Expiry reminders", d: "Detect dates about to expire and generate the corresponding notices." },
        { id: "b7", t: "Reconciliation between two sources", d: "Compare two lists and flag differences, missing entries and partial matches." }
      ],
      prompt: {
        rol: "an Office Automation Specialist",
        encargo: "Design a step-by-step logical sequence (and the matching script) that automates the process described.",
        exigencia: "Deliver it as small single-responsibility functions, heavily commented. Include a dry-run mode and a human validation pause before saving or sending anything."
      }
    },

    "Nivel 3": {
      etiqueta: "Option C · Tool / Visualization",
      lede: "Ideal for building interactive office utilities: dynamic calculators, dashboards, interactive templates, search tools or simulators.",
      estrategia: [
        { t: "Type of interface", d: "An Excel workbook with buttons/macros, a local web calculator in a single HTML/JS file with no server, or an interactive chart dashboard." },
        { t: "Controls and interaction", d: "Quick search filters, conditional dropdowns, numeric fields with automatic calculation, or progress bars." },
        { t: "Key metrics and KPIs", d: "Pick 3 to 5 headline indicators: total processed, % deviation, alert traffic light." },
        { t: "Portability and simplicity", d: "Make sure it opens on any company computer without installing programs or needing admin rights." },
        { t: "Reusable instruction (skill)", d: "If the tool includes an AI analysis step, fix that step as an instruction template with an exact output format, instead of writing it differently each time." }
      ],
      recursos: [
        { t: "Data source", d: "CSV/Excel lists or tables loaded straight into the tool, with no database." },
        { t: "Dynamic visualization", d: "Simple embedded charts (Chart.js for local web, native Excel charts) and an export button to PDF or Excel." }
      ],
      ideas: [
        { id: "c1", t: "Single-file HTML calculator", d: "Input form + calculation + headline result; opens with a double click and works offline." },
        { id: "c2", t: "Tracking dashboard", d: "Three to five KPIs on top and the filterable detail below, fed by an exported CSV." },
        { id: "c3", t: "Internal information search", d: "A search box over your own list (prices, codes, regulations) with instant results." },
        { id: "c4", t: "Scenario simulator", d: "Move variables and see the impact on the result, to compare options before deciding." },
        { id: "c5", t: "Excel template with buttons", d: "Entry form, validations and a macro that builds the final report." },
        { id: "c6", t: "Interactive checklist with progress", d: "A verification list that saves progress and shows the percentage completed." },
        { id: "c7", t: "Before/after comparison viewer", d: "A chart contrasting today's manual operation against the proposal, to defend the project." }
      ],
      prompt: {
        rol: "an Office Tool and UX Designer",
        encargo: "Help me build an interactive tool in a single local HTML/JS file (or as an Excel template) that calculates and visualizes the indicators described.",
        exigencia: "Include an intuitive input form, a summary chart and validation of the loaded data. No network dependencies: it must work by opening the file directly."
      }
    },

    "Nivel 4": {
      etiqueta: "Option D · Agent / Autonomous",
      lede: "Ideal for setting up an assistant with a specific expert role (purchasing advisor, contract auditor, regulations tutor) able to reason across several steps.",
      estrategia: [
        { t: "Role and personality", d: "Define the agent's identity in its system instruction: \"You are a Senior Auditor specialized in Internal Control\"." },
        { t: "Rules and safety limits (guardrails)", d: "State which topics it may answer, which it must refuse, and what data it must never reveal." },
        { t: "Reasoning breakdown", d: "Tell it that, faced with a complex query, it should first split the request into sub-steps and show them." },
        { t: "Knowledge base (context engineering)", d: "Attach company guides, regulations, manuals or FAQs as a strict frame of reference." },
        { t: "Reusable instruction (skill)", d: "Version the system prompt as one more project file: correct it with the failures you actually find, do not rewrite it from memory." }
      ],
      recursos: [
        { t: "Configuration environment", d: "Custom GPTs in ChatGPT, Projects in Claude, Gems in Gemini, or assistants on internal platforms." },
        { t: "Optional technical connectors (MCP / APIs)", d: "A link to storage (Drive, network folders), always after a security review of the permissions." }
      ],
      ideas: [
        { id: "d1", t: "Regulations lookup assistant", d: "Answers only from the regulations loaded, and cites the exact section the answer comes from." },
        { id: "d2", t: "Document auditor", d: "Reviews contracts or files against a fixed checklist and returns findings ranked by severity." },
        { id: "d3", t: "Purchasing / supplier advisor", d: "Compares quotes against defined criteria and justifies the recommendation." },
        { id: "d4", t: "Onboarding tutor", d: "Walks new people through procedure questions using the area's official material." },
        { id: "d5", t: "Triage of incoming requests", d: "Classifies requests by type and urgency and proposes the owner, always with a final human approval." },
        { id: "d6", t: "Agent with human escalation", d: "Stops and flags when it detects a case outside what was mapped, instead of improvising." },
        { id: "d7", t: "Pre-delivery reviewer", d: "A last quality check on deliverables: format, sensitive data and acceptance criteria." }
      ],
      prompt: {
        rol: "an AI Agent Architect",
        encargo: "Write the System Instructions for an expert virtual assistant covering what is described.",
        exigencia: "Define its role, corporate tone, step-by-step reasoning method, what it must refuse, and the human escalation mechanism for when it detects uncertainty. Add a cap on attempts before it stops."
      }
    }
  };

  const IA_GUIA = [
    { id: "chatgpt", nombre: "ChatGPT (OpenAI)", fortaleza: "Fluent writing, conceptual structuring and first drafts of scripts.", ideal: ["Nivel 1", "Nivel 2"] },
    { id: "claude", nombre: "Claude (Anthropic)", fortaleza: "Deep analysis of long documents, polished writing and clean logic/code.", ideal: ["Nivel 1", "Nivel 3"] },
    { id: "gemini", nombre: "Gemini (Google)", fortaleza: "Integration with the Google ecosystem (Docs, Drive, Gmail) and information lookup.", ideal: ["Nivel 1", "Nivel 4"] },
    { id: "deepseek", nombre: "DeepSeek / Cursor", fortaleza: "Code development, advanced macros and technical automation scripts.", ideal: ["Nivel 2", "Nivel 3"] }
  ];

  const CATALOGO = {
    titulo: "Resource Catalog for Your Project",
    bajada: "This guide is not an application that replaces your work: it is the method and the toolbox that gives you the structures, skills and key concepts to turn any idea into a clear roadmap, ready to automate or boost with AI at your own pace.",

    esquema: {
      titulo: "Universal operating scheme",
      lede: "A four-stage method that defines the logical route for tackling your project or digital process, whatever your area or technical level. It turns disorganized material (emails, spreadsheets, files) into a structured project, with traceability and human control at every step.",
      pasos: [
        { icono: "📥", clave: "Inputs", d: "The source data, master documents, spreadsheets, emails or requests you already work with in your area." },
        { icono: "⚙️", clave: "Transformation (Skill)", d: "The business rules and step-by-step logic that teach the tool how to process your information without ambiguity.", glosario: 4 },
        { icono: "🛡️", clave: "Control point (Gate)", d: "The review barriers where you verify quality, protect sensitive data and approve the results.", glosario: 6 },
        { icono: "📤", clave: "Output", d: "The final deliverable: a report, a script, a decision table or a portable JSON file — with no data left on external servers.", glosario: 10 }
      ]
    },

    areas: [
      {
        n: 1,
        titulo: "Management, strategy and process discovery",
        descripcion: "Tools to diagnose the current state of your work, measure the real time each task takes and focus the scope of your project.",
        valor: "Before building or applying any technology, this section helps you understand the reality of your daily process, spot overload and apply the 80/20 rule to free up real time.",
        filas: [
          { skill: "Project Intake", proposito: "Turns your scattered idea into a clear objective, core problem, scope and constraints.", input: "A free-text description of what you want to solve.", output: "A structured base file for your project." },
          { skill: "Capacity & Workload Planner", proposito: "Maps your everyday tasks, calculates your real free time and prioritizes what is worth automating.", input: "A list of your weekly activities and estimated hours.", output: "An availability matrix and a prioritized list of automations." },
          { skill: "Phase Gate Control", proposito: "Sets the minimum requirements your project must meet before moving to the next phase.", input: "A verification checklist and evidence.", output: "Approval, or a guided pause of your development." }
        ]
      },
      {
        n: 2,
        titulo: "Building, logic and technical clarity",
        descripcion: "Resources to structure the logic of your solution with clean templates and to diagnose errors without technical noise.",
        valor: "It gives you pre-designed working skeletons (scaffolding) to avoid clutter in your files, formulas or code, and guides you to understand why errors happen when working with AI — without needing to be a programmer.",
        filas: [
          { skill: "Intelligent Scaffolding", glosario: 9, proposito: "Provides the ideal base template or structure for your type of project, so you do not start from zero.", input: "The chosen solution type and your area's parameters.", output: "A clean, modular structure ready to customize." },
          { skill: "GitHub Repositories", glosario: 3, proposito: "Secure digital stores to keep, version and share your project's code or templates.", input: "Scripts, code, templates or documents from your work.", output: "An organized repository with version history." },
          { skill: "Clean Logic & Refactoring", proposito: "Reviews and simplifies your project's business rules, removing redundant steps.", input: "A draft of the logic, Excel formulas or initial prompts.", output: "Optimized logic, easy for your team to read and maintain." },
          { skill: "Bug & Error Diagnostic", proposito: "Guides you to interpret error messages and identify the root cause when developing with AI.", input: "The error text + the context of the step that failed.", output: "A plain explanation of the problem and clear options to solve it." }
        ]
      },
      {
        n: 3,
        titulo: "Automation and workflows",
        descripcion: "Mechanisms to connect your office tools and delegate repetitive tasks through safe execution flows.",
        valor: "It lets you connect your project with what you already use (Excel, Drive, email) through integrations and direct connectors, with simulated tests that do not alter real data and human control at the critical points.",
        filas: [
          { skill: "Workflow Simulator (Dry Run)", glosario: 7, proposito: "Simulates running your automation without modifying real data.", input: "The flow steps and test data.", output: "A rehearsal report with no risk to your information." },
          { skill: "Plugins (Integrations)", glosario: 1, proposito: "Groups functions so the AI you choose can carry out advanced tasks inside your project.", input: "The permissions and tools your project needs.", output: "Extended capabilities to run specific tasks." },
          { skill: "MCP Connectors", glosario: 2, proposito: "A direct, secure technical connection between your AI and your company's files.", input: "Your tool's configuration and access parameters.", output: "Real-time access to information for your project." },
          { skill: "Human-in-the-Loop Gate", glosario: 6, proposito: "Stops the automatic process at critical points to require your explicit approval.", input: "A sensitive decision condition or an action with impact.", output: "An approval alert so you stay in control." }
        ]
      },
      {
        n: 4,
        titulo: "Quality, governance and security",
        descripcion: "Verification of results, protection of your area's confidential data, and security inspection.",
        valor: "It ensures confidential information is protected by masking personal data and auditing digital keys, and introduces a verification gate that makes sure your project is only considered finished when it actually works.",
        filas: [
          { skill: "Synthetic Data & Privacy Guard", proposito: "Hides or anonymizes personal (PII) or confidential information before you consult an AI.", input: "Documents or spreadsheets with sensitive data.", output: "Safe, protected material to use in your development." },
          { skill: "Secrets & Security Audit", glosario: 8, proposito: "Checks that your project does not expose API keys, passwords or unauthorized access.", input: "Configuration files, scripts or prompts.", output: "A security report with concrete recommendations." },
          { skill: "Verification Gate", proposito: "Makes sure your project meets the agreed success criteria before it goes live.", input: "The final result + your acceptance criteria.", output: "A validation matrix with evidence that it works." }
        ]
      },
      {
        n: 5,
        titulo: "Documentation, communication and portability",
        descripcion: "Tools to package the knowledge from your development, present progress to your team and take your project wherever you want.",
        valor: "It makes it easy to share results with colleagues or management through executive reports and simple instructions, and with the portable JSON file you can download the exact state of your project and resume it whenever you want, without depending on servers.",
        filas: [
          { skill: "SOP Generator", proposito: "Turns your project's validated flow into a Standard Operating Procedure for your team.", input: "Steps and rules already tested.", output: "A clear instruction document, applicable in your area." },
          { skill: "Executive Presentation Builder", proposito: "Turns your project's story and results into a structured presentation for management.", input: "Data, hours saved and the logic of your project.", output: "A script and executive report ready to present." },
          { skill: "JSON Project Expedition", glosario: 10, proposito: "Packs all your project's progress into a light .json file to save and load whenever you want.", input: "Your answers and progress saved in the guide.", output: "A portable .json file: your project's memory, in your hands." }
        ]
      }
    ],

    gobernanza: [
      { t: "Your information is yours (no central server)", d: "The app does not store your data or credentials on servers. Your project's entire memory travels with you in your .json file." },
      { t: "Clarity before building", d: "No task in your area should be automated without first defining its inputs, its transformation steps and its human review points." },
      { t: "Progressive growth", d: "You can start by solving a simple writing task (Level 1) and evolve towards automations or more advanced assistants (Levels 2, 3 and 4) as your needs require." }
    ],

    glosario: [
      {
        n: 1, termino: "Plugins (function integrations)",
        que: "An extra package or extension you connect to your AI so it learns to perform specific actions.",
        para: "It gives your assistant advanced abilities: converting files to PDF, sending corporate emails or processing spreadsheets.",
        ej: "A plugin that lets the AI read your pending-items table in Excel, spot overdue tasks and prepare a draft notification."
      },
      {
        n: 2, termino: "MCP — Model Context Protocol (technical connectors)",
        que: "A standardized \"safety plug\" that links the AI directly to your company's files and systems.",
        para: "It lets the AI read or update real information from your work in real time, without copying and pasting by hand.",
        ej: "A connector that reaches your department's folder on Drive, finds this month's sales report and extracts the key indicators."
      },
      {
        n: 3, termino: "GitHub repositories",
        que: "A secure digital folder where you keep, organize and track every change in your project.",
        para: "It stops you losing your file history or ending up with folders named project_final_FINAL.docx.",
        ej: "A private repository where your team keeps the master prompts and office scripts, always knowing which is the current version."
      },
      {
        n: 4, termino: "Skills (reusable instructions)",
        que: "Predefined guidelines or \"recipes\" that teach the AI to solve a task always to the same standard.",
        para: "It guarantees that the answers for your area keep the same tone, structure and quality level.",
        ej: "A skill holding your company's rules that reviews email drafts and adapts them to the official tone before sending."
      },
      {
        n: 5, termino: "Prompt chaining (instruction chains)",
        que: "Splitting the work into several consecutive steps, where the result of one feeds the next.",
        para: "It stops the AI getting confused or delivering incomplete results on long or complex tasks.",
        ej: "Step 1: extract the agreements from minutes. Step 2: write the task list. Step 3: assign owners and dates in a table."
      },
      {
        n: 6, termino: "Human-in-the-Loop (human control)",
        que: "A rule where the system stops and asks for your review and explicit approval before an important action.",
        para: "It gives you the peace of mind that the automation will not take sensitive decisions without your consent.",
        ej: "The AI prepares the monthly expense summary, but requires you to click \"Approve\" before it goes to Accounting."
      },
      {
        n: 7, termino: "Dry run (risk-free simulation)",
        que: "A test where your automation runs all its steps but without modifying, saving or sending real data.",
        para: "It lets you check the logic works without risking important files in your department.",
        ej: "Testing the client reminder flow to verify names and balances, without sending a single real email."
      },
      {
        n: 8, termino: "API keys and secrets (digital keys)",
        que: "A confidential code that acts as the password for your project to connect with an AI service.",
        para: "It identifies your user or company and allows authorized usage to be managed safely.",
        ej: "Keeping your institutional account key somewhere protected, never written inside a file that gets shared."
      },
      {
        n: 9, termino: "Scaffolding (structured templates)",
        que: "The pre-designed skeleton or structure that gives your project order, hierarchy and clean formatting from the very start.",
        para: "It frees you from the blank-page block and makes sure your development follows a professional standard.",
        ej: "A base template for data analysis that already includes folders for source files, prompts and final reports."
      },
      {
        n: 10, termino: "Portable JSON (progress with no server memory)",
        que: "A light, orderly text file holding all your project's answers, settings and ideas.",
        para: "It lets you save your progress on your computer and load it again the next day, with complete privacy.",
        ej: "Downloading my_project_finance_area.json at the end of the day and loading it next morning to carry on where you left off."
      }
    ]
  };

  const PRESENTACION = {
    audiencias: [
      { id: "jefatura", nombre: "Management / leadership", enfoque: "They go straight to the result and the cost. Put the big number first and the technical detail at the end, only if they ask.", pide: "Use business language, not technical. Open with the annual saving and close with what decision I need from them." },
      { id: "equipo", nombre: "My team", enfoque: "They care about how their day changes and whether they will have to learn something new.", pide: "Use a close, concrete tone. Explain which task stops being done by hand and what new steps appear." },
      { id: "comite", nombre: "Committee or several areas", enfoque: "A mix of profiles: someone measures money, someone measures risk and someone measures effort.", pide: "Balance the three views: financial result, quality/security control and adoption effort." },
      { id: "cliente-interno", nombre: "Internal client", enfoque: "They care about what they receive differently and when, not how it works inside.", pide: "Focus on the service they get: what improves, how fast, and who they contact if something fails." }
    ],
    objetivos: [
      { id: "escalar", nombre: "Scale to other areas", pide: "The closing must propose replicating this in other areas: what would be needed, in what order, and what can be reused as is." },
      { id: "consolidar", nombre: "Consolidate the pilot", pide: "The closing must ask to move from trial to steady use: what is left to validate, who approves it and from when." },
      { id: "recursos", nombre: "Ask for time or resources", pide: "The closing must make a concrete, bounded request (hours, a licence, technical support), justified by the return already measured." },
      { id: "compartir", nombre: "Share what we learned", pide: "The closing must leave the method repeatable: what I learned, what I would do the same way again and what I would avoid." }
    ],
    estilo: [
      "A sober three-colour palette: a deep blue for headings, neutral grey for body text, and a single accent (green) reserved for the saving figures.",
      "One idea per slide. If something needs two, it is two slides.",
      "A single headline figure per slide, in a much larger size than the rest.",
      "At most 3 bullets per slide and at most 2 lines per bullet.",
      "No generic logos, no stock photos and no decorative icons that add no information.",
      "Before/after comparisons always in the same order and at the same scale, so they read at a glance."
    ],
    slides: [
      { n: 1, icono: "🟢", titulo: "Cover and headline impact", enfoque: "The project headline and the number that sums it all up. Anyone who only sees this slide must understand the result." },
      { n: 2, icono: "🔴", titulo: "The starting point", enfoque: "How the work was done before: the manual tasks, how much time they consumed and what broke often. No drama, just the figure." },
      { n: 3, icono: "⚙️", titulo: "The solution implemented", enfoque: "What was built, with what approach, and what quality and privacy controls it has. In office language, not technical." },
      { n: 4, icono: "📊", titulo: "Before vs. after", enfoque: "The task-by-task contrast between the original time and the current one, with the total highlighted." },
      { n: 5, icono: "🚀", titulo: "Return and what comes next", enfoque: "The accumulated return, what the freed time is used for, and the concrete ask in the closing." }
    ]
  };

  const DUDAS_FRECUENTES = [
    { id: "no-entiendo", t: "I do not understand what a part of the result does" },
    { id: "no-se-usar", t: "I do not know how to use it day to day" },
    { id: "falla", t: "It fails or gives an error I cannot interpret" },
    { id: "datos", t: "I do not know where each input goes" },
    { id: "modificar", t: "I do not know where to touch if a rule changes" },
    { id: "compartir", t: "I do not know if I can share it with my team as it is" },
    { id: "mantener", t: "I do not know who maintains it if I am away" }
  ];

  const GUIAS = {
    "Nivel 1": `
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>Architecture and basic concepts</strong></p>
          <p style="font-size: .85rem; color: var(--color-text);">At this level the approach is conversational (chat). The AI acts as an analyst or reviewer. You do not need complex technical integrations — you simply have to provide clear context and the draft of what you want to improve.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>💡 What to ask the AI for</strong></p>
          <ul class="hint-list">
            <li>Ask it to suggest an optimal structure for your type of document or presentation (table of contents, chapters).</li>
            <li>Define the <strong>audience</strong> (e.g. executives, clients) and ask it to adjust tone and vocabulary accordingly.</li>
            <li>Request a <em>brainstorming</em> round (guided idea generation) before the AI produces the final structured content.</li>
          </ul>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>⚠️ Precautions and judgement</strong></p>
          <ul class="hint-list">
            <li><strong>Building judgement:</strong> you cannot build judgement without reading and analysing the discrepancies in what the AI answers. Review each response carefully — AI is prone to inventing data that sounds convincing.</li>
            <li><strong>Data security:</strong> under no circumstances put confidential company data (real commercial margins, raw balance sheets, passwords) into the chat window. Use made-up names (synthetic data) such as "Company X".</li>
            <li><strong>Turn what worked into a template:</strong> when a document comes out well, save those instructions as a reusable <em>skill</em> (system instructions or a project) instead of rewriting them from memory next time.</li>
          </ul>
        </div>
      `,
    "Nivel 2": `
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>Architecture and basic concepts</strong></p>
          <p style="font-size: .85rem; color: var(--color-text);">The AI will act as your copilot developer. This is about building automations through simple code (macros, Python, Google Apps Script) where the AI generates the code and you test it and put it to work in a traditional system.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>💡 What to ask the AI for</strong></p>
          <ul class="hint-list">
            <li>Ask it to design small <strong>blocks of code</strong> ("functions") that do one thing at a time (divide and conquer). Do not ask for the whole system in your first message.</li>
            <li>Ask for the code to be heavily <strong>commented</strong>. If you do not understand what a crucial line does, demand an explanation in simple metaphors before running it.</li>
          </ul>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>⚠️ Precautions and judgement</strong></p>
          <ul class="hint-list">
            <li><strong>Saving tokens and context:</strong> do not send giant walls of code if you know the error is in a single line. Isolating the section frees up context and reduces confusion.</li>
            <li><strong>Testing the code:</strong> test each step (a manual unit test) using test spreadsheets and variables (a sandbox). <em>Never run new code straight against real databases or production systems</em>.</li>
            <li><strong>Building judgement:</strong> when using AI to debug, do not paste the errors blindly; think it through with the tool. That is how you build an algorithmic intuition for why certain things fail.</li>
          </ul>
        </div>
      `,
    "Nivel 3": `
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>Architecture and basic concepts</strong></p>
          <p style="font-size: .85rem; color: var(--color-text);">Here the AI acts as a tool designer. You are going to build a utility other people use without knowing what is underneath: a local HTML/JS file that opens with a double click, an Excel workbook with buttons, or an indicator panel. The logic stops living in a conversation and moves inside the tool, which always calculates the same way.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>💡 What to ask the AI for</strong></p>
          <ul class="hint-list">
            <li>Demand a <strong>single self-contained file</strong>, with no installations or internet dependencies: in many offices you will not be able to install anything or open ports.</li>
            <li>Define up front the <strong>3 to 5 indicators</strong> that go on top and clearly visible; the rest is secondary detail.</li>
            <li>Ask it to <strong>validate what the user loads</strong> (empty fields, badly written dates, duplicates) and to warn with a clear message instead of showing a wrong result.</li>
            <li>Ask it to point out <strong>exactly where to edit</strong> to change a formula or a threshold, so you do not depend on the AI every time a rule changes.</li>
            <li>If any step of the tool involves AI analysis, ask for that step to be left as a <strong>fixed instruction template</strong> (a skill), with an exact output format, rather than being written differently each time.</li>
          </ul>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>⚠️ Precautions and judgement</strong></p>
          <ul class="hint-list">
            <li><strong>Data inside the file:</strong> if you are going to share the tool, check it does not carry real data pasted inside. Distribute it empty and let each person load their own file.</li>
            <li><strong>Test the edge cases:</strong> zero records, one record, negative values, and text where you expected numbers. A tool that breaks in front of your boss loses all credibility.</li>
            <li><strong>Building judgement:</strong> ask it to explain the formula in words and verify it by hand with a case you already know. If the number does not match your manual calculation, the error is in the rule, not in whoever uses it.</li>
          </ul>
        </div>
      `,
    "Nivel 4": `
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>Architecture and basic concepts</strong></p>
          <p style="font-size: .85rem; color: var(--color-text);">Implementing autonomous agents integrated with tools (MCP, APIs, direct plugins). The AI acts as a cognitive orchestrator: it reads options, generates its own internal reasoning, calls systems to extract data or operate, and interacts with the end user independently (agentic workflow). It demands serious governance.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>💡 What to ask the AI when planning</strong></p>
          <ul class="hint-list">
            <li>In your first round, ask the AI to act as an enterprise architect: to diagram and audit the modular architecture, detailing each component and external tool required (databases to be affected, APIs to be called).</li>
            <li>Ask for "self-correction" instructions and <em>human escalation</em> mechanisms, forcing the autonomy to stop and raise a trigger if it detects an unmapped margin of uncertainty.</li>
          </ul>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>⚠️ Precautions and strict judgement</strong></p>
          <ul class="hint-list">
            <li><strong>From micro-management to macro-management:</strong> building judgement as an orchestrator at this level means understanding failure patterns rather than running the flows yourself. You delegate based on the agent's reports, but you supervise the real metric.</li>
            <li><strong>Limits and consumption (circuit breakers):</strong> a stuck agent can enter an infinite <em>loop</em> that burns through the token quota. You must force robust logs and set hard caps on attempts before a preventive shutdown (kill switch).</li>
            <li><strong>Least privilege and approval:</strong> never expose mutation of critical databases without a human approval middleware embedded in the flow (human-in-the-loop) as an absolute rule for this kind of early pilot.</li>
          </ul>
        </div>
      `
  };

  window.AIPG_CONTENIDO = window.AIPG_CONTENIDO || {};
  window.AIPG_CONTENIDO.en = { SUGERENCIAS, IA_GUIA, CATALOGO, PRESENTACION, DUDAS_FRECUENTES, GUIAS };
})();
