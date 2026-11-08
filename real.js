// Real price history for the charts + home calculators. Loaded by texgen.js after the app has started.
(function () {
  "use strict";
  if (typeof RAW === "undefined" || typeof ASSETS === "undefined") return;
  var get = function (u) { return fetch(u).then(function (r) { return r.ok ? r.json() : Promise.reject(); }); };
  var nf = function (d) { return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var css = ".rc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}" +
    ".rc{padding:20px;display:grid;gap:12px;align-content:start}.rc h3{margin:0;font-size:17px}" +
    ".rc .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}" +
    ".rc-out{background:var(--surface-2);border-radius:var(--r-md);padding:14px;display:grid;gap:4px}" +
    ".rc-out b{font-family:var(--f-data);font-size:22px;font-weight:500;color:var(--ink)}.rc-out span{font-size:13px;color:var(--ink-2)}" +
    ".rc-out .up{color:var(--up)}.rc-out .dn{color:var(--down)}" +
    "@media (max-width:900px){.rc-grid{grid-template-columns:1fr}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  var REAL = [], H = null, L = null;
  var AY = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var ayYil = function (d) { var p = d.split("-"); return AY[+p[1] - 1] + " " + p[0]; };
  window.ATLAS_REAL = REAL;
  var has = function (k) { return REAL.indexOf(k) >= 0; };
  // "Borsa, konut, otomobil ve mevduat" minus the series that came in as real data
  var simWords = function () {
    var w = ["borsa"].concat(has("konut") ? [] : ["konut"], ["otomobil"], has("mevduat") ? [] : ["mevduat geçmişi"]);
    return w.length > 1 ? w.slice(0, -1).join(", ") + " ve " + w[w.length - 1] : w[0];
  };
  var realWords = function () { return "döviz, altın, Bitcoin" + (has("konut") ? ", konut" : "") + (has("mevduat") ? ", mevduat faizi" : "") + " ve enflasyon geçmişi"; };
  // Assets whose 12-month forecast is anchored to the TCMB survey (filled by applyForecast)
  var FCK = [];
  window.ATLAS_FC = FCK;
  var fcWords = function () { return "Dolar, euro, altın, konut ve otomobil tahminleri TCMB Piyasa Katılımcıları Anketi beklentilerine dayanır; borsa ve Bitcoin tahminleri simüledir."; };
  var cap = function (t) { return t.charAt(0).toLocaleUpperCase("tr-TR") + t.slice(1); };
  var SIM_TIP = function () {
    return REAL.length
      ? cap(realWords()) + " gerçek veridir (TCMB EVDS, Kraken). " + cap(simWords()) + (FCK.length ? " simüledir. " + fcWords() : " ile tüm tahminler simüledir.")
      : "Bu sayfadaki fiyat geçmişi ve tahminler simüledir.";
  };
  function fixBadges(root) {
    if (!REAL.length) return;
    (root || document).querySelectorAll(".sim").forEach(function (b) {
      if (/Simüle veri/.test(b.textContent)) { b.textContent = /hesaplandı/.test(b.textContent) ? "Kısmen gerçek veriyle hesaplandı" : "Kısmen gerçek veri"; }
      b.setAttribute("data-tip", SIM_TIP()); b.setAttribute("tabindex", "0");
    });
    var w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) if (n.nodeValue.indexOf("Prototipte tüm seriler simüledir.") >= 0)
      n.nodeValue = n.nodeValue.replace("Prototipte tüm seriler simüledir.", cap(realWords()) + " gerçek veridir; " + simWords() + " simüledir.");
  }
  // The live box and footer are written by texgen.js; correct their "charts are simulated" wording once real history is in
  function fixTexts() {
    var sp = document.querySelector("#live .live-h span:last-child");
    if (sp && /simüle/.test(sp.textContent)) sp.textContent = "Döviz, altın, Bitcoin" + (has("konut") ? ", konut" : "") + (has("mevduat") ? " ve mevduat" : "") + " grafikleri gerçek geçmiş veridir; diğer grafikler " + (FCK.length ? "simüledir, tahminler TCMB anketine dayanır." : "ve tahminler simüledir.");
    var ft = document.querySelector("#foot p");
    if (ft) ft.textContent = 'ATLAS bir prototiptir. "Canlı piyasa" kutusu, kaynağı belirtilen haberler ile ' + realWords() + ' gerçek veridir. ' + cap(simWords()) + (FCK.length ? ' simüle edilmiştir. ' + fcWords() : ' ile tahminler simüle edilmiştir.') + ' Hiçbiri yatırım tavsiyesi niteliği taşımaz.';
  }
  function wrap(name, after) {
    var f = window[name]; if (typeof f !== "function") return;
    window[name] = function () { var r = f.apply(this, arguments); try { after(); } catch (e) {} return r; };
  }
  function copy(dst, src) { if (!src || src.length !== dst.length) return false; for (var i = 0; i < dst.length; i++) dst[i] = src[i]; return true; }

  function applyHistory(h) {
    if (h.n !== N || h.start !== T[0]) return;
    if (copy(RAW.usd, h.usd)) { REAL.push("dolar"); if (!copy(RAW.eur, h.eur)) RAW.usd.forEach(function (u, i) { RAW.eur[i] = u * RAW.eurusd[i]; }); else REAL.push("euro"); }
    if (copy(RAW.gold, h.gold)) REAL.push("altin");
    if (copy(RAW.btcUsd, h.btcUsd)) REAL.push("bitcoin");
    var b = ASSETS.bitcoin.tl; for (var i = 0; i < b.length; i++) b[i] = RAW.btcUsd[i] * RAW.usd[i];
    if (copy(RAW.cpiTR, h.cpiTR)) REAL.push("tufe");
    // Housing: TCMB Konut Fiyat Endeksi replaces the simulated TL/m² series, so the card shows index points
    if (copy(RAW.house, h.house)) {
      REAL.push("konut");
      var kd = h.houseLast ? ayYil(h.houseLast) : "";
      ASSETS.konut.desc = "TCMB konut endeksi";
      ASSETS.konut.descLong = "TCMB Konut Fiyat Endeksi" + (kd ? " (son veri " + kd + ")" : "");
      ASSETS.konut.display = function (a) { return nf(1).format(a) + " puan"; };
    }
    // Deposit history: weekly TCMB average TL deposit rates by maturity replace the policy-rate model in a2.js
    var dh = h.depHist;
    if (dh && dh.m3 && dh.m6 && dh.y1 && typeof depMemo !== "undefined") {
      var step = function (list) { return function (t) { var v = null; for (var j = 0; j < list.length && list[j][0] <= t; j++) v = list[j][1]; return v; }; };
      var f3 = step(dh.m3), f6 = step(dh.m6), f12 = step(dh.y1);
      window.DEP_REAL_TL = function (days, t) { return days >= 365 ? f12(t) : days >= 182 ? f6(t) : f3(t); };
      depMemo.clear();
      REAL.push("mevduat");
    }
    if (!REAL.length) return;
    // Every view reads these arrays at render time, so re-rendering picks up the real data
    renderMarkets(); renderHomeChart(); renderHomeForecasts();
    var v = (location.hash || "#ana").slice(1);
    if (v === "karsilastir") renderCompare();
    if (v === "tahmin") renderForecast();
    fixBadges();
    fixTexts();
    var lv = document.getElementById("live");
    if (lv && window.MutationObserver) new MutationObserver(fixTexts).observe(lv, { childList: true });
  }
  ["renderCompare", "renderForecast", "renderHomeChart"].forEach(function (n) { wrap(n, function () { fixBadges(); }); });

  // --- Deposit calculator on the comparison page: default to the latest real TCMB rates ---
  function depFor(term) { var d = H && H.deposit; if (!d) return null; return term >= 365 ? d.y1 : term >= 182 ? d.m6 : d.m3; }
  var BUCKET = { 32: "3 aya kadar", 91: "3 aya kadar", 182: "6 aya kadar", 365: "1 yıla kadar" };
  wrap("renderCalc", function () {
    var note = document.querySelector("#calcForm .fld-wide.note");
    var d = depFor(calc.term);
    if (note && calc.cur === "TL" && d) note.textContent = "Faiz kutusu TCMB'nin yayımladığı son ortalama TL mevduat faiziyle dolduruldu (" + BUCKET[calc.term] + " vadeli, " + d.d.split("-").join(".") + "). Enflasyon kutusu son yıllık TÜFE'dir" + (H.cpiYoy ? " (" + ayYil(H.cpiYoy.d) + ")" : "") + ". Stopaj güncel oranlardır. Kendi bankanızın oranını yazabilirsiniz.";
  });
  var origRender = window.renderCalc;
  window.renderCalc = function () {
    var d = depFor(calc.term);
    if (calc.cur === "TL" && calc.rate == null && d) calc.rate = d.v;
    return origRender.apply(this, arguments);
  };
  function applyCalcDefaults() {
    if (H && H.cpiYoy) CALC_INFL.TL = Math.round(H.cpiYoy.v * 10) / 10;
    if (calc.cur === "TL") { calc.rate = null; calc.infl = null; }
    renderCalc();
  }

  // --- Home calculators ---
  var ccy = { TL: ["TL", "₺"], USD: ["Dolar", "$"], EUR: ["Euro", "€"], XAU: ["Gram altın", "gr"], BTC: ["Bitcoin", "BTC"] };
  function tlPer(k) { return k === "TL" ? 1 : k === "USD" ? L.usd : k === "EUR" ? L.eur : k === "XAU" ? L.gold : k === "BTC" ? L.btc : null; }
  function opts(sel) { return Object.keys(ccy).filter(function (k) { return tlPer(k); }).map(function (k) { return '<option value="' + k + '"' + (k === sel ? " selected" : "") + ">" + ccy[k][0] + "</option>"; }).join(""); }
  function fmtAmt(v, k) { var d = k === "BTC" ? 6 : k === "XAU" ? 2 : 2; return nf(Math.abs(v) >= 1e4 && k !== "BTC" ? 0 : d).format(v) + " " + ccy[k][1]; }
  function pct(v) { return (v >= 0 ? "+" : "−") + "%" + nf(1).format(Math.abs(v * 100)); }
  function num(id) { var v = parseFloat(document.getElementById(id).value); return isNaN(v) ? 0 : v; }

  function calcFx() {
    var a = num("rcFxAmt"), f = document.getElementById("rcFxFrom").value, t = document.getElementById("rcFxTo").value;
    var v = a * tlPer(f) / tlPer(t);
    document.getElementById("rcFxOut").innerHTML = "<b>" + fmtAmt(v, t) + "</b><span>" + fmtAmt(a, f) + " = " + fmtAmt(v, t) + "</span>";
  }
  function calcDep() {
    var a = num("rcDepAmt"), term = +document.getElementById("rcDepTerm").value, r = num("rcDepRate") / 100;
    var tax = typeof stopajTL === "function" ? stopajTL(term, NOW) : 0.175;
    var gross = a * r * term / 365, net = gross * (1 - tax);
    document.getElementById("rcDepOut").innerHTML = "<b>" + fmtAmt(a + net, "TL") + "</b><span>Vade sonunda: " + fmtAmt(net, "TL") + " net faiz (brüt " + fmtAmt(gross, "TL") + ", stopaj %" + nf(1).format(tax * 100) + ")</span>";
  }
  function calcReal() {
    var n = num("rcRealNom") / 100, i = num("rcRealInf") / 100, r = (1 + n) / (1 + i) - 1, a = 100000;
    document.getElementById("rcRealOut").innerHTML = '<b class="' + (r >= 0 ? "up" : "dn") + '">' + pct(r) + "</b><span>" +
      (r >= 0 ? "Getiriniz enflasyonun üzerinde; alım gücünüz artar." : "Getiriniz enflasyonun altında; alım gücünüz azalır.") +
      " 100.000 ₺, bir yıl sonra bugünün fiyatlarıyla " + fmtAmt(a * (1 + r), "TL") + " eder.</span>";
  }
  function renderCalcs() {
    var mk = document.getElementById("markets"); if (!mk || !L) return;
    var sec = document.getElementById("rcSec");
    if (!sec) { sec = document.createElement("div"); sec.className = "section"; sec.id = "rcSec"; var next = mk.nextElementSibling; mk.parentNode.insertBefore(sec, next && next.nextElementSibling ? next.nextElementSibling : null); }
    var d = depFor(32), dv = d ? d.v : (L.evds && L.evds.deposit3m ? L.evds.deposit3m.v : 40);
    var inf = H && H.cpiYoy ? H.cpiYoy : L.evds && L.evds.cpiYoy;
    var t = new Date(L.updated).toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
    sec.innerHTML = '<div class="sec-head"><div><span class="eyebrow">Hesaplayıcılar</span><h2 class="h-sec">Hızlı hesapla</h2><p class="sub">Güncel kur, faiz ve enflasyon verisiyle dolduruldu. Değerleri değiştirebilirsiniz.</p></div><a class="link-more" href="#karsilastir" data-calc-link="1">Ayrıntılı mevduat hesabı →</a></div>' +
      '<div class="rc-grid">' +
      '<div class="card rc"><h3>Döviz çevirici</h3><label class="fld"><span>Tutar</span><input id="rcFxAmt" type="number" inputmode="decimal" min="0" value="1000"></label>' +
      '<div class="row2"><label class="fld"><span>Kaynak</span><select id="rcFxFrom">' + opts("USD") + '</select></label><label class="fld"><span>Hedef</span><select id="rcFxTo">' + opts("TL") + "</select></label></div>" +
      '<div class="rc-out" id="rcFxOut"></div><p class="note">Kur: ' + esc(L.sources.fx || "") + (L.sources.crypto ? ", altın ve Bitcoin: " + esc(L.sources.crypto) : "") + " · " + t + ". Gram altın yaklaşık değerdir; alış-satış farkı dahil değildir.</p></div>" +
      '<div class="card rc"><h3>Mevduat getirisi</h3><label class="fld"><span>Tutar (₺)</span><input id="rcDepAmt" type="number" inputmode="decimal" min="0" step="1000" value="100000"></label>' +
      '<div class="row2"><label class="fld"><span>Vade</span><select id="rcDepTerm"><option value="32">32 gün</option><option value="91">3 ay</option><option value="182">6 ay</option><option value="365">1 yıl</option></select></label>' +
      '<label class="fld"><span>Yıllık faiz (%)</span><input id="rcDepRate" type="number" step="0.1" min="0" value="' + dv.toFixed(2) + '"></label></div>' +
      '<div class="rc-out" id="rcDepOut"></div><p class="note" id="rcDepNote"></p></div>' +
      '<div class="card rc"><h3>Enflasyona göre reel getiri</h3><div class="row2"><label class="fld"><span>Yıllık getiri (%)</span><input id="rcRealNom" type="number" step="0.5" value="' + (((depFor(365) || {}).v || dv) * (1 - (typeof stopajTL === "function" ? stopajTL(365, NOW) : 0.15))).toFixed(1) + '"></label>' +
      '<label class="fld"><span>Yıllık enflasyon (%)</span><input id="rcRealInf" type="number" step="0.5" value="' + (inf ? inf.v.toFixed(1) : "30") + '"></label></div>' +
      '<div class="rc-out" id="rcRealOut"></div><p class="note">' + (inf ? "Enflasyon kutusu son yıllık TÜFE'dir (" + ayYil(inf.d) + ", TÜİK, TCMB EVDS üzerinden). " : "") + "Getiri kutusu, 1 yıllık mevduatın stopaj sonrası yaklaşık getirisiyle dolduruldu. Bu bir hesaplamadır, yatırım tavsiyesi değildir.</p></div>" +
      "</div>";
    var depNote = function () {
      var dd = depFor(+document.getElementById("rcDepTerm").value);
      document.getElementById("rcDepNote").textContent = dd ? "Faiz kutusu TCMB'nin yayımladığı ortalama TL mevduat faizi (" + BUCKET[+document.getElementById("rcDepTerm").value] + " vadeli, " + dd.d.split("-").join(".") + "). Bankanızın oranı farklı olabilir." : "Faiz kutusu TCMB'nin yayımladığı son ortalama TL mevduat faiziyle dolduruldu. Bankanızın oranı farklı olabilir.";
    };
    sec.addEventListener("input", function (e) {
      var id = e.target.id;
      if (id === "rcDepTerm") { var dd = depFor(+e.target.value); if (dd) document.getElementById("rcDepRate").value = dd.v.toFixed(2); depNote(); }
      if (/^rcFx/.test(id)) calcFx(); else if (/^rcDep/.test(id)) calcDep(); else if (/^rcReal/.test(id)) calcReal();
    });
    sec.querySelector("[data-calc-link]").addEventListener("click", function () {
      setTimeout(function () { var h = document.getElementById("hesap"); if (h) h.scrollIntoView({ behavior: "smooth", block: "start" }); }, 120);
    });
    depNote(); calcFx(); calcDep(); calcReal();
  }

  // --- Forecasts: anchor the 12-month base case to TCMB Piyasa Katılımcıları Anketi expectations ---
  // The optimistic/pessimistic range still comes from the last two years' volatility (a1.js A.scenarios).
  function when(d) { return /^\d{4}-\d{1,2}$/.test(d) ? ayYil(d) : String(d).split("-").join("."); }
  function applyForecast(f) {
    if (typeof FORECAST_ASSUMPTIONS === "undefined" || !f) return;
    var fa = FORECAST_ASSUMPTIONS, now = (L && L.usd) || RAW.usd[N - 1], src = "Kaynak: TCMB Piyasa Katılımcıları Anketi";
    var rng = "İyimser ve kötümser aralık, son iki yıldaki fiyat dalgalanmasından hesaplandı.";
    FCK.length = 0;
    if (f.usd12 && f.usd12.v > 5 && now) {
      var u = f.usd12.v / now - 1;
      if (u > -0.5 && u < 2) {
        var us = src + " (" + when(f.usd12.d) + "), 12 ay sonrası dolar/TL beklentisi " + nf(2).format(f.usd12.v) + " ₺; bugün " + nf(2).format(now) + " ₺.";
        fa.dolar.base = u; fa.dolar.notes = [us, "Beklenen değişim bu iki kur arasındaki farktır.", rng];
        fa.euro.base = u; fa.euro.notes = [us, "Euro/dolar paritesinin değişmeyeceği varsayıldı; euro/TL de dolar/TL kadar değişir.", rng];
        fa.altin.base = u; fa.altin.notes = [us, "Ons altının dolar fiyatının değişmeyeceği varsayıldı; gram altın TL'de dolar/TL kadar değişir.", rng];
        ["dolar", "euro", "altin"].forEach(function (k) { fa[k].how = "Beklenen değişim, TCMB anketindeki 12 ay sonrası dolar/TL beklentisinden gelir."; });
        FCK.push("dolar", "euro", "altin");
      }
    }
    if (f.cpi12 && f.cpi12.v > 0 && f.cpi12.v < 200) {
      var c = f.cpi12.v / 100, cs = src + " (" + when(f.cpi12.d) + "), 12 ay sonrası yıllık enflasyon beklentisi %" + nf(1).format(f.cpi12.v) + ".";
      fa.konut.base = c; fa.konut.notes = [cs, "Konut fiyatlarının beklenen enflasyon kadar artacağı varsayıldı.", rng];
      fa.otomobil.base = c; fa.otomobil.notes = [cs, "Araç fiyatlarının beklenen enflasyon kadar artacağı varsayıldı.", rng];
      fa.konut.how = fa.otomobil.how = "Beklenen değişim, TCMB anketindeki 12 ay sonrası yıllık enflasyon beklentisinden gelir.";
      FCK.push("konut", "otomobil");
    }
    if (!FCK.length) return;
    renderHomeForecasts();
    if ((location.hash || "#ana").slice(1) === "tahmin") renderForecast();
    fixBadges(); fixTexts();
  }

  var pL = get("/api/live").then(function (d) { L = d; }).catch(function () {});
  var pH = get("/api/history").then(function (h) { H = h; applyHistory(h); applyCalcDefaults(); }).catch(function () {});
  Promise.all([pL, pH]).then(function () { if (L && (L.usd || L.btc)) renderCalcs(); });
  // After live + history, so "today" for the dollar expectation is the live rate
  Promise.all([pL, pH]).then(function () { return get("/api/forecast"); }).then(applyForecast).catch(function () {});
})();
