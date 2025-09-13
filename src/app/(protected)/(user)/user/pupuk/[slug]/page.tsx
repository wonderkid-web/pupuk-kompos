import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/minio";
import { notFound } from "next/navigation";
import OrderForm from "./order-form";

function waLink(name: string) {
  const phone = process.env.ADMIN_WHATSAPP_PHONE || "6281234567890";
  const text = encodeURIComponent(
    `Halo Admin, saya ingin memesan pupuk: ${name}. Mohon info ketersediaan dan cara pemesanan. Terima kasih!`
  );
  return `https://wa.me/${phone}?text=${text}`;
}

export default async function PupukDetailPage({ params }: { params: { slug: string } }) {
  const item = await prisma.pupuk.findUnique({ where: { slug: params.slug } });
  if (!item) return notFound();
  const price = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(item.price));
  const url = item.imageKey ? await getPresignedUrl(item.imageKey, 3600) : item.imageUrl ?? null;
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      {url && (
        <img src={url} alt={item.name} className="w-full h-72 object-cover rounded" />
      )}
      <h1 className="text-2xl font-semibold">{item.name}</h1>
      <div className="text-lg font-semibold">{price}</div>
      <div className="text-gray-600">Satuan: {item.unit} • Stok: {item.stock}</div>
      {item.description && <p className="leading-relaxed whitespace-pre-line">{item.description}</p>}
      <div className="space-y-3">
        <OrderForm pupukId={item.id} name={item.name} price={Number(item.price)} />
      </div>
    </div>
  );
}
