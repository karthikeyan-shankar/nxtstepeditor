# One-time: marks the founder's v1 scenes as an editable style (data-edit keys, picks, NSPicks.apply).
# Kept for the record of what changed from his original; not needed again.
import io, re, sys
BASE = sys.argv[1]
C = BASE + "/compositions/"

def ed(p, pairs):
    s = io.open(p, encoding="utf-8").read()
    for a, b in pairs:
        if a not in s:
            raise SystemExit(f"MISSING in {p}: {a[:90]}")
        s = s.replace(a, b, 1)
    io.open(p, "w", encoding="utf-8").write(s)

def root(scene):
    return (f'<div id="root" data-composition-id="{scene}"', f'<div id="root" data-scene="{scene}" data-composition-id="{scene}"')

def start(scene):
    return ('    const tl = gsap.timeline({ paused: true });', f'    NSPicks.apply("{scene}");\n    const tl = gsap.timeline({{ paused: true }});')

ed(C + "hook.html", [root("hook"), start("hook"),
    ('<p class="b"><span class="w">TNPSC</span></p>', '<p class="b" data-edit="hook.l1" data-split><span class="w">TNPSC</span></p>'),
    ('<p class="b"><span class="w">Group</span> <span class="w">4</span></p>', '<p class="b" data-edit="hook.l2" data-split><span class="w">Group</span> <span class="w">4</span></p>'),
    ('<p><span class="w">prep-ah?</span></p>', '<p data-edit="hook.l3" data-split><span class="w">prep-ah?</span></p>'),
    ('    .w { display: inline-block; }', '''    .w { display: inline-block; }
    /* pick hook.crowd: grey aspirants (default) | the drawn students | none */
    #hook-faces { position: absolute; left: 0; right: 0; top: 1040px; display: none; justify-content: center; gap: 22px; }
    .hook-face { width: 150px; height: 150px; border-radius: 50%; overflow: hidden; border: 5px solid #FFFFFF; box-shadow: 0 0 0 3px #0265E0, 0 14px 30px -12px rgba(13,20,32,.3); }
    .hook-face img { width: 100%; height: 100%; display: block; }
    #root[data-crowd="students"] #hook-ghosts, #root[data-crowd="none"] #hook-ghosts { display: none; }
    #root[data-crowd="students"] #hook-faces { display: flex; }'''),
    ('      <div id="hook-ghosts">', '''      <div id="hook-faces">
        <span class="hook-face"><img src="assets/students/student-1.webp" alt=""/></span>
        <span class="hook-face"><img src="assets/students/student-4.webp" alt=""/></span>
        <span class="hook-face"><img src="assets/students/student-7.webp" alt=""/></span>
        <span class="hook-face"><img src="assets/students/student-2.webp" alt=""/></span>
        <span class="hook-face"><img src="assets/students/student-5.webp" alt=""/></span>
      </div>
      <div id="hook-ghosts">'''),
    ('tl.fromTo(".hook-ghost", { opacity: 0, scale: 0.6 }', 'tl.fromTo(".hook-ghost, .hook-face", { opacity: 0, scale: 0.6 }'),
])

ed(C + "stuck.html", [root("stuck"), start("stuck"),
    ('</i>Guessing</span>', '</i><b data-edit="stuck.chip1">Guessing</b></span>'),
    ('</i>Unprepared</span>', '</i><b data-edit="stuck.chip2">Unprepared</b></span>'),
    ('<p id="stuck-l1"><span class="w">Marks</span> <span class="w">innum</span></p>', '<p id="stuck-l1" data-edit="stuck.l1" data-split><span class="w">Marks</span> <span class="w">innum</span></p>'),
    ('<p class="stuck-big"><span class="w stuck-hit">Improve</span></p>', '<p class="stuck-big" data-edit="stuck.big1" data-split data-wclass="stuck-hit"><span class="w stuck-hit">Improve</span></p>'),
    ('<p class="stuck-big"><span class="w stuck-hit">aagalaya?</span></p>', '<p class="stuck-big" data-edit="stuck.big2" data-split data-wclass="stuck-hit"><span class="w stuck-hit">aagalaya?</span></p>'),
    ('<p id="stuck-cap">', '<p id="stuck-cap" data-edit="stuck.cap" data-split>'),
    ('    .w { display: inline-block; }', '''    .w { display: inline-block; }
    .stuck-chip b { font-weight: inherit; }
    /* pick stuck.accent: amber (default) | red */
    #root[data-accent="red"] .stuck-big { color: #D93843; }
    #root[data-accent="red"] #stuck-line { stroke: #D93843; }
    #root[data-accent="red"] #stuck-dot { fill: #D93843; }'''),
])

ed(C + "practice.html", [root("practice"), start("practice"),
    ('<p><span class="w">Padippu</span> <span class="w">mattum</span></p>', '<p data-edit="practice.a1" data-split><span class="w">Padippu</span> <span class="w">mattum</span></p>'),
    ('<p><span class="w">podhaadhu.</span></p>', '<p data-edit="practice.a2" data-split><span class="w">podhaadhu.</span></p>'),
    ('<p id="practice-word">Practice</p>', '<p id="practice-word" data-edit="practice.word">Practice</p>'),
    ('<p id="practice-must"><span class="w">mukkiyam!</span></p>', '<p id="practice-must" data-edit="practice.must" data-split><span class="w">mukkiyam!</span></p>'),
])

ed(C + "reveal.html", [root("reveal"), start("reveal")])

