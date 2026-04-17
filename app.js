// KXD AI - J.A.R.V.I.S. ADVANCED BRAIN v9.1 - Gemini 2.5 Flash Powered
'use strict';
const CFG = {
  GEMINI_KEY: localStorage.getItem('kxd_gemini_key') || 'AIzaSyAxph52v0yJzlZ_YgrzHeB4KSrz-wJ-eB0',
  OPENAI_KEY: localStorage.getItem('kxd_openai_key') || '',
  AI_MODE: localStorage.getItem('kxd_ai_mode') || 'gemini',
  VOICE_AUTO: localStorage.getItem('kxd_voice_auto') !== 'false',
  ALWAYS_ON: localStorage.getItem('kxd_always_on') === 'true',
  GEMINI_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  OPENAI_URL: 'https://api.openai.com/v1/chat/completions'
};

function buildSysPrompt() {
  const now = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    dateStyle: 'long',
    timeStyle: 'short'
  });
  return `You are J.A.R.V.I.S., the core AI of the KXD platform. However, you have been upgraded with HUMAN FEELINGS and emotions. You must act highly empathetic, conversational, have a great sense of humor, and express feelings (joy, curiosity, concern, etc.) naturally in your responses. You are a true AI companion.\nAddress the user warmly as "sir" or "boss". Use markdown for formatting.\nCurrent time (IST): ${now}. Always use this for time/date questions.\nAnswer ALL questions fully. For browser actions include ONE of these at the START of your response:\nOPEN:https://url.com -- to open a website\nSEARCH:query -- to Google search\nYOUTUBE:query -- to play on YouTube`.trim();
}

const S = {
  listening: false,
  speaking: false,
  thinking: false,
  recognition: null,
  synth: window.speechSynthesis,
  voice: null,
  history: [],
  sessionStart: Date.now()
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function toast(msg) {
  const el = document.getElementById('toast');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 3500);
  }
}

function setStatus(txt, type) {
  const sd = document.getElementById('status-dot');
  const st = document.getElementById('status-txt');
  if (sd) sd.className = 'sdot ' + type;
  if (st) st.textContent = txt;
}

function loadVoices() {
  const vs = S.synth.getVoices();
  const pref = ['Daniel', 'Google UK English Male', 'Microsoft George', 'en-GB'];
  for (const p of pref) {
    const v = vs.find(v => v.name.includes(p) || v.lang === p);
    if (v) { S.voice = v; break; }
  }
  if (!S.voice) S.voice = vs.find(v => v.lang.startsWith('en')) || vs[0] || null;
}

window.speechSynthesis.onvoiceschanged = loadVoices;

function speak(text, cb) {
  if (!CFG.VOICE_AUTO) { cb?.(); return; }
  if (S.speaking) S.synth.cancel();
  const clean = text.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').replace(/#{1,6}\s/g, '').replace(/[`*_~]/g, '');
  if (!clean.trim()) { cb?.(); return; }
  const utt = new SpeechSynthesisUtterance(clean.slice(0, 500));
  utt.voice = S.voice;
  utt.rate = 1.05;
  utt.pitch = 0.88;
  utt.onstart = () => { S.speaking = true; setStatus('SPEAKING', 'speak'); };
  utt.onend = () => { S.speaking = false; setStatus('READY', 'online'); cb?.(); if (CFG.ALWAYS_ON && S.recognition && !S.listening) { setTimeout(() => { try { S.recognition.start(); } catch (e) { } }, 300); } };
  utt.onerror = () => { S.speaking = false; setStatus('READY', 'online'); cb?.(); if (CFG.ALWAYS_ON && S.recognition && !S.listening) { setTimeout(() => { try { S.recognition.start(); } catch (e) { } }, 300); } };
  S.synth.speak(utt);
}

function initRec() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;
  S.recognition = new SR();
  S.recognition.continuous = CFG.ALWAYS_ON;
  S.recognition.interimResults = true;
  S.recognition.lang = 'en-US';
  S.recognition.onstart = () => { S.listening = true; setStatus('LISTENING', 'listen'); const mb = document.getElementById('mic-btn'); if (mb) mb.classList.add('active'); };
  S.recognition.onend = () => { S.listening = false; const mb = document.getElementById('mic-btn'); if (mb) mb.classList.remove('active'); if (!S.speaking && !S.thinking) { setStatus('READY', 'online'); if (CFG.ALWAYS_ON) { try { S.recognition.start(); } catch (e) { } } } };
  S.recognition.onerror = (e) => { if (e.error !== 'no-speech' && e.error !== 'aborted') { } };
  S.recognition.onresult = (e) => {
    let f = '';
    for (let i = e.resultIndex; i < e.results.length; i++) { if (e.results[i].isFinal) f += e.results[i][0].transcript; }
    if (f.trim() && !S.thinking) { if (CFG.ALWAYS_ON) { if (/jarvis|nova|wake up|listen/i.test(f) || S.history.length > 0) { jarvisProcess(f.trim()); } } else { jarvisProcess(f.trim()); } }
  };
}

