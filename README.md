# Nextstep4u Studio

Everything we use to make Nextstep4u ads and videos, in one place, and the editor that ties it together.

**The Studio (editor):** https://claude.ai/artifact/7v5JQcnG1Gp6tzAtiCMvZK
Private: its owner shares it with the founder from the page's Share menu (as Editor, so he can edit and approve).

## How an ad gets made

1. **Script.** Open the Studio, pick or start an ad, paste the script (Tamil, Tanglish or English), choose a
   style from the gallery under it ("Watch it" plays a style with its own sample words) and press
   **Draft the storyboard**. Claude turns the script into the style's shots: the on-screen line for every
   shot, the voice line under it, and the picks.
2. **Storyboard.** Play it. Change any line (long lines shrink to fit), pick options from the chips
   (★ = recommended), and write **Changes for Claude** for anything the picks can't do yet: another app
   screen, a new shot, a different move. The Kit tab has every website page and app screen; copy a reference
   like `kit:app/welcome-3` into a note.
3. **Approve.** Then, in Claude Code in this folder, say **"render the approved Studio board"**. Claude reads the
   board, builds the project (`scripts/apply-board.mjs`), makes the noted changes, adds the voice and music,
   renders it, and posts the video back into the Studio.

Both of us work on the same boards: changes save as you type and show up for the other person.

## What's in here

| Folder | What |
| --- | --- |
| `studio/` | The Studio page source (`studio.src.html`). `npm run studio` builds `studio/dist/` to publish. |
| `styles/` | Video styles: each is a HyperFrames project whose text and options are editable from the Studio, so one style serves many ads. `website/` is the founder's first ad (9 Nov 2026), made editable; `_base/` is the starter every new style is copied from. How to build one: `styles/README.md`. |
| `app-kit/` | The product as it looks today: every public page of nextstep4u.in, the final app build's screens and key components, with `catalog.json`. `npm run kit` re-captures it. |
| `brand/` | Logo (incl. the app's launch layers), fonts (Outfit, Meera Inimai), the drawn students, faces. |
| `sound/` | Sound effects and music beds (the founder's ElevenLabs set). |
| `projects/` | Every ad made so far, as editable HyperFrames projects. |
| `finals/` | The finished videos. |
| `scripts/` | `capture-kit`, `build-studio`, `test-studio`, `posters`, `new-style`, `apply-board`. |

## Keeping the kit current

When the website or the app changes, run `npm run kit` (needs Chrome; finds puppeteer-core in the npx cache or
run `npm i puppeteer-core`). Signed-in app screens (home, tests, daily, report…) need the app's dev sandbox:
start `scripts/app-dev.mjs` in the Android worktree and run `APP_URL=http://localhost:8970 npm run kit`.
Then `npm run studio` and republish, so the Studio's Kit tab shows the new screens.

## Rules every ad follows

- Only the product's real screens, palette (blue #0265E0, green #00B696, gold #FBBC04, night #0D1420) and fonts.
- Never "free". Never promise a job, rank, marks or a pass. No invented numbers, testimonials or countdowns;
  example figures stay labelled "Example report".
- ₹9 is a sale price (normal ₹15): check the live price before a priced ad goes out, or keep the ad evergreen.
- The Android app is live on Google Play (12 Nov 2026, "Nextstep4u", com.nextstep.user): the call to action is Google Play or nextstep4u.in.
