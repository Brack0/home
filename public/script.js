// PRELOADER
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    document.querySelectorAll('.boot-line').forEach(l => l.classList.add('visible'));
    preloader.classList.add('hidden');
    return;
  }

  bootSequence(preloader);
});

function bootSequence(preloader) {
  document.querySelectorAll('.boot-line').forEach(line => {
    const startMs = parseInt(line.dataset.startMs) || 0;
    setTimeout(() => {
      line.classList.add('visible');
      switch (line.dataset.effect) {
        case 'progress': bootProgress(line); break;
        case 'counter':  bootCounter(line);  break;
        case 'typing':   bootTyping(line);   break;
        case 'cursor':   bootCursor(line);   break;
        // 'flicker' is handled entirely by CSS on .visible
      }
    }, startMs);
  });

  setTimeout(() => preloader.classList.add('hidden'), 3650);
}

function bootProgress(line) {
  const barLen   = parseInt(line.dataset.barLen)   || 20;
  const duration = parseInt(line.dataset.duration) || 750;
  const wrap = document.createElement('span');
  wrap.className = 'boot-bar-wrap';
  line.appendChild(wrap);

  let step = 0;
  const timer = setInterval(() => {
    const pct = Math.round((step / barLen) * 100);
    wrap.textContent = ' [' + '█'.repeat(step) + '░'.repeat(barLen - step) + '] ' + pct + '%';
    step++;
    if (step > barLen) clearInterval(timer);
  }, duration / (barLen + 1));
}

function bootCounter(line) {
  const duration = parseInt(line.dataset.duration) || 1400;
  const pct = document.createElement('span');
  pct.textContent = '... 0%';
  line.appendChild(pct);

  let n = 0;
  const timer = setInterval(() => {
    n = Math.min(n + 1, 100);
    pct.textContent = '... ' + n + '%';
    if (n >= 100) {
      clearInterval(timer);
      pct.textContent = '... 100% ✓';
    }
  }, duration / 100);
}

function bootTyping(line) {
  const speedMs  = parseInt(line.dataset.speedMs) || 55;
  const fullText = line.textContent;
  line.textContent = '';

  let i = 0;
  const timer = setInterval(() => {
    line.textContent += fullText[i++];
    if (i >= fullText.length) clearInterval(timer);
  }, speedMs);
}

function bootCursor(line) {
  const loops    = parseInt(line.dataset.loops)    || 0;
  const duration = loops > 0 ? loops * 400 : parseInt(line.dataset.duration) || 700;

  const cursor = document.createElement('span');
  cursor.className = 'boot-cursor';
  cursor.textContent = '_';
  line.appendChild(cursor);

  const badge = document.createElement('span');
  badge.className = 'boot-badge';
  badge.textContent = ' [ OK ]';
  line.appendChild(badge);

  setTimeout(() => {
    cursor.remove();
    badge.classList.add('show');
  }, duration);
}

// STARS
const starsContainer = document.getElementById('stars');

for (let i = 0; i < 180; i++) {
  const star = document.createElement('div');
  star.classList.add('star');

  star.style.left = Math.random() * 100 + '%';
  star.style.top = Math.random() * 100 + '%';
  star.style.animationDuration = (Math.random() * 4 + 2) + 's';
  star.style.animationDelay = Math.random() * 5 + 's';

  const size = Math.random() * 2 + 1;
  star.style.width = size + 'px';
  star.style.height = size + 'px';

  starsContainer.appendChild(star);
}

// PARTICLE SPACE CANVAS
const canvas = document.getElementById('space');
if (canvas) {
  const ctx = canvas.getContext('2d');

  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  const particles = [];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: Math.random() * 1.5,
      speed: Math.random() * 0.2 + 0.05,
      alpha: Math.random() * 0.6
    });
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);

    const gradient = ctx.createRadialGradient(
      w / 2,
      h / 2,
      0,
      w / 2,
      h / 2,
      500
    );

    gradient.addColorStop(0, 'rgba(93,183,255,0.05)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    particles.forEach(p => {
      p.y += p.speed;

      if (p.y > h) {
        p.y = 0;
        p.x = Math.random() * w;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}
