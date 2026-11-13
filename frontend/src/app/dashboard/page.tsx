"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Ticket, Clock, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import {
  Button,
  Alert,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  App as AntdApp,
} from "antd";
import API, { getErrorMessage } from "@/lib/api";
import Link from "next/link";

const { Option } = Select;
const { TextArea } = Input;

type Stats = {
  total: number;
  unassigned: number;
  byStatus: Record<"OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED", number>;
  byPriority: Record<"LOW" | "MEDIUM" | "HIGH", number>;
};
type NewTicket = {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
};

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<NewTicket>();
  const { message } = AntdApp.useApp();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get<Stats>("/tickets/stats");
      setStats(data);
    } catch (error: unknown) {
      setStats(null);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const completed =
    (stats?.byStatus.RESOLVED ?? 0) + (stats?.byStatus.CLOSED ?? 0);
  const completedShare =
    stats && stats.total > 0
      ? `${Math.round((completed / stats.total) * 1000) / 10}%`
      : "—";

  const handleCreateTicket = async (values: NewTicket) => {
    setSubmitting(true);
    try {
      await API.post("/tickets", values);
      message.success("Support ticket created successfully!");
      form.resetFields();
      setIsModalOpen(false);
      fetchStats();
    } catch (error: unknown) {
      message.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="Could not load dashboard"
        description={error}
        action={<Button onClick={() => void fetchStats()}>Retry</Button>}
      />
    );
  }

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Support Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            All-time snapshot of the tickets you can access. Refresh to load
            updates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => void fetchStats()}>Refresh</Button>
          <Link href="/dashboard/tickets">
            <Button className="h-10 px-4 rounded-xl font-medium border-slate-300 text-slate-700 hover:border-slate-400">
              View All Tickets
            </Button>
          </Link>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 h-10 px-4 rounded-xl font-medium flex items-center space-x-2 shadow-sm"
          >
            <span>Create Ticket</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Tickets
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.total || 0}
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              All time
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Open Tickets
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.byStatus?.OPEN || 0}
            </span>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Requires action
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              In Progress
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.byStatus?.IN_PROGRESS || 0}
            </span>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Active queues
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Resolved
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.byStatus?.RESOLVED || 0}
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Resolved tickets
            </span>
          </div>
        </div>
      </div>

      {/* Quick Operational Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Quick Operational Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Unassigned Queue
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {stats?.unassigned || 0} tickets
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Without an assigned agent • all statuses
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              High Priority
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {stats?.byPriority?.HIGH || 0} tickets
            </p>
            <p className="text-xs text-slate-500 mt-1">
              High priority • all statuses
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Share
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {completedShare}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Resolved + closed / all accessible tickets
            </p>
          </div>
        </div>
      </div>

      <CreateTicketModal
        open={isModalOpen}
        submitting={submitting}
        form={form}
        onCancel={() => setIsModalOpen(false)}
        onFinish={handleCreateTicket}
      />
    </div>
  );
}

function CreateTicketModal({
  open,
  submitting,
  form,
  onCancel,
  onFinish,
}: {
  open: boolean;
  submitting: boolean;
  form: import("antd").FormInstance<NewTicket>;
  onCancel: () => void;
  onFinish: (values: NewTicket) => Promise<void>;
}) {
  return (
    <Modal
      title={
        <span className="text-lg font-bold text-slate-900">
          Create New Support Ticket
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      forceRender
      centered
      className="rounded-2xl overflow-hidden"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ priority: "MEDIUM" }}
        className="mt-4"
      >
        <Form.Item
          label={
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Ticket Title
            </span>
          }
          name="title"
          rules={[
            { required: true, message: "Please enter a ticket title" },
            { max: 120, message: "Max 120 characters" },
          ]}
        >
          <Input
            placeholder="e.g., Unable to access billing invoices"
            className="rounded-lg h-10 border-slate-300"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Priority Level
            </span>
          }
          name="priority"
          rules={[{ required: true }]}
        >
          <Select className="h-10">
            <Option value="LOW">Low Priority</Option>
            <Option value="MEDIUM">Medium Priority</Option>
            <Option value="HIGH">High Priority</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Detailed Description
            </span>
          }
          name="description"
          rules={[{ required: true, message: "Please provide a description" }]}
        >
          <TextArea
            rows={4}
            placeholder="Describe the issue or request in detail..."
            className="rounded-lg border-slate-300"
          />
        </Form.Item>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button onClick={onCancel} className="rounded-lg">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
          >
            Submit Ticket
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
