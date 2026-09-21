# IMPLACÁVEL — Rebuild v10

Reconstrução front-end independente baseada nas referências visuais e comportamentais fornecidas pelo cliente.

## O que há nesta versão
- Hero editorial preto/dourado com leão em segundo plano, crop limpo e tratamento diferente para dark/light.
- Modo claro/escuro persistente.
- Cursor temático de resposta imediata em dispositivos com pointer fino.
- Navegação por seções, scroll progress e menu mobile.
- 3 módulos interativos no terminal: CORE, LAB e LIVE.
- LIVE registra interações do visitante no site.
- Catálogo amplo e filtrável de tecnologias, ferramentas, cloud, segurança, criatividade, marketing e automação.
- Equipe com baias de retrato preparadas para as quatro fotos.
- Cases, funil, tráfego, prova social, operação, método e contato.
- Chat IMPLACÁVEL AI com respostas locais contextuais e suporte opcional a endpoint de IA externo.

## Estrutura
```text
index.html
assets/
  css/site.css
  js/app.js
  images/
    lion-background-clean.png
    team/*.png
```

## Configuração
Edite o objeto `window.IMPLACAVEL_CONFIG` no final de `index.html` para ligar WhatsApp, redes sociais, endpoint de formulário e endpoint de IA.

## Observação de escopo
O catálogo de tecnologias é amplo e representativo, não uma alegação literal de cobrir toda tecnologia existente no mercado. O conteúdo foi mantido configurável e sem inventar credenciais, APIs privadas ou integrações não observáveis nas referências.


## V11 POLISH
- Hero marquee spacing refined so the ticker never overlaps the CTA buttons.
- Technology catalog reduced to essential technologies and enhanced with illustrative SVG icons.
- Fabiano portrait replaced with the supplied transparent-background character image.
- Team photo stage redesigned for stable portrait containment and clean placeholders.

## V12 UPDATE

- `assets/images/lion-background-final.webp`: new hero lion asset supplied for this revision.
- `assets/images/ai-avatar.svg`: local IMPLACÁVEL AI avatar used by the floating assistant and chat header.
- `assets/icons/`: local brand/technology marks so the stack catalog does not depend on a third-party icon CDN at runtime.
- The technology catalog intentionally excludes the `TODOS` filter button. Clicking the active category again returns to the full catalog.
- Body copy and chat typography were increased for readability without inflating editorial headings.
- Team image slots remain under `assets/images/team/`; existing founder images are preserved.


## STABLE RECOVERY BUILD
This package is based on the last stable v12 build. It adds defensive initialization, safe localStorage handling, language normalization and a non-blocking visual fallback so a browser runtime error cannot leave the page completely blank.
