"use client";
import Protected from "@/components/Protected";
import GradientOrbs from "@/components/GradientOrbs";
import { useState } from "react";
import { organizationReview } from "@/lib/api";

interface Organization {
  verificationStatus: string;
}

interface OrganizationReviewResponse {
  organization: Organization;
}

export default function AdminReviewPage() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"approved" | "rejected">("approved");
  const [notes, setNotes] = useState("");
  const [out, setOut] = useState("");

  const submit = async () => {
    try {
      setOut("Submitting review...");
      const res = await organizationReview({
        address: address.trim(),
        status,
        reviewNotes: notes,
      });
      if (!res.ok) throw new Error(res.error);
      const data = res.data as OrganizationReviewResponse;
      setOut(
        `Review recorded. Status: ${data.organization.verificationStatus}`
      );
    } catch (e: unknown) {
      if (e instanceof Error) {
        setOut(e.message || "Failed");
      } else {
        setOut("Failed");
      }
    }
  };

  return (
    <Protected>
      <main className="relative min-h-screen pt-28 pb-24">
        <GradientOrbs />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-indigo-300">
            Admin: Review Organization
          </h1>
          <p className="mt-3 text-white/70">
            Approve or reject an organization (requires admin wallet JWT).
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 grid gap-4">
            <div>
              <label className="block text-sm text-white/70">
                Organization Address
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
                placeholder="04..."
              />
            </div>
            <div>
              <label className="block text-sm text-white/70">Decision</label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "approved" | "rejected")
                }
                className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
              >
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/70">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={submit}
                className="rounded-full px-5 py-2 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300"
              >
                Submit
              </button>
            </div>
            <div className="text-sm text-white/70">Status: {out || "Idle"}</div>
          </div>
        </div>
      </main>
    </Protected>
  );
}
