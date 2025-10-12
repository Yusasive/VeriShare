"use client";
import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import GradientOrbs from "@/components/GradientOrbs";
import { createConsentRequest, getMe } from "@/lib/api";

export default function NewConsentRequestPage() {
  const [credentialId, setCredentialId] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [organizationAddress, setOrganizationAddress] = useState("");
  const [requestedData, setRequestedData] = useState("[]");
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const me = await getMe();
      if (mounted && me.ok) setOrganizationAddress(me.data.wallet.address);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const submit = async () => {
    try {
      setStatus("Submitting...");
      let payload: unknown[] = [];
      try {
        payload = JSON.parse(requestedData || "[]");
      } catch {
        throw new Error("requestedData must be valid JSON array");
      }
      const res = await createConsentRequest({
        credentialId: credentialId.trim(),
        ownerAddress: ownerAddress.trim(),
        organizationAddress: organizationAddress.trim(),
        requestedData: payload,
        expiresInHours: Number(expiresInHours),
      });
      if (!res.ok) throw new Error(res.error);
      type ConsentRequestResponse = { request: { requestId: string } };
      const data = res.data as ConsentRequestResponse;
      setStatus(`Created request ${data.request.requestId}`);
      setCredentialId("");
      setOwnerAddress("");
      setRequestedData("[]");
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
            New Consent Request
          </h1>
          <p className="mt-3 text-white/70">
            Request access to a user&apos;s credential. Token issuance comes
            after creating a request.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 grid gap-4">
            <div>
              <label className="block text-sm text-white/70">
                Organization Address
              </label>
              <input
                value={organizationAddress}
                onChange={(e) => setOrganizationAddress(e.target.value)}
                className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
                placeholder="04..."
              />
            </div>
            <div>
              <label className="block text-sm text-white/70">
                Owner Address
              </label>
              <input
                value={ownerAddress}
                onChange={(e) => setOwnerAddress(e.target.value)}
                className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
                placeholder="04..."
              />
            </div>
            <div>
              <label className="block text-sm text-white/70">
                Credential ID
              </label>
              <input
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
                placeholder="credential id"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70">
                Requested Data (JSON array)
              </label>
              <textarea
                value={requestedData}
                onChange={(e) => setRequestedData(e.target.value)}
                rows={5}
                className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
                placeholder='["name","email"]'
              />
            </div>
            <div>
              <label className="block text-sm text-white/70">
                Expires In (hours)
              </label>
              <input
                type="number"
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(Number(e.target.value))}
                className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={submit}
                className="rounded-full px-5 py-2 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300"
              >
                Create
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
