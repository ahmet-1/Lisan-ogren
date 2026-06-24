import { dbFetch } from "./db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  try {
    if (req.method === "GET") {
      // Mesajları getir
      const { userId, dilId, hocaId } = req.query;
      if (!userId || !dilId || !hocaId) {
        res.status(400).json({ error: "userId, dilId, hocaId gerekli" });
        return;
      }
      const data = await dbFetch(
        "messages?user_id=eq." + userId + "&dil_id=eq." + dilId + "&hoca_id=eq." + hocaId + "&order=created_at.asc&limit=100",
        "GET"
      );
      res.status(200).json(data || []);

    } else if (req.method === "POST") {
      // Mesaj kaydet
      const { userId, dilId, hocaId, messages } = req.body;
      if (!userId || !dilId || !hocaId || !messages) {
        res.status(400).json({ error: "Eksik parametre" });
        return;
      }

      // Önce eski mesajları sil
      await fetch(process.env.SUPABASE_URL + "/rest/v1/messages?user_id=eq." + userId + "&dil_id=eq." + dilId + "&hoca_id=eq." + hocaId, {
        method: "DELETE",
        headers: {
          "apikey": process.env.SUPABASE_SERVICE_KEY,
          "Authorization": "Bearer " + process.env.SUPABASE_SERVICE_KEY
        }
      });

      // Yeni mesajları kaydet (son 50 mesaj)
      const son50 = messages.slice(-50);
      const rows = son50.map(m => ({
        user_id: userId,
        dil_id: dilId,
        hoca_id: hocaId,
        role: m.r,
        content: m.t,
        created_at: new Date().toISOString()
      }));

      if (rows.length > 0) {
        await dbFetch("messages", "POST", rows);
      }
      res.status(200).json({ ok: true });

    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}