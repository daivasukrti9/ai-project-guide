/* ==========================================================================
   AI Project Guide — conteúdo editorial (português)

   Mesma estrutura de contenido-guias.js (espanhol), que é a fonte de
   verdade. Ids, chaves de nível e números do glossário têm que coincidir:
   tests/verificar-contenido.js falha se algum se desviar.
   ========================================================================== */

(() => {
  "use strict";

  const SUGERENCIAS = {
    "Nivel 1": {
      etiqueta: "Opção A · Apresentação / Documento",
      lede: "Ideal para transformar anotações soltas, dados ou ideias dispersas em um entregável formal, de leitura clara e apresentação impecável.",
      estrategia: [
        { t: "Foco no público", d: "Definir se o documento é para a alta direção (sintético), clientes (comercial), equipe operacional (passo a passo) ou auditoria (rigoroso)." },
        { t: "Estrutura narrativa modular", d: "Escolher um esquema comprovado: Problema → Diagnóstico → Solução → ROI → Plano de ação; ou Resumo executivo → Situação atual → Matriz de opções → Recomendação." },
        { t: "Tom e estilo corporativo", d: "Definir de antemão o registro: executivo direto, técnico explicativo, persuasivo comercial ou memorando formal." },
        { t: "Decomposição narrativa (prompt chaining)", d: "Pedir primeiro o índice estruturado e aprová-lo, antes de a IA redigir o conteúdo extenso." }
      ],
      recursos: [
        { t: "Formato do entregável", d: "Rascunho em Markdown (.md), documento em Word (.docx), roteiro por slides (.pptx) ou rascunho de e-mail para a diretoria." },
        { t: "Insumos de origem", d: "Notas de reuniões, transcrições de áudio, PDFs de referência ou tabelas de dados iniciais." }
      ],
      ideas: [
        { id: "a1", t: "Proposta executiva em 5 seções", d: "Problema, diagnóstico, solução, ROI e plano de ação, com um resumo de uma página no início." },
        { id: "a2", t: "Ata de reunião → lista de acordos", d: "Converter uma transcrição longa em acordos, responsáveis e prazos." },
        { id: "a3", t: "Relatório de status periódico", d: "Modelo fixo preenchido toda semana ou mês com os mesmos indicadores, para poder comparar." },
        { id: "a4", t: "Apresentação para a diretoria", d: "Roteiro por slide: mensagem-chave, o dado que a sustenta e qual decisão se pede." },
        { id: "a5", t: "Instrutivo / POP para a equipe", d: "Passo a passo do procedimento com capturas, exceções e a quem escalar." },
        { id: "a6", t: "Resumo de documento extenso", d: "Contrato, norma ou manual reduzido ao que afeta a sua área, citando o trecho original." },
        { id: "a7", t: "Reescrita com tom corporativo", d: "Adaptar seus próprios rascunhos ao registro oficial da empresa antes de enviá-los." }
      ],
      prompt: {
        rol: "um Consultor Estratégico Sênior",
        encargo: "Ajude-me a redigir uma Proposta Executiva estruturada por seções. Use um tom profissional, conciso e verificável.",
        exigencia: "Mostre primeiro o índice e espere minha aprovação antes de desenvolver cada seção. Marque com [PENDENTE DE VALIDAÇÃO] qualquer dado que eu não tenha fornecido."
      }
    },

    "Nivel 2": {
      etiqueta: "Opção B · Automação",
      lede: "Ideal para eliminar a carga repetitiva de escritório: copiar/colar entre planilhas, mover ou renomear arquivos, enviar e-mails periódicos ou processar dados.",
      estrategia: [
        { t: "Disparador ou frequência", d: "Definir se o fluxo é acionado em um horário fixo, ao receber um e-mail com anexo, ou manualmente com um botão." },
        { t: "Sequência lógica limpa", d: "Mapear o fluxo com o esquema universal: Entrada de dados → Regra de transformação → Ponto de validação → Salvar/Enviar." },
        { t: "Revisão humana obrigatória", d: "Configurar uma pausa que peça autorização antes de ações irreversíveis: enviar e-mails a clientes, apagar registros ou alterar a base principal." },
        { t: "Simulação sem risco (dry run)", d: "Pedir um modo de teste que imprima o que o fluxo faria sem alterar nenhum dado real." }
      ],
      recursos: [
        { t: "Ecossistema acessível de escritório", d: "Scripts de Python locais, macros VBA ou fórmulas avançadas de Excel, Google Apps Script ou fluxos no Power Automate." },
        { t: "Tratamento amigável de erros", d: "Decidir de antemão o que acontece se faltar um arquivo ou uma célula vier vazia: notificar, pular a linha e continuar, ou parar." }
      ],
      ideas: [
        { id: "b1", t: "Consolidar várias planilhas em uma", d: "Unir arquivos com a mesma estrutura em uma tabela mestra, avisando sobre linhas que não encaixam." },
        { id: "b2", t: "Renomear e arquivar documentos", d: "Mover arquivos para pastas por data ou cliente, aplicando uma convenção de nomes única." },
        { id: "b3", t: "E-mail periódico automático", d: "Enviar um resumo recorrente a uma lista fixa, com pausa de aprovação antes do envio." },
        { id: "b4", t: "Extrair dados de anexos", d: "Ler notas fiscais ou formulários que chegam por e-mail e lançar os campos em uma planilha." },
        { id: "b5", t: "Validador de dados antes de carregar", d: "Checar duplicatas, formatos de data e campos vazios, devolvendo um relatório de erros." },
        { id: "b6", t: "Lembretes por vencimento", d: "Detectar datas próximas do vencimento e gerar os avisos correspondentes." },
        { id: "b7", t: "Conciliação entre duas fontes", d: "Comparar duas listas e marcar diferenças, faltantes e coincidências parciais." }
      ],
      prompt: {
        rol: "um Especialista em Automação de Escritório",
        encargo: "Projete uma sequência lógica passo a passo (e o script correspondente) que automatize o processo descrito.",
        exigencia: "Entregue em funções pequenas, de uma única responsabilidade, bem comentadas. Inclua um modo dry-run e uma pausa de validação humana antes de salvar ou enviar qualquer coisa."
      }
    },

    "Nivel 3": {
      etiqueta: "Opção C · Ferramenta / Visualização",
      lede: "Ideal para construir utilitários interativos de escritório: calculadoras dinâmicas, dashboards, modelos interativos, buscadores ou simuladores.",
      estrategia: [
        { t: "Tipo de interface", d: "Pasta de trabalho do Excel com botões/macros, calculadora web local em um único arquivo HTML/JS sem servidor, ou dashboard interativo de gráficos." },
        { t: "Controles e interação", d: "Filtros de busca rápida, listas suspensas condicionadas, campos numéricos com cálculo automático ou barras de progresso." },
        { t: "Métricas e KPIs principais", d: "Escolher de 3 a 5 indicadores em destaque: total processado, % de desvio, semáforo de alertas." },
        { t: "Portabilidade e simplicidade", d: "Garantir que abra em qualquer computador da empresa sem instalar programas nem exigir permissão de administrador." },
        { t: "Instrução reutilizável (skill)", d: "Se a ferramenta incluir uma etapa de análise com IA, fixar essa etapa como modelo de instruções com formato de saída exato, em vez de escrevê-la diferente a cada vez." }
      ],
      recursos: [
        { t: "Origem dos dados", d: "Listas ou tabelas CSV/Excel carregadas diretamente na ferramenta, sem banco de dados." },
        { t: "Visualização dinâmica", d: "Gráficos simples integrados (Chart.js para web local, gráficos nativos do Excel) e botão de exportação para PDF ou Excel." }
      ],
      ideas: [
        { id: "c1", t: "Calculadora em um único arquivo HTML", d: "Formulário de entrada + cálculo + resultado em destaque; abre com clique duplo e funciona offline." },
        { id: "c2", t: "Dashboard de acompanhamento", d: "Três a cinco KPIs no topo e o detalhe filtrável abaixo, alimentado por um CSV exportado." },
        { id: "c3", t: "Buscador interno de informação", d: "Caixa de busca sobre uma lista própria (preços, códigos, normas) com resultados instantâneos." },
        { id: "c4", t: "Simulador de cenários", d: "Mover variáveis e ver o impacto no resultado, para comparar opções antes de decidir." },
        { id: "c5", t: "Modelo de Excel com botões", d: "Formulário de carga, validações e uma macro que monta o relatório final." },
        { id: "c6", t: "Checklist interativa com progresso", d: "Lista de verificação que salva o avanço e mostra a porcentagem concluída." },
        { id: "c7", t: "Visualizador comparativo antes/depois", d: "Gráfico que contrasta a operação manual atual com a proposta, para defender o projeto." }
      ],
      prompt: {
        rol: "um Designer de Ferramentas e UX de Escritório",
        encargo: "Ajude-me a criar uma ferramenta interativa em um único arquivo HTML/JS local (ou como modelo de Excel) que calcule e visualize os indicadores descritos.",
        exigencia: "Inclua um formulário de entrada intuitivo, um gráfico de resumo e validação dos dados carregados. Sem dependências de rede: precisa funcionar abrindo o arquivo diretamente."
      }
    },

    "Nivel 4": {
      etiqueta: "Opção D · Agente / Autônomo",
      lede: "Ideal para configurar um assistente com papel especialista específico (assessor de compras, auditor de contratos, tutor de normas) capaz de raciocinar em vários passos.",
      estrategia: [
        { t: "Papel e personalidade", d: "Definir a identidade do agente na instrução de sistema: \"Você é um Auditor Sênior especializado em Controle Interno\"." },
        { t: "Regras e limites de segurança (guardrails)", d: "Estabelecer quais temas pode responder, quais deve recusar e quais dados nunca deve revelar." },
        { t: "Decomposição do raciocínio", d: "Instruir que, diante de uma consulta complexa, primeiro divida a solicitação em subpassos e os mostre." },
        { t: "Base de conhecimento (context engineering)", d: "Anexar guias, regulamentos, manuais ou perguntas frequentes da empresa como referência estrita." },
        { t: "Instrução reutilizável (skill)", d: "Versionar o system prompt como mais um arquivo do projeto: corrigi-lo com as falhas reais detectadas, não reescrevê-lo de memória." }
      ],
      recursos: [
        { t: "Ambiente de configuração", d: "GPTs personalizados no ChatGPT, Projetos no Claude, Gems no Gemini ou assistentes em plataformas internas." },
        { t: "Conectores técnicos opcionais (MCP / APIs)", d: "Ligação com armazenamento (Drive, pastas de rede), sempre após revisão de segurança das permissões." }
      ],
      ideas: [
        { id: "d1", t: "Assistente de consulta normativa", d: "Responde somente com base nos regulamentos carregados e cita o trecho exato de onde sai a resposta." },
        { id: "d2", t: "Auditor de documentos", d: "Revisa contratos ou processos contra uma checklist fixa e devolve achados classificados por severidade." },
        { id: "d3", t: "Assessor de compras / fornecedores", d: "Compara cotações segundo critérios definidos e justifica a recomendação." },
        { id: "d4", t: "Tutor de integração", d: "Acompanha pessoas novas resolvendo dúvidas do procedimento com o material oficial da área." },
        { id: "d5", t: "Triagem de solicitações", d: "Classifica pedidos por tipo e urgência e propõe o responsável, sempre com aprovação humana final." },
        { id: "d6", t: "Agente com escalonamento humano", d: "Para e avisa quando detecta um caso fora do mapeado, em vez de improvisar." },
        { id: "d7", t: "Revisor antes do envio", d: "Último controle de qualidade sobre entregáveis: formato, dados sensíveis e critérios de aceitação." }
      ],
      prompt: {
        rol: "um Arquiteto de Agentes de IA",
        encargo: "Redija as \"Instruções do Sistema\" para um assistente virtual especialista no que foi descrito.",
        exigencia: "Defina seu papel, tom corporativo, método de raciocínio passo a passo, o que deve recusar e o mecanismo de escalonamento humano quando detectar incerteza. Acrescente um limite de tentativas antes de parar."
      }
    }
  };

  const IA_GUIA = [
    { id: "chatgpt", nombre: "ChatGPT (OpenAI)", fortaleza: "Redação fluente, estruturação conceitual e primeiros rascunhos de scripts.", ideal: ["Nivel 1", "Nivel 2"] },
    { id: "claude", nombre: "Claude (Anthropic)", fortaleza: "Análise profunda de documentos extensos, redação apurada e lógica/código limpo.", ideal: ["Nivel 1", "Nivel 3"] },
    { id: "gemini", nombre: "Gemini (Google)", fortaleza: "Integração com o ecossistema Google (Docs, Drive, Gmail) e busca de informação.", ideal: ["Nivel 1", "Nivel 4"] },
    { id: "deepseek", nombre: "DeepSeek / Cursor", fortaleza: "Desenvolvimento de código, macros avançadas e scripts de automação técnica.", ideal: ["Nivel 2", "Nivel 3"] }
  ];

  const CATALOGO = {
    titulo: "Catálogo de Recursos para o Seu Projeto",
    bajada: "Este guia não é um aplicativo que substitui o seu trabalho: é o método e a caixa de ferramentas que lhe dá as estruturas, habilidades (skills) e conceitos-chave para transformar qualquer ideia em um roteiro claro, pronto para automatizar ou potencializar com IA no seu próprio ritmo.",

    esquema: {
      titulo: "Esquema universal de operação",
      lede: "Método de quatro etapas que define a rota lógica para abordar seu projeto ou processo digital, seja qual for sua área ou nível técnico. Transforma insumos desorganizados (e-mails, planilhas, arquivos) em um projeto estruturado, com rastreabilidade e controle humano em cada passo.",
      pasos: [
        { icono: "📥", clave: "Entradas (Input)", d: "Os dados de origem, documentos mestres, planilhas, e-mails ou solicitações com que você já trabalha na sua área." },
        { icono: "⚙️", clave: "Transformação (Skill)", d: "As regras de negócio e a lógica passo a passo que ensinam a ferramenta a processar sua informação sem ambiguidades.", glosario: 4 },
        { icono: "🛡️", clave: "Ponto de controle (Gate)", d: "As barreiras de revisão onde você verifica a qualidade, protege dados sensíveis e aprova os resultados.", glosario: 6 },
        { icono: "📤", clave: "Saída (Output)", d: "O entregável final: um relatório, um script, uma tabela de decisão ou um arquivo JSON portátil — sem deixar dados em servidores externos.", glosario: 10 }
      ]
    },

    areas: [
      {
        n: 1,
        titulo: "Gestão, estratégia e descoberta de processos",
        descripcion: "Ferramentas para diagnosticar o estado atual do seu trabalho, medir o tempo real que você dedica a cada tarefa e focar o escopo do projeto.",
        valor: "Antes de construir ou aplicar qualquer tecnologia, esta seção ajuda a entender a realidade do seu processo diário, identificar sobrecarga e aplicar a regra 80/20 para liberar tempo livre real.",
        filas: [
          { skill: "Project Intake", proposito: "Transforma sua ideia dispersa em objetivo claro, problema central, escopo e restrições.", input: "Descrição em texto livre do que você quer resolver.", output: "Dossiê base e estruturado do seu projeto." },
          { skill: "Capacity & Workload Planner", proposito: "Mapeia suas tarefas cotidianas, calcula seu tempo livre real e prioriza o que vale automatizar.", input: "Lista das suas atividades semanais e horas estimadas.", output: "Matriz de disponibilidade e lista priorizada de automações." },
          { skill: "Phase Gate Control", proposito: "Estabelece os requisitos mínimos que seu projeto deve cumprir antes de mudar de fase.", input: "Checklist de verificação e evidências.", output: "Aprovação ou pausa guiada do seu desenvolvimento." }
        ]
      },
      {
        n: 2,
        titulo: "Construção, lógica e clareza técnica",
        descripcion: "Recursos para estruturar a lógica da sua solução com modelos limpos e diagnosticar erros sem ruído técnico.",
        valor: "Oferece esqueletos de trabalho pré-desenhados (scaffolding) para evitar desordem nos seus arquivos, fórmulas ou código, e orienta você a entender por que os erros acontecem ao trabalhar com IA — sem precisar ser programador.",
        filas: [
          { skill: "Intelligent Scaffolding", glosario: 9, proposito: "Fornece o modelo ou estrutura base ideal para o seu tipo de projeto, evitando começar do zero.", input: "Tipo de solução escolhida e parâmetros da sua área.", output: "Estrutura modular e limpa, pronta para personalizar." },
          { skill: "GitHub Repositories", glosario: 3, proposito: "Repositórios digitais seguros para guardar, versionar e compartilhar o código ou modelos do seu projeto.", input: "Scripts, códigos, modelos ou documentos do seu trabalho.", output: "Repositório organizado com histórico de versões." },
          { skill: "Clean Logic & Refactoring", proposito: "Revisa e simplifica as regras de negócio do seu projeto, eliminando passos redundantes.", input: "Rascunho da lógica, fórmulas de Excel ou prompts iniciais.", output: "Lógica otimizada, fácil de ler e manter pela sua equipe." },
          { skill: "Bug & Error Diagnostic", proposito: "Orienta você a interpretar mensagens de erro e identificar a causa raiz ao desenvolver com IA.", input: "Texto do erro + contexto do passo que falhou.", output: "Explicação simples do problema e opções claras de solução." }
        ]
      },
      {
        n: 3,
        titulo: "Automação e fluxos de trabalho",
        descripcion: "Mecanismos para conectar as ferramentas do seu escritório e delegar tarefas repetitivas por meio de fluxos de execução seguros.",
        valor: "Permite conectar seu projeto com o que você já usa (Excel, Drive, e-mail) por meio de integrações e conectores diretos, com testes simulados que não alteram dados reais e controle humano nos pontos críticos.",
        filas: [
          { skill: "Workflow Simulator (Dry Run)", glosario: 7, proposito: "Simula a execução da sua automação sem modificar dados reais.", input: "Passos do fluxo e dados de teste.", output: "Relatório de ensaio sem nenhum risco para sua informação." },
          { skill: "Plugins (Integrações)", glosario: 1, proposito: "Agrupa funções para que a IA escolhida possa realizar tarefas avançadas dentro do seu projeto.", input: "Permissões e ferramentas de que seu projeto precisa.", output: "Capacidades ampliadas para executar tarefas específicas." },
          { skill: "MCP Connectors", glosario: 2, proposito: "Conexão técnica direta e segura entre sua IA e os arquivos da sua empresa.", input: "Configuração e parâmetros de acesso da sua ferramenta.", output: "Acesso a informação em tempo real para o seu projeto." },
          { skill: "Human-in-the-Loop Gate", glosario: 6, proposito: "Interrompe o processo automático em pontos críticos para exigir sua aprovação explícita.", input: "Condição de decisão delicada ou ação de impacto.", output: "Alerta de aprovação para que você mantenha o controle." }
        ]
      },
      {
        n: 4,
        titulo: "Qualidade, governança e segurança",
        descripcion: "Verificação de resultados, proteção de dados confidenciais da sua área e inspeção de segurança.",
        valor: "Garante que a informação confidencial esteja protegida com mascaramento de dados pessoais e auditoria de chaves digitais, e introduz uma comporta de verificação que assegura que seu projeto só seja dado por concluído quando funcionar.",
        filas: [
          { skill: "Synthetic Data & Privacy Guard", proposito: "Oculta ou anonimiza informação pessoal (PII) ou confidencial antes de consultar uma IA.", input: "Documentos ou planilhas com dados sensíveis.", output: "Insumo seguro e protegido para usar no seu desenvolvimento." },
          { skill: "Secrets & Security Audit", glosario: 8, proposito: "Verifica que seu projeto não exponha chaves de API, senhas nem acessos não autorizados.", input: "Arquivos de configuração, scripts ou prompts.", output: "Relatório de segurança com recomendações concretas." },
          { skill: "Verification Gate", proposito: "Assegura que seu projeto cumpra os critérios de sucesso acordados antes de entrar em operação.", input: "Resultado final + seus critérios de aceitação.", output: "Matriz de validação com evidência de funcionamento." }
        ]
      },
      {
        n: 5,
        titulo: "Documentação, comunicação e portabilidade",
        descripcion: "Ferramentas para empacotar o conhecimento do seu desenvolvimento, apresentar avanços à sua equipe e levar seu projeto para onde quiser.",
        valor: "Facilita compartilhar os resultados com colegas ou superiores por meio de relatórios executivos e instrutivos simples, e com o arquivo JSON portátil você baixa o estado exato do seu projeto e o retoma quando quiser, sem depender de servidores.",
        filas: [
          { skill: "SOP Generator", proposito: "Converte o fluxo validado do seu projeto em um Procedimento Operacional Padrão para a sua equipe.", input: "Passos e regras já testados.", output: "Documento instrutivo claro e aplicável na sua área." },
          { skill: "Executive Presentation Builder", proposito: "Transforma a história e os resultados do seu projeto em uma apresentação estruturada para a diretoria.", input: "Dados, horas economizadas e lógica do seu projeto.", output: "Roteiro e relatório executivo prontos para apresentar." },
          { skill: "JSON Project Expedition", glosario: 10, proposito: "Empacota todo o avanço do seu projeto em um arquivo .json leve, para salvar e carregar quando quiser.", input: "Suas respostas e avanços salvos no guia.", output: "Arquivo .json portátil: a memória do seu projeto nas suas mãos." }
        ]
      }
    ],

    gobernanza: [
      { t: "Sua informação é sua (sem servidor central)", d: "O app não armazena seus dados nem credenciais em servidores. Toda a memória do seu projeto viaja com você no seu arquivo .json." },
      { t: "Clareza antes de construir", d: "Nenhuma tarefa da sua área deveria ser automatizada sem antes definir suas entradas, seus passos de transformação e seus pontos de revisão humana." },
      { t: "Crescimento progressivo", d: "Você pode começar resolvendo uma tarefa simples de redação (Nível 1) e evoluir para automações ou assistentes mais avançados (Níveis 2, 3 e 4) conforme a necessidade." }
    ],

    glosario: [
      {
        n: 1, termino: "Plugins (integrações de funções)",
        que: "Um pacote ou extensão adicional que você conecta à sua IA para que ela aprenda a realizar ações específicas.",
        para: "Dá habilidades avançadas ao seu assistente: converter arquivos em PDF, enviar e-mails corporativos ou processar planilhas.",
        ej: "Um plugin que permite à IA ler sua tabela de pendências no Excel, identificar as tarefas vencidas e preparar um rascunho de notificação."
      },
      {
        n: 2, termino: "MCP — Model Context Protocol (conectores técnicos)",
        que: "Uma \"tomada de segurança\" padronizada que liga a IA diretamente aos arquivos e sistemas da sua empresa.",
        para: "Permite que a IA consulte ou atualize informação real do seu trabalho em tempo real, sem copiar e colar à mão.",
        ej: "Um conector que acessa a pasta do seu departamento no Drive, busca o relatório de vendas do mês e extrai os indicadores-chave."
      },
      {
        n: 3, termino: "Repositórios do GitHub",
        que: "Uma pasta digital segura onde você guarda, organiza e mantém o registro de todas as mudanças do seu projeto.",
        para: "Evita perder o histórico dos seus arquivos ou a bagunça de pastas com nomes como projeto_final_FINAL.docx.",
        ej: "Um repositório privado onde sua equipe guarda os prompts mestres e scripts do escritório, sabendo sempre qual é a versão vigente."
      },
      {
        n: 4, termino: "Skills (instruções reutilizáveis)",
        que: "Guias de conduta ou \"receitas\" predefinidas que ensinam a IA a resolver uma tarefa sempre no mesmo padrão.",
        para: "Garante que as respostas para a sua área mantenham o mesmo tom, estrutura e nível de qualidade.",
        ej: "Uma skill com as normas da sua empresa que revisa os rascunhos de e-mails e os adapta ao tom oficial antes do envio."
      },
      {
        n: 5, termino: "Prompt chaining (cadeias de instruções)",
        que: "Dividir o trabalho em vários passos consecutivos, em que o resultado de um é o insumo do seguinte.",
        para: "Evita que a IA se confunda ou entregue resultados incompletos em tarefas longas ou complexas.",
        ej: "Passo 1: extrair os acordos de uma ata. Passo 2: redigir a lista de tarefas. Passo 3: atribuir responsáveis e datas em uma tabela."
      },
      {
        n: 6, termino: "Human-in-the-Loop (controle humano)",
        que: "Uma regra em que o sistema para e pede sua revisão e aprovação explícita antes de uma ação importante.",
        para: "Dá a tranquilidade de que a automação não tomará decisões delicadas sem o seu consentimento.",
        ej: "A IA prepara o resumo de despesas do mês, mas exige que você clique em \"Aprovar\" antes de enviá-lo à Contabilidade."
      },
      {
        n: 7, termino: "Dry run (simulação sem risco)",
        que: "Um teste em que sua automação executa todos os passos, mas sem modificar, salvar ou enviar dados reais.",
        para: "Permite comprovar que a lógica funciona sem risco de alterar arquivos importantes do seu departamento.",
        ej: "Testar o fluxo de lembretes a clientes para conferir nomes e saldos, sem enviar nenhum e-mail real."
      },
      {
        n: 8, termino: "API Keys e segredos (chaves digitais)",
        que: "Um código confidencial que funciona como a senha para o seu projeto se conectar a um serviço de IA.",
        para: "Identifica seu usuário ou empresa e permite gerenciar o consumo autorizado de forma segura.",
        ej: "Guardar a chave da sua conta institucional em local protegido, nunca escrita dentro de um arquivo que é compartilhado."
      },
      {
        n: 9, termino: "Scaffolding (modelos estruturados)",
        que: "O esqueleto ou estrutura pré-desenhada que dá ordem, hierarquia e formatação limpa ao seu projeto desde o primeiro momento.",
        para: "Livra você do bloqueio da página em branco e garante que seu desenvolvimento siga um padrão profissional.",
        ej: "Um modelo base para análise de dados que já traz as pastas de arquivos de origem, prompts e relatórios finais."
      },
      {
        n: 10, termino: "JSON portátil (avanço sem memória em servidor)",
        que: "Um arquivo de texto leve e organizado que contém todas as respostas, configurações e ideias do seu projeto.",
        para: "Permite salvar seu avanço no computador e carregá-lo no dia seguinte, com total privacidade.",
        ej: "Baixar meu_projeto_area_financas.json ao terminar o expediente e carregá-lo na manhã seguinte para continuar de onde parou."
      }
    ]
  };

  const PRESENTACION = {
    audiencias: [
      { id: "jefatura", nombre: "Diretoria / chefia", enfoque: "Vão direto ao resultado e ao custo. Coloque o número grande primeiro e o detalhe técnico no fim, só se pedirem.", pide: "Use linguagem de negócio, não técnica. Abra com a economia anual e feche com qual decisão eu preciso deles." },
      { id: "equipo", nombre: "Minha equipe", enfoque: "Importa como o dia a dia muda e se vão precisar aprender algo novo.", pide: "Use um tom próximo e concreto. Explique qual tarefa deixa de ser feita à mão e quais passos novos aparecem." },
      { id: "comite", nombre: "Comitê ou várias áreas", enfoque: "Mistura de perfis: alguém mede dinheiro, alguém mede risco e alguém mede esforço.", pide: "Equilibre os três olhares: resultado econômico, controle de qualidade/segurança e esforço de adoção." },
      { id: "cliente-interno", nombre: "Cliente interno", enfoque: "Interessa o que recebe de diferente e quando, não como funciona por dentro.", pide: "Foque no serviço que ele recebe: o que melhora, em quanto tempo e a quem recorrer se algo falhar." }
    ],
    objetivos: [
      { id: "escalar", nombre: "Escalar para outras áreas", pide: "O fechamento deve propor replicar isto em outras áreas: o que seria necessário, em que ordem e o que dá para reaproveitar como está." },
      { id: "consolidar", nombre: "Consolidar o piloto", pide: "O fechamento deve pedir a passagem de teste para uso estável: o que falta validar, quem aprova e a partir de quando." },
      { id: "recursos", nombre: "Pedir tempo ou recursos", pide: "O fechamento deve fazer um pedido concreto e delimitado (horas, licença, apoio técnico), justificado pelo retorno já medido." },
      { id: "compartir", nombre: "Compartilhar o aprendizado", pide: "O fechamento deve deixar o método replicável: o que aprendi, o que faria igual de novo e o que evitaria." }
    ],
    estilo: [
      "Paleta sóbria de três cores: um azul profundo para os títulos, cinza neutro para o corpo e um único destaque (verde) reservado aos números de economia.",
      "Uma ideia por slide. Se algo precisa de duas, são dois slides.",
      "Um único número protagonista por slide, em tamanho bem maior que o resto.",
      "No máximo 3 marcadores por slide e no máximo 2 linhas por marcador.",
      "Sem logos genéricos, sem fotos de banco de imagens e sem ícones decorativos que não acrescentem informação.",
      "Comparações antes/depois sempre na mesma ordem e na mesma escala, para serem lidas de relance."
    ],
    slides: [
      { n: 1, icono: "🟢", titulo: "Capa e impacto principal", enfoque: "A manchete do projeto e o número que resume tudo. Quem vir só este slide precisa entender o resultado." },
      { n: 2, icono: "🔴", titulo: "O ponto de partida", enfoque: "Como se trabalhava antes: as tarefas manuais, quanto tempo consumiam e o que quebrava com frequência. Sem dramatizar, com o dado." },
      { n: 3, icono: "⚙️", titulo: "A solução implementada", enfoque: "O que foi construído, com que abordagem e quais controles de qualidade e privacidade tem. Em linguagem de escritório, não técnica." },
      { n: 4, icono: "📊", titulo: "Antes vs. depois", enfoque: "O contraste tarefa a tarefa entre o tempo original e o atual, com o total em destaque." },
      { n: 5, icono: "🚀", titulo: "Retorno e próximos passos", enfoque: "O retorno acumulado, em que o tempo liberado é usado e o pedido concreto do fechamento." }
    ]
  };

  const DUDAS_FRECUENTES = [
    { id: "no-entiendo", t: "Não entendo o que uma parte do resultado faz" },
    { id: "no-se-usar", t: "Não sei como usar no meu dia a dia" },
    { id: "falla", t: "Falha ou dá um erro que não sei interpretar" },
    { id: "datos", t: "Não sei onde vai cada dado de entrada" },
    { id: "modificar", t: "Não sei onde mexer se uma regra mudar" },
    { id: "compartir", t: "Não sei se posso compartilhar com minha equipe assim como está" },
    { id: "mantener", t: "Não sei quem mantém isso se eu não estiver" }
  ];

  const GUIAS = {
    "Nivel 1": `
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>Arquitetura e conceitos básicos</strong></p>
          <p style="font-size: .85rem; color: var(--color-text);">Neste nível a abordagem é conversacional (chat). A IA atua como analista ou revisora. Você não precisa de integrações técnicas complexas — basta fornecer contexto claro e o rascunho do que quer melhorar.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>💡 O que pedir à IA</strong></p>
          <ul class="hint-list">
            <li>Peça que sugira uma estrutura ideal para o seu tipo de documento ou apresentação (índice, capítulos).</li>
            <li>Defina o <strong>público</strong> (ex. diretoria, clientes) e peça que ajuste o tom e o vocabulário.</li>
            <li>Solicite uma rodada de <em>brainstorming</em> (geração guiada de ideias) antes de a IA produzir o conteúdo final estruturado.</li>
          </ul>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>⚠️ Precauções e critério</strong></p>
          <ul class="hint-list">
            <li><strong>Formar critério:</strong> não dá para formar critério sem ler e analisar as discrepâncias no que a IA responde. Revise cada resposta com atenção — a IA tende a inventar dados que soam convincentes.</li>
            <li><strong>Segurança dos dados:</strong> em hipótese alguma inclua dados confidenciais da empresa (margens comerciais reais, balanços puros, senhas) na janela do chat. Use nomes inventados (dados sintéticos) como "Empresa X".</li>
            <li><strong>Transforme o que funcionou em modelo:</strong> quando um documento sair bem, salve essas instruções como uma <em>skill</em> reutilizável (instruções do sistema ou projeto) em vez de reescrevê-las de memória na próxima vez.</li>
          </ul>
        </div>
      `,
    "Nivel 2": `
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>Arquitetura e conceitos básicos</strong></p>
          <p style="font-size: .85rem; color: var(--color-text);">A IA vai atuar como seu desenvolvedor copiloto. Trata-se de construir automações com código simples (macros, Python, Google Apps Script), em que a IA gera o código e você testa e coloca para funcionar em um sistema tradicional.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>💡 O que pedir à IA</strong></p>
          <ul class="hint-list">
            <li>Peça que projete pequenos <strong>blocos de código</strong> ("funções") que façam uma coisa de cada vez (dividir para conquistar). Não peça o sistema inteiro na primeira mensagem.</li>
            <li>Peça que o código venha bem <strong>comentado</strong>. Se você não entender o que uma linha crucial faz, exija a explicação com metáforas simples antes de executá-la.</li>
          </ul>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>⚠️ Precauções e critério</strong></p>
          <ul class="hint-list">
            <li><strong>Economia de tokens e contexto:</strong> não envie paredões de código se você sabe que o erro está em uma única linha. Isolar a seção libera contexto e reduz confusão.</li>
            <li><strong>Teste do código:</strong> teste cada passo (teste unitário manual) usando planilhas e variáveis de teste (sandbox). <em>Nunca execute código novo diretamente sobre bancos de dados ou sistemas de produção reais</em>.</li>
            <li><strong>Formar critério:</strong> ao usar a IA para depurar, não cole os erros às cegas; raciocine junto com a ferramenta. É assim que se forma a intuição algorítmica sobre por que certas coisas falham.</li>
          </ul>
        </div>
      `,
    "Nivel 3": `
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>Arquitetura e conceitos básicos</strong></p>
          <p style="font-size: .85rem; color: var(--color-text);">Aqui a IA atua como designer de ferramentas. Você vai construir um utilitário que outras pessoas usam sem saber o que há por baixo: um arquivo HTML/JS local que abre com clique duplo, uma pasta de trabalho do Excel com botões ou um painel de indicadores. A lógica deixa de viver em uma conversa e passa a viver dentro da ferramenta, que calcula sempre igual.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>💡 O que pedir à IA</strong></p>
          <ul class="hint-list">
            <li>Exija um <strong>único arquivo autocontido</strong>, sem instalações nem dependências de internet: em muitos escritórios você não vai conseguir instalar nada nem abrir portas.</li>
            <li>Defina de saída os <strong>3 a 5 indicadores</strong> que ficam no topo e bem visíveis; o resto é detalhe secundário.</li>
            <li>Peça que <strong>valide o que o usuário carrega</strong> (campos vazios, datas mal escritas, duplicatas) e que avise com uma mensagem clara em vez de mostrar um resultado errado.</li>
            <li>Peça que indique <strong>exatamente onde mexer</strong> para mudar uma fórmula ou um limite, para não depender da IA a cada mudança de regra.</li>
            <li>Se algum passo da ferramenta envolver análise com IA, peça que esse passo fique como <strong>modelo de instruções fixo</strong> (uma skill), com formato de saída exato, em vez de ser redigido diferente a cada vez.</li>
          </ul>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>⚠️ Precauções e critério</strong></p>
          <ul class="hint-list">
            <li><strong>Dados dentro do arquivo:</strong> se você vai compartilhar a ferramenta, verifique que ela não leve dados reais colados dentro. Distribua vazia e deixe cada pessoa carregar o próprio arquivo.</li>
            <li><strong>Teste os casos-limite:</strong> zero registros, um registro, valores negativos e texto onde você esperava números. Uma ferramenta que quebra na frente do seu chefe perde toda a credibilidade.</li>
            <li><strong>Formar critério:</strong> peça que explique a fórmula em palavras e confira à mão com um caso que você já conhece. Se o número não bater com seu cálculo manual, o erro está na regra, não em quem a usa.</li>
          </ul>
        </div>
      `,
    "Nivel 4": `
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>Arquitetura e conceitos básicos</strong></p>
          <p style="font-size: .85rem; color: var(--color-text);">Implementação de agentes autônomos integrados a ferramentas (MCP, APIs, plugins diretos). A IA atua como orquestradora cognitiva: lê opções, gera o próprio raciocínio interno, chama os sistemas para extrair dados ou operar, e interage com o usuário final de forma independente (agentic workflow). Exige governança séria.</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>💡 O que pedir à IA ao planejar</strong></p>
          <ul class="hint-list">
            <li>Na primeira rodada, peça que a IA atue como arquiteta enterprise: que diagrame e audite a arquitetura modular, detalhando cada componente e ferramenta externa necessária (bancos de dados afetados, APIs a chamar).</li>
            <li>Solicite instruções de "self-correction" e mecanismos de <em>escalonamento humano</em>, forçando a autonomia a parar e gerar um alerta se detectar uma margem de incerteza não mapeada.</li>
          </ul>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <p class="hint-title"><strong>⚠️ Precauções e critério estrito</strong></p>
          <ul class="hint-list">
            <li><strong>De microgestão a macrogestão:</strong> formar critério como orquestrador neste nível implica entender os padrões de falha, e não operar os fluxos por conta própria. Delega-se com base nos relatórios do agente, mas supervisionando a métrica real.</li>
            <li><strong>Limites e consumo (disjuntores):</strong> um agente travado pode entrar em <em>loop</em> infinito que queima a cota de tokens. É preciso forçar logs robustos e fixar tetos rígidos de tentativas antes de um desligamento preventivo (kill switch).</li>
            <li><strong>Least privilege e aprovação:</strong> nunca exponha a alteração de bancos de dados críticos sem um middleware de aprovação humana embutido no fluxo (human-in-the-loop), como norma absoluta para este tipo de piloto inicial.</li>
          </ul>
        </div>
      `
  };

  window.AIPG_CONTENIDO = window.AIPG_CONTENIDO || {};
  window.AIPG_CONTENIDO.pt = { SUGERENCIAS, IA_GUIA, CATALOGO, PRESENTACION, DUDAS_FRECUENTES, GUIAS };
})();
