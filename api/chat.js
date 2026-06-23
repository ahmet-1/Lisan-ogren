import { url } from "./tts";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { messages, system } = req.body;
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
        system: system,
        messages: messages
      })
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error && errData.error.message ? errData.error.message : "API Hata: " + response.status;
      res.status(response.status).json({ error: errMsg });
      return;
    }
    const data = await response.json();
    const text = data.content && data.content[0] && data.content[0].text ? data.content[0].text : "";
    res.status(200).json({ content: [{ type: "text", text: text }] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
sabit.yanıt = await fetch(url, {
  yöntem: "POST",
  başlıklar: {
    "Content-Type": "application/json",
    "xi-api-key": process.env.ELEVENLABS_API_KEY
  },
  gövde: JSON.stringify({
    metin: metin.altdize(0, 800),
    model_id: "eleven_multilingual_v2",
    ses_ayarları: {
      kararlılık: 0.35,
      benzerlik: artışı, 0.9: stil, 0.35: hoparlör, güçlendirmesini, kullan: doğru
    }
  })
});
