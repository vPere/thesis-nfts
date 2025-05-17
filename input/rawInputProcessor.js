const fs = require("fs-extra");
const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const INPUT_DIR = path.join(__dirname, "jsons");
const OUTPUT_FILE = path.join(__dirname, "collections.csv");

const csvWriter = createCsvWriter({
    path: OUTPUT_FILE,
    header: [
        { id: "name", title: "name" },
        { id: "contractAddress", title: "contract_address" }
    ]
});

async function extractContracts() {
    const allCollections = [];

    const files = (await fs.readdir(INPUT_DIR)).filter(f => f.endsWith(".json"));

    for (const file of files) {
        const filePath = path.join(INPUT_DIR, file);

        try {
            const data = await fs.readJson(filePath);
            const collections = data?.data?.collections || [];

            for (const item of collections) {
                const name = item.name || "N/A";
                const contractAddress = item.contractAddress || "N/A";
                allCollections.push({ name, contractAddress });
            }

            console.log(`Processed ${file} with ${collections.length} entries.`);
        } catch (err) {
            console.error(`Error reading ${file}: ${err.message}`);
        }
    }

    try {
        await csvWriter.writeRecords(allCollections);
        console.log(`✅ Wrote ${allCollections.length} entries to collections.csv`);
    } catch (err) {
        console.error(`❌ Error writing CSV: ${err.message}`);
    }
}

extractContracts();
