'use strict';

// KXD AI - KXD JARVIS ADVANCED BRAIN v10.0
const CFG = {
        GEMINI_KEY: localStorage.getItem('kxd_gemini_key') || 'AIzaSyAxph52v0yJzlZ_YgrzHeB4KSrz-wJ-eB0',
        GEMINI_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
};

const S = {
        listening: false,
        speaking: false,
        thinking: false,
        recognition: null,
        synth: window.speechSynthesis,
        voice: null,
        history: [],
        wakeWord: '' 
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function toast(m) {
        const e = document.getElementById('toast');
        if (e) {
                    e.textContent = m;
                    e.style.display = 'block';
                    setTimeout(() => e.style.display = 'none', 3000);
        }
}

function setStatus(t, y) {
        const d = document.getElementById('status-dot'), s = document.getElementById('status-txt');
        if (d) d.className = 'sdot ' + y;
        if (s) s.textContent = t;
}

function loadVoices() {
        const v = S.synth.getVoices();
        S.voice = v.find(x => x.lang.startsWith('en')) || v[0] || null;
}
window.speechSynthesis.onvoiceschanged = loadVoices;

async function boot() {
        const steps = [[20, 'Initializing...'], [60, 'Uplink active...'], [100, 'ONLINE']];
        const f = document.getElementById('boot-fill'), l = document.getElementById('boot-label'), o = document.getElementById('boot-overlay');
        for (const [p, m] of steps) {
                    if (f) f.style.width = p + '%';
                    if (l) l.textContent = m;
                    await sleep(400);
        }
        if (o) {
                    o.style.opacity = '0';
                    await sleep(600);
                    o.style.display = 'none';
        }
        addMsg('ai', '<b>KXD JARVIS v10.0 IS LIVE.</b> Systems operational.');
        speak("System online. Listening for your commands, Boss.");
}

function speak(t) {
        if (!S.voice) loadVoices();
        const u = new SpeechSynthesisUtterance(t);
        u.voice = S.voice;
        u.onstart = () => { S.speaking = true; setStatus('SPEAKING', 'online'); };
        u.onend = () => { S.speaking = false; setStatus('SYSTEM READY', 'online'); };
        S.synth.speak(u);
}

function login() {
        const s = document.getElementById('auth-screen');
        if (s) s.style.display = 'none';
}

async function init() {
        login();
        updateDash();
        setInterval(updateDash, 1000);
        initRec();
        await boot();
}

function updateDash() {
        const c = document.getElementById('clock');
        const d = document.getElementById('date');
        const now = new Date();
        if (c) c.textContent = now.toLocaleTimeString();
        if (d) d.textContent = now.toDateString().toUpperCase();
}

function addMsg(r, h) {
        const c = document.getElementById('chat');
    if (!c) return;
    const e = document.createElement('div');
    e.className = 'msg ' + r;
    e.innerHTML = '<div class="ava">' + (r === 'ai' ? 'KJ' : 'U') + '</div><div class="bubble"><div class="bcontent">' + h + '</div></div>';
    c.appendChild(e);
    c.scrollTop = c.scrollHeight;
}

function initRec() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        toast("Speech Recognition not supported.");
        return;
    }
    S.recognition = new SpeechRecognition();
    S.recognition.continuous = true;
    S.recognition.interimResults = false;
    S.recognition.lang = 'en-US';

    S.recognition.onstart = () => {
        S.listening = true;
        const micStatus = document.getElementById('mic-status');
        if (micStatus) micStatus.textContent = 'LISTENING...';
        const micBtn = document.getElementById('mic-btn');
        if (micBtn) micBtn.classList.add('active');
    };

    S.recognition.onresult = (e) => {
        const transcript = e.results[e.results.length - 1][0].transcript.trim();
        console.log('Heard:', transcript);
        if (transcript) {
            handleCommand(transcript);
        }
    };

    S.recognition.onerror = (e) => {
        console.error('Recognition error:', e);
        if (e.error === 'not-allowed') toast("Mic access denied.");
    };

    S.recognition.onend = () => {
        if (S.listening) { try { S.recognition.start(); } catch(e){} }
    };

    try { S.recognition.start(); } catch(e){}
}

async function handleCommand(t) {
    if (S.thinking) return;
    S.thinking = true;
    addMsg('user', t);
    setStatus('THINKING', 'online');
    try {
        const resp = await fetch(CFG.GEMINI_URL + '?key=' + CFG.GEMINI_KEY, {
            method: 'POST',
            body: JSON.stringify({ 
                contents: [{ parts: [{ text: "You are KXD JARVIS, a helpful AI assistant. Always address the user as 'Boss'. Respond briefly and professionally to: " + t }] }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });
        const data = await resp.json();
        const msg = data.candidates?.[0]?.content?.parts?.[0]?.text || "I am unable to process that right now.";
        addMsg('ai', msg);
        speak(msg);
    } catch (err) {
        addMsg('ai', "Neural link failure.");
        speak("Connection to core failed.");
    }
    S.thinking = false;
    setStatus('SYSTEM READY', 'online');
}

window.addEventListener('DOMContentLoaded', init);
