# Roadmap e estado do trabalho

## Estado do Git conferido nesta incorporação
- Repositório: https://github.com/GabrielBlauther/TO-DO
- Raiz real: a subpasta `TODO` que contém `backend`, `frontend` e `.git` dentro da pasta de trabalho também chamada `TODO`.
- Base: `chore/versionar-base`, commit `fd5070f`, integrada à `origin/main` pelo PR #1, commit `3348ddc`.
- Instruções de execução: `chore/validar-execucao`, commit `3fa15e5`, integradas pelo PR #2, commit `538bb10`. O relato de validação antecedia esse merge; a integração foi confirmada por `fetch` e verificação de ancestralidade, sem presumir o merge.
- Branch de contexto: `docs/contexto-ihc`, atualizada por fast-forward até `538bb10` antes de incorporar os arquivos. README atualizado preservado sem nova edição.
- Código, configurações e lockfile incluídos; banco local e dependências ignorados.
- Consultar novamente as referências remotas em tarefas futuras; este registro não garante o estado de PRs posteriores.
- Preparação do calendário: integração de `feat/planejamento-academico` confirmada pelo PR #4, commit `e9f6af1` da `origin/main`; branch `feat/calendario-estudos` criada dessa main atualizada, sem descartar alterações ou realizar merge automático.
- Preparação do Foco: integração de `feat/calendario-estudos` confirmada pelo PR #5, commit `11ffef1` da `origin/main`; branch `feat/modo-foco` criada dessa main atualizada.
- Preparação da revisão de IHC: `feat/modo-foco` integrada pelo PR #6, commit `9952103`; confirmado por fetch/ancestralidade. Main atualizada por fast-forward; branch `fix/revisao-ihc` criada com árvore limpa. Nenhum merge automático.
- Correção do cadastro e saída dos modais: revisão integrada pelo PR #7, commit `9493cec`, confirmada por fetch/ancestralidade; main atualizada e branch `fix/cadastro-e-modais` criada sem descartar trabalho. Integração desta nova branch ainda depende de PR.

## Validação de execução já relatada
Resultados da etapa anterior, confirmados por Gabriel neste chat; não repetidos apenas para incorporar documentação:

- Bun 1.4.4 funcionando no Windows após ajuste do PATH no terminal.
- Dependências instaladas com `--frozen-lockfile`, sem alteração do lockfile.
- Build TypeScript + Vite aprovado.
- Backend e frontend iniciados e encerrados após os testes.
- API: criação, consulta, edição, mudança de status, exclusão e comentários passaram com dados de teste.
- Frontend: entrega de arquivos e proxy verificados por HTTP. Não houve verificação de cliques ou interação visual no navegador.
- Criação automática de banco e dados de exemplo verificada em banco isolado; banco original e auxiliares preservados, com hashes iguais.
- Naquela etapa não existiam scripts de testes automatizados ou lint. A primeira etapa acadêmica acrescentou `bun run test`; lint continua sem configuração.
- Instruções verificadas registradas no README pelo commit `3fa15e5`; o código da base permanece o de `fd5070f`.

Essas verificações iniciais não são entrevistas, avaliações de usabilidade ou comprovação de acessibilidade. A primeira etapa acadêmica acrescentou verificação funcional no Chrome, teclado, tela estreita e falha de gravação, detalhada em [validacao-planejamento.md](validacao-planejamento.md); continuam pendentes avaliação com participantes e uma revisão completa de acessibilidade.

## Funcionalidades existentes e propostas
Estado atualizado pela primeira etapa acadêmica na branch `feat/planejamento-academico`, criada após confirmar o merge do contexto pelo PR #3 (`19b591b`):

- Existem: quadro Kanban, cadastro/edição/consulta/exclusão de tarefas, mudança de status, categorias, prioridades, prazo (`due_date`), comentários, contadores e confirmação de exclusão. `backend/database.ts` cria SQLite e dados de exemplo; estes dados fictícios não são evidências de tarefas acadêmicas concluídas.
- Implementados nesta etapa: disciplinas opcionais independentes de categorias; múltiplas sessões com data, horário opcional e duração; prazo separado; seis opções de período em um seletor, sem duplicar atividades ou contadores; Sem planejamento; conflitos por sobreposição; aviso e confirmação após prazo; migração aditiva repetível e testes Bun. Modelo em [modelo-dados.md](modelo-dados.md).
- Calendário visual implementado na etapa seguinte: seletor Quadro/Calendário, mês independente do filtro, grade mensal/agenda estreita, sessões nos dias correspondentes, lista Sem planejamento e reutilização de consulta/edição/remoção/planejamento. Navegação e evidências em [calendario-estudos.md](calendario-estudos.md).
- Implementados na etapa de Foco: sugestão explicada e escolha manual, origem explícita, três destinos do estudo anterior, reorganização atômica/idempotente, timer de estudo/pausa com recuperação local e conclusão explícita da atividade. Evidências e limites em [modo-foco.md](modo-foco.md).
- Escopo, personas hipotéticas, histórias, duas HTAs e alternativas já têm versão inicial. Não confundir documentação proposta com funcionalidades prontas.

