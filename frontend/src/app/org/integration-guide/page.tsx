"use client";
import React from "react";

export default function IntegrationGuidePage() {
  return (
    <main className="relative min-h-screen pt-28 pb-24 bg-black text-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-indigo-300 mb-6">
          Integration Guide: Embed Your NFT Badge & QR Code
        </h1>
        <p className="mb-6 text-white/80">
          To prove your organization is verified on VeriShare, you can embed
          your NFT badge and QR code in your external registration forms or
          websites. This helps users trust your registration process and enables
          seamless credential onboarding.
        </p>
        <h2 className="text-2xl font-bold text-cyan-200 mb-2">How to Embed</h2>
        <ol className="list-decimal ml-6 mb-6 text-white/80">
          <li>
            Replace <code>ORG_TOKEN_ID</code> with your actual NFT token ID.
          </li>
          <li>Replace the NFT badge image URL if you host your own badge.</li>
          <li>
            The QR code can encode a verification or registration URL, or an
            access code.
          </li>
          <li>Style the block as needed for your site.</li>
        </ol>
        <h3 className="text-lg font-semibold text-cyan-300 mb-2">
          Sample HTML Snippet
        </h3>
        <pre className="bg-white/10 border border-white/10 rounded-lg p-4 text-xs overflow-x-auto text-white mb-6">
          {`<div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
  <div style="border: 2px solid #22d3ee; border-radius: 1rem; background: #e0f2fe; padding: 1rem;">
    <img src="https://verishare.org/nft-badges/ORG_TOKEN_ID.png" alt="VeriShare NFT Badge" style="width: 120px; height: 120px; object-fit: contain; border-radius: 0.5rem; margin-bottom: 0.5rem;" />
    <div style="color: #0891b2; font-weight: bold;">NFT Token ID: ORG_TOKEN_ID</div>
  </div>
  <div style="display: flex; flex-direction: column; align-items: center;">
    <img src="https://api.qrserver.com/v1/create-qr-code/?data=https://verishare.org/verify/ORG_TOKEN_ID&size=120x120" alt="VeriShare QR Code" style="width: 120px; height: 120px;" />
    <div style="margin-top: 0.25rem; color: #334155; font-size: 0.9em;">Scan to verify or register</div>
  </div>
</div>`}
        </pre>
        <p className="text-white/70 mb-2">
          For more advanced integrations, see our{" "}
          <a
            href="/docs"
            className="underline text-cyan-300 hover:text-cyan-200"
          >
            developer docs
          </a>
          .
        </p>
      </div>
    </main>
  );
}
