"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

  useEffect(() => {
        fetch("/api/auth/me")
          .then((res) => (res.ok ? router.replace("/") : null))
          .catch(() => {});
  }, [router]);

  const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
                const res = await fetch("/api/auth/login", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email, password }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || "Failed to sign in.");
                router.push("/");
                router.refresh();
        } catch (err) {
                setError(err.message);
                setLoading(false);
        }
  };

  return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4">
          <div className="w-full max-w-sm bg-white border border-border rounded-xl shadow-card p-6">
            <h1 className="text-lg font-semibold text-ink mb-1">Sign in to FinSight</h1>
          <p className="text-sm text-subtle mb-6">Access your saved documents and comparisons.</p>

        <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-subtle">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full text-sm rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
                placeholder="you@company.com"
              />
                  </div>
            <div>
                              <label className="text-xs font-medium text-subtle">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full text-sm rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
                placeholder="********"
              />
                  </div>

  {error && <p className="text-sm text-risk-high">{error}</p>}

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-accent text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
             >
               {loading ? "Signing in..." : "Sign in"}
  </button>
    </form>

        <p className="text-sm text-subtle mt-4 text-center">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-accent font-medium hover:underline">
                Sign up
    </Link>
    </p>
    </div>
    </div>
    );
}
