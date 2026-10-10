(() => {
  const slides = [...document.querySelectorAll('.deck > section')];
  const counter = document.querySelector('.counter');
  const bar = document.querySelector('.bar i');
  let i = Math.min(Math.max(parseInt(location.hash.slice(1)) || 1, 1), slides.length) - 1;

  // Shrink font-size until the slide's content fits inside the viewport.
  function fit(s) {
    const MAX = 4.6, MIN = 1;  // vmin — start big, shrink until it fits
    let fs = MAX;
    s.style.setProperty('--fs', fs + 'vmin');
    const overflows = () => s.scrollHeight > s.clientHeight + 1 || s.scrollWidth > s.clientWidth + 1;
    while (fs > MIN && overflows()) {
      fs -= 0.1;
      s.style.setProperty('--fs', fs.toFixed(2) + 'vmin');
    }
  }

  function show(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    if (!document.body.classList.contains('overview')) fit(slides[i]);
    counter.textContent = `${i + 1}/${slides.length}`;
    bar.style.width = ((i + 1) / slides.length * 100) + '%';
    history.replaceState(null, '', '#' + (i + 1));
  }

  function toggleOverview() {
    const on = document.body.classList.toggle('overview');
    if (on) slides.forEach(s => s.style.setProperty('--fs', '1vmin'));
    else { show(i); slides[i].scrollIntoView?.(); }
  }

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown': e.preventDefault(); show(i + 1); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': e.preventDefault(); show(i - 1); break;
      case 'Home': show(0); break;
      case 'End': show(slides.length - 1); break;
      case 'f': case 'F': document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); break;
      case 'o': case 'O': case 'Escape': toggleOverview(); break;
    }
  });

  // click a slide in overview to jump to it; click the right/left edge (5vw) to navigate normally
  document.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    const s = e.target.closest('section');
    if (document.body.classList.contains('overview')) {
      if (s) { i = slides.indexOf(s); toggleOverview(); }
      return;
    }
    const edge = innerWidth * 0.05;
    if (e.clientX > innerWidth - edge) show(i + 1);
    else if (e.clientX < edge) show(i - 1);
  });

  // touch swipe
  let x0 = null;
  addEventListener('touchstart', e => x0 = e.touches[0].clientX);
  addEventListener('touchend', e => { if (x0 !== null) { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(dx < 0 ? i + 1 : i - 1); x0 = null; } });

  addEventListener('resize', () => show(i));
  addEventListener('hashchange', () => show((parseInt(location.hash.slice(1)) || 1) - 1));
  show(i);
})();
