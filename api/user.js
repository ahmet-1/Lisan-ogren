export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  Eğer `req.method` "OPTIONS" ise, `res.status(200).end();` değerini döndürün.

  const SUPA_URL = process.env.SUPABASE_URL;
  const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY;

  Eğer (!SUPA_URL veya !SUPA_KEY) yoksa {
    res.status(200).json([]);
    geri dönmek;
  }

  denemek {
    if (req.method === "GET") {
      const { email } = req.query;
      const url = SUPA_URL + "/rest/v1/kullanicilar" + (email ? "?email=eq." + encodeURIComponent(email) : "?order=created_at.desc");
      sabit r = await fetch(url, {
        başlıklar: { "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY }
      });
      const data = await r.json();
      res.status(200).json(email ? (data?.[0] || null) : (data || []));

    } aksi takdirde eğer (req.method === "POST") {
      sabit kullanıcı = istek gövdesi;
      const r = await fetch(SUPA_URL + "/rest/v1/kullanicilar", {
        yöntem: "POST",
        başlıklar: { "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY, "Content-Type": "application/json", "Prefer": "return=representation" },
        gövde: JSON.stringify({
          id: String(user.id), ad: user.ad, email: user.email,
          tel: kullanıcı.tel || "", şehir: user.sehir || "",
          pw: user.pw, plan: user.plan || "Deneme", durum: user.durum || "Deneme",
          deneme_başlangıcı: Dize(kullanıcı.denemebaşlangıcı || Tarih.şimdi()),
          created_at: new Date().toISOString()
        })
      });
      const data = await r.json();
      res.status(200).json(data?.[0] || {});

    } aksi takdirde eğer (req.method === "PUT") {
      const { id, ...güncellemeler } = req.body;
      await fetch(SUPA_URL + "/rest/v1/kullanicilar?id=eq." + id, {
        yöntem: "PATCH",
        başlıklar: { "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY, "Content-Type": "application/json" },
        gövde: JSON.stringify(güncellemeler)
      });
      res.status(200).json({ ok: true });

    } aksi takdirde eğer (req.method === "DELETE") {
      const { id } = req.query;
      await fetch(SUPA_URL + "/rest/v1/kullanicilar?id=eq." + id, {
        yöntem: "SİL",
        başlıklar: { "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY }
      });
      res.status(200).json({ ok: true });
    }
  } yakala (e) {
    res.status(500).json({ error: e.message });
  }
}