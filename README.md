# P1 Motorsports — site

Site da **P1 Motorsports**, concessionária autorizada BRP (Sea-Doo, Can-Am e
Sea-Doo Switch) em São José dos Campos — SP.

**Vite + React + TypeScript**, rotas com **react-router**, movimento com
**Motion** (Framer Motion), scroll suave com **Lenis** e 3D em **three.js /
react-three-fiber**. Sem imagens externas: os veículos são ilustrações e
modelos autorais.

## Direção visual

Páginas editoriais **claras**, com o 3D vivendo em **palcos escuros de
sangria** — o padrão do site da Porsche. Toda a ousadia é gasta nesse
contraste; o vermelho é cor de ação, não de decoração.

A versão anterior era escura do início ao fim com um único acento vermelho,
que é exatamente o padrão que a skill de design da casa aponta como assinatura
de design gerado por IA — junto de marcadores `01/02/03` decorativos e cards
arredondados repetidos em tudo. Os três foram removidos: a numeração sobrou só
onde existe sequência real (o processo de compra e as etapas do configurador).

**Trio tipográfico**: Archivo (títulos), Instrument Sans (texto) e Martian Mono
(dados e rótulos) — largura técnica que cai bem em ficha de especificação.

## Rotas

```
/                     Home editorial
/modelos              Índice da linha, filtro na URL
/modelos/:slug        Página do modelo: palco 3D + ficha técnica
/montar               Monte o seu, em seis etapas
/servicos             Oficina, peças, revisão
/concessionaria       A loja no Jardim Aquarius
/seminovos            Critério de aceitação dos seminovos
/contato              Contato
```

## Monte o seu

Espelha o "Monte o Seu" oficial da Sea-Doo, cuja própria URL entrega o modelo
de dados (`?platform=…&package=…&unitid=…`): **plataforma → pacote → motor →
cor → acessórios → resumo**.

- **O estado vive na URL.** Uma montagem é um link: recarrega e volta idêntica,
  e pode ser mandada ao consultor.
- **Código curto** derivado da configuração, para o cliente citar no balcão.
- **Acessórios acendem geometria real.** Itens com `visual3d` ligam a peça no
  modelo 3D — retrovisores, para-brisa, barra de LEDs, teto, bagageiro. É o elo
  que faz o configurador parecer vivo em vez de decorativo.
