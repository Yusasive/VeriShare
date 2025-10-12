"use client";
import React from "react";

import { QRCodeCanvas } from "qrcode.react";

interface NftBadgeAndQrProps {
  imageUrl: string;
  tokenId: string;
  qrValue: string;
}

export default function NftBadgeAndQr({
  imageUrl,
  tokenId,
  qrValue,
}: NftBadgeAndQrProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl border border-cyan-400/40 bg-white/10 p-4 flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="NFT Badge"
          className="w-32 h-32 object-contain rounded-lg mb-2"
        />
        <div className="text-cyan-200 font-semibold">
          NFT Token ID: {tokenId}
        </div>
      </div>
      <div className="mt-2 flex flex-col items-center">
        <QRCodeCanvas
          value={qrValue}
          size={128}
          bgColor="#fff"
          fgColor="#164e63"
        />
        <div className="mt-1 text-xs text-white/70">
          Scan to verify or access registration
        </div>
      </div>
    </div>
  );
}
