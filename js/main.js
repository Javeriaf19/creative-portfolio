/* ============================================================
   JAVERIA FARHAN PORTFOLIO — MAIN JAVASCRIPT
   3D Tilt · Cursor Trail · GSAP Animations · Filters · Counters
   ============================================================ */

'use strict';

/* ============================================================
   1. FRAMER 3D OCTAGONAL CYLINDER CAROUSEL — Services Section
   ============================================================ */
(function init3DCylinderCarousel() {
  const viewport = document.getElementById('sc3dViewport');
  const cylinder = document.getElementById('sc3dCylinder');
  const prevBtn  = document.getElementById('sc3dPrev');
  const nextBtn  = document.getElementById('sc3dNext');
  const dotsBox  = document.getElementById('sc3dDots');

  if (!viewport || !cylinder) return;

  const cards = Array.from(cylinder.querySelectorAll('.sc3d-card'));
  const totalCards = cards.length;
  const anglePerCard = 360 / totalCards; // 45 degrees

  function getDepth() {
    return window.innerWidth < 768 ? 330 : 420;
  }

  let depth = getDepth();
  function positionCards() {
    cards.forEach((card, i) => {
      const angle = i * anglePerCard;
      card.style.transform = `rotateY(${angle}deg) translateZ(${depth}px)`;
    });
  }
  positionCards();

  window.addEventListener('resize', () => {
    depth = getDepth();
    positionCards();
  });

  // Dots navigation
  if (dotsBox) {
    dotsBox.innerHTML = '';
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'sc3d-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Service ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsBox.appendChild(dot);
    });
  }

  let activeIndex = 0;
  let cumulativeRotation = 0;
  let isPaused = false;
  let timer = null;

  function render() {
    cylinder.style.transform = `rotateY(${cumulativeRotation}deg)`;
    if (dotsBox) {
      const dots = Array.from(dotsBox.children);
      dots.forEach((d, idx) => d.classList.toggle('active', idx === activeIndex));
    }
  }

  function goTo(targetIndex) {
    let diff = targetIndex - activeIndex;
    if (diff > totalCards / 2) diff -= totalCards;
    if (diff < -totalCards / 2) diff += totalCards;
    cumulativeRotation -= diff * anglePerCard;
    activeIndex = (targetIndex % totalCards + totalCards) % totalCards;
    render();
  }

  function goNext() {
    cumulativeRotation -= anglePerCard;
    activeIndex = (activeIndex + 1) % totalCards;
    render();
  }

  function goPrev() {
    cumulativeRotation += anglePerCard;
    activeIndex = (activeIndex - 1 + totalCards) % totalCards;
    render();
  }

  if (nextBtn) nextBtn.addEventListener('click', goNext);
  if (prevBtn) prevBtn.addEventListener('click', goPrev);

  // Auto-play (4s interval, pauses on hover)
  function startAutoPlay() {
    stopAutoPlay();
    timer = setInterval(() => {
      if (!isPaused) goNext();
    }, 4000);
  }
  function stopAutoPlay() {
    if (timer) clearInterval(timer);
  }

  viewport.addEventListener('mouseenter', () => { isPaused = true; });
  viewport.addEventListener('mouseleave', () => { isPaused = false; });
  startAutoPlay();

  // Pointer drag gestures
  let startX = 0;
  let isDragging = false;
  let dragDiff = 0;

  viewport.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    isDragging = true;
    dragDiff = 0;
    isPaused = true;
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    dragDiff = e.clientX - startX;
  });

  window.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false;
    isPaused = false;
    if (dragDiff < -40) {
      goNext();
    } else if (dragDiff > 40) {
      goPrev();
    }
  });
})();

/* ============================================================
   2. FRAMER INTERACTIVE PROJECT FOLDERS — Branding Section
   ============================================================ */
(function initProjectFolders() {
  const folders = document.querySelectorAll('.folder-unit');
  folders.forEach(folder => {
    // Click or keyboard toggle
    folder.addEventListener('click', () => {
      folder.classList.toggle('folder-open');
    });
    folder.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        folder.classList.toggle('folder-open');
      }
    });

    // Magnet slight response
    const papers = folder.querySelectorAll('.folder-paper');
    folder.addEventListener('mousemove', (e) => {
      const rect = folder.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) * 0.05;
      const y = (e.clientY - (rect.top + rect.height / 2)) * 0.05;
      papers.forEach(p => {
        p.style.marginRight = `${-x}px`;
        p.style.marginTop = `${y}px`;
      });
    });
    folder.addEventListener('mouseleave', () => {
      papers.forEach(p => {
        p.style.marginRight = '';
        p.style.marginTop = '';
      });
    });
  });
})();

/* ============================================================
   3. FRAMER 3D SNAP CAROUSEL — Branding Showcase
   ============================================================ */
(function init3DSnapCarousel() {
  const viewport = document.getElementById('snap3dViewport');
  const track    = document.getElementById('snap3dTrack');
  const prevBtn  = document.getElementById('snap3dPrev');
  const nextBtn  = document.getElementById('snap3dNext');
  const dotsBox  = document.getElementById('snap3dDots');

  if (!viewport || !track) return;

  const cards = Array.from(track.querySelectorAll('.snap3d-card'));
  const count = cards.length;
  let activeIndex = 0;

  // Dots
  if (dotsBox) {
    dotsBox.innerHTML = '';
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'snap3d-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Showcase ${i + 1}`);
      dot.addEventListener('click', () => setIndex(i));
      dotsBox.appendChild(dot);
    });
  }

  function setIndex(index) {
    activeIndex = Math.max(0, Math.min(count - 1, index));
    render();
  }

  function render() {
    const isMobile = window.innerWidth < 768;
    const step = isMobile ? 260 : 330;

    cards.forEach((card, i) => {
      const dist = i - activeIndex;
      const absDist = Math.abs(dist);

      if (absDist > 2) {
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        card.style.transform = `translateX(${dist * step}px) scale(0.5) translateZ(-200px)`;
        return;
      }

      card.style.pointerEvents = 'auto';
      const x = dist * step;
      const scale = 1 - Math.min(absDist * 0.22, 0.4);
      const rotateY = Math.max(-18, Math.min(18, dist * -14));
      const opacity = Math.max(0.2, 1 - absDist * 0.42);
      const blur = Math.min(6, absDist * 2.5);
      const z = 10 - absDist;

      card.style.zIndex = z;
      card.style.opacity = opacity;
      card.style.filter = blur > 0.5 ? `blur(${blur}px)` : 'none';
      card.style.transform = `translateX(${x}px) scale(${scale}) rotateY(${rotateY}deg)`;
    });

    if (dotsBox) {
      const dots = Array.from(dotsBox.children);
      dots.forEach((d, idx) => d.classList.toggle('active', idx === activeIndex));
    }
  }

  // Click card to snap to it
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (i !== activeIndex) setIndex(i);
    });
  });

  if (nextBtn) nextBtn.addEventListener('click', () => setIndex(activeIndex + 1));
  if (prevBtn) prevBtn.addEventListener('click', () => setIndex(activeIndex - 1));

  // Wheel horizontal/vertical
  let wheelAccum = 0;
  viewport.addEventListener('wheel', (e) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    wheelAccum += delta;
    if (Math.abs(wheelAccum) > 45) {
      if (wheelAccum > 0 && activeIndex < count - 1) setIndex(activeIndex + 1);
      else if (wheelAccum < 0 && activeIndex > 0) setIndex(activeIndex - 1);
      wheelAccum = 0;
    }
  }, { passive: true });

  // Drag / swipe
  let startX = 0;
  let isDragging = false;
  let dragMoved = 0;

  viewport.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    isDragging = true;
    dragMoved = 0;
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    dragMoved = e.clientX - startX;
  });

  window.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false;
    if (dragMoved < -45 && activeIndex < count - 1) setIndex(activeIndex + 1);
    else if (dragMoved > 45 && activeIndex > 0) setIndex(activeIndex - 1);
  });

  window.addEventListener('resize', render);
  render();
})();

/* ============================================================
   4. NAVBAR: SCROLL GLASS + ACTIVE SECTION
   ============================================================ */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNav();
}, { passive: true });

