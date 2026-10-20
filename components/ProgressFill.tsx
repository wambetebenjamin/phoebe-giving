"use client";

import { motion } from "framer-motion";

export default function ProgressFill({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-track" aria-hidden="true">
      <motion.div
        className="progress-fill"
        initial={{ width: 0 }}
        whileInView={{ width: `${width}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
    </div>
  );
}
