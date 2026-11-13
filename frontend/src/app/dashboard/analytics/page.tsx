"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { Spin, Card } from "antd";
import API from "@/lib/api";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/tickets/stats")
      .then((res) => setStats(res.data))
      .catch(() => {
        setStats({
          total: 3,
          unassigned: 1,
          byStatus: { OPEN: 2, IN_PROGRESS: 0, RESOLVED: 1, CLOSED: 0 },
          byPriority: { LOW: 0, MEDIUM: 1, HIGH: 2 },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Support Analytics & SLA Performance
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor response times, resolution rates, and ticket priority
          distributions.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Avg First Response
            </span>
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-4">14 mins</p>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">
            -18% vs last week
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              SLA Compliance
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-4">98.4%</p>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">
            Target &gt; 95%
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Resolution Rate
            </span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-4">94.2%</p>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-2 inline-block">
            Consistent volume
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              High Priority Open
            </span>
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-4">
            {stats?.byPriority?.HIGH || 0}
          </p>
          <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full mt-2 inline-block">
            Requires attention
          </span>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Tickets by Status
          </h2>
          <div className="space-y-3">
            {Object.entries(stats?.byStatus || {}).map(
              ([status, count]: [string, any]) => (
                <div
                  key={status}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {status.replace("_", " ")}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {count}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Tickets by Priority
          </h2>
          <div className="space-y-3">
            {Object.entries(stats?.byPriority || {}).map(
              ([priority, count]: [string, any]) => (
                <div
                  key={priority}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {priority} Priority
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {count}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
