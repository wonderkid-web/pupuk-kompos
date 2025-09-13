import { Suspense } from "react";
import { SignInForm } from "./signin-form";


export default async function SignInPage(
  props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const registered = searchParams?.registered;
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-1">Masuk</h1>
        <p className="text-sm text-gray-500 mb-6">
          {registered ? "Registrasi berhasil. Silakan masuk." : "Gunakan akun kamu untuk melanjutkan"}
        </p>
        <Suspense>
          <SignInForm />
        </Suspense>
        <p className="text-sm text-gray-600 mt-4">
          Belum punya akun? <a className="underline" href="/sign-up">Daftar</a>
        </p>
      </div>
    </div>
  );
}
