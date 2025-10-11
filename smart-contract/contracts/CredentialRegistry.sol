// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface IVerifiedIssuerNFT { function isVerified(address org) external view returns (bool); }

contract CredentialRegistry is AccessControl, Pausable, EIP712 {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    struct Credential {
        address issuer;
        address subject;
        bytes32 hash;
        string uri; // e.g., ipfs://CID
        uint64 issuedAt;
        bool revoked;
    }

    struct CredentialV2Data {
        bytes contentHash; // EIP-1577 contenthash
    }

    struct Share {
        address owner;
        address org;
        uint256 credentialId;
        uint64 expiresAt;
        bool revoked;
    }

    uint256 private _nextId;
    uint256 private _nextShareId;
    mapping(uint256 => Credential) private _creds;
    mapping(uint256 => Share) private _shares; // shareId => Share
    mapping(uint256 => CredentialV2Data) private _v2;
    mapping(uint256 => mapping(address => uint256)) private _lastShare; // credentialId => org => last known active shareId

    IVerifiedIssuerNFT public verifier;

    // EIP-712 issue by signature
    mapping(address => uint256) public nonces; // issuer => nonce
    bytes32 public constant ISSUE_TYPEHASH = keccak256(
        "Issue(address issuer,address subject,bytes32 hash,string uri,uint256 nonce,uint256 deadline)"
    );
    bytes32 public constant GRANT_TYPEHASH = keccak256(
        "Grant(address subject,uint256 credentialId,address org,uint64 expiresAt,uint256 nonce,uint256 deadline)"
    );

    event CredentialIssued(
        uint256 indexed id,
        address indexed issuer,
        address indexed subject,
        bytes32 hash,
        string uri
    );

    event CredentialRevoked(uint256 indexed id, address indexed issuer);

    event ShareGranted(
        uint256 indexed shareId,
        uint256 indexed credentialId,
        address indexed owner,
        address org,
        uint64 expiresAt
    );

    event ShareRevoked(uint256 indexed shareId, address indexed owner);

    constructor(address admin_, address verifier_) EIP712("CredentialRegistry", "1") {
        _nextId = 1;
        _nextShareId = 1;
        verifier = IVerifiedIssuerNFT(verifier_);
        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(PAUSER_ROLE, admin_);
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }
    function setVerifier(address v) external onlyRole(DEFAULT_ADMIN_ROLE) { verifier = IVerifiedIssuerNFT(v); }

    function _issueCredentialInternal(
        address issuer,
        address subject,
        bytes32 hash,
        string calldata uri
    ) internal returns (uint256 id) {
        require(subject != address(0), "invalid subject");
        require(hash != bytes32(0), "invalid hash");
        id = _nextId++;
        _creds[id] = Credential({
            issuer: issuer,
            subject: subject,
            hash: hash,
            uri: uri,
            issuedAt: uint64(block.timestamp),
            revoked: false
        });
        emit CredentialIssued(id, issuer, subject, hash, uri);
    }

    function issueCredential(
        address subject,
        bytes32 hash,
        string calldata uri
    ) external whenNotPaused returns (uint256 id) {
        return _issueCredentialInternal(msg.sender, subject, hash, uri);
    }

    function issueCredentialV2(
        address subject,
        bytes32 hash,
        string calldata uri,
        bytes calldata contentHash
    ) external whenNotPaused returns (uint256 id) {
        id = _issueCredentialInternal(msg.sender, subject, hash, uri);
        _v2[id] = CredentialV2Data({ contentHash: contentHash });
    }

    function revokeCredential(uint256 id) external whenNotPaused {
        Credential storage c = _creds[id];
        require(c.issuer != address(0), "not found");
        require(msg.sender == c.issuer, "only issuer");
        require(!c.revoked, "already revoked");
        c.revoked = true;
        emit CredentialRevoked(id, msg.sender);
    }

    function grantShare(
        uint256 credentialId,
        address org,
        uint64 expiresAt
    ) external whenNotPaused returns (uint256 shareId) {
        require(org != address(0), "invalid org");
        require(address(verifier) != address(0) && verifier.isVerified(org), "org not verified");
        Credential storage c = _creds[credentialId];
        require(c.issuer != address(0) && !c.revoked, "invalid credential");
        require(msg.sender == c.subject, "only subject");
        shareId = _nextShareId++;
        _shares[shareId] = Share({
            owner: c.subject,
            org: org,
            credentialId: credentialId,
            expiresAt: expiresAt,
            revoked: false
        });
        emit ShareGranted(shareId, credentialId, c.subject, org, expiresAt);
        _lastShare[credentialId][org] = shareId;
    }

    function revokeShare(uint256 shareId) external whenNotPaused {
        Share storage s = _shares[shareId];
        require(s.owner != address(0), "not found");
        require(msg.sender == s.owner, "only owner");
        require(!s.revoked, "already revoked");
        s.revoked = true;
        emit ShareRevoked(shareId, s.owner);
        if (_lastShare[s.credentialId][s.org] == shareId) {
            uint256 i = shareId;
            uint256 latestValid = 0;
            while (i > 1) {
                unchecked { i--; }
                Share storage prev = _shares[i];
                if (
                    prev.owner != address(0) &&
                    !prev.revoked &&
                    prev.org == s.org &&
                    prev.credentialId == s.credentialId &&
                    (prev.expiresAt == 0 || prev.expiresAt >= block.timestamp)
                ) { latestValid = i; break; }
            }
            _lastShare[s.credentialId][s.org] = latestValid;
        }
    }

    function issueCredentialBySig(
        address issuer,
        address subject,
        bytes32 hash,
        string calldata uri,
        uint256 deadline,
        uint8 v, bytes32 r, bytes32 s
    ) external whenNotPaused returns (uint256 id) {
        require(block.timestamp <= deadline, "expired");
        require(issuer != address(0), "invalid issuer");
        uint256 nonce = nonces[issuer]++;
        bytes32 structHash = keccak256(abi.encode(
            ISSUE_TYPEHASH,
            issuer,
            subject,
            hash,
            keccak256(bytes(uri)),
            nonce,
            deadline
        ));
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, v, r, s);
        require(signer == issuer, "invalid sig");
        return _issueCredentialInternal(issuer, subject, hash, uri);
    }

    function grantShareBySig(
        address subject,
        uint256 credentialId,
        address org,
        uint64 expiresAt,
        uint256 deadline,
        uint8 v, bytes32 r, bytes32 s
    ) external whenNotPaused returns (uint256 shareId) {
        require(block.timestamp <= deadline, "expired");
        require(org != address(0), "invalid org");
        require(address(verifier) != address(0) && verifier.isVerified(org), "org not verified");
        Credential storage c = _creds[credentialId];
        require(c.issuer != address(0) && !c.revoked, "invalid credential");
        require(subject == c.subject, "subject mismatch");
        uint256 nonce = nonces[subject]++;
        bytes32 structHash = keccak256(abi.encode(
            GRANT_TYPEHASH,
            subject,
            credentialId,
            org,
            expiresAt,
            nonce,
            deadline
        ));
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, v, r, s);
        require(signer == subject, "invalid sig");
        shareId = _nextShareId++;
        _shares[shareId] = Share({
            owner: c.subject,
            org: org,
            credentialId: credentialId,
            expiresAt: expiresAt,
            revoked: false
        });
        emit ShareGranted(shareId, credentialId, c.subject, org, expiresAt);
        _lastShare[credentialId][org] = shareId;
    }

    function _isShareActive(Share storage sh) internal view returns (bool) {
        return (
            sh.owner != address(0) &&
            !sh.revoked &&
            (sh.expiresAt == 0 || sh.expiresAt >= block.timestamp)
        );
    }

    function canOrgAccess(address org, uint256 credentialId) external view returns (bool) {
        Credential storage c = _creds[credentialId];
        if (c.issuer == address(0) || c.revoked) return false;
        uint256 idx = _lastShare[credentialId][org];
        if (idx != 0) {
            Share storage s0 = _shares[idx];
            if (_isShareActive(s0) && s0.org == org && s0.credentialId == credentialId) {
                return true;
            }
        }
        uint256 i = _nextShareId;
        while (i > 1) {
            unchecked { i--; }
            Share storage s = _shares[i];
            if (s.org == org && s.credentialId == credentialId && _isShareActive(s)) {
                return true;
            }
        }
        return false;
    }

    function verify(uint256 id, bytes32 hash) external view returns (bool) {
        Credential storage c = _creds[id];
        return c.issuer != address(0) && !c.revoked && c.hash == hash;
    }

    function get(uint256 id) external view returns (
        address issuer,
        address subject,
        bytes32 hash,
        string memory uri,
        uint64 issuedAt,
        bool revoked
    ) {
        Credential storage c = _creds[id];
        require(c.issuer != address(0), "not found");
        return (c.issuer, c.subject, c.hash, c.uri, c.issuedAt, c.revoked);
    }

    function getV2(uint256 id) external view returns (bytes memory contentHash) {
        CredentialV2Data storage d = _v2[id];
        return d.contentHash;
    }

    function getShare(uint256 shareId) external view returns (
        address owner,
        address org,
        uint256 credentialId,
        uint64 expiresAt,
        bool revoked
    ) {
        Share storage s = _shares[shareId];
        require(s.owner != address(0), "not found");
        return (s.owner, s.org, s.credentialId, s.expiresAt, s.revoked);
    }

    function lastShareIdFor(uint256 credentialId, address org) external view returns (uint256) {
        return _lastShare[credentialId][org];
    }

    function nextId() external view returns (uint256) { return _nextId; }
    function nextShareId() external view returns (uint256) { return _nextShareId; }
}
