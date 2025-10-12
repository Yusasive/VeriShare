"use client";
import { motion } from "framer-motion";

type Props = {
  title: string;
  desc: string;
  icon?: React.ReactNode;
};

export default function FeatureCard({ title, desc, icon }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.5 }}
      className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur"
    >
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-cyan-400/0 via-fuchsia-400/0 to-indigo-500/0 opacity-0 transition group-hover:opacity-30" />
      <div className="relative flex items-start gap-4">
        <div className="size-10 shrink-0 rounded-md bg-gradient-to-tr from-indigo-500 to-cyan-400 text-black grid place-items-center shadow-[0_0_20px_#22d3ee55]">
          {icon ?? <span className="text-sm font-bold">VS</span>}
        </div>
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-white/70 leading-relaxed">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}
