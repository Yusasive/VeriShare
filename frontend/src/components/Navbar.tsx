"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

export default function Navbar() {
  const [hasJwt, setHasJwt] = useState(false);
  useEffect(() => {
    const t = localStorage.getItem("verishare.jwt");
    setHasJwt(!!t);
    const on = () => setHasJwt(!!localStorage.getItem("verishare.jwt"));
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/5 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="size-8 rounded bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-cyan-400 shadow-[0_0_30px_#6366f1]" />
          <span className="text-white/90 group-hover:text-white font-semibold tracking-wide">
            VeriShare
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
          <Link
            href="/org/onboarding"
            className="hover:text-white transition font-bold text-cyan-300"
          >
            Org Onboarding
          </Link>
          <Link href="/org/dashboard" className="hover:text-white transition">
            Dashboard
          </Link>
          <Link href="/docs" className="hover:text-white transition">
            Docs
          </Link>
          <Link href="/admin/review" className="hover:text-white transition">
            Admin
          </Link>
          {!hasJwt && (
            <Link href="/auth/login" className="hover:text-white transition">
              Login
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {hasJwt ? (
            <LogoutButton />
          ) : (
            <Link
              href="/org/onboarding"
              className="rounded-full px-4 py-2 text-sm font-medium text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300 transition shadow-[0_0_30px_#22d3ee88]"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
