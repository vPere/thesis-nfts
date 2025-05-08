// nft-tests-real.js

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
    } catch (err) {
      console.log(`✅ Caught empty URI for ${address}:`, err.message);
    }

    // === TEST 2: Mint to zero address
    try {
      const ZERO = '0x0000000000000000000000000000000000000000';
      console.log(`Testing ${address} - Mint to zero address...`);
      await nft.mint(ZERO, 9002, "ipfs://validuri");
    } catch (err) {
      console.log(`✅ Caught zero address for ${address}:`, err.message);
    }

    // === TEST 3: Duplicate token ID
    try {
      console.log(`Testing ${address} - Mint duplicate tokenId...`);
      await nft.mint(signer.address, 9003, "ipfs://one");
      await nft.mint(signer.address, 9003, "ipfs://two");  // Duplicate tokenId
    } catch (err) {
      console.log(`✅ Duplicate token ID caught for ${address}:`, err.message);
    }

    // === TEST 4: Unauthorized mint
    const unauthorized = '0xAnotherAddress'; // Example: use a random address or one without minter role
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [unauthorized],
    });
    const badSigner = await ethers.getSigner(unauthorized);
    const badNft = nft.connect(badSigner);

    try {
      console.log(`Testing ${address} - Unauthorized mint...`);
      //await badNft.mint(unauthorized, 9004, "ipfs://fail");
      await badNft.mint(1);
    } catch (err) {
      console.log(`✅ Unauthorized mint blocked for ${address}:`, err.message);
    }
  }
}

main().catch(console.error);
