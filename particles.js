// ============================================================
//  KXD AI — J.A.R.V.I.S. Particle Engine + Arc Reactor
// ============================================================

class ParticleEngine {
  constructor(canvas) {
    this.cv = canvas; this.ct = canvas.getContext('2d');
    this.pts = []; this.t = 0; this.af = null;
    this.resize();
    this.init();
    window.addEventListener('resize', () => { this.resize(); this.init(); });
  }
  resize() { this.cv.width = window.innerWidth; this.cv.height = window.innerHeight; this.W = this.cv.width; this.H = this.cv.height; }
  init() {
    this.pts = [];
    const n = Math.floor(this.W * this.H / 12000);
    for (let i = 0; i < n; i++) this.pts.push(this.mkPt());
  }
  mkPt(x, y) {
    const colors = ['#00d4ff', '#64b5f6', '#ffd700', '#00aaff'];
    return {
      x: x ?? Math.random() * this.W,
      y: y ?? Math.random() * this.H,
      vx: (Math.random() - .5) * .35,
      vy: (Math.random() - .5) * .35,
      r: Math.random() * 1.6 + .3,
      a: Math.random() * .55 + .1,
      c: colors[Math.floor(Math.random() * colors.length)],
      ph: Math.random() * Math.PI * 2,
      ps: .008 + Math.random() * .016,
    };
  }
  grid() {
    const ct = this.ct, sp = 65, off = (this.t * .12) % sp;
    ct.strokeStyle = 'rgba(0,212,255,0.035)'; ct.lineWidth = .5;
    for (let x = -off; x < this.W; x += sp) { ct.beginPath(); ct.moveTo(x,0); ct.lineTo(x,this.H); ct.stroke(); }
    for (let y = -off; y < this.H; y += sp) { ct.beginPath(); ct.moveTo(0,y); ct.lineTo(this.W,y); ct.stroke(); }
  }
  connect() {
    const ct = this.ct; const lim = 110;
    for (let i = 0; i < this.pts.length; i++)
      for (let j = i+1; j < this.pts.length; j++) {
        const a = this.pts[i], b = this.pts[j];
        const d = Math.hypot(a.x-b.x, a.y-b.y);
        if (d < lim) {
          ct.strokeStyle = `rgba(0,212,255,${(1-d/lim)*.12})`; ct.lineWidth = .5;
          ct.beginPath(); ct.moveTo(a.x,a.y); ct.lineTo(b.x,b.y); ct.stroke();
        }
      }
  }
  draw() {
    const ct = this.ct;
    for (const p of this.pts) {
      p.ph += p.ps;
      ct.globalAlpha = p.a * (.7 + .3*Math.sin(p.ph));
      ct.fillStyle = p.c;
      ct.beginPath(); ct.arc(p.x, p.y, p.r, 0, Math.PI*2); ct.fill();
      ct.globalAlpha = 1;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = this.W; if (p.x > this.W) p.x = 0;
      if (p.y < 0) p.y = this.H; if (p.y > this.H) p.y = 0;
    }
  }
  scan() {
    const ct = this.ct, y = (this.t*.4) % (this.H+60) - 30;
    const g = ct.createLinearGradient(0,y-25,0,y+25);
    g.addColorStop(0,'rgba(0,212,255,0)'); g.addColorStop(.5,'rgba(0,212,255,0.025)'); g.addColorStop(1,'rgba(0,212,255,0)');
    ct.fillStyle = g; ct.fillRect(0,y-25,this.W,50);
  }
  tick() {
    this.ct.clearRect(0,0,this.W,this.H);
    this.grid(); this.connect(); this.draw(); this.scan();
    this.t++;
    this.af = requestAnimationFrame(() => this.tick());
  }
  start() { if (!this.af) this.tick(); }
  stop()  { if (this.af) { cancelAnimationFrame(this.af); this.af = null; } }
}

class ArcReactor {
  constructor(canvas) {
    this.cv = canvas; this.ct = canvas.getContext('2d');
    this.angle = 0; this.ph = 0; this.af = null;
  }
  draw() {
    const ct = this.ct, w = this.cv.width, h = this.cv.height;
    const cx = w/2, cy = h/2;
    ct.clearRect(0,0,w,h);

    const pulse = .85 + .15*Math.sin(this.ph);

    // Outer glow aura
    const aura = ct.createRadialGradient(cx,cy,0,cx,cy,w*.48);
    aura.addColorStop(0, `rgba(0,212,255,${.07*pulse})`);
    aura.addColorStop(.6,`rgba(0,100,255,${.035*pulse})`);
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    ct.fillStyle = aura; ct.fillRect(0,0,w,h);

    ct.save(); ct.translate(cx,cy);

    // Ring 1 — outer rotating dashed
    ct.save(); ct.rotate(this.angle*.28);
    ct.strokeStyle=`rgba(0,212,255,${.55*pulse})`; ct.lineWidth=1.5; ct.setLineDash([9,7]);
    ct.beginPath(); ct.arc(0,0,w*.44,0,Math.PI*2); ct.stroke();
    ct.restore();

    // Ring 2 — gold counter-rotate
    ct.save(); ct.rotate(-this.angle*.42);
    ct.strokeStyle=`rgba(255,215,0,${.28*pulse})`; ct.lineWidth=1; ct.setLineDash([4,13]);
    ct.beginPath(); ct.arc(0,0,w*.37,0,Math.PI*2); ct.stroke();
    ct.restore();

    // Ring 3 — solid inner
    ct.setLineDash([]);
    ct.strokeStyle=`rgba(0,212,255,${.72*pulse})`; ct.lineWidth=2;
    ct.beginPath(); ct.arc(0,0,w*.28,0,Math.PI*2); ct.stroke();

    // Tick marks
    for (let i=0; i<36; i++) {
      const a=(i/36)*Math.PI*2, r1=w*.30, r2=i%3===0?w*.34:w*.32;
      ct.strokeStyle=`rgba(0,212,255,${.45*pulse})`; ct.lineWidth=1; ct.setLineDash([]);
      ct.beginPath(); ct.moveTo(Math.cos(a)*r1,Math.sin(a)*r1); ct.lineTo(Math.cos(a)*r2,Math.sin(a)*r2); ct.stroke();
    }

    // Core glow
    const cg = ct.createRadialGradient(0,0,0,0,0,w*.15);
    cg.addColorStop(0,`rgba(255,255,255,${.9*pulse})`);
    cg.addColorStop(.3,`rgba(0,212,255,${.8*pulse})`);
    cg.addColorStop(.7,`rgba(0,80,200,${.45*pulse})`);
    cg.addColorStop(1,'rgba(0,30,120,0)');
    ct.beginPath(); ct.arc(0,0,w*.15,0,Math.PI*2); ct.fillStyle=cg; ct.fill();

    // Inner hex spokes
    ct.save(); ct.rotate(this.angle*.75);
    ct.strokeStyle=`rgba(255,255,255,${.38*pulse})`; ct.lineWidth=1;
    for(let i=0;i<6;i++){
      const a=(i/6)*Math.PI*2, r=w*.095;
      ct.beginPath(); ct.moveTo(0,0); ct.lineTo(Math.cos(a)*r,Math.sin(a)*r); ct.stroke();
    }
    ct.restore();

    ct.restore();

    this.angle += .014; this.ph += .028;
    this.af = requestAnimationFrame(() => this.draw());
  }
  start() { if (!this.af) this.draw(); }
  stop()  { if (this.af) { cancelAnimationFrame(this.af); this.af = null; } }
}

window.ParticleEngine = ParticleEngine;
window.ArcReactor = ArcReactor;
