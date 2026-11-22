import { 
  PageRawData, 
  ExtractedMetaData, 
  ExtractedHeadingsData, 
  HeadingItem, 
  ExtractedImagesData, 
  ImageItem, 
  ExtractedLinksData, 
  LinkItem, 
  ExtractedSocialData, 
  ExtractedTechnicalData, 
  ExtractedSchemaData, 
  SchemaItem 
} from '../types/seo';

/**
 * Extracts meta tags from the document
 */
export function extractMeta(): ExtractedMetaData {
  const getMeta = (nameOrProperty: string): string | null => {
    const el = document.querySelector(`meta[name="${nameOrProperty}" i], meta[property="${nameOrProperty}" i]`);
    return el ? el.getAttribute('content')?.trim() || null : null;
  };

  const titleEl = document.querySelector('title');
  const title = (titleEl?.textContent || '').trim();

  const canonicalEl = document.querySelector('link[rel="canonical" i]');
  const canonicalUrl = canonicalEl ? canonicalEl.getAttribute('href')?.trim() || null : null;

  const description = getMeta('description') || '';
  const robots = getMeta('robots');
  const keywords = getMeta('keywords');
  const viewport = getMeta('viewport');
  const themeColor = getMeta('theme-color');

  const charsetEl = document.querySelector('meta[charset]');
  const charset = charsetEl?.getAttribute('charset') || document.characterSet || null;
  const language = document.documentElement.getAttribute('lang')?.trim() || null;

  return {
    title,
    titleLength: title.length,
    description,
    descriptionLength: description.length,
    canonicalUrl,
    robots,
    keywords,
    viewport,
    charset,
    language,
    themeColor
  };
}

/**
 * Extracts headings hierarchy and detects skipped levels or empty nodes
 */
export function extractHeadings(): ExtractedHeadingsData {
  const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const items: HeadingItem[] = [];
  const skippedLevels: Array<{ from: number; to: number; text: string }> = [];
  const emptyHeadings: Array<{ level: number; index: number }> = [];

  let h1Count = 0;
  let h2Count = 0;
  let h3Count = 0;
  let h4Count = 0;
  let h5Count = 0;
  let h6Count = 0;

  let previousLevel = 0;

  elements.forEach((el, index) => {
    const tag = el.tagName.toLowerCase();
    const level = parseInt(tag.replace('h', ''), 10);
    const text = (el.textContent || '').trim();

    if (level === 1) h1Count++;
    if (level === 2) h2Count++;
    if (level === 3) h3Count++;
    if (level === 4) h4Count++;
    if (level === 5) h5Count++;
    if (level === 6) h6Count++;

    if (!text) {
      emptyHeadings.push({ level, index });
    }

    // Skipped level detection (e.g., H1 -> H3 without H2)
    if (previousLevel > 0 && level > previousLevel + 1) {
      skippedLevels.push({
        from: previousLevel,
        to: level,
        text: text.slice(0, 50) || '(Empty)'
      });
    }

    previousLevel = level;

    items.push({
      level,
      text,
      index
    });
  });

  return {
    items,
    h1Count,
    h2Count,
    h3Count,
    h4Count,
    h5Count,
    h6Count,
    missingH1: h1Count === 0,
    multipleH1: h1Count > 1,
    skippedLevels,
    emptyHeadings
  };
}

/**
 * Extracts and inspects images
 */
