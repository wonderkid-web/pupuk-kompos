import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderCode, formatIDR } from "@/lib/order";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const all = url.searchParams.get("all");
  const where = all && session.user.role === "ADMIN" ? {} : { userId: session.user.id };
  const data = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { items: true, user: { select: { name: true, email: true } } },
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const { items, note } = body as { items: Array<{ pupukId: string; qty: number }>; note?: string };
  if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ error: "No items" }, { status: 400 });

  // Fetch products and compute totals (snapshot price & name)
  const pupukIds = items.map(i => i.pupukId);
  const products = await prisma.pupuk.findMany({ where: { id: { in: pupukIds } } });
  const map = new Map(products.map(p => [p.id, p]));

  let total = 0;
  const orderItems = items.map(i => {
    const p = map.get(i.pupukId);
    if (!p) throw new Error("Produk tidak ditemukan");
    const qty = Math.max(1, Number(i.qty || 1));
    const price = Number(p.price);
    const subtotal = qty * price;
    total += subtotal;
    return {
      pupukId: p.id,
      name: p.name,
      price: p.price,
      qty,
      subtotal,
    } as any;
  });

  // Create order + items
  let code = generateOrderCode();
  try {
    const created = await prisma.order.create({
      data: {
        code,
        userId: session.user.id!,
        total,
        note: note || null,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    const phone = process.env.ADMIN_WHATSAPP_PHONE || "6281234567890";
    const lines = created.items.map(it => `- ${it.name} x ${it.qty} = ${formatIDR(Number(it.subtotal))}`).join("%0A");
    const msg = `Halo Admin,%0ASaya ingin memesan.%0AOrder: ${created.code}%0A${lines}%0ATotal: ${formatIDR(Number(created.total))}%0A%0ACatatan: ${encodeURIComponent(note || "-")}`;
    const waUrl = `https://wa.me/${phone}?text=${msg}`;
    return NextResponse.json({ orderId: created.id, code: created.code, waUrl }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      // code unique conflict; retry once
      code = generateOrderCode();
      const created = await prisma.order.create({
        data: {
          code,
          userId: session.user.id!,
          total,
          note: note || null,
          items: { create: orderItems },
        },
        include: { items: true },
      });
      const phone = process.env.ADMIN_WHATSAPP_PHONE || "6281234567890";
      const lines = created.items.map(it => `- ${it.name} x ${it.qty} = ${formatIDR(Number(it.subtotal))}`).join("%0A");
      const msg = `Halo Admin,%0ASaya ingin memesan.%0AOrder: ${created.code}%0A${lines}%0ATotal: ${formatIDR(Number(created.total))}%0A%0ACatatan: ${encodeURIComponent(note || "-")}`;
      const waUrl = `https://wa.me/${phone}?text=${msg}`;
      return NextResponse.json({ orderId: created.id, code: created.code, waUrl }, { status: 201 });
    }
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
