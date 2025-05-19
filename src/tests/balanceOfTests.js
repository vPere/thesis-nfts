const { ethers } = require("hardhat");
const {IS_NOT_DEFINED} = require("../helpers/nonDefinedHelper");

async function runBalanceOfTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];
    const testCases = [];

    async function testCase(name, input, expectSuccess = false) {
        console.log(`⚠ Testing ${name} with input: ${input}...`);
        // Add test case to the list
        testCases.push(name);
        try {
            await nft.balanceOf(input);
            console.log("\t ❌ TEST FAIL: Unexpected success ");
            results.push('"FAIL"'); // unexpected success
        } catch (err) {
            //CHECK if the error message is due to the method not being defined
            if (IS_NOT_DEFINED(err.message)) {
                console.log("\t · TEST N/A: Method is not defined");
                results.push('"N/A"'); // method not defined
            } else {
                console.log("\t ✅ TEST PASS: Expected error " + err.message);
                results.push('"PASS"');
            }
        }
    }

    await testCase("BO: Null input", null);
    await testCase("BO: Empty string", "");
    await testCase("BO: Short address", "0x1234");
    await testCase("BO: Invalid hex", "notAnAddress");
    await testCase("BO: Zero address", "0x0000000000000000000000000000000000000000");
    await testCase("BO: Number instead of address", 123456);
    await testCase("BO: Boolean instead of address", true);
    await testCase("BO: Array instead of address", ["0x0000000000000000000000000000000000000000"]);
    await testCase("BO: Object instead of address", { address: "0x0000000000000000000000000000000000000000" });
    await testCase("BO: Invalid length address", "0x1234567890abcdef");

    return {testCases, results};
}

module.exports = {
    runBalanceOfTests,
};
