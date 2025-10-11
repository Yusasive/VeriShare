"use client";
import { useEffect, useState } from "react";

export default function AuthTokenBar() {
  const [token, setToken] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("verishare.jwt") || "";
    setToken(t);
  }, []);

  const save = () => {
    localStorage.setItem("verishare.jwt", token.trim());
  };
  const clear = () => {
    localStorage.removeItem("verishare.jwt");
    setToken("");
  };

  return (
    <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-white/70">
          Authorization Token
          <span className="ml-2 text-xs text-white/50">Paste JWT from /api/auth/verify</span>
        </div>
        <button onClick={() => setVisible((v) => !v)} className="text-xs text-cyan-300 hover:text-cyan-200">{visible ? "Hide" : "Show"}</button>
      </div>
      {visible && (
        <div className="mt-3 flex items-center gap-3">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp..."
            className="flex-1 rounded-md bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button onClick={save} className="rounded-full px-4 py-2 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300">Save</button>
          <button onClick={clear} className="rounded-full px-4 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/20 hover:bg-white/5">Clear</button>
        </div>
      )}
      {!token && (
        <p className="mt-3 text-xs text-amber-300/80">No token set. Organization onboarding requires Authorization: Bearer &lt;token&gt;.</p>
      )}
    </div>
  );
}
