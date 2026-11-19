import { Localized } from '../i18n/languages';
import { NEWS_ITEMS } from './news.generated';

export type Topic = 'food' | 'heating' | 'education' | 'health' | 'community';

export interface NewsItem {
  slug: string;
  date: string; // ISO date
  topic: Topic;
  /** Path of an image under public/, e.g. "/images/news/firewood.jpg". */
  image?: string;
  title: Localized;
  summary: Localized;
  /** Article text as HTML (converted from Markdown at build time). */
  body: Localized;
}

/**
 * All news, newest first. Articles are edited in content/news/*.yml (or at /admin) –
 * see scripts/build-news.mjs.
 */
export const NEWS: NewsItem[] = NEWS_ITEMS;

export function findNews(slug: string): NewsItem | undefined {
  return NEWS.find((item) => item.slug === slug);
}
