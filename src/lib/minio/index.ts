import { Client } from "minio";

export const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT!,
    port: Number(process.env.MINIO_PORT!),
    useSSL: Boolean(process.env.MINIO_USESSL!),
    accessKey: process.env.MINIO_ACCESS_KEY!,
    secretKey: process.env.MINIO_SECRET_KEY!,
});

export async function getPresignedUrl(objectName: string, expiresInSeconds = 3600) {
  const bucket = process.env.MINIO_BUCKET_NAME || process.env.MINIO_BUCKET || "audit";
  return await minioClient.presignedGetObject(bucket, objectName);
}
