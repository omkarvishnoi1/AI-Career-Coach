import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define a set of protected routes using `createRouteMatcher`. This function takes an array of route patterns 
// and returns a matcher function. The patterns use regex-like syntax (e.g., `/dashboard(.*)`) to match both the 
// base route and any sub-routes. For example, `/dashboard(.*)` matches `/dashboard`, `/dashboard/settings`, etc. 
// These are the routes that require the user to be signed in to access.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/resume(.*)",
  "/interview(.*)",
  "/ai-cover-letter(.*)",
  "/onboarding(.*)",
]);

// This middleware runs for every incoming request. It uses Clerk's `auth()` function to determine if a user is 
// currently signed in by checking for a valid `userId`. If no user is signed in and the requested route matches 
// one of the protected paths defined earlier, the user is redirected to the sign-in page using Clerk's 
// `redirectToSignIn()` method. This ensures that only authenticated users can access sensitive parts of the app 
// like the dashboard or onboarding pages.

export default clerkMiddleware(async (auth, req) => {


  const { userId } = await auth();


  // If the user is not signed in and is trying to access a protected route, then:
  // redirectToSignIn() sends them to the Clerk sign-in page.
  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  // If the user is signed in, or the route is not protected, the request is allowed to proceed as normal.
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};