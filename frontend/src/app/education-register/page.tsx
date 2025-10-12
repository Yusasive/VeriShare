"use client";
import React, { useState } from "react";
import Image from "next/image";

const HARDCODED_ACCESS_CODE = "EDU-2025-VERISHARE";

export default function EducationRegisterPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(HARDCODED_ACCESS_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-purple-800 text-center">
          Education Credential Registration
        </h2>
        <div className="text-center">
          <div className="mb-4">
            <span className="block text-lg font-semibold text-gray-700">
              Access Code
            </span>
            <span className="text-2xl text-black font-mono bg-gray-100 px-4 py-2 rounded select-all inline-block mt-2">
              {HARDCODED_ACCESS_CODE}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition"
          >
            {copied ? "Copied!" : "Copy Code"}
          </button>
          <div className="my-4">
            {/* QR code alternative (for prototype, just show code as QR) */}
            <Image
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${HARDCODED_ACCESS_CODE}&size=120x120`}
              alt="QR Code"
              className="mx-auto mt-4"
              width={120}
              height={120}
            />
            <span className="block text-xs text-gray-500 mt-2">
              Scan this code in the mobile app
            </span>
          </div>
          <div className="mt-4 text-sm text-gray-700">
            <b>How to use:</b>
            <ul className="list-disc text-left ml-6 mt-2">
              <li>Copy or scan the access code above.</li>
              <li>
                Go to the <b>Verify</b> page in the mobile app.
              </li>
              <li>
                Paste or scan the code. The app will match it and ask if you
                want to approve or disapprove data release.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
