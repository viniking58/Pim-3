# Reel Accuracy Automation

Reel vertical (1080 × 1920, 9:16, 15,7 s, 30 fps) da identidade visual da **Accuracy Automation**, no estilo do reel de referência (Newdestin): um corte por batida a 100 BPM e mockups realistas da marca aplicada.

Tudo é gerado em JavaScript, sem fotos nem arquivos de mockup:

- **3D fotorrealista com three.js:** materiais físicos (PBR), iluminação de estúdio e céu, sombras suaves, oclusão de ambiente (GTAO), profundidade de campo, bloom, grão e aberração cromática.
- **Trilha original** sintetizada com Web Audio a 100 BPM, com falhas digitais na abertura, whooshes nas transições e impactos nas cenas principais.
- **Logo vetorizada** da arte enviada, com erro abaixo de 0,2 px em cada borda (veja `src/logo.js`). A sombra cinza é um deslocamento de (−18, +9) px, e o verde é `#2C5149`.

## Roteiro

| # | Plano | Batidas |
| --- | --- | --- |
| 01 | Abertura: símbolo alternando entre cromo líquido e branco chapado | 1,2 |
| 02 | Embalagens de componentes em estúdio branco | 1 |
| 03 | Assinatura no verde da marca | 1 |
| 04 | Grade de construção do símbolo | 1 |
| 05 | Fachada: letreiro 3D sobre telha metálica e céu azul | 1 |
| 06 | Manual da marca com a moldura verde se fechando | 2 |
| 07 | Site no notebook | 1 |
| 08 | Tablet e celular | 1 |
| 09 | Tipografia (Barlow) | 1 |
| 10 | Painel elétrico RAL 7035 com IHM da máquina de papel | 2 |
| 11 | Cartões de visita sobre chapa nervurada | 1 |
| 12 | Papelaria (timbrado, envelope, pasta, crachá) | 1 |
| 13 | Bobinas de papel no galpão de expedição | 1 |
| 14 | Contêiner de 20 pés | 2 |
| 15 | Fardos de celulose | 1 |
| 16 | Placa em acrílico na parede | 1 |
| 17 | Capacete de segurança | 1 |
| 18 | Plaqueta de identificação em inox | 1 |
| 19 | Blocos 3D do símbolo sob sol rasante | 1 |
| 20 | Totem luminoso na entrada da fábrica, ao anoitecer | 2 |
| 21 | Final: assinatura e frase | 2 |

## Como ver

Abra o `index.html` no navegador (funciona direto do disco). Ele usa o `dist/reel.js`, que já vem gerado. Os controles são reprodução com som, linha do tempo, lista de planos e **Gravar vídeo** (grava em tempo real e baixa um MP4 ou WebM).

## Como gerar o MP4

```bash
cd accuracy-reel
npm install
npx playwright install chromium
npm run render          # gera out/accuracy-automation-reel.mp4
```

O `render.mjs` renderiza quadro a quadro num Chromium invisível e junta a trilha com o ffmpeg (do pacote `ffmpeg-static`, de um `ffmpeg` no PATH ou da variável `FFMPEG`). Para usar outro Chromium, defina `CHROMIUM_PATH`.

## Como editar

- Textos, cores e nome da marca: `BRAND` em `src/logo.js`.
- Ordem e duração dos planos (em batidas): `CUTS` em `src/timeline.js`.
- Cada plano fica em `src/shots/`. Artes impressas e telas ficam em `src/lib/art.js` e `src/lib/screens.js`.
- Depois de editar, rode `npm run build` para atualizar o `dist/reel.js` (ou `npm run dev` para recompilar a cada mudança).

As fontes Barlow e Barlow Semi Condensed são distribuídas sob a SIL Open Font License 1.1 (`assets/OFL.txt`). O three.js é MIT.
