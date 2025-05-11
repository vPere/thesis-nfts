const { ethers, network } = require("hardhat");

async function runSafeTransferFromTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];

    async function testCase(name, from, to, tokenId, expectSuccess = false) {
        console.log(`⚠ Testing ${name} with input: FROM: ${from}, TO: ${to}, TOKEN_ID: ${tokenId}...`)
        try {
            const tx = await nft["safeTransferFrom(address,address,uint256)"](from, to, tokenId, {
                gasLimit: 1000000,
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
                results.push('"FAIL"'); // unexpected error
            } else {
                console.log("\t ✅ TEST PASS: Expected error " + err.message);
                results.push('"PASS"');
            }
        }
    }

    const validAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const otherAddr = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

    // Invalid input tests
    await testCase("Null from", null, validAddr, 1);
    await testCase("Null to", validAddr, null, 1);
    await testCase("Null tokenId", validAddr, validAddr, null);
    await testCase("Short from", "0x1234", validAddr, 1);
    await testCase("String to", validAddr, "notAnAddress", 1);
    await testCase("Number from", 123, validAddr, 1);
    await testCase("Array to", validAddr, [validAddr], 1);
    await testCase("Object from", { address: validAddr }, validAddr, 1);
    await testCase("Invalid tokenId string", validAddr, validAddr, "invalidTokenId");
    await testCase("Negative tokenId", validAddr, validAddr, -1);
    await testCase("Float tokenId", validAddr, validAddr, 1.5);
    await testCase("Zero address from", "0x0000000000000000000000000000000000000000", otherAddr, 1);
    await testCase("Zero address to", validAddr, "0x0000000000000000000000000000000000000000", 1);

    /*
    // ✅ Valid test (impersonated)
    const holder = "0x5a4F225A8E42f2a5c93Aa74fDbC1efC6Fe6720e1"; // TODO: Replace with actual NFT holder
    const tokenId = 12345; // TODO: Replace with an actual token they own
    const recipient = "0x0000000000000000000000000000000000000003";

    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [holder],
    });

    const impersonatedSigner = await ethers.getSigner(holder);
    const nftAsHolder = await ethers.getContractAt(abi, address, impersonatedSigner);

    try {
        const tx = await nftAsHolder["safeTransferFrom(address,address,uint256)"](holder, recipient, tokenId);
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
    runSafeTransferFromTests,
};
