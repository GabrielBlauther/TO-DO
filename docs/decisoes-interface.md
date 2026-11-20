# Interface e fundamentação inicial

## Correção da sobrecarga de ações no Foco

A captura e o relato do responsável mostraram que a revisão anterior ainda deixava opções espalhadas e repetidas. O diagnóstico F01–F03 e as verificações estão em [revisao-ihc.md](revisao-ihc.md#nova-revisão-solicitada--excesso-de-ações-no-foco). A direção atual mantém etapas, mas concentra Voltar/Sair/ação principal num único rodapé centralizado. Guardar/descartar só aparecem na confirmação de saída. Atualização da lista fica em ajuda na escolha; minimizar somente no cabeçalho. O resumo apresenta fatos identificados uma vez. Ao terminar o ciclo, escolher Próximo passo revela apenas os campos dessa escolha e um botão informa o resultado que será confirmado.

Fundamentação: Navegação pp. 8–20 distingue importância de ações; Princípios pp. 20–21, 34–43 trata controle, consistência, conteúdo pertinente e recuperação. Centralização e até três ações são decisões deste diálogo, não exigências universais das aulas. O exemplo de alinhamento à esquerda da aula foi considerado; optamos por um grupo central compacto em resposta ao pedido, com ordem visual e de teclado igual. Em tela estreita o grupo empilha os controles na mesma ordem. O custo de escolher um próximo passo antes de confirmar foi aceito para reduzir botões simultâneos; seu benefício para as personas hipotéticas ainda precisa de avaliação humana.

**Estado atual:** a revisão de 15/11/2026 substituiu a direção A pela organização da alternativa B em etapas internas, sem mudar de contexto da tela principal. A comparação abaixo preserva o histórico das hipóteses; os benefícios não foram comprovados com participantes. Decisões atuais e evidências em [revisao-ihc.md](revisao-ihc.md).

## Alternativas exploradas no chat
Ambas usam o mesmo cenário fictício: havia Cálculo em uma sessão; o aluno escolhe Programação e pode reagendar Cálculo. Datas do exemplo não são dados reais do usuário.

### A — Janela única com escolhas simultâneas (direção inicial)
Tela principal → botão Foco → janela com sugestão e motivo, seleção de atividade, campos condicionais de reorganização, resumo e ação de início → timer → resultado/retorno.

Campos de reagendamento aparecem apenas se houver troca e o aluno optar por reagendar. O resumo mostra as consequências antes de confirmar. Seleção, revisão e início permanecem no mesmo contexto.

### B — Etapas guiadas (adotada após inspeção técnica)
Tela principal → escolher atividade → ajustar planejamento quando necessário → revisar e iniciar → timer → resultado/retorno. Botão Voltar permite revisar escolhas anteriores.

### Comparação e justificativa provisória
Janela única facilita revisar escolhas simultaneamente e reduz avanços; pode acumular informações quando vários campos aparecem. Etapas guiadas reduzem informações simultâneas e podem ajudar iniciantes, mas exigem mais transições e retorno para comparar escolhas. A escolha inicial foi janela única com divulgação progressiva, considerando a rapidez esperada por Lucas e mantendo rótulos claros para Marina e Renata. A inspeção posterior motivou etapas com retorno preservado. Não há comprovação empírica de superioridade.

Os esboços interativos foram apresentados no chat. Este documento registra os fluxos, mas NÃO substitui as imagens/wireframes exigidos para a entrega. Produzir e preservar os dois estudos visuais antes do relatório final.

## Decisões a implementar e verificar
| Decisão | Necessidade/persona | Fundamentação e material |
| --- | --- | --- |
| Tela principal com filtro e retorno claro | Lucas: rapidez; Renata: orientação | Navegação.pdf: navegação plana e redução da carga de memória |
| Sugestão com motivo e opção de troca | Marina: apoio para decidir; Lucas: autonomia | Princípios e Diretrizes: controle do usuário; visibilidade e reconhecimento |
| Resumo antes de confirmar reorganização | Renata: corrigir escolhas com confiança | Prevenção de erros e controle; Navegação.pdf: rótulos e feedback |
| Botões Iniciar foco, Reagendar estudo e Cancelar | Marina: compreensão sem treinamento | Navegação.pdf: ação explícita e hierarquia de botões |
| Tempo numérico e animação discreta | Todos: perceber progresso sem distração | Guias de Estilo.pdf: movimento com propósito; Fatores Humanos |
| Status indicado por texto além da cor | Diferentes capacidades perceptuais | Cores, IHC e Qualidade: legibilidade e acessibilidade |

## Guia de estilo a completar com o protótipo
- Completar paleta e identidade global; os pares de controles/feedback já medidos estão na revisão abaixo. Não presumir a paleta de outros projetos do usuário.
- Fonte, tamanhos, pesos e hierarquia consistentes.
- Botões primários/secundários e estados: normal, hover, foco, pressionado, processando e erro.
- Campos com rótulos persistentes; erro associado ao campo; não usar só placeholder.
- Ícones consistentes com rótulos quando a função não for evidente.
- Espaçamentos coerentes e layout adaptável.
- Janela acessível: nome, foco inicial, contenção de foco, retorno ao botão de origem, teclado e cancelamento previsível.
- Evitar descartar edição por clique acidental fora da janela.
- Não depender somente de cor, som ou animação. Respeitar preferência de movimento reduzido.
- Timer não deve anunciar cada segundo a leitores de tela; anunciar mudanças relevantes de estado.
- Mensagens claras e sem jargão técnico; erros com orientação para recuperação.

Consultar fontes originais para fundamentar o relatório. Recomendações didáticas não são prova de conformidade com uma norma; verificar versões e critérios oficiais se declarar conformidade.

## Estado na primeira etapa acadêmica
O Kanban foi preservado, com um único seletor de período, rótulos distintos de prazo e planejamento, cadastro simples de disciplina e gerenciamento manual de várias sessões nos detalhes. Avisos após o prazo exigem confirmação explícita; conflitos impedem a gravação e permitem corrigir ou cancelar. Formulários mantêm valores quando a gravação falha.

Os modais alterados passaram a usar diálogo nativo com nome acessível, contenção de Tab/Shift+Tab, Escape para cancelar, retorno de foco e sem descarte por clique no fundo. Foram acrescentados rótulos persistentes e foco visível. Houve verificação funcional no Chrome, teclado e viewport de 390 px, além de inspeção de capturas; isso não certifica conformidade normativa, contraste completo ou uso com leitor de tela. O guia acima e as decisões específicas de Foco continuam pendentes.

## Calendário integrado
- Um seletor Quadro/Calendário preserva a tela principal e o período escolhido, mantendo contexto e consistência (Navegação e Princípios e Diretrizes). Mês visualizado e intervalo filtrado têm rótulos distintos para explicitar o estado.
- Sessões são projeções da mesma atividade; contadores continuam contando atividades únicas. Dias sem planejamento não recebem datas inventadas: essas atividades têm uma lista com ação explícita de planejar.
- O dia atual usa texto Hoje e contorno; a seleção usa texto Selecionado, contorno tracejado e `aria-pressed`. Reconhecimento e feedback não dependem apenas de cor (Cores, Layout e IHC e Qualidade).
- Até três eventos por célula, com Ver mais para a lista completa; abaixo de 700 px, lista de dias do mês. Isso procura limitar a carga visual para as personas hipotéticas, sem afirmar superioridade empírica.
- Os formulários, avisos e cancelamentos são os mesmos do quadro. Após a revisão, consultar uma sessão abre a atividade com o estudo destacado e focado em consulta; Editar é explícito. Selecionar um dia preenche a data de uma nova sessão, sem gravar até confirmar. O foco volta ao controle de origem ou ao seletor de visualização se o evento removido deixou de existir.

Decisões técnicas e testes efetivamente realizados estão em [calendario-estudos.md](calendario-estudos.md). Não houve nova avaliação com participantes nem certificação de acessibilidade.

## Foco em janela única implementado

Registro da primeira implementação. A revisão posterior abaixo altera a apresentação das escolhas e os rótulos, mantendo as regras de planejamento, sugestão e persistência.
- Direção A materializada: sugestão/motivo, atividade identificada, origem explícita, opções de destino, campos condicionais e resumo no mesmo diálogo. O início exige confirmação; não há um assistente obrigatório de várias telas.
- Controle e prevenção de erros: opção sem alterar o planejamento não insere outra sessão; reagendamento preserva prazos e demais sessões; remoção identifica somente o agendamento substituído. Confirmação atômica e repetível protege contra falhas parciais e resposta perdida.
- Sugestão de horário explicada como encaixe entre registros, sem supor disponibilidade pessoal. Lista do dia ajuda a revisar a escolha; conflito e aviso de prazo usam a validação existente.
- Timer com números e progresso discreto, sem movimento decorativo. Mudanças de fase/situação são anunciadas; segundos não têm região viva. Minimizar/Escape preserva execução e o retorno de foco segue o componente de diálogo existente.
- Término de ciclo não conclui atividade nem inicia outra fase. A conclusão tem botão distinto e depende de resposta bem-sucedida da API. Recuperação e limites por origem do navegador são descritos em [modo-foco.md](modo-foco.md).

Houve verificação técnica no Chrome, teclado e tela estreita. Não houve comparação empírica das alternativas, teste com participantes ou certificação de acessibilidade; o guia de estilo e a avaliação acadêmica permanecem pendentes.

## Decisões da revisão de IHC

| Decisão atual | Relação com as personas hipotéticas | Fonte original e motivo |
| --- | --- | --- |
| Escolher → ajustar somente quando pertinente → revisar; Voltar mantém valores | Marina/Renata: orientação e correção; Lucas: reutilizar estudo pula ajuste | Princípios pp. 16, 20 e 43; Fatores Humanos pp. 15–17. Menos telas não garante simplicidade; o diagnóstico mostrou escolhas acumuladas e perda ao retornar. Não é prova de superioridade da alternativa. |
| Nomear estudo por atividade, disciplina, data, horário e duração; explicar prazo e ciclo | Marina: reconhecer sem aprender “origem” ou memorizar identificadores | Princípios pp. 34–35 e 38–39; Navegação pp. 52–58. Identificadores permanecem internos. |
| Resultado incerto bloqueia alteração do pedido, permite verificar e sair para o aviso principal | Renata: recuperar sem refazer; Lucas: evitar duplicação | Princípios pp. 26 e 40–43. O teste perdeu uma resposta após commit e duplicou atividade antes da correção. Não fingir que Cancelar desfaz algo já enviado. |
| Consultar evento não abre edição; cadastro auxiliar retorna ao rascunho | Marina/Renata: reconhecer estado e manter trabalho | Navegação pp. 73–80; Princípios pp. 20–21. Separar consulta/alteração e preservar retorno. |
| Exclusão identificada com uma confirmação; comentário com cancelamento antes de gravar; retomar ciclo encerrado por engano | Renata: correção; Lucas: evitar confirmações repetitivas | Princípios pp. 19–20; Navegação pp. 21–27. Fricção proporcional; não exigir digitar título nem acrescentar confirmação a salvar/minimizar. Exclusão permanente não promete desfazer. |
| Erro focável, data legível e campos preservados; contagem só após consulta confirmada | Todos: perceber o estado e como continuar | Princípios pp. 34–43; Layout pp. 101–103. Foco e texto complementam cor. |

Contrastes dos controles corrigidos foram calculados por luminância relativa: branco/primário `#4338ca` **7,90:1** (antes 3,66); branco/excluir `#b91c1c` **6,47:1** (antes 3,76); branco/concluir `#047857` **5,48:1** (antes 2,54). Secundário `#444` sobre `#f0f2f5`: **8,68:1**; ajuda `#4b5563`/branco e erro `#991b1b`/`#fff1f2`: **7,56:1**. Hover dos botões não reduz mais opacidade; usa sublinhado. Foco tem contorno de 3 px e deslocamento de 3 px; mensagens também usam texto. Medidas dos pares sólidos indicados, não auditoria de todos os estados/componentes nem declaração de conformidade WCAG. Fonte didática: Cores pp. 36–38.

Essas decisões formam uma parte concreta do guia; wireframes das duas alternativas, avaliação humana e guia completo continuam pendentes. Capturas da aplicação são evidências da implementação, não substitutos dos estudos de baixa fidelidade.

## Saída dos diálogos — preferência solicitada em 20/11/2026

Todos os seis tipos de diálogo passam a exibir X no canto superior direito. X, clique realmente fora dos limites e Escape abrem a mesma confirmação, com Continuar aqui como opção inicial e Sair do diálogo como ação explícita. A confirmação ocupa o próprio diálogo; não abre uma sequência recursiva de modais. Campos ficam montados e preservados até confirmar. Cancelar a saída restaura foco; no diálogo auxiliar, sair fecha somente aquele cadastro, mantendo a atividade ao fundo. Cliques no preenchimento interno ou arrastar de dentro para fora não solicitam saída.

O texto informa o efeito: rascunhos de formulário podem ser descartados; planejamento já salvo permanece; no Foco, sair apenas minimiza e preserva o estado do timer. Ele conta se estiver em execução e permanece pausado se estiver pausado. Durante gravação, X está desabilitado e clique fora/Escape aguardam o resultado. Pedido de resultado incerto pode ser fechado e verificado depois, sem dizer que foi cancelado. Saída já confirmada não pede uma segunda confirmação de descarte.

Essa política responde à expectativa expressa por Gabriel, não a uma regra universal das aulas. Princípios pp. 19–20 e 40–43 apoiam controle e prevenção/recuperação; Navegação pp. 21–27 discute fricção proporcional. O custo é acrescentar um passo até em consultas sem edição, assumido por preferência explícita. Não houve avaliação com participantes para comparar esse custo/benefício. Botões funcionais existentes (como Minimizar Foco e Cancelar sessão) conservam seus efeitos específicos.

## Integração dos controles de janela

Escopo confirmado pelo responsável: expandir/restaurar em todos, minimizar somente o Foco. Expandir ocupa a área disponível da página; Restaurar tamanho volta à apresentação normal. Nenhuma dessas ações salva ou descarta escolhas e a confirmação de saída permanece montada. O Foco controla seu tamanho fora do diálogo para recuperá-lo ao reabrir após minimizar; nos demais formulários o tamanho é local à janela aberta. Não há persistência dessa preferência após recarregar nem nova estrutura de dados.

Minimizar e fechar a janela do Foco preservam a execução; fechar por X/clique fora/Escape conserva a confirmação explícita solicitada, enquanto Minimizar é direto como já era no conteúdo. Encerrar estudo continua uma ação separada. O aviso junto ao botão Foco e o texto da confirmação diferenciam contagem em andamento, pausa e término, sem anunciar segundos a cada atualização. No cabeçalho, controles têm nomes acessíveis, indicação do estado expandido e foco visível; minimizar é desabilitado durante confirmação de fechamento/gravação para não contornar a decisão em curso. Expandir continua disponível porque altera apenas a apresentação.

Fundamentação: Princípios pp. 20–21, 34–39, controle, consistência, visibilidade e feedback. A escolha de quais janelas podem minimizar foi explicitamente confirmada no chat; não é uma exigência universal das aulas. Verificações técnicas e limites em [revisao-ihc.md](revisao-ihc.md#rodada-seguinte--integração-dos-controles-de-janela).

Ajuste visual solicitado após essa rodada: controles do cabeçalho reduzidos de 44 para 32 px no desktop, ícone de expansão de 16 px e X menor, com fundo/borda discretos. Em tela estreita ou ponteiro de toque, área de interação de 40 px. Mantidos foco visível, nomes acessíveis, confirmação de saída e todos os efeitos dos controles; as medidas são escolhas deste componente, não uma declaração de conformidade normativa.

## Movimentação no quadro

Arraste nativo de cards permite todas as transições entre A fazer, Em progresso e Concluída. Um contorno tracejado, fundo destacado e instrução textual identificam o destino. A alternativa Mover para… abre botões nativos com os dois destinos possíveis, por teclado/toque, sem exigir gesto de arraste ou criar outro modal. Escolher destino já expressa a ação; não acrescentamos confirmação de salvamento. Escape fecha a escolha ou cancela um arraste antes de soltar. Interações em Editar/Excluir/Mover/título não iniciam o arraste do card.

A mesma função atende gesto e botões. O cartão muda provisoriamente com feedback de salvamento; sucesso é anunciado após resposta da API. Rejeição restaura somente a situação, preservando atualizações de outros campos, e foca o erro. Resposta incerta restaura provisoriamente e mantém a verificação do mesmo pedido antes de permitir nova movimentação daquele cartão. O aviso identifica atividade e destino pretendido. Isso aplica controle, consistência e recuperação (Princípios pp. 20–21, 34–43), sem confundir retorno visual com garantia de ausência de gravação no servidor.

Relação esperada com personas hipotéticas: gesto direto para Lucas, opções nomeadas para Marina e recuperação/retorno para Renata. Esses benefícios não foram avaliados com participantes. O recurso é uma evolução solicitada do quadro; não acrescenta arraste ao calendário nem altera as duas HTAs centrais de estudo/Foco.
