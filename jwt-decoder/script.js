(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var status = $("status");

  function setStatus(msg, isErr) {
    status.textContent = msg || "";
    status.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }

  function decodeB64Url(str) {
    var base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    var bin = atob(base64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  }

  function prettyJson(str) {
    try { return JSON.stringify(JSON.parse(str), null, 2); }
    catch (e) { return str; }
  }

  function decode() {
    var raw = $("token").value.trim();
    if (!raw) {
      $("header").textContent = "Paste a JWT above";
      $("payload").textContent = "Paste a JWT above";
      $("sig").textContent = "—";
      setStatus(""); return;
    }
    var parts = raw.split(".");
    if (parts.length < 2 || parts.length > 3) {
      setStatus("Invalid JWT — expected 2 or 3 parts separated by dots.", true);
      $("header").textContent = ""; $("payload").textContent = ""; $("sig").textContent = "";
      return;
    }
    try {
      var header = prettyJson(decodeB64Url(parts[0]));
      var payload = prettyJson(decodeB64Url(parts[1]));
      $("header").textContent = header;
      $("payload").textContent = payload;
      $("sig").textContent = parts[2] || "—";

      var parsed = JSON.parse(payload);
      if (parsed.exp) {
        var expDate = new Date(parsed.exp * 1000);
        var now = new Date();
        var expired = expDate < now;
        setStatus("Expires: " + expDate.toLocaleString() + (expired ? " (EXPIRED)" : " (valid)"), expired);
      } else {
        setStatus("Decoded successfully — no expiration claim found.");
      }
    } catch (e) {
      setStatus("Could not decode token: " + e.message, true);
    }
  }

  $("token").addEventListener("input", decode);

  function copyPart(id, label) {
    var v = $(id).textContent;
    if (!v || v === "—" || v.startsWith("Paste")) { setStatus("Nothing to copy.", true); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(v).then(function () { setStatus(label + " copied!"); });
    }
  }

  $("copyHeader").addEventListener("click", function () { copyPart("header", "Header"); });
  $("copyPayload").addEventListener("click", function () { copyPart("payload", "Payload"); });
})();
