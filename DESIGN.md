---
version: alpha
name: Hostmora Pulse
description: A playful, high-contrast SaaS landing system with bold editorial typography and chunky outlined components.
colors:
  primary: "#5865F2"
  secondary: "#1E293B"
  tertiary: "#FBBF24"
  neutral: "#FFFDF5"
  surface: "#FFFFFF"
  on-surface: "#1E293B"
  error: "#EF4444"
  success: "#34D399"
  accent-pink: "#F472B6"
  accent-purple: "#8B5CF6"
  accent-blue: "#60A5FA"
  muted: "#64748B"
  border: "#1E293B"
typography:
  headline-display:
    fontFamily: Outfit
    fontSize: 72px
    fontWeight: 800
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 52px
    fontWeight: 700
    lineHeight: 62px
    letterSpacing: 0px
  headline-md:
    fontFamily: Outfit
    fontSize: 38px
    fontWeight: 700
    lineHeight: 46px
    letterSpacing: 0px
  headline-sm:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: 700
    lineHeight: 28px
    letterSpacing: 0px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: 500
    lineHeight: 28px
    letterSpacing: 0px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  label-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: 700
    lineHeight: 24px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: 700
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.04em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0px
rounded:
  none: 0px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  full: 9999px
spacing:
  xs: 8px
  sm: 16px
  md: 32px
  lg: 64px
  xl: 96px
  gutter: 24px
  section: 96px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    height: "60px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    height: "60px"
  button-tertiary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
    height: "48px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "32px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    padding: "14px 18px"
    height: "60px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "8px 14px"
  badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
---

# Hostmora Pulse

## Overview
Hostmora feels like a friendly, fast-moving SaaS brand aimed at creators and small teams who want instant results without technical friction. The tone is playful but confident, with bold type, rounded pills, and comic-book-like shadows that make the interface feel energetic rather than corporate. The layout is airy and promotional, using large spacing and a strong hero split between marketing copy and a product mockup.

