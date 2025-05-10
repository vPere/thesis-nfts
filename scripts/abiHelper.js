// abiHelper.js
const axios = require('axios');
const fs = require('fs');

class AbiHelper {
  static ETHERSCAN_API_KEY = '9HG2298MKSCN6THHD3JQW2M83KNXNMWQTV'; // Replace with your API key
  static ABI_DIR = ''; // Directory where ABI files are stored

    async constructor(contractAddresses) {
      await this.init(contractAddresses);
    }

  async init(contractAddresses) {
    const abis = {};
    for (let address of contractAddresses) {
        if (this.abiFileExists(address)) {
            console.log(`✅ ABI for ${address} already exists. Skipping...`);
        } else {
          const abi = await this.fetchABI(address);
          if (abi) {
            abis[address] = abi;
            fs.writeFileSync(abiHelper.ABI_DIR + `${address}.json`, JSON.stringify(abi, null, 2));
            console.log(`✅ Saved ABI for ${address}`);
          }
        }
    }
  }

  async fetchABI(address) {
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

  abiFileExists(address) {
    return fs.existsSync(`${(abiHelper.ABI_DIR)}${address}.json`);
  }

  //function that returns the requested abi file path
  getAbiFile(address) {
      if (!this.abiFileExists(address)) {
        return "0";
      }
    return `${(abiHelper.ABI_DIR)}${address}.json`;
  }
}

module.exports = AbiHelper;