- **Sem preço inventado.** A ferramenta da BRP dá orçamento instantâneo porque a
  fábrica tem a tabela; o resumo aqui lista a montagem completa e envia para a
  loja responder com o valor real. Com a tabela em mãos, é um campo por item.

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + bundle em dist/
npm run preview    # serve o bundle gerado
```

## Cores da marca

**Todas as cores vivem em [`src/styles/tokens.css`](src/styles/tokens.css).**
Nenhum componente usa cor literal. Para aplicar a paleta oficial, troque os
valores de `--brand-*` no topo do arquivo.

> O domínio `p1motorsports.com.br` está bloqueado pelo proxy de rede deste
> ambiente, então os hexadecimais exatos do site atual não puderam ser
> extraídos.

Blocos escuros recebem a classe `.on-stage`, que redeclara os papéis semânticos
(fundo, texto, linha) — tudo dentro deles segue funcionando sem exceção por
componente.

## Deploy na Vercel

O repositório já vem configurado — o [`vercel.json`](vercel.json) fixa build,
saída, rewrites, cache e headers de segurança, então não há nada para ajustar
no painel.

**Pelo painel (recomendado):**

1. [vercel.com/new](https://vercel.com/new) → importe `viniking58/Pim-3`.
2. Não mude nada nas configurações: o `vercel.json` já define
   `npm ci` + `npm run build` + saída em `dist`.
3. **Deploy.**

⚠️ **Atenção à branch de produção.** A Vercel publica em produção a partir da
branch principal do repositório (`main`). Como o site está em
`claude/p1-motorsports-premium-site-pj6nu4`, você tem duas opções:

- abrir um pull request e fazer o merge na `main` — o caminho normal; ou
- em *Settings → Git → Production Branch*, apontar para
  `claude/p1-motorsports-premium-site-pj6nu4`.

Sem isso, essa branch só gera **Preview Deployments** (que já são links
funcionais e ótimos para revisar, mas não são o domínio de produção).

**Pelo terminal:**

```bash
npm i -g vercel
vercel login
vercel        # cria o projeto e publica um preview
vercel --prod # publica em produção
```

### O que o `vercel.json` faz

| Ajuste | Por quê |
| --- | --- |
| `installCommand: npm ci` | Instala exatamente o que está no `package-lock.json`, sem resolver versões de novo — build reprodutível. |
| `rewrites` para `/index.html` | Qualquer rota cai na página. A Vercel serve o arquivo estático primeiro, então os assets não são afetados. |
| `Cache-Control` imutável em `/assets/*` | O Vite põe hash no nome de cada arquivo, então eles podem ser cacheados por um ano; o `index.html` continua sendo revalidado a cada visita. |
| CSP + `nosniff` + `Referrer-Policy` + `Permissions-Policy` | Headers de segurança. A CSP libera o Google Fonts e o `blob:` que o three.js usa, e mantém `style-src 'unsafe-inline'` porque o React aplica estilos via atributo `style`. |

Os headers foram testados servindo o `dist/` com exatamente essas regras:
zero violações de CSP, WebGL ativo e as animações do Motion intactas.

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
| Navegação | Pílula de vidro que desliza para a seção em tela (`layoutId`), acompanhando o scroll |
| Troca de seção | Cortina de vidro em quatro faixas cobrindo saltos longos entre seções |
| Vidro | Barra, painel do configurador, filtros e etiquetas flutuantes com desfoque, borda e fio de luz na aresta |
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
- **Quatro ambientes** — estúdio escuro (preto `#0a0a0a`, luz-chave branca e
  recorte ciano desenhando a silhueta), catálogo (ciclorama branco, o
  enquadramento das fotos de fábrica), pôr do sol e noite — trocando
  luz-chave, preenchimento, contraluz, névoa, piso, sombra e exposição.
- O acabamento padrão é **metálico polido** (rugosidade 0,14 / metalness 0,95).
  Ele só funciona no estúdio escuro: o que a lataria reflete ali é preto com um
  recorte ciano. Esse mesmo material no ciclorama branco estoura e lava a cor —
  por isso o `envMapIntensity` faz parte de cada acabamento.
- **Modo "em movimento"**: rodas girando, carroceria flutuando, rastros no
  piso e espuma de esteira atrás do jet ski.

### Colocando os modelos reais do fabricante

A geometria escrita à mão tem um teto: ela chega a um 3D estilizado
convincente, **não a uma foto de catálogo**. Quando você tiver o material
oficial, existem dois caminhos — os dois já suportados:

> **Não existe jet ski nem barco nos exemplos públicos do Three.js.** Os
> nomes plausíveis foram testados direto no repositório e todos retornam 404;
> o único veículo lá é `ferrari.glb` (um carro). Também não vale apontar o
> site para `threejs.org` em produção: é banda de terceiro, sem garantia de
> permanência, e a CSP deste projeto bloqueia origens externas.

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

- **Draco**: o decodificador é auto-hospedado em `public/draco/`. O padrão da
  biblioteca busca num CDN externo, que a CSP do site bloqueia — e modelos de
  fabricante quase sempre chegam comprimidos, então isso não é opcional.
- **Reserva**: se o arquivo falhar (URL errada, rede fora, CSP barrando a
  origem), um *error boundary* devolve a geometria procedural em vez de
  deixar o palco vazio.
- **Verificado**: o caminho foi testado de ponta a ponta com um `.glb` real
  (ToyCar, do conjunto de amostras da Khronos) — carregou, centralizou,
  escalou e renderizou sob a iluminação do palco. O arquivo de teste não foi
  mantido no repositório.

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
