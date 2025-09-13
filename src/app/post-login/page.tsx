import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PostLogin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "ADMIN") redirect("/admin/dashboard");
  if (session?.user) redirect("/user/pupuk");
  redirect("/sign-in");
}

