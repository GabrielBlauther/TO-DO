# Guia de estilo sucinto — Planejador Acadêmico

Versão aplicada em 21/11/2026. Este guia consolida padrões do aplicativo existente, não redesenha as duas HTAs. Cores/medidas são escolhas do projeto fundamentadas nas aulas, não regras universais nem prova de conformidade integral. Implementação compartilhada em `frontend/src/index.css`, com tokens `--color-*`, `--space-*` e `--font-body`.

## Cores e significado

| Uso | Texto / fundo ou cor principal | Significado |
| --- | --- | --- |
| Conteúdo | `#1a1a2e` / `#ffffff`; página `#f0f2f5` | Leitura e estrutura, sem significado de resultado. |
| Ação primária | branco / `#4338ca` | Próxima ação pertinente: iniciar, pausar, retomar ou confirmar. |
| Ação secundária | `#444444` / `#f0f2f5` | Voltar, minimizar e alternativas agrupadas. |
| Informação | fundo `#f4f2ff`; texto escuro | Revisão/sugestão informativa; não anuncia sucesso. |
| Sucesso | texto/ícone `#065f46` / fundo `#ecfdf5`; borda `#047857` | Operação ou ciclo efetivamente concluído, com título e confirmação visual. |
| Atenção/interrupção | `#78350f` / `#fffbeb`; borda `#b45309` | Rever uma escolha, aviso de prazo ou ciclo encerrado antes do fim; não é sucesso. |
| Erro/destruição | `#991b1b` / `#fff1f2`; ação destrutiva `#b91c1c` | Falha explicada ou exclusão identificada, com recuperação/cancelamento. |
| Foco de teclado | `#363795` | Contorno de 3 px com afastamento de 3 px; não confundir com erro ou seleção. |

Texto e ícones comunicam o significado mesmo sem cor. Situação do Kanban permanece nomeada; pausa não depende do tom do relógio. Sucesso usa círculo com ✓ e título; interrupção usa círculo com símbolo de pausa e “encerrado antes do fim”. Os SVGs decorativos têm `aria-hidden`, pois o título comunica o resultado.

### Contraste verificado

Razões de luminância relativa dos pares sólidos; texto real do resultado e cores computadas foram consultados no Chrome. Meta adotada: pelo menos 4,5:1 nos textos verificados e 3:1 nos elementos gráficos medidos.

| Par | Razão |
| --- | --- |
| Branco / ação primária | 7,90:1 |
| Texto/ícone de sucesso / fundo de sucesso | **7,29:1** |
| Borda de sucesso / fundo de sucesso | **5,21:1** |
| Texto de interrupção / fundo de atenção | **8,75:1** |
| Borda âmbar / fundo de atenção | **4,84:1** |
| Texto de erro / fundo de erro | 7,56:1 |
| Texto secundário / fundo secundário | 8,68:1 |
| Ajuda `#4b5563` / branco | 7,56:1 |
| Contorno de foco / branco | 9,83:1 |

Essas medidas não auditam toda a interface, imagens, transparências, gradientes, estados desabilitados ou tecnologias assistivas. Não declarar conformidade completa a partir da tabela.

## Tipografia, hierarquia e espaçamento

- Família do sistema (`-apple-system`, Segoe UI, Roboto e alternativas), herdada também por botões e campos. Corpo 16 px com entrelinha 1,5. Rótulos/ajuda de aproximadamente 13,6 px e botões 14,4 px; sem substituir rótulos por placeholders.
- Título da aplicação 24 px; título do modal aproximadamente 20,8 px; seções 16 px em peso 600/700. Resultado: título, uma mensagem curta e próximos passos, nessa ordem. O resumo de preparação continua informativo.
- Relógio usa algarismos tabulares: 56 px no diálogo, 24 px no painel desktop e aproximadamente 21,6 px no móvel. Segundos não são região de anúncio contínuo.
- Escala de base: 4, 8, 12, 16, 24 e 32 px, disponível nos tokens. Modal: 32 px de preenchimento no desktop/16 px no móvel; painel: 12/8 px. Preservar ajustes compactos já existentes em controles; a escala não é uma obrigação de encaixar cada medida legada numa grade rígida.
- Agrupar informação relacionada e separar navegação/confirmar num rodapé. Cantos: controles 6–8 px, cartões 12 px e modais 16 px. Não aumentar controles de janela para competir com a tarefa.