ed(C + "mock.html", [root("mock"), start("mock"),
    ('<p class="b"><span class="w">Real</span> <span class="w">exam</span></p>', '<p class="b" data-edit="mock.t1" data-split><span class="w">Real</span> <span class="w">exam</span></p>'),
    ('<p><span class="w">pattern</span></p>', '<p data-edit="mock.t2" data-split><span class="w">pattern</span></p>'),
    ('<span><b>Group 4 Full Mock</b><small>200 questions · Tamil &amp; English</small></span><em>3 h</em>', '<span><b data-edit="mock.r1name">Group 4 Full Mock</b><small data-edit="mock.r1sub">200 questions · Tamil &amp; English</small></span><em data-edit="mock.r1time">3 h</em>'),
    ('<span><b>Mini Mock</b><small>20 questions</small></span><em>30 min</em>', '<span><b data-edit="mock.r2name">Mini Mock</b><small data-edit="mock.r2sub">20 questions</small></span><em data-edit="mock.r2time">30 min</em>'),
])

ed(C + "report.html", [root("report"), start("report"),
    ('id="report-g1">Score</span>', 'id="report-g1" data-edit="report.tag1">Score</span>'),
    ('id="report-g2">Mistakes</span>', 'id="report-g2" data-edit="report.tag2">Mistakes</span>'),
    ('id="report-g3">Weak areas</span>', 'id="report-g3" data-edit="report.tag3">Weak areas</span>'),
    ('<span>Weakest topic</span><b>Indian Polity</b>', '<span>Weakest topic</span><b data-edit="report.weak">Indian Polity</b>'),
    ('<p><span class="w">Ellam</span> <span class="w a">easy-ah</span></p>', '<p data-edit="report.t1" data-split data-hl="a"><span class="w">Ellam</span> <span class="w a">easy-ah</span></p>'),
    ('<p><span class="w">analyse</span></p>', '<p data-edit="report.t2" data-split><span class="w">analyse</span></p>'),
])

s = io.open(C + "ready.html", encoding="utf-8").read()
for i, t in enumerate(["First test done", "Weak topic found", "Revision done", "Accuracy up", "Exam Ready"], 1):
    a = f"</i>{t}</span>"
    if a not in s:
        raise SystemExit("MISSING ready tag " + t)
    s = s.replace(a, f'</i><b data-edit="ready.tag{i}">{t}</b></span>', 1)
io.open(C + "ready.html", "w", encoding="utf-8").write(s)
ed(C + "ready.html", [root("ready"), start("ready"),
    ('<p id="ready-t1"><span class="w">Ovvoru</span> <span class="w">test-um</span></p>', '<p id="ready-t1" data-edit="ready.t1" data-split><span class="w">Ovvoru</span> <span class="w">test-um</span></p>'),
    ('<p id="ready-t2"><span class="w">improvement</span></p>', '<p id="ready-t2" data-edit="ready.t2" data-split><span class="w">improvement</span></p>'),
    ('    .w { display: inline-block; }', '    .w { display: inline-block; }\n    .ready-tag b { font-weight: inherit; }'),
])

ed(C + "offer.html", [root("offer"), start("offer"),
    ('<p id="offer-kick">', '<p id="offer-kick" data-edit="offer.kick">'),
    ('<p id="offer-price">', '<p id="offer-price" data-edit="offer.price">'),
    ('<p id="offer-only">', '<p id="offer-only" data-edit="offer.only">'),
    ('<h3>A timed test every day</h3>', '<h3 data-edit="offer.card">A timed test every day</h3>'),
    ('<span id="offer-btntext">Try it for ₹9<svg', '<span id="offer-btntext"><b data-edit="offer.button">Try it for ₹9</b><svg'),
    ('    #offer-btntext { display: inline-flex; align-items: center; gap: 22px; }', '    #offer-btntext { display: inline-flex; align-items: center; gap: 22px; }\n    #offer-btntext b { font-weight: inherit; }'),
])

ed(C + "end.html", [root("end"), start("end"),
    ('<p id="end-url">', '<p id="end-url" data-edit="end.url">'),
    ('<p id="end-tag">உங்க வெற்றிக்கான<br/><span class="b">அடுத்த step</span></p>', '<p id="end-tag"><span data-edit="end.tag1">உங்க வெற்றிக்கான</span><br/><span class="b" data-edit="end.tag2">அடுத்த step</span></p>'),
    ('<span id="end-btn">Try it for ₹9<svg', '<span id="end-btn"><b data-edit="end.button">Try it for ₹9</b><svg'),
    ('    #end-btn svg { width: 42px; height: 42px; }', '''    #end-btn svg { width: 42px; height: 42px; }
    #end-btn b { font-weight: inherit; }
    /* pick end.orbit: on (default) | off (logo, address and button only) */
    #root[data-orbit="off"] .end-orb, #root[data-orbit="off"] #end-rings { display: none; }'''),
])

# root: load the picks before any scene; drop the founder's own voiceover (each ad gets its own)
p = BASE + "/index.html"
s = io.open(p, encoding="utf-8").read()
g = '<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>'
if g not in s:
    raise SystemExit("MISSING gsap tag in index")
s = s.replace(g, g + '\n    <script src="picks.data.js"></script>\n    <script src="assets/picks.js"></script>', 1)
s = re.sub(r'\n\s*<audio id="vo"[^\n]*</audio>', "", s)
io.open(p, "w", encoding="utf-8").write(s)
print("marked; voiceover line removed:", 'id="vo"' not in s)
