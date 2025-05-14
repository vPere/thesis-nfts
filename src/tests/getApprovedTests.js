const { ethers, network } = require("hardhat");
const {IS_NOT_DEFINED} = require("../helpers/nonDefinedHelper");

async function runGetApprovedTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];
    const testCases = [];

    async function testCase(name, tokenId, expectSuccess = false) {
        console.log(`⚠ Testing ${name} with input: TOKEN_ID: ${tokenId}...`);
        testCases.push(name);
        try {
            const approvedAddress = await nft.getApproved(tokenId);
            if (expectSuccess) {
                console.log(`\t ✅ TEST PASS: Approved address is ${approvedAddress}`);
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

    // Invalid input test cases
    await testCase("GA: Null tokenId", null);
    await testCase("GA: String tokenId", "abc");
    await testCase("GA: Negative tokenId", -1);
    await testCase("GA: Float tokenId", 1.5);

    // Valid test case via impersonation
    console.log("------------------------------------ Testing valid getApproved via impersonation...------------------------------------");
    const owner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Replace with a known owner
    const tokenId = 2222; // Replace with a valid token ID
    testCases.push("GA: Valid via impersonation");
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [owner],
    });

    const impersonatedSigner = await ethers.getSigner(owner);
    const nftAsOwner = await ethers.getContractAt(abi, address, impersonatedSigner);

    try {
        const approvedAddress = await nftAsOwner.getApproved(tokenId);
        console.log(`\t ✅ TEST PASS: Approved address is ${approvedAddress}`);
        results.push('"PASS"');
    } catch (err) {if (IS_NOT_DEFINED(err.message)) {
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
    runGetApprovedTests,
};