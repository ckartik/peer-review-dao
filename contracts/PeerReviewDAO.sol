// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Peer Review DAO
contract PeerReviewDAO {
    // List of accepted papers.
    ProposedPaper[] acceptedPapers;

    // Enum vote
    enum VoteType {
        PUBLISH,
        REVISE,
        REJECT
    }

    struct ProposedPaper {
        string[] revisions;
    }

    // Request Revisions

    // Create a Proposal for Research Paper
    
    // Publish proposal 
}