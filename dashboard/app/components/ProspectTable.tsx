"use client";

import { useEffect, useMemo, useState } from "react";
import { socket } from "../lib/socket";

type Prospect = {
  id: string | number;
  company: string;
  email: string;
  status: "PENDING" | "SENT" | "REPLIED" | string;
};

export default function ProspectTable() {
  const [items, setItems] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [connected, setConnected] = useState(socket.connected);
  const [flashed, setFlashed] = useState<Set<string>>(new Set());

  async function load() {
    try {
      const res = await fetch("http://localhost:3000/api/prospects");
      setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("new_reply", (reply: { email: string }) => {
      setItems((old) =>
        old.map((p) =>
          p.email === reply.email ? { ...p, status: "REPLIED" } : p,
        ),
      );
      setFlashed((old) => new Set(old).add(reply.email));
      setTimeout(() => {
        setFlashed((old) => {
          const next = new Set(old);
          next.delete(reply.email);
          return next;
        });
      }, 2000);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("new_reply");
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
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company or email… focus:border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
        />
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              connected ? "bg-emerald-500" : "bg-slate-300"
            }`}
          />
          {connected ? "Live" : "Offline"}
        </div>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-slate-400">
            <th className="px-5 py-3 font-medium">Company</th>
            <th className="px-5 py-3 font-medium">Email</th>
            <th className="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="px-5 py-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
                </td>
              </tr>
            ))}

          {!loading && filtered.length === 0 && (
            <tr>
              <td colSpan={3} className="px-5 py-10 text-center text-slate-400">
                {query
                  ? "No prospects match your search."
                  : "No prospects yet."}
              </td>
            </tr>
          )}

          {!loading &&
            filtered.map((p) => (
              <tr
                key={p.id}
                className={`border-t border-slate-100 transition-colors duration-700 ${
                  flashed.has(p.email) ? "bg-emerald-50" : "bg-white"
                }`}
              >
                <td className="px-5 py-3 text-slate-800">{p.company}</td>
                <td className="px-5 py-3 font-mono text-slate-500">
                  {p.email}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-slate-100 text-slate-500",
    SENT: "bg-blue-50 text-blue-600",
    REPLIED: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ?? styles.PENDING
      }`}
    >
      {status === "REPLIED" && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      )}
      {status}
    </span>
  );
}
