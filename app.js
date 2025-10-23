document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id && id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const revealEls = document.querySelectorAll('[data-reveal]');
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('opacity-0', 'translate-y-2');
        entry.target.classList.add('opacity-100', 'translate-y-0');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => io.observe(el));

document.getElementById('year').textContent = new Date().getFullYear();

document.getElementById('buyBtn')?.addEventListener('click', () => {
  alert('Thanks for your interest! Checkout is coming soon.');
});

function setupCarousel(root, { autoplayMs = 0, loop = true } = {}) {
  const track = root.querySelector('[data-track]');
  const prevBtn = root.querySelector('[data-prev]');
  const nextBtn = root.querySelector('[data-next]');
  const dotsWrap = root.querySelector('[data-dots]');
  const slides = Array.from(track.children);
  const count = slides.length;

  let index = 0, timer = null;

  // Dots
  dotsWrap.innerHTML = '';
  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'h-2 w-2 rounded-full bg-black/30 aria-[current=true]:bg-black';
    b.setAttribute('aria-label', `Go to slide ${i + 1}`);
    b.addEventListener('click', () => go(i));
    dotsWrap.appendChild(b);
    return b;
  });

  function render() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.setAttribute('aria-current', i === index ? 'true' : 'false'));
  }
  function go(i) { index = i; render(); }
  function next() { index = (index + 1) % count; if (!loop && index === count - 1) nextBtn.disabled = true; render(); }
  function prev() { index = (index - 1 + count) % count; if (!loop && index === 0) prevBtn.disabled = true; render(); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Keyboard
  root.tabIndex = 0;
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
  });

  // Basic drag/swipe
  let startX = 0, dx = 0, dragging = false;
  const threshold = 40;
  track.addEventListener('pointerdown', (e) => {
    dragging = true; startX = e.clientX; dx = 0;
    track.style.transitionDuration = '0ms';
    track.setPointerCapture?.(e.pointerId);
  });
  track.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dx = e.clientX - startX;
    track.style.transform = `translateX(calc(-${index * 100}% + ${dx}px))`;
  });
  function endDrag() {
    track.style.transitionDuration = '';
    if (!dragging) return;
    if (Math.abs(dx) > threshold) dx < 0 ? next() : prev();
    else render();
    dragging = false;
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('pointerleave', () => dragging && endDrag());

  // Autoplay
  function startAutoplay() {
    if (autoplayMs > 400) {
      stopAutoplay();
      timer = setInterval(next, autoplayMs);
    }
  }
  function stopAutoplay() { if (timer) clearInterval(timer); }
  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', startAutoplay);
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', startAutoplay);

  render();
  startAutoplay();
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('carousel');
  setupCarousel(root, { autoplayMs: 2000, loop: true }); // set autoplayMs: 4000 for 4s autoplay
});
