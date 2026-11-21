# Planejador Acadêmico

Organização de tarefas, planejamento de estudos e sessões de foco para a rotina universitária.

![Status](https://img.shields.io/badge/status-em_desenvolvimento-yellow)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)

## Sobre o projeto

O Planejador Acadêmico nasce de uma aplicação de tarefas em Kanban e evolui para apoiar estudantes na organização das demandas da faculdade: decidir o que estudar, acompanhar prazos e adaptar o planejamento quando surgem imprevistos.

O projeto é desenvolvido no contexto do **Trabalho III — Design de Interação e Prototipação de Interface**, da disciplina de **Interação Humano-Computador (IHC)**, do curso de Ciência da Computação da **Universidade de Caxias do Sul (UCS)**.

A proposta aplica Design Centrado no Usuário para conectar necessidades dos estudantes a requisitos, alternativas de interface e um protótipo navegável. O foco está na qualidade da interação, na clareza das informações e no controle do usuário sobre suas decisões.

> **Entrega local:** disciplinas, sessões de estudo, filtros, calendário visual e modo Foco estão implementados. Guia de estilo consolidado e revisão técnica de acessibilidade registrada, incluindo zoom real de 200% e 400%. A entrega será demonstrada localmente, sem hospedagem ou coleta com participantes; a ausência de avaliação com usuários é uma limitação.

## Funcionalidades da base

- Quadro Kanban com tarefas a fazer, em progresso e concluídas.
- Criação, edição, exclusão e consulta de tarefas.
- Categorias, prioridades e datas de vencimento.
- Comentários por tarefa.
- Indicadores de tarefas vencidas e contadores por situação.
- Arrastar cards entre A fazer, Em progresso e Concluídas nos dois sentidos, com destaque do destino e alternativa Mover para… por teclado e toque.
- Confirmação antes da exclusão.
- Disciplina opcional por atividade, sem substituir as categorias existentes.
- Várias sessões de estudo por atividade, com data, horário opcional e duração em minutos.
- Filtros Todas, Hoje, Este mês, Este semestre, Personalizado e Sem planejamento.
- Validação de conflitos de horário e confirmação de estudo após o prazo.
- Visualização mensal de calendário, com navegação entre meses e planejamento por dia.
- Foco com escolha, ajuste pertinente e revisão, sugestão explicada, Pomodoro recuperável e reorganização atômica do estudo anterior.
- Rascunhos preservados ao retornar e verificação de gravações sem confirmação, sem duplicar pedidos.

## Evolução planejada

- [x] Vincular atividades às disciplinas da faculdade.
- [x] Separar a data planejada de estudo do prazo da atividade.
- [x] Consultar períodos diários, mensais, semestrais e personalizados por um filtro na mesma tela.
- [x] Integrar as atividades a um calendário.
- [x] Criar o modo Foco com timer Pomodoro e controles de pausa e encerramento.
- [x] Sugerir uma atividade com base no planejamento e nos prazos, explicando o motivo.
- [x] Permitir trocar a atividade de estudo e reorganizar a sessão anterior.
- [x] Implementar feedback, validações e tratamento de conflitos de horário.
- [x] Revisar os fluxos existentes, retorno, teclado e contraste dos controles corrigidos, com diagnóstico e verificações registrados.
- [x] Consolidar o guia de estilo e verificar ampliação, teclado e contraste nos fluxos registrados, com limitações explícitas.
- [ ] Concluir os materiais acadêmicos e ensaiar a demonstração local das duas HTAs; corrigir barreiras concretas identificadas nas revisões internas.

## Fluxos principais

### Realizar uma sessão de estudo

Consultar a sugestão, escolher a atividade e iniciar uma sessão de foco. Ao terminar, o estudante decide se a atividade foi concluída ou se ainda precisa continuar.

**O término do timer não conclui automaticamente a atividade.**

### Reorganizar o planejamento

Escolher outra atividade para estudar e decidir o destino da sessão original: manter o planejamento, reagendar ou deixar a atividade pendente sem data. As alterações são apresentadas para revisão antes da confirmação.

**Reagendar um estudo não altera o prazo da atividade.**

## Processo de design

O trabalho contempla:

1. Definição do problema, contexto de uso e ao menos três personas (quatro hipóteses documentadas).
2. Organização da informação e requisitos em histórias de usuário.
3. Análise Hierárquica de Tarefas (HTA) dos dois fluxos principais.
4. Exploração de duas alternativas de baixa fidelidade.
5. Construção do protótipo e de um guia de estilo.
6. Revisão da interação e registro das melhorias.

As quatro personas documentadas são hipóteses de projeto. Revisões internas e verificações técnicas são identificadas conforme realizadas; não haverá coleta com participantes nesta entrega. A ausência de avaliação com usuários é registrada como limitação.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Interface | React 18, TypeScript e Vite |
| API | Bun e TypeScript |
| Persistência | SQLite com `bun:sqlite` |

## Executar localmente

Para apresentar sem usar seus dados pessoais, siga o [roteiro de demonstração local com banco fictício](docs/demonstracao-local.md). Ele usa a opção `DATABASE_PATH` existente e inclui os exemplos e as duas HTAs.

É necessário ter o **Bun** instalado. Execute os comandos a partir da pasta raiz do projeto, onde estão `backend` e `frontend`.

Confirme a instalação com `bun --version`. No Windows, se o comando não for reconhecido após a instalação, feche e reabra o editor. Para ajustar apenas o terminal PowerShell atual:

```powershell
$env:Path = "$env:USERPROFILE\.bun\bin;$env:Path"
bun --version
```

Instale as dependências da interface:

```bash
cd frontend
bun install --frozen-lockfile
cd ..
```

Inicie a API em um terminal:

```bash
bun run backend/index.ts
```

Na primeira execução, a API cria `todo.db` no diretório de trabalho, com as tabelas e os dados de exemplo definidos em `backend/database.ts`. Não é necessário copiar um banco existente. Os bancos locais e seus arquivos auxiliares não são versionados.

Em outro terminal, inicie a interface:

```bash
cd frontend
bun run --bun dev
```

O argumento `--bun` executa o Vite com Bun, inclusive quando Node.js não está instalado.

Para verificar os tipos TypeScript e gerar o build de produção, execute dentro de `frontend`:

```bash
bun run --bun build
```

O resultado fica em `frontend/dist`, que não é versionado. Na raiz, execute `bun run test` para os testes automatizados de migração, API e regras de planejamento. Não há lint configurado.

O banco existente recebe uma migração aditiva ao iniciar a API; tarefas, comentários, categorias, prioridades e prazos são preservados. Tarefas antigas ficam sem disciplina e sem sessões até serem planejadas. Para usar outro banco, defina `DATABASE_PATH` antes de iniciar o backend; `PORT` também é opcional (padrão 3001).

O período considera a **data planejada das sessões**, não o prazo. Atividades sem sessões aparecem em **Todas** e **Sem planejamento**. Cada atividade aparece uma vez, e os contadores refletem o filtro. **Este semestre** usa janeiro–junho ou julho–dezembro do ano atual, convenção do protótipo e não calendário oficial da UCS. Intervalos personalizados incluem os dois limites.

Veja o [modelo de dados](docs/modelo-dados.md) e o [roteiro de validação e uso](docs/validacao-planejamento.md).

### Mover atividades no quadro

Arraste o cartão pela área de conteúdo ou pelo indicador ao lado do título e solte em outra coluna. O destino recebe contorno tracejado e a instrução **Solte aqui**. Para teclado/toque, abra **Mover para…** e escolha uma das outras duas situações; Tab e Enter/espaço acionam os botões. É possível voltar de Concluída para A fazer ou Em progresso, ou concluir diretamente uma atividade A fazer.

A mudança aparece enquanto é salva, com indicação de progresso. Se for rejeitada, o cartão e os contadores voltam à situação anterior. Se a resposta se perder após o envio, o retorno é **provisório**: o servidor pode já ter salvo; use **Verificar resultado** no aviso principal. O quadro bloqueia novas mudanças nesse cartão até verificar o mesmo pedido. Mover não altera disciplina, prioridade, prazo, comentários nem estudos planejados. O filtro de período permanece ativo; não há reordenação manual dentro das colunas.

### Usar o calendário

Em **Visualização**, escolha **Calendário**. O filtro de período é mantido ao alternar para o **Quadro**. Mês anterior, Próximo mês e Hoje mudam apenas o mês visualizado, sem alterar o filtro; ambos ficam identificados na tela.

Selecione um dia, escolha uma atividade existente e use **Planejar sessão neste dia**; a data vem preenchida no formulário. Selecione uma sessão para consultar a atividade e editar ou remover aquele planejamento. **Ver mais** abre todos os eventos do dia. Em **Sem planejamento**, use a lista de atividades e a ação **Planejar**. Em telas estreitas, o mês aparece como uma agenda em lista.

Consulte [decisões, testes e roteiro do calendário](docs/calendario-estudos.md).

### Usar o Foco

Reinicie o backend após atualizar esta versão para aplicar as migrações aditivas dos recibos. A interface verifica se o servidor suporta a recuperação segura antes de gravar; se ele ainda estiver na versão antiga, os campos ficam preservados e a mensagem orienta reiniciar o servidor.

Clique em **Foco**, no Quadro ou Calendário. Em **Escolher atividade**, consulte a sugestão, selecione a atividade e qual estudo de hoje quer usar ou substituir; **Nenhum destes** permite planejar um novo. Continue para **Ajustar planejamento**, quando pertinente, e depois **Revisar e iniciar**. A mesma atividade do estudo escolhido pula o ajuste. O resumo separa atividade, disciplina, prazo e estudo planejado, sem repetir a mesma atividade. No rodapé centralizado, use **Voltar**, **Sair** ou **Iniciar foco**. **Ajuda e atualização da lista** fica somente na escolha da atividade.

**Minimizar**, X, clique fora e Escape abrem uma única confirmação de minimização. Antes do início, **Minimizar e guardar** conserva escolhas nesta página e **Descartar preparação** limpa o rascunho sem gravar; **Continuar aqui** retorna aos campos. Com pedido pendente, só é possível guardar para verificar depois, sem descartar o pedido enviado. Recarregar recupera timer/pedido enviado, mas não um rascunho ainda não enviado.

O padrão é estudo de 25 minutos e pausa de 5. Estudo pode ser ajustado entre 1 e 180 minutos inteiros. Pausar, minimizar, mudar a visualização e recarregar preservam o estado no mesmo navegador/endereço. Zero exige uma decisão; **Marcar atividade como concluída** é uma ação distinta. Repetir ciclos não cria novos agendamentos. Uma confirmação com resposta perdida pode ser recuperada sem duplicar o planejamento.

**Minimizar** mostra um painel compacto flutuante dentro da aplicação, com atividade, tempo, Pausar/Retomar e Restaurar Foco. No celular, use **Recolher painel do Foco** (seta para baixo) para liberar o conteúdo; o tempo e a identificação continuam visíveis e há espaço de rolagem abaixo da página. A seta para cima expande os controles e recupera a posição anterior. Arraste por **Foco · mover** ou clique/toque para escolher um canto; por teclado, use as setas (Shift move mais). Escape cancela arraste/fecha opções. Mover, recolher ou restaurar não muda o timer. A posição vale nesta página, sem sobrepor outros programas.

**Encerrar ciclo** não conclui a atividade: mostra o resultado e **Próximo passo**, propondo pausa após estudo, estudo após pausa ou encerramento se a atividade já foi concluída. Você pode escolher outro passo ou retomar o restante de um ciclo encerrado cedo. Nada começa automaticamente; o botão descreve o efeito antes de confirmar. **Marcar atividade como concluída** fica no resultado e é independente do timer. **Encerrar estudo** libera outra atividade e não desfaz planejamento. Um estudo planejado pode conter vários ciclos; sua duração não é o prazo da atividade.

Na escolha da atividade, **Ajuda e atualização da lista** permite atualizar sem perder campos, com indicação de espera e resultado. Se uma consulta falhar depois de confirmar o estudo, o timer continua e a mensagem oferece atualizar a lista sem repetir a gravação. O cadastro de disciplina é livre e não oferece exemplos. A marcação solicita ao navegador não sugerir histórico; o popup específico do perfil pessoal ainda precisa de confirmação, conforme o [diagnóstico corrigido](docs/ajustes-pre-hospedagem.md).

Se faltar confirmação ao salvar atividade, disciplina, estudo ou comentário, os campos ficam preservados e a alteração bloqueada para **Verificar resultado**. Fechar o formulário não cancela uma requisição já enviada; o aviso principal recupera o mesmo pedido, inclusive após recarregar a mesma aba. Evite refazer o cadastro. Pedidos comuns usam armazenamento da aba; fechar a aba ou limpar esse armazenamento pode perder a recuperação. Rascunhos ainda não enviados não são recuperados após recarregar. Ao cadastrar uma atividade, **Cadastrar disciplina aqui** retorna ao formulário sem perder título, descrição ou prazo.

Todos os modais têm **X** no canto superior direito. Clicar no X, fora da janela ou usar Escape apresenta uma confirmação. **Continuar aqui** mantém os campos; a saída informa se descarta o rascunho ou apenas minimiza o Foco. No Foco, os nomes das saídas descrevem guardar/descartar a preparação ou minimizar o timer. Escape durante essa confirmação volta ao formulário. Durante uma gravação, aguarde a confirmação do resultado antes de sair.

Todos os modais permitem **Expandir** e **Restaurar tamanho**, sem salvar nem descartar campos. Somente o Foco tem **Minimizar** no cabeçalho: reabra pelo botão Foco, com o tamanho escolhido preservado na mesma página. A confirmação de fechamento continua obrigatória por X/clique fora/Escape. Estudo ou pausa em andamento **continuará contando** com a janela fechada/minimizada; um timer pausado permanece pausado, e um ciclo terminado não inicia outro. **Fechar a janela não encerra o estudo.**

Consulte [regras, recuperação, limites e roteiros das duas tarefas](docs/modo-foco.md).

Veja a [revisão de IHC](docs/revisao-ihc.md) para diagnóstico, fontes originais, antes/depois, capturas, verificações e limitações. A inspeção técnica não é uma avaliação com participantes.

Consulte os [ajustes de interação e verificações](docs/ajustes-pre-hospedagem.md), o [guia de estilo sucinto](docs/guia-estilo.md) e as [capturas desktop/celular](docs/capturas-pre-hospedagem.md). A [revisão de ampliação](docs/acessibilidade-ampliacao.md) e suas [capturas de zoom real](docs/capturas-acessibilidade.md) complementam essas evidências. A [consolidação anterior](docs/consolidacao-interacoes.md) permanece como histórico, com a interpretação sobre disciplinas explicitamente corrigida. Não houve avaliação de clareza com usuários; isso é limitação, sem coleta prevista nesta entrega.

Os roteiros apresentados em `.cache` são verificações temporárias e não estão versionados. Os testes mantidos no projeto são `backend/*.test.ts`; execute `bun run test` na raiz. Não é necessário copiar ferramentas locais de `.cache` para executar esses testes.

Endereços padrão:

- Interface: `http://localhost:5173`
- API: `http://localhost:3001`

O Vite pode escolher outra porta se a 5173 estiver ocupada; confira o endereço informado no terminal. A API usa a porta fixa 3001 e precisa que ela esteja livre.

## Contexto acadêmico

**Instituição:** Universidade de Caxias do Sul (UCS)  
**Curso:** Ciência da Computação  
**Disciplina:** Interação Humano-Computador  
**Trabalho:** Design de Interação e Prototipação de Interface  
**Período:** 2026/2

O repositório reúne a evolução técnica do protótipo. O relatório, os estudos de alternativas e a apresentação complementarão a entrega acadêmica.
