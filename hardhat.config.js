require('@nomiclabs/hardhat-waffle')

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

task('mintFreeNFT', 'Mint Free NFT from PeerReviewers NFT')
  .addParam('nftContract', "The NFT Contract's Address")
  .setAction(async (args, hre) => {
    const NFTContract = await hre.ethers.getContractAt(
      'PeerReviewersNFT',
      args.nftContract,
    )

    const txn = await NFTContract.freeMint()
    await txn.wait()
    console.log('Successfully minted a PeerReviewers NFT')
  })

task('proposePaper', 'Propose a paper for review')
  .addParam('daoContract', "The DAO contract's address")
  .addParam('paperCID', 'The CID of the paper uploaded to IPFS')
  .setAction(async (args, hre) => {
    const DAOContract = await hre.ethers.getContractAt(
      'PeerReviewDAO',
      args.daoContract,
    )

    const txn = await DAOContract.proposePaper(args.paperCID)
    await txn.wait()

    const numProposals = await DAOContract.numProposals()
    console.log(
      `Successfully created a proposal for paper CID ${
        args.paperCID
      }: Proposal ID = ${numProposals.sub(1).toString()}`,
    )
  })

task('votePublishOnProposal', 'Vote PROPOSE for a proposed paper in the DAO')
  .addParam('daoContract', "The DAO contract's address")
  .addParam('proposalId', 'The ID of the proposal to vote on')
  .setAction(async (args, hre) => {
    const DAOContract = await hre.ethers.getContractAt(
      'PeerReviewDAO',
      args.daoContract,
    )

    const txn = await DAOContract.voteOnProposal(args.proposalId, 0)
    await txn.wait()
    console.log(`Successfully voted PUBLISH on Proposal ${args.proposalId}`)
  })

task('voteRejectOnProposal', 'Vote REJECT for a proposed paper in the DAO')
  .addParam('daoContract', "The DAO contract's address")
  .addParam('proposalId', 'The ID of the proposal to vote on')
  .setAction(async (args, hre) => {
    const DAOContract = await hre.ethers.getContractAt(
      'PeerReviewDAO',
      args.daoContract,
    )

    const txn = await DAOContract.voteOnProposal(args.proposalId, 2)
    await txn.wait()
    console.log(`Successfully voted PUBLISH on Proposal ${args.proposalId}`)
  })

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.4',
}
