const {ethers, network} = require("hardhat");
const fs = require("fs");
const {getContractAddresses} = require("../../input/contract-storage");
const {
    buildRow,
    setTestResult,
    appendRowToCSV,
    createOutputCSV,
    getTimestamp
} = require("./csvHelper");

async function main() {
    // Create the output CSV file for this execution
    const timestamp = getTimestamp();
    createOutputCSV(timestamp);

    const contractAddresses = getContractAddresses();
    // Loop through each contract address
    for (const address of contractAddresses) {

        const row = buildRow(address);

        const abi = JSON.parse(fs.readFileSync(`../tests/abis/${address}.json`, 'utf8'));

        const nft = new ethers.Contract(address, abi, ethers.provider);

        // Impersonate a known privileged address (e.g., minter)
        const minter = '0x29469395eAf6f95920E59F858042f0e28D98a20B'; // Example: replace with a known minter address
        try {
            await network.provider.request({
                method: 'hardhat_impersonateAccount',
                params: [minter],
            });
            console.log("Impersonation OK");
            const funder = (await ethers.getSigners())[0]; // default account with ETH
            await funder.sendTransaction({
                to: minter,
                value: ethers.utils.parseEther("1.0"), // send 1 ETH
            });
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }

        const signer = await ethers.getSigner(minter);

        // === TEST 1: Minting with empty URI
        try {
            console.log(`Testing ${address} - Mint with empty URI...`);
            await nft.mint(signer.address, 9001, "");  // Adjust minting params as needed
            setTestResult(row, "Test1", "FAIL")
            console.log(`❌ Mint with empty URI should have failed for ${address}`);
        } catch (err) {
            console.log(`✅ Caught empty URI for ${address}:`, err.message);
            setTestResult(row, "Test1", "PASS")
        }

        // === TEST 2: Mint to zero address
        try {
            const ZERO = '0x0000000000000000000000000000000000000000';
            console.log(`Testing ${address} - Mint to zero address...`);
            await nft.mint(ZERO, 9002, "ipfs://validuri");
            setTestResult(row, "Test2", "FAIL")
            console.log(`❌ Mint to zero address should have failed for ${address}`);
        } catch (err) {
            console.log(`✅ Caught zero address for ${address}:`, err.message);
            setTestResult(row, "Test2", "PASS")
        }

        // === TEST 3: Duplicate token ID
        try {
            console.log(`Testing ${address} - Mint duplicate tokenId...`);
            await nft.mint(signer.address, 9003, "ipfs://one");
            await nft.mint(signer.address, 9003, "ipfs://two");  // Duplicate tokenId
            setTestResult(row, "Test3", "FAIL")
            console.log(`❌ Duplicate token ID should have failed for ${address}`);
        } catch (err) {
            console.log(`✅ Duplicate token ID caught for ${address}:`, err.message);
            setTestResult(row, "Test3", "PASS")
        }

        // === TEST 4: Unauthorized mint
        try {
            console.log(`Testing ${address} - Unauthorized mint...`);
            const unauthorized = '0x29469395eAf6f95920E59F858042f0e28D98a20A'; // Example: use a random address or one without minter role
            await network.provider.request({
                method: 'hardhat_impersonateAccount',
                params: [unauthorized],
            });
            const badSigner = await ethers.getSigner(unauthorized);
            const badNft = nft.connect(badSigner);
            //await badNft.mint(unauthorized, 9004, "ipfs://fail");
            await badNft.mint(1);
            setTestResult(row, "Test4", "FAIL")
            console.log(`❌ Unauthorized mint should have failed for ${address}`);
        } catch (err) {
            console.log(`✅ Unauthorized mint blocked for ${address}:`, err.message);
            setTestResult(row, "Test4", "PASS")
        }
        /*
        // === TEST 5: Transfer from unauthorized address (caller is not the owner of the token)
        try {
            const recipient = '0x1111111111111111111111111111111111111111'; // Example: replace with a valid recipient address
            console.log(`Testing ${address} - Transfer from unauthorized address...`);
            await network.provider.request({
                method: 'hardhat_impersonateAccount',
                params: [recipient],
            });
            const funder = (await ethers.getSigners())[0]; // default account with ETH
            await funder.sendTransaction({
                to: recipient,
                value: ethers.utils.parseEther("1.0"), // send 1 ETH
            });
            const badSigner = await ethers.getSigner(recipient);
            const badNft = nft.connect(badSigner);
            await badNft.transferFrom(signer.address, recipient, 9001);  // Attempt to transfer tokenId 9001
            setTestResult(row, "Test5", "FAIL")
            console.log(`❌ Transfer from unauthorized address should have failed for ${address}`);
        } catch (err) {
            console.log(`✅ Transfer from unauthorized address blocked for ${address}:`, err.message);
            setTestResult(row, "Test5", "PASS")
        }
         */

        // === TEST 5: Unauthorized Transfer
        try {
            console.log(`Testing ${address} - Unauthorized transferFrom...`);

            // Mint a token first (assuming signer has mint privilege)
            const tokenId = 9999;
            await nft.mint(signer.address, tokenId, "ipfs://unauth-transfer");

            // Impersonate a random unauthorized address
            const attacker = '0x1111111111111111111111111111111111111111';
            await network.provider.request({
                method: 'hardhat_impersonateAccount',
                params: [attacker],
            });
            const funder = (await ethers.getSigners())[0]; // default account with ETH
            await funder.sendTransaction({
                to: attacker,
                value: ethers.utils.parseEther("1.0"), // send 1 ETH
            });

            const attackerSigner = await ethers.getSigner(attacker);
            const nftFromAttacker = nft.connect(attackerSigner);

            // Try transferring token from signer to attacker without approval
            await nftFromAttacker.transferFrom(signer.address, attacker, tokenId);

            // If it succeeds, it's vulnerable
            console.log(`❌ Unauthorized transfer succeeded for ${address}`);
            setTestResult(row, "Test5", "FAIL");
        } catch (err) {
            console.log(`✅ Unauthorized transfer blocked for ${address}:`, err.message);
            setTestResult(row, "Test5", "PASS");
        }

        appendRowToCSV(timestamp, row);
    }
}
main().catch(console.error);
