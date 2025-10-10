// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface IVerifiedIssuerNFT {
    function isVerified(address org) external view returns (bool);
}

contract ConsentAudit is EIP712 {
    IVerifiedIssuerNFT public verifier;

    mapping(address => uint256) public nonces; // subject => nonce

    bytes32 public constant CONSENT_TYPEHASH = keccak256(
        "Consent(address subject,address org,uint256 credentialId,bytes32 scopeHash,bool approved,uint256 nonce,uint256 deadline)"
    );

    event ConsentLogged(
        address indexed subject,
        address indexed org,
        uint256 indexed credentialId,
        bytes32 scopeHash,
        bool approved
    );

    constructor(address verifierAddr) EIP712("ConsentAudit", "1") {
        verifier = IVerifiedIssuerNFT(verifierAddr);
    }

    function logConsent(
        address org,
        uint256 credentialId,
        bytes32 scopeHash,
        bool approved
    ) external {
        require(verifier.isVerified(org), "org not verified");
        emit ConsentLogged(msg.sender, org, credentialId, scopeHash, approved);
    }

    function logConsentBySig(
        address subject,
        address org,
        uint256 credentialId,
        bytes32 scopeHash,
        bool approved,
        uint256 deadline,
        uint8 v, bytes32 r, bytes32 s
    ) external {
        require(block.timestamp <= deadline, "expired");
        require(verifier.isVerified(org), "org not verified");
        uint256 nonce = nonces[subject]++;
        bytes32 structHash = keccak256(abi.encode(
            CONSENT_TYPEHASH,
            subject,
            org,
            credentialId,
            scopeHash,
            approved,
            nonce,
            deadline
        ));
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, v, r, s);
        require(signer == subject, "invalid sig");
        emit ConsentLogged(subject, org, credentialId, scopeHash, approved);
    }
}
