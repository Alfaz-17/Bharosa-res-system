"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", background: "#fff", padding: "24px", textAlign: "center" }}>
          <div style={{ border: "1px solid #fecaca", background: "#fef2f2", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h2 style={{ marginTop: "16px", fontSize: "20px", fontWeight: 700, color: "#111827" }}>
              Something went wrong
            </h2>
            <p style={{ marginTop: "8px", fontSize: "14px", color: "#6b7280", maxWidth: "400px" }}>
              A critical error occurred. Please refresh the page.
            </p>
            <button
              onClick={reset}
              style={{ marginTop: "24px", display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "12px", background: "#f97316", padding: "12px 24px", fontSize: "14px", fontWeight: 700, color: "#fff", border: "none", cursor: "pointer" }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
