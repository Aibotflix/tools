(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var input = $("in"), output = $("out"), status = $("status");

  function setStatus(msg, isErr) {
    status.textContent = msg || "";
    status.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }

  function caesar(text, shift) {
    return text.replace(/[a-zA-Z]/g, function (c) {
      var base = c <= "Z" ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + shift + 26) % 26) + base);
    });
  }

  function rot13(text) { return caesar(text, 13); }

  function atbash(text) {
    return text.replace(/[a-zA-Z]/g, function (c) {
      var base = c <= "Z" ? 65 : 97;
      return String.fromCharCode(base + 25 - (c.charCodeAt(0) - base));
    });
  }

  function run(act) {
    var v = input.value;
    if (!v) { output.value = ""; setStatus(""); return; }
    if (act === "rot13") { output.value = rot13(v); setStatus("Rot13 applied — apply again to decode."); }
    else if (act === "atbash") { output.value = atbash(v); setStatus("Atbash applied — apply again to decode."); }
    else if (act === "caesar") {
      var shift = parseInt($("shift").value, 10);
      output.value = caesar(v, shift); setStatus("Caesar shift " + shift + " applied.");
    }
  }

  $("shift").addEventListener("input", function () {
    $("shiftVal").textContent = this.value;
    $("caesarShiftLabel").textContent = this.value;
  });

  document.querySelectorAll("[data-act]").forEach(function (b) {
    b.addEventListener("click", function () { run(b.dataset.act); });
  });

  $("copy").addEventListener("click", function () {
    var v = output.value;
    if (!v) { setStatus("Nothing to copy yet.", true); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(v).then(function () { setStatus("Copied!"); });
    }
  });
})();
