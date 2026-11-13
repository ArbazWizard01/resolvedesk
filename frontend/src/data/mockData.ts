export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  customerName: string;
  customerEmail: string;
  customerAvatar: string;
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  totalTickets: number;
  openTickets: number;
  registeredDate: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPPORT_AGENT";
  avatar: string;
  status: "ONLINE" | "AWAY" | "OFFLINE";
  assignedTicketsCount: number;
}

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: "TICK-1042",
    title: "SSO Authentication failing on Enterprise login portal",
    description:
      "Enterprise clients using SAML 2.0 are getting a 500 error when redirecting back from Okta.",
    status: "OPEN",
    priority: "URGENT",
    customerName: "Sarah Jenkins",
    customerEmail: "s.jenkins@acme corp.io",
    customerAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
    assignedAgent: "Alex Mercer",
    createdAt: "2026-11-10T08:30:00Z",
    updatedAt: "2026-11-10T09:15:00Z",
    commentsCount: 4,
  },
  {
    id: "TICK-1041",
    title: "Export to CSV failing for large datasets over 50k rows",
    description:
      "When attempting to export transaction logs exceeding 50,000 records, the UI hangs and times out.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    customerName: "Marcus Chen",
    customerEmail: "mchen@fintechlabs.com",
    customerAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    assignedAgent: "Priya Sharma",
    createdAt: "2026-11-09T14:20:00Z",
    updatedAt: "2026-11-10T10:00:00Z",
    commentsCount: 7,
  },
  {
    id: "TICK-1040",
    title: "Billing invoice PDF missing VAT registration number",
    description:
      "Our European entity requires the VAT ID displayed correctly on the October invoice receipt.",
    status: "RESOLVED",
    priority: "MEDIUM",
    customerName: "Elena Rostova",
    customerEmail: "elena@nordicdesign.no",
    customerAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    assignedAgent: "Alex Mercer",
    createdAt: "2026-11-08T11:10:00Z",
    updatedAt: "2026-11-09T16:45:00Z",
    commentsCount: 2,
  },
  {
    id: "TICK-1039",
    title: "Webhook delivery delays during peak traffic hours",
    description:
      "Webhook payloads for event trigger customer.updated are delayed by up to 15 minutes.",
    status: "OPEN",
    priority: "HIGH",
    customerName: "David Kalu",
    customerEmail: "david@cloudscale.africa",
    customerAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
    createdAt: "2026-11-10T07:00:00Z",
    updatedAt: "2026-11-10T07:00:00Z",
    commentsCount: 1,
  },
  {
    id: "TICK-1038",
    title: "Custom domain SSL certificate renewal notification",
    description:
      "Need assistance verifying DNS CNAME records for our white-labeled client portal domain.",
    status: "CLOSED",
    priority: "LOW",
    customerName: "Sophie Laurent",
    customerEmail: "sophie@lumina.fr",
    customerAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces",
    assignedAgent: "Priya Sharma",
    createdAt: "2026-11-05T09:00:00Z",
    updatedAt: "2026-11-07T12:30:00Z",
    commentsCount: 5,
  },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "CUST-1",
    name: "Sarah Jenkins",
    email: "s.jenkins@acmecorp.io",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
    totalTickets: 12,
    openTickets: 2,
    registeredDate: "2025-03-15",
    status: "ACTIVE",
  },
  {
    id: "CUST-2",
    name: "Marcus Chen",
    email: "mchen@fintechlabs.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    totalTickets: 8,
    openTickets: 1,
    registeredDate: "2025-06-20",
    status: "ACTIVE",
  },
  {
    id: "CUST-3",
    name: "Elena Rostova",
    email: "elena@nordicdesign.no",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    totalTickets: 5,
    openTickets: 0,
    registeredDate: "2025-09-10",
    status: "ACTIVE",
  },
  {
    id: "CUST-4",
    name: "David Kalu",
    email: "david@cloudscale.africa",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
    totalTickets: 19,
    openTickets: 4,
    registeredDate: "2024-11-01",
    status: "ACTIVE",
  },
  {
    id: "CUST-5",
    name: "Sophie Laurent",
    email: "sophie@lumina.fr",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces",
    totalTickets: 3,
    openTickets: 0,
    registeredDate: "2026-01-14",
    status: "INACTIVE",
  },
];

export const MOCK_AGENTS: Agent[] = [
  {
    id: "AGT-1",
    name: "Alex Mercer",
    email: "alex.mercer@resolvedesk.io",
    role: "ADMIN",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces",
    status: "ONLINE",
    assignedTicketsCount: 14,
  },
  {
    id: "AGT-2",
    name: "Priya Sharma",
    email: "priya.sharma@resolvedesk.io",
    role: "SUPPORT_AGENT",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
    status: "ONLINE",
    assignedTicketsCount: 9,
  },
  {
    id: "AGT-3",
    name: "Liam O’Connor",
    email: "liam.oconnor@resolvedesk.io",
    role: "SUPPORT_AGENT",
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces",
    status: "AWAY",
    assignedTicketsCount: 6,
  },
];

export const ANALYTICS_TREND_DATA = [
  { day: "Mon", created: 24, resolved: 22 },
  { day: "Tue", created: 38, resolved: 35 },
  { day: "Wed", created: 45, resolved: 48 },
  { day: "Thu", created: 30, resolved: 33 },
  { day: "Fri", created: 52, resolved: 47 },
  { day: "Sat", created: 18, resolved: 20 },
  { day: "Sun", created: 15, resolved: 17 },
];

export const STATUS_DISTRIBUTION = [
  { name: "Open", value: 34, color: "#3b82f6" }, // blue-500
  { name: "In Progress", value: 24, color: "#f59e0b" }, // amber-500
  { name: "Resolved", value: 112, color: "#10b981" }, // emerald-500
  { name: "Closed", value: 45, color: "#6b7280" }, // gray-500
];
