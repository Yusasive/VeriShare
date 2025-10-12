export default function GradientOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-fuchsia-600/40 via-indigo-600/30 to-cyan-500/30 blur-3xl animate-blob" />
      <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-gradient-to-tr from-cyan-500/30 via-sky-400/30 to-indigo-600/40 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-64 w-[36rem] bg-gradient-to-r from-indigo-600/30 to-fuchsia-500/30 blur-3xl animate-slow-float" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),rgba(0,0,0,0))]" />
    </div>
  );
}
