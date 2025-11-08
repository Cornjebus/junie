"use client";

import { OnboardingFlow, type OnboardingData } from "@/components/onboarding";

export default function OnboardingPage() {
  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log("Onboarding completed with data:", data);

    // Here you would typically:
    // 1. Save to Supabase database
    // 2. Navigate to next step (options generation)
    // 3. Show success message

    // Example: Save to profiles table
    // await supabase
    //   .from('profiles')
    //   .update({
    //     interests: data.sparks,
    //     values: data.values,
    //     dream: data.dream
    //   })
    //   .eq('user_id', userId);

    // Then redirect to options page
    // router.push('/dashboard/options');
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <OnboardingFlow onComplete={handleOnboardingComplete} />
    </main>
  );
}
