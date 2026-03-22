const axios = require('axios');

/**
 * Extract readable text content from a URL using a simple approach
 * For production, consider using Mercury Parser or Readability
 */
async function extractFromUrl(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TwoSidedNews/1.0)',
      },
      maxContentLength: 5 * 1024 * 1024, // 5MB limit
    });

    const html = response.data;

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract meta description
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract Open Graph data
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);

    const finalTitle = (ogTitleMatch && ogTitleMatch[1]) || title || url;
    const finalDesc = (ogDescMatch && ogDescMatch[1]) || description;

    // Extract body text (rough extraction)
    const bodyText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2000);

    return {
      title: finalTitle,
      description: finalDesc || bodyText.slice(0, 300),
      content: bodyText,
      url,
    };
  } catch (err) {
    throw new Error(`Failed to fetch URL: ${err.message}`);
  }
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

module.exports = { extractFromUrl, isValidUrl };
