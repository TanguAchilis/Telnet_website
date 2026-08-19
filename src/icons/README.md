# Telnet icon pack

Every icon on this site is drawn in-house and rendered through one component.
No emoji, no icon library, no pasted `<svg>` blocks.

## Why

The site used emoji (`💻 📹 🎓 🔒 …`) as its service, category and value icons,
plus about forty-five hand-pasted inline SVGs with five different stroke
widths. Emoji render as a different picture on every device: Apple's glossy
3D set on an iPhone, Google's flat set on Android, Microsoft's on a desktop.
The brand had no control over how its own services looked. That mix reads
to visitors as a page assembled from defaults rather than designed, which is
exactly the impression a business asking for money cannot afford.

## Using it

```jsx
import { Icon } from '../icons'

<Icon name="laptop" size={28} />                  // decorative (aria-hidden)
<Icon name="phone" size={16} title="Phone" />     // announced by screen readers
<Icon name="check" size={14} className="tick" />  // colour via CSS `color`
```

| prop        | default | notes                                                 |
| ----------- | ------- | ----------------------------------------------------- |
| `name`      | none    | key from `library.jsx`; unknown names warn in dev      |
| `size`      | `24`    | rendered px; the 24-unit grid scales to fit           |
| `weight`    | auto    | stroke override at 24px; use sparingly               |
| `title`     | none    | omit for decorative icons; supplying it sets `role="img"` |
| `className` | none    | merged with the base `tn-icon` class                  |

Icons inherit `currentColor`, so colour them by setting `color` on the
container, never with a `fill`/`stroke` attribute at the call site.

## The grid

Glyphs live in `library.jsx`, all authored the same way:

- **24 × 24 viewBox**, live area `2 → 22` (2px optical padding)
- **round caps and joins**, stroke set by `<Icon>`, never per glyph
- **`fill="none"`**, with the only exception being brand marks in the `FILLED` set
- **counters ≥ 2px** so nothing fills in at 16px

`<Icon>` nudges the stroke with size (1.8 at ≤16px, 1.6 mid, 1.45 at ≥40px) so
a 14px footer icon and a 38px service icon read as the same weight. Size icons
through the `size` prop, not by scaling the `<svg>` in CSS, because CSS scaling
multiplies the stroke too and breaks that match.

## Brand marks

`whatsapp` is kept as the official glyph and rendered filled. Redrawing a
trademarked mark on our grid would make it less recognisable, and recognition
is the entire job of a brand icon.

## Adding an icon

1. Draw it in `library.jsx` on the grid above.
2. Render the contact sheet and look at it at 44px, 24px and 14px before
   committing. A glyph that works large often closes up small.
3. If it can be stored in the CMS, add it to `SERVICE_ICON_CHOICES` in
   `resolve.js`.

Never inline an `<svg>` in a component. One grid, one stroke weight, one
source of truth. That is the whole point.

## Legacy CMS values

`resolveIconName()` accepts a pack name, a legacy emoji, or junk, and always
returns something drawable. Service rows created before the pack existed still
hold emoji in Postgres; they resolve at render time, and
`supabase/migrations/20260819_services_icon_pack_names.sql` normalises the
column when you choose to run it. The admin service form is a picker over
`SERVICE_ICON_CHOICES` rather than a free-text box, so no new emoji can get in.
