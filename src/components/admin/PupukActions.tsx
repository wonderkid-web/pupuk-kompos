"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";

export function PupukActions({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onDelete = () => {
    toast((t) => (
      <div className="text-sm">
        <div className="mb-2">Hapus produk ini?</div>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 bg-green-600 text-white rounded"
            onClick={async () => {
              setLoading(true);
              try {
                const res = await fetch(`/api/pupuk/${id}`, { method: "DELETE", credentials: "include" });
                if (!res.ok) throw new Error(await res.text());
                toast.dismiss(t.id);
                toast.success("Produk dihapus");
                router.refresh();
              } catch (e: any) {
                toast.error(e?.message || "Gagal menghapus");
              } finally {
                setLoading(false);
              }
            }}
          >
            Ya
          </button>
          <button
            className="px-2 py-1 border rounded"
            onClick={() => toast.dismiss(t.id)}
          >
            Batal
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="flex gap-2">
      <a href={`/admin/pupuk/${id}/edit`} className="px-2 py-1 border border-white/30 rounded text-sm text-white hover:bg-white/10 inline-flex items-center gap-1">
        <Pencil className="h-4 w-4"/> Edit
      </a>
      <button onClick={onDelete} disabled={loading} className="px-2 py-1 border rounded text-sm disabled:opacity-50 text-red-50 border-red-200/60 hover:bg-red-500/20 inline-flex items-center gap-1 bg-red-500/10">
        <Trash2 className="h-4 w-4"/> {loading ? "Menghapus..." : "Hapus"}
      </button>
    </div>
  );
}
