(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var text = $("text");
  function mins(n) { return n <= 0 ? "0 min" : (Math.round(n) || 1) + " min"; }
  function fmt(n) { return n.toLocaleString(); }
  function update() {
    var t = text.value;
    var words = (t.match(/\S+/g) || []).length;
    var sentences = (t.match(/[^.!?]+/g) || []).map(function (s) { return s.trim(); }).filter(Boolean).length;
    var lines = t ? t.split(/\r\n|\r|\n/).length : 0;
    $("words").textContent = fmt(words);
    $("chars").textContent = fmt(t.length);
    $("charsNs").textContent = fmt(t.replace(/\s/g, "").length);
    $("sentences").textContent = fmt(sentences);
    $("lines").textContent = fmt(lines);
    $("reading").textContent = mins(words / 200);
    $("speaking").textContent = mins(words / 130);
  }
  text.addEventListener("input", update);
  update();
})();
