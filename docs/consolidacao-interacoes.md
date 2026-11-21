# Consolidação das interações — 20/11/2026

**Correção em 21/11:** o responsável não pediu exemplos de disciplinas; relatou uma caixa de nomes digitados antes. A lista adicionada não resolveu esse problema. A classificação desse item nesta auditoria foi corrigida abaixo. Os [ajustes atuais](ajustes-pre-hospedagem.md), [guia de estilo](guia-estilo.md) e [capturas atuais](capturas-pre-hospedagem.md) substituem a descrição de versão final deste registro; as evidências anteriores permanecem históricas.

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
| Relato sobre nomes anteriores em disciplina | Diagnóstico inicial incorreto | O campo livre foi interpretado como ausência de exemplos; essa não era a reclamação. Ver correção de 21/11 acima. |
| Painel compacto flutuante e móvel | Pendente | A faixa `.focus-minimized-status` não flutua, não pode ser reposicionada e não tem pausar/retomar/restaurar. Não é considerada atendimento ao pedido. |

## Decisões desta correção

O painel ficará **dentro da aplicação**, com identificação curta, tempo, estado textual, controle de pausa/retomada e restauração. Arraste com limites visíveis; alternativa por teclado e seleção de posição, também utilizável por toque. Não haverá sobreposição a outros programas. A posição é uma preferência desta página, separada da persistência do timer; mover nunca salva planejamento nem muda o instante final.

O ciclo terminado terá resultado explícito, ação principal nomeada e alternativas agrupadas. Nenhum próximo ciclo/pausa começa automaticamente. Guardar/descartar preparação, minimizar e encerrar estudo continuam distintos. A proposta de acrescentar exemplos opcionais de disciplinas foi uma interpretação incorreta, posteriormente retirada.

Fundamentação reconsultada: Navegação (hierarquia, ações primárias/secundárias e número de escolhas, pp. 8–20) e Princípios (controle/consistência, pp. 20–21; visibilidade, linguagem e recuperação, pp. 34–43). O enunciado exige tarefas completas, feedback, transições e erros, sem impor uma janela ou posição de painel. Essas escolhas aplicam as necessidades hipotéticas de Lucas (retomar rápido), Marina (reconhecer efeitos) e Renata (corrigir sem perda); não são resultados de avaliação com alunos.

## Resultado por pedido na versão consolidada

“Atendido” abaixo significa comportamento implementado e observado nas condições descritas. Não significa clareza comprovada para estudantes. A auditoria inicial foi preservada acima, sem transformar pendências anteriores em entregas antigas.

