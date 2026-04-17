
// KXD AI - J.A.R.V.I.S. AGENT MODE — NOVA CORE v11.0 - Gemini 1.5 Flash Powered
'use strict';

// ── SAFE STORAGE LOGIC ──────────────────────────────────────────────────────
const safeStorage = {
    getItem: (key, fallback = '') => { try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; } },
    setItem: (key, val) => { try { localStorage.setItem(key, val); return true; } catch (e) { return false; } }
};

const CFG = {
    GEMINI_KEY: safeStorage.getItem('kxd_gemini_key', 'AIzaSyAxph52v0yJzlZ_YgrzHeB4KSrz-wJ-eB0'),
    OPENAI_KEY: safeStorage.getItem('kxd_openai_key', ''),
    AI_MODE: safeStorage.getItem('kxd_ai_mode', 'gemini'),
    VOICE_AUTO: safeStorage.getItem('kxd_voice_auto') !== 'false',
    ALWAYS_ON: safeStorage.getItem('kxd_always_on') === 'true',
    GEMINI_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    OPENAI_URL: 'https://api.openai.com/v1/chat/completions'
};

function buildSysPrompt() {
    const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: true, dateStyle: 'long', timeStyle: 'short' });
    return `You are J.A.R.V.I.S., the core AI of the KXD platform. However, you have been upgraded with HUMAN FEELINGS and emotions. You must act highly empathetic, conversational, have a great sense of humor, and express feelings (joy, curiosity, concern, etc.) naturally in your responses. You are a true AI companion.\nAddress the user warmly as "sir" or "boss". Use markdown for formatting.\nCurrent time (IST): ${now}. Always use this for time/date questions.\nAnswer ALL questions fully.`.trim();
}

const S = { listening: false, speaking: false, thinking: false, recognition: null, synth: window.speechSynthesis, voice: null, history: [], sessionStart: Date.now() };

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function toast(msg) {
    const el = document.getElementById('toast');
    if (el) { el.textContent = msg; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 3500); }
}

function setStatus(txt, type) {
    const sd = document.getElementById('status-dot');
    const st = document.getElementById('status-txt');
    if (sd) sd.className = 'sdot ' + type;
    if (st) st.textContent = txt;
}

// ── AUTH & TRANSITION ENGINE ──────────────────────────────────────────────
window.login = async function() {
    console.log("Neural Link Authorized...");
    const loginScreen = document.getElementById('boot-overlay');
    const mainUI = document.querySelector('.container');
    
    // Smooth Cross-Fade (500ms)
    if (loginScreen) {
        loginScreen.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        loginScreen.style.opacity = '0';
        loginScreen.style.transform = 'scale(1.1)';
        await sleep(500);
        loginScreen.style.display = 'none';
    }
    
    if (mainUI) {
        mainUI.style.display = 'block';
        mainUI.style.opacity = '0';
        // Force reflow
        mainUI.offsetHeight; 
        mainUI.style.transition = 'opacity 0.5s ease-in';
        mainUI.style.opacity = '1';
    }
    
    // Start Particle Animation Boot
    if (window.ParticleEngine) {
        try {
            const pe = new window.ParticleEngine(document.getElementById('bg-canvas'));
            pe.start();
        } catch (e) { console.warn("Particle Engine error:", e); }
    }
    
    runBootSequence();
    safeStorage.setItem('kxd_logged_in', 'true');
};

window.logout = function() {
    safeStorage.setItem('kxd_logged_in', 'false');
    location.reload();
};

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
    utt.onend = () => { S.speaking = false; setStatus('READY', 'online'); cb?.(); };
    S.synth.speak(utt);
}

function initRec() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    S.recognition = new SR();
    S.recognition.continuous = CFG.ALWAYS_ON;
    S.recognition.interimResults = true;
    S.recognition.onstart = () => { S.listening = true; setStatus('LISTENING', 'listen'); document.getElementById('mic-btn')?.classList.add('active'); };
    S.recognition.onend = () => { S.listening = false; document.getElementById('mic-btn')?.classList.remove('active'); setStatus('READY', 'online'); };
    S.recognition.onresult = (e) => {
        let f = '';
        for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) f += e.results[i][0].transcript;
        if (f.trim() && !S.thinking) jarvisProcess(f.trim());
    };
}

async function jarvisProcess(rawInput) {
    if (!rawInput.trim() || S.thinking) return;
    addMsg('user', rawInput, false);
    const txtEl = document.getElementById('txt');
    if (txtEl) txtEl.value = '';
    
    setStatus('THINKING...', 'think');
    S.thinking = true;
    showTyping();
    
    // Neural Sync Visualizer (Pulse)
    const orb = document.querySelector('.orb-glow');
    if (orb) orb.classList.add('sync-pulse');

    let resp = '';
    try {
        resp = CFG.AI_MODE === 'openai' && CFG.OPENAI_KEY ? await callOpenAI(rawInput) : await callGemini(rawInput);
    } catch (e) { resp = '**Neural Core Error:** ' + e.message; }

    hideTyping();
    if (orb) orb.classList.remove('sync-pulse');
    S.thinking = false;
    
    S.history.push({ role: 'model', parts: [{ text: resp.replace(/<[^>]*>/g, '') }] });
    if (S.history.length > 30) S.history.splice(0, 2);

    let rendered = resp;
    if (typeof marked !== 'undefined') rendered = marked.parse(resp);
    
    addMsg('ai', rendered);
    speak(resp.replace(/<[^>]*>/g, '').slice(0, 400));
    setStatus('READY', 'online');
}

