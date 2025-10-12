"use client";
import { useMemo, useState } from "react";
import GradientOrbs from "@/components/GradientOrbs";

function isValidAddress(addr: string) {
  return /^04[0-9a-fA-F]{128}$/.test(addr.trim());
}
function isValidDomain(u: string) {
  try {
    const url = new URL(u);
    return !!url.hostname;
  } catch {
    return false;
  }
}

export default function OnboardingPage() {
  const [form, setForm] = useState({
    name: "",
    rcNumber: "",
    domain: "",
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const jwt = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("verishare.jwt") || ""
        : "",
    []
  );
  const valid = useMemo(() => {
    return (
      form.name.trim().length > 1 &&
      isValidDomain(form.domain) &&
      isValidAddress(form.address)
    );
  }, [form]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      if (!jwt) throw new Error("Missing JWT. Save token above.");
      if (!valid) throw new Error("Fix validation errors.");
      const base = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${base}/api/organization/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          address: form.address.trim(),
          name: form.name.trim(),
          domain: form.domain.trim(),
          metadata: {
            rcNumber: form.rcNumber.trim(),
            notes: form.notes.trim(),
          },
          documents: [],
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed: ${res.status} ${text}`);
      }
      setMessage("Application submitted successfully.");
      setForm({ name: "", rcNumber: "", domain: "", address: "", notes: "" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message || "Submission failed");
      } else {
        setMessage("Submission failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen pt-28 pb-24">
      <GradientOrbs />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-indigo-300">
          Organization Onboarding
        </h1>
        <p className="mt-4 text-white/70">
          Apply to become a verified organization. Once approved, you can issue
          QR/tokens and verify user credentials.
        </p>

        <div className="mt-8"></div>

        <form
          onSubmit={onSubmit}
          className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 grid gap-5"
        >
          <div>
            <label className="block text-sm text-white/70">
              Organization Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Mujaddiduun Alumni Network"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-white/70">RC Number</label>
              <input
                name="rcNumber"
                value={form.rcNumber}
                onChange={onChange}
                className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="1234567"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70">Domain</label>
              <input
                name="domain"
                value={form.domain}
                onChange={onChange}
                type="url"
                required
                className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="https://example.org"
              />
              {!isValidDomain(form.domain) && form.domain && (
                <p className="mt-1 text-xs text-amber-300/80">
                  Enter a valid URL starting with https://
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/70">
              Public Key (address)
            </label>
            <input
              name="address"
              value={form.address}
              onChange={onChange}
              required
              className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="04... (uncompressed secp256k1 public key)"
            />
            {!isValidAddress(form.address) && form.address && (
              <p className="mt-1 text-xs text-amber-300/80">
                Must be uncompressed secp256k1 public key hex (130 chars
                starting with 04).
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-white/70">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={onChange}
              rows={4}
              className="mt-2 w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Additional info"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              disabled={submitting || !valid || !jwt}
              type="submit"
              className="rounded-full px-6 py-3 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
            {message && (
              <span className="text-sm text-white/70">{message}</span>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
