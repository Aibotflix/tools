(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var input = $("in"), output = $("out");
  function setStatus(msg, isErr) {
    var s = $("status"); s.textContent = msg || ""; s.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }
  function parse() {
    var v = input.value.trim();
    if (!v) throw new Error("Nothing to parse yet.");
    return JSON.parse(v);
  }
  function withError(fn, okMsg) {
    try { var out = fn(); setStatus(okMsg || ""); output.value = out || ""; return output.value; }
    catch (err) { output.value = ""; setStatus(err.message, true); return ""; }
  }
  function act(kind) {
    if (kind === "format") {
      withError(function () { return JSON.stringify(parse(), null, 2); }, "Formatted — valid JSON.");
    } else if (kind === "minify") {
      withError(function () { return JSON.stringify(parse()); }, "Minified — valid JSON.");
    } else if (kind === "tabs") {
      withError(function () { return JSON.stringify(parse(), null, "\t"); }, "Formatted with tabs — valid JSON.");
    }
  }
  function convert() {
    act($("mode").value);
  }
  $("in").addEventListener("input", convert);
  $("mode").addEventListener("change", convert);
  $("copy").addEventListener("click", function () {
    var v = output.value;
    if (!v) { setStatus("Nothing to copy yet.", true); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(function () { setStatus("Copied!"); }, function () { setStatus("Copy failed.", true); });
    else setStatus("Copy not supported — select and copy manually.", true);
  });
})();
