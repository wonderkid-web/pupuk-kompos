"use client";

import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

export function SignOutButton() {
  return (
    <button
      onClick={async () => {
        await signOut({ callbackUrl: "/sign-in" });
        toast.success("Berhasil keluar");
      }}
      className="text-sm text-green-700 underline hover:text-green-800"
    >
      Keluar
    </button>
  );
}
