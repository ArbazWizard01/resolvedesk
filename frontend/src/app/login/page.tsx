"use client";

import { useState } from "react";
import { Form, Input, Button, App } from "antd";
import { Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API, { TOKEN_KEY, USER_KEY, getErrorMessage } from "@/lib/api";
import { LogoMark } from "@/components/logo";
import type { AuthResponse } from "@/types/auth";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { message } = App.useApp();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const { data } = await API.post<AuthResponse>("/auth/login", values);
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      message.success("Welcome back to ResolveDesk!");
      router.push("/dashboard");
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl p-8 sm:p-10">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-6">
          <LogoMark className="w-10 h-10 shadow-sm rounded-xl" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
              ResolveDesk
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Customer Support & Ticketing
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Sign in to your account
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter your credentials to access your dashboard.
          </p>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          size="middle"
          requiredMark={false}
        >
          <Form.Item
            label={
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Email Address
              </span>
            }
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Enter a valid email" },
            ]}
            className="mb-4"
          >
            <Input
              prefix={<Mail className="w-4 h-4 text-slate-400 mr-2" />}
              placeholder="name@company.com"
              autoComplete="email"
              className="rounded-lg h-10 border-slate-300 hover:border-indigo-500 focus:border-indigo-500"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Password
              </span>
            }
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
            className="mb-6"
          >
            <Input.Password
              prefix={<Lock className="w-4 h-4 text-slate-400 mr-2" />}
              placeholder="••••••••"
              autoComplete="current-password"
              className="rounded-lg h-10 border-slate-300 hover:border-indigo-500 focus:border-indigo-500"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="h-10 bg-indigo-600 hover:bg-indigo-700 font-medium text-sm rounded-lg shadow-sm flex items-center justify-center space-x-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Form>

        <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
