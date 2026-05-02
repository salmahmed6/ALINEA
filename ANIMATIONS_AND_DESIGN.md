# ALINEA - Animations & Design System

## Overview
ALINEA has been enhanced with smooth animations, vibrant gradients, and a premium dark luxury design using black and purple throughout the application.

## Color Palette
- **Primary**: #9d4edd (Purple)
- **Secondary**: #5a189a (Deep Purple)
- **Accent**: #c77dff (Bright Purple)
- **Background**: #0a0a0a (Deep Black)
- **Card**: #1a1a1a (Dark Gray)
- **Foreground**: #f5f5f5 (Off-White)

## Animations Added

### Page Transitions
- **fadeInUp**: Elements fade in and slide up from bottom (0.6s)
- **fadeInDown**: Elements fade in and slide down from top (0.6s)
- **slideInRight**: Elements slide in from left (0.5s)
- **slideInLeft**: Elements slide in from right (0.5s)

### Interactive Effects
- **pulse-glow**: Pulsing glow effect around primary elements
- **float**: Subtle floating motion for logos and badges
- **gradient-shift**: Animated gradient background shifts
- **spin-slow**: Slow 360° rotation for loading states
- **shimmer**: Light shimmer effect on hover
- **bounce**: Bouncing animation for icons

### Page-Specific Animations

#### Landing Page
- Animated gradient background with floating blur orbs
- Staggered fade-in animations for hero elements
- Floating ALINEA logo with glow effect
- Animated feature cards with hover lift effect
- Gradient text on main title with animation

#### Onboarding Page
- Archetype cards with animated gradients and glow
- Staggered animations for each archetype option
- Selected archetype shows animated selection indicator
- Smooth transitions between color states
- Gradient backgrounds with animated blur orbs

#### Dashboard Page
- Animated header with fade-in-down effect
- Staggered stat cards with individual animations
- Gradient text for key metrics
- Hover lift effect on all interactive cards
- Animated background pulses in different positions

#### Transaction Interceptor
- Modal fade-in with blur backdrop
- Animated status icon with bounce effect
- Gradient-colored score display with pulse glow
- Animated signal breakdown cards
- Smooth progress bar animations
- Gradient buttons with shimmer on hover

## Design Enhancements

### Gradient Backgrounds
- `.bg-gradient-primary`: Linear gradient from purple to bright purple
- `.bg-gradient-secondary`: Linear gradient from deep purple to purple
- `.bg-gradient-dark`: Linear gradient for dark backgrounds
- All pages use animated blur orbs for visual depth

### Glow Effects
- `.glow-primary`: Soft purple glow around elements
- `.glow-primary-lg`: Larger purple glow for prominent elements
- `.glow-accent`: Bright purple accent glow
- Applied to logos, important buttons, and highlighted cards

### Glass-morphism
- Semi-transparent card backgrounds with backdrop blur
- Border colors use primary/accent colors with transparency
- Creates premium, layered appearance

### Hover States
- `.hover-lift`: Elements lift up on hover with shadow
- Smooth transition to new position and shadow
- Applied to all interactive cards and buttons

## CSS Classes Reference

### Animation Classes
```css
.animate-fade-in-up      /* Fade in from bottom */
.animate-fade-in-down    /* Fade in from top */
.animate-slide-in-right  /* Slide in from left */
.animate-slide-in-left   /* Slide in from right */
.animate-pulse-glow      /* Pulsing glow effect */
.animate-float           /* Subtle floating motion */
.animate-gradient-shift  /* Animated gradient */
.animate-spin-slow       /* Slow rotation */
.animate-shimmer         /* Light shimmer effect */
```

### Utility Classes
```css
.transition-smooth       /* Smooth 300ms transition */
.hover-lift              /* Lift on hover */
.glow-primary            /* Purple glow */
.glow-accent             /* Bright purple glow */
.bg-gradient-primary     /* Purple gradient */
.bg-gradient-secondary   /* Deep purple gradient */
.bg-gradient-dark        /* Dark gradient */
```

## Animation Delays
Most animated elements use staggered delays for cascade effect:
```
delay-0.1s, delay-0.2s, delay-0.3s, etc.
```
This creates a smooth sequential appearance rather than all at once.

## Browser Support
All animations use standard CSS and Tailwind utilities:
- Chrome 60+
- Firefox 55+
- Safari 12.1+
- Edge 79+

## Performance Tips
- Animations use CSS transforms and opacity (GPU-accelerated)
- Backdrop blur is applied with `backdrop-blur` for smooth performance
- Pulse/glow effects use box-shadow which doesn't trigger layout shifts
- All transitions have appropriate duration (300-600ms) for smooth feel without feeling slow

## Customization
To modify animation speeds, edit values in `/app/globals.css`:
- Change `duration-300` to `duration-500` for slower transitions
- Modify `@keyframes` for different animation styles
- Adjust color values for different accent colors

---

**Last Updated**: Phase 2 - Animations & Design Enhancement
