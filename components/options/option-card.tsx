"use client";

import * as React from "react";
import { Star, ChevronDown, ChevronUp, Clock, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OptionCardProps } from "./types";

export function OptionCard({
  option,
  isExpanded = false,
  onToggleExpand,
  onGetStarted,
  isLoading = false,
}: OptionCardProps) {
  const [expanded, setExpanded] = React.useState(isExpanded);

  const handleToggleExpand = () => {
    const newState = !expanded;
    setExpanded(newState);
    onToggleExpand?.();
  };

  const handleGetStarted = () => {
    onGetStarted?.(option.id);
  };

  const renderStars = (score: number = 3) => {
    return (
      <div className="flex gap-0.5" aria-label={`${score} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < score
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            )}
          />
        ))}
      </div>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCostRange = (range: [number, number]) => {
    const [min, max] = range;
    if (min === 0) return `$0-${max}`;
    return `$${min}-${max}`;
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl font-bold leading-tight flex-1">
            {option.title}
          </CardTitle>
          {renderStars(option.fit_score || 3)}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={cn("border", getDifficultyColor(option.difficulty))}>
            {option.difficulty}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {option.time_to_first_income_weeks}w to income
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {formatCostRange(option.startup_cost_range_usd)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Why You Section */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">
            Why This Fits You:
          </h4>
          <ul className="space-y-1.5">
            {option.why_you.slice(0, 3).map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* First Win */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
          <h4 className="font-semibold text-sm text-primary mb-1">
            First Win:
          </h4>
          <p className="text-sm">{option.first_win}</p>
        </div>

        {/* Expandable Details */}
        {expanded && (
          <div className="space-y-4 pt-2 border-t animate-in slide-in-from-top-2 duration-300">
            {/* Key Steps */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                Key Steps:
              </h4>
              <ol className="space-y-1.5 list-decimal list-inside">
                {option.key_steps.map((step, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Risks */}
            {option.risks.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Potential Risks:
                </h4>
                <ul className="space-y-1.5">
                  {option.risks.map((risk, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground pl-5">
                      • {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resources */}
            {option.resources && option.resources.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                  Resources:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {option.resources.map((resource, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {resource.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={handleToggleExpand}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Learn More
            </>
          )}
        </Button>
        <Button
          className="w-full sm:flex-1"
          onClick={handleGetStarted}
        >
          Get Started
        </Button>
      </CardFooter>
    </Card>
  );
}
