"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { UploadCloud, FileSpreadsheet, Loader2 } from "lucide-react";
import { importExcel } from "../lib/api";

export default function ExcelUpload() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  function openFilePicker() {
    inputRef.current?.click();
  }

  async function upload(file: File) {
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast.error("Please select an Excel file.");
      return;
    }

    setFileName(file.name);

    try {
      setUploading(true);

      const data = await importExcel(file);

      toast.success("Import completed", {
        description:
          data.imported != null
            ? `${data.imported} imported, ${data.skipped ?? 0} skipped`
            : undefined,
      });

      window.dispatchEvent(new CustomEvent("reload-prospects"));
    } catch (error) {
      toast.error("Import failed", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <motion.div
        role="button"
        tabIndex={0}
        onClick={openFilePicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openFilePicker();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length > 0) upload(e.dataTransfer.files[0]);
        }}
        animate={{ scale: dragging ? 1.01 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className={`flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors duration-300 ${
          dragging
            ? "border-accent bg-accent-soft"
            : "border-border hover:border-muted-2"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="mb-3 animate-spin text-accent" size={30} />
            <p className="text-sm font-medium text-foreground">
              Importing {fileName}…
            </p>
            <div className="relative mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className="absolute inset-y-0 w-1/3 rounded-full bg-accent"
                animate={{ left: ["-33%", "100%"] }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </>
        ) : (
          <>
            <UploadCloud
              className="mb-3 text-muted-2"
              size={30}
              strokeWidth={1.75}
            />
            <p className="text-sm font-medium text-foreground">
              Drop your prospect list here
            </p>
            <p className="mt-1 text-xs text-muted">
              or click to browse — .xlsx, .xls
            </p>
          </>
        )}
      </motion.div>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />

      <div className="mt-4 flex items-center gap-2 text-xs text-muted">
        <FileSpreadsheet size={14} className="text-success" />
        Accepted formats: .xlsx, .xls
      </div>
    </div>
  );
}
