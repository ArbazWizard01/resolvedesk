"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Headphones,
} from "lucide-react";
import { Button } from "antd";
import { LogoMark } from "@/components/logo";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LogoMark className="w-9 h-9 shadow-sm rounded-xl" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              ResolveDesk
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              onClick={() => router.push("/login")}
              className="font-medium text-slate-600 hover:text-slate-900"
            >
              Sign In
            </Button>
            <Button
              type="primary"
              onClick={() => router.push("/register")}
              className="bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg shadow-sm"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Zap className="w-3.5 h-3.5" />
            <span>Customer Support Ticketing</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Resolve customer issues{" "}
            <span className="text-indigo-600">faster and smarter</span>.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Customers raise tickets, agents resolve them, and admins keep
            everything on track, with role-based access, comments, and a full
            activity history on every ticket.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              type="primary"
              size="large"
              onClick={() => router.push("/register")}
              className="w-full sm:w-auto h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-base font-medium rounded-xl shadow-sm flex items-center justify-center space-x-2"
            >
              <span>Create an Account</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              size="large"
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto h-12 px-8 border-slate-300 text-slate-700 hover:border-slate-400 text-base font-medium rounded-xl"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Everything a support team needs to stay organized
            </h2>
            <p className="mt-4 text-slate-600">
              A focused set of tools in a clean, minimal interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Role-Based Ticketing
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Customers, agents, and admins each see and do only what their
                role allows, from creating tickets to assigning and resolving
                them.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Dashboard Insights
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                See ticket counts by status and priority at a glance, so teams
                always know their workload.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Built on a Modern Stack
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                NestJS and PostgreSQL on the backend with JWT authentication,
                and Next.js with TypeScript on the frontend.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500">
          <p>© 2026 ResolveDesk. A portfolio project by Arbaz Ansari.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a
              href="https://github.com/ArbazWizard01/resolvedesk"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/arbaz-ansari01"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
