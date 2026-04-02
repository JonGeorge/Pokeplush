"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ImportPreview = {
  collected: number;
  wanted: number;
  data: { pokedexNumber: number; name?: string; status: string }[];
} | null;

export default function AdminPage() {
  const router = useRouter();
  const [trusted, setTrusted] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        if (!data.trusted) {
          router.push("/setup");
        } else {
          setTrusted(true);
        }
      })
      .catch(() => router.push("/setup"));
  }, [router]);

  if (!trusted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">Checking...</p>
      </main>
    );
  }

  async function handleExport() {
    const res = await fetch("/api/admin/export");
    if (!res.ok) return;
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `stuffie-collection-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError(null);
    setImportPreview(null);

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!Array.isArray(data)) {
          setImportError(
            "That file doesn't look right. Make sure it's a collection export."
          );
          return;
        }

        // Validate entries
        for (const item of data) {
          if (
            typeof item.pokedexNumber !== "number" ||
            typeof item.status !== "string"
          ) {
            setImportError(
              "That file doesn't look right. Make sure it's a collection export."
            );
            return;
          }
        }

        const collected = data.filter(
          (d: { status: string }) => d.status === "collected"
        ).length;
        const wanted = data.filter(
          (d: { status: string }) => d.status === "wanted"
        ).length;

        setImportPreview({ collected, wanted, data });
      } catch {
        setImportError(
          "That file doesn't look right. Make sure it's a collection export."
        );
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!importPreview) return;
    setImporting(true);

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(importPreview.data),
      });

      if (res.ok) {
        router.push("/");
      } else {
        setImportError("Import failed. Please try again.");
      }
    } catch {
      setImportError("Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  }

  function cancelImport() {
    setImportPreview(null);
    setImportError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleRefresh() {
    setRefreshing(true);
    setRefreshResult(null);

    try {
      const res = await fetch("/api/admin/refresh-cache", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setRefreshResult(
          `Refreshed ${data.seeded} Pokémon. ${data.skipped > 0 ? `Skipped ${data.skipped}.` : ""}`
        );
      } else {
        setRefreshResult("Refresh failed. Please try again.");
      }
    } catch {
      setRefreshResult("Refresh failed. Please try again.");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-700">Admin</h1>
          <Link href="/" className="text-pokeblue hover:underline text-sm font-medium">
            ← Back to collection
          </Link>
        </div>

        {/* Export */}
        <section className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="font-semibold text-slate-700 mb-2">
            Export Collection
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Download your collection as a JSON file for backup.
          </p>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-pokeblue text-white rounded-lg font-medium hover:bg-pokeblue-light transition-colors"
          >
            Export Collection
          </button>
        </section>

        {/* Import */}
        <section className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="font-semibold text-slate-700 mb-2">
            Import Collection
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Restore from a previously exported JSON file.
          </p>

          {!importPreview ? (
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-medium file:bg-slate-100 file:text-slate-700 file:cursor-pointer hover:file:bg-slate-200"
            />
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                This file contains{" "}
                <strong>{importPreview.collected} collected</strong> and{" "}
                <strong>{importPreview.wanted} wanted</strong> Pokémon. Import?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="px-4 py-2 bg-pokeblue text-white rounded-lg font-medium hover:bg-pokeblue-light transition-colors disabled:opacity-50"
                >
                  {importing ? "Importing..." : "Import"}
                </button>
                <button
                  onClick={cancelImport}
                  disabled={importing}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {importError && (
            <p className="text-red-500 text-sm mt-3">{importError}</p>
          )}
        </section>

        {/* Cache Refresh */}
        <section className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="font-semibold text-slate-700 mb-2">
            Refresh Pokémon Data
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Re-fetch all Pokémon from PokéAPI. Use when new generations are
            released.
          </p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-pokered text-white rounded-lg font-medium hover:bg-pokered-light transition-colors disabled:opacity-50"
          >
            {refreshing ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Refreshing...
              </span>
            ) : (
              "Refresh Pokémon Data"
            )}
          </button>
          {refreshResult && (
            <p className="text-sm text-slate-600 mt-3">{refreshResult}</p>
          )}
        </section>
      </div>
    </main>
  );
}
