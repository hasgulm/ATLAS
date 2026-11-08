// 12-month expectations from the TCMB Piyasa Katılımcıları Anketi (Survey of Market Participants), via EVDS.
// The survey's datagroup and series codes are looked up from EVDS metadata by name, so a renamed code does not break it.
// /api/forecast?debug=1 also lists the candidate series names (no secrets), to check the matching.
const EVDS = "https://evds3.tcmb.gov.tr/igmevdsms-dis/";
async function get(path) {
  const k = process.env.EVDS_API_KEY;
  if (!k) throw new Error("no key");
  const c = new AbortController(), t = setTimeout(() => c.abort(), 9000);
  try {
    const r = await fetch(EVDS + path, { signal: c.signal, headers: { key: k, "user-agent": "Mozilla/5.0" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}
const list = (j) => (Array.isArray(j) ? j : (j && (j.items || j.data || j.result)) || []);
const low = (s) => String(s || "").toLocaleLowerCase("tr-TR");
const dmy = (d) => [d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCFullYear()].map((x) => String(x).padStart(2, "0")).join("-");

async function surveyGroups() {
  const found = [];
  try {
    for (const g of list(await get("datagroups/mode=0&type=json"))) {
      const n = low(g.DATAGROUP_NAME) + " " + low(g.DATAGROUP_NAME_ENG);
      if (/piyasa katılımcıları|market participants|beklenti anketi|expectation survey/.test(n)) found.push(g.DATAGROUP_CODE);
    }
  } catch (e) {}
  return found.length ? found : ["bie_pkauo"];
}
// Pick the survey average for "12 months ahead" of the given variable; skip distributions, std. deviations, min/max etc.
function score(s, what) {
  const n = low(s.SERIE_NAME) + " | " + low(s.SERIE_NAME_ENG);
  if (!/12 ay sonra|12 months ahead|12-month ahead|12 month ahead/.test(n)) return -1;
  if (/24 ay|2 yıl|24 months|two years|aylık tüfe|monthly cpi/.test(n)) return -1;
  if (/standart|std|sapma|deviation|dağılım|distribution|olasılık|probability|range|\bmin(imum)?\b|maks|\bmax|katılımcı sayısı|number of/.test(n)) return -1;
  const ok = what === "cpi" ? /tüfe|enflasyon|cpi|consumer price|inflation/.test(n)
    : what === "usd" ? /döviz|usd|dolar|exchange rate/.test(n)
    : /politika faizi|policy rate|repo|haftalık repo/.test(n);
  if (!ok) return -1;
  let sc = 3;
  if (/ortalama|mean|average/.test(n)) sc += 2;
  if (/medyan|median/.test(n)) sc -= 1;
  if (what === "cpi" && /yıllık|annual/.test(n)) sc += 1;
  if (/arşiv|archive/.test(n)) sc -= 3; // discontinued series: only a last resort
  return sc;
}
// Candidates best-first; the first one that has a recent value wins (archived series have none)
function ranked(series, what) {
  const seen = {};
  return series.map((s) => [s, score(s, what)]).filter(([s, sc]) => sc >= 0 && !seen[s.SERIE_CODE] && (seen[s.SERIE_CODE] = 1))
    .sort((a, b) => b[1] - a[1]).slice(0, 8).map(([s]) => s);
}

module.exports = async (req, res) => {
  const out = { updated: new Date().toISOString(), source: "TCMB Piyasa Katılımcıları Anketi" }, debug = /debug=1/.test(req.url || "");
  try {
    let series = [];
    const groups = await surveyGroups();
    if (debug) out.groups = groups;
    for (const code of groups) {
      try { series = series.concat(list(await get("serieList/type=json&code=" + code))); } catch (e) {}
    }
    const cand = { cpi12: ranked(series, "cpi"), usd12: ranked(series, "usd"), rate12: ranked(series, "rate") };
    if (debug) { out.series = series.length; out.cand = {}; for (const k in cand) out.cand[k] = cand[k].map((s) => [s.SERIE_CODE, s.SERIE_NAME]); }
    const from = dmy(new Date(Date.now() - 200 * 864e5)), to = dmy(new Date()), vals = {};
    const all = [...new Set([].concat(cand.cpi12, cand.usd12, cand.rate12).map((s) => s.SERIE_CODE))];
    for (let i = 0; i < all.length; i += 8) {
      try {
        const rows = list(await get("series=" + all.slice(i, i + 8).join("-") + "&startDate=" + from + "&endDate=" + to + "&type=json"));
        for (const c of all.slice(i, i + 8)) {
          const f = c.replace(/\./g, "_"), r = rows.filter((x) => x[f] != null && isFinite(+x[f])).pop();
          if (r) vals[c] = { d: r.Tarih, v: +(+r[f]).toFixed(4) };
        }
      } catch (e) { if (debug) (out.fetchErrors = out.fetchErrors || []).push(String(e).slice(0, 60)); }
    }
    for (const k in cand) {
      const s = cand[k].find((x) => vals[x.SERIE_CODE]);
      if (s) out[k] = Object.assign({}, vals[s.SERIE_CODE], { code: s.SERIE_CODE, name: s.SERIE_NAME });
    }
  } catch (e) { out.error = String(e).slice(0, 100); }
  const ok = out.cpi12 || out.usd12;
  res.setHeader("cache-control", ok ? "public, s-maxage=43200, stale-while-revalidate=86400" : "public, s-maxage=300");
  res.status(ok ? 200 : 502).json(out);
};
