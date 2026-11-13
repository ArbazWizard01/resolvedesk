"use client";

import React, { useEffect, useState } from "react";
import { Users, Search, Mail, Calendar, Shield } from "lucide-react";
import { Spin, Input, App } from "antd";
import API, { getErrorMessage } from "@/lib/api";
import type { AuthUser } from "@/types/auth";

export default function CustomersPage() {
  const { message } = App.useApp();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get<AuthUser[]>("/users");
      // Filter for CUSTOMER role or show all non-agents if preferred
      setUsers(data.filter((u) => u.role === "CUSTOMER"));
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customers Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View all registered customers who create support tickets.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            prefix={<Search className="w-4 h-4 text-slate-400 mr-2" />}
            placeholder="Search customers by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl h-10 border-slate-200"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 h-72 flex items-center justify-center">
          <Spin size="large" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Users className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            No customers found
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            No customers match your search criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Customer Name</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-6 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm flex items-center justify-center">
                      {customer.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {customer.name}
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        ID: #{customer.id.slice(0, 8)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{customer.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                      Customer
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right text-xs text-slate-500">
                    {new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
