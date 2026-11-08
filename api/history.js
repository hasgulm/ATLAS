// Weekly real price history aligned to the app's grid (a1.js: START 2019-10-18, END 2026-10-16, weekly)
const START = Date.UTC(2019, 9, 18), WEEK = 6048e5, END = Date.UTC(2026, 9, 16), N = Math.round((END - START) / WEEK) + 1;
const GRID = Array.from({ length: N }, (_, i) => START + i * WEEK);
const EVDS = "https://evds3.tcmb.gov.tr/igmevdsms-dis/";
async function get(u, h) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), 9000);
  try {
    const r = await fetch(u, { signal: c.signal, headers: Object.assign({ "user-agent": "Mozilla/5.0" }, h || {}) });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}
const dmy = (d) => [d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCFullYear()].map((x) => String(x).padStart(2, "0")).join("-");
async function evds(codes, from, to) {
  const k = process.env.EVDS_API_KEY;
  if (!k) throw new Error("no key");
  const j = await get(EVDS + "series=" + codes.join("-") + "&startDate=" + from + "&endDate=" + to + "&type=json", { key: k });
  return j.items || [];
}
async function kraken(pair) {
  const j = await get("https://api.kraken.com/0/public/OHLC?pair=" + pair + "&interval=10080");
  const k = Object.keys(j.result || {}).find((x) => x !== "last");
  return k ? j.result[k].map((c) => [c[0] * 1000, +c[4]]) : [];
}
const dayTs = (s) => { const [d, m, y] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); };
const ym = (t) => { const d = new Date(t); return d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1); };
// last value with ts <= t, from a list sorted by ts
function sample(list, maxAge) {
  return GRID.map((t) => {
    let v = null;
    for (const [ts, x] of list) { if (ts > t) break; if (t - ts <= maxAge) v = x; }
    return v;
  });
}
const full = (a) => (a && a.every((x) => x != null && isFinite(x) && x > 0) ? a.map((x) => +x.toPrecision(7)) : undefined);
module.exports = async (req, res) => {
  const today = dmy(new Date()), fx = ["TP.DK.USD.S.YTL", "TP.DK.EUR.S.YTL"];
  const jobs = await Promise.allSettled([
    evds(fx, "01-10-2019", "31-12-2021"), evds(fx, "01-01-2022", "30-06-2024"), evds(fx, "01-07-2024", today),
    evds(["TP.TUKFIY2025.GENEL"], "01-09-2018", today),
    evds(["TP.TRY.MT02", "TP.TRY.MT03", "TP.TRY.MT04"], "01-07-2019", today),
    evds(["TP.MK.KUL.YTL"], "01-10-2019", "31-12-2019"),
    kraken("XBTUSD"), kraken("PAXGUSD"),
    evds(["TP.KFE.TR"], "01-01-2019", today), evds(["TP.HKFE01"], "01-01-2019", today)
  ]);
  const val = (i) => (jobs[i].status === "fulfilled" ? jobs[i].value : null);
  const errs = jobs.map((j, i) => (j.status === "rejected" ? i + ": " + String(j.reason).slice(0, 60) : null)).filter(Boolean);
  const out = { updated: new Date().toISOString(), start: START, n: N, sources: {} };
  // FX
  const fxRows = [0, 1, 2].every((i) => val(i)) ? [].concat(val(0), val(1), val(2)) : null;
  if (fxRows) {
    const pick = (f) => fxRows.filter((r) => r[f] != null).map((r) => [dayTs(r.Tarih), +r[f]]).sort((a, b) => a[0] - b[0]);
    out.usd = full(sample(pick("TP_DK_USD_S_YTL"), 10 * 864e5));
    out.eur = full(sample(pick("TP_DK_EUR_S_YTL"), 10 * 864e5));
    if (out.usd) out.sources.fx = "TCMB EVDS";
  }
  // BTC (USD), Kraken weekly candles: value of the candle that contains the grid date
  const btc = val(6);
  if (btc && btc.length) { out.btcUsd = full(sample(btc, 7 * 864e5)); if (out.btcUsd) out.sources.btc = "Kraken"; }
  // Gold, TL per gram: PAXG (USD/oz) x USD/TRY / 31.1035; before PAXG trading starts, EVDS monthly bullion price
  const pax = val(7), kul = {};
  (val(5) || []).forEach((r) => { if (r.TP_MK_KUL_YTL != null) kul[r.Tarih] = +r.TP_MK_KUL_YTL; });
  if (pax && pax.length && out.usd) {
    const p = sample(pax, 7 * 864e5);
    out.gold = full(p.map((x, i) => (x != null ? x * out.usd[i] / 31.1035 : kul[ym(GRID[i])] || null)));
    if (out.gold) out.sources.gold = "Kraken PAXG, TCMB";
  }
  // CPI (2025=100), monthly value for the grid date's month, carried forward
  const cpiRows = (val(3) || []).filter((r) => r.TP_TUKFIY2025_GENEL != null).map((r) => [r.Tarih, +r.TP_TUKFIY2025_GENEL]);
  if (cpiRows.length) {
    const m = Object.fromEntries(cpiRows);
    let last = null;
    out.cpiTR = full(GRID.map((t) => (last = m[ym(t)] != null ? m[ym(t)] : last)));
    const [ld, lv] = cpiRows[cpiRows.length - 1], [y, mo] = ld.split("-"), prev = m[(+y - 1) + "-" + mo];
    if (prev) out.cpiYoy = { d: ld, v: (lv / prev - 1) * 100 };
    if (out.cpiTR) out.sources.cpi = "TCMB EVDS (TÜİK TÜFE)";
  }
  // Average TL deposit rates by maturity bucket (weekly, TCMB): latest value + history since mid-2019
  const dep = val(4);
  if (dep && dep.length) {
    const lastOf = (f) => { const r = dep.filter((x) => x[f] != null).pop(); return r ? { d: r.Tarih, v: +r[f] } : undefined; };
    out.deposit = { m3: lastOf("TP_TRY_MT02"), m6: lastOf("TP_TRY_MT03"), y1: lastOf("TP_TRY_MT04") };
    // [ms timestamp, % rate] pairs, sorted; the app turns them into step functions
    const hist = (f) => {
      const h = dep.filter((x) => x[f] != null && /^\d{2}-\d{2}-\d{4}$/.test(x.Tarih)).map((x) => [dayTs(x.Tarih), +(+x[f]).toFixed(2)]).sort((a, b) => a[0] - b[0]);
      return h.length > 100 && h[0][0] <= START ? h : undefined;
    };
    const dh = { m3: hist("TP_TRY_MT02"), m6: hist("TP_TRY_MT03"), y1: hist("TP_TRY_MT04") };
    if (dh.m3 && dh.m6 && dh.y1) { out.depHist = dh; out.sources.deposit = "TCMB EVDS"; }
  }
  // Housing: TCMB Konut Fiyat Endeksi (monthly, published with ~2 months lag), carried forward to the grid date
  for (const [i, code] of [[8, "TP.KFE.TR"], [9, "TP.HKFE01"]]) {
    const f = code.replace(/\./g, "_");
    const rows = (val(i) || []).filter((r) => r[f] != null && /^\d{4}-\d{1,2}$/.test(r.Tarih)).map((r) => [r.Tarih, +r[f]]);
    if (rows.length < 12) continue;
    const m = Object.fromEntries(rows);
    let last = null;
    const s = full(GRID.map((t) => (last = m[ym(t)] != null ? m[ym(t)] : last)));
    if (!s) continue;
    out.house = s; out.houseLast = rows[rows.length - 1][0];
    out.sources.house = code === "TP.KFE.TR" ? "TCMB Konut Fiyat Endeksi" : "TCMB Hedonik Konut Fiyat Endeksi";
    break;
  }
  if (errs.length) out.errors = errs;
  const ok = out.usd || out.btcUsd || out.cpiTR;
  res.setHeader("cache-control", ok ? "public, s-maxage=21600, stale-while-revalidate=86400" : "public, s-maxage=60");
  res.status(ok ? 200 : 502).json(out);
};
