# ACC Drive Insight: motion reel

Um vídeo de motion design de 24,5 s, todo feito em código (HTML + canvas), no mesmo estilo dos reels "5.5 is ridiculous at motion".

## Arquivos

| Arquivo | O que é |
|---|---|
| `out/acc-drive-insight-16x9.mp4` | O reel em 1920×1080, 60 fps, com trilha |
| `out/acc-drive-insight-9x16.mp4` | Versão vertical (TikTok/Reels): notebook 3D com reflexo na mesa e legenda |
| `out/acc-drive-insight-9x16-sem-legenda.mp4` | A mesma versão vertical, sem legenda, para você escrever a sua no app |
| `reel.html` | O reel "ao vivo" num arquivo só (fontes e música embutidas). Funciona offline |
| `mockup.html` | A cena do notebook 3D (usada para gerar o vídeo vertical) |
| `src/` | Código-fonte: animação, trilha sonora e scripts de render |

## Filmar no seu notebook, como no TikTok

1. Abra `reel.html` no Chrome.
2. Aperte **F** para tela cheia e **clique** (ou **espaço**) para dar play. O som começa junto.
3. Apague a luz, coloque o notebook numa mesa brilhante (vidro ou laminado escuro) e filme com o celular na altura da mesa, meio de lado.

Atalhos: `espaço` play/pausa · `F` tela cheia · `R` reinicia · `M` som · `L` loop · `←/→` volta ou avança 1 s.

## Cenas

01 velocímetro (0→287 km/h) · 02 rastro de luz / 0–100 em 2,9 s · 03 título · 04 circuito com traçado ideal × o seu · 05 telemetria (velocidade, acelerador, freio) · 06 luzes de troca de marcha · 07 bandeira quadriculada · 08 mapa 3D de temperatura dos pneus · 09 tipografia "APEX" · 10 dashboard de desempenho · 11 fluxo aerodinâmico · 12 radar de gaps ao vivo · 13 cards de insights · 14 logo final · 15 fade.

## Editar e gerar de novo

Os textos e as cenas ficam em `src/reel.js` (uma função `draw` por cena). A trilha fica em `src/soundtrack.py`. Ela é sintetizada do zero com numpy, então não tem direitos autorais de terceiros.

```bash
python3 src/soundtrack.py                       # gera src/audio/soundtrack.wav
ffmpeg -y -i src/audio/soundtrack.wav -c:a aac -b:a 160k src/audio/soundtrack.m4a
python3 src/build.py                            # monta reel.html e mockup.html
node src/render.cjs video reel.html out/acc-drive-insight-16x9.mp4 60 src/audio/soundtrack.wav
node src/render.cjs video mockup.html out/acc-drive-insight-9x16.mp4 60 src/audio/soundtrack.wav
node src/render.cjs video mockup.html out/acc-drive-insight-9x16-sem-legenda.mp4 60 src/audio/soundtrack.wav '&caption=0'
```

Para gerar os vídeos você precisa de Node com Playwright (Chromium) e do ffmpeg. Se mudar a duração de alguma cena em `reel.js`, ajuste também `CUTS` em `soundtrack.py` para a música continuar no tempo dos cortes (120 BPM, 0,5 s por batida).

Fontes: Archivo, Instrument Serif e JetBrains Mono, todas sob a licença SIL Open Font License.
