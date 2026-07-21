"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to login");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-screen bg-white">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-black">Welcome back</h1>
          <p className="text-base text-black font-medium mt-2">Sign in to your account to continue.</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-black mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-base text-black bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-black mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-base text-black bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-600 font-bold">{error}</div>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-base font-bold rounded-lg hover:from-yellow-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-center text-base font-medium text-black">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-80">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
