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

Consulta de fundamentação e verificação serão registradas ao concluir. Não há hospedagem, login, banco remoto ou novas funcionalidades nesta etapa.
