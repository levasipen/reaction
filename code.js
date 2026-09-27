const S_URL = "https://mhkfedjyrjffnutbsqab.supabase.co";
const S_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oa2ZlZGp5cmpmZm51dGJzcWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NDA2NzksImV4cCI6MjEwNjExNjY3OX0.crgRaQC7TWF9Ng1KvztuIpdCl7fu3cjuYXHUxtb_4ZE";

const sb = supabase.createClient(S_URL, S_KEY);

let cnt = 0, times = [];
let run = false, show = false, block = false, col = '';
let ans = '', t0 = null, timeout = null, mode = 'c';
let curUser = null, lbMode = 'c', selOpt = '';

const tg = document.getElementById('target');
const txt = document.getElementById('msg');
const num = document.getElementById('cnt');
const lst = document.getElementById('last');
const btn = document.getElementById('btn');
const err = document.getElementById('err');
const inf = document.getElementById('info');

function setM() {
  if (run) return;
  mode = document.querySelector('input[name="m"]:checked').value;
  if (mode === 'c') inf.innerHTML = 'Green — F. Red — J.';
  else if (mode === 's') inf.innerHTML = 'Blue — Spacebar (0.3-5s)';
  else if (mode === 'k') inf.innerHTML = 'Top: 1,2,3 | Bottom: 8,9,0';
  else inf.innerHTML = 'Press letter A-Z (1-2s)';
  txt.innerText = 'Mode ready';
}

async function accountAction(type) {
  const nick = document.getElementById('auth-nick').value.trim();
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-pass').value;
  const amsg = document.getElementById('auth-msg');

  if(!nick || !pass || (type === 'reg' && !email)) {
    amsg.innerText = "Please fill all fields!";
    return;
  }

  if (type === 'reg') {
    const { data: chk } = await sb.from('players').select('username').eq('username', nick).maybeSingle();
    if (chk) { amsg.innerText = "Nickname taken!"; return; }

    const { data, error } = await sb.auth.signUp({ email: email, password: pass });
    if (error) { amsg.innerText = error.message; return; }

    await sb.from('players').insert({ id: data.user.id, username: nick });
    amsg.innerText = "Check email for dynamic signup link!";
  } else {
    const { data, error } = await sb.auth.signInWithPassword({ email: email, password: pass });
    if (error) { amsg.innerText = error.message; return; }

    const { data: pData } = await sb.from('players').select('*').eq('id', data.user.id).single();
    curUser = pData;

    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('user-title').innerText = curUser.username;
    loadLB();
  }
}

function start() {
  cnt = 0; times = []; show = false; block = false; run = true;
  btn.style.display = 'none'; lst.innerText = '0.000'; num.innerText = '0';
  err.style.display = 'none'; btn.blur();
  document.querySelectorAll('input[name="m"]').forEach(el => el.disabled = true);
  next();
}

function next() {
  if (cnt >= 10) { end(); return; }
  show = false; block = false; tg.style.display = 'none';
  txt.style.display = 'block'; txt.innerText = 'Wait for it...'; err.style.display = 'none';
  
  let isS = (mode==='s' || mode==='letter');
  let min = isS ? (mode==='letter'?1000:300) : 500;
  let max = isS ? (mode==='letter'?2000:5000) : 3000;
  timeout = setTimeout(go, Math.random() * (max - min) + min);
}

function go() {
  txt.style.display = 'none'; tg.innerText = '';
  if (mode === 'c') {
    col = Math.random() < 0.5 ? 'g' : 'r';
    tg.style.backgroundColor = col === 'g' ? '#00ff88' : '#ff4444';
    setRect(100, 100, 'calc(50% - 50px)', 'calc(50% - 50px)');
  } else if (mode === 's') {
    col = 'b'; tg.style.backgroundColor = '#00e1ff';
    setRect(100, 100, 'calc(50% - 50px)', 'calc(50% - 50px)');
  } else if (mode === 'k') {
    col = 'y'; tg.style.backgroundColor = '#ffcc00'; setRect(30, 30, '0', '0');
    let positions = [
      {k:'1', l:'10px', t:'10px'}, {k:'2', l:'calc(50% - 15px)', t:'10px'}, {k:'3', l:'calc(100% - 40px)', t:'10px'},
      {k:'8', l:'10px', t:'calc(100% - 40px)'}, {k:'9', l:'calc(50% - 15px)', t:'calc(100% - 40px)'}, {k:'0', l:'calc(100% - 40px)', t:'calc(100% - 40px)'}
    ];
    let pos = positions[Math.floor(Math.random() * positions.length)];
    ans = pos.k; tg.style.left = pos.l; tg.style.top = pos.t;
  } else {
    let abc = 'abcdefghijklmnopqrstuvwxyz'; ans = abc[Math.floor(Math.random() * abc.length)];
    tg.innerText = ans.toUpperCase(); tg.style.backgroundColor = '#ffcc00'; tg.style.color = '#121214';
    setRect(40, 40, (Math.floor(Math.random()*370)+10)+'px', (Math.floor(Math.random()*130)+10)+'px');
  }
  tg.style.display = 'block'; show = true; t0 = performance.now();
}

function setRect(w, h, l, t) {
  tg.style.width = w+'px'; tg.style.height = h+'px'; tg.style.left = l; tg.style.top = t;
  if(mode==='letter') { tg.style.lineHeight = h+'px'; tg.style.fontSize = '18px'; }
}

