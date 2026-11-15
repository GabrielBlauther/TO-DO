# Calendário integrado ao planejamento

Branch `feat/calendario-estudos`, criada após confirmar o merge do planejamento pelo PR #4 (`e9f6af1`). Regras de projeção no commit `f7dba2e`; integração da interface no commit `1acf524`. Nenhum merge automático nesta tarefa.

## Navegação e dados

O seletor **Quadro | Calendário** alterna a apresentação das mesmas atividades e sessões, mantendo o filtro. O mês visualizado é um estado independente: Mês anterior, Próximo mês e Hoje mudam somente esse mês. Ao aplicar um filtro válido, o calendário começa no mês da data inicial do período; Todas começa no mês atual. Alternar de visualização preserva o mês navegado. As preferências ficam na sessão da página e não são persistidas após recarregar.

O filtro e o mês visualizado têm rótulos próprios. Os contadores sempre representam atividades únicas no período completo, mesmo quando o mês visualizado não contém sessões. Por isso pode haver contador maior que zero com mensagem de mês sem sessões; navegar não modifica os números silenciosamente.

A grade começa na segunda-feira e mostra somente os dias do mês, com espaços vazios nas bordas. A data atual usa Hoje e contorno; a seleção usa Selecionado, contorno tracejado e estado acessível. Cada evento mostra atividade, disciplina quando houver, horário ou Sem horário e duração. Várias sessões da mesma atividade são entradas distintas, vinculadas ao mesmo identificador de atividade. Apenas sessões dentro do filtro são projetadas; outras sessões da atividade não aparecem indevidamente em dias fora do intervalo.

São exibidos até três eventos por dia. Ver mais abre a lista completa daquele dia em um diálogo. Abaixo de 700 px, os mesmos dias e ações aparecem em uma coluna; dias vazios continuam selecionáveis para planejar. Navegação por Tab e acionamento por Enter/espaço usam controles nativos; a lista não se apresenta como um widget ARIA grid com navegação por setas.

Selecionar uma sessão abre os detalhes da atividade com aquela sessão em edição, reutilizando `SessionEditor`. Selecionar um dia abre sua lista e a seleção de qualquer atividade existente; Planejar sessão neste dia abre o mesmo editor com a data preenchida. Esse preenchimento não grava dados. O diálogo do dia permanece atrás dos detalhes para permitir retorno ao contexto. Escape/Cancelar não persistem; remoção exige a confirmação existente e preserva a atividade.

No filtro Sem planejamento, uma lista mostra atividades sem sessões com ação Planejar; não há grade com datas fictícias. O formulário de planejamento começa em hoje, como no fluxo existente, e permite revisar antes de salvar. Se o usuário selecionar um dia fora do filtro, há um aviso de que a gravação pode ficar oculta pelo período ativo; o filtro não é ampliado automaticamente.

Não há alteração de esquema, API, dependências, lockfile ou regras de conflitos/prazo. Datas civis continuam `AAAA-MM-DD`; a aritmética da grade e a formatação explícita em UTC não convertem a data civil para outro dia. Formulários e validações continuam definidos em [modelo-dados.md](modelo-dados.md).

## Verificações realizadas

Ambiente: Windows, PowerShell, Bun 1.4.4, Chrome instalado controlado por Playwright Python em modo headless. A ferramenta de navegador permanece local em `.cache`, sem dependência nova no projeto.

- `bun run test`: **16 testes e 91 asserções passaram**, incluindo os 12 testes anteriores de migração/API/planejamento.
- Quatro testes novos: virada dezembro/janeiro e limites de anos suportados; fevereiro bissexto e alinhamento semanal; mês inicial e rótulo de mês; projeção de sessões respeitando período inclusivo e mês, sem cópias de atividade nem uso do prazo como data planejada.
- Testes do calendário executados também com `TZ=Pacific/Auckland`; cálculos da grade e rótulos permaneceram estáveis.
- Build TypeScript + Vite aprovado; `git diff --check` aprovado. Não há lint configurado.
- Navegador em America/Sao_Paulo, com relógio de teste em 15/11/2026, desktop 1440×1000 e viewport 390×844. Capturas inspecionadas e nenhum erro JavaScript de página no roteiro final.
- Quadro/Calendário preservando período, limites personalizados inclusivos e mês navegado; várias sessões de uma atividade mantendo contador único.
- Fevereiro de 2024 com 29 dias, sessões em 29/02 e 01/03 e navegação dezembro de 2026/janeiro de 2027 sem mudar o filtro.
- Mês vazio com mensagem e Hoje alterando apenas o mês; data atual e dia selecionado com textos/estados explícitos.
- Ver mais abrindo todos os eventos, inclusive Sem horário; disciplina e atividade exibidas.
- Sessão selecionada abrindo o registro correto para editar; conflito apresentado, correção salva, cancelamento de remoção preserva sessão e remoção confirmada preserva atividade.
- Planejamento de atividade existente com data escolhida; falha de conexão simulada mantendo data/duração e mensagem; cancelar sem gravar; tentativa posterior bem-sucedida.
- Estudo após prazo bloqueado sem confirmação e permitido após confirmação explícita, com prazo original preservado. Filtro Hoje não passou a incluir a sessão de amanhã.
- Lista Sem planejamento sem grade ou datas inventadas; cancelar a ação Planejar mantém a atividade sem sessões.
- Planejamento pelo teclado em 29/02, contenção de foco nos diálogos, retorno ao dia de origem e ao seletor quando o evento removido deixou de existir. Agenda e diálogo sem rolagem horizontal em 390 px.

Os testes usaram backend na porta 3002 com banco em `.cache/calendario-ui`, interface na porta 5174 e encaminhamento das chamadas de teste ao backend isolado pelo Playwright. Não foram feitas gravações de teste no banco original. Os hashes de `todo.db`, WAL e SHM foram conferidos antes e depois. Servidores de teste encerrados ao final.

## Roteiro para experimentar

1. Inicie o projeto conforme o README e escolha Calendário em Visualização.
2. Selecione um dia, escolha uma atividade existente e abra Planejar sessão neste dia. Confira a data, informe duração e salve; depois cancele outra tentativa e confirme que nada foi alterado.
3. Selecione o evento criado. Edite data/horário ou remova a sessão com confirmação; a atividade e seu prazo continuam existindo.
4. Adicione várias sessões à mesma atividade e confira as datas e o contador. Com mais de três no mesmo dia, use Ver mais.
5. Aplique Personalizado atravessando dois meses. Navegue entre eles e alterne para Quadro: o filtro e os contadores continuam os mesmos. Use Hoje sem perder o intervalo.
6. Use Sem planejamento e Planejar; depois experimente uma tela estreita e os controles por teclado.

## Limites

Sem arrastar e soltar, Pomodoro, sugestões, troca de atividade pelo Foco ou novas regras de recorrência. O calendário mostra o dia planejado de início; uma sessão que atravessa meia-noite não recebe uma cópia no dia seguinte. As validações de sobreposição continuam considerando sua duração completa.

Não houve avaliação com participantes, leitor de tela ou dispositivos móveis físicos; não há declaração de conformidade completa de acessibilidade. Outros navegadores e revisão ampla de contraste continuam pendentes. As duas HTAs completas dependem das futuras etapas de Foco e reorganização.
