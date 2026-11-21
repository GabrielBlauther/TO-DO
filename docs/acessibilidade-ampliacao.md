# Acessibilidade e ampliação — 21/11/2026

## Base, fonte e persona

Branch `fix/acessibilidade-ampliacao`, criada de `origin/main` `1f5911e`, após confirmar o PR #15 contendo `4318f36`. Árvore inicial limpa; nenhum merge automático, descarte, nova funcionalidade ou uso do banco pessoal. Ajustes anteriores e guia preservados.

A fonte **Acessibilidade em Interação Humano Computador.pdf** está disponível no [índice](referencias/INDICE.md). Texto das dez páginas consultado integralmente; páginas 4, 5 e 10 também inspecionadas visualmente. Consulta especialmente pertinente: contraste (p. 3), ampliação/refluxo/foco não encoberto (p. 4), campos/mensagens/teclado (p. 5), semântica e avaliação (pp. 7–9) e relações de controles/painéis (p. 10). PDF e extração permanecem locais/ignorados. A aula é fundamentação; não estamos declarando conformidade legal/normativa ou certificação WCAG.

Rafael Costa, 29 anos, universitário com baixa visão que usa ampliação, é uma **persona hipotética fornecida pelo responsável**. Barreiras: textos pequenos, baixo contraste e perda de informação ao ampliar. Necessidades: legibilidade, contraste adequado, ampliação, foco visível e controles identificados. Não há entrevista, observação de Rafael real ou teste com participante com deficiência.

## Método de zoom real

Chrome **157.0.8103.80** no Windows, headless, perfil persistente exclusivo de teste. Janela mantida em **1440×1000**; densidade base 1. Zoom alterado pelo seletor nativo `chrome://settings/appearance` e conferido por `chrome.settingsPrivate.getDefaultZoom`, sem CSS zoom, pinch ou `setViewportSize`/emulação de viewport. O perfil pessoal não foi aberto.

| Zoom nativo | Janela externa | Área CSS medida | devicePixelRatio | visualViewport.scale / CSS zoom |
| --- | --- | --- | --- | --- |
| 100% | 1440×1000 | 1424×905 | 1 | 1 / 1 |
| 200% | 1440×1000 | 712×452 | 2 | 1 / 1 |
| 400% | 1440×1000 | 356×226 | 4 | 1 / 1 |

Os valores são os observados nesta configuração; não confundir área CSS resultante com redução manual da janela. Servidor de teste em `5176` → proxy real → backend `3005`, base `.cache/acessibilidade-ui/test.db`, identificada nas respostas antes de preparar dados fictícios. O banco pessoal e seu armazenamento de navegador foram preservados.

## Diagnóstico anterior às correções

| Barreira | Reprodução / evidência inicial | Fonte / consequência para Rafael | Critério de aceitação |
| --- | --- | --- | --- |
| Rodapé encobre duração no Foco a 400% | Foco → reutilizar estudo → revisão → Tab: `focus-minutes` recebe foco, mas `elementFromPoint` encontra o rodapé sobre ele | p. 4: foco não pode ficar escondido; Rafael precisa enxergar o campo em que está | Cabeçalho/rodapé deixam de ocupar área fixa em janela CSS baixa; campos e ações acessíveis por rolagem/teclado, sem cobertura |
| Formulário de atividade não mantém campo inteiro visível a 400% | Tab em descrição: borda inferior além da área visível; captura/checagem de foco indicam recorte | pp. 4–5: zoom sem perda, campo/rótulo reconhecíveis | Ao focar, campo cabe ou tem rolagem útil; cabeçalho não encobre conteúdo; botões alcançáveis |
| Verificação de bordas e textos pequenos | Código contém bordas de campo `#e0e0e0` sobre branco e textos auxiliares reduzidos | pp. 3–4: contraste de controles e legibilidade | Medir os pares efetivos; reforçar limites dos campos e textos de leitura sem redefinir as HTAs |

Na checagem inicial de 200%, alguns limites coincidiram com a borda do diálogo por fração de pixel; isso não foi classificado como perda material sem inspeção. Calendário não apresentou rolagem horizontal global nessa inspeção inicial. Testes de viewport estreita anteriores não são apresentados como teste de zoom.

Na inspeção intermediária das capturas, a grade a 200% ainda tinha sete colunas em 712 px CSS: nomes longos eram fragmentados em muitas linhas. O aumento de legibilidade dos eventos tornou mais importante usar a agenda já existente antes desse limite. O breakpoint passou de 700 para 900 px, sem mudar mês, filtro ou dados. Fonte: p. 4; prioridade alta; aceite: eventos legíveis na agenda, mesma sessão consultável, nenhuma rolagem horizontal global.

