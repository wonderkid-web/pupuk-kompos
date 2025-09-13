import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { name, email, password, role } = body as {
    name?: string;
    email?: string;
    password?: string;
    role?: "ADMIN" | "USER";
  };

  if (!email || !password || !role) {
    return NextResponse.json({ error: "email, password, role required" }, { status: 400 });
  }
  const lower = email.toLowerCase();

  try {
    const hashed = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: { name: name || null, email: lower, password: hashed, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

