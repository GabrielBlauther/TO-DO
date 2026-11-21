# Execução e demonstração local

Escopo confirmado em 21/11/2026: demonstração do protótipo existente no computador, com dados fictícios; sem hospedagem ou coleta com participantes. Os passos abaixo usam o backend/frontend e a opção `DATABASE_PATH` existentes. Não há uma versão especial do aplicativo ou infraestrutura de participantes.

## Preparar o ambiente

Use a raiz que contém `backend`, `frontend` e `package.json` (neste computador, a pasta interna `TODO`). Bun 1.4.4 foi a versão verificada. No PowerShell:

```powershell
$env:Path = "$env:USERPROFILE\.bun\bin;$env:Path"
bun --version
```

Dependências da interface, usando o lockfile versionado:

```powershell
Set-Location frontend
bun install --frozen-lockfile
Set-Location ..
```

A API usa `bun:sqlite` fornecido pelo Bun. Não é necessário instalar um servidor de banco ou Node para os comandos com `--bun` abaixo.

Antes de iniciar a demonstração, confira se há uma execução pessoal nas portas 3001/5173. Se estiver em uso, encerre a execução correspondente por **Ctrl+C no terminal que a iniciou**, preservando os arquivos, antes de seguir. O proxy atual do Vite aponta para a API na porta 3001: abrir uma interface nova enquanto a API pessoal continua nessa porta pode gravar no banco pessoal. Não reutilize um servidor sem conferir como foi iniciado. `EADDRINUSE` indica porta ocupada; não prossiga usando o servidor antigo como se fosse o da demonstração.

## Iniciar com dados separados dos pessoais

No terminal da API, a partir da raiz:

```powershell
New-Item -ItemType Directory -Path .cache/demonstracao-local -Force | Out-Null
$env:DATABASE_PATH = Join-Path (Get-Location).Path '.cache/demonstracao-local/todo.db'
$env:PORT = '3001'
Write-Output "Banco desta execução: $env:DATABASE_PATH"
bun run backend/index.ts
```

Confirme o caminho exibido antes de usar a aplicação. Se esse arquivo não existir, `backend/database.ts` cria as tabelas e os dez exemplos fictícios legados. Se já existir, os dados são preservados; reiniciar não recoloca exemplos removidos. Esses exemplos incluem títulos antigos sobre autenticação/login, que são apenas textos de tarefas fictícias, não funcionalidades da aplicação. Disciplinas e sessões são preparadas abaixo. Não copie, renomeie, exclua ou substitua o `todo.db` pessoal, seus arquivos `-wal`/`-shm` ou qualquer backup.

Em outro terminal, na raiz:

```powershell
$env:Path = "$env:USERPROFILE\.bun\bin;$env:Path"
Set-Location frontend
bun run --bun dev --host 127.0.0.1 --port 5173 --strictPort
```

Abra **http://127.0.0.1:5173** numa janela privativa dedicada à demonstração, sem abas privativas antigas da aplicação. Pedidos pendentes e timer são guardados no navegador; essa janela evita recuperar dados pessoais para um servidor apontado ao banco fictício. Durante a apresentação, mantenha a mesma janela para conservar o timer. Fechar todas as janelas privativas perde seu armazenamento local; o banco SQLite da demonstração permanece salvo. Não limpe o armazenamento do perfil pessoal.

Ao terminar, use Ctrl+C nos dois terminais. As variáveis acima valem somente para o terminal da API; feche-o após a demonstração para não iniciar por engano outra execução com o mesmo `DATABASE_PATH`. Para retomar o uso pessoal, abra um novo terminal com a configuração pessoal de banco e use seu perfil habitual de navegador.

## Dados fictícios reproduzíveis pela interface

Prepare estes exemplos **somente no banco da demonstração**. Use datas relativas ao dia da apresentação para o filtro Hoje e a sugestão continuarem pertinentes. Se os exemplos já existirem, consulte/ajuste-os conscientemente em vez de repetir os cadastros. Use ou cadastre livremente a disciplina **Interação Humano-Computador**; não é uma lista de sugestões do aplicativo.