| Pedido | Estado final | Evidência atual |
| --- | --- | --- |
| Arraste entre todas as colunas e Mover para… | Atendido | Chrome: seis transições pelo controle, arraste nativo nos dois sentidos, destaque de destino, teclado/toque, contadores, rejeição com retorno e resposta perdida recuperada pela mesma tentativa. `TaskCard`, `App.moveTask`, testes de Kanban mantidos. |
| Foco por estado, sem ações duplicadas no diálogo | Atendido funcionalmente | Preparação: Continuar/Iniciar e retorno; execução: Pausar/Retomar; resultado: próximo passo explícito e campos pertinentes. Minimizar somente no cabeçalho. Escolha de posição do painel fica recolhida até pedir. Rodapé móvel mantém Iniciar visível. Há dois acessos intencionais à restauração (cabeçalho e painel), não dois timers. |
| Feedback de ciclo e de conclusão da atividade | Atendido | Resultado substitui o relógio zerado; informa que a atividade continua pendente. Marcar atividade é uma ação independente no bloco de resultado. Resposta confirma conclusão e manutenção do planejamento. Ciclo de estudo propõe pausa, pausa propõe estudo, atividade concluída propõe encerrar; nada começa sozinho. Resposta perdida de conclusão pode ser verificada. |
| Minimizar, expandir/restaurar e fechar | Atendido dentro da aplicação | Minimizar mostra o painel. Tamanho, escolha, fase e instante final mantidos ao restaurar. Fechar solicita a confirmação e não encerra estudo. Quatro cantos, posições intermediárias e redimensionamento verificados. |
| X, Escape e clique fora | Atendido funcionalmente | 28 combinações do Foco (7 estados × normal/expandido × desktop/estreito); X da confirmação retorna com foco/campos/timer preservados. Seis tipos de modal, atividade nova/edição e cadastro auxiliar conferidos. Gravação retida bloqueia saída, rejeição libera. Confirmações locais de remoção de sessão/comentário canceladas sem exclusão; X da janela retorna a elas sem perda. |
| Atualização e recuperação de falhas | Atendido funcionalmente | Atualizando lista…, sucesso e falha distintos. Falha de consulta depois de confirmar preserva timer e informa que o planejamento foi salvo, com atualização localizada. Minimizando/restaurando, o erro não é apagado. Rejeição mantém campos; resposta perdida após commit conserva chave, reabre após recarga e não duplica estudo. |
| Caixa de nomes anteriores no cadastro de disciplina | Interpretação incorreta; não resolvida pelos exemplos | A consolidação implementou exemplos e os testou, mas isso não correspondia ao relato. Exemplos removidos na revisão de 21/11, preservando cadastro livre. Autocomplete off é solicitado; origem provável no navegador e comportamento do perfil pessoal ainda precisam de confirmação. Ver diagnóstico atual. |
| Painel compacto flutuante e móvel | Atendido dentro da aplicação | `FocusPanel.tsx`: identificação abreviada, tempo, estado textual, Pausar/Retomar e Restaurar/Ver resultado. Mouse e toque emulado reposicionam; setas e seletor de canto são alternativas. Escape cancela arraste. Limites, redução de tela e instante final preservados. A faixa estática foi removida. |
| Clareza e adequação para alunos | Parcial; avaliação humana pendente | Houve inspeção técnica e correções observáveis. Personas ainda hipotéticas, sem participantes, entrevistas ou métricas de usabilidade. |

## Evidência e limites da verificação

Implementação do painel/fluxo/atualização: `b9ef9e9`. Exemplos de disciplina (retirados na revisão seguinte): `c446113`. Diagnóstico anterior às alterações: `41c69a2`. Nenhum merge executado nesta tarefa; a branch reúne a main remota consultada mais estes commits. Nenhuma dependência, endpoint, lockfile ou esquema de banco alterado.

Chrome real headless por Playwright local, Vite com proxy real em `5176` para backend `3005`, banco **`.cache/consolidacao-ui/test.db`**. O harness identifica explicitamente a base de teste nas respostas; os roteiros que preparam/removem dados conferem essa identificação. O banco pessoal e seu armazenamento no navegador não foram usados. Timer do ensaio pertence a contextos de navegador separados. Não alegar igualdade de hashes dos auxiliares do banco pessoal enquanto Gabriel pode usá-lo.

Verificações executadas:

