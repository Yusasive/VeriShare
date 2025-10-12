"use client";
import { useState } from "react";
import { authEvmChallenge, authEvmRegister, authEvmVerify, getJwt, setJwt } from "@/lib/api";

declare global {
  interface Window {
    ethereum?: unknown;
  }
}

export default function ConnectWallet({ onConnected }: { onConnected?: (address: string) => void }) {
  const [status, setStatus] = useState("");
  const [address, setAddress] = useState("");

  const connect = async () => {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        setStatus("MetaMask not detected");
        return;
      }
      setStatus("Requesting accounts...");
      const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });
      const addr = accounts[0];
      setAddress(addr);

      const chainId: string = await window.ethereum.request({ method: "eth_chainId" });
      await authEvmRegister({ address: addr, chainId });

      setStatus("Requesting challenge...");
      const ch = await authEvmChallenge(addr);
      if (!ch.ok) throw new Error(ch.error);

      setStatus("Signing challenge...");
      const signature: string = await window.ethereum.request({
        method: "personal_sign",
        params: [ch.data.nonce, addr],
      });

      setStatus("Verifying...");
      const vr = await authEvmVerify(addr, signature);
      if (!vr.ok) throw new Error(vr.error);
      setJwt(vr.data.token);
      setStatus("Authenticated");
      onConnected?.(addr);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Connection failed";
      setStatus(msg);
    }
  };

  return (
    <div className="grid gap-3">
      <button onClick={connect} className="rounded-full px-5 py-2 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300">
        Connect MetaMask
      </button>
      <div className="text-xs text-white/70">{status || (getJwt() ? "Ready" : "Idle")}</div>
      {address && (
        <div className="text-xs text-white/60 break-all">Address: {address}</div>
      )}
    </div>
  );
}
