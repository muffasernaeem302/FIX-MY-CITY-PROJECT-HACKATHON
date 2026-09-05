/** Login page. On success, stores token & user, redirects to /dashboard. */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        setLoading(false);
        return;
      }
      // TODO: Phase 3 — real auth endpoint
      const token = "dev-demo-jwt";
      // For demo, allow role switching via email prefix "admin@"
      const role = email.toLowerCase().startsWith("admin") ? "ADMIN" : "CITIZEN";
      const userData = { email, role };
      login(token, userData);
      navigate(role === "ADMIN" ? "/admin" : "/dashboard");
    } catch {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-brand-700 text-sm font-black text-slate-950">
            F
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-slate-400">Sign in to your FixMyCity account.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Password <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              placeholder="Min. 8 characters"
            />
          </div>

          <Button type="submit" loading={loading} className="mt-6 w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          No account yet?{" "}
          <Link to="/register" className="text-cyan-400 underline hover:text-cyan-300">
            Create one
          </Link>
        </p>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs text-slate-500">
            <strong className="text-slate-400">Demo mode:</strong> Any email + 8+ char password works. Tip: use an email starting with <code className="text-cyan-400">admin</code> to log in as administrator.
          </p>
        </div>
      </Card>
    </div>
  );
}