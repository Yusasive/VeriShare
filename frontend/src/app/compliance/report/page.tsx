"use client";
import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import GradientOrbs from "@/components/GradientOrbs";
import { getComplianceReport, getMe } from "@/lib/api";

export default function ComplianceReportPage() {
  const [owner, setOwner] = useState("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [status, setStatus] = useState("");
  const [report, setReport] = useState<unknown | null>(null);

  useEffect(() => {
    (async () => {
      const me = await getMe();
      if (me.ok) setOwner(me.data.wallet.address);
    })();
  }, []);

  const load = async () => {
    setStatus("Loading...");
    const res = await getComplianceReport(
      owner,
      start || undefined,
      end || undefined
    );
    if (!res.ok) {
      setStatus(res.error);
      setReport(null);
      return;
    }
    setReport(res.data.report);
    setStatus("Loaded report.");
  };

  return (
    <Protected>
      <main className="relative min-h-screen pt-28 pb-24">
        <GradientOrbs />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-indigo-300">
            Compliance Report
          </h1>
          <p className="mt-3 text-white/70">
            Generate and view your activity metrics.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 grid gap-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-white/70">Owner</label>
                <input
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70">
                  Start (ISO)
                </label>
                <input
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  placeholder="e.g. 2025-01-01"
                  className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70">End (ISO)</label>
                <input
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  placeholder="e.g. 2025-01-31"
                  className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
                />
              </div>
            </div>
            <div>
              <button
                onClick={load}
                className="rounded-full px-6 py-3 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300"
              >
                Load Report
              </button>
              <span className="ml-3 text-sm text-white/70">
                {status || "Idle"}
              </span>
            </div>
          </div>

          {report && (
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="text-white/60 text-sm">Credentials</div>
                <div className="mt-2 text-white text-2xl font-bold">
                  {report.metrics.credentials.total}
                </div>
                <div className="mt-1 text-xs text-white/60">
                  Active: {report.metrics.credentials.active} • Revoked:{" "}
                  {report.metrics.credentials.revoked}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="text-white/60 text-sm">Shares</div>
                <div className="mt-2 text-white text-2xl font-bold">
                  {report.metrics.shares.made}
                </div>
                <div className="mt-1 text-xs text-white/60">
                  Expired: {report.metrics.shares.expired}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="text-white/60 text-sm">Consents</div>
                <div className="mt-2 text-white text-2xl font-bold">
                  {report.metrics.consent.approved}
                </div>
                <div className="mt-1 text-xs text-white/60">
                  Denied: {report.metrics.consent.denied}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </Protected>
  );
}
