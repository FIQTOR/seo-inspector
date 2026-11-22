import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { extractPageRawData } from '../src/content/extractor';
import { analyzeSeo } from '../src/engine/analyzer';

describe('Real Webpage DOM Extraction & SEO Audit Scenarios', () => {
  let dom: JSDOM;

  const setupDOM = (html: string, url: string = 'https://example.com/page') => {
    dom = new JSDOM(html, { url });
    // Bind to global window / document
    global.window = dom.window as unknown as Window & typeof globalThis;
    global.document = dom.window.document;
  };

  afterEach(() => {
    if (dom) {
      dom.window.close();
    }
  });

  // Scenario 1: A well-optimized website
  it('Scenario 1: Handles a well-optimized website correctly', () => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Best SEO Practices for Modern Web Applications</title>
        <meta name="description" content="Discover actionable tips and strategies for technical SEO optimization, structured data schemas, Core Web Vitals, and responsive metadata.">
        <link rel="canonical" href="https://example.com/seo-guide">
        <meta name="robots" content="index, follow">
        <meta property="og:title" content="Best SEO Practices">
        <meta property="og:description" content="Discover actionable tips and strategies for technical SEO.">
        <meta property="og:image" content="https://example.com/banner.png">
        <meta name="twitter:card" content="summary_large_image">
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Best SEO Practices"
          }
        </script>
      </head>
      <body>
        <main>
          <h1>Comprehensive Technical SEO Guide</h1>
          <p>Welcome to our guide.</p>
          <img src="https://example.com/diagram.webp" alt="SEO architecture diagram" width="800" height="400" />
          <a href="https://example.com/next-chapter">Read Chapter 2</a>
        </main>
      </body>
      </html>
    `;
    setupDOM(html, 'https://example.com/seo-guide');
    const rawData = extractPageRawData();
    const audit = analyzeSeo(rawData);

    expect(rawData.meta.title).toBe('Best SEO Practices for Modern Web Applications');
    expect(rawData.headings.h1Count).toBe(1);
    expect(rawData.images.withAlt).toBe(1);
    expect(rawData.images.missingAlt).toBe(0);
    expect(rawData.schema.detectedTypes).toContain('Article');
    expect(audit.overallScore).toBeGreaterThanOrEqual(95);
    expect(audit.counts.critical).toBe(0);
  });

  // Scenario 2: A website with missing metadata
  it('Scenario 2: Handles a website with missing title, description, and viewport', () => {
    const html = `
      <html>
      <head>
        <!-- No title, description, viewport, or charset -->
      </head>
      <body>
        <h1>Simple Page</h1>
      </body>
      </html>
    `;
    setupDOM(html, 'https://example.com/bare');
    const rawData = extractPageRawData();
    const audit = analyzeSeo(rawData);

    expect(rawData.meta.title).toBe('');
    expect(rawData.meta.description).toBe('');
    expect(rawData.meta.viewport).toBeNull();

    const criticalTitles = audit.issues
      .filter((i) => i.severity === 'critical')
      .map((i) => i.id);

    expect(criticalTitles).toContain('meta-title-missing');
    expect(criticalTitles).toContain('meta-desc-missing');
    expect(criticalTitles).toContain('meta-viewport-missing');
    expect(audit.overallScore).toBeLessThan(80);
  });

  // Scenario 3: A website with multiple H1 elements
  it('Scenario 3: Flags multiple H1 elements as a warning without crashing', () => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head><title>Multi H1 Page</title><meta name="description" content="A page with multiple top-level headings for testing heading outline audit."></head>
      <body>
        <h1>First Main Heading</h1>
        <h1>Second Main Heading</h1>
        <h1>Third Main Heading</h1>
      </body>
      </html>
    `;
    setupDOM(html);
    const rawData = extractPageRawData();
    const audit = analyzeSeo(rawData);

    expect(rawData.headings.h1Count).toBe(3);
    expect(rawData.headings.multipleH1).toBe(true);

    const h1Issue = audit.issues.find((i) => i.id === 'headings-h1-multiple');
    expect(h1Issue).toBeDefined();
    expect(h1Issue?.severity).toBe('warning');
  });

  // Scenario 4: A website with missing image alt attributes & decorative images
  it('Scenario 4: Differentiates between missing alt and decorative alt=""', () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <body>
        <img src="/img1.jpg"> <!-- missing alt -->
        <img src="/img2.jpg" alt=""> <!-- decorative -->
        <img src="/img3.jpg" alt="A meaningful photo of our team"> <!-- valid -->
      </body>
      </html>
    `;
    setupDOM(html);
    const rawData = extractPageRawData();
    const audit = analyzeSeo(rawData);

    expect(rawData.images.total).toBe(3);
    expect(rawData.images.missingAlt).toBe(1);
    expect(rawData.images.emptyAlt).toBe(1);
    expect(rawData.images.withAlt).toBe(1);

    const missingAltIssue = audit.issues.find((i) => i.id === 'images-missing-alt');
    expect(missingAltIssue).toBeDefined();
    expect(missingAltIssue?.explanation).toContain('1 of 3 images');
  });

  // Scenario 5: A website with no structured data
  it('Scenario 5: Flags absence of structured data as warning', () => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head><title>No Schema Page</title></head>
      <body><p>Just text</p></body>
      </html>
    `;
    setupDOM(html);
    const rawData = extractPageRawData();
    const audit = analyzeSeo(rawData);

    expect(rawData.schema.total).toBe(0);
    const schemaIssue = audit.issues.find((i) => i.id === 'schema-none-detected');
    expect(schemaIssue).toBeDefined();
    expect(schemaIssue?.severity).toBe('warning');
  });

  // Scenario 6: Malformed Schema JSON handling
  it('Scenario 6: Gracefully catches syntax errors in malformed JSON-LD scripts', () => {
    const html = `
      <!DOCTYPE html>
      <head>
        <script type="application/ld+json">
          { "brokenJson": missingQuotes }
        </script>
      </head>
      <body></body>
    `;
    setupDOM(html);
    const rawData = extractPageRawData();
    const audit = analyzeSeo(rawData);

    expect(rawData.schema.total).toBe(1);
    expect(rawData.schema.items[0].valid).toBe(false);
    expect(rawData.schema.items[0].error).toBeDefined();

    const invalidIssue = audit.issues.find((i) => i.id === 'schema-invalid-json');
    expect(invalidIssue).toBeDefined();
    expect(invalidIssue?.severity).toBe('critical');
  });

  // Scenario 7: Link quality analysis with generic text
  it('Scenario 7: Flags generic anchor texts like "click here" or "read more"', () => {
    const html = `
      <!DOCTYPE html>
      <body>
        <a href="https://example.com/a">click here</a>
        <a href="https://example.com/b">read more</a>
        <a href="https://example.com/c">Comprehensive Product Specs</a>
      </body>
    `;
    setupDOM(html);
    const rawData = extractPageRawData();
    const audit = analyzeSeo(rawData);

    expect(rawData.links.genericTextCount).toBe(2);
    const genericIssue = audit.issues.find((i) => i.id === 'links-generic-text');
    expect(genericIssue).toBeDefined();
    expect(genericIssue?.severity).toBe('warning');
  });

  // Scenario 8: Single-Page Application (SPA) client-side content
  it('Scenario 8: Extracts dynamically generated SPA DOM nodes correctly', () => {
    setupDOM('<!DOCTYPE html><html><head><title>SPA</title></head><body><div id="root"></div></body></html>');
    
    // Simulate React/Vue hydration inserting DOM elements
    const h1 = document.createElement('h1');
    h1.textContent = 'Rendered by React SPA';
    document.getElementById('root')?.appendChild(h1);

    const rawData = extractPageRawData();
    expect(rawData.headings.h1Count).toBe(1);
    expect(rawData.headings.items[0].text).toBe('Rendered by React SPA');
  });
});
