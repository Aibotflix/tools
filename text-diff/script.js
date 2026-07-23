(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };

  function computeDiff(aLines, bLines) {
    var m = aLines.length, n = bLines.length;
    var dp = [];
    for (var i = 0; i <= m; i++) { dp[i] = []; for (var j = 0; j <= n; j++) dp[i][j] = 0; }
    for (var i = 1; i <= m; i++)
      for (var j = 1; j <= n; j++)
        dp[i][j] = aLines[i - 1] === bLines[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    var result = [];
    var i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && aLines[i - 1] === bLines[j - 1]) {
        result.unshift({ type: "same", line: aLines[i - 1], oldNum: i, newNum: j });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({ type: "add", line: bLines[j - 1], newNum: j });
        j--;
      } else {
        result.unshift({ type: "rem", line: aLines[i - 1], oldNum: i });
        i--;
      }
    }
    return result;
  }

  function renderDiff(aText, bText) {
    var out = $("diff-out"), stats = $("diff-stats");
    if (!aText && !bText) {
      out.innerHTML = '<div class="diff-empty">Paste text in both boxes above to see the diff.</div>';
      stats.textContent = ""; return;
    }
    var aLines = aText.split("\n");
    var bLines = bText.split("\n");
    if (aText === bText) {
      out.innerHTML = '<div class="diff-empty">The two texts are identical.</div>';
      stats.textContent = aLines.length + " lines, unchanged.";
      return;
    }
    var diff = computeDiff(aLines, bLines);
    var html = "";
    var addCount = 0, remCount = 0, sameCount = 0;
    for (var i = 0; i < diff.length; i++) {
      var d = diff[i];
      var cls = d.type === "add" ? "diff-add" : d.type === "rem" ? "diff-rem" : "diff-same";
      var num = d.type === "add" ? "+" + d.newNum : d.type === "rem" ? "-" + d.oldNum : d.oldNum + " " + d.newNum;
      if (d.type === "add") addCount++;
      else if (d.type === "rem") remCount++;
      else sameCount++;
      html += '<div class="diff-line ' + cls + '"><span class="diff-num">' + num + '</span><span class="diff-text">' + escapeHtml(d.line || " ") + "</span></div>";
    }
    out.innerHTML = html;
    stats.textContent = addCount + " added, " + remCount + " removed, " + sameCount + " unchanged.";
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function update() {
    renderDiff($("in-a").value, $("in-b").value);
  }

  $("in-a").addEventListener("input", update);
  $("in-b").addEventListener("input", update);
  update();
})();
