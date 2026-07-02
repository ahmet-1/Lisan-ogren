export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SB_URL || !SB_KEY) { res.status(200).json([]); return; }
  const h = { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY, "Content-Type": "application/json" };
  try {
    if (req.method === "GET") {
      const email = req.query.email;
      const url = SB_URL + "/rest/v1/kullanicilar" + (email ? "?email=eq." + encodeURIComponent(email) : "?order=created_at.desc");
      const r = await fetch(url, { headers: h });
      const d = await r.json();
      res.status(200).json(email ? (d[0] || null) : (d || []));
    } else if (req.method === "POST") {
      const u = req.body;
      const r = await fetch(SB_URL + "/rest/v1/kullanicilar", {
        method: "POST",
        headers: { ...h, "Prefer": "resolution=merge-duplicates" },
        body: JSON.stringify({ id: String(u.id || Date.now()), ad: u.ad, email: u.email, tel: u.tel || "", sehir: u.sehir || "", dogum: u.dogum || "", pw: u.pw, plan: u.plan || "Deneme", durum: u.durum || "Deneme", trial_start: String(u.trialStart || Date.now()), odeme: u.odeme || "0", created_at: new Date().toISOString() })
      });
      res.status(200).json({ ok: true });
    } else if (req.method === "PUT") {
      const { id, ...updates } = req.body;
      await fetch(SB_URL + "/rest/v1/kullanicilar?id=eq." + id, { method: "PATCH", headers: h, body: JSON.stringify(updates) });
      res.status(200).json({ ok: true });
    } else if (req.method === "DELETE") {
      await fetch(SB_URL + "/rest/v1/kullanicilar?id=eq." + req.query.id, { method: "DELETE", headers: h });
      res.status(200).json({ ok: true });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
