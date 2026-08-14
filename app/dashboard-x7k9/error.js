"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-sm animate-fade-in-up">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-lg font-bold text-white">Something went wrong</h2>
        <p className="text-gray-400 text-sm mt-2">{error?.message || "An unexpected error occurred"}</p>
        <button
          onClick={reset}
          className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
