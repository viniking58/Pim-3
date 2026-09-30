# Reel da Logo

Vídeo vertical (1080 × 1920, 9:16, 30 s) que aplica a logo em 16 situações diferentes, no estilo dos reels de identidade visual: a logo fica no centro e o mundo muda a cada batida.

Tudo é gerado em JavaScript, sem imagens nem bibliotecas externas:

- **Imagem:** Canvas 2D, com texturas procedurais (papel, tecido, jeans, aço escovado, tijolos) e um mini motor 3D para celular, cartões, outdoor e a logo extrudada do final.
- **Som:** trilha sintetizada com Web Audio a 120 BPM. Cada corte cai numa batida.
- **Logo:** vetorizada a partir da arte original (cores e raios dos cantos medidos na imagem). Os arquivos `assets/logo.svg` e `assets/logo-transparente.svg` são um bônus.

## Como ver

Abra o `index.html` no navegador (funciona direto do disco, sem servidor). Os controles:

- **Reproduzir / Pausar** (ou barra de espaço) e **Som** ligado/desligado.
- Linha do tempo arrastável; as setas ← → andam uma batida.
- Lista de cenas para pular direto para cada aplicação.
- **Gravar vídeo:** grava os 30 s em tempo real e baixa um `.mp4` ou `.webm` (depende do navegador).

## Como gerar o MP4 em alta qualidade

O `render.mjs` abre a página num Chromium invisível, renderiza os 900 quadros um a um (sem perder nenhum) e junta tudo com a trilha num MP4 H.264 + AAC, pronto para o Instagram.

```bash
cd logo-video
npm install
npx playwright install chromium
npm run render          # gera out/reel-da-logo.mp4
npm run render:60fps    # versão a 60 fps
```

O ffmpeg vem do pacote `ffmpeg-static`. Se ele não instalar, use um ffmpeg do sistema no PATH ou aponte a variável `FFMPEG` para o executável.

## Como personalizar

Quase tudo fica em `js/config.js`:

| O quê | Onde |
| --- | --- |
| Nome, @ e frase final | `BRAND.name`, `BRAND.handle`, `BRAND.tagline` (use `''` para esconder a frase) |
| Cores | `BRAND.colors` (fundo, "r" e ponto) |
| Formato e ritmo | `VIDEO` (tamanho, fps, BPM; os cortes seguem o BPM) |
| Formato da logo | `LOGO` (vértices do "r" com o raio de cada canto, e o ponto) |

A ordem e a duração das cenas ficam em `js/timeline.js` (em batidas). Para trocar a logo por outra, substitua a geometria em `LOGO` (qualquer polígono com cantos arredondados funciona) ou adapte `LogoShape` em `js/core.js` para usar um `Path2D` a partir de um caminho SVG.

## Roteiro (30 s)

| Tempo | Cena |
| --- | --- |
| 0–4 s | Construção: grade, haste, barra, gancho, corte a 45° e o ponto que cai |
| 4–8 s | 8 materiais, um por batida: papel com baixo-relevo, lacre de cera, bordado, neon, carimbo, placa de metal, pin esmaltado, adesivo |
| 8–20 s | Ícone do app, cartões de visita, camiseta, outdoor, embalagem, redes sociais (2 s cada) |
| 20–24 s | Padrão e versões de cor |
| 24–26 s | Recap acelerado |
| 26–30 s | Assinatura: a logo em 3D pousa plana e o ponto pisca como um cursor |

## Estrutura

```
logo-video/
├── index.html         player (abre direto no navegador)
├── render.mjs         exporta o MP4 quadro a quadro
├── js/
│   ├── config.js      textos, cores, ritmo e geometria da logo
│   ├── core.js        matemática, logo, efeitos, 3D e texturas
│   ├── scenes-a.js    construção e materiais
│   ├── scenes-b.js    celular, cartões, camiseta, outdoor, embalagem, perfil
│   ├── scenes-c.js    padrão, cores, recap e final 3D
│   ├── timeline.js    ordem das cenas, interface e montagem do quadro
│   ├── audio.js       trilha sonora (Web Audio)
│   ├── player.js      reprodução, gravação e API do render
│   └── fonts.js       fontes embutidas (Unbounded e Martian Mono)
├── assets/            logo em SVG e licença das fontes
└── out/               vídeo renderizado
```

As fontes Unbounded e Martian Mono são distribuídas sob a SIL Open Font License 1.1 (veja `assets/fonts/OFL.txt`).
