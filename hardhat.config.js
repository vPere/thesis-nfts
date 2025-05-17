/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;


module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      http: {
        timeout: 0
      }
    },
    hardhat: {
      forking: {
        url: 'https://eth-mainnet.g.alchemy.com/v2/'+ ALCHEMY_API_KEY
      },
      accounts: {
        balance: "1000000000000000000000000"
      },
      http: {
        timeout: 0
      },
      loggingEnabled: true
    },
  },
};
