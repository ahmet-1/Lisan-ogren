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

  const SUPA_URL = process.env.SUPABASE_URL;
  const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPA_URL || !SUPA_KEY) {
    res.status(500).json({
      error: "Supabase yapılandırması eksik"
    });
    return;
  }

  const headers = {
    apikey: SUPA_KEY,
    Authorization: "Bearer " + SUPA_KEY,
    "Content-Type": "application/json"
  };

  const s = oturum(req);
  if (!s) { res.status(401).json({ error: "Giriş gerekli" }); return; }
  const admin = s.role === "admin";
  const hedef = String((req.method === "GET" ? (req.query || {}).userId : (req.body || {}).userId) || "");
  if (!admin && req.method !== "DELETE" && hedef !== String(s.sub)) { res.status(403).json({ error: "Yetkisiz" }); return; }
  if (sinirli("veri:" + s.sub, 300, 60000)) { res.status(429).json({ error: "Çok fazla istek. Biraz bekleyin." }); return; }

  try {
    /*
     * ============================================================
     * GET
     * ============================================================
     *
     * Supabase'deki bütün mesajlar alınır.
     *
     * Sıralama:
     *   created_at ASC
     *   id ASC
     *
     * Böylece aynı milisaniyede oluşan mesajlarda bile sıra
     * deterministik kalır.
     *
     * created_at MUTLAKA istemciye gönderilir.
     */

    if (req.method === "GET") {
      const {
        userId,
        dilId,
        hocaId
      } = req.query;

      if (!userId || !dilId || !hocaId) {
        res.status(400).json({
          error: "Eksik parametre"
        });
        return;
      }

      const url =
        SUPA_URL +
        "/rest/v1/ders_mesajlar" +
        "?user_id=eq." +
        encodeURIComponent(String(userId)) +
        "&dil_id=eq." +
        encodeURIComponent(String(dilId)) +
        "&hoca_id=eq." +
        encodeURIComponent(String(hocaId)) +
        "&select=id,client_id,role,content,created_at" +
        "&order=created_at.asc,id.asc" +
        "&limit=5000";

      const response = await fetch(url, {
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();

        res.status(500).json({
          error: "Mesajlar alınamadı",
          details: errorText
        });
        return;
      }

      const data = await response.json();

      const sonuc = (data || [])
        .filter(message =>
          message &&
          typeof message.role === "string" &&
          typeof message.content === "string"
        )
        .map(message => ({
          id:
            typeof message.client_id === "string" &&
            message.client_id.trim()
              ? message.client_id
              : "db_" + String(message.id),

          r: message.role,
          t: message.content,

          createdAt:
            message.created_at || null
        }));

      res.status(200).json(sonuc);
      return;
    }

    /*
     * ============================================================
     * POST
     * ============================================================
     *
     * Sadece yeni mesajlar gönderilir.
     *
     * client_id benzersiz olduğu için aynı mesaj ikinci kez
     * kaydedilmez.
     */

    if (req.method === "POST") {
      const {
        userId,
        dilId,
        hocaId,
        messages
      } = req.body || {};

      if (!userId || !dilId || !hocaId) {
        res.status(400).json({
          error: "Eksik parametre"
        });
        return;
      }

      if (!Array.isArray(messages)) {
        res.status(400).json({
          error: "Geçersiz messages verisi"
        });
        return;
      }

      const temizMesajlar = messages.filter(message =>
        message &&
        typeof message.id === "string" &&
        message.id.trim() !== "" &&
        typeof message.r === "string" &&
        message.r.trim() !== "" &&
        typeof message.t === "string" &&
        message.t.trim() !== ""
      );

      if (temizMesajlar.length === 0) {
        res.status(200).json({
          ok: true,
          saved: 0
        });
        return;
      }

      const rows = temizMesajlar.map(message => ({
        user_id: String(userId),
        dil_id: String(dilId),
        hoca_id: String(hocaId),

        client_id: String(message.id),

        role: String(message.r),
        content: String(message.t),

        /*
         * İstemcide oluşturulmuş createdAt varsa onu koru.
         * Yoksa Supabase kendi default timestamp değerini üretir.
         */
        ...(message.createdAt
          ? {
              created_at: String(message.createdAt)
            }
          : {})
      }));

      const response = await fetch(
        SUPA_URL +
        "/rest/v1/ders_mesajlar" +
        "?on_conflict=user_id,dil_id,hoca_id,client_id",
        {
          method: "POST",

          headers: {
            ...headers,

            Prefer:
              "resolution=ignore-duplicates,return=minimal"
          },

          body: JSON.stringify(rows)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        res.status(500).json({
          error: "Mesajlar kaydedilemedi",
          details: errorText
        });
        return;
      }

      res.status(200).json({
        ok: true,
        saved: rows.length
      });

      return;
    }

    res.status(405).json({
      error: "Method not allowed"
    });

  } catch (error) {
    res.status(500).json({
      error:
        error?.message ||
        "Sunucu hatası"
    });
  }
}
