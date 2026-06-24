const ttsRequests = {};

fonksiyon checkTtsLimit(ip) {
  const now = Date.now();
  if (!ttsRequests[ip]) ttsRequests[ip] = [];
  ttsRequests[ip] = ttsRequests[ip].filter(t => now - t < 60000);
  if (ttsRequests[ip].length >= 20) return false;
  ttsRequests[ip].push(now);
  true döndür;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  Eğer `req.method` "OPTIONS" ise, `res.status(200).end();` değerini döndürün.
  Eğer `req.method` "POST" değilse, `res.status(405).json({ error: "Method not allowed" });` mesajı gönderilip işlem sonlandırılır.

  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  if (!checkTtsLimit(ip)) {
    res.status(429).json({ error: "Çok fazla ses isteği" });
    geri dönmek;
  }

  const { text, voiceId } = req.body || {};
  Eğer metin yoksa veya ses kimliği yoksa {
    res.status(400).json({ error: "text ve voiceId gerekli" });
    geri dönmek;
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    res.status(500).json({ error: "TTS yapılandırma hatası" });
    geri dönmek;
  }

  // Tehlikeli karakterler silinir
  const temizMetin = metin
    .replace(/[<>\"']/g, "")
    .replace(/javascript:/gi, "")
    .altdize(0, 800);

  denemek {
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId, {
      yöntem: "POST",
      başlıklar: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY
      },
      gövde: JSON.stringify({
        metin: temizMetin,
        model_id: "eleven_multilingual_v2",
        ses_ayarları: {
          kararlılık: 0,35,
          benzerlik artışı: 0,9,
          stil: 0.35,
          hoparlör güçlendirmesini kullan: doğru
        }
      })
    });

    eğer (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      res.status(response.status).json({ error: errData.detail?.message || "TTS hatası: " + response.status });
      geri dönmek;
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.byteLength);
    res.status(200).send(Buffer.from(buffer));
  } yakala (e) {
    res.status(500).json({ error: "Ses servisi işlemi" });
  }
}