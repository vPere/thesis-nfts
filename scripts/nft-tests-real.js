const { ethers, network } = require("hardhat");
const fs = require("fs");

// List of contract addresses to test
const contractAddresses = [
  '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e', // Doodles
  '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', // BAYC
  
  // Add more contract addresses here
];

// Helper function to color the output
const chalk = require('chalk');
const printResult = (contractName, testName, isPassed, message) => {
  const symbol = isPassed ? chalk.green("✅") : chalk.red("❌");
  const color = isPassed ? chalk.green : chalk.red;

  console.log(`${symbol} ${color(`${contractName} - ${testName}:`)} ${message}`);
};

async function main() {
  // Loop through each contract address
  for (const address of contractAddresses) {
    const abi = JSON.parse(fs.readFileSync(`abis/${address}.json`, 'utf8'));
    const nft = new ethers.Contract(address, abi, ethers.provider);

    // Get the contract name for logging purposes
    const contractName = `Contract ${address}`;

    // === TEST 1: Minting with empty URI
    try {
      console.log(chalk.blue(`\nTesting ${contractName} - Mint with empty URI...`));
      await nft.mint(address, 9001, "");
      printResult(contractName, "Mint with empty URI", true, "Test Passed");
    } catch (err) {
      printResult(contractName, "Mint with empty URI", false, `Sending a transaction requires a signer: ${err.message}`);
    }

    // === TEST 2: Mint to zero address
    try {
      console.log(chalk.blue(`\nTesting ${contractName} - Mint to zero address...`));
      await nft.mint('0x0000000000000000000000000000000000000000', 9002, "ipfs://validuri");
      printResult(contractName, "Mint to zero address", true, "Test Passed");
    } catch (err) {
      printResult(contractName, "Mint to zero address", false, `Zero address error: ${err.message}`);
    }

    // === TEST 3: Duplicate token ID
    try {
      console.log(chalk.blue(`\nTesting ${contractName} - Mint duplicate tokenId...`));
      await nft.mint(address, 9003, "ipfs://one");
      await nft.mint(address, 9003, "ipfs://two"); // Duplicate tokenId
      printResult(contractName, "Duplicate token ID", true, "Test Passed");
    } catch (err) {
      printResult(contractName, "Duplicate token ID", false, `Duplicate token ID error: ${err.message}`);
    }

    // === TEST 4: Unauthorized mint (commented out for now)
    /*
    const unauthorized = '0xAnotherAddress'; // Example: use a random address or one without minter role
    try {
      console.log(chalk.blue(`\nTesting ${contractName} - Unauthorized mint...`));
      await nft.mint(unauthorized, 9004, "ipfs://fail");
      printResult(contractName, "Unauthorized mint", true, "Test Passed");
    } catch (err) {
      printResult(contractName, "Unauthorized mint", false, `Unauthorized mint error: ${err.message}`);
    }
    */
  }
}

main().catch(console.error);
