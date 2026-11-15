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

> **Em desenvolvimento:** disciplinas, sessões de estudo, filtros, calendário visual e modo Foco estão implementados. Avaliação acadêmica, guia completo de estilo e revisão ampla de acessibilidade continuam em andamento.

## Funcionalidades da base

- Quadro Kanban com tarefas a fazer, em progresso e concluídas.
- Criação, edição, exclusão e consulta de tarefas.
- Categorias, prioridades e datas de vencimento.
- Comentários por tarefa.
- Indicadores de tarefas vencidas e contadores por situação.
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
- [ ] Ampliar a revisão de acessibilidade e realizar/documentar avaliação humana do protótipo.

## Fluxos principais

### Realizar uma sessão de estudo

Consultar a sugestão, escolher a atividade e iniciar uma sessão de foco. Ao terminar, o estudante decide se a atividade foi concluída ou se ainda precisa continuar.

**O término do timer não conclui automaticamente a atividade.**

### Reorganizar o planejamento

Escolher outra atividade para estudar e decidir o destino da sessão original: manter o planejamento, reagendar ou deixar a atividade pendente sem data. As alterações são apresentadas para revisão antes da confirmação.

**Reagendar um estudo não altera o prazo da atividade.**

## Processo de design

O trabalho contempla:

1. Definição do problema, contexto de uso e três personas.
2. Organização da informação e requisitos em histórias de usuário.
3. Análise Hierárquica de Tarefas (HTA) dos dois fluxos principais.
4. Exploração de duas alternativas de baixa fidelidade.
5. Construção do protótipo e de um guia de estilo.
6. Revisão da interação e registro das melhorias.

As personas iniciais são hipóteses de projeto. Revisões internas e eventuais testes com participantes serão identificados conforme forem realizados.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Interface | React 18, TypeScript e Vite |
| API | Bun e TypeScript |
| Persistência | SQLite com `bun:sqlite` |

## Executar localmente

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

### Usar o calendário

Em **Visualização**, escolha **Calendário**. O filtro de período é mantido ao alternar para o **Quadro**. Mês anterior, Próximo mês e Hoje mudam apenas o mês visualizado, sem alterar o filtro; ambos ficam identificados na tela.

Selecione um dia, escolha uma atividade existente e use **Planejar sessão neste dia**; a data vem preenchida no formulário. Selecione uma sessão para consultar a atividade e editar ou remover aquele planejamento. **Ver mais** abre todos os eventos do dia. Em **Sem planejamento**, use a lista de atividades e a ação **Planejar**. Em telas estreitas, o mês aparece como uma agenda em lista.

Consulte [decisões, testes e roteiro do calendário](docs/calendario-estudos.md).

### Usar o Foco

Reinicie o backend após atualizar esta versão para aplicar as migrações aditivas dos recibos. A interface verifica se o servidor suporta a recuperação segura antes de gravar; se ele ainda estiver na versão antiga, os campos ficam preservados e a mensagem orienta reiniciar o servidor.

Clique em **Foco**, no Quadro ou Calendário. Em **Escolher o que estudar**, consulte a sugestão, selecione a atividade e qual estudo de hoje quer usar ou substituir; **Nenhum destes** permite planejar um novo. Continue para **Ajustar o planejamento**, quando pertinente, e depois **Revisar e iniciar**. A mesma atividade do estudo escolhido pula o ajuste. Use **Voltar** para corrigir; **Guardar escolhas e voltar** ou Escape conserva a preparação na mesma página. **Cancelar preparação e descartar escolhas** não grava.

O padrão é estudo de 25 minutos e pausa de 5. Estudo pode ser ajustado entre 1 e 180 minutos inteiros. Pausar, minimizar, mudar a visualização e recarregar preservam o estado no mesmo navegador/endereço. Zero exige uma decisão; **Concluir atividade** é uma ação distinta. Repetir ciclos não cria novos agendamentos. Uma confirmação com resposta perdida pode ser recuperada sem duplicar o planejamento.

**Minimizar Foco** mantém o timer para consultar o quadro e voltar. **Encerrar este ciclo** mostra as escolhas de continuação e permite retomar o restante se encerrou por engano. **Encerrar estudo e voltar** libera a escolha de outra atividade e não desfaz o planejamento salvo. A duração de um estudo planejado pode conter vários ciclos; ela não é o prazo da atividade.

Se faltar confirmação ao salvar atividade, disciplina, estudo ou comentário, os campos ficam preservados e a alteração bloqueada para **Verificar resultado**. Fechar o formulário não cancela uma requisição já enviada; o aviso principal recupera o mesmo pedido, inclusive após recarregar a mesma aba. Evite refazer o cadastro. Pedidos comuns usam armazenamento da aba; fechar a aba ou limpar esse armazenamento pode perder a recuperação. Rascunhos ainda não enviados não são recuperados após recarregar. Ao cadastrar uma atividade, **Cadastrar disciplina aqui** retorna ao formulário sem perder título, descrição ou prazo.

Consulte [regras, recuperação, limites e roteiros das duas tarefas](docs/modo-foco.md).

Veja a [revisão de IHC](docs/revisao-ihc.md) para diagnóstico, fontes originais, antes/depois, capturas, verificações e limitações. A inspeção técnica não é uma avaliação com participantes.

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
