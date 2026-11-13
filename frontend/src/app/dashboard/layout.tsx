"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Users,
  UserCog,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
} from "lucide-react";
import { Dropdown, message } from "antd";
import { TOKEN_KEY, USER_KEY } from "@/lib/api";
import { LogoMark } from "@/components/logo";
import { NotificationBell } from "@/components/notification-bell";
import type { AuthUser } from "@/types/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    message.success("Logged out successfully");
    router.push("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      router.push(
        `/dashboard/tickets?search=${encodeURIComponent(globalSearch.trim())}`,
      );
    }
  };

  // Role-based navigation items filtering
  const getNavItems = (role?: string) => {
    const base = [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Tickets", href: "/dashboard/tickets", icon: Ticket },
    ];

    if (role === "ADMIN") {
      return [
        ...base,
        { name: "Customers", href: "/dashboard/customers", icon: Users },
        { name: "Agents", href: "/dashboard/agents", icon: UserCog },
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ];
    }

    if (role === "AGENT") {
      return [
        ...base,
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ];
    }

    return [
      ...base,
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];
  };

  const navItems = getNavItems(user?.role);

  const userDropdownMenu = {
    items: [
      {
        key: "profile",
        label: (
          <div className="px-2 py-1">
            <p className="font-semibold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide mt-0.5">
              {user?.role}
            </p>
          </div>
        ),
        disabled: true,
      },
      { type: "divider" as const },
      {
        key: "logout",
        label: <span className="text-red-600 font-medium">Sign Out</span>,
        icon: <LogOut className="w-4 h-4 text-red-600" />,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 h-screen bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:translate-x-0 shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <LogoMark className="w-9 h-9 shadow-sm rounded-xl" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              ResolveDesk
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 font-semibold"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-xs">
              {user?.name?.[0] || "U"}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user?.name}
              </p>
              <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 shrink-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <form
              onSubmit={handleSearchSubmit}
              className="hidden sm:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 w-72 border border-slate-200/60"
            >
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              {mounted ? (
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search tickets..."
                  className="bg-transparent border-none outline-none text-xs text-slate-900 w-full placeholder-slate-400"
                />
              ) : (
                <div className="text-xs text-slate-400">Search tickets...</div>
              )}
            </form>
          </div>

          <div className="flex items-center space-x-4">
            {user && <NotificationBell key={user.id} />}

            <Dropdown
              menu={userDropdownMenu}
              placement="bottomRight"
              trigger={["click"]}
            >
              <button className="flex items-center space-x-2 focus:outline-none p-1 rounded-lg hover:bg-slate-100">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center text-sm shadow-sm">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="hidden md:inline text-xs font-semibold text-slate-700">
                  {user?.name}
                </span>
              </button>
            </Dropdown>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
