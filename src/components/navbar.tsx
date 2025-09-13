import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/signout-button";
import { Leaf, LayoutDashboard, Images, PackagePlus } from "lucide-react";

export default async function Navbar() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-green-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2 font-semibold text-green-700">
            <Leaf className="h-5 w-5" />
            Pupuk Kompos
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/user/pupuk" className="flex items-center gap-1.5 text-green-700 hover:underline"><Images className="h-4 w-4"/> Galeri</Link>
            {isAdmin && (
              <>
                <Link href="/admin/dashboard" className="flex items-center gap-1.5 text-green-700 hover:underline"><LayoutDashboard className="h-4 w-4"/> Dashboard</Link>
                <Link href="/admin/pupuk" className="flex items-center gap-1.5 text-green-700 hover:underline"><PackagePlus className="h-4 w-4"/> Kelola Pupuk</Link>
                <Link href="/admin/orders" className="flex items-center gap-1.5 text-green-700 hover:underline"><LayoutDashboard className="h-4 w-4"/> Pesanan</Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="hidden sm:inline text-sm text-green-800">{session.user.name || session.user.email}</span>
              <SignOutButton />
            </>
          ) : (
            <Link href="/sign-in" className="px-3 py-1.5 border border-green-600 text-green-700 rounded hover:bg-green-50 text-sm">Masuk</Link>
          )}
        </div>
      </div>
    </header>
  );
}
