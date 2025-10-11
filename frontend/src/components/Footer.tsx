export default function Footer() {
  return (
    <footer id="contact" className="border-t border-white/10 py-10 text-center text-white/60">
      <p>
        © {new Date().getFullYear()} VeriShare — Secure, consent-first data exchange.
      </p>
      <p className="mt-2 text-xs">Built with Next.js. EVM-powered verification.</p>
    </footer>
  );
}
