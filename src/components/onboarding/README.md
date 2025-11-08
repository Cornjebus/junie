# Onboarding Flow Component

A multi-step onboarding component for Junie that collects user interests (Sparks), values, and dreams.

## Features

- **Three-step flow**: Sparks → Values → Dream
- **Multi-select chips**: Clean, minimal design with hover states
- **Character limit**: 180-character limit on dream input with live counter
- **Progress indicator**: Visual progress bar showing current step
- **Validation**: Each step validates before allowing continuation
- **Mobile-responsive**: Works seamlessly on all screen sizes
- **TypeScript**: Full type safety with exported types

## Usage

```tsx
import { OnboardingFlow } from "@/components/onboarding";

export default function OnboardingPage() {
  const handleComplete = (data) => {
    console.log("Onboarding data:", data);
    // Save to database or proceed to next step
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <OnboardingFlow onComplete={handleComplete} />
    </div>
  );
}
```

## Component Props

```typescript
interface OnboardingFlowProps {
  onComplete?: (data: OnboardingData) => void;
  className?: string;
}

interface OnboardingData {
  sparks: string[];
  values: string[];
  dream: string;
}
```

## Step Details

### Step 1: Sparks
- **Purpose**: Capture user interests
- **UI**: Multi-select chips (20+ pre-defined options)
- **Validation**: At least 1 spark required
- **Options**: Fitness, Tech, Design, Writing, Coaching, etc.

### Step 2: Values
- **Purpose**: Identify core values
- **UI**: Multi-select chips (12 options, max 3 selections)
- **Validation**: 1-3 values required
- **Options**: Impact, Flexibility, Growth, Money, etc.
- **Counter**: Shows "X/3 selected"

### Step 3: Dream
- **Purpose**: Capture user's aspiration
- **UI**: Text area with 180-character limit
- **Validation**: Minimum 20 characters
- **Features**: Live character counter, example inspirations

## Design Decisions

1. **No shadows/gradients**: Clean, flat design as per requirements
2. **Primary color for selection**: Selected chips use primary background
3. **Disabled state**: Values step disables chips after 3 selections
4. **Error handling**: Inline validation messages with descriptive text
5. **Progress bar**: Smooth animated transitions between steps
6. **Back navigation**: Users can go back to previous steps

## Dependencies

- `@/components/ui/card` - shadcn/ui Card components
- `@/components/ui/button` - shadcn/ui Button component
- `@/components/ui/label` - shadcn/ui Label component
- `@/lib/utils` - cn() utility for className merging

## Customization

The component accepts a `className` prop for additional styling:

```tsx
<OnboardingFlow
  className="max-w-4xl"
  onComplete={handleComplete}
/>
```

## Accessibility

- Semantic HTML with proper labels
- Keyboard navigation support
- Screen reader friendly
- Focus states on all interactive elements
- ARIA attributes where appropriate
