
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "books"; // Default to books

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, "_");
    const filename = `${timestamp}-${originalName}`;
    
    // Determine upload directory based on type
    let subFolder;
    if (type === "avatar") {
      subFolder = "avatars";
    } else {
      subFolder = "books";
    }
    
    
    const uploadDir = join(process.cwd(), "public", "assets", subFolder);
    
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
     
    }
    
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);
    
    
    const url = `/assets/${subFolder}/${filename}`;
    
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}