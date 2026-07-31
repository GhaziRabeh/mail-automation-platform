"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: resolvedTheme is undefined on the server.
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      aria-pressed={isDark}
      className="relative h-8 w-16 shrink-0 rounded-full border border-border bg-surface-2 transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5 text-muted-2">
        <Sun size={13} strokeWidth={2.25} />
        <Moon size={13} strokeWidth={2.25} />
      </span>

      <motion.span
        className="absolute top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-surface shadow-sm"
        animate={{ left: isDark ? "calc(100% - 1.875rem)" : "0.125rem" }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ opacity: 0, rotate: -90, scale: 0.4 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.4 }}
              transition={{ duration: 0.2 }}
              className="absolute text-accent"
            >
              <Moon size={13} strokeWidth={2.25} />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ opacity: 0, rotate: 90, scale: 0.4 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.4 }}
              transition={{ duration: 0.2 }}
              className="absolute text-[#D89A34]"
            >
              <Sun size={14} strokeWidth={2.25} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
