import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl font-black text-gray-200 dark:text-gray-800">404</p>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mt-4">Page not found</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors"
        >
          Back to ApkVault
        </Link>
      </div>
    </div>
  );
}
