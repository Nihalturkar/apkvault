"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, updateDoc, increment, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../lib/AuthContext";
import { useParams } from "next/navigation";
import Link from "next/link";

/* ── SVG Icons ── */
function ArrowLeftIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function DownloadIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function StarIcon({ filled, className }) {
  return filled ? (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ) : (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function ShareIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
  );
}

function ShieldIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TagIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  );
}

function GridIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

export default function AppDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [app, setApp] = useState(null);
  const [similarApps, setSimilarApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  useEffect(() => {
    async function loadApp() {
      try {
        // Try by slug first, then by id
        let q = query(
          collection(db, "apps"),
          where("slug", "==", slug),
          where("published", "==", true)
        );
        let snapshot = await getDocs(q);

        if (snapshot.empty) {
          // Fallback: try by doc ID
          q = query(collection(db, "apps"), where("published", "==", true));
          snapshot = await getDocs(q);
          const found = snapshot.docs.find((d) => d.id === slug);
          if (found) {
            setApp({ id: found.id, ...found.data() });
          } else {
            setError("App not found");
          }
        } else {
          const d = snapshot.docs[0];
          setApp({ id: d.id, ...d.data() });
        }
      } catch (err) {
        setError("Failed to load app: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadApp();
  }, [slug]);

  // Fetch similar apps once main app is loaded
  useEffect(() => {
    if (!app) return;
    async function loadSimilar() {
      try {
        // 1. Same category apps (primary suggestions)
        const catQuery = query(
          collection(db, "apps"),
          where("published", "==", true),
          where("category", "==", app.category)
        );
        const catSnap = await getDocs(catQuery);
        let candidates = catSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((a) => a.id !== app.id);

        // 2. If not enough same-category apps, fill with other published apps
        if (candidates.length < 6) {
          const allQuery = query(
            collection(db, "apps"),
            where("published", "==", true)
          );
          const allSnap = await getDocs(allQuery);
          const existing = new Set(candidates.map((a) => a.id));
          existing.add(app.id);
          const others = allSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((a) => !existing.has(a.id));
          candidates = [...candidates, ...others];
        }

        // Sort by downloads (most popular first), take max 8
        candidates.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        setSimilarApps(candidates.slice(0, 8));
      } catch {
        // Non-critical
      }
    }
    loadSimilar();
  }, [app]);

  async function handleDownload() {
    if (!app?.apkUrl) return;
    setDownloading(true);
    try {
      const appRef = doc(db, "apps", app.id);

      if (user) {
        // Deduplicate: check if this user already downloaded this app
        const dlId = `${app.id}_${user.uid}`;
        const dlRef = doc(db, "downloads", dlId);
        const dlSnap = await getDoc(dlRef);

        if (!dlSnap.exists()) {
          // First download — create record + increment counter
          await setDoc(dlRef, {
            appId: app.id,
            uid: user.uid,
            downloadedAt: serverTimestamp(),
          });
          await updateDoc(appRef, { downloads: increment(1) });
          setApp((prev) => ({ ...prev, downloads: (prev.downloads || 0) + 1 }));
        }
        // Already downloaded → skip counter, still deliver file
      } else {
        // Anonymous user — localStorage based dedupe (best effort)
        const dlKey = `dl_${app.id}`;
        if (!localStorage.getItem(dlKey)) {
          await updateDoc(appRef, { downloads: increment(1) });
          setApp((prev) => ({ ...prev, downloads: (prev.downloads || 0) + 1 }));
          localStorage.setItem(dlKey, Date.now().toString());
        }
      }
    } catch {
      // Non-critical — still allow download
    }
    // Trigger file download
    const a = document.createElement("a");
    a.href = app.apkUrl;
    a.download = `${app.slug || app.name || "app"}.apk`;
    a.setAttribute("type", "application/vnd.android.package-archive");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloading(false), 2000);
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: app.name,
        text: `Check out ${app.name} on ApkVault`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  }

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#0b1120]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="h-6 w-20 skeleton-shimmer rounded mb-6" />
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800">
            <div className="flex items-start gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl skeleton-shimmer" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-48 skeleton-shimmer rounded" />
                <div className="h-4 w-32 skeleton-shimmer rounded" />
                <div className="h-4 w-24 skeleton-shimmer rounded" />
                <div className="h-10 w-36 skeleton-shimmer rounded-full mt-4" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ── Error ── */
  if (error || !app) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#0b1120] flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
            <span className="text-3xl">😕</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{error || "App not found"}</h2>
          <p className="text-gray-500 text-sm mt-2">This app may have been removed or is unavailable.</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </main>
    );
  }

  const descriptionLines = app.description?.split("\n") || [];
  const isLongDesc = app.description?.length > 300;
  const rating = app.rating || 4.5;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0b1120]">
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Store</span>
          </Link>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/applogo.png" alt="ApkVault" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-sm font-bold text-gray-900 dark:text-white">ApkVault</span>
          </div>
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Share"
          >
            <ShareIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in-up">

        {/* ── App Header Card ── */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Icon */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={app.iconUrl || app.icon || "/assets/placeholder-icon.svg"}
              alt={app.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover shadow-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{app.name}</h1>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">{app.packageName || app.category}</p>

              {/* Rating row */}
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      filled={star <= Math.round(rating)}
                      className={`w-4 h-4 ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
                    />
                  ))}
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{rating}</span>
                </div>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span className="text-sm text-gray-500">{(app.downloads || 0).toLocaleString()} downloads</span>
                {app.sizeMb > 0 && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span className="text-sm text-gray-500">{app.sizeMb} MB</span>
                  </>
                )}
              </div>

              {/* Install + Share */}
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="install-btn flex items-center gap-2 text-white font-semibold px-8 py-3 rounded-full text-sm disabled:opacity-70"
                >
                  <DownloadIcon className="w-4 h-4" />
                  {downloading ? "Downloading..." : "Install APK"}
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Share"
                >
                  <ShareIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Info Pills ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InfoPill icon={<TagIcon className="w-5 h-5" />} label="Version" value={`v${app.versionName || app.version || "1.0"}`} />
          <InfoPill icon={<ShieldIcon className="w-5 h-5" />} label="Safety" value="Verified" />
          <InfoPill
            icon={<ClockIcon className="w-5 h-5" />}
            label="Updated"
            value={app.updatedAt?.toDate ? app.updatedAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
          />
          <InfoPill icon={<DownloadIcon className="w-5 h-5" />} label="Size" value={app.sizeMb ? `${app.sizeMb} MB` : "—"} />
        </div>

        {/* ── Screenshots ── */}
        {app.screenshots?.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Screenshots</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 screenshot-scroll">
              {app.screenshots.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedScreenshot(url)}
                  className="flex-shrink-0 rounded-2xl overflow-hidden border-2 border-transparent hover:border-blue-400 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Screenshot ${i + 1}`}
                    className="h-64 sm:h-80 w-auto object-cover rounded-2xl bg-gray-100 dark:bg-gray-800"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Description ── */}
        {app.description && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About this app</h2>
            <div className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line ${!showFullDesc && isLongDesc ? "line-clamp-5" : ""}`}>
              {app.description}
            </div>
            {isLongDesc && (
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-3 hover:underline"
              >
                {showFullDesc ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {/* ── What's New ── */}
        {app.whatsNew && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">What&apos;s New</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
              {app.whatsNew}
            </div>
          </div>
        )}

        {/* ── App Details ── */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">App Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            <DetailRow label="Package Name" value={app.packageName || "—"} />
            <DetailRow label="Category" value={app.category || "—"} />
            <DetailRow label="Version" value={app.versionName || app.version || "—"} />
            <DetailRow label="Version Code" value={app.versionCode || "—"} />
            <DetailRow label="Size" value={app.sizeMb ? `${app.sizeMb} MB` : "—"} />
            <DetailRow label="Downloads" value={(app.downloads || 0).toLocaleString()} />
          </div>
        </div>

        {/* ── Similar Apps ── */}
        {similarApps.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Similar Apps</h2>
              <span className="text-xs text-gray-400">{app.category}</span>
            </div>

            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex gap-4 overflow-x-auto pb-2 screenshot-scroll sm:grid sm:grid-cols-4 sm:overflow-visible">
              {similarApps.map((item) => (
                <Link
                  key={item.id}
                  href={`/app/${item.slug || item.id}`}
                  className="flex-shrink-0 w-[140px] sm:w-auto app-card group block"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.iconUrl || item.icon || "/assets/placeholder-icon.svg"}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover bg-gray-100 dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-shadow"
                    />
                    <h4 className="text-sm font-medium text-gray-800 dark:text-white mt-2 truncate w-full">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5 truncate w-full">
                      {item.category || "App"}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <StarIcon filled className="w-3 h-3 text-amber-400" />
                      <span className="text-xs text-gray-500">{item.rating || "4.5"}</span>
                      <span className="text-gray-300 dark:text-gray-600 mx-0.5">·</span>
                      <span className="text-xs text-gray-400">{item.sizeMb ? `${item.sizeMb} MB` : "Free"}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Install CTA ── */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8 text-white text-center">
          <h3 className="text-xl font-bold">Ready to install?</h3>
          <p className="text-blue-100 text-sm mt-1">Download and install {app.name} on your Android device</p>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="mt-4 inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors text-sm disabled:opacity-70"
          >
            <DownloadIcon className="w-4 h-4" />
            {downloading ? "Downloading..." : "Download APK"}
          </button>
        </div>
      </div>

      {/* ── Screenshot Lightbox ── */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedScreenshot(null)}
        >
          <button
            onClick={() => setSelectedScreenshot(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            &times;
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedScreenshot}
            alt="Screenshot"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-8 mt-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/applogo.png" alt="ApkVault" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">ApkVault</span>
          </div>
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} ApkVault. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

/* ── Sub-components ── */
function InfoPill({ icon, label, value }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center shadow-sm">
      <div className="text-blue-500 mx-auto flex justify-center mb-1.5">{icon}</div>
      <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-white mt-0.5">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</span>
    </div>
  );
}
