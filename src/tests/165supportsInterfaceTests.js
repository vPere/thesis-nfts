// src/tests/165supportsInterfaceTests.js
const { ethers } = require("ethers");

/**
 * Runs tests for the supportsInterface function of the contract.
 * @param {string} address - The contract address.
 * @param {Array} abi - The ABI of the contract.
 * @param {Object} signer - The signer object to interact with the contract.
 * @returns {Object} - The test results.
 */
async function runSupportsInterfaceTests(address, abi, signer) {
    console.log(`\n🔍 Running supportsInterface tests for contract: ${address}`);
    const results = [];
    const testCases = ["ERC165: supportsInterface"];

    try {
        // Create a contract instance
        const contract = new ethers.Contract(address, abi, signer);

        // ERC-721 interface ID
        const ERC721_INTERFACE_ID = "0x80ac58cd";

        // Call supportsInterface with the ERC-721 interface ID
        const supportsERC721 = await contract.supportsInterface(ERC721_INTERFACE_ID);

        if (supportsERC721) {
            results.push("PASS");
            console.log(`✅ Contract supports ERC-721 interface.`);
        } else {
            results.push("FAIL");
            console.log(`❌ Contract does not support ERC-721 interface.`);
        }
    } catch (error) {
        console.log(`❌ Error during supportsInterface test: ${error.message}`);
        results.push("N/A");
    }

    return {testCases, results};
}

module.exports = { runSupportsInterfaceTests };