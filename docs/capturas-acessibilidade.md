# Capturas de ampliação real — 21/11/2026

Chrome 157.0.8103.80, Windows, headless; janela externa 1440×1000. Zoom **nativo do navegador**, alterado em Aparência: 200% → área CSS 712×452, DPR 2; 400% → 356×226, DPR 4. CSS zoom e visualViewport.scale permaneceram 1. Imagens brutas do viewport via Chrome DevTools, 1424×905 pixels físicos, sem reduzir a página inteira ou editar imagens para simular zoom.

Dados fictícios e perfil/banco isolados. Cada captura mostra uma posição de rolagem: a 400% o diálogo inteiro não cabe de uma vez. Conteúdo fora do enquadramento continua disponível por rolagem e Tab. Capturas representativas foram inspecionadas junto com os percursos, incluindo revisão, ajuste, conflito, confirmação, calendário e painel; são evidência técnica, não resultados de usabilidade ou conformidade integral. [Método, diagnóstico, verificações e limites](acessibilidade-ampliacao.md).

| Estado / o que revisar | Zoom 200% | Zoom 400% |
| --- | --- | --- |
| Formulário de atividade: campos e rolagem | [Imagem](imagens/acessibilidade-zoom/200-atividade.png) | [Imagem](imagens/acessibilidade-zoom/400-atividade.png) |
| HTA 1: duração com foco visível e sem rodapé sobreposto | [Imagem](imagens/acessibilidade-zoom/200-hta1-revisao.png) | [Imagem](imagens/acessibilidade-zoom/400-hta1-revisao.png) |
| Timer em execução: mesmo fluxo e controles | [Imagem](imagens/acessibilidade-zoom/200-timer.png) | [Imagem](imagens/acessibilidade-zoom/400-timer.png) |
| Confirmação de minimizar: consequência e ações alcançáveis rolando | [Imagem](imagens/acessibilidade-zoom/200-confirmacao.png) | [Imagem](imagens/acessibilidade-zoom/400-confirmacao.png) |
| Painel antes de recolher: tempo, identidade curta e controles | [Imagem](imagens/acessibilidade-zoom/200-painel.png) | [Imagem](imagens/acessibilidade-zoom/400-painel.png) |
| Foco no quadro revelado: painel recolhido automaticamente sem roubar foco | [Imagem](imagens/acessibilidade-zoom/200-painel-foco-visivel.png) | [Imagem](imagens/acessibilidade-zoom/400-painel-foco-visivel.png) |
| Ciclo concluído: título e ícone; restantes abaixo por rolagem | [Imagem](imagens/acessibilidade-zoom/200-ciclo-concluido.png) | [Imagem](imagens/acessibilidade-zoom/400-ciclo-concluido.png) |
| HTA 2: ajuste de reagendamento e consulta de estudos | [Imagem](imagens/acessibilidade-zoom/200-hta2-ajustar.png) | [Imagem](imagens/acessibilidade-zoom/400-hta2-ajustar.png) |
| HTA 2: conflito explicativo, campos mantidos e retorno disponível | [Imagem](imagens/acessibilidade-zoom/200-hta2-conflito.png) | [Imagem](imagens/acessibilidade-zoom/400-hta2-conflito.png) |
| Calendário: agenda com nomes completos, estudos e dia atual | [Imagem](imagens/acessibilidade-zoom/200-calendario.png) | [Imagem](imagens/acessibilidade-zoom/400-calendario.png) |

Para revisão humana: numa janela semelhante, use o zoom do navegador em 200%/400%, percorra Foco → escolher/revisar/iniciar → minimizar/restaurar e Foco → outra atividade → reagendar → corrigir conflito. Use Tab/Shift+Tab e rolagem; confira se consegue ler e localizar o próximo passo. Abra Quadro/Calendário mantendo o filtro, e consulte/edite um estudo sem confirmar alterações indesejadas. Não use este roteiro para apagar dados pessoais.
