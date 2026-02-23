import * as cheerio from 'cheerio';

const LIST_URL = 'https://vallalkozzdigitalisan.mkik.hu/szallitok';

export async function scrapeList() {
  console.log('[Phase 1] Fetching supplier list page...');
  const res = await fetch(LIST_URL);
  if (!res.ok) throw new Error(`List page fetch failed: ${res.status}`);
  const html = await res.text();
  console.log(`[Phase 1] Downloaded ${(html.length / 1024 / 1024).toFixed(1)} MB`);

  const $ = cheerio.load(html);
  const suppliers = [];

  $('.partner-item-div').each((_, el) => {
    const $el = $(el);
    const link = $el.find('a[href*="szallito.html?id="]').first();
    const href = link.attr('href') || '';
    const idMatch = href.match(/id=(\d+)/);
    if (!idMatch) return;

    const id = parseInt(idMatch[1], 10);
    const name = $el.find('.partner-name-link b').text().trim()
      || $el.find('a[href*="szallito.html"] img').attr('alt')?.trim()
      || '';
    const countiesText = $el.find('.szolg-terulet-div').text().trim();
    const counties = countiesText
      ? countiesText.split(',').map(c => c.trim().replace(/\s*\.\.\.\s*$/, '')).filter(Boolean)
      : [];
    const logoImg = $el.find('img[src*="/dl/partners/"]');
    const logo_url = logoImg.attr('src') || null;

    if (name) {
      suppliers.push({ id, name, counties, logo_url });
    }
  });

  console.log(`[Phase 1] Found ${suppliers.length} suppliers`);
  return suppliers;
}
