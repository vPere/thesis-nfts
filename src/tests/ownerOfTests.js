const { ethers } = require("hardhat");
const {IS_NOT_DEFINED} = require("../helpers/nonDefinedHelper");

async function runOwnerOfTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];
    const testCases = [];

    async function testCase(name, input) {
        console.log(`⚠ Testing ${name} with input: ` + input + `...`);
        testCases.push(name);
        try {
            const owner = await nft.ownerOf(input);
                // ensure the owner is not equal to the zero address
                if (owner === ethers.constants.AddressZero) {
                    console.log("\t ❌ TEST FAIL: Unexpected zero address " + owner);
                    results.push('"FAIL"'); // unexpected zero address
                } else {
                    console.log("\t ✅ TEST PASS: " + owner);
                    results.push('"PASS"');
                }
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

    await testCase("OO: Null input", null);
    await testCase("OO: Undefined", undefined);
    await testCase("OO: Negative tokenId", -1);
    await testCase("OO: String instead of number", "notATokenId");
    await testCase("OO: Large number", ethers.constants.MaxUint256);
    await testCase("OO: Floating-point number", 1.5);
    await testCase("OO: Boolean input", true);
    await testCase("OO: Object instead of number", { id: 1 });


    return {testCases, results};
}

module.exports = {
    runOwnerOfTests,
};
