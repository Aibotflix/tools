(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var input = $("in"), output = $("out"), status = $("status");

  function setStatus(msg, isErr) {
    status.textContent = msg || "";
    status.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }

  function parseCSV(text) {
    var lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error("CSV needs at least a header row and one data row.");
    var headers = parseCSVLine(lines[0]);
    var result = [];
    for (var i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      var vals = parseCSVLine(lines[i]);
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j].trim()] = (vals[j] || "").trim();
      }
      result.push(obj);
    }
    return result;
  }

  function parseCSVLine(line) {
    var result = [];
    var current = "";
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (inQuotes) {
        if (c === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += c;
        }
      } else {
        if (c === '"') {
          inQuotes = true;
        } else if (c === ",") {
          result.push(current);
          current = "";
        } else {
          current += c;
        }
      }
    }
    result.push(current);
    return result;
  }

  function jsonToCSV(arr) {
    if (!arr.length) return "";
    var keys = Object.keys(arr[0]);
    var lines = [keys.join(",")];
    for (var i = 0; i < arr.length; i++) {
      var row = [];
      for (var j = 0; j < keys.length; j++) {
        var val = String(arr[i][keys[j]] || "");
        if (val.indexOf(",") !== -1 || val.indexOf('"') !== -1 || val.indexOf("\n") !== -1) {
          val = '"' + val.replace(/"/g, '""') + '"';
        }
        row.push(val);
      }
      lines.push(row.join(","));
    }
    return lines.join("\n");
  }

  function run(act) {
    var v = input.value.trim();
    if (!v) { output.value = ""; setStatus(""); return; }
    try {
      if (act === "csv2json") {
        var arr = parseCSV(v);
        output.value = JSON.stringify(arr, null, 2);
        setStatus("Converted " + arr.length + " rows to JSON.");
      } else {
        var parsed = JSON.parse(v);
        if (!Array.isArray(parsed)) parsed = [parsed];
        output.value = jsonToCSV(parsed);
        setStatus("Converted " + parsed.length + " objects to CSV.");
      }
    } catch (e) {
      output.value = "";
      setStatus(e.message, true);
    }
  }

  document.querySelectorAll("[data-act]").forEach(function (b) {
    b.addEventListener("click", function () { run(b.dataset.act); });
  });

  $("copy").addEventListener("click", function () {
    var v = output.value;
    if (!v) { setStatus("Nothing to copy.", true); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(v).then(function () { setStatus("Copied!"); });
    }
  });

  $("download").addEventListener("click", function () {
    var v = output.value;
    if (!v) { setStatus("Nothing to download.", true); return; }
    var isJson = v.trim().startsWith("[") || v.trim().startsWith("{");
    var blob = new Blob([v], { type: isJson ? "application/json" : "text/csv" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = isJson ? "data.json" : "data.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus("Downloaded " + a.download);
  });
})();
