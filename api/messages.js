export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const SUPA_URL = process.env.SUPABASE_URL;
  const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPA_URL || !SUPA_KEY) {
    res.status(200).json([]);
    return;
  }

  try {
    if (req.method === "GET") {
      const { userId, dilId, hocaId } = req.query;
      if (!userId || !dilId || !hocaId) { res.status(400).json({ error: "Eksik parametre" }); return; }
      const url = SUPA_URL + "/rest/v1/messages?user_id=eq." + userId + "&dil_id=eq." + dilId + "&hoca_id=eq." + hocaId + "&order=created_at.asc&limit=100";
      const r = await fetch(url, {
        headers: { "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY }
      });
      const data = await r.json();
      res.status(200).json((data || []).map(d => ({ r: d.role, t: d.content })));

    } else if (req.method === "POST") {
      const { userId, dilId, hocaId, messages } = req.body;
      if (!userId || !dilId || !hocaId) { res.status(400).json({ error: "Eksik parametre" }); return; }
      // Eski mesajları sil
      await fetch(SUPA_URL + "/rest/v1/messages?user_id=eq." + userId + "&dil_id=eq." + dilId + "&hoca_id=eq." + hocaId, {
        method: "DELETE",
        headers: { "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY }
      });
      // Yeni mesajları ekle
      const rows = (messages || []).slice(-50).map(m => ({
        user_id: String(userId), dil_id: dilId, hoca_id: hocaId,
        role: m.r, content: m.t, created_at: new Date().toISOString()
      }));
      if (rows.length > 0) {
        await fetch(SUPA_URL + "/rest/v1/messages", {
          method: "POST",
          headers: { "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY, "Content-Type": "application/json", "Prefer": "return=minimal" },
          body: JSON.stringify(rows)
        });
      }
      res.status(200).json({ ok: true });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}