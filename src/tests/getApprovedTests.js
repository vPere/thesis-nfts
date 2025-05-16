const { ethers } = require("hardhat");
const {IS_NOT_DEFINED} = require("../helpers/nonDefinedHelper");

async function runGetApprovedTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];
    const testCases = [];

    async function testCase(name, tokenId, expectSuccess = false) {
        console.log(`⚠ Testing ${name} with input: TOKEN_ID: ${tokenId}...`);
        testCases.push(name);
        try {
            const approvedAddress = await nft.getApproved(tokenId);
            console.log("\t ❌ TEST FAIL: Unexpected success");
            results.push('"FAIL"');
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

    // Invalid input test cases
    await testCase("GA: Null tokenId", null);
    await testCase("GA: String tokenId", "abc");
    await testCase("GA: Negative tokenId", -1);
    await testCase("GA: Float tokenId", 1.5);

    return {testCases, results};
}

module.exports = {
    runGetApprovedTests,
};