# Options Deck UI Component

A comprehensive UI component for displaying personalized career/business path recommendations with interactive cards.

## Components

### 1. OptionCard
Individual card component that displays a single career/business option with expandable details.

**Features:**
- Star rating display (1-5 stars for fit score)
- Difficulty badge (Easy/Medium/Hard) with color coding
- Time to first income and startup cost badges
- "Why this fits you" bullets with checkmarks
- Highlighted "First Win" section
- Expandable details showing:
  - Key steps (numbered list)
  - Potential risks (with warning icon)
  - Available resources
- "Learn More" button to toggle details
- "Get Started" button for selection
- Loading skeleton state
- Hover effects and smooth animations

**Props:**
```typescript
interface OptionCardProps {
  option: OptionCard;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onGetStarted?: (optionId: string) => void;
  isLoading?: boolean;
}
```

### 2. OptionsDeck
Container component that displays all options in a responsive grid layout.

**Features:**
- Responsive grid layout:
  - 1 column on mobile
  - 2 columns on tablet
  - 3 columns on desktop
  - 5 columns in compare mode
- Loading state with skeleton cards
- Empty state with call-to-action
- "Expand All" / "Collapse All" toggle
- Compare mode toggle
- "Refine Further" button
- Staggered card animations on load
- Card count summary

**Props:**
```typescript
interface OptionsDeckProps {
  options: OptionCard[];
  isLoading?: boolean;
  onRefine?: () => void;
  onGetStarted?: (optionId: string) => void;
  compareMode?: boolean;
  onToggleCompare?: () => void;
}
```

## Data Structure

```typescript
interface OptionCard {
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
```

## Usage

### Basic Usage

```tsx
import { OptionsDeck } from "@/components/options";

function MyPage() {
  const options = [
    {
      id: "option-1",
      title: "Online Fitness Coaching",
      why_you: [
        "Uses your passion + proven method",
        "Low cost to start",
        "Flexible hours"
      ],
      first_win: "3 paying clients in 6 weeks ($450-900/mo)",
      difficulty: "Easy",
      time_to_first_income_weeks: 6,
      startup_cost_range_usd: [100, 500],
      key_steps: [
        "Define coaching offer",
        "Create landing page",
        "Reach out to contacts"
      ],
      risks: ["Client acquisition may take longer"],
      fit_score: 5
    },
    // ... more options
  ];

  return (
    <OptionsDeck
      options={options}
      onRefine={() => console.log("Refine clicked")}
      onGetStarted={(id) => console.log("Get started with:", id)}
    />
  );
}
```

### With Loading State

```tsx
<OptionsDeck
  options={[]}
  isLoading={true}
/>
```

### With Compare Mode

```tsx
const [compareMode, setCompareMode] = useState(false);

<OptionsDeck
  options={options}
  compareMode={compareMode}
  onToggleCompare={() => setCompareMode(!compareMode)}
/>
```

### Individual Card Usage

```tsx
import { OptionCard } from "@/components/options";

<OptionCard
  option={optionData}
  isExpanded={false}
  onToggleExpand={() => console.log("Toggled")}
  onGetStarted={(id) => console.log("Started:", id)}
/>
```

## Styling

The components use:
- **Tailwind CSS** for styling
- **shadcn/ui** components (Card, Button, Badge)
- **Lucide React** for icons
- **class-variance-authority** for variant styling

### Color Schemes

**Difficulty Badges:**
- Easy: Green (bg-green-100, text-green-800)
- Medium: Yellow (bg-yellow-100, text-yellow-800)
- Hard: Red (bg-red-100, text-red-800)

**Star Ratings:**
- Filled: Yellow (fill-yellow-400)
- Empty: Gray (fill-gray-200)

## Icons Used

- `Star` - Rating display
- `ChevronDown/ChevronUp` - Expand/collapse toggle
- `Clock` - Time to income
- `DollarSign` - Startup cost
- `AlertCircle` - Risks section
- `CheckCircle2` - Why you bullets
- `LayoutGrid` - Grid view
- `List` - List view
- `RefreshCw` - Refine button

## Animations

- **Card entrance:** Staggered fade-in and slide-up (100ms delay between cards)
- **Expand details:** Slide-in from top with 300ms duration
- **Hover effects:** Shadow and border color transitions
- **Loading skeleton:** Pulse animation

## Accessibility

- Semantic HTML structure
- ARIA labels for star ratings
- Keyboard navigation support
- Focus visible states
- Screen reader friendly

## File Structure

```
components/options/
├── types.ts              # TypeScript interfaces
├── option-card.tsx       # Individual card component
├── options-deck.tsx      # Deck container component
├── index.ts              # Barrel exports
├── example-usage.tsx     # Usage example with sample data
└── README.md             # This file
```

## Dependencies

Required packages (already installed):
- `react`
- `lucide-react`
- `class-variance-authority`
- `@radix-ui/react-slot`
- `tailwindcss`

## Example Data

See `example-usage.tsx` for complete sample data that matches the specification from:
- `/docs/sparc/01-specification.md` (lines 117-149)
- `/docs/thoughts.md` (lines 194-207)

## Integration Notes

1. The component expects the parent page to handle:
   - Data fetching for options
   - Navigation to refinement flow
   - Navigation to "Get Started" flow
   - State management for compare mode

2. Loading states are built-in - just pass `isLoading={true}`

3. Empty state is automatically shown when no options are provided

4. All callbacks are optional - components work standalone for preview

## Future Enhancements

Potential additions:
- Filter/sort options
- Save favorite options
- Share option cards
- Print-friendly view
- Export to PDF
- Drag-to-reorder in compare mode
- Side-by-side comparison table view
