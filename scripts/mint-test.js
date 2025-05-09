// csvHandler.js

const { ethers, network } = require("hardhat");
const fs = require("fs");

// List of contract addresses to test
const contractAddresses = [
    '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e', // Doodles
    '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', // BAYC
    // Add more contract addresses here
];

async function main() {
    // Loop through each contract address
    for (const address of contractAddresses) {
        const abi = JSON.parse(fs.readFileSync(`abis/${address}.json`, 'utf8'));

        const nft = new ethers.Contract(address, abi, ethers.provider);

        // Impersonate a known privileged address (e.g., minter)
        //const minter = '0x01DAFd77d7FBECa647Acb78B45bCf60bAc8dA757'; // Example: replace with a known minter address
        const minter = '0x29469395eAf6f95920E59F858042f0e28D98a20B'; // Example: replace with a known minter address
        try {
            await network.provider.request({
                method: 'hardhat_impersonateAccount',
                params: [minter],
            });
            const signer = await ethers.getSigner(minter);
            console.log("Impersonation OK");
            const funder = (await ethers.getSigners())[0]; // default account with ETH
            await funder.sendTransaction({
                to: minter,
                value: ethers.utils.parseEther("1.0"), // send 1 ETH
            });

            if (nft.mint) {
                try {
                    const tx = await nft.connect(signer).mint(1);
                    console.log("Mint tx sent:", tx.hash);
                } catch (mintErr) {
                    console.log("Mint failed:", mintErr.message);
                }
            } else {
                console.log("No public mint function found in ABI.");
            }
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
        //const signer = ethers.provider.getSigner();  // Use the default signer (e.g., first account in local node)
    }
}

main().catch(console.error);
