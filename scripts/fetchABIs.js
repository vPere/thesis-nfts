// fetchABIs.js

const axios = require('axios');
const fs = require('fs');

// List of contract addresses to fetch ABIs for
const contractAddresses = [
  '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e', // Doodles
  '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', // BAYS
  
];

const etherscanApiKey = '9HG2298MKSCN6THHD3JQW2M83KNXNMWQTV'; // Replace with your API key

// Function to fetch ABI for a given contract address
async function fetchABI(address) {
  const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${etherscanApiKey}`;
  try {
    const response = await axios.get(url);
    if (response.data.status === "1") {
      return JSON.parse(response.data.result);
    } else {
      console.log(`Failed to fetch ABI for ${address}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching ABI for ${address}:`, error);
    return null;
  }
}

// Fetch ABIs for all contracts and save them
async function fetchAndSaveABIs() {
  const abis = {};
  for (let address of contractAddresses) {
    const abi = await fetchABI(address);
    if (abi) {
      abis[address] = abi;
      fs.writeFileSync(`abis/${address}.json`, JSON.stringify(abi, null, 2));
      console.log(`✅ Saved ABI for ${address}`);
    }
  }
}

fetchAndSaveABIs();
