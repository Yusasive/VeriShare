"use client";
import { motion } from "framer-motion";
import AnimatedButton from "@/components/AnimatedButton";

export default function Hero() {
  return (
    <section className="relative pt-36 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
        >
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          On-chain consent, zero-trust by design
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-indigo-300 drop-shadow-[0_0_30px_#22d3ee44]"
        >
          Secure, verifiable data sharing
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-white/70"
        >
          Own your credentials. Approve with a tap. Let verified organizations check proofs without exposing your private data.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <AnimatedButton asLink href="/auth/login">Connect Wallet</AnimatedButton>
          <button className="rounded-full px-6 py-3 text-sm font-semibold text-white/80 ring-1 ring-white/20 hover:bg-white/5 transition">
            Read Docs
          </button>
        </motion.div>
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { kpi: "99.9%", label: "API uptime" },
            { kpi: "ZKP", label: "privacy-preserving" },
            { kpi: "EVM", label: "on-chain audit" },
          ].map((i, idx) => (
            <motion.div
              key={i.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1 * idx }}
              className="rounded-xl border border-white/10 bg-white/5 p-5 text-white/80 backdrop-blur"
            >
              <div className="text-2xl font-bold text-white">{i.kpi}</div>
              <div className="text-xs uppercase tracking-wider text-white/60">{i.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