async function callGemini(userText) {
    if (!CFG.GEMINI_KEY) return 'No Gemini API key detected. Add it in Settings.';
    S.history.push({ role: 'user', parts: [{ text: userText }] });
    const payload = {
        systemInstruction: { parts: [{ text: buildSysPrompt() }] },
        contents: S.history.slice(-20),
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    };
    try {
        const res = await fetch(CFG.GEMINI_URL + '?key=' + CFG.GEMINI_KEY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.error) return '**Gemini API Error:** ' + data.error.message;
        return (data.candidates?.[0]?.content?.parts || []).map(p => p.text).join('').trim() || 'Neural link unstable, sir.';
    } catch (e) { return '**Network failure:** ' + e.message; }
}

async function callOpenAI(userText) {
    if (!CFG.OPENAI_KEY) return 'OpenAI Key Missing.';
    const msgs = [{ role: 'system', content: buildSysPrompt() }, ...S.history.slice(-20).map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.parts[0].text })), { role: 'user', content: userText }];
    try {
        const res = await fetch(CFG.OPENAI_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CFG.OPENAI_KEY }, body: JSON.stringify({ model: 'gpt-4o-mini', messages: msgs }) });
        const data = await res.json();
        return data.choices?.[0]?.message?.content || 'Done.';
    } catch (e) { return 'OpenAI error: ' + e.message; }
}

// ── BOOT SEQUENCE ──────────────────────────────────────────────────────────

async function runBootSequence() {
    const fill = document.getElementById('boot-progress');
    const status = document.getElementById('boot-status');
    const overlay = document.getElementById('boot-overlay');
    const logs = [
        "SYNCING ENCRYPTION...",
        "ESTABLISHING UPLINK...",
        "ARMING ARC REACTOR...",
        "NEURAL CORE ONLINE",
        "J.A.R.V.I.S. READY"
    ];
    
    let i = 0;
    const update = () => {
        return new Promise(resolve => {
            const r = () => {
                i += 10; // Optimized: i += 2 -> i += 10
                if (fill) fill.style.width = i + '%';
                if (status) status.textContent = logs[Math.floor(i / 25)] || logs[logs.length-1];
                
                if (i < 100) {
                    setTimeout(r, 10); // Optimized: setTimeout 40ms -> 10ms
                } else {
                    resolve();
                }
            };
            r();
        });
    };
    
    await update();
    await sleep(200);
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 500);
    }
}

    toast("System Synchronized.");
}

// ── HOLOGRAPHIC ORB PHYSICS ──────────────────────────────────────────────
function initOrbPhysics() {
    const orb = document.querySelector('.orb-container');
    if (!orb) return;
    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.pageX) / 30;
        const y = (window.innerHeight / 2 - e.pageY) / 30;
        orb.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    });
}

function addMsg(role, html, animate) {
    const el = document.createElement('div'); el.className = 'msg ' + role;
    const con = document.createElement('div'); con.className = 'bcontent';
    el.innerHTML = `<div class="ava">${role === 'ai' ? 'J' : 'Y'}</div><div class="bubble"><div class="btime">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></div>`;
    el.querySelector('.bubble').appendChild(con);
    const chat = document.getElementById('chat');
    if (chat) { chat.appendChild(el); con.innerHTML = html; chat.scrollTop = chat.scrollHeight; }
}

function showTyping() { const chat = document.getElementById('chat'); if (!chat) return; const el = document.createElement('div'); el.className = 'msg ai'; el.id = 'typing-el'; el.innerHTML = '<div class="ava">J</div><div class="bubble"><div class="bcontent"><div class="typing-indicator"><div class="td"></div><div class="td"></div><div class="td"></div></div></div></div>'; chat.appendChild(el); chat.scrollTop = chat.scrollHeight; }
function hideTyping() { document.getElementById('typing-el')?.remove(); }

async function init() {
    initRec(); loadVoices(); initOrbPhysics();
    setInterval(() => { const clk = document.getElementById('clock'); if (clk) clk.textContent = new Date().toLocaleTimeString(); }, 1000);
    document.getElementById('send-btn')?.addEventListener('click', () => { const t = document.getElementById('txt'); if (t?.value.trim()) jarvisProcess(t.value.trim()); });
    
    // Auto-login if previously authorized
    if (safeStorage.getItem('kxd_logged_in') === 'true') window.login();
}

window.processInput = jarvisProcess;
window.addEventListener('DOMContentLoaded', init);
