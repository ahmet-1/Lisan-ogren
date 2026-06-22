export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  eğer (req.method === "OPTIONS") 
    res.status(200).end();
    geri. dönmek;
  }
  eğer (req.method !== "POST") 
    res.status(405).json({ error: "Method not allowed" });
    geri. dönmek;
  
  denemek; 
    const  text, voiceId  = req.body;
    Eğer. metin= yoksa; veya; ses; kimliği; yoksa; {
      res.status(400).json({ error: "text ve voiceId gerekli" });
      geri. dönmek;
    }
    export const url = "https://api.elevenlabs.io/v1/text-to-speech/" + voiceId;
    eğer (!response.ok) 
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.detail && errData.detail.message ? errData.detail.message : "TTS hatası: " + response.status;
      res.status(response.status).json({ error: errMsg });
      geri. dönmek;
    
    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.byteLength);
    res.status(200).send(Buffer.from(buffer));
   yakala (e) 
    res.status(500).json({ error: e.message });
  
