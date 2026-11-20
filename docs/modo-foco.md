# Modo Foco: escolha, planejamento e execução

Implementado na branch `feat/modo-foco`, criada da main `11ffef1` após confirmar o merge do calendário pelo PR #5. Sem merge automático. Modelo registrado antes da implementação em `af3bc55`; regras/backend em `f9824aa`; recuperação local em `79e614b`; interface em `54a5712`.

## Escolha e sugestão

O botão Foco permanece no cabeçalho tanto no Quadro quanto no Calendário. Após a [revisão de IHC](revisao-ihc.md), o diálogo organiza **Escolher atividade → Ajustar planejamento → Revisar e iniciar**. Reutilizar o estudo da mesma atividade pula Ajustar. Voltar mantém valores. Na revisão da sobrecarga de ações, o rodapé foi unificado: Voltar quando pertinente, Sair e Continuar/Iniciar foco. Ajuda e atualização da lista fica somente na escolha. A revisão usa campos identificados de atividade, disciplina, prazo e estudo planejado, seguidos da duração do ciclo, sem repetir a mesma atividade.

Sair, X, clique fora e Escape pedem a mesma confirmação. Durante a preparação, Guardar e sair conserva escolhas nesta página; Descartar e sair limpa só a preparação; Continuar aqui permanece e restaura foco. Com pedido pendente, a saída guarda a pendência sem oferecer descarte. Com timer, Minimizar e voltar preserva a execução e explica se continuará contando. Rascunho ainda não enviado não é recuperado após recarregar. O timer substitui o conteúdo após confirmação de Iniciar foco.

Considerar somente atividades não concluídas, independentemente do filtro visual do quadro/calendário:

1. Sessões de hoje cujo intervalo contém o horário atual.
2. Próxima sessão com horário de hoje.
3. Sessões com horário de hoje já passado.
4. Sessões de hoje sem horário.
5. Sem sessões de hoje, atividade com prazo vencido mais antigo; depois, prazo futuro mais próximo (incluindo hoje).

Dentro do mesmo grupo de sessões: horário inicial crescente, nível de prioridade crescente (1 é alta), identificador da atividade e identificador da sessão. Para prazos iguais: prioridade e identificador da atividade. Os identificadores são desempates estáveis, não estimativas de importância. A atividade e sua disciplina são exibidas; não se sugere apenas uma matéria. Sem candidato com data, o aluno escolhe manualmente. Sem atividades disponíveis, há acesso ao cadastro.

Os estudos disponíveis são as sessões de hoje das atividades não concluídas. Com vários estudos, o campo começa sem escolha: selecionar um explicitamente ou usar o botão que identifica o sugerido. “Qual estudo de hoje você quer usar ou substituir?” usa atividade, disciplina, data, horário e duração; identificadores e o termo técnico `origin` da API não aparecem como opções para o aluno. A alternativa Nenhum destes permite planejar novo estudo. O resumo mostra as consequências; não substituir silenciosamente uma sessão arbitrária. Se o estudo deixar de estar disponível após atualizar, retornar à escolha preservando os demais valores.

## Planejamento e execução

| Escolha | Gravação de planejamento |
| --- | --- |
| Mesma atividade da origem | Reutilizar a sessão existente, sem alterações. |
| Outra atividade, sem alterar planejamento | Preservar integralmente a origem; executar o timer sem criar outro agendamento. |
| Substituir e reagendar | Mover a sessão original preservando identificador e duração; inserir uma sessão da atividade atual no intervalo original. |
| Substituir e deixar sem data | Remover somente a sessão original; inserir uma sessão da atividade atual no intervalo original. A atividade anterior e suas demais sessões permanecem. |
| Sem origem | Incluir uma sessão para a atividade atual, com data, horário opcional e duração de planejamento revisáveis. |

Nenhuma dessas escolhas altera prazos ou apaga a atividade anterior. Se a atividade anterior tiver outras sessões, deixar uma sessão sem data não a torna inteiramente Sem planejamento; isso aparece no resumo. O ciclo não representa a duração inteira do agendamento: uma sessão de 90 minutos pode apoiar vários ciclos sem novas inserções.

