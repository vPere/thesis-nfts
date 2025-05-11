const { ethers } = require("hardhat");

async function runBalanceOfTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];

    async function testCase(name, input, expectSuccess = false) {
        console.log(`⚠️ ⚠️ Testing ${name} with input: ${input} ⚠️ ⚠️`);
        try {
            await nft.balanceOf(input);
            if (expectSuccess) {
                console.log("\t ✅ TEST PASS: Expected success ");
                results.push('"PASS"');
            } else {
                console.log("\t\t ❌ TEST FAIL: Unexpected success ");
                results.push('"FAIL"'); // unexpected success
            }
        } catch (err) {
            if (expectSuccess) {
                console.log("\t\t ❌ TEST FAIL: Unexpected error " + err.message);
                results.push('"FAIL"'); // unexpected error
            } else {
                console.log("\t ✅ TEST PASS: Expected error " + err.message);
                results.push('"PASS"');
            }
        }
    }

    await testCase("Null input", null);
    await testCase("Empty string", "");
    await testCase("Short address", "0x1234");
    await testCase("Invalid hex", "notAnAddress");
    await testCase("Zero address (valid)", "0x0000000000000000000000000000000000000000", true);
    await testCase("Number instead of address", 123456);
    await testCase("Boolean instead of address", true);
    await testCase("Array instead of address", ["0x0000000000000000000000000000000000000000"]);
    await testCase("Object instead of address", { address: "0x0000000000000000000000000000000000000000" });
    await testCase("Invalid length address", "0x1234567890abcdef");

    return results.join(",");
}

module.exports = {
    runBalanceOfTests,
};
