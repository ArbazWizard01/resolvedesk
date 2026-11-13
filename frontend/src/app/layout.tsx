import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import AntdProvider from "@/components/providers/antd-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description =
  "Customer support ticketing software with role-based access for customers, agents and admins, ticket comments, activity history and a live dashboard.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ResolveDesk | Customer Support Ticketing Software",
    template: "%s | ResolveDesk",
  },
  description,
  applicationName: "ResolveDesk",
  authors: [{ name: "Arbaz Ansari" }],
  creator: "Arbaz Ansari",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "ResolveDesk",
    title: "ResolveDesk | Customer Support Ticketing Software",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "ResolveDesk | Customer Support Ticketing Software",
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-600 selection:text-white`}
      >
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  );
}
  