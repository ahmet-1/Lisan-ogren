import { createHmac, scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

const denemeler = new Map();
function sinirVar(ip) {
  const simdi = Date.now();
  const liste = (denemeler.get(ip) || []).filter((t) => simdi - t < 15 * 60 * 1000);
  if (liste.length >= 10) { denemeler.set(ip, liste); return false; }
  liste.push(simdi);
  denemeler.set(ip, liste);
  return true;
}
function imzala(yuk) {
  const govde = Buffer.from(JSON.stringify(yuk)).toString("base64url");
  const imza = createHmac("sha256", process.env.SESSION_SECRET).update(govde).digest("base64url");
  return govde + "." + imza;
}
function jetonOku(jeton) {
  const [govde, imza] = String(jeton || "").split(".");
  if (!govde || !imza) return null;
  const beklenen = createHmac("sha256", process.env.SESSION_SECRET).update(govde).digest("base64url");
  const a = Buffer.from(imza), b = Buffer.from(beklenen);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const y = JSON.parse(Buffer.from(govde, "base64url").toString());
    return y.typ === "reset" && y.exp > Date.now() ? y : null;
  } catch (e) { return null; }
}
const parmakIzi = (pw) => createHmac("sha256", process.env.SESSION_SECRET).update("reset:" + String(pw)).digest("hex").slice(0, 16);
function sifreHashle(sifre) {
  const tuz = randomBytes(16).toString("hex");
  return "scrypt$" + tuz + "$" + scryptSync(sifre, tuz, 64).toString("hex");
}

export default async function handler(req, res) {
  res.setHeader("X-Reset-Surum", "2");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.SESSION_SECRET) return res.status(500).json({ error: "Sunucu ayarı eksik" });
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "bilinmiyor";
  if (!sinirVar(ip)) return res.status(429).json({ error: "Çok fazla deneme. Biraz bekleyip tekrar deneyin." });

  const { action, email, token, newPassword } = req.body || {};
  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
  const h = { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json" };
  const kullaniciBul = async (em) => {
    const liste = await (await fetch(SB_URL + "/rest/v1/kullanicilar?email=eq." + encodeURIComponent(em) + "&limit=1&select=id,email,pw", { headers: h })).json();
    return Array.isArray(liste) ? (liste[0] || null) : null;
  };
  const GECERSIZ = { error: "Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir sıfırlama isteyin." };

  try {
    if (action === "send") {
      const em = String(email || "").trim().toLowerCase();
      if (!em.includes("@")) return res.status(400).json({ error: "Geçerli bir e-posta girin" });
      const u = await kullaniciBul(em);
      if (!u) return res.status(200).json({ ok: true });
      if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: "E-posta servisi şu an kullanılamıyor. Lütfen destek ile iletişime geçin." });
      const jeton = imzala({ typ: "reset", sub: String(u.id), email: em, fp: parmakIzi(u.pw), exp: Date.now() + 60 * 60 * 1000 });
      const baglanti = (process.env.APP_URL || "https://lisan-ogren-71l1.vercel.app").replace(/\/+$/, "") + "?reset=" + jeton;
      const gonderen = process.env.MAIL_FROM || "Lisan Ogren <onboarding@resend.dev>";
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + process.env.RESEND_API_KEY },
        body: JSON.stringify({
          from: gonderen,
          to: [em],
          subject: "Şifre Sıfırlama - Lisan Öğren",
          html: "<div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:20px'>" +
            "<h2 style='color:#2e7d32'>Lisan Öğren - Şifre Sıfırlama</h2>" +
            "<p>Şifre sıfırlama talebiniz alındı. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.</p>" +
            "<p>Bu bağlantı <strong>1 saat</strong> geçerlidir.</p>" +
            "<a href='" + baglanti + "' style='display:inline-block;padding:12px 24px;background:#2e7d32;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold'>Şifremi Sıfırla</a>" +
            "<p style='color:#999;font-size:12px'>Bu talebi siz yapmadıysanız bu e-postayı dikkate almayın.</p></div>"
        })
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        console.error("Resend hatasi:", r.status, j && j.message);
        const alan = r.status === 403 || /testing emails|verify a domain/i.test(String((j && j.message) || ""));
        return res.status(alan ? 503 : 502).json({ error: alan ? "E-posta servisi şu an tüm adreslere açık değil. Lütfen destek ile iletişime geçin." : "E-posta gönderilemedi, lütfen biraz sonra tekrar deneyin." });
      }
      return res.status(200).json({ ok: true });
    }

    if (action === "verify" || action === "reset") {
      const y = jetonOku(token);
      if (!y) return res.status(400).json(GECERSIZ);
      const u = await kullaniciBul(y.email);
      if (!u || String(u.id) !== String(y.sub) || parmakIzi(u.pw) !== y.fp) return res.status(400).json(GECERSIZ);
      if (action === "verify") return res.status(200).json({ ok: true, email: y.email });
      const yeni = String(newPassword || "");
      if (yeni.length < 6) return res.status(400).json({ error: "Şifre en az 6 karakter olmalı" });
      const r = await fetch(SB_URL + "/rest/v1/kullanicilar?id=eq." + encodeURIComponent(String(u.id)), { method: "PATCH", headers: h, body: JSON.stringify({ pw: sifreHashle(yeni) }) });
      if (!r.ok) return res.status(500).json({ error: "Şifre güncellenemedi, tekrar deneyin" });
      return res.status(200).json({ ok: true, email: y.email });
    }

    return res.status(400).json({ error: "Geçersiz işlem" });
  } catch (e) {
    return res.status(500).json({ error: "Sunucu hatası" });
  }
}
