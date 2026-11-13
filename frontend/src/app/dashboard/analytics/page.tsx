"use client";
import { useEffect, useState } from "react";
import { Alert, Button, Empty, Progress, Select, Spin } from "antd";
import { BarChart3, Clock, ShieldAlert, TrendingUp } from "lucide-react";
import API, { getErrorMessage } from "@/lib/api";
type Stats = {
  total: number;
  active: number;
  completed: number;
  unassigned: number;
  highPriorityOpen: number;
  completedShare: number | null;
  avgFirstResponseMinutes: number | null;
  respondedTickets: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  scope: "TEAM" | "ASSIGNED";
  since: string;
  asOf: string;
  daily: { date: string; count: number }[];
  workload: {
    id: string;
    name: string;
    total: number;
    active: number;
    completed: number;
  }[];
};
const panel = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setStats(null);
    API.get<Stats>("/analytics", { params: { days } })
      .then(({ data }) => {
        if (active) setStats(data);
      })
      .catch((err: unknown) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [days, revision]);
  function breakdown(title: string, values: Record<string, number>) {
    return (
      <section className={panel}>
        <h2 className="mb-4 font-semibold text-slate-900">{title}</h2>
        {Object.entries(values).map(([label, count]) => (
          <div key={label} className="mb-3">
            <div className="flex justify-between text-sm">
              <span>{label.replaceAll("_", " ")}</span>
              <strong>{count}</strong>
            </div>
            <Progress
              percent={
                stats?.total ? Math.round((count / stats.total) * 100) : 0
              }
              showInfo={false}
              strokeColor="#4f46e5"
            />
          </div>
        ))}
      </section>
    );
  }
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Support Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {stats?.scope === "ASSIGNED"
              ? "Tickets currently assigned to you."
              : "Support volume and current ticket outcomes."}
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            aria-label="Reporting period"
            value={days}
            onChange={setDays}
            className="w-40"
            options={[7, 30, 90].map((value) => ({
              value,
              label: `Last ${value} days`,
            }))}
          />
          <Button disabled={loading} onClick={() => setRevision((v) => v + 1)}>
            Refresh
          </Button>
        </div>
      </div>
      {error && (
        <Alert
          type="error"
          showIcon
          message="Could not load analytics"
          description={error}
          action={
            <Button onClick={() => setRevision((v) => v + 1)}>Retry</Button>
          }
        />
      )}
      {loading && (
        <div className="flex justify-center p-16">
          <Spin size="large" />
        </div>
      )}
      {!loading && stats && (
        <>
          <p className="text-xs text-slate-500">
            Tickets created since {new Date(stats.since).toLocaleDateString()}.
            Daily buckets use UTC. Current status as of{" "}
            {new Date(stats.asOf).toLocaleString()}.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Tickets created",
                value: stats.total,
                note: `${stats.active} currently active`,
                Icon: BarChart3,
              },
              {
                label: "Completed share",
                value:
                  stats.completedShare === null
                    ? "—"
                    : `${stats.completedShare}%`,
                note: "Resolved + closed / tickets created",
                Icon: TrendingUp,
              },
              {
                label: "Avg first staff reply",
                value:
                  stats.avgFirstResponseMinutes === null
                    ? "—"
                    : `${stats.avgFirstResponseMinutes} min`,
                note: `${stats.respondedTickets} tickets with a staff reply`,
                Icon: Clock,
              },
              {
                label: "High priority active",
                value: stats.highPriorityOpen,
                note: "Open + in progress only",
                Icon: ShieldAlert,
              },
            ].map(({ label, value, note, Icon }) => (
              <section key={label} className={panel}>
                <div className="flex justify-between gap-2 text-sm text-slate-500">
                  <span>{label}</span>
                  <Icon size={19} className="shrink-0 text-indigo-600" />
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-900">
                  {value}
                </p>
                <p className="mt-2 text-xs text-slate-500">{note}</p>
              </section>
            ))}
          </div>
          {!stats.total && (
            <div className={panel}>
              <Empty description="No tickets created in this period" />
            </div>
          )}
          <div className="grid gap-5 md:grid-cols-2">
            {breakdown("Current ticket status", stats.byStatus)}
            {breakdown("Ticket priority", stats.byPriority)}
          </div>
          <section className={panel}>
            <h2 className="font-semibold text-slate-900">
              Tickets created per day
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Daily ticket counts, UTC
            </p>
            <div className="mt-5 overflow-x-auto">
              <div
                className="flex h-40 items-end gap-1 border-b border-slate-200"
                style={{ minWidth: days * 12 }}
              >
                {stats.daily.map((day) => (
                  <div
                    key={day.date}
                    className="flex h-full min-w-2 flex-1 items-end"
                    title={`${day.date}: ${day.count} tickets`}
                  >
                    <div
                      aria-label={`${day.date}: ${day.count} tickets`}
                      className="w-full rounded-t bg-indigo-500"
                      style={{
                        height: `${day.count ? Math.max(3, (day.count / Math.max(1, ...stats.daily.map((d) => d.count))) * 100) : 0}%`,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>{stats.daily[0]?.date}</span>
                <span>{stats.daily.at(-1)?.date}</span>
              </div>
            </div>
          </section>
          {stats.scope === "TEAM" && (
            <section className={panel}>
              <div className="flex justify-between gap-3">
                <h2 className="font-semibold text-slate-900">Agent workload</h2>
                <span className="text-xs text-slate-500">
                  {stats.unassigned} active unassigned
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Current assignments for tickets created in the selected period.
              </p>
              {stats.workload.length ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-slate-500">
                        <th className="py-3">Agent</th>
                        <th>Total</th>
                        <th>Active</th>
                        <th>Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.workload.map((agent) => (
                        <tr
                          key={agent.id}
                          className="border-b border-slate-100"
                        >
                          <td className="py-3 font-medium">{agent.name}</td>
                          <td>{agent.total}</td>
                          <td>{agent.active}</td>
                          <td>{agent.completed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No assigned tickets in this period.
                </p>
              )}
            </section>
          )}
          <p className="text-xs leading-relaxed text-slate-500">
            Completed share is a snapshot of the selected creation cohort, not
            throughput. First reply uses elapsed calendar minutes and excludes
            tickets without a staff reply. SLA compliance needs configured
            targets and business hours before it can be reported.
          </p>
        </>
      )}
    </div>
  );
}
