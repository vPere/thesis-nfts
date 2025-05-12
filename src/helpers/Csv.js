const fs = require('fs');
const path = require("path");
class Csv {

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

    /*
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
            const headers = ['Address']; //TODO: add proper headers (for all tests)
            const csvData = headers.join(',');
            const outputDir = path.resolve(__dirname, '../../output');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, {recursive: true});
            }

            const filename = path.join(outputDir, `data-${timestamp}.csv`);
            fs.writeFileSync(filename, csvData + '\n');

            return filename;
        }
    */
    getTimestamp() {
        return new Date().toISOString().replace(/[:.]/g, '-');
    }
}

module.exports = Csv;