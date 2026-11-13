"use client";

import React, { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Lock,
  Bell,
} from "lucide-react";
import { Button, Input, Switch, App } from "antd";
import { USER_KEY } from "@/lib/api";
import type { AuthUser } from "@/types/auth";

export default function SettingsPage() {
  const { message } = App.useApp();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [emailAlerts, setEmailAlerts] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    message.success("Settings updated successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Account & Workspace Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal profile preferences and notification channels.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Details */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Personal Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Full Name
              </label>
              <Input
                value={user?.name || ""}
                disabled
                className="h-10 rounded-lg bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Email Address
              </label>
              <Input
                value={user?.email || ""}
                disabled
                className="h-10 rounded-lg bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Assigned Role
            </label>
            <Input
              value={user?.role || "CUSTOMER"}
              disabled
              className="h-10 rounded-lg bg-slate-50 w-full sm:w-64 uppercase font-bold text-indigo-600"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Notification Preferences
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Email Notifications
              </p>
              <p className="text-xs text-slate-500">
                Receive email updates when ticket status changes or comments are
                posted.
              </p>
            </div>
            <Switch
              checked={emailAlerts}
              onChange={(val) => setEmailAlerts(val)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="primary"
            htmlType="submit"
            className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6 rounded-xl font-medium shadow-sm"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
