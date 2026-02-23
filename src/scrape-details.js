import * as cheerio from 'cheerio';

const BASE_URL = 'https://vallalkozzdigitalisan.mkik.hu';
const MAX_CONCURRENT = 5;
const DELAY_MS = 200;
const MAX_RETRIES = 3;

export async function scrapeDetails(supplierIds) {
  console.log(`[Phase 3] Fetching ${supplierIds.length} detail pages (max ${MAX_CONCURRENT} concurrent)...`);

  const results = [];
  let completed = 0;
  let errors = 0;

  // Process in batches
  for (let i = 0; i < supplierIds.length; i += MAX_CONCURRENT) {
    const batch = supplierIds.slice(i, i + MAX_CONCURRENT);
    const batchResults = await Promise.all(
      batch.map(id => fetchDetailWithRetry(id))
    );

    for (const result of batchResults) {
      completed++;
      if (result.error) {
        errors++;
        console.error(`[Phase 3] Error for ID ${result.id}: ${result.error}`);
      } else {
        results.push(result);
      }

      if (completed % 100 === 0 || completed === supplierIds.length) {
        console.log(`[Phase 3] Progress: ${completed}/${supplierIds.length} (errors: ${errors})`);
      }
    }

    // Delay between batches
    if (i + MAX_CONCURRENT < supplierIds.length) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`[Phase 3] Completed. Success: ${results.length}, Errors: ${errors}`);
  return results;
}

async function fetchDetailWithRetry(id) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const url = `${BASE_URL}/szallito.html?id=${id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      return parseDetailPage(id, html);
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        return { id, error: err.message };
      }
      await sleep(1000 * Math.pow(2, attempt - 1)); // 1s, 2s, 4s
    }
  }
}

function parseDetailPage(id, html) {
  // Strip HTML comments so commented-out fields (Székhely, Kontakt etc.) become visible
  const cleanHtml = html.replace(/<!--/g, '').replace(/-->/g, '');
  const $ = cheerio.load(cleanHtml);

  // Company name from h1
  const name = $('h1').first().text().trim();

  // Parse labeled fields
  const fields = {};
  $('div.row').each((_, row) => {
    const label = $(row).find('b').first().text().trim().replace(/:$/, '');
    const value = $(row).find('.col-md-8').text().trim();
    if (label && value) {
      fields[label] = value;
    }
  });

  // Headquarters parsing
  const hqRaw = fields['Székhely'] || '';
  const { zip: hq_zip, city: hq_city, address: hq_address } = parseAddress(hqRaw);

  // Mailing address
  const mail_address = fields['Levelezési cím'] || null;

  // Contact
  const contact_name = fields['Kapcsolattartó neve'] || null;
  const contact_email = fields['Kapcsolattartó e-mail címe'] || null;

  // Website - try both the field and the link
  let website = null;
  const webRow = $('b:contains("Weboldal")').closest('.row');
  const webLink = webRow.find('a[href]');
  website = webLink.attr('href') || fields['Weboldal'] || null;

  // Company introduction
  const introPanel = $('h3:contains("Cégbemutató")').closest('.panel');
  const intro = introPanel.find('.panel-body').text().trim() || null;

  // Case study
  const casePanel = $('h3:contains("Esettanulmány")').closest('.panel');
  const case_study = casePanel.find('.panel-body').text().trim() || null;

  // Tenders from select options (global reference list, same on every page)
  // We save these as a reference table but DON'T link them per-company since
  // the select is the same on every page. Actual participation requires AJAX calls.
  const tenders = [];
  $('select#tenderID option[value]').each((_, opt) => {
    const val = $(opt).attr('value');
    const tenderName = $(opt).text().trim();
    if (val && val !== '') {
      tenders.push({ id: parseInt(val, 10), name: tenderName });
    }
  });

  return {
    id,
    name,
    hq_zip,
    hq_city,
    hq_address,
    mail_address,
    contact_name,
    contact_email,
    website,
    intro,
    case_study,
    tenders,
  };
}

function parseAddress(raw) {
  if (!raw) return { zip: null, city: null, address: null };
  // Address format: "6724SzegedGelei József u. 5." (no spaces) or "6724 Szeged Gelei József u. 5."
  const zipMatch = raw.match(/^(\d{4})\s*/);
  if (!zipMatch) return { zip: null, city: null, address: raw.trim() };

  const zip = zipMatch[1];
  let rest = raw.slice(zipMatch[0].length);

  // If there are spaces, try space-based split first
  if (rest.includes(' ')) {
    // Try to find city/street boundary using lowercase→uppercase transition
    // "KecskemétKőhíd u. 12." → split at "t" + "K"
    const transitionMatch = rest.match(/^([A-ZÁÉÍÓÖŐÚÜŰa-záéíóöőúüű]+?[a-záéíóöőúüű])([A-ZÁÉÍÓÖŐÚÜŰ])/);
    if (transitionMatch) {
      const city = transitionMatch[1];
      const street = rest.slice(city.length).trim();
      return { zip, city, address: street || null };
    }

    // Fallback: first token is city
    const spaceIdx = rest.indexOf(' ');
    if (spaceIdx > 0) {
      return { zip, city: rest.substring(0, spaceIdx).trim(), address: rest.substring(spaceIdx + 1).trim() };
    }
  } else {
    // No spaces at all - try lowercase→uppercase transition
    const transitionMatch = rest.match(/^([A-ZÁÉÍÓÖŐÚÜŰa-záéíóöőúüű]+?[a-záéíóöőúüű])([A-ZÁÉÍÓÖŐÚÜŰ])/);
    if (transitionMatch) {
      const city = transitionMatch[1];
      const street = rest.slice(city.length).trim();
      return { zip, city, address: street || null };
    }
  }

  return { zip, city: rest.trim() || null, address: null };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