function updateActiveNav() {
  const links = document.querySelectorAll('.nav-link');
  const sectionIds = ['home','about','experience','services','work','case-study','contact'];
  const scrollY = window.scrollY + 120;

  sectionIds.forEach(id => {
    const sec  = document.getElementById(id);
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (!sec || !link) return;
    const top = sec.offsetTop;
    const bot = top + sec.offsetHeight;
    if (scrollY >= top && scrollY < bot) {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}

/* ============================================================
   MOBILE NAVIGATION TOGGLE
   ============================================================ */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('mobile-open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Close mobile menu on link click
navLinks?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('mobile-open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================================
   3D TILT EFFECT (mouse-tracking per card)
   ============================================================ */
function initTilt() {
  const tiltEls = document.querySelectorAll('[data-tilt]');

  tiltEls.forEach(el => {
    el.addEventListener('mousemove', onTiltMove);
    el.addEventListener('mouseleave', onTiltLeave);
  });

  function onTiltMove(e) {
    const el   = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const y    = e.clientY - rect.top;
    const cx   = rect.width  / 2;
    const cy   = rect.height / 2;
    const rotX = ((y - cy) / cy) * -9;
    const rotY = ((x - cx) / cx) *  9;

    el.style.transform    = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    el.style.transition   = 'transform 0.08s linear';

    // Move the glow highlight for service cards
    const glow = el.querySelector('.svc-glow-follow');
    if (glow) {
      glow.style.left = x + 'px';
      glow.style.top  = y + 'px';
    }
  }

  function onTiltLeave(e) {
    const el = e.currentTarget;
    el.style.transform  = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1)';
  }
}

/* ============================================================
   PORTFOLIO FILTER
   ============================================================ */
function initFilter() {
  const filterBtns = document.querySelectorAll('.f-btn');
  const items      = document.querySelectorAll('.bento-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        const cat = item.getAttribute('data-cat');
        if (filter === 'all' || cat === filter) {
          item.classList.remove('flt-hidden');
        } else {
          item.classList.add('flt-hidden');
        }
      });
    });
  });
}

/* ============================================================
   SCROLL REVEAL (Intersection Observer)
   ============================================================ */
function initScrollReveal() {
  const revealTargets = document.querySelectorAll(
    '.svc-card, .testi-card, .ind-card, .proc-step, .metric, .cert-badge'
  );

  revealTargets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 90}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function animateCounter(el, target, duration = 1600) {
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const statsRow = document.getElementById('statsRow');
  if (!statsRow) return;

  let triggered = false;
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !triggered) {
      triggered = true;
      statsRow.querySelectorAll('.stat-n').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target));
      });
      observer.disconnect();
    }
  }, { threshold: 0.4 });

  observer.observe(statsRow);
}

/* ============================================================
   HERO MOUSE PARALLAX
   ============================================================ */
function initHeroParallax() {
  const heroSection = document.getElementById('home');
  if (!heroSection) return;

  const blobs    = heroSection.querySelectorAll('.blob');
  const sparkles = heroSection.querySelectorAll('.sp');
  const avatar   = document.getElementById('heroAvatar');

  document.addEventListener('mousemove', (e) => {
    if (window.scrollY > window.innerHeight) return; // only in hero viewport

    const nx = (e.clientX / window.innerWidth  - 0.5) * 2; // -1 to 1
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;

    blobs.forEach((blob, i) => {
      const factor = (i % 2 === 0) ? 22 : -16;
      blob.style.transform = `translate(${nx * factor}px, ${ny * factor}px)`;
    });

    if (avatar) {
      avatar.style.transform = `translateY(${ny * -8}px) translateX(${nx * 4}px)`;
    }

    sparkles.forEach((sp, i) => {
      const f = (i + 1) * 4;
      sp.style.transform = `translateY(${ny * -f}px)`;
    });
  }, { passive: true });
}

/* ============================================================
   GSAP HERO ENTRANCE ANIMATION
   ============================================================ */
function initGSAP() {
  if (typeof gsap === 'undefined') {
    console.warn('[Portfolio] GSAP not loaded — skipping entrance animation');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance timeline
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.2 });

  tl.from('#availBadge',   { y: 24, opacity: 0, duration: 0.6 })
    .from('.ht-l1',        { y: 70, opacity: 0, duration: 0.85 }, '-=0.25')
    .from('.ht-l2',        { y: 70, opacity: 0, duration: 0.85 }, '-=0.55')
    .from('.ht-l3',        { y: 70, opacity: 0, duration: 0.85 }, '-=0.55')
    .from('.hero-sub',     { y: 24, opacity: 0, duration: 0.6  }, '-=0.35')
    .from('.h-pill',       { y: 18, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.3')
    .from('#heroCta1, #heroCta2', { y: 18, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.25')
    .from('#heroAvatar',   { x: 70, opacity: 0, duration: 1.1 }, '-=1.2')
    .from('.micro-badge',  { scale: 0, opacity: 0, duration: 0.5,
                             stagger: 0.18, ease: 'back.out(1.7)' }, '-=0.7')
    .from('.scroll-hint',  { opacity: 0, duration: 0.4 }, '-=0.2');

  // Avatar parallax on scroll
  gsap.to('#heroAvatar', {
    y: -60,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 2,
    }
  });

  // Section title reveals on scroll
  gsap.utils.toArray('.sec-title').forEach(el => {
    gsap.from(el, {
      y: 40, opacity: 0, duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%' }
    });
  });

  // About ID card 3D entrance
  gsap.from('#idCardWrapper', {
    rotateY: -35, x: -60, opacity: 0, duration: 1.2, ease: 'power3.out',
    scrollTrigger: { trigger: '#about', start: 'top 75%' }
  });

  // Process steps stagger
  if (document.querySelector('.proc-step')) {
    gsap.fromTo('.proc-step',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '#process', start: 'top 85%' }
      }
    );
  }

  // Contact section title
  gsap.from('.contact-title', {
    y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#contact', start: 'top 80%' }
  });

  // Bento items stagger reveal
  gsap.from('.bento-item', {
    y: 50, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
    scrollTrigger: { trigger: '#work', start: 'top 75%' }
  });

  // Case study entrance
  gsap.from('.case-content', {
    x: -50, opacity: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '#case-study', start: 'top 75%' }
  });
  gsap.from('.case-visual', {
    x: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '#case-study', start: 'top 75%' }
  });
}

/* ============================================================
   RETRO PHONE — hide emoji if image loads
   ============================================================ */
function initPhone() {
  const phone    = document.getElementById('retroPhone');
  const phoneEmo = document.getElementById('phoneEmoji');
  if (!phone || !phoneEmo) return;

  phone.addEventListener('load', () => {
    phoneEmo.style.display = 'none';
  });

  // If already loaded (cached)
  if (phone.complete && phone.naturalWidth > 0) {
    phoneEmo.style.display = 'none';
  }
}

/* ============================================================
   3D FLOATING CARDS hover depth effect
   (extra depth layering for service cards)
   ============================================================ */
function initCardDepth() {
  document.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = ((e.clientX - rect.left) / rect.width  - 0.5) * 40;
      const y    = ((e.clientY - rect.top)  / rect.height - 0.5) * 20;
      card.style.setProperty('--tx', x + 'px');
      card.style.setProperty('--ty', y + 'px');
    });
  });
}

/* ============================================================
   TICKER PAUSE ON HOVER
   ============================================================ */
function initTicker() {
  const track = document.querySelector('.ticker-track');
  if (!track) return;
  track.parentElement.addEventListener('mouseenter', () =>
    track.style.animationPlayState = 'paused'
  );
  track.parentElement.addEventListener('mouseleave', () =>
    track.style.animationPlayState = 'running'
  );
}

/* ============================================================
   INDUSTRY CARDS — 3D hover
   ============================================================ */
function initIndustryHover() {
  document.querySelectorAll('.ind-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-7px) rotateX(5deg) scale(1.03)';
      card.style.transition = 'transform 0.35s cubic-bezier(0.23,1,0.32,1)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.3s';
    });
  });
}

/* ============================================================
   PALETTE CHIPS TOOLTIP
   ============================================================ */
function initPaletteChips() {
  document.querySelectorAll('.p-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const hex = chip.getAttribute('title');
      if (hex && navigator.clipboard) {
        navigator.clipboard.writeText(hex).then(() => {
          chip.setAttribute('data-copied', '✓');
          setTimeout(() => chip.removeAttribute('data-copied'), 1200);
        });
      }
    });
  });
}

/* ============================================================
   CAROUSEL 360 (3D RING SHOWCASE)
   ============================================================ */
