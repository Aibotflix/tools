(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var opts = {
    UPPER: "UPPERCASE",
    lower: "lowercase",
    "Title Case": "Title Case",
    "Sentence case": "Sentence case",
    camelCase: "camelCase",
    PascalCase: "PascalCase",
    snake_case: "snake_case",
    "kebab-case": "kebab-case",
    CONSTANT_CASE: "CONSTANT_CASE"
  };
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
  var row = $("btns");
  Object.keys(opts).forEach(function (key) {
    var b = document.createElement("button");
    b.className = "secondary"; b.type = "button"; b.textContent = opts[key]; b.dataset.conv = key;
    b.addEventListener("click", function () {
      $("out").value = convert(key, $("in").value);
      setStatus("");
    });
    row.appendChild(b);
  });
  function setStatus(msg, isErr) {
    var s = $("status"); s.textContent = msg || ""; s.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }
  function copy() {
    var v = $("out").value;
    if (!v) { setStatus("Nothing to copy yet.", true); return; }
    var done = function () { setStatus("Copied!"); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done, function () { setStatus("Copy failed — select and copy manually.", true); });
    else setStatus("Copy not supported — select and copy manually.", true);
  }
  $("copy").addEventListener("click", copy);
})();
