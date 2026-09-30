import { C, txt, drawLogo, mark, drawLockup, stripes, WORD, TEXT } from './art.js';

/* Telas: supervisório (IHM) de máquina de papel e site institucional. */

const UI = { bg: '#0E1513', panel: '#15201D', line: '#23332E', accent: '#3FA387', text: '#E8EFEC', dim: '#8FA39C', warn: '#E8B04B' };

function tile(g, x, y, w, h, label, value, unit, color = UI.accent) {
  g.fillStyle = UI.panel;
  g.fillRect(x, y, w, h);
  g.fillStyle = color;
  g.fillRect(x, y, 5, h);
  txt(g, label, x + 22, y + 34, { size: 20, weight: 500, color: UI.dim });
  txt(g, value, x + 22, y + h - 26, { size: 46, weight: 600, color: UI.text });
  g.font = `600 46px ${TEXT}`;
  const vw = g.measureText(value).width;
  txt(g, unit, x + 30 + vw, y + h - 28, { size: 20, weight: 500, color: UI.dim });
}

/* IHM de 12" (1280×1024). t anima valores e a tendência. */
export function drawHMI(g, t = 0) {
  const w = 1280, h = 1024;
  g.fillStyle = UI.bg;
  g.fillRect(0, 0, w, h);
  // Cabeçalho.
  g.fillStyle = C.green;
  g.fillRect(0, 0, w, 76);
  drawLogo(g, 70, 38, 34, { shadow: null });
  txt(g, 'MÁQUINA DE PAPEL 2 · VISÃO GERAL', 130, 48, { size: 26, weight: 600, color: '#FFFFFF' });
  txt(g, '14:32:0' + (Math.floor(t * 3) % 10), w - 30, 48, { size: 24, weight: 500, color: '#DCE8E4', align: 'right' });
  g.fillStyle = '#6EE0A8';
  g.beginPath();
  g.arc(w - 190, 39, 8, 0, Math.PI * 2);
  g.fill();
  txt(g, 'EM OPERAÇÃO', w - 210, 47, { size: 18, weight: 600, color: '#BFF3D7', align: 'right' });

  // Fluxograma do processo.
  const py = 120, ph = 330;
  g.fillStyle = UI.panel;
  g.fillRect(24, py, w - 48, ph);
  txt(g, 'Caixa de entrada', 60, py + 42, { size: 18, weight: 500, color: UI.dim });
  txt(g, 'Mesa formadora', 250, py + 42, { size: 18, weight: 500, color: UI.dim });
  txt(g, 'Prensas', 560, py + 42, { size: 18, weight: 500, color: UI.dim });
  txt(g, 'Secadores', 770, py + 42, { size: 18, weight: 500, color: UI.dim });
  txt(g, 'Enroladeira', 1090, py + 42, { size: 18, weight: 500, color: UI.dim });
  const webY = py + 200;
  g.strokeStyle = UI.line;
  g.lineWidth = 2;
  g.strokeRect(60, webY - 70, 130, 90);
  g.fillStyle = '#1C2A26';
  g.fillRect(250, webY - 8, 270, 16);
  [[580, webY - 40], [650, webY + 40]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 34, 0, Math.PI * 2); g.fillStyle = '#22322D'; g.fill(); g.stroke(); });
  for (let i = 0; i < 6; i++) {
    const x = 790 + i * 50, y = webY + (i % 2 ? 42 : -42);
    g.beginPath();
    g.arc(x, y, 22, 0, Math.PI * 2);
    g.fillStyle = '#22322D';
    g.fill();
    g.stroke();
  }
  g.beginPath();
  g.arc(1140, webY + 10, 62 + Math.sin(t) * 2, 0, Math.PI * 2);
  g.fillStyle = '#E9E4D7';
  g.fill();
  // Folha de papel percorrendo a máquina.
  g.strokeStyle = UI.accent;
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(190, webY);
  g.lineTo(546, webY);
  g.lineTo(580, webY - 6);
  g.lineTo(650, webY + 6);
  g.lineTo(768, webY);
  for (let i = 0; i < 6; i++) g.lineTo(790 + i * 50, webY + (i % 2 ? 20 : -20));
  g.lineTo(1080, webY + 10);
  g.stroke();
  // Pulso animado ao longo da folha.
  const px = 200 + ((t * 420) % 880);
  g.fillStyle = 'rgba(111,224,168,0.9)';
  g.beginPath();
  g.arc(px, webY, 6, 0, Math.PI * 2);
  g.fill();

  // Indicadores.
  const v = 1250 + Math.round(Math.sin(t * 1.7) * 3);
  const ty = py + ph + 24, tw = (w - 48 - 3 * 18) / 4;
  tile(g, 24, ty, tw, 130, 'Velocidade', v.toLocaleString('pt-BR'), 'm/min');
  tile(g, 24 + (tw + 18), ty, tw, 130, 'Gramatura', '75,0', 'g/m²');
  tile(g, 24 + 2 * (tw + 18), ty, tw, 130, 'Umidade', (7.8 + Math.sin(t * 2.3) * 0.05).toFixed(1).replace('.', ','), '%', UI.warn);
  tile(g, 24 + 3 * (tw + 18), ty, tw, 130, 'Consistência', '3,2', '%');

  // Tendência.
  const gy = ty + 154, gh = h - gy - 24;
  g.fillStyle = UI.panel;
  g.fillRect(24, gy, w - 48, gh);
  txt(g, 'Umidade da folha · últimos 30 min', 48, gy + 40, { size: 20, weight: 500, color: UI.dim });
  g.strokeStyle = UI.line;
  g.lineWidth = 1;
  for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(48, gy + 60 + i * (gh - 90) / 4); g.lineTo(w - 48, gy + 60 + i * (gh - 90) / 4); g.stroke(); }
  g.strokeStyle = UI.warn;
  g.lineWidth = 3;
  g.beginPath();
  for (let x = 0; x <= w - 96; x += 6) {
    const k = x / (w - 96);
    const y = gy + 60 + (gh - 90) * (0.5 + 0.22 * Math.sin(k * 9 + t * 0.8) * (1 - k * 0.6) + 0.05 * Math.sin(k * 41));
    x ? g.lineTo(48 + x, y) : g.moveTo(48 + x, y);
  }
  g.stroke();
  g.strokeStyle = 'rgba(63,163,135,0.7)';
  g.setLineDash([10, 8]);
  g.beginPath();
  g.moveTo(48, gy + 60 + (gh - 90) * 0.5);
  g.lineTo(w - 48, gy + 60 + (gh - 90) * 0.5);
  g.stroke();
  g.setLineDash([]);
}

