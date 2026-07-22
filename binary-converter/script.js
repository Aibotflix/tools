(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var dec = $("dec"), bin = $("bin"), hex = $("hex"), oct = $("oct"), status = $("status");
  var updating = false;

  function setStatus(msg, isErr) {
    status.textContent = msg || "";
    status.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }

  function updateFrom(source) {
    if (updating) return;
    updating = true;
    var val = source.value.trim();
    if (!val) {
      dec.value = ""; bin.value = ""; hex.value = ""; oct.value = "";
      updating = false; return;
    }
    try {
      var n;
      if (source === dec) { n = parseInt(val, 10); }
      else if (source === bin) { n = parseInt(val, 2); }
      else if (source === hex) { n = parseInt(val, 16); }
      else if (source === oct) { n = parseInt(val, 8); }
      if (isNaN(n) || n < 0) throw new Error("Invalid number");
      if (n > Number.MAX_SAFE_INTEGER) throw new Error("Number too large (exceeds 2^53)");
      if (source !== dec) dec.value = n.toString(10);
      if (source !== bin) bin.value = n.toString(2);
      if (source !== hex) hex.value = n.toString(16).toUpperCase();
      if (source !== oct) oct.value = n.toString(8);
      setStatus("");
    } catch (e) {
      setStatus("Invalid " + source.id + " value", true);
    }
    updating = false;
  }

  [dec, bin, hex, oct].forEach(function (el) {
    el.addEventListener("input", function () { updateFrom(el); });
  });
})();
