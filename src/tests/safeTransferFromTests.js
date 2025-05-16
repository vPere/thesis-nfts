const { ethers } = require("hardhat");
const {IS_NOT_DEFINED} = require("../helpers/nonDefinedHelper");

async function runSafeTransferFromTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];
    const testCases = [];

    async function testCase(name, from, to, tokenId) {
        console.log(`⚠ Testing ${name} with input: FROM: ${from}, TO: ${to}, TOKEN_ID: ${tokenId}...`)
        testCases.push(name);
        try {
            const tx = await nft["safeTransferFrom(address,address,uint256)"](from, to, tokenId, {
                gasLimit: 1000000,
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
    const otherAddr = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

    // Invalid input tests
    await testCase("STF: Null from", null, validAddr, 1);
    await testCase("STF: Null to", validAddr, null, 1);
    await testCase("STF: Null tokenId", validAddr, validAddr, null);
    await testCase("STF: Short from", "0x1234", validAddr, 1);
    await testCase("STF: String to", validAddr, "notAnAddress", 1);
    await testCase("STF: Number from", 123, validAddr, 1);
    await testCase("STF: Array to", validAddr, [validAddr], 1);
    await testCase("STF: Object from", { address: validAddr }, validAddr, 1);
    await testCase("STF: Invalid tokenId string", validAddr, validAddr, "invalidTokenId");
    await testCase("STF: Negative tokenId", validAddr, validAddr, -1);
    await testCase("STF: Float tokenId", validAddr, validAddr, 1.5);
    await testCase("STF: Zero address from", "0x0000000000000000000000000000000000000000", otherAddr, 1);
    await testCase("STF: Zero address to", validAddr, "0x0000000000000000000000000000000000000000", 1);

    return {testCases, results};
}

module.exports = {
    runSafeTransferFromTests,
};
