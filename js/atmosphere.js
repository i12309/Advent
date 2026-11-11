/**
 * Small, self-contained atmospheric renderer for the living postcards.
 * Detailed artwork belongs to the scene; this canvas carries only moving air,
 * depth, light and the little responses to a visitor's touch.
 */

const TAU = Math.PI * 2;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const THEMES = {
  winter: { kind: 'snow', count: 115, colors: ['#ffffff', '#dfebee', '#b5d1d8'], speed: 15 },
  'new-year': { kind: 'snow', count: 110, colors: ['#fff9e8', '#ffffff', '#c6e1e0'], speed: 17 },
  defender: { kind: 'starlight', count: 64, colors: ['#d4e2df', '#c3a776', '#8eafb8'], speed: 7 },
  spring: { kind: 'spring', count: 72, colors: ['#f6e2dc', '#fff5e8', '#9bb7b2'], speed: 11 },
  'womens-day': { kind: 'petal', count: 72, colors: ['#d990a1', '#edb8bf', '#f7dacf', '#c9a6be'], speed: 15 },
  'may-day': { kind: 'seed', count: 56, colors: ['#fffce9', '#e6c567', '#a5b9a1'], speed: 8 },
  victory: { kind: 'ember', count: 48, colors: ['#d9ac69', '#e4cfa0', '#f5e5bf'], speed: 9 },
  summer: { kind: 'firefly', count: 58, colors: ['#ffe9a0', '#d7eca4', '#e3cf83'], speed: 6 },
  russia: { kind: 'petal', count: 55, colors: ['#ffffff', '#d6e5e9', '#e7bbb3'], speed: 12 },
  autumn: { kind: 'leaf', count: 57, colors: ['#c18b45', '#d9ad61', '#ac6340', '#b59559'], speed: 19 },
  knowledge: { kind: 'knowledge', count: 52, colors: ['#c18b45', '#d9b476', '#af784c', '#e4c9a2'], speed: 16 },
  unity: { kind: 'lantern', count: 55, colors: ['#e5be83', '#f2d6a6', '#ddad72'], speed: 7 },
  birthday: { kind: 'confetti', count: 55, colors: ['#c3a170', '#cf9699', '#b9c9be', '#e5c9a1'], speed: 10 },
};

const ALIASES = {
  newyear: 'new-year', newYear: 'new-year', 'new_year': 'new-year',
  'defender-day': 'defender', 'defenders-day': 'defender', feb23: 'defender',
  women: 'womens-day', 'women-day': 'womens-day', 'women-s-day': 'womens-day', march8: 'womens-day',
  may1: 'may-day', labour: 'may-day', 'labor-day': 'may-day',
  may9: 'victory', 'victory-day': 'victory', 'russia-day': 'russia',
  'knowledge-day': 'knowledge', 'school': 'knowledge', 'unity-day': 'unity',
  'author-birthday': 'birthday', 'birthday-author': 'birthday',
};

function seedFor(text) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index++) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

export class Atmosphere {
  constructor(canvas, { onAction } = {}) {
    if (!canvas?.getContext) throw new TypeError('Atmosphere needs a canvas element.');
    this.canvas = canvas;
    this.context = canvas.getContext('2d', { alpha: true, desynchronized: true });
    this.onAction = onAction;
    this.alive = true;
    this._userPaused = false;
    this._pageHidden = false;
    this.frame = 0;
    this.lastFrame = 0;
    this.time = 0;
    this.themeId = '';
    this.celebration = false;
    this.particles = [];
    this.accents = [];
    this.glows = new Map();
    this.width = 1;
    this.height = 1;
    this.pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this._motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');

    this.tick = this.tick.bind(this);
    this.resize = this.resize.bind(this);
    this.sync = this.sync.bind(this);
    this.onPageHide = () => { this._pageHidden = true; this.sync(); };
    this.onPageShow = () => { this._pageHidden = false; this.sync(); };
    this.onMotionChange = () => {
      if (this.reducedMotion) this.accents.length = 0;
      this.sync();
    };
    window.addEventListener('resize', this.resize, { passive: true });
    window.addEventListener('pagehide', this.onPageHide);
    window.addEventListener('pageshow', this.onPageShow);
    document.addEventListener('visibilitychange', this.sync);
    this._motion?.addEventListener?.('change', this.onMotionChange);
    if (!this._motion?.addEventListener) this._motion?.addListener?.(this.onMotionChange);
    if (typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver(this.resize);
      this.observer.observe(canvas);
    }
    this.resize();
    this.setTheme('winter');
  }

