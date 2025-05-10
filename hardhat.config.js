/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", // This is for local Hardhat network
    },
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/9nMjQEfnED5wUjFHqt7_7PCIz8ofRDN5", // Use your Alchemy API key here
      },
      loggingEnabled: true,
    },
  },
};
