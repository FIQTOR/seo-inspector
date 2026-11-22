import { describe, it, expect } from 'vitest';
import { analyzeSeo } from '../src/engine/analyzer';
import { PageRawData } from '../src/types/seo';

const mockBaseData: PageRawData = {
  url: 'https://example.com/blog/test-article',
  extractedAt: new Date().toISOString(),
  meta: {
    title: 'Comprehensive Guide to Modern Technical SEO Best Practices',
    titleLength: 58,
    description: 'Learn how to optimize your website for search engines with our in-depth technical SEO guide, covering meta tags, headers, and schemas.',
    descriptionLength: 135,
    canonicalUrl: 'https://example.com/blog/test-article',
    robots: 'index, follow',
    keywords: 'seo, audit, technical',
    viewport: 'width=device-width, initial-scale=1.0',
    charset: 'UTF-8',
    language: 'en',
    themeColor: '#6366F1'
  },
  headings: {
    items: [
      { level: 1, text: 'Comprehensive Technical SEO Guide', index: 0 },
      { level: 2, text: 'Metadata Optimization', index: 1 },
      { level: 3, text: 'Page Titles and Descriptions', index: 2 },
      { level: 2, text: 'Structured Data and Rich Snippets', index: 3 }
    ],
    h1Count: 1,
    h2Count: 2,
    h3Count: 1,
    h4Count: 0,
    h5Count: 0,
    h6Count: 0,
    missingH1: false,
    multipleH1: false,
    skippedLevels: [],
    emptyHeadings: []
  },
  images: {
    total: 3,
    withAlt: 3,
    missingAlt: 0,
    emptyAlt: 0,
    withoutDimensions: 0,
    altPercentage: 100,
    items: [
      {
        src: 'https://example.com/seo-diagram.webp',
        alt: 'Technical SEO hierarchy diagram',
        hasAlt: true,
        isDecorative: false,
        width: 800,
        height: 600,
        format: 'WEBP',
        hasDimensions: true
      }
    ]
  },
  links: {
    total: 4,
    internalCount: 3,
    externalCount: 1,
    emptyTextCount: 0,
    genericTextCount: 0,
    nofollowCount: 0,
    items: [
      {
        text: 'Core Web Vitals Guide',
        href: 'https://example.com/core-web-vitals',
        isInternal: true,
        rel: [],
        target: null,
        hasNofollow: false,
        hasSponsored: false,
        hasUgc: false,
        isGenericText: false,
        isEmptyText: false
      }
    ]
  },
  social: {
    ogTitle: 'Comprehensive Guide to Modern Technical SEO Best Practices',
    ogDescription: 'In-depth guide to improving your organic ranking and Core Web Vitals.',
    ogImage: 'https://example.com/og-banner.png',
    ogUrl: 'https://example.com/blog/test-article',
    ogType: 'article',
    ogSiteName: 'SEO Insights',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Comprehensive Guide to Modern Technical SEO',
    twitterDescription: 'In-depth guide to technical SEO.',
    twitterImage: 'https://example.com/twitter-banner.png',
    twitterSite: '@seoinsights'
  },
  technical: {
    url: 'https://example.com/blog/test-article',
    origin: 'https://example.com',
    hostname: 'example.com',
    pathname: '/blog/test-article',
    protocol: 'https:',
    isHttps: true,
    canonicalUrl: 'https://example.com/blog/test-article',
    robotsMeta: 'index, follow',
    htmlLang: 'en',
    charset: 'UTF-8',
    doctype: true,
    favicon: '/favicon.ico',
    robotsTxtUrl: 'https://example.com/robots.txt'
  },
  schema: {
    total: 1,
    detectedTypes: ['Article'],
    items: [
      {
        raw: '{"@context":"https://schema.org","@type":"Article","headline":"Technical SEO"}',
        type: 'Article',
        parsed: { '@context': 'https://schema.org', '@type': 'Article', headline: 'Technical SEO' },
        valid: true
      }
    ]
  }
};

describe('SEO Scoring Engine', () => {
  it('calculates a 100/100 score on a fully optimized webpage', () => {
    const audit = analyzeSeo(mockBaseData);
    expect(audit.overallScore).toBe(100);
    expect(audit.counts.critical).toBe(0);
    expect(audit.counts.warning).toBe(0);
    expect(audit.counts.passed).toBeGreaterThan(0);
  });

  it('detects missing metadata and penalizes score accordingly', () => {
    const flawedData: PageRawData = {
      ...mockBaseData,
      meta: {
        ...mockBaseData.meta,
        title: '',
        titleLength: 0,
        description: '',
        descriptionLength: 0
      }
    };

    const audit = analyzeSeo(flawedData);
    expect(audit.overallScore).toBeLessThanOrEqual(87);
    expect(audit.categoryScores.meta.percentage).toBeLessThanOrEqual(50);
    expect(audit.issues.some((i) => i.id === 'meta-title-missing')).toBe(true);
    expect(audit.issues.some((i) => i.id === 'meta-desc-missing')).toBe(true);
    expect(audit.counts.critical).toBeGreaterThanOrEqual(2);
  });

  it('detects multiple H1 elements as a warning without treating as critical bug', () => {
    const dataWithMultipleH1: PageRawData = {
      ...mockBaseData,
      headings: {
        ...mockBaseData.headings,
        h1Count: 3,
        multipleH1: true
      }
    };

    const audit = analyzeSeo(dataWithMultipleH1);
    const issue = audit.issues.find((i) => i.id === 'headings-h1-multiple');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warning');
  });

  it('flags missing image alt tags accurately', () => {
    const dataWithMissingAlts: PageRawData = {
      ...mockBaseData,
      images: {
        ...mockBaseData.images,
        total: 10,
        missingAlt: 6,
        altPercentage: 40
      }
    };

    const audit = analyzeSeo(dataWithMissingAlts);
    const issue = audit.issues.find((i) => i.id === 'images-missing-alt');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('critical');
    expect(audit.categoryScores.images.percentage).toBeLessThan(80);
  });

  it('handles non-HTTPS and noindex pages with critical severity', () => {
    const techIssuesData: PageRawData = {
      ...mockBaseData,
      technical: {
        ...mockBaseData.technical,
        isHttps: false,
        robotsMeta: 'noindex, nofollow'
      }
    };

    const audit = analyzeSeo(techIssuesData);
    expect(audit.issues.some((i) => i.id === 'tech-https-missing')).toBe(true);
    expect(audit.issues.some((i) => i.id === 'tech-noindex-detected')).toBe(true);
  });
});
