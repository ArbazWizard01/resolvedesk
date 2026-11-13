export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export interface TicketUser {
  id: string;
  name: string;
  email: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy: TicketUser;
  assignedToId: string | null;
  assignedTo: TicketUser | null;
}

export interface PaginatedTicketsResponse {
  items: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
