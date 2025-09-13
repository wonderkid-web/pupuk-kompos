"use server";

import { minioClient } from "@/lib/minio";
import mime from "mime-types";

// Upload a single file to MinIO and return { objectName, url }
export async function uploadFile(formData: FormData) {
    const file: File | null = formData.get("file") as unknown as File;
    if (!file) throw new Error("No file uploaded.");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const bucketName = "audit";
    const objectName = `${Date.now()}-${file.name}`;

    // Ensure bucket exists
    const exists = await minioClient.bucketExists(bucketName);

    if (!exists) {
        await minioClient.makeBucket(bucketName, process.env.MINIO_REGION || "us-east-1");
    }

    const contentType = (file.type && String(file.type)) || (mime.lookup(objectName) || "application/octet-stream");

    // Upload buffer
    await minioClient.putObject(bucketName, objectName, buffer, buffer.length, {
        "Content-Type": String(contentType),
    });

    const url = await minioClient.presignedUrl("GET", bucketName, objectName);

    return { objectName, url };
}



export async function listFiles() {
    const bucketName = process.env.MINIO_BUCKET_NAME || "test";


    const objectsList = [];
    const stream = minioClient.listObjectsV2(bucketName, "", true);

    // iterasi object stream
    for await (const obj of stream) {
        objectsList.push(obj);
    }

    // map semua object dan dapatkan presigned URL
    const presignedUrls = await Promise.all(
        objectsList.map(async (obj: any) => {
            const url = await minioClient.presignedGetObject(
                bucketName,
                obj.name!,
                24 * 60 * 60 // expired 1 hari
            );
            return { name: obj.name, url };
        })
    );

    return presignedUrls;
}

export async function deleteFile(id: string) {
    const bucketName = process.env.MINIO_BUCKET_NAME!;
    await minioClient.removeObject(bucketName, id)

    return `Success Deleted Object: ${id}`
}

export async function getPdfUrl(fileName: string) {
    const bucketName = process.env.MINIO_BUCKET_NAME!;
    return await minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60);  // URL berlaku 1 hari
}
