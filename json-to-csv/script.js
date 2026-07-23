(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };

  function escapeCsv(val) {
    if (val === null || val === undefined) return "";
    var s = String(val);
    if (s.indexOf(",") !== -1 || s.indexOf('"') !== -1 || s.indexOf("\n") !== -1 || s.indexOf("\r") !== -1) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function flatten(obj, prefix) {
    prefix = prefix || "";
    var result = {};
    if (obj === null || obj === undefined) { result[prefix] = ""; return result; }
    if (typeof obj === "object" && !Array.isArray(obj)) {
      var keys = Object.keys(obj);
      if (keys.length === 0) { result[prefix] = ""; return result; }
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var v = obj[k];
        var key = prefix ? prefix + "." + k : k;
        if (v !== null && typeof v === "object" && !Array.isArray(v)) {
          var nested = flatten(v, key);
          for (var nk in nested) result[nk] = nested[nk];
        } else {
          if (Array.isArray(v)) result[key] = JSON.stringify(v);
          else result[key] = v;
        }
      }
    } else {
      result[prefix] = obj;
    }
    return result;
  }

  function jsonToCsv(jsonStr) {
    var data;
    try { data = JSON.parse(jsonStr); }
    catch (e) { return { error: "Invalid JSON: " + e.message }; }

    if (data === null || data === undefined) return { error: "JSON is empty." };

    var rows;
    if (Array.isArray(data)) {
      if (data.length === 0) return { error: "Array is empty." };
      rows = data;
    } else if (typeof data === "object") {
      rows = [data];
    } else {
      return { error: "JSON must be an array or object." };
    }

    var flattened = [];
    var allKeys = [];
    for (var i = 0; i < rows.length; i++) {
      var flat = flatten(rows[i]);
      flattened.push(flat);
      for (var k in flat) {
        if (allKeys.indexOf(k) === -1) allKeys.push(k);
      }
    }

    var lines = [];
    lines.push(allKeys.map(function (k) { return escapeCsv(k); }).join(","));
    for (var i = 0; i < flattened.length; i++) {
      var line = [];
      for (var j = 0; j < allKeys.length; j++) {
        line.push(escapeCsv(flattened[i][allKeys[j]]));
      }
      lines.push(line.join(","));
    }
    return { csv: lines.join("\r\n"), rowCount: rows.length };
  }

  function setStatus(msg, isErr) {
    var s = $("csv-status"); s.textContent = msg || ""; s.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }

  function update() {
    var raw = $("json-input").value.trim();
    if (!raw) {
      $("csv-output").value = "";
      setStatus(""); return;
    }
    var result = jsonToCsv(raw);
    if (result.error) {
      $("csv-output").value = "";
      setStatus(result.error, true);
    } else {
      $("csv-output").value = result.csv;
      setStatus(result.rowCount + " rows converted.");
    }
  }

  $("json-input").addEventListener("input", update);

  $("copy-csv").addEventListener("click", function () {
    var v = $("csv-output").value;
    if (!v) { setStatus("Nothing to copy.", true); return; }
    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(v).then(function () { setStatus("Copied!"); });
    else setStatus("Copy not supported.", true);
  });

  $("download-csv").addEventListener("click", function () {
    var v = $("csv-output").value;
    if (!v) { setStatus("Nothing to download.", true); return; }
    var blob = new Blob(["\ufeff" + v], { type: "text/csv;charset=utf-8;".trim() });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "data.csv";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    setStatus("Downloaded!");
  });

  $("load-example").addEventListener("click", function () {
    $("json-input").value = JSON.stringify([
      { name: "Alice", age: 30, email: "alice@example.com", address: { city: "New York", zip: "10001" } },
      { name: "Bob", age: 25, email: "bob@example.com", address: { city: "London", zip: "EC1A" } },
      { name: "Charlie", age: 35, email: null, address: { city: "Tokyo", zip: "100-0001" } }
    ], null, 2);
    update();
  });
})();
