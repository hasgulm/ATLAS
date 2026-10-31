// "Araç fiyatları" page: new-car list prices by segment and sahibinden used-car averages, read from data/arac.json.
(function () {
  "use strict";
  var body = document.getElementById("aracBody"); if (!body) return;
  var D = null, seg = "all";
  var AY = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var AYK = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  var ay = function (m) { var p = m.split("-"); return AY[+p[1] - 1] + " " + p[0]; };
  var ayk = function (m) { var p = m.split("-"); return AYK[+p[1] - 1] + " " + p[0].slice(2); };
  var tl = function (v) { return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(v) + " ₺"; };
  var mil = function (v) { return v >= 1e6 ? new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v / 1e6) + " milyon ₺" : tl(v); };
  var pc = function (v) { return (v > 0 ? "+" : v < 0 ? "−" : "") + "%" + new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(Math.abs(v * 100)); };
  var cls = function (v) { return v > 0.0005 ? "up" : v < -0.0005 ? "dn" : "fl"; };
  var short = function (v) { return v >= 1e6 ? new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v / 1e6) + " mn" : Math.round(v / 1000) + " bin"; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  var css =
    ".ar-sec{margin-top:8px;margin-bottom:44px}.ar-sec h2{margin:4px 0 6px}" +
    ".ar-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 16px}" +
    ".ar-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}" +
    ".ar-car{padding:18px;display:grid;gap:6px;align-content:start}" +
    ".ar-car .sg{font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3)}" +
    ".ar-car h3{margin:0;font-size:17px}.ar-car .tr{font-size:12.5px;color:var(--ink-3)}" +
    ".ar-car .pr{font-size:24px;font-weight:800;letter-spacing:-.02em;margin-top:6px;font-variant-numeric:tabular-nums}" +
    ".ar-car .dl{font-size:13px;color:var(--ink-2)}.ar-car .dl b{color:var(--up)}" +
    ".ar-car .sr{font-size:12.5px;font-weight:600;text-decoration:none;margin-top:4px}.ar-car .ch{font-size:13px;font-weight:600}.ar-car .nt{font-size:12px;color:var(--ink-3)}" +
    ".up{color:var(--up)}.dn{color:var(--down)}.fl{color:var(--ink-3)}" +
    ".ar-kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:14px 0}" +
    ".ar-kpi .card{padding:16px}.ar-kpi .k{font-size:12.5px;font-weight:600;color:var(--ink-2)}.ar-kpi .v{font-size:22px;font-weight:800;margin-top:4px;font-variant-numeric:tabular-nums}.ar-kpi .s{font-size:12.5px;margin-top:2px}" +
    ".ar-chart{padding:18px 18px 10px}.ar-chart svg{width:100%;height:auto;display:block}" +
    ".ar-chart .lg{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13px;color:var(--ink-2);margin-bottom:8px}.ar-chart .lg i{display:inline-block;width:10px;height:3px;border-radius:2px;margin-right:6px;vertical-align:3px}" +
    ".ar-src{font-size:12.5px;color:var(--ink-3);margin-top:10px;line-height:1.5}" +
    ".ar-wait{padding:20px;display:grid;gap:8px}.ar-wait h3{margin:0;font-size:17px}.ar-wait p{margin:0;color:var(--ink-2);font-size:14.5px}" +
    "@media (max-width:760px){.ar-grid{grid-template-columns:1fr}.ar-kpi .v{font-size:18px}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // Simple multi-series line chart; null values leave a gap
  function chart(months, series, fmtY) {
    var sm = body.clientWidth < 600, W = sm ? 380 : 720, H = sm ? 230 : 260, L = 58, R = 24, T = 12, B = 30;
    var all = []; series.forEach(function (s) { s.v.forEach(function (v) { if (v != null) all.push(v); }); });
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), pad = (hi - lo) * 0.1 || hi * 0.05;
    lo -= pad; hi += pad;
    var x = function (i) { return L + (W - L - R) * (months.length === 1 ? 0.5 : i / (months.length - 1)); };
    var y = function (v) { return T + (H - T - B) * (1 - (v - lo) / (hi - lo)); };
    var g = "";
    for (var k = 0; k <= 3; k++) { var v = lo + (hi - lo) * k / 3, yy = y(v).toFixed(1); g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '" stroke="var(--line)"/><text x="' + (L - 8) + '" y="' + yy + '" dy="4" text-anchor="end" font-size="12" fill="var(--ink-3)">' + short(v) + "</text>"; }
    months.forEach(function (m, i) { if ((!sm && months.length <= 12) || i % 2 === 0 || i === months.length - 1 && !sm) g += '<text x="' + x(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="12" fill="var(--ink-3)">' + ayk(m) + "</text>"; });
    series.forEach(function (s) {
      var d = "", pts = "";
      s.v.forEach(function (v, i) { if (v == null) return; d += (d ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1); pts += '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="3.5" fill="' + s.c + '"><title>' + esc(s.n) + " · " + ay(months[i]) + ": " + tl(v) + "</title></circle>"; });
      g += '<path d="' + d + '" fill="none" stroke="' + s.c + '" stroke-width="2.5" stroke-linejoin="round"/>' + pts;
    });
    return '<svg viewBox="0 0 ' + W + " " + H + '" role="img">' + g + "</svg>";
  }

  function newCars() {
    var S = D.sifir, ms = S.months, cur = ms[ms.length - 1], prev = ms[ms.length - 2];
    var tabs = [["all", "Tümü"]].concat(S.segments.map(function (s) { return [s.id, s.name]; }));
    var cards = [];
    S.segments.forEach(function (s) {
      if (seg !== "all" && seg !== s.id) return;
      s.models.forEach(function (m) {
        var p = m.list[cur], q = prev ? m.list[prev] : null, dl = m.deal && m.deal[cur];
        var ch = q ? '<span class="ch ' + cls(p / q - 1) + '">' + (Math.abs(p / q - 1) < 0.0005 ? "Geçen aya göre değişmedi" : pc(p / q - 1) + " geçen aya göre") + "</span>" : "";
        cards.push('<div class="card ar-car"><span class="sg">' + esc(s.name) + " · " + esc(s.desc) + "</span><h3>" + esc(m.name) + '</h3><span class="tr">En uygun donanım: ' + esc(m.trim) + '</span><span class="pr">' + mil(p) + "</span>" +
          (dl ? '<span class="dl">Kampanyalı: <b>' + mil(dl) + "</b></span>" : "") + ch + (m.note ? '<span class="nt">' + esc(m.note) + "</span>" : "") + (m.src ? '<a class="sr" href="' + esc(m.src[1]) + '" target="_blank" rel="noopener">Kaynak: ' + esc(m.src[0]) + " resmi fiyat listesi ↗</a>" : "") + "</div>");
      });
    });
    return '<div class="ar-sec"><span class="eyebrow">Sıfır araç · Türkiye</span><h2 class="h-sec">' + ay(cur) + " liste fiyatları</h2>" +
      '<p class="sub">Her segmentten bilinen modellerin en uygun donanımdaki başlangıç fiyatı.</p>' +
      '<div class="ar-tabs" role="group" aria-label="Segment">' + tabs.map(function (t) { return '<button type="button" class="chip" data-arseg="' + t[0] + '" aria-pressed="' + (seg === t[0]) + '">' + esc(t[1]) + "</button>"; }).join("") + "</div>" +
      '<div class="ar-grid">' + cards.join("") + "</div>" +
      '<p class="ar-src">Kaynak: Her kartta bağlantısı verilen markanın resmi fiyat listesi; aylık derleme için <a href="' + esc(S.sourceUrl) + '" target="_blank" rel="noopener">araclo.com</a>. Fiyatlar anahtar teslim liste fiyatıdır; bayiye göre değişebilir. Güncel fiyat için yetkili satıcıya danışın.</p></div>';
  }

  function usedCars() {
    var U = D.ikinciEl, ms = U.months, n = ms.length - 1, last = U.overall[n], first = U.overall[0];
    var segC = { B: "var(--s-altin)", C: "var(--s-dolar)", D: "var(--s-bitcoin)", E: "var(--s-konut)" };
    var segL = function (k) { var a = U.segments[k], i = a.length - 1; while (i >= 0 && a[i] == null) i--; return { v: a[i], m: ms[i], f: a[0] }; };
    var kpis = '<div class="card"><div class="k">Türkiye ortalaması</div><div class="v">' + mil(last) + '</div><div class="s ' + cls(last / first - 1) + '">' + pc(last / first - 1) + " · " + ayk(ms[0]) + "'den beri</div></div>" +
      Object.keys(U.segments).map(function (k) { var s = segL(k); return '<div class="card"><div class="k">' + k + ' segmenti</div><div class="v">' + mil(s.v) + '</div><div class="s ' + cls(s.v / s.f - 1) + '">' + pc(s.v / s.f - 1) + " · " + ayk(ms[0]) + "'den beri</div></div>"; }).join("");
    var segSeries = Object.keys(U.segments).map(function (k) { return { n: k + " segmenti", c: segC[k], v: U.segments[k] }; });
    var yoy = U.yoy && U.yoy[ms[n]];
    return '<div class="ar-sec"><span class="eyebrow">İkinci el · sahibinden</span><h2 class="h-sec">sahibinden\'de ortalama ikinci el fiyatı</h2>' +
      '<p class="sub">' + ay(ms[n]) + " itibarıyla ortalama ilan fiyatı " + mil(last) + (yoy ? "; bir yılda " + pc(yoy) + " değişti" : "") + "." + (U.realYoy && U.realYoy[ms[n]] != null ? " Enflasyondan arındırıldığında yıllık değişim " + pc(U.realYoy[ms[n]]) + "." : "") + "</p>" +
      '<div class="ar-kpi">' + kpis + "</div>" +
      '<div class="card ar-chart"><div class="lg"><span><i style="background:var(--accent)"></i>Türkiye ortalaması</span></div>' + chart(ms, [{ n: "Türkiye ortalaması", c: "var(--accent)", v: U.overall }], mil) + "</div>" +
      '<div class="card ar-chart" style="margin-top:14px"><div class="lg">' + segSeries.map(function (s) { return '<span><i style="background:' + s.c + '"></i>' + s.n + "</span>"; }).join("") + "</div>" + chart(ms, segSeries, mil) + "</div>" +
      '<p class="ar-src">Kaynak: ' + esc(U.source) + ' (<a href="' + esc(U.sourceUrl) + '" target="_blank" rel="noopener">aylık raporlar</a>). Segment fiyatları yalnızca raporda açıklanan aylar için gösterilir. ' + ay(ms[n]) + " sonrası rapor yayımlandığında eklenecek.</p></div>";
  }

  function antalya() {
    var A = D.antalya;
    if (A) return "";
    return '<div class="ar-sec"><span class="eyebrow">Antalya</span><h2 class="h-sec">Antalya\'da sahibinden fiyat trendi</h2>' +
      '<div class="card ar-wait"><h3>Veri izni bekleniyor</h3><p>sahibinden il bazında fiyat verisini herkese açık yayımlamıyor ve ilanların otomatik toplanmasına izin vermiyor. Antalya trendi, sahibinden\'den kurumsal veri izni alındığında bu bölüme eklenecek.</p></div></div>';
  }

  var lastW = 0;
  addEventListener("resize", function () { if (D && Math.abs(body.clientWidth - lastW) > 80) render(); });
  function render() {
    if (!D) return;
    lastW = body.clientWidth;
    body.innerHTML = newCars() + usedCars() + antalya() + '<p class="note">Bu sayfadaki fiyatlar bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.</p>';
  }
  body.addEventListener("click", function (e) { var b = e.target.closest("[data-arseg]"); if (b) { seg = b.getAttribute("data-arseg"); render(); } });

  fetch("/data/arac.json").then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (d) { D = d; render(); })
    .catch(function () { body.innerHTML = '<p class="note">Araç verileri şu anda yüklenemedi. Lütfen sayfayı yenileyin.</p>'; });
})();
