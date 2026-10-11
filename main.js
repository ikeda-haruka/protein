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

  // ========================================================
  // LIVE FLAVOR POLL & PERCENTAGE GRAPH
  // ========================================================
  const dateEl = document.getElementById('voteCurrentDate');
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  if (dateEl) {
    dateEl.textContent = `本日 ${year}年${month}月${day}日 ${hours}:${minutes} リアルタイム集計中`;
  }

  // Initial Seed Data calculated based on current date for realistic continuity
  // Day-of-year pseudo-hash to make cumulative votes grow smoothly
  const dayOfYear = Math.floor((now - new Date(year, 0, 0)) / 1000 / 60 / 60 / 24);
  const baseVotes = {
    caramel: 1240 + (dayOfYear * 7),
    muscat: 980 + (dayOfYear * 5),
    chocolat: 760 + (dayOfYear * 4),
    apple: 520 + (dayOfYear * 3)
  };

  const FLAVOR_NAMES = {
    caramel: { name: 'キャラメルラテ味', en: 'Caramel Latte' },
    muscat: { name: 'マスカットジャスミン味', en: 'Muscat Jasmine' },
    chocolat: { name: 'ショコラベリー味', en: 'Chocolat Berry' },
    apple: { name: 'アップルシナモン味', en: 'Apple Cinnamon' }
  };

  const STORAGE_KEY = 'berry_flavor_poll_data';
  const VOTED_KEY = 'berry_flavor_poll_has_voted';

  function getPollData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return { ...baseVotes };
  }

  function savePollData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  const barsContainer = document.getElementById('voteBars');
  const totalCountEl = document.getElementById('voteTotalCount');
  const voteForm = document.getElementById('flavorVoteForm');
  const submitBtn = document.getElementById('voteSubmitBtn');
  const thanksMsg = document.getElementById('voteThanksMsg');

  function renderGraph(data, animate = true) {
    if (!barsContainer) return;

    const total = Object.values(data).reduce((acc, v) => acc + v, 0);
    if (totalCountEl) {
      totalCountEl.textContent = `総投票数: ${total.toLocaleString()} 票`;
    }

    // Sort items by vote count descending
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const maxVotes = sorted[0][1];

    barsContainer.innerHTML = '';

    sorted.forEach(([key, votes], index) => {
      const pct = total > 0 ? ((votes / total) * 100).toFixed(1) : 0;
      const isLeader = index === 0;
      const info = FLAVOR_NAMES[key] || { name: key, en: '' };

      const itemEl = document.createElement('div');
      itemEl.className = 'vote__bar-item';

      itemEl.innerHTML = `
        <div class="vote__bar-info">
          <span class="vote__bar-title">
            ${isLeader ? '<span class="vote__bar-rank">👑 1位</span>' : ''}
            ${info.name} <small style="color:var(--ink-light);font-size:11px;font-weight:600;">(${info.en})</small>
          </span>
          <span class="vote__bar-pct">
            ${pct}% <small>(${votes.toLocaleString()}票)</small>
          </span>
        </div>
        <div class="vote__track">
          <div class="vote__fill ${isLeader ? 'vote__fill--leader' : ''}" style="width: 0%" data-pct="${pct}"></div>
        </div>
      `;

      barsContainer.appendChild(itemEl);
    });

    // Trigger width transition
    requestAnimationFrame(() => {
      setTimeout(() => {
        barsContainer.querySelectorAll('.vote__fill').forEach(fill => {
          const targetPct = fill.getAttribute('data-pct');
          fill.style.width = targetPct + '%';
        });
      }, 50);
    });
  }

  // Initial Render
  let pollData = getPollData();
  renderGraph(pollData);

  // Check if user already voted today
  const hasVoted = localStorage.getItem(VOTED_KEY);
  if (hasVoted && submitBtn) {
    submitBtn.textContent = '本日投票済み (反映済み)';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    submitBtn.style.cursor = 'default';
  }

  // Handle Vote Submission
  if (voteForm) {
    voteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (localStorage.getItem(VOTED_KEY)) {
        if (thanksMsg) {
          thanksMsg.textContent = '本日は既に投票済みです。明日のご参加もお待ちしております！';
          thanksMsg.classList.remove('is-hidden');
        }
        return;
      }

      const selected = voteForm.querySelector('input[name="flavor"]:checked');
      if (!selected) return;

      const choice = selected.value;
      pollData = getPollData();
      pollData[choice] = (pollData[choice] || 0) + 1;
      savePollData(pollData);

      localStorage.setItem(VOTED_KEY, 'true');

      // Update UI with smooth animation
      renderGraph(pollData);

      if (submitBtn) {
        submitBtn.textContent = '投票が完了しました！';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.style.cursor = 'default';
      }

      if (thanksMsg) {
        thanksMsg.classList.remove('is-hidden');
      }
    });
  }
})();
