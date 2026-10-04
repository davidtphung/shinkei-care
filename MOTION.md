# Sere motion

Sere moves on one spring and a short set of fades. Orange `#FF4400` and cream `#FFEBD0` stay the only brand colors. Motion uses transform and opacity. Nothing bounces. A new gesture replaces the one already running.

Numbers live in `src/motion/tokens.ts`. The spring is critically damped (`zeta` 1, `omega` 14).

## Tab bar

The home nav is one centered tab list. Zine is first, then Hub, Care, Catch, and About. Leaderboard stays a screen you open from Care or Catch, so the indicator hides while that screen is up. An orange indicator sits under the active tab. Its place and width follow the spring, so a second tap takes over mid travel. Pointer down scales the tab to 0.97 with transform only. Hover and focus reveal a cream wash in 140ms and let it go in 220ms.

Arrow keys move between tabs and wrap. Home and End jump to the ends.

On a narrow screen the row scrolls inside the centered bar. It does not widen the page.

## Content

Changing tabs moves the view 8px on one horizontal axis and fades it. The view that leaves and the view that arrives use that same distance. The first view on load does not play this transition. Reduced motion keeps the fade and drops the shift.

## Zine pages

Page turns already use the shared spring. While a page is dragged, a cream sheet eases out under it and settles back when the page is released. Reduced motion keeps the sheet still and only changes its opacity.

The cover shows a small blurred preview at once. The full cover fades in with opacity over 250ms. Reduced motion hides the preview and shows the sharp cover immediately. Stops 2 to 6 show a short title caption on hover and focus, with opacity only. A click still opens the full caption plate. Stop 6 keeps a reserved plate and fades that plate with opacity only, so the page does not jump. Sharing a link shows "Link copied" beside the Share button for 2 seconds. That note is announced with aria-live.

## Entrance

The nav tabs fade and rise 8px in a stagger. Five tabs finish in 480ms, under the 600ms cap. The stagger runs once each page load.

## Cool water

The home ground has two slow cream and orange bands. They move with transform and opacity. The bands pause when the ground is off screen or the document is hidden. Reduced motion removes the shimmer.

## Phone clearance

On a narrow screen the tab bar sits along the bottom. Cabinet pages and play screens keep extra bottom padding so the bar does not cover the last lines.

## Reduced motion

`prefers-reduced-motion` keeps cross-fades. It skips the indicator spring, the content shift, the entrance stagger, the paper shift, the cover preview, and the shimmer. Tab press drops the scale and uses opacity. The stop 6 plate and the hover caption stay opacity only.
