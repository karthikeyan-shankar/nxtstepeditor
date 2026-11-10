# Nextstep4u – Tamil Meta ad (9:16)

GOAL:    A TNPSC Group 4 aspirant stops scrolling, sees how Nextstep4u turns practice into marks, and taps "Try it for ₹9".
OUTPUT:  HyperFrames, 1080 x 1920, 30 fps. Meta Reels / Stories ad placement.
TIME:    24.0 s x 30 = 720 frames. Silent picture; Tamil VO + music are laid on later in an editor, one shot per VO line.
SAFE:    Every word and every product card inside y 250–1300 px, x 60–960 (right rail 120 px clear). Below 1330 only texture.

LOOK (only what nextstep4u.in already uses)
- Ground light  #F6F8FB (site shell), card #FFFFFF; ground dark #0D1420 (site night), panels #263243.
- Ink #0D1420; blue #0265E0 (main, highlight on light); amber #FBBC04 (highlight on dark, price); green #00B696 (ready / ticks only); red #D93843 (weak topic only).
- Display: Outfit 700, 150–230 px headlines, tracking -4.5%; body Outfit 500, 40–48 px; Tamil: Meera Inimai 400.
- One highlighted word per shot. Cards: radius 44 px, shadow 0 40px 80px -36px rgba(13,20,32,.35).
- Real assets only: logo (og-card crop, logo.png), mark, story faces, site chips, Mock Test icon, site cards and their copy/figures (example figures stay labelled "Example report").

MOTION
- Text: per-word blur 6px→0 + opacity, 0.13 s, 0.067 s apart, no translate. Landed titles hold dead still.
- Cards/objects arrive: expo.out 0.5–0.7 s from 60–90 px; springs back.out(1.4) on scale only. Exits 40–50% of entrance.
- Background worlds move slowly (drift / scroll); titles never float.
- Transitions (5 kinds, each caused): whip up (hook→stuck), colour flood (stuck→practice, report→ready), zoom through the Mock Test icon (practice→reveal), logo card becomes the world (reveal→mock), dip cut (mock→report), whip sideways (ready→offer), zoom through the ₹9 button (offer→end).
- data-motion-blur on root for whips and zooms.

SHOTS
1 hook     0.0–2.3   TNPSC / Group 4 / prep-ah? on frame 0; five grey aspirant silhouettes pop in; OMR sheets drift.
2 stuck    2.3–5.0   Night score-chart world; Guessing / Unprepared chips; "Marks innum" → "Improve aagalaya?" amber; flat score line; caption.
3 practice 5.0–7.3   Ruled pale-blue page; grey "Padippu mattum podhaadhu." gives way to "Practice" + amber underline + "mukkiyam!"; Mock Test icon fills bubbles.
4 reveal   7.3–8.8   Blue brand ribbons; white logo card springs in. No words.
5 mock     8.8–11.3  Tilted palette world; "Real exam pattern"; Question palette card (clock counts, tiles fill); Full Mock / Mini Mock rows.
6 report   11.3–14.5 Night + lamp beams; Score / Mistakes / Weak areas tags; example AI report counts up; Weakest topic: Indian Polity; "Ellam easy-ah analyse".
7 ready    14.5–17.0 Warm amber page with climbing score lines; four aspirants; progress tags tick to Exam Ready; "Ovvoru test-um improvement".
8 offer    17.0–20.5 Night calendar streak; ₹9 lands; daily challenge card fills M–S; Try it for ₹9 button taps.
9 end      20.5–24.0 White end card; logo with orbiting அ / GS / % and faces; nextstep4u.in; Tamil tagline; button. Held 2 s+.

BANNED: breathing/floating titles, click rings, glow orbs as decoration, everything fading up, logo in a corner, invented UI or numbers, text below y 1300.
QA: frame 0 readable; each cut ±0.2 s; every line ≥ 0.5 s + 0.3 s/word on screen; phone-width sheet readable.
