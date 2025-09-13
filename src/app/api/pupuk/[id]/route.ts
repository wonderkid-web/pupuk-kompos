import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { minioClient } from "@/lib/minio";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const item = await prisma.pupuk.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = params.id;
  const item = await prisma.pupuk.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const oldKey = item.imageKey || null;

  await prisma.pupuk.delete({ where: { id } });

  if (oldKey) {
    const count = await prisma.pupuk.count({ where: { imageKey: oldKey } });
    if (count === 0) {
      const bucket = process.env.MINIO_BUCKET_NAME || process.env.MINIO_BUCKET || "audit";
      try {
        await minioClient.removeObject(bucket, oldKey);
      } catch (e) {
        // swallow deletion errors to avoid blocking API
        console.error("MinIO removeObject failed:", e);
      }
    }
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = params.id;
  const existing = await prisma.pupuk.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { name, price, unit, stock, description, imageKey } = body as {
    name?: string;
    price?: number;
    unit?: string;
    stock?: number;
    description?: string | null;
    imageKey?: string | null;
  };

  let data: any = {};
  if (typeof name === "string" && name.trim()) {
    data.name = name.trim();
    let s = slugify(data.name);
    if (s !== existing.slug) {
      try {
        await prisma.pupuk.update({ where: { id }, data: { slug: s } });
      } catch (e: any) {
        if (e?.code === "P2002") {
          s = `${s}-${Date.now().toString().slice(-4)}`;
        }
      }
    }
    data.slug = s;
  }
  if (typeof price === "number") data.price = price;
  if (typeof unit === "string") data.unit = unit;
  if (typeof stock === "number") data.stock = stock;
  if (typeof description !== "undefined") data.description = description;
  if (typeof imageKey !== "undefined") data.imageKey = imageKey;

  const updated = await prisma.pupuk.update({ where: { id }, data });

  // If imageKey changed, try to delete old object if unreferenced
  if (typeof imageKey !== "undefined" && existing.imageKey && existing.imageKey !== imageKey) {
    const oldKey = existing.imageKey;
    const count = await prisma.pupuk.count({ where: { imageKey: oldKey } });
    if (count === 0) {
      const bucket = process.env.MINIO_BUCKET_NAME || process.env.MINIO_BUCKET || "audit";
      try {
        await minioClient.removeObject(bucket, oldKey);
      } catch (e) {
        console.error("MinIO removeObject failed:", e);
      }
    }
  }

  return NextResponse.json(updated);
}
