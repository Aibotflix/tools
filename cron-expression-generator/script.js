(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var DOWS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  function setStatus(msg, isErr) {
    var s = $("status");
    s.textContent = msg || "";
    s.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }

  // parse one field into a sorted array of matching ints, or null if invalid
  function parseField(f, min, max) {
    if (f === "*") {
      var all = [];
      for (var i = min; i <= max; i++) all.push(i);
      return all;
    }
    if (f.indexOf("*/") === 0) {
      var step = parseInt(f.slice(2), 10);
      if (isNaN(step) || step < 1) return null;
      var every = [];
      for (var j = min; j <= max; j += step) every.push(j);
      return every.length ? every : null;
    }
    var out = [];
    var parts = f.split(",");
    for (var k = 0; k < parts.length; k++) {
      var p = parts[k].trim();
      if (p === "") continue;
      if (p.indexOf("-") !== -1) {
        var r = p.split("-");
        var a = parseInt(r[0], 10), b = parseInt(r[1], 10);
        if (isNaN(a) || isNaN(b) || a < min || b > max || a > b) return null;
        for (var m = a; m <= b; m++) out.push(m);
      } else {
        var n = parseInt(p, 10);
        if (isNaN(n) || n < min || n > max) return null;
        out.push(n);
      }
    }
    return out.length ? out : null;
  }

  function parseCron(expr) {
    var parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return null;
    var min = parseField(parts[0], 0, 59);
    var hr  = parseField(parts[1], 0, 23);
    var dom = parseField(parts[2], 1, 31);
    var mon = parseField(parts[3], 1, 12);
    var dow = parseField(parts[4], 0, 6);
    if (!min || !hr || !dom || !mon || !dow) return null;
    return { min: min, hr: hr, dom: dom, mon: mon, dow: dow };
  }

  function describe(c) {
    var s = "";
    var everyMin = c.min.length === 60;
    var everyHr  = c.hr.length === 24;
    if (everyMin && everyHr) s = "Every minute";
    else if (everyMin) s = "Every minute, " + joinHrs(c.hr);
    else if (everyHr) s = joinMin(c.min).charAt(0).toUpperCase() + joinMin(c.min).slice(1) + " every hour";
    else s = "At " + joinHrs(c.hr) + joinMin(c.min);

    if (c.dom.length !== 31 && c.dow.length !== 7) s += ", on days " + joinList(c.dom) + " and " + joinDow(c.dow);
    else if (c.dom.length !== 31) s += ", on day " + joinList(c.dom) + " of the month";
    else if (c.dow.length !== 7) s += ", on " + joinDow(c.dow);

    if (c.mon.length !== 12) s += ", in " + joinMon(c.mon);
    return s + ".";
  }

  function joinMin(a) {
    if (a.length === 60) return "every minute";
    var step = detectStep(a);
    if (step > 1 && a.length > 2) return "every " + step + " minutes";
    return "at minute " + a.join(", ");
  }
  function joinHrs(a) {
    if (a.length === 24) return "every hour";
    var step = detectStep(a);
    if (step > 1 && a.length > 2) return "every " + step + " hours";
    return joinList(a.map(pad2));
  }
  function joinDow(a) {
    if (a.length === 7) return "every day";
    // contiguous run -> range name
    var step = detectStep(a);
    if (step === 1 && a.length > 1 && a[a.length-1] === a[0] + a.length - 1) {
      return DOWS[a[0]] + " through " + DOWS[a[a.length-1]];
    }
    return a.map(function (n) { return DOWS[n]; }).join(", ");
  }
  function joinMon(a) {
    if (a.length === 12) return "every month";
    var step = detectStep(a);
    if (step > 1 && a.length > 2) return "every " + step + " months";
    return a.map(function (n) { return MONTHS[n]; }).join(", ");
  }
  function joinList(a) { return a.join(", "); }
  function detectStep(a) {
    if (a.length < 2) return 1;
    var d = a[1] - a[0];
    for (var i = 2; i < a.length; i++) if (a[i] - a[i-1] !== d) return 1;
    return d > 0 ? d : 1;
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  // brute force next runs. ponytail: O(minutes scanned), 525600 cap; fine for finding 5 matches.
  function nextRuns(c, count) {
    var runs = [];
    var d = new Date();
    d.setSeconds(0, 0);
    d.setMinutes(d.getMinutes() + 1);
    var guard = 0;
    while (runs.length < count && guard < 525600) {
      guard++;
      if (c.min.indexOf(d.getMinutes()) !== -1 &&
          c.hr.indexOf(d.getHours()) !== -1 &&
          c.dom.indexOf(d.getDate()) !== -1 &&
          c.mon.indexOf(d.getMonth() + 1) !== -1 &&
          c.dow.indexOf(d.getDay()) !== -1) {
        runs.push(new Date(d));
      }
      d.setMinutes(d.getMinutes() + 1);
    }
    return runs;
  }

  function render() {
    var expr = $("cron").value;
    var c = parseCron(expr);
    if (!c) {
      $("human").textContent = "Invalid expression — need 5 fields.";
      $("nextRuns").textContent = "";
      setStatus("Invalid", true);
      return;
    }
    setStatus("");
    $("human").textContent = describe(c);
    var runs = nextRuns(c, 5);
    $("nextRuns").innerHTML = runs.length
      ? runs.map(function (r) {
          return "<div>" + r.toLocaleString(undefined, { weekday:"short", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" }) + "</div>";
        }).join("")
      : "<div>No upcoming match within a year.</div>";
  }

  $("cron").addEventListener("input", render);
  document.querySelectorAll(".preset").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $("cron").value = this.getAttribute("data-cron");
      render();
      $("cron").focus();
    });
  });

  render();
})();
