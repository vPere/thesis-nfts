const { ethers } = require("hardhat");

class ContractOwnerHelper {
    static async findValidToken(nftAddress, start = 0, end = 10000, abi) {
        const nft = await ethers.getContractAt(abi, nftAddress);

        for (let tokenId = start; tokenId < end; tokenId++) {
            try {
                const owner = await nft.ownerOf(tokenId);
                console.log(`✅ Found: Token ID ${tokenId} is owned by ${owner}`);
                return { tokenId, owner };
            } catch (err) {
                // ownerOf throws if token doesn't exist
                if (err.message.includes("ERC721: invalid token ID")) {
                    continue;
                }
            }
        }

        throw new Error("❌ No valid token found in the given range. Address: " + nftAddress);
    }

    // main function to find valid token
    static async main() {
        const nftAddress = "0x59325733eb952a92e069C87F0A6168b29E80627f";
        const start = 8869;
        const end = 8888;

        const path = require("path");
        const fs = require("fs");

        const abiPath = path.join(__dirname, "0x59325733eb952a92e069C87F0A6168b29E80627f.json");
        const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

        try {
            const { tokenId, owner } = await this.findValidToken(nftAddress, start, end, abi);
            console.log(`✅ Found valid token: ${tokenId} owned by ${owner}`);
        } catch (error) {
            console.error(error.message);
        }
    }
}

module.exports = ContractOwnerHelper;

ContractOwnerHelper.main();