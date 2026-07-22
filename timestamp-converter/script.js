(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var tsInput = $("tsInput"), dateInput = $("dateInput");
  var dateOutput = $("dateOutput"), tsOutput = $("tsOutput");
  var status = $("status");

  function setStatus(msg, isErr) {
    status.textContent = msg || "";
    status.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }

  function fmtDate(d) {
    if (isNaN(d.getTime())) return null;
    var local = d.toLocaleString();
    var utc = d.toUTCString();
    var iso = d.toISOString();
    return local + "  |  UTC: " + utc + "  |  ISO: " + iso;
  }

  function tsToDate(val) {
    var n = parseInt(val.trim(), 10);
    if (isNaN(n)) { dateOutput.textContent = "Invalid timestamp"; return; }
    var ms = n > 1e12 ? n : n * 1000;
    var d = new Date(ms);
    var text = fmtDate(d);
    if (!text) { dateOutput.textContent = "Invalid timestamp"; return; }
    dateOutput.textContent = text;
    setStatus("");
  }

  function dateToTs(val) {
    if (!val.trim()) { tsOutput.textContent = "Enter a date"; return; }
    var d = new Date(val);
    if (isNaN(d.getTime())) { tsOutput.textContent = "Could not parse that date. Try: 2024-01-15 10:30:00"; return; }
    var secs = Math.floor(d.getTime() / 1000);
    var ms = d.getTime();
    tsOutput.textContent = "Seconds: " + secs + "  |  Milliseconds: " + ms;
    setStatus("");
  }

  tsInput.addEventListener("input", function () { tsToDate(this.value); });
  dateInput.addEventListener("input", function () { dateToTs(this.value); });

  $("now").addEventListener("click", function () {
    var now = Math.floor(Date.now() / 1000);
    tsInput.value = now;
    tsToDate(now);
    dateInput.value = "";
    tsOutput.textContent = "Enter a date above";
  });

  $("copyTs").addEventListener("click", function () {
    var v = tsOutput.textContent.replace(/[^0-9]/g, "").substring(0, 10);
    if (!v || v.length < 5) { setStatus("Nothing to copy yet.", true); return; }
    copyText(v);
  });

  $("copyDate").addEventListener("click", function () {
    var v = dateOutput.textContent;
    if (!v || v === "Enter a timestamp above" || v === "Invalid timestamp") { setStatus("Nothing to copy yet.", true); return; }
    copyText(v);
  });

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { setStatus("Copied!"); });
    } else {
      setStatus("Copy not supported — select and copy manually.", true);
    }
  }
})();
