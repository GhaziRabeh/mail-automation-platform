"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { socket } from "../lib/socket";
import { getStats } from "../lib/api";

type StatsData = { total?: number; sent?: number; replied?: number };

export default function Stats() {
  const [data, setData] = useState<StatsData>({});
  const [loading, setLoading] = useState(true);
  const [bump, setBump] = useState<string | null>(null);

  useEffect(() => {
    getStats()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    socket.on("new_reply", () => {
      setData((old) => ({ ...old, replied: (old.replied ?? 0) + 1 }));
      setBump("replied");
      setTimeout(() => setBump(null), 700);
    });

    return () => {
      socket.off("new_reply");
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card title="Total prospects" value={data.total} loading={loading} />
      <Card title="Emails sent" value={data.sent} loading={loading} />
      <Card
        title="Replies"
        value={data.replied}
        loading={loading}
        bumped={bump === "replied"}
        live
      />
    </div>
  );
}

function Card({
  title,
  value,
  loading,
  bumped,
  live,
}: {
  title: string;
  value?: number;
  loading: boolean;
  bumped?: boolean;
  live?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {title}
        </p>
        {live && (
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-success"
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>

      {loading ? (
        <div className="mt-2 h-8 w-16 animate-pulse rounded bg-surface-2" />
      ) : (
        <motion.p
          animate={{ scale: bumped ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
          className="mt-1 font-mono text-3xl font-semibold tabular-nums text-foreground"
        >
          {value ?? 0}
        </motion.p>
      )}
    </div>
  );
}
