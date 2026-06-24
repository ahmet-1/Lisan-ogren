const ttsRequests = {};

function checkTtsLimit(ip) {
  const now = Date.now();
  if (!ttsRequests[ip]) ttsRequests[ip] = [];
  ttsRequests[ip] = ttsRequests[ip].filter(t => now - t < 60000);
  if (ttsRequests[ip].length >= 20) return false;
  ttsRequests[ip].push(now);
  return true;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  if (!checkTtsLimit(ip)) {
    res.status(429).json({ error: "Çok fazla ses isteği" });
    return;
  }

  const { text, voiceId } = req.body || {};
  if (!text || !voiceId) {
    res.status(400).json({ error: "text ve voiceId gerekli" });
    return;
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    res.status(500).json({ error: "TTS yapılandırma hatası" });
    return;
  }

  // Tehlikeli karakterleri temizle
  const temizMetin = text
    .replace(/[<>\"']/g, "")
    .replace(/javascript:/gi, "")
    .substring(0, 800);

  try {
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: temizMetin,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.9,
          style: 0.35,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      res.status(response.status).json({ error: errData.detail?.message || "TTS hata: " + response.status });
      return;
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.byteLength);
    res.status(200).send(Buffer.from(buffer));
  } catch (e) {
    res.status(500).json({ error: "Ses servisi hatası" });
  }
}