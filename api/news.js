const Q = '(fed OR "federal reserve" OR "central bank" OR ecb OR opec OR "oil price" OR "gold price" OR bitcoin OR "bank of japan" OR lira OR "borsa istanbul" OR inflation OR "merkez bankası" OR enflasyon OR faiz OR altın OR borsa)';
const THEMES = [
  { k: "fed", re: /\bfed\b|federal reserve|powell|fomc/, place: "Washington, ABD", lat: 38.9, lon: -77.04, imp: 3, cats: ["doviz", "altin", "borsa", "kripto"] },
  { k: "tcmb", re: /tcmb|merkez bankas|turkish central bank|central bank of turkey|turkey's central bank|karahan/, place: "Ankara, Türkiye", lat: 39.93, lon: 32.86, imp: 3, cats: ["mevduat", "doviz", "borsa"] },
  { k: "ecb", re: /\becb\b|european central bank|lagarde|avrupa merkez/, place: "Frankfurt, Almanya", lat: 50.11, lon: 8.68, imp: 3, cats: ["doviz", "borsa"] },
  { k: "boj", re: /bank of japan|\bboj\b|japonya merkez/, place: "Tokyo, Japonya", lat: 35.68, lon: 139.69, imp: 2, cats: ["doviz", "borsa"] },
  { k: "boe", re: /bank of england|\bboe\b/, place: "Londra, İngiltere", lat: 51.5, lon: -0.12, imp: 2, cats: ["doviz", "borsa"] },
  { k: "crypto", re: /bitcoin|crypto|kripto|\bbtc\b/, place: "New York, ABD", lat: 40.71, lon: -74.0, imp: 2, cats: ["kripto"] },
  { k: "gold", re: /gold|altın(?![a-zçğıöşü])/, place: "Londra, İngiltere", lat: 51.51, lon: -0.08, imp: 2, cats: ["altin"] },
  { k: "oil", re: /opec|oil price|crude|brent|petrol/, place: "Riyad, Suudi Arabistan", lat: 24.71, lon: 46.68, imp: 2, cats: ["borsa", "doviz"] },
  { k: "china", re: /china|chinese|beijing|çin/, place: "Pekin, Çin", lat: 39.9, lon: 116.4, imp: 2, cats: ["borsa", "altin"] },
  { k: "trmkt", re: /borsa istanbul|\bbist\b|lira|türk lirası|istanbul stock|borsa/, place: "İstanbul, Türkiye", lat: 41.01, lon: 28.98, imp: 2, cats: ["borsa", "doviz"] },
  { k: "konut", re: /konut|housing|real estate|emlak/, place: "İstanbul, Türkiye", lat: 41.05, lon: 29.03, imp: 1, cats: ["konut"] },
  { k: "infl", re: /enflasyon|tüfe|inflation/, place: "Ankara, Türkiye", lat: 39.9, lon: 32.9, imp: 2, cats: ["mevduat", "doviz"] },
  { k: "rate", re: /faiz|interest rate|rate cut|rate hike/, place: "Washington, ABD", lat: 38.95, lon: -77.1, imp: 2, cats: ["mevduat", "doviz"] }
];
const PLACES = [
  [/korea|\bbok\b|seoul|kore/, "Seul, Güney Kore", 37.57, 126.98],
  [/japan|\bboj\b|tokyo|japon|\byen\b/, "Tokyo, Japonya", 35.68, 139.69],
  [/china|chinese|beijing|yuan|çin/, "Pekin, Çin", 39.9, 116.4],
  [/india|mumbai|rupee|hindistan/, "Mumbai, Hindistan", 19.08, 72.88],
  [/brazil|brasil|brezilya/, "São Paulo, Brezilya", -23.55, -46.63],
  [/australia|aussie|\brba\b|avustralya/, "Sidney, Avustralya", -33.87, 151.21],
  [/russia|moscow|ruble|rusya/, "Moskova, Rusya", 55.76, 37.62],
  [/saudi|opec|riyadh|suudi/, "Riyad, Suudi Arabistan", 24.71, 46.68],
  [/germany|german|almanya|bundesbank/, "Berlin, Almanya", 52.52, 13.4],
  [/france|french|francia|fransa|zone euro/, "Paris, Fransa", 48.86, 2.35],
  [/ital|roma\b/, "Roma, İtalya", 41.9, 12.5],
  [/\becb\b|\bbce\b|eurozone|euro zone|euro area|\beuro\b|avrupa/, "Frankfurt, Almanya", 50.11, 8.68],
  [/britain|\buk\b|england|london|pound|sterling|ingiltere/, "Londra, İngiltere", 51.5, -0.12],
  [/türkiye|turkey|turkish|türk|tcmb|ankara|merkez bankası|lira/, "Ankara, Türkiye", 39.93, 32.86],
  [/istanbul|borsa istanbul|\bbist\b/, "İstanbul, Türkiye", 41.01, 28.98],
  [/wall street|nasdaq|s&p|dow jones|new york/, "New York, ABD", 40.71, -74.0],
  [/\bfed\b|federal reserve|\bu\.?s\.?\b|\bus\b|america|abd|powell|treasury/, "Washington, ABD", 38.9, -77.04]
];
const clean = (s) => s.replace(/ ([,.:;?!%)])/g, "$1").replace(/\( /g, "(").replace(/(\d)([,.]) (\d)/g, "$1$2$3").replace(/\s+/g, " ");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const GQ = 'fed OR "federal reserve" OR "central bank" OR ecb OR opec OR "oil price" OR "gold price" OR bitcoin OR "turkish lira" OR inflation OR "borsa istanbul"';
const dec = (s) => s.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&");
async function get(u, ms) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), ms);
  try {
    const go = () => fetch(u, { signal: c.signal, headers: { "user-agent": "Mozilla/5.0 (compatible; atlas/1.0)" } });
    let r = await go();
    if (r.status === 429) { await new Promise((ok) => setTimeout(ok, 5500)); r = await go(); }
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.text();
  } finally { clearTimeout(t); }
}
async function gdelt() {
  const txt = await get("https://api.gdeltproject.org/api/v2/doc/doc?query=" + encodeURIComponent(Q) + "&mode=artlist&format=json&maxrecords=250&timespan=30d&sort=hybridrel", 13000);
  return (JSON.parse(txt).articles || []).map((a) => {
    const m = (a.seendate || "").match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
    return { title: a.title || "", url: a.url || "", src: a.domain || "", ts: m ? Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5]) : 0 };
  });
}
async function gnews() {
  const xml = await get("https://news.google.com/rss/search?q=" + encodeURIComponent(GQ + " when:7d") + "&hl=en-US&gl=US&ceid=US:en", 8000);
  return xml.split("<item>").slice(1).map((it) => {
    const g = (re) => { const m = it.match(re); return m ? dec(m[1]).trim() : ""; };
    const src = g(/<source[^>]*>([\s\S]*?)<\/source>/);
    let title = g(/<title>([\s\S]*?)<\/title>/);
    if (src && title.endsWith(" - " + src)) title = title.slice(0, -src.length - 3);
    return { title, url: g(/<link>([\s\S]*?)<\/link>/), src, ts: Date.parse(g(/<pubDate>([\s\S]*?)<\/pubDate>/)) || 0 };
  });
}
module.exports = async (req, res) => {
  let arts = [], source = "", errs = [];
  for (const [name, fn] of [["GDELT", gdelt], ["Google Haberler", gnews]]) {
    try { arts = await fn(); if (arts.length) { source = name; break; } errs.push(name + ": boş"); }
    catch (e) { errs.push(name + ": " + String(e).slice(0, 80)); }
  }
  if (!arts.length) {
    res.setHeader("cache-control", "public, s-maxage=60");
    return res.status(502).json({ error: "news", detail: errs.join(" | ") });
  }
  const now = Date.now(), seen = new Set(), per = {}, out = [];
  for (const a of arts) {
    const title = clean((a.title || "").trim()), low = title.toLocaleLowerCase("tr");
    if (!title || !/^https?:[/][/]/.test(a.url || "") || seen.has(low)) continue;
    const th = THEMES.find((x) => x.re.test(low));
    if (!th || (per[th.k] = (per[th.k] || 0) + 1) > 6) continue;
    seen.add(low);
    const ts = a.ts || now;
    const pl = PLACES.find((x) => x[0].test(low)), loc = pl ? { place: pl[1], lat: pl[2], lon: pl[3] } : th;
    const key = loc.place; per[key] = (per[key] || 0) + 1;
    const n = out.length, ang = n * 2.399, jit = 0.9 * Math.min(1, (per[key] - 1) / 2);
    out.push({
      id: "n" + n, src: esc(a.src), url: esc(a.url), ts,
      days: Math.max(0, Math.floor((now - ts) / 864e5)), title: esc(title), theme: th.k,
      place: loc.place, lat: loc.lat + Math.sin(ang) * jit, lon: loc.lon + Math.cos(ang) * jit,
      imp: th.imp, impacts: th.cats.map((k) => [k, "mixed"])
    });
  }
  out.sort((a, b) => b.ts - a.ts);
  res.setHeader("cache-control", "public, s-maxage=1800, stale-while-revalidate=7200");
  res.json({ updated: new Date(now).toISOString(), source, events: out });
};
