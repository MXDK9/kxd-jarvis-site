'use strict';


// KXD AI - KXD JARVIS ADVANCED BRAIN v10.0
const CFG = {
        GEMINI_KEY: 'AIzaSyAxph52v0yJzlZ_YgrzHeB4KSrz-wJ-eB0',
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

