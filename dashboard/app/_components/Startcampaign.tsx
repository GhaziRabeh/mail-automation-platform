"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Play, Loader2, Megaphone } from "lucide-react";
import { startDefaultCampaign } from "../lib/api";

export default function StartCampaign() {
  const [starting, setStarting] = useState(false);

  async function handleStart() {
    setStarting(true);
    try {
      const data = await startDefaultCampaign();
      toast.success("Campaign started", {
        description:
          data?.result?.queued != null
            ? `${data.result.queued} email(s) queued`
            : undefined,
      });
      window.dispatchEvent(new CustomEvent("reload-prospects"));
    } catch (error) {
      toast.error("Failed to start campaign", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Megaphone size={16} className="text-muted-2" />
        <p className="text-sm font-medium text-foreground">
          Send to all pending prospects
        </p>
      </div>

      <button
        onClick={handleStart}
        disabled={starting}
        className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {starting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Play size={14} />
        )}
        Start Campaign
      </button>
    </div>
  );
}
