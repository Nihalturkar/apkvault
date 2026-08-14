import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * POST /api/upload
 * Accepts multipart form data with:
 *   - file: the file to upload
 *   - slug: app slug (used as folder name)
 *   - type: "icon" | "screenshot" | "apk"
 *
 * Saves to public/assets/apps/{slug}/{type-based-path}
 * Returns { url: "/assets/apps/..." }
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const slug = formData.get("slug");
    const type = formData.get("type"); // "icon" | "screenshot" | "apk"

    if (!file || !slug || !type) {
      return NextResponse.json(
        { error: "Missing file, slug, or type" },
        { status: 400 }
      );
    }

    // Validate slug (prevent path traversal)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Invalid slug format" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalName = file.name;
    const fileSize = buffer.length;

    // Validation per type
    if (type === "icon") {
      if (fileSize > 1 * 1024 * 1024) {
        return NextResponse.json({ error: "Icon must be under 1MB" }, { status: 400 });
      }
      if (!/\.(png|webp)$/i.test(originalName)) {
        return NextResponse.json({ error: "Icon must be PNG or WebP" }, { status: 400 });
      }
    } else if (type === "screenshot") {
      if (fileSize > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Screenshot must be under 5MB" }, { status: 400 });
      }
      if (!/\.(png|jpg|jpeg|webp)$/i.test(originalName)) {
        return NextResponse.json({ error: "Screenshot must be PNG, JPG, or WebP" }, { status: 400 });
      }
    } else if (type === "apk") {
      if (fileSize > 150 * 1024 * 1024) {
        return NextResponse.json({ error: "APK must be under 150MB" }, { status: 400 });
      }
      if (!/\.apk$/i.test(originalName)) {
        return NextResponse.json({ error: "File must be .apk" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Build save path
    const publicDir = path.join(process.cwd(), "public", "assets", "apps", slug);
    let savePath;
    let urlPath;

    if (type === "icon") {
      const ext = path.extname(originalName).toLowerCase();
      await mkdir(publicDir, { recursive: true });
      savePath = path.join(publicDir, `icon${ext}`);
      urlPath = `/assets/apps/${slug}/icon${ext}`;
    } else if (type === "screenshot") {
      const screenshotDir = path.join(publicDir, "screenshots");
      await mkdir(screenshotDir, { recursive: true });
      // Use timestamp to avoid name collisions
      const timestamp = Date.now();
      const ext = path.extname(originalName).toLowerCase();
      const fileName = `${timestamp}${ext}`;
      savePath = path.join(screenshotDir, fileName);
      urlPath = `/assets/apps/${slug}/screenshots/${fileName}`;
    } else if (type === "apk") {
      await mkdir(publicDir, { recursive: true });
      savePath = path.join(publicDir, `${slug}.apk`);
      urlPath = `/assets/apps/${slug}/${slug}.apk`;
    }

    await writeFile(savePath, buffer);

    return NextResponse.json({
      url: urlPath,
      size: fileSize,
      name: originalName,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed: " + err.message },
      { status: 500 }
    );
  }
}

// Body size limit configured in next.config.ts → serverActions.bodySizeLimit
