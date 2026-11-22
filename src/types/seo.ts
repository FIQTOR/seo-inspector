// SEO Inspector Type Definitions

export type Severity = 'critical' | 'warning' | 'passed';

export type Category = 
  | 'overview'
  | 'meta'
  | 'headings'
  | 'images'
  | 'links'
  | 'social'
  | 'technical'
  | 'schema';

export interface AuditIssue {
  id: string;
  category: Category;
  title: string;
  severity: Severity;
  scoreImpact: number;
  explanation: string;
  whyItMatters: string;
  suggestedSolution: string;
  relevantElement?: string;
}

export interface ExtractedMetaData {
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonicalUrl: string | null;
  robots: string | null;
  keywords: string | null;
  viewport: string | null;
  charset: string | null;
  language: string | null;
  themeColor: string | null;
}

export interface HeadingItem {
  level: number; // 1 to 6
  text: string;
  index: number;
}

export interface ExtractedHeadingsData {
  items: HeadingItem[];
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h4Count: number;
  h5Count: number;
  h6Count: number;
  missingH1: boolean;
  multipleH1: boolean;
  skippedLevels: Array<{ from: number; to: number; text: string }>;
  emptyHeadings: Array<{ level: number; index: number }>;
}

export interface ImageItem {
  src: string;
  alt: string | null;
  hasAlt: boolean;
  isDecorative: boolean;
  width: number;
  height: number;
  loading?: string | null;
  format?: string | null;
  hasDimensions: boolean;
  naturalWidth?: number;
  naturalHeight?: number;
}

export interface ExtractedImagesData {
  total: number;
  withAlt: number;
  missingAlt: number;
  emptyAlt: number;
  withoutDimensions: number;
  altPercentage: number;
  items: ImageItem[];
}

export interface LinkItem {
  text: string;
  href: string;
  isInternal: boolean;
  rel: string[];
  target: string | null;
  hasNofollow: boolean;
  hasSponsored: boolean;
  hasUgc: boolean;
  isGenericText: boolean;
  isEmptyText: boolean;
}

export interface ExtractedLinksData {
  total: number;
  internalCount: number;
  externalCount: number;
  emptyTextCount: number;
  genericTextCount: number;
  nofollowCount: number;
  items: LinkItem[];
}

export interface ExtractedSocialData {
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  ogType: string | null;
  ogSiteName: string | null;
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  twitterSite: string | null;
}

export interface ExtractedTechnicalData {
  url: string;
  origin: string;
  hostname: string;
  pathname: string;
  protocol: string;
  isHttps: boolean;
  canonicalUrl: string | null;
  robotsMeta: string | null;
  htmlLang: string | null;
  charset: string | null;
  doctype: boolean;
  favicon: string | null;
  sitemapFoundInRobotsTxt?: boolean | null;
  robotsTxtUrl?: string;
  robotsTxtContent?: string | null;
  robotsTxtAccessible?: boolean | null;
}

export interface SchemaItem {
  raw: string;
  type: string | string[];
  parsed: Record<string, unknown> | null;
  error?: string;
  valid: boolean;
}

export interface ExtractedSchemaData {
  total: number;
  detectedTypes: string[];
  items: SchemaItem[];
}

export interface PageRawData {
  url: string;
  meta: ExtractedMetaData;
  headings: ExtractedHeadingsData;
  images: ExtractedImagesData;
  links: ExtractedLinksData;
  social: ExtractedSocialData;
  technical: ExtractedTechnicalData;
  schema: ExtractedSchemaData;
  extractedAt: string;
}

export interface CategoryScore {
  category: Category;
  score: number;
  maxScore: number;
  percentage: number;
  weight: number;
}

export interface AuditResult {
  url: string;
  auditDate: string;
  overallScore: number;
  categoryScores: Record<Category, CategoryScore>;
  counts: {
    critical: number;
    warning: number;
    passed: number;
    total: number;
  };
  issues: AuditIssue[];
  rawData: PageRawData;
}

