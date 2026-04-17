// KXD AI - J.A.R.V.I.S. ADVANCED BRAIN v9.2 - Zero-Key Nova Core - Gemini 2.5 Flash Powered
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