function initCarousel360() {
  const container = document.getElementById('c360Container');
  if (!container) return;

  const c360Data = [
    {
      title: "NoteySTUFF Stationery Brand",
      category: "BRANDING & PACKAGING",
      desc: "0-to-1 brand identity, custom notebooks & packaging.",
      img: "assets/portfolio_works/notey-cover.webp",
      link: "https://www.behance.net/gallery/248952345/Notey-Stuff-Stationery-Brand-Case-Study?platform=direct"
    },
    {
      title: "MyKitab.pk 12 Notebook Covers",
      category: "PRODUCT & COVER DESIGN",
      desc: "12 custom notebook collections & print layouts.",
      img: "assets/portfolio_works/mykitab-cover-1.png",
      link: "https://www.behance.net/gallery/254298367/MyKitabpk-Notebook-Collections-Designs"
    },
    {
      title: "Takhleeq Karian Social System",
      category: "SOCIAL MEDIA SYSTEM",
      desc: "Visual guidelines & high-engagement content system.",
      img: "assets/portfolio_works/takhleeq-1.png",
      link: "https://www.behance.net/gallery/254336339/Takhleeq-Karian-Social-Media-Content-System"
    },
    {
      title: "Fatima Jee's Fashion AI Promos",
      category: "AI-ASSISTED VIDEO & FASHION",
      desc: "Runway ML & Veo 3 AI fashion promo campaigns.",
      img: "assets/portfolio_works/fatima-jees.png",
      link: "https://www.behance.net/gallery/241524767/Fatima-Jees-Clothing-Brand"
    },
    {
      title: "Future Of Tech — Elite IT Team",
      category: "TECH CAROUSEL DESIGN",
      desc: "Tech educational carousel for high saves & shares.",
      img: "assets/portfolio_works/elite-tech-1.png",
      link: "https://www.behance.net/gallery/220218641/Future-Of-Tech-Carasouel-Post-Design-For-Elite-IT-Team"
    },
    {
      title: "NeuroStats Network Design System",
      category: "DATA INFOGRAPHICS",
      desc: "Dark-mode AI infographics & neural data design.",
      img: "assets/portfolio_works/neurostats-1.png",
      link: "https://www.behance.net/gallery/217808789/Carasouel-Post-Designs-For-NeuroStats-Network"
    }
  ];

  const numItems = c360Data.length;
  const angleStep = 360 / numItems;
  let currentRotation = 0;
  const ringTiltDeg = 38;
  let isPaused = false;
  let timer = null;

  const thumbs = document.querySelectorAll('.c360-thumb-wrapper');
  const prevBtn = document.getElementById('c360Prev');
  const nextBtn = document.getElementById('c360Next');
  const stage = document.getElementById('c360Stage');

  function updateRing(smooth = true) {
    const width = container.offsetWidth;
    const radius = Math.max(130, Math.min(320, width * 0.44));
    if (stage) stage.style.perspective = `${radius * 2.4}px`;

    thumbs.forEach((thumb, idx) => {
      const targetAngle = currentRotation + angleStep * idx;
      thumb.style.transition = smooth ? 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
      thumb.style.transform = `rotateY(${targetAngle}deg) translateZ(${radius}px) rotateX(${ringTiltDeg}deg) rotateY(${-targetAngle}deg)`;
    });

    const steps = Math.round(currentRotation / angleStep);
    const centerIdx = ((-steps % numItems) + numItems) % numItems;

    thumbs.forEach((t, i) => {
      t.classList.toggle('active-thumb', i === centerIdx);
    });

    const item = c360Data[centerIdx];
    const centerImg = document.getElementById('c360CenterImg');
    const centerBadge = document.getElementById('c360CenterBadge');
    const centerTitle = document.getElementById('c360CenterTitle');
    const centerDesc = document.getElementById('c360CenterDesc');
    const centerBtn = document.getElementById('c360CenterBtn');
    const counter = document.getElementById('c360CurrentIdx');

    if (centerImg && centerImg.getAttribute('src') !== item.img) {
      centerImg.style.opacity = '0.35';
      setTimeout(() => {
        centerImg.src = item.img;
        centerImg.style.opacity = '1';
      }, 150);
    }
    if (centerBadge) centerBadge.textContent = item.category;
    if (centerTitle) centerTitle.textContent = item.title;
    if (centerDesc) centerDesc.textContent = item.desc;
    if (centerBtn) centerBtn.href = item.link;
    if (counter) counter.textContent = String(centerIdx + 1).padStart(2, '0');
  }

  function rotateLeft() {
    currentRotation += angleStep;
    updateRing();
  }

  function rotateRight() {
    currentRotation -= angleStep;
    updateRing();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { rotateLeft(); resetAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { rotateRight(); resetAutoplay(); });

  thumbs.forEach((thumb, i) => {
    thumb.style.cursor = 'pointer';
    thumb.addEventListener('click', () => {
      const steps = Math.round(currentRotation / angleStep);
      const currentIdx = ((-steps % numItems) + numItems) % numItems;
      let diff = i - currentIdx;
      if (diff === 0) {
        const currentItem = c360Data[i];
        if (currentItem && currentItem.link) {
          window.open(currentItem.link, '_blank', 'noopener');
        }
        return;
      }
      if (diff > numItems / 2) diff -= numItems;
      if (diff < -numItems / 2) diff += numItems;
      currentRotation -= diff * angleStep;
      updateRing();
      resetAutoplay();
    });
  });

  const centerCard = document.getElementById('c360CenterCard');
  if (centerCard) {
    centerCard.style.cursor = 'pointer';
    centerCard.addEventListener('click', (e) => {
      if (!e.target.closest('#c360CenterBtn')) {
        const steps = Math.round(currentRotation / angleStep);
        const centerIdx = ((-steps % numItems) + numItems) % numItems;
        const item = c360Data[centerIdx];
        if (item && item.link) {
          window.open(item.link, '_blank', 'noopener');
        }
      }
    });
  }

  // Autoplay
  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(() => {
      if (!isPaused) rotateRight();
    }, 2400);
  }
  function stopAutoplay() {
    if (timer) clearInterval(timer);
  }
  function resetAutoplay() {
    startAutoplay();
  }

  container.addEventListener('mouseenter', () => { isPaused = true; });
  container.addEventListener('mouseleave', () => { isPaused = false; });
  window.addEventListener('resize', () => updateRing(false));

  // Mobile Touch Swipe support
  let c360TouchStartX = 0;
  let c360TouchEndX = 0;
  container.addEventListener('touchstart', (e) => {
    c360TouchStartX = e.changedTouches[0].screenX;
    isPaused = true;
  }, { passive: true });
  container.addEventListener('touchend', (e) => {
    c360TouchEndX = e.changedTouches[0].screenX;
    const diffX = c360TouchEndX - c360TouchStartX;
    if (Math.abs(diffX) > 35) {
      if (diffX > 0) rotateLeft();
      else rotateRight();
    }
    isPaused = false;
    resetAutoplay();
  }, { passive: true });

  updateRing();
  startAutoplay();
}

/* ============================================================
   INTERACTIVE NOTEBOOK LOOKBOOK (FLIPBOOK)
   ============================================================ */
