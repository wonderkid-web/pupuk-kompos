"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function OrderForm({ pupukId, name, price }: { pupukId: string; name: string; price: number }) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const onOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ pupukId, qty }], note }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      toast.success("Pesanan dibuat, membuka WhatsApp...");
      window.location.href = data.waUrl as string;
    } catch (e: any) {
      toast.error(e?.message || "Gagal membuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded p-4 bg-green-600 text-white space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">Pesan {name}</div>
        <div className="text-amber-100">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price)}</div>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm">Qty</label>
        <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} className="w-24 rounded px-2 py-1 text-black" />
      </div>
      <div>
        <label className="block text-sm mb-1">Catatan</label>
        <textarea className="w-full rounded px-3 py-2 text-black" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: lokasi, permintaan khusus, dll" />
      </div>
      <button onClick={onOrder} disabled={loading} className="px-4 py-2 bg-white text-green-700 rounded disabled:opacity-50">
        {loading ? "Memproses..." : "Lanjutkan Pemesanan (WA)"}
      </button>
    </div>
  );
}

