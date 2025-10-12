"use client";
import { useEffect, useState } from "react";
import { getMe, getOrgProfile } from "@/lib/api";
import Protected from "@/components/Protected";
import GradientOrbs from "@/components/GradientOrbs";

interface Organization {
  verificationStatus: string;
}

interface OrgProfileResponse {
  organization?: Organization;
}

export default function OrgOnboardingPage() {
  const [form, setForm] = useState({
    name: "",
    domain: "",
    contactEmail: "",
    description: "",
    govType: "organization", // or "government"
  });
  const [status, setStatus] = useState("");
  const [orgStatus, setOrgStatus] = useState<null | string>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      const me = await getMe();
      if (!me.ok) {
        setStatus("Not authenticated");
        setLoading(false);
        return;
      }
      setAddress(me.data.wallet.address);
      const org = await getOrgProfile(me.data.wallet.address);
      if (org.ok && org.data && (org.data as OrgProfileResponse).organization) {
        const data = org.data as OrgProfileResponse;
        if (data.organization && data.organization.verificationStatus) {
          setOrgStatus(data.organization.verificationStatus);
        } else {
          setOrgStatus("pending");
        }
      } else {
        setOrgStatus(null);
      }
      setLoading(false);
    }
    fetchStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.domain || !form.contactEmail) {
      setStatus("Please fill all required fields.");
      return;
    }
    setStatus("Submitting...");
    try {
      const res = await fetch("/api/organization/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          name: form.name,
          domain: form.domain,
          documents: [],
          metadata: {
            contactEmail: form.contactEmail,
            description: form.description,
            govType: form.govType,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setStatus("Submitted! Await admin verification.");
      setOrgStatus("pending");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setStatus(e.message || "Failed to submit");
      } else {
        setStatus("Failed to submit");
      }
    }
  };

  return (
    <Protected>
      <main className="relative min-h-screen pt-28 pb-24">
        <GradientOrbs />
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-indigo-300">
            Organization/Government Onboarding
          </h1>
          {loading ? (
            <div className="mt-8 text-white/70">Loading...</div>
          ) : orgStatus ? (
            <div className="mt-8 space-y-6 bg-white/5 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-cyan-200">
                Onboarding Status
              </h2>
              <div className="text-white/80">
                Status: <span className="font-semibold">{orgStatus}</span>
              </div>
              {orgStatus === "pending" && (
                <div className="text-yellow-300">
                  Your application is pending admin review.
                </div>
              )}
              {orgStatus === "approved" && (
                <div className="text-emerald-400">
                  You are verified! You can now access your dashboard.
                </div>
              )}
              {orgStatus === "rejected" && (
                <div className="text-rose-400">
                  Your application was rejected. Please contact support.
                </div>
              )}
            </div>
          ) : (
            <form
              className="mt-8 space-y-6 bg-white/5 border border-white/10 rounded-2xl p-8"
              onSubmit={handleSubmit}
            >
              <div>
                <label className="block text-sm text-white/70">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70">Domain</label>
                <input
                  name="domain"
                  value={form.domain}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70">
                  Contact Email
                </label>
                <input
                  name="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70">Type</label>
                <select
                  name="govType"
                  value={form.govType}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
                >
                  <option value="organization">Organization</option>
                  <option value="government">Government</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
              >
                Submit
              </button>
              {status && <div className="mt-4 text-white/80">{status}</div>}
            </form>
          )}
        </div>
      </main>
    </Protected>
  );
}
