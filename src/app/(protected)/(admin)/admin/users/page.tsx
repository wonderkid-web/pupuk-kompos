export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-green-700">Pengguna</h1>
        <a href="/admin/users/new" className="px-3 py-2 border border-green-600 text-green-700 rounded hover:bg-green-50">Tambah</a>
      </div>
      <div className="overflow-x-auto bg-white border border-green-200 rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-3">Nama</th>
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Role</th>
              <th className="py-2 px-3">Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="py-2 px-3">{u.name || "-"}</td>
                <td className="py-2 px-3">{u.email}</td>
                <td className="py-2 px-3">{u.role}</td>
                <td className="py-2 px-3">{new Date(u.createdAt as any).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
