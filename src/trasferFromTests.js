const { ethers, network } = require("hardhat");

async function runTransferFromTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];

    async function testCase(name, from, to, tokenId, expectSuccess = false) {
        try {
            const tx = await nft.transferFrom(from, to, tokenId);
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
    await testCase("Invalid from address (short)", "0x1234", validAddr, 1);
    await testCase("Invalid to address (string)", "notAnAddress", validAddr, 1);
    await testCase("Number instead of from", 123, validAddr, 1);
    await testCase("Array instead of to", validAddr, [validAddr], 1);
    await testCase("Object instead of from", { address: validAddr }, validAddr, 1);
    await testCase("String tokenId", validAddr, validAddr, "invalidTokenId");
    await testCase("Negative tokenId", validAddr, validAddr, -1);
    await testCase("Float tokenId", validAddr, validAddr, 1.5);
    await testCase("Zero address from", "0x0000000000000000000000000000000000000000", otherAddr, 1);
    await testCase("Zero address to", validAddr, "0x0000000000000000000000000000000000000000", 1);

   /*
    // ✅ Valid transfer (using impersonation)
    const holder = "0x5a4F225A8E42f2a5c93Aa74fDbC1efC6Fe6720e1"; // TODO: Replace with actual owner address
    const tokenId = 12345; // TODO: Replace with actual token ID the holder owns
    const recipient = "0x0000000000000000000000000000000000000003";

    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [holder],
    });
    const impersonatedSigner = await ethers.getSigner(holder);

    const nftAsHolder = await ethers.getContractAt(abi, address, signer); //changed impersonatedSigner to signer

    try {
        const tx = await nftAsHolder.transferFrom(holder, recipient, tokenId);
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
    runTransferFromTests,
};
