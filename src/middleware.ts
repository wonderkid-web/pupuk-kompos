import { withAuth } from "next-auth/middleware";

// Protect routes using NextAuth middleware (JWT strategy required)
export default withAuth({
  pages: { signIn: "/sign-in" },
  callbacks: {
    authorized: ({ token, req }) => {
      // No token -> not logged in
      if (!token) return false;
      const pathname = req.nextUrl.pathname;
      // Admin-only area
      if (pathname.startsWith("/admin")) {
        return (token as any).role === "ADMIN";
      }
      // Logged-in users can access /user
      if (pathname.startsWith("/user")) return true;
      return true;
    },
  },
});

// Adjust matchers to the routes you want to protect
export const config = {
  matcher: ["/user/:path*", "/admin/:path*"],
};
