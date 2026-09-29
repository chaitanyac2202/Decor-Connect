// Note: CAN-SPAM compliance is essential. Any emails sent to these addresses MUST include
// opt-out mechanisms, clear identification of the sender, and not be misleading.
// Scraping should also respect the site's robots.txt directives.

async function fetchPageWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500); 
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    clearTimeout(timeoutId);
    if (!response.ok) return '';
    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    return '';
  }
}

export async function scrapeEmail(websiteUrl) {
  try {
    if (!websiteUrl) return null;

    let baseUrl;
    try {
      baseUrl = new URL(websiteUrl).origin;
    } catch (e) {
      baseUrl = new URL('http://' + websiteUrl).origin;
    }

    // Try the homepage and most common contact/about pages
    // Bypassing robots.txt check to massively improve speed per user request
    const pathsToTry = ['/', '/contact', '/about'];
    const invalidPatterns = [/noreply@/i, /no-reply@/i, /admin@/i, /webmaster@/i, /sentry@/i, /\.png$/i, /\.jpg$/i, /\.jpeg$/i, /\.gif$/i, /\.webp$/i, /example/i];
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i; 

    for (const path of pathsToTry) {
      const pageUrl = new URL(path, baseUrl).toString();
      const html = await fetchPageWithTimeout(pageUrl);
      
      if (html) {
        // Extract emails from this page
        const matches = html.match(new RegExp(emailRegex, 'gi'));
        if (matches) {
          for (const email of matches) {
            const isInvalid = invalidPatterns.some(pattern => pattern.test(email));
            if (!isInvalid) {
              return email.toLowerCase(); // Found one! Stop scraping immediately.
            }
          }
        }
      }
    }

    return null;

  } catch (error) {
    console.error('Error scraping email:', error);
    return null;
  }
}
