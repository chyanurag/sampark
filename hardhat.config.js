require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/BKLspFCDAJjdp-PMKaNycvKYSD7hkOJN";
const REPORT_GAS = process.env.REPORT_GAS || false;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const PRIVATE_ACCOUNT_1 = process.env.PRIVATE_ACCOUNT_1 || "ecc3ae1adf23c1333650963b20fb6908e2e980802d8e4d441805e3a39c899969";
const PRIVATE_ACCOUNT_2 = process.env.PRIVATE_ACCOUNT_2;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.20",
            },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
        // example configuration for the Sepolia testnet
         sepolia: {
             url: SEPOLIA_RPC_URL,
             accounts: [PRIVATE_ACCOUNT_1],
             chainId: 11155111,
         },
    },
//     gasReporter: {
//         coinmarketcap: COINMARKETCAP_API_KEY,
//         enabled: REPORT_GAS,
//         // outputFile: "gasReport.txt",
//         currency: "USD",
//         showTimeSpent: true,
//         noColors: true,
//     },
//     etherscan: {
//         apiKey: ETHERSCAN_API_KEY,
//     },
    mocha: {
        timeout: 200000, //200 seconds
    },
};
