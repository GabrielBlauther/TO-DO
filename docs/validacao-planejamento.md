# Validação da primeira etapa acadêmica

Branch: `feat/planejamento-academico`, criada da main após confirmar o PR #3 (`19b591b`). Modelo registrado antes da alteração do esquema em `6d2d585`; backend em `04a5fc7`, correção de validação em `ef63826` e interface em `10da003`. Não houve merge automático.

## Ambiente e preservação

Windows 10, PowerShell 5.1, Bun 1.4.4. O caminho do Bun foi incluído no PATH dos processos de verificação. Dependências existentes e lockfile preservados, sem novas dependências da aplicação. Playwright Python foi preparado apenas em `.cache` para controlar o Chrome instalado; não integra as dependências do projeto.

O esquema antigo foi inspecionado em modo somente leitura. Uma cópia consistente foi feita pela API de backup do SQLite, considerando o WAL; copiar apenas `todo.db` com uma aplicação aberta não garante uma cópia completa. A inspeção inicial do navegador e a migração usaram cópias isoladas; os novos fluxos usaram um banco novo isolado. Nenhum teste gravou no banco original.

SHA-256 originais, conferidos antes e após os testes:

| Arquivo | SHA-256 |
| --- | --- |
| todo.db | `40CF07C52BFAA52B334EF341456F970787F6DC701FFE18AD3C572CB5056DBD70` |
| todo.db-wal | `053B57A60A7EE19D596F075E5DE957A9CCF71B65E7A74BFCF54F95D79150AB7A` |
| todo.db-shm | `78692AC6DBDD79BB81621E386CB601D9CC36F7E9C9C07550826A752E72F6FBD0` |

## Inspeção inicial no navegador

Chrome headless, desktop 1280 px e tela estreita de 390 px, fuso America/Sao_Paulo. Criação, edição, status e comentário passaram na base antiga. Foram observados: ausência de semântica de diálogo; Escape sem fechar; clique no fundo descartando rascunho; e datas civis exibidas no dia anterior por conversão UTC. Não houve rolagem horizontal em 390 px. Esses problemas foram tratados nos cartões e modais alterados, mantendo o Kanban e seu estilo existente.

## Verificações automatizadas de regras e API

`bun run test` na raiz executa 12 testes, com 68 asserções, usando o runner nativo Bun. Eles exercitam o handler real da API com SQLite isolado e as funções compartilhadas de datas; não são testes de interface.

- Instalação nova, reinicialização sem duplicar exemplos e manutenção do banco vazio após remover atividades.
- Migração do esquema legado, comparação integral dos campos antigos de tarefas/comentários/prioridades/categorias, disciplinas inicialmente vazias e sessões inicialmente ausentes.
- Vínculos de disciplina e sessão, disciplina opcional, nome duplicado e referências inválidas.
- Persistência de disciplinas e sessões após reabrir o banco; filtros por existência de sessões sem duplicação.
- Limites inclusivos, ano bissexto, datas inválidas, duração não positiva/fracionária, horário inválido, prazo inválido e identificador de sessão inexistente.
- Semestres civis e limites junho/julho e dezembro; mês bissexto e período personalizado invertido.
- Sessões sem horário coexistindo; sobreposição entre atividades, intervalos consecutivos e conflito atravessando meia-noite; edição exclui a própria sessão da comparação.
- Aviso após prazo sem gravar, confirmação explícita, prazo preservado ao reagendar, remoção de sessão sem remover atividade, status/comentários e cascata ao excluir atividade.

O teste padrão usa `backend/legacy-schema.sql` como esquema legado fixo com dados fictícios. Além dele, foi executado com `LEGACY_DB` apontando para a cópia isolada do banco antigo local; ambos passaram. O teste copia esse arquivo novamente para uma pasta temporária e compara os registros antes/depois. Para repetir a verificação adicional, use uma cópia consistente fechada do banco antigo, nunca o arquivo original:

