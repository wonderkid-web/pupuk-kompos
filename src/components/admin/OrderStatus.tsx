"use client";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function OrderStatusBadge({ status }: { status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" }) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded ${map[status]}`}>{status}</span>;
}

export function OrderStatusSelect({ id, status }: { id: string; status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" }) {
  const router = useRouter();
  const onChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as any;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Status pesanan diperbarui");
      // Refresh server component data so badge and totals update
      router.refresh();

    } catch (err: any) {
      toast.error(err?.message || "Gagal memperbarui status");
    }
  };
  return (
    <select defaultValue={status} onChange={onChange} className="border rounded px-2 py-1 text-sm">
      <option value="PENDING">PENDING</option>
      <option value="CONFIRMED">CONFIRMED</option>
      <option value="COMPLETED">COMPLETED</option>
      <option value="CANCELLED">CANCELLED</option>
    </select>
  );
}
