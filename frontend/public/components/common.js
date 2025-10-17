(() => {
  const NAV_BREAKPOINT = window.matchMedia('(max-width: 991px)');

  async function loadComponent(placeholderSelector, url, eventName) {
    const placeholder = document.querySelector(placeholderSelector);
    if (!placeholder) {
      return null;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} while fetching ${url}`);
      }

      const markup = await response.text();
      const temp = document.createElement('div');
      temp.innerHTML = markup.trim();
      const component = temp.firstElementChild;

      if (!component) {
        return null;
      }

      placeholder.replaceWith(component);

      if (eventName) {
        document.dispatchEvent(new CustomEvent(eventName, { detail: component }));
      }

      return component;
    } catch (error) {
      console.error(`[components] 无法加载 ${url}:`, error);
      placeholder.remove();
      return null;
    }
  }

  function initializeNavigation(headerEl) {
    const navToggle = headerEl.querySelector('[data-nav-toggle]');
    const navMenu = headerEl.querySelector('[data-nav-menu]');

    if (!navToggle || !navMenu) {
      return;
    }

    const OPEN_CLASS = 'nav-menu--open';

    const setMenuState = (isOpen) => {
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navMenu.setAttribute('aria-hidden', String(!isOpen));

      if (isOpen) {
        navMenu.classList.add(OPEN_CLASS);
        navMenu.querySelector('a')?.focus();
      } else {
        navMenu.classList.remove(OPEN_CLASS);
      }
    };

    const closeMenu = () => setMenuState(false);

    const syncWithViewport = (mediaQueryList) => {
      if (mediaQueryList.matches) {
        navMenu.setAttribute('aria-hidden', 'true');
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove(OPEN_CLASS);
      } else {
        navMenu.setAttribute('aria-hidden', 'false');
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove(OPEN_CLASS);
      }
    };

    syncWithViewport(NAV_BREAKPOINT);
    NAV_BREAKPOINT.addEventListener('change', syncWithViewport);

    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      setMenuState(!isOpen);
    });

    navToggle.addEventListener('keydown', (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.defaultPrevented) {
        event.preventDefault();
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        setMenuState(!isOpen);
      }
    });

    headerEl.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
          event.preventDefault();
          closeMenu();
          navToggle.focus();
        }
      }
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (NAV_BREAKPOINT.matches) {
          closeMenu();
        }
      });
    });
  }

  function updateFooterYear(footerEl) {
    const yearHolder = footerEl.querySelector('[data-current-year]');
    if (yearHolder) {
      yearHolder.textContent = new Date().getFullYear();
    }
  }

  function initOnScrollHeader(headerEl) {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        headerEl.style.background = 'rgba(26, 26, 46, 0.98)';
      } else {
        headerEl.style.background = 'rgba(26, 26, 46, 0.95)';
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  function setupSmoothScroll(root = document) {
    root.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      if (anchor.dataset.smoothScrollBound === 'true') {
        return;
      }

      anchor.dataset.smoothScrollBound = 'true';
      anchor.addEventListener('click', (event) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') {
          return;
        }

        const target = document.querySelector(targetId);
        if (!target) {
          return;
        }

        event.preventDefault();

        if (anchor.classList.contains('skip-link')) {
          if (!target.hasAttribute('tabindex')) {
            target.setAttribute('tabindex', '-1');
          }

          target.focus({ preventScroll: true });
          target.scrollIntoView({ behavior: 'auto', block: 'start' });
          return;
        }

        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const headerEl = await loadComponent('[data-component="header"]', 'components/header.html', 'component:headerLoaded');
    const footerEl = await loadComponent('[data-component="footer"]', 'components/footer.html', 'component:footerLoaded');

    if (headerEl) {
      initializeNavigation(headerEl);
      initOnScrollHeader(headerEl);
      setupSmoothScroll(headerEl);
    }

    if (footerEl) {
      updateFooterYear(footerEl);
      setupSmoothScroll(footerEl);
    }

    setupSmoothScroll(document);
  });
})();
