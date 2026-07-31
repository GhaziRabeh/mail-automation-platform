"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "../lib/socket";
import { getProspects } from "../lib/api";

type Prospect = {
  id: string | number;
  company: string;
  email: string;
  status: "PENDING" | "SENT" | "REPLIED" | string;
};

function subscribeToSocket(callback: () => void) {
  socket.on("connect", callback);
  socket.on("disconnect", callback);
  return () => {
    socket.off("connect", callback);
    socket.off("disconnect", callback);
  };
}

function getSocketSnapshot() {
  return socket.connected;
}

function getServerSnapshot() {
  return false; 
}

export default function ProspectTable() {
  const [items, setItems] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const connected = useSyncExternalStore(
    subscribeToSocket,
    getSocketSnapshot,
    getServerSnapshot,
  );
  const [flashed, setFlashed] = useState<Set<string>>(new Set());

  async function load() {
    try {
      setItems(await getProspects());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    const reload = () => load();
    window.addEventListener("reload-prospects", reload);

    function onStatusChange(payload: { email: string }) {
      setFlashed((prev) => new Set(prev).add(payload.email));
      load();
      setTimeout(() => {
        setFlashed((prev) => {
          const next = new Set(prev);
          next.delete(payload.email);
          return next;
        });
      }, 1200);
    }

    socket.on("new_reply", onStatusChange);

    return () => {
      window.removeEventListener("reload-prospects", reload);
      socket.off("new_reply", onStatusChange);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        p.company?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company or email…"
          className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-muted-2 focus:border-accent focus:bg-surface"
        />

        <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted">
          <motion.span
            className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-success" : "bg-muted-2"}`}
            animate={
              connected
                ? { scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }
                : { scale: 1, opacity: 1 }
            }
            transition={{
              duration: 1.6,
              repeat: connected ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
          {connected ? "Live" : "Offline"}
        </div>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-muted">
            <th className="px-5 py-3 font-medium">Company</th>
            <th className="px-5 py-3 font-medium">Email</th>
            <th className="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-5 py-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-surface-2" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-36 animate-pulse rounded bg-surface-2" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-surface-2" />
                </td>
              </tr>
            ))}

          {!loading && filtered.length === 0 && (
            <tr>
              <td colSpan={3} className="px-5 py-10 text-center text-muted-2">
                {query
                  ? "No prospects match your search."
                  : "No prospects yet."}
              </td>
            </tr>
          )}

          <AnimatePresence initial={false}>
            {!loading &&
              filtered.map((p) => (
                <motion.tr
                  key={p.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    backgroundColor: flashed.has(p.email)
                      ? "var(--success-soft)"
                      : "rgba(0, 0, 0, 0)",
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="border-t border-border"
                >
                  <td className="px-5 py-3 text-foreground">{p.company}</td>
                  <td className="px-5 py-3 font-mono text-muted">{p.email}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                </motion.tr>
              ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-surface-2 text-muted",
    SENT: "bg-accent-soft text-accent",
    REPLIED: "bg-success-soft text-success",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-300 ${
        styles[status] ?? styles.PENDING
      }`}
    >
      {status === "REPLIED" && (
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
      )}
      {status}
    </span>
  );
}
