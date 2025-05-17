const { ethers } = require("hardhat");
const {IS_NOT_DEFINED} = require("../helpers/nonDefinedHelper");

async function runTransferFromTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];
    const testCases = [];

    async function testCase(name, from, to, tokenId) {
        console.log(`⚠ Testing ${name} with input: FROM: ${from}, TO: ${to}, TOKEN_ID: ${tokenId}...`);
        testCases.push(name);
        try {
            const tx = await nft.transferFrom(from, to, tokenId);
                console.log("\t ❌ TEST FAIL: Unexpected success ");
                results.push('"FAIL"'); // unexpected success
        } catch (err) {
            if (IS_NOT_DEFINED(err.message)) {
                console.log("\t · TEST N/A: Method is not defined");
                results.push('"N/A"'); // method not defined
            } else {
                console.log("\t ✅ TEST PASS: Expected error " + err.message);
                results.push('"PASS"');
            }
        }
    }

    const validAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; //should have enough funds
    const otherAddr = "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E"; //idk if it has enough funds

    // Invalid input tests
    await testCase("TF: Null from", null, validAddr, 1);
    await testCase("TF: Null to", validAddr, null, 1);
    await testCase("TF: Null tokenId", validAddr, otherAddr, null);
    await testCase("TF: Invalid from address (short)", "0x1234", validAddr, 1);
    await testCase("TF: Invalid to address (short)",validAddr, "0x1234", 1);
    await testCase("TF: Invalid from address (string)", "notAnAddress", otherAddr, 1);
    await testCase("TF: Invalid to address (string)",validAddr, "notAnAddress", 1);
    await testCase("TF: Number instead of from", 123, otherAddr, 1);
    await testCase("TF: Array instead of to", validAddr, [otherAddr], 1);
    await testCase("TF: Object instead of from", { address: validAddr }, otherAddr, 1);
    await testCase("TF: String tokenId", validAddr, otherAddr, "invalidTokenId");
    await testCase("TF: Negative tokenId", validAddr, otherAddr, -1);
    await testCase("TF: Float tokenId", validAddr, otherAddr, 1.5);
    await testCase("TF: Zero address from", "0x0000000000000000000000000000000000000000", otherAddr, 1);
    await testCase("TF: Zero address to", validAddr, "0x0000000000000000000000000000000000000000", 1);

    return {testCases, results};
}

module.exports = {
    runTransferFromTests,
};
