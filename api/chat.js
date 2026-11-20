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

// Rate limiter - IP bazlı
const requestCounts = {};
const RATE_LIMIT = 30;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();

  if (!requestCounts[ip]) {
    requestCounts[ip] = [];
  }

  requestCounts[ip] = requestCounts[ip].filter(
    t => now - t < RATE_WINDOW
  );

  if (requestCounts[ip].length >= RATE_LIMIT) {
    return false;
  }

  requestCounts[ip].push(now);
  return true;
}

export default async function handler(req, res) {

  // CORS
  res.setHeader("X-Api-Surum", "2");

  if (req.method !== "POST") {
    res.status(405).json({
      error: "Method not allowed"
    });
    return;
  }

  // Rate limit
  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    "unknown";

  if (!checkRateLimit(ip)) {
    res.status(429).json({
      error: "Çok fazla istek. Lütfen bekleyin."
    });
    return;
  }

  const s = oturum(req);
  if (!s) { res.status(401).json({ error: "Giriş gerekli" }); return; }
  if (sinirli("chat:" + s.sub, 40, 60000)) { res.status(429).json({ error: "Çok fazla istek. Lütfen bekleyin." }); return; }
  if (JSON.stringify(req.body || {}).length > 250000) { res.status(413).json({ error: "İstek çok büyük" }); return; }

  // Input validasyonu
  const { messages, system } = req.body || {};

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({
      error: "Geçersiz istek"
    });
    return;
  }

  // 100 mesaj sınırı YOK.
  // Burada messages.length > 100 kontrolü bulunmuyor.

  // API key kontrolü
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({
      error: "API yapılandırma hatası"
    });
    return;
  }

  try {

    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },

        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2000,
          system: system || "",
          messages: messages
        })
      }
    );

    if (!response.ok) {

      const errData =
        await response.json().catch(() => ({}));

      const errMsg =
        errData.error?.message ||
        "API Hata: " + response.status;

      res.status(response.status).json({
        error: errMsg
      });

      return;
    }

    const data = await response.json();

    const text =
      data.content?.[0]?.text || "";

    res.status(200).json({
      content: [
        {
          type: "text",
          text
        }
      ]
    });

  } catch (e) {

    res.status(500).json({
      error: "Sunucu hatası"
    });

  }
}