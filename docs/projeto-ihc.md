# Projeto de IHC — Planejador Acadêmico

## Contexto e objetivo
Trabalho III — Design de Interação e Prototipação de Interface, Ciência da Computação, UCS, 2026/2. Entrega e apresentação previstas no enunciado: 03/12/2026.

Problema inicial: universitários precisam distribuir demandas entre disciplinas, decidir o que estudar e reorganizar o planejamento quando surgem imprevistos. Trata-se de uma hipótese de problema baseada na discussão do projeto, não de um resultado de pesquisa.

Objetivo de alto nível do aluno: manter os estudos em dia e cumprir compromissos acadêmicos de acordo com o tempo disponível.

Plataforma proposta: web, uso principal no computador e adaptação para telas menores. Nome provisório: Planejador Acadêmico.

## Organização do grupo
Gabriel concentra estruturação e desenvolvimento com apoio do Codex. Colegas terão contribuições delimitadas: revisar personas, percorrer os fluxos e apresentar partes preparadas. Revisões realizadas por integrantes são revisões internas, não testes independentes. Não há entrevistas ou avaliações realizadas documentadas até este pacote.

## Escopo confirmado na conversa
- Aproveitar o repositório existente: React, TypeScript, Vite, Bun e SQLite, confirmados por inspeção do código da base. O estado da validação de execução está em `roadmap.md`.
- Atividades por disciplina, prioridade, estado, data planejada e prazo quando aplicável.
- Uma tela principal e filtro de período: hoje, mês, semestre e personalizado. Não criar três telas separadas por período.
- Calendário ligado às atividades.
- Botão Foco que abre uma janela única com sugestão explicada, seleção manual e Pomodoro.
- Possibilidade de trocar a atividade e decidir o destino do estudo anterior.
- Feedback, cancelamento, validações e acessibilidade.
- Fora do escopo inicial: login, integração institucional, IA para sugestões, relatórios avançados e plataforma multiusuário.

## Personas provisórias
São hipóteses a revisar; não atribuir falas ou dados de entrevistas a estas personas.

| Persona | Contexto | Objetivo | Necessidades/dificuldades | Expectativa |
| --- | --- | --- | --- | --- |
| Lucas, 24 | Trabalha e estuda; tempo livre limitado | Cumprir prazos | Decidir rapidamente o que estudar; lidar com imprevistos | Praticidade e poucos passos |
| Marina, 18 | Ingressante aprendendo a organizar a faculdade | Preparar-se com antecedência | Distribuir preparação antes das provas; compreender o planejamento | Linguagem clara e uso sem treinamento |
| Renata, 32 | Retoma a graduação conciliando trabalho e família | Manter continuidade com horários variáveis | Replanejar com facilidade; pouca familiaridade com organizadores | Flexibilidade e correção fácil de escolhas |

## Estrutura simplificada da informação
1. Planejamento: atividades, disciplinas, prioridades, situação, data planejada e prazo.
2. Consulta: filtro temporal e calendário.
3. Foco: atividade selecionada, motivo da sugestão, duração e estado do timer.
4. Replanejamento: sessão original, nova atividade, destino anterior e resumo da alteração.

## Histórias de usuário
| ID | História | Aceitação principal |
| --- | --- | --- |
| HU01 | Como aluno, quero registrar atividades por disciplina para organizar as demandas acadêmicas. | Criar, editar e consultar preservando dados e indicando campos obrigatórios. |
| HU02 | Como aluno, quero separar quando estudar do prazo da atividade para planejar com antecedência. | Reagendar não muda o prazo; campos têm rótulos distintos. |
| HU03 | Como aluno, quero filtrar um período para consultar o planejamento na mesma tela. | Período ativo visível, limites inclusivos e mensagem de ausência de resultados. |
| HU04 | Como aluno, quero uma sugestão explicada para escolher o estudo do momento. | Priorizar planejamento de hoje; sem ele, considerar pendência com prazo próximo; seleção manual sempre disponível. |
| HU05 | Como aluno, quero iniciar e controlar uma sessão de foco para estudar uma atividade. | Iniciar, pausar, retomar, encerrar; término do timer não conclui atividade automaticamente. |
| HU06 | Como aluno, quero trocar a atividade e reorganizar a anterior para lidar com mudanças. | Manter, reagendar ou deixar sem data; revisão antes de confirmar; cancelar preserva planejamento. |
| HU07 | Como aluno, quero entender erros e resultados para saber se minhas ações funcionaram. | Mensagens claras; falha não simula sucesso; escolhas preservadas para correção ou tentativa. |

## Regras de interação
- O filtro considera a data planejada das sessões; o prazo permanece visível. Atividades sem sessões continuam acessíveis por Todas e Sem planejamento.
- Uma sessão ocupa um intervalo, não o dia inteiro. Estudar duas disciplinas no mesmo dia é permitido.
- Se a atividade atual for trocada: manter o planejamento e apenas estudar outra agora; substituir reagendando a anterior; ou substituir deixando a anterior pendente sem data.
- Se não houver sessão original, adicionar a nova sessão sem perguntar por substituição.
- Não apagar atividade anterior. Alterações de planejamento só se efetivam após confirmação; falha deve preservar consistência.
- Reagendamento além do prazo gera aviso e oportunidade de revisar; não altera o prazo silenciosamente.
- Ao terminar um ciclo: oferecer pausa, continuação ou retorno e permitir indicar se a atividade foi concluída.
- Sem atividades, oferecer cadastro antes de iniciar.

## Detalhes técnicos ainda a definir
O modelo mínimo e as regras já adotadas estão em [modelo-dados.md](modelo-dados.md): várias sessões por atividade, duração em minutos independente de Pomodoro, horário opcional, conflitos por sobreposição e semestre civil janeiro–junho/julho–dezembro. Essa convenção não é o calendário oficial da UCS.

Continuam pendentes desempates das sugestões, busca automática de horários livres, sessões reais de foco e comportamento do timer em segundo plano/recarregamento. Essas funcionalidades não foram implementadas nesta primeira etapa; não apresentar hipóteses como decisões antigas. Consulte [a validação da etapa](validacao-planejamento.md) para o estado real.

## Exigências do enunciado
- Cenário, problema, objetivos e pelo menos 3 personas distintas.
- Estrutura de informação, funcionalidades e requisitos em histórias de usuário OU casos de uso; adotamos histórias.
- 2 tarefas críticas de complexidade intermediária, com HTAs e planos.
- Plataforma, contexto e restrições.
- 2 alternativas de baixa fidelidade para pelo menos uma tarefa e justificativa da seleção.
- Protótipo de alta fidelidade cobrindo as duas tarefas, transições, feedback e erros relevantes.
- Guia sucinto de estilo, pelo menos 3 decisões fundamentadas e medidas de acessibilidade.
- Relatório conciso, protótipo/alternativas acessíveis e slides com demonstração.
- Não exige backend nem persistência real; aproveitamos os existentes. Não há quantidade obrigatória de participantes indicada.
- Pesos: problema/usuários 20%; requisitos/tarefas 25%; exploração/justificativas 15%; protótipo/acessibilidade 40%.
