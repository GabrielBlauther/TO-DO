# Revisão de interação — diagnóstico e correções

## Método, versão e fontes

Inspeção técnica individual em 15/11/2026, iniciada sobre `9952103` (PR #6 do Foco integrado à main; código anterior `ff9b289`). Branch `fix/revisao-ihc`, criada da main atualizada por fast-forward, com árvore limpa. Não houve avaliação com participantes; consequências para as personas são inferências de projeto, não dificuldades medidas em alunos reais. Prioridades locais: P0 = risco de integridade/resultado incerto; P1 = controle, conclusão ou compreensão da tarefa; P2 = orientação e apresentação. Não equivalem a uma avaliação de severidade por vários avaliadores.

Foram consultados AGENTS, projeto, HTAs, decisões, roadmap, modelo, validação do planejamento, calendário, Foco e índice. Os 16 pares PDF/texto do índice estão presentes; nenhum material indexado está ausente. As extrações originais foram percorridas integralmente, por página, suprimindo somente linhas repetidas de cabeçalho/navegação. Isso **não significa inspeção visual integral dos PDFs**.

| Fonte original local | Consulta textual | Consulta visual nesta revisão / limites |
| --- | --- | --- |
| Trabalho-III | 3 páginas, integral | PDF pp. 1–3 integral: entregas, pesos e exemplo de HTA |
| Princípios e Diretrizes para o Design de IHC | 44 páginas, integral | PDF pp. 19–20 e 41–43: cancelamento, preservação e recuperação |
| Navegação | 80 páginas, integral | PDF pp. 25–27, 30–31 e 52: fricção proporcional, botões desabilitados e campos |
| Cores | 62 páginas, integral | PDF pp. 34 e 38: comunicação redundante e contraste |
| Imagens, Animações e ícones | 79 páginas, integral | PDF p. 75: ícones sem rótulos; demais imagens não inspecionadas integralmente |
| Design de IHC e UX Centrados no Usuário | 84 páginas, integral | Extração; exemplos visuais não examinados nesta revisão |
| Fatores Humanos | 44 páginas, integral | Extração; diagramas/imagens não examinados nesta revisão |
| IHC e Qualidade | 38 páginas, integral | Extração; imagens não examinadas nesta revisão |
| Introdução a IHC | 50 páginas, integral | Extração; imagens não examinadas nesta revisão |
| Elementos de Design | 24 páginas, integral | Extração; imagens não examinadas nesta revisão |
| Layout de Tela | 105 páginas, integral | Extração; muitos exemplos são visuais e não foram examinados integralmente |
| Tipografia | 69 páginas, integral | Extração; exemplos tipográficos visuais não examinados integralmente |
| Guias de Estilo | 4 páginas, integral | Extração |
| Avaliação em IHC | 28 páginas, integral | Extração |
| Avaliação em IHC II | 22 páginas, integral | Extração |
| Avaliação em IHC — teste de usabilidade | 11 páginas, integral | Extração |

Páginas são as páginas físicas do PDF, contadas a partir de 1. Os PDFs e textos permanecem locais/ignorados; os links do [índice](referencias/INDICE.md) dependem dessas cópias. Vídeos, links externos, animações e detalhes de figuras fora das páginas acima não foram inspecionados; não fundamentamos decisões em seu conteúdo presumido. Não foi feita auditoria normativa de acessibilidade.

O enunciado (pp. 1–2) exige duas tarefas intermediárias completas, transições/erros/feedback, duas alternativas visuais, guia e justificativas; não impõe janela única, Pomodoro, backend nem um número de participantes. Personas/HTAs são hipóteses/aplicações próprias. O código é evidência do comportamento atual, não especificação correta.

## Registro anterior às correções

Chrome headless real com Playwright, fuso America/Sao_Paulo, relógio controlado em 15/11/2026, desktop 1366×900 e 390×844. Backend 3004 com SQLite em `.cache/revisao-ui`; frontend 5176, requisições encaminhadas somente ao backend isolado. Banco pessoal não utilizado. Capturas locais `antes-foco.png`, `antes-detalhes-mobile.png` e `antes-erro-mobile.png` inspecionadas. Código também inspecionado para os caminhos auxiliares. Evidências abaixo distinguem reprodução no navegador de observação estática.

### R01 — Repetição insegura após resultado incerto · P0
- Fluxo/reprodução: Nova atividade → preencher título → servidor grava, mas interceptar/perder a resposta → Criar atividade novamente.
- Observado no navegador: formulário preserva título; erro diz apenas que não conectou à API e sugere repetir. A segunda tentativa criou **duas atividades** com o mesmo título. A mesma ausência de recibo existe no código de comentário e criação de sessão.
- Consequência inferida: aluno não sabe se salvou e pode duplicar trabalho ao seguir a orientação.
- Fonte: Princípios, pp. 26 e 40–43 (proteger trabalho, erros precisos e recuperação).
- Correção: recibo transacional para mutações comuns, chave da tentativa mantida e pedido bloqueado até verificar resultado incerto; mensagem não presume ausência de gravação nem causa de conexão.
- Aceitação: perder resposta após commit e repetir mantém um único registro; recusar reutilização da chave com outro conteúdo; campos intactos; erro conhecido permite corrigir.

### R02 — Saída do Foco perde escolhas · P1
- Fluxo/reprodução: Foco → ciclo de 40 min → Escape → abrir Foco.
- Observado no navegador: ciclo volta a 25; cancelamento apaga rascunho; erro de conflito anterior reaparece fora do diálogo, no cabeçalho.
- Consequência inferida: Renata precisa refazer escolhas e pode interpretar erro antigo como falha atual.
- Fonte: Princípios, pp. 17–21 e 43; Navegação, pp. 73–80.
- Correção: distinguir guardar/retornar, cancelar preparação e minimizar execução; preservar escolhas em retorno; erro contextual ao fluxo.
- Aceitação: Escape/retorno recupera escolhas; descarte explícito não grava; erro não vaza ao cabeçalho após cancelar.

### R03 — Termos internos e decisões simultâneas no Foco · P1
- Fluxo/reprodução: Foco com duas sessões de hoje → selecionar outra atividade → reagendar.
- Observado no navegador/código: campo obrigatório “Sessão de origem”, opções com identificadores internos, duração planejada e ciclo próximos, múltiplos blocos e revisão no mesmo formulário longo. Não houve dificuldade medida em participantes.
- Consequência hipotética: Marina pode não reconhecer qual estudo substitui; Renata pode perder o contexto ao rolar.
- Fonte: Fatores Humanos, pp. 9, 15 e 17; Princípios, pp. 16, 34–35 e 38–39; Navegação, pp. 52–58.
- Correção: escolha → ajuste pertinente → revisão, com Voltar preservando dados; termos “estudo planejado”, atividade/disciplina/data/horário; explicar ciclo versus planejamento e as consequências de cada alternativa.
- Aceitação: sem origem exposta; identificadores não são necessários para escolher; somente campos relevantes na etapa; revisão e retorno sem gravação; mesmos três destinos preservados.

### R04 — Falha de comentários parece lista vazia · P1
- Fluxo/reprodução: bloquear GET de comentários → abrir detalhes.
- Observado no navegador: “Comentários (0)” apesar de falha na consulta. O erro é compartilhado com gravações e pode ser apagado por outra ação no código.
- Consequência inferida: aluno pode concluir que perdeu comentários ou enviar de novo.
- Fonte: Princípios, pp. 34–37 e 41–43; IHC e Qualidade, pp. 12–20.
- Correção: carregando, consulta incompleta, lista vazia confirmada e falha distintos; ação Recarregar comentários e erro junto à seção.
- Aceitação: falha de leitura nunca anuncia zero confirmado; repetir leitura recupera lista; comentar não esconde falha prévia de consulta.

### R05 — Cadastro de disciplina exige abandonar atividade · P1
- Fluxo/reprodução: Nova atividade → preencher → disciplina não cadastrada.
- Observado no código/interface: instrução manda usar botão da tela principal; fechar desmonta formulário. Não há caminho de ida/volta preservando os valores.
- Consequência inferida: esforço duplicado e risco de perder descrição/prazo.
- Fonte: Princípios, pp. 20 e 43; Navegação, pp. 73–80.
- Correção: reutilizar cadastro de disciplina a partir do formulário, retornando com a nova disciplina selecionada e campos preservados; proteção ao sair de edição preenchida.
- Aceitação: abrir, cancelar ou concluir cadastro auxiliar mantém título/descrição/prazo; Escape de edição não descarta silenciosamente.

### R06 — Erros distantes e sem foco de recuperação · P1
- Fluxo/reprodução: detalhes em 390 px → adicionar sessão às 10:30 sobre estudo das 10h → salvar.
- Observado no navegador: mensagem usa AAAA-MM-DD, aparece depois do formulário, foco acaba no body após desabilitar/habilitar envio. Captura mostra mensagem cortada na borda inferior. Campos foram preservados.
- Consequência inferida: erro pode passar despercebido; retorno por teclado fica desorientado.
- Fonte: Princípios, pp. 38–43; Layout, pp. 101–103; Navegação, pp. 52–58.
- Correção: mensagem focável e visível, nome da operação, data legível, orientação de correção; manter valores e retorno a controle pertinente ao cancelar/salvar.
- Aceitação: erro visível e recebe foco, teclado continua no diálogo, data em dd/mm/aaaa, corrigir para intervalo consecutivo permite salvar.

### R07 — Encerrar ciclo, fechar e retornar pouco diferenciados · P1
- Fluxo/reprodução: iniciar Foco → encerrar ciclo → observar próximo passo.
- Observado no código: “Retornar ao planejamento” limpa execução local; próximo ciclo e duração são exibidos junto à conclusão e pausa. A explicação existe, mas distante e agrupa ações com efeitos diferentes.
- Consequência hipotética: aluno pode encerrar o estudo quando só pretendia consultar o quadro; concluir ciclo pode ser confundido com concluir atividade.
- Fonte: Princípios, pp. 20–21 e 38–39; Navegação, pp. 8–20 e 38–43.
- Correção: “Minimizar” sempre disponível com execução preservada; “Encerrar estudo e voltar” explícito; conclusão da atividade separada; duração do próximo ciclo somente ao escolher continuar.
- Aceitação: minimizar/voltar de consulta preserva timer; fim do ciclo não conclui atividade nem inicia pausa; encerrar explica que planejamento confirmado permanece.

### R08 — Ações destrutivas sem objeto/recuperação suficiente · P1
- Fluxo/reprodução: excluir atividade pelo quadro; excluir comentário nos detalhes.
- Observado no código: confirmação genérica não repete título da atividade; comentário é excluído imediatamente. Sessões já têm confirmação contextual.
- Consequência hipotética: clique errado pode eliminar informação sem oportunidade de corrigir.
- Fonte: Princípios, pp. 19–20 e 40–43; Navegação, pp. 21–27.
- Correção: identificar objeto e alcance na exclusão de atividade; comentário com confirmação localizada/cancelamento antes de gravar. Avaliar recuperação sem exigir digitar título ou duas confirmações.
- Aceitação: cancelar qualquer exclusão preserva banco; comentário só é apagado após confirmação que mostra seu texto; falha permite verificar sem repetir efeitos.

### R09 — Consulta do calendário inicia edição implicitamente · P2
- Fluxo/reprodução: selecionar evento mensal.
- Observado no código: abre imediatamente o formulário em edição, não uma consulta identificada do estudo selecionado.
- Consequência hipotética: aumenta esforço e mistura consultar com alterar.
- Fonte: Princípios, pp. 21 e 34–35; Navegação, pp. 73–80.
- Correção: destacar estudo selecionado em consulta, com Editar/Remover explícitos; retornar ao dia e filtro sem mudanças.
- Aceitação: clicar evento não abre edição nem grava; ação Editar abre o formulário correspondente; voltar conserva mês/período.

### R10 — Hierarquia e orientação em controles auxiliares · P2
- Fluxo/reprodução: detalhes estreitos e formulário de atividade; carga inicial com falha.
- Observado na captura/código: Excluir atividade recebe destaque antes de planejamento; categoria não explica diferença de disciplina; falha inicial pode apresentar quadro vazio como resultado; cores dos botões precisam de medição.
- Consequência hipotética: ação destrutiva compete com estudo; ausência de dados pode ser confundida com consulta bem-sucedida.
- Fonte: Layout, pp. 28–43 e 52–69; Cores, pp. 36–38; Navegação, pp. 8–27.
- Correção: excluir como ação secundária, agrupada; explicar categoria legada e prazo; esconder resultado vazio não confirmado, status de atualização; medir/corrigir contrastes de controles alterados sem redesenho.
- Aceitação: falha inicial não afirma ausência de atividades; hierarquia de ação preserva planejamento; controles principais têm contraste medido e foco visível; sem rolagem horizontal a 390 px.

## Decisões antes da implementação

Revisar a exigência local de janela única: usaremos etapas dentro do diálogo existente quando houver escolhas de planejamento. A instrução atual do responsável autoriza rever esse fluxo. Princípios p. 16 alerta que menos telas não garante facilidade; p. 20 apresenta retorno que preserva dados. Lucas pode pular ajuste desnecessário ao reutilizar o mesmo estudo; Marina/Renata recebem organização e revisão. Benefício esperado, ainda sem comparação com participantes.

A recomendação de evitar botões desabilitados (Navegação pp. 30–33) não é uma proibição universal: durante uma gravação, bloquear reenvio é apropriado com texto de progresso e contexto. Não esconder causas de indisponibilidade. Exemplos de cores/posição/fricção das aulas são contextuais, não regras universais nem certificação WCAG.

Desfazer não será prometido para exclusão permanente de atividade: envolve comentários/sessões e pode conflitar com planejamento posterior. Confirmação única, identificada e cancelável antes da gravação; não exigir reentrada de título. Para edição/status, recuperação por editar/reabrir; para comentário, confirmação localizada. Resultados incertos exigem recibo/reconciliação, não um falso botão Cancelar que desfaça uma requisição já enviada. Essas escolhas podem ser revistas após avaliação humana.

## Evidências posteriores

O diagnóstico foi registrado e enviado em `41d746e`, antes das alterações. Correções: recibos atômicos `366abb0`; formulários/recuperação `3d4f75f`; compatibilidade do servidor `0cd07da`; Foco guiado/retomada `e81817f`; preservação da duração do próximo ciclo ao minimizar `2743f53`. A documentação posterior não altera o registro dos problemas originais.

| Problema | Antes → depois | Evidência e alcance |
| --- | --- | --- |
| R01 | “Não conectou; tente novamente” e duas atividades → estado incerto explícito, mesmo pedido/chave e um único registro | Chrome: perder resposta após commit real em atividade, estudo, comentário, Foco e conclusão; verificar sem duplicar. Fechar formulário, recarregar e recuperar pelo aviso principal também passou. Bun: recibo persistido, exclusão repetida e rollback quando falha a gravação do recibo. |
| R02 | Escape apaga preparação/erro vaza no cabeçalho → guardar e voltar preserva campos/etapa, descarte explícito não grava, erro contextual | Chrome: ciclo de 40 min mantido ao sair/reabrir e ao usar Voltar; cancelar preparação preserva resposta completa da API. A duração ainda não iniciada do próximo ciclo também sobrevive a minimizar/reabrir. |
| R03 | Todas as escolhas juntas, “origem” e números internos → escolher, ajustar somente se pertinente e revisar, com estudos reconhecíveis | Chrome: mesma atividade pula Ajustar; três destinos de troca, novo estudo, ajuste manual e retorno mantendo campos. Atualização após remoção externa do estudo retorna à escolha explícita. A melhoria da compreensão continua hipótese a avaliar com alunos. |
| R04 | Consulta falhou mas mostra zero comentários → carregamento/falha/lista vazia confirmada distintos | Chrome: bloquear GET, nenhum zero confirmado, Recarregar comentários recupera lista. No código, erro da consulta tem estado separado das gravações. |
| R05 | Abandonar atividade para cadastrar disciplina → cadastro auxiliar dentro do formulário e retorno ao rascunho | Chrome: abrir/cancelar/cadastrar disciplina mantém título, descrição e prazo; nova disciplina selecionada; Escape permite Continuar editando ou descartar. |
| R06 | Erro cortado/foco no body/data técnica → erro visível focado com operação, data legível, estado e ação | Chrome 390 px: conflito mantém data/horário/duração, mensagem inteira dentro da viewport e foco no alerta; Tab segue dentro do diálogo; 10:30 conflitante → 11:00 consecutivo salva. |
| R07 | Retornar podia encerrar sem distinção suficiente → minimizar preserva, encerrar ciclo oferece retomada do restante, encerrar estudo libera outra escolha | Chrome: pausar/recarregar/retomar; minimizar, trocar visualização e reabrir mantém instante final; encerramento antecipado retomável; cancelar próximo ciclo não inicia nada; duração inválida conserva estado. Bun: restante recuperado após recarga, fim natural não retomado como ciclo antigo. |
| R08 | Exclusão genérica/comentário apagado imediatamente → título/alcance e confirmação única cancelável, comentário identificado | Chrome: cancelar exclusão de atividade, sessão e comentário preserva registros; confirmar remoção de sessão mantém atividade/prazo; confirmar comentário remove somente ele. API: repetir DELETE com recibo funciona mesmo sem o objeto, sem repetir efeitos. Não houve simulação de resposta perdida na exclusão de atividade pelo navegador; essa parte da recuperação foi verificada na API. |
| R09 | Evento abre edição → consulta com estudo destacado/focado, Editar explícito | Chrome desktop: evento não abre formulário; Editar abre o correspondente; cancelar e voltar mantém mês/filtro. Dia → planejar → cancelar → fechar detalhes retorna ao mesmo dia/atividade escolhida. |
| R10 | Quadro vazio sem consulta confirmada, destruição destacada e contraste insuficiente em botões → contagens “—” antes de confirmar carga, resultados só após consulta, exclusão secundária e contrastes corrigidos | Chrome: falha inicial não mostra quadro vazio nem habilita cadastro sem referências; recarregar recupera uso. Desktop/390 px sem rolagem horizontal; capturas inspecionadas. Contrastes dos pares sólidos calculados em decisões de interface, não certificação de acessibilidade. |

### Capturas próprias

Imagens da aplicação, com **dados fictícios no banco isolado**, preservadas no repositório para revisão. Não contêm páginas dos materiais didáticos e não são alternativas de baixa fidelidade. Foram capturadas em momentos distintos dos roteiros: compare a organização da interação, não os horários/contadores como se fosse um experimento controlado.

- [Antes: Foco com escolhas simultâneas](imagens/revisao-ihc/antes-foco.png) → [depois: escolha com contexto](imagens/revisao-ihc/depois-escolha.png).
- [Depois: revisão em tela estreita com Voltar e confirmação](imagens/revisao-ihc/depois-revisao-mobile.png).
- [Antes: conflito parcialmente cortado](imagens/revisao-ihc/antes-erro-mobile.png) → [depois: operação, estado, recuperação e foco no erro](imagens/revisao-ihc/depois-erro-mobile.png).

### Ambiente e resultados

Windows/PowerShell, Bun 1.4.4; Chrome **157.0.8103.51**, headless controlado por Playwright Python já disponível localmente, America/Sao_Paulo, relógio controlado em 15/11/2026. Desktop 1366×900 e viewport 390×844, preferência de movimento reduzido. Não simulamos esperar 25 minutos reais; avançamos o relógio para testar estados. Backend 3004 com banco em `.cache/revisao-ui`; frontend 5176 com interceptação de **todas** as chamadas `/api/` para esse backend, incluindo a consulta OPTIONS. Os dados fictícios foram removidos/recriados somente nesse banco isolado.

- `bun run test` na raiz: **37 testes, 198 asserções, zero falhas**, incluindo regras anteriores de migração, filtros, datas, calendário e atomicidade do Foco. Quatro testes novos: recibos persistentes e repetição segura; rollback ao falhar recibo; cliente recuperando pedido e recusando servidor incompatível; retomada de ciclo encerrado. O log “falha simulada” é esperado no teste que provoca erro do SQLite.
- `bun run --bun build` em `frontend`: TypeScript e Vite aprovados. `git diff --check` aprovado. Lint não configurado; nenhuma dependência/lockfile alterado.
- Percurso final Chrome: duas HTAs e auxiliares da tabela, Tab/Shift+Tab contidos, Escape/retorno coerentes, campos conservados após falha, ausência de rolagem horizontal em 390 px e zero erros JavaScript de página. Duas abas confirmando o mesmo início resultaram em uma chamada efetiva, uma inclusão e o mesmo timer recuperado. Servidor sem cabeçalho de suporte não recebeu o cadastro; mensagem e título foram preservados.
- Os servidores de teste foram encerrados após o percurso. A aplicação pessoal que já estava aberta não foi interrompida nem reiniciada pelos testes.
- Testes Bun usam memória/diretórios temporários, incluindo criação nova, migração de esquema legado isolado e reinicialização. Testes de API não são testes pela interface; percurso no Chrome é verificação técnica, não prova de usabilidade.

**Preservação:** não executamos gravações de teste, migração ou restauração no banco pessoal. Inicialmente os hashes coincidiam; posteriormente `todo.db` permaneceu igual, mas WAL/SHM mudaram enquanto Gabriel experimentava a aplicação, conforme confirmação no chat. Não é correto alegar igualdade final de todos os hashes. A auditoria foi feita somente em cópias: o WAL continha o prefixo com o hash inicial exato, permitindo guardar uma cópia consistente do estado inicial em `.cache/revisao-ui/auditoria-inicial/todo.db`; uma segunda cópia do estado corrente passou em `integrity_check`. Nada foi restaurado/sobrescrito no original e esses arquivos não entram no Git. As alterações pessoais foram mantidas.

### Recuperação e limites técnicos

Reiniciar o backend atualizado é necessário para criar `mutation_receipts` aditivamente. Antes de enviar cada gravação, a interface agora consulta GET `/api/categories` sem cache e exige `X-Write-Recovery: 1`; a consulta inicial via OPTIONS foi corrigida em 20/11/2026 porque o Vite responde antes de encaminhá-la ao backend (ver complemento abaixo). Um servidor antigo não deve ignorar silenciosamente a chave de repetição. Erro antes desse envio diz que nenhuma **nova** gravação foi enviada, preservando a possibilidade de pedidos anteriores já estarem salvos. Falha após envio/5xx/resposta ilegível é tratada como resultado incerto, sem inventar causa ou garantir ausência de gravação. Requisições têm limite de 15 segundos para não permanecer indefinidamente em envio.

Pedidos comuns pendentes são guardados com conteúdo/chave em `sessionStorage`: sobrevivem a fechar formulário e recarregar **a mesma aba**. Fechar a aba/limpar armazenamento pode perder a chave; não refazer cadastros sem conferir o planejamento. Não há recuperação entre dispositivos. Foco continua com seu pedido pendente/timer em `localStorage` e Web Locks; seus limites anteriores permanecem. Recibos persistem no SQLite, sem limpeza automática nesta revisão. Resposta de recibo é a confirmação original, não uma consulta atual se outro processo mudou o registro; recuperação pelo aviso principal recarrega os dados.

Rascunhos não enviados ficam na página enquanto se retorna/guarda preparação; fechar uma edição preenchida oferece continuar ou descartar. Não prometemos recuperação desses rascunhos após recarregar. Exclusão permanente tem prevenção contextual, sem falso desfazer depois da gravação. Corrupção/interdição do armazenamento não foi exercitada pelo navegador nesta revisão; testes unitários verificam rejeição de registros inválidos, mas não há reparo automático de dados de navegador corrompidos.

### O que depende de avaliação humana

Não houve entrevistas, alunos participantes, comparação empírica entre alternativas ou métricas de sucesso/tempo/satisfação. Ainda avaliar se os termos e as etapas são compreendidos por Marina/Renata/Lucas (personas hipotéticas), se há excesso de instrução e se a sugestão/destino do estudo anterior correspondem ao modelo mental real. Leitor de tela, zoom elevado, outros navegadores, dispositivos físicos e revisão completa de contraste/teclado continuam pendentes. Esses limites impedem afirmar conformidade de acessibilidade ou usabilidade comprovada.

Materiais indexados estão presentes; somente as extrações foram consultadas integralmente. Páginas compostas só por figuras não são compreendidas pela leitura textual; fora da amostra visual declarada, detalhes de imagens/vídeos não fundamentam esta revisão. As duas alternativas visuais de baixa fidelidade, guia completo, relatório e slides ainda precisam ser concluídos conforme o Trabalho III. Capturas e código não substituem essas entregas.

### Roteiro curto para revisão interna

1. Reiniciar a API atualizada conforme README e usar uma base separada para ensaios destrutivos. Criar duas atividades e planejar dois estudos de hoje para uma delas. Prazo da atividade é a entrega; data planejada é quando estudar.
2. Em Nova atividade, preencher título/descrição/prazo, cadastrar disciplina ali e voltar. Cancelar o cadastro auxiliar preserva campos; cancelar atividade preenchida permite continuar ou descartar.
3. Abrir Foco, reconhecer o estudo pelo nome/disciplina/data/horário, escolher outra atividade e Continuar. Experimentar manter, reagendar e remover somente o agendamento escolhido; revisar consequências e outras sessões preservadas.
4. Em reagendar, provocar sobreposição, ler erro e usar Voltar; corrigir para horário consecutivo. Experimentar uma data após o prazo, revisar ou confirmar conscientemente. Guardar e reabrir mantém campos; descartar antes do envio não muda o banco.
5. Iniciar Foco, pausar, minimizar, alternar Quadro/Calendário e voltar. Encerrar ciclo, retomar seu restante, escolher/cancelar próximo ciclo, ou encerrar estudo. Concluir atividade é separado; não acontece em zero.
6. Selecionar evento do calendário: começa em consulta. Editar ou remover explicitamente; cancelar mantém estudo/prazo. Selecionar dia, planejar e voltar ao mesmo dia.
7. Com ferramentas de teste, perder uma resposta **após** o servidor gravar: conferir a mensagem de resultado incerto e Verificar resultado, inclusive pelo aviso principal após fechar/recarregar. Não usar dados pessoais para simular essas falhas. Sem simular rede, usar roteiro documentado como verificação pendente, sem inventar resultado.
8. Repetir com Tab/Shift+Tab/Escape e tela estreita; registrar observações reais e dúvidas de compreensão. Se colegas participarem, documentar método/contexto e distinguir revisão interna de avaliação com usuários-alvo.

## Complemento de 20/11/2026 — cadastro pelo proxy e saída dos modais

O PR #7 da revisão foi confirmado integrado à `origin/main` (`9493cec`) por fetch e ancestralidade antes deste complemento. A branch `fix/cadastro-e-modais` foi criada dessa main atualizada, preservando a árvore e sem merge automático. Ela reúne a correção do erro relatado no cadastro e a preferência de fechamento solicitada durante o trabalho, em commits distintos.

### R11 — Cadastro bloqueado apesar de backend atualizado · P1 · observado

- Reprodução: abrir o frontend servido pelo Vite e cadastrar uma disciplina; a verificação de capacidade dizia que o serviço não suportava recuperação e bloqueava o POST.
- Evidência: OPTIONS direto na API retornava 204 com `X-Write-Recovery: 1`; OPTIONS pelo frontend retornava 204 sem o cabeçalho. O código instalado do Vite 6.4.2 registra o middleware CORS antes do proxy, com término de OPTIONS sem encaminhar por padrão. Não era evidência de backend antigo.
- Consequência: o aluno não conseguia concluir o cadastro e recebia uma orientação de reinício que não corrigia o problema.
- Fundamentação: Princípios pp. 41–43 — erro preciso, ação útil e recuperação. A causa técnica é constatada no código/mensagens HTTP, não atribuída à aula.
- Correção: consultar o cabeçalho numa resposta pequena e somente de leitura, GET `/api/categories` com `cache: no-store`. Mantidas a verificação de compatibilidade e as garantias de repetição. Sem novo endpoint, mudança de CORS ou migração.
- Aceitação/verificação: cadastro pelo proxy real conclui; perder resposta após commit e verificar mantém uma disciplina; backend sem capacidade continua bloqueado antes de gravar. Novo teste Bun passa pelo Vite real e confirma também por que OPTIONS não servia. No Chrome, cadastro e recuperação passaram pela interface/proxy reais, com dados fictícios no banco isolado da porta 3005.
- Limite da evidência anterior: o roteiro de 15/11 interceptava `/api/` e enviava diretamente ao handler de teste. Assim, exercitou formulários e regras, mas **não** a ordem dos middlewares do Vite. A conferência HTTP anterior de GET pelo proxy tampouco comprovava OPTIONS. A nova verificação cobre explicitamente essa integração.

### R12 — X ausente e clique fora sem saída · P2 · solicitação do responsável

- Reprodução/observação anterior: os seis diálogos compartilhavam um componente sem X; clique no fundo não fechava. O usuário relatou esperar ambas as formas de saída e pediu confirmação em cada uma. Não houve avaliação com participantes para inferir frequência ou preferência geral.
- Consequência hipotética: menor descoberta da saída e sensação de pouco controle para quem espera essas convenções.
- Fundamentação: controle/retorno em Princípios pp. 19–20; fricção proporcional em Navegação pp. 21–27. Confirmar até consultas é uma preferência expressa do responsável, não obrigação universal das aulas.
- Correção: X em cabeçalho visível ao rolar; X, clique externo e Escape abrem uma única confirmação dentro do mesmo diálogo. Continuar aqui preserva os campos/foco; Sair do diálogo confirma a saída, sem outra confirmação de rascunho. Escape na confirmação equivale a continuar. Clique no espaço interno e arrastar de dentro para fora não solicitam saída.
- Efeitos explícitos: formulários avisam sobre rascunhos não enviados; dados já salvos permanecem. No Foco, sair apenas minimiza e preserva timer/escolhas. Resultados incertos conservam o pedido para verificar depois. Durante gravação, X fica desabilitado; clique externo e Escape aguardam o resultado, com mensagem de progresso.
- Aceitação/verificação: Chrome desktop 1280×900 e 390×844 percorreu disciplina, atividade, detalhes, confirmação de exclusão, dia do calendário e Foco. Verificados X/fundo, continuar/confirmar, campos preservados, saída única sem duas confirmações, cadastro auxiliar fechando só a si, comentários/sessões não enviados sem gravação e exclusão cancelada sem apagar. Timer manteve seu instante final; rascunho de Foco manteve 40 minutos. Gravação com resposta retida bloqueou saída; resposta perdida permitiu sair e verificar depois sem duplicar. Tab/Shift+Tab contidos, retorno de foco, X visível após rolar e ausência de rolagem horizontal; zero erros JavaScript de página. Capturas [desktop](imagens/revisao-ihc/saida-desktop.png) e [390 px](imagens/revisao-ihc/saida-mobile.png), com dados fictícios, inspecionadas.

Verificações deste complemento: **38 testes Bun / 210 asserções**, build TypeScript + Vite e `git diff --check` aprovados. O teste novo de integração usa API em memória e portas temporárias; Chrome usa `.cache/proxy-ui/test.db`, Vite 5176 e API 3005, sem encaminhar gravações ao banco pessoal. Python 3.11 já instalado foi usado porque o Python do PATH passou a ser o do MSYS e não carregava a extensão local do Playwright. Não foi necessária instalação de dependências. Estas são verificações técnicas, sem participantes, leitor de tela ou certificação de acessibilidade.

## Rodada seguinte — integração dos controles de janela

Preparação: árvore limpa em `042a126`; `fetch` e ancestralidade confirmaram sua integração pelo PR #8, `5628ce4` da `origin/main`. Main atualizada por fast-forward e branch `fix/controles-dos-modais` criada dessa base. Nenhuma correção de cadastro/X/confirmação será refeita; confirmação de saída é preferência explícita mantida.

Diagnóstico anterior à edição: o componente compartilhado tem X e confirmação, mas nenhum modal tem expandir/restaurar. Somente o Foco tem minimizar, por botões no conteúdo. A mensagem “o timer continua como está” não explicita contagem em andamento, pausa e término. Fechar a janela já preserva a execução; não corresponde a encerrar estudo. São observações do código, não dificuldades medidas com participantes.

Decisão de escopo confirmada pelo responsável: **expandir/restaurar em todos; minimizar somente o Foco**. Expandir/restaurar muda apenas a apresentação, preservando campos, etapa e estado de confirmação. O Foco deve recuperar o tamanho escolhido ao reabrir após minimizar. Fechar/X/clique fora/Escape mantém confirmação; minimizar continua uma ação direta e preserva o estudo. Mensagens devem dizer quando estudo/pausa continuará contando, quando permanecerá pausado e quando o ciclo já terminou. Fontes: Princípios pp. 20–21 e 34–39, controle, consistência e visibilidade; a distribuição dos controles é decisão de produto, não regra universal das aulas.

Critérios de aceitação: controles de janela acessíveis por teclado; nenhum minimizar nos demais modais; alternar tamanho não envia dados nem perde rascunhos; confirmação continua única; Foco minimizado preserva instante final ou restante pausado e o tamanho escolhido; fechar não conclui/encerra estudo; mensagem acompanha o estado real, inclusive se o ciclo termina durante a confirmação. Verificar desktop/390 px, cadastro auxiliar, gravação em andamento e resultado incerto em banco isolado.

Auditoria de `.cache`: `git ls-files .cache` e `git ls-tree -r --name-only HEAD .cache` não retornaram arquivos; `git log --all -- .cache` também não apresentou commits. `git check-ignore -v` confirmou os roteiros temporários ignorados pela regra `.cache/` existente. Portanto não há arquivos para retirar do índice; os arquivos locais foram mantidos. Os roteiros de inspeção nessa pasta são temporários, não testes mantidos pelo projeto. Testes mantidos são os arquivos `backend/*.test.ts`, executados por `bun run test`; nenhum depende dos scripts de `.cache`. Não confundir execução local de um roteiro com sua inclusão no Git.
