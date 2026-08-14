"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { collection, getDocs, query, where, doc, updateDoc, increment } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "../lib/firebase";
import { APP_CATEGORIES } from "../lib/constants";
import Link from "next/link";

/* ── SVG Icons (inline to avoid extra deps) ── */
function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
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

function FireIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
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

/* ── Category Icons Map ── */
const CATEGORY_ICONS = {
  Communication: "💬",
  Education: "📚",
  Entertainment: "🎬",
  Finance: "💰",
  Games: "🎮",
  "Health & Fitness": "💪",
  "Music & Audio": "🎵",
  Photography: "📸",
  Productivity: "⚡",
  Social: "👥",
  Tools: "🔧",
  Travel: "✈️",
};

/* ── Skeleton loader ── */
function AppCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-2xl skeleton-shimmer flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-3/4 skeleton-shimmer rounded" />
          <div className="h-3 w-1/2 skeleton-shimmer rounded" />
          <div className="h-3 w-1/3 skeleton-shimmer rounded" />
        </div>
      </div>
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="min-w-[300px] sm:min-w-[340px] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
      <div className="h-40 skeleton-shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 skeleton-shimmer rounded" />
        <div className="h-3 w-1/2 skeleton-shimmer rounded" />
      </div>
    </div>
  );
}

