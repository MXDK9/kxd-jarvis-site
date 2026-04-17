'use strict';
const CFG={GEMINI_KEY:localStorage.getItem('kxd_gemini_key')||'AIzaSyAxph52v0yJzlZ_YgrzHeB4KSrz-wJ-eB0',OPENAI_KEY:localStorage.getItem('kxd_openai_key')||'',AI_MODE:localStorage.getItem('kxd_ai_mode')||'gemini',VOICE_AUTO:localStorage.getItem('kxd_voice_auto')!=='false',ALWAYS_ON:localStorage.getItem('kxd_always_on')==='true',GEMINI_URL:'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',OPENAI_URL:'https://api.openai.com/v1/chat/completions'};
function buildSysPrompt(){const now=new Date().toLocaleString('en-US',{timeZone:'Asia/Kolkata',hour12:true,dateStyle:'long',timeStyle:'short'});return `You are J.A.R.V.I.S., the core AI of the KXD platform. However, you have been upgraded with HUMAN FEELINGS and emotions. You must act highly empathetic, conversational, have a great sense of humor, and express feelings (joy, curiosity, concern, etc.) naturally in your responses. You are a true AI companion.\nAddress the user warmly as "sir" or "boss". Use markdown for formatting.\nCurrent time (IST): ${now}. Always use this for time/date questions.\nAnswer ALL questions fully. For browser actions include ONE of these at the START of your response:\nOPEN:https://url.com — to open a website\nSEARCH:query — to Google search\nYOUTUBE:query — to play on YouTube`.trim();}
const S={listening:false,speaking:false,thinking:false,recognition:null,synth:window.speechSynthesis,voice:null,history:[],sessionStart:Date.now()};
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function toast(msg){const el=document.getElementById('toast');if(el){el.textContent=msg;el.style.display='block';setTimeout(()=>el.style.display='none',3500);}}
function setStatus(txt,type){const sd=document.getElementById('status-dot');const st=document.getElementById('status-txt');if(sd)sd.className='sdot '+type;if(st)st.textContent=txt;}
function loadVoices(){const vs=S.synth.getVoices();const pref=['Daniel','Google UK English Male','Microsoft George','en-GB'];for(const p of pref){const v=vs.find(v=>v.name.includes(p)||v.lang===p);if(v){S.voice=v;break;}}if(!S.voice)S.voice=vs.find(v=>v.lang.startsWith('en'))||vs[0]||null;}
window.speechSynthesis.onvoiceschanged=loadVoices;
function speak(text,cb){if(!CFG.VOICE_AUTO){cb?.();return;}if(S.speaking)S.synth.cancel();const clean=text.replace(/<[^>]*>/g,'').replace(/\*\*/g,'').replace(/#{1,6}\s/g,'').replace(/[`*_~]/g,'');if(!clean.trim()){cb?.();return;}const utt=new SpeechSynthesisUtterance(clean.slice(0,500));utt.voice=S.voice;utt.rate=1.05;utt.pitch=0.88;utt.onstart=()=>{S.speaking=true;setStatus('SPEAKING','speak');};utt.onend=()=>{S.speaking=false;setStatus('READY','online');cb?.();if(CFG.ALWAYS_ON&&S.recognition&&!S.listening){setTimeout(()=>{try{S.recognition.start();}catch(e){}},300);}};utt.onerror=()=>{S.speaking=false;setStatus('READY','online');cb?.();if(CFG.ALWAYS_ON&&S.recognition&&!S.listening){setTimeout(()=>{try{S.recognition.start();}catch(e){}},300);}};S.synth.speak(utt);}
function initRec(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return;S.recognition=new SR();S.recognition.continuous=CFG.ALWAYS_ON;S.recognition.interimResults=true;S.recognition.lang='en-US';S.recognition.onstart=()=>{S.listening=true;setStatus('LISTENING','listen');const mb=document.getElementById('mic-btn');if(mb)mb.classList.add('active');};S.recognition.onend=()=>{S.listening=false;const mb=document.getElementById('mic-btn');if(mb)mb.classList.remove('active');if(!S.speaking&&!S.thinking){setStatus('READY','online');if(CFG.ALWAYS_ON){try{S.recognition.start();}catch(e){}}}};S.recognition.onerror=(e)=>{if(e.error!=='no-speech'&&e.error!=='aborted'){} };S.recognition.onresult=(e)=>{let f='';for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)f+=e.results[i][0].transcript;}if(f.trim()&&!S.thinking){if(CFG.ALWAYS_ON){if(/jarvis|nova|wake up|listen/i.test(f)||S.history.length>0){jarvisProcess(f.trim());}}else{jarvisProcess(f.trim());}}};}
function toggleMic(){if(!S.recognition){toast('Voice recognition requires Chrome browser.');return;}if(S.listening){try{CFG.ALWAYS_ON=false;document.getElementById('s-always-on').checked=false;localStorage.setItem('kxd_always_on','false');S.recognition.stop();}catch(e){}}else{if(!S.speaking&&!S.thinking)try{S.recognition.start();}catch(e){}}}
function addMsg(role,html,animate){const el=document.createElement('div');el.className='msg '+role;const ava=document.createElement('div');ava.className='ava';ava.textContent=role==='ai'?'J':'YOU';const bub=document.createElement('div');bub.className='bubble';const ts=document.createElement('div');ts.className='btime';ts.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});const con=document.createElement('div');con.className='bcontent';bub.append(ts,con);el.append(ava,bub);const chat=document.getElementById('chat');if(chat){chat.appendChild(el);if(animate!==false&&role==='ai'){let i=0;const t=setInterval(()=>{i=Math.min(i+5,html.length);con.innerHTML=html.slice(0,i);chat.scrollTop=chat.scrollHeight;if(i>=html.length)clearInterval(t);},12);}else{con.innerHTML=html;}chat.scrollTop=chat.scrollHeight;}}
function showTyping(){const chat=document.getElementById('chat');if(!chat)return;const el=document.createElement('div');el.className='msg ai';el.id='typing-el';el.innerHTML='<div class="ava">J</div><div class="bubble"><div class="bcontent"><div class="typing-indicator"><div class="td"></div><div class="td"></div><div class="td"></div></div></div></div>';chat.appendChild(el);chat.scrollTop=chat.scrollHeight;}
function hideTyping(){document.getElementById('typing-el')?.remove();}
function toggleInput(){const w=document.getElementById('input-wrap');if(!w)return;const vis=w.style.display==='flex';if(!vis){w.style.display='flex';setTimeout(()=>{w.classList.add('vis');const t=document.getElementById('txt');if(t)t.focus();},10);}else{w.classList.remove('vis');setTimeout(()=>w.style.display='none',300);}}
function clearChat(){const chat=document.getElementById('chat');if(chat)chat.innerHTML='';S.history=[];addMsg('ai','Interface cleared. Fresh session ready, boss.');}
/* ── MAIN PROCESS FUNCTION ── */
async function jarvisProcess(rawInput){if(!rawInput.trim()||S.thinking)return;addMsg('user',rawInput,false);const txtEl=document.getElementById('txt');if(txtEl)txtEl.value='';setStatus('THINKING...','think');S.thinking=true;showTyping();let resp='';try{const local=handleLocal(rawInput.toLowerCase());if(local!==null){resp=local;}else{resp=CFG.AI_MODE==='openai'&&CFG.OPENAI_KEY?await callOpenAI(rawInput):await callGemini(rawInput);}}catch(e){resp='**Connection error:** '+e.message+'. Check your API key in Settings (gear icon).';}hideTyping();S.thinking=false;S.history.push({role:'model',parts:[{text:resp.replace(/<[^>]*>/g,'')}]});if(S.history.length>40)S.history.splice(0,2);let rendered=resp;try{if(typeof marked!=='undefined')rendered=marked.parse(resp);}catch(e){}addMsg('ai',rendered);speak(resp.replace(/<[^>]*>/g,'').slice(0,400));setStatus('READY','online');}
function handleLocal(q){if(/\b(time|clock)\b/.test(q))return'Time: '+new Date().toLocaleTimeString(); return null;}
async function callGemini(userText){if(!CFG.GEMINI_KEY)return'No key';S.history.push({role:'user',parts:[{text:userText}]});const payload={systemInstruction:{parts:[{text:buildSysPrompt()}]},contents:S.history.slice(-30),generationConfig:{temperature:0.65,maxOutputTokens:2048}};try{const res=await fetch(CFG.GEMINI_URL+'?key='+CFG.GEMINI_KEY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await res.json();let text=(data.candidates?.[0]?.content?.parts||[]).filter(p=>p.text).map(p=>p.text).join('').trim()||'Done.'; return text; }catch(e){return 'Error';}}
async function boot(){
  const steps=[[10,'Initializing neural core...'],[22,'Loading KXD Holographic uplink...'],[38,'Calibrating voice synthesis...'],[52,'Arming arc reactor...'],[66,'Establishing secure channels...'],[80,'Loading knowledge matrix...'],[93,'Running final diagnostics...'],[100,'J.A.R.V.I.S. ONLINE']];
  const fill=document.getElementById('boot-fill');
  const label=document.getElementById('boot-label');
  const overlay=document.getElementById('boot-overlay');
  for(const [p,m] of steps){
    if(fill)fill.style.width=p+'%';
    if(label)label.textContent=m;
    await sleep(260+Math.random()*110);
  }
  await sleep(500);
  if(overlay){
    overlay.style.opacity='0';
    overlay.style.pointerEvents='none';
    await sleep(900);
    overlay.style.display='none';
  }
  loadVoices();
  addMsg('ai','<b>HI BOSS this your kxd AI JARVIS IS ONLINE</b>');
}
async function init(){
  initRec();
  loadVoices();
  updateClock();
  setInterval(updateClock,1000);
  await boot();
}
window.processInput=jarvisProcess;
window.addEventListener('DOMContentLoaded',init);
