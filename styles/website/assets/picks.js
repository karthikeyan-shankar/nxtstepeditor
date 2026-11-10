// Applies a storyboard's picks to a scene, the same way in the Studio preview and in the HyperFrames render.
// A board is { text: { "hook.l3": "prep-ah?" , ... }, pick: { "hook.crowd": "students", ... } }.
// The scene's own HTML holds the defaults; a board only overrides what it names. A default written as plain
// text (no child elements) goes through the same splitting and fitting, so "*word*" works in defaults too.
//   data-edit="scene.key"        text that can be changed
//   data-split                   rebuild as one <span class="w"> per word (for word-by-word animation)
//   data-wclass="x"              extra class on every word span
//   data-hl="x"                  class added to words written as *word* (the highlighted word)
//   data-fit="N"                 shrink the line when it has more than N letters
//   data-scene="scene" (on root) receives data-<pick>="<value>" for each pick of that scene
(function () {
  "use strict";
  function words(el, text) {
    var hl = el.getAttribute("data-hl") || "";
    var wcls = el.getAttribute("data-wclass") || "";
    el.textContent = "";
    String(text).split(/(\s+)/).forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(" ")); return; }
      var m = part.match(/^\*(.+)\*$/);
      var s = document.createElement("span");
      s.className = "w" + (wcls ? " " + wcls : "") + (m && hl ? " " + hl : "");
      s.textContent = m ? m[1] : part;
      el.appendChild(s);
    });
  }
  // Lines that may outgrow the frame carry data-fit="N": the most letters that fit at the designed size.
  // A longer line shrinks in proportion (counted in letters as a reader sees them, Tamil included).
  var seg = (typeof Intl !== "undefined" && Intl.Segmenter) ? new Intl.Segmenter("ta", { granularity: "grapheme" }) : null;
  function letters(t) { t = String(t).replace(/\*/g, ""); return seg ? Array.from(seg.segment(t)).length : Array.from(t).length; }
  function fit(el, text) {
    var n = parseFloat(el.getAttribute("data-fit"));
    if (!n) return;
    el.style.fontSize = "";
    var len = letters(text);
    if (len <= n) return;
    var base = parseFloat(getComputedStyle(el).fontSize);
    if (base) el.style.fontSize = (base * n / len).toFixed(1) + "px";
  }
  function apply(scene) {
    var board = window.NS_PICKS || {};
    var text = board.text || {}, pick = board.pick || {};
    var root = document.querySelector('[data-scene="' + scene + '"]');
    var scope = root || document;
    scope.querySelectorAll('[data-edit^="' + scene + '."]').forEach(function (el) {
      var key = el.getAttribute("data-edit");
      var t;
      if (Object.prototype.hasOwnProperty.call(text, key)) t = text[key];
      else if (!el.children.length) t = el.textContent; // the default, written as plain text in the scene
      else return; // the default, already built by hand in the scene
      if (el.hasAttribute("data-split")) words(el, t);
      else el.textContent = String(t).replace(/\*/g, "");
      fit(el, t);
    });
    if (root) Object.keys(pick).forEach(function (key) {
      if (key.indexOf(scene + ".") === 0) root.setAttribute("data-" + key.slice(scene.length + 1), pick[key]);
    });
    return function (key, fallback) {
      var v = pick[scene + "." + key];
      return v === undefined ? fallback : v;
    };
  }
  window.NSPicks = { apply: apply };
})();
