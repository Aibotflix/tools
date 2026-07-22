(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var input = $("in"), output = $("out");
  function setStatus(msg, isErr) {
    var s = $("status"); s.textContent = msg || ""; s.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }
  function b64encode(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function b64decode(str) {
    var bin = atob(str.trim());
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  }
  function run(doWhat) {
    var v = input.value;
    if (!v) { output.value = ""; setStatus(""); return; }
    if (doWhat === "encode") {
      try { output.value = b64encode(v); setStatus(""); }
      catch (e) { output.value = ""; setStatus("Could not encode that input.", true); }
    } else {
      var clean = v.replace(/\s+/g, "");
      try { output.value = b64decode(clean); setStatus(""); }
      catch (e) { output.value = ""; setStatus("That isn't valid Base64.", true); }
    }
  }
  document.querySelectorAll("[data-do]").forEach(function (b) {
    b.addEventListener("click", function () { run(b.dataset.do); });
  });
  $("copy").addEventListener("click", function () {
    var v = output.value;
    if (!v) { setStatus("Nothing to copy yet.", true); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(function () { setStatus("Copied!"); }, function () { setStatus("Copy failed.", true); });
    else setStatus("Copy not supported — select and copy manually.", true);
  });
})();
