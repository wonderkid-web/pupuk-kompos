import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

export default function Footer() {
  const phone = process.env.ADMIN_WHATSAPP_PHONE || "6281234567890";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Desa Namu Mbelin")}`;
  const wa = `https://wa.me/${phone}`;

  return (
    <footer className="border-t border-green-100 mt-10">
      <div className="mx-auto max-w-6xl px-4 py-8 grid gap-4 md:grid-cols-3 text-sm">
        <div className="space-y-1">
          <div className="font-semibold text-green-700">Pupuk Kompos Namu Mbelin</div>
          <p className="text-gray-600">Pupuk kompos organik untuk kebun & pertanian.</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-gray-700">
            <MapPin className="h-4 w-4 text-green-700 mt-0.5" />
            <Link href={mapsUrl} target="_blank" className="hover:underline">Desa Namu Mbelin</Link>
          </div>
          <div className="flex items-start gap-2 text-gray-700">
            <Phone className="h-4 w-4 text-green-700 mt-0.5" />
            <a href={wa} target="_blank" className="hover:underline">WhatsApp: {phone}</a>
          </div>
        </div>
        <div className="text-gray-500 md:text-right">&copy; {new Date().getFullYear()} Pupuk Kompos Namu Mbelin</div>
      </div>
    </footer>
  );
}

