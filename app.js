"use strict";

const CFG = {
    GEMINI_KEY: 'AIzaSyBdyTy3VqLzMnJ-Kp1LuDpz5x2LnTzRf4M',
    // Switched to hyper-fast, low-demand 2.0 model to guarantee NO overload errors.
    GEMINI_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
};

const S = { thinking: false, synth: window.speechSynthesis, voice: null, history: [] };

function init() {
    updateDate();
    setInterval(updateDate, 1000);
    loadVoices();
    addMsg('jarvis', 'Neural link established. KXD JARVIS is online, Boss.', true, false);
}

function updateDate() {
    const el = document.getElementById('date-time');
    if (el) {
        const now = new Date();
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        el.innerText = now.toLocaleDateString('en-US', options).toUpperCase();
    }
}

function loadVoices() {
    const vs = S.synth.getVoices();
    S.voice = vs.find(v => v.name.includes('US English') || v.name.includes('Daniel')) || vs[0];
}
window.speechSynthesis.onvoiceschanged = loadVoices;

function addMsg(role, text, speakIt = false, push = true) {
    const box = document.getElementById('chat-box');
    if (!box) return;
    const div = document.createElement("div");
    div.className = "msg " + role;
    div.innerText = (role === "jarvis" ? "JARVIS: " : "BOSS: ") + text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    
    if (speakIt) speak(text);
    if (push) {
        S.history.push({ role: role === "jarvis" ? "model" : "user", parts: [{ text: text }] });
    }
}

async function callGemini(prompt) {
    try {
        const reqContents = S.history.length > 0 ? S.history : [{ role: "user", parts: [{ text: prompt }] }];
        
        const response = await fetch(`${CFG.GEMINI_URL}?key=${CFG.GEMINI_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: reqContents })
        });
        
        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            return "Boss, my cognitive API key was rejected: " + data.error.message;
        }
        return "Bridge Verification Error, Boss.";
    } catch (e) {
        return "Neural Core Link failure due to network error, Boss.";
    }
}

async function jarvisProcess(input) {
    if (S.thinking || !input.trim()) return;
    addMsg('user', input, false, true); 
    S.thinking = true;
    
    const status = document.getElementById('system-status');
    const orb = document.getElementById('orb');
    if (status) status.innerText = 'THINKING...';
    if (orb) orb.classList.add('sync-pulse');
    
    const resp = await callGemini(input);
    
    addMsg('jarvis', resp, true, true);
    S.thinking = false;
    
    if (status) status.innerText = 'SYSTEM ONLINE';
    if (orb) orb.classList.remove('sync-pulse');
}

function speak(text) {
    if (!S.synth) return;
    if (S.synth.speaking) S.synth.cancel();
    const cleanText = text.replace(/[*_#]/g, '');
    const utt = new SpeechSynthesisUtterance(cleanText);
    utt.voice = S.voice;
    utt.pitch = 0.9;
    utt.rate = 1.0;
    S.synth.speak(utt);
}

document.getElementById('exec-btn').onclick = () => {
    const el = document.getElementById('txt');
    if(el) { jarvisProcess(el.value); el.value = ''; }
};

document.getElementById('txt').onkeypress = (e) => {
    if (e.key === 'Enter') document.getElementById('exec-btn').click();
};

function initVoice() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    const rec = new Recognition();
    rec.continuous = true;
    rec.interimResults = false;
    
    rec.onresult = (e) => {
        const t = e.results[e.results.length - 1][0].transcript.trim();
        if (t) {
            const match = t.match(/\bk\.?d\.?\b/i);
            if (match) {
                let command = t.substring(match.index + match[0].length).trim();
                if (!command) { command = "Hello"; } 
                jarvisProcess(command);
            }
        }
    };
    
    rec.onend = () => { try { rec.start(); } catch(err) {} };
    try { rec.start(); } catch(err) {} 
}

window.onload = () => {
    init();
    initVoice();
};
