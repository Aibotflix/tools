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

  function test() {
    var pattern = patternEl.value;
    var flags = flagsEl.value;
    var text = testEl.value;

    if (!pattern || !text) {
      highlighted.innerHTML = text ? escapeHtml(text) : '<span style="color:var(--muted)">Enter a regex and test string above</span>';
      matches.textContent = "";
      setStatus(""); return;
    }

    try {
      var re = new RegExp(pattern, flags);
      var matchList = [];
      var m;

      if (flags.indexOf("g") !== -1) {
        while ((m = re.exec(text)) !== null) {
          matchList.push({ index: m.index, length: m[0].length, groups: m });
          if (!m[0]) re.lastIndex++; // prevent infinite loop on zero-length matches
        }
      } else {
        m = re.exec(text);
        if (m) matchList.push({ index: m.index, length: m[0].length, groups: m });
      }

      // Build highlighted HTML
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

      // Build match details
      if (matchList.length === 0) {
        matches.textContent = "No matches found.";
        setStatus("No matches.", true);
      } else {
        var detail = matchList.length + " match" + (matchList.length !== 1 ? "es" : "") + "\n\n";
        for (var j = 0; j < matchList.length; j++) {
          var g = matchList[j].groups;
          detail += "Match " + (j + 1) + ": \"" + g[0] + "\" at index " + g.index;
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
    } catch (e) {
      highlighted.innerHTML = '<span style="color:var(--muted)">Invalid regex</span>';
      matches.textContent = e.message;
      setStatus("Invalid regular expression: " + e.message, true);
    }
  }

  patternEl.addEventListener("input", test);
  flagsEl.addEventListener("input", test);
  testEl.addEventListener("input", test);
})();
