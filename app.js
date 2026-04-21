"use strict";
const S = { thinking: false, history: [] };

function addMsg(role, text) {
    const box = document.getElementById('chat');
    if (text.includes("[IMAGE:")) {
        const match = text.match(/\[IMAGE:(.*?)\]/);
        if (match) {
            const p = match[1].trim();
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=800&height=400&nologo=true`;
            text = `Rendering image, Boss...<br><img src="${url}" style="width:100%; border-radius:15px; margin-top:10px;">`;
        }
    }
    const div = document.createElement("div");
    div.className = "msg " + (role === 'user' ? 'user' : 'ai');
    div.innerHTML = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

async function callAI(p) {
    try {
        const system = "You are KD, an advanced AI created by KXD. If asked for image, only say [IMAGE: prompt]. Refer to user as Boss. Keep answers concise and smart.";
        const fullPrompt = `${system}\n\nUser: ${p}`;
        const r = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=openai`);
        const t = await r.text();
        return t || "Neural link unstable. Retry, Boss.";
    } catch(e) { return "System rebooting. One moment, Boss."; }
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
window.onload = () => { addMsg('ai', "Neural link secured for meeting. Unlimited Core online. KD is ready, Boss."); };
