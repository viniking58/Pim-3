# P1 Motorsports — site premium

Site institucional de alta performance para a **P1 Motorsports**, concessionária
autorizada BRP (Sea-Doo, Can-Am e Sea-Doo Switch) em São José dos Campos — SP.

Construído com **Vite + React + TypeScript**, animações com **Motion**
(Framer Motion) e scroll suave com **Lenis**. Sem dependência de imagens
externas: todos os veículos são ilustrações vetoriais autorais e animadas.

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + bundle de produção em dist/
npm run preview    # serve o bundle gerado
```

## Cores da marca

**Todas as cores vivem em um único arquivo: [`src/styles/tokens.css`](src/styles/tokens.css).**
Nenhum componente usa cor literal — todos consomem os tokens. Para aplicar a
paleta oficial da marca, basta trocar os valores de `--brand-*` no topo do
arquivo e o site inteiro acompanha.

```css
--brand-red:    #ff2d18;  /* acento principal da P1        */
--brand-seadoo: #00a3e0;  /* linha náutica  (Sea-Doo)      */
--brand-canam:  #ffd100;  /* linha off-road (Can-Am)       */
--brand-switch: #37d6a4;  /* linha pontoon  (Switch)       */
```

> Nota: o domínio `p1motorsports.com.br` está bloqueado pelo proxy de rede
> deste ambiente, então os hexadecimais exatos do site atual não puderam ser
> extraídos. A paleta acima é preto carbono + vermelho de corrida para a
> identidade P1, com os acentos das famílias BRP por categoria de produto.
> Se os valores oficiais forem outros, troque as quatro linhas acima.

## Efeitos de movimento

| Onde | Efeito |
| --- | --- |
| Abertura | Preloader com traçado do logo, contador e cortina em 5 painéis |
| Global | Scroll suave com inércia (Lenis), cursor magnético com rótulo contextual, barra de progresso de leitura, grão de filme animado |
| Topo | Navbar que se esconde ao descer e reaparece ao subir; menu full-screen com `clip-path` e links em cascata |
| Hero | Paralaxe em 4 camadas, título linha a linha sob máscara, riscos de velocidade, anel pulsante, CTAs magnéticos |
| Faixas | Marquee infinito cuja velocidade e direção reagem à velocidade do scroll |
| Vitrine | Cards com inclinação 3D real, reflexo que segue o ponteiro, veículo deslocado no eixo Z e contador de potência |
| Filtros | Pílula ativa com `layoutId` (transição compartilhada) + entrada/saída dos cards com `AnimatePresence` |
| Experiência | Seção fixada com rolagem horizontal controlada pelo scroll vertical, com mola e barra de progresso |
| Manifesto | Texto que acende palavra a palavra conforme a seção cruza a viewport; wordmark em paralaxe |
| Números | Contadores que disparam ao entrar em tela |
| Formulário | Rótulos flutuantes e sublinhado que cresce no foco |

### Os produtos em movimento

Cada veículo é um SVG autoral montado em camadas
([`src/graphics/`](src/graphics)), para que as partes animem de forma
independente:

- **rodas girando de verdade** — banda de rodagem, aro e raios rotacionam juntos;
- **suspensão e carroceria** flutuando em ciclo próprio;
- **esteira, ondas e respingos** nas linhas náuticas (Sea-Doo e Switch);
- **rastros de velocidade** nas linhas terrestres (Can-Am);
- variantes de carroceria: UTV esportivo (Maverick) × utilitário com caçamba
  e teto reto (Defender).

## Acessibilidade

- `prefers-reduced-motion` é respeitado em todo o site: a vitrine horizontal
  vira uma lista vertical estática, rodas e respingos param, e as revelações
  viram fade simples.
- Navegação por teclado com `skip link`, `:focus-visible` visível e o cursor
  customizado desativado em dispositivos de toque.
- Ilustrações com `role="img"` e rótulo; textos animados expõem o conteúdo
  íntegro via `aria-label`.

## Estrutura

```
src/
├── components/
│   ├── motion/      Reveal, SplitText, ScrollWords, Marquee, MagneticButton
│   ├── sections/    Nav, Hero, Fleet, Showcase, Manifesto, Services, …
│   ├── Preloader.tsx  Cursor.tsx  ScrollProgress.tsx
├── graphics/        Vehicle.tsx (5 tipos), Wheel.tsx, VehicleDefs.tsx
├── hooks/           useSmoothScroll, useTilt, useMagnetic, useCountUp
├── data/site.ts     produtos, serviços, números e contato
└── styles/          tokens.css (paleta), base.css, app.css
```

## Conteúdo

Endereço, horário, e-mails e o posicionamento como primeira concessionária BRP
do Vale do Paraíba são dados públicos da loja. Os números de potência são
especificações públicas das linhas BRP. **Não há preços inventados no site** —
os CTAs levam a "consultar condições", já que valores variam por lote e
precisam vir da loja. Os depoimentos são exemplos de conteúdo e devem ser
substituídos por depoimentos reais antes de publicar.
