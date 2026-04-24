function ensureMeta(attr: 'name' | 'property', key: string, content: string): void {
  const safe = key.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const selector = `meta[${attr}="${safe}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonicalUrl(absoluteUrl: string): void {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = absoluteUrl;
}

export function removeJsonLd(id: string): void {
  document.getElementById(id)?.remove();
}

export function setJsonLd(id: string, data: unknown): void {
  removeJsonLd(id);
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

interface GlobalSeoPayload {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl: string;
  ogImage: string;
  ogType?: string;
  siteName: string;
}

export function applyGlobalDocumentSeo(payload: GlobalSeoPayload): void {
  document.title = payload.title;

  if (payload.description) {
    ensureMeta('name', 'description', payload.description);
  }
  if (payload.keywords) {
    ensureMeta('name', 'keywords', payload.keywords);
  }

  ensureMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

  ensureMeta('property', 'og:site_name', payload.siteName);
  ensureMeta('property', 'og:title', payload.title);
  ensureMeta('property', 'og:description', payload.description || payload.title);
  ensureMeta('property', 'og:url', payload.canonicalUrl);
  ensureMeta('property', 'og:type', payload.ogType || 'website');
  if (payload.ogImage) {
    ensureMeta('property', 'og:image', payload.ogImage);
    ensureMeta('name', 'twitter:card', 'summary_large_image');
    ensureMeta('name', 'twitter:title', payload.title);
    ensureMeta('name', 'twitter:description', payload.description || payload.title);
    ensureMeta('name', 'twitter:image', payload.ogImage);
  } else {
    ensureMeta('name', 'twitter:card', 'summary');
  }

  setCanonicalUrl(payload.canonicalUrl);
}