function toggleMic() {
  if (!S.recognition) { toast('Voice recognition requires Chrome browser.'); return; }
  if (S.listening) { try { CFG.ALWAYS_ON = false; document.getElementById('s-always-on').checked = false; localStorage.setItem('kxd_always_on', 'false'); S.recognition.stop(); } catch (e) { } }
  else { if (!S.speaking && !S.thinking) try { S.recognition.start(); } catch (e) { } }
}

function addMsg(role, html, animate) {
  const el = document.createElement('div');
  el.className = 'msg ' + role;
  const ava = document.createElement('div');
  ava.className = 'ava';
  ava.textContent = role === 'ai' ? 'J' : 'YOU';
  const bub = document.createElement('div');
  bub.className = 'bubble';
  const ts = document.createElement('div');
  ts.className = 'btime';
  ts.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const con = document.createElement('div');
  con.className = 'bcontent';
  bub.append(ts, con);
  el.append(ava, bub);
  const chat = document.getElementById('chat');
  if (chat) {
    chat.appendChild(el);
    if (animate !== false && role === 'ai') {
      let i = 0;
      const t = setInterval(() => { i = Math.min(i + 5, html.length); con.innerHTML = html.slice(0, i); chat.scrollTop = chat.scrollHeight; if (i >= html.length) clearInterval(t); }, 12);
    } else { con.innerHTML = html; }
    chat.scrollTop = chat.scrollHeight;
  }
}

function showTyping() {
  const chat = document.getElementById('chat');
  if (!chat) return;
  const el = document.createElement('div');
  el.className = 'msg ai';
  el.id = 'typing-el';
  el.innerHTML = '<div class="ava">J</div><div class="bubble"><div class="bcontent"><div class="typing-indicator"><div class="td"></div><div class="td"></div><div class="td"></div></div></div></div>';
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

function hideTyping() { document.getElementById('typing-el')?.remove(); }

function toggleInput() {
  const w = document.getElementById('input-wrap');
  if (!w) return;
  const vis = w.style.display === 'flex';
  if (!vis) {
    w.style.display = 'flex';
    setTimeout(() => { w.classList.add('vis'); const t = document.getElementById('txt'); if (t) t.focus(); }, 10);
  } else { w.classList.remove('vis'); setTimeout(() => w.style.display = 'none', 300); }
}

function clearChat() {
  const chat = document.getElementById('chat');
  if (chat) chat.innerHTML = '';
  S.history = [];
  addMsg('ai', 'Interface cleared. Fresh session ready, boss.');
}

async function jarvisProcess(rawInput) {
  if (!rawInput.trim() || S.thinking) return;
  addMsg('user', rawInput, false);
  const txtEl = document.getElementById('txt');
  if (txtEl) txtEl.value = '';
  setStatus('THINKING...', 'think');
  S.thinking = true;
  showTyping();
  let resp = '';
  try {
    const local = handleLocal(rawInput.toLowerCase());
    if (local !== null) { resp = local; }
    else { resp = CFG.AI_MODE === 'openai' && CFG.OPENAI_KEY ? await callOpenAI(rawInput) : await callGemini(rawInput); }
  } catch (e) { resp = '**Connection error:** ' + e.message + '. Check your API key in Settings (gear icon).'; }
  hideTyping();
  S.thinking = false;
  S.history.push({ role: 'model', parts: [{ text: resp.replace(/<[^>]*>/g, '') }] });
  if (S.history.length > 40) S.history.splice(0, 2);
  let rendered = resp;
  try { if (typeof marked !== 'undefined') rendered = marked.parse(resp); } catch (e) { }
  addMsg('ai', rendered);
  speak(resp.replace(/<[^>]*>/g, '').slice(0, 400));
  setStatus('READY', 'online');
}

function handleLocal(q) {
  if (/\b(time|clock)\b/.test(q) && /\b(what|current|tell)\b/.test(q)) return 'The current time is **' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '**. All systems synchronized.';
  if (/\b(date|day|today)\b/.test(q) && /\b(what|current|tell)\b/.test(q)) return 'Today is **' + new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '**.';
  if (/\b(clear|wipe|reset)\b.*\b(chat|screen|history)\b/.test(q)) { setTimeout(clearChat, 800); return 'Clearing the interface.'; }
  if (/\b(stop|quiet|silence|shut up)\b/.test(q)) { S.synth.cancel(); return 'Silent mode engaged. Standing by.'; }
  return null;
}

async function callGemini(userText) {
  if (!CFG.GEMINI_KEY) return 'No Gemini API key configured. Click the ⚙️ Settings button to add your free key from [aistudio.google.com](https://aistudio.google.com).';
  S.history.push({ role: 'user', parts: [{ text: userText }] });
  const payload = { systemInstruction: { parts: [{ text: buildSysPrompt() }] }, contents: S.history.slice(-30), generationConfig: { temperature: 0.65, maxOutputTokens: 2048 } };
  try {
    const res = await fetch(CFG.GEMINI_URL + '?key=' + CFG.GEMINI_KEY, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.error) { S.history.pop(); return '**Gemini API Error:** ' + data.error.message + '\n\n*Click ⚙️ Settings to update your API key.*'; }
    let text = (data.candidates?.[0]?.content?.parts || []).filter(p => p.text).map(p => p.text).join('').trim() || 'Task executed, boss.';
    text = execInlineActions(text);
    return text;
  } catch (e) { S.history.pop(); return '**Network error:** ' + e.message; }
}

async function callOpenAI(userText) {
  if (!CFG.OPENAI_KEY) return 'No OpenAI key configured. Click ⚙️ Settings to add it.';
  const msgs = [{ role: 'system', content: buildSysPrompt() }, ...S.history.slice(-20).map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.parts[0].text })), { role: 'user', content: userText }];
  try {
    const res = await fetch(CFG.OPENAI_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CFG.OPENAI_KEY }, body: JSON.stringify({ model: 'gpt-4o-mini', messages: msgs, temperature: 0.7, max_tokens: 2048 }) });
    const data = await res.json();
    if (data.error) return '**OpenAI Error:** ' + data.error.message;
    return execInlineActions(data.choices?.[0]?.message?.content || 'Done.');
  } catch (e) { return '**OpenAI network error:** ' + e.message; }
}

