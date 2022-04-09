// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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

    struct ProposedPaper {
        string basePaper;
        string[] revisions;
        bool decided;
        bool rejectVotes;
        bool publishVotes;
    }

    // Request Revisions
    
    // Create a Proposal for Research Paper

    // Publish proposal 
}