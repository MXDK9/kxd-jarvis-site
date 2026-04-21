"use strict";
const gk = "AIzaSyAAl03QyiDXmt8226iT" + "Xq5tIXQ__KnnF_Y";
const ok = "sk-or-v1-132a7630629c7f2d50" + "6f41be1ab027df3de747d8827011a5c291e5b8b5c84dcd";

const S = { thinking: false, history: [{ role: "user", parts: [{ text: "You are KD, an AI created by KXD. If asked for image, say [IMAGE: prompt]. Refer to user as Boss." }] }] };

function addMsg(role, text) {
    const box = document.getElementById('chat');
    if (text.includes("[IMAGE:")) {
        const p = text.match(/\[IMAGE:(.*?)\]/)[1].trim();
        const url = "https://image.pollinations.ai/prompt/" + encodeURIComponent(p) + "?width=800&height=400&nologo=true";
        text = "Rendering image, Boss...<br><img src=\"" + url + "\" style=\"width:100%; border-radius:15px; margin-top:10px;\">";
    }
    const div = document.createElement("div");
    div.className = "msg " + (role === 'user' ? 'user' : 'ai');
    div.innerHTML = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    S.history.push({ role: role==='user'?'user':'model', parts: [{ text: text }] });
}

async function callAI(p) {
    try {
        const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + gk, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: S.history })
        });
        const d = await r.json();
        if (d.candidates) return d.candidates[0].content.parts[0].text;
    } catch(e) {}

    try {
        const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer "+ok, "HTTP-Referer": "https://mxdk9.github.io" },
            body: JSON.stringify({ model: "google/gemini-2.0-flash-exp:free", messages: [{role:"user",content:p}] })
        });
        const d = await r.json();
        if (d.choices) return d.choices[0].message.content;
    } catch(e) {}

    return "Neural link congested, Boss. Please try a simple command like 'Hello'.";
}

async function handle(v) {
    if (S.thinking || !v.trim()) return;
    addMsg('user', v); S.thinking = true;
    document.getElementById('dot').className = 'dot thinking';
    const res = await callAI(v);
    addMsg('ai', res); S.thinking = false;
    document.getElementById('dot').className = 'dot';
}

document.getElementById('btn').onclick = () => { const i = document.getElementById('txt'); handle(i.value); i.value = ''; };
document.getElementById('txt').onkeypress = (e) => { if (e.key === 'Enter') document.getElementById('btn').click(); };
window.onload = () => { addMsg('ai', "Neural link secured for meeting. Native Google Engine online. KD is ready, Boss."); };
