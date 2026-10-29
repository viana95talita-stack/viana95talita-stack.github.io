/* ================================================================
   APARÊNCIA: temas, fontes, cores, monograma e foto do casal.
   Tudo fica em config/aparencia, entra no backup e muda na hora.
   ================================================================ */
const FONTES = {
  display:[['Cormorant Garamond','Cormorant'],['Playfair Display','Playfair'],['Bodoni Moda','Bodoni'],['Marcellus','Marcellus'],['Italiana','Italiana'],['Jost','Jost'],['Montserrat','Montserrat']],
  body:[['Jost','Jost'],['Lato','Lato'],['Montserrat','Montserrat'],['Josefin Sans','Josefin Sans'],['DM Sans','DM Sans'],['Karla','Karla']],
  names:[['Pinyon Script','Pinyon Script',''],['Great Vibes','Great Vibes',''],['Allura','Allura',''],['Cormorant Garamond','Cormorant itálico','italic'],['Playfair Display','Playfair itálico','italic'],['Bodoni Moda','Bodoni itálico','italic'],['Italiana','Italiana','']]
};
const FALLBACK = {display:"Georgia, 'Times New Roman', serif", body:"system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", names:'Georgia, serif'};

const TEMAS = [
  {id:'areia',nome:'Areia',desc:'Off-white, preto suave e dourado de areia',bg:'#FAF8F5',surface:'#FFFFFF',ink:'#2E2925',primary:'#2E2925',accent:'#B39B7D',display:'Cormorant Garamond',body:'Jost',names:'Pinyon Script'},
  {id:'salvia',nome:'Sálvia',desc:'Branco com verde-sálvia e bege',bg:'#F6F7F3',surface:'#FFFFFF',ink:'#27302A',primary:'#6F8A76',accent:'#C8B89A',display:'Playfair Display',body:'Lato',names:'Great Vibes'},
  {id:'trancoso',nome:'Falésia',desc:'Tons de terra das falésias de Trancoso',bg:'#FBF7F3',surface:'#FFFFFF',ink:'#3A2C26',primary:'#B0664B',accent:'#E3C3AE',display:'Marcellus',body:'Karla',names:'Allura'},
  {id:'quadrado',nome:'Quadrado',desc:'Branco da igrejinha com azul',bg:'#F5F8FB',surface:'#FFFFFF',ink:'#1F2D3A',primary:'#3F5F80',accent:'#B8C9DA',display:'Bodoni Moda',body:'Montserrat',names:'Pinyon Script'},
  {id:'rose',nome:'Rosé',desc:'Rosa antigo delicado',bg:'#FCF7F6',surface:'#FFFFFF',ink:'#3B2A2C',primary:'#A9767C',accent:'#E9D3D1',display:'Cormorant Garamond',body:'Josefin Sans',names:'Great Vibes'},
  {id:'pb',nome:'Preto e branco',desc:'Minimalismo absoluto',bg:'#FFFFFF',surface:'#FFFFFF',ink:'#111111',primary:'#111111',accent:'#9A9A9A',display:'Italiana',body:'DM Sans',names:'Bodoni Moda',namesStyle:'italic'},
  {id:'mata',nome:'Mata',desc:'Verde-mata e terracota (o visual anterior)',bg:'#F3F4EF',surface:'#FFFFFF',ink:'#1B2520',primary:'#3D5A47',accent:'#B4583F',display:'Cormorant Garamond',body:'Karla',names:'Cormorant Garamond',namesStyle:'italic'},
  {id:'noite',nome:'Noite',desc:'Escuro, com dourado e azul acinzentado',escuro:true,bg:'#15171B',surface:'#1D2025',ink:'#ECE8E2',primary:'#D9C4A3',accent:'#8FA5B5',display:'Playfair Display',body:'Lato',names:'Pinyon Script'}
];
const AP_PADRAO = {tema:'areia', modo:'auto', fDisplay:'', fBody:'', fNames:'', fNamesStyle:'', custom:false, cores:null, paleta:[], monograma:'', monoNoTopo:true, capa:'', capaFundo:false, fundoIntensidade:14, capaFoco:'center', cantos:'suave', cartoes:'borda', tamanho:'normal'};
const ap = () => ({...AP_PADRAO, ...(S.data.config.get('aparencia') || {})});
function setAp(patch){ save('config','aparencia',{...(S.data.config.get('aparencia')||{}), ...patch}); applyTheme(); }

