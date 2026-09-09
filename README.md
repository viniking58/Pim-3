# P1 Motorsports — site

Site da **P1 Motorsports**, concessionária autorizada BRP (Sea-Doo, Can-Am e
Sea-Doo Switch) em São José dos Campos — SP.

**Vite + React + TypeScript**, rotas com **react-router**, movimento com
**Motion** (Framer Motion), scroll suave com **Lenis** e 3D em **three.js /
react-three-fiber**. Sem imagens externas: os veículos são ilustrações e
modelos autorais.

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + bundle em dist/
npm run preview    # serve o bundle gerado
```

Requer **Node 18+**.

## Ver na Vercel

O repositório já vem configurado — o [`vercel.json`](vercel.json) fixa build,
saída, rewrites, cache e cabeçalhos de segurança. Não há nada para ajustar no
painel.

**Para só visualizar (Preview):**

1. [vercel.com/new](https://vercel.com/new) → importe `viniking58/Pim-3`
2. Não mude nada nas configurações
3. **Deploy**

A partir daí a Vercel gera uma **Preview URL a cada push, em qualquer branch**.
A branch do site aparece em *Deployments* com link próprio — é um endereço que
funciona e pode ser compartilhado, sem precisar de merge nem de PR.

**Para virar o site de produção**, depois: a Vercel publica em produção a partir
da branch principal do repositório (`main`). Então ou você faz o merge da branch
na `main`, ou aponta *Settings → Git → Production Branch* para ela.

### O que o `vercel.json` faz

| Ajuste | Por quê |
| --- | --- |
| `installCommand: npm ci` | Instala exatamente o que está no `package-lock.json`, sem re-resolver versões — build reprodutível. Exige o lockfile em sincronia com o `package.json`. |
| `rewrites` para `/index.html` | **Essencial num site com rotas**: sem isso, abrir `/modelos/rxp-x` direto pela URL, ou dar refresh nela, devolveria 404. A Vercel resolve o arquivo estático antes do rewrite, então os assets não são afetados. |
| Cache imutável em `/assets/*` | O Vite põe hash no nome de cada arquivo, então podem ser cacheados por um ano; o `index.html` segue revalidando. |
| CSP e demais cabeçalhos | A CSP libera o Google Fonts, o `blob:` do three.js e o `wasm-unsafe-eval` do decodificador Draco, e mantém `style-src 'unsafe-inline'` porque o React aplica estilo por atributo. |

Validado servindo o `dist/` com exatamente essas regras: rotas internas
carregadas direto pela URL respondem 200, e não há violação de CSP.

## Direção visual

Páginas editoriais **claras**, com o 3D vivendo em **palcos escuros de
sangria** — o padrão do site da Porsche. Toda a ousadia é gasta nesse
contraste; o vermelho é cor de ação, não de decoração.

A versão anterior era escura do início ao fim com um único acento vermelho, que
é exatamente o padrão que a skill de design da casa aponta como assinatura de
design gerado por IA — junto de marcadores `01/02/03` decorativos e cards
arredondados repetidos em tudo. Os três foram removidos: a numeração sobrou só
onde existe sequência real (o processo de compra e as etapas do configurador).

**Trio tipográfico**: Archivo (títulos), Instrument Sans (texto) e Martian Mono
(dados e rótulos) — largura técnica que cai bem em ficha de especificação.

## Cores da marca

**Todas as cores vivem em [`src/styles/tokens.css`](src/styles/tokens.css).**
Nenhum componente usa cor literal. Para aplicar a paleta oficial, troque os
valores de `--brand-*` no topo do arquivo.

> O domínio `p1motorsports.com.br` está bloqueado pelo proxy de rede do
> ambiente onde o site foi construído, então os hexadecimais exatos do site
> atual não puderam ser extraídos.

Blocos escuros recebem a classe `.on-stage`, que redeclara os papéis semânticos
(fundo, texto, linha) — tudo dentro deles segue funcionando sem exceção por
componente.

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

Shell persistente (`src/components/shell/`) com navegação, rodapé e transição
entre rotas. Cada rota vive em `src/routes/`, com o `.tsx` e o `.css` ao lado.

## Monte o seu

Espelha o "Monte o Seu" oficial da Sea-Doo, cuja própria URL entrega o modelo de
dados (`?platform=…&package=…&unitid=…`): **plataforma → pacote → motor → cor →
acessórios → resumo**.

- **O estado vive na URL.** Uma montagem é um link: recarrega e volta idêntica,
  e pode ser mandada ao consultor.
- **Código curto** derivado da configuração, para o cliente citar no balcão.
- **Acessórios acendem geometria real.** Itens com `visual3d` em
  [`src/data/models.ts`](src/data/models.ts) ligam a peça no modelo 3D —
  retrovisores, para-brisa, barra de LEDs, teto, bagageiro. É o elo que faz o
  configurador parecer vivo em vez de decorativo.
- **Sem preço inventado.** A ferramenta da BRP dá orçamento instantâneo porque a
  fábrica tem a tabela; o resumo aqui lista a montagem completa e envia para a
  loja responder com o valor real. Com a tabela em mãos, é um campo por item.

## 3D

`src/three/` guarda o motor: `VehicleScene` (palco, órbita, plataforma
giratória), `Stage3D` (iluminação e ambientes), a geometria procedural dos
veículos e `GltfVehicle`.

**Modelos reais do fabricante** entram sem mudança de código: ponha o `.glb` em
`public/models/` e preencha `asset` no modelo em `src/data/models.ts`.
`GltfVehicle` centraliza, apoia no piso, reescala para o palco e aplica as cores
do configurador nos materiais cujo nome casa com os `slots`, preservando as
texturas. O decodificador **Draco é auto-hospedado** em `public/draco/`, porque
o padrão da biblioteca busca num CDN externo que a CSP bloqueia. Se o arquivo
falhar ao carregar, um *error boundary* devolve a geometria procedural em vez de
deixar o palco vazio.

O bundle 3D entra por carregamento tardio — a página inicial não paga por ele.

## Acessibilidade

- `prefers-reduced-motion` respeitado: transições de rota e revelações caem para
  entrada direta, e a plataforma giratória abre parada.
- Navegação por teclado com *skip link* e `:focus-visible` visível.
- Ilustrações com `role="img"` e rótulo; textos animados expõem o conteúdo
  íntegro via `aria-label`.

## Conteúdo

Endereço, horário, e-mails e o posicionamento como primeira concessionária BRP
do Vale do Paraíba são dados públicos da loja. Especificações e potências são
públicas das linhas BRP. **Não há preços inventados no site.** Depoimentos e
unidades de seminovos não são publicados como reais — a página de seminovos
explica o critério de aceitação e leva ao consultor, em vez de listar estoque
fictício.
