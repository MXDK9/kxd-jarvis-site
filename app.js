// KXD AI - J.A.R.V.I.S. ADVANCED BRAIN v9.3
'use strict';
const CFG={GEMINI_KEY:localStorage.getItem('kxd_gemini_key')||'AIzaSyAxph52v0yJzlZ_YgrzHeB4KSrz-wJ-eB0',GEMINI_URL:'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'};
const S={listening:false,speaking:false,thinking:false,recognition:null,synth:window.speechSynthesis,voice:null,history:[]};
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function toast(m){const e=document.getElementById('toast');if(e){e.textContent=m;e.style.display='block';setTimeout(()=>e.style.display='none',3000);}}
function setStatus(t,y){const d=document.getElementById('status-dot'),s=document.getElementById('status-txt');if(d)d.className='sdot '+y;if(s)s.textContent=t;}
function loadVoices(){const v=S.synth.getVoices();S.voice=v.find(x=>x.lang.startsWith('en'))||v[0]||null;}
window.speechSynthesis.onvoiceschanged=loadVoices;
async function boot(){const steps=[[20,'Initializing...'],[60,'Uplink active...'],[100,'ONLINE']];const f=document.getElementById('boot-fill'),l=document.getElementById('boot-label'),o=document.getElementById('boot-overlay');for(const[p,m] of steps){if(f)f.style.width=p+'%';if(l)l.textContent=m;await sleep(400);}if(o){o.style.opacity='0';await sleep(600);o.style.display='none';}addMsg('ai','<b>J.A.R.V.I.S. v9.3 IS LIVE. SYSTEM BYPASSED.</b>');}
function login(){const s=document.getElementById('auth-screen');if(s)s.style.display='none';console.log('Bypassed');}
async function init(){login();if(typeof updateClock==='function')updateClock();setInterval(()=>{if(typeof updateClock==='function')updateClock();},1000);await boot();}
function updateClock(){const c=document.getElementById('clock');if(c)c.textContent=new Date().toLocaleTimeString();}
function addMsg(r,h){const c=document.getElementById('chat');if(!c)return;const e=document.createElement('div');e.className='msg '+r;e.innerHTML='<div class="ava">'+(r==='ai'?'J':'U')+'</div><div class="bubble"><div class="bcontent">'+h+'</div></div>';c.appendChild(e);c.scrollTop=c.scrollHeight;}
window.addEventListener('DOMContentLoaded',init);
