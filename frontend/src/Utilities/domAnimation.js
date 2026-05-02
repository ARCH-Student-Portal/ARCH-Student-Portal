// src/utils/domAnimation.js

export function countUp(id, target, dec, suffix, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = Date.now();
  const tick = () => {
    const p = Math.min((Date.now() - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    el.textContent = (target * ease).toFixed(dec) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}