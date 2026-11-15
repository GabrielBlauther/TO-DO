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

> **Em desenvolvimento:** o repositório parte de um gerenciador de tarefas existente. O planejamento acadêmico, o calendário e o modo Foco fazem parte da evolução prevista e ainda não estão implementados na versão inicial.

## Funcionalidades da base

- Quadro Kanban com tarefas a fazer, em progresso e concluídas.
- Criação, edição, exclusão e consulta de tarefas.
- Categorias, prioridades e datas de vencimento.
- Comentários por tarefa.
- Indicadores de tarefas vencidas e contadores por situação.
- Confirmação antes da exclusão.

## Evolução planejada

- [ ] Vincular atividades às disciplinas da faculdade.
- [ ] Separar a data planejada de estudo do prazo da atividade.
- [ ] Consultar períodos diários, mensais, semestrais e personalizados por um filtro na mesma tela.
- [ ] Integrar as atividades a um calendário.
- [ ] Criar o modo Foco com timer Pomodoro e controles de pausa e encerramento.
- [ ] Sugerir uma atividade com base no planejamento e nos prazos, explicando o motivo.
- [ ] Permitir trocar a atividade de estudo e reorganizar a sessão anterior.
- [ ] Implementar feedback, validações e tratamento de conflitos de horário.
- [ ] Revisar navegação por teclado, contraste e adaptação a telas menores.
- [ ] Documentar a avaliação do protótipo e as melhorias realizadas.

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

Instale as dependências da interface:

```bash
cd frontend
bun install
cd ..
```

Inicie a API em um terminal:

```bash
bun run backend/index.ts
```

Em outro terminal, inicie a interface:

```bash
cd frontend
bun run dev
```

Endereços padrão:

- Interface: `http://localhost:5173`
- API: `http://localhost:3001`

Caso uma porta esteja ocupada, confira o endereço informado no terminal.

## Contexto acadêmico

**Instituição:** Universidade de Caxias do Sul (UCS)  
**Curso:** Ciência da Computação  
**Disciplina:** Interação Humano-Computador  
**Trabalho:** Design de Interação e Prototipação de Interface  
**Período:** 2026/2

O repositório reúne a evolução técnica do protótipo. O relatório, os estudos de alternativas e a apresentação complementarão a entrega acadêmica.