window.addEventListener('keydown', (e) => {
  if (!run || block) return;
  let k = e.key.toLowerCase();
  let isC = (mode === 'c' && (k === 'f' || k === 'j'));
  let isS = (mode === 's' && e.code === 'Space');
  let isK = (mode === 'k' && ['1','2','3','8','9','0'].includes(k));
  let isL = (mode === 'letter' && k.length === 1 && k >= 'a' && k <= 'z');
  
  if (!isC && !isS && !isK && !isL) return;
  e.preventDefault();

  if (!show) {
    if (timeout) clearTimeout(timeout);
    reset('CHEATER!'); return;
  }

  let checkC = (col === 'g' && k === 'f') || (col === 'r' && k === 'j');
  if (mode === 'c' && checkC) ok();
  else if (mode === 's' && e.code === 'Space') ok();
  else if ((mode === 'k' || mode === 'letter') && k === ans) ok();
  else reset('WRONG KEY! RESET!');
});

function ok() {
  let dt = (performance.now() - t0) / 1000; times.push(dt);
  lst.innerText = dt.toFixed(3); cnt++; num.innerText = cnt;
  show = false; tg.style.display = 'none'; next();
}

function reset(m) {
  block = true; show = false; tg.style.display = 'none';
  txt.style.display = 'none'; err.innerText = m; err.style.display = 'block';
  cnt = 0; times = []; num.innerText = '0'; lst.innerText = '0.000';
  setTimeout(() => { err.style.display = 'none'; next(); }, 2000);
}

async function end() {
  run = false; txt.style.display = 'block'; txt.innerText = 'Saving score...';
  document.querySelectorAll('input[name="m"]').forEach(el => el.disabled = false);
  
  let sum = times.reduce((a, b) => a + b, 0);
  let sc = parseFloat((sum / times.length).toFixed(3));
  
  let f = mode === 'c' ? 'c_test' : mode === 's' ? 's_test' : mode === 'k' ? 'k_test' : 'l_test';
  curUser[f] = sc;
  
  await sb.from('players').update({ [f]: sc }).eq('id', curUser.id);
  
  txt.innerText = 'Saved!';
  btn.style.display = 'inline-block'; btn.innerText = 'Restart';
  loadLB();
}

let glPlayers = [];
async function loadLB() {
  const { data } = await sb.from('players').select('*');
  glPlayers = data || [];
  renderLB();
}

function switchLB(tMode) {
  lbMode = tMode;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tMode}`).classList.add('active');
  renderLB();
}

function renderLB() {
  const q = document.getElementById('search-input').value.toLowerCase();
  const c = document.getElementById('lb-content');
  c.innerHTML = '';

  let f = lbMode === 'c' ? 'c_test' : lbMode === 's' ? 's_test' : lbMode === 'k' ? 'k_test' : 'l_test';
  let fil = glPlayers.filter(p => p.username.toLowerCase().includes(q));
  fil.sort((a, b) => (a[f] || 999) - (b[f] || 999));

  fil.forEach((p, idx) => {
    const hasAll = p.c_test > 0 && p.s_test > 0 && p.k_test > 0 && p.l_test > 0;
    const sc = hasAll ? (p[f] ? p[f].toFixed(3) : '—') : '—';

    let row = document.createElement('div');
    row.className = 'lb-row';
    row.innerHTML = `
      <span>#${idx+1} <b>${p.username}</b></span>
      <span>${sc} s <span class="three-dots" onclick="openMenu('${p.username}')">•••</span></span>
    `;
    c.appendChild(row);
  });
}

function openMenu(nick) {
  if(nick !== curUser.username) { alert("This is not your profile!"); return; }
  const modal = document.getElementById('menu-modal');
  const inputs = document.getElementById('menu-inputs');
  modal.style.display = 'block';
  inputs.innerHTML = `
    <select id="menu-opt" onchange="drawFields()" style="padding:5px;">
      <option value="">-- Actions --</option>
      <option value="n">1. Change Username</option>
      <option value="p">2. Change Password</option>
      <option value="r">3. Redo Test</option>
    </select>
    <div id="df"></div>
  `;
}

function drawFields() {
  const opt = document.getElementById('menu-opt').value;
  const div = document.getElementById('df');
  selOpt = opt;
  if(opt === 'n') {
    div.innerHTML = `<input type="text" id="m-n" placeholder="New username">`;
  } else if(opt === 'p') {
    div.innerHTML = `<p style="font-size:10px;">Link will be sent to email.</p>`;
  } else if(opt === 'r') {
    div.innerHTML = `<select id="m-t">
      <option value="c_test">Choice</option>
      <option value="s_test">Sprint</option>
      <option value="k_test">Digits</option>
      <option value="l_test">Letters</option>
    </select>`;
  } else div.innerHTML = '';
}

async function submitMenuAction() {
  if(!selOpt) return;
  try {
    if(selOpt === 'n') {
      const nn = document.getElementById('m-n').value.trim();
      await sb.from('players').update({ username: nn }).eq('id', curUser.id);
      curUser.username = nn;
      document.getElementById('user-title').innerText = nn;
    } else if(selOpt === 'p') {
      await sb.auth.resetPasswordForEmail(curUser.email);
      alert("Link sent!");
    } else if(selOpt === 'r') {
      const t = document.getElementById('m-t').value;
      await sb.from('players').update({ [t]: 0 }).eq('id', curUser.id);
      curUser[t] = 0;
    }
    closeMenu(); loadLB();
  } catch(e) { alert(e.message); }
}

function closeMenu() {
  document.getElementById('menu-modal').style.display = 'none';
}
