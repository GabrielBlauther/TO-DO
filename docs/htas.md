# Análise Hierárquica de Tarefas — versão inicial

As HTAs descrevem objetivos e ações do aluno. Os detalhes de interface podem mudar após avaliação. Não são resultados de testes.

A primeira etapa implementou disciplinas e planejamento manual. As etapas seguintes acrescentaram calendário e suporte funcional às duas HTAs por Foco em janela única, timer e reorganização atômica. Regras e evidências técnicas em [modo-foco.md](modo-foco.md); não houve avaliação com participantes. A revisão acadêmica dos fluxos continua necessária. Editar uma sessão manualmente no calendário não equivale ao fluxo de substituição do Foco.

## HTA 1 — Realizar uma sessão de estudo com foco
Objetivo: estudar uma atividade escolhida com apoio do timer e registrar o andamento.

| Número | Tarefa |
| --- | --- |
| 0 | Realizar uma sessão de estudo. |
| 1 | Escolher o que estudar. |
| 1.1 | Consultar a sugestão e seu motivo. |
| 1.2 | Aceitar a sugestão ou selecionar outra atividade. |
| 1.3 | Se substituir uma sessão planejada, reorganizá-la conforme HTA 2. |
| 2 | Iniciar a sessão. |
| 2.1 | Conferir atividade e duração. |
| 2.2 | Iniciar o timer. |
| 3 | Realizar o estudo. |
| 3.1 | Acompanhar o tempo restante. |
| 3.2 | Pausar e retomar quando necessário. |
| 4 | Finalizar a sessão. |
| 4.1 | Encerrar antecipadamente ou receber aviso de término. |
| 4.2 | Informar se a atividade foi concluída ou permanece pendente. |
| 4.3 | Escolher pausa, outro ciclo ou retorno ao planejamento. |

Plano 0: 1 → 2 → 3 → 4. Plano 1: 1.1 e 1.2; 1.3 apenas em caso de substituição. Sem sugestão, selecionar manualmente; sem atividades, cadastrar antes de seguir. Plano 2: 2.1 → 2.2. Plano 3: 3.1, alternando 3.2 quando necessário até encerrar. Plano 4: 4.1 → 4.2 → 4.3; outro ciclo retorna a 2; se a atividade foi concluída, escolher uma nova antes de outro ciclo. Se houver pausa, ofereça retomar depois dela.

Exceções: desistir antes de iniciar não altera o planejamento; término antecipado mantém a atividade pendente salvo escolha explícita do aluno. Timer concluído não equivale a atividade concluída.

## HTA 2 — Trocar atividade e reorganizar o planejamento
Objetivo: estudar outra atividade mantendo controle sobre o destino da sessão original.

| Número | Tarefa |
| --- | --- |
| 0 | Trocar atividade e reorganizar o planejamento. |
| 1 | Escolher a nova atividade. |
| 1.1 | Consultar a atividade originalmente planejada. |
| 1.2 | Selecionar a atividade que deseja estudar agora. |
| 2 | Decidir o destino do planejamento original. |
| 2.1 | Estudar outra atividade sem alterar a sessão original. |
| 2.2 | Substituir a sessão e reagendar o estudo anterior. |
| 2.3 | Substituir a sessão e deixar o anterior pendente sem data. |
| 3 | Definir nova data quando houver reagendamento. |
| 3.1 | Consultar sugestão de horário e compromissos existentes. |
| 3.2 | Aceitar a sugestão ou escolher outra data e horário. |
| 3.3 | Ajustar a escolha caso exista conflito de horário. |
| 4 | Revisar e confirmar. |
| 4.1 | Conferir o estudo atual e o destino do anterior. |
| 4.2 | Confirmar ou cancelar a mudança. |
| 5 | Conferir o resultado e seguir para a sessão. |
| 5.1 | Verificar confirmação e planejamento atualizado quando aplicável. |
| 5.2 | Voltar ao passo 2 da HTA 1 com a nova atividade selecionada. |

Plano 0: 1 → 2 → [3 se 2.2] → 4 → 5. Plano 1: 1.1 → 1.2. Plano 2: escolher exatamente uma entre 2.1, 2.2 e 2.3. Plano 3: 3.1 → 3.2; havendo conflito, 3.3 e retornar a 3.2 até resolver ou cancelar. Plano 4: 4.1 → 4.2; cancelamento encerra sem mudanças. Plano 5: 5.1 → 5.2 somente após sucesso.

Exceções: sem sessão original, pular 2 e 3 e revisar a inclusão de nova sessão. Conflito depende de sobreposição de horários. Data após prazo gera aviso para revisão. Erro ao salvar não pode deixar apenas metade da troca persistida; manter escolhas para tentar novamente. Nunca apagar a atividade anterior automaticamente.
