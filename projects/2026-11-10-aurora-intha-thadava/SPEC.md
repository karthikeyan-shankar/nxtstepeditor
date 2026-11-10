# SPEC — Nextstep4u "அடுத்த படி" (Your next step)

GOAL:    a Tamil Nadu Group 4 aspirant feels seen (the family's hope, the nights, not knowing where the marks go),
         then relieved, and goes to nextstep4u.in to try today's challenge.
REFERENCE: the owner's Instagram reference (VID_20261109_083613_888.mp4): a dreamy pastel product film - typed lines with
         a caret, glass pills joined by light-lines, floating glossy UI, rack-focus real screens, a glass input at the end.
         Its outer frame (a phone filming a monitor, a person) was left out by the owner's choice: full-screen 9:16.
OUTPUT:  HyperFrames, 1080 x 1920, 30 fps, 33.0 s = 990 frames. Tamil voiceover added later (VO_SCRIPT.md); no price
         shown (evergreen - the landing page shows today's price).
LOOK:    two worlds. NIGHT #05060B with a blue/violet/pink aurora band (blurred 64 px colour fields, drifting +-30 px)
         and 7% film grain; DAWN cream #F8F5F2 -> lavender #ECE8F8 with a pastel aurora. Night type #F4F5FF with a
         34 px periwinkle glow; dawn type #1E2133. Accent: the report's own red on the weak subject; the brand
         blue only on the Go button and the URL; the logo once, at the end.
         Type: Meera Inimai (Tamil, website's face) + Outfit (Latin), 84-104 px lines, one line on screen at a time.
         Glass: white 62%->24% gradient, 2 px white edge, 18 px backdrop blur. Light-lines: 5 px white core + 20 px
         blurred tint, drawn by stroke offset.
TYPING:  assets/lib.js splits each line into grapheme clusters (Intl.Segmenter) so Tamil vowel signs never split,
         reveals one cluster per step, caret blinks every 0.5 s (finite toggles).
SHOTS:   (re-cut to the owner's approved script "இந்த தடவ", 33 s; voices in VO_SCRIPT.md)
  1 amma    0.0-5.0   frame 0: "“இந்த தடவ வேலை|" typed (thumbnail); "கிடைச்சிருமா?”" completes; "— அம்மா".
  2 worry   5.0-11.0  OMR sheets drift; "ராத்திரி முழுக்க படிக்கிறேன்…" deleted, "எங்க தப்புனு தெரியல." typed;
                      a light-line enters (9.4 s), blooms, night floods to dawn (10.2-10.8 s).
  3 clarity 11.0-19.0 "கவலைப்படாத." ; nextstep4u.in chip; Mock Test -> AI Report -> General Studies joined by light;
                      the cursor picks General Studies, it turns red.
  4 report  19.0-23.0 "இங்க தான் மார்க் போகுது!" ; the app's report card (EXAMPLE REPORT): பொதுத் தமிழ் 76%,
                      General Studies 42% (red, glowing), Aptitude 64%.
  5 end     23.0-33.0 "உங்க Weakness / என்ன?" ; a glass bar types nextstep4u.in, Go pressed; final screen: logo and
                      nextstep4u.in only (owner removed the tagline).
SOUND:   music (to choose): soft piano, sparse in the night, strings swell at the dawn flood (10.2 s), warm resolve at
         the logo (27.6 s); ducked about 18 dB under the voices. SFX few and soft: light-line, flood, pill pops, clicks.
CLAIMS:  25 questions / 23 minutes / Tamil & English / AI report after every test - backend challenge-bank.ts and the
         public /api/daily-challenge; the report card is the app's illustration, labelled EXAMPLE REPORT.
BANNED:  "free"; any price (evergreen); promising a job, rank or marks; invented numbers; a real person's face or name;
         an AI chat assistant (the reference's ending) - we do not have one; text below y 1330 or above 168.
