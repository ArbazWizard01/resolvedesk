<div align="center">

# ResolveDesk

### Customer support, organized around every ticket.

A full-stack support and ticketing application built with **Next.js, NestJS, PostgreSQL, and Prisma**.

![Next.js](https://img.shields.io/badge/Next.js-App_Router-000000?style=flat-square&logo=nextdotjs)
![NestJS](https://img.shields.io/badge/NestJS-REST_API-E0234E?style=flat-square&logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Status](https://img.shields.io/badge/Status-In_Development-6366f1?style=flat-square)

[Features](#features) · [Role permissions](#role-permissions) · [Local setup](#local-setup) · [Roadmap](#roadmap)

</div>

---

## Overview

ResolveDesk brings customers, support agents, and administrators into one ticket workflow. Customers submit requests and follow their progress, agents handle assigned work, and administrators manage assignments and oversee the support queue.

The interface takes inspiration from Linear and Zendesk, with role-aware navigation, ticket discussions, activity timelines, and persistent in-app notifications. The application separates a Next.js frontend from a NestJS REST API backed by PostgreSQL.

## Features

### Authentication and access control

- JWT authentication with protected API routes.
- Admin, Agent, and Customer roles enforced through backend guards and service-level visibility rules.
- Navigation tailored to each role.
- Customers can access their own tickets; agents can access assigned tickets and the unassigned queue; admins oversee the support desk.

### Ticket management

- Create tickets with a title, description, and priority.
- Track the lifecycle: `OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`.
- Classify requests as `LOW`, `MEDIUM`, or `HIGH` priority.
- Assign and reassign tickets to agents.
- Filter ticket lists by status and priority, with pagination.
- Restrict agent status updates to tickets assigned to that agent.

> The lifecycle above describes the workflow; it does not imply that every status transition is restricted to that exact sequence.

### Discussions and activity history

- Ticket comments with visual distinctions between customer and staff messages.
- Chronological activity records for ticket creation, comments, status updates, and assignments.
- Ticket access checks before reading or posting comments.

### Role-based notifications

- Persistent notifications and read states stored in PostgreSQL.
- Unread badge, individual read handling, and **Mark all as read**.
- Clicking a notification opens the associated ticket.
- Automatic refresh every 15 seconds while the page is visible, plus refresh on window focus and opening the notification panel.
- Notification recipients are deduplicated, and the person performing an action is excluded.
- Repeating an unchanged status or assignment sequentially does not generate another alert.

| Event                                     | Recipients, excluding the person performing the action |
| ----------------------------------------- | ------------------------------------------------------ |
| New ticket created                        | Admins                                                 |
| Agent assigned or reassigned              | Customer and newly assigned agent                      |
| Customer comments on an assigned ticket   | Assigned agent                                         |
| Customer comments on an unassigned ticket | Admins                                                 |
| Agent or Admin comments                   | Customer and assigned agent                            |
| Ticket status changes                     | Customer and assigned agent                            |
| Ticket becomes Resolved or Closed         | Customer, assigned agent, and admins                   |

Notifications currently use **polling**, rather than WebSockets. Delivery is in-app; email and browser push are not implemented.

### Responsive interface

- Responsive dashboard cards, navigation, and ticket views.
- Collapsible sidebar on smaller screens.
- Notification popover on larger screens and a full-width bottom drawer on mobile.
- Fixed-size notification icons and scrollable notification content.

### Dashboard and reporting

- API-backed counts for total tickets, unassigned tickets, status distribution, and priority distribution.
- Role-aware ticket visibility for support summaries.
- Analytics and account-settings screens are available, with further functional improvements planned below.

> Some existing dashboard and analytics cards still contain placeholder response-time, SLA, or percentage values. These should not be interpreted as measured performance. Replacing them with calculated reports is part of the roadmap.

## Role permissions

| Capability                    | Customer           | Agent                            | Admin                           |
| ----------------------------- | ------------------ | -------------------------------- | ------------------------------- |
| Create a ticket               | Yes                | Yes                              | Yes                             |
| View tickets                  | Own tickets        | Assigned and unassigned tickets  | All tickets in the support desk |
| Comment on accessible tickets | Yes                | Yes                              | Yes                             |
| Change ticket status          | No                 | Assigned tickets only            | Yes                             |
| Assign or reassign agents     | No                 | No                               | Yes                             |
| Manage user roles             | No                 | No                               | Yes                             |
| Receive in-app notifications  | Own ticket updates | Relevant assigned-ticket updates | Support-desk events             |

UI visibility complements backend authorization; hiding a navigation link is not the access-control boundary.

## Tech stack

| Layer                  | Technologies                           |
| ---------------------- | -------------------------------------- |
| Frontend               | Next.js App Router, React, TypeScript  |
| Styling and components | Tailwind CSS, Ant Design, Lucide React |
| API client             | Axios                                  |
| Backend                | NestJS, TypeScript                     |
| Database               | PostgreSQL                             |
| ORM and migrations     | Prisma                                 |
| Authentication         | Passport JWT strategy, NestJS guards   |

## Project structure

```text
resolvedesk/
├── backend/        # NestJS REST API, authentication, tickets, comments, notifications
│   ├── prisma/     # Database schema and migrations
│   └── src/        # Controllers, services, modules, DTOs, and guards
└── frontend/       # Next.js application, dashboard, and shared UI
```

## Local setup

### Prerequisites

- Node.js compatible with the versions of Next.js and NestJS installed in the project.
- npm.
- A running PostgreSQL database, locally or through a hosted provider.

### 1. Clone the repository

```bash
git clone https://github.com/ArbazWizard01/resolvedesk.git
cd resolvedesk
```

### 2. Configure and start the backend

```bash
cd backend
npm install
```

Create `backend/.env` with your local values:

```dotenv
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/resolvedesk?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
```

Create the PostgreSQL database if necessary, then apply migrations and generate the Prisma Client:

```bash
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

The frontend setup below assumes the API listens on **http://localhost:4000**. Confirm the port in your backend bootstrap configuration and use the same value in the frontend environment file.

### 3. Configure and start the frontend

In a separate terminal, from the repository root:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

Start the frontend:

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

> Keep database credentials and JWT secrets on the backend. Do not commit environment files containing secrets. `NEXT_PUBLIC_API_URL` is intentionally exposed to the browser and must contain only the public API URL.

### 4. Try the ticket workflow

1. Register or sign in as a Customer and create a ticket.
2. Sign in with a configured Admin account and assign the ticket to an Agent.
3. Sign in as that Agent, reply, and update the status.
4. Check the Customer's notifications and ticket activity.
5. Reply as the Customer and confirm the Agent receives a notification.

Use separate browser profiles or private windows to test roles simultaneously. New users default to Customer; Admin/Agent accounts must be provisioned through a trusted setup or an existing administrator. Public registration should not let users choose privileged roles.

## Implementation notes

- Notifications are created alongside successful ticket actions using Prisma transactions or nested writes.
- Notification list and read endpoints are scoped to the authenticated recipient.
- Comments are currently public to users who can access the ticket; internal staff notes are not implemented.
- The current data model represents **one support desk**. Multi-organization tenancy and workspace isolation are not implemented yet.
- The project is in development; production readiness, security review, and load testing are not claimed.

## Roadmap

- [x] JWT authentication and role-based access control.
- [x] Ticket creation, status updates, priorities, and agent assignment.
- [x] Ticket comments and activity timelines.
- [x] Persistent notifications for Customers, Agents, and Admins.
- [x] Mobile notification drawer.
- [ ] Replace placeholder analytics with database-derived reporting.
- [ ] Add reporting periods, ticket-volume trends, and agent workload analysis.
- [ ] Save profile changes through the backend.
- [ ] Add editable, persistent notification preferences.
- [ ] Add secure password-change and recovery flows.
- [ ] Define SLA targets, business hours, and measurable compliance.
- [ ] Introduce workspaces, memberships, and tenant isolation.
- [ ] Add email notification delivery.
- [ ] Expand automated integration and end-to-end coverage.

## Author

**Arbaz Ansari**

- GitHub: [@ArbazWizard01](https://github.com/ArbazWizard01)
- LinkedIn: [Arbaz Ansari](https://www.linkedin.com/in/arbaz-ansari01/)

## License

MIT License.
