// nft-tests-real.js

const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require('path');

// List of contract addresses to test
const contractAddresses = [
  '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e', // Doodles
  '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', // BAYC
  // Add more contract addresses here
];

async function main() {
  // Create the output CSV file for this execution
  const timestamp = getTimestamp();
  createOutputCSV(timestamp);

  // Loop through each contract address
  for (const address of contractAddresses) {

    const row = buildRow(address);

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
      setTestResult(row, "Test1", "FAIL")
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
    } catch (err) {
      console.log(`✅ Unauthorized mint blocked for ${address}:`, err.message);
      setTestResult(row, "Test4", "PASS")
    }

    appendRowToCSV(timestamp, row);
  }
}


function createOutputCSV(timestamp) {
  const headers = ['Address', 'Test1', 'Test2', 'Test3', 'Test4'];
  const csvData = headers.join(',');
  const outputDir = path.resolve(__dirname, '../output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = path.join(outputDir, `data-${timestamp}.csv`);
  fs.writeFileSync(filename, csvData + '\n');
}

function buildRow(address) {
  return {
    Address: address,
    Test1: '',
    Test2: '',
    Test3: '',
    Test4: ''
  };
}

function setTestResult(row, testName, value) {
  if (!(testName in row)) {
    console.error(`Invalid test name: ${testName}`);
    return;
  }
  row[testName] = value;
}

function appendRowToCSV(timestamp, row) {
  const outputDir = path.resolve(__dirname, '../output');
  const filename = path.join(outputDir, `data-${timestamp}.csv`);
  const values = [
    row.Address,
    row.Test1,
    row.Test2,
    row.Test3,
    row.Test4,
  ];
  fs.appendFileSync(filename, values.join(',') + '\n');
}

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

main().catch(console.error);
