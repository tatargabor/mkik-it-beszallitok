import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'mkik.db');
const BASE_URL = 'https://vallalkozzdigitalisan.mkik.hu';
const MAX_CONCURRENT = 5;
const DELAY_MS = 200;
const MAX_RETRIES = 3;

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const linkCompanyTender = db.prepare(
  'INSERT OR IGNORE INTO company_tenders (company_id, tender_id) VALUES (?, ?)'
);

const tenders = db.prepare('SELECT id, name FROM tenders ORDER BY id').all();
const companyIds = db.prepare('SELECT id FROM companies ORDER BY id').all().map(r => r.id);

console.log(`Scraping tender participation: ${tenders.length} tenders x ${companyIds.length} companies`);
console.log(`Tenders: ${tenders.map(t => `${t.id}: ${t.name.slice(0, 50)}`).join('\n  ')}`);
console.log('');

let totalLinks = 0;
let totalRequests = 0;
let errors = 0;

for (const tender of tenders) {
  let tenderLinks = 0;
  console.log(`\nTender ${tender.id}: ${tender.name.slice(0, 60)}...`);

  for (let i = 0; i < companyIds.length; i += MAX_CONCURRENT) {
    const batch = companyIds.slice(i, i + MAX_CONCURRENT);
    const results = await Promise.all(
      batch.map(cid => checkTenderParticipation(cid, tender.id))
    );

    const tx = db.transaction((items) => {
      for (const { companyId, tenderId, hasOffers } of items) {
        if (hasOffers) {
          linkCompanyTender.run(companyId, tenderId);
          tenderLinks++;
          totalLinks++;
        }
      }
    });
    tx(results);

    totalRequests += batch.length;
    if ((i + MAX_CONCURRENT) % 500 < MAX_CONCURRENT) {
      process.stdout.write(`  ${i + batch.length}/${companyIds.length} (found: ${tenderLinks})\r`);
    }

    if (i + MAX_CONCURRENT < companyIds.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`  Done: ${tenderLinks} companies participate in this tender`);
}

console.log(`\n=== Summary ===`);
console.log(`Total requests: ${totalRequests}`);
console.log(`Total links found: ${totalLinks}`);
console.log(`Errors: ${errors}`);

// Show stats
const stats = db.prepare(`
  SELECT t.name, COUNT(ct.company_id) as cnt
  FROM tenders t
  LEFT JOIN company_tenders ct ON t.id = ct.tender_id
  GROUP BY t.id ORDER BY cnt DESC
`).all();
console.log('\nTender stats:');
for (const r of stats) console.log(`  ${r.cnt} cég: ${r.name.slice(0, 70)}`);

db.close();

async function checkTenderParticipation(companyId, tenderId) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const url = `${BASE_URL}/termekek_be.html?action=getPartnerOffersListDT&tid=${tenderId}&pid=${companyId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const hasOffers = json.data && json.data.length > 0;
      return { companyId, tenderId, hasOffers };
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        errors++;
        return { companyId, tenderId, hasOffers: false };
      }
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}
