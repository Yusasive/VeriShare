import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error("Invalid hex length");
  const arr = new Uint8Array(clean.length / 2);
  for (let i = 0; i < arr.length; i++) arr[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return arr;
}

export function generatePrivateKeyHex(): string {
  const priv = secp256k1.utils.randomPrivateKey();
  return toHex(priv);
}

export function getPublicKeyUncompressedHex(privateKeyHex: string): string {
  const pub = secp256k1.getPublicKey(fromHex(privateKeyHex), false); // uncompressed 65 bytes
  return toHex(pub);
}

export function signSha256ToDerHex(message: string, privateKeyHex: string): string {
  const msgBytes = new TextEncoder().encode(message);
  const digest = sha256(msgBytes);
  const sig = secp256k1.sign(digest, fromHex(privateKeyHex));
  return sig.toDERHex();
}

export function sha256Hex(data: string): string {
  const d = sha256(new TextEncoder().encode(data));
  return toHex(d);
}

export function isUncompressedSecp256k1PubHex(addr: string): boolean {
  return /^04[0-9a-fA-F]{128}$/.test(addr.trim());
}
