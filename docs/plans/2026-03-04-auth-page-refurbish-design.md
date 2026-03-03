# Design Document: AuthPage Refurbishment

- **Date:** 2026-03-04
- **Topic:** AuthPage Refurbishment (Modern Glass Monolith + Vertical Reveal)
- **Status:** Validated

## 1. Objective
Refurbish the `AuthPage.tsx` to provide a more premium, spacious, and cinematically fluid authentication experience. The current design is perceived as "cramped" and "small," lacking the "wow" factor associated with the rest of the application.

## 2. Architecture & Layout
The layout will maintain its 2-column cinematic split but focuses on the following upgrades:
- **Card Sizing:** Shift from `max-w-xs` (320px) to `max-w-md` (448px).
- **Padding:** Increased internal padding from `p-6` to `p-10`.
- **Surface:** Triple-layer glassmorphism:
    - Base: `bg-cinematic-surface/80`
    - Blur: `backdrop-blur-3xl`
    - Tint: `bg-gradient-to-br from-cinema-green/10 to-transparent`
- **Edges:** Double-border effect using a soft outer stroke and an inner top-edge highlights (white/0.05).

## 3. Components & Interactions

### 3.1 Vertical Reveal Transition
Instead of a static toggle, switching between Sign In and Sign Up will trigger a vertical reveal of extra fields:
- **Sign In Mode:** Show `Email`, `Password`.
- **Sign Up Mode:** Reveal `Full Name` (at the top) and `Confirm Password` (at the bottom) using Framer Motion's height/opacity animations.
- **Card Animation:** Use the `layout` prop on the main card container to ensure a smooth, fluid resize as fields appear/disappear.

### 3.2 Premium Input Fields
- **Floating Labels:** Labels will move from inside the input to the top border on focus/value presence.
- **Icon Boxes:** Icons will be encased in smaller, darker containers (`bg-cinematic-dark/40`) for better visual hierarchy.
- **Focus States:** Suble `shadow-glow-green` and border color shifts.

### 3.3 The "Power" Button
- **Height:** Increased to `py-4`.
- **Effect:** Implementation of a "Shimmer" light-sweep animation that runs every few seconds.
- **Micro-interactions:** Staggered text replacement for the labels (e.g., "Sign In" vs "Create Account").

## 4. Data Flow & Logic
- **State Management:** Keep existing `isSignUp`, `formData`, and `message` states.
- **Validation:** Maintain current password and confirmation logic, triggering only during relevant modes.
- **Supabase Integration:** Hooks into existing `AuthContext` functions seamlessly.

## 5. Testing & Verification
- Verify responsiveness on mobile (should fall back to a single column or adjust card padding).
- Test cross-browser blur performance.
- Ensure form submission works correctly in both modes.
