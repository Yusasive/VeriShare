"use client";
import { useEffect, useMemo, useState } from "react";
import GradientOrbs from "@/components/GradientOrbs";
import EvmStatusWidget from "@/components/EvmStatusWidget";
import NftBadgeAndQr from "@/components/NftBadgeAndQr";
import { getOrgNftBadge } from "@/lib/api";
import { getJwt } from "@/lib/api";
import { getMe, getOrgProfile } from "@/lib/api";

import Protected from "@/components/Protected";

interface Organization {
  verificationStatus: string;
  name?: string;
  domain?: string;
}
interface OrgProfileResponse {
  organization?: Organization;
}
// Removed unused ConsentRequest interface

export default function OrgDashboardPage() {
  const [address, setAddress] = useState("");
  const [org, setOrg] = useState<OrgProfileResponse | null>(null);
  // Removed unused requests state
  const [error, setError] = useState("");
  const [nftBadge, setNftBadge] = useState<{
    tokenId: string;
    imageUrl: string;
    uri: string;
  } | null>(null);
  const jwt = useMemo(
    () => (typeof window !== "undefined" ? getJwt() : ""),
    []
  );

  useEffect(() => {
    let mounted = true;
    async function load() {
      setError("");
      const me = await getMe();
      if (!me.ok) {
        setError("Not authenticated. Go to Login.");
        return;
      }
      const addr = me.data.wallet.address;
      if (!mounted) return;
      setAddress(addr);
      const p = await getOrgProfile(addr);
      if (p.ok) setOrg(p.data as OrgProfileResponse);
      else setError(p.error);
      // Removed unused consent requests fetch
      // Fetch NFT badge if verified
      if (
        p.ok &&
        (p.data as OrgProfileResponse).organization?.verificationStatus ===
          "approved"
      ) {
        const badge = await getOrgNftBadge(addr);
        if (badge.ok) setNftBadge(badge.data);
      }
    }
    if (jwt) load();
    else setError("No JWT found. Go to Login.");
    return () => {
      mounted = false;
    };
  }, [jwt]);

  // Determine verification status
  const verificationStatus = org?.organization?.verificationStatus || "pending";
  const isVerified =
    verificationStatus === "approved" || verificationStatus === "verified";

  return (
    <Protected>
      <main className="relative min-h-screen pt-28 pb-24">
        <GradientOrbs />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-indigo-300">
            Organization Dashboard
          </h1>
          <p className="mt-3 text-white/70">
            View your onboarding status, verification, and NFT badge (if
            approved).
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-amber-300/30 bg-amber-500/10 p-4 text-amber-200 text-sm">
              {error}
            </div>
          )}

          {address && (
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold text-white">Profile</h2>
                {org ? (
                  <div className="mt-3 text-sm text-white/80">
                    <div>
                      <span className="text-white/60">Address:</span> {address}
                    </div>
                    <div className="mt-1">
                      <span className="text-white/60">Name:</span>{" "}
                      {org.organization?.name || "—"}
                    </div>
                    <div className="mt-1">
                      <span className="text-white/60">Domain:</span>{" "}
                      {org.organization?.domain || "—"}
                    </div>
                    <div className="mt-1">
                      <span className="text-white/60">Status:</span>{" "}
                      {verificationStatus}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-white/60 text-sm">
                    Loading profile...
                  </div>
                )}

                {isVerified ? (
                  <div className="mt-6 p-4 rounded-xl border border-cyan-400/30 bg-cyan-900/10">
                    <div className="text-cyan-300 font-bold mb-2">
                      Verified! Your NFT badge:
                    </div>
                    {nftBadge ? (
                      <NftBadgeAndQr
                        imageUrl={nftBadge.imageUrl}
                        tokenId={nftBadge.tokenId}
                        qrValue={`https://verishare.org/verify/${nftBadge.tokenId}`}
                      />
                    ) : (
                      <div className="text-white/70">Loading NFT badge...</div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 p-4 rounded-xl border border-yellow-400/30 bg-yellow-900/10 text-yellow-200">
                    {verificationStatus === "pending" &&
                      "Your onboarding is pending admin review."}
                    {verificationStatus === "rejected" &&
                      "Your onboarding was rejected. Please contact support."}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold text-white">
                  Verification
                </h2>
                <div className="mt-3">
                  <EvmStatusWidget address={address} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </Protected>
  );
}
