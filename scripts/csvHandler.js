const fs = require('fs');
const path = require("path");
class CSVHandler {

    static buildRow(address) {
        return {
        Address: address,
        Test1: '',
        Test2: '',
        Test3: '',
        Test4: '',
        Test5: '',
        };
    }

    static setTestResult(row, testName, value) {
        if (!(testName in row)) {
        console.error(`Invalid test name: ${testName}`);
        return;
        }
        row[testName] = value;
    }

    static appendRowToCSV(row, timestamp) {
        const outputDir = path.resolve(__dirname, '../output');
        const filename = path.join(outputDir, `data-${timestamp}.csv`);
        const values = [
            row.Address,
            row.Test1,
            row.Test2,
            row.Test3,
            row.Test4,
            row.Test5,
        ];
        fs.appendFileSync(filename, values.join(',') + '\n');
    }

    static createOutputCSV(timestamp) {
        const headers = ['Address', 'Test1', 'Test2', 'Test3', 'Test4', 'Test5'];
        const csvData = headers.join(',');
        const outputDir = path.resolve(__dirname, '../output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, {recursive: true});
        }

        const filename = path.join(outputDir, `data-${timestamp}.csv`);
        fs.writeFileSync(filename, csvData + '\n');
    }
    static getTimestamp() {
        return new Date().toISOString().replace(/[:.]/g, '-');
    }
}

module.exports = CSVHandler;