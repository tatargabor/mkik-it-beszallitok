import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createDb } from './db.js';
import { scrapeList } from './scrape-list.js';
import { scrapeSoftware } from './scrape-software.js';
import { scrapeDetails } from './scrape-details.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'mkik.db');

async function main() {
  console.log('=== MKIK Beszállító Scraper ===');
  console.log(`Database: ${DB_PATH}`);
  console.log('');

  const db = createDb(DB_PATH);
  const startTime = Date.now();

  // Phase 1: List page
  const suppliers = await scrapeList();
  db.transaction(() => {
    for (const s of suppliers) {
      db.insertCompanyBasic(s);
      db.linkCompanyCounties(s.id, s.counties);
    }
  });
  console.log(`[DB] Inserted ${suppliers.length} companies with counties\n`);

  // Phase 2: Software catalog
  const softwares = await scrapeSoftware();

  // Build supplier ID lookup from software API data (supplier_id -> company mapping)
  const swByCompany = new Map();
  for (const sw of softwares) {
    if (!sw.supplier_id) continue;
    if (!swByCompany.has(sw.supplier_id)) {
      swByCompany.set(sw.supplier_id, []);
    }
    swByCompany.get(sw.supplier_id).push(sw);
  }

  // Ensure all supplier IDs from the software API exist in companies table
  const knownIds = new Set(suppliers.map(s => s.id));
  db.transaction(() => {
    for (const [companyId, sws] of swByCompany) {
      if (!knownIds.has(companyId)) {
        // Company exists in software API but not on list page - create a stub
        const supplierName = sws[0]?.supplier_name || `Unknown (${companyId})`;
        db.insertCompanyBasic({ id: companyId, name: supplierName, logo_url: null });
      }
      db.deleteSoftwaresByCompany(companyId);
      for (const sw of sws) {
        db.insertSoftware({
          company_id: companyId,
          name: sw.software_name,
          type: sw.type,
          deployment: sw.deployment,
          focus_areas: sw.focus_areas,
          sw_api_id: sw.sw_api_id,
        });
      }
    }
  });
  console.log(`[DB] Inserted ${softwares.length} software records for ${swByCompany.size} companies\n`);

  // Phase 3: Detail pages - include all known IDs (list page + software API)
  const allIds = new Set(suppliers.map(s => s.id));
  for (const companyId of swByCompany.keys()) {
    allIds.add(companyId);
  }
  const supplierIds = [...allIds];
  const details = await scrapeDetails(supplierIds);

  // Save tenders as reference table (global list, same on all pages)
  let tendersSaved = false;
  // Insert details in batches of 100 to avoid memory pressure
  const BATCH_SIZE = 100;
  for (let i = 0; i < details.length; i += BATCH_SIZE) {
    const batch = details.slice(i, i + BATCH_SIZE);
    db.transaction(() => {
      for (const d of batch) {
        db.updateCompanyDetail(d);
        // Save tender reference list once (from first page that has them)
        if (!tendersSaved && d.tenders && d.tenders.length > 0) {
          for (const t of d.tenders) {
            db.upsertTender(t);
          }
          tendersSaved = true;
        }
      }
    });
  }
  console.log(`[DB] Updated ${details.length} companies with details\n`);

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('=== Summary ===');
  console.log(`Companies: ${suppliers.length}`);
  console.log(`Softwares: ${softwares.length}`);
  console.log(`Details fetched: ${details.length}`);
  console.log(`Errors: ${suppliers.length - details.length}`);
  console.log(`Time: ${elapsed}s`);
  console.log(`Database: ${DB_PATH}`);

  db.db.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
