require('dotenv').config()
const fs = require('fs').promises
const { parseBalanceMap } = require('./merkle/parse-balance-map')
import { BigNumber } from 'ethers'

const main = async () => { 
    // load addresses,amount pairs into array
    const csvData = await fs.readFile(
        'final-airdrop-addresses.csv',
        'utf8'
      )
    const lines = csvData.toString().split('\r\n')

    // how many addresses to include per proof file
    const addressCountPerFile = Math.ceil(lines.length / parseInt(process.env.CONTRACT_COUNT))


    let addressAmountMaps = [{}]
    let fileIndex = 0

    // break address,amount pairs into array of address->amount mappings
    for(let i=0;i<lines.length;i++) {
        console.log('processing line:', i)

        const { address, amount } = getAddressInfo(lines[i])
        addressAmountMaps[fileIndex][address] = amount

        const checkpointReached = i !== 0 && i%addressCountPerFile === 0 
        const isLastLine = i === lines.length - 1

        if(isLastLine) break
        if(checkpointReached) {
            addressAmountMaps.push({})
            fileIndex++
        }
    }

    const proofs = []
    // Build proofs
    for(let i=0;i<addressAmountMaps.length;i++) {
        console.log('building proof', i)
        const proof = parseBalanceMap(addressAmountMaps[i])
        proofs.push(proof)
    }

    console.log('verifying addresses & values')
    // verify proof addresses & values are the same as the input addresses & values
    verifyValues(lines, proofs)
    // save proofs
    for(let i=0;i<proofs.length;i++) {
        console.log('saving proof', i)
        const proof = proofs[i]
        await fs.writeFile(`merkle_proofs/airdrop-${i}.json`, JSON.stringify(proof))
    }
}

// verify proof addresses & values are the same as the input addresses & values
function verifyValues(lines, proofs) {
    const addressAmountsFromProofs = proofs.reduce((acc, val) => {
        const addressAmountMap = {}
        for(let key in val.claims) {
            addressAmountMap[key.toLowerCase()] = parseInt(val.claims[key].amount)
        }
        return {...acc, ...addressAmountMap}
    }, {})

    console.log('addressAmountsFromProofs.length', Object.keys(addressAmountsFromProofs).length)
    console.log('lines.length', lines.length)

    const sameValues = lines.reduce( (acc, line, index) => {
        const { address: originalAddress, amount: originalAmount } = getAddressInfo(line)

        if(Number(addressAmountsFromProofs[originalAddress.toLowerCase()]) !== Number(originalAmount)) {
            console.log('bad match', originalAddress, Number(addressAmountsFromProofs[originalAddress.toLowerCase()]), Number(originalAmount), index)
            throw new Error('bad match')
        }
        return acc && Number(addressAmountsFromProofs[originalAddress.toLowerCase()]) === Number(originalAmount)
    }, true)

    const sameLength = Object.keys(addressAmountsFromProofs).length === lines.length
    const allUnique = new Set(lines).size === lines.length

    if(!(sameValues && sameLength && allUnique))
        throw new Error(`verifyValues error ${sameValues} ${sameLength} ${allUnique}`)
}

// Grab address & amount from csv line
// perform basic validation
// return address & amount converted to wei
function getAddressInfo(line) {
    const [address, amount] = line.split(',')

    if(!address.startsWith('0x') || address.length !== 42) {
        throw new Error(`invalid eth address: ${address} ${address.length}`)
    }

    if(parseInt(amount) <= 0 || Number.isNaN(parseInt(amount)) || parseInt(amount) > 10461) {
        throw new Error(`invalid amount: ${amount} ${line}`)
    }

    const oneEth = 1e18.toString()
    if(oneEth !== '1000000000000000000') throw new Error('bad eth value')
    return { address, amount: BigNumber.from(amount).mul(oneEth).toString() }
}

main()