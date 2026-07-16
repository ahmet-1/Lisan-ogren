export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  const SUPA_URL = process.env.SUPABASE_URL;
  const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPA_URL || !SUPA_KEY) { res.status(200).json([]); return; }
  const h = { "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY, "Content-Type": "application/json" };
  try {
    if (req.method === "GET") {
      const { userId, dilId, hocaId } = req.query;
      if (!userId || !dilId || !hocaId) { res.status(400).json({ error: "Eksik parametre" }); return; }
      const url = SUPA_URL + "/rest/v1/messages?user_id=eq." + encodeURIComponent(userId) + "&dil_id=eq." + encodeURIComponent(dilId) + "&hoca_id=eq." + encodeURIComponent(hocaId) + "&order=created_at.asc&limit=200";
      const r = await fetch(url, { headers: h });
      const data = await r.json();
      res.status(200).json((data || []).map(d => ({ r: d.role, t: d.content })));
    } else if (req.method === "POST") {
      const { userId, dilId, hocaId, messages } = req.body;
      if (!userId || !dilId || !hocaId) { res.status(400).json({ error: "Eksik parametre" }); return; }
      const rows = (messages || []).slice(-100).map(m => ({
        user_id: String(userId), dil_id: String(dilId), hoca_id: String(hocaId),
        role: m.r, content: m.t, created_at: new Date().toISOString()
      }));
      await fetch(SUPA_URL + "/rest/v1/messages?user_id=eq." + encodeURIComponent(userId) + "&dil_id=eq." + encodeURIComponent(dilId) + "&hoca_id=eq." + encodeURIComponent(hocaId), {
        method: "DELETE", headers: h
      });
      if (rows.length > 0) {
        const insRes = await fetch(SUPA_URL + "/rest/v1/messages", {
          method: "POST",
          headers: { ...h, "Prefer": "return=minimal" },
          body: JSON.stringify(rows)
        });
        const insTxt = await insRes.text();
        if (!insRes.ok) {
          return res.status(200).json({ ok: false, status: insRes.status, error: insTxt });
        }
      }
      res.status(200).json({ ok: true, saved: rows.length });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}