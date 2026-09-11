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
    folder.addEventListener('click', (e) => {
      if (e.target.closest('.jf-card-edit-overlay') || e.target.closest('.jf-btn-card-edit')) return;
      if (e.target.closest('.folder-paper')) return;

      if (e.target.closest('.folder-hint')) {
        const url = folder.getAttribute('data-behance') || folder.getAttribute('data-pdf');
        if (url) {
          e.stopPropagation();
          window.open(url, '_blank', 'noopener');
          return;
        }
      }

      const wasOpen = folder.classList.contains('folder-open');
      // Close other open folders in the row so fanned-out papers never collide
      document.querySelectorAll('.folder-unit.folder-open').forEach(f => {
        if (f !== folder) f.classList.remove('folder-open');
      });
      folder.classList.toggle('folder-open', !wasOpen);
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

  // Global delegated click for folder papers: Opens image in Lightbox!
  document.addEventListener('click', (e) => {
    const paper = e.target.closest('.folder-paper');
    if (paper) {
      if (e.target.closest('.jf-card-edit-overlay') || e.target.closest('.jf-btn-card-edit')) return;
      e.stopPropagation();
      e.preventDefault();

      const img = paper.querySelector('img');
      const titleEl = paper.querySelector('.fp-title');
      const folder = paper.closest('.folder-unit');
      const folderName = folder ? (folder.querySelector('.folder-name')?.textContent.trim() || 'Project') : 'Project';
      const paperTitle = (titleEl ? titleEl.textContent.trim() : 'Preview') + ' — ' + folderName;
      const actionUrl = folder ? (folder.getAttribute('data-behance') || folder.getAttribute('data-pdf')) : null;
      const isPdf = !!(folder && folder.getAttribute('data-pdf'));
      const src = (img ? img.getAttribute('src') : null) || paper.getAttribute('data-lightbox');

      if (src && window.openPortfolioLightbox) {
        window.openPortfolioLightbox(src, paperTitle, actionUrl, isPdf);
      }
    }
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
    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%' }
      }
    );
  });

  // About ID card 3D entrance
  if (document.getElementById('idCardWrapper')) {
    gsap.fromTo('#idCardWrapper',
      { rotateY: -35, x: -60, opacity: 0 },
      { rotateY: 0, x: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: '#about', start: 'top 75%' }
      }
    );
  }

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
  if (document.querySelector('.contact-title')) {
    gsap.fromTo('.contact-title',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '#contact', start: 'top 80%' }
      }
    );
  }

  // Bento items stagger reveal
  if (document.querySelector('.bento-item')) {
    gsap.fromTo('.bento-item',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: '#work', start: 'top 75%' }
      }
    );
  }

  // Case study entrance
  if (document.querySelector('.case-content')) {
    gsap.fromTo('.case-content',
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '#case-study', start: 'top 75%' }
      }
    );
  }
  if (document.querySelector('.case-visual')) {
    gsap.fromTo('.case-visual',
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '#case-study', start: 'top 75%' }
      }
    );
  }
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
let c360Data = [
  {
    title: "NoteySTUFF Stationery Brand",
    category: "BRANDING & PACKAGING",
    desc: "0-to-1 brand identity, custom notebooks & packaging.",
    img: "assets/portfolio_works/notey-360-custom.png",
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
    img: "assets/portfolio_works/takhleeq-360-custom.png",
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
  },
  {
    title: "KidFit Branding and Identity",
    category: "YOUTH ATHLETIC & EDITORIAL",
    desc: "Youth athletic brand guide, workout manuals & visual system.",
    img: "assets/portfolio_works/kidfit-360.png",
    link: "assets/KidFit.pdf"
  },
  {
    title: "Kairos — Pitch Deck",
    category: "PITCH DECK & PRESENTATION",
    desc: "High-impact investor pitch deck and visual presentation design.",
    img: "assets/portfolio_works/kairos-pitch-deck.png",
    link: "#"
  }
];

try {
  const savedC360 = localStorage.getItem('jf_c360_data');
  if (savedC360) {
    const parsed = JSON.parse(savedC360);
    if (Array.isArray(parsed) && parsed.length >= 8) {
      parsed.forEach((item, idx) => {
        if (item.img && item.img.startsWith('data:')) {
          if (idx === 0) item.img = 'assets/portfolio_works/notey-360-custom.png';
          else if (idx === 2) item.img = 'assets/portfolio_works/takhleeq-360-custom.png';
          else if (idx === 6) item.img = 'assets/portfolio_works/kidfit-360.png';
          else if (idx === 7) item.img = 'assets/portfolio_works/kairos-pitch-deck.png';
        }
      });
      c360Data = parsed;
      localStorage.setItem('jf_c360_data', JSON.stringify(c360Data));
    }
  }
} catch (e) {
  console.warn('Could not load saved 360 data:', e);
}

let update360RingRef = null;

function initCarousel360() {
  const container = document.getElementById('c360Container');
  if (!container) return;

  const numItems = c360Data.length;
  const angleStep = 360 / numItems;
  let currentRotation = 0;
  const ringTiltDeg = 38;
  let isPaused = false;
  let timer = null;

  const totalCountEl = document.getElementById('c360TotalCount');
  if (totalCountEl) totalCountEl.textContent = String(numItems).padStart(2, '0');

  // Re-populate ring thumbs if needed
  const ring = document.getElementById('c360Ring');
  if (ring && ring.children.length !== numItems) {
    ring.innerHTML = '';
    c360Data.forEach((item, idx) => {
      const wrap = document.createElement('div');
      wrap.className = `c360-thumb-wrapper ${idx === 0 ? 'active-thumb' : ''}`;
      wrap.setAttribute('data-c360-idx', idx);
      wrap.innerHTML = `<div class="c360-thumb-item"><img src="${item.img}" alt="${item.title}" class="c360-thumb-img" loading="lazy"></div>`;
      ring.appendChild(wrap);
    });
  }

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

    const item = c360Data[centerIdx] || c360Data[0];
    const centerImg = document.getElementById('c360CenterImg');
    const centerBadge = document.getElementById('c360CenterBadge');
    const centerTitle = document.getElementById('c360CenterTitle');
    const centerDesc = document.getElementById('c360CenterDesc');
    const centerBtn = document.getElementById('c360CenterBtn');
    const counter = document.getElementById('c360CurrentIdx');

    if (centerImg && item && centerImg.getAttribute('src') !== item.img) {
      centerImg.style.opacity = '0.35';
      setTimeout(() => {
        centerImg.src = item.img;
        centerImg.style.opacity = '1';
      }, 150);
    }
    if (centerBadge && item) centerBadge.textContent = item.category;
    if (centerTitle && item) centerTitle.textContent = item.title;
    if (centerDesc && item) centerDesc.textContent = item.desc;
    if (centerBtn && item) centerBtn.href = item.link;
    if (counter) counter.textContent = String(centerIdx + 1).padStart(2, '0');
  }

  update360RingRef = updateRing;

  function rotateLeft() {
    currentRotation += angleStep;
    updateRing();
  }

  function rotateRight() {
    currentRotation -= angleStep;
    updateRing();
  }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(() => {
      if (!isPaused) rotateRight();
    }, 4500);
  }

  function stopAutoplay() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  if (prevBtn) prevBtn.onclick = () => { rotateLeft(); resetAutoplay(); };
  if (nextBtn) nextBtn.onclick = () => { rotateRight(); resetAutoplay(); };

  thumbs.forEach((thumb, i) => {
    thumb.style.cursor = 'pointer';
    thumb.onclick = () => {
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
    };
  });

  container.addEventListener('mouseenter', () => { isPaused = true; });
  container.addEventListener('mouseleave', () => { isPaused = false; });
  window.addEventListener('resize', () => updateRing(false));

  updateRing();
  startAutoplay();
}

/* ============================================================
   INTERACTIVE NOTEBOOK LOOKBOOKS (DUAL CLEAN IMAGE FLIPBOOKS)
   ============================================================ */
let noteyPagesData = [
  'assets/portfolio_works/notey-cover.webp',
  'assets/portfolio_works/notey-spread.webp',
  'assets/portfolio_works/notey-mockup1.webp',
  'assets/portfolio_works/notey-pkg1.webp',
  'assets/portfolio_works/notey-real-cover.png',
  'assets/portfolio_works/notey-real-spread.png'
];

let mykitabPagesData = [
  'assets/portfolio_works/mykitab-cover-1.png',
  'assets/portfolio_works/mykitab-cover-2.png',
  'assets/portfolio_works/mykitab-cover-3.png',
  'assets/portfolio_works/mykitab-cover-4.png',
  'assets/portfolio_works/mykitab-cover-5.png',
  'assets/portfolio_works/mykitab-cover-6.png',
  'assets/portfolio_works/mykitab-cover-7.png',
  'assets/portfolio_works/mykitab-cover-8.png',
  'assets/portfolio_works/mykitab-cover-9.png',
  'assets/portfolio_works/mykitab-cover-10.png'
];

