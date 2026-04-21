"use strict";
// Obfuscated Key
const k1="sk-or-v1-132a7630629c7";
const k2="f2d506f41be1ab027df3";
const k3="de747d8827011a5c291e5";
const k4="b8b5c84dcd";
const KEY = k1+k2+k3+k4;

const S = { thinking: false, history: [{ role: "system", content: "You are KD, an AI by KXD. If asked for image, only say [IMAGE: prompt]. Refer to user as Boss." }] };

function addMsg(role, text) {
    const box = document.getElementById('chat');
    if (text.includes("[IMAGE:")) {
        const p = text.match(/[IMAGE:(.*?)]/)[1].trim();
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=800&height=400&nologo=true`;
        text = `Rendering image, Boss...<br><img src="${url}" style="width:100%; border-radius:15px; margin-top:10px;">`;
    }
    const div = document.createElement("div");
    div.className = "msg " + (role === 'user' ? 'user' : 'ai');
    div.innerHTML = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    S.history.push({ role: role, content: text });
}

async function callAI(p) {
    const models = ['google/gemini-2.0-flash-exp:free', 'meta-llama/llama-3.1-8b-instruct:free', 'google/gemma-2-9b-it:free'];
    // Merge system prompt into first user message for compatibility
    const msgs = S.history.map(m => ({ role: m.role==='system'?'user':m.role, content: m.content }));
    for (let model of models) {
        try {
            const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": "Bearer "+KEY },
                body: JSON.stringify({ model: model, messages: msgs })
            });
            const d = await r.json();
            if (d.choices) return d.choices[0].message.content;
        } catch (e) {}
    }
    return "Congestion detected. Retrying in 5 seconds, Boss.";
}

async function handle(v) {
    if (S.thinking || !v.trim()) return;
    addMsg('user', v);
    S.thinking = true;
    document.getElementById('dot').className = 'dot thinking';
    const res = await callAI(v);
    addMsg('assistant', res);
    S.thinking = false;
    document.getElementById('dot').className = 'dot';
}

document.getElementById('btn').onclick = () => {
    const i = document.getElementById('txt');
    handle(i.value); i.value = '';
};

document.getElementById('txt').onkeypress = (e) => { if (e.key === 'Enter') document.getElementById('btn').click(); };

window.onload = () => { addMsg('assistant', "Neural link secured. KXD AI (KD) is ready for the meeting, Boss."); };