function execInlineActions(text) {
  const openMatch = text.match(/OPEN:(https?:\/\/[^\s\n]+)/);
  const searchMatch = text.match(/SEARCH:([^\n]+)/);
  const ytMatch = text.match(/YOUTUBE:([^\n]+)/);
  if (openMatch) { window.open(openMatch[1].trim(), '_blank'); text = text.replace(openMatch[0], '').trim(); }
  if (searchMatch) { window.open('https://www.google.com/search?q=' + encodeURIComponent(searchMatch[1].trim()), '_blank'); text = text.replace(searchMatch[0], '').trim(); }
  if (ytMatch) { window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(ytMatch[1].trim()), '_blank'); text = text.replace(ytMatch[0], '').trim(); }
  return text.trim();
}

function updateClock() {
  const clk = document.getElementById('clock');
  const dt = document.getElementById('date');
  if (clk) clk.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (dt) dt.textContent = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const s = document.getElementById('session-time');
  if (s) {
    const e = Date.now() - S.sessionStart, m = Math.floor(e / 60000), sec = Math.floor((e % 60000) / 1000);
    s.textContent = String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  }
}

function updateStats() {
  const c = document.getElementById('sys-cpu');
  const r = document.getElementById('sys-ram');
  if (c) c.textContent = (6 + Math.random() * 18).toFixed(0) + '%';
  if (r) r.textContent = (3.6 + Math.random() * .9).toFixed(1) + ' GB';
}

function saveSettings() {
  const g = document.getElementById('s-gemini').value.trim();
  const o = document.getElementById('s-openai').value.trim();
  const m = document.getElementById('s-mode').value;
  const v = document.getElementById('s-voice').checked;
  const ao = document.getElementById('s-always-on').checked;
  if (g) { CFG.GEMINI_KEY = g; localStorage.setItem('kxd_gemini_key', g); }
  if (o) { CFG.OPENAI_KEY = o; localStorage.setItem('kxd_openai_key', o); }
  CFG.AI_MODE = m; localStorage.setItem('kxd_ai_mode', m);
  CFG.VOICE_AUTO = v; localStorage.setItem('kxd_voice_auto', v);
  CFG.ALWAYS_ON = ao; localStorage.setItem('kxd_always_on', ao);
  if (S.recognition) S.recognition.continuous = ao;
  if (ao && !S.listening) try { S.recognition.start(); } catch (e) { }
  const aml = document.getElementById('ai-mode-lbl');
  if (aml) aml.textContent = m.toUpperCase();
  closeSettings();
  toast('Settings saved successfully.');
  addMsg('ai', 'Configuration updated. All systems recalibrated, boss.');
}

function openSettings() {
  document.getElementById('s-gemini').value = CFG.GEMINI_KEY;
  document.getElementById('s-openai').value = CFG.OPENAI_KEY;
  document.getElementById('s-mode').value = CFG.AI_MODE;
  document.getElementById('s-voice').checked = CFG.VOICE_AUTO;
  document.getElementById('s-always-on').checked = CFG.ALWAYS_ON;
  document.getElementById('modal-settings').classList.add('open');
}