function initNotebookFlipBook() {
  try {
    const savedNotey = localStorage.getItem('jf_flipbook_notey');
    if (savedNotey) noteyPagesData = JSON.parse(savedNotey);
    const savedMykitab = localStorage.getItem('jf_flipbook_mykitab');
    if (savedMykitab) mykitabPagesData = JSON.parse(savedMykitab);
  } catch (e) {
    console.warn('Could not load saved flipbook pages:', e);
  }

  setupSingleFlipbook('notey', noteyPagesData);
  setupSingleFlipbook('mykitab', mykitabPagesData);
}

function setupSingleFlipbook(idPrefix, pagesArray) {
  let idx = 0;
  const imgEl = document.getElementById(`${idPrefix}ActiveImg`);
  const pageNumEl = document.getElementById(`${idPrefix}PageNum`);
  const totalEl = document.getElementById(`${idPrefix}TotalPages`);
  const prevBtn = document.getElementById(`${idPrefix}PrevBtn`);
  const nextBtn = document.getElementById(`${idPrefix}NextBtn`);
  const dotsEl = document.getElementById(`${idPrefix}Dots`);
  const spreadEl = document.getElementById(`${idPrefix}SpreadEl`);

  if (!imgEl || !pagesArray || pagesArray.length === 0) return;

  function renderDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    const maxDots = Math.min(pagesArray.length, 8);
    for (let i = 0; i < maxDots; i++) {
      const dot = document.createElement('span');
      dot.className = `flip-dot ${i === idx ? 'active' : ''}`;
      dot.addEventListener('click', () => goToPage(i));
      dotsEl.appendChild(dot);
    }
  }

  function goToPage(targetIdx, direction = 'next') {
    if (targetIdx < 0) targetIdx = pagesArray.length - 1;
    if (targetIdx >= pagesArray.length) targetIdx = 0;
    idx = targetIdx;

    if (spreadEl) {
      spreadEl.style.transform = direction === 'next' ? 'rotateY(-25deg)' : 'rotateY(25deg)';
      spreadEl.style.opacity = '0.4';
    }

    setTimeout(() => {
      imgEl.src = pagesArray[idx];
      imgEl.setAttribute('data-lightbox', pagesArray[idx]);
      if (pageNumEl) pageNumEl.textContent = `Page ${idx + 1}`;
      if (totalEl) totalEl.textContent = pagesArray.length;
      renderDots();

      if (spreadEl) {
        spreadEl.style.transform = 'rotateY(0deg)';
        spreadEl.style.opacity = '1';
      }
    }, 180);
  }

    if (prevBtn) prevBtn.addEventListener('click', () => goToPage(idx - 1, 'prev'));
    if (nextBtn) nextBtn.addEventListener('click', () => goToPage(idx + 1, 'next'));

    // Touch Swipe for Flipbook
    if (spreadEl) {
      let touchStartX = 0;
      spreadEl.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      spreadEl.addEventListener('touchend', (e) => {
        const diffX = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diffX) > 40) {
          if (diffX < 0) goToPage(idx + 1, 'next');
          else goToPage(idx - 1, 'prev');
        }
      }, { passive: true });
    }

    renderDots();
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
  window.openPortfolioLightbox = openLightbox;

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

    // Folder container itself toggles open/close; only inner papers open lightbox
    if (trigger.classList.contains('folder-unit')) return;

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
  document.addEventListener('click', (e) => {
    const hint = e.target.closest('.folder-hint');
    if (hint) {
      if (e.target.closest('.jf-card-edit-overlay') || e.target.closest('.jf-btn-card-edit')) return;
      const folder = hint.closest('.folder-unit');
      if (!folder) return;
      const behanceUrl = folder.getAttribute('data-behance') || folder.getAttribute('data-pdf');
      if (behanceUrl) {
        e.stopPropagation();
        window.open(behanceUrl, '_blank', 'noopener');
      }
    }
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
  let posB = -2000;
  const baseSpeed = 0.95;
  let velocitySpeed = 0;
  let lastScrollY = window.scrollY;

  // Measure initial halfWidthB for smooth start
  requestAnimationFrame(() => {
    if (trackB && trackB.scrollWidth > 0) {
      posB = -(trackB.scrollWidth / 2);
    }
  });

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const diff = currentScrollY - lastScrollY;
    velocitySpeed = Math.min(12, Math.abs(diff) * 0.32);
    lastScrollY = currentScrollY;
  }, { passive: true });

  function animate() {
    velocitySpeed *= 0.94;
    const currentSpeed = baseSpeed + velocitySpeed;

    posA -= currentSpeed;
    posB += currentSpeed;

    const halfWidthA = trackA.scrollWidth / 2;
    if (halfWidthA > 0 && Math.abs(posA) >= halfWidthA) posA = 0;
    trackA.style.transform = `translate3d(${posA}px, 0, 0)`;

    const halfWidthB = trackB.scrollWidth / 2;
    if (halfWidthB > 0 && posB >= 0) posB = -halfWidthB;
    trackB.style.transform = `translate3d(${posB}px, 0, 0)`;

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
  const btnSaveAll = document.getElementById('btnStudioSaveAll');
  if (btnSaveAll) {
    btnSaveAll.addEventListener('click', () => {
      saveTextEdits();
      showSaveToast('✓ All Edits Successfully Saved!');
    });
  }
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

  assignStableTextIds();
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


  function showSaveToast(msg = '✓ Changes Saved') {
    let toast = document.getElementById('jfSaveToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'jfSaveToast';
      toast.style.cssText = 'position:fixed; top:24px; left:50%; transform:translateX(-50%); background:#059669; color:#fff; padding:10px 24px; border-radius:999px; font-family:"Space Grotesk",sans-serif; font-size:0.88rem; font-weight:700; z-index:9999999; box-shadow:0 10px 30px rgba(5,150,105,0.45); pointer-events:none; transition:all 0.3s cubic-bezier(0.16,1,0.3,1); opacity:0;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-12px)';
    }, 1800);
  }

  function assignStableTextIds() {
    const textSelectors = 'h1, h2, h3, h4, h5, p, .cat-badge, .cat-sub, .folder-name, .folder-cat, .bento-tag, .bento-title, .stat-num, .stat-label, .mt-tag-brand, .mt-stat-pill, .act-role, .act-desc, .act-chip, .act-duration, .act-work-type, .act-company, .exp-badge-now, .exp-badge-award, .act-img-caption, .case-title, .case-sub, .cat-card-tag, .cat-card-title span';

    document.querySelectorAll(textSelectors).forEach((el) => {
      if (el.closest('#jfStudioFab') || el.closest('.jf-modal-backdrop') || el.closest('.jf-section-reorder-bar')) return;
      if (el.hasAttribute('data-jf-id')) return;

      // 1. Element's own ID
      if (el.id) {
        el.setAttribute('data-jf-id', el.id);
        return;
      }

      // 2. Element inside a card
      const card = el.closest('[data-card-id]');
      if (card) {
        const cardId = card.getAttribute('data-card-id');
        const role = el.classList.contains('cat-card-tag') ? 'tag' :
                     el.classList.contains('bento-tag') ? 'tag' :
                     el.classList.contains('act-img-caption') ? 'caption' :
                     el.classList.contains('velocity-badge') ? 'badge' :
                     (el.tagName.toLowerCase().startsWith('h') || el.parentElement.classList.contains('cat-card-title') || el.classList.contains('bento-title')) ? 'title' : 'desc';
        el.setAttribute('data-jf-id', `${cardId}_${role}`);
        return;
      }

      // 3. Element inside a folder
      const folder = el.closest('[data-folder-id]');
      if (folder) {
        const folderId = folder.getAttribute('data-folder-id');
        const role = el.classList.contains('folder-name') ? 'name' :
                     el.classList.contains('folder-cat') ? 'cat' :
                     el.tagName.toLowerCase().startsWith('h') ? 'title' : 'desc';
        el.setAttribute('data-jf-id', `${folderId}_${role}`);
        return;
      }

      // 4. Stable container hierarchy
      const container = el.closest('[id]');
      const containerId = container ? container.id : 'doc';
      const siblings = Array.from(container ? container.querySelectorAll(el.tagName) : [el]);
      const tagIdx = siblings.indexOf(el);
      el.setAttribute('data-jf-id', `txt_${containerId}_${el.tagName.toLowerCase()}_${tagIdx >= 0 ? tagIdx : 0}`);
    });
  }

  let textDebounceTimer = null;
  function debounceSaveText() {
    clearTimeout(textDebounceTimer);
    textDebounceTimer = setTimeout(saveTextEdits, 600);
  }

  function enableStudioMode() {
    document.body.classList.add('jf-edit-active');
    if (fab) fab.style.display = 'flex';

    // Enable inline editing for ALL headings, paragraphs, descriptions, badges across entire website
    const allTextTargets = document.querySelectorAll(
      'h1, h2, h3, h4, h5, p, .cat-badge, .cat-sub, .folder-name, .bento-tag, .bento-title, .stat-num, .stat-label, .mt-tag-brand, .mt-stat-pill, .act-role, .act-desc, .act-chip, .act-duration, .act-work-type, .act-company, .exp-badge-now, .exp-badge-award, .act-img-caption, .case-title, .case-sub'
    );
    assignStableTextIds();
    restoreSavedEdits();

    allTextTargets.forEach((el) => {
      if (el.closest('#jfStudioFab') || el.closest('.jf-modal-backdrop') || el.closest('.jf-section-reorder-bar')) return;
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('data-jf-editable', 'true');
      el.addEventListener('blur', saveTextEdits);
      el.addEventListener('input', debounceSaveText);
    });

    // Ensure all cards and media have edit overlays
    attachCardEditOverlays();
    attachFolderPlaceholders();
    attachAllGalleryAddButtons();
    attachC360Button();
    attachSectionReorderBars();
    initPaletteEditor();
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

  // Section Reordering Toolbar
  function attachSectionReorderBars() {
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((sec) => {
      if (sec.querySelector('.jf-section-reorder-bar')) return;
      const bar = document.createElement('div');
      bar.className = 'jf-section-reorder-bar';
      const secName = (sec.getAttribute('id') || 'section').toUpperCase();
      bar.innerHTML = `
        <span class="jf-section-label">SECTION: ${secName}</span>
        <div style="display:flex; gap:6px;">
          <button type="button" class="jf-reorder-btn jf-reorder-up" title="Move Section Up">▲ Move Up</button>
          <button type="button" class="jf-reorder-btn jf-reorder-down" title="Move Section Down">▼ Move Down</button>
        </div>
      `;
      const upBtn = bar.querySelector('.jf-reorder-up');
      const downBtn = bar.querySelector('.jf-reorder-down');

      upBtn.onclick = (e) => {
        e.stopPropagation();
        let prev = sec.previousElementSibling;
        while (prev && prev.tagName !== 'SECTION') {
          prev = prev.previousElementSibling;
        }
        if (prev && prev.tagName === 'SECTION') {
          sec.parentElement.insertBefore(sec, prev);
          saveSectionOrder();
        }
      };

      downBtn.onclick = (e) => {
        e.stopPropagation();
        let next = sec.nextElementSibling;
        while (next && next.tagName !== 'SECTION') {
          next = next.nextElementSibling;
        }
        if (next && next.tagName === 'SECTION') {
          sec.parentElement.insertBefore(next, sec);
          saveSectionOrder();
        }
      };

      sec.insertBefore(bar, sec.firstChild);
    });
  }

  function saveSectionOrder() {
    const order = Array.from(document.querySelectorAll('section[id]')).map(s => s.id);
    localStorage.setItem('jf_section_order', JSON.stringify(order));
  }

  function restoreSectionOrder() {
    try {
      const saved = localStorage.getItem('jf_section_order');
      if (!saved) return;
      const order = JSON.parse(saved);
      const parent = document.body;
      const footer = document.querySelector('footer');
      order.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.parentElement === parent) {
          if (footer) parent.insertBefore(el, footer);
          else parent.appendChild(el);
        }
      });
    } catch (e) {
      console.warn('Could not restore section order:', e);
    }
  }

  // Interactive Color Palette Theme Editor
  function initPaletteEditor() {
    const chips = document.querySelectorAll('.palette-chips .p-chip');
    if (!chips.length) return;

    chips.forEach((chip, idx) => {
      chip.style.cursor = 'pointer';
      chip.onclick = () => {
        if (!document.body.classList.contains('jf-edit-active')) return;
        const currentColor = chip.style.getPropertyValue('--c') || chip.getAttribute('title') || '#E8006A';
        const newColor = prompt(`Enter new hex color for Brand Palette Chip ${idx + 1}:`, currentColor.trim());
        if (newColor && /^#([0-9A-F]{3}){1,2}$/i.test(newColor.trim())) {
          const hex = newColor.trim().toUpperCase();
          chip.style.setProperty('--c', hex);
          chip.setAttribute('title', hex);

          const floatDots = document.querySelectorAll('#caseFloatPalette div');
          if (floatDots[idx]) {
            floatDots[idx].style.background = hex;
          }

          const paletteArr = Array.from(chips).map(c => c.style.getPropertyValue('--c') || c.getAttribute('title'));
          localStorage.setItem('jf_palette_colors', JSON.stringify(paletteArr));
        }
      };
    });
  }

  function attachCardEditOverlays() {
    const cardSelectors = '.bento-cell, .mt-card, .cat-img-card, .video-card-3d, .phone-mockup-3d, .laptop-mockup-3d, .gallery-stack-card, .act-img-box, .case-img-wrap, .id-card-frame, .holo-profile-card, .velocity-card';
    document.querySelectorAll(cardSelectors).forEach(card => {
      if (!card.querySelector('.jf-card-edit-overlay')) {
        const ov = document.createElement('div');
        ov.className = 'jf-card-edit-overlay';
        ov.innerHTML = '<button type="button" class="jf-btn-card-edit" onclick="openCardEditor(this)">✎ Edit</button>';
        card.appendChild(ov);
      }
    });

    // Attach folder edit overlays
    document.querySelectorAll('.folder-unit').forEach(folder => {
      if (!folder.querySelector('.jf-card-edit-overlay')) {
        const ov = document.createElement('div');
        ov.className = 'jf-card-edit-overlay';
        ov.innerHTML = '<button type="button" class="jf-btn-card-edit" onclick="openFolderEditor(this)">✎ Edit Folder</button>';
        folder.appendChild(ov);
      }
    });

    // Attach 360 center card edit overlay
    const c360Center = document.getElementById('c360CenterCard');
    if (c360Center && !c360Center.querySelector('.jf-card-edit-overlay')) {
      const ov = document.createElement('div');
      ov.className = 'jf-card-edit-overlay';
      ov.innerHTML = '<button type="button" class="jf-btn-card-edit" onclick="openC360Editor()">✎ Edit Active 360</button>';
      c360Center.appendChild(ov);
    }
  }

  function attachAllGalleryAddButtons() {
    const gallerySelectors = '.cat-showcase-grid, .bento-gallery-grid, .bento-grid, .act-img-grid, .velocity-track, .motion-tiles-grid, .video-turnstile-grid';
    document.querySelectorAll(gallerySelectors).forEach(grid => {
      let ph = grid.querySelector('.jf-add-card-placeholder');
      if (!ph) {
        ph = document.createElement('div');
        ph.className = 'jf-add-card-placeholder';
        if (grid.classList.contains('motion-tiles-grid')) ph.classList.add('jf-add-mt-card');
        if (grid.classList.contains('video-turnstile-grid')) ph.classList.add('jf-add-video-card');
        ph.innerHTML = '<span style="font-size:1.6rem; line-height:1;">+</span><span>Add Image Card</span>';
        grid.appendChild(ph);
      }
      ph.onclick = function(e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        let type = 'image';
        if (grid.classList.contains('video-turnstile-grid') || ph.classList.contains('jf-add-video-card')) type = 'video';
        else if (grid.classList.contains('motion-tiles-grid') || ph.classList.contains('jf-add-mt-card')) type = 'mt-card';
        else if (grid.classList.contains('bento-gallery-grid') || grid.classList.contains('bento-grid')) type = 'bento-cell';
        window.openNewCardDialog(this, type);
      };
    });
  }

  function attachFolderPlaceholders() {
    document.querySelectorAll('.cat-folders-row').forEach(row => {
      if (!row.querySelector('.jf-add-folder-placeholder')) {
        const ph = document.createElement('div');
        ph.className = 'jf-add-folder-placeholder';
        ph.onclick = function() { openNewFolderDialog(this); };
        ph.innerHTML = '<span style="font-size:1.8rem; line-height:1;">+</span><span>Add New Folder</span>';
        row.appendChild(ph);
      }
    });
  }

  function attachC360Button() {
    const container = document.getElementById('c360Container');
    if (container && !document.getElementById('btnC360AddProject')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btnC360AddProject';
      btn.className = 'jf-add-360-btn';
      btn.innerHTML = '<span>+ Add 360 Spotlight Project</span>';
      btn.onclick = () => openNew360Dialog();
      container.parentNode.insertBefore(btn, container.nextSibling);
    }
  }

    function saveTextEdits() {
    const data = JSON.parse(localStorage.getItem('jf_text_edits') || '{}');
    document.querySelectorAll('[data-jf-id]').forEach(el => {
      const id = el.getAttribute('data-jf-id');
      if (id && el.hasAttribute('contenteditable')) {
        data[id] = el.innerHTML;
      }
    });
    localStorage.setItem('jf_text_edits', JSON.stringify(data));
    showSaveToast('✓ Text Saved');
  }

  function restoreSavedEdits() {
    try {
      // 1. Ensure deterministic text IDs are assigned before restoration
      assignStableTextIds();

      // 2. Validate section order against canonical sections
      const canonicalSecs = ['home', 'showcase-360', 'about', 'experience', 'work', 'case-study', 'clients', 'gallery', 'explore-behance', 'video-showcase', 'testimonials'];
      const savedSecOrder = localStorage.getItem('jf_section_order');
      if (savedSecOrder) {
        try {
          const parsedOrder = JSON.parse(savedSecOrder);
          if (!Array.isArray(parsedOrder) || !canonicalSecs.every(id => parsedOrder.includes(id))) {
            localStorage.removeItem('jf_section_order');
          }
        } catch (e) {
          localStorage.removeItem('jf_section_order');
        }
      }

      restoreSectionOrder();

      const savedText = localStorage.getItem('jf_text_edits');
      if (savedText) {
        const data = JSON.parse(savedText);
        Object.keys(data).forEach(id => {
          const el = document.querySelector(`[data-jf-id="${id}"]`) || document.getElementById(id);
          if (el && data[id]) el.innerHTML = data[id];
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


      // Restore dynamically added custom gallery cards
      const savedCustomCards = localStorage.getItem('jf_custom_cards');
      if (savedCustomCards) {
        try {
          const customList = JSON.parse(savedCustomCards);
          customList.forEach(rec => {
            let target = null;
            if (rec.containerId) target = document.getElementById(rec.containerId);
            if (!target && rec.containerClass) {
              const selector = rec.containerClass === 'bento' ? '.bento-gallery-grid, .bento-grid' :
                               rec.containerClass === 'cat' ? '.cat-showcase-grid' :
                               rec.containerClass === 'act' ? '.act-img-grid' :
                               rec.containerClass === 'velocity' ? '.velocity-track' :
                               rec.containerClass === 'mt' ? '.motion-tiles-grid' :
                               rec.containerClass === 'video' ? '.video-turnstile-grid' : '.cat-showcase-grid';
              const allTargets = document.querySelectorAll(selector);
              target = allTargets[rec.containerIndex || 0] || allTargets[0];
            }
            if (target && !target.querySelector(`[data-card-id="${rec.id}"]`)) {
              const cardNode = createCustomCardElement(rec.id, rec.cardData, rec.containerClass);
              const placeholder = target.querySelector('.jf-add-card-placeholder');
              if (placeholder) target.insertBefore(cardNode, placeholder);
              else target.appendChild(cardNode);
              // Also apply any saved edits on this custom card
              const allCardEdits = JSON.parse(localStorage.getItem('jf_card_edits') || '{}');
              if (allCardEdits[rec.id]) applyCardData(cardNode, allCardEdits[rec.id]);
            }
          });
        } catch (e) {
          console.warn('Error restoring custom cards:', e);
        }
      }

      // Restore Folder Edits
      const savedFolders = localStorage.getItem('jf_folder_edits');
      if (savedFolders) {
        const foldersData = JSON.parse(savedFolders);
        Object.keys(foldersData).forEach(fid => {
          let folderEl = document.querySelector(`[data-folder-id="${fid}"]`);
          if (!folderEl && fid.startsWith('folder-')) {
            const raw = fid.replace('folder-', '');
            folderEl = document.querySelector(`[data-folder="${raw}"]`);
          }
          const data = foldersData[fid];
          if (folderEl && data) {
            const fName = folderEl.querySelector('.folder-name');
            const fCat = folderEl.querySelector('.folder-cat');
            const fTab = folderEl.querySelector('.folder-tab');
            const fBack = folderEl.querySelector('.folder-back');
            const fFront = folderEl.querySelector('.folder-front');
            const h4 = folderEl.querySelector('.folder-caption-info h4');
            const p = folderEl.querySelector('.folder-caption-info p');
            const fp1Img = folderEl.querySelector('.fp-1 img');
            const fp1Title = folderEl.querySelector('.fp-1 .fp-title');
            const fp2Img = folderEl.querySelector('.fp-2 img');
            const fp2Title = folderEl.querySelector('.fp-2 .fp-title');
            const fp3Img = folderEl.querySelector('.fp-3 img');
            const fp3Title = folderEl.querySelector('.fp-3 .fp-title');

            if (fName && data.name) fName.textContent = data.name;
            if (fCat && data.cat) fCat.textContent = data.cat;
            if (data.color) {
              if (fTab) fTab.style.background = data.color;
              if (fBack) fBack.style.background = data.color;
              if (fFront) { fFront.style.background = data.color; fFront.style.filter = 'brightness(0.85)'; }
            }
            if (h4 && data.title) h4.textContent = data.title;
            if (p && data.desc) p.textContent = data.desc;
            if (data.behance) {
              if (data.behance.endsWith('.pdf')) {
                folderEl.setAttribute('data-pdf', data.behance);
                folderEl.removeAttribute('data-behance');
              } else {
                folderEl.setAttribute('data-behance', data.behance);
                folderEl.removeAttribute('data-pdf');
              }
            }
            if (fp1Img && data.img1) fp1Img.src = data.img1;
            if (fp1Title && data.img1Label) fp1Title.textContent = data.img1Label;
            if (fp2Img && data.img2) fp2Img.src = data.img2;
            if (fp2Title && data.img2Label) fp2Title.textContent = data.img2Label;
            if (fp3Img && data.img3) fp3Img.src = data.img3;
            if (fp3Title && data.img3Label) fp3Title.textContent = data.img3Label;
          }
        });
      }

      // Restore Brand Palette
      const savedPalette = localStorage.getItem('jf_palette_colors');
      if (savedPalette) {
        const pal = JSON.parse(savedPalette);
        const chips = document.querySelectorAll('.palette-chips .p-chip');
        const floatDots = document.querySelectorAll('#caseFloatPalette div');
        pal.forEach((hex, i) => {
          if (chips[i]) {
            chips[i].style.setProperty('--c', hex);
            chips[i].setAttribute('title', hex);
          }
          if (floatDots[i]) {
            floatDots[i].style.background = hex;
          }
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


  function createCustomCardElement(cardId, cardData, containerClass) {
    let card;
    if (containerClass === 'video' || cardData.mediaType === 'video' || cardData.videoUrl) {
      card = document.createElement('div');
      card.className = 'video-card-3d';
      card.setAttribute('data-card-id', cardId);
      card.setAttribute('data-video', cardData.videoUrl || '');
      card.setAttribute('data-title', cardData.title || 'Video Showcase');
      card.innerHTML = `
        <div class="jf-card-edit-overlay"><button type="button" class="jf-btn-card-edit" onclick="openCardEditor(this)">✎ Edit</button></div>
        <div class="video-card-thumb">
          <img src="${cardData.videoPoster || 'assets/portfolio_works/aero-1.png'}" alt="${cardData.title}" loading="lazy">
          <div class="video-play-badge">▶</div>
        </div>
        <div class="video-card-meta">
          <span class="video-card-tag">SHOWCASE</span>
          <h4 class="video-card-title">${cardData.title}</h4>
          <p class="video-card-desc">${cardData.desc || ''}</p>
        </div>
      `;
    } else if (containerClass === 'bento') {
      card = document.createElement('div');
      card.className = `bento-cell ${cardData.span || 'bento-span-1x1'}`;
      card.setAttribute('data-card-id', cardId);
      card.setAttribute('data-lightbox', cardData.img || 'assets/portfolio_works/notey-cover.webp');
      card.setAttribute('data-title', cardData.title || 'Bento Showcase');
      if (cardData.behance) card.setAttribute('data-behance', cardData.behance);
      card.innerHTML = `
        <div class="jf-card-edit-overlay"><button type="button" class="jf-btn-card-edit" onclick="openCardEditor(this)">✎ Edit</button></div>
        <img src="${cardData.img || 'assets/portfolio_works/notey-cover.webp'}" alt="${cardData.title}" class="bento-img" loading="lazy" style="object-position:${cardData.focal || 'center'};">
        <div class="bento-overlay">
          <span class="bento-tag">Bento Feature</span>
          <p class="bento-title">${cardData.title}</p>
        </div>
      `;
    } else if (containerClass === 'act') {
      card = document.createElement('div');
      card.className = 'act-img-box';
      card.setAttribute('data-card-id', cardId);
      card.setAttribute('data-lightbox', cardData.img || 'assets/portfolio_works/notey-cover.webp');
      card.setAttribute('data-title', cardData.title || 'Visual Proof');
      card.innerHTML = `
        <div class="jf-card-edit-overlay"><button type="button" class="jf-btn-card-edit" onclick="openCardEditor(this)">✎ Edit</button></div>
        <img src="${cardData.img || 'assets/portfolio_works/notey-cover.webp'}" alt="${cardData.title}" loading="lazy">
        <div class="act-img-caption">${cardData.title} ↗</div>
      `;
    } else if (containerClass === 'velocity') {
      card = document.createElement('div');
      card.className = 'velocity-card';
      card.setAttribute('data-card-id', cardId);
      card.setAttribute('data-lightbox', cardData.img || 'assets/portfolio_works/notey-cover.webp');
      card.innerHTML = `
        <div class="jf-card-edit-overlay"><button type="button" class="jf-btn-card-edit" onclick="openCardEditor(this)">✎ Edit</button></div>
        <img src="${cardData.img || 'assets/portfolio_works/notey-cover.webp'}" alt="${cardData.title}" class="velocity-img" loading="lazy">
        <span class="velocity-badge">${cardData.title}</span>
      `;
    } else if (containerClass === 'mt') {
      card = document.createElement('div');
      card.className = 'mt-card';
      card.setAttribute('data-card-id', cardId);
      card.setAttribute('data-lightbox', cardData.img || 'assets/portfolio_works/notey-cover.webp');
      card.setAttribute('data-title', cardData.title || 'Motion Showcase');
      if (cardData.behance) card.setAttribute('data-behance', cardData.behance);
      card.innerHTML = `
        <div class="jf-card-edit-overlay"><button type="button" class="jf-btn-card-edit" onclick="openCardEditor(this)">✎ Edit</button></div>
        <div class="mt-card-media">
          <img src="${cardData.img || 'assets/portfolio_works/notey-cover.webp'}" alt="${cardData.title}" class="mt-img" loading="lazy">
          <div class="mt-badge-top">
            <span class="mt-tag-brand">${cardData.desc || 'Design'}</span>
          </div>
        </div>
        <div class="mt-card-info">
          <div class="mt-title-row">
            <h3 data-jf-id="${cardId}_title" data-jf-editable="true">${cardData.title}</h3>
            ${cardData.behance ? `<a href="${cardData.behance}" target="_blank" rel="noopener" class="mt-arrow">↗</a>` : '<span class="mt-arrow">↗</span>'}
          </div>
          <p data-jf-id="${cardId}_desc" data-jf-editable="true">${cardData.desc || ''}</p>
        </div>
      `;
    } else {
      card = document.createElement('div');
      card.className = 'cat-img-card';
      card.setAttribute('data-card-id', cardId);
      card.setAttribute('data-lightbox', cardData.img || 'assets/portfolio_works/notey-cover.webp');
      card.setAttribute('data-title', cardData.title || 'Project Showcase');
      if (cardData.behance) card.setAttribute('data-behance', cardData.behance);
      card.innerHTML = `
        <div class="jf-card-edit-overlay"><button type="button" class="jf-btn-card-edit" onclick="openCardEditor(this)">✎ Edit</button></div>
        <img src="${cardData.img || 'assets/portfolio_works/notey-cover.webp'}" alt="${cardData.title}" loading="lazy" style="object-position:${cardData.focal || 'center'};">
        <div class="cat-card-overlay">
          <div class="cat-card-title"><span>${cardData.title}</span><span>↗</span></div>
          <span class="cat-card-tag">${cardData.desc || 'Design Showcase'}</span>
        </div>
      `;
    }
    return card;
  }

  // Open Card Editor (Supports images, videos, avatars, velocity cards, and timeline cards)
  window.openCardEditor = function(btn) {
    activeEditCard = btn.closest('.bento-cell, .mt-card, .cat-img-card, .video-card-3d, .phone-mockup-3d, .laptop-mockup-3d, .gallery-stack-card, .act-img-box, .case-img-wrap, .id-card-frame, .holo-profile-card, .velocity-card');
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

    const imgEl = activeEditCard.querySelector('img') || (activeEditCard.id === 'holoProfileCard' ? document.getElementById('holoAvatarImg') : null);
    const videoEl = activeEditCard.querySelector('video');
    const titleEl = activeEditCard.querySelector('.cat-card-title span, .cat-card-title, .bento-title, h3, h4, .video-card-title, .holo-card-name, .id-card-title, .act-img-caption, .velocity-badge');
    const descEl = activeEditCard.querySelector('.cat-card-tag, .bento-tag, p, .video-card-desc, .holo-card-tag');
    const behanceLink = activeEditCard.getAttribute('data-behance') || (activeEditCard.tagName === 'A' ? activeEditCard.href : '');

    if (ceTitle) ceTitle.value = titleEl ? titleEl.textContent.trim() : '';
    if (ceDesc) ceDesc.value = descEl ? descEl.textContent.trim() : '';

    if (ceImageUrl) ceImageUrl.value = imgEl ? (imgEl.getAttribute('src') || '') : '';
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
    const placeholderEl = (btnPlaceholder && btnPlaceholder.closest) ? (btnPlaceholder.closest('.jf-add-card-placeholder') || btnPlaceholder) : btnPlaceholder;
    activeAddTargetContainer = placeholderEl ? (placeholderEl.closest('.cat-showcase-grid, .bento-gallery-grid, .bento-grid, .act-img-grid, .velocity-track, .motion-tiles-grid, .video-turnstile-grid, .bento-gallery-wrap') || placeholderEl.parentElement) : null;
    activeAddMediaType = defaultMediaType;
    activeEditCard = null;

    if (activeAddTargetContainer) {
      if (activeAddTargetContainer.classList.contains('video-turnstile-grid') || (placeholderEl && placeholderEl.classList.contains('jf-add-video-card'))) {
        activeAddMediaType = 'video';
      } else if (activeAddTargetContainer.classList.contains('motion-tiles-grid') || (placeholderEl && placeholderEl.classList.contains('jf-add-mt-card'))) {
        activeAddMediaType = 'mt-card';
      } else if (activeAddTargetContainer.classList.contains('bento-gallery-grid') || activeAddTargetContainer.classList.contains('bento-grid')) {
        activeAddMediaType = 'bento-cell';
      }
    }

    if (cardHeading) cardHeading.textContent = `Add New ${activeAddMediaType === 'video' ? 'Video Showcase' : (activeAddMediaType === 'mt-card' ? 'Motion Tile' : 'Project Card')}`;
    if (cardDelete) cardDelete.style.display = 'none';

    if (ceMediaType) {
      ceMediaType.value = activeAddMediaType === 'video' ? 'video' : 'image';
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

          const custom = JSON.parse(localStorage.getItem('jf_custom_cards') || '[]');
          const updatedCustom = custom.filter(c => c.id !== cardId);
          localStorage.setItem('jf_custom_cards', JSON.stringify(updatedCustom));
        }
        closeCardModal();
      }
    });
  }

    function applyCardData(card, data) {
    const isVideo = data.mediaType === 'video' || (data.videoUrl && data.videoUrl.length > 0);

    // 1. Update Title across all card types
    const catTitleSpan = card.querySelector('.cat-card-title span:first-child');
    if (catTitleSpan && data.title) {
      catTitleSpan.textContent = data.title;
    } else {
      const titleEl = card.querySelector('.bento-title, h3, h4, .video-card-title, .holo-card-name, .id-card-title, .act-img-caption, .velocity-badge');
      if (titleEl && data.title) titleEl.textContent = data.title;
    }

    // 2. Update Description / Tag across all card types
    const catTag = card.querySelector('.cat-card-tag');
    const bentoTag = card.querySelector('.bento-tag');
    if (catTag && data.desc) {
      catTag.textContent = data.desc;
    } else if (bentoTag && data.desc) {
      bentoTag.textContent = data.desc;
    } else {
      const descEl = card.querySelector('p, .video-card-desc, .holo-card-tag');
      if (descEl && data.desc) descEl.textContent = data.desc;
    }

    if (data.title) card.setAttribute('data-title', data.title);

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
      const imgEl = card.querySelector('img') || (card.id === 'holoProfileCard' ? document.getElementById('holoAvatarImg') : null);
      if (imgEl && data.img) imgEl.src = data.img;
      if (imgEl && data.focal) imgEl.style.objectPosition = data.focal;
    }

    if (data.img) {
      card.setAttribute('data-lightbox', data.img);
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
          title: ceTitle && ceTitle.value.trim() ? ceTitle.value.trim() : 'New Project',
          desc: ceDesc ? ceDesc.value.trim() : '',
          img: isVideo ? (ceVideoPoster ? ceVideoPoster.value.trim() : '') : (mediaSrc || 'assets/portfolio_works/notey-cover.webp'),
          videoUrl: isVideo ? (mediaSrc || 'assets/videos/aero-video.mp4') : '',
          videoPoster: ceVideoPoster && ceVideoPoster.value.trim() ? ceVideoPoster.value.trim() : (isVideo ? 'assets/portfolio_works/aero-1.png' : ''),
          behance: ceBehanceLink ? ceBehanceLink.value.trim() : '',
          span: ceSpanSelect ? ceSpanSelect.value : 'bento-span-1x1',
          focal: ceFocalSelect ? ceFocalSelect.value : 'center'
        };

        if (activeEditCard) {
          // Editing existing card
          const cardId = activeEditCard.getAttribute('data-card-id') || `card-${Date.now()}`;
          activeEditCard.setAttribute('data-card-id', cardId);
          applyCardData(activeEditCard, cardData);

          const saved = JSON.parse(localStorage.getItem('jf_card_edits') || '{}');
          saved[cardId] = cardData;
          localStorage.setItem('jf_card_edits', JSON.stringify(saved));
          showSaveToast('✓ Card Updated Successfully!');
        } else {
          // Fallback container if reference was lost
          if (!activeAddTargetContainer) {
            activeAddTargetContainer = document.querySelector('.cat-showcase-grid.active, .cat-showcase-grid, #grid-branding-showcase');
          }

          if (activeAddTargetContainer) {
            // Creating brand new card
            const newCardId = `card-new-${Date.now()}`;
            const isBento = activeAddTargetContainer.classList.contains('bento-gallery-grid') || activeAddTargetContainer.classList.contains('bento-grid');
            const isCatShowcase = activeAddTargetContainer.classList.contains('cat-showcase-grid');
            const isActImg = activeAddTargetContainer.classList.contains('act-img-grid');
            const isVelocity = activeAddTargetContainer.classList.contains('velocity-track');
            const isMt = activeAddTargetContainer.classList.contains('motion-tiles-grid') || activeAddTargetContainer.id === 'motionTilesGrid';
            const isVideoContainer = activeAddTargetContainer.classList.contains('video-turnstile-grid') || isVideo;

            let containerClass = 'cat';
            if (isVideoContainer) containerClass = 'video';
            else if (isMt) containerClass = 'mt';
            else if (isBento) containerClass = 'bento';
            else if (isActImg) containerClass = 'act';
            else if (isVelocity) containerClass = 'velocity';
            else if (isCatShowcase) containerClass = 'cat';

            const newCard = createCustomCardElement(newCardId, cardData, containerClass);

            // Insert before placeholder button
            const placeholder = activeAddTargetContainer.querySelector('.jf-add-card-placeholder');
            if (placeholder) {
              activeAddTargetContainer.insertBefore(newCard, placeholder);
            } else {
              activeAddTargetContainer.appendChild(newCard);
            }

            // Compute containerIndex among matching containers
            const selectorMap = {
              bento: '.bento-gallery-grid, .bento-grid',
              cat: '.cat-showcase-grid',
              act: '.act-img-grid',
              velocity: '.velocity-track',
              mt: '.motion-tiles-grid',
              video: '.video-turnstile-grid'
            };
            const allMatching = Array.from(document.querySelectorAll(selectorMap[containerClass] || '.cat-showcase-grid'));
            const containerIndex = allMatching.indexOf(activeAddTargetContainer);

            // Save to jf_custom_cards
            const customList = JSON.parse(localStorage.getItem('jf_custom_cards') || '[]');
            customList.push({
              id: newCardId,
              containerId: activeAddTargetContainer.id || null,
              containerClass: containerClass,
              containerIndex: containerIndex >= 0 ? containerIndex : 0,
              cardData: cardData
            });
            localStorage.setItem('jf_custom_cards', JSON.stringify(customList));

            const saved = JSON.parse(localStorage.getItem('jf_card_edits') || '{}');
            saved[newCardId] = cardData;
            localStorage.setItem('jf_card_edits', JSON.stringify(saved));

            showSaveToast('✓ Card Added Successfully!');
          }
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

  // Global Delegated click listener for all "+ Add Image Card" placeholders
  document.addEventListener('click', (e) => {
    const ph = e.target.closest('.jf-add-card-placeholder');
    if (ph) {
      e.preventDefault();
      e.stopPropagation();
      let type = 'image';
      if (ph.classList.contains('jf-add-video-card') || ph.closest('.video-turnstile-grid')) type = 'video';
      else if (ph.classList.contains('jf-add-mt-card') || ph.closest('.motion-tiles-grid')) type = 'mt-card';
      else if (ph.closest('.bento-gallery-grid, .bento-grid')) type = 'bento-cell';
      window.openNewCardDialog(ph, type);
    }
  });

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

  // ==========================================
  // FOLDER EDITOR MODAL HANDLERS
  // ==========================================
  const folderModal = document.getElementById('jfFolderEditorModal');
  const folderForm = document.getElementById('jfFolderEditorForm');
  const btnFolderClose = document.getElementById('btnFolderEditorClose');
  const btnFolderCancel = document.getElementById('btnFolderCancel');
  const btnFolderDelete = document.getElementById('btnFolderDelete');
  const feFolderId = document.getElementById('feFolderId');
  const feFolderName = document.getElementById('feFolderName');
  const feFolderCat = document.getElementById('feFolderCat');
  const feFolderColor = document.getElementById('feFolderColor');
  const feFolderColorHex = document.getElementById('feFolderColorHex');
  const feBehanceLink = document.getElementById('feBehanceLink');
  const feTitle = document.getElementById('feTitle');
  const feDesc = document.getElementById('feDesc');
  const feImg1 = document.getElementById('feImg1');
  const feImg1File = document.getElementById('feImg1File');
  const feImg1Label = document.getElementById('feImg1Label');
  const feImg2 = document.getElementById('feImg2');
  const feImg2File = document.getElementById('feImg2File');
  const feImg2Label = document.getElementById('feImg2Label');
  const feImg3 = document.getElementById('feImg3');
  const feImg3File = document.getElementById('feImg3File');
  const feImg3Label = document.getElementById('feImg3Label');

  let activeEditFolder = null;
  let activeAddFolderRow = null;

  if (feFolderColor && feFolderColorHex) {
    feFolderColor.addEventListener('input', () => { feFolderColorHex.value = feFolderColor.value; });
    feFolderColorHex.addEventListener('input', () => { feFolderColor.value = feFolderColorHex.value; });
  }

  function closeFolderModal() {
    if (folderModal) folderModal.style.display = 'none';
    activeEditFolder = null;
    activeAddFolderRow = null;
  }

  if (btnFolderClose) btnFolderClose.onclick = closeFolderModal;
  if (btnFolderCancel) btnFolderCancel.onclick = closeFolderModal;

  window.openFolderEditor = function(btn) {
    activeEditFolder = btn.closest('.folder-unit');
    if (!activeEditFolder) return;
    activeAddFolderRow = null;

    if (!activeEditFolder.getAttribute('data-folder-id')) {
      const folderKey = activeEditFolder.getAttribute('data-folder');
      activeEditFolder.setAttribute('data-folder-id', folderKey ? `folder-${folderKey}` : `folder-${Date.now()}`);
    }

    const folderId = activeEditFolder.getAttribute('data-folder-id');
    const folderName = activeEditFolder.querySelector('.folder-name');
    const folderCat = activeEditFolder.querySelector('.folder-cat');
    const folderTab = activeEditFolder.querySelector('.folder-tab');
    const behance = activeEditFolder.getAttribute('data-behance') || activeEditFolder.getAttribute('data-pdf') || '';
    const h4 = activeEditFolder.querySelector('.folder-caption-info h4');
    const p = activeEditFolder.querySelector('.folder-caption-info p');

    const fp1Img = activeEditFolder.querySelector('.fp-1 img');
    const fp1Title = activeEditFolder.querySelector('.fp-1 .fp-title');
    const fp2Img = activeEditFolder.querySelector('.fp-2 img');
    const fp2Title = activeEditFolder.querySelector('.fp-2 .fp-title');
    const fp3Img = activeEditFolder.querySelector('.fp-3 img');
    const fp3Title = activeEditFolder.querySelector('.fp-3 .fp-title');

    if (feFolderId) feFolderId.value = folderId;
    if (feFolderName) feFolderName.value = folderName ? folderName.textContent.trim() : '';
    if (feFolderCat) feFolderCat.value = folderCat ? folderCat.textContent.trim() : '';

    const color = folderTab ? (folderTab.style.backgroundColor || folderTab.style.background || '#E8006A') : '#E8006A';
    if (feFolderColor) feFolderColor.value = color.startsWith('#') ? color : '#E8006A';
    if (feFolderColorHex) feFolderColorHex.value = feFolderColor ? feFolderColor.value : '#E8006A';

    if (feBehanceLink) feBehanceLink.value = behance;
    if (feTitle) feTitle.value = h4 ? h4.textContent.trim() : '';
    if (feDesc) feDesc.value = p ? p.textContent.trim() : '';

    if (feImg1) feImg1.value = fp1Img ? fp1Img.getAttribute('src') : '';
    if (feImg1Label) feImg1Label.value = fp1Title ? fp1Title.textContent.trim() : '';
    if (feImg2) feImg2.value = fp2Img ? fp2Img.getAttribute('src') : '';
    if (feImg2Label) feImg2Label.value = fp2Title ? fp2Title.textContent.trim() : '';
    if (feImg3) feImg3.value = fp3Img ? fp3Img.getAttribute('src') : '';
    if (feImg3Label) feImg3Label.value = fp3Title ? fp3Title.textContent.trim() : '';
    if (feImg1File) feImg1File.value = '';
    if (feImg2File) feImg2File.value = '';
    if (feImg3File) feImg3File.value = '';

    const heading = document.getElementById('feModalHeading');
    if (heading) heading.textContent = 'Edit Project Folder';
    if (btnFolderDelete) btnFolderDelete.style.display = 'inline-block';

    if (folderModal) folderModal.style.display = 'flex';
  };

  window.openNewFolderDialog = function(placeholder) {
    activeAddFolderRow = placeholder.closest('.cat-folders-row');
    activeEditFolder = null;

    if (folderForm) folderForm.reset();
    if (feFolderId) feFolderId.value = `folder-${Date.now()}`;
    if (feFolderColor) feFolderColor.value = '#E8006A';
    if (feFolderColorHex) feFolderColorHex.value = '#E8006A';

    const heading = document.getElementById('feModalHeading');
    if (heading) heading.textContent = 'Add New Project Folder';
    if (btnFolderDelete) btnFolderDelete.style.display = 'none';

    if (folderModal) folderModal.style.display = 'flex';
  };

  if (btnFolderDelete) {
    btnFolderDelete.onclick = () => {
      if (activeEditFolder && confirm('Are you sure you want to delete this folder?')) {
        const id = activeEditFolder.getAttribute('data-folder-id');
        activeEditFolder.remove();
        if (id) {
          const saved = JSON.parse(localStorage.getItem('jf_folder_edits') || '{}');
          delete saved[id];
          localStorage.setItem('jf_folder_edits', JSON.stringify(saved));
        }
        closeFolderModal();
      }
    };
  }

  if (folderForm) {
    folderForm.onsubmit = async (e) => {
      e.preventDefault();

      const readFile = (fileInput) => new Promise((resolve) => {
        if (fileInput && fileInput.files && fileInput.files[0]) {
          const reader = new FileReader();
          reader.onload = (re) => resolve(re.target.result);
          reader.readAsDataURL(fileInput.files[0]);
        } else {
          resolve(null);
        }
      });

      const [f1, f2, f3] = await Promise.all([
        readFile(feImg1File),
        readFile(feImg2File),
        readFile(feImg3File)
      ]);

      const origImg1 = activeEditFolder ? activeEditFolder.querySelector('.fp-1 img')?.getAttribute('src') : '';
      const origImg2 = activeEditFolder ? activeEditFolder.querySelector('.fp-2 img')?.getAttribute('src') : '';
      const origImg3 = activeEditFolder ? activeEditFolder.querySelector('.fp-3 img')?.getAttribute('src') : '';

      const img1Src = f1 || (feImg1 ? feImg1.value.trim() : '') || origImg1 || 'assets/portfolio_works/notey-cover.webp';
      const img2Src = f2 || (feImg2 ? feImg2.value.trim() : '') || origImg2 || 'assets/portfolio_works/notey-mockup1.webp';
      const img3Src = f3 || (feImg3 ? feImg3.value.trim() : '') || origImg3 || 'assets/portfolio_works/notey-pkg1.webp';

      const folderData = {
        name: feFolderName ? feFolderName.value.trim() : 'Project Folder',
        cat: feFolderCat ? feFolderCat.value.trim() : 'Brand Identity · 2026',
        color: feFolderColor ? feFolderColor.value : '#E8006A',
        behance: feBehanceLink ? feBehanceLink.value.trim() : '',
        title: feTitle ? feTitle.value.trim() : 'Project Showcase Folder',
        desc: feDesc ? feDesc.value.trim() : 'Custom visual system & presentation assets.',
        img1: img1Src,
        img1Label: feImg1Label ? feImg1Label.value.trim() : 'Preview 1',
        img2: img2Src,
        img2Label: feImg2Label ? feImg2Label.value.trim() : 'Preview 2',
        img3: img3Src,
        img3Label: feImg3Label ? feImg3Label.value.trim() : 'Preview 3'
      };

      const folderId = feFolderId.value || `folder-${Date.now()}`;

      function renderFolderHTML(el, data) {
        el.setAttribute('data-folder-id', folderId);
        if (data.behance) {
          if (data.behance.endsWith('.pdf')) {
            el.setAttribute('data-pdf', data.behance);
            el.removeAttribute('data-behance');
          } else {
            el.setAttribute('data-behance', data.behance);
            el.removeAttribute('data-pdf');
          }
        } else {
          el.removeAttribute('data-behance');
          el.removeAttribute('data-pdf');
        }
        el.setAttribute('data-title', data.title);

        el.innerHTML = `
          <div class="jf-card-edit-overlay"><button type="button" class="jf-btn-card-edit" onclick="openFolderEditor(this)">✎ Edit Folder</button></div>
          <div class="folder-root">
            <div class="folder-tab" style="background:${data.color}"></div>
            <div class="folder-back" style="background:${data.color}"></div>
            <div class="folder-papers">
              <div class="folder-paper fp-1" data-lightbox="${data.img1}"><img src="${data.img1}" alt="${data.img1Label}" class="fp-img"><span class="fp-title">${data.img1Label}</span></div>
              <div class="folder-paper fp-2" data-lightbox="${data.img2}"><img src="${data.img2}" alt="${data.img2Label}" class="fp-img"><span class="fp-title">${data.img2Label}</span></div>
              <div class="folder-paper fp-3" data-lightbox="${data.img3}"><img src="${data.img3}" alt="${data.img3Label}" class="fp-img"><span class="fp-title">${data.img3Label}</span></div>
            </div>
            <div class="folder-front" style="background:${data.color}; filter:brightness(0.85);">
              <div class="folder-label"><span class="folder-name">${data.name}</span><span class="folder-cat">${data.cat}</span></div>
              <span class="folder-hint">Open ↗</span>
            </div>
          </div>
          <div class="folder-caption-info">
            <h4>${data.title}</h4>
            <p>${data.desc}</p>
          </div>
        `;
      }

      if (activeEditFolder) {
        renderFolderHTML(activeEditFolder, folderData);
      } else if (activeAddFolderRow) {
        const newFolder = document.createElement('div');
        newFolder.className = 'folder-unit';
        newFolder.tabIndex = 0;
        renderFolderHTML(newFolder, folderData);
        const placeholder = activeAddFolderRow.querySelector('.jf-add-folder-placeholder');
        if (placeholder) {
          activeAddFolderRow.insertBefore(newFolder, placeholder);
        } else {
          activeAddFolderRow.appendChild(newFolder);
        }
      }

      const saved = JSON.parse(localStorage.getItem('jf_folder_edits') || '{}');
      saved[folderId] = folderData;
      localStorage.setItem('jf_folder_edits', JSON.stringify(saved));

      closeFolderModal();
    };
  }

  // ==========================================
  // FLIPBOOK PAGE EDITOR HANDLERS
  // ==========================================
  const fbeModal = document.getElementById('jfFlipbookEditorModal');
  const fbeModalHeading = document.getElementById('fbeModalHeading');
  const fbePagesList = document.getElementById('fbePagesList');
  const btnFbeClose = document.getElementById('btnFlipbookEditorClose');
  const btnFbeCancel = document.getElementById('btnFbeCancel');
  const btnFbeSave = document.getElementById('btnFbeSave');
  const btnFbeAddPage = document.getElementById('btnFbeAddPage');

  let activeFlipbookType = 'notey';

  function closeFlipbookModal() {
    if (fbeModal) fbeModal.style.display = 'none';
  }

  if (btnFbeClose) btnFbeClose.onclick = closeFlipbookModal;
  if (btnFbeCancel) btnFbeCancel.onclick = closeFlipbookModal;

  window.openFlipbookEditor = function(bookType) {
    activeFlipbookType = bookType;
    const pages = bookType === 'mykitab' ? mykitabPagesData : noteyPagesData;
    const title = bookType === 'mykitab' ? 'MyKitab.pk 12 Notebook Covers' : 'NoteySTUFF Notebook Collection';

    if (fbeModalHeading) fbeModalHeading.textContent = `Manage ${title} Pages (${pages.length})`;
    renderFbePageRows(pages);

    if (fbeModal) fbeModal.style.display = 'flex';
  };

  function renderFbePageRows(pages) {
    if (!fbePagesList) return;
    fbePagesList.innerHTML = '';

    pages.forEach((src, idx) => {
      const row = document.createElement('div');
      row.className = 'fbe-page-row';
      row.innerHTML = `
        <img src="${src}" class="fbe-page-thumb" alt="Page ${idx + 1}" onerror="this.src='assets/portfolio_works/notey-cover.webp'">
        <div class="fbe-page-inputs">
          <input type="text" class="jf-form-input fbe-page-input" value="${src}" placeholder="Image URL">
          <input type="file" accept="image/*" class="fbe-file-input">
        </div>
        <button type="button" class="fbe-btn-del" title="Remove Page">✕</button>
      `;

      const input = row.querySelector('.fbe-page-input');
      const fileInput = row.querySelector('.fbe-file-input');
      const thumb = row.querySelector('.fbe-page-thumb');
      const delBtn = row.querySelector('.fbe-btn-del');

      input.oninput = () => { thumb.src = input.value; };
      fileInput.onchange = () => {
        if (fileInput.files && fileInput.files[0]) {
          const reader = new FileReader();
          reader.onload = (re) => {
            input.value = re.target.result;
            thumb.src = re.target.result;
          };
          reader.readAsDataURL(fileInput.files[0]);
        }
      };

      delBtn.onclick = () => row.remove();
      fbePagesList.appendChild(row);
    });
  }

  if (btnFbeAddPage) {
    btnFbeAddPage.onclick = () => {
      if (!fbePagesList) return;
      const row = document.createElement('div');
      row.className = 'fbe-page-row';
      row.innerHTML = `
        <img src="assets/portfolio_works/notey-cover.webp" class="fbe-page-thumb" alt="New Page">
        <div class="fbe-page-inputs">
          <input type="text" class="jf-form-input fbe-page-input" value="assets/portfolio_works/notey-cover.webp" placeholder="Image URL">
          <input type="file" accept="image/*" class="fbe-file-input">
        </div>
        <button type="button" class="fbe-btn-del" title="Remove Page">✕</button>
      `;
      const input = row.querySelector('.fbe-page-input');
      const fileInput = row.querySelector('.fbe-file-input');
      const thumb = row.querySelector('.fbe-page-thumb');
      const delBtn = row.querySelector('.fbe-btn-del');

      input.oninput = () => { thumb.src = input.value; };
      fileInput.onchange = () => {
        if (fileInput.files && fileInput.files[0]) {
          const reader = new FileReader();
          reader.onload = (re) => {
            input.value = re.target.result;
            thumb.src = re.target.result;
          };
          reader.readAsDataURL(fileInput.files[0]);
        }
      };
      delBtn.onclick = () => row.remove();
      fbePagesList.appendChild(row);
      row.scrollIntoView({ behavior: 'smooth' });
    };
  }

  if (btnFbeSave) {
    btnFbeSave.onclick = () => {
      const inputs = fbePagesList.querySelectorAll('.fbe-page-input');
      const newPages = Array.from(inputs).map(inp => inp.value.trim()).filter(Boolean);

      if (newPages.length === 0) {
        alert('Please keep at least 1 page in the flipbook!');
        return;
      }

      if (activeFlipbookType === 'mykitab') {
        mykitabPagesData = newPages;
        localStorage.setItem('jf_flipbook_mykitab', JSON.stringify(newPages));
        setupSingleFlipbook('mykitab', mykitabPagesData);
      } else {
        noteyPagesData = newPages;
        localStorage.setItem('jf_flipbook_notey', JSON.stringify(newPages));
        setupSingleFlipbook('notey', noteyPagesData);
      }

      closeFlipbookModal();
      alert('🎉 Flipbook pages saved and updated successfully!');
    };
  }

  // ==========================================
  // 360 CAROUSEL SPOTLIGHT PROJECT EDITOR
  // ==========================================
  const c360Modal = document.getElementById('jfC360EditorModal');
  const c360Form = document.getElementById('jfC360Form');
  const btnC360Close = document.getElementById('btnC360Close');
  const btnC360Cancel = document.getElementById('btnC360Cancel');
  const btnC360Delete = document.getElementById('btnC360Delete');
  const c360TitleInput = document.getElementById('c360Title');
  const c360CategoryInput = document.getElementById('c360Category');
  const c360DescInput = document.getElementById('c360Desc');
  const c360ImgInput = document.getElementById('c360Img');
  const c360ImgFileInput = document.getElementById('c360ImgFile');
  const c360LinkInput = document.getElementById('c360Link');
  const c360ModalHeading = document.getElementById('c360ModalHeading');

  let active360EditIdx = -1;

  function closeC360Modal() {
    if (c360Modal) c360Modal.style.display = 'none';
  }

  if (btnC360Close) btnC360Close.onclick = closeC360Modal;
  if (btnC360Cancel) btnC360Cancel.onclick = closeC360Modal;

  window.openC360Editor = function() {
    const counter = document.getElementById('c360CurrentIdx');
    let idx = counter ? (parseInt(counter.textContent, 10) - 1) : 0;
    if (isNaN(idx) || idx < 0 || idx >= c360Data.length) idx = 0;
    active360EditIdx = idx;

    const item = c360Data[idx];
    if (c360ModalHeading) c360ModalHeading.textContent = `Edit 360 Project #${idx + 1}`;
    if (c360TitleInput) c360TitleInput.value = item ? item.title : '';
    if (c360CategoryInput) c360CategoryInput.value = item ? item.category : '';
    if (c360DescInput) c360DescInput.value = item ? item.desc : '';
    if (c360ImgInput) c360ImgInput.value = item ? item.img : '';
    if (c360ImgFileInput) c360ImgFileInput.value = '';
    if (c360LinkInput) c360LinkInput.value = item ? item.link : '';
    if (btnC360Delete) btnC360Delete.style.display = 'inline-block';

    if (c360Modal) c360Modal.style.display = 'flex';
  };

  window.openNew360Dialog = function() {
    active360EditIdx = -1;
    if (c360ModalHeading) c360ModalHeading.textContent = 'Add New 360 Spotlight Project';
    if (c360Form) c360Form.reset();
    if (btnC360Delete) btnC360Delete.style.display = 'none';
    if (c360Modal) c360Modal.style.display = 'flex';
  };

  if (btnC360Delete) {
    btnC360Delete.onclick = () => {
      if (c360Data.length <= 1) {
        alert('You must have at least 1 project in the 360 carousel!');
        return;
      }
      if (confirm('Delete this 360 project?')) {
        c360Data.splice(active360EditIdx, 1);
        localStorage.setItem('jf_c360_data', JSON.stringify(c360Data));
        initCarousel360();
        closeC360Modal();
      }
    };
  }

  if (c360Form) {
    c360Form.onsubmit = (e) => {
      e.preventDefault();

      const executeSave = (imgSrc) => {
        const project = {
          title: c360TitleInput ? c360TitleInput.value.trim() : 'Project',
          category: c360CategoryInput ? c360CategoryInput.value.trim().toUpperCase() : 'DESIGN',
          desc: c360DescInput ? c360DescInput.value.trim() : '',
          img: imgSrc || 'assets/portfolio_works/notey-cover.webp',
          link: c360LinkInput ? c360LinkInput.value.trim() : ''
        };

        if (active360EditIdx >= 0 && active360EditIdx < c360Data.length) {
          c360Data[active360EditIdx] = project;
        } else {
          c360Data.push(project);
        }

        localStorage.setItem('jf_c360_data', JSON.stringify(c360Data));
        initCarousel360();
        closeC360Modal();
        alert('🎉 360 Spotlight Projects updated successfully!');
      };

      if (c360ImgFileInput && c360ImgFileInput.files && c360ImgFileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (re) => executeSave(re.target.result);
        reader.readAsDataURL(c360ImgFileInput.files[0]);
      } else {
        executeSave(c360ImgInput ? c360ImgInput.value.trim() : '');
      }
    };
  }

  // 1-Click Export Live Clean HTML
  if (btnSaveLive) {
    btnSaveLive.addEventListener('click', async () => {
      try {
        const docClone = document.documentElement.cloneNode(true);
        const cloneBody = docClone.querySelector('body') || docClone;
        cloneBody.classList.remove('jf-edit-active');

        // Remove temporary edit attributes and toolbars
        docClone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        docClone.querySelectorAll('.jf-card-edit-overlay').forEach(el => el.remove());
        docClone.querySelectorAll('.jf-section-reorder-bar').forEach(el => el.remove());
        docClone.querySelectorAll('.jf-add-folder-placeholder').forEach(el => el.remove());
        docClone.querySelectorAll('.jf-add-360-btn').forEach(el => el.remove());

        const cloneFab = docClone.querySelector('#jfStudioFab');
        if (cloneFab) cloneFab.style.display = 'none';

        docClone.querySelectorAll('.jf-modal-backdrop').forEach(m => m.style.display = 'none');

        // Clean GSAP inline animation styles so saved HTML is clean and always visible
        docClone.querySelectorAll('[style]').forEach(el => {
          let s = el.getAttribute('style') || '';
          if (s) {
            s = s.replace(/translate:\s*none;?/gi, '')
                 .replace(/rotate:\s*none;?/gi, '')
                 .replace(/scale:\s*none;?/gi, '')
                 .replace(/opacity:\s*0(?:\.\d+)?(?:;|$)/gi, (m) => el.id === 'c360CenterImg' ? m : '')
                 .replace(/transform:\s*translate[^\;]+;?/gi, '')
                 .replace(/transition-delay:[^\;]+;?/gi, '')
                 .trim();
            if (!s) el.removeAttribute('style');
            else el.setAttribute('style', s);
          }
        });
        docClone.querySelectorAll('.reveal').forEach(el => {
          el.classList.add('visible');
        });

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
        folderEdits: JSON.parse(localStorage.getItem('jf_folder_edits') || '{}'),
        customGalleries: JSON.parse(localStorage.getItem('jf_custom_galleries') || '[]'),
        flipbookNotey: JSON.parse(localStorage.getItem('jf_flipbook_notey') || '[]'),
        flipbookMykitab: JSON.parse(localStorage.getItem('jf_flipbook_mykitab') || '[]'),
        c360Data: JSON.parse(localStorage.getItem('jf_c360_data') || '[]'),
        sectionOrder: JSON.parse(localStorage.getItem('jf_section_order') || '[]'),
        paletteColors: JSON.parse(localStorage.getItem('jf_palette_colors') || '[]')
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
        localStorage.removeItem('jf_folder_edits');
        localStorage.removeItem('jf_custom_galleries');
        localStorage.removeItem('jf_flipbook_notey');
        localStorage.removeItem('jf_flipbook_mykitab');
        localStorage.removeItem('jf_c360_data');
        localStorage.removeItem('jf_section_order');
        localStorage.removeItem('jf_palette_colors');
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
