# Sere motion

Sere moves on one spring and a short set of fades. Orange `#FF4400` and cream `#FFEBD0` stay the only brand colors. Motion uses transform and opacity. Nothing bounces. A new gesture replaces the one already running.

Numbers live in `src/motion/tokens.ts`. The spring is critically damped (`zeta` 1, `omega` 14).

## Tab bar

The home nav is one centered tab list. Zine is first. An orange indicator sits under the active tab. Its place and width follow the spring, so a second tap takes over mid travel. Pointer down scales the tab to 0.97. Hover and focus reveal a cream wash in 140ms and let it go in 220ms.

Arrow keys move between tabs and wrap. Home and End jump to the ends.

On a narrow screen the row scrolls inside the centered bar. It does not widen the page.

## Content

Changing tabs moves the view 8px on one horizontal axis and fades it. The view that leaves and the view that arrives use that same distance. The first view on load does not play this transition. Reduced motion keeps the fade and drops the shift.

## Zine pages

Page turns already use the shared spring. While a page is dragged, a cream sheet eases out under it and settles back when the page is released. Reduced motion keeps the sheet still and only changes its opacity.

## Entrance

The nav tabs fade and rise 8px in a stagger. Five tabs finish in 480ms, under the 600ms cap. The stagger runs once each page load.

## Cool water

The home ground has two slow cream and orange bands. They move with transform and opacity. The bands pause when the ground is off screen or the document is hidden. Reduced motion removes the shimmer.

## Reduced motion

`prefers-reduced-motion` keeps cross-fades. It skips the indicator spring, the content shift, the entrance stagger, the paper shift, and the shimmer.
