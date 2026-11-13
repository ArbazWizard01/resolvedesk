"use client";

import { useState } from "react";
import { Form, Input, Button, App } from "antd";
import { Lock, Mail, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API, { getErrorMessage } from "@/lib/api";
import { LogoMark } from "@/components/logo";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { message } = App.useApp();

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      await API.post("/auth/register", values);
      message.success("Account created! Please sign in.");
      router.push("/login");
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center space-x-2">
          <LogoMark className="w-10 h-10 shadow-sm rounded-xl" />
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            ResolveDesk
          </span>
        </div>
        <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-slate-900">
          Create your customer account
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Submit support tickets and track their progress.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200 sm:px-10">
          <Form
            name="register_form"
            layout="vertical"
            onFinish={onFinish}
            size="large"
            requiredMark={false}
          >
            <Form.Item
              label={
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Full Name
                </span>
              }
              name="name"
              rules={[
                { required: true, message: "Please enter your full name" },
              ]}
            >
              <Input
                prefix={<User className="w-4 h-4 text-slate-400 mr-2" />}
                placeholder="Sarah Jenkins"
                autoComplete="name"
                className="rounded-lg border-slate-300 hover:border-indigo-500 focus:border-indigo-500"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Email Address
                </span>
              }
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
            >
              <Input
                prefix={<Mail className="w-4 h-4 text-slate-400 mr-2" />}
                placeholder="name@company.com"
                autoComplete="email"
                className="rounded-lg border-slate-300 hover:border-indigo-500 focus:border-indigo-500"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Password
                </span>
              }
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 8, message: "Password must be at least 8 characters" },
              ]}
            >
              <Input.Password
                prefix={<Lock className="w-4 h-4 text-slate-400 mr-2" />}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="rounded-lg border-slate-300 hover:border-indigo-500 focus:border-indigo-500"
              />
            </Form.Item>

            <Form.Item className="mb-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="h-11 bg-indigo-600 hover:bg-indigo-700 font-medium text-base rounded-lg shadow-sm flex items-center justify-center space-x-2"
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-6 text-center text-sm text-slate-600 border-t border-slate-100 pt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
