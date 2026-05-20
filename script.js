const scene = document.querySelector('.scene');
const stage = document.querySelector('.stage');

const HIDE         = 420;
const SCALE_FACTOR = 0.75;

let currentScale = 1;

// ── Viewport fit ──────────────────────────────────────────────────────────────

function fitToViewport() {
  currentScale = (window.innerHeight / (1014 - HIDE)) * SCALE_FACTOR;
  document.documentElement.style.setProperty('--scale', currentScale);
  stage.style.transform = `translateY(${-HIDE * currentScale}px)`;
}

fitToViewport();
window.addEventListener('resize', fitToViewport);

// ── State ─────────────────────────────────────────────────────────────────────

let isDragging = false;
let angle = 0,  angularVel = 0;
let yPx  = 0,   yVel       = 0;
let rafId = null;
let ptrHistory = [];

const STIFFNESS   = 0.15;
const Y_STIFFNESS = 0.12;
const DAMPING     = 0.68;
const MAX_ANGLE   = 65;
const MAX_UP      = 150;
const MAX_DOWN    = 350;

// ── Transform ─────────────────────────────────────────────────────────────────

function applyTransforms() {
  scene.style.transform = `translateY(${yPx}px) rotate(${angle}deg)`;
}

// ── Physics loop ──────────────────────────────────────────────────────────────

function physicsLoop() {
  angularVel *= DAMPING;
  angularVel -= angle * STIFFNESS;
  angle      += angularVel;

  yVel *= DAMPING;
  yVel -= yPx * Y_STIFFNESS;
  yPx  += yVel;

  applyTransforms();

  const settled =
    Math.abs(angle) < 0.05 && Math.abs(angularVel) < 0.05 &&
    Math.abs(yPx)   < 0.05 && Math.abs(yVel)       < 0.05;

  if (settled) {
    angle = 0; angularVel = 0;
    yPx   = 0; yVel       = 0;
    applyTransforms();
    scene.style.willChange = '';
    rafId = null;
    return;
  }

  rafId = requestAnimationFrame(physicsLoop);
}

// ── Drag helpers ──────────────────────────────────────────────────────────────

function getReleaseVel() {
  const now    = performance.now();
  const cutoff = now - 80;
  const old    = ptrHistory.find(p => p.t >= cutoff) || ptrHistory[0];
  const last   = ptrHistory[ptrHistory.length - 1];
  if (!old || !last || old === last) return { vx: 0, vy: 0 };
  const dt = Math.max(16.67, last.t - old.t) / 16.67;
  return {
    vx: (last.x - old.x) / dt,
    vy: (last.y - old.y) / dt,
  };
}

function startPhysics(withVelocity) {
  if (withVelocity) {
    const { vx, vy } = getReleaseVel();
    angularVel = Math.max(-20, Math.min(20, vx * 0.3));
    yVel       = Math.max(-20, Math.min(20, vy * 0.5));
  } else {
    angularVel = 0;
    yVel       = 0;
  }
  if (rafId) { cancelAnimationFrame(rafId); }
  rafId = requestAnimationFrame(physicsLoop);
}

function endDrag(withVelocity) {
  isDragging = false;
  scene.classList.remove('dragging');
  startPhysics(withVelocity);
}

// ── Pointer events ────────────────────────────────────────────────────────────

scene.addEventListener('pointerdown', (e) => {
  isDragging  = true;
  ptrHistory  = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  scene.setPointerCapture(e.pointerId);
  scene.classList.add('dragging');
  scene.style.willChange = 'transform';
});

scene.addEventListener('pointermove', (e) => {
  // Recover from a missed pointerup (e.g. button released outside the window).
  if (isDragging && e.buttons === 0) {
    endDrag(false);
    return;
  }
  if (!isDragging) return;

  const prev = ptrHistory[ptrHistory.length - 1];
  const dx   = e.clientX - prev.x;
  const dy   = e.clientY - prev.y;

  ptrHistory.push({ x: e.clientX, y: e.clientY, t: performance.now() });
  if (ptrHistory.length > 12) ptrHistory.shift();

  angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, angle + dx * 0.3));
  yPx   = Math.max(-MAX_UP,   Math.min(MAX_DOWN,  yPx   + dy));

  applyTransforms();
});

scene.addEventListener('pointerup', () => {
  if (!isDragging) return;
  endDrag(true);
});

scene.addEventListener('pointercancel', () => {
  if (!isDragging) return;
  endDrag(false);
});

// Catch missed pointerup when the window loses focus entirely.
window.addEventListener('blur', () => {
  if (isDragging) endDrag(false);
});
