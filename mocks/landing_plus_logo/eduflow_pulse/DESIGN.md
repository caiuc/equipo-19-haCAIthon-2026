---
name: EduFlow Pulse
colors:
  surface: '#FFFFFF'
  surface-dim: '#dcdad2'
  surface-bright: '#fbf9f1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4ec'
  surface-container: '#f0eee6'
  surface-container-high: '#eae8e0'
  surface-container-highest: '#e4e3db'
  on-surface: '#1E293B'
  on-surface-variant: '#454655'
  inverse-surface: '#30312c'
  inverse-on-surface: '#f3f1e9'
  outline: '#767686'
  outline-variant: '#c6c5d7'
  surface-tint: '#3f4cda'
  primary: '#3d4ad8'
  on-primary: '#ffffff'
  primary-container: '#5865f2'
  on-primary-container: '#fffdff'
  inverse-primary: '#bec2ff'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#775700'
  on-tertiary: '#ffffff'
  tertiary-container: '#956f00'
  on-tertiary-container: '#fffdff'
  error: '#EF4444'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e0e0ff'
  primary-fixed-dim: '#bec2ff'
  on-primary-fixed: '#000569'
  on-primary-fixed-variant: '#222fc2'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#ffdf9f'
  tertiary-fixed-dim: '#f9bd22'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#fbf9f1'
  on-background: '#1b1c17'
  surface-variant: '#e4e3db'
  success: '#34D399'
  accent-pink: '#F472B6'
  accent-purple: '#8B5CF6'
  accent-blue: '#60A5FA'
  muted: '#64748B'
  border: '#1E293B'
typography:
  headline-display:
    fontFamily: Outfit
    fontSize: 72px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 52px
    fontWeight: '700'
    lineHeight: 62px
    letterSpacing: 0px
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: 0px
  headline-md:
    fontFamily: Outfit
    fontSize: 38px
    fontWeight: '700'
    lineHeight: 46px
    letterSpacing: 0px
  headline-sm:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: 0px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: 0px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: 0px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0px
  label-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 0.5rem
  sm: 1rem
  md: 2rem
  lg: 4rem
  xl: 6rem
  gutter: 1.5rem
  section: 6rem
---

## Brand & Style

The design system is built for the modern creator-educator, blending the structured clarity of an e-learning platform with the high-energy, tactile feel of a premium SaaS product. The brand personality is optimistic, authoritative yet approachable, and deeply focused on the "pulse" of creative output.

The aesthetic follows a **High-Contrast / Bold** direction with elements of **Brutalism** softened by extreme roundedness. It utilizes thick, defined borders and offset shadows to create a physical, sticker-like depth that makes digital interactions feel tangible. This style ensures that educational content remains legible while the surrounding interface provides a playful, motivating energy.

Key principles:
- **Clarity through Contrast:** Use deep navy borders to define hierarchy.
- **Creator Energy:** Leverage vivid periwinkle and golden-yellow to highlight progress and actions.
- **Tactile Feedback:** Every interactive element should feel like a physical object that can be pressed or moved.

## Colors

The palette is anchored by a sophisticated **Neutral (#FFFDF5)** cream base, which reduces the harshness of pure white while providing a warm, scholarly canvas. 

- **Primary (Periwinkle):** Used for "Flow" states—primary buttons, active navigation, and core branding. It represents the energy of the creator.
- **Secondary (Navy):** The "Ink"—used for all structural elements, including borders and headlines. It provides the grounding force.
- **Tertiary (Golden-Yellow):** The "Pulse"—reserved for shadows, highlights, and achievement markers.
- **Named Accents:** Pink and Purple are used specifically for categorization (e.g., different course tracks) to maintain a vibrant, non-corporate atmosphere.

**Color Application:** All interactive components must feature the **Secondary (#1E293B)** border to maintain the system's signature high-contrast look.

## Typography

This design system uses a dual-font strategy to balance personality with readability. 

**Outfit** is used for all "Brand-Voice" moments: headlines, buttons, and badges. Its geometric weight gives the system a sturdy, confident feel. **Plus Jakarta Sans** handles the "Learning-Voice": all body text, instructional content, and captions. Its soft, humanist curves ensure that long-form educational content is easy to digest.

**Mobile Scaling:** For mobile devices, `headline-display` should be avoided in favor of `headline-lg-mobile`. Body sizes remain consistent across devices to prioritize accessibility and reading ease.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model for desktop to maintain editorial impact, transitioning to a **Fluid Grid** for mobile devices.

- **Grid Model:** 12-column grid on desktop (1280px max-width) with 24px gutters. 
- **Rhythm:** Spacing is strictly based on an 8px base unit. Section-level vertical spacing is set at `96px` (xl) to create a premium, unhurried feel.
- **Reflow:** On tablet, the 12-column grid collapses to 8 columns. On mobile, it switches to a 4-column fluid layout with 16px margins.

Use `spacing-lg` for separating major educational modules and `spacing-sm` for grouping related input fields or controls.

## Elevation & Depth

Depth in this design system is created through **Bold Borders** and **Offset Shadows** rather than traditional blurs. This creates a "Neo-Brutalist" hierarchy that is very easy for users to parse.

- **The "Pulse" Shadow:** Primary cards and buttons use a hard-edged, 4px to 8px offset shadow in **Tertiary (#FBBF24)**. The shadow is always offset to the bottom-right (45 degrees).
- **Outlines:** Every surface (cards, inputs, buttons) must have a 2px solid border in **Secondary (#1E293B)**.
- **Tonal Layers:** For secondary information, use a simple 1px border without a shadow to indicate a lower level of importance. 
- **Interaction:** On hover, the offset shadow should increase in size (e.g., from 4px to 8px), and the element should move -2px on both axes to simulate a "lifting" effect.

## Shapes

The system uses a **Rounded** shape language to offset the "sharpness" of the heavy navy borders. 

- **Base Radius:** 0.5rem (8px) for small components like inputs and small buttons.
- **Large Radius:** 1rem (16px) for cards and content containers.
- **Pill Radius:** Use `rounded-full` for all primary buttons, chips, and tags to create a friendly, "bubbled" aesthetic that invites interaction.

Consistency in corner radiuses is critical; do not mix sharp and rounded corners within the same component.

## Components

### Buttons
Primary buttons are pill-shaped, 60px in height, filled with **Primary (#5865F2)**, and featuring the signature **Tertiary (#FBBF24)** offset shadow. Use `label-md` in white for the text. Secondary buttons are transparent with a navy border and navy text.

### Cards
Cards are the primary container for course content. They must use a white background, 2px navy border, and 32px of internal padding. The offset shadow should be used on cards that are "Featured" or "Active."

### Inputs & Form Fields
Inputs use a pill-shape silhouette with a 60px height. The background is white with a 2px navy border. On focus, the border thickness remains the same, but the internal "Pulse" shadow (Tertiary) appears, signaling the field is active.

### Chips & Badges
Small, highly rounded indicators used for "New," "Live," or "Lesson Category." Badges use a filled **Primary** or **Accent** color with white text, while chips are outlined for secondary metadata.

### Progress Bars
A custom component for the educational focus: use a thick 2px navy container with a **Success (#34D399)** fill. The progress bar should not have rounded ends on the "fill" itself, only on the outer container.