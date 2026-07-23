(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  function words(s) { return s.match(/[A-Za-z0-9]+/g) || []; }
  function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }
  function convert(key, s) {
    var w = words(s);
    switch (key) {
      case "UPPER": return s.toUpperCase();
      case "lower": return s.toLowerCase();
      case "Title Case": return s.toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      case "Sentence case": return s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, function (c) { return c.toUpperCase(); });
      case "camelCase": return w.map(function (x, i) { return i ? cap(x) : x.toLowerCase(); }).join("");
      case "PascalCase": return w.map(cap).join("");
      case "snake_case": return w.map(function (x) { return x.toLowerCase(); }).join("_");
      case "kebab-case": return w.map(function (x) { return x.toLowerCase(); }).join("-");
      case "CONSTANT_CASE": return w.map(function (x) { return x.toUpperCase(); }).join("_");
    }
    return "";
  }
  function setStatus(msg, isErr) {
    var s = $("status"); s.textContent = msg || ""; s.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }
  function update() {
    $("out").value = convert($("case").value, $("in").value) || "";
    setStatus("");
  }
  $("in").addEventListener("input", update);
  $("case").addEventListener("change", update);
  $("copy").addEventListener("click", function () {
    var v = $("out").value;
    if (!v) { setStatus("Nothing to copy.", true); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(function () { setStatus("Copied!"); });
    else setStatus("Copy not supported.", true);
  });
})();
