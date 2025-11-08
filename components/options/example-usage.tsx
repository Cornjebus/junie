"use client";

import * as React from "react";
import { OptionsDeck } from "./options-deck";
import { OptionCard as OptionCardType } from "./types";

/**
 * Example usage of the OptionsDeck component
 * This demonstrates how to integrate the Options Deck UI in your application
 */

// Sample data matching the specification
const sampleOptions: OptionCardType[] = [
  {
    id: "biz_online_fitness_coaching",
    title: "Online Fitness Coaching (1:1 Clients)",
    why_you: [
      "Uses your passion + proven method",
      "Low cost to start",
      "Flexible evening/weekend hours",
    ],
    first_win: "3 paying clients in 6 weeks ($450-900/mo)",
    difficulty: "Easy",
    time_to_first_income_weeks: 6,
    startup_cost_range_usd: [100, 500],
    key_steps: [
      "Define your coaching offer and pricing",
      "Create simple landing page",
      "Post transformation story on social media",
      "Reach out to 50 warm contacts",
      "Offer free discovery calls",
    ],
    risks: [
      "Client acquisition may take longer than expected",
      "Need consistent availability for calls",
    ],
    resources: [
      { name: "Coaching Template", type: "doc", id: "tmpl_coaching_v1" },
      { name: "Pricing Guide", type: "doc", id: "guide_pricing_v1" },
    ],
    fit_score: 5,
  },
  {
    id: "biz_corporate_wellness",
    title: "Corporate Wellness Programs",
    why_you: [
      "Professional background fits corporate setting",
      "Higher ticket sales",
      "B2B relationships are your strength",
    ],
    first_win: "1 pilot program at local company ($2k-5k)",
    difficulty: "Medium",
    time_to_first_income_weeks: 8,
    startup_cost_range_usd: [200, 1000],
    key_steps: [
      "Research local companies with 50+ employees",
      "Create wellness program package",
      "Build presentation deck",
      "Cold outreach to HR departments",
      "Offer free lunch-and-learn session",
    ],
    risks: [
      "Longer sales cycles (2-3 months)",
      "Corporate decision-making can be slow",
    ],
    fit_score: 4,
  },
  {
    id: "biz_nutrition_consulting",
    title: "Nutrition Consulting for Athletes",
    why_you: [
      "Complements fitness expertise",
      "Niche market with less competition",
      "Can charge premium rates",
    ],
    first_win: "2-3 athlete clients ($300-600/mo)",
    difficulty: "Medium",
    time_to_first_income_weeks: 10,
    startup_cost_range_usd: [300, 800],
    key_steps: [
      "Get basic nutrition certification",
      "Define service packages",
      "Partner with local gyms/trainers",
      "Create content for athletes",
      "Offer performance assessments",
    ],
    risks: [
      "Certification costs and time",
      "Need specific sports nutrition knowledge",
    ],
    fit_score: 3,
  },
  {
    id: "biz_fitness_content_creator",
    title: "Fitness Content Creator (YouTube/IG)",
    why_you: [
      "Share your transformation journey",
      "Passive income potential",
      "Build personal brand",
    ],
    first_win: "1,000 followers + first affiliate sale ($50-200)",
    difficulty: "Hard",
    time_to_first_income_weeks: 16,
    startup_cost_range_usd: [100, 600],
    key_steps: [
      "Choose platform (YouTube or Instagram)",
      "Create content calendar (3-5 posts/week)",
      "Invest in basic recording equipment",
      "Post consistently for 3 months",
      "Join affiliate programs",
    ],
    risks: [
      "Long time to monetization",
      "Requires consistent content creation",
      "Algorithm changes can affect reach",
    ],
    fit_score: 3,
  },
  {
    id: "biz_bodyweight_workout_app",
    title: "Bodyweight Workout App/Community",
    why_you: [
      "Tech-forward approach",
      "Scalable business model",
      "Recurring revenue potential",
    ],
    first_win: "50 app downloads + 10 paying subscribers ($50-150/mo)",
    difficulty: "Hard",
    time_to_first_income_weeks: 20,
    startup_cost_range_usd: [500, 2000],
    key_steps: [
      "Validate idea with landing page",
      "Find no-code app builder or developer",
      "Create workout library",
      "Build initial community",
      "Launch MVP and gather feedback",
    ],
    risks: [
      "High development costs",
      "Technical complexity",
      "App store competition",
      "Need marketing budget",
    ],
    fit_score: 2,
  },
];

export function OptionsDeckExample() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [compareMode, setCompareMode] = React.useState(false);

  const handleRefine = () => {
    console.log("Refining options...");
    // In a real app, this would navigate to refinement questions
    // or trigger an API call to re-rank options
  };

  const handleGetStarted = (optionId: string) => {
    console.log("Getting started with option:", optionId);
    // In a real app, this would navigate to the next step
    // or show a modal with detailed action plan
  };

  const handleToggleCompare = () => {
    setCompareMode(!compareMode);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <OptionsDeck
        options={sampleOptions}
        isLoading={isLoading}
        onRefine={handleRefine}
        onGetStarted={handleGetStarted}
        compareMode={compareMode}
        onToggleCompare={handleToggleCompare}
      />
    </div>
  );
}
