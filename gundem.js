/* ATLAS · Dünya Gündemi
   Düz dünya haritası + konu balonları + "Türkiye'deki yatırımın için ne anlama gelir?" kartı.
   Haberler EVENTS dizisinden gelir (a3.js'deki örnekler ya da texgen.js'in /api/news ile doldurduğu gerçek haberler).
   Harita çizimi data/world.json'dadır (Natural Earth 110m, geoNaturalEarth1, scale 185, translate [500,300]). */
(function () {
  "use strict";

  // Konular. "re" yalnızca konu etiketi olmayan (örnek) haberleri sınıflandırmak için kullanılır.
  // Haber servisinin (api/news.js) konu anahtarları birleştirilir: rate→fed, infl→tcmb.
  const TOPICS = [
    { k: "fed", n: "Fed", full: "ABD Merkez Bankası (Fed)", place: "Washington, ABD", lat: 38.9, lon: -77.04, cty: "us", c: "doviz", dx: -12, dy: 14,
      assets: ["doviz", "altin", "kripto", "borsa"],
      mean: "Fed faiz indirimine yaklaştıkça dolar dünya genelinde zayıflama eğilimine girer; bu genelde altını, Bitcoin'i ve gelişmekte olan ülke borsalarını destekler. Fed'in faizi yüksek tutacağı sinyali ise tam tersine dolara güç verir.",
      re: /\bfed\b|federal reserve|powell|fomc|abd merkez/ },
    { k: "tcmb", n: "TCMB", full: "TCMB ve enflasyon", place: "Ankara, Türkiye", lat: 39.93, lon: 32.86, cty: "tr", c: "mevduat", dx: 6, dy: 10,
      assets: ["mevduat", "doviz", "borsa", "konut"],
      mean: "TCMB faiz indirirse mevduat faizleri birkaç hafta içinde düşer, borsa genelde olumlu karşılar ve TL üzerinde baskı artabilir. Faiz artışı ya da beklenenden yüksek enflasyon ise mevduatı daha cazip hâle getirir.",
      re: /tcmb|merkez bankası|türkiye cumhuriyet merkez|karahan|enflasyon|tüfe|mevduat|turkish central bank|central bank of turkey/ },
    { k: "trmkt", n: "Türkiye piyasaları", short: "Borsa İst.", full: "Borsa İstanbul ve TL", place: "İstanbul, Türkiye", lat: 41.01, lon: 28.98, cty: "tr", c: "borsa", dx: -26, dy: -16,
      assets: ["borsa", "doviz"],
      mean: "Borsa İstanbul ve TL'deki hareketler Türkiye'ye özgü haberlerle (politika, kredi notu, yabancı yatırımcı girişi) yön bulur. Yabancı girişi genelde hem borsayı hem TL'yi destekler.",
      re: /borsa istanbul|\bbist\b|türk lirası|turkish lira|\blira\b|borsa/ },
    { k: "konut", n: "Konut", full: "Konut piyasası", place: "İstanbul, Türkiye", lat: 41.05, lon: 29.03, cty: "tr", c: "konut", dx: -6, dy: -34,
      assets: ["konut", "mevduat"],
      mean: "Konut kredisi faizleri düştüğünde talep ve fiyatlar artma eğilimine girer. Yüksek faiz döneminde satışlar yavaşlar; fiyatlar enflasyonun gerisinde kalabilir.",
      re: /konut|housing|real estate|emlak|kira/ },
    { k: "ecb", n: "ECB", full: "Avrupa Merkez Bankası", place: "Frankfurt, Almanya", lat: 50.11, lon: 8.68, cty: "de", c: "doviz", dx: 8, dy: 10,
      assets: ["doviz", "borsa"],
      mean: "ECB faizleri Fed'den hızlı indirirse euro dolara karşı zayıflar ve euro/TL, dolar/TL'den daha yavaş yükselir. Avrupa, Türkiye'nin en büyük ihracat pazarı olduğu için Avrupa ekonomisindeki canlanma ihracatçı şirketlere yarar.",
      re: /\becb\b|european central bank|lagarde|avrupa merkez|euro bölgesi|eurozone/ },
    { k: "gold", n: "Altın", full: "Altın piyasası", place: "Londra, İngiltere", lat: 51.51, lon: -0.08, cty: "gb", c: "altin", dx: -22, dy: -10,
      assets: ["altin"],
      mean: "Gram altın iki şeye bağlıdır: ons altının dolar fiyatı ve dolar/TL kuru. Ons altın yükseldiğinde ya da TL değer kaybettiğinde gram altın artar; ikisi aynı anda olduğunda etki büyür.",
      re: /gold|altın(?![a-zçğıöşü])|ons\b/ },
    { k: "boe", n: "İngiltere", full: "İngiltere Merkez Bankası", place: "Londra, İngiltere", lat: 51.5, lon: -0.12, cty: "gb", c: "doviz", dx: -34, dy: 14,
      assets: ["doviz"],
      mean: "İngiltere Merkez Bankası'nın kararları sterlini etkiler; Türkiye'deki yatırımlara etkisi genelde dolaylı ve sınırlıdır.",
      re: /bank of england|\bboe\b|ingiltere merkez/ },
    { k: "oil", n: "Petrol", full: "Petrol ve OPEC", place: "Riyad, S. Arabistan", lat: 24.71, lon: 46.68, cty: "sa", c: "borsa", dx: 0, dy: 0,
      assets: ["doviz", "borsa", "mevduat"],
      mean: "Türkiye enerjisinin çoğunu ithal ettiği için petrol fiyatındaki artış enerji faturasını, enflasyonu ve cari açığı büyütür. Bu TL'ye baskı yapar ve faiz indirimlerini geciktirebilir. Petrolün ucuzlaması ise tersini yapar.",
      re: /opec|oil|crude|brent|petrol/ },
    { k: "china", n: "Çin", full: "Çin ekonomisi", place: "Pekin, Çin", lat: 39.9, lon: 116.4, cty: "cn", c: "altin", dx: 0, dy: 0,
      assets: ["altin", "borsa"],
      mean: "Çin merkez bankasının altın alımları ons fiyatını destekler. Çin'in teşvik paketleri küresel büyümeyi ve emtia fiyatlarını yukarı çeker; Çin'de yavaşlama ise küresel borsaları baskılar.",
      re: /china|chinese|beijing|yuan|çin(?![a-zçğıöşü])/ },
    { k: "boj", n: "Japonya", full: "Japonya Merkez Bankası", place: "Tokyo, Japonya", lat: 35.68, lon: 139.69, cty: "jp", c: "borsa", dx: 0, dy: 0,
      assets: ["borsa", "doviz"],
      mean: "Japonya faiz artırırsa yen güçlenir ve ucuz yenle yapılan yatırımlar geri çekilebilir. Bu küresel borsalarda kısa süreli dalgalanmaya yol açabilir.",
      re: /bank of japan|\bboj\b|japonya|japan|\byen\b/ },
    { k: "crypto", n: "Kripto", full: "Kripto paralar", place: "New York, ABD", lat: 40.71, lon: -74.0, cty: "us", c: "kripto", dx: 18, dy: -8,
      assets: ["kripto"],
      mean: "Bitcoin fiyatı ETF giriş-çıkışları, ABD düzenlemeleri ve küresel risk iştahıyla hareket eder. Oynaklığı diğer varlıklardan çok daha yüksektir; kısa sürede sert yükseliş ve düşüşler görülebilir.",
      re: /bitcoin|crypto|kripto|\bbtc\b|ethereum/ }
  ];
  const MERGE = { rate: "fed", infl: "tcmb" };
  const TK = Object.fromEntries(TOPICS.map((t) => [t.k, t]));
  // Genel kelimeler ("merkez bankası", "faiz") yanlış konuya düşmesin diye özelden genele sıralı.
  const ORDER = ["ecb", "boj", "boe", "fed", "crypto", "oil", "china", "gold", "konut", "tcmb", "trmkt"];
  const COL = { mevduat: "var(--s-dep3m)", altin: "var(--s-altin)", doviz: "var(--s-dolar)", borsa: "var(--s-borsa)", kripto: "var(--s-bitcoin)", konut: "var(--s-konut)", otomobil: "var(--s-oto)" };
  const NAME = { mevduat: "Mevduat", altin: "Altın", doviz: "Döviz", borsa: "Borsa", kripto: "Bitcoin", konut: "Konut", otomobil: "Otomobil" };
  const TIMES = [["today", "Bugün"], ["7", "Son 7 gün"], ["30", "Son 30 gün"]];
  const NS = "http://www.w3.org/2000/svg";
  const ANK = proj(32.86, 39.93);

  let WORLD = null, worldP = null, source = null;
  const st = { time: "7", topic: null };

  const evs = () => (typeof EVENTS !== "undefined" ? EVENTS : []);
  function proj(lon, lat) {
    const l = lon * Math.PI / 180, p = lat * Math.PI / 180, p2 = p * p, p4 = p2 * p2;
    const x = l * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)));
    const y = p * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
    return [500 + 185 * x, 300 - 185 * y];
  }
  function loadWorld() {
    if (!worldP) worldP = fetch("/data/world.json").then((r) => (r.ok ? r.json() : Promise.reject())).then((w) => (WORLD = w)).catch(() => { worldP = null; return null; });
    return worldP;
  }
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const plain = (s) => String(s || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

  function topicOf(e) {
    if (e._t) return e._t;
    let k = MERGE[e.theme] || e.theme;
    if (!TK[k]) {
      const low = plain(e.title).toLocaleLowerCase("tr");
      const hit = ORDER.map((x) => TK[x]).find((t) => t.re.test(low));
      k = hit ? hit.k : null;
      if (!k && e.place) { const p = TOPICS.find((t) => t.place.split(",")[0] === String(e.place).split(",")[0]); k = p ? p.k : null; }
    }
    return (e._t = k || "trmkt");
  }
  function maxDays() { return st.time === "today" ? 0 : +st.time; }
  function groups() {
    const md = maxDays(), g = {};
    for (const e of evs()) {
      if (e.days > md) continue;
      const k = topicOf(e);
      (g[k] = g[k] || []).push(e);
    }
    for (const k in g) g[k].sort((a, b) => a.days - b.days || (b.ts || 0) - (a.ts || 0));
    return g;
  }
  const relD = (e) => (e.days === 0 ? "Bugün" : e.days === 1 ? "Dün" : e.days + " gün önce");

  function svgEl(t, a, p) { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }

  // Üst üste binen balonları birbirinden iter, her birini kendi şehrine hafifçe geri çeker.
  function relax(list, gap) {
    for (let it = 0; it < 120; it++) {
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        let dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
        const min = a.r + b.r + gap;
        if (d >= min) continue;
        if (d < 0.01) { dx = 1; dy = 0.3; d = Math.hypot(dx, dy); }
        const push = (min - d) / 2, ux = dx / d, uy = dy / d;
        a.x -= ux * push; a.y -= uy * push; b.x += ux * push; b.y += uy * push;
      }
      for (const o of list) { o.x += (o.ax - o.x) * 0.02; o.y += (o.ay - o.y) * 0.02; }
    }
  }

  // Haritayı ve balonları çizer. opts.mini: ana sayfa önizlemesi (etiketsiz, daha sade).
  function drawMap(svg, g, opts) {
    svg.innerHTML = "";
    if (!WORLD) return;
    const active = new Set(Object.keys(g).map((k) => TK[k].cty));
    svgEl("path", { d: WORLD.land, class: "gd-land" }, svg);
    for (const c in WORLD.c) if (active.has(c)) svgEl("path", { d: WORLD.c[c], class: "gd-hi" }, svg);
    svgEl("path", { d: WORLD.borders, class: "gd-border" }, svg);
    const lines = svgEl("g", { class: "gd-lines" }, svg), bubs = svgEl("g", {}, svg);
    const list = TOPICS.filter((t) => g[t.k]).map((t) => {
      const [x0, y0] = proj(t.lon, t.lat);
      return { t, n: g[t.k].length, ax: x0 + t.dx, ay: y0 + t.dy, x: x0 + t.dx, y: y0 + t.dy };
    });
    const maxN = Math.max(1, ...list.map((o) => o.n));
    // Dar ekranda haritayı balonların olduğu bölgeye yakınlaştır, balon ve yazıları da büyüt ki okunur kalsın.
    const cw = svg.clientWidth || 700;
    let vb = [0, 40, 1000, 400];
    if (!opts.mini && cw < 600 && list.length) {
      const xs = list.map((o) => o.ax), ys = list.map((o) => o.ay);
      const W = Math.min(1000, Math.max(620, Math.max(...xs) - Math.min(...xs) + 160)), H = W / 1.5;
      const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
      vb = [Math.min(1000 - W, Math.max(0, cx - W / 2)), Math.min(440 - H, Math.max(0, cy - H / 2)), W, H];
    }
    svg.setAttribute("viewBox", vb.map((v) => v.toFixed(0)).join(" "));
    const k = opts.mini ? 1 : Math.min(2.2, Math.max(1, (0.7 * vb[2]) / cw));
    for (const o of list) o.r = ((opts.mini ? 9 : 11) + 22 * Math.sqrt(o.n / maxN)) * k;
    relax(list, (opts.mini ? 4 : 26) * k);
    const lab = opts.mini ? 0 : 20 * k;
    for (const o of list) {
      o.x = Math.min(vb[0] + vb[2] - o.r - 4, Math.max(vb[0] + o.r + 4, o.x));
      o.y = Math.min(vb[1] + vb[3] - o.r - lab - 4, Math.max(vb[1] + o.r + 4, o.y));
    }
    for (const o of list) {
      if (o.t.cty !== "tr") {
        const mx = (o.x + ANK[0]) / 2, my = (o.y + ANK[1]) / 2 - Math.abs(o.x - ANK[0]) * 0.18;
        o.line = svgEl("path", { d: `M${o.x.toFixed(1)},${o.y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${ANK[0].toFixed(1)},${ANK[1].toFixed(1)}`, stroke: COL[o.t.c], class: "gd-line" + (!opts.mini && st.topic === o.t.k ? " on" : "") }, lines);
      }
    }
    list.sort((a, b) => b.n - a.n).forEach((o) => {
      const r = o.r;
      const gEl = svgEl("g", { class: "gd-bub" + (!opts.mini && st.topic === o.t.k ? " on" : ""), "data-topic": o.t.k }, bubs);
      if (!opts.mini) { gEl.setAttribute("tabindex", "0"); gEl.setAttribute("role", "button"); gEl.setAttribute("aria-label", `${o.t.n}: ${o.n} haber`); }
      svgEl("circle", { cx: o.x, cy: o.y, r: r, fill: COL[o.t.c], class: "b" }, gEl);
      svgEl("text", { x: o.x, y: o.y + 5.5 * k, class: "n", style: `font-size:${16 * k}px` }, gEl).textContent = o.n;
      if (!opts.mini) svgEl("text", { x: o.x, y: o.y + r + 15 * k, class: "l", style: `font-size:${15 * k}px;stroke-width:${4 * k}px` }, gEl).textContent = o.t.short || o.t.n;
    });
  }

  function detailHTML(t, list) {
    const items = list.slice(0, 6).map((e) => {
      const meta = [relD(e), e.src || e.place].filter(Boolean).map(esc).join(" · ");
      const title = e.title; // EVENTS başlıkları zaten kaçışlı (api/news.js) ya da sabit metin (a3.js)
      return e.url ? `<li><a href="${e.url}" target="_blank" rel="noopener noreferrer">${title} <span aria-hidden="true">↗</span></a><small>${meta}</small></li>`
        : `<li><span>${title}</span><small>${meta}</small></li>`;
    }).join("");
    const more = list.length > 6 ? `<p class="gd-more">ve ${list.length - 6} haber daha</p>` : "";
    return `<span class="gd-k">${esc(t.place)} · ${esc(timeTxt())} ${list.length} haber</span>
      <h2>${esc(t.full)}</h2>
      <div class="gd-mean"><b>Türkiye'deki yatırımın için ne anlama gelir?</b><p>${esc(t.mean)}</p></div>
      <div class="gd-assets"><span>Duyarlı yatırımlar</span>${t.assets.map((a) => `<span class="gd-a"><i style="background:${COL[a]}"></i>${NAME[a]}</span>`).join("")}</div>
      <div><span class="gd-sub">Son başlıklar</span><ul class="gd-hl">${items}</ul>${more}</div>`;
  }
  function timeTxt() { return st.time === "today" ? "bugün" : `son ${st.time} günde`; }

  function render() {
    const root = document.getElementById("gdRoot");
    if (!root) return;
    if (typeof state !== "undefined" && state.gSel) {
      const e = evs().find((x) => x.id === state.gSel);
      if (e) { st.topic = topicOf(e); if (e.days > maxDays()) st.time = e.days > 7 ? "30" : "7"; }
      state.gSel = null;
    }
    const g = groups(), keys = TOPICS.filter((t) => g[t.k]).map((t) => t.k);
    if (!st.topic || !g[st.topic]) st.topic = keys.slice().sort((a, b) => g[b].length - g[a].length)[0] || null;

    document.getElementById("gdTime").innerHTML = TIMES.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${st.time === v}">${l}</button>`).join("");
    const total = keys.reduce((s, k) => s + g[k].length, 0);
    document.getElementById("gdCount").innerHTML = `<b>${total}</b> haber · <b>${keys.length}</b> konu · ${timeTxt()}`;
    document.getElementById("gdStrip").innerHTML = keys.map((k) => {
      const t = TK[k];
      return `<button type="button" role="tab" data-topic="${k}" aria-selected="${st.topic === k}"><i style="background:${COL[t.c]}"></i>${esc(t.n)}<span>${g[k].length}</span></button>`;
    }).join("") || "";
    drawMap(document.getElementById("gdMap"), g, {});
    const det = document.getElementById("gdDetail");
    det.innerHTML = st.topic ? detailHTML(TK[st.topic], g[st.topic])
      : `<p class="gd-empty">Bu dönemde gösterilecek haber yok. Daha uzun bir dönem seçmeyi deneyin.</p>`;
    document.getElementById("gdNote").textContent = (source
      ? `Haberler ${source} üzerinden gerçek kaynaklardan gelir.`
      : "Haberler şu anda örnek veridir; gerçek haber servisine ulaşılamadı.")
      + " Konular başlıktaki kelimelere göre otomatik atanır. \"Ne anlama gelir?\" notları genel ekonomik eğilimleri anlatır; tahmin ya da yatırım tavsiyesi değildir.";
  }

  function renderHome() {
    const svg = document.getElementById("homeMap");
    if (!svg) return;
    const saved = st.time; st.time = "7";
    const g = groups(); st.time = saved;
    drawMap(svg, g, { mini: true });
  }

  function select(k) { st.topic = k; render(); }

  // Olaylar
  document.addEventListener("click", (e) => {
    const tb = e.target.closest("#gdTime button");
    if (tb) { st.time = tb.dataset.v; render(); return; }
    const tp = e.target.closest("#gdStrip [data-topic], #gdMap .gd-bub");
    if (tp) { select(tp.dataset.topic); return; }
    const hm = e.target.closest("#homeMapWrap");
    if (hm) {
      const b = e.target.closest(".gd-bub");
      st.topic = b ? b.dataset.topic : null; st.time = "7";
      location.hash = "harita";
    }
  });
  document.addEventListener("keydown", (e) => {
    const b = e.target.closest && e.target.closest("#gdMap .gd-bub");
    if (b && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); select(b.dataset.topic); }
  });

  let rz = null;
  addEventListener("resize", () => {
    clearTimeout(rz);
    rz = setTimeout(() => { const v = document.getElementById("v-harita"); if (v && !v.hidden) render(); }, 150);
  });

  window.renderGundem = function () { loadWorld().then(render); render(); };
  window.renderGundemHome = function () { loadWorld().then(renderHome); };
  // texgen.js gerçek haberleri EVENTS'e yükledikten sonra çağırır.
  window.gundemNewsLoaded = function (src) {
    source = src;
    evs().forEach((e) => delete e._t);
    renderHome();
    if (!document.getElementById("v-harita").hidden) render();
  };
})();