O espaço de rolagem do painel, restrito antes a 600 px, foi um **risco identificado no código** para zoom com largura CSS maior. Não apresentamos isso como observação de Rafael. No ensaio final, posicionamos um controle do quadro sob o painel e chegamos a ele por Tab: o painel se recolheu e o controle ficou visível, com foco e instante final do timer preservados. Fonte: p. 4; prioridade alta; aceite: foco externo encoberto é revelado sem exigir arraste.

## Necessidade → decisão → verificação → resultado

Correção de código em `4599122`, sobre o registro de persona/fonte/diagnóstico `b932e97`. Nenhuma migração, endpoint, dependência ou funcionalidade nova. O README e os ajustes anteriores foram preservados.

| Necessidade hipotética de Rafael | Decisão aplicada / fonte | Verificação técnica | Resultado observado |
| --- | --- | --- | --- |
| Ler campos, ajuda e estudos | 1 rem nos rótulos, campos, ajuda, prazo/planejamento e eventos; bordas `#6b7280` / pp. 3–5 | Estilos computados e pares de contraste no Chrome | Componentes indicados em 16 px de base; borda sem foco 4,83:1; rótulo 9,74:1; ajuda 7,56:1 |
| Ampliar sem perder ações | Cabeçalho/rodapé no fluxo até 480 px de altura CSS; rolagem vertical mantida / p. 4 | Duas HTAs a 200% e 400%, Tab/rolagem, limites do controle e teste de elemento sob seu centro | Nenhum controle focado inspecionado cortado ou coberto no percurso final; duração e botões alcançáveis |
| Reconhecer estudos no calendário | Agenda existente até 900 px CSS, sem mudar período/mês / p. 4 | Agenda nos dois zooms; consultar sessão, selecionar dia e abrir formulário | Nomes deixam de ser fragmentados pela grade estreita; sessões e formulário acessíveis, sem overflow horizontal global |
| Manter foco visível perto do painel | Reserva de rolagem em toda largura; recolher quando cobrir foco externo, revelar controle sem focar o painel / p. 4 | Controle deliberadamente sob painel, Tab; recolhimento/retorno e armazenamento do timer | Controle visível após recolher/rolar; mesmo foco e instante final; restaurar mantém timer |
| Identificar controles e mensagens | Nomes dos ícones existentes preservados; `summary` recebe contorno compartilhado / pp. 2, 5 e 7–10 | Árvore de acessibilidade do Chrome e acionamento por teclado | Expandir, restaurar, fechar e minimizar identificados; confirmação retorna aos campos; erro e aviso legíveis |

Essas escolhas aplicam a aula ao produto. A fonte não estabelece nossos breakpoints de 480/900 px ou tamanho de fonte de 1 rem como regras universais. O painel continua compacto e móvel; não foi adicionado menu de acessibilidade nem alteração nos objetivos das HTAs.

## Percursos e evidências finais

Nos **dois zooms nativos** indicados na tabela:

- **HTA 1:** escolher atividade/estudo existente, revisar, iniciar ciclo de um minuto, pausar/retomar, X → confirmação → voltar sem alterar timer, minimizar, recolher e restaurar, término pelo relógio controlado e encerrar estudo. Ciclo concluído não marcou a atividade como concluída nem alterou seu planejamento. Nova sessão com prazo passado: campos, aviso, falta de confirmação e cancelamento sem salvar foram percorridos.
- **HTA 2:** escolher outra atividade, revisar manter/remover agendamento e descartar rascunho sem gravação; reagendar com conflito, voltar com horário preservado, corrigir para intervalo consecutivo; rejeição HTTP simulada manteve escolhas; nova tentativa confirmou a reorganização. Prazo da atividade original permaneceu igual. As opções manter/remover foram canceladas nesta rodada; sua persistência é coberta pela suíte Bun existente, não por nova confirmação visual desses dois ramos.
- **Fluxos auxiliares:** formulário de atividade e retorno de confirmação, consulta de estudo no calendário, dia → formulário com data preenchida e cancelamento, edição de sessão cancelada e comentário não enviado preservado ao cancelar a saída. Disciplina livre: rascunho, expandir/restaurar por teclado e Escape sem perda. Mover para… salvou A fazer → Em progresso → A fazer por controles, sem depender de arraste.
- **Teclado/rolagem:** Tab nos estados de escolha/ajuste/revisão, timer, término, confirmação, aviso/erro e formulários; conferência geométrica com tolerância de 1 px e elemento sob o centro do controle, mais inspeção de capturas. Escape/X de confirmação retornaram ao diálogo anterior. Não encontramos erro JavaScript de página nos percursos finais. Essa amostragem não verifica toda combinação possível de foco/posição.
- **Controles com ícones:** nomes consultados na árvore de acessibilidade: “Expandir Cadastrar disciplina”, “Fechar Cadastrar disciplina”, “Minimizar janela Modo Foco”, “Expandir Modo Foco” e “Minimizar Foco”; restaurar e cancelar saída foram acionados. A árvore técnica não equivale a teste de leitor de tela.

