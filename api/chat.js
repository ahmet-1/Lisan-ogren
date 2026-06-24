// Rate limiter - IP bazlı
const requestCounts = {};
const RATE_LIMIT = 30; // dakikada max 30 istek
const RATE_WINDOW = 60 * 1000; // 1 dakika

function checkRateLimit(ip) {
  const now = Date.now();
  if (!requestCounts[ip]) requestCounts[ip] = [];
  requestCounts[ip] = requestCounts[ip].filter(t => now - t < RATE_WINDOW);
  if (requestCounts[ip].length >= RATE_LIMIT) return false;
  requestCounts[ip].push(now);
  return true;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  // Rate limit
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: "Çok fazla istek. Lütfen bekleyin." });
    return;
  }

  // Input validasyonu
  const { messages, system } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Geçersiz istek" });
    return;
  }
  if (messages.length > 100) {
    res.status(400).json({ error: "Çok fazla mesaj" });
    return;
  }

  // API key kontrolü
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: "API yapılandırma hatası" });
    return;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: system || "",
        messages: messages
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || "API Hata: " + response.status;
      res.status(response.status).json({ error: errMsg });
      return;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    res.status(200).json({ content: [{ type: "text", text }] });
  } catch (e) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
}