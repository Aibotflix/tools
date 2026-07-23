(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var input = $("in"), output = $("out"), status = $("status");

  function setStatus(msg, isErr) {
    status.textContent = msg || "";
    status.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }

  function encode(str) {
    try {
      return encodeURIComponent(str)
        .replace(/!/g, "%21")
        .replace(/'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29")
        .replace(/\*/g, "%2A")
        .replace(/%20/g, "+");
    } catch (e) { throw new Error("Encoding failed: " + e.message); }
  }

  function encodeComponent(str) {
    try { return encodeURIComponent(str); }
    catch (e) { throw new Error("Encoding failed: " + e.message); }
  }

  function decode(str) {
    try {
      return decodeURIComponent(str.replace(/\+/g, " "));
    } catch (e) { throw new Error("Invalid encoded string — could not decode."); }
  }

  function run(act) {
    var v = input.value;
    if (!v) { output.value = ""; setStatus(""); return; }
    try {
      if (act === "encode") {
        output.value = encode(v);
        setStatus("Encoded — " + output.value.length + " characters.");
      } else if (act === "encodeComponent") {
        output.value = encodeComponent(v);
        setStatus("Component-encoded — " + output.value.length + " characters.");
      } else {
        output.value = decode(v);
        setStatus("Decoded successfully.");
      }
    } catch (e) {
      output.value = "";
      setStatus(e.message, true);
    }
  }

  function convert() {
    run($("dir").value);
  }
  $("in").addEventListener("input", convert);
  $("dir").addEventListener("change", convert);

  $("copy").addEventListener("click", function () {
    var v = output.value;
    if (!v) { setStatus("Nothing to copy yet.", true); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(v).then(function () { setStatus("Copied!"); });
    } else {
      setStatus("Copy not supported.", true);
    }
  });
})();
