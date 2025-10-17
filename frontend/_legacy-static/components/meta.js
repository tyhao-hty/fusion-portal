(() => {
  const defaults = {
    title: '核聚变门户',
    description: '核聚变门户 — 汇聚发展历程、理论知识、前沿技术与商业动态，带你全面了解聚变能源。',
    image: 'assets/og-default.png'
  };

  const metaConfig = Object.assign({}, defaults, window.__PAGE_META__ || {});
  const origin = window.location.origin && window.location.origin !== 'null'
    ? window.location.origin
    : window.location.href.replace(window.location.pathname + window.location.search + window.location.hash, '');
  metaConfig.url = metaConfig.url || (origin ? `${origin}${window.location.pathname}` : window.location.href);
  metaConfig.image = new URL(metaConfig.image, metaConfig.url).href;

  document.title = metaConfig.title;

  const applyFallback = () => {
    ensureMeta('name', 'description', metaConfig.description);
    ensureMeta('property', 'og:title', metaConfig.title);
    ensureMeta('property', 'og:description', metaConfig.description);
    ensureMeta('property', 'og:url', metaConfig.url);
    ensureMeta('property', 'og:image', metaConfig.image);
  };

  function ensureMeta(attrName, attrValue, content) {
    let tag = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attrName, attrValue);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  }

  fetch('components/head.html', { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.text();
    })
    .then((template) => {
      const replacements = {
        '{{TITLE}}': metaConfig.title,
        '{{DESCRIPTION}}': metaConfig.description,
        '{{URL}}': metaConfig.url,
        '{{IMAGE}}': metaConfig.image
      };

      let markup = template;
      Object.entries(replacements).forEach(([token, value]) => {
        const safeValue = String(value || '').replace(/"/g, '&quot;');
        markup = markup.split(token).join(safeValue);
      });

      const fragment = document.createElement('template');
      fragment.innerHTML = markup.trim();
      document.head.appendChild(fragment.content);
    })
    .catch((error) => {
      console.error('[meta] Head injection failed:', error);
      applyFallback();
    });
})();
