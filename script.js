/**
 * TERRE ROSSE WINES — Interaction Layer v2
 * Features: Header scroll, Mega menu, Mobile drawer, Language toggle,
 *           Scroll reveal, Count-up animation, Parallax, Particles, Marquee
 */

'use strict';

/* ============================================================
   LANGUAGE TOGGLE
   ============================================================ */
const Lang = {
  current: 'en',

  init() {
    // Read saved preference
    const saved = localStorage.getItem('tr_lang') || 'en';
    this.set(saved, false);

    // Bind buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.set(btn.dataset.lang);
      });
    });
  },

  set(lang, save = true) {
    this.current = lang;
    document.documentElement.lang = lang;
    document.body.classList.toggle('lang-it', lang === 'it');

    // Update all toggle buttons across the page
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    if (save) localStorage.setItem('tr_lang', lang);
  }
};

/* ============================================================
   HEADER SCROLL
   ============================================================ */
const Header = {
  el: null,
  THRESHOLD: 60,

  init() {
    this.el = document.querySelector('.site-header');
    if (!this.el) return;
    this.el.classList.add('is-transparent');
    this.update();
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => { this.update(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
  },

  update() {
    const scrolled = window.scrollY > this.THRESHOLD;
    this.el.classList.toggle('is-solid', scrolled);
    this.el.classList.toggle('is-transparent', !scrolled);
    // Also update lang toggle colour
    const wrap = document.querySelector('.lang-toggle-wrap');
    if (wrap) wrap.classList.toggle('header-solid', scrolled);
  }
};

/* ============================================================
   MEGA MENU
   ============================================================ */
const MegaMenu = {
  init() {
    const trigger = document.querySelector('.wines-trigger');
    const menu = document.querySelector('.mega-menu');
    if (!trigger || !menu) return;

    let openTimer = null, closeTimer = null;

    const open = () => {
      clearTimeout(closeTimer);
      openTimer = setTimeout(() => {
        menu.classList.add('is-open');
        trigger.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }, 80);
    };

    const close = () => {
      clearTimeout(openTimer);
      closeTimer = setTimeout(() => {
        menu.classList.remove('is-open');
        trigger.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }, 180);
    };

    trigger.addEventListener('mouseenter', open);
    trigger.addEventListener('mouseleave', close);
    menu.addEventListener('mouseenter', () => clearTimeout(closeTimer));
    menu.addEventListener('mouseleave', close);

    trigger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        menu.classList.contains('is-open') ? close() : open();
      }
      if (e.key === 'Escape') close();
    });

    document.addEventListener('click', e => {
      if (!trigger.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('is-open');
        trigger.classList.remove('is-open');
      }
    });
  }
};

/* ============================================================
   MOBILE MENU
   ============================================================ */
const MobileMenu = {
  init() {
    const toggle = document.querySelector('.mobile-toggle');
    const drawer = document.querySelector('.mobile-drawer');
    const overlay = document.querySelector('.mobile-overlay');
    const closeBtn = document.querySelector('.mobile-close');
    if (!toggle || !drawer || !overlay) return;

    const open = () => {
      toggle.classList.add('is-open');
      drawer.classList.add('is-open');
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      toggle.setAttribute('aria-expanded', 'true');
    };

    const close = () => {
      toggle.classList.remove('is-open');
      drawer.classList.remove('is-open');
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => drawer.classList.contains('is-open') ? close() : open());
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) close(); });
  }
};

/* ============================================================
   SCROLL REVEAL — IntersectionObserver
   ============================================================ */
const ScrollReveal = {
  init() {
    const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .wine-entry');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(el => observer.observe(el));
  }
};

/* ============================================================
   COUNT-UP ANIMATION
   ============================================================ */
const CountUp = {
  init() {
    const counters = document.querySelectorAll('.count-up');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = 1600;
        const decimals = String(target).includes('.') ? 1 : 0;
        const startTime = performance.now();

        const step = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = (target * eased).toFixed(decimals);
          el.textContent = prefix + current + suffix;
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }
};

/* ============================================================
   PARALLAX — hero background
   ============================================================ */
const Parallax = {
  init() {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg || window.innerWidth < 768) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          // Move bg at 40% the scroll rate for depth
          heroBg.style.transform = `translateY(${scrolled * 0.38}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
};

/* ============================================================
   FLOATING PARTICLES — hero section
   ============================================================ */
const Particles = {
  init() {
    const container = document.querySelector('.hero-particles');
    if (!container) return;

    const count = 18;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 3 + 1;
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${Math.random() * 12 + 8}s;
        animation-delay: ${Math.random() * 8}s;
        opacity: ${Math.random() * 0.5 + 0.2};
      `;
      container.appendChild(p);
    }
  }
};

/* ============================================================
   MARQUEE — duplicate content for seamless loop
   ============================================================ */
const Marquee = {
  init() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;
    // Duplicate the inner content for seamless looping
    track.innerHTML += track.innerHTML;
  }
};

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const offset = 88;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }
};

/* ============================================================
   ACTIVE NAV LINK
   ============================================================ */
const ActiveNav = {
  init() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const base = href.split('#')[0];
      if (base && (path.endsWith(base) || path.endsWith(base.replace('./', '')))) {
        link.classList.add('active');
      }
    });
  }
};

/* ============================================================
   TASTING NOTE HOVER GLOW
   ============================================================ */
const TastingGlow = {
  init() {
    document.querySelectorAll('.tasting-note').forEach(note => {
      note.addEventListener('mouseenter', () => {
        note.style.transform = 'translateY(-2px)';
        note.style.boxShadow = '0 4px 16px rgba(139,26,46,0.15)';
      });
      note.addEventListener('mouseleave', () => {
        note.style.transform = '';
        note.style.boxShadow = '';
      });
    });
  }
};

/* ============================================================
   PAGE HERO PARALLAX (wine pages)
   ============================================================ */
const PageHeroParallax = {
  init() {
    const bg = document.querySelector('.page-hero-bg');
    if (!bg || window.innerWidth < 768) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          bg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
};

/* ============================================================
   INIT ALL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  Lang.init();
  Header.init();
  MegaMenu.init();
  MobileMenu.init();
  ScrollReveal.init();
  CountUp.init();
  Parallax.init();
  Particles.init();
  Marquee.init();
  SmoothScroll.init();
  ActiveNav.init();
  TastingGlow.init();
  PageHeroParallax.init();
});
