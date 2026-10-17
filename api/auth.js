import { createHmac, scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

const denemeler = new Map();
function sinirVar(ip) {
  const simdi = Date.now();
  const liste = (denemeler.get(ip) || []).filter((t) => simdi - t < 10 * 60 * 1000);
  if (liste.length >= 20) { denemeler.set(ip, liste); return false; }
  liste.push(simdi);
  denemeler.set(ip, liste);
  return true;
}
function imzala(yuk) {
  const govde = Buffer.from(JSON.stringify(yuk)).toString("base64url");
  const imza = createHmac("sha256", process.env.SESSION_SECRET).update(govde).digest("base64url");
  return govde + "." + imza;
}
function sifreHashle(sifre) {
  const tuz = randomBytes(16).toString("hex");
  return "scrypt$" + tuz + "$" + scryptSync(sifre, tuz, 64).toString("hex");
}
function sifreDogruMu(sifre, kayit) {
  if (!kayit) return false;
  const k = String(kayit);
  let beklenen, denenen;
  if (k.startsWith("scrypt$")) {
    const p = k.split("$");
    beklenen = Buffer.from(p[2] || "", "hex");
    denenen = scryptSync(sifre, p[1] || "", 64);
  } else {
    beklenen = Buffer.from(k);
    denenen = Buffer.from(String(sifre));
  }
  return beklenen.length === denenen.length && timingSafeEqual(beklenen, denenen);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.SESSION_SECRET) return res.status(500).json({ error: "Sunucu ayarı eksik" });
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "bilinmiyor";
  if (!sinirVar(ip)) return res.status(429).json({ error: "Çok fazla deneme. Biraz bekleyip tekrar deneyin." });

  const b = req.body || {};
  const { action, email, password } = b;
  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
  const h = { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json" };

  try {
    if (action === "admin") {
      const beklenen = String(process.env.ADMIN_PASSWORD || "");
      if (!beklenen) return res.status(500).json({ error: "Yönetici şifresi ayarlanmamış" });
      const a = createHmac("sha256", "x").update(beklenen).digest();
      const c = createHmac("sha256", "x").update(String(password || "")).digest();
      if (!timingSafeEqual(a, c)) return res.status(401).json({ error: "Yanlış şifre" });
      return res.status(200).json({ ok: true, token: imzala({ sub: "admin", role: "admin", exp: Date.now() + 12 * 3600 * 1000 }) });
    }

    if (action === "login") {
      const em = String(email || "").trim().toLowerCase();
      if (!em || !password) return res.status(400).json({ error: "E-posta ve şifre gerekli" });
      const liste = await (await fetch(SB_URL + "/rest/v1/kullanicilar?email=eq." + encodeURIComponent(em) + "&limit=1", { headers: h })).json();
      const u = Array.isArray(liste) ? liste[0] : null;
      if (!u || !sifreDogruMu(String(password), u.pw)) return res.status(401).json({ error: "E-posta veya şifre hatalı" });
      if (!String(u.pw).startsWith("scrypt$")) {
        await fetch(SB_URL + "/rest/v1/kullanicilar?id=eq." + encodeURIComponent(u.id), { method: "PATCH", headers: h, body: JSON.stringify({ pw: sifreHashle(String(password)) }) });
      }
      const { pw, ...guvenli } = u;
      return res.status(200).json({ ok: true, user: guvenli, token: imzala({ sub: String(u.id), role: "user", exp: Date.now() + 30 * 24 * 3600 * 1000 }) });
    }

    if (action === "register") {
      const em = String(email || "").trim().toLowerCase();
      const ad = String(b.ad || "").trim();
      if (!ad || !em.includes("@") || String(password || "").length < 6) return res.status(400).json({ error: "Bilgiler eksik veya geçersiz" });
      const mevcut = await (await fetch(SB_URL + "/rest/v1/kullanicilar?email=eq." + encodeURIComponent(em) + "&select=id", { headers: h })).json();
      if (Array.isArray(mevcut) && mevcut.length > 0) return res.status(409).json({ error: "Bu e-posta zaten kayıtlı" });
      const kayit = {
        id: Date.now(), ad, email: em,
        tel: String(b.tel || ""), sehir: String(b.sehir || ""), dogum: String(b.dogum || ""),
        pw: sifreHashle(String(password)),
        plan: "Deneme", durum: "Deneme", trial_start: String(Date.now()), odeme: "0",
        created_at: new Date().toISOString()
      };
      const r = await fetch(SB_URL + "/rest/v1/kullanicilar", { method: "POST", headers: { ...h, Prefer: "return=minimal" }, body: JSON.stringify(kayit) });
      if (!r.ok) return res.status(500).json({ error: "Kayıt yapılamadı" });
      const { pw, ...guvenli } = kayit;
      return res.status(200).json({ ok: true, user: guvenli, token: imzala({ sub: String(kayit.id), role: "user", exp: Date.now() + 30 * 24 * 3600 * 1000 }) });
    }

    return res.status(400).json({ error: "Geçersiz işlem" });
  } catch (e) {
    return res.status(500).json({ error: "Sunucu hatası" });
  }
}
