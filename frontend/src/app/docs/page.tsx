import Link from "next/link";
import GradientOrbs from "@/components/GradientOrbs";

export default function DocsPage() {
  const apiDocsUrl = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/docs`
    : "/api-docs";
  return (
    <main className="relative min-h-screen pt-28 pb-24">
      <GradientOrbs />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-indigo-300">Developer Docs</h1>
        <p className="mt-4 text-white/70">
          Integrate VeriShare into your apps. Explore REST APIs, OpenAPI schema, and SDK plans.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "OpenAPI",
              desc: "Interactive API reference (Swagger UI)",
              href: apiDocsUrl,
            },
            {
              title: "REST Endpoints",
              desc: "Auth, Consent, Org, EVM credential flows",
              href: "/#features",
            },
            {
              title: "SDKs",
              desc: "JS/Flutter SDK roadmap and examples",
              href: "#sdk",
            },
          ].map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
            >
              <h3 className="text-white font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-white/70">{c.desc}</p>
              <div className="mt-4 text-cyan-300 group-hover:text-cyan-200 text-sm">Open →</div>
            </Link>
          ))}
        </div>

        <section id="sdk" className="mt-16 rounded-2xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-xl font-semibold text-white">SDK Roadmap</h2>
          <ul className="mt-4 grid gap-3 text-sm text-white/70 list-disc pl-5">
            <li>JavaScript SDK: QR/token issuance, redeem, verify shares</li>
            <li>Flutter SDK: mobile wallet helpers, key storage, QR scan</li>
            <li>Example templates: Next.js, Flutter, Laravel</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
