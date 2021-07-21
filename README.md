# Fox Token Airdrop Utilities

1. install truffle globally `npm install -g truffle`
2. Populate .env variables
3. set a reasonable gas price in truffle-config.js
4. Get `airdrop-addresses.csv` from trusted source and put in repo root folder.

Example format:

```
0x000000a541fa13beb75f82a1663a3b532f8ada3e,150
0x00000c55a0036318ef4d7a2a4c17495de5949f1b,150
0x0000462df2438f7b39577917374b1565c306b908,150
0x000051d46ff97559ed5512ac9d2d95d0ef1140e1,150
```

5. run `yarn`
6. run `yarn build:addresses` to add 1600 test addresses throughout the airdsrop addresses
    This creates the file: `final-airdrop-addresses.csv`.  
    Also creates `testAddressesAndMnemonics.json` with the mnemonics for each test address
7. run `yarn build:proofs` to build the merkle roots and proofs
8. Set contract initialization values in `1_initial_migration.js`
9. run `yarn deploy:testnet` OR `yarn deploy:mainnet` to deploy airdrop contracts on chain
10. deposit tokens to airdrop contact addressess so that contracts can distribute tokens


NOTES:

`merkle` folder contains code copied from `https://github.com/Uniswap/merkle-distributor/tree/master/src`
and is used to generate the merkle proof for an object containing `address: amount` key value pairs.

Line 35 of `merkle/parse-balance-map.ts` was modified, removing `0x` from the beginning of the string so that it works with our data format. Otherwise These files are unchanged from the uniswap `merkle-distributor` repo