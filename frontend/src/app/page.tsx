import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import GradientOrbs from "@/components/GradientOrbs";
import FeatureCard from "@/components/FeatureCard";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <GradientOrbs />
      <Navbar />
      <Hero />

      <AnimatedSection>
        <section id="features" className="relative py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                title="Wallet-based Auth"
                desc="Challenge/response login with ECC signatures. No passwords, no phish."
              />
              <FeatureCard
                title="Encrypted Credentials"
                desc="AES-256 client-side encryption. On-chain stores hashes & metadata only."
              />
              <FeatureCard
                title="Consent Audit Logs"
                desc="Every approval/denial is provable on-chain for end-to-end accountability."
              />
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section id="how" className="relative py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <ol className="grid gap-6 sm:grid-cols-3 text-white/80">
                {[
                  { t: "Create", d: "Generate keys and set up your wallet." },
                  { t: "Encrypt", d: "Add credentials; encrypt locally; anchor proofs on-chain." },
                  { t: "Share", d: "Scan QR or redeem token; approve with a tap." },
                ].map((s, i) => (
                  <li key={s.t} className="flex flex-col gap-2">
                    <span className="text-sm text-white/60">Step {i + 1}</span>
                    <span className="text-lg font-semibold text-white">{s.t}</span>
                    <span className="text-sm text-white/70">{s.d}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex justify-center">
                <a
                  id="get-started"
                  href="#"
                  className="rounded-full px-6 py-3 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300 shadow-[0_0_40px_#22d3ee66]"
                >
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section id="docs" className="relative py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-2xl font-semibold text-white">Developer Docs</h2>
              <p className="mt-2 text-white/70">OpenAPI reference and SDK roadmap to integrate VeriShare.</p>
              <div className="mt-6">
                <a href="/docs" className="rounded-full px-6 py-3 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300">Explore Docs</a>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section id="onboarding" className="relative py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-2xl font-semibold text-white">Organization Onboarding</h2>
              <p className="mt-2 text-white/70">Apply for verification to request data securely with trust.</p>
              <div className="mt-6">
                <a href="/onboarding" className="rounded-full px-6 py-3 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300">Start Onboarding</a>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <Footer />
    </main>
  );
}
