"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Drawer, Popover, Spin, App } from "antd";
import {
  Bell,
  CheckCheck,
  MessageSquare,
  RefreshCw,
  UserRoundCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import API, { getErrorMessage } from "@/lib/api";

type Notice = {
  id: string;
  type:
    | "COMMENT_ADDED"
    | "STATUS_CHANGED"
    | "AGENT_ASSIGNED"
    | "TICKET_CREATED";
  title: string;
  message: string;
  ticketId: string;
  createdAt: string;
  readAt: string | null;
};
type Feed = { items: Notice[]; unreadCount: number };

function relativeTime(value: string) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 1000),
  );
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function NotificationBell() {
  const router = useRouter();
  const { message } = App.useApp();
  const [feed, setFeed] = useState<Feed>({ items: [], unreadCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const [busy, setBusy] = useState(false);
  const alive = useRef(false);
  const version = useRef(0);
  const fetching = useRef(false);
  const mutating = useRef(false);

  const refresh = useCallback(async () => {
    if (fetching.current || mutating.current) return;
    fetching.current = true;
    const currentVersion = version.current;
    try {
      const { data } = await API.get<Feed>("/notifications");
      if (alive.current && currentVersion === version.current) {
        setFeed(data);
        setError(null);
      }
    } catch (err) {
      if (alive.current && currentVersion === version.current)
        setError(getErrorMessage(err));
    } finally {
      fetching.current = false;
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 15000);
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      alive.current = false;
      version.current += 1;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  async function markAllRead() {
    if (mutating.current) return;
    mutating.current = true;
    version.current += 1; // An earlier polling response must not overwrite a read update.
    setBusy(true);
    try {
      await API.patch("/notifications/read-all");
      // Reload authoritative state: a new notification may arrive during this request.
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      mutating.current = false;
      if (alive.current) {
        setBusy(false);
        void refresh();
      }
    }
  }

  async function openTicket(notice: Notice) {
    if (mutating.current) return;
    mutating.current = true;
    version.current += 1;
    setBusy(true);
    try {
      if (!notice.readAt) await API.patch(`/notifications/${notice.id}/read`);
      setOpen(false);
      router.push(`/dashboard/tickets/${encodeURIComponent(notice.ticketId)}`);
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      mutating.current = false;
      if (alive.current) {
        setBusy(false);
        void refresh();
      }
    }
  }

  const content = (
    <section
      className={`flex min-h-0 min-w-0 flex-col ${isMobile ? "h-full w-full" : "w-[380px] max-w-[calc(100vw-48px)]"}`}
      aria-label="Notifications"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-2 py-3">
        <h2 className="font-semibold text-slate-900">
          {isMobile ? "Ticket updates" : "Notifications"}
        </h2>
        <Button
          type="text"
          size="small"
          disabled={!feed.unreadCount || busy || loading}
          loading={busy}
          onClick={() => void markAllRead()}
          icon={<CheckCheck size={15} />}
        >
          Mark all as read
        </Button>
      </div>
      {error && (
        <div role="alert" className="p-3 text-sm text-red-600">
          {error}{" "}
          <Button size="small" onClick={() => void refresh()}>
            Retry
          </Button>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center p-8">
          <Spin />
        </div>
      ) : (
        <div
          className={`min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain py-1 ${isMobile ? "flex-1" : "max-h-[min(420px,calc(100dvh-160px))]"}`}
          aria-busy={busy}
        >
          {!error && feed.items.length === 0 && (
            <div className="px-5 py-10 text-center">
              <Bell className="mx-auto mb-3 text-slate-300" size={28} />
              <p className="font-medium text-slate-800">You’re all caught up</p>
              <p className="mt-1 text-sm text-slate-500">
                Replies, status updates, and agent assignments will appear here.
              </p>
            </div>
          )}
          {feed.items.map((notice) => {
            const Icon =
              notice.type === "COMMENT_ADDED"
                ? MessageSquare
                : notice.type === "AGENT_ASSIGNED"
                  ? UserRoundCheck
                  : notice.type === "TICKET_CREATED"
                    ? Bell
                    : RefreshCw;
            return (
              <button
                key={notice.id}
                type="button"
                disabled={busy}
                onClick={() => void openTicket(notice)}
                className={`my-1 flex w-full gap-3 rounded-xl p-3 text-left transition-colors hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-60 ${!notice.readAt ? "bg-indigo-50/60" : "bg-white"}`}
              >
                <span className="mt-1 flex h-9 w-9 shrink-0 self-start items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <Icon size={16} className="shrink-0" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start gap-2 text-sm font-semibold text-slate-900 [overflow-wrap:anywhere]">
                    {notice.title}
                    {!notice.readAt && (
                      <span
                        aria-label="Unread"
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-600"
                      />
                    )}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-600 [overflow-wrap:anywhere]">
                    {notice.message}
                  </span>
                  <time
                    dateTime={notice.createdAt}
                    title={new Date(notice.createdAt).toLocaleString()}
                    className="mt-1.5 block text-xs text-slate-400"
                  >
                    {relativeTime(notice.createdAt)}
                  </time>
                </span>
              </button>
            );
          })}
          {feed.items.length === 50 && (
            <p className="px-3 py-2 text-xs text-slate-400">
              Showing your latest 50 notifications.
            </p>
          )}
        </div>
      )}
    </section>
  );

  const trigger = (
    <button
      type="button"
      aria-label={`Notifications${error ? ", unavailable" : `, ${feed.unreadCount} unread`}`}
      aria-expanded={open}
      aria-haspopup={isMobile ? "dialog" : undefined}
      onClick={
        isMobile
          ? () => {
              setOpen(true);
              void refresh();
            }
          : undefined
      }
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
    >
      <Badge count={feed.unreadCount} overflowCount={99} size="small">
        <Bell className="h-5 w-5" />
      </Badge>
      {error && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 right-0 text-xs font-bold text-red-600"
        >
          !
        </span>
      )}
    </button>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Drawer
          title="Notifications"
          placement="bottom"
          open={open}
          onClose={() => setOpen(false)}
          size="min(85dvh, 720px)"
          styles={{
            section: {
              borderRadius: "20px 20px 0 0",
              overflow: "hidden",
            },
            body: {
              padding: "0 12px max(12px, env(safe-area-inset-bottom))",
              overflow: "hidden",
              minHeight: 0,
            },
          }}
        >
          {content}
        </Drawer>
      </>
    );
  }

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={open}
      autoAdjustOverflow
      onOpenChange={(next) => {
        setOpen(next);
        if (next) void refresh();
      }}
    >
      {trigger}
    </Popover>
  );
}
