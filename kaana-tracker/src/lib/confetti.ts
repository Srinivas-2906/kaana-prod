const COLORS = ['#6366f1', '#ec4899', '#f97316', '#22c55e', '#eab308', '#8b5cf6', '#14b8a6'];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  spin: number;
  life: number;
};

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let animating = false;

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext('2d');
  document.body.appendChild(canvas);
  window.addEventListener('resize', () => {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

function spawnBurst(x: number, y: number, count = 80): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 10;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 6,
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 20,
      life: 1,
    };
  });
}

export function fireConfetti(origin?: { x?: number; y?: number }) {
  ensureCanvas();
  if (!canvas || !ctx) return;

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight * 0.35;
  let particles = [
    ...spawnBurst(x, y, 60),
    ...spawnBurst(window.innerWidth * 0.2, y, 30),
    ...spawnBurst(window.innerWidth * 0.8, y, 30),
  ];

  if (animating) return;
  animating = true;
  canvas.style.display = 'block';

  const gravity = 0.35;
  const fade = 0.012;

  function frame() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter((p) => {
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.rotation += p.spin;
      p.life -= fade;

      if (p.life <= 0) return false;

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.globalAlpha = Math.max(p.life, 0);
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx!.restore();
      return true;
    });

    if (particles.length > 0) {
      requestAnimationFrame(frame);
    } else {
      animating = false;
      canvas!.style.display = 'none';
    }
  }

  requestAnimationFrame(frame);
}

export function fireMiniConfetti(el?: HTMLElement | null) {
  if (el) {
    const rect = el.getBoundingClientRect();
    fireConfetti({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  } else {
    fireConfetti();
  }
}
