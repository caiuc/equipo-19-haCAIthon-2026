---
name: Expressive Modern
colors:
  surface: '#fff7fb'
  surface-dim: '#efd0f7'
  surface-bright: '#fff7fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ffefff'
  surface-container: '#fde7ff'
  surface-container-high: '#fae0ff'
  surface-container-highest: '#f8d8ff'
  on-surface: '#281330'
  on-surface-variant: '#57414a'
  inverse-surface: '#3e2846'
  inverse-on-surface: '#feebff'
  outline: '#8a707b'
  outline-variant: '#ddbfca'
  surface-tint: '#b2107b'
  primary: '#af0a78'
  on-primary: '#ffffff'
  primary-container: '#cf3192'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffafd5'
  secondary: '#744aa2'
  on-secondary: '#ffffff'
  secondary-container: '#cda0fe'
  on-secondary-container: '#5a3086'
  tertiary: '#006388'
  on-tertiary: '#ffffff'
  tertiary-container: '#007dab'
  on-tertiary-container: '#fcfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd8e8'
  primary-fixed-dim: '#ffafd5'
  on-primary-fixed: '#3d0027'
  on-primary-fixed-variant: '#8a005e'
  secondary-fixed: '#efdbff'
  secondary-fixed-dim: '#dbb8ff'
  on-secondary-fixed: '#2b0052'
  on-secondary-fixed-variant: '#5b3188'
  tertiary-fixed: '#c5e7ff'
  tertiary-fixed-dim: '#7ed0ff'
  on-tertiary-fixed: '#001e2d'
  on-tertiary-fixed-variant: '#004c6a'
  background: '#fff7fb'
  on-background: '#281330'
  surface-variant: '#f8d8ff'
typography:
  headline-lg:
    fontFamily: Dm Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Dm Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Dm Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Dm Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Dm Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.5px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 2px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 16px
  margin: 24px
---

# Design System: Expressive Modern

## Brand & Style
The brand identity has shifted from a utilitarian, public-sector aesthetic to an **Expressive Modern** style. It is designed to evoke creativity, energy, and forward-thinking innovation. By moving away from rigid structures toward a more vibrant and fluid visual language, the UI creates an engaging and memorable experience for the user.

The style leverages high-energy color transitions and organic shapes to balance professional reliability with artistic flair. It is particularly suited for platforms that prioritize user expression and dynamic interaction.

## Colors
The color palette is built on an **Expressive** variant, utilizing high-chroma tones to create a sense of depth and vitality.

*   **Primary (#e040a0):** A vivid magenta-pink that serves as the main driver for action and brand recognition.
*   **Secondary (#7c52aa):** A rich violet that provides a creative bridge between primary actions and supporting content.
*   **Tertiary (#0096cc):** A bright cyan used for accents, highlights, and differentiating information layers.
*   **Neutral (#604868):** A deep, desaturated plum used for text, borders, and structural elements to maintain harmony with the chromatic palette.

The system uses a light color mode as its foundation, ensuring high legibility while allowing the expressive primary colors to pop against clean backgrounds.

## Typography
The system now uses **DM Sans** across all levels. This geometric sans-serif offers a modern, clean, and approachable feel that complements the expressive color palette.

*   **Headlines:** Rendered with bolder weights (600-700) to command attention.
*   **Body:** Maintains a generous line height for readability.
*   **Labels:** Use a medium weight with slight letter spacing to ensure clarity at smaller scales.

## Layout & Spacing
The layout follows a fluid grid system with a 2px base spacing unit. This tight base unit allows for high precision in component density while maintaining a clear 8px rhythmic scale for larger layout shifts.

- **Grid:** 12-column system for desktop, 4-column for mobile.
- **Margins:** 24px global margin for standard containers.
- **Gutters:** 16px fixed gutters between columns to ensure breathable white space.

## Elevation & Depth
Elevation is communicated through **tonal layers** and soft, ambient shadows. Rather than using harsh black shadows, depth is achieved by using subtle tints of the neutral color (#604868) in the shadow properties. 

Higher elevation levels use a slight increase in shadow spread and a subtle background blur (glassmorphism) to indicate importance without breaking the clean, modern aesthetic.

## Shapes
The shape language is **Pill-shaped** (Level 3), significantly softening the interface. This high degree of roundedness reinforces the approachable and friendly nature of the brand. Standard components like buttons utilize fully rounded ends, while containers use large radii for a consistent organic feel.

## Components
- **Buttons:** Fully pill-shaped with primary magenta backgrounds.
- **Cards:** Large corner radii with very soft ambient shadows and neutral-tinted borders.
- **Inputs:** Rounded-pill borders using the neutral color. Focus states utilize a 2px primary color glow.
- **Chips:** High-contrast backgrounds using tertiary cyan or secondary violet to highlight specific metadata.