const {ethers, network} = require("hardhat");
const fs = require("fs");
const {getContractAddresses} = require("../input/contract-storage");
const {AbiHelper} = require("../scripts/abiHelper");
const {address} = require("hardhat/internal/core/config/config-validation");
const CsvHelper = require("../scripts/csvHelper");
const {runBalanceOfTests} = require("./balanceOfTests");
const {runOwnerOfTests} = require("./ownerOfTests");
const {runTransferFromTests} = require("./trasferFromTests");
const {runSafeTransferFromTests} = require("./saveTransferFromTests");

async function main() {
//from here we'll call all the specific tests for each ERC-721 method.
    const outputFile = outputSetup();
    //load list of contract addresses
    const contractAddresses = getContractAddresses();
    //load the ABI files for each contract address
    const abiHelper = new AbiHelper(contractAddresses);
    for (address of contractAddresses) {
        const abiFile = abiHelper.getAbiFile(address);

        if (abiFile === "0") {
            console.log("❌ Unable to find abi file for: " + address + "skipping address...");
            continue;
        }
        //read the abi file
        const abi = JSON.parse(fs.readFileSync(abiFile, 'utf8'));

        // Impersonate a known privileged address (e.g., minter)
        const signer = await impersonateKnownAddress();

        // prepare CSV row for this contract
        let contractResults = CsvHelper.BUILD_ROW(address);

        console.log(`Testing ${address}...`);
        // Call Tests on balanceOf
        const balanceOfResults = await runBalanceOfTests(address, abi, signer);
        contractResults = CsvHelper.APPEND_RESULT_TO_ROW(contractResults, balanceOfResults);
        // Call Tests on ownerOf
        const ownerOfResults = await runOwnerOfTests(address, abi, signer);
        contractResults = CsvHelper.APPEND_RESULT_TO_ROW(contractResults, ownerOfResults);
        // Call Tests on transferFrom
        const transferFromResults = await runTransferFromTests(address, abi, signer);
        contractResults = CsvHelper.APPEND_RESULT_TO_ROW(contractResults, transferFromResults);
        // Call Tests on safeTransferFrom
        const saveTransferFromResults = await runSafeTransferFromTests(address, abi, signer);
        contractResults = CsvHelper.APPEND_RESULT_TO_ROW(contractResults, saveTransferFromResults);
        // TODO: Call Tests on approve
        // TODO: Call Tests on setApprovalForAll
        // TODO: Call Tests on getApproved
        // TODO: Call Tests on isApprovedForAll

        // Append row to CSV file
        CsvHelper.APPEND_ROW_TO_CSV(outputFile, contractResults);
    }
    console.log("END");
}

async function impersonateKnownAddress() {
    const minter = '0x29469395eAf6f95920E59F858042f0e28D98a20B'; // Example: replace with a known minter address
    try {
        await network.provider.request({
            method: 'hardhat_impersonateAccount',
            params: [minter],
        });
        const funder = (await ethers.getSigners())[0]; // default account with ETH
        await funder.sendTransaction({
            to: minter,
            value: ethers.utils.parseEther("1.0"), // send 1 ETH
        });
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }

    return await ethers.getSigner(minter);
}

// function to setup the outputCSV file calling the csvHandler
function outputSetup() {
    const csvHelper = new CsvHelper();
    const filename = csvHelper.createOutputCSV(csvHelper.timestamp);
    console.log('Test run started at: ', csvHelper.timestamp);
    console.log('Output file created at: ', filename);
    return filename;
}

main();
