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
      var email = req.query.email;
      var url = SUPA_URL + "/rest/v1/kullanicilar" + (email ? "?email=eq." + encodeURIComponent(email) : "?order=created_at.desc");
      var r = await fetch(url, { headers: { "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY } });
      var data = await r.json();
      res.status(200).json(email ? (data && data[0] ? data[0] : null) : (data || []));

    } aksi takdirde eğer (req.method === "POST") {
      var user = istek gövdesi;
      var r2 = getirmeyi bekliyor(SUPA_URL + "/rest/v1/kullanicilar", {
        yöntem: "POST",
        başlıklar: { "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY, "Content-Type": "application/json", "Prefer": "return=representation" },
        gövde: JSON.stringify({
          id: String(user.id), ad: user.ad, email: user.email,
          tel: kullanıcı.tel || "", şehir: user.sehir || "", dogum: user.dogum || "",
          pw: user.pw, plan: user.plan || "Deneme", durum: user.durum || "Deneme",
          deneme_başlangıcı: Dize(kullanıcı.denemebaşlangıcı || Tarih.şimdi()),
          created_at: new Date().toISOString()
        })
      });
      var data2 = await r2.json();
      res.status(200).json(data2 && data2[0] ? data2[0] : {});

    } aksi takdirde eğer (req.method === "PUT") {
      var gövde = istek gövdesi;
      var id = body.id;
      var updates = {};
      Object.keys(body).forEach(function(k) { if (k !== "id") updates[k] = body[k]; });
      await fetch(SUPA_URL + "/rest/v1/kullanicilar?id=eq." + id, {
        yöntem: "PATCH",
        başlıklar: { "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY, "Content-Type": "application/json" },
        gövde: JSON.stringify(güncellemeler)
      });
      res.status(200).json({ ok: true });

    } aksi takdirde eğer (req.method === "DELETE") {
      var delId = req.query.id;
      fetch'i bekliyor(SUPA_URL + "/rest/v1/kullanicilar?id=eq." + delId, {
        yöntem: "SİL",
        başlıklar: { "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY }
      });
      res.status(200).json({ ok: true });
    } başka {
      res.status(405).json({ error: "Method not allowed" });
    }
  } yakala (e) {
    res.status(500).json({ error: e.message });
  }
}