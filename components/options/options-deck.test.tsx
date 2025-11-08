/**
 * Integration test/demo page for Options Deck component
 * This can be used to verify the component works correctly
 *
 * To test:
 * 1. Import this in a Next.js page
 * 2. Render <OptionsDeckTest />
 * 3. Verify all features work as expected
 */

"use client";

import * as React from "react";
import { OptionsDeck } from "./options-deck";
import { OptionCard } from "./types";

const testOptions: OptionCard[] = [
  {
    id: "test-1",
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
    ],
    risks: ["Client acquisition may take longer than expected"],
    fit_score: 5,
  },
  {
    id: "test-2",
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
    ],
    risks: ["Longer sales cycles (2-3 months)"],
    fit_score: 4,
  },
];

export function OptionsDeckTest() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [options, setOptions] = React.useState<OptionCard[]>(testOptions);
  const [compareMode, setCompareMode] = React.useState(false);

  const handleRefine = () => {
    console.log("✓ Refine button clicked");
    alert("Refine functionality works!");
  };

  const handleGetStarted = (optionId: string) => {
    console.log("✓ Get Started clicked for:", optionId);
    alert(`Get Started functionality works for: ${optionId}`);
  };

  const handleToggleCompare = () => {
    console.log("✓ Compare mode toggled");
    setCompareMode(!compareMode);
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const toggleEmpty = () => {
    setOptions(options.length > 0 ? [] : testOptions);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Test Controls */}
        <div className="bg-muted p-4 rounded-lg space-y-4">
          <h2 className="font-bold text-lg">Test Controls</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={simulateLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Loading State
            </button>
            <button
              onClick={toggleEmpty}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Toggle Empty State
            </button>
            <button
              onClick={() => console.log("Current options:", options)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Log Options to Console
            </button>
          </div>
          <div className="text-sm text-muted-foreground">
            Check browser console for event logs
          </div>
        </div>

        {/* Component Under Test */}
        <OptionsDeck
          options={options}
          isLoading={isLoading}
          onRefine={handleRefine}
          onGetStarted={handleGetStarted}
          compareMode={compareMode}
          onToggleCompare={handleToggleCompare}
        />
      </div>
    </div>
  );
}
