"use strict";
// KXD JARVIS - v11.1 ABSOLUTE EDITION
// Neural Link: ACTIVE | Status: BOSS PROTOCOL
const CFG = {
    GEMINI_KEY: 'AIzaSyA6Ho7XD0W1dhq9MX6xYaHN8RA4TKpvrLo',
    GEMINI_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
};
const S = { thinking: false, synth: window.speechSynthesis, voice: null, history: [] };
function init() {
    updateDate(); setInterval(updateDate, 1000); loadVoices();
    addMsg('jarvis', 'Neural link established. KXD JARVIS v11.1 is at your command, Boss.', true, false);
}
function updateDate() {
    const el = document.getElementById('date-time');
    if (el) el.innerText = "MON, APR 20, 2026";
}
function loadVoices() {
    const vs = S.synth.getVoices();
    S.voice = vs.find(v => v.name.includes('US English') || v.name.includes('Daniel')) || vs[0];
}
window.speechSynthesis.onvoiceschanged = loadVoices;
function addMsg(role, text, speakIt = false, push = true) {
    const box = document.getElementById('chat-box'); if (!box) return;
    const div = document.createElement("div");
    div.className = "msg " + role;
    div.innerText = (role === "jarvis" ? "JARVIS: " : "BOSS: ") + text;
    box.appendChild(div); box.scrollTop = box.scrollHeight;
    if (speakIt) speak(text);
    if (push) S.history.push({ role: role === "jarvis" ? "model" : "user", parts: [{ text: text }] });
}
async function callGemini(prompt) {
    try {
        const history = S.history.length > 0 ? S.history : [{ role: "user", parts: [{ text: prompt }] }];
        const response = await fetch(`${CFG.GEMINI_URL}?key=${CFG.GEMINI_KEY}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: history })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0].content) return data.candidates[0].content.parts[0].text;
        return "Bridge Verification Error, Boss.";
    } catch (e) { return "Neural Core Link failure, Boss."; }
}
async function jarvisProcess(input) {
    if (S.thinking || !input.trim()) return;
    addMsg('user', input); S.thinking = true;
    const status = document.getElementById('system-status');
    const orb = document.getElementById('orb');
    if (status) status.innerText = 'THINKING...';
    if (orb) orb.classList.add('sync-pulse');
    const resp = await callGemini(input);
    addMsg('jarvis', resp, true); S.thinking = false;
    if (status) status.innerText = 'SYSTEM ONLINE';
    if (orb) orb.classList.remove('sync-pulse');
}
function speak(text) {
    if (!S.synth) return;
    if (S.synth.speaking) S.synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.voice = S.voice; utt.pitch = 0.9; utt.rate = 1.0; S.synth.speak(utt);
}
document.getElementById('exec-btn').onclick = () => {
    const el = document.getElementById('txt'); jarvisProcess(el.value); el.value = '';
};
document.getElementById('txt').onkeypress = (e) => { if (e.key === 'Enter') document.getElementById('exec-btn').click(); };
function initVoice() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    const rec = new Recognition(); rec.continuous = true;
    rec.onresult = (e) => { const t = e.results[e.results.length - 1][0].transcript.trim(); if (t) jarvisProcess(t); };
    rec.onend = () => { try { rec.start(); } catch(err) {} };
    try { rec.start(); } catch(err) {}
}
window.onload = () => { init(); initVoice(); };
