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
      const banner = document.getElementById('portfolioBanner');
      const bannerHeight = banner ? banner.offsetHeight : 0;
      const headerHeight = hd ? hd.offsetHeight : 62;
      const totalOffset = bannerHeight + headerHeight;
      const targetPos = target.getBoundingClientRect().top + window.scrollY;
      const offsetPos = Math.max(0, targetPos - totalOffset);

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

  // ========================================================
  // FAQ-V2 CATEGORY TABS & ACCORDION CONTROL
  // ========================================================
  const faqTabs = document.querySelectorAll('.faq-v2__tab');
  const faqCards = document.querySelectorAll('.faq-card');

  if (faqTabs.length > 0 && faqCards.length > 0) {
    // 1. Tab Filtering
    faqTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const cat = tab.getAttribute('data-faq-cat');

        faqTabs.forEach(t => {
          const isActive = t === tab;
          t.classList.toggle('is-active', isActive);
          t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        faqCards.forEach(card => {
          const cardCats = (card.getAttribute('data-cat') || '').split(' ');
          const matches = cat === 'all' || cardCats.includes(cat);

          if (matches) {
            card.classList.remove('is-hidden');
          } else {
            card.classList.add('is-hidden');
            card.classList.remove('is-open');
            const trigger = card.querySelector('.faq-card__trigger');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
          }
        });
      });
    });

    // 2. Smooth Accordion Toggle
    faqCards.forEach(card => {
      const trigger = card.querySelector('.faq-card__trigger');
      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const isOpen = card.classList.contains('is-open');
        card.classList.toggle('is-open', !isOpen);
        trigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });
    });

    // Open first card by default for delightful user experience
    if (faqCards[0]) {
      faqCards[0].classList.add('is-open');
      const firstTrigger = faqCards[0].querySelector('.faq-card__trigger');
      if (firstTrigger) firstTrigger.setAttribute('aria-expanded', 'true');
    }
  }

  // ========================================================
  // HERO: MOBILE PRODUCT SWITCHER & 3D PARALLAX TILT
  // ========================================================
  const switchBtns = document.querySelectorAll('.hero-v2__switch-btn');
  const prodProtein = document.getElementById('heroProdProtein');
  const prodTea = document.getElementById('heroProdTea');
  const prodSmoothie = document.getElementById('heroProdSmoothie');

  if (switchBtns.length > 0 && prodProtein && prodTea) {
    switchBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const prod = btn.getAttribute('data-hero-product');
        switchBtns.forEach(b => b.classList.toggle('is-active', b === btn));

        if (prod === 'protein') {
          prodProtein.style.transform = 'scale(1.08) translateY(-10px)';
          prodProtein.style.zIndex = '6';
          prodProtein.style.opacity = '1';
          prodTea.style.transform = 'scale(0.86) translateY(10px)';
          prodTea.style.zIndex = '2';
          prodTea.style.opacity = '0.45';
          if (prodSmoothie) {
            prodSmoothie.style.transform = 'scale(0.86) translateY(10px)';
            prodSmoothie.style.zIndex = '2';
            prodSmoothie.style.opacity = '0.45';
          }
        } else if (prod === 'tea') {
          prodTea.style.transform = 'scale(1.12) translateY(-10px)';
          prodTea.style.zIndex = '6';
          prodTea.style.opacity = '1';
          prodProtein.style.transform = 'scale(0.86) translateY(10px)';
          prodProtein.style.zIndex = '2';
          prodProtein.style.opacity = '0.45';
          if (prodSmoothie) {
            prodSmoothie.style.transform = 'scale(0.86) translateY(10px)';
            prodSmoothie.style.zIndex = '2';
            prodSmoothie.style.opacity = '0.45';
          }
        } else if (prod === 'smoothie') {
          if (prodSmoothie) {
            prodSmoothie.style.transform = 'scale(1.14) translateY(-10px)';
            prodSmoothie.style.zIndex = '6';
            prodSmoothie.style.opacity = '1';
          }
          prodProtein.style.transform = 'scale(0.86) translateY(10px)';
          prodProtein.style.zIndex = '2';
          prodProtein.style.opacity = '0.45';
          prodTea.style.transform = 'scale(0.86) translateY(10px)';
          prodTea.style.zIndex = '2';
          prodTea.style.opacity = '0.45';
        } else {
          // All
          prodProtein.style.transform = '';
          prodProtein.style.zIndex = '';
          prodProtein.style.opacity = '1';
          prodTea.style.transform = '';
          prodTea.style.zIndex = '';
          prodTea.style.opacity = '1';
          if (prodSmoothie) {
            prodSmoothie.style.transform = '';
            prodSmoothie.style.zIndex = '';
            prodSmoothie.style.opacity = '1';
          }
        }
      });
    });
  }

  // 3D Parallax Tilt for Hero on scroll & mouse move
  const heroStage = document.getElementById('heroVisualStage');
  if (heroStage && !reduce) {
    const parallaxItems = heroStage.querySelectorAll('[data-parallax]');

    const applyParallax = (x, y) => {
      parallaxItems.forEach(item => {
        const depth = parseFloat(item.getAttribute('data-parallax') || '0.03');
        const moveX = x * depth * 35;
        const moveY = y * depth * 35;
        item.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      });
    };

    window.addEventListener('mousemove', (e) => {
      if (window.scrollY > window.innerHeight) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      applyParallax(x, y);
    }, { passive: true });

    window.addEventListener('scroll', () => {
      if (window.scrollY > window.innerHeight) return;
      const factor = window.scrollY / window.innerHeight;
      parallaxItems.forEach(item => {
        const depth = parseFloat(item.getAttribute('data-parallax') || '0.03');
        const moveY = factor * depth * 60;
        item.style.transform = `translate3d(0, ${moveY}px, 0)`;
      });
    }, { passive: true });
  }

  // ========================================================
  // 3-PILLAR SYNERGY: TABS, ACCORDION & 3D CARD TILT
  // ========================================================
  const synergyTabs = document.querySelectorAll('.synergy__tab');
  const synergyCards = document.querySelectorAll('.synergy-card');
  const synergyHub = document.getElementById('synergyHub');
  const synergyHubPct = document.getElementById('synergyHubPct');

  if (synergyCards.length > 0) {
    // 1. Selector Tab Click
    synergyTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetIdx = parseInt(tab.getAttribute('data-synergy-target') || '0', 10);

        synergyTabs.forEach(t => {
          const isActive = t === tab;
          t.classList.toggle('is-active', isActive);
          t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        synergyCards.forEach((card, idx) => {
          const isTarget = idx === targetIdx;
          card.classList.toggle('is-active', isTarget);
          if (isTarget && window.innerWidth <= 900) {
            const offset = 80;
            const top = card.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
          }
        });
      });
    });

    // 2. Card click highlight
    synergyCards.forEach((card, idx) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.synergy-card__more-btn')) return;
        synergyCards.forEach(c => c.classList.toggle('is-active', c === card));
        synergyTabs.forEach((t, tIdx) => {
          t.classList.toggle('is-active', tIdx === idx);
          t.setAttribute('aria-selected', tIdx === idx ? 'true' : 'false');
        });
      });

      // 3. Accordion toggle for "詳しく見る"
      const moreBtn = card.querySelector('.synergy-card__more-btn');
      if (moreBtn) {
        moreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isExp = card.classList.contains('is-expanded');
          card.classList.toggle('is-expanded', !isExp);
          moreBtn.setAttribute('aria-expanded', !isExp ? 'true' : 'false');
        });
      }

      // 4. 3D Card Tilt Effect on desktop
      if (!reduce && window.matchMedia('(hover: hover)').matches) {
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          const rotateX = -(y / r.height) * 8;
          const rotateY = (x / r.width) * 8;
          card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      }
    });

    // 5. Scroll synergy hub counter animation
    if (synergyHub && synergyHubPct && 'IntersectionObserver' in window && !reduce) {
      let animated = false;
      const hubObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !animated) {
            animated = true;
            let current = 0;
            const target = 100;
            const stepTime = 16;
            const stepInc = 3;

            const timer = setInterval(() => {
              current = Math.min(target, current + stepInc);
              synergyHubPct.textContent = `${current}%`;
              if (current >= target) {
                clearInterval(timer);
                synergyHub.classList.add('is-charged');
              }
            }, stepTime);
          }
        });
      }, { threshold: 0.3 });

      hubObserver.observe(synergyHub);
    }
  }

  // ========================================================
  // MOBILE HAMBURGER MENU & DRAWER NAVIGATION
  // ========================================================
  const initDrawer = () => {
    const burger = document.getElementById('burgerBtn');
    const drawer = document.getElementById('mobileDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const drawerClose = document.getElementById('drawerCloseBtn');

    if (burger && drawer) {
      const openDrawer = () => {
        burger.classList.add('is-active');
        burger.setAttribute('aria-expanded', 'true');
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('nav-open');
      };

      const closeDrawer = () => {
        burger.classList.remove('is-active');
        burger.setAttribute('aria-expanded', 'false');
        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('nav-open');
      };

      burger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = drawer.classList.contains('is-open');
        if (isOpen) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });

      if (drawerClose) {
        drawerClose.addEventListener('click', (e) => {
          e.preventDefault();
          closeDrawer();
        });
      }
      if (drawerBackdrop) {
        drawerBackdrop.addEventListener('click', (e) => {
          e.preventDefault();
          closeDrawer();
        });
      }

      // Close when clicking any link inside drawer
      drawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          closeDrawer();
        });
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
          closeDrawer();
        }
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDrawer);
  } else {
    initDrawer();
  }
})();


