/* SOUR by AJ Sour Diesel — site-v1
   Local interaction only: age gate, scroll reveals, slim bar. No analytics, no requests. */
(() => {
  const doc = document.documentElement;
  const params = new URLSearchParams(location.search);
  const RENDER = params.has('render');                  // render flag: skip gate, settle motion (render=1 also hides fixed chrome)
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (RENDER || reduce) doc.classList.add('no-motion');
  if (params.get('render') === '1') doc.classList.add('is-render');

  /* ---------- age gate ---------- */
  const gate = document.getElementById('age-gate');
  const enter = document.getElementById('age-enter');
  const under = document.getElementById('age-under');
  const back = document.getElementById('age-back');
  const choices = document.getElementById('gate-choices');
  const denied = document.getElementById('gate-denied');
  const KEY = 'sourbyaj-21';
  let confirmed = RENDER;
  try { if (!confirmed) confirmed = sessionStorage.getItem(KEY) === 'yes'; } catch (_) {}
  let returnFocus = null;

  const openGate = () => {
    if (!gate || typeof gate.showModal !== 'function') return;
    returnFocus = document.activeElement;
    choices.hidden = false; denied.hidden = true;
    doc.classList.add('age-open');
    if (!gate.open) gate.showModal();
    enter.focus();
  };
  const closeGate = () => {
    try { sessionStorage.setItem(KEY, 'yes'); } catch (_) {}
    if (gate.open) gate.close();
    doc.classList.remove('age-open');
    const t = returnFocus && returnFocus !== document.body ? returnFocus : document.getElementById('hero-title');
    if (t) t.focus({ preventScroll: true });
  };
  if (gate) {
    gate.addEventListener('cancel', e => e.preventDefault());
    enter.addEventListener('click', closeGate);
    under.addEventListener('click', () => { choices.hidden = true; denied.hidden = false; back.focus(); });
    back.addEventListener('click', () => { choices.hidden = false; denied.hidden = true; enter.focus(); });
    document.querySelectorAll('[data-open-age]').forEach(b => b.addEventListener('click', openGate));
    if (!confirmed) openGate();
  }

  /* ---------- reveals ---------- */
  const items = document.querySelectorAll('.reveal, .chron li');
  if (!doc.classList.contains('no-motion') && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(el => io.observe(el));
  } else {
    items.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- slim bar after the hero ---------- */
  const bar = document.querySelector('.topbar');
  const hero = document.querySelector('.hero');
  if (bar && hero) {
    let on = false;
    const check = () => {
      const should = window.scrollY > hero.offsetHeight - 120;
      if (should !== on) {
        on = should;
        bar.classList.toggle('is-visible', on);
        bar.setAttribute('aria-hidden', on ? 'false' : 'true');
        bar.querySelectorAll('a').forEach(a => on ? a.removeAttribute('tabindex') : a.setAttribute('tabindex', '-1'));
      }
    };
    check();
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
  }
})();
