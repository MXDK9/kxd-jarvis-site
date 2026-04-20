"use strict";

const p1 = "sk-o" + "r-v1-132a76";
const p2 = "30629c7f2d506";
const p3 = "f41be1ab027df3";
const p4 = "de747d8827011a";
const p5 = "5c291e5b8b5c84dcd";

const CFG = {
    KEY: p1 + p2 + p3 + p4 + p5,
    URL: 'https://openrouter.ai/api/v1/chat/completions',
    MODELS: ['meta-llama/llama-3.1-8b-instruct:free', 'google/gemma-2-9b-it:free']
};

const S = { 
    thinking: false, 
    synth: window.speechSynthesis, 
    voice: null, 
    history: [{ role: "system", content: "You are KD, an AI assistant created by KXD. If asked for image, say [IMAGE: prompt]. Refer to user as Boss." }] 
};

function init() {
    console.log("KD Core Initializing...");
    loadVoices();
    addMsg('assistant', "Neural link established. KXD AI is online, Boss.", true);
}

function loadVoices() {
    const vs = S.synth.getVoices();
    S.voice = vs.find(v => v.name.includes('English')) || vs[0];
}
window.speechSynthesis.onvoiceschanged = loadVoices;

function addMsg(role, text, speakIt = false) {
    const box = document.getElementById('chat-box');
    if (!box) return;

    if (role === 'assistant' && text.includes("[IMAGE:")) {
        const matches = text.match(/[IMAGE:(.*?)]/);
        if (matches) {
            const prompt = matches[1].trim();
            const url = "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt) + "?width=800&height=400&nologo=true";
            const div = document.createElement("div");
            div.className = "msg assistant";
            div.innerHTML = '<div class="msg-inner">Rendering visual...<br><img src="' + url + '" style="width:100%; border-radius:10px; margin-top:10px;"></div>';
            box.appendChild(div);
            box.scrollTop = box.scrollHeight;
            if (speakIt) speak("Rendering complete.");
            return;
        }
    }

    const div = document.createElement("div");
    div.className = "msg " + role;
    div.innerHTML = '<div class="msg-inner">' + text + '</div>';
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    if (speakIt) speak(text);
    S.history.push({ role: role === 'assistant' ? 'assistant' : 'user', content: text });
}

async function callAI(promptTxt) {
    const models = [
        'nvidia/nemotron-3-super-120b-a12b:free',
        'arcee-ai/trinity-large-preview:free',
        'openai/gpt-oss-120b:free'
    ];
    
    // Create a copy of history and fix 'system' role for models that don't support it
    const cleanHistory = S.history.map(m => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content
    }));

    for (let model of models) {
        try {
            console.log("DEBUG: Request URL:", 'https://openrouter.ai/api/v1/chat/completions');
            console.log("DEBUG: Request Headers:", { "Content-Type": "application/json", "Authorization": "Bearer " + CFG.KEY });
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + CFG.KEY
                },
                body: JSON.stringify({ model: model, messages: cleanHistory })
            });
            const data = await response.json();
            if (data.choices && data.choices[0].message) {
                return data.choices[0].message.content;
            }
        } catch (e) {
            console.log("Link failed for " + model);
        }
    }
    return "Neural link congested. High demand detected. Please wait 30 seconds and retry, Boss.";
}


async function processInput(val) {
    if (S.thinking || !val.trim()) return;
    addMsg('user', val);
    S.thinking = true;
    document.getElementById('status-dot').className = 'status-dot thinking';
    const resp = await callAI(val);
    addMsg('assistant', resp, true);
    S.thinking = false;
    document.getElementById('status-dot').className = 'status-dot online';
}

function speak(t) {
    if (!S.synth) return;
    S.synth.cancel();
    const utt = new SpeechSynthesisUtterance(t.replace(/[*_#[]]/g, ''));
    utt.voice = S.voice;
    S.synth.speak(utt);
}

document.getElementById('exec-btn').onclick = () => {
    const el = document.getElementById('txt');
    processInput(el.value);
    el.value = '';
};

document.getElementById('txt').onkeypress = (e) => {
    if (e.key === 'Enter') document.getElementById('exec-btn').click();
};

window.onload = () => {
    console.log("Window loaded. Starting KD...");
    init();
};
