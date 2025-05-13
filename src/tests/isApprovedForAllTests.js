const { ethers, network } = require("hardhat");
const {IS_NOT_DEFINED} = require("../helpers/nonDefinedHelper");

async function runIsApprovedForAllTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];
    const testCases = [];

    async function testCase(name, owner, operator, expectSuccess = false) {
        console.log(`⚠ Testing ${name} with input: OWNER: ${owner}, OPERATOR: ${operator}...`);
        testCases.push(name)
        try {
            const isApproved = await nft.isApprovedForAll(owner, operator);
            if (expectSuccess) {
                console.log(`\t ✅ TEST PASS: isApprovedForAll returned ${isApproved}`);
                results.push('"PASS"');
            } else {
                console.log("\t ❌ TEST FAIL: Unexpected success");
                results.push('"FAIL"');
            }
        } catch (err) {
            if (IS_NOT_DEFINED(err.message)) {
                console.log("\t · TEST N/A: Method is not defined");
                results.push('"N/A"'); // method not defined
                return;
            }
            if (expectSuccess) {
                console.log("\t ❌ TEST FAIL: Unexpected error " + err.message);
                results.push('"FAIL"');
            } else {
                console.log("\t ✅ TEST PASS: Expected error " + err.message);
                results.push('"PASS"');
            }
        }
    }

    const validAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    // Invalid input test cases
    await testCase("IAFA: Null owner address", null, validAddr);
    await testCase("IAFA: Null operator address", validAddr, null);
    await testCase("IAFA: Invalid owner address (short)", "0x1234", validAddr);
    await testCase("IAFA: Invalid operator address (short)", validAddr, "0x1234");
    await testCase("IAFA: Invalid owner address (string)", "notAnAddress", validAddr, true);
    await testCase("IAFA: Invalid operator address (string)", validAddr, "notAnAddress");
    await testCase("IAFA: Zero address as owner", "0x0000000000000000000000000000000000000000", validAddr);
    await testCase("IAFA: Zero address as operator", validAddr, "0x0000000000000000000000000000000000000000", true);

    // Valid test case via impersonation
    console.log("------------------------------------ Testing valid isApprovedForAll via impersonation...------------------------------------");
    const owner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Replace with a known owner
    const operator = "0x0000000000000000000000000000000000000002"; // Replace with a valid operator
    testCases.push("IAFA: Valid via impersonation");
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [owner],
    });

    const impersonatedSigner = await ethers.getSigner(owner);
    const nftAsOwner = await ethers.getContractAt(abi, address, impersonatedSigner);

    try {
        const isApproved = await nftAsOwner.isApprovedForAll(owner, operator);
        console.log(`\t ✅ TEST PASS: isApprovedForAll returned ${isApproved}`);
        results.push('"PASS"');
    } catch (err) {
        if (IS_NOT_DEFINED(err.message)) {
            console.log("\t · TEST N/A: Method is not defined");
            results.push('"N/A"'); // method not defined
        } else {
            console.log("\t ❌ TEST FAIL: Unexpected error " + err.message);
            results.push('"FAIL"');
        }
    }

    await network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [owner],
    });

    return {testCases, results};
}

module.exports = {
    runIsApprovedForAllTests,
};