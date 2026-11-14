// CulChar site behaviour: preloader, slideshow, parallax, particles, panels and contact form.
'use strict';
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  $$('.year').forEach(el => el.textContent = new Date().getFullYear());

  /* ---------- Preloader ---------- */
  const bar = $('#loaderBar');
  requestAnimationFrame(() => bar.style.width = '60%');
  const finish = () => document.body.classList.add('loaded');
  if (document.readyState === 'complete') setTimeout(finish, 300);
  else addEventListener('load', () => setTimeout(finish, 300));
  setTimeout(finish, 3500); // safety net if a font or asset hangs

  /* ---------- Background slideshow ---------- */
  const slides = $$('.slide');
  let s = 0;
  setInterval(() => {
    slides[s].classList.remove('active');
    s = (s + 1) % slides.length;
    slides[s].classList.add('active');
  }, 8000);

  /* ---------- Rotating headlines ---------- */
  const heads = $$('.headline');
  let h = 0;
  setInterval(() => {
    if (document.body.classList.contains('panel-open')) return;
    const cur = heads[h];
    cur.classList.remove('active'); cur.classList.add('leaving');
    setTimeout(() => cur.classList.remove('leaving'), 800);
    h = (h + 1) % heads.length;
    heads[h].classList.add('active');
  }, 4000);

  /* ---------- Mouse parallax ---------- */
  const layers = $$('.layer[data-depth]');
  if (!reduceMotion && matchMedia('(pointer: fine)').matches) {
    addEventListener('mousemove', e => {
      const x = (e.clientX / innerWidth - .5) * 2;
      const y = (e.clientY / innerHeight - .5) * 2;
      layers.forEach(l => {
        const d = parseFloat(l.dataset.depth) * 100;
        l.style.transform = `translate3d(${-x * d}px, ${-y * d}px, 0)`;
      });
    }, { passive: true });
  }

  /* ---------- Particle network ---------- */
  const canvas = $('#particles');
  if (!reduceMotion && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let W, H, pts = [], mouse = { x: -999, y: -999 };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, W * H / 16000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
        r: Math.random() * 1.6 + .6
      }));
    };
    resize(); addEventListener('resize', resize);
    addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    const LINK = 130;
    (function tick() {
      if (!document.body.classList.contains('panel-open')) {
        ctx.clearRect(0, 0, W, H);
        for (const p of pts) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
          const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (dm < 160) { p.x += (p.x - mouse.x) / dm * .6; p.y += (p.y - mouse.y) / dm * .6; }
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(243,238,230,.7)'; ctx.fill();
        }
        for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(212,71,58,${(1 - d / LINK) * .45})`;
            ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- Slide-up panel ---------- */
  const panel = $('#panel'), intro = $('#intro');
  let lastTrigger = null;
  function openPanel(view, trigger) {
    lastTrigger = trigger || lastTrigger;
    $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view));
    $$('.tabs button').forEach(b => b.setAttribute('aria-current', String(b.dataset.open === view)));
    // Restart entrance animations when switching views
    $$('.view.active > *').forEach(el => { el.style.animation = 'none'; el.offsetHeight; el.style.animation = ''; });
    panel.scrollTop = 0;
    panel.inert = false; intro.inert = true;
    document.body.classList.add('panel-open');
    history.replaceState(null, '', '#' + view);
    setTimeout(() => $('#panelClose').focus({ preventScroll: true }), 700);
  }
  function closePanel() {
    document.body.classList.remove('panel-open');
    panel.inert = true; intro.inert = false;
    history.replaceState(null, '', location.pathname + location.search);
    if (lastTrigger) setTimeout(() => lastTrigger.focus({ preventScroll: true }), 700);
  }
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-open]');
    if (!t) return;
    e.preventDefault();
    openPanel(t.dataset.open, t.closest('.intro') ? t : null);
  });
  $('#panelClose').addEventListener('click', closePanel);
  addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('panel-open')) closePanel(); });
  const startView = location.hash.slice(1);
  if (startView && document.getElementById('view-' + startView)) setTimeout(() => openPanel(startView), 600);

  // Package buttons → contact form with package preselected
  $$('.pkg-cta').forEach(b => b.addEventListener('click', () => {
    $('#f-package').value = b.dataset.package;
    openPanel('contact');
  }));

  /* ---------- Contact form (FormSubmit) ---------- */
  const form = $('#contactForm'), btn = $('#submitBtn'), toast = $('#toast');
  const showToast = (msg, ok) => {
    toast.textContent = msg; toast.className = 'toast show' + (ok ? ' ok' : '');
    clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove('show'), 5000);
  };
  const rules = {
    'f-name': v => v.length > 0,
    'f-email': v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    'f-message': v => v.length > 0,
    'f-phone': v => v === '' || /^[+()\d\s-]{9,20}$/.test(v)
  };
  const consent = $('#f-consent'), consentWrap = $('#consentWrap');
  consent.addEventListener('change', () => consentWrap.classList.remove('invalid'));
  Object.keys(rules).forEach(id => $('#' + id).addEventListener('input', e => e.target.closest('.field').classList.remove('invalid')));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    let first = null;
    for (const [id, test] of Object.entries(rules)) {
      const el = $('#' + id), ok = test(el.value.trim());
      el.closest('.field').classList.toggle('invalid', !ok);
      el.setAttribute('aria-invalid', String(!ok));
      if (!ok && !first) first = el;
    }
    consentWrap.classList.toggle('invalid', !consent.checked);
    if (!consent.checked && !first) first = consent;
    if (first) { first.focus(); return; }

    const label = btn.querySelector('span');
    btn.disabled = true; label.textContent = 'Sending…';
    try {
      const res = await fetch('https://formsubmit.co/ajax/muzi.mlimi@gmail.com', {
        method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form)
      });
      const data = await res.json();
      if (String(data.success) !== 'true') throw new Error(data.message || 'Failed');
      const first = $('#f-name').value.trim().split(' ')[0];
      showToast(`Thanks ${first}, your message is on its way. We'll be in touch soon.`, true);
      form.reset();
    } catch (err) {
      console.error(err);
      showToast('Something went wrong. Please email muzi.mlimi@gmail.com directly.', false);
    } finally {
      btn.disabled = false; label.textContent = 'Send';
    }
  });
})();
