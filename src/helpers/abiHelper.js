// abiHelper.js
const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv').config();

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

class AbiHelper {
  static ABI_DIR = 'src/tmp/'; // Directory where ABI files are stored

  static async LOAD_ABI_FILES(contractAddresses) {
    let counter = 0;
    const abis = {};
    for (let address of contractAddresses) {
        if (AbiHelper.ABI_FILE_EXISTS(address)) {
            console.log(`✅ ABI for ${address} already exists. Skipping...`);
            counter++;
        } else {
          const abi = await AbiHelper.FETCH_ABI(address);
          if (abi) {
            abis[address] = abi;
            fs.writeFileSync(AbiHelper.ABI_DIR + `${address}.json`, JSON.stringify(abi, null, 2));
            console.log(`✅ Saved ABI for ${address}`);
            counter++;
          }
        }
    }
    return counter;
  }

  static async FETCH_ABI(address) {
    const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${ETHERSCAN_API_KEY}`;
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

  static ABI_FILE_EXISTS(address) {
    return fs.existsSync(`${(AbiHelper.ABI_DIR)}${address}.json`);
  }

  static GET_ABI_FILE(address) {
      if (!AbiHelper.ABI_FILE_EXISTS(address)) {
        return "0";
      }
    return `${(AbiHelper.ABI_DIR)}${address}.json`;
  }
}

module.exports = AbiHelper;