"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SetupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyTrusted, setAlreadyTrusted] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => setAlreadyTrusted(data.trusted))
      .catch(() => setAlreadyTrusted(false));
  }, []);

  if (alreadyTrusted === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">Checking...</p>
      </main>
    );
  }

  if (alreadyTrusted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-sm w-full text-center">
          <p className="text-2xl mb-2">✅</p>
          <h1 className="text-xl font-bold text-slate-700 mb-2">
            This device is already set up!
          </h1>
          <Link
            href="/"
            className="text-pokeblue hover:underline font-medium"
          >
            Back to collection →
          </Link>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        router.push("/");
      } else {
        setError("That code didn't work — try again");
      }
    } catch {
      setError("Something went wrong — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-sm w-full">
        <h1 className="text-xl font-bold text-slate-700 mb-1">
          Trust This Device
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Enter the setup code to enable editing on this device.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Setup code"
            autoComplete="off"
            autoFocus
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-pokeblue focus:border-transparent"
          />

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !code}
            className="w-full mt-4 px-4 py-3 bg-pokeblue text-white font-medium rounded-lg hover:bg-pokeblue-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Checking..." : "Submit"}
          </button>
        </form>
      </div>
    </main>
  );
}
