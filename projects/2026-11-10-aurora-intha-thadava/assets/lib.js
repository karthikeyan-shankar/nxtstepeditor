// Shared helpers for the scenes. Loaded once by index.html, before any scene runs.
// Everything here only schedules tweens on the scene's own paused timeline, so any frame renders on its own.
(function () {
  "use strict";
  var seg = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter("ta", { granularity: "grapheme" }) : null;

  function graphemes(text) {
    if (seg) return Array.from(seg.segment(text), function (s) { return s.segment; });
    return Array.from(text);
  }

  // Turns the text of `el` into one hidden span per Tamil/Latin grapheme cluster (so a vowel sign never
  // separates from its consonant) plus a caret. "\n" becomes a line break. The first `shown` clusters
  // start visible, so frame 0 can already hold part of the line.
  function prep(el, shown) {
    var text = el.getAttribute("data-text") || el.textContent;
    el.textContent = "";
    var parts = [];
    graphemes(text).forEach(function (g, i) {
      var n = g === "\n" ? document.createElement("br") : document.createElement("span");
      if (g !== "\n") n.textContent = g;
      n.style.display = i < (shown || 0) ? "inline" : "none";
      el.appendChild(n);
      parts.push(n);
    });
    var caret = document.createElement("i");
    caret.className = "tw-caret";
    el.appendChild(caret);
    return { parts: parts, caret: caret, shown: shown || 0 };
  }

  // Types the hidden clusters in over `dur` seconds from `start`.
  function typeIn(tl, line, start, dur) {
    var todo = line.parts.slice(line.shown);
    var step = dur / Math.max(1, todo.length);
    todo.forEach(function (n, i) { tl.set(n, { display: "inline" }, start + i * step); });
    tl.set(line.caret, { opacity: 1 }, start);
    return start + dur;
  }

  // Deletes the line back to nothing, last cluster first.
  function typeOut(tl, line, start, dur) {
    var all = line.parts.slice().reverse();
    var step = dur / Math.max(1, all.length);
    all.forEach(function (n, i) { tl.set(n, { display: "none" }, start + i * step); });
    tl.set(line.caret, { opacity: 1 }, start);
    return start + dur;
  }

  // A caret that blinks between `from` and `to` (finite toggles, never an endless repeat).
  function blink(tl, line, from, to) {
    for (var t = from, k = 0; t < to; t += 0.5, k++) tl.set(line.caret, { opacity: k % 2 ? 1 : 0 }, t);
  }

  window.NS = { prep: prep, typeIn: typeIn, typeOut: typeOut, blink: blink };
})();
