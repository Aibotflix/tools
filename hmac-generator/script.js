(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var status = $("status");

  function setStatus(msg, isErr) {
    status.textContent = msg || "";
    status.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }

  function toHex(buf, upper) {
    return Array.from(new Uint8Array(buf))
      .map(function (b) { return b.toString(16).padStart(2, "0"); })
      .join(upper ? "" : "")
      .replace(/./g, function (c) { return upper ? c.toUpperCase() : c; });
  }

  function toBase64(buf) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));
  }

  async function computeHMAC() {
    var message = $("message").value;
    var secret = $("secret").value;
    var algo = $("algo").value;
    var encoding = $("encoding").value;

    if (!message || !secret) {
      $("result").textContent = "—";
      setStatus(""); return;
    }

    try {
      var enc = new TextEncoder();
      var key = await crypto.subtle.importKey(
        "raw", enc.encode(secret),
        { name: "HMAC", hash: algo },
        false, ["sign"]
      );
      var sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
      var hex = toHex(sig, encoding === "hexU");
      $("result").textContent = encoding === "base64" ? toBase64(sig) : hex;
      setStatus(algo + " computed. Click to copy.");
    } catch (e) {
      setStatus("Web Crypto API not available in this browser.", true);
    }
  }

  $("message").addEventListener("input", computeHMAC);
  $("secret").addEventListener("input", computeHMAC);
  $("algo").addEventListener("change", computeHMAC);
  $("encoding").addEventListener("change", computeHMAC);

  $("result").addEventListener("click", function () {
    var v = this.textContent;
    if (!v || v === "—") return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(v).then(function () { setStatus("HMAC copied!"); });
    }
  });
})();