function initNotebookFlipBook() {
  const book = document.getElementById('book3D');
  if (!book) return;

  const bookSpreads = [
    {
      leftBadge: "MYKITAB.PK · 2026",
      leftPageNum: "Page 01",
      leftTitle: "Kawaii Aesthetic Collection",
      leftDesc: "6 Cute, pastel-toned cover designs created for young students and aesthetic planners in Pakistan.",
      leftCovers: [
        { img: "assets/portfolio_works/mykitab-cover-1.png", name: "Floral Aesthetic" },
        { img: "assets/portfolio_works/mykitab-cover-2.png", name: "Pastel Dreams" }
      ],
      rightBadge: "HAND-DRAWN SERIES",
      rightPageNum: "Page 02",
      rightTitle: "Botanical & Abstract Line Art",
      rightDesc: "Developed print-ready vectors, spine measurements, bleed margins, and barcode layouts for retail shelves.",
      rightImg: "assets/portfolio_works/mykitab-cover-3.png",
      rightTag: "12 Hand-drawn & Pastel Covers",
      behanceLink: "https://www.behance.net/gallery/254298367/MyKitabpk-Notebook-Collections-Designs"
    },
    {
      leftBadge: "NOTEYSTUFF · 0-TO-1",
      leftPageNum: "Page 03",
      leftTitle: "Noteystuff Stationery Identity",
      leftDesc: "Complete brand development from zero: color systems, character stickers, washi tapes, and branded boxes.",
      leftCovers: [
        { img: "assets/portfolio_works/notey-cover.webp", name: "Notebook Line" },
        { img: "assets/portfolio_works/notey-spread.webp", name: "Product Suite" }
      ],
      rightBadge: "PACKAGING SPECS",
      rightPageNum: "Page 04",
      rightTitle: "Die-Lines & Retail Packaging",
      rightDesc: "Custom die-lines, foil stamping coordinates, and protective shrink-wrap sleeve artworks for high volume manufacturing.",
      rightImg: "assets/portfolio_works/notey-mockup1.webp",
      rightTag: "Die-Cut Stationery Suite",
      behanceLink: "https://www.behance.net/gallery/248952345/Notey-Stuff-Stationery-Brand-Case-Study?platform=direct"
    },
    {
      leftBadge: "PORTFOLIO ARCHIVE",
      leftPageNum: "Page 05",
      leftTitle: "12 Custom Covers Produced",
      leftDesc: "Designed exclusively for e-commerce launch, generating +75% organic customer reach & distributor inquiries.",
      leftCovers: [
        { img: "assets/portfolio_works/mykitab-cover-4.png", name: "Botanical Bloom" },
        { img: "assets/portfolio_works/mykitab-cover-5.png", name: "Abstract Line Art" }
      ],
      rightBadge: "BEHANCE VERIFIED",
      rightPageNum: "Page 06",
      rightTitle: "Explore Full Digital Spread",
      rightDesc: "Explore high-resolution case study slides, print mockups, and customer feedback on Behance.",
      rightImg: "assets/portfolio_works/mykitab-cover-6.png",
      rightTag: "Complete Behance Case Study",
      behanceLink: "https://www.behance.net/gallery/254298367/MyKitabpk-Notebook-Collections-Designs"
    }
  ];

  let currentSpread = 0;
  const prevBtn = document.getElementById('bookPrevBtn');
  const nextBtn = document.getElementById('bookNextBtn');
  const dots = document.querySelectorAll('.bpi-dot');
  const rightPage = document.getElementById('bookPageRight');

  function renderSpread(idx) {
    const s = bookSpreads[idx];
    if (!s) return;

    if (rightPage) {
      rightPage.style.transform = 'rotateY(-25deg)';
      rightPage.style.opacity = '0.7';
    }

    setTimeout(() => {
      const leftBadge = document.querySelector('#bookPageLeft .book-meta-badge');
      const leftNum = document.getElementById('bookLeftPageNum');
      const leftTitle = document.querySelector('#bookPageLeft .book-spread-title');
      const leftDesc = document.querySelector('#bookPageLeft .book-spread-desc');
      const leftImgs = document.querySelectorAll('#bookPageLeft .bc-img');
      const leftNames = document.querySelectorAll('#bookPageLeft .book-cover-mini span');

      if (leftBadge) leftBadge.textContent = s.leftBadge;
      if (leftNum) leftNum.textContent = s.leftPageNum;
      if (leftTitle) leftTitle.textContent = s.leftTitle;
      if (leftDesc) leftDesc.textContent = s.leftDesc;
      if (leftImgs[0] && s.leftCovers[0]) leftImgs[0].src = s.leftCovers[0].img;
      if (leftNames[0] && s.leftCovers[0]) leftNames[0].textContent = s.leftCovers[0].name;
      if (leftImgs[1] && s.leftCovers[1]) leftImgs[1].src = s.leftCovers[1].img;
      if (leftNames[1] && s.leftCovers[1]) leftNames[1].textContent = s.leftCovers[1].name;

      const rightBadge = document.querySelector('#bookPageRight .book-meta-badge');
      const rightNum = document.getElementById('bookRightPageNum');
      const rightTitle = document.getElementById('bookRightTitle');
      const rightDesc = document.getElementById('bookRightDesc');
      const rightImg = document.getElementById('bookRightImg');
      const rightTag = document.querySelector('#bookPageRight .book-art-tag');
      const ctaBtn = document.querySelector('.btn-book-behance');

      if (rightBadge) rightBadge.textContent = s.rightBadge;
      if (rightNum) rightNum.textContent = s.rightPageNum;
      if (rightTitle) rightTitle.textContent = s.rightTitle;
      if (rightDesc) rightDesc.textContent = s.rightDesc;
      if (rightImg) rightImg.src = s.rightImg;
      if (rightTag) rightTag.textContent = s.rightTag;
      if (ctaBtn) ctaBtn.href = s.behanceLink;

      dots.forEach((d, i) => d.classList.toggle('active', i === idx));

      if (rightPage) {
        rightPage.style.transform = 'rotateY(0deg)';
        rightPage.style.opacity = '1';
      }
    }, 180);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentSpread = (currentSpread - 1 + bookSpreads.length) % bookSpreads.length;
      renderSpread(currentSpread);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentSpread = (currentSpread + 1) % bookSpreads.length;
      renderSpread(currentSpread);
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      currentSpread = idx;
      renderSpread(currentSpread);
    });
  });

  if (rightPage) {
    rightPage.addEventListener('click', (e) => {
      if (!e.target.closest('a')) {
        currentSpread = (currentSpread + 1) % bookSpreads.length;
        renderSpread(currentSpread);
      }
    });
  }

  // Mobile Touch Swipe for Lookbook Flipbook
  let bookTouchStartX = 0;
  let bookTouchEndX = 0;
  book.addEventListener('touchstart', (e) => {
    bookTouchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  book.addEventListener('touchend', (e) => {
    bookTouchEndX = e.changedTouches[0].screenX;
    const diffX = bookTouchEndX - bookTouchStartX;
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) {
        currentSpread = (currentSpread + 1) % bookSpreads.length;
        renderSpread(currentSpread);
      } else {
        currentSpread = (currentSpread - 1 + bookSpreads.length) % bookSpreads.length;
        renderSpread(currentSpread);
      }
    }
  }, { passive: true });
}

/* ============================================================
   MOTION TILES GALLERY FILTERING
   ============================================================ */
function initMotionTilesGallery() {
  const filterBtns = document.querySelectorAll('.g-filter-btn');
  const cards = document.querySelectorAll('.mt-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const cat = card.getAttribute('data-cat');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'none'; }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    });
  });
}

/* ============================================================
   ACETERNITY UI SCROLL-DRIVEN TIMELINE ANIMATION
   ============================================================ */
