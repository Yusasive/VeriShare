"use client";
import { useRouter } from "next/navigation";
import { clearJwt } from "@/lib/api";

export default function LogoutButton() {
  const router = useRouter();
  const onClick = () => {
    clearJwt();
    router.push("/");
  };
  return (
    <button onClick={onClick} className="rounded-full px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/20 hover:bg-white/5">Logout</button>
  );
}
