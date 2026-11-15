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

Preencher após implementar e verificar. Este diagnóstico foi registrado antes das alterações de código.
