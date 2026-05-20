const scene = document.querySelector('.scene');
const stage = document.querySelector('.stage');

// Pixels of lanyard top (the V-shape) to push above the viewport
const HIDE = 420;

function fitToViewport() {
  const S = (window.innerHeight / (1014 - HIDE)) * 0.75;
  // scale(S) from top-center, then slide the whole thing up so scene y=HIDE sits at viewport top
  stage.style.transform = `translateY(${-HIDE * S}px) scale(${S})`;
}

fitToViewport();
window.addEventListener('resize', fitToViewport);

// ── Pendulum physics ──────────────────────────────────────────────────────────

let isDragging = false;
let angle = 0;
let angularVelocity = 0;
let lastX = 0;
let lastDx = 0;
let rafId = null;

const STIFFNESS = 0.08;
const DAMPING   = 0.96;
const MAX_ANGLE = 65;

function setTransform() {
  scene.style.transform =
    `rotate(${angle}deg) perspective(600px) rotateY(${-angle * 0.15}deg)`;
}

function physicsLoop() {
  angularVelocity = (angularVelocity - angle * STIFFNESS) * DAMPING;
  angle += angularVelocity;
  setTransform();

  if (Math.abs(angle) < 0.01 && Math.abs(angularVelocity) < 0.01) {
    angle = 0;
    angularVelocity = 0;
    setTransform();
    rafId = null;
    return;
  }

  rafId = requestAnimationFrame(physicsLoop);
}

scene.addEventListener('pointerdown', (e) => {
  isDragging = true;
  lastDx = 0;
  lastX = e.clientX;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  scene.setPointerCapture(e.pointerId);
  scene.classList.add('dragging');
});

scene.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  lastDx = e.clientX - lastX;
  lastX = e.clientX;
  angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, angle + lastDx * 0.3));
  setTransform();
});

scene.addEventListener('pointerup', () => {
  if (!isDragging) return;
  isDragging = false;
  scene.classList.remove('dragging');
  angularVelocity = lastDx * 0.3;
  rafId = requestAnimationFrame(physicsLoop);
});

scene.addEventListener('pointercancel', () => {
  if (!isDragging) return;
  isDragging = false;
  scene.classList.remove('dragging');
  rafId = requestAnimationFrame(physicsLoop);
});
