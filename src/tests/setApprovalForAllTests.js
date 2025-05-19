const { ethers } = require("hardhat");
const {IS_NOT_DEFINED} = require("../helpers/nonDefinedHelper");

async function runSetApprovalForAllTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];
    const testCases = [];

    async function testCase(name, operator, approved) {
        console.log(`⚠ Testing ${name} with input: OPERATOR: ${operator}, APPROVED: ${approved}...`);
        testCases.push(name);
        try {
            await nft.setApprovalForAll(operator, approved, {
                gasLimit: 30000,
            });
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

    const validAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    // Invalid input test cases
    await testCase("SAFA: Null operator address", null, true);
    await testCase("SAFA: Invalid operator address (short)", "0x1234", true);
    await testCase("SAFA: Invalid operator address (string)", "notAnAddress", true);
    await testCase("SAFA: Array instead of operator address", [validAddr], true);
    await testCase("SAFA: Object instead of operator address", { operator: validAddr }, true);
    //await testCase("SAFA: Zero address as operator", "0x0000000000000000000000000000000000000000", true, true); Not specified in ERC721 as invalid input

    return {testCases, results};
}

module.exports = {
    runSetApprovalForAllTests,
};