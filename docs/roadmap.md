# Roadmap e estado do trabalho

## Estado do Git conferido nesta incorporação
- Repositório: https://github.com/GabrielBlauther/TO-DO
- Raiz real: a subpasta `TODO` que contém `backend`, `frontend` e `.git` dentro da pasta de trabalho também chamada `TODO`.
- Base: `chore/versionar-base`, commit `fd5070f`, integrada à `origin/main` pelo PR #1, commit `3348ddc`.
- Instruções de execução: `chore/validar-execucao`, commit `3fa15e5`, integradas pelo PR #2, commit `538bb10`. O relato de validação antecedia esse merge; a integração foi confirmada por `fetch` e verificação de ancestralidade, sem presumir o merge.
- Branch de contexto: `docs/contexto-ihc`, atualizada por fast-forward até `538bb10` antes de incorporar os arquivos. README atualizado preservado sem nova edição.
- Código, configurações e lockfile incluídos; banco local e dependências ignorados.
- Consultar novamente as referências remotas em tarefas futuras; este registro não garante o estado de PRs posteriores.

## Validação de execução já relatada
Resultados da etapa anterior, confirmados por Gabriel neste chat; não repetidos apenas para incorporar documentação:

- Bun 1.4.4 funcionando no Windows após ajuste do PATH no terminal.
- Dependências instaladas com `--frozen-lockfile`, sem alteração do lockfile.
- Build TypeScript + Vite aprovado.
- Backend e frontend iniciados e encerrados após os testes.
- API: criação, consulta, edição, mudança de status, exclusão e comentários passaram com dados de teste.
- Frontend: entrega de arquivos e proxy verificados por HTTP. Não houve verificação de cliques ou interação visual no navegador.
- Criação automática de banco e dados de exemplo verificada em banco isolado; banco original e auxiliares preservados, com hashes iguais.
- Não existem scripts de testes automatizados ou lint configurados.
- Instruções verificadas registradas no README pelo commit `3fa15e5`; o código da base permanece o de `fd5070f`.

Essas verificações técnicas não são entrevistas, avaliações de usabilidade ou comprovação de acessibilidade. Permanecem pendentes a verificação visual dos fluxos existentes, navegação por teclado, responsividade e tratamento de falhas pela interface.

## Funcionalidades existentes e propostas
Inspeção do código atual, sem nova execução da aplicação nesta etapa:

- Existem: quadro Kanban, cadastro/edição/consulta/exclusão de tarefas, mudança de status, categorias, prioridades, prazo (`due_date`), comentários, contadores e confirmação de exclusão. `backend/database.ts` cria SQLite e dados de exemplo; estes dados fictícios não são evidências de tarefas acadêmicas concluídas.
- Não existem ainda: disciplinas, data planejada separada do prazo, filtro de período, calendário, modelo de sessões, sugestão de estudo, Pomodoro e reorganização transacional do planejamento.
- Escopo, personas hipotéticas, histórias, duas HTAs e alternativas já têm versão inicial. Não confundir documentação proposta com funcionalidades prontas.

## Natureza dos requisitos e decisões
| Categoria | Estado e fonte |
| --- | --- |
| Obrigatório no Trabalho III | Contexto, problema, objetivos e ao menos 3 personas; estrutura de informação; histórias OU casos de uso; 2 tarefas críticas intermediárias com HTAs e planos; plataforma e restrições; 2 alternativas visuais para ao menos uma tarefa e justificativa; protótipo cobrindo as duas tarefas com transições, feedback e erros; guia de estilo; ao menos 3 decisões fundamentadas e medidas de acessibilidade; relatório, protótipo/alternativas acessíveis e slides com demonstração. Fonte: enunciado, pp. 1–2. Entrega e apresentação: 03/12/2026. |
| Decisões de produto confirmadas | Organização de estudos; web com adaptação a telas menores; arquitetura existente; tela principal com filtro temporal; calendário; janela única de Foco com campos condicionais; sugestão explicada e escolha manual; revisão antes de reorganizar. Fontes: projeto, HTAs e decisões de interface. Não são funcionalidades já entregues nem exigências específicas do professor. |
| Hipóteses | Problema/necessidades e personas Lucas, Marina e Renata; benefícios esperados da janela única. Não há entrevistas, avaliações com participantes ou superioridade empírica das alternativas documentadas. |
| Definições técnicas pendentes | Modelo de atividades/sessões, migrações, semestre, datas/horários, conflitos, sugestões e persistência do timer. Definir antes da implementação que depender dessas regras. |

O enunciado não exige backend ou persistência real, nem determina uma quantidade de participantes. Os números de participantes discutidos nas aulas são orientações metodológicas, não uma exigência adicional do Trabalho III. Os pesos são 20% problema/usuários, 25% requisitos/tarefas, 15% exploração/justificativas e 40% protótipo/acessibilidade.

## Lacunas e inconsistências identificadas
- O bloqueio por falta de runtime e a ausência de merge da base eram registros antigos; foram substituídos acima por resultados relatados e estado remoto conferido.
- As duas alternativas estão descritas, mas seus wireframes/imagens ainda não estão preservados no pacote. Descrições textuais não substituem os estudos visuais exigidos.
- Completar o guia de estilo com valores concretos e contraste medido; a paleta ainda não foi escolhida. Recomendações das aulas não comprovam conformidade normativa.
- Definir como acessar atividades sem data sem violar a tela única, quais são os limites do semestre e como tratar datas e fuso horário.
- Definir a relação entre atividade, sessão planejada e ciclo de foco, inclusive se iniciar sem sessão original cria um novo planejamento; estabelecer duração, sobreposição e busca de horários livres, desempates de sugestões e timer em segundo plano/recarregamento.
- A confirmação de exclusão e os modais atuais não comprovam as regras futuras de cancelamento e acessibilidade. A inspeção do código mostra fechamento por clique fora da janela; evitar perda acidental de edição é um requisito a trabalhar e verificar depois.
- Não foi identificada contradição entre as decisões documentadas e as exigências do enunciado que impeça incorporar este contexto. As lacunas acima devem ser resolvidas antes das funcionalidades correspondentes.

## Sequência
1. Integrar este contexto e verificar o estado do Git; documentar lacunas reais.
2. Completar a verificação visual dos fluxos existentes no navegador. Aproveitar a validação técnica já relatada, sem reinstalar ou repetir testes apenas por esta incorporação documental.
3. Definir e documentar o modelo mínimo de atividades/sessões e uma migração compatível com o banco existente; depois preparar disciplinas, data planejada/prazo e filtros, mantendo dados existentes.
4. Integrar calendário e modelo simples de sessões de estudo.
5. Implementar janela única de Foco, sugestão explicada, timer e decisões de conclusão.
6. Implementar troca, reagendamento, revisão, cancelamento e falhas consistentes.
7. Revisar acessibilidade, registrar decisões e completar guia de estilo.
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
