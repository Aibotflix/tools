(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var status = $("status");
  var MONTH_NAMES = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var DOW_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  function setStatus(msg, isErr) {
    status.textContent = msg || "";
    status.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }

  function populateSelect(id, max) {
    var sel = $(id);
    for (var i = 0; i <= max; i++) {
      var opt = document.createElement("option");
      opt.value = i; opt.textContent = i;
      sel.appendChild(opt);
    }
  }
  populateSelect("minuteSpecific", 59);
  populateSelect("hourSpecific", 23);
  populateSelect("domSpecific", 31);
  populateSelect("monthSpecific", 12);
  populateSelect("dowSpecific", 6);

  function toggleField(typeId, nId, rangeId, listId, specificId, maxN) {
    var type = $(typeId).value;
    $(nId).style.display = type === "everyN" ? "" : "none";
    $(rangeId).style.display = type === "range" ? "" : "none";
    $(listId).style.display = type === "list" ? "" : "none";
    $(specificId).style.display = type === "specific" ? "" : "none";
    generate();
  }

  ["minute","hour","dom","month","dow"].forEach(function (f) {
    var typeId = f === "dom" ? "domType" : f + "Type";
    var nId = f === "dom" ? "domEveryN" : f + "EveryN";
    var rangeId = f === "dom" ? "domRange" : f + "Range";
    var listId = f === "dom" ? "domList" : f + "List";
    var specificId = f === "dom" ? "domSpecific" : f + "Specific";
    $(typeId).addEventListener("change", function () { toggleField(typeId, nId, rangeId, listId, specificId); });
    $(nId).addEventListener("input", generate);
    $(rangeId).addEventListener("input", generate);
    $(listId).addEventListener("input", generate);
    $(specificId).addEventListener("change", generate);
  });

  function buildField(typeId, nId, rangeId, listId, specificId, min, max) {
    var type = $(typeId).value;
    if (type === "every") return "*";
    if (type === "everyN") {
      var n = parseInt($(nId).value, 10);
      if (isNaN(n) || n < 1) n = 1;
      return "*/" + n;
    }
    if (type === "range") {
      var r = $(rangeId).value.trim();
      return r || "*";
    }
    if (type === "list") {
      var l = $(listId).value.trim();
      return l || "*";
    }
    if (type === "specific") {
      var sel = $(specificId);
      var vals = [];
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].selected) vals.push(sel.options[i].value);
      }
      return vals.length ? vals.join(",") : "*";
    }
    return "*";
  }

  function generate() {
    var cron = buildField("minuteType","minuteEveryN","minuteRange","minuteList","minuteSpecific",0,59)
      + " " + buildField("hourType","hourEveryN","hourRange","hourList","hourSpecific",0,23)
      + " " + buildField("domType","domEveryN","domRange","domList","domSpecific",1,31)
      + " " + buildField("monthType","monthEveryN","monthRange","monthList","monthSpecific",1,12)
      + " " + buildField("dowType","dowEveryN","dowRange","dowList","dowSpecific",0,6);

    $("cron").textContent = cron;
    $("human").textContent = describeCron(cron);
    showNextRuns(cron);
  }

  function describeCron(expr) {
    var parts = expr.split(/\s+/);
    if (parts.length < 5) return "Invalid expression";
    var min = parts[0], hr = parts[1], dom = parts[2], mon = parts[3], dow = parts[4];
    var desc = "";
    if (min === "*" && hr === "*") desc = "Every minute";
    else if (min.startsWith("*/")) desc = "Every " + min.slice(2) + " minutes";
    else if (hr === "*" && min !== "*") desc = "At minute " + min;
    else if (hr.startsWith("*/")) desc = "Every " + hr.slice(2) + " hours";
    else desc = "At " + hr.padStart(2,"0") + ":" + min.padStart(2,"0");

    if (dom !== "*" && dow !== "*") desc += ", on days " + dom + " and " + DOW(dow);
    else if (dom !== "*") desc += ", on day " + dom + " of the month";
    else if (dow !== "*") desc += ", on " + DOW(dow);

    if (mon !== "*") desc += ", in " + MON(mon);
    return desc;
  }

  function DOW(v) {
    if (v === "*") return "every day";
    if (v.indexOf("-") !== -1) {
      var p = v.split("-");
      return DOW_NAMES[parseInt(p[0])] + "-" + DOW_NAMES[parseInt(p[1])];
    }
    if (v.indexOf(",") !== -1) return v.split(",").map(function (x) { return DOW_NAMES[parseInt(x)] || x; }).join(", ");
    return DOW_NAMES[parseInt(v)] || v;
  }

  function MON(v) {
    if (v === "*") return "every month";
    if (v.indexOf(",") !== -1) return v.split(",").map(function (x) { return MONTH_NAMES[parseInt(x)] || x; }).join(", ");
    return MONTH_NAMES[parseInt(v)] || v;
  }

  function cronToRegex(expr) {
    var parts = expr.split(/\s+/);
    if (parts.length < 5) return null;
    function fieldToRegex(f, min, max) {
      if (f === "*") return ".+";
      if (f.startsWith("*/")) {
        var n = parseInt(f.slice(2));
        return "(?:" + Array.from({length: Math.floor((max - min) / n) + 1}, function (_, i) { return min + i * n; }).join("|") + ")";
      }
      if (f.indexOf(",") !== -1) return "(?:" + f.split(",").map(function (x) { return x.trim(); }).join("|") + ")";
      if (f.indexOf("-") !== -1) {
        var p = f.split("-");
        var result = [];
        for (var i = parseInt(p[0]); i <= parseInt(p[1]); i++) result.push(i);
        return "(?:" + result.join("|") + ")";
      }
      return f;
    }
    return {
      min: new RegExp("^" + fieldToRegex(parts[0], 0, 59) + "$"),
      hr: new RegExp("^" + fieldToRegex(parts[1], 0, 23) + "$"),
      dom: new RegExp("^" + fieldToRegex(parts[2], 1, 31) + "$"),
      mon: new RegExp("^" + fieldToRegex(parts[3], 1, 12) + "$"),
      dow: new RegExp("^" + fieldToRegex(parts[4], 0, 6) + "$")
    };
  }

  function showNextRuns(expr) {
    var el = $("nextRuns");
    var re = cronToRegex(expr);
    if (!re) { el.textContent = "Invalid expression"; return; }
    var now = new Date();
    var d = new Date(now);
    d.setSeconds(0); d.setMilliseconds(0);
    d.setMinutes(d.getMinutes() + 1);
    var runs = [];
    var safety = 0;
    while (runs.length < 5 && safety < 525600) {
      safety++;
      if (re.min.test(String(d.getMinutes())) &&
          re.hr.test(String(d.getHours())) &&
          re.dom.test(String(d.getDate())) &&
          re.mon.test(String(d.getMonth() + 1)) &&
          re.dow.test(String(d.getDay()))) {
        runs.push(new Date(d));
      }
      d.setMinutes(d.getMinutes() + 1);
    }
    el.innerHTML = runs.map(function (r) {
      return "<div>" + r.toLocaleString(undefined, { weekday:"short", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" }) + "</div>";
    }).join("");
  }

  $("cron").addEventListener("click", function () {
    var v = this.textContent;
    if (!v) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(v).then(function () { setStatus("Copied!"); });
    }
  });

  document.querySelectorAll(".preset").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cron = this.getAttribute("data-cron");
      var parts = cron.split(" ");
      setField("minute", parts[0], 0, 59);
      setField("hour", parts[1], 0, 23);
      setField("dom", parts[2], 1, 31);
      setField("month", parts[3], 1, 12);
      setField("dow", parts[4], 0, 6);
      generate();
    });
  });

  function setField(name, val, min, max) {
    var typeId = (name === "dom" ? "dom" : name) + "Type";
    var specificId = (name === "dom" ? "dom" : name) + "Specific";
    if (val === "*") {
      $(typeId).value = "every";
    } else if (val.startsWith("*/")) {
      $(typeId).value = "everyN";
      var nId = (name === "dom" ? "dom" : name) + "EveryN";
      $(nId).value = val.slice(2);
    } else if (val.indexOf("-") !== -1 && val.indexOf(",") === -1) {
      $(typeId).value = "range";
      var rangeId = (name === "dom" ? "dom" : name) + "Range";
      $(rangeId).value = val;
    } else if (val.indexOf(",") !== -1) {
      $(typeId).value = "list";
      var listId = (name === "dom" ? "dom" : name) + "List";
      $(listId).value = val;
    } else {
      $(typeId).value = "specific";
      var sel = $(specificId);
      var vals = val.split(",");
      for (var i = 0; i < sel.options.length; i++) {
        sel.options[i].selected = vals.indexOf(sel.options[i].value) !== -1;
      }
    }
    toggleField(typeId, (name==="dom"?"dom":name)+"EveryN", (name==="dom"?"dom":name)+"Range", (name==="dom"?"dom":name)+"List", specificId);
  }

  generate();
})();
