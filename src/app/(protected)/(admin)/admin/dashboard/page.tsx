export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/signout-button";
import { Package, Users, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const [userCount, pupukCount, salesAgg] = await Promise.all([
    prisma.user.count(),
    prisma.pupuk.count(),
    prisma.order.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: start, lt: end } },
      _sum: { total: true },
    }),
  ]);
  const monthSales = Number(salesAgg._sum.total ?? 0);

  const Card = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
    <div className="rounded p-4 bg-green-600 text-white flex items-center gap-3 shadow-sm">
      <div className="p-2 rounded bg-white/10 text-white">
        {icon}
      </div>
      <div>
        <div className="text-sm text-green-100">{title}</div>
        <div className="text-2xl font-semibold text-amber-100">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-green-700">Dashboard</h1>
        <div className="flex gap-3">
          <a href="/admin/pupuk" className="px-3 py-2 border border-green-600 text-green-700 rounded hover:bg-green-50">Kelola Pupuk</a>
          <SignOutButton />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Total Pupuk" value={pupukCount} icon={<Package className="h-5 w-5"/>} />
        <Card title="Total User" value={userCount} icon={<Users className="h-5 w-5"/>} />
        <Card title="Penjualan Bulan Ini" value={new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(monthSales)} icon={<TrendingUp className="h-5 w-5"/>} />
      </div>
    </div>
  );
}
