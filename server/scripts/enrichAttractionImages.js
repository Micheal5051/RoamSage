const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const ATTRACTIONS_FILE = path.join(DATA_DIR, 'attractions.js');
const REPORT_FILE = path.join(DATA_DIR, 'attraction-image-attribution.csv');
const BACKUP_FILE = `${ATTRACTIONS_FILE}.backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
const API_URL = 'https://commons.wikimedia.org/w/api.php';
const WAIT_MS = 900;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clean = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const STOP_WORDS = new Set(['the', 'of', 'and', 'at', 'in', 'to', 'a', 'an', 'fort', 'temple', 'lake', 'museum', 'park', 'garden']);

function meaningfulTokens(value) {
  return clean(value).split(/\s+/).filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function escapeCsv(value) {
  return `"${String(value || '').replace(/"/g, '""')}"`;
}

async function commonsSearch(query) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: '8',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '1200',
    iiextmetadatafilter: 'LicenseShortName|UsageTerms|Artist|Credit|AttributionRequired',
    origin: '*'
  });

  const response = await fetch(`${API_URL}?${params.toString()}`, {
    headers: { 'User-Agent': 'TravelExplorerStudentProject/1.0 (image attribution and discovery)' }
  });
  if (!response.ok) throw new Error(`Wikimedia Commons returned HTTP ${response.status}`);
  return response.json();
}

function selectRelevantFile(pages, attraction) {
  const nameTokens = meaningfulTokens(attraction.name);
  if (!nameTokens.length) return null;

  const candidates = Object.values(pages || {}).map((page) => {
    const title = clean(page.title.replace(/^File:/i, ''));
    const matched = nameTokens.filter((token) => title.includes(token));
    const score = matched.length / nameTokens.length;
    const info = page.imageinfo && page.imageinfo[0];
    return { page, info, score, matched: matched.length };
  }).filter((item) => item.info && item.score >= 0.75 && item.info.thumburl && /^https?:\/\//i.test(item.info.thumburl));

  candidates.sort((a, b) => b.score - a.score || b.matched - a.matched);
  return candidates[0] || null;
}

async function findImage(attraction) {
  const queries = [
    `"${attraction.name}" ${attraction.destination}`,
    `"${attraction.name}"`
  ];

  for (const query of queries) {
    const data = await commonsSearch(query);
    const selected = selectRelevantFile(data.query && data.query.pages, attraction);
    if (selected) return selected;
    await sleep(250);
  }
  return null;
}

async function main() {
  if (!fs.existsSync(ATTRACTIONS_FILE)) {
    console.error('Could not find server/data/attractions.js.');
    process.exit(1);
  }

  const attractions = require(ATTRACTIONS_FILE);
  if (!Array.isArray(attractions)) {
    console.error('attractions.js must export an array. No changes made.');
    process.exit(1);
  }

  const missing = attractions.filter((item) => !item.image || !String(item.image).trim());
  console.log(`Total attractions: ${attractions.length}`);
  console.log(`Attractions missing images: ${missing.length}`);
  if (!missing.length) {
    console.log('All attractions already have image URLs. Nothing to update.');
    return;
  }

  fs.copyFileSync(ATTRACTIONS_FILE, BACKUP_FILE);
  console.log(`Backup created: ${BACKUP_FILE}`);

  const report = [['Attraction', 'Destination', 'Image URL', 'Commons file page', 'Author / credit', 'License']];
  let added = 0;
  let notFound = 0;

  for (let index = 0; index < missing.length; index += 1) {
    const attraction = missing[index];
    try {
      const match = await findImage(attraction);
      if (match) {
        const info = match.info;
        const metadata = info.extmetadata || {};
        attraction.image = info.thumburl;
        const author = (metadata.Artist && metadata.Artist.value) || (metadata.Credit && metadata.Credit.value) || 'Not provided';
        const license = (metadata.LicenseShortName && metadata.LicenseShortName.value) || (metadata.UsageTerms && metadata.UsageTerms.value) || 'Check file page';
        report.push([attraction.name, attraction.destination, info.thumburl, info.descriptionurl || '', author.replace(/<[^>]*>/g, ''), license.replace(/<[^>]*>/g, '')]);
        added += 1;
        console.log(`[${index + 1}/${missing.length}] Image found: ${attraction.name} — ${license}`);
      } else {
        report.push([attraction.name, attraction.destination, '', '', '', 'No confident filename match; image left blank']);
        notFound += 1;
        console.log(`[${index + 1}/${missing.length}] No confident image match: ${attraction.name}`);
      }
    } catch (error) {
      report.push([attraction.name, attraction.destination, '', '', '', `Lookup failed: ${error.message}`]);
      notFound += 1;
      console.log(`[${index + 1}/${missing.length}] Lookup failed for ${attraction.name}: ${error.message}`);
    }
    await sleep(WAIT_MS);
  }

  const serialized = `const attractions = ${JSON.stringify(attractions, null, 2)};\n\nmodule.exports = attractions;\n`;
  fs.writeFileSync(ATTRACTIONS_FILE, serialized, 'utf8');
  fs.writeFileSync(REPORT_FILE, report.map((row) => row.map(escapeCsv).join(',')).join('\n'), 'utf8');

  console.log('\nImage enrichment complete.');
  console.log(`Images added: ${added}`);
  console.log(`No confident match / lookup issue: ${notFound}`);
  console.log(`Attractions still missing images: ${attractions.filter((item) => !item.image).length}`);
  console.log(`Attribution report: ${REPORT_FILE}`);
  console.log('Review the report and a sample of images in your app before publishing.');
}

main().catch((error) => {
  console.error('Image enrichment stopped:', error);
  process.exit(1);
});
