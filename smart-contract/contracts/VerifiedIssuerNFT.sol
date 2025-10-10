// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract VerifiedIssuerNFT is ERC721, AccessControl {
    bytes32 public constant VERIFIER_ADMIN_ROLE = keccak256("VERIFIER_ADMIN_ROLE");

    uint256 private _nextId;
    mapping(address => bool) public isVerified; // convenience flag
    mapping(address => uint256) private _ownerTokenId; // O(1) lookup

    event OrganizationVerified(address indexed org, uint256 tokenId, string name, string uri);
    event OrganizationRevoked(address indexed org, uint256 tokenId);

    constructor(address admin_) ERC721("VerifiedIssuer", "VERI-ORG") {
        _nextId = 1;
        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(VERIFIER_ADMIN_ROLE, admin_);
    }

    function verifyOrg(address org, string calldata name, string calldata uri) external onlyRole(VERIFIER_ADMIN_ROLE) returns (uint256 tokenId) {
        require(org != address(0), "invalid org");
        require(!isVerified[org], "already verified");
        tokenId = _nextId++;
        _safeMint(org, tokenId);
        isVerified[org] = true;
        _ownerTokenId[org] = tokenId;
        emit OrganizationVerified(org, tokenId, name, uri);
    }

    function revokeOrg(address org) external onlyRole(VERIFIER_ADMIN_ROLE) {
        require(isVerified[org], "not verified");
        uint256 tokenId = _ownerTokenId[org];
        require(tokenId != 0, "token not found");
        _burn(tokenId);
        isVerified[org] = false;
        delete _ownerTokenId[org];
        emit OrganizationRevoked(org, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenIdOf(address owner) external view returns (uint256) {
        uint256 tid = _ownerTokenId[owner];
        require(tid != 0, "token not found");
        return tid;
    }
}
