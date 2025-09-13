import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const { status } = body as { status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" };
  if (!status) return NextResponse.json({ error: "Missing status" }, { status: 400 });



  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id: params.id }, include: { items: true } });
      if (!existing) throw new Error("Order not found");

      // Idempotent stock deduction: only first transition to COMPLETED deducts stock
      if (status === "COMPLETED") {
        const res = await tx.order.updateMany({
          where: { id: params.id, stockDeducted: false },
          data: { stockDeducted: true },
        });
        if (res.count > 0) {
          for (const it of existing.items) {
            const p = await tx.pupuk.findUnique({ where: { id: it.pupukId }, select: { stock: true } });
            if (p) {
              const newStock = Math.max(0, p.stock - it.qty);
              await tx.pupuk.update({ where: { id: it.pupukId }, data: { stock: newStock } });
            }
          }
        }
      }

      return tx.order.update({ where: { id: params.id }, data: { status } });
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const where = session.user.role === "ADMIN" ? { id: params.id } : { id: params.id, userId: session.user.id };
  const data = await prisma.order.findFirst({ where, include: { items: true, user: { select: { name: true, email: true } } } });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
