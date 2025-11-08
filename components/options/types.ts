export interface OptionCard {
  id: string;
  title: string;
  why_you: string[];
  first_win: string;
  difficulty: "Easy" | "Medium" | "Hard";
  time_to_first_income_weeks: number;
  startup_cost_range_usd: [number, number];
  key_steps: string[];
  risks: string[];
  resources?: Array<{
    name: string;
    type: string;
    id: string;
  }>;
  fit_score?: number; // 1-5 star rating
}

export interface OptionCardProps {
  option: OptionCard;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onGetStarted?: (optionId: string) => void;
  isLoading?: boolean;
}

export interface OptionsDeckProps {
  options: OptionCard[];
  isLoading?: boolean;
  onRefine?: () => void;
  onGetStarted?: (optionId: string) => void;
  compareMode?: boolean;
  onToggleCompare?: () => void;
}
