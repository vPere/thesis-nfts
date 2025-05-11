const { ethers, network } = require("hardhat");

async function runApproveTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];

    async function testCase(name, to, tokenId, expectSuccess = false) {
        console.log(`⚠ Testing ${name} with input: TO: ${to}, TOKEN_ID: ${tokenId}...`);
        try {
            const tx = await nft.approve(to, tokenId, {
                gasLimit: 100000,
            });
            if (expectSuccess) {
                await tx.wait();
                console.log("\t ✅ TEST PASS: Expected success ");
                results.push('"PASS"');
            } else {
                console.log("\t ❌ TEST FAIL: Unexpected success ");
                results.push('"FAIL"'); // unexpected success
            }
        } catch (err) {
            if (NonDefinedHelper.IS_NOT_DEFINED(err.message)) {
                console.log("\t · TEST N/A: Method is not defined");
                results.push('"N/A"'); // method not defined
                return;
            }
            if (expectSuccess) {
                console.log("\t ❌ TEST FAIL: Unexpected error " + err.message);
                results.push('"FAIL"'); // unexpected failure
            } else {
                console.log("\t ✅ TEST PASS: Expected error " + err.message);
                results.push('"PASS"');
            }
        }
    }

    const validAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    // Invalid input test cases
    await testCase("Null address", null, 1);
    await testCase("Invalid address (short)", "0x1234", 1);
    await testCase("Invalid address (string)", "notAnAddress", 1);
    await testCase("Array instead of address", [validAddr], 1);
    await testCase("Object instead of address", { to: validAddr }, 1);

    await testCase("Null tokenId", validAddr, null);
    await testCase("String tokenId", validAddr, "abc");
    await testCase("Negative tokenId", validAddr, -1);
    await testCase("Float tokenId", validAddr, 1.5);
    await testCase("Zero address as 'to'", "0x0000000000000000000000000000000000000000", 1);

    /*
    // ✅ Valid test via impersonation
    const holder = "0x5a4F225A8E42f2a5c93Aa74fDbC1efC6Fe6720e1"; // Replace with real holder
    const tokenId = 12345; // Replace with real token ID
    const recipient = "0x0000000000000000000000000000000000000002";

    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [holder],
    });

    const impersonatedSigner = await ethers.getSigner(holder);
    const nftAsHolder = await ethers.getContractAt(abi, address, impersonatedSigner);

    try {
        const tx = await nftAsHolder.approve(recipient, tokenId, {
            gasLimit: 100000,
        });
        await tx.wait();
        results.push('"PASS"');
    } catch (err) {
        results.push('"FAIL"');
    }

    await network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [holder],
    });
    */

    return results.join(",");
}

module.exports = {
    runApproveTests,
};
