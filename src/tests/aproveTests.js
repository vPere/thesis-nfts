const { ethers, network } = require("hardhat");
const {IS_NOT_DEFINED} = require("../helpers/nonDefinedHelper");

async function runApproveTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];
    const testCases = [];

    async function testCase(name, to, tokenId, expectSuccess = false) {
        console.log(`⚠ Testing ${name} with input: TO: ${to}, TOKEN_ID: ${tokenId}...`);
        testCases.push(name);
        try {
            const tx = await nft.approve(to, tokenId, {
                gasLimit: 100000,
            });
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

    const validAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    // Invalid input test cases
    await testCase("A: Null address", null, 1);
    await testCase("A: Invalid address (short)", "0x1234", 1);
    await testCase("A: Invalid address (string)", "notAnAddress", 1);
    await testCase("A: Array instead of address", [validAddr], 1);
    await testCase("A: Object instead of address", { to: validAddr }, 1);

    await testCase("A: Null tokenId", validAddr, null);
    await testCase("A: String tokenId", validAddr, "abc");
    await testCase("A: Negative tokenId", validAddr, -1);
    await testCase("A: Float tokenId", validAddr, 1.5);
    await testCase("A: Zero address as 'to'", "0x0000000000000000000000000000000000000000", 1);

    return {testCases, results};
}

module.exports = {
    runApproveTests,
};
