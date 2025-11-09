# CareTrek Color Theme

## Color Palette

### Primary Colors
- **Primary**: `#2F855A` (Deep green)
- **Primary Light**: `#48BB78` (Light green)
- **Accent**: `#E2B97C` (Warm beige)

### Background & Surface
- **Background**: `#FFFBEF` (Soft cream)
- **Surface**: `#FFFFFF` (White)
- **Border**: `#E5E5E5` (Light gray)

### Text Colors
- **Text Primary**: `#1A202C` (Dark gray/black)
- **Text Secondary**: `#4A5568` (Medium gray)
- **Text Light**: `#718096` (Light gray)

### Status Colors
- **Success**: `#38A169` (Green)
- **Warning**: `#ED8936` (Orange)
- **Error**: `#E53E3E` (Red)

## Dark Mode Colors
- **Background**: `#171923` (Dark blue-gray)
- **Surface**: `#2D3748` (Darker blue-gray)
- **Text Primary**: `#F7FAFC` (Off-white)
- **Text Secondary**: `#CBD5E0` (Light gray)

## CSS Variables
```css
:root {
  --color-primary: #2F855A;
  --color-primary-light: #48BB78;
  --color-accent: #E2B97C;
  --color-bg: #FFFBEF;
  --color-surface: #FFFFFF;
  --color-border: #E5E5E5;
  --color-text-primary: #1A202C;
  --color-text-secondary: #4A5568;
  --color-text-light: #718096;
  --color-success: #38A169;
  --color-warning: #ED8936;
  --color-error: #E53E3E;
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #171923;
    --color-surface: #2D3748;
    --color-text-primary: #F7FAFC;
    --color-text-secondary: #CBD5E0;
  }
}
```

## Usage in Tailwind
These colors are automatically available in your Tailwind CSS classes. For example:
- `bg-primary` - Primary background color
- `text-text-primary` - Primary text color
- `border-border` - Border color
- `hover:bg-accent` - Hover state with accent color

## Design Tokens
- **Font Family**: Geist (Sans & Mono)
- **Border Radius**: `0.5rem` (rounded-lg)
- **Shadow**: 
  - Default: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`
  - Hover: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`
