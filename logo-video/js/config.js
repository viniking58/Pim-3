/* =====================================================================
   Configuração do vídeo — edite aqui textos, cores e ritmo.
   ===================================================================== */

const VIDEO = {
  width: 1080,   // formato Reels / Stories (9:16)
  height: 1920,
  fps: 30,
  bpm: 120,      // os cortes seguem a batida: 1 tempo = 0,5 s
};

const BRAND = {
  name: 'sua marca',          // aparece no ícone do app e no perfil
  handle: '@suamarca',
  tagline: 'em todo lugar.',  // frase do outdoor e do final ('' para esconder)
  kicker: 'IDENTIDADE VISUAL',
  year: '2026',
  colors: {
    ink: '#0D0D0D',    // fundo preto da arte original
    cream: '#FEF7ED',  // o "r"
    pink: '#FF3A6F',   // o ponto
  },
};

/* Geometria da logo em "unidades de logo" (caixa 410 × 609), medida
   diretamente da arte enviada (1592 × 1600 px). Cada vértice do "r" é
   [x, y, raio do canto]; os raios reproduzem os cantos suavizados. */
const LOGO = {
  w: 410,
  h: 609,
  glyph: [
    [0, 0, 25],        // topo esquerdo
    [354.5, 0, 10],    // início do chanfro 45°
    [409, 54.5, 10],   // fim do chanfro
    [409, 252, 20],    // base do gancho (direita)
    [287.5, 252, 20],  // base do gancho (esquerda)
    [287.5, 119, 18],  // canto interno (côncavo)
    [120, 119, 18],    // canto interno (côncavo)
    [120, 609, 20],    // pé da haste (direita)
    [0, 609, 24],      // pé da haste (esquerda)
  ],
  dot: { x: 289, y: 486, w: 121, h: 122, r: 33 },
};