O reagendamento aparece somente na opção correspondente. A sugestão de horário procura o primeiro intervalo sem sobreposição entre os registros, incluindo o intervalo que será ocupado pela substituta: hoje e os seis dias seguintes, inícios em passos de 15 minutos entre 08h e 20h, terminando até 20h e não começando no passado. Durações acima de 12 horas ou ausência de encaixe exigem escolha manual. Isso não presume disponibilidade pessoal. Há lista de sessões cadastradas no dia escolhido e ajuste manual.

As regras de sessão são compartilhadas com o quadro/calendário: data válida, duração inteira positiva, horário opcional, sobreposição de intervalos e aviso após o prazo. O servidor exige confirmação explícita de novas datas após o prazo. Conflito não pode ser ignorado: corrigir o intervalo ou cancelar. As validações de ambas as gravações participam da mesma transação.

## Confirmação, falha e repetição

`POST /api/focus/confirm` valida a atividade atual e a fotografia da origem revisada pelo usuário. Se a origem mudou/foi removida, voltar à escolha, abrir Ajuda e atualização da lista e atualizar antes de revisar novamente. O resumo vem antes de Iniciar foco; sair antes do envio não grava.

Uma transação SQLite contém a reorganização e o recibo em `focus_confirmations`. A mesma chave e o mesmo pedido retornam o resultado anterior, mesmo quando a origem já foi removida pela primeira tentativa. Chave reaproveitada com outro pedido é rejeitada. O recibo persiste após reiniciar o backend; não é um histórico de produtividade ou timer. A interface consulta o suporte do servidor atualizado antes das gravações; não confiar em backend antigo ainda em execução.

Antes do envio, guardar chave e escolhas em `localStorage`. Erros de validação permitem corrigir o formulário. Em erro de rede ou resposta 5xx, a gravação pode já ter ocorrido: as escolhas ficam preservadas e bloqueadas para verificar/tentar novamente o mesmo pedido. Fechar e verificar depois mantém a pendência; recarregar a página também a recupera. Não gerar outra chave silenciosamente para um resultado incerto. Depois de recuperar o recibo, iniciar o timer sem repetir o planejamento.

Cliques repetidos são bloqueados imediatamente, além do botão desabilitado. Web Locks serializa confirmações entre abas da mesma origem. As abas leem o mesmo estado local antes de iniciar e recebem atualizações por eventos de armazenamento.

## Timer e recuperação

- Estudo padrão de 25 minutos; duração ajustável de **1 a 180 minutos inteiros** antes do primeiro ciclo e de novos ciclos. Pausa curta fixa de 5 minutos. Esse limite aplica-se ao ciclo, não ao planejamento.
- Estado local versionado: atividade, recibo, sessão quando houver, fase, situação, duração total, restante pausado e instante final em milissegundos. Timer ativo deriva o restante de `Date.now()` e do instante final; o intervalo apenas atualiza a exibição.
- Pausar guarda o restante; retomar calcula outro instante final. Recarregar recupera pausas e calcula o restante do ciclo em execução. Se o instante passou, mostrar término, sem iniciar outra fase nem concluir atividade.
- Minimizar, confirmar saída por X/clique fora/Escape, mudar Quadro/Calendário ou minimizar o navegador não reiniciam o timer. O botão Foco mostra o tempo e reabre a mesma execução. A confirmação de saída não pausa nem encerra o ciclo.
- O cabeçalho do Foco integra Minimizar, Expandir/Restaurar tamanho e Fechar. Minimizar é direto; Fechar mantém a confirmação solicitada. Expandir/restaurar altera só a apresentação, inclusive durante uma confirmação ou gravação. Reabrir após minimizar preserva o tamanho escolhido nesta página; recarregar recupera a execução, mas não essa preferência de tamanho.
- As mensagens de saída e o aviso de Foco minimizado descrevem o estado real: timer de estudo ou pausa em execução continuará contando; pausado permanecerá pausado; ciclo terminado/encerrado tem contagem parada e não começa outro automaticamente. Se o ciclo terminar enquanto a confirmação está aberta, a mensagem é atualizada. Fechar a janela não equivale a Encerrar estudo e voltar.
- Apenas um estudo local, incluindo o resultado aguardando decisão. Novo ciclo ou pausa reutiliza a execução, sem chamar a confirmação de planejamento novamente.
- Zero ou Encerrar ciclo exige escolher o campo Próximo passo: pausa, outro ciclo, retomar o restante (somente em término antecipado) ou encerrar estudo. Um botão com nome específico confirma o efeito escolhido; selecionar uma opção não inicia nada. Não recupera restante de um ciclo que esgotou naturalmente. Minimizar continua no cabeçalho, sem botão duplicado no conteúdo.
- Fazer outro ciclo de estudo mostra a duração somente quando escolhido; trocar a opção ou sair não inicia nada. Minimizar mantém essa escolha na mesma página. Marcar atividade como concluída fica junto ao nome da atividade, separado da continuação do timer. Quando essa gravação tem resultado incerto, verificar conclusão antes de iniciar outro ciclo; sair conserva a recuperação.
- Concluir atividade é separado e explícito. A interface só mostra conclusão após resposta bem-sucedida; perder a resposta pode significar que o servidor concluiu. Verificar conclusão da atividade repete o mesmo pedido com recibo, sem afirmar que ela permaneceu pendente.
- Encerrar estudo e voltar limpa o estudo local. Não desfaz reorganizações já confirmadas. Minimizar preserva a execução/decisão para retorno. Uma atividade concluída precisa ser trocada antes de iniciar outro ciclo.

