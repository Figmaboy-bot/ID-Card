const scene = document.querySelector('.scene');
const stage = document.querySelector('.stage');

const HIDE         = 420;
const SCALE_FACTOR = 0.75;

let currentScale = 1;

// ── Viewport fit (stage only — never touched during drag) ─────────────────────

function fitToViewport() {
  currentScale = (window.innerHeight / (1014 - HIDE)) * SCALE_FACTOR;
  stage.style.transform =
    `translateY(${-HIDE * currentScale}px) scale(${currentScale})`;
}

fitToViewport();
window.addEventListener('resize', fitToViewport);

// ── State ─────────────────────────────────────────────────────────────────────

let isDragging = false;
let angle = 0,  angularVel = 0;
let yPx  = 0,   yVel       = 0;   // vertical offset in screen px
let lastX = 0,  lastY = 0;
let lastDx = 0, lastDy = 0;
let rafId = null;

const STIFFNESS   = 0.08;
const Y_STIFFNESS = 0.05;
const DAMPING     = 0.96;
const MAX_ANGLE   = 65;
const MAX_UP      = 150;
const MAX_DOWN    = 350;

// ── Transform ─────────────────────────────────────────────────────────────────

function applyTransforms() {
  const yLocal = yPx / currentScale;
  scene.style.transform = `translateY(${yLocal}px) rotate(${angle}deg)`;
}

// ── Physics loop ──────────────────────────────────────────────────────────────

function physicsLoop() {
  angularVel = (angularVel - angle * STIFFNESS)  * DAMPING;
  angle      += angularVel;

  yVel = (yVel - yPx * Y_STIFFNESS) * DAMPING;
  yPx  += yVel;

  applyTransforms();

  const settled =
    Math.abs(angle) < 0.01 && Math.abs(angularVel) < 0.01 &&
    Math.abs(yPx)   < 0.01 && Math.abs(yVel)       < 0.01;

  if (settled) {
    angle = 0; angularVel = 0;
    yPx   = 0; yVel       = 0;
    applyTransforms();
    rafId = null;
    return;
  }

  rafId = requestAnimationFrame(physicsLoop);
}

// ── Pointer events ────────────────────────────────────────────────────────────

scene.addEventListener('pointerdown', (e) => {
  isDragging = true;
  lastDx = 0; lastDy = 0;
  lastX  = e.clientX; lastY = e.clientY;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  scene.setPointerCapture(e.pointerId);
  scene.classList.add('dragging');
});

scene.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  lastDx = e.clientX - lastX;
  lastDy = e.clientY - lastY;
  lastX  = e.clientX;
  lastY  = e.clientY;

  angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, angle + lastDx * 0.3));
  yPx   = Math.max(-MAX_UP,   Math.min(MAX_DOWN,  yPx   + lastDy));

  applyTransforms();
});

scene.addEventListener('pointerup', () => {
  if (!isDragging) return;
  isDragging = false;
  scene.classList.remove('dragging');
  angularVel = lastDx * 0.3;
  yVel       = lastDy * 0.5;
  rafId = requestAnimationFrame(physicsLoop);
});

scene.addEventListener('pointercancel', () => {
  if (!isDragging) return;
  isDragging = false;
  scene.classList.remove('dragging');
  rafId = requestAnimationFrame(physicsLoop);
});
