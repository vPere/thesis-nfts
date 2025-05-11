const { ethers } = require("hardhat");

async function runOwnerOfTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];

    async function testCase(name, input, expectSuccess = false) {
        console.log(`⚠ Testing ${name} with input: ${input}...`);
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
            if (expectSuccess) {
                console.log("\t ❌ TEST FAIL: Unexpected error " + err.message);
                results.push('"FAIL"'); // unexpected error
            } else {
                console.log("\t ✅ TEST PASS: Expected error " + err.message);
                results.push('"PASS"');
            }
        }
    }

    await testCase("Null input", null);
    await testCase("Undefined", undefined);
    await testCase("Negative tokenId", -1);
    await testCase("Zero tokenId (could be valid)", 0, true); // often valid!
    await testCase("String instead of number", "notATokenId");
    await testCase("Large number", ethers.constants.MaxUint256); // may or may not exist
    await testCase("Floating-point number", 1.5);
    await testCase("Boolean input", true);
    await testCase("Object instead of number", { id: 1 });
    await testCase("Array instead of number", [1]);
    await testCase("Array with more than one number", [1,2,3]);
    //TODO: Check for valid tokenId in the contract

    return results.join(",");
}

module.exports = {
    runOwnerOfTests,
};
