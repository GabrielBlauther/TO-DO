# Modelo mínimo de planejamento acadêmico

Decisão desta etapa, anterior à alteração do banco. Esquema legado inspecionado em modo somente leitura: `tasks`, `comments`, `priorities` e `categories`, com prazo em `tasks.due_date`. Categorias continuam independentes de disciplinas.

## Entidades e migração

- **Disciplina (`subjects`)**: identificador e nome obrigatório único, sem conversão automática de categorias.
- **Atividade (`tasks`)**: mantém todos os campos legados e recebe `subject_id` opcional. Prazo continua sendo `due_date`, opcional. Atividades antigas ficam com disciplina nula.
- **Sessão (`study_sessions`)**: identificador, `task_id` obrigatório, `planned_date` obrigatória, `start_time` opcional e `duration_minutes` obrigatória, em minutos inteiros positivos. Uma atividade pode ter várias sessões; a duração não está vinculada ao Pomodoro.
- Migração aditiva em transação: criar disciplinas, verificar `PRAGMA table_info(tasks)` antes de adicionar a coluna, criar sessões e índices com `IF NOT EXISTS`. Reiniciar não duplica estruturas nem dados.
- Dados de exemplo só são inseridos ao criar uma base sem a tabela de tarefas, evitando recriar exemplos quando o usuário remove todas as atividades. Não apagar, recriar ou converter dados existentes.
- Chaves estrangeiras ativas para novas gravações: disciplina deve existir; sessão deve pertencer a uma atividade existente. Excluir sessão preserva atividade; excluir atividade remove suas sessões e comentários em cascata. A migração não limpa registros antigos.

## Datas, filtros e conflitos

Datas civis são strings `AAAA-MM-DD`, validadas pelo calendário, sem converter a data exibida para UTC. Horários locais opcionais usam `HH:mm`, sem fuso ou conversão automática. O planejamento é local, não um compromisso sincronizado entre fusos.

Filtros usam a data planejada de qualquer sessão, nunca o prazo. Consulta por existência evita repetir uma atividade com várias sessões correspondentes; cartões exibem todas as suas sessões com rótulos próprios. Todas inclui tudo; Sem planejamento exige ausência de sessões. Hoje e mês usam o calendário local do navegador. Semestre significa 01/01–30/06 ou 01/07–31/12 do ano atual, convenção do protótipo e não calendário oficial da UCS. Personalizado inclui ambos os limites, valida datas e rejeita início posterior ao fim. Contadores usam o mesmo conjunto exibido.

Sessões sem horário não bloqueiam horários e podem coexistir. Sessões com horário ocupam intervalos semiabertos `[início, fim)`; há conflito global entre atividades somente quando `início A < fim B` e `início B < fim A`. A própria sessão é excluída ao editar. Durações podem atravessar a meia-noite; comparar datas e horários civis em uma escala numérica uniforme, sem efeitos de horário de verão. Intervalos consecutivos são permitidos. Conflitos são rejeitados antes de gravar.

Estudo em data posterior ao prazo exige aviso e confirmação explícita, inclusive se a edição do prazo deixar sessões existentes após ele. O servidor exige confirmação, não apenas a interface. Reagendar altera somente a sessão. Cancelar não envia gravações; falha mantém os valores digitados. A confirmação perde validade quando a escolha é alterada.

## Limites

O modelo inicial não define timer, sugestão, troca automática de atividade, contas ou sessões reais de foco. O calendário visual acrescentado depois é apenas uma projeção das sessões existentes, sem nova tabela, cópia de atividade, migração ou endpoint. Regras de navegação em [calendario-estudos.md](calendario-estudos.md). Testes de migração e API usam bancos temporários e cópia consistente isolada da base antiga; o banco original não é usado para gravações de teste.

## Decisão anterior à implementação do modo Foco

