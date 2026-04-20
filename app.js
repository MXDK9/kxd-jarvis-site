"use strict";

// KXD AI - KXD JARVIS QUANTUM CORE v11.0
const CFG = {
    GEMINI_KEY: 'AIzaSyAxph52v0yJzlZ_YgrzHeB4KSrz-wJ-eB0',
    GEMINI_URL: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
};

const S = {
    thinking: false,
    synth: window.speechSynthesis,
    voice: null,
    history: []
};

function init() {
    updateDate();
    setInterval(updateDate, 1000);
    loadVoices();
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
    S.voice = vs.find(v => v.name.includes('Daniel')) || vs[0];
}
window.speechSynthesis.onvoiceschanged = loadVoices;

function addMsg(role, text, speakIt = false, push = true) {
    const box = document.getElementById('chat-box');
    if (!box) return;
    const div = document.createElement('div');
    div.className = "msg " + role;
    div.innerText = role === 'jarvis' ? "JARVIS: " + text : "BOSS: " + text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    if (speakIt) speak(text);
    if (push) S.history.push({ role: role === 'jarvis' ? 'model' : 'user', parts: [{ text: text }] });
}

async function callGemini(prompt) {
    try {
        const history = S.history.length > 0 ? S.history.slice(-10) : [{ role: 'user', parts: [{ text: prompt }] }];
        const response = await fetch(CFG.GEMINI_URL + "?key=" + CFG.GEMINI_KEY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: history })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        }
        console.error('Gemini Error:', data);
        return "I am unable to process that right now, Boss.";
    } catch (e) {
        console.error('Neural Core Error:', e);
        return "Neural Core Error, Boss.";
    }
}

async function jarvisProcess(input) {
    if (S.thinking || !input.trim()) return;
    addMsg('user', input);
    S.thinking = true;
    const status = document.getElementById('system-status');
    if (status) status.innerText = 'THINKING...';
    
    const resp = await callGemini(input);
    addMsg('jarvis', resp, true);
    
    S.thinking = false;
    if (status) status.innerText = 'SYSTEM ONLINE';
}

function speak(text) {
    if (S.speaking && S.synth) S.synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.voice = S.voice;
    if (S.synth) S.synth.speak(utt);
}

document.getElementById('exec-btn').onclick = () => {
    const el = document.getElementById('txt');
    jarvisProcess(el.value);
    el.value = '';
};

document.getElementById('txt').onkeypress = (e) => {
    if (e.key === 'Enter') document.getElementById('exec-btn').click();
};

function initVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
        const transcript = e.results[e.results.length - 1][0].transcript.trim();
        if (transcript) jarvisProcess(transcript);
    };
    recognition.onerror = () => { try { recognition.start(); } catch(err) {} };
    recognition.onend = () => { try { recognition.start(); } catch(err) {} };
    try { recognition.start(); } catch(err) {}
}

window.onload = () => {
    init();
    initVoice();
};
