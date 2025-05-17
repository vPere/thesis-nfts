const { ethers, network } = require("hardhat");
const {IS_NOT_DEFINED} = require("../helpers/nonDefinedHelper");

async function runSetApprovalForAllTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];
    const testCases = [];

    async function testCase(name, operator, approved) {
        console.log(`⚠ Testing ${name} with input: OPERATOR: ${operator}, APPROVED: ${approved}...`);
        testCases.push(name);
        try {
            const tx = await nft.setApprovalForAll(operator, approved, {
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

    // Valid test case via impersonation
    console.log("------------------------------------ Testing valid setApprovalForAll via impersonation...------------------------------------");
    const operator = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const owner = "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E";
    testCases.push("SAFA: Valid via impersonation");
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [owner],
    });

    const impersonatedSigner = await ethers.getSigner(owner);
    const nftAsOwner = await ethers.getContractAt(abi, address, impersonatedSigner);

    try {
        const tx = await nftAsOwner.setApprovalForAll(operator, true);
        await tx.wait();
        console.log("\t ✅ TEST PASS: Successfully set approval for all");
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
    runSetApprovalForAllTests,
};