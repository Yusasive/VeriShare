"use client";
import { useState } from "react";
import Protected from "@/components/Protected";
import GradientOrbs from "@/components/GradientOrbs";
import { issueConsentToken } from "@/lib/api";
import QRCode from "react-qr-code";
export default function IssueTokenPage() {
  const [requestId, setRequestId] = useState("");
  const [minutes, setMinutes] = useState(5);
  const [status, setStatus] = useState("");
  const [token, setToken] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const issue = async () => {
    try {
      setStatus("Issuing...");
      const res = await issueConsentToken(requestId.trim(), Number(minutes));
      if (!res.ok) throw new Error(res.error);
      setToken(res.data.token);
      setExpiresAt(res.data.expiresAt);
      setStatus("Token issued.");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setStatus(e.message || "Failed");
      } else {
        setStatus("Failed");
      }
    }
  };

  return (
    <Protected>
      <main className="relative min-h-screen pt-28 pb-24">
        <GradientOrbs />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-indigo-300">
            Issue Consent Token
          </h1>
          <p className="mt-3 text-white/70">
            Create a short-lived token for a consent request (org must be
            authenticated).
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 grid gap-4">
            <div>
              <label className="block text-sm text-white/70">Request ID</label>
              <input
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70">
                Expires In (minutes)
              </label>
              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={issue}
                className="rounded-full px-5 py-2 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300"
              >
                Issue
              </button>
              {token && (
                <button
                  onClick={() => navigator.clipboard.writeText(token)}
                  className="rounded-full px-5 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/20 hover:bg-white/5"
                >
                  Copy Token
                </button>
              )}
            </div>
            {token && (
              <div className="text-sm text-white/80 break-all flex flex-col gap-2 items-start">
                <div>
                  <span className="text-white/60">Token:</span> {token}
                </div>
                <div className="mt-1">
                  <span className="text-white/60">Expires:</span>{" "}
                  {new Date(expiresAt).toLocaleString()}
                </div>
                <div className="mt-3 flex flex-col items-center">
                  <div
                    style={{ background: "#fff", padding: 8, borderRadius: 8 }}
                  >
                    <QRCode
                      value={`https://verishare.org/redeem/${token}`}
                      size={128}
                      fgColor="#164e63"
                    />
                  </div>
                  <a
                    href={`https://verishare.org/redeem/${token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 underline text-cyan-300 hover:text-cyan-200 text-xs"
                  >
                    Open Redemption Link
                  </a>
                </div>
              </div>
            )}
            <div className="text-sm text-white/70">
              Status: {status || "Idle"}
            </div>
          </div>
        </div>
      </main>
    </Protected>
  );
}
