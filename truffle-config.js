const HDWalletProvider = require("@truffle/hdwallet-provider");
require('dotenv').config()

module.exports = {
  networks: {
   development: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*"
   },
   test: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*"
   },
   ropsten: {
    provider: () =>
      new HDWalletProvider({
        mnemonic: {
          phrase: process.env.MNEMONIC
        },
        providerOrUrl: process.env.ROPSTEN_ETH_NODE,
        numberOfAddresses: 10,
        shareNonce: true,
        derivationPath: "m/44'/60'/0'/0/",
        chainId: 3,
      }),
    skipDryRun: true,
    network_id: '3',
    },
    mainnet: {
      gasPrice: 60000000000,
      gas: 2100000,
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: process.env.MNEMONIC
          },
          providerOrUrl: process.env.MAINNET_ETH_NODE,
          numberOfAddresses: 10,
          shareNonce: true,
          derivationPath: "m/44'/60'/0'/0/",
          chainId: 1,
        }),
      skipDryRun: true,
      network_id: '1',
    }
  },
  compilers: {
    solc: {
      version: '^0.6.12'
    }
  }
  
};
