// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract WalletRegistry {
    // Maps keccak256(uncompressedSecp256k1PubKeyHex) => EVM address owner
    mapping(bytes32 => address) public resolver;

    event Bound(bytes32 indexed pubKeyHash, address indexed owner);
    event Unbound(bytes32 indexed pubKeyHash, address indexed owner);

    function bind(bytes calldata pubKeyHex) external {
        bytes memory p = pubKeyHex;
        if (p.length == 132) {
            require(p[0] == 0x30 && (p[1] == 0x78 || p[1] == 0x58), "invalid 0x prefix");
            bytes memory q = new bytes(130);
            for (uint256 i = 0; i < 130; i++) { q[i] = p[i + 2]; }
            p = q;
        } else {
            require(p.length == 130, "invalid pubkey len");
        }
        bytes32 h = keccak256(p);
        resolver[h] = msg.sender;
        emit Bound(h, msg.sender);
    }

    function unbind(bytes calldata pubKeyHex) external {
        bytes memory p = pubKeyHex;
        if (p.length == 132) {
            require(p[0] == 0x30 && (p[1] == 0x78 || p[1] == 0x58), "invalid 0x prefix");
            bytes memory q = new bytes(130);
            for (uint256 i = 0; i < 130; i++) { q[i] = p[i + 2]; }
            p = q;
        } else {
            require(p.length == 130, "invalid pubkey len");
        }
        bytes32 h = keccak256(p);
        require(resolver[h] == msg.sender, "not owner");
        delete resolver[h];
        emit Unbound(h, msg.sender);
    }

    function resolve(bytes32 pubKeyHash) external view returns (address) {
        return resolver[pubKeyHash];
    }
}
