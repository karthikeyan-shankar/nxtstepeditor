# SPEC — Nextstep4u Tamil Reel ad ("9 marks short")

GOAL:    a TNPSC Group 4 aspirant feels the 9-mark loss, sees the report that shows where marks go,
         and taps through to pay ₹9 for today's Daily Challenge.
OUTPUT:  HyperFrames, 1080 x 1920, 30 fps, no voice. Instagram / Facebook Reels ad.
TIME:    30.0 s = 900 frames. Music bed bgm.mp3 from 2.0 s in: beat = 0.533 s (112.5 BPM),
         film beat k at 0.165 + 0.5333·k s. Scene cuts on beats k = 8, 15, 28, 36, 47.
LOOK:    ground #0B1220 (brand night) with one large soft light field per scene:
         hook red #E5484D @ 34%, report teal #00B696 @ 30%, test blue #0265E0 @ 30%,
         offer blue #0265E0 @ 45%; end card flood to #FFFFFF.
         Ink #FFFFFF on dark, #0D1420 on white. Accent gold #FBBC04: the "9", the ₹9, the end button. Nothing else gold.
         Red #E5484D / amber #FBBC04 / green #00B696 only as the report's own status colours.
         Display: Meera Inimai (the website's Tamil face, one weight, bold synthesised) for Tamil, Outfit 700–800 for Latin and numbers (Outfit first in the stack,
         Tamil falls to Meera Inimai, as the website does with Meera Inimai). Hook line 132 px, titles 92–104 px,
         support lines 60–64 px, never under 28 px. Tracking -2%.
         Medium: the real product UI (final app build 19f7f86, website sample report and ₹9 card),
         rebuilt in HTML with its real labels and numbers; the phone is a black-bezel device,
         radius 96 px, tilted (rotY ±14°, rotX 8°, rotZ ±4°, perspective 2200 px),
         shadow 0 60 120 px rgba(0,0,0,.55). Depth of field: what sits behind the subject is blurred 14–18 px.
OBJECTS: phone (bezel, island, white screen); the website's dark sample-report card; the app's AI report card
         (ring 186 / 300, Mock Test 6, +8 marks, Tamil passed 114/150, Polity 42% / Aptitude 64% / பொதுத் தமிழ் 76%);
         the app's question card (Q 87/200, Indian Polity, Article 17, 1:52:10, 200 Qs · 300 marks);
         the website hero's crossed chips (Guessing, Unprepared, Low Marks); the try.html blue ₹9 card;
         the real logo (assets/img/logo.png).
MOTION:  enter expo.out 0.5–0.7 s; camera / flood power2.inOut 0.6 s; exit power3.in 0.3 s.
         Springs back.out(1.4) on chips and ticks only (position/scale, never opacity).
         Words 0.08 s apart. Titles dead still once landed.
SHOTS:   (rebuilt 9 Nov 2026 after the owner's note: one idea and one short Tamil line per screen,
          nothing the viewer has to stop and read. Effects after Vibha Ramprakash's claude-video-effects, MIT,
          rebuilt in HTML because those scripts track a face and this film has none.)
  1 hook   0.000–5.498  frame 0: "Cut-off-க்கு / 9 மார்க் குறைவு" over the tilted phone: 168 / 300, bar, Cut-off 177.
                        0.9 s reject-stamp "9 MARKS SHORT" slams on the empty screen below the card, frame shakes (impact).
                        2.85 s the line becomes "எங்க போச்சு?" → whip.
  2 report 5.498–12.431 teal flood; "AI Report சொல்லும்"; final-build screen rises, its report card lifts out at 3.4×,
                        ring 0→186, bars fill. 3.4 s the line becomes "எதை படிக்கணும்-னு தெரியும்"; a red marker
                        (scribble) circles Indian Polity 42%, the other subjects dim.
  3 test   12.431–17.231 "Exam மாதிரியே Test"; the question card, timer 1:52:10 running; the cursor taps B Article 17.
  4 offer  17.231–25.232 blue flood (the buying card's blue); select-resize: a selection box grabs a small ₹9 and the
                        cursor drags it to 400 px, the riser lands as the drag ends; "1 Test + முழு AI Report";
                        tape-label "டீ விலையை விட குறைவு"; "Pay ₹9 & start" pops; tap; white iris.
  5 end    25.232–30.000 logo carried in; "இன்றே தொடங்குங்க"; gold "Try it for ₹9 →"; nextstep4u.in;
                        countdown-flip tiles "இன்று இரவு 11:59 PM வரை". Hold ≥ 2.5 s.
BANNED:  "free" anywhere; invented numbers, buyer counts, discounts or fake timers; the date of a single day's
         challenge; the logo docked in a corner; glow, particles, lens flares; three cards in a row;
         every element fading and sliding up; titles drifting after they land; text below y 1330 or above y 168.
QA:      0.0 (thumbnail reads with sound off), 1.5, 3.6, 7.4, 10.4, 14.9, 18.0, 18.9, 20.5, 22.6, 29.1.
