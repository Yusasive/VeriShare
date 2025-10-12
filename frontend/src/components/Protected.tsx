"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("verishare.jwt") || "" : "";
    if (!t) {
      router.replace("/auth/login");
      return;
    }
    setOk(true);
  }, [router]);

  if (!ok) return null;
  return <>{children}</>;
}
