(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header background & Sticky bottom CTA control
  const hd = document.getElementById('hd');
  const hero = document.getElementById('hero');
  const stick = document.getElementById('stick');
  const final = document.getElementById('final');

  const onScroll = () => {
    const vh = window.innerHeight;
    if (hd) {
      hd.classList.toggle('is-solid', window.scrollY > vh * 0.5);
    }
    if (hero && stick && final) {
      const pastHero = hero.getBoundingClientRect().bottom < 0;
      const f = final.getBoundingClientRect();
      const inFinal = f.top < vh && f.bottom > 0;
      stick.classList.toggle('is-show', pastHero && !inFinal);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Heading character lighting scroll effect
  const big = document.getElementById('stateBig');
  if (big && !reduce) {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...n.textContent].forEach(c => {
            const sp = document.createElement('span');
            sp.className = 'ch';
            sp.textContent = c;
            frag.appendChild(sp);
          });
          n.replaceWith(frag);
        } else {
          walk(n);
        }
      });
    };

    walk(big);
    const chars = [...big.querySelectorAll('.ch')];

    const fillChars = () => {
      const r = big.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const n = Math.round(p * chars.length);
      chars.forEach((c, i) => c.classList.toggle('on', i < n));
    };

    window.addEventListener('scroll', fillChars, { passive: true });
    fillChars();
  }

  // Scroll reveal animation (IntersectionObserver)
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('.rv').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.rv').forEach(el => el.classList.add('is-in'));
  }

  // Smooth scroll with fixed header offset
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#' || !href) return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const headerHeight = hd ? hd.offsetHeight : 62;
      const targetPos = target.getBoundingClientRect().top + window.scrollY;
      const offsetPos = Math.max(0, targetPos - headerHeight);

      window.scrollTo({
        top: offsetPos,
        behavior: reduce ? 'auto' : 'smooth'
      });
    });
  });
})();
