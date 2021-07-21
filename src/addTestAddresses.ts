require('dotenv').config()
import { ethers } from "ethers"
const fs = require('fs').promises

const main = async () => {

    // generate test mnemonics & addresses to insert into airdrop list
    const testAddresses = []
    const testAddressesAndMnemonics = []
    
    for(let i=0;i<parseInt(process.env.CONTRACT_COUNT)*100;i++) {
        console.log('creating test mnemonic', i)
        var randomSeed = ethers.Wallet.createRandom()
        testAddresses.push(randomSeed.address)
        testAddressesAndMnemonics.push({address: randomSeed.address, mnemonic: randomSeed.mnemonic})
    }
    // save test mnemonics
    fs.writeFile(`testAddressesAndMnemonics.json`, JSON.stringify(testAddressesAndMnemonics))


    // read original airdrop list
    const originalAirdropAddresses = await fs.readFile(
        'airdrop-addresses.csv',
        'utf8'
      )
    const lines = originalAirdropAddresses.toString().split('\n')

    // how often to insert a test address into the original list
    const testAddressSpread = Math.ceil(lines.length / testAddresses.length)

    const newLines = []

    // insert test addresses into original airdrop list
    let testAddressIndex = 0 
    for(let i=0;i<lines.length;i++) {
        newLines.push(lines[i])
        if(i%testAddressSpread === 0) {
            newLines.push(testAddresses[testAddressIndex] + ',150')
            testAddressIndex++
        }
    }

    console.log('newLines.length', newLines.length)
    for(let i=0;i<newLines.length;i++) {
        console.log('writing new line', i, newLines[i])
        if(i===0) {
            await fs.writeFile(`final-airdrop-addresses.csv`, newLines[i]+'\r\n')
        } else if(i!==newLines.length-1) {
            await fs.appendFile('final-airdrop-addresses.csv', newLines[i]+'\r\n')
        } else {
            await fs.appendFile('final-airdrop-addresses.csv', newLines[i])
        }
    }
    console.log('newLines.length2', newLines.length)

}

main()
