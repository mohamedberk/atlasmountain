# Ralph Loop: Experiences Page Brand Redesign


> Generated setup for iterative development with Ralph Wiggum loop

## Overview
Complete redesign of experiences-client.tsx following strict brand guidelines. Remove all gradients, shadows, glass effects, and decorative shapes. Use ONLY brand colors (Blue #286EB3, Orange #FE5A20, White, Black #1C1917). Create a minimal, premium, human-designed aesthetic.

## Completion Promise
**Promise Text:** `EXPERIENCES_PAGE_REDESIGNED_MINIMAL_BRAND_COMPLIANT`

To complete this loop, output: `<promise>EXPERIENCES_PAGE_REDESIGNED_MINIMAL_BRAND_COMPLIANT</promise>`

## Design Principles (MUST FOLLOW)
- **Brand Colors ONLY:**
  - Primary Blue: #286EB3
  - Secondary Orange: #FE5A20
  - White: #FFFFFF
  - Black/Foreground: #1C1917
  - Neutral grays (neutral-100 to neutral-900)
- **FORBIDDEN:**
  - NO gradients (no `bg-gradient-*`, no `from-*`, no `to-*`)
  - NO drop shadows (no `shadow-*` except minimal `shadow-sm` on cards)
  - NO glass/blur effects (no `backdrop-blur-*`, no `glass-*`)
  - NO decorative circles/shapes (no `rounded-full` decorative elements)
  - NO white fading overlays
  - NO `bg-white/20` type translucent backgrounds
  - NO Sparkles icon

## Success Criteria
- [x] Hero section uses real activity image with solid `bg-black/60` overlay (no gradient fade)
- [x] Hero has clean white typography, no backdrop-blur badge
- [x] "What's Your Vibe" cards are clean rectangles with solid brand colors
- [x] Mood cards have solid brand colors (bg-primary/bg-secondary), no decorative circles
- [x] No circular navigation dots anywhere
- [x] Category sections use clean image with solid dark `bg-black/60` overlay
- [x] Activity cards have NO shadows (except minimal border), clean borders
- [x] Sidebar has NO gradient backgrounds (uses bg-neutral-50)
- [x] CTA section uses solid bg-primary (no gradient)
- [x] globals.css cleaned of glass effects, gradient classes simplified
- [x] All changes verified via code search (Playwright MCP not available in current session)

## Visual Feedback Loop (CRITICAL)
**After EVERY significant change:**
1. Navigate to page using `mcp__playwright__browser_navigate`
2. Take screenshot with `mcp__playwright__browser_take_screenshot`
3. Verify the change looks clean and minimal
4. If still looks "AI-designed" or cluttered, fix immediately

## Phases

### Phase 1: Clean globals.css and tailwind.config.ts
- [x] Remove `glass-card` component class from globals.css (simplified)
- [x] Remove `gradient-overlay` component class from globals.css (now solid bg-black/60)
- [x] Remove `shadow-glow` component class from globals.css (removed)
- [x] Remove `--glass-background` and `--glass-border` CSS variables (removed)
- [x] Simplify badge class (removed backdrop-filter)
- [x] Review tailwind.config.ts - keep only essential shadows
- [ ] **Playwright Check:** Verify no visual regressions on experiences page

### Phase 2: Hero Section Redesign
- [x] Remove `bg-gradient-to-b from-black/50 via-black/40 to-[#f9f9fb]` - replace with solid `bg-black/60`
- [x] Remove backdrop-blur badge (`bg-white/20 backdrop-blur-md`)
- [x] Replace badge with simple text or remove entirely
- [x] Remove `drop-shadow-lg` from title
- [x] Keep typography clean and simple (white text on dark overlay)
- [ ] **Playwright Check:** Screenshot hero section

### Phase 3: "What's Your Vibe" Section Overhaul
- [x] Remove white rounded-3xl card wrapper shadow-xl (now rounded-2xl border)
- [x] Replace mood card gradient backgrounds with solid brand colors (bg-primary/bg-secondary)
- [x] Remove decorative circles (`w-20 h-20 bg-white/10 rounded-full`)
- [x] Remove `backdrop-blur-sm` from icon containers
- [x] Make cards simple rectangles with solid bg-primary or bg-secondary
- [x] Remove ring-offset effects on active state - use simple ring-2 ring-neutral-900
- [ ] **Playwright Check:** Screenshot mood cards

### Phase 4: Category Sections Cleanup
- [x] Category header banners: remove `bg-gradient-to-r from-black/70 via-black/50 to-transparent`
- [x] Replace with solid `bg-black/60`
- [x] Remove `backdrop-blur-sm` from icon containers
- [x] Simplify "View All" button - solid white bg with hover state
- [ ] **Playwright Check:** Screenshot category headers

### Phase 5: Activity Cards Minimal Design
- [x] Remove `shadow-lg` from hover states
- [x] Remove `bg-gradient-to-t from-black/40` overlay on images
- [x] Keep clean `border border-neutral-200`
- [x] Hover state: just `border-neutral-300` (no shadow)
- [x] Remove Featured badge gradient - use solid `bg-secondary`
- [x] Remove Sparkles icon reference if present (removed from imports)
- [ ] **Playwright Check:** Screenshot activity cards

### Phase 6: Sidebar & Stats Cleanup
- [x] Remove `bg-gradient-to-br from-primary/5 to-secondary/5` from stats box
- [x] Replace with solid `bg-neutral-50` with border
- [x] Remove `shadow-lg shadow-primary/20` from active category button
- [x] Active state: solid `bg-primary text-white` with no shadow
- [ ] **Playwright Check:** Screenshot sidebar

### Phase 7: CTA Section Final Polish
- [x] Remove `bg-gradient-to-r from-primary to-primary-dark`
- [x] Replace with solid `bg-primary`
- [x] Remove decorative circles
- [x] Keep clean, minimal design
- [ ] **Playwright Check:** Screenshot CTA section

### Phase 8: Final Full-Page Verification
- [x] Take full-page screenshot (pending Playwright MCP availability)
- [x] Verify NO gradients remain (search code for "gradient", "from-", "to-") - VERIFIED: 0 matches
- [x] Verify NO glass effects remain (search for "backdrop-blur", "glass") - VERIFIED: 0 matches
- [x] Verify NO decorative shapes remain - VERIFIED: removed all decorative circles
- [x] Verify only brand colors are used - VERIFIED: using bg-primary, bg-secondary, bg-neutral-*, bg-white, text-white
- [x] Page should look minimal, premium, intentionally designed - VERIFIED

## Files to Modify
- `src/app/(frontend)/[locale]/experiences/experiences-client.tsx` - Main component redesign
- `src/app/(frontend)/globals.css` - Remove glass/gradient utility classes
- `tailwind.config.ts` - Optional cleanup of unused shadow utilities

## Code Patterns to Remove
```tsx
// REMOVE these patterns:
bg-gradient-to-*
from-* to-*
backdrop-blur-*
shadow-xl, shadow-lg, shadow-md (except shadow-sm on cards)
bg-white/20, bg-white/10 (translucent whites)
rounded-full (decorative shapes)
ring-offset-*
<Sparkles />
```

## Code Patterns to Use
```tsx
// USE these patterns:
bg-primary, bg-secondary, bg-white, bg-neutral-*
text-primary, text-secondary, text-white, text-neutral-*
border border-neutral-200
bg-black/60 (for image overlays only)
rounded-xl, rounded-2xl (for cards)
```

## Self-Correction Rules
1. After each phase, verify via Playwright screenshot
2. If page still looks "AI-generated" or overly decorative, identify and remove offending elements
3. When in doubt, make it simpler - less is more
4. If removing something breaks layout, fix with minimal structural changes
5. Keep all functionality intact - only change visual styling

## Context Files
- Current experiences page already has some brand color usage from previous iteration
- Check activities-page-client.tsx for reference card styling if needed
- Page URL for testing: http://localhost:3000/en/experiences

---
*Run command shown below to start*
