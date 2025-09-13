import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const { name, price, unit, stock, description, imageKey } = body as {
    name: string; price: number; unit: string; stock?: number; description?: string; imageKey?: string | null;
  };

  if (!name || !price || !unit) {
    return NextResponse.json({ error: "name, price, unit required" }, { status: 400 });
  }

  let slug = slugify(name);
  try {
    const created = await prisma.pupuk.create({
      data: { name, slug, description: description || null, price, unit, stock: stock || 0, imageKey: imageKey || null },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    // Handle unique slug conflict
    if (typeof err?.code === "string" && err.code === "P2002") {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
      const created = await prisma.pupuk.create({
        data: { name, slug, description: description || null, price, unit, stock: stock || 0, imageKey: imageKey || null },
      });
      return NextResponse.json(created, { status: 201 });
    }
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

