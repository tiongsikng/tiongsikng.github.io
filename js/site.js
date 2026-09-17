(function () {
  const body = document.body;
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const langToggle = document.getElementById('lang-toggle');
  const langMenu = document.getElementById('lang-menu');
  const currentLang = document.getElementById('current-lang');
  const currentFlag = document.getElementById('current-flag');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const heroVisual = document.getElementById('hero-visual');
  const updatedDate = document.getElementById('updated-date');
  let latestCommitDate = null;

  const langData = {
    en: { label: 'EN', flag: 'icons/us.svg', alt: 'English' },
    ko: { label: 'KO', flag: 'icons/kr.svg', alt: 'Korean' },
    ja: { label: 'JA', flag: 'icons/jp.svg', alt: 'Japanese' },
    ch: { label: 'CH', flag: 'icons/cn.svg', alt: 'Chinese' }
  };

  function applyTheme(dark) {
    root.classList.toggle('theme-dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    if (themeIcon) themeIcon.className = dark ? 'fa fa-sun-o' : 'fa fa-moon-o';
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#0d0f12' : '#f6f8fb');
  }

  function formatUpdatedDate(date, lang) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '—';
    const locales = { en: 'en-GB', ko: 'ko-KR', ja: 'ja-JP', ch: 'zh-CN' };
    return new Intl.DateTimeFormat(locales[lang] || locales.en, {
      year: 'numeric',
      month: lang === 'en' ? 'long' : 'numeric',
      day: 'numeric'
    }).format(date);
  }

  function renderUpdatedDate(lang) {
    if (!updatedDate) return;
    const date = latestCommitDate || new Date(document.lastModified);
    updatedDate.textContent = formatUpdatedDate(date, lang);
  }

  async function loadLatestCommitDate() {
    if (!updatedDate) return;
    try {
      const response = await fetch('https://api.github.com/repos/tiongsikng/tiongsikng.github.io/commits?per_page=1', {
        headers: { 'Accept': 'application/vnd.github+json' },
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('GitHub commit request failed');
      const commits = await response.json();
      const stamp = commits?.[0]?.commit?.committer?.date || commits?.[0]?.commit?.author?.date;
      if (stamp) latestCommitDate = new Date(stamp);
    } catch (error) {
      // Fall back to the page's Last-Modified date if GitHub is unavailable/rate-limited.
      latestCommitDate = null;
    }
    const lang = [...body.classList].find(c => c.startsWith('lang-'))?.slice(5) || 'en';
    renderUpdatedDate(lang);
  }

  function setLanguage(lang) {
    if (!langData[lang]) lang = 'en';
    body.classList.remove('lang-en', 'lang-ko', 'lang-ja', 'lang-ch');
    body.classList.add('lang-' + lang);
    document.documentElement.lang = lang === 'ch' ? 'zh' : lang;
    localStorage.setItem('language', lang);
    currentLang.textContent = langData[lang].label;
    currentFlag.src = langData[lang].flag;
    currentFlag.alt = langData[lang].alt;
    updatePlaceholders(lang);
    updateExperienceDates(lang);
  }

  function updatePlaceholders(lang) {
    document.querySelectorAll('[data-placeholder-' + lang + ']').forEach(el => {
      el.placeholder = el.getAttribute('data-placeholder-' + lang);
    });
  }

  function initExperience() {
    const timeline = document.getElementById('experience-timeline');
    if (!timeline) return;
    Array.from(timeline.children).forEach(card => {
      card.classList.add('experience-card');
      if (card.querySelector('.experience-date')) return;
      const date = document.createElement('div');
      date.className = 'experience-date';
      const content = card.querySelector('.employment-content') || card;
      const role = content.querySelector('h4');
      if (role && role.nextSibling) role.parentNode.insertBefore(date, role.nextSibling);
      else if (role) role.parentNode.appendChild(date);
      else content.prepend(date);
    });
  }

  function updateExperienceDates(lang) {
    document.querySelectorAll('#experience-timeline > .experience-card').forEach(card => {
      const date = card.querySelector('.experience-date');
      if (!date) return;
      date.textContent = card.getAttribute('data-date-' + lang) || card.getAttribute('data-date-en') || card.getAttribute('data-date') || '';
    });
  }

  initExperience();
  const storedTheme = localStorage.getItem('theme');
  applyTheme(storedTheme ? storedTheme === 'dark' : true);
  setLanguage(localStorage.getItem('language') || 'en');
  loadLatestCommitDate();
  document.getElementById('current-year').textContent = new Date().getFullYear();

  themeToggle && themeToggle.addEventListener('click', () => applyTheme(!root.classList.contains('theme-dark')));

  langToggle && langToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = langMenu.classList.toggle('open');
    langToggle.setAttribute('aria-expanded', String(open));
  });

  langMenu && langMenu.querySelectorAll('[data-lang]').forEach(item => item.addEventListener('click', () => {
    setLanguage(item.dataset.lang);
    langMenu.classList.remove('open');
    langToggle.setAttribute('aria-expanded', 'false');
  }));

  document.addEventListener('click', () => {
    langMenu && langMenu.classList.remove('open');
    langToggle && langToggle.setAttribute('aria-expanded', 'false');
  });

  menuToggle && menuToggle.addEventListener('click', () => mobileNav.classList.toggle('open'));
  mobileNav && mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = document.querySelector('.site-header')?.offsetHeight || 0;
    const y = target.getBoundingClientRect().top + window.pageYOffset - offset + 1;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }));

  document.getElementById('to-top')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Pointer motion shifts the internal research layers rather than tilting the whole graphic.
  if (heroVisual && window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroVisual.addEventListener('pointermove', (e) => {
      const r = heroVisual.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - .5) * 2;
      const y = ((e.clientY - r.top) / r.height - .5) * 2;
      heroVisual.style.setProperty('--mx', x.toFixed(3));
      heroVisual.style.setProperty('--my', y.toFixed(3));
    });
    heroVisual.addEventListener('pointerleave', () => {
      heroVisual.style.setProperty('--mx', '0');
      heroVisual.style.setProperty('--my', '0');
    });
  }

  // Small entrance transitions add rhythm while remaining unobtrusive.
  const revealTargets = document.querySelectorAll('.research-card, .pub-entry, .project, .teaching-card, .method-card, .experience-card, .education-block');
  revealTargets.forEach(el => el.classList.add('reveal-item'));
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
    revealTargets.forEach(el => observer.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('in-view'));
  }
})();
