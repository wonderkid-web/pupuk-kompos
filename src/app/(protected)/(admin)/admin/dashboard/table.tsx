"use client";

import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";

type Order = {
  id: string;
  customer: string;
  item: string;
  qty: number;
  total: number;
  status: string;
};

const columns: ColumnDef<Order>[] = [
  { accessorKey: "id", header: "ID Pesanan" },
  { accessorKey: "customer", header: "Pelanggan" },
  { accessorKey: "item", header: "Produk" },
  { accessorKey: "qty", header: "Qty" },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ getValue }) =>
      new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
        Number(getValue())
      ),
  },
  { accessorKey: "status", header: "Status" },
];

export default function ClientOrdersTable() {
  const { data, isLoading, error } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
  });

  if (isLoading) return <p>Memuat data...</p>;
  if (error) return <p className="text-red-600">Terjadi kesalahan</p>;

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">Pesanan Terbaru</h2>
      <DataTable<Order> columns={columns} data={data ?? []} />
    </div>
  );
}

