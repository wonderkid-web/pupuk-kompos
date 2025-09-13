import { NextResponse } from "next/server";
import { minioClient } from "@/lib/minio";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contentType, name } = await req.json().catch(() => ({}));
  if (!contentType) {
    return NextResponse.json({ error: "contentType required" }, { status: 400 });
  }

  const bucket = process.env.MINIO_BUCKET_NAME || "audit";
  const prefix = "audit";
  const base = name ? slugify(String(name)) : "file";
  const ext = contentType && typeof contentType === "string" && contentType.includes("/")
    ? `.${contentType.split("/").pop()}`
    : "";
  const objectName = `${prefix}/${base}-${Date.now()}${ext}`;

  try {
    const exists = await minioClient.bucketExists(bucket);

    const url = await minioClient.presignedUrl("PUT", bucket, objectName, 3600);
    console.log(url)
    return NextResponse.json({ url, objectName });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