/* ── Increment download + trigger APK download ── */
async function trackAndDownload(app) {
  try {
    await updateDoc(doc(db, "apps", app.id), {
      downloads: increment(1),
    });
  } catch {
    // Non-critical — still allow download
  }
  if (app.apkUrl) {
    const a = document.createElement("a");
    a.href = app.apkUrl;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

/* ── App Card Component ── */
function AppCard({ app, index }) {
  return (
    <Link
      href={`/app/${app.slug || app.id}`}
      className="app-card bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 animate-fade-in-up block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3">
        {/* App Icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={app.iconUrl || app.icon || "/assets/placeholder-icon.svg"}
          alt={app.name}
          className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 bg-gray-100 dark:bg-gray-800 shadow-sm"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {app.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {app.category || "App"}
          </p>

          {/* Rating + Size */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-0.5">
              <StarIcon filled className="w-3 h-3 text-amber-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {app.rating || "4.5"}
              </span>
            </div>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {app.sizeMb ? `${app.sizeMb} MB` : "—"}
            </span>
          </div>

          {/* Install button */}
          <div className="mt-2.5">
            <span
              className="install-btn inline-flex items-center gap-1.5 text-white text-xs font-semibold px-4 py-1.5 rounded-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                trackAndDownload(app);
              }}
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              Install
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Featured App Card ── */
function FeaturedCard({ app, index }) {
  return (
    <Link
      href={`/app/${app.slug || app.id}`}
      className="min-w-[300px] sm:min-w-[340px] app-card bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-fade-in-up flex-shrink-0 block"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Banner area with gradient */}
      <div className="h-36 relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={app.iconUrl || app.icon || "/assets/placeholder-icon.svg"}
          alt={app.name}
          className="w-20 h-20 rounded-3xl object-cover shadow-lg border-2 border-white/20"
        />
        {app.featured && (
          <div className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <FireIcon className="w-3 h-3" />
            Featured
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white truncate">{app.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{app.category || "App"}</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                filled={star <= Math.round(app.rating || 4.5)}
                className={`w-3.5 h-3.5 ${star <= Math.round(app.rating || 4.5) ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">{app.rating || "4.5"}</span>
          </div>

          <span
            className="install-btn text-white text-xs font-semibold px-4 py-1.5 rounded-full"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              trackAndDownload(app);
            }}
          >
            Install
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Main Page ── */
export default function Home() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const router = useRouter();
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);

  const handleLogoTap = useCallback(() => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      router.push("/dashboard-x7k9");
      return;
    }
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 800);
  }, [router]);

  useEffect(() => {
    async function loadApps() {
      try {
        const q = query(
          collection(db, "apps"),
          where("published", "==", true)
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setApps(list);
      } catch (err) {
        console.error("Error loading apps:", err);
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, []);

  /* Derived data */
  const featuredApps = useMemo(() => apps.filter((a) => a.featured), [apps]);

  const filteredApps = useMemo(() => {
    let result = apps;
    if (activeCategory !== "All") {
      result = result.filter((a) => a.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name?.toLowerCase().includes(q) ||
          a.category?.toLowerCase().includes(q) ||
          a.packageName?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [apps, activeCategory, searchQuery]);

  const categories = useMemo(() => {
    const used = new Set(apps.map((a) => a.category).filter(Boolean));
    return ["All", ...APP_CATEGORIES.filter((c) => used.has(c))];
  }, [apps]);

  const totalDownloads = useMemo(
    () => apps.reduce((sum, a) => sum + (a.downloads || 0), 0),
    [apps]
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0b1120]">
      {/* ── Header / Navbar ── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/applogo.png"
                alt="ApkVault"
                className="w-9 h-9 rounded-xl shadow-lg shadow-blue-500/20 object-cover cursor-pointer select-none"
                onClick={handleLogoTap}
                draggable={false}
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  ApkVault
                </h1>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 -mt-0.5 leading-tight">
                  {apps.length} apps available
                </p>
              </div>
            </div>

            {/* Search bar (desktop) */}
            <div className="hidden sm:block flex-1 max-w-md mx-8">
              <div className="search-bar relative bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search apps..."
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none rounded-full"
                />
              </div>
            </div>

            {/* Right nav — intentionally empty, admin route is hidden */}
            <div className="flex items-center gap-3" />
          </div>
        </div>
      </header>

      {/* ── Mobile search ── */}
      <div className="sm:hidden px-4 pt-4">
        <div className="search-bar relative bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps..."
            className="w-full pl-10 pr-4 py-3 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none rounded-full"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* ── Hero Section ── */}
        <section className="mt-6 sm:mt-8 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-6 sm:p-10 text-white relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Discover Amazing Apps
            </h2>
            <p className="text-blue-100 mt-2 text-sm sm:text-base max-w-lg">
              Explore and download the best Android applications. Fast, safe, and always up to date.
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-6 mt-6">
              <div>
                <p className="text-2xl sm:text-3xl font-bold">{apps.length}</p>
                <p className="text-blue-200 text-xs">Total Apps</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-2xl sm:text-3xl font-bold">{totalDownloads.toLocaleString()}</p>
                <p className="text-blue-200 text-xs">Downloads</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-2xl sm:text-3xl font-bold">{categories.length - 1}</p>
                <p className="text-blue-200 text-xs">Categories</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Category Chips ── */}
        <section className="mt-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-chip flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                }`}
              >
                {cat !== "All" && (
                  <span className="mr-1.5">{CATEGORY_ICONS[cat] || "📱"}</span>
                )}
                {cat}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          /* ── Loading skeletons ── */
          <div className="mt-8 space-y-10">
            {/* Featured skeleton */}
            <div>
              <div className="h-5 w-32 skeleton-shimmer rounded mb-4" />
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3].map((i) => <FeaturedSkeleton key={i} />)}
              </div>
            </div>
            {/* Grid skeleton */}
            <div>
              <div className="h-5 w-24 skeleton-shimmer rounded mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => <AppCardSkeleton key={i} />)}
              </div>
            </div>
          </div>
        ) : apps.length === 0 ? (
          /* ── Empty state ── */
          <div className="text-center py-24 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <GridIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No apps yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Check back soon for new apps!</p>
          </div>
        ) : (
          <div className="space-y-10 mt-8">
            {/* ── Featured Section (horizontal scroll) ── */}
            {featuredApps.length > 0 && activeCategory === "All" && !searchQuery && (
              <section className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FireIcon className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Featured Apps</h2>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 screenshot-scroll">
                  {featuredApps.map((app, i) => (
                    <FeaturedCard key={app.id} app={app} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* ── All Apps Grid ── */}
            <section className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {activeCategory === "All"
                    ? searchQuery
                      ? `Results for "${searchQuery}"`
                      : "All Apps"
                    : activeCategory}
                </h2>
                <span className="text-sm text-gray-400">{filteredApps.length} apps</span>
              </div>

              {filteredApps.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <SearchIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No apps found</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try a different search or category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredApps.map((app, i) => (
                    <AppCard key={app.id} app={app} index={i} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-8 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/applogo.png" alt="ApkVault" className="w-7 h-7 rounded-lg object-cover" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">ApkVault</span>
            </div>
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} ApkVault. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
