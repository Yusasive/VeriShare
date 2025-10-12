"use client";
import { useMemo, useState } from "react";
import {
  generatePrivateKeyHex,
  getPublicKeyUncompressedHex,
  isUncompressedSecp256k1PubHex,
  signSha256ToDerHex,
  sha256Hex,
} from "@/lib/crypto";
import {
  authChallenge,
  authRegister,
  authVerify,
  getJwt,
  setJwt,
} from "@/lib/api";
import GradientOrbs from "@/components/GradientOrbs";
import dynamic from "next/dynamic";
const ConnectWalletClient = dynamic(
  () => import("@/components/ConnectWallet"),
  { ssr: false }
);

async function aesGcmEncryptHex(
  plainHex: string,
  passphrase: string
): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plainHex)
  );
  const toB64 = (u8: Uint8Array) => {
    let s = "";
    for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return btoa(s);
  };
  const pack = {
    alg: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    iters: 100000,
    salt: toB64(salt),
    iv: toB64(iv),
    ct: toB64(new Uint8Array(cipher)),
  };
  return btoa(JSON.stringify(pack));
}

export default function WalletLoginPage() {
  const [privHex, setPrivHex] = useState("");
  const [pubHex, setPubHex] = useState("");
  const [pass, setPass] = useState("");
  const [nonce, setNonce] = useState("");
  const [status, setStatus] = useState("");
  const jwt = useMemo(
    () => (typeof window !== "undefined" ? getJwt() : ""),
    []
  );

  const gen = () => {
    const p = generatePrivateKeyHex();
    const pub = getPublicKeyUncompressedHex(p);
    setPrivHex(p);
    setPubHex(pub);
    setStatus("Keypair generated locally.");
  };

  const register = async () => {
    try {
      if (!privHex || !isUncompressedSecp256k1PubHex(pubHex))
        throw new Error("Generate keys first");
      if (!pass || pass.length < 8) throw new Error("Passphrase min 8 chars");
      setStatus("Encrypting and registering...");
      const encryptedPrivateKey = await aesGcmEncryptHex(privHex, pass);
      const authSecretHash = sha256Hex(pubHex);
      const res = await authRegister({
        address: pubHex,
        publicKey: pubHex,
        encryptedPrivateKey,
        authSecretHash,
        metadata: { createdAt: new Date().toISOString() },
      });
      if (!res.ok) throw new Error(res.error);
      setStatus("Registered. You can now request a challenge.");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setStatus(e.message || "Registration failed");
      } else {
        setStatus("Registration failed");
      }
    }
  };

  const challenge = async () => {
    try {
      if (!isUncompressedSecp256k1PubHex(pubHex))
        throw new Error("Invalid address");
      setStatus("Requesting challenge...");
      const res = await authChallenge(pubHex);
      if (!res.ok) throw new Error(res.error);
      setNonce(res.data.nonce);
      setStatus("Challenge received. Ready to sign.");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setStatus(e.message || "Challenge failed");
      } else {
        setStatus("Challenge failed");
      }
    }
  };

  const signAndVerify = async () => {
    try {
      if (!privHex || !nonce) throw new Error("Missing key or nonce");
      const signatureDerHex = signSha256ToDerHex(nonce, privHex);
      setStatus("Verifying signature...");
      const res = await authVerify(pubHex, signatureDerHex);
      if (!res.ok) throw new Error(res.error);
      setJwt(res.data.token);
      setStatus("Authenticated. JWT saved.");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setStatus(e.message || "Verification failed");
      } else {
        setStatus("Verification failed");
      }
    }
  };

  return (
    <main className="relative min-h-screen pt-28 pb-24">
      <GradientOrbs />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-indigo-300">
          Wallet Login
        </h1>
        <p className="mt-3 text-white/70">
          Connect your MetaMask wallet to authenticate. JWT is stored locally
          for API calls.
        </p>

        <div className="mt-8 grid gap-6">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 grid gap-4">
            <h2 className="text-lg font-semibold text-white">MetaMask</h2>
            <p className="text-sm text-white/70">
              Connect and sign a one-time challenge to log in.
            </p>
            {/* @ts-expect-error Server components don't infer client child types */}
            <div>
              {/* Client component */}
              <ConnectWalletClient />
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 grid gap-4">
            <h2 className="text-lg font-semibold text-white">
              1) Generate Keys
            </h2>
            <div className="flex gap-3">
              <button
                onClick={gen}
                className="rounded-full px-5 py-2 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300"
              >
                Generate
              </button>
              {pubHex && (
                <button
                  onClick={() => navigator.clipboard.writeText(pubHex)}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/20 hover:bg-white/5"
                >
                  Copy Address
                </button>
              )}
            </div>
            {pubHex && (
              <div className="text-xs text-white/70 break-all">
                <div>
                  <span className="text-white/60">Public (address):</span>{" "}
                  {pubHex}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 grid gap-4">
            <h2 className="text-lg font-semibold text-white">
              2) Register Wallet
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70">
                  Passphrase (to encrypt private key)
                </label>
                <input
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  type="password"
                  placeholder="Min 8 chars"
                  className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={register}
                className="rounded-full px-5 py-2 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300"
              >
                Register
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 grid gap-4">
            <h2 className="text-lg font-semibold text-white">
              3) Login (Challenge / Sign)
            </h2>
            <div className="flex gap-3">
              <button
                onClick={challenge}
                className="rounded-full px-5 py-2 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300"
              >
                Request Challenge
              </button>
              <button
                onClick={signAndVerify}
                className="rounded-full px-5 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/20 hover:bg-white/5"
              >
                Sign & Verify
              </button>
            </div>
            {nonce && (
              <div className="text-xs text-white/60 break-all">
                Nonce: {nonce}
              </div>
            )}
          </section>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <div>Status: {status || "Idle"}</div>
            <div className="mt-1">JWT: {jwt ? "present" : "none"}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
