"use client";

import { useState, useRef } from "react";
import { APP_CATEGORIES } from "./constants";
import { generateSlug, formatFileSize } from "./utils";

/* ── Icons ── */
function UploadIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function CheckCircleIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ImageIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 003.75 21z" />
    </svg>
  );
}

export default function AppForm({ initialData, onSubmit, submitLabel = "Save App" }) {
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    packageName: initialData?.packageName || "",
    versionName: initialData?.versionName || "",
    versionCode: initialData?.versionCode || 1,
    category: initialData?.category || APP_CATEGORIES[0],
    sizeMb: initialData?.sizeMb || 0,
    description: initialData?.description || "",
    whatsNew: initialData?.whatsNew || "",
    apkUrl: initialData?.apkUrl || "",
    iconUrl: initialData?.iconUrl || "",
    featured: initialData?.featured || false,
    published: initialData?.published || false,
  });

  const [screenshots, setScreenshots] = useState(initialData?.screenshots || []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [iconUploading, setIconUploading] = useState(false);
  const [apkUploading, setApkUploading] = useState(false);
  const [apkProgress, setApkProgress] = useState(0);
  const [screenshotUploading, setScreenshotUploading] = useState(false);

  const iconRef = useRef(null);
  const apkRef = useRef(null);
  const screenshotRef = useRef(null);

  function handleNameChange(name) {
    setForm((prev) => ({
      ...prev,
      name,
      ...(!isEdit ? { slug: generateSlug(name) } : {}),
    }));
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  /**
   * Upload file to Cloudinary via signed upload.
   * 1. Get signature from our API route
   * 2. Upload directly to Cloudinary with progress tracking
   * Returns the public URL.
   */
  function uploadToCloudinary(file, slug, type, onProgress) {
    return new Promise(async (resolve, reject) => {
      try {
        // Step 1: Get signed params from our API
        const sigRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, type, fileName: file.name }),
        });

        if (!sigRes.ok) {
          const err = await sigRes.json();
          throw new Error(err.error || "Failed to get upload signature");
        }

        const { signature, timestamp, apiKey, cloudName, folder, publicId, resourceType } = await sigRes.json();

        // Step 2: Upload directly to Cloudinary with XHR for progress
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);
        formData.append("folder", folder);
        formData.append("public_id", publicId);
        formData.append("overwrite", "true");

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.secure_url);
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error?.message || "Upload failed"));
            } catch {
              reject(new Error("Upload failed"));
            }
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
        xhr.open("POST", uploadUrl);
        xhr.send(formData);
      } catch (err) {
        reject(err);
      }
    });
  }

  async function handleIconUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) { setError("Icon must be under 1MB"); return; }
    if (!/\.(png|webp)$/i.test(file.name)) { setError("Icon must be PNG or WebP"); return; }

    const slug = form.slug || "temp";
    setError("");
    setIconUploading(true);
    try {
      const url = await uploadToCloudinary(file, slug, "icon");
      handleChange("iconUrl", url);
    } catch (err) {
      setError("Icon upload failed: " + err.message);
    } finally {
      setIconUploading(false);
    }
  }

  async function handleApkUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 150 * 1024 * 1024) { setError("APK must be under 150MB"); return; }
    if (!/\.apk$/i.test(file.name)) { setError("File must be .apk"); return; }

    const slug = form.slug || "temp";
    setError("");
    setApkUploading(true);
    setApkProgress(0);
    try {
      const url = await uploadToCloudinary(file, slug, "apk", (pct) => setApkProgress(pct));
      handleChange("apkUrl", url);
      handleChange("sizeMb", parseFloat((file.size / (1024 * 1024)).toFixed(1)));
    } catch (err) {
      setError("APK upload failed: " + err.message);
    } finally {
      setApkUploading(false);
      setApkProgress(0);
    }
  }

  async function handleScreenshotUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const slug = form.slug || "temp";
    setError("");
    setScreenshotUploading(true);
    try {
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) { setError(`${file.name} exceeds 5MB limit, skipped`); continue; }
        if (!/\.(png|jpg|jpeg|webp)$/i.test(file.name)) { setError(`${file.name} is not a valid image, skipped`); continue; }
        const url = await uploadToCloudinary(file, slug, "screenshot");
        setScreenshots((prev) => [...prev, url]);
      }
    } catch (err) {
      setError("Screenshot upload failed: " + err.message);
    } finally {
      setScreenshotUploading(false);
      if (screenshotRef.current) screenshotRef.current.value = "";
    }
  }

  function removeScreenshot(index) {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("App name is required");
    if (!form.slug.trim()) return setError("Slug is required");
    if (!form.packageName.trim()) return setError("Package name is required");
    if (!form.apkUrl.trim()) return setError("Upload an APK file");
    if (!form.iconUrl.trim()) return setError("Upload an icon");

    setSubmitting(true);
    try {
      await onSubmit({ ...form, screenshots });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-down">
          <span className="font-bold">!</span>
          {error}
        </div>
      )}

      {/* ── Section: Basic Info ── */}
      <FormSection title="Basic Information" description="App name, slug, and package details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="App Name" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My Cool App"
              required
              className="form-input"
            />
          </Field>
          <Field label="Slug" required>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="my-cool-app"
              required
              className="form-input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Package Name" required>
            <input
              type="text"
              value={form.packageName}
              onChange={(e) => handleChange("packageName", e.target.value)}
              placeholder="com.example.myapp"
              required
              className="form-input"
            />
          </Field>
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="form-input"
            >
              {APP_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </Field>
        </div>
      </FormSection>

      {/* ── Section: Version ── */}
      <FormSection title="Version Details" description="Version info and app size">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Version Name">
            <input
              type="text"
              value={form.versionName}
              onChange={(e) => handleChange("versionName", e.target.value)}
              placeholder="1.0.0"
              className="form-input"
            />
          </Field>
          <Field label="Version Code">
            <input
              type="number"
              value={form.versionCode}
              onChange={(e) => handleChange("versionCode", parseInt(e.target.value) || 1)}
              min={1}
              className="form-input"
            />
          </Field>
          <Field label="Size (MB)" hint="Auto-filled from APK">
            <input
              type="number"
              value={form.sizeMb}
              onChange={(e) => handleChange("sizeMb", parseFloat(e.target.value) || 0)}
              min={0}
              step="0.1"
              className="form-input"
            />
          </Field>
        </div>
      </FormSection>

      {/* ── Section: Content ── */}
      <FormSection title="Content" description="App description and changelog">
        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            placeholder="What does this app do?"
            className="form-input resize-none"
          />
        </Field>
        <Field label="What's New">
          <textarea
            value={form.whatsNew}
            onChange={(e) => handleChange("whatsNew", e.target.value)}
            rows={3}
            placeholder="Changelog for this version..."
            className="form-input resize-none"
          />
        </Field>
      </FormSection>

      {/* ── Section: Media Uploads ── */}
      <FormSection title="Media" description="App icon, APK file, and screenshots">
        {/* Icon Upload */}
        <Field label="App Icon" required hint="PNG or WebP, max 1MB">
          <div className="flex items-center gap-4">
            {form.iconUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.iconUrl}
                  alt="Icon preview"
                  className="w-16 h-16 rounded-2xl object-cover bg-gray-800 shadow-md"
                />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-600" />
              </div>
            )}
            <div>
              <button
                type="button"
                onClick={() => iconRef.current?.click()}
                disabled={iconUploading}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
              >
                <UploadIcon className="w-4 h-4" />
                {iconUploading ? "Uploading..." : form.iconUrl ? "Change Icon" : "Upload Icon"}
              </button>
              <input ref={iconRef} type="file" accept=".png,.webp" onChange={handleIconUpload} className="hidden" />
            </div>
          </div>
        </Field>

        {/* APK Upload */}
        <Field label="APK File" required hint=".apk file, max 150MB">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => apkRef.current?.click()}
                disabled={apkUploading}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
              >
                <UploadIcon className="w-4 h-4" />
                {apkUploading ? "Uploading..." : form.apkUrl ? "Replace APK" : "Upload APK"}
              </button>
              <input ref={apkRef} type="file" accept=".apk" onChange={handleApkUpload} className="hidden" />
              {form.apkUrl && !apkUploading && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Uploaded ({form.sizeMb} MB)</span>
                </div>
              )}
            </div>
            {apkUploading && (
              <div className="space-y-1.5">
                <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${apkProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">{apkProgress}% uploaded</p>
              </div>
            )}
          </div>
        </Field>

        {/* Screenshots Upload */}
        <Field label="Screenshots" hint="PNG/JPG/WebP, max 5MB each">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => screenshotRef.current?.click()}
              disabled={screenshotUploading}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4" />
              {screenshotUploading ? "Uploading..." : "Add Screenshots"}
            </button>
            <input
              ref={screenshotRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              multiple
              onChange={handleScreenshotUpload}
              className="hidden"
            />
            {screenshots.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {screenshots.map((url, i) => (
                  <div key={i} className="relative group flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Screenshot ${i + 1}`}
                      className="w-20 h-36 object-cover rounded-xl bg-gray-800 border border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Field>
      </FormSection>

      {/* ── Section: Publishing ── */}
      <FormSection title="Publishing" description="Visibility and feature settings">
        <div className="flex items-center gap-8">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => handleChange("featured", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-700 rounded-full peer-checked:bg-amber-500 transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow" />
            </div>
            <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">Featured</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => handleChange("published", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-700 rounded-full peer-checked:bg-emerald-500 transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow" />
            </div>
            <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">Published</span>
          </label>
        </div>
      </FormSection>

      {/* ── Submit Button ── */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting || apkUploading || iconUploading}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 text-sm"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}

/* ── Sub-components ── */
function FormSection({ title, description, children }) {
  return (
    <div className="bg-[#111827] rounded-2xl border border-gray-800/50 p-6 space-y-5">
      <div className="border-b border-gray-800/50 pb-4">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-600 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}
