import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

const navItems = [
  { label: "How it works", href: "/about" },
  { label: "City Map", href: "/map" },
  { label: "Features", href: "/#features" },
  { label: "Impact", href: "/#impact" },
  { label: "Demo", href: "/#demo" },
];

export default function Layout({ children }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-brand-700 text-sm font-black text-slate-950 shadow-glow">
              F
            </span>
            <span>FixMyCity</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to={isAdmin ? "/admin" : "/dashboard"}
                className="transition hover:text-white"
              >
                {isAdmin ? "Admin" : "Dashboard"}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Badge tone="emerald">{user?.role || "CITIZEN"}</Badge>
                <span className="hidden text-sm text-slate-300 sm:inline">
                  {user?.email}
                </span>
                <Button variant="secondary" size="sm" onClick={logout}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline">
                  <Button variant="secondary" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/report">
                  <Button size="sm">Report issue</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-800 bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <Link to="/" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-brand-700 text-sm font-black text-slate-950">
                  F
                </span>
                <span className="text-sm font-semibold text-white">FixMyCity</span>
              </Link>
              <p className="mt-3 text-sm text-slate-400">
                AI-powered civic intelligence for smarter urban maintenance.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><Link to="/about" className="hover:text-white">How it works</Link></li>
                <li><Link to="/map" className="hover:text-white">City Map</Link></li>
                <li><Link to="/dashboard" className="hover:text-white">Citizen dashboard</Link></li>
                <li><Link to="/admin" className="hover:text-white">Admin command center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Status</h4>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone="emerald">AI fallback active</Badge>
                <Badge tone="cyan">Demo mode</Badge>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-start gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>&copy; 2026 FixMyCity. Hackathon MVP.</p>
            <p>Built with React, FastAPI, and PostgreSQL.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
