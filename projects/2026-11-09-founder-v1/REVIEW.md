# Review – Nextstep4u Tamil Meta ad v1 (HyperFrames)

- Built from the Motion artifact's 9 shots and timings, including the user's retype: "stuck-ah?" -> "Improve aagalaya?".
- Recomposed for Meta 9:16: all words and cards inside y 250–1300; below is texture only.
- Transitions: whip up, colour flood x2, zoom through Mock Test icon, logo card becomes the page, dip cut, whip sideways, zoom through the ₹9 button.
- Measured: `check` passes; line holds fixed (caption, report title, button); contrast fixed on grey lines.
- Looked at: beat sheet, seams, phone sheet, and fixed frames 0.3 s, 16.6 s, 23.75 s.
- Fixed after first look: logo crop had a white box (made transparent); OMR sheets crossed the hook title (moved to edges); score lines crossed "improvement" (moved below 1330).
- Kept on purpose: `film_silent` – picture only; Tamil VO and music are added in the editor.
- Weakest shot: 4 (reveal) is only 1.5 s with no words; it relies on the VO line.

## Sound (v1)
- ElevenLabs: music bed (eleven_music_v2_5, take A: quiet first ~7 s, groove from the logo reveal) and 13 SFX (3 whooshes rotated, 2 pops, thud, riser, coin, success, click, brand hit). Two SFX were unusable (snap ≈ silent, tick −42 dB) and were replaced by pops/thud.
- 46 cues, each placed so its measured peak lands ~1 frame after its picture.
- Measured on the render: −20.6 LUFS integrated, true peak −3.5 dBTP, no clipping; hits at 2.08 (whip), 2.69 (Improve aagalaya), 5.68 (Practice), 11.13 (dip), 15.71 (Exam Ready), 17.4 (₹9), 19.83 (tap). Left quieter than the −14 LUFS social target on purpose so the Tamil VO can sit on top; normalise after the VO is added.
- Not heard by me: listen before publishing.