- Planejamento continua em `study_sessions`; execução do ciclo fica separada, no navegador. Ciclo de estudo ajustável entre 1 e 180 minutos inteiros (padrão 25); pausa curta fixa de 5 minutos. Vários ciclos reutilizam o mesmo estudo sem inserir novas sessões.
- Mesma atividade da origem: reutilizar a sessão, sem mudar seu planejamento. Outra atividade: manter a origem sem criar planejamento novo; ou substituir seu intervalo por uma sessão da atividade atual e reagendar a origem; ou substituir seu intervalo removendo somente aquela sessão da atividade anterior. Outras sessões, atividades e prazos permanecem intactos.
- Sem origem: incluir uma sessão para a atividade atual, com data, horário opcional e duração de planejamento revisáveis no resumo. Duração de planejamento e duração do ciclo são independentes.
- Reagendar atualiza a sessão original mantendo seu identificador e duração. A nova sessão da atividade atual usa o intervalo original. Validar ambas as gravações e conflitos globais na mesma transação; qualquer falha reverte tudo. Exigir confirmação para novas datas após o prazo. Uma origem editada ou removida desde a revisão exige revisar novamente.
- Migração aditiva: `focus_confirmations` registra chave única, pedido e resultado da confirmação. A mesma chave/pedido retorna o resultado anterior, sem repetir gravações; chave com pedido diferente é rejeitada. O registro e a reorganização são atômicos. A tabela é um recibo de confirmação, não histórico de produtividade nem estado do timer.
- Antes do envio, persistir a confirmação pendente no navegador. Erro de rede pode ter ocorrido após o commit: manter o mesmo pedido/chave e oferecer verificar/tentar novamente. Não permitir substituir um pedido de resultado incerto por outro silenciosamente. Erros de validação/rollback permitem corrigir as escolhas.
- Um estado de timer por origem do navegador, compartilhado entre abas por `localStorage`; confirmação inicial serializada com Web Locks. Pausa guarda tempo restante; execução guarda instante final. Recarregar calcula o restante pelo relógio, recupera pausas e mostra término quando o instante final passou, sem iniciar outro ciclo ou concluir a atividade. Limitações de armazenamento/fuso/relógio e múltiplos dispositivos serão documentadas.
- Minimizar/Escape preserva o timer. Encerrar ciclo não conclui atividade. Retornar ao planejamento encerra o estudo local sem desfazer mudanças confirmadas. Conclusão da atividade exige gravação explícita bem-sucedida na API.

## Correção de recuperação de gravações na revisão de IHC

Esquema existente inspecionado antes da alteração: a única tabela acrescentada é `mutation_receipts`, com `request_key` primária, `request_json`, `response_json` e `response_status`. Criação aditiva com `IF NOT EXISTS`, na inicialização já transacional. Nenhuma atividade, comentário, disciplina, categoria, prioridade, prazo ou sessão é convertida/removida por essa migração.

Toda mutação comum passa por transação; com cabeçalho `X-Request-Key`, grava efeito e resposta de sucesso juntos. Repetir método/caminho/corpo com a mesma chave devolve a resposta anterior; outros dados com a mesma chave geram conflito. Exclusões também recebem recibo, de modo que a repetição não dependa de o objeto ainda existir. Falhar ao inserir recibo reverte a gravação inteira. O Foco mantém seu recibo próprio, sem duplicar protocolos.

O cabeçalho de capacidade `X-Write-Recovery: 1`, consultado por GET `/api/categories` com `cache: no-store` antes de enviar gravações da interface, evita presumir que um backend antigo em execução implemente os recibos. A tentativa inicial via OPTIONS foi corrigida: o middleware CORS do Vite responde antes do proxy. Não há novo endpoint, tabela ou alteração de CORS para esta correção. Os pedidos comuns sem confirmação ficam em `sessionStorage` da aba, incluindo chave e conteúdo exato para recuperação após fechar formulário ou recarregar. Não é histórico acadêmico nem sincronização entre dispositivos. Limpar/fechar a aba pode perder a recuperação; recibos no servidor não são apagados automaticamente. Respostas antigas não representam uma consulta atualizada se outro processo mudou o mesmo registro; o aviso principal recarrega os dados depois da verificação.
