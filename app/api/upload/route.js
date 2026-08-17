import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/upload/
 * Generates a Cloudinary signed upload signature.
 * Client uploads directly to Cloudinary using this signature.
 *
 * Body: { slug, type, fileName }
 * Returns: { signature, timestamp, apiKey, cloudName, folder, publicId, resourceType }
 */
export async function POST(request) {
  try {
    const { slug, type, fileName } = await request.json();

    if (!slug || !type) {
      return NextResponse.json({ error: "Missing slug or type" }, { status: 400 });
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: "Invalid slug format" }, { status: 400 });
    }

    const timestamp = Math.round(Date.now() / 1000);
    let folder;
    let publicId;
    let resourceType = "image"; // default for icons/screenshots

    if (type === "icon") {
      folder = `apkvault/apps/${slug}`;
      publicId = "icon";
    } else if (type === "screenshot") {
      folder = `apkvault/apps/${slug}/screenshots`;
      publicId = `ss_${Date.now()}`;
    } else if (type === "apk") {
      folder = `apkvault/apps/${slug}`;
      publicId = `${slug}`;
      resourceType = "raw"; // APK files are raw/binary
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Generate signature for secure upload
    const paramsToSign = {
      timestamp,
      folder,
      public_id: publicId,
      overwrite: true,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      publicId,
      resourceType,
    });
  } catch (err) {
    console.error("Signature generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
