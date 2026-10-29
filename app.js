/* ================================================================
   ARMAZENAMENTO NO APARELHO
   Registros: localStorage (um bloco por coleção). Fotos: IndexedDB.
   Nada depende de internet nem de servidor.
   ================================================================ */
const COLS = ['orcamentos','degustacao','fornecedores','convidados','inspiracoes','perguntas','respostas','tarefas','config','papelaria'];
const S = { data:{}, online:navigator.onLine, installed:false, installPrompt:null, storageOk:true };
COLS.forEach(c => S.data[c] = new Map());
const LKEY = c => 'rumo-trancoso:' + c;
const META = 'rumo-trancoso:meta';

function loadAll(){
  COLS.forEach(c => {
    try { const raw = localStorage.getItem(LKEY(c)); S.data[c] = new Map(raw ? Object.entries(JSON.parse(raw)) : []); S.data[c].forEach((v,k) => v.id = k); }
    catch(e){ S.storageOk = false; }
  });
}
function persist(c){
  const obj = {};
  S.data[c].forEach((v,k) => { const b = {...v}; delete b.id; obj[k] = b; });
  try { localStorage.setItem(LKEY(c), JSON.stringify(obj)); }
  catch(e){ toast(e && e.name === 'QuotaExceededError' ? 'O espaço do aparelho para o app encheu. Faça um backup e apague registros antigos.' : 'Não deu para salvar neste aparelho.'); }
}
function meta(){ try { return JSON.parse(localStorage.getItem(META) || '{}'); } catch(e){ return {}; } }
function setMeta(p){ try { localStorage.setItem(META, JSON.stringify({...meta(), ...p})); } catch(e){} }

