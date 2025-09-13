Boilerplate Next.js + NextAuth (Credentials) + Prisma + TanStack Query/Table untuk aplikasi pemesanan pupuk kompos.

## Stack
- Next.js (App Router, TS)
- NextAuth v4 + Prisma Adapter
- Prisma ORM (MySQL)
- TanStack Query + TanStack Table

## Setup MySQL (tanpa Docker)
1) Buat database dan user di MySQL lokal (contoh):

```sql
-- login ke MySQL: mysql -u root -p
CREATE DATABASE pupuk_kompos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pupuk'@'localhost' IDENTIFIED BY 'ganti_password_kuat';
GRANT ALL PRIVILEGES ON pupuk_kompos.* TO 'pupuk'@'localhost';
FLUSH PRIVILEGES;
```

2) Siapkan env:

```bash
cp .env.example .env
# lalu edit .env:
# DATABASE_URL="mysql://pupuk:ganti_password_kuat@127.0.0.1:3306/pupuk_kompos"
```

3) Generate Prisma Client dan apply schema ke MySQL:

```bash
bun run db:generate
# pilih salah satu:
bun run db:migrate   # prefer: membuat dan menjalankan migration
# atau
bun run db:push      # cepat: sinkron schema tanpa migration
```

## Jalankan Aplikasi
```bash
bun run dev
# atau npm run dev / pnpm dev
```

Auth Routes ada di `/api/auth/[...nextauth]`.

## Halaman
- `/sign-up` – registrasi user baru (password di-hash bcrypt)
- `/sign-in` – login (NextAuth credentials)
- `/dashboard` – halaman proteksi (wajib login) + contoh tabel pesanan (TanStack)

## Catatan
- Default session strategy: database (tabel `Session` via Prisma Adapter).
- Jika mengganti skema DB/kolom, buat migration baru (`db:migrate`).







## TASK
Jika mau lanjut, aku bisa:

-   Tambah edit/hapus Pupuk:
    Hapus juga objek MinIO saat produk dihapus (cek referensi bila imageKey dipakai lebih dari satu entitas).

-   Media Library admin:
    Halaman admin/media pakai listFiles(prefix) untuk telusuri bucket dan pilih file existing.

-   Multi-gambar per produk:
    Schema PupukImage(pupukId, key, isPrimary, sortOrder).
    Upload multiple dan pilih thumbnail utama.

-   Order & metrik:
    Model Order, OrderItem, agregasi penjualan bulanan di dashboard.

-   WhatsApp CTA:
    Tambahkan qty/catatan ke template chat di detail produk (bisa param dari input user).