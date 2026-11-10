# Styles: how to build one

A style is a reusable ad template: a HyperFrames project whose words and options people change in the Studio
(script → storyboard → approve), and that Claude renders. People bring the content; the style brings the motion.
Every style uses the same brand, the product's real screens, and the same brand close.

Start one with `node scripts/new-style.mjs <id> "<Name>"` (copies `_base/`). `website/` is the founder's ad
made editable; `_base/` is the starter (one headline shot + the brand close `end`).

## Folder

```
styles/<id>/
  index.html          root: one scene host per shot (in order), music + sound effects. Nothing visual here.
  compositions/<shot>.html   one file per shot, the shot id = file name = composition id
  style.json          what the Studio shows and edits (see below)
  picks.data.js       window.NS_PICKS = window.NS_PICKS || {};   (a board overwrites it at render time)
  assets/brand.css    SHARED: same file in every style, never edit it per style
  assets/picks.js     SHARED: same file in every style, never edit it per style
  assets/fonts/ logo/ music/ sfx/ kit/   only what this style uses
```

## The rules every frame follows

- **Brand only.** Colours from `brand.css` (`var(--ns-blue)` etc.: the website's own tokens). Fonts: Outfit for
  Latin, Meera Inimai for Tamil script (`class="ns-ta"`). No other fonts, no colours outside the palette.
- **The real product.** Every screen, card or chart shown is the real product: images from `app-kit/` copied into
  `assets/kit/` (as .jpg, at most 1080 px wide: `ffmpeg -i app-kit/app/welcome-1.png -vf "scale='min(1080,iw)':-2" -q:v 3 assets/kit/welcome-1.jpg`),
  or a faithful rebuild in HTML of a real component (same words, same numbers, same colours). Never a made-up
  screen, feature, or number. Generic stand-ins are fine for things that are not our product (a lock screen, a
  chat bubble, a notebook), but never another company's logo, brand colours or UI (no WhatsApp, Instagram,
  Gmail, Apple or Google look-alikes).
