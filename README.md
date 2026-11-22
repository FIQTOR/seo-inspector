# SEO Inspector — Production-Ready Chrome Extension (Manifest V3)

**SEO Inspector** is a modern, developer-grade technical SEO auditing tool built as a Chrome Extension. It empowers developers, SEO technical specialists, website owners, and digital agencies to inspect and analyze the real-time SEO health of any webpage directly inside the browser—with zero external API key requirements.

---

## 🌟 Key Features

1. **Overall SEO Health Score (0–100)**:
   - Transparent, deterministic scoring engine based on real DOM and technical signals.
   - Categorized weighted deductions (Metadata 20%, Headings 15%, Images 15%, Links 10%, Social 10%, Technical 20%, Schema 10%).
   - Critical, Warning, and Passed issue classification.

2. **Meta Tags Inspector**:
   - Page title and character count.
   - Meta description and character count with SERP truncation warnings.
   - Canonical URL, robots meta directives, viewport mobile configuration, document language (`lang`), and character encoding (`charset`).

3. **Heading Structure Hierarchy (H1–H6)**:
   - Complete hierarchical document tree with indentation.
   - Detection of missing `<h1>`, multiple `<h1>` elements (treated as a warning), empty headings, and skipped heading levels.

4. **Image SEO Analyzer**:
   - Alt text presence check, recognizing decorative images (`alt=""`).
   - Image format identification (WebP, AVIF, SVG, PNG, JPEG).
   - Missing explicit dimension detection (CLS / Core Web Vitals optimization).
   - Filter to isolate images missing alt attributes.

5. **Links Quality Analyzer**:
   - Internal vs external link segmentation.
   - Detection of empty or generic anchor text ("click here", "read more", "selengkapnya").
   - Link relationship inspector (`rel="nofollow"`, `sponsored`, `ugc`).

6. **Social & Open Graph Preview**:
   - Interactive live card preview simulating Facebook / LinkedIn / Slack sharing cards.
   - Open Graph tags verification (`og:title`, `og:description`, `og:image`, `og:type`).
   - Twitter / X card format verification (`twitter:card`).

7. **Technical SEO Health**:
   - HTTPS security status.
   - Robots meta indexing status (`noindex`, `nofollow` detection).
   - HTML5 `<!DOCTYPE html>` presence.
   - Direct link to `robots.txt`.

8. **Structured Data / Schema.org Inspector**:
   - Automatic extraction of JSON-LD (`<script type="application/ld+json">`).
   - Detection of schema types (`Article`, `Organization`, `Product`, `BreadcrumbList`, `WebSite`, `FAQPage`, etc.).
   - Raw JSON viewer with syntax validation and one-click copy.

9. **Export Audit Reports**:
   - **JSON**: Full programmatic dataset of audit scores, findings, and raw page data.
   - **CSV**: Structured spreadsheet of all audit findings and actionable recommendations.
   - **Printable HTML**: Clean, printable executive summary report with print stylesheet.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript (Strict Mode)
- **Bundler**: Vite 8 with Rollup Manifest V3 multi-entry configuration
- **Styling**: Tailwind CSS v4 (Dark mode developer UI)
- **Icons**: Lucide React
- **APIs**: Chrome Scripting API, Chrome Tabs API, Chrome Storage API, Chrome Runtime API

---

## 🚀 How to Install and Load into Google Chrome

### Step 1: Build the Extension

Ensure dependencies are installed and run the production build:

```bash
cd /home/fiqtor/AppDevelopment/seo-inspector
npm install
npm run build
```

This compiles all TypeScript files, bundles the popup, background worker, and content scripts into the `dist/` directory.

### Step 2: Load Unpacked Extension into Chrome

1. Open Google Chrome.
2. Navigate to `chrome://extensions/` in the URL bar.
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the **`dist`** directory located at:
   `/home/fiqtor/AppDevelopment/seo-inspector/dist`
6. Pin the **SEO Inspector** icon to your Chrome toolbar.
7. Visit any public webpage (e.g., `https://web.dev`, `https://github.com`, or your website) and click the extension icon to audit!

---

## 🔐 Permissions Explanation

The extension requests only necessary permissions in `manifest.json`:

- `activeTab`: Grants temporary access to inspect the currently focused tab when the user clicks the extension action.
- `scripting`: Executes the lightweight DOM extractor function in the page context.
- `storage`: Caches audit results per tab to make popup inspections instant without re-querying the DOM.
- `tabs`: Allows the extension to obtain the URL and domain of the current active tab and listen for tab switching.
- `host_permissions: ["http://*/*", "https://*/*"]`: Enables inspecting any standard public HTTP/HTTPS website.

> **Privacy Guarantee**: All analysis is performed entirely client-side inside your browser. No website HTML, browsing history, or personal data is ever collected or sent to external servers.

---

## ⚠️ Known Limitations & Safe Alternatives

1. **Browser Internal Pages**: Chrome security prevents executing content scripts on `chrome://*`, `chrome-extension://*`, `about:*`, or Chrome Web Store pages. A clear informational state is shown to the user.
2. **Server Response Headers**: JavaScript in content scripts cannot read all raw HTTP response headers (such as `X-Robots-Tag`). The extension inspects HTML meta tags and displays an explanatory disclaimer.
3. **Cross-Origin iframes**: Content scripts are isolated from cross-origin `<iframe>` documents per browser security boundaries; audits focus on the main document DOM.
4. **Link Status Checking**: To avoid triggering CORS errors or overwhelming external servers, links are analyzed for anchor quality and `rel` attributes rather than actively sending automated HEAD/GET requests to third parties.

---

## 🧪 Testing

Unit tests for the scoring engine can be run using Vitest:

```bash
npx vitest run
```

