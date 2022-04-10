// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

interface IPeerReviewersNFT {}

// Peer Review DAO
contract PeerReviewDAO {
    // List of accepted papers.
    uint256 public immutable MIN_VOTES;
    
    constructor(uint256 minVotes) {
        MIN_VOTES = minVotes;
    }

    string[] acceptedPapers;

    modifier reviewerOnly() {
        bool reviewer = false;
        for (uint i = 0; i < reviewers.length; i++){
            if (reviewers[i] == msg.sender) {
                reviewer = true;
            }
        }
        require(
            reviewer,
            "NOT_A_REVIEWER"
        );
        _;
    }
    address[] public reviewers;


    enum VoteType {
        PUBLISH,
        REJECT
    }

    struct ProposedPaper {
        string paper;
        bool decided;
        uint256 rejectVotes;
        uint256 publishVotes;
        address [] voterRegistry;
    }

    mapping(uint256 => ProposedPaper) public proposals;

    uint256 public numProposals;

    // Create a Proposal for Research Paper
    function proposePaper(string memory _paper) public returns (uint256) {
        ProposedPaper storage proposal = proposals[numProposals];
        proposal.paper = _paper;
        numProposals++;

        return numProposals - 1;
    }


    // Vote on Proposals
    function voteOnProposal(uint256 _proposalId, VoteType _vote)
        external
        reviewerOnly
    {
        ProposedPaper storage proposal = proposals[_proposalId];
        console.log("%s JUST VOTED", msg.sender);

        require(!proposal.decided,  "INACTIVE_PROPOSAL");

        bool notVoted = true;
        for (uint i = 0; i < proposal.voterRegistry.length; i++){
            if (msg.sender == proposal.voterRegistry[i]) {
                notVoted = false;
            }
        }
        require(notVoted, "ALREADY_VOTED");

        proposal.voterRegistry.push(msg.sender);
        if (_vote == VoteType.PUBLISH) {
            proposal.publishVotes++;
        } else if (_vote == VoteType.REJECT) {
            proposal.rejectVotes++;
        }
    }

    // Publish proposal
    function publishProposal(uint256 _proposalID) external reviewerOnly {
        ProposedPaper storage proposal = proposals[_proposalID];
        require(proposal.publishVotes + proposal.rejectVotes > MIN_VOTES, "MORE_VOTES_NEEDED");
        require(proposal.publishVotes > proposal.rejectVotes, "NOT_PASSED");
        require(!proposal.decided, "VOTE_COMPLETE");

        proposal.decided = true;
        acceptedPapers.push(proposal.paper);

    }
    function getProposal(uint _id) external view returns (ProposedPaper memory) {
        require(_id <= numProposals, "ID_OUT_OF_BOUNDS");
        return proposals[_id];
    }

    function getTotalProposals() external view returns (uint) {
        return numProposals;
    }

    // Join the DAO
    function joinDAO() external {
        console.log("%s JOINED DAO", msg.sender);
        reviewers.push(msg.sender);
    }

    function getReviewers() external view returns  (address[] memory) {
        return reviewers;
    }

    function getAcceptedPapers() external view returns (string[] memory) {
        return acceptedPapers;
    }

    // Leave the DAO

    // receive and fallback functions
    receive() external payable {}

    fallback() external payable {}
}
