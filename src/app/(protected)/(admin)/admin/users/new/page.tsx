"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminUserNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim().toLowerCase();
      const password = String(fd.get("password") || "");
      const role = String(fd.get("role") || "USER") as "ADMIN" | "USER";

      if (!email || !password) throw new Error("Email dan password wajib diisi");
      if (password.length < 6) throw new Error("Password minimal 6 karakter");

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Akun berhasil dibuat");
      router.push("/admin/users");
    } catch (e: any) {
      const msg = e?.message || "Gagal membuat akun";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-green-700">Tambah Akun</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Nama</label>
            <input name="name" className="w-full border rounded px-3 py-2" placeholder="Opsional" />
          </div>
          <div>
            <label className="block text-sm mb-1">Peran</label>
            <select name="role" className="w-full border rounded px-3 py-2" defaultValue="USER">
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input name="email" type="email" required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input name="password" type="password" required className="w-full border rounded px-3 py-2" placeholder="Minimal 6 karakter" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button disabled={loading} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <a href="/admin/users" className="px-4 py-2 border border-green-600 text-green-700 rounded hover:bg-green-50">Batal</a>
        </div>
      </form>
    </div>
  );
}