export function extractImages(): ExtractedImagesData {
  const images = Array.from(document.querySelectorAll('img'));
  const items: ImageItem[] = [];

  let withAlt = 0;
  let missingAlt = 0;
  let emptyAlt = 0;
  let withoutDimensions = 0;

  images.forEach((img) => {
    const src = img.getAttribute('src') || img.currentSrc || '';
    const hasAltAttr = img.hasAttribute('alt');
    const altRaw = img.getAttribute('alt');
    const alt = altRaw !== null ? altRaw.trim() : null;
    const isDecorative = (hasAltAttr && alt === '') || img.getAttribute('role') === 'presentation';

    const widthAttr = img.getAttribute('width');
    const heightAttr = img.getAttribute('height');
    const hasDimensions = Boolean(
      (widthAttr && heightAttr) || 
      (img.style.width && img.style.height) || 
      (img.clientWidth > 0 && img.clientHeight > 0)
    );

    if (!hasAltAttr) {
      missingAlt++;
    } else if (alt === '') {
      emptyAlt++;
    } else {
      withAlt++;
    }

    if (!hasDimensions) {
      withoutDimensions++;
    }

    let format: string | null = null;
    const cleanSrc = src.split('?')[0].toLowerCase();
    if (cleanSrc.endsWith('.webp')) format = 'WEBP';
    else if (cleanSrc.endsWith('.svg')) format = 'SVG';
    else if (cleanSrc.endsWith('.avif')) format = 'AVIF';
    else if (cleanSrc.endsWith('.png')) format = 'PNG';
    else if (cleanSrc.endsWith('.jpg') || cleanSrc.endsWith('.jpeg')) format = 'JPEG';
    else if (cleanSrc.endsWith('.gif')) format = 'GIF';

    items.push({
      src: src.slice(0, 300),
      alt,
      hasAlt: hasAltAttr,
      isDecorative,
      width: img.clientWidth || (widthAttr ? parseInt(widthAttr, 10) : 0),
      height: img.clientHeight || (heightAttr ? parseInt(heightAttr, 10) : 0),
      naturalWidth: img.naturalWidth || undefined,
      naturalHeight: img.naturalHeight || undefined,
      loading: img.getAttribute('loading'),
      format,
      hasDimensions
    });
  });

  const total = images.length;
  const altPercentage = total > 0 ? Math.round(((withAlt + emptyAlt) / total) * 100) : 100;

  return {
    total,
    withAlt,
    missingAlt,
    emptyAlt,
    withoutDimensions,
    altPercentage,
    items: items.slice(0, 100) // Keep top 100 images to prevent IPC bloat
  };
}

/**
 * Extracts and inspects anchor links
 */
export function extractLinks(): ExtractedLinksData {
  const anchors = Array.from(document.querySelectorAll('a[href]'));
  const items: LinkItem[] = [];

  const genericTexts = new Set([
    'click here', 'here', 'read more', 'learn more', 'more', 'view more', 
    'link', 'this page', 'continue', 'details', 'klik di sini', 'selengkapnya', 'baca selengkapnya'
  ]);

  let internalCount = 0;
  let externalCount = 0;
  let emptyTextCount = 0;
  let genericTextCount = 0;
  let nofollowCount = 0;

  const currentHost = window.location.hostname;

  anchors.forEach((a) => {
    const rawHref = a.getAttribute('href') || '';
    if (rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || rawHref === '#') {
      return;
    }

    let isInternal = false;
    let fullUrl = rawHref;
    try {
      const parsed = new URL(rawHref, window.location.href);
      fullUrl = parsed.href;
      isInternal = parsed.hostname === currentHost || parsed.hostname === '';
    } catch {
      isInternal = !rawHref.startsWith('http');
    }

    if (isInternal) {
      internalCount++;
    } else {
      externalCount++;
    }

    const text = (a.textContent || '').trim();
    const hasImg = Boolean(a.querySelector('img'));
    const imgAlt = a.querySelector('img')?.getAttribute('alt')?.trim();
    const resolvedText = text || (imgAlt ? `[Image: ${imgAlt}]` : '');

    const isEmptyText = resolvedText.length === 0;
    if (isEmptyText) {
      emptyTextCount++;
    }

    const isGenericText = genericTexts.has(text.toLowerCase());
    if (isGenericText) {
      genericTextCount++;
    }

    const relAttr = (a.getAttribute('rel') || '').toLowerCase().split(/\s+/).filter(Boolean);
    const hasNofollow = relAttr.includes('nofollow');
    const hasSponsored = relAttr.includes('sponsored');
    const hasUgc = relAttr.includes('ugc');

    if (hasNofollow) {
      nofollowCount++;
    }

    items.push({
      text: resolvedText.slice(0, 100) || (hasImg ? '[Image Link]' : '[No Anchor Text]'),
      href: fullUrl.slice(0, 300),
      isInternal,
      rel: relAttr,
      target: a.getAttribute('target'),
      hasNofollow,
      hasSponsored,
      hasUgc,
      isGenericText,
      isEmptyText
    });
  });

  return {
    total: internalCount + externalCount,
    internalCount,
    externalCount,
    emptyTextCount,
    genericTextCount,
    nofollowCount,
    items: items.slice(0, 150) // limit for extension memory efficiency
  };
}

