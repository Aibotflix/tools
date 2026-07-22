(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var out = $("out"), bar = $("bar"), label = $("strengthLabel"),
      lenEl = $("len"), lenVal = $("lenVal"), copyBtn = $("copy"), regenBtn = $("regen");
  var sets = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    digit: "0123456789",
    sym: "!@#$%^&*-_=+?"
  };
  var u32 = new Uint32Array(1);
  var current = "";

  function randInt(max) {
    var limit = Math.floor(0x100000000 / max) * max, x;
    do { crypto.getRandomValues(u32); x = u32[0]; } while (x >= limit);
    return x % max;
  }

  function makePool() {
    var p = "";
    if ($("upper").checked) p += sets.upper;
    if ($("lower").checked) p += sets.lower;
    if ($("digit").checked) p += sets.digit;
    if ($("sym").checked) p += sets.sym;
    if ($("amb").checked) p = p.replace(/[lI1O0o]/g, "");
    return p;
  }

  function grade(bits) {
    var txt, col;
    if (bits < 40) { txt = "Weak"; col = "#d64a4a"; }
    else if (bits < 60) { txt = "Fair"; col = "#e08a2b"; }
    else if (bits < 100) { txt = "Strong"; col = "#3aa757"; }
    else { txt = "Very strong"; col = "#2d9d78"; }
    bar.style.width = Math.min(100, bits / 128 * 100) + "%";
    bar.style.background = col;
    label.textContent = current ? (txt + " · ~" + Math.round(bits) + " bits of entropy") : "";
  }

  function render() {
    lenVal.textContent = lenEl.value;
    if (!window.crypto || !crypto.getRandomValues) { out.textContent = "This browser cannot generate secure passwords."; return; }
    var pool = makePool();
    if (!pool) { current = ""; out.textContent = "Select at least one character set."; bar.style.width = "0"; label.textContent = ""; return; }
    var n = parseInt(lenEl.value, 10);
    var chars = pool.split("");
    var pw = "";
    for (var i = 0; i < n; i++) pw += chars[randInt(chars.length)];
    current = pw;
    out.textContent = pw;
    grade(n * Math.log2(pool.length));
  }

  function copy() {
    if (!current) return;
    var done = function () { var b = copyBtn; b.textContent = "Copied!"; b.disabled = true; setTimeout(function () { b.textContent = "Copy"; b.disabled = false; }, 1200); };
    function fallback() {
      var t = document.createElement("textarea"); t.value = current;
      t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); done(); } catch (e) { copyBtn.textContent = "Copy failed"; }
      document.body.removeChild(t);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(current).then(done, fallback);
    } else { fallback(); }
  }

  lenEl.addEventListener("input", render);
  ["upper", "lower", "digit", "sym", "amb"].forEach(function (id) { $(id).addEventListener("change", render); });
  regenBtn.addEventListener("click", render);
  copyBtn.addEventListener("click", copy);
  render();
})();
