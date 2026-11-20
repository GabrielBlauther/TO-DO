# Consolidação das interações — 20/11/2026

## Base e preservação

Consulta local/remota com fetch: `origin/main` em `743e7f7` (PR #13) contém `f007515`, `47f7307`, `59226f1`, `6e3a3cf` e `da3eb3f`. A branch local anterior `fix/botoes-fechar-modais` está limpa e sincronizada em `f007515`; `main` local ainda em `b8e1953`. Criada `fix/consolidar-interacoes` diretamente de `origin/main`, sem executar merge, rebase ou descarte. As branches antigas foram preservadas. O estado remoto é uma fotografia desta consulta, não garantia de integrações futuras.

`git ls-files .cache` e `git log --all -- .cache` não retornaram arquivos/commits. Roteiros e ferramentas temporários continuam locais; não houve retirada do índice nem exclusão de arquivos. Testes permanentes continuam em `backend/*.test.ts`.

## Auditoria inicial anterior às correções

Estados abaixo descrevem o código da base `743e7f7`. Evidências históricas são identificadas; nova validação será registrada separadamente.

| Pedido | Estado inicial | Evidência / lacuna |
| --- | --- | --- |
| Arraste em todas as direções e Mover para… | Atendido funcionalmente | `App.moveTask`, `TaskCard`, `backend/kanban.test.ts`; Chrome da etapa anterior verificou seis direções, falhas e recuperação. Revalidar na versão consolidada. |
| Foco por estado sem ações duplicadas | Parcial | Etapas e rodapé existem, mas o ciclo terminado mantém 00:00/progresso como centro, uma ação genérica Continuar sem escolha e conclusão da atividade fora do grupo de resultado. |
| Feedback de fim de ciclo e conclusão da atividade | Parcial | Fase informa término e conclusão explícita existe; falta hierarquia de resultado e próximo passo principal já compreensível. Falha de consulta após salvar manda recarregar toda a página. |
| Minimizar, expandir/restaurar e fechar | Parcial | Modal controla tamanho e saída; timer é preservado. Minimizar ainda entrega faixa estática, não painel. |
| X, Escape e clique fora | Atendido funcionalmente | `Modal.tsx`, correção `f007515`; X da confirmação retorna ao diálogo. Chrome anterior cobriu normal/expandido/estreito, rascunhos e espera de gravação. Revalidar incluindo confirmações auxiliares. |
| Atualização e recuperação de falhas | Parcial | Recibos e pedidos persistidos evitam duplicação; atualização manual não mostra espera/sucesso e a falha posterior à confirmação não oferece atualização localizada. |
| Sugestões no cadastro de disciplina | Pendente | `SubjectModal.tsx` contém somente campo livre, sem sugestões. |
| Painel compacto flutuante e móvel | Pendente | A faixa `.focus-minimized-status` não flutua, não pode ser reposicionada e não tem pausar/retomar/restaurar. Não é considerada atendimento ao pedido. |

## Decisões desta correção

O painel ficará **dentro da aplicação**, com identificação curta, tempo, estado textual, controle de pausa/retomada e restauração. Arraste com limites visíveis; alternativa por teclado e seleção de posição, também utilizável por toque. Não haverá sobreposição a outros programas. A posição é uma preferência desta página, separada da persistência do timer; mover nunca salva planejamento nem muda o instante final.

O ciclo terminado terá resultado explícito, ação principal nomeada e alternativas agrupadas. Nenhum próximo ciclo/pausa começa automaticamente. Guardar/descartar preparação, minimizar e encerrar estudo continuam distintos. Sugestões de disciplinas serão exemplos opcionais e editáveis, sem alegar catálogo oficial ou criar dados ao escolher.

Fundamentação reconsultada: Navegação (hierarquia, ações primárias/secundárias e número de escolhas, pp. 8–20) e Princípios (controle/consistência, pp. 20–21; visibilidade, linguagem e recuperação, pp. 34–43). O enunciado exige tarefas completas, feedback, transições e erros, sem impor uma janela ou posição de painel. Essas escolhas aplicam as necessidades hipotéticas de Lucas (retomar rápido), Marina (reconhecer efeitos) e Renata (corrigir sem perda); não são resultados de avaliação com alunos.

## Verificações e capturas

Em andamento; não considerar a auditoria ou o build como avaliação de clareza. Capturas finais de desktop/celular, evidências observadas e limitações serão preenchidas após a execução no navegador, com dados isolados.
