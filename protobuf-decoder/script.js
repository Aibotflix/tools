(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var status = $("status");
  var outputEl = $("output");
  var summaryEl = $("summary");

  var WIRE_TYPES = {
    0: "varint",
    1: "64-bit",
    2: "length-delimited",
    3: "start group",
    4: "end group",
    5: "32-bit"
  };

  function setStatus(msg, isErr) {
    status.textContent = msg || "";
    status.className = "status" + (isErr ? " err" : msg ? " ok" : "");
  }

  function hexToBytes(hex) {
    hex = hex.replace(/^0x/i, "").replace(/\s+/g, "");
    if (!/^[0-9a-fA-F]*$/.test(hex) || hex.length % 2 !== 0) return null;
    var bytes = new Uint8Array(hex.length / 2);
    for (var i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  function base64ToBytes(b64) {
    try {
      var bin = atob(b64);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    } catch (e) { return null; }
  }

  function detectFormat(str) {
    str = str.replace(/\s+/g, "");
    if (/^[0-9a-fA-F]+$/.test(str) && str.length % 2 === 0) return "hex";
    if (/^[A-Za-z0-9+/]+=*$/.test(str)) return "base64";
    return null;
  }

  function readVarint(bytes, offset) {
    var result = 0;
    var shift = 0;
    var pos = offset;
    while (pos < bytes.length) {
      var b = bytes[pos];
      result |= (b & 0x7f) << shift;
      if ((b & 0x80) === 0) return { value: result, size: pos - offset + 1 };
      shift += 7;
      if (shift > 63) return null;
      pos++;
    }
    return null;
  }

  function readSignedVarint(bytes, offset) {
    var result = 0;
    var shift = 0;
    var pos = offset;
    while (pos < bytes.length) {
      var b = bytes[pos];
      result |= (b & 0x7f) << shift;
      shift += 7;
      if ((b & 0x80) === 0) {
        if (shift < 32) return { value: result, size: pos - offset + 1 };
        // Handle 64-bit signed
        return { value: result, size: pos - offset + 1 };
      }
      if (shift > 63) return null;
      pos++;
    }
    return null;
  }

  function toHex(bytes) {
    return Array.from(bytes).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }

  function tryDecodeString(bytes) {
    var printable = true;
    for (var i = 0; i < bytes.length; i++) {
      var c = bytes[i];
      if (c < 32 || c > 126) { printable = false; break; }
    }
    if (printable && bytes.length > 0) {
      return String.fromCharCode.apply(null, bytes);
    }
    return null;
  }

  function decodeProtobuf(bytes, depth) {
    depth = depth || 0;
    var indent = "  ".repeat(depth);
    var results = [];
    var offset = 0;
    var fieldCount = {};

    while (offset < bytes.length) {
      var tag = readVarint(bytes, offset);
      if (!tag) { results.push(indent + "(truncated varint at offset " + offset + ")"); break; }
      offset += tag.size;

      var fieldNum = tag.value >>> 3;
      var wireType = tag.value & 0x07;

      fieldCount[fieldNum] = (fieldCount[fieldNum] || 0) + 1;
      var suffix = fieldCount[fieldNum] > 1 ? " (repeated)" : "";

      if (wireType === 0) {
        var val = readVarint(bytes, offset);
        if (!val) { results.push(indent + "Field " + fieldNum + ": (truncated varint value)"); break; }
        offset += val.size;
        results.push(indent + "Field " + fieldNum + " (varint): " + val.value + suffix);
      } else if (wireType === 1) {
        if (offset + 8 > bytes.length) { results.push(indent + "Field " + fieldNum + ": (truncated 64-bit)"); break; }
        var hex64 = toHex(bytes.slice(offset, offset + 8));
        offset += 8;
        results.push(indent + "Field " + fieldNum + " (64-bit): 0x" + hex64 + suffix);
      } else if (wireType === 2) {
        var len = readVarint(bytes, offset);
        if (!len) { results.push(indent + "Field " + fieldNum + ": (truncated length)"); break; }
        offset += len.size;
        var data = bytes.slice(offset, offset + len.value);
        offset += len.value;

        var str = tryDecodeString(data);
        if (str) {
          results.push(indent + "Field " + fieldNum + " (string): \"" + str + "\"" + suffix);
        } else {
          // Try to decode as embedded message
          var sub = decodeProtobuf(data, depth + 1);
          if (sub.length > 0 && !sub[0].match(/^\s+\(/)) {
            results.push(indent + "Field " + fieldNum + " (message) {");
            results = results.concat(sub);
            results.push(indent + "}");
          } else {
            results.push(indent + "Field " + fieldNum + " (bytes): " + toHex(data) + suffix);
          }
        }
      } else if (wireType === 5) {
        if (offset + 4 > bytes.length) { results.push(indent + "Field " + fieldNum + ": (truncated 32-bit)"); break; }
        var hex32 = toHex(bytes.slice(offset, offset + 4));
        offset += 4;
        results.push(indent + "Field " + fieldNum + " (32-bit): 0x" + hex32 + suffix);
      } else if (wireType === 3 || wireType === 4) {
        results.push(indent + "Field " + fieldNum + " (" + WIRE_TYPES[wireType] + "): (deprecated, skipped)" + suffix);
        break;
      } else {
        results.push(indent + "Field " + fieldNum + ": (unknown wire type " + wireType + ")" + suffix);
        break;
      }
    }

    return results;
  }

  function decode() {
    var input = $("input").value.trim();
    var format = $("inputFormat").value;
    if (!input) { outputEl.textContent = ""; summaryEl.textContent = ""; setStatus(""); return; }

    var bytes;
    if (format === "auto") format = detectFormat(input);
    if (format === "hex") bytes = hexToBytes(input);
    else if (format === "base64") bytes = base64ToBytes(input);
    else { setStatus("Could not detect input format. Try selecting hex or base64 manually.", true); return; }

    if (!bytes || bytes.length === 0) {
      setStatus("Invalid input. Check your data.", true);
      outputEl.textContent = "";
      summaryEl.textContent = "";
      return;
    }

    try {
      var lines = decodeProtobuf(bytes);
      outputEl.textContent = lines.length ? lines.join("\n") : "(empty or unparseable data)";
      var fieldNums = [];
      var fieldCount = {};
      var offset = 0;
      while (offset < bytes.length) {
        var tag = readVarint(bytes, offset);
        if (!tag) break;
        offset += tag.size;
        var fnum = tag.value >>> 3;
        var wt = tag.value & 0x07;
        fieldNums.push(fnum);
        fieldCount[fnum] = (fieldCount[fnum] || 0) + 1;
        if (wt === 0) { var v = readVarint(bytes, offset); if (v) offset += v.size; else break; }
        else if (wt === 1) offset += 8;
        else if (wt === 2) { var l = readVarint(bytes, offset); if (l) { offset += l.size; offset += l.value; } else break; }
        else if (wt === 5) offset += 4;
        else break;
      }
      var unique = fieldNums.filter(function (v, i, a) { return a.indexOf(v) === i; });
      summaryEl.textContent = bytes.length + " bytes | " + unique.length + " unique fields | wire types: " +
        Object.keys(fieldCount).map(function (k) { return "f" + k + ":" + fieldCount[k]; }).join(", ");
      setStatus("Decoded " + bytes.length + " bytes.");
    } catch (e) {
      setStatus("Decode error: " + e.message, true);
    }
  }

  $("input").addEventListener("input", decode);
  $("inputFormat").addEventListener("change", decode);

  $("copyOutput").addEventListener("click", function () {
    var v = outputEl.textContent;
    if (!v) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(v).then(function () { setStatus("Copied!"); });
    }
  });
})();
