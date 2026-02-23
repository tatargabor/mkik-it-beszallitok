import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

export function createDb(dbPath) {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      hq_zip TEXT,
      hq_city TEXT,
      hq_address TEXT,
      mail_address TEXT,
      contact_name TEXT,
      contact_email TEXT,
      website TEXT,
      intro TEXT,
      case_study TEXT,
      logo_url TEXT,
      scraped_at TEXT
    );

    CREATE TABLE IF NOT EXISTS counties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS tenders (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS softwares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER REFERENCES companies(id),
      name TEXT NOT NULL,
      type TEXT,
      deployment TEXT,
      focus_areas TEXT,
      sw_api_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS company_counties (
      company_id INTEGER REFERENCES companies(id),
      county_id INTEGER REFERENCES counties(id),
      PRIMARY KEY (company_id, county_id)
    );

    CREATE TABLE IF NOT EXISTS company_tenders (
      company_id INTEGER REFERENCES companies(id),
      tender_id INTEGER REFERENCES tenders(id),
      PRIMARY KEY (company_id, tender_id)
    );
  `);

  // Prepared statements
  const stmts = {
    upsertCompany: db.prepare(`
      INSERT OR REPLACE INTO companies (id, name, hq_zip, hq_city, hq_address, mail_address, contact_name, contact_email, website, intro, case_study, logo_url, scraped_at)
      VALUES (@id, @name, @hq_zip, @hq_city, @hq_address, @mail_address, @contact_name, @contact_email, @website, @intro, @case_study, @logo_url, @scraped_at)
    `),

    upsertCompanyBasic: db.prepare(`
      INSERT INTO companies (id, name, logo_url, scraped_at)
      VALUES (@id, @name, @logo_url, @scraped_at)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        logo_url = excluded.logo_url,
        scraped_at = excluded.scraped_at
    `),

    updateCompanyDetails: db.prepare(`
      UPDATE companies SET
        hq_zip = @hq_zip,
        hq_city = @hq_city,
        hq_address = @hq_address,
        mail_address = @mail_address,
        contact_name = @contact_name,
        contact_email = @contact_email,
        website = @website,
        intro = @intro,
        case_study = @case_study,
        scraped_at = @scraped_at
      WHERE id = @id
    `),

    insertCounty: db.prepare(`
      INSERT OR IGNORE INTO counties (name) VALUES (@name)
    `),

    getCountyId: db.prepare(`
      SELECT id FROM counties WHERE name = @name
    `),

    upsertTender: db.prepare(`
      INSERT OR REPLACE INTO tenders (id, name) VALUES (@id, @name)
    `),

    insertSoftware: db.prepare(`
      INSERT INTO softwares (company_id, name, type, deployment, focus_areas, sw_api_id)
      VALUES (@company_id, @name, @type, @deployment, @focus_areas, @sw_api_id)
    `),

    deleteCompanyCounties: db.prepare(`
      DELETE FROM company_counties WHERE company_id = @company_id
    `),

    linkCompanyCounty: db.prepare(`
      INSERT OR IGNORE INTO company_counties (company_id, county_id) VALUES (@company_id, @county_id)
    `),

    deleteCompanyTenders: db.prepare(`
      DELETE FROM company_tenders WHERE company_id = @company_id
    `),

    linkCompanyTender: db.prepare(`
      INSERT OR IGNORE INTO company_tenders (company_id, tender_id) VALUES (@company_id, @tender_id)
    `),

    deleteSoftwaresByCompany: db.prepare(`
      DELETE FROM softwares WHERE company_id = @company_id
    `),
  };

  // High-level functions

  function insertCompanyBasic(company) {
    stmts.upsertCompanyBasic.run({
      id: company.id,
      name: company.name,
      logo_url: company.logo_url || null,
      scraped_at: new Date().toISOString(),
    });
  }

  function updateCompanyDetail(detail) {
    stmts.updateCompanyDetails.run({
      id: detail.id,
      hq_zip: detail.hq_zip || null,
      hq_city: detail.hq_city || null,
      hq_address: detail.hq_address || null,
      mail_address: detail.mail_address || null,
      contact_name: detail.contact_name || null,
      contact_email: detail.contact_email || null,
      website: detail.website || null,
      intro: detail.intro || null,
      case_study: detail.case_study || null,
      scraped_at: new Date().toISOString(),
    });
  }

  function linkCompanyCounties(companyId, countyNames) {
    stmts.deleteCompanyCounties.run({ company_id: companyId });
    for (const name of countyNames) {
      const trimmed = name.trim();
      if (!trimmed) continue;
      stmts.insertCounty.run({ name: trimmed });
      const row = stmts.getCountyId.get({ name: trimmed });
      if (row) {
        stmts.linkCompanyCounty.run({ company_id: companyId, county_id: row.id });
      }
    }
  }

  function linkCompanyTenders(companyId, tenders) {
    stmts.deleteCompanyTenders.run({ company_id: companyId });
    for (const tender of tenders) {
      stmts.upsertTender.run({ id: tender.id, name: tender.name });
      stmts.linkCompanyTender.run({ company_id: companyId, tender_id: tender.id });
    }
  }

  function insertSoftware(sw) {
    stmts.insertSoftware.run({
      company_id: sw.company_id || null,
      name: sw.name,
      type: sw.type || null,
      deployment: sw.deployment || null,
      focus_areas: sw.focus_areas || null,
      sw_api_id: sw.sw_api_id || null,
    });
  }

  function deleteSoftwaresByCompany(companyId) {
    stmts.deleteSoftwaresByCompany.run({ company_id: companyId });
  }

  function transaction(fn) {
    return db.transaction(fn)();
  }

  return {
    db,
    insertCompanyBasic,
    updateCompanyDetail,
    linkCompanyCounties,
    linkCompanyTenders,
    insertSoftware,
    deleteSoftwaresByCompany,
    transaction,
  };
}
