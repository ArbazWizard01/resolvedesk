"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  UserPlus,
  RefreshCw,
  Inbox,
} from "lucide-react";
import {
  Button,
  Select,
  Modal,
  Form,
  Input,
  Pagination,
  Spin,
  App,
  Dropdown,
} from "antd";
import API, { USER_KEY, getErrorMessage } from "@/lib/api";
import { StatusBadge, PriorityBadge } from "@/components/tickets/ticket-badges";
import type {
  Ticket,
  TicketStatus,
  TicketPriority,
  PaginatedTicketsResponse,
} from "@/types/tickets";
import type { AuthUser } from "@/types/auth";

const { Option } = Select;
const { TextArea } = Input;

export default function TicketsPage() {
  const { message } = App.useApp();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination (aligned with QueryTicketsDto)
  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>(
    undefined,
  );
  const [priorityFilter, setPriorityFilter] = useState<
    TicketPriority | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assignModalTicket, setAssignModalTicket] = useState<Ticket | null>(
    null,
  );
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(
    undefined,
  );
  const [assigning, setAssigning] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        const parsed: AuthUser = JSON.parse(stored);
        setUser(parsed);
        if (parsed.role === "ADMIN") {
          fetchAgents();
        }
      } catch {
        // Ignore parse error
      }
    }
  }, []);

  const fetchAgents = async () => {
    try {
      const { data } = await API.get<AuthUser[]>("/users");
      setAgents(data.filter((u) => u.role === "AGENT"));
    } catch {
      // Silently ignore if unauthorized
    }
  };

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const { data } = await API.get<PaginatedTicketsResponse>("/tickets", {
        params,
      });
      setTickets(data.items);
      setTotal(data.total);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, priorityFilter, message]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreateTicket = async (values: {
    title: string;
    description: string;
    priority: TicketPriority;
  }) => {
    setSubmitting(true);
    try {
      await API.post("/tickets", values);
      message.success("Ticket created successfully");
      setIsCreateOpen(false);
      form.resetFields();
      setPage(1);
      fetchTickets();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    try {
      await API.patch(`/tickets/${ticketId}/status`, { status });
      message.success(`Status updated to ${status.replace("_", " ")}`);
      fetchTickets();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleAssignAgent = async () => {
    if (!assignModalTicket || !selectedAgentId) return;
    setAssigning(true);
    try {
      await API.patch(`/tickets/${assignModalTicket.id}/assign`, {
        assignedToId: selectedAgentId,
      });
      message.success("Agent assigned successfully");
      setAssignModalTicket(null);
      setSelectedAgentId(undefined);
      fetchTickets();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setAssigning(false);
    }
  };

  // Instant search filtering on loaded page
  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.createdBy.name.toLowerCase().includes(q)
    );
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Support Tickets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {user?.role === "CUSTOMER"
              ? "View and track your submitted support requests."
              : "Manage, triage, and resolve incoming customer tickets."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchTickets}
            className="h-10 rounded-xl border-slate-300 text-slate-600 hover:text-slate-900"
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 h-10 px-4 rounded-xl font-medium shadow-sm flex items-center gap-1.5"
          >
            <span>New Ticket</span>
          </Button>
        </div>
      </div>

      {/* Status Quick Tabs + Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Quick Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { label: "All", value: undefined },
                { label: "Open", value: "OPEN" },
                { label: "In Progress", value: "IN_PROGRESS" },
                { label: "Resolved", value: "RESOLVED" },
                { label: "Closed", value: "CLOSED" },
              ] as const
            ).map((tab) => {
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.label}
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    active
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <span className="text-xs font-medium text-slate-400">
            Showing {filteredTickets.length} of {total} tickets
          </span>
        </div>

        {/* Search & Priority Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by subject, ticket ID, or customer..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <Select
              allowClear
              placeholder="All Priorities"
              value={priorityFilter}
              onChange={(val) => {
                setPriorityFilter(val);
                setPage(1);
              }}
              className="w-full sm:w-44 h-10"
            >
              <Option value="LOW">Low Priority</Option>
              <Option value="MEDIUM">Medium Priority</Option>
              <Option value="HIGH">High Priority</Option>
            </Select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 h-72 flex items-center justify-center">
          <Spin size="large" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            No tickets found
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            No support tickets match your current filters. Try clearing your
            filters or create a new ticket.
          </p>
          <Button
            type="primary"
            onClick={() => setIsCreateOpen(true)}
            className="mt-5 bg-indigo-600 hover:bg-indigo-700 rounded-xl"
          >
            Create First Ticket
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Data Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-5">Ticket</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Assigned Agent</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Created</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-4 px-5 max-w-xs">
                        <Link
                          href={`/dashboard/tickets/${ticket.id}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600 line-clamp-1 block"
                        >
                          {ticket.title}
                        </Link>
                        <span className="text-xs font-mono text-slate-400">
                          #{ticket.id.slice(0, 8)}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-800">
                          {ticket.createdBy.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {ticket.createdBy.email}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {ticket.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                              {ticket.assignedTo.name[0]?.toUpperCase()}
                            </span>
                            <span className="text-slate-700 font-medium">
                              {ticket.assignedTo.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <PriorityBadge priority={ticket.priority} />
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={ticket.status} />
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-500">
                        {formatDate(ticket.createdAt)}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {user?.role === "ADMIN" && (
                            <Button
                              size="small"
                              icon={<UserPlus className="w-3.5 h-3.5" />}
                              onClick={() => {
                                setAssignModalTicket(ticket);
                                setSelectedAgentId(
                                  ticket.assignedToId ?? undefined,
                                );
                              }}
                              className="rounded-lg text-xs border-slate-200 text-slate-600 hover:text-indigo-600"
                            >
                              Assign
                            </Button>
                          )}

                          {(user?.role === "ADMIN" ||
                            (user?.role === "AGENT" &&
                              ticket.assignedToId === user.id)) && (
                            <Dropdown
                              trigger={["click"]}
                              menu={{
                                items: (
                                  [
                                    "OPEN",
                                    "IN_PROGRESS",
                                    "RESOLVED",
                                    "CLOSED",
                                  ] as TicketStatus[]
                                ).map((st) => ({
                                  key: st,
                                  label: st.replace("_", " "),
                                  disabled: ticket.status === st,
                                  onClick: () =>
                                    handleStatusChange(ticket.id, st),
                                })),
                              }}
                            >
                              <Button
                                size="small"
                                className="rounded-lg text-xs border-slate-200"
                              >
                                Status
                              </Button>
                            </Dropdown>
                          )}

                          <Link href={`/dashboard/tickets/${ticket.id}`}>
                            <Button
                              size="small"
                              type="primary"
                              ghost
                              className="rounded-lg text-xs inline-flex items-center gap-1"
                            >
                              <span>Open</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400">
                      #{ticket.id.slice(0, 8)}
                    </span>
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className="font-semibold text-slate-900 hover:text-indigo-600 block mt-0.5"
                    >
                      {ticket.title}
                    </Link>
                  </div>
                  <PriorityBadge priority={ticket.priority} />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <StatusBadge status={ticket.status} />
                  <span className="text-xs text-slate-500">
                    {ticket.assignedTo
                      ? `Agent: ${ticket.assignedTo.name}`
                      : "Unassigned"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">
                    {formatDate(ticket.createdAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    {user?.role === "ADMIN" && (
                      <Button
                        size="small"
                        onClick={() => {
                          setAssignModalTicket(ticket);
                          setSelectedAgentId(ticket.assignedToId ?? undefined);
                        }}
                        className="rounded-lg text-xs"
                      >
                        Assign
                      </Button>
                    )}
                    <Link href={`/dashboard/tickets/${ticket.id}`}>
                      <Button
                        size="small"
                        type="primary"
                        className="bg-indigo-600 rounded-lg text-xs"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex justify-end pt-2">
              <Pagination
                current={page}
                pageSize={limit}
                total={total}
                onChange={(nextPage) => setPage(nextPage)}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}

      {/* Create Ticket Modal */}
      <Modal
        title={
          <span className="text-lg font-bold text-slate-900">
            Create New Support Ticket
          </span>
        }
        open={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        footer={null}
        destroyOnHidden
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTicket}
          initialValues={{ priority: "MEDIUM" }}
          className="mt-4"
        >
          <Form.Item
            label={
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Subject
              </span>
            }
            name="title"
            rules={[
              { required: true, message: "Please enter a subject" },
              { max: 120, message: "Max 120 characters" },
            ]}
          >
            <Input
              placeholder="Brief summary of the issue"
              className="rounded-lg h-10 border-slate-300"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Priority
              </span>
            }
            name="priority"
            rules={[{ required: true }]}
          >
            <Select className="h-10">
              <Option value="LOW">Low</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="HIGH">High</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Description
              </span>
            }
            name="description"
            rules={[{ required: true, message: "Please describe your issue" }]}
          >
            <TextArea
              rows={4}
              placeholder="Provide steps to reproduce, error details, or context..."
              className="rounded-lg border-slate-300"
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              onClick={() => setIsCreateOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Submit Ticket
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Assign Agent Modal (Admin Only) */}
      <Modal
        title={
          <span className="text-lg font-bold text-slate-900">
            Assign Support Agent
          </span>
        }
        open={Boolean(assignModalTicket)}
        onCancel={() => setAssignModalTicket(null)}
        onOk={handleAssignAgent}
        confirmLoading={assigning}
        okText="Assign Agent"
        okButtonProps={{
          disabled: !selectedAgentId,
          className: "bg-indigo-600 hover:bg-indigo-700",
        }}
        destroyOnHidden
        centered
      >
        <div className="py-4 space-y-3">
          <p className="text-sm text-slate-600">
            Select an agent to handle{" "}
            <span className="font-semibold text-slate-900">
              {assignModalTicket?.title}
            </span>
            :
          </p>
          {agents.length === 0 ? (
            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              No users with the AGENT role found. Promote a user to AGENT in the
              Agents directory first.
            </p>
          ) : (
            <Select
              placeholder="Choose an agent"
              value={selectedAgentId}
              onChange={(val) => setSelectedAgentId(val)}
              className="w-full h-10"
            >
              {agents.map((agent) => (
                <Option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.email})
                </Option>
              ))}
            </Select>
          )}
        </div>
      </Modal>
    </div>
  );
}
