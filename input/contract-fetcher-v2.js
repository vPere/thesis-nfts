const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = 'eaYLrp7nA2O8SwotebqaRKeb';  // Your NFTScan API key
const URL = 'https://restapi.nftscan.com/api/v2/collections/rankings';

const fetchERC721Contracts = async () => {
    try {
        const response = await axios.get(URL, {
            headers: {
                'X-API-KEY': API_KEY
            },
            params: {
                sort_field: 'volume_total',
                sort_direction: 'dsc',
                limit: 500,
                erc_type: 'erc721'
            }
        });

        const collections = response.data.data || [];
        const contractAddresses = collections.map(c => c.contract_address);

        // Define file path in the same folder
        const filePath = path.join(__dirname, 'top_erc721_contracts.json');

        // Save to JSON file
        fs.writeFileSync(filePath, JSON.stringify(contractAddresses, null, 2));

        console.log(`✅ Saved ${contractAddresses.length} contract addresses to ${filePath}`);
    } catch (error) {
        console.error('❌ Error fetching data:', error.response?.data || error.message);
    }
};

fetchERC721Contracts();
