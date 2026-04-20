'use strict';

// KXD AI - KXD JARVIS QUANTUM CORE v11.0
const CFG = {
    GEMINI_KEY: 'AIzaSyAxph52v0yJzlZ_YgrzHeB4KSrz-wJ-eB0',
    GEMINI_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    VOICE_AUTO: true,
    ALWAYS_ON: true
};

const S = {
    listening: false,
    speaking: false,
    thinking: false,
    recognition: null,
    synth: window.speechSynthesis,
    voice: null,
    history: []
};

function init() {
    updateDate();
    setInterval(updateDate, 1000);
    initRec();
    loadVoices();
    // Welcome message - DO NOT push to history because Gemini requires user to start
    addMsg('jarvis', 'Systems online. Welcome back, Boss.', true, false);
}

function updateDate() {
    const el = document.getElementById('date-time');
    if (!el) return;
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' };
    el.innerText = now.toLocaleDateString('en-US', options).toUpperCase();
}

function loadVoices() {
    const vs = S.synth.getVoices();
    const pref = ['Daniel', 'Google UK English Male', 'Microsoft George'];
    for (const p of pref) {
        const v = vs.find(v => v.name.includes(p));
        if (v) { S.voice = v; break; }
    }
}

window.speechSynthesis.onvoiceschanged = loadVoices;

function addMsg(role, text, speakIt = false, pushToHistory = true) {
    const box = document.getElementById('chat-box');
    if (!box) return;
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerText = role === 'jarvis' ? `JARVIS: ${text}` : `BOSS: ${text}`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    if (speakIt) speak(text);
    if (pushToHistory) S.history.push({ role: role === 'jarvis' ? 'model' : 'user', parts: [{ text }] });
}

async function callGemini(prompt) {
    try {
        const response = await fetch(`${CFG.GEMINI_URL}?key=${CFG.GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: S.history.slice(-10)
            })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        }
        console.error('Gemini Error:', data);
        return "I am unable to process that right now, Boss.";
    } catch (e) {
        console.error('Fetch Error:', e);
        return "Neural Core connection failed, Boss.";
    }
}

async function jarvisProcess(input) {
    if (S.thinking || !input.trim()) return;
    addMsg('user', input);
    S.thinking = true;
    const statusEl = document.getElementById('system-status');
    if (statusEl) statusEl.innerText = 'THINKING...';
    
    const resp = await callGemini(input);
    addMsg('jarvis', resp, true);
    
    S.thinking = false;
    if (statusEl) statusEl.innerText = 'SYSTEM ONLINE';
}

function speak(text) {
    if (S.speaking) S.synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.voice = S.voice;
    utt.onstart = () => S.speaking = true;
    utt.onend = () => S.speaking = false;
    S.synth.speak(utt);
}

function initRec() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    S.recognition = new SR();
    S.recognition.continuous = true;
    S.recognition.onresult = (e) => {
        const transcript = e.results[e.results.length - 1][0].transcript.trim();
        if (e.results[e.results.length - 1].isFinal) {
            jarvisProcess(transcript);
        }
    };
    try { S.recognition.start(); } catch(e) {}
}

document.addEventListener('click', () => {
    if (!S.recognition) initRec();
}, { once: true });

document.getElementById('exec-btn').onclick = () => {
    const el = document.getElementById('txt');
    jarvisProcess(el.value);
    el.value = '';
};

document.getElementById('txt').onkeypress = (e) => {
    if (e.key === 'Enter') document.getElementById('exec-btn').click();
};

window.onload = init;
