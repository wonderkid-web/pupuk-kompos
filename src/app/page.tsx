import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/minio";
import { Leaf, PhoneCall, Truck, ShieldCheck } from "lucide-react";

export default async function Home() {
  const phone = process.env.ADMIN_WHATSAPP_PHONE || "6281234567890";
  const waIntro = `https://wa.me/${phone}?text=${encodeURIComponent(
    "Halo Admin, saya ingin info pemesanan pupuk kompos."
  )}`;

  const products = await prisma.pupuk.findMany({ orderBy: { createdAt: "desc" }, take: 6 });
  const items = await Promise.all(
    products.map(async (p) => ({
      ...p,
      url: p.imageKey ? await getPresignedUrl(p.imageKey, 3600) : p.imageUrl ?? null,
    }))
  );

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="rounded-lg p-8 md:p-12 bg-green-600 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-amber-100 text-sm">
              <Leaf className="h-4 w-4" /> 100% Organik • Berbasis di Desa Namu Mbelin
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
              Pupuk Kompos Berkualitas untuk Kebun & Pertanian Anda
            </h1>
            <p className="text-green-50">
              Pesan cepat via WhatsApp. Kami siap membantu kebutuhan kompos Anda
              untuk tanaman yang lebih sehat dan panen melimpah.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/user/pupuk" className="px-4 py-2 bg-white text-green-700 rounded">
                Lihat Produk
              </Link>
              <a href={waIntro} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-white/70 rounded">
                Tanya via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded p-4 bg-white border border-green-200 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-green-700 mt-1" />
          <div>
            <div className="font-medium text-green-800">Kualitas Teruji</div>
            <div className="text-sm text-gray-600">Bahan organik terpilih, aman untuk berbagai jenis tanaman.</div>
          </div>
        </div>
        <div className="rounded p-4 bg-white border border-green-200 flex items-start gap-3">
          <Truck className="h-5 w-5 text-green-700 mt-1" />
          <div>
            <div className="font-medium text-green-800">Pengiriman Cepat</div>
            <div className="text-sm text-gray-600">Antar ke lokasi Anda sesuai jadwal.</div>
          </div>
        </div>
        <div className="rounded p-4 bg-white border border-green-200 flex items-start gap-3">
          <PhoneCall className="h-5 w-5 text-green-700 mt-1" />
          <div>
            <div className="font-medium text-green-800">Pesan via WhatsApp</div>
            <div className="text-sm text-gray-600">Proses mudah, konfirmasi cepat melalui chat.</div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-green-700">Produk Unggulan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length === 0 && (
            <div className="text-sm text-gray-600">Belum ada produk tersedia. Silakan cek kembali nanti.</div>
          )}
          {items.map((p) => (
            <Link key={p.id} href={`/user/pupuk/${p.slug}`} className="rounded p-3 space-y-2 bg-white border border-green-200 hover:shadow-sm">
              {p.url && <img src={p.url} alt={p.name} className="w-full h-40 object-cover rounded" />}
              <div className="font-medium text-green-800">{p.name}</div>
              <div className="text-sm text-gray-600">{p.unit} • Stok: {p.stock}</div>
              <div className="font-semibold text-green-700">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(p.price))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Lokasi & Cara Pemesanan */}
      <section className="rounded p-6 bg-white border border-green-200">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-green-700 mb-3">Cara Pemesanan</h2>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
              <li>Buka katalog dan pilih produk yang diinginkan.</li>
              <li>Isi jumlah dan catatan pada halaman produk.</li>
              <li>Tekan {"Lanjutkan Pemesanan"}, Anda akan diarahkan ke WhatsApp untuk konfirmasi.</li>
              <li>Admin memproses pesanan Anda hingga selesai.</li>
            </ol>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-green-700 mb-3">Lokasi</h2>
            <p className="text-sm text-gray-700">Operasional dari Desa Namu Mbelin dan melayani area sekitar.</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Desa Namu Mbelin")}`}
              target="_blank"
              className="inline-block mt-3 px-3 py-2 border border-green-600 text-green-700 rounded hover:bg-green-50 text-sm"
            >
              Lihat di Google Maps
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
