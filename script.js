const scene = document.querySelector('.scene');
const stage = document.querySelector('.stage');

const HIDE = 420;
const SCALE_FACTOR = 0.75;

let currentScale = 1;
let stageY = 0;       // vertical drag offset (viewport px)
let stageYVel = 0;

function applyTransforms() {
  stage.style.transform =
    `translateY(${-HIDE * currentScale + stageY}px) scale(${currentScale})`;
  scene.style.transform =
    `rotate(${angle}deg) perspective(600px) rotateY(${-angle * 0.15}deg)`;
}

function fitToViewport() {
  currentScale = (window.innerHeight / (1014 - HIDE)) * SCALE_FACTOR;
  applyTransforms();
}

fitToViewport();
window.addEventListener('resize', fitToViewport);

// ── Pendulum physics ──────────────────────────────────────────────────────────

let isDragging = false;
let angle = 0;
let angularVelocity = 0;
let lastX = 0;
let lastY = 0;
let lastDx = 0;
let lastDy = 0;
let rafId = null;

const STIFFNESS   = 0.08;
const Y_STIFFNESS = 0.05;   // softer — lanyard can stretch
const DAMPING     = 0.96;
const MAX_ANGLE   = 65;
const MAX_UP      = 150;
const MAX_DOWN    = 350;

function physicsLoop() {
  angularVelocity = (angularVelocity - angle * STIFFNESS) * DAMPING;
  angle += angularVelocity;

  stageYVel = (stageYVel - stageY * Y_STIFFNESS) * DAMPING;
  stageY += stageYVel;

  applyTransforms();

  const settled =
    Math.abs(angle) < 0.01 && Math.abs(angularVelocity) < 0.01 &&
    Math.abs(stageY) < 0.01 && Math.abs(stageYVel) < 0.01;

  if (settled) {
    angle = 0; angularVelocity = 0;
    stageY = 0; stageYVel = 0;
    applyTransforms();
    rafId = null;
    return;
  }

  rafId = requestAnimationFrame(physicsLoop);
}

scene.addEventListener('pointerdown', (e) => {
  isDragging = true;
  lastDx = 0; lastDy = 0;
  lastX = e.clientX; lastY = e.clientY;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  scene.setPointerCapture(e.pointerId);
  scene.classList.add('dragging');
});

scene.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  lastDx = e.clientX - lastX;
  lastDy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;

  angle  = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, angle + lastDx * 0.3));
  stageY = Math.max(-MAX_UP,   Math.min(MAX_DOWN,  stageY + lastDy));

  applyTransforms();
});

scene.addEventListener('pointerup', () => {
  if (!isDragging) return;
  isDragging = false;
  scene.classList.remove('dragging');
  angularVelocity = lastDx * 0.3;
  stageYVel       = lastDy * 0.5;
  rafId = requestAnimationFrame(physicsLoop);
});

scene.addEventListener('pointercancel', () => {
  if (!isDragging) return;
  isDragging = false;
  scene.classList.remove('dragging');
  rafId = requestAnimationFrame(physicsLoop);
});
