"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import Link from "next/link";

/* ── Icons ── */
function AppsIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function PublishIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  );
}

function DownloadIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function PencilIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function EyeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeOffIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

export default function AdminDashboard() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadApps() {
    try {
      const q = query(collection(db, "apps"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setApps(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setError("Failed to load apps: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApps();
  }, []);

  async function handleDelete(appId, appName) {
    if (!confirm(`Delete "${appName}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "apps", appId));
      setApps((prev) => prev.filter((a) => a.id !== appId));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  }

  async function handleTogglePublish(appId, currentlyPublished) {
    try {
      await updateDoc(doc(db, "apps", appId), {
        published: !currentlyPublished,
      });
      setApps((prev) =>
        prev.map((a) =>
          a.id === appId ? { ...a, published: !currentlyPublished } : a
        )
      );
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  }

  const totalApps = apps.length;
  const publishedApps = apps.filter((a) => a.published).length;
  const totalDownloads = apps.reduce((sum, a) => sum + (a.downloads || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#111827] rounded-2xl p-6 border border-gray-800/50 animate-pulse">
              <div className="h-4 w-20 bg-gray-800 rounded mb-3" />
              <div className="h-8 w-16 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-[#111827] rounded-2xl border border-gray-800/50 p-6 space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl text-sm flex items-center gap-3">
          <span className="text-lg">!</span>
          {error}
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<AppsIcon className="w-6 h-6" />}
          label="Total Apps"
          value={totalApps}
          color="blue"
        />
        <StatCard
          icon={<PublishIcon className="w-6 h-6" />}
          label="Published"
          value={publishedApps}
          color="green"
        />
        <StatCard
          icon={<DownloadIcon className="w-6 h-6" />}
          label="Total Downloads"
          value={totalDownloads.toLocaleString()}
          color="purple"
        />
      </div>

      {/* ── App List ── */}
      <div className="bg-[#111827] rounded-2xl border border-gray-800/50 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">All Apps</h2>
            <p className="text-xs text-gray-500 mt-0.5">{totalApps} apps total</p>
          </div>
          <Link
            href="/dashboard-x7k9/apps/new"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
          >
            <PlusIcon className="w-4 h-4" />
            Add App
          </Link>
        </div>

        {apps.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-800/50 flex items-center justify-center mb-4">
              <AppsIcon className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No apps yet</p>
            <p className="text-gray-600 text-sm mt-1">Click &quot;Add App&quot; to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {apps.map((app, index) => (
              <div
                key={app.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-800/30 transition-colors group animate-fade-in"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {/* Icon */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={app.iconUrl || app.icon || "/assets/placeholder-icon.svg"}
                  alt={app.name}
                  className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 bg-gray-800 shadow-md"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-white font-semibold truncate">{app.name}</h3>
                    <span
                      className={`badge ${
                        app.published
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {app.published ? "Live" : "Draft"}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm truncate mt-0.5">
                    {app.packageName || app.category || "—"}
                    <span className="mx-1.5 text-gray-700">·</span>
                    v{app.versionName || app.version || "?"}
                    <span className="mx-1.5 text-gray-700">·</span>
                    {(app.downloads || 0).toLocaleString()} downloads
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleTogglePublish(app.id, app.published)}
                    className={`p-2 rounded-xl transition-all ${
                      app.published
                        ? "text-amber-400 hover:bg-amber-500/10"
                        : "text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                    title={app.published ? "Unpublish" : "Publish"}
                  >
                    {app.published ? (
                      <EyeOffIcon className="w-4.5 h-4.5" />
                    ) : (
                      <EyeIcon className="w-4.5 h-4.5" />
                    )}
                  </button>
                  <Link
                    href={`/dashboard-x7k9/apps/${app.id}/edit`}
                    className="p-2 rounded-xl text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    title="Edit"
                  >
                    <PencilIcon className="w-4.5 h-4.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(app.id, app.name)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete"
                  >
                    <TrashIcon className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorMap = {
    blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400",
    green: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    purple: "from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400",
  };
  const iconColorMap = {
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-emerald-500/10 text-emerald-400",
    purple: "bg-purple-500/10 text-purple-400",
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} bg-[#111827] rounded-2xl p-6 border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconColorMap[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
