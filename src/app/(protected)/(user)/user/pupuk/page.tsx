import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/minio";

export default async function UserPupukGalleryPage() {
  const items = await prisma.pupuk.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-green-700">Galeri Pupuk</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {await Promise.all(
          items.map(async (p) => {
            const url = p.imageKey ? await getPresignedUrl(p.imageKey, 3600) : p.imageUrl ?? null;
            return (
              <a key={p.id} href={`/user/pupuk/${p.slug}`} className="rounded p-3 space-y-2 block bg-green-600 text-white shadow-sm">
                {url && <img src={url} alt={p.name} className="w-full h-40 object-cover rounded" />}
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-green-100">{p.unit} • Stok: {p.stock}</div>
                <div className="font-semibold text-amber-100">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(p.price))}
                </div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}
