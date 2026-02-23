import * as cheerio from 'cheerio';

const SOFTWARE_API_URL = 'https://vallalkozzdigitalisan.mkik.hu/szoftverek_katalogusa_be?action=get_public_szoftver_dt&sEcho=1&iDisplayStart=0&iDisplayLength=9999';

export async function scrapeSoftware() {
  console.log('[Phase 2] Fetching software catalog API...');
  const res = await fetch(SOFTWARE_API_URL);
  if (!res.ok) throw new Error(`Software API fetch failed: ${res.status}`);
  const json = await res.json();
  console.log(`[Phase 2] Total records: ${json.iTotalRecords}`);

  const softwares = [];

  for (const row of json.aaData) {
    // Column 0: Supplier info (HTML with name, ID, website, email)
    const supplierInfo = parseSupplierCell(row[0]);
    // Column 1: Software info (HTML with name, IDs)
    const softwareInfo = parseSoftwareCell(row[1]);
    // Column 2: Software type (plain text)
    const type = (row[2] || '').trim();
    // Column 3: Deployment model (plain text)
    const deployment = (row[3] || '').trim();
    // Column 4: Focus areas (plain text)
    const focus_areas = (row[4] || '').trim();

    softwares.push({
      supplier_name: supplierInfo.name,
      supplier_id: supplierInfo.id,
      supplier_website: supplierInfo.website,
      supplier_email: supplierInfo.email,
      software_name: softwareInfo.name,
      sw_api_id: softwareInfo.id,
      type,
      deployment,
      focus_areas,
    });
  }

  console.log(`[Phase 2] Parsed ${softwares.length} software records`);
  return softwares;
}

function parseSupplierCell(html) {
  const $ = cheerio.load(`<div>${html}</div>`);
  // Supplier name is the text before the button group
  const fullText = $.root().text();
  const name = fullText.split('\n')[0].trim();

  // ID from onclick: { id: XXXX }
  const idMatch = html.match(/id:\s*(\d+)/);
  const id = idMatch ? parseInt(idMatch[1], 10) : null;

  // Website from href (not mailto)
  const websiteLink = $('a[href^="http"]').not('a[href^="mailto"]');
  const website = websiteLink.attr('href') || null;

  // Email from mailto
  const emailLink = $('a[href^="mailto"]');
  const emailHref = emailLink.attr('href') || '';
  const emailMatch = emailHref.match(/mailto:([^?]+)/);
  const email = emailMatch ? decodeURIComponent(emailMatch[1]) : null;

  return { name, id, website, email };
}

function parseSoftwareCell(html) {
  const $ = cheerio.load(`<div>${html}</div>`);
  const fullText = $.root().text();
  const name = fullText.split('\n')[0].trim();

  // Software ID from onclick: objID: XXXX or { id: XXXX }
  const idMatch = html.match(/objID:\s*(\d+)/) || html.match(/ID:\s*(\d+)/);
  const id = idMatch ? parseInt(idMatch[1], 10) : null;

  return { name, id };
}
