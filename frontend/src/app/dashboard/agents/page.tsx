"use client";

import React, { useEffect, useState } from "react";
import { UserCog, Search } from "lucide-react";
import { Spin, Input, Select, App } from "antd";
import API, { USER_KEY, getErrorMessage } from "@/lib/api";
import type { AuthUser } from "@/types/auth";

const { Option } = Select;

export default function AgentsPage() {
  const { message } = App.useApp();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get<AuthUser[]>("/users");
      setUsers(data);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "AGENT" | "CUSTOMER" | "ADMIN",
  ) => {
    setUpdatingId(userId);
    try {
      await API.patch(`/users/${userId}/role`, { role: newRole });
      message.success(`User role updated to ${newRole}`);

      // If the user modified their own role, update localStorage immediately
      const stored = localStorage.getItem(USER_KEY);
      if (stored) {
        try {
          const parsedUser = JSON.parse(stored);
          if (parsedUser.id === userId) {
            parsedUser.role = newRole;
            localStorage.setItem(USER_KEY, JSON.stringify(parsedUser));
            setCurrentUser(parsedUser);
          }
        } catch {
        }
      }

      fetchUsers();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setUpdatingId(null);
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
            Agents & User Role Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage system users and promote customers to support agents.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            prefix={<Search className="w-4 h-4 text-slate-400 mr-2" />}
            placeholder="Search by name or email..."
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
          <UserCog className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            No users found
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            No accounts match your search criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">User Account</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Current Role</th>
                <th className="py-3.5 px-6 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((staff) => {
                const isAdmin = staff.role === "ADMIN";
                return (
                  <tr
                    key={staff.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl font-bold text-sm flex items-center justify-center ${
                          isAdmin
                            ? "bg-purple-100 text-purple-700"
                            : staff.role === "AGENT"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {staff.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {staff.name}
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                          ID: #{staff.id.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{staff.email}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isAdmin
                            ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                            : staff.role === "AGENT"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                              : "bg-slate-100 text-slate-700 border border-slate-200/60"
                        }`}
                      >
                        {staff.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {isAdmin ? (
                        <span className="text-xs font-medium text-slate-400 italic">
                          Protected Admin
                        </span>
                      ) : (
                        <Select
                          value={staff.role}
                          loading={updatingId === staff.id}
                          onChange={(newRole) =>
                            handleRoleChange(staff.id, newRole)
                          }
                          className="w-36"
                        >
                          <Option value="CUSTOMER">Customer</Option>
                          <Option value="AGENT">Agent</Option>
                        </Select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
