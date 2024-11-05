import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Create route matchers for public and ignored routes
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in", // Added sign-in route
  "/sign-up",
  "/api/clerk-webhook",
  "/api/drive-activity/notification",
  "/api/payment/success",
]);

const isIgnoredRoute = createRouteMatcher([
  "/sign-in(.*)", // Allow all sub-routes under /sign-in
  "/sign-up(.*)",
  "/api/auth/callback/discord",
  "/api/auth/callback/notion",
  "/api/auth/callback/slack",
  "/api/flow",
  "/api/cron/wait",
]);


export default clerkMiddleware(async (auth, request) => {
  console.log("Auth state:", auth);
  
  if (!isPublicRoute(request) && !isIgnoredRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
