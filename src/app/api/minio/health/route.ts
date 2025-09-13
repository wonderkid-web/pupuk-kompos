import { NextResponse } from "next/server";
import { minioClient } from "@/lib/minio";

export async function GET() {
  const bucket = process.env.MINIO_BUCKET_NAME || process.env.MINIO_BUCKET || "audit";
  try {
    const exists = await minioClient.bucketExists(bucket);
    return NextResponse.json({ ok: true, bucket, exists });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        bucket,
        error: err?.message || String(err),
        details: {
          endpoint: process.env.MINIO_ENDPOINT,
          port: process.env.MINIO_PORT,
          useSSL: process.env.MINIO_USESSL,
          region: process.env.MINIO_REGION,
        },
      },
      { status: 500 }
    );
  }
}

