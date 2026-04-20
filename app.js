"use strict";


// KXD JARVIS - v11.1 ABSOLUTE EDITION
// 🚀 Neural Link: ACTIVE | Status: BOSS PROTOCOL


const CFG = {
    GEMINI_KEY: 'AIzaSyA6Ho7XD0W1dhq9MX6xYaHN8RA4TKpvrLo',
    GEMINI_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
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
    addMsg('jarvis', 'Neural link established. KXD JARVIS v11.1 is at your command, Boss.', true, false);
}


function updateDate() {
    const el = document.getElementById('date-time');
    if (!el) return;
    el.innerText = "MON, APR 20, 2026";
}


function loadVoices() {
    const vs = S.synth.getVoices();
    S.voice = vs.find(v => v.name.includes('Google US English') || v.name.includes('Daniel')) || vs[0];
}


window.speechSynthesis.onvoiceschanged = loadVoices;