## Natureza dos requisitos e decisões
| Categoria | Estado e fonte |
| --- | --- |
| Obrigatório no Trabalho III | Contexto, problema, objetivos e ao menos 3 personas; estrutura de informação; histórias OU casos de uso; 2 tarefas críticas intermediárias com HTAs e planos; plataforma e restrições; 2 alternativas visuais para ao menos uma tarefa e justificativa; protótipo cobrindo as duas tarefas com transições, feedback e erros; guia de estilo; ao menos 3 decisões fundamentadas e medidas de acessibilidade; relatório, protótipo/alternativas acessíveis e slides com demonstração. Fonte: enunciado, pp. 1–2. Entrega e apresentação: 03/12/2026. |
| Decisões de produto confirmadas | Organização de estudos; web com adaptação a telas menores; arquitetura existente; tela principal com filtro temporal; calendário; Foco com escolha, ajuste pertinente e revisão em etapas com retorno; sugestão explicada e escolha manual. O fluxo simultâneo inicial foi revisto por inspeção técnica, sem alegar superioridade empírica. Fontes: projeto, HTAs, decisões e revisão de IHC; não são exigências específicas do professor. |
| Hipóteses | Problema/necessidades e personas Lucas, Marina e Renata; benefícios esperados da janela única. Não há entrevistas, avaliações com participantes ou superioridade empírica das alternativas documentadas. |
| Definições técnicas | Modelo mínimo em `modelo-dados.md`; sugestões determinísticas, busca simples de horário, confirmação transacional e recuperação local do timer definidos na etapa de Foco em `modo-foco.md`. Não há sincronização global de execução entre dispositivos. |

O enunciado não exige backend ou persistência real, nem determina uma quantidade de participantes. Os números de participantes discutidos nas aulas são orientações metodológicas, não uma exigência adicional do Trabalho III. Os pesos são 20% problema/usuários, 25% requisitos/tarefas, 15% exploração/justificativas e 40% protótipo/acessibilidade.

## Lacunas e inconsistências identificadas
- O bloqueio por falta de runtime e a ausência de merge da base eram registros antigos; foram substituídos acima por resultados relatados e estado remoto conferido.
- As duas alternativas estão descritas, mas seus wireframes/imagens ainda não estão preservados no pacote. Descrições textuais não substituem os estudos visuais exigidos.
- Completar o guia de estilo e a identidade global; a revisão acrescentou cores concretas e medidas de contraste para controles/feedback, sem auditar todos os componentes. Recomendações das aulas não comprovam conformidade normativa.
- Acesso sem sessões, semestre, duração e conflitos foram definidos e implementados nesta etapa. Datas civis não são convertidas para exibição via UTC; o planejamento usa o calendário local do navegador, sem sincronização entre fusos.
- Relação entre planejamento/ciclo, inclusão sem origem, busca de horário, desempates e recuperação local definidos na etapa de Foco. Limpeza de armazenamento, mudança do relógio, múltiplas origens/dispositivos e ausência de APIs de navegador têm limitações registradas em `modo-foco.md`.
- O descarte por clique fora foi corrigido nos modais alterados. Ainda verificar leitor de tela, contraste completo e outros navegadores/dispositivos. Os testes funcionais atuais não comprovam a usabilidade das futuras HTAs.
- Não foi identificada contradição entre as decisões documentadas e as exigências do enunciado que impeça incorporar este contexto. As lacunas acima devem ser resolvidas antes das funcionalidades correspondentes.

