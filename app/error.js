"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  // Detect specific Firebase errors
  const isOffline = error?.message?.includes("Failed to get document")
    || error?.message?.includes("client is offline")
    || error?.code === "unavailable";

  const isPermission = error?.code === "permission-denied"
    || error?.message?.includes("Missing or insufficient permissions");

  const isQuota = error?.code === "resource-exhausted"
    || error?.message?.includes("Quota exceeded");

  let title = "Something went wrong";
  let description = "An unexpected error occurred. Please try again.";
  let icon = "⚠️";

  if (isOffline) {
    title = "You're offline";
    description = "Check your internet connection and try again.";
    icon = "📡";
  } else if (isPermission) {
    title = "Access denied";
    description = "You don't have permission to access this resource.";
    icon = "🔒";
  } else if (isQuota) {
    title = "Service temporarily unavailable";
    description = "The app is experiencing high traffic. Please try again in a few minutes.";
    icon = "⏳";
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center animate-fade-in-up max-w-sm">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <span className="text-3xl">{icon}</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{description}</p>

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Go Home
          </a>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 text-left bg-gray-100 dark:bg-gray-900 rounded-xl p-4">
            <summary className="text-xs text-gray-500 cursor-pointer">Error details</summary>
            <pre className="text-xs text-red-400 mt-2 overflow-auto whitespace-pre-wrap">
              {error?.message}
              {"\n"}
              {error?.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