/* Site institucional (desktop 1600×1000). photo = canvas opcional para o destaque. */
export function drawWebsite(g, photo = null) {
  const w = 1600, h = 1000;
  g.fillStyle = '#F4F5F3';
  g.fillRect(0, 0, w, h);
  g.fillStyle = C.green;
  g.fillRect(0, 0, w, 620);
  if (photo) {
    g.save();
    g.beginPath();
    g.rect(820, 0, 780, 620);
    g.clip();
    const s = Math.max(780 / photo.width, 620 / photo.height);
    g.drawImage(photo, 820 + (780 - photo.width * s) / 2, (620 - photo.height * s) / 2, photo.width * s, photo.height * s);
    const gr = g.createLinearGradient(820, 0, 1020, 0);
    gr.addColorStop(0, C.green);
    gr.addColorStop(1, 'rgba(44,81,73,0)');
    g.fillStyle = gr;
    g.fillRect(820, 0, 200, 620);
    const top = g.createLinearGradient(0, 0, 0, 160);
    top.addColorStop(0, 'rgba(10,20,17,0.55)');
    top.addColorStop(1, 'rgba(10,20,17,0)');
    g.fillStyle = top;
    g.fillRect(820, 0, 780, 160);
    g.restore();
  } else {
    stripes(g, 1000, 0, 600, 620, { color: 'rgba(255,255,255,0.08)', bar: 90, gap: 60 });
  }
  drawLockup(g, 80, 70, 48, { align: 'left' });
  ['Soluções', 'Projetos', 'Serviços', 'Contato'].forEach((m, i) => txt(g, m, 930 + i * 160, 82, { size: 24, weight: 500, color: '#FFFFFF' }));
  txt(g, 'Automação industrial', 80, 290, { size: 78, weight: 700, color: '#FFFFFF' });
  txt(g, 'para papel e celulose', 80, 380, { size: 78, weight: 700, color: '#FFFFFF' });
  txt(g, 'Sistemas de controle, instrumentação e', 82, 452, { size: 28, weight: 400, color: '#D5E3DE' });
  txt(g, 'modernização de máquinas de papel.', 82, 492, { size: 28, weight: 400, color: '#D5E3DE' });
  g.fillStyle = '#FFFFFF';
  g.fillRect(82, 530, 250, 58);
  txt(g, 'Fale com a gente', 207, 568, { size: 22, weight: 600, color: C.green, align: 'center' });
  const cards = [['Controle', 'DCS e CLP para toda a linha'], ['Instrumentação', 'Medição de consistência e vazão'], ['Modernização', 'Retrofit de máquinas e acionamentos']];
  cards.forEach(([a, b], i) => {
    const x = 80 + i * 490;
    g.fillStyle = '#FFFFFF';
    g.fillRect(x, 680, 460, 250);
    g.fillStyle = C.green;
    g.fillRect(x, 680, 460, 6);
    mark(g, x + 60, 740, 34);
    txt(g, a, x + 36, 830, { size: 34, weight: 700, color: C.ink });
    txt(g, b, x + 36, 875, { size: 22, weight: 400, color: '#5B625F' });
  });
}

/* Versão para celular (750×1624). */
export function drawMobileSite(g, photo = null) {
  const w = 750, h = 1624;
  g.fillStyle = '#F4F5F3';
  g.fillRect(0, 0, w, h);
  g.fillStyle = C.green;
  g.fillRect(0, 0, w, 1020);
  txt(g, '9:41', 60, 62, { size: 30, weight: 600, color: '#FFFFFF' });
  drawLockup(g, 50, 170, 44, { align: 'left' });
  if (photo) {
    const ph = 420, s = Math.max(w / photo.width, ph / photo.height);
    g.save();
    g.beginPath();
    g.rect(0, 250, w, ph);
    g.clip();
    g.drawImage(photo, (w - photo.width * s) / 2, 250 + (ph - photo.height * s) / 2, photo.width * s, photo.height * s);
    g.restore();
  }
  txt(g, 'Automação', 50, 770, { size: 70, weight: 700, color: '#FFFFFF' });
  txt(g, 'industrial para', 50, 850, { size: 70, weight: 700, color: '#FFFFFF' });
  txt(g, 'papel e celulose', 50, 930, { size: 70, weight: 700, color: '#FFFFFF' });
  [['Controle', 'DCS e CLP'], ['Instrumentação', 'Consistência e vazão'], ['Modernização', 'Retrofit de máquinas']].forEach(([a, b], i) => {
    const y = 1070 + i * 170;
    g.fillStyle = '#FFFFFF';
    g.fillRect(40, y, w - 80, 150);
    mark(g, 110, y + 75, 44);
    txt(g, a, 180, y + 70, { size: 38, weight: 700, color: C.ink });
    txt(g, b, 180, y + 112, { size: 26, weight: 400, color: '#5B625F' });
  });
}
