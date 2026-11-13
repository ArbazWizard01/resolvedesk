"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Activity as ActivityIcon,
  MessageSquare,
} from "lucide-react";
import { Button, Select, Spin, App } from "antd";
import API, { USER_KEY, getErrorMessage } from "@/lib/api";
import { StatusBadge, PriorityBadge } from "@/components/tickets/ticket-badges";
import type { Ticket, TicketStatus } from "@/types/tickets";
import type { AuthUser } from "@/types/auth";

const { Option } = Select;

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    role: string;
  };
}

interface ActivityItem {
  id: string;
  action: string;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    role: string;
  };
}

export default function TicketDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const { message } = App.useApp();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [agents, setAgents] = useState<AuthUser[]>([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        const parsed: AuthUser = JSON.parse(stored);
        setCurrentUser(parsed);
        if (parsed.role === "ADMIN") {
          fetchAgents();
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const fetchAgents = async () => {
    try {
      const { data } = await API.get<AuthUser[]>("/users");
      setAgents(data.filter((u) => u.role === "AGENT"));
    } catch {
      // ignore
    }
  };

  const fetchTicketData = useCallback(async () => {
    try {
      const [ticketRes, commentsRes, activityRes] = await Promise.all([
        API.get<Ticket>(`/tickets/${ticketId}`),
        API.get<CommentItem[]>(`/tickets/${ticketId}/comments`),
        API.get<ActivityItem[]>(`/tickets/${ticketId}/activity`),
      ]);
      setTicket(ticketRes.data);
      setComments(commentsRes.data);
      setActivities(activityRes.data);
    } catch (error) {
      message.error(getErrorMessage(error));
      router.push("/dashboard/tickets");
    } finally {
      setLoading(false);
    }
  }, [ticketId, message, router]);

  useEffect(() => {
    fetchTicketData();
  }, [fetchTicketData]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await API.post(`/tickets/${ticketId}/comments`, {
        content: newComment.trim(),
      });
      setNewComment("");
      message.success("Comment posted");
      fetchTicketData();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    try {
      await API.patch(`/tickets/${ticketId}/status`, { status });
      message.success(`Status updated to ${status.replace("_", " ")}`);
      fetchTicketData();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleAssignAgent = async (assignedToId: string) => {
    setAssigning(true);
    try {
      await API.patch(`/tickets/${ticketId}/assign`, { assignedToId });
      message.success("Agent assigned successfully");
      fetchTicketData();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setAssigning(false);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading || !ticket) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const canChangeStatus =
    currentUser?.role === "ADMIN" ||
    (currentUser?.role === "AGENT" && ticket.assignedToId === currentUser.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Navigation / Back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard/tickets")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tickets</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
            ID: #{ticket.id}
          </span>
        </div>
      </div>

      {/* Main Grid Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {ticket.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canChangeStatus && (
              <Select
                value={ticket.status}
                onChange={handleStatusChange}
                className="w-40"
                size="large"
              >
                <Option value="OPEN">Open</Option>
                <Option value="IN_PROGRESS">In Progress</Option>
                <Option value="RESOLVED">Resolved</Option>
                <Option value="CLOSED">Closed</Option>
              </Select>
            )}

            {currentUser?.role === "ADMIN" && (
              <Select
                placeholder="Assign Agent"
                value={ticket.assignedToId ?? undefined}
                onChange={handleAssignAgent}
                loading={assigning}
                className="w-48"
                size="large"
                allowClear
              >
                {agents.map((ag) => (
                  <Option key={ag.id} value={ag.id}>
                    {ag.name}
                  </Option>
                ))}
              </Select>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Customer
            </span>
            <span className="font-medium text-slate-800 text-sm">
              {ticket.createdBy.name}
            </span>
            <span className="block text-slate-400">
              {ticket.createdBy.email}
            </span>
          </div>
          <div>
            <span className="font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Assigned Agent
            </span>
            <span className="font-medium text-slate-800 text-sm">
              {ticket.assignedTo ? ticket.assignedTo.name : "Unassigned"}
            </span>
            <span className="block text-slate-400">
              {ticket.assignedTo
                ? ticket.assignedTo.email
                : "Pending assignment"}
            </span>
          </div>
          <div>
            <span className="font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Created Date
            </span>
            <span className="font-medium text-slate-800 text-sm">
              {formatDate(ticket.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description Box */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Description
            </h2>
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {ticket.description}
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Discussion & Updates ({comments.length})
              </h2>
            </div>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No comments yet. Start the conversation below.
                </p>
              ) : (
                comments.map((comment) => {
                  const isStaff =
                    comment.author.role === "ADMIN" ||
                    comment.author.role === "AGENT";
                  return (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-xl border space-y-2 transition-all ${
                        isStaff
                          ? "bg-indigo-50/40 border-indigo-100 shadow-2xs"
                          : "bg-slate-50 border-slate-200/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center ${
                              isStaff
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-700 text-white"
                            }`}
                          >
                            {comment.author.name[0]?.toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-900 text-sm">
                            {comment.author.name}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                              isStaff
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {comment.author.role}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 pl-9 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <form
              onSubmit={handlePostComment}
              className="pt-4 border-t border-slate-100 space-y-3"
            >
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                placeholder="Write a comment or update..."
                className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submittingComment}
                  icon={<Send className="w-4 h-4" />}
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-10 px-5 font-medium flex items-center gap-2 shadow-sm"
                >
                  <span>Post Comment</span>
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Audit Activity Timeline */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ActivityIcon className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Activity Timeline
              </h2>
            </div>

            <div className="space-y-4 pt-2">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="relative pl-6 pb-4 border-l border-slate-200 last:pb-0"
                >
                  <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
                  <p className="text-xs font-semibold text-slate-900">
                    {act.action}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    by{" "}
                    <span className="font-medium text-slate-700">
                      {act.actor?.name || "System"}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formatDate(act.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
