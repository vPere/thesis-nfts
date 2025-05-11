const { ethers, network } = require("hardhat");

async function runSetApprovalForAllTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];

    async function testCase(name, operator, approved, expectSuccess = false) {
        console.log(`⚠ Testing ${name} with input: OPERATOR: ${operator}, APPROVED: ${approved}...`);
        try {
            const tx = await nft.setApprovalForAll(operator, approved, {
                gasLimit: 100000,
            });
            if (expectSuccess) {
                await tx.wait();
                console.log("\t ✅ TEST PASS: Expected success");
                results.push('"PASS"');
            } else {
                console.log("\t ❌ TEST FAIL: Unexpected success");
                results.push('"FAIL"');
            }
        } catch (err) {
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
    await testCase("Null operator address", null, true);
    await testCase("Invalid operator address (short)", "0x1234", true);
    await testCase("Invalid operator address (string)", "notAnAddress", true);
    await testCase("Array instead of operator address", [validAddr], true);
    await testCase("Object instead of operator address", { operator: validAddr }, true);
    await testCase("Zero address as operator", "0x0000000000000000000000000000000000000000", true);

    // Valid test case via impersonation
    console.log("------------------------------------ Testing valid setApprovalForAll via impersonation...------------------------");
    const owner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Replace with a known owner
    const operator = "0x0000000000000000000000000000000000000002"; // Replace with a valid operator

    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [owner],
    });

    const impersonatedSigner = await ethers.getSigner(owner);
    const nftAsOwner = await ethers.getContractAt(abi, address, impersonatedSigner);

    try {
        const tx = await nftAsOwner.setApprovalForAll(operator, true, {
            gasLimit: 100000,
        });
        await tx.wait();
        console.log("\t ✅ TEST PASS: Successfully set approval for all");
        results.push('"PASS"');
    } catch (err) {
        console.log("\t ❌ TEST FAIL: Unexpected error " + err.message);
        results.push('"FAIL"');
    }

    await network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [owner],
    });

    return results.join(",");
}

module.exports = {
    runSetApprovalForAllTests,
};