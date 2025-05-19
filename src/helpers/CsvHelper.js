const fs = require('fs');
const path = require("path");
class CsvHelper {

    constructor() {
        this.timestamp = this.getTimestamp();
        this.columns = ['Address'];
        this.rows = [];
    }

    addColumn(name) {
        this.columns.push(name);
    }

    addRow(row) {
        this.rows.push(row);
    }

    addTestResults(address, testOutputs) {
        const row = [address];
        testOutputs.forEach(testOutput => {
            testOutput.testCases.forEach((testCase) => {
                const exist = this.columnExists(testCase);
                if (!exist) {
                    this.addColumn(testCase);
                }
            });
            testOutput.results.forEach((result) => {
                row.push(result);
            });
        })
        this.addRow(row);
    }



    columnExists(testCase) {
        return this.columns.includes(testCase);
    }

    getTimestamp() {
        return new Date().toISOString().replace(/[:.]/g, '-');
    }

    writeResultsToCSV() {
        const outputDir = path.resolve(__dirname, '../../output');
        const outputFile = path.join(outputDir, `test-results-${this.timestamp}.csv`);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const headers = this.columns.join(',');
        const csvData = this.rows.map(row => row.join(',')).join('\n');
        fs.writeFileSync(outputFile, headers + '\n' + csvData + '\n');
        console.log(`Results saved to: ${outputFile}`);
    }
}

module.exports = CsvHelper;