- **Copy.** Never "free". Never promise a job, rank, marks, a pass, or "results". No invented numbers,
  testimonials, buyer counts or countdowns. Illustrative figures (the sample report's 168/300 etc.) carry an
  "Example report" label (`<span class="ns-example">Example report</span>`). The app is not on Google Play: the
  call to action is the website, nextstep4u.in. Styles are evergreen: no price on screen (₹9 is a sale, normal ₹15;
  a priced ad is a board note, not a style). Shared facts: `_base/facts.json`.
- **Words.** Short. One idea per shot, readable in about a second. Defaults in Tanglish (Tamil words in English
  letters: "prep-ah?", "Enga start pannradhu?") or simple Tamil script; product words stay English
  (Mock Test, AI report, Daily Challenge, Solutions). Tamil script lines must be correct, natural Tamil: when in
  doubt, use Tanglish.
- **Frame.** 1080 × 1920. Keep words and key UI inside x 60–960, y 200–1560 (Reels covers the top, the bottom
  ~360 px and the right edge). The first frame (t = 0) already shows the hook (it is the thumbnail). Hook in the
  first 1.5 s; never open on the logo. Total 15–25 s; shots 1.6–5 s.
- **Close.** Keep the `end` shot from `_base` (the app's launch reveal, then nextstep4u.in). You may restyle its
  ground or add a line, not replace the reveal.

## A shot (compositions/<shot>.html)

```html
<template>
  <style>
    #root { position: absolute; inset: 0; overflow: hidden; background: var(--ns-shell); font-family: var(--ns-latin); }
    #quiz-card { ... }            /* EVERY id and class starts with the shot id: quiz-, quiz-card, .quiz-opt */
    #root[data-mode="dark"] #quiz-card { ... }    /* a pick: absent = the ★ choice */
  </style>
  <div id="root" data-scene="quiz" data-composition-id="quiz" data-width="1080" data-height="1920">
    <div id="quiz-q" class="ns-ta" data-edit="quiz.q" data-fit="40">திருக்குறளில் எத்தனை அதிகாரங்கள்?</div>
    <div id="quiz-head" data-edit="quiz.head" data-split data-wclass="quiz-w" data-hl="quiz-hl" data-fit="16">10 sec-la *answer* pannunga</div>
  </div>
  <script>
    const pick = NSPicks.apply("quiz");          // FIRST line: puts the board's text and picks in
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#quiz-head .quiz-w", { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.4 }, 0);
    if (pick("answer", "b") === "c") { ... }      // a pick read in code
    window.__timelines["quiz"] = tl;              // key = shot id
  </script>
</template>
```

- `data-edit="<shot>.<key>"`: text people can change. The scene's HTML holds the default, as plain text; it must
  equal the field's `default` in style.json. `data-split` = one `<span class="w">` per word (for word-by-word
  motion; animate `#id .<wclass>`), `*word*` gets the `data-hl` class, `data-fit="N"` shrinks the line past N
  letters (Tamil counted as a reader sees letters). Set N to what really fits at the designed size.
- Picks: `style.json` lists choices; the root gets `data-<key>="<value>"` (only when not the ★ choice), and code
  reads `pick("<key>", "<★ value>")`. Use picks for real alternatives (a ground, which screen, a layout, on/off).
- Timeline: one paused GSAP timeline per shot, registered under the shot id, as long as the shot. Deterministic:
  no `Math.random` (seed your own), no `repeat: -1`, no CSS animations or transitions, no timers, no fetch.
- Only GSAP (loaded by the root). No other script libraries, no WebGL/canvas libraries: CSS 3D transforms, SVG
  and canvas 2D drawn deterministically are fine.
- No nested compositions. A registry block or component is a source of technique: install it in a scratch
  project (see below), read it, and rebuild what you need inside your shot with our brand.
- Images: `src="assets/kit/x.jpg"` / `url("assets/kit/x.jpg")`, always relative and starting with `assets/`.

## style.json

```json
{ "id": "quiz-hook", "name": "Quiz hook", "by": "Claude, 2026-11-10",
  "about": "One or two sentences: what the viewer sees, the look, the length.",
  "voice": "How the on-screen words should sound (language, length, tone).",
  "music": "assets/music/bed-b.mp3", "poster": 1.2,
  "inspired": ["hyperframes registry: conic-progress-ring", "hyperframes registry: gesture-tap"],
  "goodFor": ["Ad angles this style suits, 3-5 short lines"],
  "kit": ["app/welcome-1", "website/solutions"],
  "shots": [
    { "id": "quiz", "title": "The question", "job": "What this shot must do, for the person writing the words.",
      "fields": [ { "key": "quiz.q", "label": "Question", "default": "…", "fit": 40, "hint": "optional help" } ],
      "picks": [ { "key": "quiz.answer", "label": "Correct option", "choices": [
          { "value": "b", "label": "B", "star": true }, { "value": "c", "label": "C" } ] } ] }
  ] }
```

Shots in the same order and with the same ids as `index.html`. Exactly one ★ per pick. `poster` = the second of
the film that best shows the style (the Studio's style gallery still). Keep `end` as the last shot.

## Sound

Music beds in `../../sound/music` (bed-a, bed-b, jersey_bgm), effects in `../../sound/sfx` (whoosh, pop, click,
tick, thud, riser, success, snap, coin, brand, tension). Copy what you use into `assets/`. In `index.html`: the bed
at volume ~0.14–0.18 with fades, effects on the key moments at 0.2–0.6, on their own track indexes.

## Checking a style (every time)

```
cd styles/<id>
npx --yes hyperframes@0.9.26 check            # 0 errors. Fix overlaps, overflow, unread lines.
npx --yes hyperframes@0.9.26 snapshot --at 0.4 --at 3.1 ...   # one moment per shot, then LOOK at the PNGs
```

Then test the picks: write a `picks.data.js` with every non-★ choice and longer text, snapshot again, look, and
put the default back (`window.NS_PICKS = window.NS_PICKS || {};`). `line_unread`/`console_warning` warnings caused
by word spans are acceptable; real overlaps and cut-off text are not.

## Registry blocks (technique source)

```
mkdir -p .registry/<id> && cp -r styles/_base/. .registry/<id>/ && cd .registry/<id>
npx --yes hyperframes@0.9.26 add <block-or-component> --json
```
`.registry/` is git-ignored. `npx --yes hyperframes@0.9.26 catalog "<words>" --json` searches the ~450 blocks.

## The kit: which real screens to use

`app-kit/catalog.json` lists everything. The useful ones:

| Kit | What it shows | Watch out |
| --- | --- | --- |
| app/welcome-1 | "Full Group 4 mock tests": a question card (Q 87/200, "Which Article abolishes untouchability?", Article 17 picked), 200 Qs · 300 marks | |
| app/welcome-2 | "A Daily Challenge every day": 25 questions, 23:00 minutes, streak days, ends 11:59 pm | |
| app/welcome-3 | "Know exactly what to study next": AI report card (Mock Test 6, 186/300, section bars) | it shows "+8 marks": label it Example, or crop it out |
| app/play-1-welcome … play-5-tests | Play Store screens 1080×1920: welcome, sign in, choose exam, Home (வணக்கம், Full Mock, Daily Challenge, streak, tab bar), Tests | |
| app/sign-in, app/help, app/notifications | sign in (Google), help, notifications (empty state) | |
| elements/sample-report-card | the dark "Example report" card: 168/300, cut-off 177, 9 marks short, attempted 186/200, accuracy 68%, where the marks went (four topic bars) | keep its Example label |
| website/sample-report (+ full/) | the sample report page | |
| website/solutions (+ full/) | Solutions: every question with the answer, your choice and an explanation; filters Wrong / Correct but slow / Changed answer / Skipped | it says "Product demo … sample data" |
| website/tnpsc-group-4-syllabus, -cutoff, vao-exam-pattern, faq, about | guides | |
| website/index, website/try, website/daily-challenge, elements/try-offer-card, elements/home-hero, app/checkout | show ₹9 | not in an evergreen style, or crop the price out |
| website/attempt, website/result, website/report | empty states / sign-in | not useful |

Signed-in app screens (a real test in progress, the app's report, review) are not captured yet: rebuild them in
HTML from the real components above if a shot needs them, with the same words and look.
