

    runBootSequence();
    safeStorage.setItem('kxd_logged_in', 'true');
};


window.logout = function() {
    safeStorage.setItem('kxd_logged_in', 'false');
    location.reload();
};


function loadVoices() {
    const vs = S.synth.getVoices();
    const pref = ['Daniel', 'Google UK English Male', 'Microsoft George', 'en-GB'];
    for (const p of pref) {
        const v = vs.find(v => v.name.includes(p) || v.lang === p);
        if (v) { S.voice = v; break; }
    }
    if (!S.voice) S.voice = vs.find(v => v.lang.startsWith('en')) || vs[0] || null;
}
window.speechSynthesis.onvoiceschanged = loadVoices;


function speak(text, cb) {
    if (!CFG.VOICE_AUTO) { cb?.(); return; }
    if (S.speaking) S.synth.cancel();
    const clean = text.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').replace(/#{1,6}\s/g, '').replace(/[`*_~]/g, '');
    if (!clean.trim()) { cb?.(); return; }
    const utt = new SpeechSynthesisUtterance(clean.slice(0, 500));
    utt.voice = S.voice;
    utt.rate = 1.05;
    utt.pitch = 0.88;
    utt.onstart = () => { S.speaking = true; setStatus('SPEAKING', 'speak'); };
    utt.onend = () => { S.speaking = false; setStatus('READY', 'online'); cb?.(); };
    S.synth.speak(utt);
}


function initRec() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    S.recognition = new SR();
    S.recognition.continuous = CFG.ALWAYS_ON;
    S.recognition.interimResults = true;
    S.recognition.onstart = () => { S.listening = true; setStatus('LISTENING', 'listen'); document.getElementById('mic-btn')?.classList.add('active'); };
    S.recognition.onend = () => { S.listening = false; document.getElementById('mic-btn')?.classList.remove('active'); setStatus('READY', 'online'); };
    S.recognition.onresult = (e) => {
        let f = '';
        for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) f += e.results[i][0].transcript;
        if (f.trim() && !S.thinking) jarvisProcess(f.trim());
    };
}


async function jarvisProcess(rawInput) {
    if (!rawInput.trim() || S.thinking) return;
    addMsg('user', rawInput, false);
    const txtEl = document.getElementById('txt');
    if (txtEl) txtEl.value = '';
    
    setStatus('THINKING...', 'think');
    S.thinking = true;
    showTyping();
    
    // Neural Sync Visualizer (Pulse)
    const orb = document.querySelector('.orb-glow');
    if (orb) orb.classList.add('sync-pulse');


    let resp = '';
    try {
        resp = CFG.AI_MODE === 'openai' && CFG.OPENAI_KEY ? await callOpenAI(rawInput) : await callGemini(rawInput);
    } catch (e) { resp = '**Neural Core Error:** ' + e.message; }


    hideTyping();
    if (orb) orb.classList.remove('sync-pulse');
    S.thinking = false;
