import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a free ResolveDesk customer account to submit support tickets and track them until they are resolved.",
  alternates: { canonical: "/register" },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