function initAceternityTimeline() {
  const container = document.getElementById('actTimelineContainer');
  const beam = document.getElementById('actTimelineBeam');
  const items = document.querySelectorAll('.act-timeline-item');
  if (!container || !beam) return;

  function handleScroll() {
    const rect = container.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Start progress when container top enters 65% of viewport
    // Fully expand when bottom reaches 45% of viewport
    const startY = windowH * 0.65;
    const endY = windowH * 0.45;
    const totalDist = rect.height;
    const currentScrolled = startY - rect.top;

    let progress = currentScrolled / (totalDist + (startY - endY));
    progress = Math.max(0, Math.min(1, progress));

    beam.style.height = (progress * 100).toFixed(2) + '%';
    beam.style.opacity = progress > 0.015 ? '1' : '0';

    // Highlight nodes as beam passes each one
    items.forEach(item => {
      const itemRect = item.getBoundingClientRect();
      if (itemRect.top <= windowH * 0.52) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll);
  handleScroll();
}

/* ============================================================
   UNIVERSAL PORTFOLIO LIGHTBOX MODAL
   ============================================================ */
function initPortfolioLightbox() {
  const modal = document.getElementById('portfolioLightbox');
  const backdrop = document.getElementById('plBackdrop');
  const closeBtn = document.getElementById('plClose');
  const modalImg = document.getElementById('plImg');
  const modalTitle = document.getElementById('plTitle');
  const actionBtn = document.getElementById('plActionBtn');

  if (!modal || !modalImg) return;

  function openLightbox(src, title, actionUrl, isPdf = false) {
    modalImg.src = src;
    modalImg.alt = title || 'Project Preview';
    if (modalTitle) modalTitle.textContent = title || 'Project Preview';
    
    if (actionBtn) {
      if (actionUrl) {
        actionBtn.style.display = 'inline-flex';
        actionBtn.href = actionUrl;
        actionBtn.querySelector('span').textContent = isPdf ? 'Open PDF Document ↗' : 'View Full Case Study ↗';
      } else {
        actionBtn.style.display = 'none';
      }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Delegate click on all elements with data-lightbox
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-lightbox]');
    if (!trigger) return;

    // If clicking directly on a link that has a full URL, and isn't the trigger itself, let default happen
    if (e.target.closest('a') && e.target.closest('a') !== trigger && e.target.closest('a').getAttribute('href')?.startsWith('http')) {
      return;
    }

    e.preventDefault();
    const src = trigger.getAttribute('data-lightbox');
    const title = trigger.getAttribute('data-title') || trigger.querySelector('img')?.alt || 'Project Preview';
    const behance = trigger.getAttribute('data-behance');
    const pdf = trigger.getAttribute('data-pdf');
    const link = trigger.getAttribute('href');

    const actionUrl = behance || pdf || (link && link.startsWith('http') ? link : null);
    const isPdf = !!pdf || (actionUrl && actionUrl.endsWith('.pdf'));

    openLightbox(src, title, actionUrl, isPdf);
  });
}

/* ============================================================
   HOLO PROFILE CARD 3D TILT & DIRECT MESSAGE FORM
   ============================================================ */
function initHoloCard() {
  const card = document.getElementById('holoProfileCard');
  if (!card) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 10;
    const rotY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-6px)`;
    
    // Move holographic glow inside
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    card.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(209, 0, 104, 0.18) 0%, rgba(138, 43, 226, 0.12) 35%, rgba(255, 255, 255, 0.04) 70%)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    card.style.background = 'rgba(255, 255, 255, 0.04)';
  });
}

function initContactMsgForm() {
  const form = document.getElementById('contactMsgForm');
  const status = document.getElementById('msgFormStatus');
  const btn = document.getElementById('msgSubmitBtn');
  if (!form || !status || !btn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const origBtnText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span>Sending...</span>';
    status.style.color = 'rgba(255, 255, 255, 0.8)';
    status.textContent = 'Sending your message...';

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        status.style.color = '#7cc000';
        status.textContent = '✓ Message received! I will reply to your email shortly.';
        form.reset();
      } else {
        const data = await response.json();
        if (data && data.errors) {
          status.style.color = '#ff4d79';
          status.textContent = data.errors.map(err => err.message).join(', ');
        } else {
          status.style.color = '#ff4d79';
          status.textContent = 'Oops! There was a problem submitting your form.';
        }
      }
    } catch (err) {
      status.style.color = '#ff4d79';
      status.textContent = 'Oops! Network error. Please email me directly or WhatsApp.';
    } finally {
      btn.disabled = false;
      btn.innerHTML = origBtnText;
    }
  });
}

/* ============================================================
   10. CATEGORY FOLDERS BEHANCE DIRECT LINKS
   ============================================================ */
function initFolderBehanceLinks() {
  const folders = document.querySelectorAll('.folder-unit');
  folders.forEach(f => {
    f.addEventListener('click', (e) => {
      if (e.target.closest('.jf-card-edit-overlay') || e.target.closest('.jf-btn-card-edit')) return;
      const behanceUrl = f.getAttribute('data-behance') || f.getAttribute('data-pdf');
      if (behanceUrl) {
        window.open(behanceUrl, '_blank', 'noopener');
      }
    });
  });
}

/* ============================================================
   11. VELOCITY GALLERY (FRAMER SCROLL VELOCITY IMAGES)
   ============================================================ */
function initVelocityGallery() {
  const trackA = document.getElementById('velocityTrackA');
  const trackB = document.getElementById('velocityTrackB');
  if (!trackA || !trackB) return;

  let posA = 0;
  let posB = 0;
  const baseSpeed = 0.85;
  let velocitySpeed = 0;
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const diff = currentScrollY - lastScrollY;
    velocitySpeed = Math.min(10, Math.abs(diff) * 0.28);
    lastScrollY = currentScrollY;
  }, { passive: true });

  function animate() {
    velocitySpeed *= 0.94;
    const currentSpeed = baseSpeed + velocitySpeed;

    posA -= currentSpeed;
    posB += currentSpeed;

    const halfWidthA = trackA.scrollWidth / 2;
    if (Math.abs(posA) >= halfWidthA) posA = 0;
    trackA.style.transform = `translateX(${posA}px)`;

    const halfWidthB = trackB.scrollWidth / 2;
    if (posB >= 0) posB = -halfWidthB;
    trackB.style.transform = `translateX(${posB}px)`;

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

/* ============================================================
   12. iOS PHONE REEL PLAYER (FRAMER iOS PLAYER)
   ============================================================ */
function initIosVideoPlayer() {
  const video = document.getElementById('iosReelVideo');
  const playBtn = document.getElementById('iosPlayBtn');
  const muteBtn = document.getElementById('iosMuteBtn');
  const progressFill = document.getElementById('iosProgressFill');
  const progressBar = document.getElementById('iosProgressBar');
  if (!video || !playBtn) return;

  function togglePlay() {
    if (video.paused) {
      video.play().then(() => {
        playBtn.style.opacity = '0';
        playBtn.textContent = '⏸';
      }).catch(() => {});
    } else {
      video.pause();
      playBtn.style.opacity = '1';
      playBtn.textContent = '▶';
    }
  }

  playBtn.addEventListener('click', togglePlay);
  video.addEventListener('click', togglePlay);

  if (muteBtn) {
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      muteBtn.textContent = video.muted ? '🔇' : '🔊';
    });
  }

  video.addEventListener('timeupdate', () => {
    if (video.duration) {
      const pct = (video.currentTime / video.duration) * 100;
      if (progressFill) progressFill.style.width = `${pct}%`;
    }
  });

  if (progressBar) {
    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = clickX / rect.width;
      video.currentTime = pct * video.duration;
    });
  }
}

/* ============================================================
   13. VIDEO CAROUSEL LIGHTBOX MODAL
   ============================================================ */
function initVideoCarouselModal() {
  const videoCards = document.querySelectorAll('.video-card-3d');
  const modal = document.getElementById('jfVideoLightbox');
  const player = document.getElementById('plVideoPlayer');
  const titleEl = document.getElementById('plVideoTitle');
  const closeBtn = document.getElementById('plVideoClose');
  const backdrop = document.getElementById('plVideoBackdrop');
  if (!modal || !player) return;

  videoCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.jf-card-edit-overlay') || e.target.closest('.jf-btn-card-edit')) return;
      const videoSrc = card.getAttribute('data-video');
      const title = card.getAttribute('data-title') || 'Video Showcase';
      if (videoSrc) {
        player.src = videoSrc;
        if (titleEl) titleEl.textContent = title;
        modal.classList.add('active');
        player.play().catch(() => {});
      }
    });
  });

  function closeVideoModal() {
    modal.classList.remove('active');
    player.pause();
    player.src = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeVideoModal);
  if (backdrop) backdrop.addEventListener('click', closeVideoModal);
}

/* ============================================================
   14. FRAMER 3D GALLERY STACK INTERACTION
   ============================================================ */
function initGalleryStack() {
  const deck = document.getElementById('galleryStackDeck');
  const prevBtn = document.getElementById('btnStackPrev');
  const nextBtn = document.getElementById('btnStackNext');
  const counter = document.getElementById('stackCounter');
  if (!deck) return;

  const cards = Array.from(deck.querySelectorAll('.gallery-stack-card'));
  const total = cards.length;
  let activeIndex = 0;

  function updateStack() {
    cards.forEach((card, idx) => {
      const pos = (idx - activeIndex + total) % total;
      card.className = `gallery-stack-card stack-pos-${pos}`;
    });
    if (counter) counter.textContent = `${activeIndex + 1} / ${total}`;
  }

  function nextCard() {
    activeIndex = (activeIndex + 1) % total;
    updateStack();
  }

  function prevCard() {
    activeIndex = (activeIndex - 1 + total) % total;
    updateStack();
  }

  if (nextBtn) nextBtn.addEventListener('click', nextCard);
  if (prevBtn) prevBtn.addEventListener('click', prevCard);

  cards.forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.jf-card-edit-overlay') || e.target.closest('.jf-btn-card-edit')) return;
      if (idx === activeIndex) {
        nextCard();
      } else {
        activeIndex = idx;
        updateStack();
      }
    });
  });

  updateStack();
}

/* ============================================================
   15. JAVERIA'S LIVE PORTFOLIO STUDIO CMS (ADMIN EDIT MODE)
   ============================================================ */
let activeEditCard = null;
let activeAddTargetContainer = null;
let activeAddMediaType = 'image';

function initPortfolioStudio() {
  const fab = document.getElementById('jfStudioFab');
  const pinModal = document.getElementById('jfPinModal');
  const pinInput = document.getElementById('jfPinInput');
  const pinSubmit = document.getElementById('btnPinSubmit');
  const pinCancel = document.getElementById('btnPinCancel');
  const pinError = document.getElementById('jfPinError');
  const btnSaveLive = document.getElementById('btnStudioSaveLive');
  const btnAddGallery = document.getElementById('btnStudioAddGallery');
  const btnExport = document.getElementById('btnStudioExport');
  const btnReset = document.getElementById('btnStudioReset');
  const btnLock = document.getElementById('btnStudioLock');

  // Card Editor Modal Elements
  const cardModal = document.getElementById('jfCardEditorModal');
  const cardForm = document.getElementById('jfCardEditorForm');
  const cardHeading = document.getElementById('ceModalHeading');
  const cardClose = document.getElementById('btnCardEditorClose');
  const cardCancel = document.getElementById('btnCardEditorCancel');
  const cardDelete = document.getElementById('btnCardEditorDelete');

  const ceMediaType = document.getElementById('ceMediaType');
  const ceImageFields = document.getElementById('ceImageFieldsGroup');
  const ceVideoFields = document.getElementById('ceVideoFieldsGroup');

  const ceTitle = document.getElementById('ceTitle');
  const ceDesc = document.getElementById('ceDesc');
  const ceImageUrl = document.getElementById('ceImageUrl');
  const ceImageFile = document.getElementById('ceImageFile');
  const ceVideoUrl = document.getElementById('ceVideoUrl');
  const ceVideoFile = document.getElementById('ceVideoFile');
  const ceVideoPoster = document.getElementById('ceVideoPoster');
  const ceBehanceLink = document.getElementById('ceBehanceLink');
  const ceSpanSelect = document.getElementById('ceSpanSelect');
  const ceFocalSelect = document.getElementById('ceFocalSelect');

  // New Gallery Modal Elements
  const newGalModal = document.getElementById('jfNewGalleryModal');
  const newGalForm = document.getElementById('jfNewGalleryForm');
  const newGalClose = document.getElementById('btnNewGalleryClose');
  const newGalCancel = document.getElementById('btnNewGalleryCancel');
  const ngTitle = document.getElementById('ngTitle');
  const ngSub = document.getElementById('ngSub');
  const ngCategory = document.getElementById('ngCategorySelect');
  const ngBehance = document.getElementById('ngBehance');

  // Secure cryptographic hash comparison (never expose plain-text PIN in repository)
  const PIN_HASH = '483029d526219f816e8e8f6a9de07b422633dba180ffc26faac22862a017519f';

  async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Toggle image vs video fields in card editor
  if (ceMediaType) {
    ceMediaType.addEventListener('change', () => {
      const isVideo = ceMediaType.value === 'video';
      if (ceImageFields) ceImageFields.style.display = isVideo ? 'none' : 'block';
      if (ceVideoFields) ceVideoFields.style.display = isVideo ? 'block' : 'none';
    });
  }

  restoreSavedEdits();

  const isAuth = sessionStorage.getItem('jf_studio_auth') === 'true';
  const urlParams = new URLSearchParams(window.location.search);
  const wantsEdit = urlParams.get('edit') === 'true';

  if (isAuth) {
    enableStudioMode();
  } else if (wantsEdit) {
    showPinModal();
  }

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
      e.preventDefault();
      if (document.body.classList.contains('jf-edit-active')) {
        disableStudioMode();
      } else {
        showPinModal();
      }
    }
  });

  function showPinModal() {
    if (!pinModal) return;
    pinModal.style.display = 'flex';
    if (pinError) pinError.style.display = 'none';
    if (pinInput) {
      pinInput.value = '';
      setTimeout(() => pinInput.focus(), 100);
    }
  }

  function hidePinModal() {
    if (pinModal) pinModal.style.display = 'none';
  }

  async function checkPin() {
    if (!pinInput) return;
    const inputVal = pinInput.value.trim();
    const hashed = await hashString(inputVal);
    if (hashed === PIN_HASH) {
      sessionStorage.setItem('jf_studio_auth', 'true');
      hidePinModal();
      enableStudioMode();
    } else {
      if (pinError) pinError.style.display = 'block';
      pinInput.value = '';
      pinInput.focus();
    }
  }

  if (pinSubmit) pinSubmit.addEventListener('click', checkPin);
  if (pinCancel) pinCancel.addEventListener('click', hidePinModal);
  if (pinInput) {
    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkPin();
    });
  }

  function enableStudioMode() {
    document.body.classList.add('jf-edit-active');
    if (fab) fab.style.display = 'flex';

    // Enable inline editing for ALL headings, paragraphs, descriptions, badges across entire website
    const allTextTargets = document.querySelectorAll(
      'h1, h2, h3, h4, h5, p, .cat-badge, .cat-sub, .folder-name, .bento-tag, .bento-title, .stat-num, .stat-label, .mt-tag-brand, .mt-stat-pill'
    );
    allTextTargets.forEach((el, idx) => {
      if (el.closest('#jfStudioFab') || el.closest('.jf-modal-backdrop')) return;
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('data-jf-editable', 'true');
      if (!el.getAttribute('data-jf-id')) el.setAttribute('data-jf-id', `jf-txt-${idx}`);
      el.addEventListener('blur', saveTextEdits);
    });

    // Ensure all cards have edit overlays
    attachCardEditOverlays();
  }

  function disableStudioMode() {
    document.body.classList.remove('jf-edit-active');
    if (fab) fab.style.display = 'none';
    sessionStorage.removeItem('jf_studio_auth');
    document.querySelectorAll('[contenteditable]').forEach(el => {
      el.removeAttribute('contenteditable');
    });
  }

  if (btnLock) btnLock.addEventListener('click', disableStudioMode);

  function attachCardEditOverlays() {
    const cardSelectors = '.bento-cell, .mt-card, .cat-img-card, .video-card-3d, .phone-mockup-3d, .laptop-mockup-3d, .gallery-stack-card';
    document.querySelectorAll(cardSelectors).forEach(card => {
      if (!card.querySelector('.jf-card-edit-overlay')) {
        const ov = document.createElement('div');
        ov.className = 'jf-card-edit-overlay';
        ov.innerHTML = '<button type="button" class="jf-btn-card-edit" onclick="openCardEditor(this)">✎ Edit</button>';
        card.appendChild(ov);
      }
    });
  }

  function saveTextEdits() {
    const data = {};
    document.querySelectorAll('[data-jf-id]').forEach(el => {
      const id = el.getAttribute('data-jf-id');
      if (id) data[id] = el.innerHTML;
    });
    localStorage.setItem('jf_text_edits', JSON.stringify(data));
  }

  function restoreSavedEdits() {
    try {
      const savedText = localStorage.getItem('jf_text_edits');
      if (savedText) {
        const data = JSON.parse(savedText);
        document.querySelectorAll('h1, h2, h3, h4, h5, p, .cat-badge, .cat-sub, .folder-name, .bento-tag, .bento-title, .stat-num, .stat-label, .mt-tag-brand, .mt-stat-pill').forEach((el, idx) => {
          if (el.closest('#jfStudioFab') || el.closest('.jf-modal-backdrop')) return;
          const id = el.getAttribute('data-jf-id') || `jf-txt-${idx}`;
          el.setAttribute('data-jf-id', id);
          if (data[id]) el.innerHTML = data[id];
        });
      }

      const savedCards = localStorage.getItem('jf_card_edits');
      if (savedCards) {
        const cardsData = JSON.parse(savedCards);
        Object.keys(cardsData).forEach(cardId => {
          const cardEl = document.querySelector(`[data-card-id="${cardId}"]`);
          if (cardEl) applyCardData(cardEl, cardsData[cardId]);
        });
      }

      // Restore custom dynamically created galleries
      const savedGalleries = localStorage.getItem('jf_custom_galleries');
      if (savedGalleries) {
        const galList = JSON.parse(savedGalleries);
        galList.forEach(gal => renderNewGallerySection(gal, false));
      }
    } catch (e) {
      console.warn('Error loading saved edits:', e);
    }
  }

  // Open Card Editor (Supports both images and videos!)
  window.openCardEditor = function(btn) {
    activeEditCard = btn.closest('.bento-cell, .mt-card, .cat-img-card, .video-card-3d, .phone-mockup-3d, .laptop-mockup-3d, .gallery-stack-card');
    if (!activeEditCard) return;

    if (!activeEditCard.getAttribute('data-card-id')) {
      activeEditCard.setAttribute('data-card-id', `card-${Date.now()}-${Math.floor(Math.random()*1000)}`);
    }

    if (cardHeading) cardHeading.textContent = 'Edit Project Card & Media';
    if (cardDelete) cardDelete.style.display = 'inline-block';

    const isVideoCard = activeEditCard.classList.contains('video-card-3d') ||
                        activeEditCard.classList.contains('phone-mockup-3d') ||
                        activeEditCard.classList.contains('laptop-mockup-3d') ||
                        activeEditCard.hasAttribute('data-video') ||
                        activeEditCard.querySelector('video') !== null;

    if (ceMediaType) {
      ceMediaType.value = isVideoCard ? 'video' : 'image';
      ceMediaType.dispatchEvent(new Event('change'));
    }

    const imgEl = activeEditCard.querySelector('img');
    const videoEl = activeEditCard.querySelector('video');
    const titleEl = activeEditCard.querySelector('.bento-title, h3, h4, .video-card-title');
    const descEl = activeEditCard.querySelector('p, .video-card-desc');
    const behanceLink = activeEditCard.getAttribute('data-behance') || (activeEditCard.tagName === 'A' ? activeEditCard.href : '');

    if (ceTitle) ceTitle.value = titleEl ? titleEl.textContent.trim() : '';
    if (ceDesc) ceDesc.value = descEl ? descEl.textContent.trim() : '';

    if (ceImageUrl) ceImageUrl.value = imgEl ? imgEl.getAttribute('src') : '';
    if (ceImageFile) ceImageFile.value = '';

    const videoSrc = activeEditCard.getAttribute('data-video') || (videoEl ? (videoEl.getAttribute('src') || (videoEl.querySelector('source') ? videoEl.querySelector('source').getAttribute('src') : '')) : '');
    const posterSrc = videoEl ? videoEl.getAttribute('poster') : (imgEl ? imgEl.getAttribute('src') : '');
    if (ceVideoUrl) ceVideoUrl.value = videoSrc || '';
    if (ceVideoFile) ceVideoFile.value = '';
    if (ceVideoPoster) ceVideoPoster.value = posterSrc || '';

    if (ceBehanceLink) ceBehanceLink.value = behanceLink || '';

    if (ceSpanSelect) {
      const spanClass = ['bento-span-1x1', 'bento-span-2x1', 'bento-span-1x2', 'bento-span-2x2'].find(c => activeEditCard.classList.contains(c)) || 'bento-span-1x1';
      ceSpanSelect.value = spanClass;
    }

    if (cardModal) cardModal.style.display = 'flex';
  };

  // Open "Add New Card" dialog for any gallery container
  window.openNewCardDialog = function(btnPlaceholder, defaultMediaType = 'image') {
    activeAddTargetContainer = btnPlaceholder.parentElement;
    activeAddMediaType = defaultMediaType;
    activeEditCard = null;

    if (cardHeading) cardHeading.textContent = `Add New ${defaultMediaType === 'video' ? 'Video Showcase' : 'Project Card'}`;
    if (cardDelete) cardDelete.style.display = 'none';

    if (ceMediaType) {
      ceMediaType.value = defaultMediaType;
      ceMediaType.dispatchEvent(new Event('change'));
    }

    if (ceTitle) ceTitle.value = '';
    if (ceDesc) ceDesc.value = '';
    if (ceImageUrl) ceImageUrl.value = '';
    if (ceImageFile) ceImageFile.value = '';
    if (ceVideoUrl) ceVideoUrl.value = '';
    if (ceVideoFile) ceVideoFile.value = '';
    if (ceVideoPoster) ceVideoPoster.value = '';
    if (ceBehanceLink) ceBehanceLink.value = '';

    if (cardModal) cardModal.style.display = 'flex';
  };

  function closeCardModal() {
    if (cardModal) cardModal.style.display = 'none';
    activeEditCard = null;
    activeAddTargetContainer = null;
  }

  if (cardClose) cardClose.addEventListener('click', closeCardModal);
  if (cardCancel) cardCancel.addEventListener('click', closeCardModal);

  if (cardDelete) {
    cardDelete.addEventListener('click', () => {
      if (activeEditCard && confirm('Are you sure you want to delete this card?')) {
        const cardId = activeEditCard.getAttribute('data-card-id');
        activeEditCard.remove();
        if (cardId) {
          const saved = JSON.parse(localStorage.getItem('jf_card_edits') || '{}');
          delete saved[cardId];
          localStorage.setItem('jf_card_edits', JSON.stringify(saved));
        }
        closeCardModal();
      }
    });
  }

  function applyCardData(card, data) {
    const isVideo = data.mediaType === 'video' || (data.videoUrl && data.videoUrl.length > 0);
    const titleEl = card.querySelector('.bento-title, h3, h4, .video-card-title');
    const descEl = card.querySelector('p, .video-card-desc');

    if (titleEl && data.title) titleEl.textContent = data.title;
    if (descEl && data.desc) descEl.textContent = data.desc;

    if (data.behance) {
      card.setAttribute('data-behance', data.behance);
      if (card.tagName === 'A') card.href = data.behance;
      const arrowLink = card.querySelector('.mt-arrow');
      if (arrowLink && arrowLink.tagName === 'A') arrowLink.href = data.behance;
    }

    if (data.span) {
      card.classList.remove('bento-span-1x1', 'bento-span-2x1', 'bento-span-1x2', 'bento-span-2x2');
      card.classList.add(data.span);
    }

    if (isVideo) {
      card.setAttribute('data-video', data.videoUrl || '');
      const videoEl = card.querySelector('video');
      if (videoEl) {
        videoEl.src = data.videoUrl || '';
        if (data.videoPoster) videoEl.poster = data.videoPoster;
      }
      const imgEl = card.querySelector('img');
      if (imgEl && data.videoPoster) imgEl.src = data.videoPoster;
    } else {
      const imgEl = card.querySelector('img');
      if (imgEl && data.img) imgEl.src = data.img;
      if (imgEl && data.focal) imgEl.style.objectPosition = data.focal;
    }
  }

  // Handle saving edits OR adding a new card
  if (cardForm) {
    cardForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const mediaType = ceMediaType ? ceMediaType.value : 'image';
      const isVideo = mediaType === 'video';

      const executeSave = (mediaSrc) => {
        const cardData = {
          mediaType: mediaType,
          title: ceTitle ? ceTitle.value.trim() : 'New Project',
          desc: ceDesc ? ceDesc.value.trim() : '',
          img: isVideo ? (ceVideoPoster ? ceVideoPoster.value.trim() : '') : mediaSrc,
          videoUrl: isVideo ? mediaSrc : '',
          videoPoster: ceVideoPoster ? ceVideoPoster.value.trim() : '',
          behance: ceBehanceLink ? ceBehanceLink.value.trim() : '',
          span: ceSpanSelect ? ceSpanSelect.value : 'bento-span-1x1',
          focal: ceFocalSelect ? ceFocalSelect.value : 'center'
        };

        if (activeEditCard) {
          // Editing existing card
          const cardId = activeEditCard.getAttribute('data-card-id');
          applyCardData(activeEditCard, cardData);

          const saved = JSON.parse(localStorage.getItem('jf_card_edits') || '{}');
          saved[cardId] = cardData;
          localStorage.setItem('jf_card_edits', JSON.stringify(saved));
        } else if (activeAddTargetContainer) {
          // Creating brand new card
          const newCardId = `card-new-${Date.now()}`;
          const isBento = activeAddTargetContainer.classList.contains('bento-gallery-grid');
          const isVideoContainer = activeAddTargetContainer.classList.contains('video-turnstile-grid') || isVideo;

          let newCard;
          if (isVideoContainer) {
            newCard = document.createElement('div');
            newCard.className = 'video-card-3d';
            newCard.setAttribute('data-card-id', newCardId);
            newCard.setAttribute('data-video', cardData.videoUrl);
            newCard.setAttribute('data-title', cardData.title);
            newCard.innerHTML = `
              <div class="jf-card-edit-overlay"><button type="button" class="jf-btn-card-edit" onclick="openCardEditor(this)">✎ Edit</button></div>
              <div class="video-card-thumb">
                <img src="${cardData.videoPoster || 'assets/portfolio_works/aero-1.png'}" alt="${cardData.title}" loading="lazy">
                <div class="video-play-badge">▶</div>
              </div>
              <div class="video-card-meta">
                <span class="video-card-tag">NEW VIDEO</span>
                <h4 class="video-card-title">${cardData.title}</h4>
                <p class="video-card-desc">${cardData.desc || 'High engagement commercial video showcase.'}</p>
              </div>
            `;
          } else if (isBento) {
            newCard = document.createElement('div');
            newCard.className = `bento-cell ${cardData.span}`;
            newCard.setAttribute('data-card-id', newCardId);
            newCard.setAttribute('data-lightbox', cardData.img);
            newCard.setAttribute('data-title', cardData.title);
            if (cardData.behance) newCard.setAttribute('data-behance', cardData.behance);
            newCard.innerHTML = `
              <div class="jf-card-edit-overlay"><button type="button" class="jf-btn-card-edit" onclick="openCardEditor(this)">✎ Edit</button></div>
              <img src="${cardData.img || 'assets/portfolio_works/notey-cover.webp'}" alt="${cardData.title}" class="bento-img" loading="lazy" style="object-position:${cardData.focal};">
              <div class="bento-overlay">
                <span class="bento-tag">Bento Feature</span>
                <p class="bento-title">${cardData.title}</p>
              </div>
            `;
          } else {
            // Standard Motion Tile / Showcase Card
            newCard = document.createElement('div');
            newCard.className = 'mt-card';
            newCard.setAttribute('data-card-id', newCardId);
            newCard.setAttribute('data-cat', 'stationery');
            newCard.setAttribute('data-lightbox', cardData.img);
            newCard.setAttribute('data-title', cardData.title);
            if (cardData.behance) newCard.setAttribute('data-behance', cardData.behance);
            newCard.innerHTML = `
              <div class="jf-card-edit-overlay"><button type="button" class="jf-btn-card-edit" onclick="openCardEditor(this)">✎ Edit</button></div>
              <div class="mt-card-media">
                <img src="${cardData.img || 'assets/portfolio_works/notey-cover.webp'}" alt="${cardData.title}" class="mt-img" loading="lazy" style="object-position:${cardData.focal};">
                <div class="mt-badge-top"><span class="mt-tag-brand">CUSTOM WORK</span></div>
              </div>
              <div class="mt-card-info">
                <div class="mt-title-row">
                  <h3>${cardData.title}</h3>
                  <span class="mt-arrow">↗</span>
                </div>
                <p>${cardData.desc || 'Custom design showcase card.'}</p>
              </div>
            `;
          }

          // Insert before placeholder button
          const placeholder = activeAddTargetContainer.querySelector('.jf-add-card-placeholder');
          if (placeholder) {
            activeAddTargetContainer.insertBefore(newCard, placeholder);
          } else {
            activeAddTargetContainer.appendChild(newCard);
          }

          const saved = JSON.parse(localStorage.getItem('jf_card_edits') || '{}');
          saved[newCardId] = cardData;
          localStorage.setItem('jf_card_edits', JSON.stringify(saved));
        }

        closeCardModal();
      };

      if (isVideo) {
        if (ceVideoFile && ceVideoFile.files && ceVideoFile.files[0]) {
          const reader = new FileReader();
          reader.onload = (re) => executeSave(re.target.result);
          reader.readAsDataURL(ceVideoFile.files[0]);
        } else {
          executeSave(ceVideoUrl ? ceVideoUrl.value.trim() : '');
        }
      } else {
        if (ceImageFile && ceImageFile.files && ceImageFile.files[0]) {
          const reader = new FileReader();
          reader.onload = (re) => executeSave(re.target.result);
          reader.readAsDataURL(ceImageFile.files[0]);
        } else {
          executeSave(ceImageUrl ? ceImageUrl.value.trim() : '');
        }
      }
    });
  }

  // ==========================================
  // CUSTOM NEW GALLERY SECTION CREATION
  // ==========================================
  if (btnAddGallery) {
    btnAddGallery.addEventListener('click', () => {
      if (newGalModal) newGalModal.style.display = 'flex';
    });
  }

  function closeNewGalleryModal() {
    if (newGalModal) newGalModal.style.display = 'none';
  }

  if (newGalClose) newGalClose.addEventListener('click', closeNewGalleryModal);
  if (newGalCancel) newGalCancel.addEventListener('click', closeNewGalleryModal);

  function renderNewGallerySection(galData, saveToStorage = true) {
    const targetParent = document.getElementById(galData.category) || document.getElementById('work');
    if (!targetParent) return;

    const galId = galData.id || `custom-gal-${Date.now()}`;
    const newSection = document.createElement('div');
    newSection.className = 'bento-gallery-wrap';
    newSection.id = galId;
    newSection.style.marginTop = '32px';

    newSection.innerHTML = `
      <div class="bento-gallery-header">
        <div class="bento-project-meta">
          <h4 data-jf-editable="true">${galData.title}</h4>
          <span data-jf-editable="true">${galData.sub || 'Custom Bento Showcase'}</span>
        </div>
        ${galData.behance ? `
          <a href="${galData.behance}" target="_blank" rel="noopener" class="btn-bento-behance">
            <span>View On Behance</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
          </a>
        ` : ''}
      </div>
      <div class="bento-gallery-grid">
        <div class="bento-cell bento-span-2x1" data-lightbox="assets/portfolio_works/notey-cover.webp" data-title="${galData.title}">
          <div class="jf-card-edit-overlay"><button type="button" class="jf-btn-card-edit" onclick="openCardEditor(this)">✎ Edit</button></div>
          <img src="assets/portfolio_works/notey-cover.webp" alt="${galData.title}" class="bento-img" loading="lazy">
          <div class="bento-overlay">
            <span class="bento-tag">Featured</span>
            <p class="bento-title">${galData.title}</p>
          </div>
        </div>
        <div class="jf-add-card-placeholder" onclick="openNewCardDialog(this, 'bento-cell')">
          <span style="font-size:1.6rem;">+</span>
          <span>Add Bento Card</span>
        </div>
      </div>
    `;

    targetParent.appendChild(newSection);

    if (saveToStorage) {
      const savedGals = JSON.parse(localStorage.getItem('jf_custom_galleries') || '[]');
      savedGals.push({ ...galData, id: galId });
      localStorage.setItem('jf_custom_galleries', JSON.stringify(savedGals));
    }
  }

  if (newGalForm) {
    newGalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const galData = {
        title: ngTitle ? ngTitle.value.trim() : 'Custom Gallery',
        sub: ngSub ? ngSub.value.trim() : 'Custom Bento Showcase',
        category: ngCategory ? ngCategory.value : 'cat-branding',
        behance: ngBehance ? ngBehance.value.trim() : ''
      };

      renderNewGallerySection(galData, true);
      closeNewGalleryModal();
      alert(`🎉 New Gallery "${galData.title}" created successfully! Click "+ Add Bento Card" or "✎ Edit" to add your media.`);
    });
  }

  // 1-Click Export Live Clean HTML
  if (btnSaveLive) {
    btnSaveLive.addEventListener('click', async () => {
      try {
        const docClone = document.documentElement.cloneNode(true);
        const cloneBody = docClone.querySelector('body') || docClone;
        cloneBody.classList.remove('jf-edit-active');

        // Remove temporary attributes
        docClone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        docClone.querySelectorAll('.jf-card-edit-overlay').forEach(el => el.remove());

        const cloneFab = docClone.querySelector('#jfStudioFab');
        if (cloneFab) cloneFab.style.display = 'none';

        docClone.querySelectorAll('.jf-modal-backdrop').forEach(m => m.style.display = 'none');

        const htmlContent = '<!DOCTYPE html>\n' + docClone.outerHTML;

        if ('showSaveFilePicker' in window) {
          try {
            const handle = await window.showSaveFilePicker({
              suggestedName: 'index.html',
              types: [{
                description: 'HTML Document',
                accept: { 'text/html': ['.html'] }
              }]
            });
            const writable = await handle.createWritable();
            await writable.write(htmlContent);
            await writable.close();
            alert('🎉 Success! Your live index.html file has been saved with all changes permanently baked in!');
            return;
          } catch (pickerErr) {
            if (pickerErr.name === 'AbortError') return;
          }
        }

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('🎉 index.html downloaded! Replace this file in your portfolio repository, and all changes will be 100% permanent on your live website for everyone!');
      } catch (err) {
        console.error('Error exporting live HTML:', err);
        alert('Export failed: ' + err.message);
      }
    });
  }

  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const backup = {
        exportedAt: new Date().toISOString(),
        textEdits: JSON.parse(localStorage.getItem('jf_text_edits') || '{}'),
        cardEdits: JSON.parse(localStorage.getItem('jf_card_edits') || '{}'),
        customGalleries: JSON.parse(localStorage.getItem('jf_custom_galleries') || '[]')
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `javeria-portfolio-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Reset all website edits and restore original default data?')) {
        localStorage.removeItem('jf_text_edits');
        localStorage.removeItem('jf_card_edits');
        localStorage.removeItem('jf_custom_galleries');
        sessionStorage.removeItem('jf_studio_auth');
        window.location.reload();
      }
    });
  }
}

/* ============================================================
   INIT ALL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCounters();
  initFilter();
  initHeroParallax();
  initTicker();
  initPhone();
  initPaletteChips();
  initIndustryHover();

  initCarousel360();
  initNotebookFlipBook();
  initMotionTilesGallery();
  initAceternityTimeline();
  initPortfolioLightbox();
  initHoloCard();
  initContactMsgForm();

  // New modules:
  initFolderBehanceLinks();
  initVelocityGallery();
  initGalleryStack();
  initIosVideoPlayer();
  initVideoCarouselModal();
  initPortfolioStudio();

  // Tilt — slight delay so DOM is fully rendered
  requestAnimationFrame(() => {
    initTilt();
    initCardDepth();
  });

  // GSAP — runs after GSAP CDN loads
  window.addEventListener('load', initGSAP);
});

/* ============================================================
   PERFORMANCE: Pause animations when tab is hidden
   ============================================================ */
document.addEventListener('visibilitychange', () => {
  const animated = document.querySelectorAll('.ticker-track, .hero-avatar, .blob');
  animated.forEach(el => {
    el.style.animationPlayState = document.hidden ? 'paused' : 'running';
  });
});
