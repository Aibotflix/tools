(function () {
  "use strict";
  function $ (id){ return document.getElementById(id); }
  var cats = {
    length: ["Meter","Kilometer","Centimeter","Millimeter","Mile","Yard","Foot","Inch","Nautical mile"],
    mass: ["Gram","Kilogram","Milligram","Microgram","Pound","Ounce","Stone","Tonne"]
  };
  var factor = {
    length: { Meter:1, Kilometer:1000, Centimeter:0.01, Millimeter:0.001, Mile:1609.344, Yard:0.9144, Foot:0.3048, Inch:0.0254, "Nautical mile":1852 },
    mass: { Gram:1, Kilogram:1000, Milligram:0.001, Microgram:1e-6, Pound:453.59237, Ounce:28.349523125, Stone:6350.29318, Tonne:1000000 }
  };
  var temp = ["Celsius","Fahrenheit","Kelvin"];
  function toC(v, u){ return u==="Celsius" ? v : u==="Fahrenheit" ? (v-32)*5/9 : v-273.15; }
  function fromC(c, u){ return u==="Celsius" ? c : u==="Fahrenheit" ? c*9/5+32 : c+273.15; }
  function fmt(n){ if (!isFinite(n)) return "—"; return parseFloat(n.toPrecision(10)).toString(); }

  function populate(cat){
    var list = cat==="temperature" ? temp : cats[cat];
    var f = $("from"), t = $("to"); f.innerHTML=""; t.innerHTML="";
    list.forEach(function(u, i){
      var a=document.createElement("option"); a.value=u; a.textContent=u; f.appendChild(a);
      var b=document.createElement("option"); b.value=u; b.textContent=u; t.appendChild(b);
    });
    if (cat==="length"){ f.value="Mile"; t.value="Kilometer"; }
    else if (cat==="mass"){ f.value="Pound"; t.value="Kilogram"; }
    else { f.value="Celsius"; t.value="Fahrenheit"; }
  }
  function convert(){
    var cat=$("cat").value, from=$("from").value, to=$("to").value, v=parseFloat($("val").value);
    if (isNaN(v)){ $("result").value=""; return; }
    var r = cat==="temperature" ? fromC(toC(v, from), to) : v * factor[cat][from] / factor[cat][to];
    $("result").value = fmt(r);
  }
  $("cat").addEventListener("change", function(){ populate($("cat").value); convert(); });
  $("from").addEventListener("change", convert);
  $("to").addEventListener("change", convert);
  $("val").addEventListener("input", convert);
  $("swap").addEventListener("click", function(){ var f=$("from"),t=$("to"),x=f.value; f.value=t.value; t.value=x; convert(); });
  populate("length"); convert();
})();
