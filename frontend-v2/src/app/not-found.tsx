import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <SearchX className="h-16 w-16 text-gray-300" />
      <h1 className="mt-6 text-4xl font-black text-gray-900">404</h1>
      <p className="mt-2 text-sm font-medium text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/staff/dashboard"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover transition-all active:scale-[0.98]"
      >
        <Home className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
