"use client";

import * as React from "react";
import { LayoutGrid, List, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OptionCard } from "./option-card";
import { OptionsDeckProps } from "./types";

export function OptionsDeck({
  options,
  isLoading = false,
  onRefine,
  onGetStarted,
  compareMode = false,
  onToggleCompare,
}: OptionsDeckProps) {
  const [expandedCards, setExpandedCards] = React.useState<Set<string>>(new Set());

  const handleToggleExpand = (optionId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        next.add(optionId);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    if (expandedCards.size === options.length) {
      setExpandedCards(new Set());
    } else {
      setExpandedCards(new Set(options.map((opt) => opt.id)));
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 5 }).map((_, idx) => (
            <OptionCard
              key={idx}
              option={{
                id: `skeleton-${idx}`,
                title: "",
                why_you: [],
                first_win: "",
                difficulty: "Medium",
                time_to_first_income_weeks: 0,
                startup_cost_range_usd: [0, 0],
                key_steps: [],
                risks: [],
              }}
              isLoading={true}
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!options || options.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <LayoutGrid className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Options Available</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          We couldn't generate personalized options yet. Please complete your profile
          to get tailored recommendations.
        </p>
        {onRefine && (
          <Button onClick={onRefine}>
            <RefreshCw className="h-4 w-4" />
            Generate Options
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Your Personalized Paths
          </h2>
          <p className="text-muted-foreground mt-1">
            {options.length} options tailored to your profile
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExpandAll}
          >
            {expandedCards.size === options.length ? (
              <>
                <List className="h-4 w-4" />
                Collapse All
              </>
            ) : (
              <>
                <LayoutGrid className="h-4 w-4" />
                Expand All
              </>
            )}
          </Button>

          {onToggleCompare && (
            <Button
              variant={compareMode ? "default" : "outline"}
              size="sm"
              onClick={onToggleCompare}
            >
              {compareMode ? "Exit Compare" : "Compare"}
            </Button>
          )}

          {onRefine && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefine}
            >
              <RefreshCw className="h-4 w-4" />
              Refine Further
            </Button>
          )}
        </div>
      </div>

      {/* Options Grid */}
      <div
        className={cn(
          "grid gap-6 transition-all duration-300",
          compareMode
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {options.map((option, index) => (
          <div
            key={option.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <OptionCard
              option={option}
              isExpanded={expandedCards.has(option.id)}
              onToggleExpand={() => handleToggleExpand(option.id)}
              onGetStarted={onGetStarted}
            />
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      {onRefine && (
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            variant="outline"
            onClick={onRefine}
            className="min-w-[200px]"
          >
            <RefreshCw className="h-4 w-4" />
            Refine Options Further
          </Button>
        </div>
      )}
    </div>
  );
}
