import { dbFetch } from "./db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  Eğer `req.method` "OPTIONS" ise, `res.status(200).end();` değerini döndürün.

  denemek {
    if (req.method === "GET") {
      const { email } = req.query;
      eğer (e-posta) {
        const data = await dbFetch("kullanicilar?email=eq." + encodeURIComponent(email));
        res.status(200).json(data?.[0] || null);
      } başka {
        const data = await dbFetch("kullanicilar?order=created_at.desc");
        res.status(200).json(data || []);
      }

    } aksi takdirde eğer (req.method === "POST") {
      sabit kullanıcı = istek gövdesi;
      const data = await dbFetch("kullanıcılar", "POST", {
        id: user.id,
        reklam: kullanıcı.reklam,
        e-posta: kullanıcı.e-posta,
        tel: user.tel,
        şehir: kullanıcı.şehir,
        şifre: kullanıcı şifresi,
        plan: user.plan || "Deneme",
        durum: user.durum || "Deneme",
        deneme_başlangıcı: kullanıcı.denemeBaşlangıcı,
        created_at: new Date().toISOString()
      });
      res.status(200).json(data?.[0] || {});

    } aksi takdirde eğer (req.method === "PUT") {
      const { id, ...güncellemeler } = req.body;
      await fetch(process.env.SUPABASE_URL + "/rest/v1/kullanicilar?id=eq." + id, {
        yöntem: "PATCH",
        başlıklar: {
          "Content-Type": "application/json",
          "apikey": process.env.SUPABASE_SERVICE_KEY,
          "Yetkilendirme": "Taşıyıcı" + process.env.SUPABASE_SERVICE_KEY
        },
        gövde: JSON.stringify(güncellemeler)
      });
      res.status(200).json({ ok: true });

    } aksi takdirde eğer (req.method === "DELETE") {
      const { id } = req.query;
      await fetch(process.env.SUPABASE_URL + "/rest/v1/kullanicilar?id=eq." + id, {
        yöntem: "SİL",
        başlıklar: {
          "apikey": process.env.SUPABASE_SERVICE_KEY,
          "Yetkilendirme": "Taşıyıcı" + process.env.SUPABASE_SERVICE_KEY
        }
      });
      res.status(200).json({ ok: true });
    }
  } yakala (e) {
    res.status(500).json({ error: e.message });
  }
}