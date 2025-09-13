import { getServerSession } from "next-auth";
import Image from "next/image";

export default async function Home() {
  const session = await getServerSession()
  return (
    <div className="min-h-screen p-8">m
      <main className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={28}
            priority
          />
          <h1 className="text-2xl font-semibold">Pupuk Kompos Online</h1>
          <p className="text-gray-600">
            Boilerplate Next.js + NextAuth + TanStack Query/Table.
          </p>
        </div>
        <div className="flex gap-4">
          <a className="px-4 py-2 border rounded" href="/sign-up">Daftar</a>
          <a className="px-4 py-2 border rounded" href="/sign-in">Masuk</a>
          <a className="px-4 py-2 border rounded" href="/dashboard">Dashboard</a>
        </div>
      </main>
    </div>
  );
}
