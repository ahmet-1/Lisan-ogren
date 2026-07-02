cat > /mnt/user-data/outputs/Lisan-Ogren-Guncel/api/users.js << 'EOF'
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!URL || !KEY) { res.status(200).json([]); return; }

  const h = { "apikey": KEY, "Authorization": "Bearer " + KEY, "Content-Type": "application/json" };

  try {
    if (req.method === "GET") {
      const email = req.query.email;
      const r = await fetch(URL + "/rest/v1/kullanicilar" + (email ? "?email=eq." + encodeURIComponent(email) : "?order=created_at.desc"), { headers: h });
      const d = await r.json();
      res.status(200).json(email ? (d[0] || null) : (d || []));

    } else if (req.method === "POST") {
      const u = req.body;
      const r = await fetch(URL + "/rest/v1/kullanicilar", {
        method: "POST",
        headers: { ...h, "Prefer": "return=representation,resolution=merge-duplicates" },
        body: JSON.stringify({ id: String(u.id || Date.now()), ad: u.ad, email: u.email, tel: u.tel || "", sehir: u.sehir || "", dogum: u.dogum || "", pw: u.pw, plan: u.plan || "Deneme", durum: u.durum || "Deneme", trial_start: String(u.trialStart || Date.now()), odeme: u.odeme || "0", created_at: new Date().toISOString() })
      });
      const d = await r.json();
      res.status(200).json(d[0] || {});

    } else if (req.method === "PUT") {
      const { id, ...updates } = req.body;
      await fetch(URL + "/rest/v1/kullanicilar?id=eq." + id, { method: "PATCH", headers: h, body: JSON.stringify(updates) });
      res.status(200).json({ ok: true });

    } else if (req.method === "DELETE") {
      await fetch(URL + "/rest/v1/kullanicilar?id=eq." + req.query.id, { method: "DELETE", headers: h });
      res.status(200).json({ ok: true });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
EOF
echo "users.js OK"
node --check /mnt/user-data/outputs/Lisan-Ogren-Guncel/api/users.js && echo "SYNTAX OK"