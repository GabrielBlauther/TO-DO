# Interface e fundamentação inicial

## Alternativas exploradas no chat
Ambas usam o mesmo cenário fictício: havia Cálculo em uma sessão; o aluno escolhe Programação e pode reagendar Cálculo. Datas do exemplo não são dados reais do usuário.

### A — Janela única (direção escolhida)
Tela principal → botão Foco → janela com sugestão e motivo, seleção de atividade, campos condicionais de reorganização, resumo e ação de início → timer → resultado/retorno.

Campos de reagendamento aparecem apenas se houver troca e o aluno optar por reagendar. O resumo mostra as consequências antes de confirmar. Seleção, revisão e início permanecem no mesmo contexto.

### B — Etapas guiadas (alternativa para comparação)
Tela principal → escolher atividade → ajustar planejamento quando necessário → revisar e iniciar → timer → resultado/retorno. Botão Voltar permite revisar escolhas anteriores.

### Comparação e justificativa provisória
Janela única facilita revisar escolhas simultaneamente e reduz avanços; pode acumular informações quando vários campos aparecem. Etapas guiadas reduzem informações simultâneas e podem ajudar iniciantes, mas exigem mais transições e retorno para comparar escolhas. A direção escolhida é janela única com divulgação progressiva, considerando a rapidez esperada por Lucas e mantendo rótulos claros para Marina e Renata. Não há comprovação empírica de superioridade.

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
- Paleta e valores de contraste medidos; identidade visual ainda não foi escolhida. Não presumir a paleta de outros projetos do usuário.
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
- Os formulários, avisos e cancelamentos são os mesmos do quadro. Consultar uma sessão abre a atividade com aquela sessão em edição; selecionar um dia preenche a data de uma nova sessão, sem gravar até confirmar. O foco volta ao controle de origem ou ao seletor de visualização se o evento removido deixou de existir.

Decisões técnicas e testes efetivamente realizados estão em [calendario-estudos.md](calendario-estudos.md). Não houve nova avaliação com participantes nem certificação de acessibilidade.
