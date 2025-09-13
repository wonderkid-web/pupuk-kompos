export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/minio";
import { PupukActions } from "@/components/admin/PupukActions";

export default async function AdminPupukListPage() {
  const items = await prisma.pupuk.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-green-700">Produk Pupuk</h1>
        <a href="/admin/pupuk/new" className="px-3 py-2 border border-green-600 text-green-700 rounded hover:bg-green-50 inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Tambah
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {await Promise.all(
          items.map(async (p) => {
            const url = p.imageKey
              ? await getPresignedUrl(p.imageKey)
              : p.imageUrl ?? null;
            return (
              <div key={p.id} className="rounded p-3 space-y-2 bg-green-600 text-white shadow-sm">
                {url && (
                  <img src={url} alt={p.name} className="w-full h-72 object-cover rounded" />
                )}
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{p.name}</div>
                  <PupukActions id={p.id} />
                </div>
                <div className="text-sm text-green-100">{p.unit} • Stok: {p.stock}</div>
                <div className="font-semibold text-amber-100">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(p.price))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
