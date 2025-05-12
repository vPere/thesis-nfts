const {ethers, network} = require("hardhat");
const fs = require("fs");
const {getContractAddresses} = require("../input/contract-storage");
const Csv = require("./helpers/Csv");
const {runBalanceOfTests} = require("./tests/balanceOfTests");
const {runOwnerOfTests} = require("./tests/ownerOfTests");
const {runTransferFromTests} = require("./tests/transferFromTests");
const {runSafeTransferFromTests} = require("./tests/safeTransferFromTests");
const {LOAD_ABI_FILES, GET_ABI_FILE} = require("./helpers/abiHelper");
const {runApproveTests} = require("./tests/aproveTests");
const {runSetApprovalForAllTests} = require("./tests/setApprovalForAllTests");
const {runGetApprovedTests} = require("./tests/getApprovedTests");
const {runIsApprovedForAllTests} = require("./tests/isApprovedForAllTests");

async function main() {
//from here we'll call all the specific tests for each ERC-721 method.
    const outputFile = outputSetup();
    //load list of contract addresses
    const contractAddresses = getContractAddresses();
    //load the ABI files for each contract address
    await LOAD_ABI_FILES(contractAddresses);

    //create a csv object
    const csv = new Csv();

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

        const testOutput = [];
        // Call Tests on balanceOf
        const balanceOfResults = await runBalanceOfTests(address, abi, signer);
        testOutput.push(balanceOfResults);
        // Call Tests on ownerOf
        //const ownerOfResults = await runOwnerOfTests(address, abi, signer);
        //testOutput.push(ownerOfResults);
        //// Call Tests on transferFrom
        //const transferFromResults = await runTransferFromTests(address, abi, signer);
        //testOutput.push(transferFromResults);
        //// Call Tests on safeTransferFrom
        //const safeTransferFromResults = await runSafeTransferFromTests(address, abi, signer);
        //testOutput.push(safeTransferFromResults);
        //// Call Tests on approve
        //const approveResults = await runApproveTests(address, abi, signer);
        //testOutput.push(approveResults);
        //// Call Tests on setApprovalForAll
        //const setApprovalForAllResults = await runSetApprovalForAllTests(address, abi, signer);
        //testOutput.push(setApprovalForAllResults);
        //// Call Tests on getApproved
        //const getApprovedResults = await runGetApprovedTests(address, abi, signer);
        //testOutput.push(getApprovedResults);
        //// Call Tests on isApprovedForAll
        //const isApprovedForAllResults = await runIsApprovedForAllTests(address, abi, signer);
        //testOutput.push(isApprovedForAllResults);

        csv.addTestResults(address, testOutput);
    }
    console.log("END");
}

async function impersonateKnownAddress() {
    const minter = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Example: replace with a known minter address
    try {
        await network.provider.request({
            method: 'hardhat_impersonateAccount',
            params: [minter],
        });
        const funder = (await ethers.getSigners())[0]; // default account with ETH

        // Set the funder's balance to a high value
        await network.provider.request({
            method: 'hardhat_setBalance',
            params: [
                funder.address,
                ethers.utils.parseEther("100000000.0").toHexString(), // Set balance to 1000 ETH
            ],
        });

        // Send some ETH to the minter address
        await funder.sendTransaction({
            to: minter,
            value: ethers.utils.parseEther("1000.0"), // send 1000 ETH
            gasLimit: 210000,
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
