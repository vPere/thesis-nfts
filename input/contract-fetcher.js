const fetch = require("node-fetch");
const fs = require("fs-extra");
const path = require("path");

const BASE_URL = "https://api.coinmarketcap.com/nft/v3/nft/collectionsv2";
const OUTPUT_DIR = path.join(__dirname, "jsons");
const TOTAL_PAGES = 32;
const ITEMS_PER_PAGE = 100;

// Ensure the output directory exists
fs.ensureDirSync(OUTPUT_DIR);

async function fetchPage(page) {
    const start = page * ITEMS_PER_PAGE;
    const params = new URLSearchParams({
        start: start.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        category: "",
        collection: "Ethereum",
        period: "4",
        desc: "true",
        sort: "volume",
    });

    const url = `${BASE_URL}?${params.toString()}`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }

        const json = await res.json();
        const filePath = path.join(OUTPUT_DIR, `page_${page}.json`);
        await fs.writeJson(filePath, json, { spaces: 2 });
        console.log(`Saved page ${page}`);
    } catch (err) {
        console.error(`Error fetching page ${page}:`, err.message);
    }
}

async function fetchAllPages() {
    for (let i = 0; i < TOTAL_PAGES; i++) {
        await fetchPage(i);
        await new Promise(r => setTimeout(r, 1000)); // polite delay
    }
}

fetchAllPages();
