const fs = require('fs');
const path = require("path");
class CsvHelper {

    constructor() {
        this.timestamp = this.getTimestamp();
    }

    static BUILD_ROW(address) {
        return {
        Address: address,
        };
    }

    static APPEND_RESULT_TO_ROW(allResultsRow, methodResultsString) {
        const methodResults = methodResultsString.split(',');
        methodResults.forEach((result) => {
            const testName = `Test${Object.keys(allResultsRow).length + 1}`;
            allResultsRow[testName] = result;
        });
        return allResultsRow;
    }

    static APPEND_ROW_TO_CSV(file, csvRow) {
        const csvData = Object.values(csvRow).join(',');
        fs.appendFileSync(file, csvData + '\n');
    }

    setTestResult(row, testName, value) {
        if (!(testName in row)) {
        console.error(`Invalid test name: ${testName}`);
        return;
        }
        row[testName] = value;
    }

    createOutputCSV(timestamp) {
        const headers = ['Address', 'Test1', 'Test2', 'Test3', 'Test4', 'Test5', 'Test6']; //TODO: add proper headers (for all tests)
        const csvData = headers.join(',');
        const outputDir = path.resolve(__dirname, '../../output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, {recursive: true});
        }

        const filename = path.join(outputDir, `data-${timestamp}.csv`);
        fs.writeFileSync(filename, csvData + '\n');

        return filename;
    }
    getTimestamp() {
        return new Date().toISOString().replace(/[:.]/g, '-');
    }
}

module.exports = CsvHelper;