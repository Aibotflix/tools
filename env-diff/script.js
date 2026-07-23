(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var names = [".env", ".env.local", ".env.production"];

  function parse(text) {
    var vars = {}, order = [], dups = [];
    var lines = text.split("\n");
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line.startsWith("#")) continue;
      var eq = line.indexOf("=");
      if (eq === -1) continue;
      var key = line.slice(0, eq).trim();
      var val = line.slice(eq + 1).trim();
      if (!key) continue;
      if (vars[key] !== undefined) dups.push(key);
      else { vars[key] = val; order.push(key); }
    }
    return { vars: vars, dups: dups };
  }

  function esc(s) { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  function compare() {
    var raw = [$("env1").value, $("env2").value, $("env3").value];
    var parsed = raw.map(parse);
    var allKeys = {};
    parsed.forEach(function (p, i) {
      Object.keys(p.vars).forEach(function (k) {
        if (!allKeys[k]) allKeys[k] = {};
        allKeys[k][i] = p.vars[k];
      });
    });

    var missing = [], changed = [], unused = [];
    var allKeyList = Object.keys(allKeys).sort();

    allKeyList.forEach(function (k) {
      var present = [];
      for (var i = 0; i < 3; i++) {
        if (allKeys[k][i] !== undefined) present.push(i);
      }
      if (present.length < 3) {
        var missingIn = [];
        for (var i = 0; i < 3; i++) {
          if (allKeys[k][i] === undefined) missingIn.push(names[i]);
        }
        missing.push({ key: k, missingIn: missingIn });
      }
      var vals = [];
      for (var i = 0; i < 3; i++) {
        if (allKeys[k][i] !== undefined) vals.push({ file: names[i], val: allKeys[k][i] });
      }
      if (vals.length >= 2) {
        var first = vals[0].val;
        var diff = vals.some(function (v) { return v.val !== first; });
        if (diff) changed.push({ key: k, vals: vals });
      }
    });

    parsed.forEach(function (p, i) {
      if (p.dups.length) {
        var seen = {};
        p.dups.forEach(function (k) {
          if (!seen[k]) { seen[k] = true; unused.push({ key: k, file: names[i] }); }
        });
      }
    });

    parsed.forEach(function (p, i) {
      Object.keys(p.vars).forEach(function (k) {
        if (p.vars[k] === "") {
          unused.push({ key: k, file: names[i], reason: "empty value" });
        }
      });
    });

    var html = '<style>#results table{width:100%;border-collapse:collapse;margin:8px 0 16px;font-size:.92rem}#results th,#results td{padding:8px 10px;text-align:left;border-bottom:1px solid var(--border)}#results th{font-weight:600;color:var(--muted);font-size:.85rem;text-transform:uppercase;letter-spacing:.5px}#results tr:last-child td{border-bottom:none}#results code{background:var(--card);padding:2px 6px;border-radius:4px;font-size:.9rem}</style>';
    if (!missing.length && !changed.length && !unused.length) {
      html += '<div class="status ok">All files match. No differences found.</div>';
    } else {
      if (missing.length) {
        html += '<h2>Missing Keys (' + missing.length + ')</h2><table><tr><th>Key</th><th>Missing in</th></tr>';
        missing.forEach(function (m) {
          html += '<tr><td><code>' + esc(m.key) + '</code></td><td>' + m.missingIn.join(", ") + '</td></tr>';
        });
        html += '</table>';
      }
      if (changed.length) {
        html += '<h2>Changed Values (' + changed.length + ')</h2><table><tr><th>Key</th><th>File</th><th>Value</th></tr>';
        changed.forEach(function (c) {
          c.vals.forEach(function (v) {
            html += '<tr><td><code>' + esc(c.key) + '</code></td><td>' + v.file + '</td><td><code>' + esc(v.val) + '</code></td></tr>';
          });
        });
        html += '</table>';
      }
      if (unused.length) {
        html += '<h2>Unused Variables (' + unused.length + ')</h2><table><tr><th>Key</th><th>File</th></tr>';
        unused.forEach(function (u) {
          html += '<tr><td><code>' + esc(u.key) + '</code></td><td>' + u.file + '</td></tr>';
        });
        html += '</table>';
      }
    }
    $("results").innerHTML = html;
  }

  $("compare").addEventListener("click", compare);
})();