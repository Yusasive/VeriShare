"use client";
import Protected from "@/components/Protected";
import GradientOrbs from "@/components/GradientOrbs";
import { useState } from "react";
import { revokeConsentToken } from "@/lib/api";

export default function RevokeTokenPage() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("");

  const revoke = async () => {
    try {
      setStatus("Revoking...");
      const res = await revokeConsentToken(token.trim());
      if (!res.ok) throw new Error(res.error);
      setStatus("Revoked.");
    } catch (e: unknown) {
      setStatus(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <Protected>
      <main className="relative min-h-screen pt-28 pb-24">
        <GradientOrbs />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-indigo-300">
            Revoke Consent Token
          </h1>
          <p className="mt-3 text-white/70">
            Invalidate a previously issued token.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 grid gap-4">
            <div>
              <label className="block text-sm text-white/70">Token</label>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={revoke}
                className="rounded-full px-5 py-2 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300"
              >
                Revoke
              </button>
            </div>
            <div className="text-sm text-white/70">
              Status: {status || "Idle"}
            </div>
          </div>
        </div>
      </main>
    </Protected>
  );
}
