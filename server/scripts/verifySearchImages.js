const path = require("path");

const hotels = require(path.join(__dirname, "../data/hotels"));
const attractions = require(path.join(__dirname, "../data/attractions"));

const records = [
  ...hotels.map((item) => ({ ...item, kind: "hotel" })),
  ...attractions.map((item) => ({ ...item, kind: "activity" }))
];

const timeoutMs = 12000;

async function checkImage(url) {
  if (!url || typeof url !== "string") return "missing";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "TravelExplorer-Image-Check/1.0" }
    });

    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": "TravelExplorer-Image-Check/1.0",
          Range: "bytes=0-0"
        }
      });
    }

    const contentType = response.headers.get("content-type") || "";
    return response.ok && contentType.toLowerCase().startsWith("image/")
      ? "ok"
      : `http-${response.status}`;
  } catch (error) {
    return error.name === "AbortError" ? "timeout" : "unreachable";
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const withImages = records.filter((item) => item.image && item.image.trim());
  const missing = records.filter((item) => !item.image || !item.image.trim());

  console.log(`Hotels: ${hotels.length}`);
  console.log(`Activities: ${attractions.length}`);
  console.log(`Records with image URLs: ${withImages.length}`);
  console.log(`Records without image URLs: ${missing.length}`);
  console.log("\\nChecking image URLs (network access required)...");

  const results = await Promise.all(
    withImages.map(async (item) => ({
      kind: item.kind,
      id: item.id,
      name: item.name,
      status: await checkImage(item.image)
    }))
  );

  const good = results.filter((item) => item.status === "ok");
  const bad = results.filter((item) => item.status !== "ok");

  console.log(`\\nReachable image URLs: ${good.length}`);
  console.log(`URLs needing review: ${bad.length}`);

  for (const item of bad) {
    console.log(`[${item.status}] ${item.kind} ${item.id} — ${item.name}`);
  }

  if (missing.length) {
    console.log("\\nRecords with no image URL yet:");
    for (const item of missing) {
      console.log(`[missing] ${item.kind} ${item.id} — ${item.name}`);
    }
  }
}

main().catch((error) => {
  console.error("Image verification failed:", error);
  process.exitCode = 1;
});
