(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var patternEl = $("pattern"), flagsEl = $("flags"), testEl = $("testStr");
  var highlighted = $("highlighted"), matches = $("matches"), status = $("status");

  function setStatus(msg, isErr) {
    status.textContent = msg || "";
    status.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var workerCode = [
    "self.onmessage = function(e) {",
    "  var d = e.data;",
    "  try {",
    "    var re = new RegExp(d.pattern, d.flags);",
    "    var matchList = [], m;",
    "    if (d.flags.indexOf('g') !== -1) {",
    "      while ((m = re.exec(d.text)) !== null) {",
    "        matchList.push({ index: m.index, length: m[0].length, value: m[0], groups: Array.prototype.slice.call(m) });",
    "        if (!m[0]) re.lastIndex++;",
    "      }",
    "    } else {",
    "      m = re.exec(d.text);",
    "      if (m) matchList.push({ index: m.index, length: m[0].length, value: m[0], groups: Array.prototype.slice.call(m) });",
    "    }",
    "    self.postMessage({ ok: true, matches: matchList });",
    "  } catch (err) {",
    "    self.postMessage({ ok: false, error: err.message });",
    "  }",
    "};"
  ].join("\n");

  var workerBlob = new Blob([workerCode], { type: "application/javascript" });
  var workerUrl = URL.createObjectURL(workerBlob);
  var activeWorker = null;

  function test() {
    var pattern = patternEl.value;
    var flags = flagsEl.value;
    var text = testEl.value;

    if (!pattern || !text) {
      highlighted.innerHTML = text ? escapeHtml(text) : '<span style="color:var(--muted)">Enter a regex and test string above</span>';
      matches.textContent = "";
      setStatus(""); return;
    }

    try { new RegExp(pattern, flags); } catch (e) {
      highlighted.innerHTML = '<span style="color:var(--muted)">Invalid regex</span>';
      matches.textContent = e.message;
      setStatus("Invalid regular expression: " + e.message, true);
      return;
    }

    if (activeWorker) { activeWorker.terminate(); activeWorker = null; }

    var w = new Worker(workerUrl);
    activeWorker = w;
    var timer = setTimeout(function () {
      w.terminate();
      activeWorker = null;
      highlighted.innerHTML = '<span style="color:var(--muted)">Regex took too long — possible catastrophic backtracking.</span>';
      matches.textContent = "";
      setStatus("Timed out.", true);
    }, 2000);

    w.onmessage = function (e) {
      clearTimeout(timer);
      activeWorker = null;
      var d = e.data;
      if (!d.ok) {
        highlighted.innerHTML = '<span style="color:var(--muted)">Invalid regex</span>';
        matches.textContent = d.error;
        setStatus("Invalid regular expression: " + d.error, true);
        return;
      }
      var matchList = d.matches;

      var html = "";
      var lastIdx = 0;
      for (var i = 0; i < matchList.length; i++) {
        var mt = matchList[i];
        html += escapeHtml(text.substring(lastIdx, mt.index));
        html += '<mark style="background:#ffe066;padding:1px 2px;border-radius:3px">' + escapeHtml(text.substring(mt.index, mt.index + mt.length)) + '</mark>';
        lastIdx = mt.index + mt.length;
      }
      html += escapeHtml(text.substring(lastIdx));
      highlighted.innerHTML = html || escapeHtml(text);

      if (matchList.length === 0) {
        matches.textContent = "No matches found.";
        setStatus("No matches.", true);
      } else {
        var detail = matchList.length + " match" + (matchList.length !== 1 ? "es" : "") + "\n\n";
        for (var j = 0; j < matchList.length; j++) {
          var g = matchList[j].groups;
          detail += "Match " + (j + 1) + ": \"" + g[0] + "\" at index " + matchList[j].index;
          if (g.length > 1) {
            for (var k = 1; k < g.length; k++) {
              detail += "\n  Group " + k + ": \"" + (g[k] || "") + "\"";
            }
          }
          detail += "\n";
        }
        matches.textContent = detail;
        setStatus(matchList.length + " match" + (matchList.length !== 1 ? "es" : "") + " found.");
      }
    };

    w.postMessage({ pattern: pattern, flags: flags, text: text });
  }

  patternEl.addEventListener("input", test);
  flagsEl.addEventListener("input", test);
  testEl.addEventListener("input", test);
})();