```powershell
$env:LEGACY_DB = 'C:\caminho\copia-antiga-isolada.db'
bun run test
Remove-Item Env:LEGACY_DB
```

Um reinício real do processo do backend também preservou respostas de atividades, disciplinas, sessões, comentários e prazos sem duplicação no banco de teste.

## Verificações pela interface

Percurso automatizado no Chrome instalado, com fuso America/Sao_Paulo, desktop 1280×900 e viewport 390×844. Capturas foram inspecionadas; não houve erros JavaScript de página no percurso final.

- Cadastro de disciplina e seleção na atividade; criação e edição com disciplina e prazo.
- Abertura de detalhes pelo teclado; criação de várias sessões, inclusive sem horário.
- Aviso de estudo após prazo bloqueia salvar sem confirmação; confirmação explícita permite salvar.
- Conflito mostrado com formulário preenchido; correção para horário consecutivo salva; edição da própria sessão funciona.
- Cancelamento de edição/remoção sem persistir; remoção confirmada preserva a atividade.
- Hoje, mês, semestre, personalizado e Sem planejamento; atividade única mesmo com várias sessões, contadores coerentes, intervalo invertido com mensagem e ausência de resultados.
- Status, comentário, exclusão de atividade com confirmação e cancelamento de exclusão em diálogo sobre os detalhes.
- Falha de conexão simulada no salvamento de atividade: mensagem clara, título preenchido mantido e cancelamento sem criar atividade.
- Escape fecha, clique no fundo não descarta rascunho, Tab permanece no diálogo e foco retorna ao botão de origem. O primeiro teste encontrou uma saída de foco; foi corrigida e o percurso repetido passou.
- Layout sem rolagem horizontal na tela estreita, inclusive no diálogo; foco visível em captura. Recarregar mantém os dados salvos.

Build `bun run --bun build`, dentro de `frontend`, aprovado (TypeScript e Vite). `git diff --check` aprovado. Lint não está configurado.

## Como experimentar

1. Instale as dependências em `frontend` com `bun install --frozen-lockfile` e inicie backend/frontend conforme o README.
2. Use **+ Disciplina** para cadastrar uma matéria. Crie uma atividade, selecione-a e informe um prazo opcional. As categorias antigas continuam disponíveis separadamente.
3. Abra os detalhes pelo título da atividade e use **Adicionar sessão**. Escolha uma data, duração e, se quiser, horário inicial. Adicione outra sessão à mesma atividade.
4. Verifique **Hoje**, **Este mês**, **Este semestre** e **Personalizado**. O intervalo aplicado fica visível. Mesmo com duas sessões no período, a atividade e os contadores só contam uma vez.
5. Planeje duas sessões no mesmo dia: 10:00 por 60 minutos e 10:30 por 30 minutos. A segunda mostra conflito; altere para 11:00 e salve. Sessões sem horário podem coexistir.
6. Experimente uma data após o prazo: revise ou marque a confirmação explícita. Reagende e confirme que o prazo da atividade não mudou.
7. Edite uma sessão e cancele; depois remova todas as sessões. A atividade continua em **Todas** e **Sem planejamento**, com seus comentários e prazo.
8. Percorra os formulários com Tab/Shift+Tab, use Escape para cancelar e confira o foco de retorno. Experimente uma tela estreita.

## Limites da evidência e próximos passos

Não houve entrevistas nem avaliação com participantes; os testes acima são verificações técnicas e funcionais. Não foram avaliados leitor de tela, contraste completo, todos os navegadores, dispositivos físicos, carga ou uso concorrente por múltiplos usuários. O protótipo continua local e sem login. Testes novos foram executados nesta etapa; os resultados históricos da validação inicial permanecem identificados como relato anterior.

Calendário visual, timer/Foco, sugestão automática e substituição de atividades não foram implementados. Nenhuma das duas HTAs está completa. A próxima etapa funcional pode usar o modelo de sessões já existente para o calendário visual, após revisão e integração deste PR. Wireframes, guia de estilo e avaliação acadêmica continuam pendentes conforme o roadmap.
