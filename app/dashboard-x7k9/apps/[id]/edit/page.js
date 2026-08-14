"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";
import { useRouter, useParams } from "next/navigation";
import AppForm from "../../../../../lib/AppForm";
import Link from "next/link";

export default function EditAppPage() {
  const router = useRouter();
  const { id } = useParams();
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApp() {
      try {
        const snap = await getDoc(doc(db, "apps", id));
        if (!snap.exists()) {
          setError("App not found");
        } else {
          setAppData(snap.data());
        }
      } catch (err) {
        setError("Failed to load app: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadApp();
  }, [id]);

  async function handleUpdate(data) {
    await updateDoc(doc(db, "apps", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    router.push("/dashboard-x7k9");
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm mt-3">Loading app...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 animate-fade-in-up">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <span className="text-2xl">!</span>
        </div>
        <p className="text-red-400 text-lg font-semibold">{error}</p>
        <button
          onClick={() => router.push("/dashboard-x7k9")}
          className="mt-4 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors inline-flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard-x7k9" className="hover:text-gray-300 transition-colors">Dashboard</Link>
        <span className="text-gray-700">/</span>
        <span className="text-white font-medium">Edit App</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Edit: {appData.name}</h1>
        <p className="text-gray-500 text-sm mt-1">Update the app details below</p>
      </div>

      <AppForm initialData={appData} onSubmit={handleUpdate} submitLabel="Update App" />
    </div>
  );
}
