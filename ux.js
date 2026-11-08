// Usability layer: live values on the home cards, real/sample data labels, term hints, quick actions and the "Hangi veriler gerçek?" panel.
(function () {
  "use strict";
  if (typeof ASSETS === "undefined") return;
  var L = null;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var LIVE = { altin: "gold", dolar: "usd", bitcoin: "btc" };
  var REAL_KEYS = ["altin", "dolar", "bitcoin", "dep32"];
  var TIP = {
    bist: "BIST 100: Borsa İstanbul'da işlem gören en büyük 100 şirketin hisselerinden oluşan endeks. Borsanın genel gidişatını gösterir.",
    brut: "Brüt faiz: Bankanın ilan ettiği, vergi kesilmeden önceki yıllık faiz oranı.",
    stopaj: "Stopaj: Mevduat faizinden devletin kestiği vergi. Hesaplamadaki net faiz, stopaj düşüldükten sonra elinize geçen tutardır.",
    reel: "Reel getiri: Enflasyon düşüldükten sonraki gerçek kazanç. Artı ise paranızla eskisinden daha fazla şey alabilirsiniz, eksi ise daha az.",
    scen: "Kötümser ve iyimser: İşler beklenenden kötü ya da iyi giderse olası değişim. Gerçek sonuç bu aralığın dışına da çıkabilir."
  };
  var q = function (k) { return '<span class="qmark" tabindex="0" role="button" data-tip="' + TIP[k].replace(/"/g, "&quot;") + '">?</span>'; };
  // Series that real.js replaced with real history (set once /api/history arrives)
  var isReal = function (k) { return !!(window.ATLAS_REAL && window.ATLAS_REAL.indexOf(k) >= 0); };
  var hasFc = function () { return !!(window.ATLAS_FC && window.ATLAS_FC.length); };
  var CAR = null; // home "Otomobil" card: average new-car list price from data/arac.json
  var tag = function (real) { return real ? '<span class="dtag live">canlı veri</span>' : '<span class="dtag">örnek veri</span>'; };

  var css =
    ".quick{display:flex;flex-wrap:wrap;gap:10px;margin-top:4px}" +
    ".qbtn{font:inherit;font-size:15px;font-weight:600;color:var(--accent);background:var(--surface);border:1px solid var(--line);padding:10px 16px;border-radius:999px;cursor:pointer;text-decoration:none;box-shadow:var(--shadow)}" +
    ".qbtn:hover{border-color:var(--accent)}" +
    ".info-btn,.proto{font:inherit;font-size:12px;font-weight:600;color:var(--ink-2);background:var(--surface-2);border:0;padding:5px 10px;border-radius:999px;cursor:pointer}" +
    ".info-btn:before,.proto:before{content:'i';display:inline-grid;place-items:center;width:14px;height:14px;margin-right:6px;border-radius:50%;background:var(--ink-3);color:var(--surface);font-size:10px;font-weight:800;vertical-align:-2px}" +
    ".info-pop{position:fixed;z-index:80;inset:auto 16px 16px auto;max-width:380px;width:calc(100vw - 32px);background:var(--surface);border:1px solid var(--line);border-radius:var(--r-md);box-shadow:0 18px 50px rgba(0,0,0,.18);padding:18px 20px;font-size:14px;line-height:1.5;color:var(--ink-2)}" +
    ".info-pop h3{margin:0 0 8px;font-size:16px;color:var(--ink)}.info-pop h4{margin:12px 0 4px;font-size:13px;color:var(--ink)}.info-pop ul{margin:0;padding-left:18px}" +
    ".info-pop .x{position:absolute;top:10px;right:10px;width:30px;height:30px;border-radius:50%;border:0;background:var(--surface-2);color:var(--ink-2);font-size:18px;cursor:pointer}" +
    ".info-pop p{margin:12px 0 0;font-size:12.5px;color:var(--ink-3)}" +
    ".dtag{justify-self:start;margin-top:6px;font-size:10.5px;font-weight:600;color:var(--ink-3);background:var(--surface-2);padding:2px 7px;border-radius:999px;white-space:nowrap}" +
    ".dtag:before{content:\"\";display:inline-block;width:6px;height:6px;border-radius:50%;background:currentColor;margin-right:5px;vertical-align:1px}" +
    ".dtag.live{color:var(--up);background:var(--up-soft)}" +
    ".mcard .src{font-size:12px;color:var(--ink-3);margin-top:6px}" +
    ".range-l{flex-wrap:wrap}.range-l span,.fcard a{white-space:nowrap}.fcard a{font-size:13.5px}" +
    ".rc h3 .qmark,.mcard .qmark{vertical-align:1px}" +
    ".live-i .v,.rc-out b{font-variant-numeric:tabular-nums;font-weight:600}" +
    "@media (max-width:760px){" +
    "#markets,#homeFc{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:10px;margin-left:-16px;margin-right:-16px;padding:4px 16px 12px;scroll-padding:0 16px;scrollbar-width:none}" +
    "#markets::-webkit-scrollbar,#homeFc::-webkit-scrollbar{display:none}" +
    "#markets>.mcard{flex:0 0 44%;scroll-snap-align:start}#homeFc>.fcard{flex:0 0 78%;scroll-snap-align:start}" +
    ".markets .mcard:last-child{grid-column:auto}" +
    ".swipe{font-size:12px;color:var(--ink-3);margin-top:2px}" +
    ".qbtn{font-size:14px;padding:9px 14px}}" +
    "@media (min-width:761px){.swipe{display:none}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function wrap(name, after) {
    var f = window[name]; if (typeof f !== "function") return;
    window[name] = function () { var r = f.apply(this, arguments); try { after(); } catch (e) {} return r; };
  }
  function swipeHint(el) {
    if (!el || (el.nextElementSibling && el.nextElementSibling.className === "swipe")) return;
    var p = document.createElement("p"); p.className = "swipe"; p.textContent = "Diğer kartlar için yana kaydırın →";
    el.parentNode.insertBefore(p, el.nextSibling);
  }

  // Home cards: show today's live price instead of the last weekly close, and mark which cards are real
  function fixMarkets() {
    var a = N - 1, y = a - 52;
    document.querySelectorAll("#markets .mcard").forEach(function (c) {
      var k = c.getAttribute("data-asset"), nm = $(".nm", c);
      if (!$(".dtag", c)) c.insertAdjacentHTML("beforeend", (REAL_KEYS.indexOf(k) >= 0 ? tag(true) : isReal(k) ? '<span class="dtag live">gerçek veri</span>' : tag(false)));
      if (k === "borsa" && nm && !$(".qmark", nm)) nm.insertAdjacentHTML("beforeend", q("bist"));
      if (k === "otomobil") {
        c.setAttribute("href", "#arac");
        if (CAR) {
          $(".ds", c).textContent = "Ortalama sıfır araç liste fiyatı";
          $(".val", c).textContent = ASSETS.otomobil.display(CAR.avg);
          var cr = $(".row", c); if (cr) cr.innerHTML = (CAR.chg != null ? chg(CAR.chg) : "") + '<span class="per">son 1 ay</span>';
          var csv = $("svg", c); if (csv) csv.outerHTML = '<span class="src">' + CAR.n + " model · " + CAR.month + " listesi</span>";
          var ct = $(".dtag", c); if (ct) ct.outerHTML = '<span class="dtag live">gerçek veri</span>';
        }
      }
      if (!L) return;
      var f = LIVE[k];
      if (f && L[f]) {
        var s = ASSETS[k].tl, v = L[f];
        $(".val", c).textContent = ASSETS[k].display(v);
        var row = $(".row", c); if (row && s[y]) row.innerHTML = chg(v / s[y] - 1) + '<span class="per">son 12 ay</span>';
      }
      if (k === "dep32" && L.evds && L.evds.deposit3m) {
        var d = L.evds.deposit3m;
        $(".ds", c).textContent = "Ortalama yıllık TL faizi";
        $(".val", c).textContent = "%" + fmt(1).format(d.v);
        var r = $(".row", c); if (r) r.innerHTML = '<span class="per">3 ay vadeli · TCMB</span>';
        var sv = $("svg", c); if (sv) sv.outerHTML = '<span class="src">' + d.d.split("-").slice(0, 2).join(".") + " verisi</span>";
      }
    });
    var as = $("#asOf");
    if (as && L && L.updated) as.textContent = "Son güncelleme: " + new Date(L.updated).toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
    var fd = $("#footDate");
    if (fd && L && L.updated) fd.textContent = "Veri tarihi: " + new Date(L.updated).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
    swipeHint($("#markets"));
  }
  function fixForecasts() {
    document.querySelectorAll("#homeFc .range-l span:first-child").forEach(function (s) { if (!$(".qmark", s)) s.insertAdjacentHTML("beforeend", q("scen")); });
    swipeHint($("#homeFc"));
  }
  // Home calculators are built by real.js after its data arrives; add hints once they exist
  function fixCalcs() {
    var sec = $("#rcSec"); if (!sec || sec.getAttribute("data-ux")) return;
    sec.setAttribute("data-ux", "1");
    var h = sec.querySelectorAll(".rc h3");
    if (h[1]) h[1].insertAdjacentHTML("beforeend", q("stopaj"));
    if (h[2]) h[2].insertAdjacentHTML("beforeend", q("reel"));
    var lb = $("#rcDepRate"); lb = lb && lb.closest("label") && lb.closest("label").querySelector("span");
    if (lb) { lb.textContent = "Yıllık brüt faiz (%)"; lb.insertAdjacentHTML("beforeend", q("brut")); }
  }
  wrap("renderMarkets", fixMarkets);
  wrap("renderHomeForecasts", fixForecasts);
  fixMarkets(); fixForecasts();
  if (window.MutationObserver) new MutationObserver(fixCalcs).observe($("#v-ana") || document.body, { childList: true, subtree: true });

  var AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  fetch("/data/arac.json").then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (d) {
    var S = d && d.sifir, ms = S && S.months; if (!ms || !ms.length) return;
    var m = ms[ms.length - 1], p = ms.length > 1 ? ms[ms.length - 2] : null, sum = 0, n = 0, a = 0, b = 0;
    S.segments.forEach(function (sg) { sg.models.forEach(function (x) {
      var v = x.list && x.list[m]; if (!v) return;
      sum += v; n++;
      if (p && x.list[p]) { a += v; b += x.list[p]; }
    }); });
    if (!n) return;
    var mm = m.split("-");
    CAR = { avg: sum / n, n: n, chg: b ? a / b - 1 : null, month: AYLAR[+mm[1] - 1] + " " + mm[0] };
    fixMarkets();
  }).catch(function () {});

  fetch("/api/live").then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (d) { L = d; fixMarkets(); }).catch(function () {});

  // "Hangi veriler gerçek?" panel
  var pop = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  function openPop(btn) {
    closePop();
    pop = document.createElement("div"); pop.className = "info-pop"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", "Hangi veriler gerçek?");
    pop.innerHTML = '<button type="button" class="x" aria-label="Kapat">×</button><h3>Hangi veriler gerçek?</h3>' +
      "<h4>Gerçek veriler</h4><ul><li>Canlı piyasa kutusu: dolar, euro, gram altın, Bitcoin, TCMB faizi, mevduat faizi ve enflasyon</li>" +
      "<li>Dolar, euro, altın ve Bitcoin grafikleri (2019'dan bugüne haftalık)</li>" +
      (isReal("konut") ? "<li>Konut: TCMB Konut Fiyat Endeksi (aylık, yaklaşık iki ay gecikmeli yayımlanır)</li>" : "") +
      (isReal("mevduat") ? "<li>Mevduat faizinin geçmişi (TCMB haftalık ortalama TL mevduat faizleri)</li>" : "") +
      (hasFc() ? "<li>Dolar, euro, altın, konut ve otomobil tahminlerinin merkezi: TCMB Piyasa Katılımcıları Anketi'ndeki 12 ay sonrası kur ve enflasyon beklentileri</li>" : "") +
      "<li>Enflasyon (TÜFE) geçmişi ve hesaplayıcılardaki oranlar</li><li>Gündem bölümündeki haber başlıkları</li><li>Araç Fiyatları sayfasındaki sıfır araç ve sahibinden ikinci el fiyatları</li></ul>" +
      "<h4>Örnek (simüle) veriler</h4><ul><li>Borsa" + (isReal("konut") ? "" : ", konut fiyatları") + (CAR ? " ve otomobil fiyat geçmişi" : " ve ana sayfadaki otomobil kartı") + "</li>" + (isReal("mevduat") ? "" : "<li>Mevduat faizinin geçmişi</li>") + (hasFc() ? "<li>Borsa ve Bitcoin tahminleri ile tüm tahminlerdeki iyimser/kötümser aralık</li></ul>" : "<li>Gelecek tahminlerinin tamamı</li></ul>") +
      "<p>Kartlardaki <b>canlı</b> ve <b>örnek veri</b> etiketleri bu ayrımı gösterir. ATLAS bir prototiptir; hiçbir bilgi yatırım tavsiyesi değildir.</p>";
    document.body.appendChild(pop);
    var r = btn.getBoundingClientRect();
    if (innerWidth > 760) { pop.style.top = Math.min(r.bottom + 8, innerHeight - pop.offsetHeight - 16) + "px"; pop.style.bottom = "auto"; pop.style.left = Math.max(16, Math.min(r.left, innerWidth - pop.offsetWidth - 16)) + "px"; pop.style.right = "auto"; }
    else { pop.style.bottom = "calc(80px + env(safe-area-inset-bottom,0px))"; }
    $(".x", pop).focus();
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-info]");
    if (b) { e.preventDefault(); return pop ? closePop() : openPop(b); }
    if (pop && (e.target.closest(".x") || !e.target.closest(".info-pop"))) closePop();
    var g = e.target.closest("[data-go]");
    if (g) {
      var el = document.getElementById(g.getAttribute("data-go"));
      var tgt = el ? el.closest(".rc") : $("#rcSec");
      if (tgt) { tgt.scrollIntoView({ behavior: "smooth", block: "center" }); if (el) setTimeout(function () { el.focus({ preventScroll: true }); }, 450); }
    }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePop(); });
  addEventListener("hashchange", closePop);
})();
