"use strict";

const S = { thinking: false, history: [] };

function addMsg(role, text) {
    const box = document.getElementById('chat');
    if (!box) return;

    if (text.includes("[IMAGE:")) {
        const p = text.match(/\[IMAGE:(.*?)\]/)[1].trim();
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=800&height=400&nologo=true`;
        text = `Rendering image...<br><img src="${url}" style="width:100%; border-radius:15px; margin-top:10px;">`;
    }

    const d = document.createElement('div');
    d.className = 'msg ' + role;
    d.innerHTML = text;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
}

async function callAI(p) {
    try {
        const r = await fetch('https://text.pollinations.ai/' + encodeURIComponent(p) + '?system=' + encodeURIComponent('You are KD, an AI by KXD. If asked for image, say [IMAGE: prompt]. Refer to user as Boss.'));
        return await r.text();
    } catch (e) {
        return "Neural link slow, please retry, Boss.";
    }
}

async function handle(v) {
    if (S.thinking || !v.trim()) return;
    addMsg('user', v);
    S.thinking = true;
    document.getElementById('dot').className = 'dot thinking';
    const res = await callAI(v);
    addMsg('ai', res);
    S.thinking = false;
    document.getElementById('dot').className = 'dot';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn').onclick = () => {
        const i = document.getElementById('txt');
        handle(i.value);
        i.value = '';
    };

    document.getElementById('txt').onkeydown = (e) => {
        if (e.key === 'Enter') {
            handle(e.target.value);
            e.target.value = '';
        }
    };
});

// Since the original script might already be loaded, also bind events immediately
if (document.getElementById('btn')) {
    document.getElementById('btn').onclick = () => {
        const i = document.getElementById('txt');
        handle(i.value);
        i.value = '';
    };
}
if (document.getElementById('txt')) {
    document.getElementById('txt').onkeydown = (e) => {
        if (e.key === 'Enter') {
            handle(e.target.value);
            e.target.value = '';
        }
    };
}
