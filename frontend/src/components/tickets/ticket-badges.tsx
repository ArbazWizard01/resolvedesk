import type { TicketPriority, TicketStatus } from "@/types/tickets";

export function StatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<
    TicketStatus,
    { bg: string; text: string; dot: string; label: string }
  > = {
    OPEN: {
      bg: "bg-blue-50 border-blue-200/80",
      text: "text-blue-700",
      dot: "bg-blue-500",
      label: "Open",
    },
    IN_PROGRESS: {
      bg: "bg-amber-50 border-amber-200/80",
      text: "text-amber-700",
      dot: "bg-amber-500",
      label: "In Progress",
    },
    RESOLVED: {
      bg: "bg-emerald-50 border-emerald-200/80",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      label: "Resolved",
    },
    CLOSED: {
      bg: "bg-slate-100 border-slate-200",
      text: "text-slate-600",
      dot: "bg-slate-400",
      label: "Closed",
    },
  };

  const current = styles[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg} ${current.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const styles: Record<
    TicketPriority,
    { bg: string; text: string; label: string }
  > = {
    LOW: {
      bg: "bg-slate-100 text-slate-600",
      text: "text-slate-600",
      label: "Low",
    },
    MEDIUM: {
      bg: "bg-indigo-50 text-indigo-700",
      text: "text-indigo-700",
      label: "Medium",
    },
    HIGH: {
      bg: "bg-rose-50 text-rose-700",
      text: "text-rose-700",
      label: "High",
    },
  };

  const current = styles[priority];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide ${current.bg}`}
    >
      {current.label}
    </span>
  );
}