## Sequência
1. Integrar este contexto e verificar o estado do Git; documentar lacunas reais.
2. Verificação inicial de fluxos existentes no Chrome realizada nesta etapa, com teclado e tela estreita; manter roteiro de regressão e ampliar acessibilidade depois.
3. Modelo mínimo, migração, disciplinas, sessões e filtros integrados à main pelo PR #4.
4. Calendário visual integrado à main pelo PR #5, sem duplicar o modelo de planejamento.
5. Foco, sugestão, timer e conclusão explícita integrados à main pelo PR #6; essa integração foi conferida ao preparar a revisão de IHC.
6. Troca, reagendamento, revisão, cancelamento e recuperação de falhas implementados nessa branch, com testes de atomicidade e idempotência. Não confundir suporte funcional às HTAs com avaliação de usabilidade concluída.
7. Revisão técnica de interação implementada em `fix/revisao-ihc`: linguagem, retorno/rascunhos, etapas do Foco, recuperação de gravações, consulta do calendário, comentários e contraste de controles. [Diagnóstico, fontes e evidências](revisao-ihc.md). Guia completo/auditoria ampla de acessibilidade continuam pendentes; inspeção técnica não equivale a teste com participantes.
8. Revisão interna do grupo com roteiro das duas tarefas; registrar somente observações realmente coletadas.
9. Completar relatório, wireframes das alternativas, slides, instruções de demonstração e ensaio.

## Entrega acadêmica
- Contexto, problema, objetivo e 3 personas distintas.
- Estrutura de informação, requisitos e 2 HTAs.
- Plataforma/restrições, 2 alternativas visuais e justificativa.
- Protótipo com duas tarefas completas, estados de erro e feedback.
- Guia de estilo e pelo menos 3 decisões ligadas a personas e princípios.
- Relatório conciso e apresentação com demonstração; links acessíveis conferidos.

## Evidências a coletar
Capturas do fluxo, resultado real de build/testes, versão/commit avaliado, dificuldades observadas e alterações decorrentes. Não apresentar avaliações internas como entrevistas externas. Colegas podem revisar personas e executar roteiro breve; fornecer material de apresentação com explicação do que efetivamente foi feito.

## Consulta dos materiais nesta incorporação
Foram lidos o enunciado e os textos auxiliares das 15 aulas listadas no [índice local](referencias/INDICE.md). A consulta visual foi delimitada: enunciado completo (pp. 1–3); ciclo de design em Design de IHC e UX (p. 12); exemplos de layout (pp. 38 e 43); controle/cancelamento e recuperação de erros em Princípios e Diretrizes (pp. 19–20 e 41–42); fricção de ações destrutivas em Navegação (pp. 25–27); exemplo de login e tabela de preparação de teste em Avaliação II (pp. 12 e 16); daltonismo/contraste em Cores (pp. 34 e 38); ícones sem rótulos (p. 75); modelo do processador humano em Fatores Humanos (p. 32). Isso não equivale a inspecionar todas as imagens das aulas, nem a avaliar a interface do projeto.

PDFs, extrações e imagens auxiliares de consulta permanecem locais e fora dos commits. O índice e o `.gitignore` de referências são versionados; um clone não contém os materiais didáticos e precisará de cópias locais para abrir esses links.

## Resultado da revisão de interação

Diagnóstico registrado e enviado em `41d746e` antes das correções. Recibos atômicos `366abb0`; formulários/recuperação `3d4f75f`; verificação de compatibilidade `0cd07da`; Foco guiado/retomada `e81817f`; preservação da escolha de duração ao minimizar `2743f53`. As capturas próprias em `docs/imagens/revisao-ihc` usam dados fictícios isolados; os materiais didáticos permanecem locais.

Build aprovado e 37 testes/198 asserções aprovados. Chrome desktop/390 px: duas HTAs, erros reais/simulados, cancelamentos, retorno, teclado, duas abas e resultado perdido após commit. Não houve avaliação com participantes, leitor de tela ou auditoria completa de acessibilidade. A base de teste ficou isolada; Gabriel confirmou estar experimentando a aplicação pessoal durante a revisão, portanto não alegar igualdade final dos hashes WAL/SHM. Não restauramos nem sobrescrevemos alterações pessoais.

Complemento de 20/11/2026: corrigida a verificação de suporte do cadastro para GET `/api/categories`, pois OPTIONS era interceptado pelo CORS do Vite. Teste Bun pelo proxy real e Chrome com banco isolado cobrem cadastro e recuperação sem duplicação. **38 testes/210 asserções**, build e verificação de diferenças passaram. Por preferência expressa do responsável, os seis tipos de modal agora têm X e confirmação única por X/clique fora/Escape, mantendo campos ao continuar e diferenciando minimizar Foco de encerrar estudo. Detalhes, limitações e capturas no [complemento da revisão](revisao-ihc.md#complemento-de-20112026--cadastro-pelo-proxy-e-saída-dos-modais). Não confundir com avaliação com participantes.
