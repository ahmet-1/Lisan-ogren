cat > /mnt/user-data/outputs/api/tts.js << 'EOF'
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({error:"Method not allowed"}); return; }
  try {
    const { text, voiceId } = req.body;
    if (!text || !voiceId) { res.status(400).json({error:"text ve voiceId gerekli"}); return; }
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text.substring(0, 800),
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: 0.9 }
      })
    });
    if (!response.ok) {
      const err = await response.json().catch(()=>({}));
      res.status(response.status).json({error: err.detail?.message || "TTS hata: "+response.status});
      return;
    }
    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.byteLength);
    res.status(200).send(Buffer.from(buffer));
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}