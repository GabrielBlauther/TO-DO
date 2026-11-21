# Ajustes delimitados de IHC — 21/11/2026

## Base e diagnóstico anterior às correções

Fetch confirmou a consolidação integrada pelo PR #14, `origin/main` em `a64bef1`, contendo `7387acb` e `f007515`. Árvore local limpa. Branch `fix/ajustes-ihc-pre-hospedagem` criada diretamente dessa referência; nenhuma integração automática, descarte ou teste no banco pessoal.

### Disciplinas: correção da interpretação

O responsável esclareceu que reclamava de uma caixa de nomes digitados anteriormente, não pedia exemplos de matérias. A adição de Cálculo I/Física I em `c446113` **não resolveu esse relato**. A marcação “atendido” de sugestões na consolidação registra uma interpretação incorreta e não deve ser usada como evidência de solução.

Inspeção do código antes da adição (`c446113^`): campo livre `subject-name`, sem `datalist`, combobox, busca de nomes anteriores ou componente de sugestões da aplicação. O formulário/campo não declarava `autocomplete`. Depois de `c446113`, o único bloco próprio acrescentado é a lista estática de exemplos; não consulta histórico digitado. Isso sustenta **origem provável no histórico/autopreenchimento do navegador**, não confirmação do popup específico visto no perfil pessoal. Não consultamos nem apagamos o histórico desse perfil. Um perfil limpo não reproduzir o popup, sozinho, não comprova a causa.

Correção prevista: remover exemplos, preservar cadastro livre e solicitar `autocomplete="off"` somente no formulário/campo de disciplina. Verificar ausência de sugestões da aplicação, digitação livre, retorno e falhas. A confirmação de que o navegador pessoal deixou de mostrar seu histórico continua dependente de uso nesse perfil; não prometer controle absoluto sobre uma interface do navegador.

### Demais ajustes observados

| Problema | Evidência inicial | Correção delimitada / aceitação |
| --- | --- | --- |
| Painel móvel grande | `celular-minimizado.png` da consolidação mostra painel de aproximadamente 300×240 px sobre o card | Reduzir altura, manter tempo/identificação e pausa/restauração; recolhimento libera conteúdo sem repetir arraste, com espaço de rolagem reservado. Mesmo timer por teclado/toque. |
| Resultado parece resumo | `.focus-result` usa fundo informativo roxo como a revisão | Sucesso com título, ícone de confirmação e cor de apoio medida; interrupção antecipada com outro título/ícone/tratamento. Concluir atividade permanece separado. |
| Repetição no resultado | Resultado, orientação do próximo passo e rodapé repetem timer parado/não conclusão | Uma mensagem curta sobre resultado/situação; orientações seguintes descrevem somente a ação pertinente. |
| Saída chamada “sair” | Modal usa título genérico Sair de Modo Foco e botão Minimizar e voltar | Título e ação dizem minimizar; texto distingue contando, pausado e terminado, sem mudar a confirmação solicitada. |
| Guia disperso | Cores/regras existem em vários documentos/CSS | Guia sucinto único, fontes/páginas e escolhas do projeto; padrões compartilhados aplicados sem alterar tarefas. |

## Correções e evidência técnica

- Cadastro: exemplos removidos em `bd737ee`; campo continua livre, sem consulta/lista da aplicação ao digitar, com `autocomplete="off"` no formulário e campo. O teste verificou atributos e ausência de datalist/listbox/combobox, digitação arbitrária, falha conhecida com campo preservado e resposta perdida após commit recuperada sem duplicar. Não foi feita inspeção do histórico pessoal. **O popup de nomes anteriores no perfil pessoal continua pendente de confirmação**, apesar da correção da marcação.
- Painel: relógio no cabeçalho, identificação abreviada e pausa/restauração mantidos. No celular, informações longas e posição não ficam expostas; ações secundárias seguem recolhidas. Estados contando/pausado foram conferidos com altura até 132 px, contra cerca de 240 px na captura anterior. Recolher leva a identificação/tempo para uma faixa de até 72 px no canto inferior; expandir recupera a posição anterior, limitada à tela. O espaço reservado permite rolar conteúdo acima dela. O card antes encoberto foi trazido integralmente para a área livre sem arrastar o painel, por teclado/toque emulado.
- Resultado: ciclo efetivamente terminado tem ✓, título e apoio verde; interrupção antecipada usa ícone de pausa, título próprio e apoio âmbar. Mensagem única informa que a atividade continua pendente; concluir atividade permanece uma decisão separada. Depois da confirmação dessa decisão, a mensagem de conclusão/manutenção do planejamento substitui a situação anterior, sem aviso duplicado. O próximo passo explica somente seu efeito.
- Minimização: X/Escape/fundo continuam pedindo confirmação. Título e botão agora dizem minimizar; preparação oferece minimizar/guardar ou descartar, pedido pendente oferece minimizar/verificar depois. Durante gravação, saída aguarda o resultado. Texto diferencia estudo/pausa contando, pausado, concluído e encerrado cedo. X da confirmação continua retornando ao conteúdo com foco/campos preservados.
- Padrões visuais: [guia de estilo sucinto](guia-estilo.md) e tokens em CSS aplicados a família tipográfica, entrelinha, ações, campos, modais, feedback, foco e sinalização das colunas. As duas HTAs e os controles de planejamento não foram redesenhados.

