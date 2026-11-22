import { 
  PageRawData, 
  AuditResult, 
  AuditIssue, 
  CategoryScore, 
  Category 
} from '../types/seo';

/**
 * Weights per category as defined in specification:
 * Metadata: 20%
 * Headings: 15%
 * Images: 15%
 * Links: 10%
 * Social metadata: 10%
 * Technical SEO: 20%
 * Structured data: 10%
 */
const CATEGORY_WEIGHTS: Record<Category, number> = {
  overview: 0,
  meta: 20,
  headings: 15,
  images: 15,
  links: 10,
  social: 10,
  technical: 20,
  schema: 10
};

export function analyzeSeo(data: PageRawData): AuditResult {
  const issues: AuditIssue[] = [];

  // ==========================================
  // 1. METADATA CHECKS (Weight 20%)
  // ==========================================
  let metaDeductions = 0;

  // Title check
  if (!data.meta.title) {
    issues.push({
      id: 'meta-title-missing',
      category: 'meta',
      title: 'Missing Page Title',
      severity: 'critical',
      scoreImpact: 10,
      explanation: 'The <title> tag is missing or completely empty.',
      whyItMatters: 'Page title is one of the most critical on-page ranking factors and serves as the primary headline in SERPs.',
      suggestedSolution: 'Add a descriptive and compelling <title> tag between 30 and 60 characters inside the <head> element.',
      relevantElement: '<title>'
    });
    metaDeductions += 10;
  } else if (data.meta.titleLength < 20) {
    issues.push({
      id: 'meta-title-short',
      category: 'meta',
      title: 'Title Tag is Too Short',
      severity: 'warning',
      scoreImpact: 3,
      explanation: `Title has only ${data.meta.titleLength} characters. It may not provide enough context to search engines or users.`,
      whyItMatters: 'Short titles miss out on valuable keyword opportunities and may reduce click-through rate.',
      suggestedSolution: 'Expand title to 30–60 characters to better describe page content.',
      relevantElement: `<title>${data.meta.title}</title>`
    });
    metaDeductions += 3;
  } else if (data.meta.titleLength > 65) {
    issues.push({
      id: 'meta-title-long',
      category: 'meta',
      title: 'Title Tag May Truncate in SERPs',
      severity: 'warning',
      scoreImpact: 2,
      explanation: `Title has ${data.meta.titleLength} characters. Google typically truncates titles over ~60 characters (~600px).`,
      whyItMatters: 'Truncated titles look messy and can cut off branding or important call-to-actions.',
      suggestedSolution: 'Condense title to under 60 characters while keeping the most critical keyword near the front.',
      relevantElement: `<title>${data.meta.title}</title>`
    });
    metaDeductions += 2;
  } else {
    issues.push({
      id: 'meta-title-passed',
      category: 'meta',
      title: 'Optimal Title Tag Length',
      severity: 'passed',
      scoreImpact: 0,
      explanation: `Title tag has an optimal length of ${data.meta.titleLength} characters: "${data.meta.title}".`,
      whyItMatters: 'Properly formatted titles display clearly in search engine results without truncation.',
      suggestedSolution: 'Keep title aligned with search intent.',
      relevantElement: `<title>${data.meta.title}</title>`
    });
  }

  // Meta description check
  if (!data.meta.description) {
    issues.push({
      id: 'meta-desc-missing',
      category: 'meta',
      title: 'Missing Meta Description',
      severity: 'critical',
      scoreImpact: 6,
      explanation: 'No meta description tag was found on this webpage.',
      whyItMatters: 'Search engines use meta descriptions as snippets in search results to inform searchers about your page and encourage clicks.',
      suggestedSolution: 'Add a <meta name="description" content="..."> summarizing the page content in 120–160 characters.',
      relevantElement: '<meta name="description">'
    });
    metaDeductions += 6;
  } else if (data.meta.descriptionLength < 50) {
    issues.push({
      id: 'meta-desc-short',
      category: 'meta',
      title: 'Meta Description is Too Short',
      severity: 'warning',
      scoreImpact: 2,
      explanation: `Meta description is only ${data.meta.descriptionLength} characters. Recommended length is 120–160 characters.`,
      whyItMatters: 'Short descriptions may not persuade searchers or trigger search engine auto-generation from page text.',
      suggestedSolution: 'Elaborate on the page proposition and include a clear call-to-action.',
      relevantElement: `<meta name="description" content="${data.meta.description}">`
    });
    metaDeductions += 2;
  } else if (data.meta.descriptionLength > 165) {
    issues.push({
      id: 'meta-desc-long',
      category: 'meta',
      title: 'Meta Description Exceeds Typical SERP Limit',
      severity: 'warning',
      scoreImpact: 2,
      explanation: `Meta description is ${data.meta.descriptionLength} characters and may be truncated on mobile and desktop search results.`,
      whyItMatters: 'Truncated snippets can hide important selling points from users browsing search results.',
      suggestedSolution: 'Aim for 120–160 characters to ensure the full message is visible.',
      relevantElement: `<meta name="description" content="${data.meta.description}">`
    });
    metaDeductions += 2;
  } else {
    issues.push({
      id: 'meta-desc-passed',
      category: 'meta',
      title: 'Optimal Meta Description',
      severity: 'passed',
      scoreImpact: 0,
      explanation: `Meta description is properly set (${data.meta.descriptionLength} characters).`,
      whyItMatters: 'Good descriptions improve organic click-through rates (CTR).',
      suggestedSolution: 'Regularly monitor CTR in Google Search Console.',
      relevantElement: `<meta name="description" content="${data.meta.description}">`
    });
  }

  // Canonical tag check
  if (!data.meta.canonicalUrl) {
    issues.push({
      id: 'meta-canonical-missing',
      category: 'meta',
      title: 'Missing Canonical Link',
      severity: 'warning',
      scoreImpact: 3,
      explanation: 'No canonical URL (<link rel="canonical">) was detected.',
      whyItMatters: 'Canonical URLs prevent duplicate content issues when a page is accessible via different parameters or protocols.',
      suggestedSolution: 'Add a self-referential canonical URL tag in the <head> element.',
      relevantElement: '<link rel="canonical" href="..."> missing'
    });
    metaDeductions += 3;
  } else {
    issues.push({
      id: 'meta-canonical-passed',
      category: 'meta',
      title: 'Canonical URL Specified',
      severity: 'passed',
      scoreImpact: 0,
      explanation: `Canonical URL is set to "${data.meta.canonicalUrl}".`,
      whyItMatters: 'Helps search engines understand the authoritative version of the page.',
      suggestedSolution: 'Ensure canonical link matches the target protocol and URL scheme.',
      relevantElement: `<link rel="canonical" href="${data.meta.canonicalUrl}">`
    });
  }

  // Viewport check
  if (!data.meta.viewport) {
    issues.push({
      id: 'meta-viewport-missing',
      category: 'meta',
      title: 'Missing Viewport Meta Tag',
      severity: 'critical',
      scoreImpact: 4,
      explanation: 'No viewport meta tag found. The page may not render correctly on mobile devices.',
      whyItMatters: 'Mobile-friendliness is a core Google ranking factor.',
      suggestedSolution: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> in the <head>.',
      relevantElement: '<meta name="viewport">'
    });
    metaDeductions += 4;
  } else {
    issues.push({
      id: 'meta-viewport-passed',
      category: 'meta',
      title: 'Mobile Viewport Configured',
      severity: 'passed',
      scoreImpact: 0,
      explanation: `Viewport tag configured: "${data.meta.viewport}".`,
      whyItMatters: 'Ensures proper mobile scaling and mobile-first indexing compliance.',
      suggestedSolution: 'Maintain standard responsive viewport properties.',
      relevantElement: `<meta name="viewport" content="${data.meta.viewport}">`
    });
  }

  // Language attribute
  if (!data.meta.language) {
    issues.push({
      id: 'meta-lang-missing',
      category: 'meta',
      title: 'Missing HTML lang Attribute',
      severity: 'warning',
      scoreImpact: 2,
      explanation: 'The <html> tag does not have a "lang" attribute specified.',
      whyItMatters: 'Language tags help search engines and screen readers identify the primary language of the content.',
      suggestedSolution: 'Add a valid lang attribute to <html>, e.g., <html lang="en">.',
      relevantElement: '<html lang="..."> missing'
    });
    metaDeductions += 2;
  } else {
    issues.push({
      id: 'meta-lang-passed',
      category: 'meta',
      title: 'HTML Language Specified',
      severity: 'passed',
      scoreImpact: 0,
      explanation: `Document language set to "${data.meta.language}".`,
      whyItMatters: 'Facilitates proper geo-targeting and international indexing.',
      suggestedSolution: 'Keep language code conforming to IETF BCP 47.',
      relevantElement: `<html lang="${data.meta.language}">`
    });
  }

  // Charset check
  if (!data.meta.charset) {
    issues.push({
      id: 'meta-charset-missing',
      category: 'meta',
      title: 'Missing Character Encoding (Charset)',
      severity: 'warning',
      scoreImpact: 1,
      explanation: 'No charset meta tag detected in the document head.',
      whyItMatters: 'Without charset definition, browsers and crawlers may misinterpret special characters and content.',
      suggestedSolution: 'Add <meta charset="UTF-8"> as early as possible in <head>.',
      relevantElement: '<meta charset="UTF-8">'
    });
    metaDeductions += 1;
  } else {
    issues.push({
      id: 'meta-charset-passed',
      category: 'meta',
      title: 'Character Encoding Configured',
      severity: 'passed',
      scoreImpact: 0,
      explanation: `Charset configured as "${data.meta.charset}".`,
      whyItMatters: 'Guarantees uniform text and symbol rendering across all browsers.',
      suggestedSolution: 'UTF-8 is recommended for modern web standards.',
      relevantElement: `<meta charset="${data.meta.charset}">`
    });
  }

  const metaFinalScore = Math.max(0, 100 - (metaDeductions * 4));

  // ==========================================
  // 2. HEADINGS CHECKS (Weight 15%)
  // ==========================================
  let headingDeductions = 0;

  if (data.headings.missingH1) {
    issues.push({
      id: 'headings-h1-missing',
      category: 'headings',
      title: 'Missing H1 Heading',
      severity: 'critical',
      scoreImpact: 8,
      explanation: 'No <h1> heading element was found on this page.',
      whyItMatters: 'The H1 tag communicates the primary topic of the page to both users and search engines.',
      suggestedSolution: 'Add a single descriptive <h1> tag that reflects the primary subject matter of the page.',
      relevantElement: '<h1> tag not found'
    });
    headingDeductions += 8;
  } else if (data.headings.multipleH1) {
    issues.push({
      id: 'headings-h1-multiple',
      category: 'headings',
      title: 'Multiple H1 Headings Detected',
      severity: 'warning',
      scoreImpact: 3,
      explanation: `Page contains ${data.headings.h1Count} H1 tags. While HTML5 permits multiple H1s, best practice favors one primary H1 for clarity.`,
      whyItMatters: 'Multiple H1s can dilute topical focus or confuse document outline for assistive technologies.',
      suggestedSolution: 'Retain the most prominent heading as H1 and convert secondary section headers to H2.',
      relevantElement: `Found ${data.headings.h1Count} <h1> elements`
    });
    headingDeductions += 3;
  } else {
    issues.push({
      id: 'headings-h1-passed',
      category: 'headings',
      title: 'Exactly One H1 Present',
      severity: 'passed',
      scoreImpact: 0,
      explanation: `The page contains exactly 1 H1 heading: "${data.headings.items.find(h => h.level === 1)?.text || 'H1'}"`,
      whyItMatters: 'Clear hierarchy helps search engine bots map the document outline.',
      suggestedSolution: 'Maintain alignment between H1 and page title.',
      relevantElement: '<h1>'
    });
  }

  if (data.headings.skippedLevels.length > 0) {
    issues.push({
      id: 'headings-skipped-levels',
      category: 'headings',
      title: 'Skipped Heading Levels Found',
      severity: 'warning',
      scoreImpact: 4,
      explanation: `Heading hierarchy jumps abruptly (e.g. H${data.headings.skippedLevels[0].from} directly to H${data.headings.skippedLevels[0].to}). Total instances: ${data.headings.skippedLevels.length}.`,
      whyItMatters: 'Skipped levels violate accessibility standards (WCAG) and create an irregular document structure.',
      suggestedSolution: 'Ensure heading levels increase sequentially (e.g., H1 -> H2 -> H3).',
      relevantElement: `Jump from H${data.headings.skippedLevels[0].from} to H${data.headings.skippedLevels[0].to}`
    });
    headingDeductions += 4;
  } else if (data.headings.items.length > 0) {
    issues.push({
      id: 'headings-order-passed',
      category: 'headings',
      title: 'Sequential Heading Hierarchy',
      severity: 'passed',
      scoreImpact: 0,
      explanation: 'No skipped heading levels detected in the DOM outline.',
      whyItMatters: 'Logical structure enhances reader comprehension and screen reader navigation.',
      suggestedSolution: 'Keep sub-sections organized logically under parent headers.',
      relevantElement: 'DOM outline'
    });
  }

  if (data.headings.emptyHeadings.length > 0) {
    issues.push({
      id: 'headings-empty',
      category: 'headings',
      title: 'Empty Heading Tags Present',
      severity: 'warning',
      scoreImpact: 2,
      explanation: `Found ${data.headings.emptyHeadings.length} heading tag(s) with no textual content.`,
      whyItMatters: 'Empty heading tags pollute the DOM without providing SEO or accessibility value.',
      suggestedSolution: 'Remove empty heading tags or provide meaningful text.',
      relevantElement: `<h${data.headings.emptyHeadings[0].level}>`
    });
    headingDeductions += 2;
  }

  const headingsFinalScore = Math.max(0, 100 - (headingDeductions * 6));

  // ==========================================
  // 3. IMAGES CHECKS (Weight 15%)
  // ==========================================
  let imageDeductions = 0;

  if (data.images.total === 0) {
    issues.push({
      id: 'images-none',
      category: 'images',
      title: 'No Images on Page',
      severity: 'passed',
      scoreImpact: 0,
      explanation: 'Page has no <img> elements. No image optimization issues found.',
      whyItMatters: 'Images can aid engagement, but text-only pages have no image penalties.',
      suggestedSolution: 'Consider adding relevant visual content with descriptive alt text when appropriate.'
    });
  } else {
    if (data.images.missingAlt > 0) {
      const severity = data.images.missingAlt > 5 ? 'critical' : 'warning';
      issues.push({
        id: 'images-missing-alt',
        category: 'images',
        title: `${data.images.missingAlt} Image(s) Missing Alt Attribute`,
        severity,
        scoreImpact: severity === 'critical' ? 7 : 4,
        explanation: `${data.images.missingAlt} of ${data.images.total} images do not have an "alt" attribute at all.`,
        whyItMatters: 'Search engines rely on alt text to understand image context. It is also required for screen-reader accessibility.',
        suggestedSolution: 'Add descriptive alt text to informative images, or alt="" if strictly decorative.',
        relevantElement: data.images.items.find(i => !i.hasAlt)?.src || 'img'
      });
      imageDeductions += (severity === 'critical' ? 7 : 4);
    } else {
      issues.push({
        id: 'images-alt-passed',
        category: 'images',
        title: 'All Images Have Alt Attributes',
        severity: 'passed',
        scoreImpact: 0,
        explanation: `100% of the ${data.images.total} images on the page have an alt attribute defined.`,
        whyItMatters: 'Maximizes image search ranking potential and accessibility compliance.',
        suggestedSolution: 'Ensure alt descriptions remain accurate and avoid keyword stuffing.',
        relevantElement: '<img>'
      });
    }

    if (data.images.withoutDimensions > 0) {
      issues.push({
        id: 'images-dimensions-missing',
        category: 'images',
        title: `${data.images.withoutDimensions} Image(s) Without Explicit Dimensions`,
        severity: 'warning',
        scoreImpact: 3,
        explanation: 'Images without explicit width and height attributes can trigger Cumulative Layout Shift (CLS).',
        whyItMatters: 'CLS is an official Core Web Vitals ranking factor that degrades page user experience.',
        suggestedSolution: 'Specify width and height attributes or CSS aspect-ratio on all <img> tags.',
        relevantElement: data.images.items.find(i => !i.hasDimensions)?.src || 'img'
      });
      imageDeductions += 3;
    }
  }

  const imagesFinalScore = Math.max(0, 100 - (imageDeductions * 7));

  // ==========================================
  // 4. LINKS CHECKS (Weight 10%)
  // ==========================================
  let linksDeductions = 0;

  if (data.links.total === 0) {
    issues.push({
      id: 'links-none',
      category: 'links',
      title: 'No Hyperlinks Found',
      severity: 'warning',
      scoreImpact: 5,
      explanation: 'No links detected on this page.',
      whyItMatters: 'Internal links are crucial for search bot crawling and PageRank distribution.',
      suggestedSolution: 'Provide navigational links and contextual internal links.',
      relevantElement: '<a>'
    });
    linksDeductions += 5;
  } else {
    if (data.links.emptyTextCount > 0) {
      issues.push({
        id: 'links-empty-text',
        category: 'links',
        title: `${data.links.emptyTextCount} Link(s) with Empty Anchor Text`,
        severity: 'warning',
        scoreImpact: 3,
        explanation: 'Links without text or aria-label give no context to search engines or assistive tech.',
        whyItMatters: 'Anchor text passes crucial contextual relevance to destination pages.',
        suggestedSolution: 'Ensure every link has visible text, an img alt, or an aria-label attribute.',
        relevantElement: data.links.items.find(l => l.isEmptyText)?.href || '<a>'
      });
      linksDeductions += 3;
    }

    if (data.links.genericTextCount > 0) {
      issues.push({
        id: 'links-generic-text',
        category: 'links',
        title: `${data.links.genericTextCount} Link(s) with Generic Anchor Text`,
        severity: 'warning',
        scoreImpact: 2,
        explanation: 'Found generic phrases such as "click here", "read more", or "learn more".',
        whyItMatters: 'Generic anchor text wastes opportunity to establish topical keywords for target URLs.',
        suggestedSolution: 'Replace generic phrases with keyword-rich descriptions of the destination page.',
        relevantElement: data.links.items.find(l => l.isGenericText)?.text || '<a>'
      });
      linksDeductions += 2;
    }

    if (data.links.emptyTextCount === 0 && data.links.genericTextCount === 0) {
      issues.push({
        id: 'links-quality-passed',
        category: 'links',
        title: 'Descriptive Anchor Text Throughout',
        severity: 'passed',
        scoreImpact: 0,
        explanation: `All ${data.links.total} detected links use descriptive anchor text.`,
        whyItMatters: 'Strengthens internal link equity and topical authority.',
        suggestedSolution: 'Keep link structure natural and relevant to context.'
      });
    }
  }

  const linksFinalScore = Math.max(0, 100 - (linksDeductions * 10));

  // ==========================================
  // 5. SOCIAL METADATA CHECKS (Weight 10%)
  // ==========================================
  let socialDeductions = 0;

  if (!data.social.ogTitle || !data.social.ogDescription || !data.social.ogImage) {
    const missingItems: string[] = [];
    if (!data.social.ogTitle) missingItems.push('og:title');
    if (!data.social.ogDescription) missingItems.push('og:description');
    if (!data.social.ogImage) missingItems.push('og:image');

    issues.push({
      id: 'social-og-incomplete',
      category: 'social',
      title: `Incomplete Open Graph Metadata (${missingItems.join(', ')})`,
      severity: 'warning',
      scoreImpact: 5,
      explanation: `Missing key Open Graph tags: ${missingItems.join(', ')}.`,
      whyItMatters: 'Open Graph tags control how content renders when shared on Facebook, LinkedIn, WhatsApp, and Slack.',
      suggestedSolution: 'Add full Open Graph tags including title, description, and a 1200x630px preview image.',
      relevantElement: '<meta property="og:..." >'
    });
    socialDeductions += 5;
  } else {
    issues.push({
      id: 'social-og-passed',
      category: 'social',
      title: 'Complete Open Graph Tags Configured',
      severity: 'passed',
      scoreImpact: 0,
      explanation: 'og:title, og:description, and og:image are all defined.',
      whyItMatters: 'Ensures rich cards on social networks and messaging platforms.',
      suggestedSolution: 'Check image resolution meets recommended 1.91:1 ratio.',
      relevantElement: `<meta property="og:title" content="${data.social.ogTitle}">`
    });
  }

  if (!data.social.twitterCard) {
    issues.push({
      id: 'social-twitter-missing',
      category: 'social',
      title: 'Missing Twitter / X Card Meta Tag',
      severity: 'warning',
      scoreImpact: 3,
      explanation: 'No twitter:card meta tag was found on this page.',
      whyItMatters: 'Twitter Cards provide visual previews on X / Twitter, improving social engagement.',
      suggestedSolution: 'Add <meta name="twitter:card" content="summary_large_image">.',
      relevantElement: '<meta name="twitter:card">'
    });
    socialDeductions += 3;
  } else {
    issues.push({
      id: 'social-twitter-passed',
      category: 'social',
      title: 'Twitter Card Configured',
      severity: 'passed',
      scoreImpact: 0,
      explanation: `Twitter card format set to "${data.social.twitterCard}".`,
      whyItMatters: 'Enables high-converting card previews on Twitter / X.',
      suggestedSolution: 'Verify image dimensions adhere to Twitter specs.',
      relevantElement: `<meta name="twitter:card" content="${data.social.twitterCard}">`
    });
  }

  const socialFinalScore = Math.max(0, 100 - (socialDeductions * 10));

  // ==========================================
  // 6. TECHNICAL SEO CHECKS (Weight 20%)
  // ==========================================
  let techDeductions = 0;

  if (!data.technical.isHttps) {
    issues.push({
      id: 'tech-https-missing',
      category: 'technical',
      title: 'Website Not Using HTTPS Protocol',
      severity: 'critical',
      scoreImpact: 10,
      explanation: 'The current page is served over unencrypted HTTP protocol.',
      whyItMatters: 'HTTPS is an established Google ranking signal and essential for user security.',
      suggestedSolution: 'Install an SSL/TLS certificate and enforce 301 redirects from HTTP to HTTPS.',
      relevantElement: data.technical.url
    });
    techDeductions += 10;
  } else {
    issues.push({
      id: 'tech-https-passed',
      category: 'technical',
      title: 'Secure HTTPS Protocol Active',
      severity: 'passed',
      scoreImpact: 0,
      explanation: 'Page is served securely over HTTPS.',
      whyItMatters: 'Guarantees user security and fulfills Google HTTPS security benchmark.',
      suggestedSolution: 'Keep SSL certificate renewed and HSTS header enabled.'
    });
  }

  if (data.technical.robotsMeta && data.technical.robotsMeta.toLowerCase().includes('noindex')) {
    issues.push({
      id: 'tech-noindex-detected',
      category: 'technical',
      title: 'Page Has "noindex" Directive',
      severity: 'critical',
      scoreImpact: 8,
      explanation: `Robots meta tag explicitly instructs search engines not to index this page: "${data.technical.robotsMeta}".`,
      whyItMatters: 'Pages with "noindex" will NOT appear in Google search results.',
      suggestedSolution: 'If this page is meant for public search indexing, remove the "noindex" directive immediately.',
      relevantElement: `<meta name="robots" content="${data.technical.robotsMeta}">`
    });
    techDeductions += 8;
  } else {
    issues.push({
      id: 'tech-indexable-passed',
      category: 'technical',
      title: 'Page Allows Search Indexing',
      severity: 'passed',
      scoreImpact: 0,
      explanation: 'No "noindex" directives detected in HTML meta robots.',
      whyItMatters: 'Search engine crawlers are allowed to crawl and index this document.',
      suggestedSolution: 'Regularly monitor coverage status in Search Console.'
    });
  }

  if (!data.technical.doctype) {
    issues.push({
      id: 'tech-doctype-missing',
      category: 'technical',
      title: 'Missing HTML5 Doctype',
      severity: 'warning',
      scoreImpact: 2,
      explanation: 'No <!DOCTYPE html> declaration found.',
      whyItMatters: 'Can cause browsers to render in Quirks Mode, leading to inconsistent styling and layout bugs.',
      suggestedSolution: 'Add <!DOCTYPE html> at the very top of your HTML document.'
    });
    techDeductions += 2;
  }

  const techFinalScore = Math.max(0, 100 - (techDeductions * 5));

  // ==========================================
  // 7. STRUCTURED DATA / SCHEMA (Weight 10%)
  // ==========================================
  let schemaDeductions = 0;

  if (data.schema.total === 0) {
    issues.push({
      id: 'schema-none-detected',
      category: 'schema',
      title: 'No JSON-LD Structured Data Detected',
      severity: 'warning',
      scoreImpact: 6,
      explanation: 'No JSON-LD (<script type="application/ld+json">) structured data blocks were found.',
      whyItMatters: 'Schema markup helps search engines understand entities and qualifies pages for Rich Results in SERPs.',
      suggestedSolution: 'Implement relevant Schema.org markup (such as Article, Organization, Product, BreadcrumbList, or WebSite).',
      relevantElement: '<script type="application/ld+json">'
    });
    schemaDeductions += 6;
  } else {
    const invalidItems = data.schema.items.filter(s => !s.valid);
    if (invalidItems.length > 0) {
      issues.push({
        id: 'schema-invalid-json',
        category: 'schema',
        title: `${invalidItems.length} Structured Data Block(s) Have Syntax Errors`,
        severity: 'critical',
        scoreImpact: 7,
        explanation: 'One or more JSON-LD scripts could not be parsed due to invalid JSON syntax.',
        whyItMatters: 'Search engines will completely ignore malformed structured data scripts.',
        suggestedSolution: 'Validate your JSON syntax and fix trailing commas, unescaped quotes, or unmatched brackets.',
        relevantElement: invalidItems[0].raw.slice(0, 100)
      });
      schemaDeductions += 7;
    } else {
      issues.push({
        id: 'schema-detected-passed',
        category: 'schema',
        title: `Valid JSON-LD Schema Detected (${data.schema.detectedTypes.join(', ') || 'Custom'})`,
        severity: 'passed',
        scoreImpact: 0,
        explanation: `Found ${data.schema.total} valid structured data block(s). Detected types: ${data.schema.detectedTypes.join(', ') || 'Standard Schema'}.`,
        whyItMatters: 'Enables rich snippet features and assists Google Knowledge Graph entity mapping.',
        suggestedSolution: 'Test regularly with Google Rich Results Test tool for schema field recommendations.'
      });
    }
  }

  const schemaFinalScore = Math.max(0, 100 - (schemaDeductions * 10));

  // ==========================================
  // OVERALL WEIGHTED CALCULATION
  // ==========================================
  const categoryScores: Record<Category, CategoryScore> = {
    overview: { category: 'overview', score: 0, maxScore: 100, percentage: 0, weight: 0 },
    meta: { category: 'meta', score: metaFinalScore, maxScore: 100, percentage: metaFinalScore, weight: CATEGORY_WEIGHTS.meta },
    headings: { category: 'headings', score: headingsFinalScore, maxScore: 100, percentage: headingsFinalScore, weight: CATEGORY_WEIGHTS.headings },
    images: { category: 'images', score: imagesFinalScore, maxScore: 100, percentage: imagesFinalScore, weight: CATEGORY_WEIGHTS.images },
    links: { category: 'links', score: linksFinalScore, maxScore: 100, percentage: linksFinalScore, weight: CATEGORY_WEIGHTS.links },
    social: { category: 'social', score: socialFinalScore, maxScore: 100, percentage: socialFinalScore, weight: CATEGORY_WEIGHTS.social },
    technical: { category: 'technical', score: techFinalScore, maxScore: 100, percentage: techFinalScore, weight: CATEGORY_WEIGHTS.technical },
    schema: { category: 'schema', score: schemaFinalScore, maxScore: 100, percentage: schemaFinalScore, weight: CATEGORY_WEIGHTS.schema }
  };

  const weightedTotal = 
    (metaFinalScore * 0.20) +
    (headingsFinalScore * 0.15) +
    (imagesFinalScore * 0.15) +
    (linksFinalScore * 0.10) +
    (socialFinalScore * 0.10) +
    (techFinalScore * 0.20) +
    (schemaFinalScore * 0.10);

  const overallScore = Math.round(Math.min(100, Math.max(0, weightedTotal)));
  categoryScores.overview.score = overallScore;
  categoryScores.overview.percentage = overallScore;

  const counts = {
    critical: issues.filter(i => i.severity === 'critical').length,
    warning: issues.filter(i => i.severity === 'warning').length,
    passed: issues.filter(i => i.severity === 'passed').length,
    total: issues.length
  };

  return {
    url: data.url,
    auditDate: new Date().toISOString(),
    overallScore,
    categoryScores,
    counts,
    issues,
    rawData: data
  };
}

