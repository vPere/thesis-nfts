const { ethers, network } = require("hardhat");

async function runSafeTransferFromTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];

    async function testCase(name, from, to, tokenId, expectSuccess = false) {
        try {
            const tx = await nft["safeTransferFrom(address,address,uint256)"](from, to, tokenId, {
                gasLimit: 1000000,
            });
            if (expectSuccess) {
                await tx.wait();
                results.push('"PASS"');
            } else {
                results.push('"FAIL"'); // unexpected success
            }
        } catch (err) {
            if (expectSuccess) {
                results.push('"FAIL"'); // unexpected error
            } else {
                results.push('"PASS"');
            }
        }
    }

    const validAddr = "0x0000000000000000000000000000000000000001";
    const otherAddr = "0x0000000000000000000000000000000000000002";

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