/* cores */
const hx = h => { h = String(h||'#000').replace('#',''); if (h.length===3) h = h.split('').map(c=>c+c).join(''); const n = parseInt(h,16) || 0; return [n>>16&255, n>>8&255, n&255]; };
const toHex = ([r,g,b]) => '#' + [r,g,b].map(v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mix = (a,b,t) => { const A = hx(a), B = hx(b); return toHex(A.map((v,i) => v + (B[i]-v)*t)); };
const lum = h => { const c = hx(h).map(v => { v/=255; return v <= .03928 ? v/12.92 : Math.pow((v+.055)/1.055, 2.4); }); return .2126*c[0] + .7152*c[1] + .0722*c[2]; };
const contrast = (a,b) => { const x = lum(a), y = lum(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
const inkOn = c => contrast(c,'#FFFFFF') >= contrast(c,'#141414') ? '#FFFFFF' : '#141414';
/* garante que uma cor de texto seja legível sobre o fundo */
function legible(c, bg, min=3.2){ let x = c; const towards = lum(bg) > .4 ? '#000000' : '#FFFFFF'; for (let i=0; i<12 && contrast(x,bg) < min; i++) x = mix(x, towards, .15); return x; }

function temaAtual(){
  const a = ap();
  const base = {...(TEMAS.find(t => t.id === a.tema) || TEMAS[0])};
  if (a.custom && a.cores){ Object.assign(base, a.cores); }
  return base;
}
function paleta(t, escuro){
  let {bg, surface, ink, primary, accent} = t;
  if (escuro && !t.escuro){
    bg = mix('#131313', primary, .07); surface = mix('#1B1B1B', primary, .07);
    ink = mix('#EEEBE6', accent, .05); primary = mix(primary, '#FFFFFF', lum(primary) < .2 ? .45 : .15); accent = mix(accent, '#FFFFFF', .15);
  }
  if (!escuro && t.escuro){
    const p = primary; bg = '#F8F6F2'; surface = '#FFFFFF'; ink = '#1E1F22'; primary = mix(p, '#000000', .35);
  }
  const dark = lum(bg) < .3;
  surface = surface || (dark ? mix(bg,'#FFFFFF',.05) : '#FFFFFF');
  const prim = legible(primary, bg, 2.6);
  const sem = dark ? {ok:'#7CC79A',warn:'#E2B25C',crit:'#EE8A80'} : {ok:'#3F7D58',warn:'#946419',crit:'#A8463F'};
  return {
    '--bg':bg, '--surface':surface, '--surface2':mix(bg, ink, dark ? .08 : .045), '--ink':ink, '--muted':mix(ink, bg, .42), '--line':mix(bg, ink, dark ? .16 : .11),
    '--mata':prim, '--mata-ink':inkOn(prim), '--mata-soft':mix(bg, prim, dark ? .22 : .12),
    '--falesia':legible(accent, bg, 2.2), '--falesia-soft':mix(bg, accent, dark ? .25 : .22),
    '--ok':sem.ok, '--ok-soft':mix(bg, sem.ok, .16), '--warn':sem.warn, '--warn-soft':mix(bg, sem.warn, .18), '--crit':sem.crit, '--crit-soft':mix(bg, sem.crit, .15),
    '--btn':prim, '--btn-ink':inkOn(prim), '--color-scheme': dark ? 'dark' : 'light'
  };
}
const escuroAgora = () => { const a = ap(), t = temaAtual(); if (t.escuro && a.modo === 'auto') return true; return a.modo === 'escuro' || (a.modo === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches); };
const fam = (name, kind) => `'${name}', ${FALLBACK[kind]}`; /* aspas simples: vai dentro de style="..." */
function applyTheme(){
  const a = ap(), t = temaAtual(), esc = escuroAgora();
  const P = paleta(t, esc);
  const r = document.documentElement;
  Object.entries(P).forEach(([k,v]) => r.style.setProperty(k, v));
  r.style.colorScheme = P['--color-scheme'];
  r.style.setProperty('--display', fam(a.fDisplay || t.display, 'display'));
  r.style.setProperty('--body', fam(a.fBody || t.body, 'body'));
  r.style.setProperty('--names', fam(a.fNames || t.names, 'names'));
  r.style.setProperty('--names-style', (a.fNames ? a.fNamesStyle : t.namesStyle) || 'normal');
  r.style.setProperty('--r', {reto:'4px', suave:'14px', redondo:'24px'}[a.cantos] || '14px');
  r.dataset.cartoes = a.cartoes;
  r.style.fontSize = {pequeno:'14px', normal:'15px', grande:'17px'}[a.tamanho] || '15px';
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', P['--bg']));
  /* foto de fundo do app */
  const bgEl = document.getElementById('bgphoto');
  if (bgEl){
    if (a.capa && a.capaFundo){
      urlFoto(a.capa).then(u => { if (u){ bgEl.style.backgroundImage = `url("${u}")`; bgEl.style.opacity = String((+a.fundoIntensidade||14)/100); bgEl.hidden = false; } });
    } else bgEl.hidden = true;
  }
}
async function urlFoto(id){
  if (!id) return null;
  if (!URLS.has(id)){ const b = await fotoGet(id); if (b) URLS.set(id, URL.createObjectURL(b)); }
  return URLS.get(id) || null;
}
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { applyTheme(); });

const iniciais = () => { const n = (cfg().nomes||'').split('&').map(s => s.trim()).filter(Boolean); return n.length >= 2 ? `${n[0][0]}&${n[1][0]}` : (n[0]||'T')[0]; };
function monoHtml(cls){
  const a = ap();
  return a.monograma ? `<img class="${cls} mono-img" data-foto="${esc(a.monograma)}" alt="Monograma">` : `<span class="${cls} mono-txt">${esc(iniciais())}</span>`;
}

/* ---------------- tela Aparência ---------------- */
function temaCard(t, sel){
  const P = paleta(t, !!t.escuro);
  return `<button class="theme-card ${sel?'sel':''}" data-act="ap-tema" data-v="${t.id}" style="background:${P['--bg']};color:${P['--ink']};border-color:${sel?P['--mata']:P['--line']}">
    <span class="tc-names" style="font-family:${fam(t.names,'names')};font-style:${t.namesStyle||'normal'};color:${P['--mata']}">${esc(iniciais())}</span>
    <span class="tc-title" style="font-family:${fam(t.display,'display')}">${esc(t.nome)}</span>
    <span class="tc-desc" style="font-family:${fam(t.body,'body')};color:${P['--muted']}">${esc(t.desc)}</span>
    <span class="tc-sw">${[t.bg, t.primary, t.accent, t.ink].map(c => `<i style="background:${c};border-color:${P['--line']}"></i>`).join('')}</span>
    ${sel ? `<span class="tc-check" style="background:${P['--mata']};color:${P['--mata-ink']}">em uso</span>` : ''}
  </button>`;
}
function fonteLista(kind, atual, temaVal){
  const nomes = cfg().nomes || 'Talita & David';
  return FONTES[kind].map(([f, label, style]) => {
    const on = (atual ? atual === f && (kind !== 'names' || (ap().fNamesStyle||'') === (style||'')) : temaVal === f && kind !== 'names') || (!atual && kind==='names' && temaVal===f && (temaAtual().namesStyle||'')===(style||''));
    return `<button class="font-row ${on?'sel':''}" data-act="ap-fonte" data-k="${kind}" data-v="${esc(f)}" data-style="${style||''}"><span style="font-family:${fam(f,kind)};font-style:${style||'normal'}">${kind==='body' ? 'Lista de convidados, orçamento e tarefas' : esc(nomes)}</span><small>${esc(label)}</small></button>`;
  }).join('');
}
VIEWS.aparencia = () => {
  const a = ap(), t = temaAtual();
  const chip = (k, v, l) => `<button class="chip" data-act="ap-set" data-k="${k}" data-v="${v}" aria-pressed="${a[k]===v}">${l}</button>`;
  const cores = a.cores || {bg:t.bg, ink:t.ink, primary:t.primary, accent:t.accent};
  const corIn = (k, l) => `<label class="color-field"><input type="color" data-save="ap-cor" data-k="${k}" value="${esc(cores[k])}"><span><b>${l}</b><small class="num">${esc(cores[k].toUpperCase())}</small></span></label>`;
  return `
  <section class="card">
    <h2>Temas</h2>
    <p class="small muted" style="margin:0">Toque para experimentar. Muda na hora, e você pode trocar quantas vezes quiser.</p>
    <div class="theme-grid">${TEMAS.map(x => temaCard(x, !a.custom && a.tema === x.id)).join('')}</div>
  </section>

  <section class="card">
    <h3>Claro ou escuro</h3>
    <div class="chips">${chip('modo','auto','Automático')}${chip('modo','claro','Sempre claro')}${chip('modo','escuro','Sempre escuro')}</div>
    <p class="small muted" style="margin:0">Automático segue o modo do seu iPhone.</p>
  </section>

  <section class="card">
    <h3>Monograma</h3>
    <div class="row">
      <div class="mono-prev">${monoHtml('mono-lg')}</div>
      <div class="stack grow">
        <label class="btn ghost sm" style="cursor:pointer">${a.monograma?'Trocar imagem':'Enviar o monograma'}<input type="file" accept="image/*" data-ap-upload="monograma" hidden></label>
        ${a.monograma ? `<button class="btn line sm" data-act="ap-del" data-k="monograma">Voltar para as iniciais</button>` : ''}
      </div>
    </div>
    <p class="small muted" style="margin:0">Enquanto vocês não têm um, o app mostra as iniciais na fonte dos nomes. Quando tiverem, envie a imagem, de preferência em PNG com fundo transparente.</p>
    <label class="row small"><input type="checkbox" class="check" data-save="ap-bool" data-k="monoNoTopo" ${a.monoNoTopo?'checked':''}> Mostrar o monograma no topo da tela inicial</label>
  </section>

  <section class="card">
    <h3>Foto de vocês</h3>
    ${a.capa ? `<img class="cover-prev" data-foto="${esc(a.capa)}" alt="Foto do casal" style="object-position:${a.capaFoco}">` : `<div class="cover-empty">Nenhuma foto ainda</div>`}
    <div class="row">
      <label class="btn ghost sm" style="cursor:pointer">${a.capa?'Trocar foto':'Escolher foto'}<input type="file" accept="image/*" data-ap-upload="capa" hidden></label>
      ${a.capa ? `<button class="btn line sm" data-act="ap-del" data-k="capa">Tirar foto</button>` : ''}
    </div>
    ${a.capa ? `
      <div class="field"><label>Enquadramento</label><div class="chips">${chip('capaFoco','top','Mais em cima')}${chip('capaFoco','center','Centro')}${chip('capaFoco','bottom','Mais embaixo')}</div></div>
      <label class="row small"><input type="checkbox" class="check" data-save="ap-bool" data-k="capaFundo" ${a.capaFundo?'checked':''}> Usar também como fundo suave do app inteiro</label>
      ${a.capaFundo ? `<div class="field"><label for="ap-int">Intensidade do fundo: ${a.fundoIntensidade}%</label><input id="ap-int" type="range" min="5" max="40" step="1" value="${a.fundoIntensidade}" data-save="ap-num" data-k="fundoIntensidade"></div>` : ''}
    ` : '<p class="small muted" style="margin:0">A foto aparece em destaque na tela inicial. Fica guardada só no seu celular.</p>'}
  </section>

  <section class="card">
    <h3>Fontes</h3>
    <div class="field"><label>Nomes e monograma</label><div class="font-list">${fonteLista('names', a.fNames, t.names)}</div></div>
    <div class="field"><label>Títulos</label><div class="font-list">${fonteLista('display', a.fDisplay, t.display)}</div></div>
    <div class="field"><label>Textos</label><div class="font-list">${fonteLista('body', a.fBody, t.body)}</div></div>
    ${(a.fNames||a.fDisplay||a.fBody) ? `<button class="btn line sm" data-act="ap-fontes-tema">Usar as fontes do tema</button>` : ''}
    <div class="field"><label>Tamanho do texto</label><div class="chips">${chip('tamanho','pequeno','Menor')}${chip('tamanho','normal','Normal')}${chip('tamanho','grande','Maior')}</div></div>
  </section>

  <section class="card">
    <h3>Cores do casamento</h3>
    <p class="small muted" style="margin:0">Quando vocês definirem a paleta, coloque as cores aqui e o app inteiro passa a usá-las. Começa com as cores do tema atual.</p>
    <label class="row small"><input type="checkbox" class="check" data-save="ap-bool" data-k="custom" ${a.custom?'checked':''}> Usar minhas cores</label>
    ${a.custom ? `<div class="color-grid">${corIn('bg','Fundo')}${corIn('ink','Texto')}${corIn('primary','Cor principal')}${corIn('accent','Destaque')}</div>` : ''}
    <div class="field"><label>Paleta do casamento (até 8 cores, para consulta)</label>
      <div class="palette">${(a.paleta||[]).map((c,i) => `<button class="sw" style="background:${esc(c)}" data-act="ap-pal-del" data-i="${i}" aria-label="Remover cor ${esc(c)}"><span>${esc(c.toUpperCase())}</span></button>`).join('')}${(a.paleta||[]).length < 8 ? `<label class="sw add" aria-label="Adicionar cor">+<input type="color" data-save="ap-pal-add" value="#C8B89A"></label>` : ''}</div>
      ${(a.paleta||[]).length ? '<small class="muted">Toque numa cor para tirá-la da paleta.</small>' : ''}
    </div>
  </section>

  <section class="card">
    <h3>Formato</h3>
    <div class="field"><label>Cantos</label><div class="chips">${chip('cantos','reto','Retos')}${chip('cantos','suave','Suaves')}${chip('cantos','redondo','Arredondados')}</div></div>
    <div class="field"><label>Cartões</label><div class="chips">${chip('cartoes','borda','Com linha fina')}${chip('cartoes','sombra','Sombra suave')}${chip('cartoes','plano','Sem borda')}</div></div>
  </section>

  <section class="card">
    <button class="btn line" data-act="ap-reset">${UI.delArm==='ap-reset' ? 'Toque de novo para restaurar' : 'Restaurar a aparência padrão'}</button>
    <p class="small muted" style="margin:0">Isso não apaga nada do planejamento, só o visual. O monograma e a foto continuam guardados até você tirá-los.</p>
  </section>`;
};

/* eventos da Aparência */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act^="ap-"]'); if (!el) return;
  const a = ap(), k = el.dataset.k, v = el.dataset.v;
  switch (el.dataset.act){
    case 'ap-tema': setAp({tema:v, custom:false, cores:null}); toast('Tema ' + (TEMAS.find(t=>t.id===v)||{}).nome); break;
    case 'ap-set': setAp({[k]:v}); break;
    case 'ap-fonte': {
      const map = {display:'fDisplay', body:'fBody', names:'fNames'};
      const patch = {[map[k]]: v}; if (k === 'names') patch.fNamesStyle = el.dataset.style || '';
      setAp(patch); break;
    }
    case 'ap-fontes-tema': setAp({fDisplay:'', fBody:'', fNames:'', fNamesStyle:''}); break;
    case 'ap-del': setAp({[k]:'', ...(k==='capa' ? {capaFundo:false} : {})}); break;
    case 'ap-pal-del': { const p = [...(a.paleta||[])]; p.splice(+el.dataset.i, 1); setAp({paleta:p}); break; }
    case 'ap-reset':
      if (UI.delArm !== 'ap-reset'){ UI.delArm = 'ap-reset'; render(); return; }
      UI.delArm = null; setAp({...AP_PADRAO, monograma:a.monograma, capa:a.capa}); toast('Aparência padrão restaurada'); break;
  }
});
document.addEventListener('change', async e => {
  const el = e.target, a = ap();
  const kind = el.dataset.save;
  if (kind === 'ap-bool'){
    const patch = {[el.dataset.k]: el.checked};
    if (el.dataset.k === 'custom' && el.checked && !a.cores){ const t = TEMAS.find(x => x.id === a.tema) || TEMAS[0]; patch.cores = {bg:t.bg, ink:t.ink, primary:t.primary, accent:t.accent, surface: lum(t.bg) < .3 ? t.surface : '#FFFFFF', escuro: !!t.escuro}; }
    setAp(patch);
  }
  else if (kind === 'ap-num') setAp({[el.dataset.k]: +el.value});
  else if (kind === 'ap-cor'){ const c = {...(a.cores||{})}; c[el.dataset.k] = el.value; if (el.dataset.k === 'bg'){ c.escuro = lum(el.value) < .3; c.surface = c.escuro ? mix(el.value,'#FFFFFF',.06) : '#FFFFFF'; } setAp({cores:c}); }
  else if (kind === 'ap-pal-add') setAp({paleta:[...(a.paleta||[]), el.value].slice(0,8)});
  if (el.dataset.apUpload){
    const file = el.files && el.files[0]; if (!file) return;
    try {
      const isPng = /png|svg|webp/i.test(file.type);
      const blob = el.dataset.apUpload === 'monograma' && isPng ? await compressPng(file) : await compress(file);
      const id = 'f' + uid(); await fotoPut(id, blob); URLS.set(id, URL.createObjectURL(blob));
      const old = a[el.dataset.apUpload];
      setAp({[el.dataset.apUpload]: id});
      if (old) fotoDel(old);
      toast(el.dataset.apUpload === 'monograma' ? 'Monograma adicionado' : 'Foto adicionada');
    } catch(err){ toast('Não deu para guardar a imagem neste aparelho.'); }
    el.value = '';
  }
});
/* monograma em PNG mantém a transparência */
async function compressPng(file){
  try {
    const bmp = await createImageBitmap(file);
    const s = Math.min(1, 800 / Math.max(bmp.width, bmp.height));
    const cv = document.createElement('canvas'); cv.width = Math.round(bmp.width*s); cv.height = Math.round(bmp.height*s);
    cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
    return await new Promise(r => cv.toBlob(b => r(b || file), 'image/png'));
  } catch(e){ return file; }
}

Object.assign(IC, {palette:'<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.7-.8 1.7-1.6 0-.5-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.8 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="14.5" cy="7" r="1"/>'});

/* inicialização */
loadAll();
seedIfFirstRun();
applyTheme();
route();
