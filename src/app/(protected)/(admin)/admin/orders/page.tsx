export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { OrderStatusBadge, OrderStatusSelect } from "@/components/admin/OrderStatus";
import { formatIDR } from "@/lib/order";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, user: { select: { name: true, email: true } } },
  });
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-green-700">Pesanan</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Kode</th>
              <th className="py-2 pr-4">Pemesan</th>
              <th className="py-2 pr-4">Item</th>
              <th className="py-2 pr-4">Total</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b align-top">
                <td className="py-2 pr-4 font-medium">{o.code}</td>
                <td className="py-2 pr-4">{o.user?.name || o.user?.email}</td>
                <td className="py-2 pr-4">
                  <ul className="list-disc pl-4">
                    {o.items.map((it) => (
                      <li key={it.id}>{it.name} x {it.qty}</li>
                    ))}
                  </ul>
                </td>
                <td className="py-2 pr-4">{formatIDR(Number(o.total))}</td>
                <td className="py-2 pr-4"><OrderStatusBadge status={o.status as any} /></td>
                <td className="py-2 pr-4"><OrderStatusSelect id={o.id} status={o.status as any} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
