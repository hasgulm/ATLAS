const T = 8000;
async function get(u, type) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), T);
  try {
    const r = await fetch(u, { signal: c.signal, headers: { "user-agent": "atlas/1.0" } });
    if (!r.ok) throw new Error(u + " " + r.status);
    return type === "text" ? await r.text() : await r.json();
  } finally { clearTimeout(t); }
}
function tcmbRate(xml, code) {
  const m = xml.match(new RegExp('CurrencyCode="' + code + '"[^]*?<ForexSelling>([0-9.]+)</ForexSelling>'));
  return m ? +m[1] : null;
}
function dmy(d) { return [d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCFullYear()].map((x) => String(x).padStart(2, "0")).join("-"); }
async function evds(code, days, freq) {
  const k = process.env.EVDS_API_KEY;
  if (!k) return null;
  const now = new Date(), from = new Date(now.getTime() - days * 864e5);
  const u = "https://evds3.tcmb.gov.tr/igmevdsms-dis/series=" + code + "&startDate=" + dmy(from) + "&endDate=" + dmy(now) + "&type=json" + (freq ? "&frequency=" + freq : "");
  const c = new AbortController(), t = setTimeout(() => c.abort(), T);
  try {
    const r = await fetch(u, { signal: c.signal, headers: { key: k, "user-agent": "Mozilla/5.0" } });
    if (!r.ok) return null;
    const f = code.split(".").join("_"), j = await r.json();
    return (j.items || []).filter((x) => x[f] != null).map((x) => ({ d: x.Tarih, v: +x[f] }));
  } catch (e) { return null; } finally { clearTimeout(t); }
}
module.exports = async (req, res) => {
  const out = { updated: new Date().toISOString(), sources: {} };
  const [fx, cg, fon, dep3, depAll, cpi] = await Promise.allSettled([
    get("https://www.tcmb.gov.tr/kurlar/today.xml", "text"),
    get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,pax-gold&vs_currencies=try,usd&include_24hr_change=true"),
    evds("TP.APIFON4", 30), evds("TP.TRY.MT02", 45), evds("TP.TRY.MT06", 45), evds("TP.TUKFIY2025.GENEL", 520)
  ]);
  const last = (p) => (p.status === "fulfilled" && p.value && p.value.length ? p.value[p.value.length - 1] : null);
  const ev = {}, a = last(fon), b = last(dep3), c = last(depAll);
  if (a) ev.funding = a;
  if (b) ev.deposit3m = b;
  if (c) ev.depositAvg = c;
  if (cpi.status === "fulfilled" && cpi.value && cpi.value.length) {
    const v = cpi.value, l = v[v.length - 1], ym = l.d.split("-"), prev = v.find((x) => x.d === (+ym[0] - 1) + "-" + ym[1]);
    if (prev) ev.cpiYoy = { d: l.d, v: (l.v / prev.v - 1) * 100 };
  }
  if (Object.keys(ev).length) { out.evds = ev; out.sources.evds = "TCMB EVDS"; }
  if (fx.status === "fulfilled") {
    const usd = tcmbRate(fx.value, "USD"), eur = tcmbRate(fx.value, "EUR");
    const d = (fx.value.match(/Tarih="([0-9.]+)"/) || [])[1];
    if (usd) { out.usd = usd; out.eur = eur; out.sources.fx = "TCMB" + (d ? " " + d : ""); }
  }
  if (!out.usd) {
    try {
      const f = await get("https://api.frankfurter.app/latest?from=USD&to=TRY,EUR");
      out.usd = f.rates.TRY; out.eur = f.rates.TRY / f.rates.EUR; out.sources.fx = "ECB " + f.date;
    } catch (e) {}
  }
  if (cg.status === "fulfilled") {
    const b = cg.value.bitcoin, g = cg.value["pax-gold"];
    if (b) { out.btc = b.try; out.btcUsd = b.usd; out.btcChg = b.try_24h_change; }
    if (g) { out.gold = g.try / 31.1035; out.goldChg = g.try_24h_change; }
    out.sources.crypto = "CoinGecko";
  }
  res.setHeader("cache-control", "public, s-maxage=900, stale-while-revalidate=3600");
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.status(out.usd || out.btc || out.evds ? 200 : 502).send(JSON.stringify(out));
};
