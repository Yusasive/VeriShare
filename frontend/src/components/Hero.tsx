export default function Hero() {
  return (
    <section className="relative pt-36 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          On-chain consent, zero-trust by design
        </span>
        <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-indigo-300 drop-shadow-[0_0_30px_#22d3ee44]">
          Secure, verifiable data sharing
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-white/70">
          Own your credentials. Approve with a tap. Let verified organizations check proofs without exposing your private data.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <a href="#get-started" className="rounded-full px-6 py-3 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300 shadow-[0_0_40px_#22d3ee66]">
            Create Wallet
          </a>
          <a href="#docs" className="rounded-full px-6 py-3 text-sm font-semibold text-white/80 ring-1 ring-white/20 hover:bg-white/5">
            Read Docs
          </a>
        </div>
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { kpi: "99.9%", label: "API uptime" },
            { kpi: "ZKP", label: "privacy-preserving" },
            { kpi: "EVM", label: "on-chain audit" },
          ].map((i) => (
            <div key={i.label} className="rounded-xl border border-white/10 bg-white/5 p-5 text-white/80">
              <div className="text-2xl font-bold text-white">{i.kpi}</div>
              <div className="text-xs uppercase tracking-wider text-white/60">{i.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
