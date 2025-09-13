"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Pupuk = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  unit: string;
  stock: number;
  imageKey: string | null;
};

export default function EditPupukPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<Pupuk | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const params = useParams()

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/pupuk/${params.id}`, { method: "GET", credentials: "include" });
        if (!res.ok) throw new Error(await res.text());
        const data: Pupuk = await res.json();
        if (!cancelled) setItem(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Gagal memuat data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params.id]);

  // As a workaround (no GET API), fetch via client-side call to a lightweight data route using Prisma is not possible in client.
  // We'll require initialData via search params or provide minimal edit via form fields from URL.
  // For now, render a minimal form that allows updating fields if you pass values through query or manually fill.

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const name = String(fd.get("name") || "").trim();
      const price = Number(fd.get("price") || 0);
      const unit = String(fd.get("unit") || "").trim();
      const stock = Number(fd.get("stock") || 0);
      const description = String(fd.get("description") || "").trim();

      let imageKey: string | undefined;
      const image = file;
      if (image && image.size > 0) {
        const upfd = new FormData();
        upfd.append("file", image);
        const up = await fetch("/api/minio/upload", { method: "POST", body: upfd });
        if (!up.ok) throw new Error(await up.text());
        const { objectName } = await up.json();
        imageKey = objectName as string;
      }

      const body: any = { name, price, unit, stock, description };
      if (imageKey) body.imageKey = imageKey;

      const res = await fetch(`/api/pupuk/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Produk diperbarui");
      router.push("/admin/pupuk");
    } catch (err: any) {
      const msg = err?.message || "Gagal menyimpan";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Edit Pupuk</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Nama</label>
            <input name="name" className="w-full border rounded px-3 py-2" required defaultValue={item?.name} />
          </div>
          <div>
            <label className="block text-sm mb-1">Harga (Rp)</label>
            <input name="price" type="number" step="0.01" className="w-full border rounded px-3 py-2" required defaultValue={Number(item?.price ?? 0)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Satuan</label>
            <input name="unit" className="w-full border rounded px-3 py-2" required defaultValue={item?.unit} />
          </div>
          <div>
            <label className="block text-sm mb-1">Stok</label>
            <input name="stock" type="number" className="w-full border rounded px-3 py-2" defaultValue={item?.stock ?? 0} />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Deskripsi</label>
          <textarea name="description" className="w-full border rounded px-3 py-2" rows={4} defaultValue={item?.description ?? ""} />
        </div>
        <div>
          <label className="block text-sm mb-1">Ganti Foto</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button disabled={saving} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50">
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
          <a href="/admin/pupuk" className="px-4 py-2 border border-green-600 text-green-700 rounded hover:bg-green-50">Batal</a>
        </div>
      </form>
    </div>
  );
}
