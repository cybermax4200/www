/**
 * Locale-aware SEO metadata utilities.
 *
 * Usage:
 *   const seo = usePageSeo('stellar');
 *   // then spread into <Helmet> title, description, canonical, and hreflang links.
 */

import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, type Locale } from '../i18n';

export const SITE_ORIGIN = 'https://usewraith.xyz';

/** Pages that have dedicated i18n SEO metadata and locale-prefixed URL variants. */
export type SeoPageKey = 'home' | 'stellar' | 'grants' | 'blog' | 'caseStudies';

/** The canonical base path for each page (no locale prefix — English is the canonical). */
const PAGE_PATHS: Record<SeoPageKey, string> = {
  home: '/',
  stellar: '/stellar',
  grants: '/grants',
  blog: '/blog',
  caseStudies: '/case-studies',
};

/**
 * BCP-47 language tags used for `hreflang` attributes.
 * `en` maps to `x-default` as well as the English alternate.
 */
const LOCALE_LANG_TAG: Record<Locale, string> = {
  en: 'en',
  es: 'es',
  pt: 'pt-BR',
};

export interface HreflangAlternate {
  hreflang: string;
  href: string;
}

export interface PageSeoMeta {
  /** Localised `<title>` text. */
  title: string;
  /** Localised `<meta name="description">` content. */
  description: string;
  /** Canonical URL (always points to the English/default version). */
  canonical: string;
  /** Full set of hreflang alternates including `x-default`. */
  alternates: HreflangAlternate[];
}

/**
 * Returns the canonical URL for a page.
 * English is the authoritative locale so canonical never carries a locale prefix.
 */
export function canonicalUrl(page: SeoPageKey): string {
  const path = PAGE_PATHS[page];
  return path === '/' ? SITE_ORIGIN : `${SITE_ORIGIN}${path}`;
}

/**
 * Returns the full list of hreflang `<link>` alternates for a page,
 * including `x-default` pointing at the canonical English URL.
 *
 * URL strategy: the site uses client-side locale switching (stored in
 * localStorage) rather than separate URL paths per locale, so all
 * alternates resolve to the same canonical URL but carry the correct
 * `hreflang` tag so search engines understand the language variants.
 */
export function hreflangAlternates(page: SeoPageKey): HreflangAlternate[] {
  const canonical = canonicalUrl(page);

  const alternates: HreflangAlternate[] = SUPPORTED_LOCALES.map((locale) => ({
    hreflang: LOCALE_LANG_TAG[locale],
    href: canonical,
  }));

  // x-default always points to the canonical URL
  alternates.push({ hreflang: 'x-default', href: canonical });

  return alternates;
}

/**
 * React hook — reads the current i18n language and returns localised SEO
 * metadata for the given page key.
 */
export function usePageSeo(page: SeoPageKey): PageSeoMeta {
  const { t } = useTranslation();

  return {
    title: t(`pageSeo.${page}.title`),
    description: t(`pageSeo.${page}.description`),
    canonical: canonicalUrl(page),
    alternates: hreflangAlternates(page),
  };
}