Contraste obtido das cores computadas no Chrome: texto/ícone de sucesso 7,29:1, borda de sucesso 5,21:1; texto/ícone de interrupção 8,75:1, borda 4,84:1. A tabela do guia inclui os demais pares sólidos. Não equivale a auditoria completa de acessibilidade ou avaliação de clareza. Em resposta perdida ao concluir atividade, o resultado informa “aguarda confirmação”, sem afirmar que a atividade continua pendente quando a gravação pode já ter ocorrido (`f7ae46b`). O título de pausa interrompida também foi conferido (`8c207f7`).

## Verificações realizadas

Chrome real por Playwright local e proxy Vite, desktop 1366×900 e celular 390×844 com toque emulado; painel também limitado após redimensionar para 320×568 e 844×390. Banco exclusivo `.cache/pre-hospedagem-ui/test.db` em backend `3005`, interface `5176`, com identificação de teste conferida antes de preparar dados. Banco pessoal e histórico do navegador pessoal preservados; contextos de navegador separados para o timer. Roteiros temporários em `.cache` permanecem ignorados e não são testes permanentes do projeto.

- Duas HTAs: reutilizar estudo, novo planejamento, trocar atividade, manter/reagendar/remover agendamento, conflito, prazo, retorno e confirmação; falhas conhecidas e perda da resposta após commit, mantendo pedido/chave e sem duplicação.
- Teclado: Tab/Shift+Tab nos modais, Enter, Escape, retorno ao controle anterior, mover por setas/seletor, recolher/expandir e restaurar. Toque emulado: pausar/retomar, recolher, restaurar e mover. Mesmo timer/instante final preservados; nenhuma continuação automática.
- 28 combinações do Foco (7 estados × normal/expandido × desktop/estreito), demais tipos de modal e cadastro auxiliar: X, confirmação, Escape e fundo. Seis estados específicos da confirmação de minimização conferidos, incluindo pausa e término natural/antecipado; pausa interrompida também teve seu título próprio verificado.
- Cadastro livre: rejeição preserva nome; resposta perdida conserva bloqueio/pedido e recupera um registro. Nenhuma lista da aplicação durante digitação. Não há prova de supressão do popup nativo do perfil pessoal.
- Build TypeScript + Vite e **44 testes Bun / 301 asserções** aprovados; testes do timer incluem mensagens/recuperação e os de painel incluem limites/cantos. Links locais e diferenças conferidos. Lint continua sem configuração.

Capturas novas, abertas para inspeção, em [capturas dos ajustes](capturas-pre-hospedagem.md). As anteriores permanecem como comparação histórica; não foram apagadas nem apresentadas como a versão atual.

## Fundamentação e limites

O [guia](guia-estilo.md) identifica fontes/páginas e escolhas próprias: Guias de Estilo pp. 1–2; Cores pp. 36–38; Layout pp. 33–34; Navegação pp. 8, 10 e 20; Tipografia pp. 20–21 e 29; Princípios pp. 20–21, 34, 38, 41 e 43. Consulta visual nova: Cores p. 38 e Layout p. 34; não foi alegada leitura visual integral das aulas. A tipografia e as medidas compactas são decisões deste produto, não obrigações universais das aulas.

Não houve avaliação com participantes. Clareza para alunos, leitor de tela, aparelhos físicos, outros navegadores e auditoria completa de contraste/acessibilidade continuam pendentes. O teste em perfil limpo não prova a origem nem a supressão do popup visto pelo responsável. Recolher libera o conteúdo por rolagem; o painel expandido continua sobreposto e pode ser reposicionado. Não há hospedagem, login, banco remoto ou nova funcionalidade acadêmica nesta etapa.
