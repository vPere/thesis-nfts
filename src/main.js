const {ethers, network} = require("hardhat");
const fs = require("fs");
const {getContractAddresses} = require("./helpers/contract-storage");
const Csv = require("./helpers/CsvHelper");
const {runBalanceOfTests} = require("./tests/balanceOfTests");
const {runOwnerOfTests} = require("./tests/ownerOfTests");
const {runTransferFromTests} = require("./tests/transferFromTests");
const {runSafeTransferFromTests} = require("./tests/safeTransferFromTests");
const {LOAD_ABI_FILES, GET_ABI_FILE} = require("./helpers/abiHelper");
const {runApproveTests} = require("./tests/approveTests");
const {runSetApprovalForAllTests} = require("./tests/setApprovalForAllTests");
const {runGetApprovedTests} = require("./tests/getApprovedTests");
const {runIsApprovedForAllTests} = require("./tests/isApprovedForAllTests");
const {runSupportsInterfaceTests} = require("./helpers/supportsInterfaceHelper");
const {runSafeTransferFromWithDataTests} = require("./tests/safeTransferFrom-WithData-Tests");

async function main() {
//from here we'll call all the specific tests for each ERC-721 method.
    //load list of contract addresses
    const contractAddresses = await getContractAddresses();
    //load the ABI files for each contract address
    const numOfAbis = await LOAD_ABI_FILES(contractAddresses);

    //create a csv object
    const csv = new Csv();
    console.log('Running tests for ' + numOfAbis + ' contracts...');
    for (const address of contractAddresses) {
        console.log(`\n\n🔵🔵🔵Testing ${address}...🔵🔵🔵`);

        const abiFile = GET_ABI_FILE(address);
        if (abiFile === "0") {
            console.log("❌ Unable to find abi file for: " + address + "skipping address...");
            continue;
        }
        //read the abi file
        const abi = JSON.parse(fs.readFileSync(abiFile, 'utf8'));

        // Impersonate a known privileged address (e.g., minter)
        const signer = await impersonateKnownAddress();

        const testOutputs = [];
        // Call Tests of ERC 165: "supportsInterface"
        const supportsInterfaceResults = await runSupportsInterfaceTests(address, abi, signer);
        testOutputs.push(supportsInterfaceResults);

        if (!supportsInterfaceResults.results.includes("PASS")) {
            console.log("❌ Skipping tests for " + address + " because it does not support ERC721.");
            csv.addTestResults(address, testOutputs);
            continue;
        }

        // Call Tests on balanceOf
        const balanceOfResults = await runBalanceOfTests(address, abi, signer);
        testOutputs.push(balanceOfResults);
        // Call Tests on ownerOf
        const ownerOfResults = await runOwnerOfTests(address, abi, signer);
        testOutputs.push(ownerOfResults);
        // Call Tests on transferFrom
        const transferFromResults = await runTransferFromTests(address, abi, signer);
        testOutputs.push(transferFromResults);
        // Call Tests on safeTransferFrom
        const safeTransferFromResults = await runSafeTransferFromTests(address, abi, signer);
        testOutputs.push(safeTransferFromResults);
        // Call Tests on safeTransferFrom with extra data parameter
        const safeTransferFromWithDataResults = await runSafeTransferFromWithDataTests(address, abi, signer);
        testOutputs.push(safeTransferFromWithDataResults);
        // Call Tests on approve
        const approveResults = await runApproveTests(address, abi, signer);
        testOutputs.push(approveResults);
        // Call Tests on setApprovalForAll
        const setApprovalForAllResults = await runSetApprovalForAllTests(address, abi, signer);
        testOutputs.push(setApprovalForAllResults);
        // Call Tests on getApproved
        const getApprovedResults = await runGetApprovedTests(address, abi, signer);
        testOutputs.push(getApprovedResults);
        // Call Tests on isApprovedForAll
        const isApprovedForAllResults = await runIsApprovedForAllTests(address, abi, signer);
        testOutputs.push(isApprovedForAllResults);

        csv.addTestResults(address, testOutputs);
    }
    // Write the results to the CSV file
    csv.writeResultsToCSV();
    console.log("END");
}

async function impersonateKnownAddress() {
    const minter = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Example: replace with a known minter address
    try {
        await network.provider.request({
            method: 'hardhat_impersonateAccount',
            params: [minter],
        });
        console.log(`Impersonating account: ${minter}`);
        const balance = await ethers.provider.getBalance(minter);
        console.log(`Balance of ${minter}: ${ethers.utils.formatEther(balance)} ETH`);

        await network.provider.send("hardhat_setBalance", [
            minter,
            ethers.utils.parseEther("10000000000000").toHexString(),
        ]);
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }

    return await ethers.getSigner(minter);
}

main();
