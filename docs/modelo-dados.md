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

Sem calendário visual, timer, sugestão, troca automática de atividade ou contas. Esta etapa não define sessões reais de foco. Testes de migração e API usam bancos temporários e cópia consistente isolada da base antiga; o banco original não é usado para gravações de teste.
