import { createHmac, timingSafeEqual } from "node:crypto";

function oturum(req) {
  const baslik = String((req.headers && req.headers.authorization) || "");
  const jeton = baslik.startsWith("Bearer ") ? baslik.slice(7) : "";
  const parca = jeton.split(".");
  if (parca.length !== 2 || !process.env.SESSION_SECRET) return null;
  const beklenen = createHmac("sha256", process.env.SESSION_SECRET).update(parca[0]).digest("base64url");
  const a = Buffer.from(parca[1]);
  const b = Buffer.from(beklenen);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const yuk = JSON.parse(Buffer.from(parca[0], "base64url").toString());
    return yuk && yuk.exp > Date.now() && (yuk.role === "admin" || yuk.role === "user") ? yuk : null;
  } catch (e) {
    return null;
  }
}

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
  res.setHeader("X-Api-Surum", "2");
  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SB_URL || !SB_KEY) { res.status(200).json([]); return; }
  const h = { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY, "Content-Type": "application/json" };
  const s = oturum(req);
  if (!s) { res.status(401).json({ error: "Giriş gerekli" }); return; }
  const admin = s.role === "admin";
  const hedef = String((req.method === "GET" ? (req.query || {}).userId : (req.body || {}).userId) || "");
  if (!admin && req.method !== "DELETE" && hedef !== String(s.sub)) { res.status(403).json({ error: "Yetkisiz" }); return; }
  if (sinirli("veri:" + s.sub, 300, 60000)) { res.status(429).json({ error: "Çok fazla istek. Biraz bekleyin." }); return; }

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
      if (!id || !/^[A-Za-z0-9_-]+$/.test(String(id))) { res.status(400).json({ error: "Geçersiz id" }); return; }
      if (!admin) {
        const kontrol = await (await fetch(SB_URL + "/rest/v1/ders_gecmisi?id=eq." + encodeURIComponent(String(id)) + "&select=user_id&limit=1", { headers: h })).json();
        if (!Array.isArray(kontrol) || !kontrol[0] || String(kontrol[0].user_id) !== String(s.sub)) { res.status(403).json({ error: "Yetkisiz" }); return; }
      }
      await fetch(SB_URL + "/rest/v1/ders_gecmisi?id=eq." + id, { method: "DELETE", headers: h });
      res.status(200).json({ ok: true });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
