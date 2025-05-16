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
    await testCase("OO: String that looks line a number instead of number", "123"); //TODO: Check this possible case later?
    await testCase("OO: Large number", ethers.constants.MaxUint256);
    await testCase("OO: Floating-point number", 1.5);
    await testCase("OO: Boolean input", true);
    await testCase("OO: Object instead of number", { id: 1 });
    /* TODO: Show to Andreas
    const input = ethers.BigNumber.from([1,2,3]);
    console.log("Encoded input: ", input);
    console.log("Input type:", typeof input);
    console.log("Actual input value:", input);
    await testCase("OO: Number", input);
    await testCase("OO: Array instead of a number", [1,2,3]);*/

    return {testCases, results};
}

module.exports = {
    runOwnerOfTests,
};
