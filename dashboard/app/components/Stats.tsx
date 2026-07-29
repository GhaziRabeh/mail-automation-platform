"use client";

import { useEffect, useState } from "react";
import { socket } from "../lib/socket";

type StatsData = { total?: number; sent?: number; replied?: number };

export default function Stats() {
  const [data, setData] = useState<StatsData>({});
  const [loading, setLoading] = useState(true);
  const [bump, setBump] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/stats")
      .then((r) => r.json())
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
      <Card
        title="Total prospects"
        value={data.total}
        loading={loading}
        accent="slate"
      />
      <Card
        title="Emails sent"
        value={data.sent}
        loading={loading}
        accent="blue"
      />
      <Card
        title="Replies"
        value={data.replied}
        loading={loading}
        accent="emerald"
        bumped={bump === "replied"}
      />
    </div>
  );
}

const accents = {
  slate: "bg-slate-300",
  blue: "bg-blue-400",
  emerald: "bg-emerald-400",
};

function Card({
  title,
  value,
  loading,
  accent,
  bumped,
}: {
  title: string;
  value?: number;
  loading: boolean;
  accent: keyof typeof accents;
  bumped?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={`h-10 w-1 rounded-full ${accents[accent]}`} />
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        {loading ? (
          <div className="mt-1 h-8 w-14 animate-pulse rounded bg-slate-100" />
        ) : (
          <p
            className={`font-mono text-3xl font-semibold tabular-nums text-slate-900 transition-transform duration-300 ${
              bumped ? "scale-110" : "scale-100"
            }`}
          >
            {value ?? 0}
          </p>
        )}
      </div>
    </div>
  );
}