/**
 * Extracts Open Graph & Twitter Social metadata
 */
export function extractSocial(): ExtractedSocialData {
  const getMeta = (property: string): string | null => {
    const el = document.querySelector(`meta[property="${property}" i], meta[name="${property}" i]`);
    return el ? el.getAttribute('content')?.trim() || null : null;
  };

  return {
    ogTitle: getMeta('og:title'),
    ogDescription: getMeta('og:description'),
    ogImage: getMeta('og:image'),
    ogUrl: getMeta('og:url'),
    ogType: getMeta('og:type'),
    ogSiteName: getMeta('og:site_name'),
    twitterCard: getMeta('twitter:card'),
    twitterTitle: getMeta('twitter:title'),
    twitterDescription: getMeta('twitter:description'),
    twitterImage: getMeta('twitter:image'),
    twitterSite: getMeta('twitter:site')
  };
}

/**
 * Extracts Technical SEO signals
 */
export function extractTechnical(): ExtractedTechnicalData {
  const canonicalEl = document.querySelector('link[rel="canonical" i]');
  const robotsMetaEl = document.querySelector('meta[name="robots" i]');
  const charsetEl = document.querySelector('meta[charset]');
  const faviconEl = document.querySelector('link[rel~="icon" i]');

  const origin = window.location.origin;

  return {
    url: window.location.href,
    origin,
    hostname: window.location.hostname,
    pathname: window.location.pathname,
    protocol: window.location.protocol,
    isHttps: window.location.protocol === 'https:',
    canonicalUrl: canonicalEl?.getAttribute('href') || null,
    robotsMeta: robotsMetaEl?.getAttribute('content') || null,
    htmlLang: document.documentElement.getAttribute('lang') || null,
    charset: charsetEl?.getAttribute('charset') || document.characterSet || null,
    doctype: Boolean(document.doctype),
    favicon: faviconEl?.getAttribute('href') || null,
    robotsTxtUrl: `${origin}/robots.txt`
  };
}

/**
 * Extracts JSON-LD Schema structured data
 */
export function extractSchema(): ExtractedSchemaData {
  const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  const items: SchemaItem[] = [];
  const detectedTypesSet = new Set<string>();

  const collectTypes = (obj: unknown) => {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach(collectTypes);
      return;
    }
    const record = obj as Record<string, unknown>;
    if (record['@type']) {
      const t = record['@type'];
      if (typeof t === 'string') detectedTypesSet.add(t);
      else if (Array.isArray(t)) t.forEach((item) => typeof item === 'string' && detectedTypesSet.add(item));
    }
    if (record['@graph'] && Array.isArray(record['@graph'])) {
      record['@graph'].forEach(collectTypes);
    }
  };

  scripts.forEach((script) => {
    const raw = (script.textContent || '').trim();
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      collectTypes(parsed);

      let primaryType: string | string[] = 'Unknown';
      if (parsed['@type']) {
        primaryType = parsed['@type'];
      } else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
        primaryType = parsed['@graph'].map((g: Record<string, unknown>) => String(g['@type'] || 'Item')).join(', ');
      }

      items.push({
        raw,
        type: primaryType,
        parsed,
        valid: true
      });
    } catch (err: unknown) {
      items.push({
        raw,
        type: 'Invalid JSON',
        parsed: null,
        error: err instanceof Error ? err.message : 'JSON Parsing error',
        valid: false
      });
    }
  });

  return {
    total: items.length,
    detectedTypes: Array.from(detectedTypesSet),
    items
  };
}

/**
 * Main coordinator function to gather all raw SEO data from current page
 */
export function extractPageRawData(): PageRawData {
  return {
    url: window.location.href,
    meta: extractMeta(),
    headings: extractHeadings(),
    images: extractImages(),
    links: extractLinks(),
    social: extractSocial(),
    technical: extractTechnical(),
    schema: extractSchema(),
    extractedAt: new Date().toISOString()
  };
}

