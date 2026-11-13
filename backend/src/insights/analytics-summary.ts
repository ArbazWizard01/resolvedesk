export type AnalyticsTicket = {
  status: string; priority: string; createdAt: Date; createdById: string;
  assignedTo: { id: string; name: string } | null;
  comments: { createdAt: Date; authorId: string }[];
};
export function summarize(tickets: AnalyticsTicket[], since: Date, until: Date, includeWorkload: boolean) {
  const byStatus: Record<string, number> = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 };
  const byPriority: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  const daily = new Map<string, number>();
  for (let day = new Date(since); day < until; day.setUTCDate(day.getUTCDate() + 1)) daily.set(day.toISOString().slice(0, 10), 0);
  const agents = new Map<string, { id: string; name: string; total: number; active: number; completed: number }>();
  const responseMinutes: number[] = [];
  let unassigned = 0, highPriorityOpen = 0, active = 0;
  for (const ticket of tickets) {
    byStatus[ticket.status] = (byStatus[ticket.status] ?? 0) + 1;
    byPriority[ticket.priority] = (byPriority[ticket.priority] ?? 0) + 1;
    const open = ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS';
    if (open) active++;
    if (open && ticket.priority === 'HIGH') highPriorityOpen++;
    if (open && !ticket.assignedTo) unassigned++;
    const date = ticket.createdAt.toISOString().slice(0, 10);
    daily.set(date, (daily.get(date) ?? 0) + 1);
    const reply = ticket.comments.find((comment) => comment.authorId !== ticket.createdById);
    if (reply && reply.createdAt >= ticket.createdAt) responseMinutes.push((reply.createdAt.getTime() - ticket.createdAt.getTime()) / 60000);
    if (includeWorkload && ticket.assignedTo) {
      const agent = agents.get(ticket.assignedTo.id) ?? { ...ticket.assignedTo, total: 0, active: 0, completed: 0 };
      agent.total++; if (open) agent.active++; else agent.completed++;
      agents.set(agent.id, agent);
    }
  }
  const total = tickets.length, completed = byStatus.RESOLVED + byStatus.CLOSED;
  return { total, active, completed, unassigned, highPriorityOpen, byStatus, byPriority,
    completedShare: total ? Math.round(completed / total * 1000) / 10 : null,
    avgFirstResponseMinutes: responseMinutes.length ? Math.round(responseMinutes.reduce((a, b) => a + b, 0) / responseMinutes.length * 10) / 10 : null,
    respondedTickets: responseMinutes.length,
    daily: [...daily].map(([date, count]) => ({ date, count })),
    workload: [...agents.values()].sort((a, b) => b.active - a.active),
  };
}
