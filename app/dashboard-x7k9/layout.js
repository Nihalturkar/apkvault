"use client";

import { usePathname } from "next/navigation";
import { AdminGuard } from "../../lib/AdminGuard";
import { useAuth } from "../../lib/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import Link from "next/link";

/* ── Icons ── */
function DashboardIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function GlobeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function LogoutIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  if (pathname === "/dashboard-x7k9/login") {
    return children;
  }

  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}

function AdminShell({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* ── Top Navigation ── */}
      <nav className="sticky top-0 z-50 bg-[#0d1324]/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard-x7k9" className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/applogo.png" alt="ApkVault" className="w-9 h-9 rounded-xl shadow-lg shadow-blue-500/20 object-cover" />
                <span className="text-lg font-bold text-white">Admin</span>
              </Link>

              <div className="hidden sm:flex items-center gap-1">
                <NavLink href="/dashboard-x7k9" icon={<DashboardIcon className="w-4 h-4" />} current={pathname}>
                  Dashboard
                </NavLink>
                <NavLink href="/dashboard-x7k9/apps/new" icon={<PlusIcon className="w-4 h-4" />} current={pathname}>
                  Add App
                </NavLink>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* User info */}
              <div className="hidden sm:flex items-center gap-2 bg-gray-800/50 rounded-full pl-1 pr-3 py-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-300 max-w-[120px] truncate">{user?.email}</span>
              </div>

              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all text-sm"
              >
                <GlobeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">View Site</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
              >
                <LogoutIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom nav ── */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0d1324]/95 backdrop-blur-xl border-t border-gray-800/50 px-4 py-2">
        <div className="flex items-center justify-around">
          <MobileNavLink href="/dashboard-x7k9" icon={<DashboardIcon className="w-5 h-5" />} label="Dashboard" current={pathname} />
          <MobileNavLink href="/dashboard-x7k9/apps/new" icon={<PlusIcon className="w-5 h-5" />} label="Add App" current={pathname} />
          <MobileNavLink href="/" icon={<GlobeIcon className="w-5 h-5" />} label="Store" current={pathname} />
        </div>
      </div>

      {/* ── Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-6">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon, current, children }) {
  const active = current === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-blue-500/10 text-blue-400"
          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({ href, icon, label, current }) {
  const active = current === href;
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${
        active ? "text-blue-400" : "text-gray-500"
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
