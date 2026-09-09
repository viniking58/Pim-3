# P1 Motorsports — site premium

Site institucional de alta performance para a **P1 Motorsports**, concessionária
autorizada BRP (Sea-Doo, Can-Am e Sea-Doo Switch) em São José dos Campos — SP.

Construído com **Vite + React + TypeScript**, animações com **Motion**
(Framer Motion), scroll suave com **Lenis** e um **configurador 3D em WebGL**
(three.js / react-three-fiber). Sem dependência de imagens externas: todos os
veículos são modelos e ilustrações autorais.

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
| Configurador | Palco WebGL: plataforma giratória, rodas girando, rastros no piso e troca de material/luz ao vivo |
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

## Configurador 3D

A seção `#configurador` é o equivalente ao configurador da Porsche: um palco
WebGL com **modelos 3D de verdade**, iluminação de estúdio e personalização ao
vivo.

- **Arraste para girar 360°** (OrbitControls). O zoom por scroll fica
  desligado de propósito, para a roda do mouse continuar rolando a página.
- **Quatro modelos**: Sea-Doo RXP-X, Can-Am Maverick R, Can-Am Defender
  (carroceria utilitária, com caçamba e teto rígido) e Can-Am Outlander.
- **Sete pinturas × três acabamentos** — brilhante (verniz espelhado), fosco
  (acetinado) e metálico (com flocos) — trocando `roughness`, `metalness` e
  `clearcoat` do material físico em tempo real.
- **Cor de rodas e detalhes**, aplicada a aros, cubos, painéis de porta e ao
  grafismo do flanco do casco.
- **Quatro ambientes** — catálogo (ciclorama branco, o enquadramento das fotos
  de fábrica), estúdio, pôr do sol e noite — trocando luz-chave, preenchimento,
  contraluz, névoa, piso, sombra de contato e exposição.
- **Modo "em movimento"**: rodas girando, carroceria flutuando, rastros no
  piso e espuma de esteira atrás do jet ski.

### Colocando os modelos reais do fabricante

A geometria escrita à mão tem um teto: ela chega a um 3D estilizado
convincente, **não a uma foto de catálogo**. Quando você tiver o material
oficial, existem dois caminhos — os dois já suportados:

**1. Modelo 3D real (.glb) — gira em 360° e continua configurável**

```bash
# coloque o arquivo em public/models/
public/models/rxp-x.glb
```

```ts
// src/data/configurator.ts
{
  id: 'jetski',
  name: 'Sea-Doo RXP-X',
  asset: '/models/rxp-x.glb',
  slots: {
    paintSlots:  ['deck', 'body'],   // materiais que recebem a pintura
    accentSlots: ['seat', 'rim'],    // materiais que recebem o destaque
    wheelSlots:  ['wheel'],          // nós que giram no modo "em movimento"
  },
}
```

Só isso. [`GltfVehicle`](src/three/GltfVehicle.tsx) centraliza o modelo, apoia
no piso, reescala para o palco e aplica as cores do configurador nos materiais
cujo nome casa com os `slots` — preservando as texturas do arquivo. O eixo de
rotação de cada roda é deduzido pela menor dimensão da sua caixa envolvente.
Sem `asset`, o modelo procedural continua valendo como reserva.

**2. Fotos oficiais em 360° — é assim que a Porsche faz**

O configurador da Porsche não é 3D em tempo real: são sequências de imagens
pré-renderizadas, uma por ângulo e por combinação de cor. Se você tiver acesso
ao portal de mídia da BRP (a maioria dos concessionários autorizados tem), esse
é o caminho que dá fidelidade fotográfica de verdade. Vale trocar o palco WebGL
por um visualizador de sequência de imagens nos modelos que tiverem esse
material.

### Por que os modelos são autorais

Não há fotos nem renders da BRP no repositório: as imagens de produto
Sea-Doo/Can-Am são material licenciado, e o domínio da marca está bloqueado
pelo proxy deste ambiente. Em vez disso, a geometria é **construída em código**
— o que também deixa cada peça animável e recolorível de forma independente.

- [`src/three/geometry.ts`](src/three/geometry.ts) — *lofting*: a malha nasce
  ligando seções transversais ao longo do eixo do veículo, a mesma técnica de
  projeto naval. O sentido de percurso de cada contorno é normalizado
  automaticamente, senão as normais apontam para dentro e a peça renderiza
  vazada.
- `hullSection` gera o casco (convés plano, quina viva e fundo em V);
  `boxSection` gera painéis, chassis e capôs (superelipse).
- O jet ski é montado como um veículo de verdade: **casco escuro + convés
  colorido + selim no tom de destaque**, com a divisão de cor caindo na linha
  do costado. É essa arquitetura de peças — e não o formato geral — que faz a
  silhueta ler como um Sea-Doo.
- [`Wheel3D`](src/three/Wheel3D.tsx) monta o pneu como tubo aberto, com anéis
  de flanco, tacos em duas fileiras alternadas, aro, raios e cubo.
- [`Stage3D`](src/three/Stage3D.tsx) monta a iluminação: luz-chave, rebatedor
  de chão (sem ele o flanco inferior fecha em preto e a cor escolhida some) e
  *softboxes* geradas em memória — nenhum HDRI é baixado da rede.

### Custo

O bundle 3D (~250 kB gzip) é **carregado sob demanda**, só quando o visitante
se aproxima da seção — a página inicial continua em ~110 kB gzip. O loop de
render **congela** quando a seção sai da tela.

## Acessibilidade

- `prefers-reduced-motion` é respeitado em todo o site: a vitrine horizontal
  vira uma lista vertical estática, rodas e respingos param, as revelações
  viram fade simples e o configurador abre com a plataforma parada.
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
├── graphics/        SVG: Vehicle.tsx (6 tipos), Wheel.tsx, VehicleDefs.tsx
├── three/           3D: geometry.ts, JetSki3D, Utv3D, Atv3D, Wheel3D,
│                        Stage3D, VehicleScene, materials.ts
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
