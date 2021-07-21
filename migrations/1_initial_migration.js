const TokenDistributor = artifacts.require('TokenDistributor')
const fs = require('fs').promises

const token = '0xc770eefad204b5180df6a14ee197d99d808ee52d' // Fox token
const epochDuration = 60 * 60 * 24 * 1 // 24 hours
const rewardReductionPerEpoch = 1000 // 10 percent
const claimsStart = 1625762125 // 7/8/21 10:36am mst
const gracePeriod = 8288675 // seconds elapsed between "7/8/21 10:36am mst" and "10/12/21 9:00am mst" (unix timestamps subtracted: 1634050800-1625762125 = 8288675)
const rewardsEscrow = '0x90A48D5CF7343B08dA12E067680B4C6dbfE551Be' // where to send funds after claim period ends
const owner = '0x5B51E854fD1859Db6e7D64203C4B20Bc627Fb443' // Contract owner for upgrades etc

module.exports = async function (deployer) {
  require('dotenv').config()

  for (i = 0; i < 16; i++) {
      await deployer.deploy(TokenDistributor)
      const merkeProofData = await fs.readFile(
        `merkle_proofs/airdrop-${i}.json`,
        'binary'
      )
      const merkleRoot = JSON.parse(merkeProofData).merkleRoot
      console.log('deploying with merkle root', merkleRoot)
      const deployedTokenDistributor = await TokenDistributor.deployed()
      await deployedTokenDistributor.initialize(
        token,
        merkleRoot,
        epochDuration,
        rewardReductionPerEpoch,
        claimsStart,
        gracePeriod,
        rewardsEscrow,
        owner
      )
  }
}
