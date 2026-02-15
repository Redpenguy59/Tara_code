import { NewsItem } from '../types';

const KEYWORDS = ['visa', 'work permit', 'citizenship', 'asylum', 'policy', 'residency', 'migrant', 'border', 'refugee', 'expat', 'nomad', 'passport', 'immigration', 'schengen'];

/**
 * Aggregates multiple high-authority news sources for global mobility.
 */
const SOURCES = [
  { name: 'Global Nomad News', url: 'https://rss.app/feeds/OsmnzgSvOCO5nTN8.xml' },
  { name: 'EU Home Affairs', url: 'https://home-affairs.ec.europa.eu/whats-new/news_en.rss' },
  { name: 'The Guardian Migration', url: 'https://www.theguardian.com/world/migration/rss' },
  { name: 'Canada IRCC', url: 'https://api.io.canada.ca/io-server/gc/news/en/v2?dept=departmentofcitizenshipandimmigration&format=atom' },
  { name: 'Migration Policy Institute', url: 'https://www.migrationpolicy.org/rss/taxonomy-term/60' },
  { name: 'UNHCR', url: 'https://www.unhcr.org/news/stories.xml' },
  { name: 'Schengen Visa Info', url: 'https://www.schengenvisainfo.com/feed/' }
];

const CORS_PROXY = "https://corsproxy.io/?url=";

// Helper to safely extract text from XML tags
const getTagValue = (item: Element, tags: string[]): string => {
  for (const tag of tags) {
    const element = item.querySelector(tag);
    if (element) return element.textContent || '';
  }
  return '';
};

export const fetchNewsFromRSS = async (): Promise<NewsItem[]> => {
  const fetchPromises = SOURCES.map(async (source) => {
    try {
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(source.url)}`);
      if (!response.ok) return [];

      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");

      // specific logic to handle both RSS (<item>) and Atom (<entry>) feeds
      const items = Array.from(xmlDoc.querySelectorAll("item, entry"));

      return items.map((item) => {
        const title = getTagValue(item, ['title']);
        // RSS uses 'description' or 'content:encoded', Atom uses 'summary' or 'content'
        const snippet = getTagValue(item, ['description', 'summary', 'content', 'content\\:encoded'])
                       .replace(/<[^>]*>?/gm, '') // Strip HTML tags from snippet
                       .substring(0, 300);
        
        // Atom links are attributes, RSS links are text content
        let link = getTagValue(item, ['link']);
        if (!link) {
           const linkNode = item.querySelector('link');
           if (linkNode && linkNode.getAttribute('href')) {
             link = linkNode.getAttribute('href') || '#';
           }
        }

        const dateStr = getTagValue(item, ['pubDate', 'date', 'updated', 'isoDate']);
        const pubDate = dateStr ? new Date(dateStr) : new Date();

        const content = `${title} ${snippet}`.toLowerCase();
        
        // Categorization logic based on keywords and source context
        let category: 'Visa Update' | 'Safety' | 'Citizenship' | 'Policy' = 'Policy';
        
        if (source.name === 'Schengen Visa Info' || content.includes('visa') || content.includes('schengen') || content.includes('permit')) {
          category = 'Visa Update';
        } else if (source.name === 'UNHCR' || content.includes('refugee') || content.includes('asylum') || content.includes('safety') || content.includes('conflict')) {
          category = 'Safety';
        } else if (content.includes('citizenship') || content.includes('passport') || content.includes('naturalization')) {
          category = 'Citizenship';
        }

        return {
          id: getTagValue(item, ['guid', 'id']) || link || `news-${Math.random()}`,
          title: title || 'Untitled Update',
          excerpt: snippet.length > 200 ? snippet.substring(0, 200) + '...' : snippet,
          url: link || '#',
          date: pubDate.toLocaleDateString(),
          rawDate: pubDate.getTime(), // Used for sorting
          category: category,
          source: source.name
        };
      });
    } catch (error) {
      console.warn(`Failed to fetch from source: ${source.name}`, error);
      return [];
    }
  });

  try {
    const results = await Promise.all(fetchPromises);
    const combinedNews = results.flat();

    // Deduplicate by URL
    const uniqueNews = Array.from(new Map(combinedNews.map(item => [item.url, item])).values());

    // Filter by relevance keywords
    const filteredNews = uniqueNews.filter(item => {
      const text = `${item.title} ${item.excerpt}`.toLowerCase();
      return KEYWORDS.some(kw => text.includes(kw));
    });

    // Sort by date (newest first)
    return filteredNews.sort((a: any, b: any) => b.rawDate - a.rawDate).slice(0, 24);
  } catch (error) {
    console.error("Aggregation Error:", error);
    return [];
  }
};