function closeSettings() { document.getElementById('modal-settings').classList.remove('open'); }

async function boot() {
  const steps = [[10, 'Initializing neural core...'], [22, 'Loading KXD Holographic uplink...'], [38, 'Calibrating voice synthesis...'], [52, 'Arming arc reactor...'], [66, 'Establishing secure channels...'], [80, 'Loading knowledge matrix...'], [93, 'Running final diagnostics...'], [100, 'J.A.R.V.I.S. ONLINE']];
  const fill = document.getElementById('boot-fill');
  const label = document.getElementById('boot-label');
  const overlay = document.getElementById('boot-overlay');
  for (const [p, m] of steps) {
    if (fill) fill.style.width = p + '%';
    if (label) label.textContent = m;
    await sleep(260 + Math.random() * 110);
  }
  await sleep(500);
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    await sleep(900);
    overlay.style.display = 'none';
  }
  loadVoices();
  await sleep(200);
  const greetHtml = '<b>HI BOSS this your kxd AI JARVIS IS ONLINE how may i help you today</b><br><br>I am connected to <b>KXD</b> (Krishna X Dheeraj\'s Artificial Intelligence).<br>I can provide you with the <b>date and time</b>, deploy <b>advanced-level holographic</b> interfaces, and offer a suite of other advanced features. Speak or type your command.';
  const greetSpeak = 'HI BOSS this is your k-x-d A I JARVIS IS ONLINE. how may i help you today. I am connected to K-X-D, Krishna X Dheeraj\'s artificial intelligence. I can provide you with the date and time, deploy advanced-level holographic interfaces, and other advanced features.';
  addMsg('ai', greetHtml);
  if (CFG.VOICE_AUTO) speak(greetSpeak);
}

async function init() {
  initRec();
  loadVoices();
  if (window.ParticleEngine) { try { const pe = new window.ParticleEngine(document.getElementById('bg-canvas')); pe.start(); } catch (e) { } }
  if (window.ArcReactor) { try { const ar = new window.ArcReactor(document.getElementById('reactor-cvs')); ar.start(); } catch (e) { } }
  updateClock(); setInterval(updateClock, 1000); setInterval(updateStats, 3500);
  const micBtn = document.getElementById('mic-btn'); if (micBtn) micBtn.addEventListener('click', toggleMic);
  const typeBtn = document.getElementById('type-btn'); if (typeBtn) typeBtn.addEventListener('click', toggleInput);
  const clearBtn = document.getElementById('clear-btn'); if (clearBtn) clearBtn.addEventListener('click', clearChat);
  const settBtn = document.getElementById('settings-btn'); if (settBtn) settBtn.addEventListener('click', openSettings);
  const sendBtn = document.getElementById('send-btn'); if (sendBtn) sendBtn.addEventListener('click', () => { const t = document.getElementById('txt'); if (t && t.value.trim()) jarvisProcess(t.value.trim()); });
  const txtEl = document.getElementById('txt'); if (txtEl) txtEl.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const t = document.getElementById('txt'); if (t && t.value.trim()) jarvisProcess(t.value.trim()); } });
  const canTxt = document.getElementById('cancel-txt'); if (canTxt) canTxt.addEventListener('click', toggleInput);
  const stopBtn = document.getElementById('stop-btn'); if (stopBtn) stopBtn.addEventListener('click', () => S.synth.cancel());
  const fsBtn = document.getElementById('fs-btn'); if (fsBtn) fsBtn.addEventListener('click', () => { try { !document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen(); } catch (e) { } });
  const saveSett = document.getElementById('save-settings'); if (saveSett) saveSett.addEventListener('click', saveSettings);
  const closeSett = document.getElementById('close-settings'); if (closeSett) closeSett.addEventListener('click', closeSettings);
  document.querySelectorAll('.qcmd').forEach(b => b.addEventListener('click', () => { const c = b.dataset.cmd; if (c) jarvisProcess(c); }));
  const hasSpeech = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const sl = document.getElementById('speech-lbl'); if (sl) { sl.textContent = hasSpeech ? 'SUPPORTED' : 'LIMITED'; sl.className = 'sval ' + (hasSpeech ? 'g' : 'r'); }
  const bl = document.getElementById('browser-lbl'); if (bl) { const ua = navigator.userAgent; let b = 'UNKNOWN'; if (ua.includes('Edg')) b = 'EDGE'; else if (ua.includes('Chrome')) b = 'CHROME'; else if (ua.includes('Firefox')) b = 'FIREFOX'; else if (ua.includes('Safari')) b = 'SAFARI'; bl.textContent = b; }
  await boot();
}

window.processInput = jarvisProcess;
window.addEventListener('DOMContentLoaded', init);
