(function () {
  "use strict";
  var input = document.getElementById("url-input");
  var results = document.getElementById("results");

  function esc(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function kcell(k) { return '<td><code>' + esc(k) + '</code></td>'; }
  function vcell(v) { return '<td><code>' + esc(v) + '</code></td>'; }

  function analyze() {
    var raw = input.value.trim();
    if (!raw) { results.innerHTML = ""; return; }

    var url;
    try { url = new URL(raw); }
    catch (e) {
      results.innerHTML = '<div class="status err">Invalid URL: ' + esc(e.message) + '</div>';
      return;
    }

    var html = '<style>.url-debug table{width:100%;border-collapse:collapse;margin:8px 0 16px;font-size:.92rem}.url-debug th,.url-debug td{padding:8px 10px;text-align:left;border-bottom:1px solid var(--border);vertical-align:top}.url-debug th{font-weight:600;color:var(--muted);font-size:.85rem;text-transform:uppercase;letter-spacing:.5px}.url-debug tr:last-child td{border-bottom:none}.url-debug code{background:var(--card);padding:2px 6px;border-radius:4px;font-size:.9rem;word-break:break-all}.url-debug .section{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:14px;margin:12px 0;word-break:break-all}.url-debug .label{color:var(--muted);font-size:.82rem;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}</style><div class="url-debug">';

    // Decoded URL
    html += '<div class="section"><div class="label">Decoded URL</div><code>' + esc(decodeURIComponent(raw)) + '</code></div>';

    // Structure breakdown
    html += '<h2>Structure</h2><table><tbody>';
    html += '<tr>' + kcell("Protocol") + vcell(url.protocol) + '</tr>';
    html += '<tr>' + kcell("Host") + vcell(url.hostname) + '</tr>';
    if (url.port) html += '<tr>' + kcell("Port") + vcell(url.port) + '</tr>';
    html += '<tr>' + kcell("Path") + vcell(url.pathname) + '</tr>';
    if (url.hash) html += '<tr>' + kcell("Hash") + vcell(url.hash) + '</tr>';
    html += '</tbody></table>';

    // Query parameters
    var params = url.searchParams;
    var keys = Array.from(params.keys());
    if (keys.length) {
      // Build param map for duplicate detection
      var paramMap = {};
      keys.forEach(function (k) { if (!paramMap[k]) paramMap[k] = []; });
      params.forEach(function (v, k) { paramMap[k].push(v); });

      var allKeys = Object.keys(paramMap).sort();
      var dupes = allKeys.filter(function (k) { return paramMap[k].length > 1; });

      html += '<h2>Query Parameters (' + allKeys.length + ')</h2><table><tbody>';
      html += '<tr><th>Key</th><th>Value</th><th>Decoded</th></tr>';
      allKeys.forEach(function (k) {
        paramMap[k].forEach(function (v, i) {
          var dec;
          try { dec = decodeURIComponent(v); } catch (e) { dec = '(invalid encoding)'; }
          html += '<tr>' + kcell(i === 0 ? k : '') + vcell(v) + vcell(dec) + '</tr>';
        });
      });
      html += '</tbody></table>';

      if (dupes.length) {
        html += '<h2>Duplicate Parameters</h2><table><tbody><tr><th>Key</th><th>Count</th></tr>';
        dupes.forEach(function (k) {
          html += '<tr>' + kcell(k) + '<td>' + paramMap[k].length + '</td></tr>';
        });
        html += '</tbody></table>';
      }
    }

    // Encoding validation
    var issues = [];
    try { decodeURIComponent(url.pathname); } catch (e) { issues.push('Invalid percent-encoding in path'); }
    keys.forEach(function (k) {
      try { decodeURIComponent(k); } catch (e) { issues.push('Invalid encoding in parameter key: ' + esc(k)); }
    });
    params.forEach(function (v, k) {
      try { decodeURIComponent(v); } catch (e) { issues.push('Invalid encoding in parameter "' + esc(k) + '": ' + esc(v)); }
    });
    if (url.hash) {
      try { decodeURIComponent(url.hash.slice(1)); } catch (e) { issues.push('Invalid encoding in hash fragment'); }
    }

    if (issues.length) {
      html += '<h2>Encoding Issues (' + issues.length + ')</h2><ul>';
      issues.forEach(function (issue) { html += '<li class="status err">' + issue + '</li>'; });
      html += '</ul>';
    } else {
      html += '<div class="status ok">No encoding issues found.</div>';
    }

    // Rebuilt URL
    var rebuilt = url.origin + url.pathname;
    if (url.search) rebuilt += url.search;
    if (url.hash) rebuilt += url.hash;
    html += '<h2>Rebuilt URL</h2><div class="section"><code>' + esc(rebuilt) + '</code></div>';

    html += '</div>';
    results.innerHTML = html;
  }

  input.addEventListener("input", analyze);
})();