  /** User pause is separate from system reduced motion and background-tab pause. */
  get paused() { return this._userPaused; }
  get reducedMotion() { return Boolean(this._motion?.matches); }
  get stopped() {
    return !this.alive || !this.context || this._userPaused || this.reducedMotion ||
      document.hidden || this._pageHidden;
  }

  random() {
    this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  setTheme(eventId, { celebration = false } = {}) {
    if (!this.alive) return;
    const candidate = ALIASES[eventId] || eventId;
    const id = Object.hasOwn(THEMES, candidate) ? candidate : 'winter';
    if (id === this.themeId && Boolean(celebration) === this.celebration) return;
    this.themeId = id;
    this.theme = THEMES[id];
    this.celebration = Boolean(celebration);
    this.seed = seedFor(id);
    this.time = 0;
    this.lastFrame = 0;
    this.nextAccent = this.celebration ? 3.8 : Infinity;
    this.accents.length = 0;
    this.buildParticles();
    this.sync();
  }

  setPaused(value) {
    const next = Boolean(value);
    if (next === this._userPaused || !this.alive) return;
    this._userPaused = next;
    this.sync();
  }

  /** Pointer input is in viewport CSS pixels, matching Mouse/PointerEvent.clientX. */
  setPointer(x, y) {
    if (!this.alive || !Number.isFinite(x) || !Number.isFinite(y)) return;
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.targetX = clamp((x - rect.left) / this.width - .5, -.5, .5);
    this.pointer.targetY = clamp((y - rect.top) / this.height - .5, -.5, .5);
  }

  resize() {
    if (!this.alive) return;
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || window.innerWidth));
    const height = Math.max(1, Math.round(rect.height || window.innerHeight));
    const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(8294400 / (width * height)));
    if (width === this.width && height === this.height && dpr === this.dpr) return;
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.context?.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.accents.length = 0;
    if (this.theme) this.buildParticles();
    this.draw(0);
  }

  buildParticles() {
    const areaScale = clamp(Math.pow(this.width * this.height / 1100000, .30), .48, 1.35);
    const count = Math.min(180, Math.round(this.theme.count * areaScale * (this.celebration ? 1.18 : 1)));
    this.particles = Array.from({ length: count }, (_, index) => {
      const depth = [.28, .57, 1][index % 3];
      let kind = this.theme.kind;
      if (kind === 'spring') kind = index % 5 < 2 ? 'rain' : 'petal';
      if (kind === 'knowledge') kind = index % 5 === 0 ? 'paper' : 'leaf';
      if (kind === 'seed' && index % 7 === 0) kind = 'ribbon';
      if (kind === 'starlight') kind = index % 4 === 0 ? 'spray' : 'star';
      if (kind === 'confetti') kind = index % 4 === 0 ? 'star' : 'ribbon';
      return {
        x: this.random(), y: this.random(), depth, kind,
        color: this.theme.colors[index % this.theme.colors.length],
        size: (.7 + this.random() * 1.3) * (.55 + depth * 1.35),
        phase: this.random() * TAU,
        rotation: this.random() * TAU,
        turn: (this.random() - .5) * .65,
        drift: (this.random() - .4) * 9,
        speed: this.theme.speed * (.4 + this.random() * .8) * (.45 + depth),
      };
    });
    for (const color of this.theme.colors) this.glow(color);
  }

  glow(color) {
    if (this.glows.has(color)) return this.glows.get(color);
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 48;
    const context = sprite.getContext('2d');
    if (!context) return null;
    const glow = context.createRadialGradient(24, 24, 0, 24, 24, 24);
    glow.addColorStop(0, color);
    glow.addColorStop(.12, color);
    glow.addColorStop(.4, `${color}55`);
    glow.addColorStop(1, `${color}00`);
    context.fillStyle = glow;
    context.fillRect(0, 0, 48, 48);
    this.glows.set(color, sprite);
    return sprite;
  }

  sync() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.lastFrame = 0;
    if (!this.alive) return;
    this.draw(0);
    if (!this.stopped) this.frame = requestAnimationFrame(this.tick);
  }

  tick(stamp) {
    this.frame = 0;
    if (this.stopped) return;
    const delta = this.lastFrame ? Math.min(.05, Math.max(0, (stamp - this.lastFrame) / 1000)) : 0;
    this.lastFrame = stamp;
    this.time += delta;
    const ease = 1 - Math.exp(-delta * 1.8);
    this.pointer.x += (this.pointer.targetX - this.pointer.x) * ease;
    this.pointer.y += (this.pointer.targetY - this.pointer.y) * ease;
    if (this.celebration && this.time >= this.nextAccent) {
      this.celebrationAccent();
      this.nextAccent = this.time + 12 + this.random() * 10;
    }
    this.draw(delta);
    if (!this.stopped) this.frame = requestAnimationFrame(this.tick);
  }

  celebrationAccent() {
    // Accents are gentle and infrequent. There is never a full-screen flash.
    const x = this.width * (this.width < 700 ? .27 + this.random() * .46 : .55 + this.random() * .32);
    const y = this.height * (this.width < 700 ? .47 + this.random() * .18 : .24 + this.random() * .30);
    this.makeBurst(x, y, true);
  }

  /** Add a bounded, theme-specific response; pausing still permits a static response. */
  burst(clientX, clientY) {
    if (!this.alive || !this.context || !this.theme) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = Number.isFinite(clientX) ? clientX - rect.left : this.width * (this.width < 700 ? .5 : .7);
    const y = Number.isFinite(clientY) ? clientY - rect.top : this.height * .53;
    if (this.stopped) this.accents.length = 0;
    this.makeBurst(clamp(x, 0, this.width), clamp(y, 0, this.height), false);
    this.draw(0);
    this.onAction?.({ eventId: this.themeId, celebration: this.celebration });
  }

  makeBurst(x, y, ambient) {
    const id = this.themeId;
    const firework = id === 'new-year';
    const birthday = id === 'birthday';
    const count = ambient ? (firework ? 42 : 16) : (firework ? 65 : birthday ? 44 : 32);
    const limit = 220;
    if (this.accents.length + count > limit) this.accents.splice(0, this.accents.length + count - limit);
    for (let index = 0; index < count; index++) {
      const angle = this.random() * TAU;
      const speed = (firework ? 35 : 15) + this.random() * (firework ? 62 : 43);
      let kind = this.theme.kind;
      if (firework) kind = 'spark';
      else if (birthday) kind = index < 3 && !ambient ? 'balloon' : index % 4 === 0 ? 'star' : 'ribbon';
      else if (kind === 'spring') kind = 'petal';
      else if (kind === 'knowledge') kind = index % 5 === 0 ? 'paper' : 'leaf';
      else if (kind === 'starlight') kind = 'star';
      else if (kind === 'ember' || kind === 'lantern') kind = 'firefly';
      const color = firework ? ['#e9cc91', '#f7e7bd', '#c4dbda'][index % 3]
        : this.theme.colors[index % this.theme.colors.length];
      const stillRadius = this.stopped ? 14 + this.random() * 70 : this.random() * 9;
      this.accents.push({
        x: x + Math.cos(angle) * stillRadius, y: y + Math.sin(angle) * stillRadius,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (kind === 'balloon' ? 32 : firework ? 5 : 18),
        kind, color, phase: this.random() * TAU,
        size: kind === 'balloon' ? 12 + this.random() * 10 : 1.4 + this.random() * 2.2,
        rotation: this.random() * TAU, turn: (this.random() - .5) * 2,
        age: 0, life: kind === 'balloon' ? 10 : 3 + this.random() * 3.2,
        gravity: kind === 'balloon' ? -2 : firework ? 12 : ['firefly', 'seed'].includes(kind) ? -1 : 5,
      });
      if (['spark', 'firefly', 'balloon'].includes(kind)) this.glow(color);
    }
  }

  textClearance(x, y) {
    // Keep the countdown readable without cutting a visible rectangular hole.
    if (this.width < 700) return y < this.height * .36 ? .36 : y > this.height * .86 ? .5 : 1;
    const horizontal = clamp((x / this.width - .26) / .23, 0, 1);
    const vertical = clamp((y / this.height - .60) / .2, 0, 1);
    return .32 + .68 * Math.max(horizontal, vertical);
  }

  draw(delta) {
    const context = this.context;
    if (!context) return;
    context.clearRect(0, 0, this.width, this.height);
    if (!this.theme) return;
    const wind = 3 + Math.sin(this.time * .17) * 3 + this.pointer.x * 13;
    for (const particle of this.particles) {
      const kind = particle.kind;
      const rising = ['firefly', 'ember', 'lantern', 'star'].includes(kind);
      if (delta) {
        const float = Math.sin(this.time * .4 + particle.phase);
        particle.x += delta * (particle.drift + wind * particle.depth + float * 3) / this.width;
        particle.y += delta * particle.speed * (rising ? -.42 : kind === 'rain' ? 3.1 : 1) / this.height;
        particle.x = (particle.x + 1.04) % 1.04;
        particle.y = (particle.y + 1.08) % 1.08;
        particle.rotation += delta * particle.turn;
      }
      const sway = Math.sin(this.time * (.34 + particle.depth * .15) + particle.phase);
      const x = particle.x * this.width - this.width * .02 + sway * (kind === 'rain' ? 0 : 6 + particle.depth * 9);
      let y = particle.y * this.height - this.height * .04;
      if (kind === 'firefly') y += Math.sin(this.time * .45 + particle.phase * 2) * 9;
      let opacity = (.22 + particle.depth * .38) * this.textClearance(x, y);
      if (['firefly', 'star', 'lantern'].includes(kind)) opacity *= .45 + .55 * Math.pow(Math.sin(this.time * .7 + particle.phase), 2);
      this.drawParticle(kind, x, y, particle.size, particle.rotation, particle.color, opacity, particle.phase);
    }

    for (let index = this.accents.length - 1; index >= 0; index--) {
      const particle = this.accents[index];
      if (delta) {
        particle.age += delta;
        if (particle.age >= particle.life) { this.accents.splice(index, 1); continue; }
        const drag = Math.exp(-delta * (particle.kind === 'balloon' ? .15 : .45));
        particle.vx = particle.vx * drag + wind * delta * .2;
        particle.vy = particle.vy * drag + particle.gravity * delta;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.rotation += particle.turn * delta;
      }
      const progress = particle.age / particle.life;
      const opacity = Math.pow(1 - progress, .7) * (particle.kind === 'balloon' ? .64 : .82);
      this.drawParticle(particle.kind, particle.x, particle.y, particle.size,
        particle.rotation, particle.color, opacity, particle.phase, particle);
    }
    context.globalAlpha = 1;
  }

  drawParticle(kind, x, y, size, rotation, color, opacity, phase, accent) {
    if (opacity < .01 || x < -70 || y < -90 || x > this.width + 70 || y > this.height + 90) return;
    const context = this.context;
    context.save();
    context.translate(x, y);
    context.globalAlpha = opacity;
    context.fillStyle = color;
    context.strokeStyle = color;
    context.lineCap = 'round';
    context.lineWidth = .6;

    if (['firefly', 'ember', 'lantern', 'spark'].includes(kind)) {
      const sprite = this.glow(color);
      const radius = size * (kind === 'lantern' ? 5 : 3.2);
      if (sprite) context.drawImage(sprite, -radius, -radius, radius * 2, radius * 2);
      if (kind === 'spark' && accent) {
        context.lineWidth = .7;
        context.beginPath(); context.moveTo(0, 0);
        context.lineTo(-accent.vx * .045, -accent.vy * .045); context.stroke();
      }
    } else if (kind === 'snow' || kind === 'spray') {
      context.beginPath(); context.arc(0, 0, size * (kind === 'spray' ? .4 : .62), 0, TAU); context.fill();
    } else if (kind === 'rain') {
      context.globalAlpha *= .43;
      context.lineWidth = .5;
      context.beginPath(); context.moveTo(0, 0); context.lineTo(1 + this.pointer.x * 3, size * 4); context.stroke();
    } else if (kind === 'star') {
      context.rotate(rotation * .2);
      context.beginPath();
      for (let index = 0; index < 8; index++) {
        const angle = index * Math.PI / 4;
        const radius = index % 2 ? size * .35 : size * 1.65;
        if (index === 0) context.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        else context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      }
      context.closePath(); context.fill();
    } else if (kind === 'petal') {
      context.rotate(rotation + Math.sin(this.time * .6 + phase) * .3);
      context.scale(.35 + Math.abs(Math.cos(this.time * .35 + phase)) * .65, 1);
      context.beginPath(); context.moveTo(0, size * 1.7);
      context.bezierCurveTo(-size * 2.3, -size * .1, -size * 1.1, -size * 2.1, 0, -size * 1.4);
      context.bezierCurveTo(size * 1.7, -size * 2.2, size * 2, size * .2, 0, size * 1.7);
      context.fill();
    } else if (kind === 'leaf') {
      context.rotate(rotation + Math.sin(this.time * .7 + phase) * .3);
      context.scale(.4 + Math.abs(Math.cos(this.time * .3 + phase)) * .6, 1);
      context.beginPath(); context.moveTo(0, -size * 2.1);
      context.bezierCurveTo(size * 2.4, -size * .7, size * 1.2, size * 1.6, 0, size * 2.2);
      context.bezierCurveTo(-size * 1.6, size, -size * 1.9, -size * .7, 0, -size * 2.1);
      context.fill();
      context.strokeStyle = '#73543d'; context.globalAlpha *= .65; context.lineWidth = .45;
      context.beginPath(); context.moveTo(0, -size * 1.7); context.lineTo(0, size * 2.7);
      context.moveTo(0, -size * .4); context.lineTo(size * .8, -size);
      context.moveTo(0, size * .5); context.lineTo(-size * .8, -size * .1); context.stroke();
    } else if (kind === 'seed') {
      context.rotate(rotation * .3);
      context.lineWidth = .45;
      context.beginPath(); context.moveTo(0, 0); context.lineTo(size * .7, size * 3); context.stroke();
      for (let index = 0; index < 6; index++) {
        const angle = Math.PI * (1.12 + index * .15);
        context.beginPath(); context.moveTo(0, 0);
        context.lineTo(Math.cos(angle) * size * 2.4, Math.sin(angle) * size * 2.4); context.stroke();
      }
    } else if (kind === 'balloon') {
      context.rotate(Math.sin(this.time * .65 + phase) * .13);
      context.beginPath(); context.ellipse(0, 0, size * .72, size, 0, 0, TAU); context.fill();
      context.globalAlpha *= .5; context.fillStyle = '#fff9ea';
      context.beginPath(); context.ellipse(-size * .24, -size * .3, size * .11, size * .3, .3, 0, TAU); context.fill();
      context.strokeStyle = '#c7b69a'; context.lineWidth = .6;
      context.beginPath(); context.moveTo(0, size);
      context.bezierCurveTo(-7, size * 1.8, 8, size * 2.7, Math.sin(this.time + phase) * 7, size * 3.6); context.stroke();
    } else {
      context.rotate(rotation);
      const width = size * (.3 + Math.abs(Math.sin(this.time * .7 + phase)));
      if (kind === 'paper') {
        context.beginPath(); context.moveTo(-width * 1.6, -size);
        context.lineTo(width * 1.6, -size * .7); context.lineTo(width, size * 1.2);
        context.lineTo(-width * 1.7, size * .8); context.closePath(); context.fill();
      } else context.fillRect(-width / 2, -size, width, size * 2.6);
    }
    context.restore();
  }

  destroy() {
    if (!this.alive) return;
    this.alive = false;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.observer?.disconnect();
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('pagehide', this.onPageHide);
    window.removeEventListener('pageshow', this.onPageShow);
    document.removeEventListener('visibilitychange', this.sync);
    this._motion?.removeEventListener?.('change', this.onMotionChange);
    if (!this._motion?.removeEventListener) this._motion?.removeListener?.(this.onMotionChange);
    this.particles.length = 0;
    this.accents.length = 0;
    this.glows.clear();
    this.context?.clearRect(0, 0, this.width, this.height);
  }
}
