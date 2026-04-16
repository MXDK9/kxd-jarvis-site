

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
