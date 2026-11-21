# Acessibilidade e ampliação — 21/11/2026

## Base, fonte e persona

Branch `fix/acessibilidade-ampliacao`, criada de `origin/main` `1f5911e`, após confirmar o PR #15 contendo `4318f36`. Árvore inicial limpa; nenhum merge automático, descarte, nova funcionalidade ou uso do banco pessoal. Ajustes anteriores e guia preservados.

A fonte **Acessibilidade em Interação Humano Computador.pdf** está disponível no [índice](referencias/INDICE.md). Texto das dez páginas consultado integralmente; páginas 4, 5 e 10 também inspecionadas visualmente. Consulta especialmente pertinente: contraste (p. 3), ampliação/refluxo/foco não encoberto (p. 4), campos/mensagens/teclado (p. 5), semântica e avaliação (pp. 7–9) e relações de controles/painéis (p. 10). PDF e extração permanecem locais/ignorados. A aula é fundamentação; não estamos declarando conformidade legal/normativa ou certificação WCAG.

Rafael Costa, 29 anos, universitário com baixa visão que usa ampliação, é uma **persona hipotética fornecida pelo responsável**. Barreiras: textos pequenos, baixo contraste e perda de informação ao ampliar. Necessidades: legibilidade, contraste adequado, ampliação, foco visível e controles identificados. Não há entrevista, observação de Rafael real ou teste com participante com deficiência.

## Método de zoom real

Chrome **157.0.8103.80** no Windows, headless, perfil persistente exclusivo de teste. Janela mantida em **1440×1000**; densidade base 1. Zoom alterado pelo seletor nativo `chrome://settings/appearance` e conferido por `chrome.settingsPrivate.getDefaultZoom`, sem CSS zoom, pinch ou `setViewportSize`/emulação de viewport. O perfil pessoal não foi aberto.

| Zoom nativo | Janela externa | Área CSS medida | devicePixelRatio | visualViewport.scale / CSS zoom |
| --- | --- | --- | --- | --- |
| 100% | 1440×1000 | 1424×905 | 1 | 1 / 1 |
| 200% | 1440×1000 | 712×452 | 2 | 1 / 1 |
| 400% | 1440×1000 | 356×226 | 4 | 1 / 1 |

Os valores são os observados nesta configuração; não confundir área CSS resultante com redução manual da janela. Servidor de teste em `5176` → proxy real → backend `3005`, base `.cache/acessibilidade-ui/test.db`, identificada nas respostas antes de preparar dados fictícios. O banco pessoal e seu armazenamento de navegador foram preservados.

## Diagnóstico anterior às correções

| Barreira | Reprodução / evidência inicial | Fonte / consequência para Rafael | Critério de aceitação |
| --- | --- | --- | --- |
| Rodapé encobre duração no Foco a 400% | Foco → reutilizar estudo → revisão → Tab: `focus-minutes` recebe foco, mas `elementFromPoint` encontra o rodapé sobre ele | p. 4: foco não pode ficar escondido; Rafael precisa enxergar o campo em que está | Cabeçalho/rodapé deixam de ocupar área fixa em janela CSS baixa; campos e ações acessíveis por rolagem/teclado, sem cobertura |
| Formulário de atividade não mantém campo inteiro visível a 400% | Tab em descrição: borda inferior além da área visível; captura/checagem de foco indicam recorte | pp. 4–5: zoom sem perda, campo/rótulo reconhecíveis | Ao focar, campo cabe ou tem rolagem útil; cabeçalho não encobre conteúdo; botões alcançáveis |
| Verificação de bordas e textos pequenos | Código contém bordas de campo `#e0e0e0` sobre branco e textos auxiliares reduzidos | pp. 3–4: contraste de controles e legibilidade | Medir os pares efetivos; reforçar limites dos campos e textos de leitura sem redefinir as HTAs |

Na checagem inicial de 200%, alguns limites coincidiram com a borda do diálogo por fração de pixel; isso não foi classificado como perda material sem inspeção. Calendário não apresentou rolagem horizontal global nessa inspeção inicial. Testes de viewport estreita anteriores não são apresentados como teste de zoom.

As verificações finais, correções e limitações serão registradas após percorrer as duas HTAs. Não acrescentaremos menu de acessibilidade para substituir correções dos componentes.
