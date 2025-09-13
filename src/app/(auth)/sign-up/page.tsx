import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function registerUser(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) return;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/sign-in?registered=1");
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name: name || null,
      email,
      password: hashed,
    },
  });

  redirect("/sign-in?registered=1");
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-green-200 rounded-xl p-6 bg-white">
        <h1 className="text-2xl font-semibold mb-1">Daftar</h1>
        <p className="text-sm text-gray-500 mb-6">
          Buat akun baru untuk memesan pupuk kompos.
        </p>
        <form action={registerUser} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Nama</label>
            <input name="name" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input name="email" type="email" required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input name="password" type="password" required className="w-full border rounded px-3 py-2" />
          </div>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white rounded py-2">Buat Akun</button>
        </form>
        <p className="text-sm text-gray-600 mt-4">
          Sudah punya akun? <Link className="underline text-green-700" href="/sign-in">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
