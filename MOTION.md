# Sere motion

Sere moves on one spring and a short set of fades. Orange `#FF4400` and cream `#FFEBD0` stay the only brand colors. Motion uses transform and opacity. Nothing bounces. A new gesture replaces the one already running.

Numbers live in `src/motion/tokens.ts`. The spring is critically damped (`zeta` 1, `omega` 14).

## Tab bar

The home nav is one centered pill. Zine is first, then Hub, Care, Catch, and About. Leaderboard stays a screen you open from Care or Catch, so the orange pill hides while that screen is up. The active tab is a rounded orange pill with cream type. Its place and width follow the spring, so a second tap takes over mid travel. The pill moves with transform only. Pointer down scales the tab to 0.97 with transform only. Hover and focus show a quiet wash in 140ms and let it go in 220ms.

Arrow keys move between tabs and wrap. Home and End jump to the ends.

On a narrow screen the five labels stay in one centered pill. They do not clip, and the row does not widen the page.

## Content

Changing tabs fades the view and raises it 8px. The view that leaves fades and moves up by that same distance. The first view on load does not play this transition. Reduced motion keeps the fade and drops the rise.

Cards and pills lift 2px on hover and scale to 0.97 on press, both with transform only. Cabinet cards stagger in by 50ms. The fish mascot floats 6px on a slow loop. Reduced motion drops the lift, the stagger shift, and the float.

## Zine pages

Page turns already use the shared spring. While a page is dragged, a cream sheet eases out under it and settles back when the page is released. Reduced motion keeps the sheet still and only changes its opacity.

The cover shows a small blurred preview at once. The full cover fades in with opacity over 250ms. Reduced motion hides the preview and shows the sharp cover immediately. Stops 2 to 6 show a short title caption on hover and focus, with opacity only. A click still opens the full caption plate. Stop 6 keeps a reserved plate and fades that plate with opacity only, so the page does not jump. Sharing a link shows "Link copied" beside the Share button for 2 seconds. That note is announced with aria-live.

## Entrance

The nav tabs fade and rise 8px in a stagger. Five tabs finish in 480ms, under the 600ms cap. The stagger runs once each page load. Cabinet cards use the same rise, staggered by 50ms, each time that screen opens.

## Cool water

The home ground has two slow cream and orange bands. They move with transform and opacity. The bands pause when the ground is off screen or the document is hidden. Reduced motion removes the shimmer.

## Phone clearance

On a narrow screen the tab bar sits along the bottom. Cabinet pages and play screens keep extra bottom padding so the bar does not cover the last lines.

## Reduced motion

`prefers-reduced-motion` keeps cross-fades. It skips the indicator spring, the content shift, the entrance stagger, the paper shift, the cover preview, and the shimmer. Tab press drops the scale and uses opacity. The stop 6 plate and the hover caption stay opacity only.
