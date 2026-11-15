# Análise Hierárquica de Tarefas — revisão de interação

As HTAs descrevem objetivos e ações do aluno. Os detalhes de interface podem mudar após avaliação. Não são resultados de testes.

A primeira etapa implementou disciplinas e planejamento manual. As etapas seguintes acrescentaram calendário e suporte funcional às duas HTAs por Foco em janela única, timer e reorganização atômica. Regras e evidências técnicas em [modo-foco.md](modo-foco.md); não houve avaliação com participantes. A revisão acadêmica dos fluxos continua necessária. Editar uma sessão manualmente no calendário não equivale ao fluxo de substituição do Foco.

A [revisão de IHC](revisao-ihc.md) organizou o Foco em escolha, ajuste pertinente e revisão, mantendo o diálogo e o contexto da tela principal. Voltar/guardar preparação preservam escolhas; cancelar preparação as descarta sem gravar. São ajustes decorrentes de inspeção técnica, não tarefas validadas com participantes.

## HTA 1 — Realizar uma sessão de estudo com foco
Objetivo: estudar uma atividade escolhida com apoio do timer e registrar o andamento.

| Número | Tarefa |
| --- | --- |
| 0 | Realizar uma sessão de estudo. |
| 1 | Escolher o que estudar. |
| 1.1 | Consultar a sugestão e seu motivo. |
| 1.2 | Aceitar a sugestão ou selecionar outra atividade. |
| 1.3 | Escolher qual estudo de hoje usar/substituir ou planejar um novo. |
| 1.4 | Se escolher outra atividade, decidir o destino do estudo anterior conforme HTA 2. |
| 2 | Iniciar a sessão. |
| 2.1 | Se for novo estudo, definir data, horário opcional e duração planejada. |
| 2.2 | Revisar atividade, prazo, efeito no planejamento e duração do ciclo; voltar se precisar corrigir. |
| 2.3 | Confirmar e iniciar o timer após sucesso; verificar o mesmo pedido se o resultado for incerto. |
| 3 | Realizar o estudo. |
| 3.1 | Acompanhar o tempo restante. |
| 3.2 | Pausar e retomar quando necessário. |
| 3.3 | Minimizar para consultar o planejamento e reabrir o mesmo timer. |
| 4 | Finalizar a sessão. |
| 4.1 | Encerrar antecipadamente ou receber aviso de término; retomar o restante se encerrou por engano. |
| 4.2 | Concluir a atividade somente se terminou seu trabalho; caso contrário, manter a situação. |
| 4.3 | Escolher pausa, outro ciclo, minimizar para decidir depois ou encerrar o estudo e voltar. |

Plano 0: 1 → 2 → 3 → 4. Plano 1: 1.1 → 1.2 → 1.3; 1.4 se a atividade for diferente da do estudo escolhido. Sem sugestão, selecionar manualmente; sem atividades, cadastrar antes de seguir. Sem estudos de hoje, planejar um novo; mesma atividade do estudo escolhido pula o ajuste de planejamento. Plano 2: [2.1 se novo] → 2.2 → 2.3. Voltar retorna à escolha/ajuste sem apagar campos. Plano 3: 3.1, alternando 3.2 e 3.3 quando necessário. Plano 4: 4.1 → [4.2 somente se desejar concluir a atividade] → 4.3; outro ciclo revisa apenas sua duração, sem reconfirmar/criar planejamento. Atividade concluída exige escolher outra antes de novo estudo. Pausa não inicia automaticamente uma continuação.

Exceções: desistir antes de enviar não altera o planejamento; após envio com resposta incerta, guardar o pedido e verificar o mesmo resultado. Término antecipado não altera a situação da atividade. Timer concluído não equivale a atividade concluída. Guardar escolhas/Escape antes do envio permite retorno na mesma página; recarregar não recupera um rascunho ainda não enviado. Encerrar estudo libera a escolha de outra atividade, sem desfazer planejamento já confirmado.

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
| 2.3 | Substituir o intervalo e remover somente o agendamento anterior, preservando atividade e outros estudos. |
| 3 | Definir nova data quando houver reagendamento. |
| 3.1 | Consultar sugestão de horário e compromissos existentes. |
| 3.2 | Aceitar a sugestão ou escolher outra data e horário. |
| 3.3 | Ajustar a escolha caso exista conflito de horário. |
| 4 | Revisar e confirmar. |
| 4.1 | Conferir o estudo atual e o destino do anterior. |
| 4.2 | Voltar para corrigir, guardar escolhas, descartar preparação ou confirmar a mudança. |
| 5 | Conferir o resultado e seguir para a sessão. |
| 5.1 | Verificar confirmação e planejamento atualizado quando aplicável. |
| 5.2 | Voltar ao passo 2 da HTA 1 com a nova atividade selecionada. |

Plano 0: 1 → 2 → [3 se 2.2] → 4 → 5. Plano 1: 1.1 → 1.2. Plano 2: escolher exatamente uma entre 2.1, 2.2 e 2.3. Plano 3: 3.1 → 3.2; havendo conflito, 3.3 e Voltar à etapa Ajustar, preservando campos, até resolver ou descartar. Plano 4: 4.1 → 4.2; guardar/descartar antes de enviar não altera dados. Plano 5: 5.1 → 5.2 somente após sucesso. Resposta incerta mantém escolhas bloqueadas para verificar o mesmo pedido, inclusive depois de fechar/recarregar; não oferece um falso cancelamento do envio.

Exceções: sem sessão original, pular 2 e 3 e revisar a inclusão de nova sessão. Conflito depende de sobreposição de horários. Data após prazo gera aviso para revisão. Erro ao salvar não pode deixar apenas metade da troca persistida; manter escolhas para tentar novamente. Nunca apagar a atividade anterior automaticamente.
