# Orientações para o Planejador Acadêmico

Projeto acadêmico de IHC da UCS, desenvolvido a partir do to-do existente. Leia `docs/projeto-ihc.md`, `docs/htas.md`, `docs/decisoes-interface.md`, `docs/roadmap.md` e `docs/referencias/INDICE.md` antes de alterar funcionalidades.

Para planejamento e calendário, consulte também `docs/modelo-dados.md`, `docs/validacao-planejamento.md` e `docs/calendario-estudos.md`, distinguindo registros históricos do estado atual.
Para execução de estudo e reorganização, leia `docs/modo-foco.md`, inclusive limites da recuperação local e da confirmação idempotente.
Para interação, leia também `docs/revisao-ihc.md`: diagnóstico anterior às correções, fontes/páginas, evidências e limitações. Prioridade: enunciado → aulas originais → decisões/personas/HTAs próprias (revisáveis). O código não é a especificação correta por existir.
Estado consolidado dos pedidos recentes, lacunas iniciais e evidências finais: `docs/consolidacao-interacoes.md`. Capturas próprias de desktop/celular: `docs/capturas-consolidacao.md`. Registros anteriores são históricos; não presumir o estado atual por uma seção antiga.
Revisão atual de 21/11: `docs/ajustes-pre-hospedagem.md`, `docs/guia-estilo.md` e `docs/capturas-pre-hospedagem.md`. Corrige a interpretação sobre disciplinas e registra os ajustes visuais delimitados, sem hospedagem.
Complemento de acessibilidade: `docs/acessibilidade-ampliacao.md` e `docs/capturas-acessibilidade.md`. Rafael Costa é persona hipotética, não participante. Fonte nova no índice local; preservar zoom real sem perda e foco não encoberto. Não substituir zoom nativo de 200%/400% por viewport estreita, CSS zoom ou menu de acessibilidade. Modais baixos deixam cabeçalho/rodapé no fluxo; calendário usa agenda até 900 px CSS; painel reserva rolagem e se recolhe quando encobrir foco externo, sem roubá-lo ou alterar timer.

## Escopo da entrega local — atualizado em 21/11/2026

