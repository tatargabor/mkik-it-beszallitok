import Database from 'better-sqlite3';
import * as cheerio from 'cheerio';
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

const insertCounty = db.prepare('INSERT OR IGNORE INTO counties (name) VALUES (?)');
const getCountyId = db.prepare('SELECT id FROM counties WHERE name = ?');
const deleteCompanyCounties = db.prepare('DELETE FROM company_counties WHERE company_id = ?');
const linkCompanyCounty = db.prepare('INSERT OR IGNORE INTO company_counties (company_id, county_id) VALUES (?, ?)');

const companyIds = db.prepare('SELECT id FROM companies ORDER BY id').all().map(r => r.id);
console.log(`Updating counties for ${companyIds.length} companies...`);

let completed = 0;
let errors = 0;
let updated = 0;

for (let i = 0; i < companyIds.length; i += MAX_CONCURRENT) {
  const batch = companyIds.slice(i, i + MAX_CONCURRENT);
  const results = await Promise.all(batch.map(id => fetchCounties(id)));

  const tx = db.transaction((items) => {
    for (const { id, counties } of items) {
      if (!counties) continue;
      deleteCompanyCounties.run(id);
      for (const name of counties) {
        insertCounty.run(name);
        const row = getCountyId.get(name);
        if (row) linkCompanyCounty.run(id, row.id);
      }
      updated++;
    }
  });
  tx(results);

  completed += batch.length;
  if (completed % 100 === 0 || completed === companyIds.length) {
    console.log(`Progress: ${completed}/${companyIds.length} (updated: ${updated}, errors: ${errors})`);
  }

  if (i + MAX_CONCURRENT < companyIds.length) {
    await new Promise(r => setTimeout(r, DELAY_MS));
  }
}

console.log(`\nDone. Updated: ${updated}, Errors: ${errors}`);

// Verify
const countyStat = db.prepare(`
  SELECT co.name, COUNT(cc.company_id) as cnt
  FROM counties co
  JOIN company_counties cc ON co.id = cc.county_id
  GROUP BY co.name ORDER BY co.name
`).all();
console.log('\nCounty stats:');
for (const r of countyStat) console.log(`  ${r.name}: ${r.cnt}`);

db.close();

async function fetchCounties(id) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const url = `${BASE_URL}/szallito.html?id=${id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const $ = cheerio.load(html);
      let raw = '';
      $('b i').each((_, el) => {
        const t = $(el).text().trim();
        if (t.includes('megye') || t.includes('Budapest') || t.includes('Országos')) {
          raw = t;
          return false;
        }
      });
      const counties = raw ? raw.split(',').map(c => c.trim()).filter(Boolean) : [];
      return { id, counties: counties.length ? counties : null };
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        errors++;
        return { id, counties: null };
      }
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}