| Atividade fictícia | Disciplina / categoria / prioridade | Prazo | Estudos planejados |
| --- | --- | --- | --- |
| `[DEMO] Revisar princípios de IHC` | Interação Humano-Computador / Estudo / Alta | Hoje + 3 dias | Hoje, 14:00, 50 min; amanhã, sem horário, 60 min |
| `[DEMO] Preparar roteiro das duas HTAs` | Interação Humano-Computador / Projeto / Média | Hoje + 5 dias | Nenhum inicialmente |
| `[DEMO] Organizar referências` | Sem disciplina / Estudo / Baixa | Sem prazo | Nenhum |

Todas começam em A fazer. Inclua opcionalmente na primeira o comentário fictício “Revisar controle, feedback e prevenção de erros”. O dia de estudo e o prazo têm campos distintos; reagendar não muda o prazo. O banco gerado e seus auxiliares permanecem ignorados pelo Git; a tabela é a especificação versionada dos exemplos, sem nomes ou compromissos pessoais.

## Roteiro curto das duas HTAs e da acessibilidade

1. **Consulta:** selecione Hoje no Quadro para ver a atividade com estudo de hoje; alterne para Calendário e consulte esse estudo. O filtro e os contadores contam atividades únicas. Sem planejamento mostra os exemplos ainda sem sessões, além dos exemplos legados que também não tenham planejamento.
2. **HTA 1:** abra Foco, escolha Revisar princípios de IHC e seu estudo de hoje. Revise; use um ciclo de **1 minuto** para demonstrar o término sem esperar 25 minutos. Inicie, pause/retome, minimize, confira o painel e restaure. X/Escape/clique fora pedem confirmação; Continuar aqui preserva o estado. O ciclo concluído não conclui a atividade. Ao terminar, escolha Encerrar estudo para preparar o próximo fluxo.
3. **HTA 2:** abra Foco, escolha Preparar roteiro das duas HTAs e o estudo de hoje da primeira atividade. Escolha reagendar o estudo anterior para amanhã, sem horário. Revise os efeitos e confirme. A atividade original e seus prazos permanecem; a nova atividade recebe o intervalo de hoje. Para demonstrar cancelamento, faça antes uma preparação e descarte-a sem enviar; não prometa desfazer uma gravação enviada.
4. **Acessibilidade:** numa janela desktop, aplique o zoom **nativo** do navegador em 200% e 400%; percorra os passos usando Tab/Shift+Tab, Enter/Espaço e rolagem. Confira legibilidade, ações dos modais, retorno da confirmação e foco diante do painel. O calendário usa agenda quando há menos largura CSS. Não substitua esse ensaio por diminuir a viewport. [Método e capturas já registrados](acessibilidade-ampliacao.md).

O roteiro serve para preparação/apresentação e revisão interna. Não é protocolo de coleta com participantes e não gera evidência de avaliação com usuários. Registre apenas o que de fato executar; inspecionar este documento não significa ter realizado novamente seus passos.

## Verificações técnicas e limites

Na raiz, `bun run test` executa os testes mantidos. Dentro de `frontend`, `bun run --bun build` verifica TypeScript e gera o build local. Não há lint configurado. Resultados anteriores de build, API e navegador, incluindo zoom real nas duas HTAs, ficam na [revisão de IHC](revisao-ihc.md) e no [relatório de ampliação](acessibilidade-ampliacao.md); não são novas execuções nesta atualização documental.

A ausência de avaliação com usuários/pessoas com deficiência permanece limitação desta entrega. Revisões internas, capturas e testes técnicos não comprovam clareza para todos os alunos nem conformidade completa. O guia de estilo e as correções de acessibilidade existentes permanecem aplicáveis à demonstração local.

Conferência desta atualização documental: quatro blocos PowerShell passaram pela análise de sintaxe; links locais conferidos. A fábrica existente foi executada apenas em banco `:memory:` com Bun 1.4.4: dez tarefas fictícias, zero disciplinas e zero sessões iniciais. Os três exemplos acadêmicos da tabela são um roteiro para cadastro pela interface, ainda não um novo ensaio executado nesta atualização. Nenhum servidor foi iniciado ou banco pessoal acessado para essas conferências.
