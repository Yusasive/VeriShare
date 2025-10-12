"use client";
import { useEffect, useState } from "react";
import { getOrgVerified } from "@/lib/api";

export default function EvmStatusWidget({ address }: { address: string }) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setErr("");
      setVerified(null);
      const res = await getOrgVerified(address);
      if (!mounted) return;
      if (!res.ok) setErr(res.error);
      else setVerified(!!res.data.verified);
    }
    if (address) load();
    return () => { mounted = false; };
  }, [address]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
      <div className="text-white/70">On-chain Verification</div>
      {err ? (
        <div className="mt-1 text-amber-300/80">{err}</div>
      ) : verified === null ? (
        <div className="mt-1 text-white/60">Loading...</div>
      ) : (
        <div className="mt-1">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${verified ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"}`}>
            <span className={`size-2 rounded-full ${verified ? "bg-emerald-400" : "bg-rose-400"}`} />
            {verified ? "Verified organization" : "Not verified"}
          </span>
        </div>
      )}
    </div>
  );
}
