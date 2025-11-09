import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api(.*)',  // Allow all API routes
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding']);
const isOptionsRoute = createRouteMatcher(['/options(.*)']);
const isApiRoute = createRouteMatcher(['/api(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Allow public routes (including all API routes)
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Require auth for all other routes
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check if user has completed onboarding (except on onboarding/options/api pages)
  if (!isOnboardingRoute(req) && !isOptionsRoute(req) && !isApiRoute(req)) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Check if user has a profile with completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('sparks, values, dream')
        .eq('user_id', (await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', userId)
          .single()).data?.id)
        .single();

      const hasCompletedOnboarding = Boolean(
        profile &&
        profile.sparks &&
        profile.sparks.length > 0 &&
        profile.values &&
        profile.values.length > 0 &&
        profile.dream
      );

      if (!hasCompletedOnboarding) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // On error, redirect to onboarding to be safe
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
