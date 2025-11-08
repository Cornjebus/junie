"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Types
export interface OnboardingData {
  sparks: string[];
  values: string[];
  dream: string;
}

export interface OnboardingFlowProps {
  onComplete?: (data: OnboardingData) => void;
  className?: string;
}

// Constants
const SPARK_OPTIONS = [
  "Fitness",
  "Tech",
  "Design",
  "Writing",
  "Coaching",
  "Marketing",
  "Photography",
  "Music",
  "Teaching",
  "Cooking",
  "Art",
  "Business",
  "Health",
  "Fashion",
  "Travel",
  "Gaming",
  "Consulting",
  "Content Creation",
  "Social Media",
  "Video Production",
];

const VALUE_OPTIONS = [
  "Impact",
  "Flexibility",
  "Growth",
  "Money",
  "Creativity",
  "Independence",
  "Community",
  "Mastery",
  "Recognition",
  "Balance",
  "Innovation",
  "Purpose",
];

const DREAM_EXAMPLES = [
  "Help busy professionals get fit without gym memberships",
  "Turn my design skills into a thriving freelance business",
  "Build a community around sustainable living",
];

type Step = "sparks" | "values" | "dream";

export function OnboardingFlow({ onComplete, className }: OnboardingFlowProps) {
  // State
  const [currentStep, setCurrentStep] = React.useState<Step>("sparks");
  const [selectedSparks, setSelectedSparks] = React.useState<string[]>([]);
  const [selectedValues, setSelectedValues] = React.useState<string[]>([]);
  const [dream, setDream] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Step configuration
  const steps: Step[] = ["sparks", "values", "dream"];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Handlers
  const toggleSpark = (spark: string) => {
    setSelectedSparks((prev) =>
      prev.includes(spark) ? prev.filter((s) => s !== spark) : [...prev, spark]
    );
    setErrors((prev) => ({ ...prev, sparks: "" }));
  };

  const toggleValue = (value: string) => {
    setSelectedValues((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, value];
    });
    setErrors((prev) => ({ ...prev, values: "" }));
  };

  const handleDreamChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 180) {
      setDream(value);
      setErrors((prev) => ({ ...prev, dream: "" }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case "sparks":
        if (selectedSparks.length === 0) {
          newErrors.sparks = "Please select at least one interest";
        }
        break;
      case "values":
        if (selectedValues.length === 0) {
          newErrors.values = "Please select at least one value";
        }
        break;
      case "dream":
        if (dream.trim().length < 20) {
          newErrors.dream = "Please write at least 20 characters";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateCurrentStep()) {
      return;
    }

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex]);
    } else {
      // Complete onboarding
      onComplete?.({
        sparks: selectedSparks,
        values: selectedValues,
        dream: dream.trim(),
      });
    }
  };

  const handleBack = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex]);
    }
  };

  const isValid = React.useMemo(() => {
    switch (currentStep) {
      case "sparks":
        return selectedSparks.length > 0;
      case "values":
        return selectedValues.length > 0;
      case "dream":
        return dream.trim().length >= 20;
      default:
        return false;
    }
  }, [currentStep, selectedSparks, selectedValues, dream]);

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content Card */}
      <Card className="border-0 shadow-none">
        <CardHeader className="text-center space-y-3 pb-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            {currentStep === "sparks" && "What sparks your interest?"}
            {currentStep === "values" && "What do you value most?"}
            {currentStep === "dream" && "What's your dream?"}
          </CardTitle>
          <CardDescription className="text-base">
            {currentStep === "sparks" &&
              "Select all the topics and activities that excite you"}
            {currentStep === "values" &&
              "Choose 1-3 core values that matter most in your work"}
            {currentStep === "dream" &&
              "Describe your ideal career or business in a few words"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sparks Step */}
          {currentStep === "sparks" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {SPARK_OPTIONS.map((spark) => (
                  <button
                    key={spark}
                    onClick={() => toggleSpark(spark)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                      "border border-input hover:bg-accent hover:text-accent-foreground",
                      selectedSparks.includes(spark)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-background"
                    )}
                  >
                    {spark}
                  </button>
                ))}
              </div>
              {errors.sparks && (
                <p className="text-sm text-destructive">{errors.sparks}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This helps Junie tailor options you'll actually enjoy—and stick with.
              </p>
            </div>
          )}

          {/* Values Step */}
          {currentStep === "values" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {VALUE_OPTIONS.map((value) => (
                  <button
                    key={value}
                    onClick={() => toggleValue(value)}
                    disabled={
                      selectedValues.length >= 3 && !selectedValues.includes(value)
                    }
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                      "border border-input hover:bg-accent hover:text-accent-foreground",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      selectedValues.includes(value)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-background"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Select up to 3 values</span>
                <span className="font-medium">
                  {selectedValues.length}/3 selected
                </span>
              </div>
              {errors.values && (
                <p className="text-sm text-destructive">{errors.values}</p>
              )}
            </div>
          )}

          {/* Dream Step */}
          {currentStep === "dream" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="dream" className="sr-only">
                  Your dream
                </Label>
                <textarea
                  id="dream"
                  value={dream}
                  onChange={handleDreamChange}
                  placeholder="e.g., Help busy professionals get fit without gyms"
                  className={cn(
                    "w-full min-h-[120px] px-4 py-3 rounded-md",
                    "border border-input bg-background",
                    "text-base placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    "resize-none"
                  )}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    Be specific about who you want to help and how
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      dream.length > 160
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {dream.length}/180
                  </span>
                </div>
              </div>
              {errors.dream && (
                <p className="text-sm text-destructive">{errors.dream}</p>
              )}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">Need inspiration? Try:</p>
                <ul className="space-y-1">
                  {DREAM_EXAMPLES.map((example, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      • {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-6">
            {currentStepIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 sm:flex-none"
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              onClick={handleContinue}
              disabled={!isValid}
              className="flex-1"
            >
              {currentStepIndex === steps.length - 1 ? "Complete" : "Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
