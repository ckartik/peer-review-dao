// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPeerReviewersNFT {}

// Peer Review DAO
contract PeerReviewDAO {
    // List of accepted papers.
    ProposedPaper[] acceptedPapers;

    // Enum vote
    // TODO(@ckartik): The REVISE
    enum VoteType {
        PUBLISH,
        PUBLISH_WITH_REVISION,
        REJECT
    }

    struct Paper {
        string basePaper;
        string[] revisions;
    }

    struct ProposedPaper {
        Paper paper;
        bool decided;
        uint256 rejectVotes;
        uint256 publishVotes;
        uint256 voteDeadline;
        mapping(address => bool) voterRegister;
    }

    struct Reviewer {
        uint256 joinedAt;
        // Array of PeerReviewersNFTs locked up by the member.
        uint256[] lockedUpNFTs;
    }

    mapping(uint256 => ProposedPaper) public proposals;
    mapping(address => Reviewer) public reviewers;

    uint256 public numProposals;

    modifier reviewerOnly() {
        require(
            reviewers[msg.sender].lockedUpNFTs.length > 0,
            "NOT_A_REVIEWER"
        );
        _;
    }

    // Create a Proposal for Research Paper
    function proposePaper(string memory _paper) external returns (uint256) {
        ProposedPaper storage proposal = proposals[numProposals];
        proposal.paper.basePaper = _paper;
        proposal.voteDeadline = block.timestamp + 5 minutes;

        numProposals++;

        return numProposals - 1;
    }

    // Request Revisions

    // Vote on Proposals
    function voteOnProposal(uint256 _proposalId, VoteType _vote)
        external
        reviewerOnly
    {
        ProposedPaper storage proposal = proposals[_proposalId];
        require(proposal.voteDeadline > block.timestamp, "INACTIVE_PROPOSAL");
        require(proposal.voterRegister[msg.sender] == false, "ALREADY_VOTED");

        proposal.voterRegister[msg.sender] = true;
        if (_vote == VoteType.PUBLISH) {
            proposal.publishVotes++;
        } else if (_vote == VoteType.REJECT) {
            proposal.rejectVotes++;
        }
    }

    // Publish proposal

    // Join the DAO

    // Leave the DAO

    // receive and fallback functions
    receive() external payable {}

    fallback() external payable {}
}
