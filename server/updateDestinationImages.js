
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "data", "destinations.js");
const reportPath = path.join(__dirname, "destination-image-report.json");

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

const searches = {
  "Kashmir": "Dal Lake Srinagar houseboats shikara",
  "Ladakh": "Ladakh mountain road Himalayas",
  "Manali": "Manali Himalayan valley river",
  "Shimla": "Shimla Ridge Himalayan hill station",
  "Jaipur": "Hawa Mahal Jaipur",
  "Agra": "Taj Mahal Agra",
  "Delhi": "Qutub Minar Delhi",
  "Varanasi": "Varanasi Ganges ghats",
  "Kerala": "Alappuzha Kerala backwaters houseboats",
  "Munnar": "Munnar tea plantations rolling hills",
  "Ooty": "Ooty Nilgiri hills tea gardens",
  "Mysuru": "Mysore Palace Karnataka",
  "Hampi": "Hampi Stone Chariot Vijayanagara",
  "Chennai": "Marina Beach Chennai",
  "Coorg": "Coorg Abbey Falls coffee hills",
  "Kolkata": "Victoria Memorial Kolkata",
  "Darjeeling": "Darjeeling tea gardens Kanchenjunga",
  "Puri": "Jagannath Temple Puri Odisha",
  "Bhubaneswar": "Lingaraj Temple Bhubaneswar",
  "Konark": "Konark Sun Temple Odisha",
  "Sundarbans": "Sundarbans mangrove forest river",
  "Bodh Gaya": "Mahabodhi Temple Bodh Gaya",
  "Ranchi": "Hundru Falls Ranchi",
  "Mumbai": "Gateway of India Mumbai",
  "Udaipur": "Lake Pichola City Palace Udaipur",
  "Jaisalmer": "Jaisalmer Fort Golden City",
  "Ahmedabad": "Adalaj Stepwell Ahmedabad",
  "Rann of Kutch": "White Rann of Kutch salt desert road",
  "Pune": "Shaniwar Wada Pune",
  "Lonavala": "Lohagad Fort Lonavala"
};

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

async function searchPhotos(query) {
  const url = new URL(COMMONS_API);

  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "20");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|size|extmetadata");
  url.searchParams.set("iiurlwidth", "1600");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "TravelExplorerImageUpdater/1.0 (personal travel project)"
        }
      });

      if (response.status === 429 || response.status >= 500) {
        if (attempt === 5) {
          throw new Error(`Wikimedia API error: ${response.status}`);
        }

        console.log(`Retry ${attempt}: waiting before next request...`);
        await sleep(attempt * 5000);
        continue;
      }

      if (!response.ok) {
        throw new Error(`Wikimedia API error: ${response.status}`);
      }

      const data = await response.json();

      return Object.values(data.query?.pages || {})
        .map(page => {
          const info = page.imageinfo?.[0];

          if (!info) return null;

          return {
            title: page.title,
            image: info.thumburl || info.url,
            originalImage: info.url,
            width: info.width,
            height: info.height,
            description: info.extmetadata?.ImageDescription?.value || "",
            artist: info.extmetadata?.Artist?.value || "",
            license: info.extmetadata?.LicenseShortName?.value || "",
            sourcePage: info.descriptionurl
          };
        })
        .filter(Boolean);

    } catch (error) {
      if (attempt === 5) throw error;

      console.log(`Request failed. Retry ${attempt}/5...`);
      await sleep(attempt * 5000);
    }
  }

  return [];
}

function selectBestPhoto(photos) {
  const suitable = photos.filter(photo => {
    const ratio = photo.width / photo.height;

    return (
      photo.width >= 1200 &&
      photo.height >= 700 &&
      ratio >= 1.25 &&
      ratio <= 2.2 &&
      photo.image
    );
  });

  suitable.sort((a, b) => {
    const scoreA = a.width * a.height;
    const scoreB = b.width * b.height;

    return scoreB - scoreA;
  });

  return suitable[0] || null;
}

async function main() {
  if (!fs.existsSync(filePath)) {
    throw new Error("destinations.js was not found.");
  }

  delete require.cache[require.resolve(filePath)];

  const destinations = require(filePath);

  if (!Array.isArray(destinations)) {
    throw new Error("destinations.js must export an array.");
  }

  const backupPath =
    filePath +
    ".backup-" +
    new Date().toISOString().replace(/[:.]/g, "-");

  fs.copyFileSync(filePath, backupPath);

  let updated = 0;
  const report = [];

  for (const destination of destinations) {
    const query = searches[destination.name];

    if (!query) {
      report.push({
        destination: destination.name,
        status: "No search query configured"
      });
      continue;
    }

    try {
      console.log(`\nSearching: ${destination.name}`);
      console.log(`Subject: ${query}`);

      const photos = await searchPhotos(query);
      const photo = selectBestPhoto(photos);

      if (!photo) {
        report.push({
          destination: destination.name,
          status: "No suitable photo found"
        });

        console.log("No suitable photo found.");
        await sleep(3000);
        continue;
      }

      destination.image = photo.image;
      updated++;

      report.push({
        destination: destination.name,
        status: "Selected - review recommended",
        title: photo.title,
        image: photo.image,
        sourcePage: photo.sourcePage,
        artist: photo.artist,
        license: photo.license,
        width: photo.width,
        height: photo.height
      });

      console.log(`Selected: ${photo.title}`);
      console.log(`Resolution: ${photo.width} x ${photo.height}`);

      await sleep(3000);

    } catch (error) {
      console.error(`Failed: ${error.message}`);

      report.push({
        destination: destination.name,
        status: error.message
      });

      await sleep(5000);
    }
  }

  const output =
    "const destinations = " +
    JSON.stringify(destinations, null, 2) +
    ";\n\nmodule.exports = destinations;\n";

  fs.writeFileSync(filePath, output, "utf8");

  fs.writeFileSync(
    reportPath,
    JSON.stringify(report, null, 2),
    "utf8"
  );

  console.log("\n========== IMAGE UPDATE COMPLETE ==========");
  console.log(`Updated: ${updated}/${destinations.length}`);
  console.log(`Backup: ${backupPath}`);
  console.log(`Report: ${reportPath}`);

  console.log(
    "Needs review:",
    report
      .filter(item => item.status !== "Selected - review recommended")
      .map(item => item.destination)
  );
}

main().catch(error => {
  console.error("\nERROR:", error.message);
  process.exitCode = 1;
});
