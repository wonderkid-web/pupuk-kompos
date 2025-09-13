"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import toast from "react-hot-toast";

export default function NewPupukPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const form = e.currentTarget;
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const price = Number(data.get("price") || 0);
      const unit = String(data.get("unit") || "").trim();
      const stock = Number(data.get("stock") || 0);
      const description = String(data.get("description") || "").trim();
      const file = data.get("image") as File | null;

      let imageKey: string | null = null;
      if (file && file.size > 0) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch("/api/minio/upload", { method: "POST", body: fd });
        if (!up.ok) throw new Error(await up.text());
        const { objectName } = await up.json();
        imageKey = objectName as string;
      }



      // 3) Create product
      const createRes = await fetch("/api/pupuk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, unit, stock, description, imageKey }),
      });
      if (!createRes.ok) throw new Error(await createRes.text());
      toast.success("Produk berhasil ditambahkan");
      router.push("/admin/pupuk");
    } catch (err: any) {
      const msg = err?.message || "Terjadi kesalahan";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Tambah Pupuk</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Nama</label>
            <input name="name" className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Harga (Rp)</label>
            <input name="price" type="number" step="0.01" className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Satuan</label>
            <input name="unit" placeholder="kg / sak" className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Stok</label>
            <input name="stock" type="number" className="w-full border rounded px-3 py-2" defaultValue={0} />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Deskripsi</label>
          <textarea name="description" className="w-full border rounded px-3 py-2" rows={4} />
        </div>
        <div>
          <label className="block text-sm mb-1">Foto</label>
          <input name="image" type="file" accept="image/*" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button disabled={loading} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <a href="/admin/pupuk" className="px-4 py-2 border border-green-600 text-green-700 rounded hover:bg-green-50">Batal</a>
        </div>
      </form>
    </div>
  );
}
