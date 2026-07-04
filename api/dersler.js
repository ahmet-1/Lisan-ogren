export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SB_URL || !SB_KEY) { res.status(200).json([]); return; }
  const h = { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY, "Content-Type": "application/json" };
  try {
    if (req.method === "GET") {
      const userId = req.query.userId;
      if (!userId) { res.status(400).json({ error: "userId gerekli" }); return; }
      const r = await fetch(SB_URL + "/rest/v1/ders_gecmisi?user_id=eq." + userId + "&order=created_at.desc", { headers: h });
      const d = await r.json();
      res.status(200).json(d || []);
    } else if (req.method === "POST") {
      const ders = req.body;
      await fetch(SB_URL + "/rest/v1/ders_gecmisi", {
        method: "POST",
        headers: { ...h, "Prefer": "resolution=merge-duplicates" },
        body: JSON.stringify({
          id: ders.id,
          user_id: String(ders.userId),
          dil_id: ders.dilId,
          hoca_id: ders.hocaId || "",
          hoca_ad: ders.hocaAd || "",
          seviye: ders.seviye || "A1",
          kategori: ders.kategori || "",
          sure: parseInt(ders.sure) || 0,
          dil_mod: ders.dilMod || "",
          ozet: ders.ozet || "",
          tarih: ders.tarih || ""
        })
      });
      res.status(200).json({ ok: true });
    } else if (req.method === "DELETE") {
      const id = req.query.id;
      await fetch(SB_URL + "/rest/v1/ders_gecmisi?id=eq." + id, { method: "DELETE", headers: h });
      res.status(200).json({ ok: true });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