function save(col, id, obj){
  const body = JSON.parse(JSON.stringify(obj)); delete body.id;
  body.atualizadoEm = new Date().toISOString();
  S.data[col].set(id, {...body, id});
  persist(col);
  scheduleRender();
}
function remove(col, id){
  const old = S.data[col].get(id);
  S.data[col].delete(id);
  persist(col);
  // apagados ficam registrados para a importação do backup não trazê-los de volta
  const del = meta().apagados || {}; del[col + '/' + id] = new Date().toISOString(); setMeta({apagados: del});
  if (old && old.foto) fotoDel(old.foto);
  scheduleRender();
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const all = c => [...S.data[c].values()];
const get = (c,id) => S.data[c].get(id);
const cfg = () => ({...DEFAULTS, ...(get('config','geral') || {})});
function setCfg(patch){ save('config','geral',{...(get('config','geral')||{}), ...patch}); }

function seedIfFirstRun(){
  if (meta().semeado) return;
  const now = new Date(0).toISOString(); // data antiga: qualquer edição real vence numa importação
  Object.entries(SEED).forEach(([col, docs]) => Object.entries(docs).forEach(([id, d]) => {
    if (!S.data[col].has(id)) S.data[col].set(id, {...d, atualizadoEm: now, id});
  }));
  Object.keys(SEED).forEach(persist);
  setMeta({semeado: true, instaladoEm: new Date().toISOString()});
}

/* Fotos no IndexedDB */
let idbP = null;
function idb(){
  if (idbP) return idbP;
  idbP = new Promise((res, rej) => {
    const r = indexedDB.open('rumo-trancoso-fotos', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('fotos');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  return idbP;
}
async function fotoPut(id, blob){ const db = await idb(); return new Promise((res, rej) => { const t = db.transaction('fotos','readwrite'); t.objectStore('fotos').put(blob, id); t.oncomplete = res; t.onerror = () => rej(t.error); }); }
async function fotoGet(id){ const db = await idb(); return new Promise(res => { const r = db.transaction('fotos').objectStore('fotos').get(id); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); }); }
async function fotoDel(id){ try { const db = await idb(); db.transaction('fotos','readwrite').objectStore('fotos').delete(id); URLS.delete(id); } catch(e){} }
async function fotoKeys(){ const db = await idb(); return new Promise(res => { const r = db.transaction('fotos').objectStore('fotos').getAllKeys(); r.onsuccess = () => res(r.result || []); r.onerror = () => res([]); }); }
const URLS = new Map();
async function hydratePhotos(root){
  for (const img of root.querySelectorAll('img[data-foto]')){
    const id = img.dataset.foto;
    if (!URLS.has(id)){ const b = await fotoGet(id); if (b) URLS.set(id, URL.createObjectURL(b)); }
    if (URLS.has(id)) img.src = URLS.get(id); else img.replaceWith(Object.assign(document.createElement('span'), {className: img.className, textContent: ''}));
  }
}

/* re-render sem atrapalhar quem está digitando */
let pending = false, raf = 0;
function scheduleRender(){
  const a = document.activeElement;
  const typing = a && a.closest('#view') && (a.tagName === 'TEXTAREA' || a.tagName === 'SELECT' || (a.tagName === 'INPUT' && !/^(checkbox|radio|range|color|file|button|submit)$/.test(a.type)));
  if (typing) { pending = true; return; }
  cancelAnimationFrame(raf); raf = requestAnimationFrame(render);
}
document.addEventListener('focusout', () => { if (pending) { pending = false; setTimeout(scheduleRender, 50); } });

/* ================================================================
   UTILITÁRIOS
   ================================================================ */
const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const BRL = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const brl = v => BRL.format(Number(v) || 0);
const brl0 = v => BRL.format(Math.round(Number(v)||0)).replace(/,00$/,'');
const brlOr = v => (+v||0) > 0 ? brl0(v) : 'a cotar';
function parseMoney(s){
  if (typeof s === 'number') return s;
  s = String(s || '').replace(/[^\d,.-]/g,'');
  if (!s) return 0;
  if (s.includes(',')) s = s.replace(/\./g,'').replace(',','.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g,'');
  return Number(s) || 0;
}
const D = s => s ? new Date(s + 'T12:00:00') : null;
const fmtD = (d, o={day:'2-digit',month:'2-digit',year:'numeric'}) => d ? d.toLocaleDateString('pt-BR', o) : '';
const fmtLong = d => d ? d.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : '';
const addDays = (d,n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const addMonths = (d,m) => { const x = new Date(d); const whole = Math.trunc(m); x.setMonth(x.getMonth()+whole); const frac = m - whole; if (frac) x.setDate(x.getDate() + Math.round(frac*30)); return x; };
const today = () => { const t = new Date(); t.setHours(12,0,0,0); return t; };
const daysBetween = (a,b) => Math.round((b - a) / 86400000);
const wedding = () => D(cfg().data);
function slug(s){ return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,40); }
let toastT = 0;
function toast(msg, ms=3200){ const t = document.getElementById('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, ms); }
async function copyText(text, btn){
  try { await navigator.clipboard.writeText(text); toast('Copiado'); }
  catch(e){ const pre = btn && btn.closest('.card')?.querySelector('.sel'); if (pre){ const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Texto selecionado. Use Copiar do celular.'); } else toast('Não deu para copiar aqui.'); }
}
const nameOf = i => { const parts = (cfg().nomes||'').split('&').map(s=>s.trim()).filter(Boolean); return parts[i] || (i?'Noivo':'Noiva'); };

/* ================================================================
   CÁLCULOS
   ================================================================ */
function budget(frente){
  const rows = all('orcamentos').filter(r => !frente || frente==='todas' || frenteOf(r) === frente);
  const ativos = rows.filter(r => r.status !== 'descartado');
  const fechado = rows.filter(r => r.status === 'fechado').reduce((s,r) => s + (+r.valor||0), 0);
  const pago = rows.reduce((s,r) => s + (+r.pago||0), 0);
  const byCat = {};
  ativos.forEach(r => { const k = r.categoria||'Outros'; (byCat[k] = byCat[k] || []).push(r); });
  let previsto = 0; const catTotals = [];
  Object.entries(byCat).forEach(([cat, list]) => {
    const f = list.filter(r => r.status==='fechado');
    const cotadas = list.filter(r => (+r.valor||0) > 0);
    const v = f.length ? f.reduce((s,r)=>s+(+r.valor||0),0) : cotadas.length ? Math.min(...cotadas.map(r => +r.valor||0)) : 0;
    previsto += v; catTotals.push({cat, v, fechado: f.length>0, n:list.length});
  });
  catTotals.sort((a,b) => b.v - a.v);
  const aCotar = ativos.filter(r => !(+r.valor > 0)).length;
  return {rows, fechado, pago, previsto, aPagar: fechado - pago, catTotals, aCotar};
}
function checklistStats(){
  const W = wedding(), t = today();
  let total = 0, done = 0;
  const phases = PHASES.map(p => {
    const custom = all('tarefas').filter(x => x.custom && x.fase === p.id).map(x => [x.id, x.titulo, x.detalhe||'', true]);
    const tasks = [...p.tasks, ...custom];
    const d = tasks.filter(tk => get('tarefas', tk[0])?.feito).length;
    total += tasks.length; done += d;
    const start = addMonths(W, -p.de), due = addMonths(W, -p.ate);
    return {...p, tasks, done:d, start, due, now: t >= start && t < due, late: t >= due && d < tasks.length};
  });
  const cur = phases.find(p => p.now) || phases.find(p => p.done < p.tasks.length) || phases[0];
  return {phases, total, done, cur};
}
function tastingStats(){
  let rated = 0, total = 0, chosen = 0, needed = 0;
  MENU.forEach(g => g.itens.forEach((_,i) => { total++; const r = get('degustacao', g.id+'-'+i); if (r && (r.t||r.d)) rated++; if (r && r.escolhido) chosen++; }));
  MENU.forEach(g => needed += g.lim);
  return {rated, total, chosen, needed};
}
const isStar = (q) => { const ov = get('respostas', q[0]); return ov && ov.star !== undefined ? ov.star : !!q[1]; };
const hasAns = id => !!((get('respostas', id)||{}).resp||'').trim();
function questionStats(pautaId){
  let n = 0, star = 0, ans = 0, starAns = 0;
  PAUTAS.filter(p => !pautaId || p.id === pautaId).forEach(p => p.groups.forEach(g => g.items.forEach(q => { n++; const ok = hasAns(q[0]); if (ok) ans++; if (isStar(q)) { star++; if (ok) starAns++; } })));
  all('perguntas').filter(p => !pautaId || (p.pauta||'cerimonia') === pautaId).forEach(p => { n++; const ok = !!(p.resp||'').trim(); if (ok) ans++; if (p.star){ star++; if (ok) starAns++; } });
  return {n, star, ans, starAns};
}
const done = id => !!get('tarefas', id)?.feito;
const CONTRATA = {
  bisutti:['Espaço e estrutura','Buffet e bar de drinks','Decoração da festa','Som, luz e DJ','Equipe da festa','Concierge Bisutti','Jantar pré-wedding no LUA (cortesia Club Med)'],
  voces:[['Igreja e celebrante',['Igreja & cerimônia']],['Fotografia',['Fotografia']],['Filme',['Filme']],['Música da cerimônia e banda',['Música & banda']],['Vestido e acessórios',['Vestido & acessórios']],['Maquiagem, cabelo e manicure',['Beleza']],['Traje do David',[],'já tem o kilt'],['Alianças',['Alianças']],['Bolo, doces e bem-casados',['Bolo & doces']],['Lembranças',['Lembranças & brindes']],['Papelaria e convites',['Papelaria & convites']],['Transporte dos convidados',['Transporte']],['Hospedagem dos convidados',['Hospedagem']],['Civil em São Paulo',['Cartório & documentos']]]
};
function contrataStatus(cats){
  const rows = all('orcamentos').filter(r => cats.includes(r.categoria) && r.status !== 'descartado');
  if (rows.some(r => r.status === 'fechado')) return ['ok','fechado'];
  if (rows.some(r => +r.valor > 0)) return ['warn','cotando'];
  return ['','a contratar'];
}

function alerts(){
  const c = cfg(), t = today();
  const A = [];
  if (!done('a04')) A.push(['warn','A agenda de 2028 da igreja abre em janeiro de 2027','Você confirmou com a secretaria. Descubra o dia exato e o canal para pedir a data assim que abrir. O curso de noivos é obrigatório.']);
  const val = D(c.propostaValidade);
  if (val && t > val && !done('a05')) A.push(['crit','A proposta OCT-178840 venceu em ' + fmtD(val), 'Peça a reemissão antes de negociar. Os R$ 410.260,23 podem mudar.']);
  if (!c.contrato) A.push(['crit','A data da festa ainda não está garantida', 'A proposta não bloqueia 14/07/2028. Outro casal pode fechar a data até vocês assinarem.']);
  A.push(['info','A cerimônia no Chez Bisutti é o plano B','A proposta já inclui cerimônia no espaço (36 bancos, altar, arco, som). Só peça para tirar quando a igreja confirmar por escrito.']);
  if (!done('a13')) A.unshift(['crit','Vocês não são católicos: confirme se a igreja celebra','A Igreja Católica costuma celebrar o casamento quando pelo menos um dos noivos é católico. Para dois não católicos, depende da paróquia e do bispo. Conte isso na reunião de 06/11 e peça a resposta por escrito.']);
  if (!c.civilData) A.push(['warn','Marque a data do civil em São Paulo','Ele deve acontecer antes de 14/07/2028. O certificado de habilitação vale 90 dias.']);
  A.push(['warn','Pontualidade na igreja','Normas antigas da paróquia: cerca de 20 minutos de tolerância e risco de cancelar a cerimônia passados 30. Planeje a saída do Club Med com folga.']);
  A.push(['warn','Transporte e hospedagem dos convidados não estão em nenhuma proposta','Vans da igreja para a festa, transfers do aeroporto e reservas no Club Med ficam por conta de vocês e dos convidados.']);
  A.push(['info','Sem assessora: defina quem coordena a igreja','A Tainara cuida da festa. Na igreja, combine com a paróquia ou peça a um padrinho de confiança para organizar a entrada.']);
  A.push(['warn','Julho é alta temporada e mês de chuva','Média de 69 mm e 19 a 24 °C. Tenha guarda-chuvas na saída da igreja e plano B na festa. Tarifas Club Med podem passar de "a partir de R$ 989".']);
  A.push(['warn','Hospedagem sem bloqueio de quartos', `Cada convidado reserva e paga a sua. ${c.simHosp} hóspedes ocupariam cerca de ${Math.ceil(c.simHosp/2)} quartos num resort de aproximadamente 250, e a tarifa promocional cobre só até 40 diárias.`]);
  A.push(['warn','Sem vinho e espumante na proposta','Bebidas listadas: Heineken 600 ml, sucos, refrigerantes e o bar de drinks Eleven.']);
  A.push(['info','O David casa no civil como brasileiro','Com a certidão de nascimento brasileira transcrita, não precisa de apostila nem tradução. Para usar a certidão no Reino Unido, basta apostilar e traduzir.']);
  A.push(['info','O cardápio cita "Chez Lake"','Confirme que o cardápio e o chef valem para Trancoso.']);
  A.push(['warn','Bolo, doces, lembranças e papelaria são por conta de vocês','A Bisutti não fornece. E a Carta Benefício só libera fornecedores externos de foto, filme e assessoria: confirme a entrada da confeitaria.']);
  A.push(['info','O desconto de lua de mel não vale em julho','Se a viagem for logo após o casamento, os 10% Club Med não se aplicam.']);
  A.push(['info','14/07/2028 é uma sexta-feira','Seus convidados vão precisar de folga no trabalho.']);
  const ord = {crit:0, warn:1, info:2};
  return A.sort((a,b) => ord[a[0]] - ord[b[0]]);
}
function deadlines(){
  const c = cfg(), W = wedding();
  const L = [];
  if (c.reuniao) L.push([D(c.reuniao),'Reunião: cerimônia na igreja', c.reuniaoHora ? 'às ' + c.reuniaoHora : '']);
  if (!done('a04')) L.push([new Date('2027-01-04T12:00:00'),'Agenda de 2028 da igreja abre (janeiro de 2027)','Dia exato a confirmar com a secretaria.']);
  if (c.contrato){
    const ct = D(c.contrato);
    L.push([ct,'Contrato Bisutti assinado','']);
    L.push([addDays(ct,90),'Reunião Club Med a partir de','Regra da Carta Benefício para eventos a partir de 2028.']);
  }
  if (c.reuniaoClubMed) L.push([addDays(D(c.reuniaoClubMed),120),'Último dia para contratar o Pacote Especial Club Med','120 dias após a reunião de apresentação.']);
  else L.push([null,'Prazo do Pacote Especial','Informe em Ajustes a data da reunião com o Club Med.']);
  L.push([addMonths(W,-12),'Save the date (de 12 a 9 meses antes)','']);
  L.push([addMonths(W,-12),'Inscrição no curso de noivos (de 12 a 6 meses antes)','']);
  L.push([addMonths(W,-8),'Vestido sob medida encomendado','']);
  L.push([addMonths(W,-6),'Processo matrimonial aberto na paróquia de São Paulo','']);
  if (c.civilData){
    const cv = D(c.civilData);
    L.push([addDays(cv,-90),'Habilitação no cartório: certificado emitido a partir de','Vale 90 dias. Conte também os 15 dias de proclamas.']);
    L.push([cv,'Casamento civil em São Paulo', c.civilCartorio || '']);
  } else L.push([null,'Casamento civil em São Paulo','Defina a data em Ajustes (antes de 14/07/2028).']);
  L.push([addDays(addDays(W,-1),-30),'Reservar o jantar no LUA (30 dias antes)','']);
  L.push([addDays(W,-30),'Reservar a privatização do Beauty Center','']);
  L.push([addDays(W,-10),'Prazo final da Noite de Experiência Club Med','E ela não pode ser em julho.']);
  L.push([addDays(W,-1),'Jantar pré-wedding no LUA','20h às 22h']);
  L.push([W,'O grande dia', [c.cerimoniaHora ? 'Igreja às ' + c.cerimoniaHora : 'Igreja (horário a definir)', 'festa às ' + c.hora].join(' · ')]);
  return L.sort((a,b) => (a[0]||new Date(8e15)) - (b[0]||new Date(8e15)));
}

/* ================================================================
   ROTAS E MOLDURA
   ================================================================ */
const TABS = [['inicio','Início','home'],['roteiro','Roteiro','list'],['orcamento','Orçamento','money'],['degustacao','Degustação','fork'],['mais','Mais','more']];
const SUB = {reuniao:'Reunião',hospedagem:'Hospedagem',convidados:'Convidados',inspiracoes:'Inspirações',fornecedores:'Fornecedores',guia:'Guia da noiva',contatos:'Contatos',ajustes:'Ajustes e backup',alertas:'Atenção',aparencia:'Aparência',papelaria:'Convites e papelaria'};
let view = 'inicio';
const UI = { orcFiltro:'todos', orcFrente:'todas', degFiltro:'todos', degOpen:new Set(['cf']), notesOpen:new Set(), pauta:'cerimonia', reuFiltro:'estrela', convFiltro:'todos', inspFiltro:'Todas', phaseOpen:null, delArm:null };
function route(){
  const h = (location.hash || '').replace('#','');
  view = (TABS.some(t => t[0]===h) || SUB[h]) ? h : 'inicio';
  window.scrollTo(0,0);
  render();
}
window.addEventListener('hashchange', route);

function render(){
  const isSub = !!SUB[view];
  const title = isSub ? SUB[view] : ({inicio:cfg().nomes, roteiro:'Roteiro até o sim', orcamento:'Orçamento', degustacao:'Degustação', mais:'Mais'})[view];
  const st = S.online ? ['sync on','no aparelho'] : ['sync','sem internet'];
  const topMono = view === 'inicio' && ap().monoNoTopo ? monoHtml('mono-top') : '';
  document.getElementById('top').innerHTML = (isSub ? `<button class="back" data-act="back" aria-label="Voltar">${icon('back')}</button>` : '') + topMono + `<h1>${esc(view === 'inicio' ? 'Início' : title)}</h1><span class="${st[0]}"><i></i>${st[1]}</span>`;
  hydratePhotos(document.getElementById('top'));
  const parent = isSub ? 'mais' : view;
  document.getElementById('tabs').innerHTML = TABS.map(t => `<a href="#${t[0]}" ${t[0]===parent?'aria-current="page"':''}>${icon(t[2])}<span>${t[1]}</span></a>`).join('');
  const v = document.getElementById('view');
  v.innerHTML = (VIEWS[view] || VIEWS.inicio)();
  v.dataset.ok = '1';
  hydratePhotos(v);
  const fab = document.getElementById('fab');
  const fabFor = {orcamento:'orc', degustacao:'deg', convidados:'conv', inspiracoes:'insp', fornecedores:'forn', reuniao:'perg', roteiro:'tarefa'};
  fab.hidden = !fabFor[view]; fab.dataset.act = 'new'; fab.dataset.kind = fabFor[view] || '';
}

/* ================================================================
   TELAS
   ================================================================ */
const VIEWS = {};
const alertHtml = a => `<div class="alert ${a[0]}"><span class="dot"></span><div><b>${esc(a[1])}</b><p>${esc(a[2])}</p></div></div>`;

VIEWS.inicio = () => {
  const c = cfg(), W = wedding(), t = today(), A_ = ap();
  const dias = daysBetween(t, W), meses = Math.floor(dias / 30.44);
  const b = budget(), ck = checklistStats(), ts = tastingStats(), qs = questionStats('cerimonia');
  const reu = D(c.reuniao); const dReu = reu ? daysBetween(t, reu) : null;
  const A = alerts();
  const pend = ck.cur.tasks.filter(tk => !done(tk[0])).slice(0,4);
  const m = meta();
  const lastBk = m.ultimoBackup ? new Date(m.ultimoBackup) : null;
  const needBk = (!lastBk || daysBetween(lastBk, new Date()) > 14) && m.instaladoEm && daysBetween(new Date(m.instaladoEm), new Date()) >= 3;
  return `
  <section class="hero">
    ${A_.capa ? `<img class="hero-cover" data-foto="${esc(A_.capa)}" alt="Foto de ${esc(c.nomes)}" style="object-position:center ${A_.capaFoco}">` : ''}
    <div class="hero-body">
      ${A_.capa ? '' : monoHtml('mono-hero')}
      <div class="names">${esc(c.nomes)}</div>
      <div class="hero-date">${esc(fmtD(W,{day:'numeric',month:'long',year:'numeric'}))} · Trancoso</div>
      <hr class="rule">
      <div class="count num">
        <div><b>${Math.max(0,dias)}</b><span>dias</span></div>
        <div><b>${Math.max(0,meses)}</b><span>meses</span></div>
        <div><b>${c.convidados}</b><span>convidados</span></div>
      </div>
      <div class="hero-legs">
        <div>${icon('church')}<b>Cerimônia</b><span>${esc(c.igreja)}${c.cerimoniaHora?' · '+esc(c.cerimoniaHora):''}</span></div>
        <div>${icon('fork')}<b>Festa</b><span>${esc(c.local)} · ${esc(c.hora)}</span></div>
      </div>
      ${(A_.paleta||[]).length ? `<div class="pal-strip">${A_.paleta.map(x => `<i style="background:${esc(x)}"></i>`).join('')}</div>` : ''}
    </div>
  </section>

  ${!S.installed ? `<section class="card install"><div class="row between"><h3>Instale na tela de início</h3>${S.installPrompt?`<button class="btn sm" data-act="install">Instalar</button>`:''}</div><p class="small" style="margin:0">Assim o app abre como um aplicativo e funciona sem internet. <b>iPhone:</b> no Safari, toque em Compartilhar e depois em "Adicionar à Tela de Início". <b>Android:</b> no Chrome, menu ⋮ e "Instalar app".</p></section>` : ''}

  ${reu && dReu >= -1 ? `<a class="card" href="#reuniao" data-act="pauta" data-v="cerimonia" style="text-decoration:none;color:inherit;border-color:var(--falesia)">
    <div class="row between"><span class="eyebrow">Próximo compromisso</span><span class="pill fal">${dReu === 0 ? 'hoje' : dReu === 1 ? 'amanhã' : dReu < 0 ? 'ontem' : 'em ' + dReu + ' dias'}</span></div>
    <h2>Reunião sobre a cerimônia na igreja</h2>
    <div class="muted small">${esc(fmtLong(reu))}${c.reuniaoHora?', às '+esc(c.reuniaoHora):''}. A pauta tem ${qs.star} perguntas prioritárias, ${qs.starAns} já respondidas.</div>
    <div class="bar f"><i style="width:${qs.star?Math.round(qs.starAns/qs.star*100):0}%"></i></div>
    <span class="btn sm" style="align-self:flex-start">Abrir a pauta</span>
  </a>` : ''}

  ${needBk ? `<section class="card"><div class="row between"><h3>Hora do backup</h3><button class="btn sm" data-act="json">Fazer backup</button></div><p class="small muted" style="margin:0">${lastBk ? 'O último foi em ' + esc(fmtD(lastBk)) + '.' : 'Você ainda não fez nenhum.'} Os dados ficam só neste aparelho: guarde uma cópia no iCloud, Google Drive ou mande para o David.</p></section>` : ''}

  <section class="card">
    <div class="sec-title"><h2>Pontos de atenção</h2><a class="small" href="#alertas">ver os ${A.length}</a></div>
    <div class="stack">${A.slice(0,3).map(alertHtml).join('')}</div>
  </section>

  <section class="card">
    <div class="sec-title"><h2>Agora: ${esc(ck.cur.nome)}</h2><a class="small" href="#roteiro">roteiro</a></div>
    <div class="muted small">Fase até ${esc(fmtD(ck.cur.due,{month:'long',year:'numeric'}))} · ${ck.done} de ${ck.total} tarefas feitas no total</div>
    <div class="bar"><i style="width:${Math.round(ck.done/ck.total*100)}%"></i></div>
    <div class="list">${pend.length ? pend.map(taskHtml).join('') : '<div class="muted small">Tudo feito nesta fase.</div>'}</div>
  </section>

  <section class="card">
    <div class="sec-title"><h2>Quem contrata o quê</h2><a class="small" href="#orcamento">orçamentos</a></div>
    <div class="who-grid">
      <div><span class="eyebrow">Com a Tainara (Bisutti)</span><div class="list">${CONTRATA.bisutti.map(n => `<div class="item"><span class="grow small">${esc(n)}</span><span class="pill mata">no pacote</span></div>`).join('')}</div></div>
      <div><span class="eyebrow">Por conta de vocês</span><div class="list">${CONTRATA.voces.map(([n,cats,fixo]) => { const st = fixo ? ['ok', fixo] : contrataStatus(cats); return `<div class="item"><span class="grow small">${esc(n)}</span><span class="pill ${st[0]}">${esc(st[1])}</span></div>`; }).join('')}</div></div>
    </div>
  </section>

  <section class="card">
    <div class="sec-title"><h2>Dinheiro por frente</h2><a class="small" href="#orcamento">detalhar</a></div>
    <dl class="kv">${FRENTES.map(([k,l]) => { const x = budget(k); return x.rows.length ? `<dt>${esc(l)}</dt><dd>${brl0(x.previsto)}${x.aCotar?` <span class="muted small">+ ${x.aCotar} a cotar</span>`:''}</dd>` : ''; }).join('')}<dt><b>Total previsto</b></dt><dd><b>${brl0(b.previsto)}</b></dd></dl>
    ${+c.meta ? `<div class="small muted">Meta ${brl0(c.meta)} · ${Math.round(b.previsto/c.meta*100)}% usado na previsão</div><div class="bar ${b.previsto>c.meta?'f':''}"><i style="width:${Math.min(100,Math.round(b.previsto/c.meta*100))}%"></i></div>` : `<button class="btn ghost sm" data-act="go" data-to="ajustes" style="align-self:flex-start">Definir meta de orçamento</button>`}
  </section>

  <section class="grid2">
    <a class="card" href="#degustacao" style="text-decoration:none;color:inherit">
      <span class="eyebrow">Degustação</span>
      <div class="v" style="font-size:1.6rem;font-weight:700">${ts.rated}<span class="muted" style="font-size:1rem">/${ts.total}</span></div>
      <div class="small muted">pratos avaliados · ${ts.chosen} de ${ts.needed} escolhas</div>
    </a>
    <a class="card" href="#hospedagem" style="text-decoration:none;color:inherit">
      <span class="eyebrow">Club Med</span>
      <div class="v" style="font-size:1.6rem;font-weight:700">${brl0(c.simSup*c.simNoites)}</div>
      <div class="small muted">por convidado em ${c.simNoites} noites</div>
    </a>
  </section>

  <section class="card">
    <h2>Prazos que importam</h2>
    <div class="list">${deadlines().map(([d,tt,dd]) => {
      const past = d && d < t; const soon = d && !past && daysBetween(t,d) <= 45;
      return `<div class="item"><div style="width:74px;flex:none" class="num small ${past?'muted':''}"><b>${d?fmtD(d,{day:'2-digit',month:'short'}):'—'}</b><br>${d?d.getFullYear():''}</div><div class="grow"><div class="t">${esc(tt)}</div>${dd?`<div class="d">${esc(dd)}</div>`:''}</div>${soon?'<span class="pill fal">em breve</span>':past?'<span class="pill">passou</span>':''}</div>`;
    }).join('')}</div>
  </section>`;
};

VIEWS.alertas = () => `<section class="card"><p class="small muted" style="margin:0">Auditoria da proposta OCT-178840, da Carta Benefício e das normas da Igreja do Quadrado, cruzada com dados de clima, horário e hospedagem.</p><div class="stack">${alerts().map(alertHtml).join('')}</div><a class="btn" href="#reuniao">Ver as perguntas da reunião</a></section>`;

function taskHtml(tk){
  const st = get('tarefas', tk[0]) || {};
  return `<label class="item ${st.feito?'done':''}" style="cursor:pointer"><input type="checkbox" class="check" data-act="task" data-id="${esc(tk[0])}" ${st.feito?'checked':''}><div class="grow"><div class="t">${esc(tk[1])}</div>${tk[2]?`<div class="d">${esc(tk[2])}</div>`:''}${st.feito && st.em ? `<div class="d">feito em ${esc(fmtD(new Date(st.em)))}</div>`:''}</div>${tk[3]?`<button class="copy" data-act="deltask" data-id="${esc(tk[0])}">remover</button>`:''}</label>`;
}

VIEWS.roteiro = () => {
  const ck = checklistStats();
  const open = UI.phaseOpen || ck.cur.id;
  return `
  <section class="card">
    <div class="row between"><h2>${ck.done} de ${ck.total}</h2><span class="pill mata">${Math.round(ck.done/ck.total*100)}%</span></div>
    <div class="bar"><i style="width:${Math.round(ck.done/ck.total*100)}%"></i></div>
    <p class="small muted" style="margin:0">As datas são calculadas a partir de ${esc(fmtD(wedding()))}. Mude a data em Ajustes e tudo se reorganiza. Use o + para criar suas tarefas.</p>
  </section>
  ${ck.phases.map(p => `
  <details class="phase ${p.id===ck.cur.id?'now':''}" data-phase="${p.id}" ${p.id===open?'open':''}>
    <summary>
      <div class="row between"><span class="eyebrow">${p.ate > 0 ? 'até ' + esc(fmtD(p.due,{month:'short',year:'numeric'})) : p.ate === 0 ? esc(fmtD(p.due)) : 'depois do casamento'}</span>
      ${p.late ? '<span class="pill crit">atrasada</span>' : p.id===ck.cur.id ? '<span class="pill fal">agora</span>' : p.done===p.tasks.length ? '<span class="pill ok">concluída</span>' : ''}</div>
      <div class="row between"><h3>${esc(p.nome)}</h3><span class="small muted num">${p.done}/${p.tasks.length}</span></div>
      <div class="bar"><i style="width:${Math.round(p.done/p.tasks.length*100)}%"></i></div>
    </summary>
    <div class="body"><div class="list">${p.tasks.map(taskHtml).join('')}</div></div>
  </details>`).join('')}`;
};

VIEWS.orcamento = () => {
  const c = cfg(), FR = UI.orcFrente, F = UI.orcFiltro, b = budget(FR);
  const rows = b.rows.filter(r => F==='todos' ? true : r.status === F).sort((a,b) => (a.categoria||'').localeCompare(b.categoria||'') || (+b.valor||0) - (+a.valor||0));
  const groups = {};
  rows.forEach(r => { const k = r.categoria||'Outros'; (groups[k] = groups[k] || []).push(r); });
  const max = Math.max(1, ...b.catTotals.map(x => x.v));
  const nextDue = b.rows.filter(r => r.vencimento && (+r.valor||0) > (+r.pago||0) && r.status==='fechado').sort((a,b)=>a.vencimento.localeCompare(b.vencimento))[0];
  return `
  <div class="chips">${[['todas','Todas as frentes'],...FRENTES].map(([k,l]) => `<button class="chip" data-act="orcfr" data-v="${k}" aria-pressed="${FR===k}">${esc(l)}</button>`).join('')}</div>
  <section class="card">
    ${FR!=='todas' ? `<span class="eyebrow">${esc(FRENTES.find(f=>f[0]===FR)[1])} · pagamento separado</span>` : ''}
    <div class="grid2 grid4">
      <div class="tile"><div class="l">Previsto</div><div class="v">${brl0(b.previsto)}</div></div>
      <div class="tile"><div class="l">Fechado</div><div class="v">${brl0(b.fechado)}</div></div>
      <div class="tile"><div class="l">Pago</div><div class="v">${brl0(b.pago)}</div></div>
      <div class="tile"><div class="l">A pagar</div><div class="v">${brl0(b.aPagar)}</div></div>
    </div>
    <p class="small muted" style="margin:0">Previsto soma o que está fechado em cada categoria e, onde nada fechou, a cotação mais barata.${b.aCotar?` <b>${b.aCotar} ${b.aCotar>1?'itens ainda estão':'item ainda está'} a cotar.</b>`:''}${FR==='todas'||FR==='festa'?` Por convidado: <b class="num">${brl(b.previsto/(c.convidados||1))}</b>.`:''}</p>
    ${nextDue ? `<div class="alert warn"><span class="dot"></span><div><b>Próximo pagamento: ${esc(fmtD(D(nextDue.vencimento)))}</b><p>${esc(nextDue.fornecedor)} · falta ${brl(nextDue.valor - (nextDue.pago||0))}</p></div></div>` : ''}
  </section>
  ${b.catTotals.some(x=>x.v>0) ? `<section class="card"><h3>Por categoria</h3><div class="stack">${b.catTotals.filter(x=>x.v>0).map(x => `<div><div class="row between small"><span>${esc(x.cat)}${x.n>1?` <span class="muted">· ${x.n} itens</span>`:''}</span><b class="num">${brl0(x.v)}</b></div><div class="bar ${x.fechado?'':'f'}"><i style="width:${Math.max(2,x.v/max*100)}%"></i></div></div>`).join('')}</div><div class="small muted">Verde: fechado · Coral: ainda em cotação</div></section>` : ''}
  <div class="chips">${[['todos','Todos'],...Object.entries(STATUS).map(([k,v])=>[k,v[0]])].map(([k,l]) => `<button class="chip" data-act="orcf" data-v="${k}" aria-pressed="${F===k}">${l}</button>`).join('')}</div>
  ${rows.length ? Object.entries(groups).map(([cat, list]) => {
    const cot = list.filter(r=>+r.valor>0); const minV = cot.length > 1 ? Math.min(...cot.map(r=>+r.valor)) : null;
    return `<section class="card"><div class="row between"><h3>${esc(cat)}</h3><span class="small muted num">${brl0(list.reduce((s,r)=>s+(+r.valor||0),0))}</span></div><div class="list">${list.map(r => `
      <div class="item tap" data-act="edit" data-kind="orc" data-id="${esc(r.id)}">
        <div class="grow">${(!r.fornecedor || r.fornecedor==='A definir') ? `<div class="t">${esc(r.descricao||'Sem descrição')}</div><div class="d">Fornecedor a definir</div>` : `<div class="t">${esc(r.fornecedor)}</div><div class="d">${esc(r.descricao||'')}</div>`}${FR==='todas'?`<div class="d">${esc(FRENTES.find(f=>f[0]===frenteOf(r))?.[1]||'')}</div>`:''}
        ${(+r.pago||0) > 0 ? `<div class="bar" style="margin-top:6px"><i style="width:${Math.min(100,(r.pago/(r.valor||1))*100)}%"></i></div><div class="d num">pago ${brl0(r.pago)} de ${brl0(r.valor)}</div>`:''}</div>
        <div style="text-align:right" class="stack"><b class="num">${brlOr(r.valor)}</b><span class="pill ${STATUS[r.status]?.[1]||''}">${STATUS[r.status]?.[0]||'Cotação'}</span>${minV!==null && +r.valor===minV ? '<span class="pill ok">menor</span>':''}</div>
      </div>`).join('')}</div></section>`;}).join('')
  : `<section class="card empty"><h3>Nada aqui ainda</h3><p class="small">Toque no + para registrar uma cotação: frente, fornecedor, valor, status e quanto já foi pago.</p></section>`}
  <section class="card"><h3>Exportar</h3><p class="small muted" style="margin:0">Planilha (CSV) com todos os orçamentos e a frente de cada um, para abrir no Excel ou mandar para a assessora.</p><button class="btn ghost" data-act="csv">Exportar planilha</button></section>`;
};

const RATES = [['amei','Amei'],['gostei','Bom'],['ok','Ok'],['nao','Não']];
function dishHtml(id, name, lim, custom){
  const r = get('degustacao', id) || {};
  const seg = who => `<div class="rate"><span class="who">${esc(nameOf(who==='t'?0:1))}</span><div class="seg">${RATES.map(([v,l]) => `<button data-act="rate" data-id="${esc(id)}" data-who="${who}" data-v="${v}" aria-pressed="${r[who]===v}">${l}</button>`).join('')}</div></div>`;
  return `<div class="dish">
    <div class="dish-top"><span class="dish-name">${esc(name)}${custom && r.fornecedor ? ` <span class="muted small">· ${esc(r.fornecedor)}</span>`:''}</span>
      ${lim>0 ? `<button class="pick" data-act="pick" data-id="${esc(id)}" aria-pressed="${!!r.escolhido}">${r.escolhido?'escolhido':'escolher'}</button>` : ''}
      ${custom ? `<button class="copy" data-act="edit" data-kind="deg" data-id="${esc(id)}">editar</button>`:''}</div>
    ${custom && r.foto ? `<img class="thumb" style="width:100%;height:160px" data-foto="${esc(r.foto)}" alt="">` : ''}
    ${seg('t')}${seg('d')}
    ${UI.notesOpen.has(id) ? `<textarea class="inp" data-save="degnota" data-id="${esc(id)}" placeholder="Textura, tempero, temperatura, porção...">${esc(r.nota||'')}</textarea>` : `<div class="row">${r.nota?`<span class="note grow">“${esc(r.nota)}”</span>`:''}<button class="note-btn" data-act="note" data-id="${esc(id)}">${r.nota?'editar nota':'+ nota'}</button></div>`}
  </div>`;
}
function passes(r, F){
  if (F==='todos') return true;
  if (F==='escolhidos') return !!r?.escolhido;
  if (F==='sem') return !r || (!r.t && !r.d);
  if (F==='amados') return r && r.t==='amei' && r.d==='amei';
  if (F==='diverge') return r && r.t && r.d && ((r.t==='amei'||r.t==='gostei') !== (r.d==='amei'||r.d==='gostei'));
  return true;
}
VIEWS.degustacao = () => {
  const ts = tastingStats(), F = UI.degFiltro;
  const custom = all('degustacao').filter(r => r.custom);
  const filters = [['todos','Todos'],['sem','Sem nota'],['escolhidos','Escolhidos'],['amados','Os dois amaram'],['diverge','Opiniões diferentes']];
  return `
  <section class="card">
    <div class="row between"><h2>Cardápio da proposta</h2><span class="pill mata num">${ts.chosen}/${ts.needed} escolhas</span></div>
    <p class="small muted" style="margin:0">Cardápio Piemonte Franco Americano (chef Julio Perinetto) e bar Eleven, da proposta OCT-178840. ${esc(nameOf(0))} e ${esc(nameOf(1))} avaliam cada prato separadamente. Use "escolher" para montar o cardápio final dentro do limite de cada etapa.</p>
    <div class="bar f"><i style="width:${Math.round(ts.rated/ts.total*100)}%"></i></div>
    <div class="small muted num">${ts.rated} de ${ts.total} avaliados</div>
  </section>
  <div class="chips">${filters.map(([k,l]) => `<button class="chip" data-act="degf" data-v="${k}" aria-pressed="${F===k}">${l}</button>`).join('')}</div>
  ${MENU.map(g => {
    const ids = g.itens.map((n,i) => [g.id+'-'+i, n]).filter(([id]) => passes(get('degustacao',id), F));
    if (!ids.length) return '';
    const chosen = g.itens.filter((_,i) => get('degustacao', g.id+'-'+i)?.escolhido).length;
    const over = g.lim > 0 && chosen > g.lim;
    const isOpen = UI.degOpen.has(g.id) || F !== 'todos';
    return `<details class="group" data-group="${g.id}" ${isOpen?'open':''}>
      <summary><div class="grow"><div class="eyebrow">${esc(g.etapa)}</div><h3>${esc(g.nome)}</h3></div>
      ${g.lim>0 ? `<span class="pill ${over?'crit':chosen===g.lim?'ok':''} num">${chosen}/${g.lim}</span>` : '<span class="pill">incluso</span>'}</summary>
      <div class="body">${g.obs?`<div class="small muted" style="padding-bottom:8px">${esc(g.obs)}</div>`:''}${over?`<div class="alert crit"><span class="dot"></span><div><b>Passou do limite</b><p>A proposta permite ${g.lim}. Desmarque ou pergunte o custo de incluir mais.</p></div></div>`:''}${ids.map(([id,n]) => dishHtml(id, n, g.lim, false)).join('')}</div>
    </details>`;
  }).join('')}
  <section class="card">
    <div class="row between"><h2>Outras degustações</h2><button class="btn sm" data-act="new" data-kind="deg">+ Prato</button></div>
    <p class="small muted" style="margin:0">Bolo, doces, bem-casados, vinhos ou pratos de outros fornecedores. Dá para tirar foto.</p>
    ${custom.filter(r => passes(r,F)).length ? custom.filter(r => passes(r,F)).map(r => dishHtml(r.id, r.nome, 0, true)).join('') : '<div class="empty small">Nada registrado ainda. Na próxima degustação, toque em + Prato.</div>'}
  </section>`;
};

VIEWS.mais = () => {
  const qs = questionStats();
  const L = [['reuniao','chat','Reuniões',`${qs.n} perguntas · ${qs.ans} respondidas`,true],['alertas','alert','Pontos de atenção','Auditoria da proposta'],['hospedagem','bed','Hospedagem Club Med','Simulador e regras'],['convidados','people','Convidados',`${S.data.convidados.size} na lista`],['papelaria','mail','Convites e papelaria','Modelos com os nomes de vocês, monograma, brasão e textos',true],['inspiracoes','dress','Inspirações','Vestido, decoração, fotos'],['fornecedores','store','Fornecedores','Visitas e avaliações'],['guia','book','Guia da noiva','Igreja, civil, vestido, tendências'],['contatos','phone','Contatos','Igreja, Bisutti, Club Med'],['aparencia','palette','Aparência','Temas, fontes, cores, monograma e foto',true],['ajustes','gear','Ajustes e backup','Datas, meta, backup, David']];
  return `<div class="menu-grid">${L.map(([h,i,t,s,w]) => `<a href="#${h}" class="${w?'wide':''}">${icon(i)}<b>${esc(t)}</b><span>${esc(s)}</span></a>`).join('')}</div>`;
};

VIEWS.reuniao = () => {
  const c = cfg(), P = PAUTAS.find(p => p.id === UI.pauta) || PAUTAS[0], F = UI.reuFiltro, qs = questionStats(P.id);
  const filt = (star, ans) => F==='todas' ? true : F==='estrela' ? star : F==='pendentes' ? !ans : ans;
  const qHtml = (id, star, q, why, custom) => {
    const a = custom ? get('perguntas', id) : get('respostas', id);
    return `<div class="dish">
      <div class="dish-top"><button class="pick" data-act="star" data-id="${esc(id)}" data-custom="${custom?1:0}" aria-pressed="${!!star}">${star?'★ prioridade':'☆'}</button>${custom?`<button class="copy" data-act="delq" data-id="${esc(id)}">${UI.delArm===id?'confirmar':'apagar'}</button>`:''}</div>
      <div class="t" style="font-weight:600">${esc(q)}</div>
      ${why?`<div class="small muted">${esc(why)}</div>`:''}
      <textarea class="inp" data-save="${custom?'pergresp':'resp'}" data-id="${esc(id)}" placeholder="Resposta">${esc((a && a.resp) || '')}</textarea>
    </div>`;
  };
  const groups = P.groups.map(g => {
    const items = g.items.map(q => [q[0], isStar(q), q[2], q[3], hasAns(q[0])]).filter(x => filt(x[1], x[4]));
    return items.length ? `<section class="card"><h3>${esc(g.g)}</h3>${items.map(x => qHtml(x[0],x[1],x[2],x[3],false)).join('')}</section>` : '';
  }).join('');
  const customs = all('perguntas').filter(p => (p.pauta||'cerimonia') === P.id && filt(!!p.star, !!(p.resp||'').trim()));
  const dt = D(c[P.cfgData]);
  return `
  <div class="chips">${PAUTAS.map(p => `<button class="chip" data-act="pauta" data-v="${p.id}" aria-pressed="${p.id===P.id}">${esc(p.nome)}</button>`).join('')}</div>
  <section class="card">
    <span class="eyebrow">${esc(P.nome)}</span>
    <div class="row between"><h2>${dt ? esc(fmtD(dt,{weekday:'long',day:'numeric',month:'long'})) + (P.cfgHora && c[P.cfgHora] ? ', ' + esc(c[P.cfgHora]) : '') : 'Data a marcar'}</h2><button class="copy" data-act="go" data-to="ajustes">mudar data</button></div>
    <div class="grid2"><div class="tile"><div class="l">Prioritárias</div><div class="v num">${qs.starAns}/${qs.star}</div></div><div class="tile"><div class="l">Todas</div><div class="v num">${qs.ans}/${qs.n}</div></div></div>
    <p class="small muted" style="margin:0">Escreva as respostas durante a reunião. Tudo fica salvo no aparelho, mesmo sem internet. Marque com ★ o que for prioridade e use + para criar perguntas suas nesta pauta.</p>
  </section>
  <div class="chips">${[['estrela','★ Prioridade'],['pendentes','Sem resposta'],['respondidas','Respondidas'],['todas','Todas']].map(([k,l]) => `<button class="chip" data-act="reuf" data-v="${k}" aria-pressed="${F===k}">${l}</button>`).join('')}</div>
  ${customs.length ? `<section class="card"><h3>Minhas perguntas</h3>${customs.map(p => qHtml(p.id, !!p.star, p.texto, p.grupo, true)).join('')}</section>` : ''}
  ${groups || '<section class="card empty"><h3>Nada neste filtro</h3></section>'}
  <section class="card"><h3>Pauta para mandar por mensagem</h3><p class="small muted" style="margin:0">As perguntas prioritárias desta pauta em texto simples, para colar no WhatsApp ou e-mail.</p><div class="table-wrap"><pre class="sel small" style="white-space:pre-wrap;margin:0;font-family:var(--body)">${esc(pautaText(P))}</pre></div><div class="row"><button class="btn ghost" data-act="copypauta">Copiar</button><button class="btn ghost" data-act="sharepauta">Compartilhar</button></div></section>`;
};
function pautaText(P){
  P = P || PAUTAS.find(p => p.id === UI.pauta) || PAUTAS[0];
  const c = cfg();
  const lines = [`${P.nome} · ${c.nomes} · ${fmtD(wedding())}`, ''];
  let n = 1;
  P.groups.forEach(g => {
    const its = g.items.filter(isStar);
    if (its.length){ lines.push(g.g.toUpperCase()); its.forEach(q => lines.push(`${n++}. ${q[2]}`)); lines.push(''); }
  });
  const cu = all('perguntas').filter(p => p.star && (p.pauta||'cerimonia') === P.id);
  if (cu.length){ lines.push('OUTRAS'); cu.forEach(p => lines.push(`${n++}. ${p.texto}`)); }
  return lines.join('\n').trim();
}

VIEWS.hospedagem = () => {
  const c = cfg();
  const hosp = +c.simHosp||0, noites = +c.simNoites||0, pD = Math.min(100, Math.max(0, +c.simDlx||0));
  const nD = Math.round(hosp * pD/100), nS = hosp - nD;
  const custoS = c.simSup * noites, custoD = c.simDlxV * noites;
  const totalConv = nS*custoS + nD*custoD, diarias = hosp * noites, quartos = Math.ceil(hosp/2), ext = +c.simExt||0;
  const extras = [['Privatização do Beauty Center', c.simBeauty ? 4500 : 0],['Early check-in dos noivos (50% da diária × 2)', c.simEarly ? c.simDlxV : 0],[`Refeição de ${ext} fornecedores externos (R$ 420 cada)`, ext*420]];
  const extraTotal = extras.reduce((s,x)=>s+x[1],0);
  const conv = all('convidados'); const cmed = conv.filter(g => g.hosp === 'clubmed' && g.rsvp !== 'nao').length;
  const field = (k,l,v) => `<div class="field"><label for="sim-${k}">${l}</label><input class="inp num" id="sim-${k}" inputmode="numeric" data-save="sim" data-k="${k}" value="${esc(v)}"></div>`;
  return `
  <section class="card">
    <h2>Simulador</h2>
    <p class="small muted" style="margin:0">No Club Med cada convidado reserva e paga a própria hospedagem (all inclusive). Estime quanto seus convidados vão gastar e quantos quartos vão ocupar.</p>
    <div class="grid2">${field('simHosp','Convidados hospedados',hosp)}${field('simNoites','Noites',noites)}${field('simDlx','% em Deluxe',pD)}${field('simExt','Fornecedores externos',ext)}${field('simSup','Diária Superior (R$/pessoa)',c.simSup)}${field('simDlxV','Diária Deluxe (R$/pessoa)',c.simDlxV)}</div>
    <div class="grid2">
      <div class="tile"><div class="l">Por pessoa · Superior</div><div class="v">${brl0(custoS)}</div></div>
      <div class="tile"><div class="l">Por pessoa · Deluxe</div><div class="v">${brl0(custoD)}</div></div>
      <div class="tile"><div class="l">Gasto total dos convidados</div><div class="v">${brl0(totalConv)}</div></div>
      <div class="tile"><div class="l">Quartos (casal por quarto)</div><div class="v num">${quartos} <span class="small muted">de ~250</span></div></div>
    </div>
    <div class="bar ${quartos>125?'f':''}"><i style="width:${Math.min(100,quartos/250*100)}%"></i></div>
    <div class="small muted">${diarias} diárias no total. A tarifa promocional cobre até 40 diárias${diarias>40?`: as outras ${diarias-40} podem sair pela tarifa do dia`:''}. Pergunte se as 40 são por pessoa ou por apartamento.</div>
  </section>
  <section class="card">
    <h3>Extras para o casal</h3>
    <label class="row"><input type="checkbox" class="check" data-save="simchk" data-k="simBeauty" ${c.simBeauty?'checked':''}> Privatizar o Beauty Center</label>
    <label class="row"><input type="checkbox" class="check" data-save="simchk" data-k="simEarly" ${c.simEarly?'checked':''}> Early check-in às 9h</label>
    <dl class="kv">${extras.map(x => `<dt>${esc(x[0])}</dt><dd>${brl0(x[1])}</dd>`).join('')}<dt><b>Total extras</b></dt><dd>${brl0(extraTotal)}</dd></dl>
    <button class="btn ghost" data-act="extras2orc" ${extraTotal?'':'disabled'}>Lançar extras no orçamento</button>
  </section>
  <section class="card">
    <h3>Seus convidados hoje</h3>
    <div class="grid2"><div class="tile"><div class="l">Vão ficar no Club Med</div><div class="v num">${cmed}</div></div><div class="tile"><div class="l">Na lista</div><div class="v num">${conv.length}</div></div></div>
    <div class="stack small">
      <div class="row"><span class="pill ${cmed>=60?'ok':'warn'}">${cmed>=60?'ok':'falta'}</span> Jantar LUA na véspera: mínimo de 60 pessoas</div>
      <div class="row"><span class="pill ${cmed>=80?'ok':'warn'}">${cmed>=80?'ok':'confirmar'}</span> Abertura de porta cortesia: mínimo de 40 apartamentos</div>
    </div>
    <a class="btn ghost" href="#convidados">Abrir lista de convidados</a>
  </section>
  <section class="card guide"><h3>Regras da Carta Benefício</h3><div class="prose small"><ul>
    <li><b>Pacote Especial:</b> a partir de R$ 989 (Superior) ou R$ 1.236 (Deluxe) por pessoa por noite, até 40 diárias.</li>
    <li><b>Prazo:</b> eventos a partir de 2028 têm até 120 dias após a reunião de apresentação do Club Med.</li>
    <li><b>Noivos:</b> ganham as noites do período de maior adesão, em Deluxe. Upgrade para a Suíte Brisa pagando a diferença.</li>
    <li><b>Noite de Experiência:</b> 1 diária para 2 pessoas, fora de janeiro, julho e feriados, até 10 dias antes do evento.</li>
    <li><b>Visita técnica e assessoras:</b> R$ 989 por pessoa, até 4 pessoas.</li>
    <li><b>Check-in</b> às 15h, check-out às 12h com permanência até 15h. Early check-in às 9h por 50% da diária.</li>
    <li><b>Não hospedados</b> só acessam o espaço do evento.</li>
    <li><b>Lua de mel:</b> 10% fora de janeiro, julho, feriados, Natal e Ano Novo.</li>
    <li>Reservas só pelos canais oficiais.</li>
  </ul></div></section>`;
};

VIEWS.convidados = () => {
  const L = all('convidados'), F = UI.convFiltro;
  const k = {sim:L.filter(g=>g.rsvp==='sim').length, cm:L.filter(g=>g.hosp==='clubmed').length, kid:L.filter(g=>g.crianca).length};
  const rows = L.filter(g => F==='todos' || (F==='clubmed' ? g.hosp==='clubmed' : F==='pendente' ? (!g.rsvp || g.rsvp==='pendente') : g.lado===F)).sort((a,b)=>(a.nome||'').localeCompare(b.nome||''));
  const RS = {sim:['Confirmado','ok'],nao:['Não vem','crit'],pendente:['A confirmar','']};
  return `
  <section class="card">
    <div class="grid2 grid4">
      <div class="tile"><div class="l">Na lista</div><div class="v num">${L.length}<span class="small muted">/${cfg().convidados}</span></div></div>
      <div class="tile"><div class="l">Confirmados</div><div class="v num">${k.sim}</div></div>
      <div class="tile"><div class="l">No Club Med</div><div class="v num">${k.cm}</div></div>
      <div class="tile"><div class="l">Crianças</div><div class="v num">${k.kid}</div></div>
    </div>
    <form class="row" data-form="quickguest" style="flex-wrap:nowrap"><input class="inp" id="quick-guest" name="nome" placeholder="Nome do convidado" autocomplete="off"><button class="btn" type="submit">Adicionar</button></form>
  </section>
  <div class="chips">${[['todos','Todos'],['pendente','A confirmar'],['clubmed','No Club Med'],['noiva','Lado ' + nameOf(0)],['noivo','Lado ' + nameOf(1)],['ambos','Dos dois']].map(([k,l]) => `<button class="chip" data-act="convf" data-v="${k}" aria-pressed="${F===k}">${esc(l)}</button>`).join('')}</div>
  <section class="card">${rows.length ? `<div class="list">${rows.map(g => `<div class="item tap" data-act="edit" data-kind="conv" data-id="${esc(g.id)}"><div class="grow"><div class="t">${esc(g.nome)}${g.crianca?' <span class="pill">criança</span>':''}</div><div class="d">${esc([g.grupo, g.hosp==='clubmed'?'Club Med':g.hosp==='outro'?'Outra hospedagem':g.hosp==='nao'?'Não se hospeda':'', g.obs].filter(Boolean).join(' · '))}</div></div><span class="pill ${RS[g.rsvp||'pendente'][1]}">${RS[g.rsvp||'pendente'][0]}</span></div>`).join('')}</div>`
   : `<div class="empty"><h3>${L.length?'Ninguém neste filtro':'Comece a lista'}</h3><p class="small">Digite um nome acima e toque em Adicionar. Depois toque no convidado para marcar lado, grupo, hospedagem e confirmação.</p></div>`}</section>`;
};

const INSP_CATS = ['Vestido','Noivo','Cabelo & make','Igreja','Decoração','Flores','Mesa & louça','Bolo & doces','Papelaria','Música','Lembranças','Lua de mel','Outros'];
VIEWS.inspiracoes = () => {
  const L = all('inspiracoes').sort((a,b)=>(b.atualizadoEm||'').localeCompare(a.atualizadoEm||'')), F = UI.inspFiltro;
  const rows = L.filter(x => F==='Todas' || (F==='Favoritas' ? x.fav : x.categoria===F));
  return `
  <div class="chips">${['Todas','Favoritas',...INSP_CATS].map(k => `<button class="chip" data-act="inspf" data-v="${esc(k)}" aria-pressed="${F===k}">${esc(k)}</button>`).join('')}</div>
  ${rows.length ? `<div class="photos">${rows.map(x => `<div class="ph" data-act="edit" data-kind="insp" data-id="${esc(x.id)}">${x.foto?`<img data-foto="${esc(x.foto)}" alt="${esc(x.titulo||'')}">`:`<div class="noimg">${esc(x.titulo||x.categoria||'Ideia')}</div>`}<div class="cap">${x.fav?'★ ':''}${esc(x.titulo||x.categoria)}<div class="muted small" style="font-weight:400">${esc(x.categoria||'')}</div></div></div>`).join('')}</div>`
  : `<section class="card empty"><h3>Seu mural está vazio</h3><p class="small">Guarde vestidos que provou, prints do Pinterest, flores, bolos e looks. Cada ideia aceita foto, link e uma nota. As fotos ficam guardadas no aparelho. Toque no +.</p></section>`}`;
};

VIEWS.fornecedores = () => {
  const L = all('fornecedores').sort((a,b)=>(a.categoria||'').localeCompare(b.categoria||'') || (a.nome||'').localeCompare(b.nome||''));
  const FS = {pesquisar:['A pesquisar',''],contato:['Em contato','warn'],visitado:['Visitado','mata'],fechado:['Fechado','ok'],descartado:['Descartado','crit']};
  return L.length ? `<section class="card"><p class="small muted" style="margin:0">Lugares que vocês visitaram e profissionais que estão avaliando. Dê nota, anote prós e contras e guarde fotos.</p></section><section class="card"><div class="list">${L.map(f => `<div class="item tap" data-act="edit" data-kind="forn" data-id="${esc(f.id)}">${f.foto?`<img class="thumb" data-foto="${esc(f.foto)}" alt="">`:''}<div class="grow"><div class="t">${esc(f.nome)}</div><div class="d">${esc([f.categoria, f.instagram, f.nota?('nota '+f.nota+'/5'):''].filter(Boolean).join(' · '))}</div>${f.pros?`<div class="d">+ ${esc(f.pros)}</div>`:''}${f.contras?`<div class="d">− ${esc(f.contras)}</div>`:''}</div><span class="pill ${FS[f.status]?.[1]||''}">${FS[f.status]?.[0]||'A pesquisar'}</span></div>`).join('')}</div></section>`
  : `<section class="card empty"><h3>Nenhum fornecedor ainda</h3><p class="small">Registre cada lugar visitado e cada profissional: nota, prós, contras e foto. Toque no +.</p></section>`;
};

VIEWS.guia = () => `
  <section class="card"><p class="small muted" style="margin:0">Passo a passo reunido de fontes especializadas, da paróquia, de cartórios, do Procon e de relatórios de tendências, adaptado ao seu casamento. As fontes estão no fim e precisam de internet para abrir.</p></section>
  <section class="card guide">${GUIDE.map(([t,h],i) => `<details ${i===0?'open':''}><summary>${esc(t)}</summary><div class="prose">${h}</div></details>`).join('')}</section>
  <section class="card"><h3>Fontes consultadas</h3><ul class="src prose">${SOURCES.map(([t,u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ul><p class="small muted" style="margin:0">Pesquisa de outubro de 2026. Valores e regras de terceiros podem mudar: confirme sempre com quem presta o serviço.</p></section>`;

VIEWS.contatos = () => CONTACTS.map(g => `<section class="card"><h3>${esc(g.g)}</h3><div class="list">${g.items.map(([n,p,e,u]) => `<div class="item"><div class="grow"><div class="t">${esc(n)}</div>${p?`<div class="d sel num">${esc(p)}</div>`:''}${e?`<div class="d sel" style="overflow-wrap:anywhere">${esc(e)}</div>`:''}${u?`<div class="d"><a href="${u}" target="_blank" rel="noopener">abrir o site</a></div>`:''}</div><div class="stack">${p&&/\(\d\d\)/.test(p)?`<a class="copy" href="tel:${esc(p.replace(/[^\d]/g,'').slice(0,11))}" style="text-decoration:none;color:inherit">ligar</a>`:''}${e?`<a class="copy" href="mailto:${esc(e)}" style="text-decoration:none;color:inherit">e-mail</a>`:''}</div></div>`).join('')}</div></section>`).join('') + `<section class="card"><h3>Parceiros de foto e filme indicados pela Bisutti</h3><div class="small">Produtora 7 (@produtora7) · Marcos Mesquita (@marcosmesquitafotografia) · Ateliê Filmes (@ateliefilmes) · Rodolfo Santos (@rodolfosantosfotografo) · Vinicius Credidio (@viniciuscredidiofilms)</div></section>`;

VIEWS.ajustes = () => {
  const c = cfg(), m = meta();
  return `
  <form class="card" data-form="cfg">
    <h2>Seu casamento</h2>
    ${fieldHtml({k:'nomes',label:'Nomes (use "&" entre os dois)'}, c.nomes)}
    <div class="grid2">${fieldHtml({k:'data',label:'Data em Trancoso',type:'date'}, c.data)}${fieldHtml({k:'convidados',label:'Convidados',type:'number'}, c.convidados)}</div>
    <div class="grid2">${fieldHtml({k:'cerimoniaHora',label:'Horário da igreja',type:'time'}, c.cerimoniaHora)}${fieldHtml({k:'hora',label:'Horário da festa',type:'time'}, c.hora)}</div>
    ${fieldHtml({k:'igreja',label:'Igreja'}, c.igreja)}
    ${fieldHtml({k:'local',label:'Local da festa'}, c.local)}
    <div class="grid2">${fieldHtml({k:'civilData',label:'Data do civil em SP',type:'date'}, c.civilData)}${fieldHtml({k:'civilCartorio',label:'Cartório'}, c.civilCartorio)}</div>
    ${fieldHtml({k:'meta',label:'Meta de orçamento total (R$)',type:'money'}, c.meta)}
    <h3>Reuniões e contratos</h3>
    <div class="grid2">${fieldHtml({k:'reuniao',label:'Reunião sobre a igreja',type:'date'}, c.reuniao)}${fieldHtml({k:'reuniaoHora',label:'Horário',type:'time'}, c.reuniaoHora)}</div>
    ${fieldHtml({k:'reuniaoFesta',label:'Reunião sobre a festa (Bisutti)',type:'date'}, c.reuniaoFesta)}
    ${fieldHtml({k:'contrato',label:'Assinatura do contrato Bisutti',type:'date'}, c.contrato)}
    ${fieldHtml({k:'reuniaoClubMed',label:'Reunião de apresentação do Club Med',type:'date'}, c.reuniaoClubMed)}
    <button class="btn" type="submit">Salvar</button>
  </form>
  <section class="card">
    <h3>Backup e o celular do David</h3>
    <p class="small" style="margin:0">Tudo fica guardado só neste aparelho, sem internet e sem conta. Para não perder nada e para o David ter os mesmos dados:</p>
    <ul class="prose small" style="margin:0"><li><b>Fazer backup</b> gera um arquivo. Salve no iCloud ou Google Drive, ou mande pelo WhatsApp para o David.</li><li>No outro celular, <b>Importar backup</b> junta os dados: o que foi editado mais recentemente vence, e nada é apagado.</li></ul>
    <div class="small muted">${m.ultimoBackup ? 'Último backup: ' + esc(fmtD(new Date(m.ultimoBackup))) : 'Nenhum backup feito ainda.'}</div>
    <div class="row"><button class="btn" data-act="json">Fazer backup</button><label class="btn ghost" style="cursor:pointer">Importar backup<input type="file" accept="application/json,.json" data-import="1" hidden></label></div>
    <button class="btn line" data-act="csv">Exportar orçamentos (planilha)</button>
  </section>
  <a class="card" href="#aparencia" style="text-decoration:none;color:inherit"><div class="row between"><h3>Aparência</h3><span class="pill">temas</span></div><p class="small muted" style="margin:0">Temas, fontes, cores do casamento, monograma e foto de vocês.</p></a>
  <section class="card">
    <h3>Sobre o app</h3>
    <dl class="kv"><dt>Modo</dt><dd>${S.installed ? 'instalado' : 'no navegador'}</dd><dt>Internet</dt><dd>${S.online ? 'conectado' : 'sem internet'}</dd><dt>Funciona offline</dt><dd>${'serviceWorker' in navigator ? 'sim' : 'não neste navegador'}</dd><dt>Versão</dt><dd>${esc(window.APP_VERSION||'')}</dd></dl>
  </section>`;
};

/* ================================================================
   FORMULÁRIOS (folha inferior)
   ================================================================ */
function fieldHtml(f, v){
  const id = 'f-' + f.k, val = v ?? '';
  let input;
  if (f.type === 'select') input = `<select class="inp" id="${id}" name="${f.k}">${f.options.map(o => { const [ov,ol] = Array.isArray(o)?o:[o,o]; return `<option value="${esc(ov)}" ${String(val)===String(ov)?'selected':''}>${esc(ol)}</option>`; }).join('')}</select>`;
  else if (f.type === 'textarea') input = `<textarea class="inp" id="${id}" name="${f.k}" placeholder="${esc(f.ph||'')}">${esc(val)}</textarea>`;
  else if (f.type === 'check') return `<label class="row"><input type="checkbox" class="check" id="${id}" name="${f.k}" ${val?'checked':''}> ${esc(f.label)}</label>`;
  else if (f.type === 'money') input = `<input class="inp num" id="${id}" name="${f.k}" inputmode="decimal" placeholder="0,00" value="${+val ? esc(Number(val).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})) : ''}">`;
  else if (f.type === 'foto') return `<div class="field"><label>Foto</label><input type="hidden" name="${f.k}" id="${id}" value="${esc(val)}"><div class="row">${val?`<img class="thumb" id="${id}-prev" data-foto="${esc(val)}" alt="" style="width:84px;height:84px">`:`<span class="thumb" id="${id}-prev" style="width:84px;height:84px;display:grid;place-items:center;color:var(--muted)">${icon('cam')}</span>`}<label class="btn ghost sm" style="cursor:pointer">${val?'Trocar foto':'Tirar ou escolher foto'}<input type="file" accept="image/*" data-upload="${id}" hidden></label>${val?`<button type="button" class="copy" data-act="nofoto" data-for="${id}">tirar</button>`:''}</div></div>`;
  else input = `<input class="inp" id="${id}" name="${f.k}" type="${f.type||'text'}" ${f.type==='number'?'inputmode="numeric"':''} placeholder="${esc(f.ph||'')}" value="${esc(val)}">`;
  return `<div class="field"><label for="${id}">${esc(f.label)}</label>${input}</div>`;
}
const SPECS = {
  orc:{col:'orcamentos',title:'Orçamento',fields:[
    {k:'fornecedor',label:'Fornecedor'},
    {k:'frente',label:'Frente (de qual contrato sai o pagamento)',type:'select',options:FRENTES},
    {k:'categoria',label:'Categoria',type:'select',options:CATS},
    {k:'descricao',label:'O que inclui',type:'textarea',ph:'Ex.: 8 horas de cobertura, 2 fotógrafos, igreja e festa'},
    {k:'valor',label:'Valor total (R$)',type:'money'},
    {k:'status',label:'Status',type:'select',options:Object.entries(STATUS).map(([k,v])=>[k,v[0]])},
    {k:'pago',label:'Já pago (R$)',type:'money'},
    {k:'vencimento',label:'Próximo vencimento',type:'date'},
    {k:'notas',label:'Notas e condições',type:'textarea',ph:'Forma de pagamento, multa, reajuste, validade'}
  ],defaults:{categoria:'Fotografia',status:'cotacao',frente:'festa'}},
  deg:{col:'degustacao',title:'Prato provado',fields:[
    {k:'nome',label:'Prato ou bebida'},
    {k:'fornecedor',label:'Fornecedor'},
    {k:'grupo',label:'Tipo',type:'select',options:['Bolo','Doces finos','Bem-casados','Salgado','Prato principal','Sobremesa','Vinho ou espumante','Drink','Outro']},
    {k:'data',label:'Quando provou',type:'date'},
    {k:'nota',label:'Nota',type:'textarea'},
    {k:'foto',type:'foto'}
  ],defaults:{custom:true,grupo:'Bolo'}},
  conv:{col:'convidados',title:'Convidado',fields:[
    {k:'nome',label:'Nome'},
    {k:'lado',label:'Lado',type:'select',options:[['noiva','Noiva'],['noivo','Noivo'],['ambos','Dos dois']]},
    {k:'grupo',label:'Grupo',type:'select',options:['Família','Amigos','Trabalho','Padrinhos e madrinhas','Outros']},
    {k:'rsvp',label:'Confirmação',type:'select',options:[['pendente','A confirmar'],['sim','Confirmado'],['nao','Não vem']]},
    {k:'hosp',label:'Hospedagem',type:'select',options:[['clubmed','Club Med'],['outro','Outra hospedagem'],['nao','Não se hospeda'],['','Ainda não sei']]},
    {k:'crianca',label:'Criança',type:'check'},
    {k:'obs',label:'Observações',ph:'Restrição alimentar, acompanhante...'}
  ],defaults:{lado:'ambos',grupo:'Família',rsvp:'pendente',hosp:''}},
  insp:{col:'inspiracoes',title:'Inspiração',fields:[
    {k:'titulo',label:'Título'},
    {k:'categoria',label:'Categoria',type:'select',options:INSP_CATS},
    {k:'foto',type:'foto'},
    {k:'link',label:'Link (Pinterest, Instagram, loja)',type:'url'},
    {k:'nota',label:'O que eu gostei',type:'textarea'},
    {k:'fav',label:'Favorita',type:'check'}
  ],defaults:{categoria:'Vestido'}},
  forn:{col:'fornecedores',title:'Fornecedor ou visita',fields:[
    {k:'nome',label:'Nome'},
    {k:'categoria',label:'Categoria',type:'select',options:CATS},
    {k:'status',label:'Status',type:'select',options:[['pesquisar','A pesquisar'],['contato','Em contato'],['visitado','Visitado'],['fechado','Fechado'],['descartado','Descartado']]},
    {k:'nota',label:'Nota (1 a 5)',type:'select',options:[['',''],'1','2','3','4','5']},
    {k:'contato',label:'Telefone ou e-mail'},
    {k:'instagram',label:'Instagram'},
    {k:'visita',label:'Data da visita',type:'date'},
    {k:'pros',label:'Pontos fortes',type:'textarea'},
    {k:'contras',label:'Pontos fracos',type:'textarea'},
    {k:'foto',type:'foto'}
  ],defaults:{categoria:'Fotografia',status:'pesquisar'}},
  perg:{col:'perguntas',title:'Nova pergunta',fields:[
    {k:'texto',label:'Pergunta',type:'textarea'},
    {k:'pauta',label:'Pauta',type:'select',options:PAUTAS.map(p=>[p.id,p.nome])},
    {k:'grupo',label:'Contexto (opcional)'},
    {k:'star',label:'Prioridade',type:'check'}
  ],defaults:{star:true}},
  tarefa:{col:'tarefas',title:'Nova tarefa',fields:[
    {k:'titulo',label:'Tarefa'},
    {k:'detalhe',label:'Detalhe',type:'textarea'},
    {k:'fase',label:'Fase',type:'select',options:PHASES.map(p=>[p.id,p.nome])}
  ],defaults:{custom:true}}
};
let sheetCtx = null;
function openSheet(kind, id){
  const sp = SPECS[kind]; if (!sp) return;
  const cur = id ? get(sp.col, id) : null;
  const vals = cur ? {...cur} : {...sp.defaults};
  if (kind==='tarefa' && !id) vals.fase = checklistStats().cur.id;
  if (kind==='perg' && !id) vals.pauta = UI.pauta;
  if (kind==='orc' && !id && UI.orcFrente !== 'todas') vals.frente = UI.orcFrente;
  if (kind==='orc' && cur && !cur.frente) vals.frente = frenteOf(cur);
  sheetCtx = {kind, id, vals};
  UI.delArm = null;
  const sh = document.getElementById('sheet');
  sh.innerHTML = `<div class="grab"></div><div class="row between"><h2>${esc(sp.title)}</h2><button class="copy" data-act="close">fechar</button></div>
    <form class="stack" data-form="sheet">${sp.fields.map(f => fieldHtml(f, vals[f.k])).join('')}
    <button class="btn block" type="submit">Salvar</button>
    ${id ? `<button class="btn danger block" type="button" data-act="del">Excluir</button>`:''}</form>`;
  document.getElementById('sheetWrap').hidden = false;
  document.body.style.overflow = 'hidden';
  hydratePhotos(sh);
  setTimeout(() => { const first = sh.querySelector('input:not([type=hidden]),textarea'); if (first && !id) first.focus(); }, 60);
}
function closeSheet(){ document.getElementById('sheetWrap').hidden = true; document.body.style.overflow = ''; sheetCtx = null; scheduleRender(); }
function readForm(form, fields){
  const out = {};
  fields.forEach(f => {
    const el = form.elements[f.k]; if (!el) return;
    if (f.type==='check') out[f.k] = el.checked;
    else if (f.type==='money') out[f.k] = parseMoney(el.value);
    else if (f.type==='number') out[f.k] = Number(el.value)||0;
    else out[f.k] = el.value.trim();
  });
  return out;
}
async function compress(file){
  try {
    const bmp = await createImageBitmap(file);
    const s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const cv = document.createElement('canvas'); cv.width = Math.round(bmp.width*s); cv.height = Math.round(bmp.height*s);
    cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
    return await new Promise(r => cv.toBlob(b => r(b || file), 'image/jpeg', 0.82));
  } catch(e){ return file; }
}

/* ================================================================
   BACKUP, IMPORTAÇÃO E PLANILHA
   ================================================================ */
async function offerFile(filename, blob){
  const file = new File([blob], filename, {type: blob.type});
  if (navigator.canShare && navigator.canShare({files:[file]})){
    try { await navigator.share({files:[file], title: filename}); return true; }
    catch(e){ if (e && e.name === 'AbortError') return false; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  return true;
}
const blobToDataUrl = b => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(null); r.readAsDataURL(b); });
async function exportJson(){
  toast('Preparando o backup...');
  const out = {app:'rumo-a-trancoso', versao:1, exportadoEm:new Date().toISOString(), apagados: meta().apagados || {}, fotos:{}};
  COLS.forEach(c => { out[c] = {}; S.data[c].forEach((v,k) => { const b = {...v}; delete b.id; out[c][k] = b; }); });
  const used = new Set(); COLS.forEach(c => S.data[c].forEach(v => ['foto','monograma','capa'].forEach(k => v[k] && used.add(v[k]))));
  for (const id of used){ const b = await fotoGet(id); if (b) out.fotos[id] = await blobToDataUrl(b); }
  const stamp = new Date().toISOString().slice(0,10);
  const ok = await offerFile(`backup-rumo-a-trancoso-${stamp}.json`, new Blob([JSON.stringify(out)], {type:'application/json'}));
  if (ok){ setMeta({ultimoBackup: new Date().toISOString()}); toast('Backup pronto. Guarde o arquivo num lugar seguro.'); scheduleRender(); }
}
async function importJson(file){
  let data;
  try { data = JSON.parse(await file.text()); } catch(e){ toast('Esse arquivo não é um backup do app.'); return; }
  if (!data || data.app !== 'rumo-a-trancoso'){ toast('Esse arquivo não é um backup do app.'); return; }
  const del = {...(meta().apagados || {}), ...(data.apagados || {})};
  let novos = 0, atualizados = 0;
  COLS.forEach(c => {
    const inc = data[c] || {};
    Object.entries(inc).forEach(([id, doc]) => {
      const dKey = c + '/' + id;
      if (del[dKey] && (doc.atualizadoEm || '') <= del[dKey]) { S.data[c].delete(id); return; }
      const cur = S.data[c].get(id);
      if (!cur){ S.data[c].set(id, {...doc, id}); novos++; }
      else if ((doc.atualizadoEm || '') > (cur.atualizadoEm || '')){ S.data[c].set(id, {...doc, id}); atualizados++; }
    });
    // o que o outro aparelho apagou também sai daqui
    S.data[c].forEach((v, id) => { const dk = c + '/' + id; if (del[dk] && (v.atualizadoEm || '') <= del[dk]) S.data[c].delete(id); });
    persist(c);
  });
  setMeta({apagados: del});
  for (const [id, url] of Object.entries(data.fotos || {})){
    try { const b = await (await fetch(url)).blob(); await fotoPut(id, b); } catch(e){}
  }
  toast(`Backup importado: ${novos} novos e ${atualizados} atualizados.`, 4500);
  render();
}
function exportCsv(){
  const head = ['Frente','Categoria','Fornecedor','Descrição','Valor','Status','Pago','Vencimento','Notas'];
  const q = v => '"' + String(v ?? '').replace(/"/g,'""') + '"';
  const num = v => (Number(v)||0).toFixed(2).replace('.',',');
  const lines = [head.join(';'), ...all('orcamentos').map(r => [q(FRENTES.find(f=>f[0]===frenteOf(r))?.[1]),q(r.categoria),q(r.fornecedor),q(r.descricao),num(r.valor),q(STATUS[r.status]?.[0]||''),num(r.pago),q(r.vencimento),q(r.notas)].join(';'))];
  offerFile('orcamentos-casamento.csv', new Blob(['﻿' + lines.join('\n')], {type:'text/csv'}));
}

/* ================================================================
   EVENTOS
   ================================================================ */
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act, id = el.dataset.id;
  switch(act){
    case 'back': location.hash = 'mais'; break;
    case 'go': location.hash = el.dataset.to; break;
    case 'new': openSheet(el.dataset.kind); break;
    case 'edit': openSheet(el.dataset.kind, id); break;
    case 'close': closeSheet(); break;
    case 'del': {
      if (UI.delArm !== 'sheet'){ UI.delArm = 'sheet'; el.textContent = 'Toque de novo para excluir'; return; }
      const sp = SPECS[sheetCtx.kind]; remove(sp.col, sheetCtx.id); closeSheet(); toast('Excluído'); break;
    }
    case 'nofoto': { const inp = document.getElementById(el.dataset.for); inp.value=''; const p = document.getElementById(el.dataset.for+'-prev'); if (p) p.outerHTML = `<span class="thumb" id="${el.dataset.for}-prev" style="width:84px;height:84px"></span>`; el.remove(); break; }
    case 'task': return;
    case 'deltask': e.preventDefault(); remove('tarefas', id); break;
    case 'orcf': UI.orcFiltro = el.dataset.v; render(); break;
    case 'orcfr': UI.orcFrente = el.dataset.v; render(); break;
    case 'degf': UI.degFiltro = el.dataset.v; render(); break;
    case 'reuf': UI.reuFiltro = el.dataset.v; render(); break;
    case 'pauta': UI.pauta = el.dataset.v; if (view === 'reuniao') render(); break;
    case 'convf': UI.convFiltro = el.dataset.v; render(); break;
    case 'inspf': UI.inspFiltro = el.dataset.v; render(); break;
    case 'rate': { const cur = get('degustacao', id) || {}; const who = el.dataset.who, v = el.dataset.v; save('degustacao', id, {...cur, [who]: cur[who]===v ? '' : v}); break; }
    case 'pick': { const cur = get('degustacao', id) || {}; save('degustacao', id, {...cur, escolhido: !cur.escolhido}); break; }
    case 'note': UI.notesOpen.add(id); render(); setTimeout(() => document.querySelector(`textarea[data-id="${CSS.escape(id)}"]`)?.focus(), 30); break;
    case 'star': {
      if (el.dataset.custom==='1'){ const p = get('perguntas', id); save('perguntas', id, {...p, star: !p.star}); }
      else { const ov = get('respostas', id) || {}; const base = PAUTAS.flatMap(p=>p.groups).flatMap(g=>g.items).find(q=>q[0]===id); save('respostas', id, {...ov, star: !isStar(base)}); }
      break;
    }
    case 'delq': if (UI.delArm !== id){ UI.delArm = id; render(); return; } remove('perguntas', id); UI.delArm = null; break;
    case 'copypauta': copyText(pautaText(), el); break;
    case 'sharepauta': if (navigator.share){ try { await navigator.share({text: pautaText()}); } catch(err){} } else copyText(pautaText(), el); break;
    case 'csv': exportCsv(); break;
    case 'json': exportJson(); break;
    case 'install': if (S.installPrompt){ S.installPrompt.prompt(); S.installPrompt = null; } break;
    case 'reload': location.reload(); break;
    case 'extras2orc': {
      const c = cfg(), ext = +c.simExt||0, add = [];
      if (c.simBeauty) add.push(['noivos','Beleza','Club Med · Trancoso Beauty Center','Privatização do Beauty Center (8 h, 8 cadeiras + 2 manicure)',4500]);
      if (c.simEarly) add.push(['viagem','Hospedagem','Club Med','Early check-in dos noivos às 9h (50% da diária × 2)',c.simDlxV]);
      if (ext) add.push(['festa','Outros','Club Med',`Refeição de ${ext} fornecedores externos (R$ 420 cada)`,ext*420]);
      add.forEach(([fr,cat,f,d,v]) => save('orcamentos', 'sim-'+slug(d.slice(0,24)), {frente:fr, categoria:cat, fornecedor:f, descricao:d, valor:v, status:'cotacao', pago:0}));
      toast(add.length + ' itens lançados no orçamento'); break;
    }
  }
});
document.addEventListener('change', async e => {
  const el = e.target;
  if (el.dataset.act === 'task'){ const cur = get('tarefas', el.dataset.id) || {}; save('tarefas', el.dataset.id, {...cur, feito: el.checked, em: el.checked ? new Date().toISOString() : ''}); return; }
  if (el.dataset.import){ const f = el.files && el.files[0]; if (f) importJson(f); el.value = ''; return; }
  const kind = el.dataset.save;
  if (kind === 'degnota'){ const cur = get('degustacao', el.dataset.id) || {}; if ((cur.nota||'') !== el.value.trim()) save('degustacao', el.dataset.id, {...cur, nota: el.value.trim()}); UI.notesOpen.delete(el.dataset.id); }
  else if (kind === 'resp'){ const cur = get('respostas', el.dataset.id) || {}; if ((cur.resp||'') !== el.value) save('respostas', el.dataset.id, {...cur, resp: el.value}); }
  else if (kind === 'pergresp'){ const cur = get('perguntas', el.dataset.id) || {}; if ((cur.resp||'') !== el.value) save('perguntas', el.dataset.id, {...cur, resp: el.value}); }
  else if (kind === 'sim'){ setCfg({[el.dataset.k]: Math.max(0, parseMoney(el.value))}); }
  else if (kind === 'simchk'){ setCfg({[el.dataset.k]: el.checked}); }
  if (el.dataset.upload){
    const file = el.files && el.files[0]; if (!file) return;
    const hid = document.getElementById(el.dataset.upload), prev = document.getElementById(el.dataset.upload+'-prev');
    try {
      const blob = await compress(file), fid = 'f' + uid();
      await fotoPut(fid, blob);
      URLS.set(fid, URL.createObjectURL(blob));
      hid.value = fid;
      if (prev) prev.outerHTML = `<img class="thumb" id="${el.dataset.upload}-prev" src="${URLS.get(fid)}" alt="" style="width:84px;height:84px">`;
      toast('Foto adicionada. Toque em Salvar.');
    } catch(err){ toast('Não deu para guardar a foto neste aparelho.'); }
  }
});
document.addEventListener('submit', e => {
  const f = e.target; e.preventDefault();
  if (f.dataset.form === 'sheet' && sheetCtx){
    const sp = SPECS[sheetCtx.kind];
    const vals = {...sheetCtx.vals, ...readForm(f, sp.fields)};
    const main = sp.fields[0].k;
    if (!String(vals[main]||'').trim()){ toast('Preencha o campo "' + sp.fields[0].label + '".'); return; }
    const prevFoto = sheetCtx.id && get(sp.col, sheetCtx.id)?.foto;
    if (prevFoto && prevFoto !== vals.foto) fotoDel(prevFoto);
    save(sp.col, sheetCtx.id || uid(), vals); closeSheet(); toast('Salvo');
  } else if (f.dataset.form === 'cfg'){
    const fields = ['nomes','data','cerimoniaHora','hora','igreja','local','civilData','civilCartorio','reuniao','reuniaoHora','reuniaoFesta','contrato','reuniaoClubMed'].map(k=>({k})).concat([{k:'convidados',type:'number'},{k:'meta',type:'money'}]);
    const v = readForm(f, fields);
    if (!v.data){ toast('Informe a data do casamento.'); return; }
    if (v.civilData && v.civilData > v.data) toast('Atenção: o civil está depois da cerimônia na igreja.', 4500); else toast('Ajustes salvos');
    setCfg(v);
  } else if (f.dataset.form === 'quickguest'){
    const n = f.elements.nome.value.trim(); if (!n) return;
    save('convidados', uid(), {nome:n, lado:'ambos', grupo:'Família', rsvp:'pendente', hosp:''});
    f.elements.nome.value = ''; f.elements.nome.blur(); toast(n + ' adicionado');
  }
});
document.addEventListener('toggle', e => {
  const d = e.target;
  if (d.dataset && d.dataset.group){ d.open ? UI.degOpen.add(d.dataset.group) : UI.degOpen.delete(d.dataset.group); }
  if (d.dataset && d.dataset.phase && d.open) UI.phaseOpen = d.dataset.phase;
}, true);
document.getElementById('sheetWrap').addEventListener('click', e => { if (e.target.id === 'sheetWrap') closeSheet(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheetCtx) closeSheet(); });

/* ================================================================
   APP INSTALÁVEL E OFFLINE
   ================================================================ */
S.installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); S.installPrompt = e; scheduleRender(); });
addEventListener('appinstalled', () => { S.installed = true; scheduleRender(); });
addEventListener('online', () => { S.online = true; scheduleRender(); });
addEventListener('offline', () => { S.online = false; scheduleRender(); });
if ('serviceWorker' in navigator && location.protocol !== 'file:'){
  navigator.serviceWorker.register('sw.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      nw && nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller){
          const t = document.getElementById('toast');
          t.innerHTML = 'Nova versão do app disponível. <button class="copy" data-act="reload">atualizar</button>'; t.hidden = false;
        }
      });
    });
  }).catch(() => {});
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

/* a inicialização fica no fim de theme.js, que é carregado depois deste arquivo */
