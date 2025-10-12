"use client";
import { useMemo, useState } from "react";
import GradientOrbs from "@/components/GradientOrbs";
import { getJwt, getMe, getTokenInfo, redeemToken } from "@/lib/api";

interface TokenInfo {
  requestId: string;
  organizationAddress: string;
  status: string;
  expiresAt: string;
  requestedData: unknown;
}

export default function ConsentTokenPage() {
  const [token, setToken] = useState("");
  const [info, setInfo] = useState<TokenInfo | null>(null);
  const [status, setStatus] = useState("");
  const [owner, setOwner] = useState("");
  const jwt = useMemo(
    () => (typeof window !== "undefined" ? getJwt() : ""),
    []
  );

  const loadInfo = async () => {
    setStatus("Loading token info...");
    const res = await getTokenInfo(token.trim());
    if (!res.ok) {
      setStatus(res.error);
      setInfo(null);
      return;
    }
    setInfo(res.data);
    setStatus("Token loaded.");
  };

  const hydrateOwner = async () => {
    const me = await getMe();
    if (me.ok) setOwner(me.data.wallet.address);
  };

  const redeem = async () => {
    try {
      if (!info) throw new Error("Load token first");
      const addr =
        owner ||
        (await (async () => {
          const me = await getMe();
          return me.ok ? me.data.wallet.address : "";
        })());
      if (!addr) throw new Error("Owner address required (login)");
      setStatus("Redeeming...");
      const res = await redeemToken(token.trim(), addr);
      if (!res.ok) throw new Error(res.error);
      setStatus("Redeemed. Consent request fetched.");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setStatus(e.message || "Redeem failed");
      } else {
        setStatus("Redeem failed");
      }
    }
  };

  return (
    <main className="relative min-h-screen pt-28 pb-24">
      <GradientOrbs />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-indigo-300">
          Consent Token
        </h1>
        <p className="mt-3 text-white/70">
          View a token&apos;s details and redeem it to retrieve the consent
          request context.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 grid gap-4">
          <div>
            <label className="block text-sm text-white/70">Token</label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="hex token"
              className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadInfo}
              className="rounded-full px-5 py-2 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300"
            >
              View
            </button>
            <button
              onClick={hydrateOwner}
              className="rounded-full px-5 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/20 hover:bg-white/5"
            >
              Use My Address
            </button>
            <button
              onClick={redeem}
              className="rounded-full px-5 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/20 hover:bg-white/5"
            >
              Redeem
            </button>
          </div>
          {owner && (
            <div className="text-xs text-white/60 break-all">
              Owner: {owner}
            </div>
          )}
          {info && (
            <div className="text-sm text-white/80">
              <div>
                <span className="text-white/60">Request ID:</span>{" "}
                {info.requestId}
              </div>
              <div className="mt-1">
                <span className="text-white/60">Organization:</span>{" "}
                {info.organizationAddress}
              </div>
              <div className="mt-1">
                <span className="text-white/60">Status:</span> {info.status}
              </div>
              <div className="mt-1">
                <span className="text-white/60">Expires:</span>{" "}
                {new Date(info.expiresAt).toLocaleString()}
              </div>
              <div className="mt-2">
                <span className="text-white/60">Requested Data:</span>
                <pre className="mt-2 rounded bg-black/40 p-2 text-xs overflow-auto">
                  {JSON.stringify(info.requestedData, null, 2)}
                </pre>
              </div>
            </div>
          )}
          <div className="text-sm text-white/70">
            Status: {status || (jwt ? "Ready" : "Login recommended for redeem")}
          </div>
        </div>
      </div>
    </main>
  );
}
