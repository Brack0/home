// CANVAS — particle space background
(function () {
  const canvas = document.getElementById('space');
  if (!canvas) return;

  // ─── CONSTANTS ────────────────────────────────────────────────────────────
  const TWO_PI              = Math.PI * 2;
  const STAR_COUNT          = 120;
  const PARTICLE_COUNT      = 80;
  const TARGET_FPS          = 30;
  const FRAME_INTERVAL      = 1000 / TARGET_FPS;
  const RESIZE_DEBOUNCE_MS  = 200;

  // ─── CONTEXT & MOTION ─────────────────────────────────────────────────────
  const ctx             = canvas.getContext('2d', { desynchronized: true });
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── STATE ────────────────────────────────────────────────────────────────
  let width         = window.innerWidth;
  let height        = window.innerHeight;
  let gradient      = null;
  let animationId   = null;
  let lastFrameTime = 0;
  let resizeTimer   = null;

  // ─── TYPED ARRAYS (SoA) ───────────────────────────────────────────────────
  const starX          = new Float32Array(STAR_COUNT);
  const starY          = new Float32Array(STAR_COUNT);
  const starRadius     = new Float32Array(STAR_COUNT);
  const starAlpha      = new Float32Array(STAR_COUNT);
  const starAlphaSpeed = new Float32Array(STAR_COUNT);
  const starAlphaDelta = new Int8Array(STAR_COUNT);   // -1 or 1

  const particleX      = new Float32Array(PARTICLE_COUNT);
  const particleY      = new Float32Array(PARTICLE_COUNT);
  const particleRadius = new Float32Array(PARTICLE_COUNT);
  const particleSpeed  = new Float32Array(PARTICLE_COUNT);
  const particleAlpha  = new Float32Array(PARTICLE_COUNT);

  // ─── FUNCTIONS ────────────────────────────────────────────────────────────
  function buildGradient() {
    const g = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 500);
    g.addColorStop(0, 'rgba(93,183,255,0.05)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    gradient = g;
  }

  function initStars() {
    for (let i = 0; i < STAR_COUNT; i++) {
      starX[i]          = Math.random() * width;
      starY[i]          = Math.random() * height;
      starRadius[i]     = Math.random() * 1.5 + 0.5;
      starAlpha[i]      = Math.random() * 0.6 + 0.1;
      starAlphaSpeed[i] = Math.random() * 0.008 + 0.002;
      starAlphaDelta[i] = Math.random() > 0.5 ? 1 : -1;
    }
  }

  function initParticles() {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particleX[i]      = Math.random() * width;
      particleY[i]      = Math.random() * height;
      particleRadius[i] = Math.random() * 1.5;
      particleSpeed[i]  = Math.random() * 0.2 + 0.05;
      particleAlpha[i]  = Math.random() * 0.6;
    }
  }

  function update() {
    for (let i = 0; i < STAR_COUNT; i++) {
      starAlpha[i] += starAlphaSpeed[i] * starAlphaDelta[i];
      if (starAlpha[i] >= 0.9)  { starAlpha[i] = 0.9;  starAlphaDelta[i] = -1; }
      if (starAlpha[i] <= 0.05) { starAlpha[i] = 0.05; starAlphaDelta[i] =  1; }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particleY[i] += particleSpeed[i];
      if (particleY[i] > height) {
        particleY[i] = 0;
        particleX[i] = Math.random() * width;
      }
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#ffffff';

    for (let i = 0; i < STAR_COUNT; i++) {
      ctx.globalAlpha = starAlpha[i];
      ctx.beginPath();
      ctx.arc(starX[i], starY[i], starRadius[i], 0, TWO_PI);
      ctx.fill();
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      ctx.globalAlpha = particleAlpha[i];
      ctx.beginPath();
      ctx.arc(particleX[i], particleY[i], particleRadius[i], 0, TWO_PI);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function startAnimation() {
    if (animationId !== null) return;
    animationId = requestAnimationFrame(animateLoop);
  }

  function stopAnimation() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function animateLoop(timestamp) {
    animationId = requestAnimationFrame(animateLoop);

    if (timestamp - lastFrameTime < FRAME_INTERVAL) return;
    lastFrameTime = timestamp;

    update();
    drawFrame();
  }

  function onResize() {
    width         = window.innerWidth;
    height        = window.innerHeight;
    canvas.width  = width;
    canvas.height = height;
    buildGradient();
    initStars();
    initParticles();
    if (isReducedMotion) drawFrame();
  }

  // ─── EVENTS ───────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, RESIZE_DEBOUNCE_MS);
  });

  document.addEventListener('visibilitychange', () => {
    if (!isReducedMotion) {
      if (document.hidden) stopAnimation();
      else startAnimation();
    }
  });

  // ─── BOOTSTRAP ────────────────────────────────────────────────────────────
  canvas.width  = width;
  canvas.height = height;
  buildGradient();
  initStars();
  initParticles();

  if (isReducedMotion) drawFrame();
  else startAnimation();
}());