## Componentes e interação

| Componente | Padrão aplicado |
| --- | --- |
| Botões | Uma ação primária por estado; verbo indica efeito. Secundárias próximas, menos contrastantes. Desabilitar durante gravação com texto de espera; não oferecer um X habilitado sem ação. |
| Campos | Rótulo persistente, obrigatório/opcional identificado, valores preservados após falha. Campo de disciplina livre, sem exemplos; `autocomplete="off"` é solicitação ao navegador, não garantia sobre seu histórico. |
| Modais | Nome acessível, foco contido e retorno ao controle anterior. Expandir só altera tamanho. X/Escape/fundo mantêm a confirmação solicitada. X da confirmação cancela essa confirmação. No Foco, título/botão dizem **minimizar**, com efeito correto para contagem/pausa/término. |
| Feedback | Informação ≠ sucesso ≠ interrupção ≠ erro. Concluir ciclo não conclui atividade; essa situação aparece uma vez no resultado. Resultado incerto conserva o mesmo pedido para verificar; não afirmar que nada foi salvo. |
| Painel móvel | Tempo e identificação curta; pausa/retomada e restauração visíveis. Posição fica recolhida atrás de Foco · mover. Recolher reduz a uma faixa compacta no canto inferior; espaço de rolagem reservado permite acessar o conteúdo sem reposicionar repetidamente. Expandir recupera a posição anterior, limitada à tela. |
| Ícones | Traço simples de 16–24 px em expansão, recolhimento e feedback; nomes acessíveis em controles só com símbolo. Emojis legados de prioridade/categoria continuam acompanhados de texto. Não atribuir significado apenas à cor ou ao ícone. |
| Teclado/toque | Foco visível; ordem acompanha a apresentação; setas/seletor alternam com arraste. Controles principais do painel móvel têm 44 px de altura; recolhimento 40 px. Essas medidas são decisões compactas do projeto, não certificação. |
| Movimento | Transições discretas já existentes; respeitar `prefers-reduced-motion`. Sem animação de sucesso obrigatória, piscar ou anúncio a cada segundo. |

## Fontes utilizadas e escolhas próprias

Páginas físicas dos PDFs locais, a partir de 1; [índice das referências](referencias/INDICE.md). Materiais permanecem fora do Git.

| Aula | Consulta e aplicação |
| --- | --- |
| Guias de Estilo, pp. 1–2 | Componentes do guia, cores, tipografia, espaçamento, ícones e conteúdo. Exemplos de botões azuis/grade de 8 px são exemplos; escolhemos roxo e escala de base de 4 px para preservar o produto. |
| Cores, pp. 36–38 | Cor como reforço, contraste. Texto das pp. 36–37 e tabela visual da p. 38 consultados. Não copiar as cores dos exemplos como obrigação. |
| Layout de Tela, pp. 33–34 | Tamanho, contraste, agrupamento e hierarquia. Texto da p. 33 e exemplo visual da p. 34 consultados. |
| Navegação, pp. 8, 10 e 20 | Hierarquia de ações, peso visual e escolhas pertinentes. Não interpretar o exemplo como número universal de botões. |
| Tipografia, pp. 20–21 e 29 | Reconhecimento de caracteres, contexto de leitura e entrelinha. Fonte sem serifa do sistema é opção do projeto, não superioridade universal. |
| Princípios e Diretrizes, pp. 20–21, 34, 38, 41 e 43 | Retorno sem perda, consistência, reconhecimento, concisão e recuperação de erros. |

Páginas de texto foram consultadas nos materiais originais; inspeção visual nova delimitada a Cores p. 38 e Layout p. 34. Não foram revistas todas as imagens de todas as aulas. [Verificações técnicas, diagnóstico do cadastro e avaliação humana pendente](ajustes-pre-hospedagem.md).