- Desktop 1366×900 e celular 390×844 com toque emulado: duas tarefas completas, preparação/revisão/retorno, timer ativo, pausa/retomada, resultado, continuação e encerramento, painel móvel e restauração. Mouse nativo, setas, seletor de posição, cancelamento de arraste e gesto de toque por eventos do Chrome. Painel permaneceu dentro da área visível também em 320×568 e 844×390.
- Cinco estados por dispositivo capturados e inspecionados. A captura inicial de preparação móvel mostrou Iniciar fora da área visível; foi corrigida antes da captura final, com rodapé de duas linhas e comportamento aderente durante rolagem. O botão principal foi verificado dentro dos limites do diálogo. Isso não dispensa rolagem para conteúdos maiores.
- Atualização: requisição retida, mensagem de espera, sucesso, falha e nova tentativa; falha na consulta depois da gravação sem iniciar outro pedido. Erro conservado ao minimizar/restaurar. Conclusão da atividade com feedback próprio.
- Respostas perdidas depois de commit, recarga, bloqueio de campos e repetição da mesma chave; conflito com retorno para corrigir, intervalo consecutivo aceito e prazo preservado. Sugestões de disciplina não enviaram gravação até confirmar; resposta perdida recuperou um registro.
- Fechamentos: X, X da confirmação, Escape e fundo; retorno por teclado; espera durante gravação; formulários novos/em edição, detalhes, exclusão, disciplina auxiliar, calendário e confirmações locais de sessão/comentário. Nenhum X habilitado sem efeito foi observado nos cenários percorridos.
- Confirmações/modais empilhados: cancelar exclusão retornou ao mesmo diálogo de detalhes, com foco em Excluir atividade; fechar o planejamento aberto pelo calendário devolveu ao mesmo diálogo do dia e à seleção anterior. Foi conferida a identidade dos elementos, o rascunho e o timer, sem gravações.
- **44 testes Bun / 301 asserções**, incluindo dois testes novos de limites/cantos do painel, e build TypeScript + Vite aprovados. `git diff --check` e links locais conferidos. Não há lint configurado. Testes de regras/API não são prova de usabilidade.

Roteiros de navegador temporários locais: `.cache/check-consolidation-panel.py`, `.cache/check-consolidation-recovery.py`, `.cache/check-consolidation-flow.py`, `.cache/check-consolidation-nested.py`, `.cache/check-focus-close.py` e `.cache/check-kanban.py`. Permanecem ignorados, assim como o harness e ferramentas. O teste permanente acrescentado é `backend/focus-panel.test.ts`, executado por `bun run test`; não movemos scripts temporários para o repositório nem apagamos arquivos locais.

Limitações: Chrome e toque emulado não substituem aparelho físico, leitor de tela ou outros navegadores. Falta auditoria completa de acessibilidade/contraste, avaliação com alunos e confirmação empírica das personas/da clareza. O painel cobre parte do conteúdo por ser flutuante; pode ser movido, e a adequação do tamanho/posição precisa de avaliação humana. A posição é mantida enquanto o componente existe nesta página, não após recarga; o timer continua com a recuperação local já existente. O painel não flutua sobre outros programas. Os limites anteriores de armazenamento, múltiplas origens/perfis, Web Locks e relógio do sistema continuam em [modo-foco.md](modo-foco.md).

Consulta de fontes nesta consolidação: textos originais de Navegação (trechos de botões/hierarquia/alinhamento), Princípios (controle e consistência) e enunciado, além dos documentos próprios. Não foi refeita a leitura integral das 15 aulas nem a inspeção de todas as figuras. Páginas visuais de hierarquia de Navegação já haviam sido inspecionadas nesta conversa; nenhuma nova regra é atribuída a imagens não consultadas. As capturas agora inspecionadas são da aplicação, não das aulas.

## Capturas e roteiro de revisão humana

[Índice das dez capturas finais](capturas-consolidacao.md). Arquivos próprios, de dados fictícios, versionados em `docs/imagens/consolidacao-interacoes/`; PDFs e extrações continuam locais.

Para experimentar: abra uma atividade planejada no Foco, revise e inicie um ciclo curto; minimize, use Pausar/Retomar e mova o painel pelo título ou pela seleção de posição. Restaure, use X e cancele a confirmação pelo próprio X/Escape; confirme depois a minimização e confira o mesmo tempo. Ao terminar/encerrar um ciclo, examine o resultado antes de escolher pausa/estudo/encerramento. Marcar atividade como concluída é separado. No cadastro de disciplina, digite um nome livre e cancele antes de gravar se estiver apenas explorando; exemplos foram removidos na revisão seguinte. Para ensaios destrutivos ou de falha, use banco separado.

Na avaliação humana, percorrer as duas HTAs sem instruir onde clicar e registrar somente o que for observado: o aluno reconhece o próximo passo? Distingue timer, atividade e planejamento? Consegue corrigir/sair/retomar? Descobre como mover o painel sem arrastar? O painel encobre algo importante? Não registrar respostas previstas como resultados obtidos.
