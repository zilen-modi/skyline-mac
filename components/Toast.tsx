"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { useWM } from "@/lib/store";

export default function Toast() {
  const toast = useWM((s) => s.toast);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => useWM.setState({ toast: null }), 2200);
    return () => clearTimeout(t);
  }, [toast]);
  return (
    <div className="toast-wrap" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div key={toast.key} className="toast" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
            <CheckCircle2 size={16} aria-hidden="true" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
