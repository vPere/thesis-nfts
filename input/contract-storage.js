const fs = require("fs-extra");
const path = require("path");
const csv = require("csv-parser");
const INPUT_DIR = path.join(__dirname, "jsons");
const CSV_PATH = path.join(INPUT_DIR, "collections.csv");

function getContractAddresses() {
    return new Promise((resolve, reject) => {
        const addresses = [];

        fs.createReadStream(CSV_PATH)
            .pipe(csv())
            .on("data", (row) => {
                if (row.contract_address) {
                    addresses.push(row.contract_address);
                }
            })
            .on("end", () => {
                resolve(addresses);
            })
            .on("error", (error) => {
                reject(error);
            });
    });
}

module.exports = {
    getContractAddresses,
};
