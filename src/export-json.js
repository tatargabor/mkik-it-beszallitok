import Database from 'better-sqlite3';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const DB_PATH = 'data/mkik.db';
const OUTPUT_PATH = 'docs/data/companies.json';

const db = new Database(DB_PATH, { readonly: true });

const companies = db.prepare('SELECT * FROM companies ORDER BY name').all();

const countiesStmt = db.prepare(`
  SELECT co.name FROM counties co
  JOIN company_counties cc ON co.id = cc.county_id
  WHERE cc.company_id = ?
  ORDER BY co.name
`);

const tendersStmt = db.prepare(`
  SELECT t.id, t.name FROM tenders t
  JOIN company_tenders ct ON t.id = ct.tender_id
  WHERE ct.company_id = ?
  ORDER BY t.name
`);

const softwaresStmt = db.prepare(`
  SELECT name, type, deployment, focus_areas FROM softwares
  WHERE company_id = ?
  ORDER BY name
`);

const result = companies.map(c => {
  const obj = { id: c.id, name: c.name };

  if (c.hq_zip) obj.hq_zip = c.hq_zip;
  if (c.hq_city) obj.hq_city = c.hq_city;
  if (c.hq_address) obj.hq_address = c.hq_address;
  if (c.mail_address) obj.mail_address = c.mail_address;
  if (c.contact_name) obj.contact_name = c.contact_name;
  if (c.contact_email) obj.contact_email = c.contact_email;
  if (c.website) obj.website = c.website;
  if (c.intro) obj.intro = c.intro;
  if (c.case_study) obj.case_study = c.case_study;
  if (c.logo_url) obj.logo_url = c.logo_url;

  const counties = countiesStmt.all(c.id).map(r => r.name);
  if (counties.length) obj.counties = counties;

  const tenders = tendersStmt.all(c.id);
  if (tenders.length) obj.tenders = tenders;

  const softwares = softwaresStmt.all(c.id).map(s => {
    const sw = { name: s.name };
    if (s.type) sw.type = s.type;
    if (s.deployment) sw.deployment = s.deployment;
    if (s.focus_areas) sw.focus_areas = s.focus_areas;
    return sw;
  });
  if (softwares.length) obj.softwares = softwares;

  return obj;
});

db.close();

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));

console.log(`Exported ${result.length} companies to ${OUTPUT_PATH}`);
console.log(`File size: ${(Buffer.byteLength(JSON.stringify(result)) / 1024 / 1024).toFixed(2)} MB`);
