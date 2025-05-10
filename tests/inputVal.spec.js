const path = require("path");
const fs = require("fs");
const { ethers, network } = require("hardhat");
const {
    getContractAddresses
} = require("../input/contract-storage");
const {
    buildRow,
    setTestResult,
    appendRowToCSV,
    createOutputCSV,
    getTimestamp
} = require("../scripts/csvHandler");
const {findValidToken} = require("../scripts/contractOwnerHelper");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";


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
            let abi;

            before(async function () {
                row = buildRow(address);
                const abiPath = path.resolve(__dirname, `abis/${address}.json`);
                try {
                    abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
                } catch (err) {
                    console.warn(`Skipping ${address}: ABI not found at ${abiPath}`);
                    return; // Skip this contract's tests
                }
                nft = new ethers.Contract(address, abi, ethers.provider);

                const minter = "0x29469395eAf6f95920E59F858042f0e28D98a20B";
                await network.provider.request({
                    method: "hardhat_impersonateAccount",
                    params: [minter],
                });

                const funder = (await ethers.getSigners())[0];
                await funder.sendTransaction({
                    to: minter,
                    value: ethers.utils.parseEther("1.0"),
                });

                signer = await ethers.getSigner(minter);
                nft = nft.connect(signer);
            });

            describe("Minting Tests", function () {
                it("should fail to mint with empty URI", async function () {
                    try {
                        console.log("Test1: Trying empty URI");
                        await nft.mint(signer.address, 9001, "");
                        setTestResult(row, "Test1", "FAIL");
                    } catch (err) {
                        console.log("Test1 Passed: Revert caught:", err.message);
                        setTestResult(row, "Test1", "PASS");
                    }
                });

                it("should fail to mint to the zero address", async function () {
                    try {
                        console.log("Test2: Trying zero address mint");
                        await nft.mint(ZERO_ADDRESS, 9002, "ipfs://validuri");
                        setTestResult(row, "Test2", "FAIL");
                    } catch (err) {
                        console.log("Test2 Passed: Revert caught:", err.message);
                        setTestResult(row, "Test2", "PASS");
                    }
                });

                it("should fail to mint duplicate token ID", async function () {
                    try {
                        console.log("Test3: Trying duplicate token ID");
                        await nft.mint(signer.address, 9003, "ipfs://one");
                        await nft.mint(signer.address, 9003, "ipfs://two");
                        setTestResult(row, "Test3", "FAIL");
                    } catch (err) {
                        console.log("Test3 Passed: Revert caught:", err.message);
                        setTestResult(row, "Test3", "PASS");
                    }
                });

                it("should block unauthorized mint", async function () {
                    try {
                        const unauthorized = "0x29469395eAf6f95920E59F858042f0e28D98a20A";
                        await network.provider.request({
                            method: "hardhat_impersonateAccount",
                            params: [unauthorized],
                        });

                        const funder = (await ethers.getSigners())[0];
                        await funder.sendTransaction({
                            to: unauthorized,
                            value: ethers.utils.parseEther("1.0"),
                        });

                        const badSigner = await ethers.getSigner(unauthorized);
                        const badNft = nft.connect(badSigner);

                        console.log("Test4: Unauthorized mint attempt");
                        await badNft.mint(badSigner.address, 9004, "ipfs://badmint");
                        setTestResult(row, "Test4", "FAIL");
                    } catch (err) {
                        console.log("Test4 Passed: Revert caught:", err.message);
                        setTestResult(row, "Test4", "PASS");
                    }
                });
            });
            describe("Transfer Tests", function () {
                //TODO: ownerOf
                it("should verify token ownership", async function () {
                    const ownership = await findValidToken(address, 1, 10000, abi);
                    const tokenId = ownership.tokenId;
                    const owner = ownership.owner;

                    const tokenOwner = await nft.ownerOf(tokenId);
                    console.log(`Token ID ${tokenId} is owned by ${tokenOwner}`);
                    if (tokenOwner.toLowerCase() === owner.toLowerCase()) {
                        console.log("Ownership verified");
                        setTestResult(row, "Test6", "PASS");
                    } else {
                        console.log("Ownership verification failed");
                        setTestResult(row, "Test6", "FAIL");
                    }
                });
                it("should block unauthorized transfer", async function () {
                    const tokenId = 9999;
                    try {
                        console.log("Test5: Minting for transfer test");
                        await nft.mint(signer.address, tokenId, "ipfs://unauth-transfer");

                        const attacker = "0x1111111111111111111111111111111111111111";
                        await network.provider.request({
                            method: "hardhat_impersonateAccount",
                            params: [attacker],
                        });

                        const funder = (await ethers.getSigners())[0];
                        await funder.sendTransaction({
                            to: attacker,
                            value: ethers.utils.parseEther("1.0"),
                        });

                        const attackerSigner = await ethers.getSigner(attacker);
                        const nftFromAttacker = nft.connect(attackerSigner);

                        console.log("Test5: Unauthorized transfer attempt");
                        await nftFromAttacker.transferFrom(signer.address, attacker, tokenId);
                        setTestResult(row, "Test5", "FAIL");
                    } catch (err) {
                        console.log("Test5 Passed: Revert caught:", err.message);
                        setTestResult(row, "Test5", "PASS");
                    }
                });
                //TODO: SafeTransfer methods tests

            });
            //TODO: approve, setApprovalForAll, getApproved, isApprovedForAll


            after(function () {
                appendRowToCSV(row, timestamp);
            });
        });
    }
});
