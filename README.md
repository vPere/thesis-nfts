# NFT Contract Testing Framework

This project is a comprehensive testing framework designed to interact with and validate the functionality of ERC-721 (NFT) smart contracts. It uses [Hardhat](https://hardhat.org/) to simulate blockchain behavior and includes a wide range of test cases for commonly used ERC-721 methods.

## Features

- ✅ **Automated Testing**: Covers methods like `balanceOf`, `ownerOf`, `transferFrom`, `safeTransferFrom`, `approve`, `setApprovalForAll`, `getApproved`, and `isApprovedForAll`.
- 🛡️ **Input Validation**: Tests invalid and edge case inputs to ensure robust error handling.
- 🧑‍💻 **Account Impersonation**: Uses Hardhat’s impersonation feature to simulate actions from specific accounts.
- 📊 **CSV Reporting**: Outputs test results to a CSV file for easy analysis and review.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (v6 or later)
- [Hardhat](https://hardhat.org/)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

Run all tests with:
```bash
node src/main.js
```

### How It Works

- **Input**: Contract addresses should be listed in `input/addresses.csv`. There are two scripts inside the `input` directory that can fetch the addresses from CoinMarketCap and generate the csv file.
- **Execution**: The main script iterates through each contract and runs relevant test suites.
- **Output**: Test results are saved to a CSV file for easy inspection.

## File Structure

```
src/
├── main.js               # Entry point to execute all tests
├── tests/                # Contains test files for ERC721 methods
├── helpers/              # Utility functions used by tests
```

## Tests Overview

- **balanceOf**: Validates token balance queries and handles invalid addresses.
- **ownerOf**: Checks ownership of token IDs and validates error handling for invalid tokens.
- **transferFrom / safeTransferFrom**: Tests token transfers and edge cases.
- **approve / setApprovalForAll**: Ensures operator approvals are handled correctly.
- **getApproved / isApprovedForAll**: Verifies approval status queries for tokens and operators.

## Example

To test the `setApprovalForAll` method:

1. Add the target contract address to `addresses.csv`.
2. Run:
   ```bash
   npx hardhat run src/main.js
   ```
3. Check the output CSV for results.

## Dependencies

- [Hardhat](https://hardhat.org/)
- [ethers.js](https://docs.ethers.org/)
- [csv-parser](https://www.npmjs.com/package/csv-parser)

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.
