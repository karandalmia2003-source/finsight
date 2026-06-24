"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
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
                const res = await fetch("/api/auth/signup", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email, password }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || "Failed to create account.");
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
            <h1 className="text-lg font-semibold text-ink mb-1">Create your FinSight account</h1>
          <p className="text-sm text-subtle mb-6">
              Your uploaded documents, comparisons, and chat history will be saved to your account.
    </p>

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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full text-sm rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
                placeholder="At least 8 characters"
              />
                  </div>

  {error && <p className="text-sm text-risk-high">{error}</p>}

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-accent text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
             >
               {loading ? "Creating account..." : "Create account"}
  </button>
    </form>

        <p className="text-sm text-subtle mt-4 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-accent font-medium hover:underline">
                Sign in
    </Link>
    </p>
    </div>
    </div>
    );
}
