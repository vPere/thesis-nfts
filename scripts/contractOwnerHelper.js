const { ethers } = require("hardhat");

class ContractOwnerHelper {
    static async findValidToken(nftAddress, start = 0, end = 10000, abi) {
        const nft = await ethers.getContractAt(abi.abi, nftAddress);

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
                console.warn(`Error on tokenId ${tokenId}: ${err.message}`);
            }
        }

        throw new Error("❌ No valid token found in the given range.");
    }
}

module.exports = ContractOwnerHelper;