"use client";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useRouter } from "next/navigation";
import AppForm from "../../../../lib/AppForm";
import Link from "next/link";

export default function NewAppPage() {
  const router = useRouter();

  async function handleCreate(data) {
    await addDoc(collection(db, "apps"), {
      ...data,
      downloads: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    router.push("/dashboard-x7k9");
  }

  return (
    <div className="animate-fade-in-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard-x7k9" className="hover:text-gray-300 transition-colors">Dashboard</Link>
        <span className="text-gray-700">/</span>
        <span className="text-white font-medium">Add New App</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Add New App</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details below to add a new app to the store</p>
      </div>

      <AppForm onSubmit={handleCreate} submitLabel="Create App" />
    </div>
  );
}
