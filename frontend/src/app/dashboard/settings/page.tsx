"use client";
import { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Spin, Tag, App } from "antd";
import { Bell, Shield, User } from "lucide-react";
import API, { USER_KEY, getErrorMessage } from "@/lib/api";
import type { AuthUser } from "@/types/auth";
const panel = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";
export default function SettingsPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<{ name: string }>();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    API.get<AuthUser>("/account/profile")
      .then(({ data }) => {
        if (active) setUser(data);
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
  }, [revision]);
  // This effect runs after the Form has mounted in the successful render.
  useEffect(() => {
    if (!loading && !error && user) form.setFieldsValue({ name: user.name });
  }, [loading, error, user, form]);
  async function save(values: { name: string }) {
    setSaving(true);
    try {
      const { data } = await API.patch<AuthUser>("/account/profile", {
        name: values.name.trim(),
      });
      setUser(data);
      form.setFieldsValue({ name: data.name });
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(data));
        window.dispatchEvent(new Event("resolvedesk:profile-updated"));
      } catch {
        /* The server has saved the profile even if browser storage is unavailable. */
      }
      message.success("Profile saved");
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your profile and see how account notifications work.
        </p>
      </div>
      {error && (
        <Alert
          type="error"
          showIcon
          message="Could not load profile"
          description={error}
          action={
            <Button onClick={() => setRevision((v) => v + 1)}>Retry</Button>
          }
        />
      )}
      {loading ? (
        <div className="flex justify-center p-16">
          <Spin />
        </div>
      ) : (
        !error &&
        user && (
          <>
            <section className={panel}>
              <div className="mb-5 flex items-center gap-3">
                <User size={20} className="text-indigo-600" />
                <h2 className="font-semibold text-slate-900">
                  Personal profile
                </h2>
                <Tag color="purple">{user.role}</Tag>
              </div>
              <Form
                form={form}
                layout="vertical"
                onFinish={save}
                requiredMark={false}
              >
                <Form.Item
                  label="Full name"
                  name="name"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Enter your name",
                    },
                    { max: 80, message: "Use 80 characters or fewer" },
                  ]}
                >
                  <Input maxLength={80} autoComplete="name" disabled={saving} />
                </Form.Item>
                <Form.Item label="Email address">
                  <Input value={user.email} readOnly autoComplete="email" />
                  <p className="mt-1 text-xs text-slate-500">
                    Email and role changes are managed by your administrator.
                  </p>
                </Form.Item>
                <div className="flex justify-end">
                  <Button type="primary" htmlType="submit" loading={saving}>
                    Save profile
                  </Button>
                </div>
              </Form>
            </section>
            <section className={panel}>
              <div className="mb-4 flex items-center gap-3">
                <Bell size={20} className="text-indigo-600" />
                <h2 className="font-semibold text-slate-900">Notifications</h2>
                <Tag color="green">In-app enabled</Tag>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {user.role === "CUSTOMER"
                  ? "You receive staff replies, status updates, and agent assignments on your tickets."
                  : user.role === "AGENT"
                    ? "You receive new assignments, customer replies, and updates on tickets assigned to you."
                    : "You receive new-ticket alerts, customer replies on unassigned tickets, and resolution or closure updates."}
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Use the bell to open tickets and mark notifications as read.
                Email delivery is not enabled.
              </p>
            </section>
            <section className={panel}>
              <div className="mb-3 flex items-center gap-3">
                <Shield size={20} className="text-indigo-600" />
                <h2 className="font-semibold text-slate-900">Account access</h2>
              </div>
              <p className="text-sm text-slate-600">
                Your assigned role controls the tickets and pages you can
                access. Contact your administrator for access changes.
              </p>
            </section>
          </>
        )
      )}
    </div>
  );
}
