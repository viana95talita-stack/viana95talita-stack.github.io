/* ================================================================
   CONVITES, PAPELARIA, MONOGRAMA E BRASÃO
   Prévias desenhadas com os nomes e a data do casal. São ilustrações
   para inspirar a conversa com o ateliê, não arquivos de impressão.
   ================================================================ */
const pd = () => {
  const c = cfg(), W = wedding();
  const ROM = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  const rom = n => { const m = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]; let s = ''; m.forEach(([v,l]) => { while (n >= v){ s += l; n -= v; } }); return s; };
  return {
    n1: esc(nameOf(0)), n2: esc(nameOf(1)), i1: esc(nameOf(0)[0]||'T'), i2: esc(nameOf(1)[0]||'D'),
    extenso: esc(fmtD(W,{day:'numeric',month:'long',year:'numeric'})),
    semana: esc(fmtD(W,{weekday:'long'})),
    num: esc(fmtD(W,{day:'2-digit',month:'2-digit',year:'numeric'}).replace(/\//g,' · ')),
    curta: esc(fmtD(W,{day:'2-digit',month:'2-digit',year:'2-digit'}).replace(/\//g,'.')),
    romana: `${rom(W.getDate())} · ${ROM[W.getMonth()+1]} · ${rom(W.getFullYear())}`,
    ano: W.getFullYear(), anoRom: rom(W.getFullYear()),
    mesEN: W.toLocaleDateString('en-GB',{month:'long'}), diaEN: W.toLocaleDateString('en-GB',{weekday:'long'}),
    igreja: 'Igreja São João Batista', quadrado: 'Quadrado de Trancoso', festa: esc(c.local), hora: esc(c.hora), cerHora: esc(c.cerimoniaHora || '')
  };
};

/* --- desenhos em traço fino (cor = currentColor) --- */
const ART = {
  igreja: (w=1.2) => `<svg viewBox="0 0 120 90" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 84h112"/><path d="M34 84V44l26-22 26 22v40"/><path d="M60 22v-9M56 16.5h8"/><path d="M52 84V64a8 8 0 0 1 16 0v20"/><path d="M41 52h8v9h-8zM71 52h8v9h-8z"/><path d="M86 84V50h12v34M89 50v-8a3 3 0 0 1 6 0v8"/><path d="M14 84c2-14 1-24-1-32M13 52c-6-2-10 0-12 3M13 52c5-4 10-4 13-1M13 52c-2-6-6-8-10-8M13 52c3-6 7-7 11-6"/></svg>`,
  cardo: (w=1.1) => `<svg viewBox="0 0 40 80" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 78V34"/><path d="M12 34c0-7 4-11 8-11s8 4 8 11z"/><path d="M14 30l12-5M14 25l12 5M20 23v11"/><path d="M14 23l-3-9M17 22l-2-11M20 22V9M23 22l2-11M26 23l3-9"/><path d="M20 60c-6-2-11-7-13-14 5 1 10 5 13 10M20 50c6-2 10-7 12-13-5 1-9 4-12 9"/></svg>`,
  coqueiro: (w=1.1) => `<svg viewBox="0 0 50 80" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M24 78c3-16 4-34 1-52"/><path d="M25 26c-8-6-16-6-22-1M25 26c8-7 16-7 22-2M25 26c-4-9-10-13-17-13M25 26c4-9 11-12 18-11M25 26c0-8-2-15-6-20M25 26c3-7 7-11 12-14"/></svg>`,
  falesia: (w=1.1) => `<svg viewBox="0 0 160 40" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" aria-hidden="true"><path d="M2 38h156"/><path d="M2 30c20-2 30-14 50-14s26 8 44 6 30-12 62-12"/><path d="M8 34c18-1 30-9 48-9s24 6 42 4 32-8 58-8" opacity=".6"/></svg>`,
  ramo: (w=1) => `<svg viewBox="0 0 100 30" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" aria-hidden="true"><path d="M5 25C30 20 60 12 95 5"/>${[18,32,46,60,74].map((x,i) => `<path d="M${x} ${23-i*4}c-2-6 0-10 5-12M${x+4} ${22-i*4}c6 0 10 3 11 7"/>`).join('')}</svg>`
};
/* textura de papel (ruído) e borda rasgada */
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .4 0 0 0 0 .35 0 0 0 0 .3 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
const DECKLE = (() => {
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const pts = []; const j = () => (rnd() * 1.6).toFixed(2);
  for (let x = 0; x <= 100; x += 2.5) pts.push(`${x} ${j()}`);
  for (let y = 0; y <= 140; y += 2.5) pts.push(`${(100 - +j()).toFixed(2)} ${y}`);
  for (let x = 100; x >= 0; x -= 2.5) pts.push(`${x} ${(140 - +j()).toFixed(2)}`);
  for (let y = 140; y >= 0; y -= 2.5) pts.push(`${j()} ${y}`);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 140' preserveAspectRatio='none'%3E%3Cpolygon points='${pts.join(' ')}' fill='black'/%3E%3C/svg%3E")`;
})();
function pseudoQR(){
  let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  let cells = '';
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++){
    const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    let on = r() > .52;
    if (finder){ const fx = x > 13 ? x - 14 : x, fy = y > 13 ? y - 14 : y; on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5); }
    if (on) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }
  return `<svg viewBox="-1 -1 23 23" class="i-qr" aria-hidden="true"><rect x="-1" y="-1" width="23" height="23" fill="#fff"/><g fill="#1d1d1d">${cells}</g></svg>`;
}

/* --- modelos de convite --- */
const MODELOS = [
 {id:'tipografico', nome:'Tipográfico minimalista', estilo:'Clean', papel:'Algodão off-white, 600 g/m²', tecnica:'Letterpress em 1 cor', custo:3,
  porque:'Só tipografia e espaço em branco. O luxo está no papel grosso e na marca da letra no papel.',
  render:d => `<div class="inv paper" style="background:#FBF8F3"><div class="i-caps lp" style="color:#3A3530">Juntos com suas famílias</div><div class="i-sp"></div><div class="i-serif i-xl lp" style="color:#2B2622">${d.n1}</div><div class="i-serif i-it i-m lp" style="color:#2B2622">e</div><div class="i-serif i-xl lp" style="color:#2B2622">${d.n2}</div><div class="i-sp"></div><div class="i-caps lp" style="color:#3A3530">${d.semana} · ${d.extenso}</div><div class="i-small lp" style="color:#5A534C">Trancoso · Bahia</div></div>`},
 {id:'relevo', nome:'Relevo seco', estilo:'Clean, tátil', papel:'Algodão branco puro', tecnica:'Relevo seco no monograma, texto em letterpress cinza', custo:3,
  porque:'O monograma aparece só pelo relevo, sem tinta. É o detalhe que quem segura percebe.',
  render:d => `<div class="inv paper" style="background:#F6F3EE"><div class="i-emboss i-script" style="font-size:22cqw">${d.i1}<span style="font-size:.6em">&amp;</span>${d.i2}</div><div class="i-sp"></div><div class="i-caps" style="color:#6E6862">${d.n1} &amp; ${d.n2}</div><div class="i-serif i-m" style="color:#4A4540">${d.extenso}</div><div class="i-small" style="color:#8A837C">${d.igreja} · ${d.quadrado}</div></div>`},
 {id:'prata', nome:'Prata sobre pérola', estilo:'Clean, tendência 2027', papel:'Perolado cinza-claro', tecnica:'Hot stamping prateado', custo:2,
  porque:'Os relatórios de 2027 apontam a prata e os tons frios substituindo o dourado. Fica moderno e frio, como a luz do Quadrado à noite.',
  render:d => `<div class="inv paper" style="background:linear-gradient(160deg,#E9EAEC,#DCDDE0)"><div class="i-caps" style="color:#5E6268">Save the date · Reserve a data</div><div class="i-sp"></div><div class="i-bodoni i-xl foil-silver">${d.n1}</div><div class="i-bodoni i-it i-m foil-silver">&amp;</div><div class="i-bodoni i-xl foil-silver">${d.n2}</div><div class="i-sp"></div><div class="i-caps foil-silver">${d.num}</div><div class="i-small" style="color:#6E7278">Trancoso · Brasil</div></div>`},
 {id:'noite', nome:'Dourado na noite', estilo:'Black tie', papel:'Papel tingido verde-profundo ou preto', tecnica:'Hot stamping dourado', custo:3,
  porque:'Combina com a festa às 20h. O papel escuro com dourado é o mais formal da lista.',
  render:d => `<div class="inv" style="background:#18241E;color:#E9DFC8"><div class="i-frame" style="border-color:rgba(220,196,140,.55)"></div><div class="i-script i-xl foil-gold">${d.n1}</div><div class="i-script i-m foil-gold">&amp;</div><div class="i-script i-xl foil-gold">${d.n2}</div><div class="i-sp"></div><div class="i-caps foil-gold">${d.romana}</div><div class="i-small" style="opacity:.8">${d.festa} · ${d.hora}</div></div>`},
 {id:'vegetal', nome:'Papel vegetal sobreposto', estilo:'Romântico leve', papel:'Vegetal translúcido sobre algodão', tecnica:'Impressão branca no vegetal e ilustração no fundo', custo:2,
  porque:'A camada translúcida deixa a igreja aparecer por baixo, como uma névoa.',
  render:d => `<div class="inv paper" style="background:#F5EFE6;color:#7C6A58"><div class="i-art" style="color:#B49E86;width:78%;margin-top:30%">${ART.igreja(1.1)}</div><div class="i-vellum"><div class="i-script i-l" style="color:#3E352D">${d.n1} &amp; ${d.n2}</div><div class="i-caps" style="color:#5D5146">${d.extenso}</div></div></div>`},
 {id:'rasgada', nome:'Borda rasgada e lacre', estilo:'Artesanal chique', papel:'Algodão artesanal com borda natural', tecnica:'Impressão digital fina e lacre de cera', custo:3,
  porque:'A borda irregular e o lacre trazem textura sem perder a simplicidade. Para o minimalismo de 2027, a textura é o que deixa a peça especial.',
  render:d => `<div class="inv paper deckle" style="background:#F3ECE1"><div class="i-serif i-it i-m" style="color:#6B5A49">o casamento de</div><div class="i-script i-xl" style="color:#3D3128">${d.n1}</div><div class="i-script i-xl" style="color:#3D3128;margin-top:-2cqw">&amp; ${d.n2}</div><div class="i-sp"></div><div class="i-caps" style="color:#6B5A49">${d.extenso}</div><div class="i-small" style="color:#8A7866">Trancoso · Bahia</div><div class="i-wax"><span>${d.i1}${d.i2}</span></div></div>`},
 {id:'faixa', nome:'Faixa com aquarela da igreja', estilo:'Destination', papel:'Algodão + faixa de vegetal', tecnica:'Aquarela impressa na faixa (belly band)', custo:2,
  porque:'A faixa abraça o convite com a Igreja do Quadrado pintada. Quem recebe já sabe para onde vai.',
  render:d => `<div class="inv paper" style="background:#FAF7F1"><div class="i-script i-l" style="color:#4B4038;margin-top:-6cqw">${d.n1} &amp; ${d.n2}</div><div class="i-caps" style="color:#7A6E63">${d.extenso}</div><div class="i-band"><div class="i-art wc" style="width:46%">${ART.igreja(1)}</div></div><div class="i-small" style="color:#7A6E63;position:absolute;bottom:9cqw;left:0;right:0">${d.igreja} · ${d.quadrado}</div></div>`},
 {id:'traco', nome:'Traço fino de Trancoso', estilo:'Destination clean', papel:'Algodão creme', tecnica:'Letterpress em 1 cor com ilustração', custo:3,
  porque:'Um desenho de linha da igreja, do coqueiro e das falésias conta o lugar sem cor nenhuma.',
  render:d => `<div class="inv paper" style="background:#F8F4EC;color:#5C6B60"><div class="i-art" style="width:62%">${ART.igreja(1)}</div><div class="i-sp"></div><div class="i-serif i-l" style="color:#2F3A33">${d.n1} <span class="i-it">&amp;</span> ${d.n2}</div><div class="i-caps">${d.extenso}</div><div class="i-art" style="width:70%;margin-top:3cqw">${ART.falesia(1)}</div></div>`},
 {id:'acrilico', nome:'Acrílico transparente', estilo:'Contemporâneo', papel:'Acrílico de cerca de 3 mm', tecnica:'Impressão UV branca ou gravação a laser', custo:4,
  porque:'Vira objeto de lembrança. A transparência é minimalista por natureza.',
  backdrop:'acrylic-bg',
  render:d => `<div class="inv acrylic"><div class="i-caps" style="color:#fff">Casamento</div><div class="i-sp"></div><div class="i-script i-xl" style="color:#fff">${d.n1}</div><div class="i-serif i-m" style="color:#fff">&amp;</div><div class="i-script i-xl" style="color:#fff">${d.n2}</div><div class="i-sp"></div><div class="i-caps" style="color:#fff">${d.num}</div></div>`},
 {id:'arco', nome:'Corte em arco', estilo:'Clean, tendência', papel:'Algodão 2 camadas', tecnica:'Corte especial (faca) em arco + hot stamping', custo:3,
  porque:'Formatos com recorte orgânico estão entre as tendências mais fortes. O arco lembra a porta da igreja.',
  render:d => `<div class="inv paper arch" style="background:#EFE7DC"><div class="i-arch-in"><div class="i-caps" style="color:#7D6B5A">Casamento</div><div class="i-sp"></div><div class="i-italiana i-xl" style="color:#3B3029">${d.n1}</div><div class="i-italiana i-m" style="color:#3B3029">&amp;</div><div class="i-italiana i-xl" style="color:#3B3029">${d.n2}</div><div class="i-sp"></div><div class="i-caps foil-gold">${d.extenso}</div></div></div>`},
 {id:'brasao', nome:'Brasão do casamento', estilo:'Clássico elegante', papel:'Algodão branco', tecnica:'Brasão em relevo metálico, texto em letterpress', custo:4,
  porque:'Um brasão criado para vocês, com o cardo da Escócia e o coqueiro da Bahia. Não é um brasão de família, é um símbolo do casamento.',
  render:d => `<div class="inv paper" style="background:#FBF9F4;color:#2E3B4E"><div class="i-crest" style="width:34%">${MONOS.brasao.svg()}</div><div class="i-sp"></div><div class="i-serif i-caps" style="font-size:3.4cqw">Têm a alegria de convidar para o casamento</div><div class="i-serif i-l">${d.n1} &amp; ${d.n2}</div><div class="i-caps">${d.semana}, ${d.extenso}</div></div>`},
 {id:'bilingue', nome:'Bilíngue português e inglês', estilo:'Para as duas famílias', papel:'Algodão off-white', tecnica:'Letterpress em 2 cores', custo:3,
  porque:'O David é escocês. Um convite em duas línguas recebe as duas famílias igualmente.',
  render:d => `<div class="inv paper" style="background:#FAF8F4;color:#3B3A36"><div class="i-script i-l">${d.n1} &amp; ${d.n2}</div><div class="i-sp"></div><div class="i-cols"><div><div class="i-caps">Português</div><div class="i-small">têm a alegria de convidar para o seu casamento</div><div class="i-small"><b>${d.extenso}</b></div></div><div class="i-vr"></div><div><div class="i-caps">English</div><div class="i-small">request the pleasure of your company at their wedding</div><div class="i-small"><b>${d.diaEN}, 14 ${d.mesEN} ${d.ano}</b></div></div></div><div class="i-sp"></div><div class="i-caps" style="color:#7A776F">Trancoso · Bahia · Brasil</div></div>`},
 {id:'postal', nome:'Cartão-postal de viagem', estilo:'Destination divertido', papel:'Cartão rígido fosco', tecnica:'Impressão digital, carimbo personalizado', custo:1,
  porque:'Ótimo como save the date: carimbo de Trancoso, selo e a data, como uma passagem.',
  shape:'land',
  render:d => `<div class="inv land paper" style="background:#F4EEE3;color:#3E4F5E"><div class="i-post"><div class="i-post-l"><div class="i-caps">Save the date</div><div class="i-script i-l" style="color:#2E3D4A">${d.n1} &amp; ${d.n2}</div><div class="i-caps">${d.extenso}</div><div class="i-small">Trancoso · Bahia · Brasil</div></div><div class="i-post-r"><div class="i-stamp"><div class="i-art" style="color:#3E5F80">${ART.coqueiro(1.4)}</div></div><div class="i-postmark">TRANCOSO<br>${d.curta}</div><div class="i-lines"><i></i><i></i><i></i></div></div></div></div>`},
 {id:'digital', nome:'Digital com QR code', estilo:'Prático', papel:'Celular e cartão pequeno', tecnica:'Convite digital, site com confirmação, QR no cartão impresso', custo:1,
  porque:'Liga o papel ao site com hospedagem, transfer e confirmação. Os guias sugerem um QR dinâmico, que pode ser atualizado.',
  render:d => `<div class="inv phone"><div class="i-notch"></div><div class="i-script i-l" style="color:#2C2824">${d.n1} &amp; ${d.n2}</div><div class="i-caps" style="color:#6F675F">${d.extenso}</div><div style="width:42%;margin:4cqw 0">${pseudoQR()}</div><div class="i-small" style="color:#6F675F">Aponte a câmera para confirmar presença e ver hospedagem e transfer</div><div class="i-btn">Confirmar presença</div><div class="i-small" style="color:#A59E96;font-size:2.6cqw">QR ilustrativo</div></div>`},
 {id:'envelope', nome:'Envelope com forro xadrez', estilo:'Homenagem escocesa', papel:'Envelope de algodão + forro', tecnica:'Endereço em caligrafia à mão, forro com o tartan do David', custo:3,
  porque:'Por fora é clean. Ao abrir, aparece o tartan da família do David, uma surpresa discreta e pessoal.',
  shape:'env',
  render:d => `<div class="env"><div class="env-liner"></div><div class="env-body paper"><div class="i-script" style="font-size:9cqw;color:#2C3E50">Família Oliveira</div><div class="i-serif i-it" style="font-size:4cqw;color:#55626F">Endereço de exemplo · São Paulo · SP</div><div class="env-wax"><span>${d.i1}${d.i2}</span></div></div></div>`}
];
const MAIS_IDEIAS = [
 ['Papel semente','Planta-se depois e nascem flores. Fornecedores brasileiros citam de R$ 3,60 a R$ 20 por convite.'],
 ['Bordas pintadas (edge painting)','A borda do papel grosso pintada numa cor da paleta. Discreto e muito elegante.'],
 ['Duplex colorido','Duas folhas coladas: branca por fora e uma cor da paleta por dentro, que aparece na lateral.'],
 ['Linho ou tecido','Envelope ou capa de linho cru, combinando com a decoração em rattan e madeira da festa.'],
 ['Fita de seda e flor seca','Fita de seda tingida à mão e um raminho seco preso sob o lacre.'],
 ['Caixa para padrinhos','Uma caixa com o convite, o kit de beleza ou um item escocês, entregue em mãos.'],
 ['Mapa ilustrado de Trancoso','Um cartão com o caminho do aeroporto de Porto Seguro, a igreja e o Club Med desenhados.'],
 ['Caligrafia no envelope','O nome de cada convidado escrito à mão por um calígrafo. Em São Paulo há calígrafos a partir de cerca de R$ 200.'],
 ['Termografia','Relevo brilhante mais barato que o letterpress. Boa opção para peças de apoio.'],
 ['Serigrafia com relevo','Tinta espessa com leve relevo e brilho, feita de forma artesanal.'],
 ['Gravação a laser em madeira','Para um toque rústico-chique. Combina com a estrutura de madeira do Chez Bisutti.'],
 ['Azulejo pintado','Inimaginável: um pequeno azulejo pintado à mão com a igreja. Vira lembrança para sempre.'],
 ['Convite em leque','Abre como um leque e lembra o calor de Trancoso. Pode servir como abanador na igreja.'],
 ['Pergaminho em tubo','Enrolado e guardado num tubo. Teatral, para um convite de padrinhos.']
];

/* --- monogramas e brasão (SVG, cores do tema) --- */
const MONOS = {
 ampersand:{nome:'E comercial clássico', svg:() => { const d = pd(); return `<svg viewBox="0 0 100 100" aria-hidden="true"><text x="50" y="62" text-anchor="middle" style="font-family:var(--names);font-style:var(--names-style)" font-size="38" fill="currentColor">${d.i1}&amp;${d.i2}</text></svg>`; }},
 entrelacado:{nome:'Entrelaçado', svg:() => { const d = pd(); return `<svg viewBox="0 0 100 100" aria-hidden="true"><text x="42" y="70" text-anchor="middle" style="font-family:'Bodoni Moda',serif" font-size="62" fill="currentColor">${d.i1}</text><text x="60" y="76" text-anchor="middle" style="font-family:'Bodoni Moda',serif;font-style:italic" font-size="62" fill="none" stroke="currentColor" stroke-width="1.1">${d.i2}</text></svg>`; }},
 empilhado:{nome:'Empilhado', svg:() => { const d = pd(); return `<svg viewBox="0 0 100 100" aria-hidden="true"><text x="50" y="42" text-anchor="middle" style="font-family:'Cormorant Garamond',serif" font-size="36" fill="currentColor">${d.i1}</text><path d="M36 52h28" stroke="currentColor" stroke-width=".8"/><text x="50" y="86" text-anchor="middle" style="font-family:'Cormorant Garamond',serif" font-size="36" fill="currentColor">${d.i2}</text></svg>`; }},
 circulo:{nome:'Círculo com a data', svg:() => { const d = pd(); return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><path id="mc-arc" d="M18 50a32 32 0 0 0 64 0"/></defs><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width=".8"/><circle cx="50" cy="50" r="41" fill="none" stroke="currentColor" stroke-width=".4"/><text x="50" y="56" text-anchor="middle" style="font-family:'Cormorant Garamond',serif" font-size="26" fill="currentColor">${d.i1}<tspan style="font-style:italic" font-size="18" dx="2" dy="-1">&amp;</tspan><tspan dx="2" dy="1">${d.i2}</tspan></text><text font-size="5.6" letter-spacing="2" fill="currentColor" style="font-family:'Jost',sans-serif" text-anchor="middle"><textPath href="#mc-arc" startOffset="50%">${d.romana}</textPath></text></svg>`; }},
 brasao:{nome:'Brasão do casamento', svg:() => { const d = pd(); return `<svg viewBox="0 0 100 120" aria-hidden="true" fill="none" stroke="currentColor"><path d="M28 18h44v34c0 16-10 26-22 31-12-5-22-15-22-31z" stroke-width="1"/><path d="M31 21h38v31c0 14-8.5 22.5-19 27-10.5-4.5-19-13-19-27z" stroke-width=".45"/><text x="50" y="54" text-anchor="middle" stroke="none" fill="currentColor" style="font-family:var(--names);font-style:var(--names-style)" font-size="20">${d.i1}&amp;${d.i2}</text><g transform="translate(9 30) scale(.38)">${ART.cardo(2.4).replace(/<\/?svg[^>]*>/g,'')}</g><g transform="translate(72 30) scale(.38)">${ART.coqueiro(2.4).replace(/<\/?svg[^>]*>/g,'')}</g><path d="M22 92c10 5 18 2 28 2s18 3 28-2l-3 8c-8 3-15 1-25 1s-17 2-25-1z" stroke-width=".8"/><text x="50" y="100" text-anchor="middle" stroke="none" fill="currentColor" style="font-family:'Jost',sans-serif" font-size="5" letter-spacing="1.5">${d.anoRom}</text><path d="M50 12l2 4h-4z" stroke-width=".7"/></svg>`; }},
 guirlanda:{nome:'Guirlanda', svg:() => { const d = pd(); let L = '', R = '', stem = []; for (let i=0;i<10;i++){ const deg = 105 + i*15, a = deg*Math.PI/180; const x = 50 + 38*Math.cos(a), y = 50 + 38*Math.sin(a); stem.push([x,y]); const rot = deg + 90 - 25; L += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="2" ry="5" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; R += `<ellipse cx="${(100-x).toFixed(1)}" cy="${y.toFixed(1)}" rx="2" ry="5" transform="rotate(${(-rot).toFixed(0)} ${(100-x).toFixed(1)} ${y.toFixed(1)})"/>`; } const pl = stem.map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L'); const pr = stem.map(p => [(100-p[0]).toFixed(1), p[1].toFixed(1)].join(' ')).join(' L'); return `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width=".7"><path d="M${pl}"/><path d="M${pr}"/>${L}${R}</g><text x="50" y="58" text-anchor="middle" style="font-family:var(--names);font-style:var(--names-style)" font-size="24" fill="currentColor">${d.i1}&amp;${d.i2}</text></svg>`; }},
 lacre:{nome:'Selo de lacre', svg:() => { const d = pd(); return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6c9 0 13 5 20 7s13 6 15 14 6 12 4 21 1 14-5 21-8 13-16 16-14 9-22 7-16-1-22-7-14-8-16-16-5-13-4-22 0-14 6-20 10-11 18-13S41 6 50 6z" fill="currentColor"/><circle cx="50" cy="50" r="30" fill="none" stroke="var(--surface)" stroke-width="1.2" opacity=".85"/><text x="50" y="59" text-anchor="middle" style="font-family:'Cormorant Garamond',serif" font-size="26" fill="var(--surface)">${d.i1}<tspan font-size="16" style="font-style:italic">&amp;</tspan>${d.i2}</text></svg>`; }},
 arco:{nome:'Arco', svg:() => { const d = pd(); return `<svg viewBox="0 0 100 110" aria-hidden="true"><path d="M22 104V44a28 28 0 0 1 56 0v60" fill="none" stroke="currentColor" stroke-width=".9"/><text x="50" y="64" text-anchor="middle" style="font-family:'Italiana',serif" font-size="17" fill="currentColor">${d.i1} &amp; ${d.i2}</text><text x="50" y="84" text-anchor="middle" style="font-family:'Jost',sans-serif" font-size="6" letter-spacing="2" fill="currentColor">${d.curta}</text></svg>`; }},
 deco:{nome:'Art déco', svg:() => { const d = pd(); return `<svg viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="currentColor"><path d="M50 6L94 50 50 94 6 50z" stroke-width=".9"/><path d="M50 13L87 50 50 87 13 50z" stroke-width=".4"/>${[-30,-15,0,15,30].map(a => `<path d="M50 6V-4" stroke-width=".6" transform="rotate(${a} 50 50)"/>`).join('')}<text x="50" y="57" text-anchor="middle" stroke="none" fill="currentColor" style="font-family:'Jost',sans-serif" font-size="20" letter-spacing="6">${d.i1}${d.i2}</text></svg>`; }},
 linha:{nome:'Monoline moderno', svg:() => { const d = pd(); return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M20 34h60M20 66h60" stroke="currentColor" stroke-width=".6"/><text x="50" y="57" text-anchor="middle" style="font-family:'Jost',sans-serif;font-weight:300" font-size="22" letter-spacing="8" fill="currentColor">${d.i1}·${d.i2}</text></svg>`; }},
 data:{nome:'Iniciais com a data', svg:() => { const d = pd(); const [dd,mm,aa] = d.curta.split('.'); return `<svg viewBox="0 0 100 100" aria-hidden="true"><text x="24" y="66" text-anchor="middle" style="font-family:'Playfair Display',serif" font-size="46" fill="currentColor">${d.i1}</text><text x="76" y="66" text-anchor="middle" style="font-family:'Playfair Display',serif" font-size="46" fill="currentColor">${d.i2}</text><path d="M50 22v56" stroke="currentColor" stroke-width=".6"/><g style="font-family:'Jost',sans-serif" font-size="7" fill="currentColor" text-anchor="middle"><text x="50" y="40" dx="0" style="paint-order:stroke" stroke="var(--surface)" stroke-width="3">${dd}</text><text x="50" y="53" stroke="var(--surface)" stroke-width="3" style="paint-order:stroke">${mm}</text><text x="50" y="66" stroke="var(--surface)" stroke-width="3" style="paint-order:stroke">${aa}</text></g></svg>`; }},
 igreja:{nome:'Igreja do Quadrado', svg:() => { const d = pd(); return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width=".7"/><g transform="translate(20 16) scale(.5)" color="currentColor">${ART.igreja(1.8).replace(/<\/?svg[^>]*>/g,'').replace(/<path/g,'<path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"')}</g><text x="50" y="76" text-anchor="middle" style="font-family:var(--names);font-style:var(--names-style)" font-size="16" fill="currentColor">${d.i1}&amp;${d.i2}</text></svg>`; }},
 heranca:{nome:'Cardo e coqueiro', svg:() => { const d = pd(); return `<svg viewBox="0 0 100 100" aria-hidden="true"><g transform="translate(16 12) scale(.9) rotate(-18 20 40)">${ART.cardo(1.2).replace(/<\/?svg[^>]*>/g,'').replace(/<path/g,'<path fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"')}</g><g transform="translate(52 10) scale(.9) rotate(16 25 40)">${ART.coqueiro(1.2).replace(/<\/?svg[^>]*>/g,'').replace(/<path/g,'<path fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"')}</g><text x="50" y="92" text-anchor="middle" style="font-family:'Cormorant Garamond',serif" font-size="20" fill="currentColor">${d.i1}<tspan style="font-style:italic" font-size="14">&amp;</tspan>${d.i2}</text></svg>`; }}
};
window.MONOS = MONOS;
document.documentElement.style.setProperty('--deckle', DECKLE);

/* --- suíte de papelaria --- */
function suiteItens(){
  const W = wedding();
  return [
   ['save','Save the date','Data, cidade e "convite a seguir". Pode ser digital.', addMonths(W,-12), addMonths(W,-9), true],
   ['site','Site do casamento com confirmação','Hospedagem Club Med, voo, transfer, traje e RSVP. Cortesia Casar.com por 1 ano.', addMonths(W,-12), null, true],
   ['convite','Convite principal','Nomes, igreja, festa, data e hora.', addMonths(W,-4), addMonths(W,-3), true],
   ['rsvp','Cartão de confirmação ou QR','Com data-limite para responder.', addMonths(W,-4), addDays(W,-56), true],
   ['info','Cartão de informações','Hospedagem (só pelos canais oficiais do Club Med), voos para Porto Seguro, transfer e traje.', addMonths(W,-4), null, true],
   ['mapa','Mapa ilustrado','Aeroporto, igreja no Quadrado e Chez Bisutti.', addMonths(W,-4), null, false],
   ['envelope','Envelope, forro e lacre','Endereçamento em caligrafia, se quiserem.', addMonths(W,-4), null, true],
   ['padrinhos','Convite para padrinhos e madrinhas','Costuma ser entregue antes, em mãos ou numa caixa.', addMonths(W,-10), null, false],
   ['boasvindas','Cartão de boas-vindas no quarto','Vai no kit da abertura de porta do Club Med.', addDays(W,-10), null, false],
   ['programacao','Programação do fim de semana','Jantar no LUA, igreja, festa e atividades do resort.', addDays(W,-21), null, false],
   ['cerimonia','Livreto ou leque da cerimônia','Ordem da cerimônia e músicas.', addDays(W,-21), null, false],
   ['menu','Menu','O cardápio da Bisutti por etapa.', addDays(W,-21), null, true],
   ['lugar','Marcadores de lugar e mapa de mesas','Feitos depois da confirmação final.', addDays(W,-14), null, true],
   ['sinalizacao','Placas de sinalização','Boas-vindas, bar, mesa de doces, bem-casados.', addDays(W,-21), null, false],
   ['tags','Tags das lembranças','Com o monograma.', addDays(W,-21), null, false],
   ['agradecimento','Cartões de agradecimento','Enviados até 2 ou 3 meses depois.', addMonths(W,1), null, true]
  ];
}

/* --- textos prontos --- */
function textos(){
  const d = pd(), c = cfg();
  const hora = c.cerimoniaHora ? ` às ${c.cerimoniaHora.replace(':','h')}` : '';
  const prazo = fmtD(addDays(wedding(),-56),{day:'numeric',month:'long'});
  const n1 = nameOf(0), n2 = nameOf(1), ext = fmtD(wedding(),{day:'numeric',month:'long',year:'numeric'}), sem = fmtD(wedding(),{weekday:'long'});
  return [
   ['moderno','Moderno, o casal convida',`${n1} & ${n2}\n\nconvidam para a celebração do seu casamento\n\n${sem}, ${ext}\n\nCerimônia${hora}\nIgreja São João Batista · Quadrado de Trancoso\n\nFesta às ${c.hora.replace(':','h')}\n${c.local}\n\nTrancoso · Bahia`],
   ['familias','Com as famílias',`Juntamente com suas famílias,\n${n1} e ${n2}\ntêm a alegria de convidar para o seu casamento\n\n${sem}, ${ext}\nTrancoso · Bahia`],
   ['pais','Tradicional, os pais convidam',`[Nome da mãe e do pai da noiva]        [Nome da mãe e do pai do noivo]\n\nconvidam para o casamento de seus filhos\n\n${n1} e ${n2}\n\n${sem}, ${ext}\nIgreja São João Batista · Quadrado de Trancoso\n\nApós a cerimônia, os noivos recebem para a festa no ${c.local}`],
   ['bilingue','Bilíngue (português e inglês)',`${n1} & ${n2}\n\ntêm a alegria de convidar para o seu casamento\nrequest the pleasure of your company at their wedding\n\n${sem}, ${ext}\n${d.diaEN}, the fourteenth of ${d.mesEN}, two thousand and twenty-eight\n\nTrancoso · Bahia · Brasil`],
   ['minimo','Mínimo',`${n1} e ${n2}\n${d.curta.replace(/\./g,' · ')}\nTrancoso`],
   ['save','Save the date',`Reserve a data · Save the date\n\n${n1} & ${n2}\n${ext}\nTrancoso · Bahia · Brasil\n\nConvite a seguir · Formal invitation to follow`],
   ['info','Cartão de informações',`Como chegar\nVoos para o aeroporto de Porto Seguro (BPS). O Club Med Trancoso fica a cerca de 1h30 de carro.\n\nHospedagem\nClub Med Trancoso, com condição especial para os nossos convidados. Reserve só pelos canais oficiais:\nreservas.chezbisutti.br@clubmed.com · (11) 2126-9600, ramal 2\n\nTraje\nEsporte fino. A noite em julho é fresca (cerca de 19 °C) e o Quadrado tem gramado.\n\nConfirmação\nAté ${prazo} pelo nosso site ou pelo QR code.`]
  ];
}

/* --- guia de papelaria (resumo da pesquisa) --- */
const PAP_GUIA = [
 ['Técnicas de impressão', `<ul><li><b>Letterpress (tipografia):</b> uma matriz de metal pressiona a tinta e marca o papel. É a técnica mais associada ao luxo discreto. Pede papel grosso de algodão. Nos EUA, custa de 6 a 15 dólares por cartão.</li><li><b>Relevo seco:</b> marca o papel em relevo sem tinta. Perfeito para o monograma.</li><li><b>Hot stamping:</b> película metálica aplicada com calor e pressão (dourado, prata, cobre, rosé). No Brasil há opções a partir de R$ 2,50 a R$ 3,50 por unidade em gráficas on-line, conforme a quantidade.</li><li><b>Relevo metálico:</b> combina o brilho do hot stamping com o relevo.</li><li><b>Termografia:</b> relevo brilhante feito com pó e forno. É a alternativa econômica ao letterpress.</li><li><b>Serigrafia:</b> tinta espessa, leve relevo e brilho, feita de forma artesanal.</li><li><b>Impressão digital:</b> a mais barata e a única viável para fotos e aquarelas com muitas cores.</li><li><b>Corte e gravação a laser:</b> recortes delicados no papel, gravação em acrílico ou madeira.</li></ul>`],
 ['Papéis e materiais', `<ul><li><b>Algodão:</b> macio, encorpado, o favorito para letterpress.</li><li><b>Artesanal com borda rasgada:</b> textura natural, cada folha é única.</li><li><b>Vegetal (translúcido):</b> como camada por cima, faixa ou envelope.</li><li><b>Perolado e metalizado:</b> brilho suave, combina com prata.</li><li><b>Tingido escuro:</b> verde-profundo, azul-marinho ou preto com foil.</li><li><b>Acrílico:</b> cerca de 3 mm, impresso ou gravado a laser, vira lembrança.</li><li><b>Papel semente:</b> nasce flor depois. De R$ 3,60 a R$ 20 por convite em fornecedores brasileiros.</li><li><b>Linho e tecido:</b> envelopes e capas.</li></ul>`],
 ['Acabamentos', `<ul><li>Lacre de cera com as iniciais, às vezes com um raminho seco embaixo.</li><li>Forro no envelope (aqui, o tartan do David é uma ideia bonita).</li><li>Faixa (belly band) de vegetal ou papel com ilustração.</li><li>Fita de seda tingida à mão.</li><li>Bordas pintadas na cor da paleta.</li><li>Endereçamento em caligrafia.</li></ul>`],
 ['Tendências para 2027', `<ul><li>O minimalismo continua, mas com textura: algodão, relevo ou uma camada de vegetal.</li><li>Luxo é contenção: paleta de uma ou duas cores, bastante espaço em branco e um único acabamento de destaque.</li><li>Prata ganhando espaço do dourado, que vira uma escolha intencional.</li><li>Papel tátil: borda rasgada e relevo seco.</li><li>Recortes em arco e formas orgânicas.</li><li>Ilustração do lugar do casamento.</li><li>Papel ligado ao digital: site, confirmação on-line e mapas por QR code.</li></ul><p class="muted small">Baseado em blogs de papelarias e relatórios de tendências. São previsões, não dados medidos.</p>`],
 ['Etiqueta e textos', `<ul><li><b>Quem convida:</b> o tradicional são os pais. Quando o casal organiza e paga, os noivos convidam, muitas vezes com "juntamente com suas famílias". Os nomes dos pais são opcionais.</li><li>Pais falecidos podem continuar no convite, com "in memoriam".</li><li>Pela tradição, o nome da noiva vem antes.</li><li><b>Conteúdo mínimo:</b> nomes, local, data e hora da cerimônia, local e hora da festa, e como confirmar presença.</li><li><b>Bilíngue:</b> não há regra fixa. Mantenha a mesma estrutura nas duas línguas e peça revisão a alguém da família do David.</li><li>Como vocês ainda aguardam a resposta da igreja, só imprimam o convite depois de confirmar onde será a cerimônia.</li></ul>`],
 ['Cronograma e quantidade', `<ul><li><b>Save the date:</b> de 12 a 9 meses antes, por ser no destino (julho a outubro de 2027).</li><li><b>Encomendar o convite:</b> cerca de 6 meses antes. Letterpress e peças artesanais levam semanas.</li><li><b>Enviar o convite:</b> de 4 a 3 meses antes (março a abril de 2028).</li><li><b>Prazo para confirmar:</b> por volta de 8 semanas antes.</li><li><b>Quantidade:</b> um convite por casal ou família, não por pessoa. Para 225 convidados, estime de 110 a 130 convites, mais 10% de reserva para erros e convidados de última hora.</li></ul>`],
 ['Custos no Brasil', `<ul><li>Faixa média nacional: cerca de R$ 3,50 a R$ 8 por convite simples (estimativa sem data).</li><li>Ateliês de papelaria fina em São Paulo anunciam de R$ 3,20 a R$ 200 por convite, conforme papel, técnica e camadas.</li><li>Calígrafos em São Paulo: a partir de cerca de R$ 200 pelo serviço.</li><li>Para comparar, peça o orçamento da mesma quantidade e do mesmo papel em técnicas diferentes.</li></ul>`],
 ['Ateliês para pesquisar', `<ul><li><b>São Paulo:</b> Ateliê Giedry Freitas (tipografia e digital), Daniela David Ateliê (papelaria completa), Sonho em Papel (caligrafia, serigrafia e hot stamping), Gráfica Lux Relevo (relevo).</li><li><b>Letterpress:</b> Alma Gráfica (Paraná).</li><li><b>Caligrafia:</b> Helena Nadal Caligrafia, SL Caligrafia, Furdiani Caligrafia Artística, Eli Mathias Atelier.</li><li><b>Corte a laser:</b> Ateliê Maria Bonita.</li></ul><p class="muted small">Encontrados no diretório Casamentos.com.br. Não são indicações testadas: veja o portfólio e peça amostras.</p>`],
 ['Monograma e brasão', `<ul><li><b>Estilos:</b> entrelaçado, empilhado, com e comercial, dentro de moldura ou guirlanda, minimalista moderno e brasão.</li><li>Combine o estilo com o casamento: um brasão muito ornamentado destoa de um casamento minimalista.</li><li>Muitos casais usam o brasão completo no convite e na sinalização, e uma versão simples em guardanapos, tags e lacre.</li><li><b>Brasão do casamento:</b> é um desenho criado para vocês, com 2 a 4 símbolos (aqui, o cardo da Escócia, o coqueiro da Bahia e a igreja).</li><li><b>Atenção com brasões escoceses:</b> na Escócia, um brasão de armas pertence a uma única pessoa e é registrado pela Court of the Lord Lyon. Usar um brasão de armas sem autorização é crime desde 1592. Membros de um clã podem usar o emblema do clã (crest badge), mas não as armas do chefe. Por isso, criem um símbolo próprio do casamento em vez de copiar um brasão de família.</li></ul>`]
];
const PAP_FONTES = [
 ['Casamentos.com.br · Gráfica Lux Relevo','https://www.casamentos.com.br/convites-de-casamento/grafica-lux-relevo--e68749'],
 ['Vestida de Noiva · guia do convite de casamento','https://vestidadenoiva.com/guia-do-convite-de-casamento/'],
 ['Printi · convite com hot stamping','https://www.printi.com.br/convite-hot-stamping/'],
 ['Arthur Caliman · papel para convite','https://www.arthurcaliman.com.br/papel-para-convite-de-casamento/'],
 ['Ateliê da Lola · como escolher o convite','https://blog.ateliedalola.com.br/convite-de-casamento-personalizado-como-escolher-o-modelo-ideal/'],
 ['Cronoshare · quanto custa o convite','https://www.cronoshare.com.br/quanto-custa/convite-casamento'],
 ['Casamentos.com.br · convites em acrílico','https://www.casamentos.com.br/artigos/convites-de-casamento-em-acrilico-apostem-nessa-tendencia--c8981'],
 ['Casamentos.com.br · ordem dos nomes no convite','https://www.casamentos.com.br/artigos/qual-e-a-ordem-dos-nomes-em-convites-de-casamento--c5190'],
 ['Casamentos.com.br · o que escrever no convite','https://www.casamentos.com.br/artigos/o-que-escrever-no-convite-do-casamento--c4943'],
 ['Casamentos.com.br · convites em São Paulo','https://www.casamentos.com.br/convites-de-casamento/sao-paulo'],
 ['Stationery HQ · tendências de papelaria 2027','https://www.stationeryhq.com/pages/wedding-stationery-trends-2027-the-future-of-invitation'],
 ['Bell Invito · tendências de convites de luxo','https://www.bellinvito.com/new-luxury-social-intelligence/8-new-trends-for-luxury-wedding-invitations'],
 ['Paperlust · tendências de convites 2027','https://paperlust.co/blog/wedding-invitation-trends-2027/'],
 ['Paperlust · guia de monograma e brasão','https://paperlust.co/blog/?p=17726'],
 ['Wedvibes · criando brasões e monogramas','https://wedvibes.media/ideas-advice/the-art-of-creating-wedding-crests-and-monograms/'],
 ['Bella Figura · convites com vegetal e aquarela','https://www.bellafigura.com/pressd/tag/vellum'],
 ['Joy · QR code e RSVP on-line','https://withjoy.com/blog/seamlessly-integrate-online-rsvps-with-your-wedding-stationery'],
 ['National Records of Scotland · uso de brasões','https://nrscotland.gov.uk/research/guides/coats-of-arms/usage-of-coats-of-arms'],
 ['Wikipedia · Scottish crest badge','https://en.wikipedia.org/wiki/Scottish_crest_badge']
];

/* ---------------- tela ---------------- */
const papDoc = id => S.data.papelaria ? (S.data.papelaria.get(id) || {}) : {};
function favBtn(id){ const f = papDoc(id).fav; return `<button class="pick" data-act="pap-fav" data-id="${esc(id)}" aria-pressed="${!!f}">${f ? '♥ favorito' : '♡ favoritar'}</button>`; }
function notaBox(id){ const n = papDoc(id).nota || ''; return UI.notesOpen.has('pap-'+id) ? `<textarea class="inp" data-save="pap-nota" data-id="${esc(id)}" placeholder="O que gostei, o que mudaria, que ateliê faz...">${esc(n)}</textarea>` : `<div class="row">${n?`<span class="note grow">“${esc(n)}”</span>`:''}<button class="note-btn" data-act="pap-nota-open" data-id="${esc(id)}">${n?'editar nota':'+ nota'}</button></div>`; }
const CUSTO = n => `<span class="cost" aria-label="custo ${n} de 4">${'$'.repeat(n)}<span>${'$'.repeat(4-n)}</span></span>`;

VIEWS.papelaria = () => {
  const tab = UI.papTab || 'convites', d = pd();
  const tabs = [['convites','Convites'],['monograma','Monograma e brasão'],['suite','Suíte'],['textos','Textos'],['guia','Guia']];
  let body = '';
  if (tab === 'convites'){
    const F = UI.papFiltro || 'todos';
    const list = MODELOS.filter(m => F === 'todos' || (F === 'fav' && papDoc(m.id).fav));
    body = `<p class="small muted" style="margin:0">${MODELOS.length} caminhos, do mais clean ao mais inesperado, já com os nomes de vocês e a data. São prévias para inspirar a conversa com o ateliê. Marque os favoritos e anote o que gostou.</p>
    <div class="chips"><button class="chip" data-act="pap-filtro" data-v="todos" aria-pressed="${F==='todos'}">Todos</button><button class="chip" data-act="pap-filtro" data-v="fav" aria-pressed="${F==='fav'}">♥ Favoritos</button></div>
    ${list.length ? list.map(m => `<section class="card pap-card"><div class="inv-stage ${m.backdrop||''} ${m.shape||''}">${m.render(d)}</div>
      <div class="row between"><h3>${esc(m.nome)}</h3>${favBtn(m.id)}</div>
      <dl class="pap-kv"><dt>Estilo</dt><dd>${esc(m.estilo)}</dd><dt>Papel</dt><dd>${esc(m.papel)}</dd><dt>Técnica</dt><dd>${esc(m.tecnica)}</dd><dt>Custo</dt><dd>${CUSTO(m.custo)}</dd></dl>
      <p class="small" style="margin:0">${esc(m.porque)}</p>${notaBox(m.id)}</section>`).join('') : '<section class="card empty"><h3>Nenhum favorito ainda</h3><p class="small">Toque em ♡ nos modelos que você gostar.</p></section>'}
    <section class="card"><h3>Mais ideias, das clássicas às inimagináveis</h3><div class="list">${MAIS_IDEIAS.map(([t,x],i) => `<div class="item"><div class="grow"><div class="t">${esc(t)}</div><div class="d">${esc(x)}</div></div>${favBtn('ideia-'+i)}</div>`).join('')}</div></section>`;
  } else if (tab === 'monograma'){
    const a = ap();
    body = `<p class="small muted" style="margin:0">Opções de monograma e um brasão do casamento com o cardo da Escócia e o coqueiro da Bahia. Eles usam as cores e a fonte dos nomes do tema escolhido. Toque em "usar no app" para experimentar no topo e na tela inicial.</p>
    <div class="mono-grid">${Object.entries(MONOS).map(([id,m]) => `<div class="mono-card ${a.monoEstilo===id && !a.monograma ? 'sel' : ''}"><div class="mono-art ${id==='brasao'?'tall':''}">${m.svg()}</div><b>${esc(m.nome)}</b><div class="row" style="justify-content:center">${favBtn('mono-'+id)}</div><button class="btn ${a.monoEstilo===id && !a.monograma ? '' : 'line'} sm" data-act="pap-usar-mono" data-v="${id}">${a.monoEstilo===id && !a.monograma ? 'em uso' : 'usar no app'}</button></div>`).join('')}</div>
    ${a.monograma ? `<div class="alert info"><span class="dot"></span><div><b>Você enviou uma imagem de monograma</b><p>Ela tem prioridade. Para testar estes, tire a imagem em Aparência.</p></div></div>` : ''}
    ${a.monoEstilo ? `<button class="btn line" data-act="pap-usar-mono" data-v="">Voltar para as iniciais simples</button>` : ''}
    <section class="card"><h3>Sobre brasões</h3><p class="small" style="margin:0">O brasão aqui é um símbolo do casamento, não um brasão de família. Na Escócia, brasões de armas pertencem a uma pessoa, são registrados pela Court of the Lord Lyon, e usá-los sem autorização é crime. Membros de um clã podem usar o emblema do clã (crest badge). Se a família do David tiver um, ele pode entrar no forro do envelope ou num detalhe, com cuidado.</p></section>`;
  } else if (tab === 'suite'){
    const sel = papDoc('suite').itens || {};
    const its = suiteItens();
    const isSel = it => sel[it[0]] !== undefined ? sel[it[0]] : it[5];
    body = `<p class="small muted" style="margin:0">Todas as peças que um casamento no destino pode ter. Marque as que vocês querem. As datas são calculadas a partir de ${esc(fmtD(wedding()))}.</p>
    <section class="card"><div class="list">${its.map(it => `<label class="item" style="cursor:pointer"><input type="checkbox" class="check" data-save="pap-suite" data-k="${it[0]}" ${isSel(it)?'checked':''}><div class="grow"><div class="t">${esc(it[1])}</div><div class="d">${esc(it[2])}</div><div class="d">${it[4] ? 'Enviar de ' + esc(fmtD(it[3],{month:'short',year:'numeric'})) + ' a ' + esc(fmtD(it[4],{day:'numeric',month:'short',year:'numeric'})) : 'Pronto até ' + esc(fmtD(it[3],{day:'numeric',month:'short',year:'numeric'}))}</div></div></label>`).join('')}</div></section>
    <section class="card"><h3>Quantidade</h3><p class="small" style="margin:0">Um convite por casal ou família. Com ${cfg().convidados} convidados, estime de ${Math.round(cfg().convidados*0.5)} a ${Math.round(cfg().convidados*0.58)} convites, mais 10% de reserva.</p></section>`;
  } else if (tab === 'textos'){
    body = `<p class="small muted" style="margin:0">Modelos de texto já com os nomes de vocês e a data. Copie e adapte. Só imprimam depois de confirmar onde será a cerimônia.</p>
    ${textos().map(([id,t,x]) => `<section class="card"><div class="row between"><h3>${esc(t)}</h3>${favBtn('txt-'+id)}</div><pre class="sel txt">${esc(x)}</pre><button class="btn ghost sm" data-act="pap-copiar" data-id="${id}" style="align-self:flex-start">Copiar</button></section>`).join('')}`;
  } else {
    body = `<section class="card guide">${PAP_GUIA.map(([t,h],i) => `<details ${i===0?'open':''}><summary>${esc(t)}</summary><div class="prose">${h}</div></details>`).join('')}</section>
    <section class="card"><h3>Fontes consultadas</h3><ul class="src prose">${PAP_FONTES.map(([t,u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ul><p class="small muted" style="margin:0">Pesquisa de outubro de 2026. Preços e prazos são referências. Confirme com cada ateliê.</p></section>`;
  }
  return `<div class="chips">${tabs.map(([k,l]) => `<button class="chip" data-act="pap-tab" data-v="${k}" aria-pressed="${tab===k}">${l}</button>`).join('')}</div>${body}`;
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act^="pap-"]'); if (!el) return;
  const id = el.dataset.id;
  switch (el.dataset.act){
    case 'pap-tab': UI.papTab = el.dataset.v; render(); window.scrollTo(0,0); break;
    case 'pap-filtro': UI.papFiltro = el.dataset.v; render(); break;
    case 'pap-fav': { const cur = papDoc(id); save('papelaria', id, {...cur, fav: !cur.fav}); break; }
    case 'pap-nota-open': UI.notesOpen.add('pap-'+id); render(); setTimeout(() => document.querySelector(`textarea[data-save="pap-nota"][data-id="${CSS.escape(id)}"]`)?.focus(), 30); break;
    case 'pap-usar-mono': setAp({monoEstilo: el.dataset.v}); toast(el.dataset.v ? 'Monograma aplicado no app' : 'Voltou para as iniciais'); break;
    case 'pap-copiar': { const t = textos().find(x => x[0] === id); if (t) copyText(t[2], el); break; }
  }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.save === 'pap-nota'){ const cur = papDoc(el.dataset.id); if ((cur.nota||'') !== el.value.trim()) save('papelaria', el.dataset.id, {...cur, nota: el.value.trim()}); UI.notesOpen.delete('pap-'+el.dataset.id); }
  if (el.dataset.save === 'pap-suite'){ const cur = papDoc('suite'); save('papelaria', 'suite', {...cur, itens: {...(cur.itens||{}), [el.dataset.k]: el.checked}}); }
});
