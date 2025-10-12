"use client";
import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import GradientOrbs from "@/components/GradientOrbs";
import { QRCodeCanvas } from "qrcode.react";

export default function TokenQrPage() {
  const [token, setToken] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get("token");
    if (t) setToken(t);
  }, []);

  return (
    <Protected>
      <main className="relative min-h-screen pt-28 pb-24">
        <GradientOrbs />
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-indigo-300">Consent Token QR</h1>
          <p className="mt-3 text-white/70">Show this QR for users to scan with their wallet app.</p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col items-center gap-4">
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="paste token" className="w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white" />
            {token ? (
              <div className="bg-white p-4 rounded-xl">
                <QRCodeCanvas value={token} size={220} includeMargin={true} />
              </div>
            ) : (
              <div className="text-sm text-white/60">Enter a token to generate QR</div>
            )}
          </div>
        </div>
      </main>
    </Protected>
  );
}