- O protótipo será executado e demonstrado localmente. Não há hospedagem nem coleta com participantes nesta entrega; não manter essas etapas como pendências.
- Não implementar versão para hospedagem, isolamento por participante, login ou banco remoto. Usar a arquitetura local existente.
- Continuar as correções/verificações técnicas de acessibilidade pertinentes; preservar registros de revisões internas e ensaios técnicos, sem tratá-los como avaliação com usuários. A ausência dessa avaliação é limitação, não etapa prometida.
- Personas, inclusive Rafael, continuam hipotéticas. Recomendações antigas de avaliação humana nos registros históricos não ampliam o escopo atual.
- Execução reproduzível e roteiro fictício em `docs/demonstracao-local.md`, usando `DATABASE_PATH` já existente para preservar o banco pessoal. Separar armazenamento do navegador da demonstração para não recuperar pedidos/timer pessoais nesse banco. Não apagar nem reinicializar dados pessoais.

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
- Foco com etapas internas de escolha, ajuste pertinente e revisão; Voltar mantém escolhas. Reutilizar o mesmo estudo pula o ajuste. A revisão de IHC substitui a exigência anterior de reunir todas as escolhas simultaneamente.
- Revisão da sobrecarga do Foco: um rodapé centralizado com até três ações pertinentes. Minimizar usa a mesma confirmação do X/Escape/fundo; guardar/descartar preparação ficam nela, sem botões concorrentes espalhados. Ajuda/atualização somente na escolha. Resumo identifica atividade/disciplina/prazo/planejamento sem duplicar informações. Após o ciclo, Próximo passo revela somente os campos necessários e um botão confirma o efeito escolhido; conclusão da atividade fica no bloco de resultado, independente do timer. Minimizar permanece no cabeçalho.
- Distinguir guardar preparação, descartar preparação, minimizar timer, encerrar ciclo e encerrar estudo. Nunca anunciar cancelamento de uma requisição já enviada como se desfizesse seus efeitos.
- Preferência expressa em 20/11/2026: todos os diálogos têm X; X, clique fora e Escape pedem uma única confirmação de saída. Continuar preserva campos e foco. No Foco, sair minimiza e preserva execução/escolhas. Aguardar gravação em andamento; não duplicar a confirmação de rascunho após a saída já autorizada.
- Na confirmação de saída, o X cancela essa confirmação e volta ao conteúdo, assim como Escape/Continuar aqui. Seu nome acessível deve refletir esse efeito. Não deixar um X habilitado sem ação nem confirmar descarte/encerramento por um segundo clique no X.
- Controles confirmados na rodada seguinte: expandir/restaurar tamanho em todos os modais; minimizar apenas o Foco. Tamanho não altera dados ou timer. Ao reabrir Foco minimizado, preservar o tamanho escolhido nesta página. Fechar não encerra estudo; mensagens distinguem estudo/pausa contando, timer pausado e ciclo terminado, inclusive na confirmação aberta.
- Minimizar Foco deve mostrar painel compacto flutuante **dentro da aplicação**, não faixa no cabeçalho. Tempo, identificação, pausa/retomada e restauração usam o mesmo timer. Arraste limitado à área visível, alternativas por setas/seletor e toque; não ampliar para outros programas. Recolher no celular libera o conteúdo por rolagem, sem novo arraste. Mover/recolher nunca altera planejamento. Resultado de sucesso tem título/ícone/cor distintos da interrupção antecipada, com mensagem curta e conclusão da atividade separada. A confirmação diz minimizar e descreve contagem/pausa/término.
- Cadastro de disciplina é livre, sem a lista de exemplos acrescentada por interpretação incorreta. O relato era de nomes digitados anteriormente. Solicitar autocomplete off, mas distinguir ausência de popup da aplicação de controle do histórico do navegador; confirmar comportamento no perfil pessoal antes de declarar solução completa. Não apagar disciplinas já cadastradas nem histórico pessoal.
- Erros precisam informar operação, causa conhecida, estado e recuperação. Resultado incerto mantém o mesmo pedido/chave; verificar antes de permitir outra gravação. Preservar campos; não inventar causas nem afirmar ausência de gravação após perda de resposta.
- Atividade, disciplina, prazo, estudo planejado e ciclo são conceitos distintos. Usar vocabulário reconhecível e campos condicionais. Recomendações das aulas são contextuais, não regras universais.
- Prazo da atividade, data de estudo e término do timer são conceitos diferentes.
- Quadro: arrastar entre todas as situações e a alternativa Mover para… usam a mesma gravação. Destino tem contorno/texto, não apenas cor. Em falha, reverter somente a situação otimista e preservar os demais dados; em resultado incerto, retorno é provisório e o mesmo pedido deve ser verificado antes de mover novamente pelo quadro. Não implementar arraste de datas no calendário como consequência desse recurso.
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
- `.cache/` contém roteiros e ferramentas temporários locais, não testes mantidos. A auditoria desta rodada não encontrou arquivos versionados nessa pasta; não apagá-los para limpar o Git. Testes mantidos estão em `backend/*.test.ts` e são executados por `bun run test`.

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
- Calendário mensal implementado na etapa seguinte, com seletor Quadro/Calendário, sem alterar sessões ou API. Regras e verificações: `docs/calendario-estudos.md`.
- Foco em janela única, sugestões determinísticas, timer recuperável e reorganização atômica implementados na etapa seguinte. Regras, testes e limitações em `docs/modo-foco.md`. As duas HTAs têm suporte funcional; não apresentar isso como avaliação com participantes ou comprovação de usabilidade.

## Revisão de IHC implementada
- Foco integrado à main pelo PR #6 (`9952103`), confirmado antes de criar `fix/revisao-ihc`. Não presumir integrações posteriores.
- Diagnóstico e correções em `docs/revisao-ihc.md`; consulta textual integral das 15 aulas e enunciado, com inspeção visual delimitada e limitações explícitas. Não houve avaliação com participantes.
- Mutações comuns agora usam recibos transacionais em `mutation_receipts`; a interface verifica suporte do servidor antes de gravar. Reiniciar o backend atualizado aplica a migração aditiva sem recriar o banco.
- Pedidos comuns pendentes são guardados em `sessionStorage` nesta aba; Foco continua em `localStorage`. Campos bloqueados após resposta incerta, com verificação do mesmo pedido ou fechamento para recuperar pelo aviso principal. Fechar a aba/limpar armazenamento tem limites descritos na revisão.
- Testes e build passaram; Chrome desktop/390 px incluiu os dois fluxos, erros, teclado, retorno e duas abas. Não equivalem a teste de usabilidade ou auditoria completa de acessibilidade.
- Correção posterior do cadastro: a checagem de suporte usa GET `/api/categories` com `cache: no-store`. OPTIONS é respondido pelo CORS do Vite antes do proxy e não comprova a capacidade do backend. Há teste Bun pelo proxy real e verificação do cadastro/recuperação no Chrome com banco isolado. Evidências e política atual de fechamento em `docs/revisao-ihc.md`.
