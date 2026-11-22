const sayac = new Map();
function sinirli(anahtar, adet, sureMs) {
  const simdi = Date.now();
  const liste = (sayac.get(anahtar) || []).filter((t) => simdi - t < sureMs);
  if (liste.length >= adet) { sayac.set(anahtar, liste); return true; }
  liste.push(simdi);
  sayac.set(anahtar, liste);
  return false;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "bilinmiyor";
  if (sinirli("ping:" + ip, 10, 60000)) { res.status(429).json({ ok: false }); return; }
  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SB_URL || !SB_KEY) { res.status(500).json({ ok: false, v: 1 }); return; }
  const h = { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json" };
  const okuma = {};
  let hepsiTamam = true;
  try {
    for (const tablo of ["kullanicilar", "ders_mesajlar", "ders_gecmisi"]) {
      const r = await fetch(SB_URL + "/rest/v1/" + tablo + "?select=id&limit=1", { headers: h });
      let satir = 0;
      try { const d = await r.json(); satir = Array.isArray(d) ? d.length : 0; } catch (e) {}
      okuma[tablo] = { durum: r.status, satir };
      if (r.status !== 200) hepsiTamam = false;
    }
    let yazma = "atlandi";
    const r1 = await fetch(SB_URL + "/rest/v1/heartbeat?select=son,sayac&id=eq.1", { headers: h });
    let kayit = null;
    if (r1.ok) { try { const d = await r1.json(); kayit = Array.isArray(d) ? (d[0] || null) : null; } catch (e) {} }
    const eskiMs = kayit && kayit.son ? Date.now() - new Date(kayit.son).getTime() : Infinity;
    if (eskiMs > 60 * 60 * 1000) {
      const r2 = await fetch(SB_URL + "/rest/v1/heartbeat?on_conflict=id", {
        method: "POST",
        headers: { ...h, Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ id: 1, son: new Date().toISOString(), sayac: (kayit ? Number(kayit.sayac) || 0 : 0) + 1 })
      });
      yazma = r2.ok ? "yazildi" : "hata " + r2.status;
    }
    res.status(200).json({ ok: hepsiTamam, v: 1, okuma, yazma });
  } catch (e) {
    res.status(500).json({ ok: false, v: 1 });
  }
}