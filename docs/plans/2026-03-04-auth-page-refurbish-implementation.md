# Implementation Plan: AuthPage Refurbishment

Refurbish `AuthPage.tsx` with an expanded monolithic layout, vertical reveal transitions, and premium UI interactions.

## Task 1: Rebuild Core Container & Styles
- [ ] Expand card width to `max-w-md` and padding to `p-10`.
- [ ] Implement triple-layer glass effect (base, blur, tint).
- [ ] Add double-border highlight on top edge.
- [ ] Update background radial effects and animations for consistency.

## Task 2: Vertical Reveal Logic & Fields
- [ ] Wrap `Full Name` and `Confirm Password` in `AnimatePresence` + `motion.div`.
- [ ] Configure `height: "auto"` and `opacity` transitions.
- [ ] Set `layout` prop on the main card container for smooth resizing.
- [ ] Re-order fields for the requested flow (Full Name -> Email -> Password -> Confirm Password).

## Task 3: Premium UI Components
- [ ] Implement `FloatingLabelInput` helper component or inline logic.
- [ ] Create specialized `IconContainer` with `bg-cinematic-dark/40`.
- [ ] Add `shadow-glow-green` to focus states.

## Task 4: Polish & Button Refinement
- [ ] Update Submit button with higher `py-4` and background `premium-green`.
- [ ] Add `shimmer` animation keyframes/logic.
- [ ] Stagger text reveal for mode toggling ("Sign In" vs "Create Account").
- [ ] Ensure mobile responsiveness.

## Task 5: Verification
- [ ] Run `npm run lint`.
- [ ] Manually verify transition smoothness and form submission.
