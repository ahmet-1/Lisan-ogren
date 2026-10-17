import { createHmac, scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

function oturum(req) {
  const baslik = String(req.headers.authorization || "");
  const jeton = baslik.startsWith("Bearer ") ? baslik.slice(7) : "";
  const [govde, imza] = jeton.split(".");
  if (!govde || !imza || !process.env.SESSION_SECRET) return null;
  const beklenen = createHmac("sha256", process.env.SESSION_SECRET).update(govde).digest("base64url");
  const a = Buffer.from(imza), b = Buffer.from(beklenen);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const yuk = JSON.parse(Buffer.from(govde, "base64url").toString());
    return yuk.exp > Date.now() ? yuk : null;
  } catch (e) { return null; }
}
function sifreHashle(sifre) {
  const tuz = randomBytes(16).toString("hex");
  return "scrypt$" + tuz + "$" + scryptSync(sifre, tuz, 64).toString("hex");
}
const guvenli = (u) => {
  if (!u || typeof u !== "object") return u;
  const { pw, ...gerisi } = u;
  return gerisi;
};

export default async function handler(req, res) {
  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SB_URL || !SB_KEY) return res.status(500).json({ error: "Sunucu ayarı eksik" });
  const s = oturum(req);
  if (!s) return res.status(401).json({ error: "Giriş gerekli" });
  const admin = s.role === "admin";
  const h = { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json" };
  const idGecerli = (v) => /^\d+$/.test(String(v));

  try {
    if (req.method === "GET") {
      const email = req.query.email;
      if (email) {
        const liste = await (await fetch(SB_URL + "/rest/v1/kullanicilar?email=eq." + encodeURIComponent(email) + "&limit=1", { headers: h })).json();
        const u = Array.isArray(liste) ? liste[0] : null;
        if (!u) return res.status(200).json(null);
        if (!admin && String(u.id) !== String(s.sub)) return res.status(403).json({ error: "Yetkisiz" });
        return res.status(200).json(guvenli(u));
      }
      if (!admin) return res.status(403).json({ error: "Yetkisiz" });
      const liste = await (await fetch(SB_URL + "/rest/v1/kullanicilar?order=created_at.desc", { headers: h })).json();
      return res.status(200).json(Array.isArray(liste) ? liste.map(guvenli) : []);
    }

    if (req.method === "PUT") {
      const { id, ...guncel } = req.body || {};
      if (!idGecerli(id)) return res.status(400).json({ error: "Geçersiz id" });
      if (!admin && String(id) !== String(s.sub)) return res.status(403).json({ error: "Yetkisiz" });
      const izinli = admin
        ? ["ad", "email", "tel", "sehir", "dogum", "plan", "durum", "hediye", "odeme", "trial_start", "pw"]
        : ["ad", "tel", "sehir", "dogum", "pw"];
      const temiz = {};
      for (const k of izinli) if (guncel[k] !== undefined) temiz[k] = guncel[k];
      if ("pw" in temiz) { if (temiz.pw) temiz.pw = sifreHashle(String(temiz.pw)); else delete temiz.pw; }
      if (Object.keys(temiz).length === 0) return res.status(200).json({ ok: true });
      await fetch(SB_URL + "/rest/v1/kullanicilar?id=eq." + id, { method: "PATCH", headers: h, body: JSON.stringify(temiz) });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      if (!admin) return res.status(403).json({ error: "Yetkisiz" });
      if (!idGecerli(req.query.id)) return res.status(400).json({ error: "Geçersiz id" });
      await fetch(SB_URL + "/rest/v1/kullanicilar?id=eq." + req.query.id, { method: "DELETE", headers: h });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "Sunucu hatası" });
  }
}
