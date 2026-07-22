const tokens = {};
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }
  const { action, email, token, newPassword } = req.body || {};
  if (action === "send") {
    if (!email) { res.status(400).json({ error: "E-posta gerekli" }); return; }
    if (!process.env.RESEND_API_KEY) { res.status(500).json({ error: "Email servisi yapilandirilmamis" }); return; }
    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    tokens[resetToken] = { email, expires: Date.now() + 3600000 };
    const resetLink = "https://lisan-ogren-71l1.vercel.app?reset=" + resetToken;
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.RESEND_API_KEY },
        body: JSON.stringify({
          from: "Lisan Ogren <onboarding@resend.dev>",
          to: [email],
          subject: "Sifre Sifirlama - Lisan Ogren",
          html: "<div style='font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;'><h2 style='color:#2e7d32;'>Lisan Ogren - Sifre Sifirlama</h2><p>Sifre sifirlama talebiniz alindi.</p><a href='" + resetLink + "' style='display:inline-block;padding:12px 24px;background:#2e7d32;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;margin:16px 0;'>Sifremi Sifirla</a><p style='color:#999;font-size:12px;'>Bu e-postay talep etmediginiz takdirde dikkate almayiniz.</p></div>"
        })
      });
      if (!r.ok) { const err = await r.json().catch(()=>({})); res.status(500).json({ error: "Email gonderilemedi: " + (err.message || r.status) }); return; }
      res.status(200).json({ ok: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  } else if (action === "verify") {
    if (!token) { res.status(400).json({ error: "Token gerekli" }); return; }
    const data = tokens[token];
    if (!data) { res.status(400).json({ error: "Gecersiz token" }); return; }
    if (Date.now() > data.expires) { delete tokens[token]; res.status(400).json({ error: "Token suresi dolmus" }); return; }
    res.status(200).json({ ok: true, email: data.email });
  } else if (action === "reset") {
    if (!token || !newPassword) { res.status(400).json({ error: "Eksik parametre" }); return; }
    const tdata = tokens[token];
    if (!tdata) { res.status(400).json({ error: "Gecersiz token" }); return; }
    if (Date.now() > tdata.expires) { delete tokens[token]; res.status(400).json({ error: "Token suresi dolmus" }); return; }
    const temail = tdata.email;
    delete tokens[token];
    res.status(200).json({ ok: true, email: temail });
  } else {
    res.status(400).json({ error: "Gecersiz action" });
  }
}