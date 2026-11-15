# Orientações para o Planejador Acadêmico

Projeto acadêmico de IHC da UCS, desenvolvido a partir do to-do existente. Leia `docs/projeto-ihc.md`, `docs/htas.md`, `docs/decisoes-interface.md`, `docs/roadmap.md` e `docs/referencias/INDICE.md` antes de alterar funcionalidades.

## Fontes
- Exigências acadêmicas: `docs/referencias/diretrizes/Trabalho-III.pdf`.
- Fundamentação: PDFs em `docs/referencias/aulas/`; extrações auxiliares em `docs/referencias/textos/`.
- Decisões de produto: documentos Markdown deste pacote. Diferencie decisões confirmadas de hipóteses e propostas técnicas.
- Exigências obrigatórias vêm do enunciado; recomendações e exemplos das aulas não acrescentam automaticamente obrigações à entrega. Se houver conflito com decisões de produto, apresente-o antes de implementar.
- Escopo e HTAs descrevem a evolução pretendida. Confira o código e o estado registrado no roadmap antes de afirmar que uma funcionalidade existe.
- Textos extraídos não preservam imagens ou todo o layout. Consulte as páginas dos PDFs quando necessário. Não alegue ter lido imagens apenas com extração textual.
- Os PDFs e suas extrações são materiais locais de consulta; não os inclua nos commits. A pasta de referências contém um `.gitignore` próprio.

## Implementação
- Preserve e aproveite a arquitetura existente. Evite mudanças de stack, bibliotecas desnecessárias e funcionalidades fora do escopo.
- Interface em português brasileiro. Uma tela principal com filtro de período; não criar três abas independentes para dia, mês e semestre.
- Modo Foco em janela única com campos condicionais; manter cancelamento e revisão antes de alterar o planejamento.
- Prazo da atividade, data de estudo e término do timer são conceitos diferentes.
- Preserve dados existentes e use migrações compatíveis. Nunca recrie o banco para acrescentar um campo.
- Verifique regras de datas, cancelamento, falhas e conflitos com testes proporcionais. Diferencie testes de API, build e inspeção real da interface.
- Não invente entrevistas, participantes, métricas, aprovações ou resultados de avaliação. Personas são hipóteses iniciais.
- Registre decisões relevantes e mantenha documentação coerente com o que foi efetivamente implementado.

## Git
- Confira estado e alterações locais antes de agir; não descarte trabalho existente.
- Uma branch por tarefa a partir da main atualizada; sem branch develop.
- Conventional Commits, commits pequenos por unidade concluída e verificada, e push da branch estão autorizados pelo responsável.
- Abrir PR quando possível ou fornecer o link de comparação. Não fazer merge automaticamente sem instrução do responsável.
- Não criar commits vazios, tags por commit, force pushes nem reescrever o histórico.
- Manter dependências instaladas, builds, segredos e bancos locais fora do Git; preservar lockfiles e exemplos seguros.

## Validação de execução já relatada
Os resultados abaixo foram relatados na etapa de validação e confirmados por Gabriel ao incorporar este contexto. Não representam uma nova execução nesta tarefa de documentação.

- Bun 1.4.4 funcionando no Windows; foi necessário ajustar o PATH do terminal.
- Dependências instaladas com `--frozen-lockfile`, sem alteração do lockfile; build TypeScript + Vite aprovado.
- Backend e frontend iniciados e encerrados após os testes.
- API: criação, consulta, edição, mudança de status, exclusão e comentários passaram.
- Frontend: entrega de arquivos e proxy verificados; interações visuais no navegador ainda não verificadas.
- Banco de teste criado isoladamente; banco original e auxiliares preservados, com hashes iguais.
- Naquela validação inicial não existiam scripts de testes automatizados ou lint. A etapa de planejamento acrescentou `bun run test`; lint continua sem configuração.
- README atualizado no commit `3fa15e5` da branch `chore/validar-execucao`. O Git remoto consultado nesta incorporação confirmou o merge pelo PR #2, commit `538bb10` da `origin/main`; a base já havia entrado pelo PR #1, commit `3348ddc`.

Não repita instalação e testes apenas para incorporar documentação. Para novas alterações de código, faça verificações proporcionais e registre a versão avaliada. Build e testes de API não comprovam usabilidade, acessibilidade ou sucesso de interação pela interface. Consulte novamente o Git remoto antes de depender de integrações futuras.

## Primeira etapa acadêmica implementada
- Modelo e migração: `docs/modelo-dados.md`. Disciplinas são opcionais e independentes das categorias; atividades possuem várias sessões. Prazo continua pertencendo à atividade.
- Períodos: Todas, Hoje, Este mês, Este semestre, Personalizado e Sem planejamento, por data planejada das sessões; atividades e contadores sem duplicação. Semestre civil jan–jun/jul–dez, não calendário oficial da UCS.
- Resultados desta etapa, roteiro e limitações: `docs/validacao-planejamento.md`. Há testes Bun de migração/API/regras e verificação no Chrome, inclusive teclado e tela estreita. Não confundir isso com avaliação com participantes ou conformidade completa de acessibilidade.
- Calendário visual, Foco, timer, sugestões e troca de atividades continuam planejados. As duas HTAs completas ainda não estão implementadas.
