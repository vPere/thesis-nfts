const { ethers } = require("hardhat");
const {IS_NOT_DEFINED} = require("../helpers/nonDefinedHelper");

async function runOwnerOfTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];
    const testCases = [];

    async function testCase(name, input, expectSuccess = false) {
        console.log(`⚠ Testing ${name} with input: ${input}...`);
        testCases.push(name);
        try {
            await nft.ownerOf(input);
            if (expectSuccess) {
                console.log("\t ✅ TEST PASS: Expected success ");
                results.push('"PASS"');
            } else {
                console.log("\t ❌ TEST FAIL: Unexpected success ");
                results.push('"FAIL"'); // unexpected success
            }
        } catch (err) {
            if (IS_NOT_DEFINED(err.message)) {
                console.log("\t · TEST N/A: Method is not defined");
                results.push('"N/A"'); // method not defined
                return;
            }
            if (expectSuccess) {
                console.log("\t ❌ TEST FAIL: Unexpected error " + err.message);
                results.push('"FAIL"'); // unexpected error
            } else {
                console.log("\t ✅ TEST PASS: Expected error " + err.message);
                results.push('"PASS"');
            }
        }
    }

    await testCase("OO: Null input", null);
    await testCase("OO: Undefined", undefined);
    await testCase("OO: Negative tokenId", -1);
    //await testCase("Zero tokenId (could be valid)", 0, true); // often valid!
    await testCase("OO: String instead of number", "notATokenId");
    await testCase("OO: Large number", ethers.constants.MaxUint256); // may or may not exist
    await testCase("OO: Floating-point number", 1.5);
    await testCase("OO: Boolean input", true);
    await testCase("OO: Object instead of number", { id: 1 });
    await testCase("OO: Array instead of number", [1]);
    await testCase("OO: Array with more than one number", [1,2,3]);
    //TODO: Check for valid tokenId in the contract

    return {testCases, results};
}

module.exports = {
    runOwnerOfTests,
};
