import Link from "next/link";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="64" height="64" rx="16" fill="#4F46E5" />
      {/* Chat bubble body */}
      <path
        d="M16 20C16 17.7909 17.7909 16 20 16H44C46.2091 16 48 17.7909 48 20V38C48 40.2091 46.2091 42 44 42H32L22 50V42H20C17.7909 42 16 40.2091 16 38V20Z"
        fill="#FFFFFF"
      />
      {/* Checkmark inside */}
      <path
        d="M25 30L30.5 35.5L40 25"
        stroke="#4F46E5"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      aria-label="ResolveDesk home"
      className={`inline-flex items-center gap-2.5 ${className}`}
    >
      <LogoMark className="w-9 h-9 shadow-sm rounded-xl" />
      <span className="text-xl font-bold tracking-tight text-slate-900">
        ResolveDesk
      </span>
    </Link>
  );
}
