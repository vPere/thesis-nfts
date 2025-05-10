// fetchABIs.js
const axios = require('axios');
const fs = require('fs');
const {getContractAddresses} = require("../input/contract-storage");

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
  const contractAddresses = getContractAddresses();
  const abis = {};
  for (let address of contractAddresses) {
    const abi = await fetchABI(address);
    if (abi) {
      abis[address] = abi;
      fs.writeFileSync(`../tests/abis/${address}.json`, JSON.stringify(abi, null, 2));
      console.log(`✅ Saved ABI for ${address}`);
    }
  }
}

fetchAndSaveABIs();