O armazenamento usa as chaves `todo.focus.timer.v1` e `todo.focus.pending.v1`. Estado inválido ou indisponibilidade de armazenamento gera mensagem, sem simular recuperação. O modo usa Web Locks e armazenamento local no navegador; executar em localhost ou contexto seguro compatível. Não anuncia cada segundo: números/progresso têm `aria-live="off"`, e as mudanças de fase/situação são anunciadas separadamente.

## Verificações realizadas

O registro abaixo descreve a implementação inicial (33 testes). A revisão posterior passou em 37 testes/198 asserções e novos percursos de navegador, incluindo retorno entre etapas, recuperação comum e retomada de ciclo encerrado; ver [evidências atuais](revisao-ihc.md#evidências-posteriores).

Windows, Bun 1.4.4, Chrome headless controlado por Playwright local. API de teste em 3003 com banco em `.cache/focus-ui`, interface em 5175, requisições encaminhadas somente ao backend isolado. O banco original estava em uso pela aplicação local e não foi interrompido, migrado nem usado para gravações de teste. SHA-256 de `todo.db`, WAL e SHM iguais antes e depois desta etapa.

**Automatizados no repositório:** `bun run test` passou com **33 testes e 160 asserções**. Inclui todos os testes anteriores e casos de sugestões/desempates, limite de duração, horário livre, três opções de troca, mesma atividade, inclusão sem origem, origem alterada, múltiplas sessões, conflitos entre as gravações, aviso após prazo, preservação de atividades/prazos, recibo repetido e persistido, rollback com falha provocada na segunda gravação, pausa/retomada, término e recuperação do timer/pendência. Não houve espera de 25 minutos reais; as funções de tempo recebem instantes controlados.

**Pelo navegador:** Chrome em America/Sao_Paulo, desktop 1366×1000 e tela de 390×844, preferência de movimento reduzido e relógio controlado em 15/11/2026. Capturas inspecionadas, sem erros JavaScript de página no roteiro final:

- Origem explícita quando há várias sessões, sugestão aceita diretamente, escolha manual sem candidato datado e acesso ao cadastro quando só há atividades concluídas.
- Cancelamento antes de confirmar, conflito mantendo escolhas, três alternativas de troca, resumo das outras sessões preservadas e aviso de reagendamento após prazo.
- Estudo de 25 minutos, avanço virtual do relógio, pausa que mantém restante, recarga recuperando pausa, retomada e término; pausa de 5 minutos e outro ciclo sem nova confirmação/inserção.
- Minimização e troca para Calendário sem alterar o instante final; outra aba recuperando a mesma execução.
- Perda de resposta **depois de commit real no servidor**, recarga e repetição do mesmo pedido retornando o recibo sem duplicar sessões. Campos e origem da confirmação recuperados.
- Duas abas confirmando simultaneamente, com resposta da primeira retida: apenas uma chamada de confirmação efetiva, uma sessão incluída e um timer compartilhado.
- Dois envios imediatos do formulário não duplicando a inclusão sem origem; duração planejada de 90 minutos independente do ciclo de 25.
- Falha de conexão ao concluir não marcando a atividade; nova tentativa bem-sucedida somente por ação explícita.
- Tab dentro do diálogo, Escape minimizando e retornando foco ao botão Foco, clique no fundo preservando escolhas, fluxo estreito sem rolagem horizontal.

Build TypeScript + Vite aprovado e `git diff --check` aprovado. Lint continua sem configuração. Servidores isolados encerrados ao final.

## Roteiro das duas tarefas

**HTA 1 — Realizar uma sessão de estudo:** abrir Foco, consultar atividade/disciplinas e motivo, escolher explicitamente o estudo de hoje quando necessário, aceitar ou selecionar outra atividade, continuar ao ajuste pertinente e depois revisar resumo/duração, voltar se precisar corrigir, confirmar, pausar/retomar e encerrar o ciclo. Ao terminar, escolher pausa, novo ciclo, minimizar ou Encerrar estudo e voltar; concluir atividade apenas pelo botão próprio. Minimizar/reabrir preserva também escolhas de preparação; recarregar recupera timer e pedido enviado pendente, não rascunho ainda não enviado.

**HTA 2 — Trocar e reorganizar:** ter uma sessão de hoje em uma atividade e selecionar outra no Foco. Escolher entre manter o planejamento, reagendar ou remover somente o agendamento anterior. Na opção reagendar, consultar a sugestão e os registros do dia, ajustar data/horário, tratar conflito ou aviso de prazo e revisar o resumo. Cancelar preserva tudo; confirmar reorganiza atomicamente e inicia o estudo. Conferir Quadro/Calendário depois, incluindo outras sessões e o prazo da atividade anterior.

Para experimentar esta versão, reiniciar o backend para aplicar a migração aditiva do recibo antes de iniciar o Foco. Não usar a base pessoal para ensaios destrutivos; os roteiros de falhas foram executados somente no banco isolado.

## Limitações e evidência acadêmica

Há um timer por **origem/perfil de navegador**, compartilhado entre suas abas; não existe exclusão global entre dispositivos, perfis, janelas privadas ou endereços diferentes (localhost e 127.0.0.1 são origens distintas). Não há conta nem sincronização remota de execução. Limpar o armazenamento elimina a recuperação local e a chave de uma confirmação pendente; não desfaz o planejamento salvo. Falta de Web Locks/armazenamento impede iniciar com as garantias desta versão. Não há notificações externas; a sinalização de término está na aplicação.

O relógio do sistema é a referência. Alterá-lo manualmente pode afetar o restante; não há relógio confiável remoto ou auditoria de horas estudadas. Conflitos verificam apenas as sessões registradas, não compromissos pessoais externos. Sugestões usam dados já carregados; Atualizar lista de atividades, em Ajuda e atualização da lista na etapa de escolha, permite revisar mudanças externas, e o servidor revalida o estudo escolhido antes de confirmar. Se a consulta do quadro falhar depois da confirmação, o aviso distingue planejamento salvo/timer iniciado de falha de consulta e orienta minimizar e recarregar para recuperar os dados.

Não houve entrevistas ou avaliação de usabilidade com participantes. Leitor de tela, outros navegadores/dispositivos físicos e revisão completa de contraste permanecem pendentes; os testes funcionais não certificam conformidade de acessibilidade. As duas HTAs têm suporte funcional nesta versão, mas sua qualidade de uso e os artefatos acadêmicos (wireframes, guia completo e avaliação) ainda precisam ser revisados pelo grupo.
