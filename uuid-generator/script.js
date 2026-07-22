(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var count = $("count"), countVal = $("countVal"), out = $("out");
  var u8 = new Uint8Array(16);
  function v4() {
    if (window.crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    crypto.getRandomValues(u8);
    u8[6] = (u8[6] & 0x0f) | 0x40;
    u8[8] = (u8[8] & 0x3f) | 0x80;
    var h = Array.prototype.map.call(u8, function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20, 32);
  }
  function generate() {
    countVal.textContent = count.value;
    if (!window.crypto || !crypto.getRandomValues) { out.value = "This browser cannot generate secure UUIDs."; return; }
    var n = parseInt(count.value, 10) || 1;
    var up = $("up").checked, br = $("brace").checked;
    var lines = [];
    for (var i = 0; i < n; i++) {
      var id = v4();
      if (up) id = id.toUpperCase();
      if (br) id = "{" + id + "}";
      lines.push(id);
    }
    out.value = lines.join("\n");
  }
  function copy() {
    var v = out.value;
    if (!v) return;
    var b = $("copy");
    var done = function () { b.textContent = "Copied!"; b.disabled = true; setTimeout(function () { b.textContent = "Copy"; b.disabled = false; }, 1200); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done, function () { b.textContent = "Copy failed"; });
    else b.textContent = "Copy not supported";
  }
  count.addEventListener("input", generate);
  $("up").addEventListener("change", generate);
  $("brace").addEventListener("change", generate);
  $("gen").addEventListener("click", generate);
  $("copy").addEventListener("click", copy);
  generate();
})();