[Capturas e como interpretá-las](capturas-acessibilidade.md). São imagens brutas do viewport capturadas pelo Chrome DevTools, **1424×905 pixels físicos**, mantendo a janela e o zoom real. Não são páginas inteiras reduzidas para caber. Partes acima/abaixo da área capturada são consultadas pela rolagem, não conteúdo excluído. [Registro estruturado dos ensaios e medições](evidencias/acessibilidade-zoom.json). Scripts auxiliares locais em `.cache` continuam ignorados, sem substituírem a suíte mantida.

### Contraste dos componentes efetivamente consultados

Razões de luminância relativa para pares computados no Chrome; referência de projeto: 4,5:1 para textos consultados, 3:1 para limites/gráficos medidos (aula p. 3). Texto de campo preto/branco 21:1; rótulos 9,74:1; ajuda 7,56:1; primário 7,90:1; secundário 8,68:1; ícone X 10,31:1; evento do calendário 11,94:1; aviso de prazo 8,75:1; erro 7,56:1. Borda de planejamento/comentário sem foco 4,83:1; foco usa contorno `#363795`/branco 9,83:1. Algumas amostras de borda focada foram colhidas durante transição de cor; os valores brutos constam no registro, sem substituir a razão do estado estável. Sucesso/interrupção mantêm os pares já medidos no [guia](guia-estilo.md).

### Execução e preservação

- `bun run test`: **44 testes, 301 asserções, zero falhas**, em nove arquivos; migração, API, datas, conflitos, timer, painel e recuperação existentes. A exceção SQLite impressa faz parte de falha simulada intencional do teste de rollback; saída final 0. Bun também avisou não conseguir criar alias temporário de Node nessa execução, sem impedir os testes. Nenhuma instalação/regravação do lockfile.
- `bun run --bun build` no frontend, Bun no PATH: TypeScript e Vite aprovados. Não existe script de lint configurado. `git diff --check` aprovado.
- Preparação fictícia, reorganização e falhas ficaram no banco isolado identificado pelo cabeçalho de teste; perfil de navegador exclusivo. Não houve teste destrutivo, recriação ou restauração do banco pessoal. Não se alega igualdade final de WAL/SHM, pois a aplicação pessoal pode ser utilizada pelo responsável.
- `git ls-files .cache` não apresentou arquivos. PDF/texto continuam cobertos pelo `.gitignore` de referências, sem serem removidos do disco. Capturas e registros próprios entram no Git; ferramentas/perfis/bancos/builds não entram.

## Limites e escopo da entrega local

Inspeção técnica automatizada no Chrome **headless** do Windows, acompanhada de leitura das capturas; não houve sessão manual com uma pessoa com baixa visão. Não foram executados NVDA/JAWS/VoiceOver, ampliador do sistema operacional, outros navegadores, alto contraste do sistema, aparelho físico, preferências de fonte independentes do zoom ou todas as combinações de posição/rolagem. Não se declara conformidade WCAG completa nem teste com pessoas com deficiência. O quadro, calendário e diálogos exigem rolagem vertical em ampliação alta; identificação curta do painel continua deliberada, com informação completa ao restaurar.

Atualização do responsável em 21/11/2026: não haverá hospedagem nem coleta com participantes nesta entrega. A ausência de avaliação com usuários permanece **limitação**, sem etapa de recrutamento ou coleta no roadmap. A revisão de acessibilidade continua por inspeções técnicas e revisões internas das duas HTAs, preservando os registros existentes e distinguindo observações internas de hipóteses sobre alunos. Reconhecimento das escolhas, esforço ao rolar e orientação ao recolher o painel não foram medidos com usuários; Rafael não é participante. [Execução e demonstração local com dados fictícios](demonstracao-local.md).
