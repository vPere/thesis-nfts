const { ethers, network } = require("hardhat");
const {IS_NOT_DEFINED} = require("../helpers/nonDefinedHelper");

async function runTransferFromTests(address, abi, signer) {
    const nft = await ethers.getContractAt(abi, address, signer);
    const results = [];
    const testCases = [];

    async function testCase(name, from, to, tokenId, expectSuccess = false) {
        console.log(`⚠ Testing ${name} with input: FROM: ${from}, TO: ${to}, TOKEN_ID: ${tokenId}...`);
        testCases.push(name);
        try {
            const tx = await nft.transferFrom(from, to, tokenId);
            if (expectSuccess) {
                await tx.wait();
                console.log("\t ✅ TEST PASS: Expected success ");
                results.push('"PASS"');
            } else {
                console.log("\t ❌ TEST FAIL: Unexpected success ");
                results.push('"FAIL"'); // unexpected success
            }
        } catch (err) {
            if (IS_NOT_DEFINED(err.message)) {
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

    const validAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; //should have enough funds
    const otherAddr = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; //idk if it has enough funds

    // Invalid input tests
    await testCase("TF: Null from", null, validAddr, 1);
    await testCase("TF: Null to", validAddr, null, 1);
    await testCase("TF: Null tokenId", validAddr, validAddr, null);
    await testCase("TF: Invalid from address (short)", "0x1234", validAddr, 1);
    await testCase("TF: Invalid to address (short)",validAddr, "0x1234", 1);
    await testCase("TF: Invalid from address (string)", "notAnAddress", validAddr, 1);
    await testCase("TF: Invalid to address (string)",validAddr, "notAnAddress", 1);
    await testCase("TF: Number instead of from", 123, validAddr, 1);
    await testCase("TF: Array instead of to", validAddr, [validAddr], 1);
    await testCase("TF: Object instead of from", { address: validAddr }, validAddr, 1);
    await testCase("TF: String tokenId", validAddr, validAddr, "invalidTokenId");
    await testCase("TF: Negative tokenId", validAddr, validAddr, -1);
    await testCase("TF: Float tokenId", validAddr, validAddr, 1.5);
    await testCase("TF: Zero address from", "0x0000000000000000000000000000000000000000", otherAddr, 1);
    await testCase("TF: Zero address to", validAddr, "0x0000000000000000000000000000000000000000", 1);

   /*TODO: ✅ Valid transfer (using impersonation)
    const holder = "0x5a4F225A8E42f2a5c93Aa74fDbC1efC6Fe6720e1"; // TODO: Replace with actual owner address - ownerOf
    const tokenId = 12345; // TODO: Replace with actual token ID the holder owns - tokenId
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

    return {testCases, results};
}

module.exports = {
    runTransferFromTests,
};
