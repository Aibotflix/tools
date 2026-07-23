(function () {
  "use strict";
  var el = function (id) { return document.getElementById(id); };
  var method = el("method"), url = el("url"), headers = el("headers"), body = el("body");
  var display = el("code-display");
  var btns = document.querySelectorAll("[data-format]");
  var currentFormat = "fetch";

  function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  function parseHeaders(text) {
    var h = {};
    text.split("\n").forEach(function (line) {
      var idx = line.indexOf(":");
      if (idx === -1) return;
      var k = line.slice(0, idx).trim();
      var v = line.slice(idx + 1).trim();
      if (k) h[k] = v;
    });
    return h;
  }

  function generate() {
    var u = url.value.trim();
    var m = method.value;
    var h = parseHeaders(headers.value);
    var b = body.value.trim();

    if (!u) { display.innerHTML = '<span style="color:var(--muted)">Enter a URL to generate code.</span>'; return; }

    var code = "";
    if (currentFormat === "fetch") {
      code = "fetch('" + u.replace(/'/g, "\\'") + "', {\n  method: '" + m + "'";
      var keys = Object.keys(h);
      if (keys.length) {
        code += ",\n  headers: {\n";
        keys.forEach(function (k, i) {
          code += "    '" + k.replace(/'/g, "\\'") + "': '" + h[k].replace(/'/g, "\\'") + "'";
          if (i < keys.length - 1) code += ",";
          code += "\n";
        });
        code += "  }";
      }
      if (b && m !== "GET" && m !== "HEAD") {
        code += ",\n  body: JSON.stringify(" + b + ")";
      }
      code += "\n});";
    } else if (currentFormat === "axios") {
      var hasJson = false;
      Object.keys(h).forEach(function (k) {
        if (k.toLowerCase() === "content-type" && h[k].toLowerCase().indexOf("json") !== -1) hasJson = true;
      });

      code = "axios({\n  method: '" + m.toLowerCase() + "',\n  url: '" + u.replace(/'/g, "\\'") + "'";
      var keys = Object.keys(h);
      if (keys.length) {
        code += ",\n  headers: {\n";
        keys.forEach(function (k, i) {
          code += "    '" + k.replace(/'/g, "\\'") + "': '" + h[k].replace(/'/g, "\\'") + "'";
          if (i < keys.length - 1) code += ",";
          code += "\n";
        });
        code += "  }";
      }
      if (b && m !== "GET" && m !== "HEAD") {
        if (hasJson) {
          code += ",\n  data: " + b;
        } else {
          code += ",\n  data: '" + b.replace(/'/g, "\\'") + "'";
        }
      }
      code += "\n});";
    } else if (currentFormat === "curl") {
      code = "curl -X " + m + " \\\n  '" + u.replace(/'/g, "'\\''") + "'";
      var keys = Object.keys(h);
      keys.forEach(function (k) {
        code += " \\\n  -H '" + k.replace(/'/g, "'\\''") + ": " + h[k].replace(/'/g, "'\\''") + "'";
      });
      if (b && m !== "GET" && m !== "HEAD") {
        code += " \\\n  -d '" + b.replace(/'/g, "'\\''") + "'";
      }
    }

    display.textContent = code;
  }

  function setFormat(format) {
    currentFormat = format;
    btns.forEach(function (b) {
      b.classList.toggle("secondary", b.getAttribute("data-format") !== format);
    });
    generate();
  }

  btns.forEach(function (btn) {
    btn.addEventListener("click", function () { setFormat(this.getAttribute("data-format")); });
  });

  method.addEventListener("change", generate);
  url.addEventListener("input", generate);
  headers.addEventListener("input", generate);
  body.addEventListener("input", generate);

  display.addEventListener("click", function () {
    var text = display.textContent;
    if (!text || text.indexOf("Fill") !== -1 || text.indexOf("Enter") !== -1) return;
    navigator.clipboard.writeText(text).then(function () {
      var orig = display.textContent;
      display.textContent = "Copied!";
      setTimeout(function () { display.textContent = orig; }, 1200);
    });
  });

  generate();
})();