## Colors
- **Primary (#5865F2):** A vivid periwinkle used for the main call-to-action, badge accents, and active emphasis. It gives the brand its energetic, modern SaaS identity.
- **Secondary (#1E293B):** A deep navy ink used for headline text, borders, and strong UI outlines. It provides the high-contrast structure that keeps the playful palette grounded.
- **Tertiary (#FBBF24):** A warm golden accent used for highlights, glow-like details, and small decorative shadows. It adds optimism and helps separate key surfaces from the light background.
- **Neutral (#FFFDF5):** A soft cream background that replaces stark white and keeps the page warm and approachable. It supports the pastel accents without feeling flat.
- **Surface (#FFFFFF):** Pure white card and panel surfaces, especially in the right-hand upload mockup. This creates clean contrast against the cream canvas.
- **On-surface (#1E293B):** The main readable foreground color for content on light surfaces. It is intentionally the same deep navy as the brand outline color to unify text and borders.
- **Error (#EF4444):** A clear red reserved for invalid states and destructive feedback. It should stay limited so the interface remains cheerful.
- **Success (#34D399):** A bright mint green used for success indicators like lock and “live” states. It signals trust, safety, and completion.
- **Accent-pink (#F472B6):** A lively pink used in tags and gradient-adjacent details. It supports the brand’s friendly, creator-focused feel.
- **Accent-purple (#8B5CF6):** A richer purple accent for secondary highlights and layered badge treatments. It complements the primary blue without competing with it.
- **Accent-blue (#60A5FA):** A lighter blue for supporting UI accents, icons, and informational decoration. It helps add depth without increasing visual noise.
- **Muted (#64748B):** A cool slate tone for supporting text, metadata, and utility labels. It keeps secondary information readable but subdued.
- **Border (#1E293B):** The shared outline color for cards, buttons, and pill edges. Consistent dark borders are a defining part of the system.

## Typography
Headlines use Outfit, a geometric sans with heavy weights and tight, confident spacing. The display scale is bold and compact: the hero headline feels oversized at 72px, while subheads step down through 52px, 38px, and 28px to maintain the same sturdy personality.

Body copy uses Plus Jakarta Sans for a softer, more readable contrast against the sharp headline voice. Body text is medium-weight in larger marketing copy and regular in smaller utility text, helping the interface stay legible across dense informational areas.

Labels and buttons lean on Outfit for a punchier, product-like tone, with slight positive letter spacing to sharpen pill buttons and badges. Small utility text can use a quieter Plus Jakarta Sans treatment, especially for captions, metadata, and legal copy. Uppercase is used sparingly for mini labels and section-eyebrow moments to add structure without overwhelming the playful mood.

## Layout
The page uses a spacious two-column hero layout with a strong editorial split: copy on the left, interactive product mockup on the right. Content sits in a centered, wide container with generous outer margins, allowing the design to breathe on large screens.

Spacing follows a simple rhythmic scale built around 8px, 16px, 32px, 64px, and 96px increments. Small UI clusters use compact gaps, while major sections and hero blocks rely on large vertical breathing room to preserve the landing-page feel.

Cards and panels use substantial internal padding, typically 32px, with wider gutters around content-heavy regions. Rounded pills and compact metadata rows are spaced closely together, creating a dense-yet-readable stack beneath the headline.

## Elevation & Depth
Depth is achieved mostly through bold outlines, offset shadows, and tonal contrast rather than soft blur-heavy elevation. The system favors a handcrafted, sticker-like look: buttons and cards often cast hard-edged shadows to the lower right, making components feel lifted and tactile.

The product mockup card uses a dark outline and a bright yellow offset shadow to create a playful poster effect. Subtle borders are preferred over translucent glass or layered blur, which keeps the style crisp and easy to scan.

## Shapes
The shape language is rounded and friendly, with pills used for buttons, tags, and inputs. Full-radius components are common, while cards use a generous 24px corner radius that keeps large surfaces soft without losing structure.

The system balances rounded containers with sharp, navy borders. This contrast gives the interface a toy-like, approachable quality while still feeling deliberate and premium.

## Components
Buttons are a core visual signature. `button-primary` should be a filled primary action with white text, 2px dark borders, full rounding, and a strong offset shadow. It should feel tall and substantial, around 60px high, with 12px by 24px padding. `button-secondary` should use the same silhouette but remain transparent with dark text and border. `button-tertiary` can be used for smaller supporting actions with a lighter surface treatment.

Button states should stay highly legible and simple: hover can deepen the shadow or slightly darken the fill, while disabled states should reduce saturation and shadow strength. Keep text bold and concise; buttons should read like short commands, not sentences.

Cards should use `card` styling: white surfaces, 24px radius, 32px padding, and a dark outline. The signature look is the offset shadow rather than a soft blur, so avoid replacing it with neutral material shadows.

Inputs should be pill-shaped and bordered, with 60px height and generous horizontal padding. They should read as interactive, high-trust fields with clear contrast and enough room for icons at the leading or trailing edge. Use muted placeholder text and keep the focus ring or active state visually aligned with the primary blue.

Chips and badges should stay compact and rounded, with small typography and clear border treatment. They work best as status markers, integration labels, or feature callouts. Use the `chip` token for neutral pills and `badge` for stronger highlighted labels.

Iconography is simple and functional, often paired with badges or buttons. Small circular status dots, check icons, and lock symbols fit the brand best when enclosed in rounded containers with the same dark outline language.

## Do's and Don'ts
- Do use Outfit for headlines, buttons, and high-emphasis labels to preserve the brand’s bold personality.
- Do keep layouts airy with large vertical spacing and clear separation between marketing copy and product UI.
- Do use dark outlines and offset shadows to create depth instead of soft, generic elevation.
- Do keep buttons pill-shaped and substantial so primary actions feel confident and easy to tap.
- Don't introduce sharp-cornered components as a default; they will clash with the friendly, rounded system.
- Don't rely on muted gray-only interfaces; the brand needs vivid accent colors to feel alive.
- Don't overuse gradients or complex glass effects; the design works best when surfaces stay clean and crisp.
- Don't make supporting text as heavy as headlines; preserve the contrast between Outfit display hierarchy and Plus Jakarta Sans body copy.