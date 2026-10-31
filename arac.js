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
    ".ad-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px}" +
    ".ad-k{padding:16px 18px}.ad-k .k{font-size:12.5px;font-weight:600;color:var(--ink-2)}.ad-k .v{font-size:24px;font-weight:800;letter-spacing:-.02em;margin-top:6px;font-variant-numeric:tabular-nums}.ad-k .s{font-size:12.5px;color:var(--ink-3);margin-top:2px}.ad-k .s.up{color:var(--up)}" +
    ".ad-grid{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:16px;margin-bottom:16px;align-items:start}.ad-side{display:grid;gap:16px}" +
    ".ad-card{padding:18px 20px;margin-bottom:16px}.ad-grid .ad-card,.ad-side .ad-card{margin-bottom:0}" +
    ".ad-h{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:8px}.ad-h h3{margin:0;font-size:17px}.ad-h p{margin:2px 0 0;font-size:13px;color:var(--ink-3)}" +
    ".ad-sel{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--ink-2)}.ad-sel select{font:inherit;padding:6px 10px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink)}" +
    ".sd{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;flex:none}" +
    ".ad-lg{display:flex;gap:16px;font-size:12.5px;color:var(--ink-3);margin:2px 0 8px}.ad-lg i{display:inline-block;width:14px;height:8px;border-radius:3px;margin-right:6px;vertical-align:0}.ad-lg .bl{background:var(--surface-2);border:1px solid var(--line)}.ad-lg .bd{background:var(--ink-3)}" +
    ".ad-row{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:'nm val' 'tr val' 'bar bar';column-gap:12px;padding:10px 0;border-top:1px solid var(--line)}" +
    ".ad-row .nm{grid-area:nm;display:flex;align-items:center;gap:6px;min-width:0}.ad-row .nm a{font-size:12px;font-weight:600;text-decoration:none;margin-left:4px;white-space:nowrap}.ad-bars .chip{padding:7px 12px;font-size:13.5px}" +
    ".ad-row .tr{grid-area:tr;font-size:12px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".ad-row .val{grid-area:val;text-align:right;align-self:center;font-variant-numeric:tabular-nums}.ad-row .val b{display:block;font-size:15px}.ad-row .val s{font-size:12px;color:var(--ink-3)}" +
    ".bar{grid-area:bar;position:relative;height:10px;border-radius:6px;background:transparent;margin-top:6px}.bar span{position:absolute;left:0;top:0;bottom:0;border-radius:6px}.bar .l{background:var(--surface-2);border:1px solid var(--line)}.bar .d{opacity:.9}" +
    ".ad-seg{padding:12px 0;border-top:1px solid var(--line);display:grid;gap:6px}.ad-seg .t{display:flex;align-items:center;gap:4px;font-size:14px}.ad-seg .t span{font-size:12px;color:var(--ink-3);margin-left:6px}" +
    ".ad-seg .ln{display:grid;grid-template-columns:72px minmax(0,1fr) 64px;align-items:center;gap:8px;font-size:12.5px;color:var(--ink-2)}.ad-seg .ln b{text-align:right;font-variant-numeric:tabular-nums}.ad-seg .bar{margin:0;grid-area:auto}.ad-seg .ins{margin:0;font-size:12.5px;color:var(--ink-3)}" +
    ".seg-b{font:inherit;font-size:13px;font-weight:600;border:0;background:transparent;color:var(--ink-2);padding:6px 12px;border-radius:999px;cursor:pointer}.seg-b[aria-pressed=true]{background:var(--surface);color:var(--ink);box-shadow:var(--shadow)}" +
    ".ad-tw{overflow-x:auto;margin:0 -4px}.ad-t{width:100%;border-collapse:collapse;font-size:13.5px;min-width:640px}.ad-t th{text-align:left;font-size:12px;color:var(--ink-3);font-weight:600;padding:8px 6px;border-bottom:1px solid var(--line)}" +
    ".ad-t th button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}.ad-t td{padding:10px 6px;border-bottom:1px solid var(--line);vertical-align:top;font-variant-numeric:tabular-nums}.ad-t td small{display:block;font-size:11.5px;color:var(--ink-3)}.ad-t .r{text-align:right}.ad-t a{text-decoration:none;font-weight:600;white-space:nowrap}" +
    ".ad-wait h3{margin:0 0 6px;font-size:16px}.ad-wait p{margin:0;font-size:13.5px;color:var(--ink-2)}" +
    "@media (max-width:1000px){.ad-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.ad-grid{grid-template-columns:1fr}}" +
    "@media (max-width:760px){.ad-k .v{font-size:19px}.ad-card{padding:16px}}" +
    "@media (max-width:760px){.ar-grid{grid-template-columns:1fr}.ar-kpi .v{font-size:18px}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // Simple multi-series line chart; null values leave a gap
  function chart(months, series, fmtY) {
    var sm = body.clientWidth < 600, W = sm ? 380 : body.clientWidth > 900 ? 1080 : 720, H = sm ? 230 : 270, L = 58, R = 24, T = 12, B = 30;
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

  var SEGC = { A: "var(--s-euro)", B: "var(--s-altin)", C: "var(--s-dolar)", SUV: "var(--s-borsa)", D: "var(--s-bitcoin)", E: "var(--s-konut)" };
  var sort = "asc", trend = "tr", tsort = { k: "price", dir: 1 };
  function rows() {
    var S = D.sifir, ms = S.months, cur = ms[ms.length - 1], prev = ms[ms.length - 2], out = [];
    S.segments.forEach(function (s) {
      s.models.forEach(function (m) {
        var p = m.list[cur], q = prev ? m.list[prev] : null, dl = m.deal && m.deal[cur] || null;
        out.push({ seg: s.id, segName: s.name, segDesc: s.desc, name: m.name, trim: m.trim, price: p, deal: dl, eff: dl || p, disc: dl ? 1 - dl / p : 0, chg: q ? p / q - 1 : null, note: m.note, src: m.src });
      });
    });
    return out;
  }
  function seg_(r) { return seg === "all" || r.seg === seg; }
  function avg(a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; }
  function badge(id) { return '<i class="sd" style="background:' + (SEGC[id] || "var(--ink-3)") + '"></i>'; }

  function kpis(R) {
    var U = D.ikinciEl, n = U.months.length - 1, cheap = R.slice().sort(function (a, b) { return a.eff - b.eff; })[0];
    var big = R.slice().sort(function (a, b) { return b.disc - a.disc; })[0], yoy = U.yoy && U.yoy[U.months[n]];
    var tile = function (k, v, s, c) { return '<div class="card ad-k"><div class="k">' + k + '</div><div class="v">' + v + '</div><div class="s ' + (c || "") + '">' + s + "</div></div>"; };
    return '<div class="ad-kpis">' +
      tile("En uygun sıfır araç", mil(cheap.eff), esc(cheap.name) + (cheap.deal ? " · kampanyalı" : "")) +
      tile("Ortalama başlangıç fiyatı", mil(avg(R.map(function (r) { return r.price; }))), R.length + " model, liste fiyatı") +
      (big.disc > 0 ? tile("En büyük kampanya", "%" + Math.round(big.disc * 100) + " indirim", esc(big.name) + " · " + mil(big.price - big.deal) + " daha ucuz", "up") : "") +
      tile("sahibinden ikinci el ortalaması", mil(U.overall[n]), ay(U.months[n]) + (yoy ? " · yıllık " + pc(yoy) : "")) + "</div>";
  }

  function bars(R) {
    var S = D.sifir, cur = S.months[S.months.length - 1];
    var list = R.filter(seg_).sort(function (a, b) { return sort === "desc" ? b.price - a.price : sort === "disc" ? b.disc - a.disc : a.eff - b.eff; });
    var max = Math.max.apply(null, list.map(function (r) { return r.price; }));
    var tabs = [["all", "Tümü"]].concat(S.segments.map(function (s) { return [s.id, s.id === "SUV" ? "SUV" : s.id + " sınıfı"]; }));
    return '<div class="card ad-card ad-bars"><div class="ad-h"><div><h3>Sıfır araç fiyatları</h3><p>' + ay(cur) + ", en uygun donanımın başlangıç fiyatı</p></div>" +
      '<label class="ad-sel"><span>Sırala</span><select id="adSort"><option value="asc"' + (sort === "asc" ? " selected" : "") + '>En ucuzdan</option><option value="desc"' + (sort === "desc" ? " selected" : "") + '>En pahalıdan</option><option value="disc"' + (sort === "disc" ? " selected" : "") + ">En büyük kampanya</option></select></label></div>" +
      '<div class="ar-tabs" role="group" aria-label="Segment">' + tabs.map(function (t) { return '<button type="button" class="chip" data-arseg="' + t[0] + '" aria-pressed="' + (seg === t[0]) + '">' + (t[0] !== "all" ? badge(t[0]) : "") + esc(t[1]) + "</button>"; }).join("") + "</div>" +
      '<div class="ad-lg"><span><i class="bl"></i>Liste fiyatı</span><span><i class="bd"></i>Kampanyalı fiyat</span></div>' +
      list.map(function (r) {
        return '<div class="ad-row"><div class="nm">' + badge(r.seg) + "<b>" + esc(r.name) + "</b>" + (r.src ? '<a href="' + esc(r.src[1]) + '" target="_blank" rel="noopener" title="' + esc(r.src[0]) + ' resmi fiyat listesi">kaynak ↗</a>' : "") + "</div>" +
          '<div class="tr">' + esc(r.trim) + "</div>" +
          '<div class="bar"><span class="l" style="width:' + (r.price / max * 100).toFixed(1) + '%"></span>' + (r.deal ? '<span class="d" style="width:' + (r.deal / max * 100).toFixed(1) + '%;background:' + SEGC[r.seg] + '"></span>' : '<span class="d" style="width:' + (r.price / max * 100).toFixed(1) + '%;background:' + SEGC[r.seg] + '"></span>') + "</div>" +
          '<div class="val"><b>' + tl(r.eff) + "</b>" + (r.deal ? '<s>' + tl(r.price) + "</s>" : "") + "</div></div>";
      }).join("") + "</div>";
  }

  function segSummary(R) {
    var U = D.ikinciEl, out = [];
    D.sifir.segments.forEach(function (s) {
      var rs = R.filter(function (r) { return r.seg === s.id; }); if (!rs.length) return;
      var a = U.segments[s.id], used = null;
      if (a) for (var i = a.length - 1; i >= 0; i--) if (a[i] != null) { used = a[i]; break; }
      var nw = avg(rs.map(function (r) { return r.eff; })), mx = Math.max(nw, used || 0);
      out.push('<div class="ad-seg"><div class="t">' + badge(s.id) + "<b>" + esc(s.name) + "</b><span>" + esc(s.desc) + "</span></div>" +
        '<div class="ln"><span>Sıfır (ort.)</span><div class="bar"><span class="d" style="width:' + (nw / mx * 100).toFixed(1) + "%;background:" + SEGC[s.id] + '"></span></div><b>' + short(nw) + "</b></div>" +
        (used ? '<div class="ln"><span>İkinci el</span><div class="bar"><span class="l" style="width:' + (used / mx * 100).toFixed(1) + '%"></span></div><b>' + short(used) + "</b></div>" +
          '<p class="ins">Sıfır, ikinci el ortalamasının ' + new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(nw / used) + " katı.</p>" : '<p class="ins">sahibinden raporunda bu sınıf için ayrı ortalama yok.</p>') + "</div>");
    });
    return '<div class="card ad-card"><div class="ad-h"><div><h3>Sıfır ve ikinci el</h3><p>Segment başına ortalama fiyat</p></div></div>' + out.join("") + "</div>";
  }

  function trendCard() {
    var U = D.ikinciEl, ms = U.months, n = ms.length - 1;
    var series = trend === "tr" ? [{ n: "Türkiye ortalaması", c: "var(--accent)", v: U.overall }] :
      Object.keys(U.segments).map(function (k) { return { n: k + " segmenti", c: SEGC[k], v: U.segments[k] }; });
    var real = U.realYoy && U.realYoy[ms[n]];
    return '<div class="card ad-card ar-chart"><div class="ad-h"><div><h3>sahibinden ikinci el fiyat trendi</h3><p>' + ay(ms[0]) + " – " + ay(ms[n]) + ", aylık ortalama ilan fiyatı" + (real != null ? " · enflasyondan arındırınca yıllık " + pc(real) : "") + "</p></div>" +
      '<div class="seg" role="group"><button type="button" class="seg-b" data-trend="tr" aria-pressed="' + (trend === "tr") + '">Türkiye</button><button type="button" class="seg-b" data-trend="seg" aria-pressed="' + (trend === "seg") + '">Segmentler</button></div></div>' +
      '<div class="lg">' + series.map(function (s) { return '<span><i style="background:' + s.c + '"></i>' + s.n + "</span>"; }).join("") + "</div>" + chart(ms, series, mil) +
      '<p class="ar-src">Kaynak: ' + esc(U.source) + ' (<a href="' + esc(U.sourceUrl) + '" target="_blank" rel="noopener">aylık raporlar</a>). ' + (trend === "seg" ? "Segment fiyatları yalnızca raporda açıklanan aylarda gösterilir. " : "") + ay(ms[n]) + " sonrası rapor yayımlandığında eklenecek.</p></div>";
  }

  function table(R) {
    var list = R.filter(seg_).sort(function (a, b) { var k = tsort.k, x = a[k], y = b[k]; if (x == null) x = -1e12; if (y == null) y = -1e12; return (typeof x === "string" ? x.localeCompare(y, "tr") : x - y) * tsort.dir; });
    var th = function (k, t, c) { return '<th class="' + (c || "") + '"><button type="button" data-tsort="' + k + '">' + t + (tsort.k === k ? (tsort.dir > 0 ? " ▲" : " ▼") : "") + "</button></th>"; };
    return '<div class="card ad-card"><div class="ad-h"><div><h3>Tüm modeller</h3><p>Sütun başlığına dokunarak sıralayın</p></div></div><div class="ad-tw"><table class="ad-t"><thead><tr>' +
      th("name", "Model") + th("seg", "Sınıf") + th("price", "Liste", "r") + th("deal", "Kampanyalı", "r") + th("disc", "İndirim", "r") + th("chg", "Aylık", "r") + "<th>Kaynak</th></tr></thead><tbody>" +
      list.map(function (r) {
        return "<tr><td><b>" + esc(r.name) + "</b><small>" + esc(r.trim) + (r.note ? " · " + esc(r.note) : "") + "</small></td><td>" + badge(r.seg) + esc(r.seg) + '</td><td class="r">' + tl(r.price) + '</td><td class="r">' + (r.deal ? tl(r.deal) : "–") + '</td><td class="r ' + (r.disc ? "up" : "") + '">' + (r.disc ? "%" + new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(r.disc * 100) : "–") + '</td><td class="r ' + (r.chg == null ? "" : cls(r.chg)) + '">' + (r.chg == null ? "yeni" : Math.abs(r.chg) < 0.0005 ? "0" : pc(r.chg)) + "</td><td>" + (r.src ? '<a href="' + esc(r.src[1]) + '" target="_blank" rel="noopener">' + esc(r.src[0]) + " ↗</a>" : "") + "</td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<p class="ar-src">Fiyatlar markaların resmi fiyat listelerinden alınır (aylık derleme: <a href="' + esc(D.sifir.sourceUrl) + '" target="_blank" rel="noopener">araclo.com</a>). Anahtar teslim liste fiyatıdır; bayiye göre değişebilir.</p></div>';
  }

  function antalya() {
    if (D.antalya) return "";
    return '<div class="card ad-card ad-wait"><h3>Antalya fiyat trendi</h3><p>Veri izni bekleniyor. sahibinden il bazında fiyat yayımlamıyor ve ilanların otomatik toplanmasına izin vermiyor; izin gelince burada gösterilecek.</p></div>';
  }

  var lastW = 0;
  addEventListener("resize", function () { if (D && Math.abs(body.clientWidth - lastW) > 80) render(); });
  function render() {
    if (!D) return;
    lastW = body.clientWidth;
    var R = rows();
    body.innerHTML = kpis(R) + '<div class="ad-grid">' + bars(R) + '<div class="ad-side">' + segSummary(R) + antalya() + "</div></div>" + trendCard() + table(R) + '<p class="note">Bu sayfadaki fiyatlar bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Son güncelleme: ' + esc(D.updated.split("-").reverse().join(".")) + ".</p>";
  }
  body.addEventListener("click", function (e) {
    var b = e.target.closest("[data-arseg]"); if (b) { seg = b.getAttribute("data-arseg"); return render(); }
    var t = e.target.closest("[data-trend]"); if (t) { trend = t.getAttribute("data-trend"); return render(); }
    var h = e.target.closest("[data-tsort]"); if (h) { var k = h.getAttribute("data-tsort"); tsort = { k: k, dir: tsort.k === k ? -tsort.dir : (k === "disc" || k === "chg" ? -1 : 1) }; return render(); }
  });
  body.addEventListener("change", function (e) { if (e.target.id === "adSort") { sort = e.target.value; render(); } });

  fetch("/data/arac.json").then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (d) { D = d; render(); })
    .catch(function () { body.innerHTML = '<p class="note">Araç verileri şu anda yüklenemedi. Lütfen sayfayı yenileyin.</p>'; });
})();
