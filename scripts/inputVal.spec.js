const { ethers, network } = require("hardhat");
const fs = require("fs");
const { getContractAddresses } = require("../input/contract-storage");
const { buildRow, setTestResult, appendRowToCSV, createOutputCSV, getTimestamp } = require("./csvHandler");

describe("NFT Vulnerability Tests", function () {
    const timestamp = getTimestamp();
    const contractAddresses = getContractAddresses();

    before(function () {
        createOutputCSV(timestamp);
    });

    for (const address of contractAddresses) {
        describe(`Testing contract at ${address}`, function () {
            let row;
            let nft;
            let signer;

            before(async function () {
                row = buildRow(address);

                const abi = JSON.parse(fs.readFileSync(`abis/${address}.json`, 'utf8'));
                nft = new ethers.Contract(address, abi, ethers.provider);

                const minter = '0x29469395eAf6f95920E59F858042f0e28D98a20B';
                await network.provider.request({
                    method: 'hardhat_impersonateAccount',
                    params: [minter],
                });
                const funder = (await ethers.getSigners())[0];
                await funder.sendTransaction({
                    to: minter,
                    value: ethers.utils.parseEther("1.0"),
                });
                signer = await ethers.getSigner(minter);
            });

            it("should fail to mint with empty URI", async function () {
                try {
                    await nft.mint(signer.address, 9001, "");
                    setTestResult(row, "Test1", "FAIL");
                } catch (err) {
                    setTestResult(row, "Test1", "PASS");
                }
            });

            it("should fail to mint to the zero address", async function () {
                try {
                    const ZERO = '0x0000000000000000000000000000000000000000';
                    await nft.mint(ZERO, 9002, "ipfs://validuri");
                    setTestResult(row, "Test2", "FAIL");
                } catch (err) {
                    setTestResult(row, "Test2", "PASS");
                }
            });

            it("should fail to mint duplicate token ID", async function () {
                try {
                    await nft.mint(signer.address, 9003, "ipfs://one");
                    await nft.mint(signer.address, 9003, "ipfs://two");
                    setTestResult(row, "Test3", "FAIL");
                } catch (err) {
                    setTestResult(row, "Test3", "PASS");
                }
            });

            it("should block unauthorized mint", async function () {
                try {
                    const unauthorized = '0x29469395eAf6f95920E59F858042f0e28D98a20A';
                    await network.provider.request({
                        method: 'hardhat_impersonateAccount',
                        params: [unauthorized],
                    });
                    const badSigner = await ethers.getSigner(unauthorized);
                    const badNft = nft.connect(badSigner);
                    await badNft.mint(1); // Replace with full params if required
                    setTestResult(row, "Test4", "FAIL");
                } catch (err) {
                    setTestResult(row, "Test4", "PASS");
                }
            });

            it("should block unauthorized transfer", async function () {
                try {
                    const tokenId = 9999;
                    await nft.mint(signer.address, tokenId, "ipfs://unauth-transfer");

                    const attacker = '0x1111111111111111111111111111111111111111';
                    await network.provider.request({
                        method: 'hardhat_impersonateAccount',
                        params: [attacker],
                    });
                    const funder = (await ethers.getSigners())[0];
                    await funder.sendTransaction({
                        to: attacker,
                        value: ethers.utils.parseEther("1.0"),
                    });

                    const attackerSigner = await ethers.getSigner(attacker);
                    const nftFromAttacker = nft.connect(attackerSigner);

                    await nftFromAttacker.transferFrom(signer.address, attacker, tokenId);
                    setTestResult(row, "Test5", "FAIL");
                } catch (err) {
                    setTestResult(row, "Test5", "PASS");
                }
            });

            after(function () {
                appendRowToCSV(row, timestamp);
            });
        });
    }
});
