// Note: CAN-SPAM compliance is essential. Any emails sent to these addresses MUST include
// opt-out mechanisms, clear identification of the sender, and not be misleading.
// Scraping should also respect the site's robots.txt directives.

async function checkRobotsTxt(baseUrl) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const robotsUrl = new URL('/robots.txt', baseUrl).toString();
    const response = await fetch(robotsUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) return true; // Default to allow if no valid robots.txt

    const text = await response.text();
    if (text.includes('User-agent: *') && text.includes('Disallow: /')) {
      const lines = text.split('\n').map(l => l.trim().toLowerCase());
      let inAllUserAgent = false;
      for (const line of lines) {
        if (line === 'user-agent: *') inAllUserAgent = true;
        else if (line.startsWith('user-agent:')) inAllUserAgent = false;
        else if (inAllUserAgent && line === 'disallow: /') return false;
      }
    }
    return true; 
  } catch (error) {
    return true;
  }
}

async function fetchPageWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(url, { signal: controller.signal });
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

    const isAllowed = await checkRobotsTxt(baseUrl);
    if (!isAllowed) return null;

    const pathsToTry = ['/', '/contact', '/about', '/contact-us'];
    const invalidPatterns = [/noreply@/i, /no-reply@/i, /admin@/i, /webmaster@/i, /sentry@/i, /\.png$/i, /\.jpg$/i, /\.jpeg$/i, /\.gif$/i, /\.webp$/i, /example/i];
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i; // Removed global flag to match first

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
