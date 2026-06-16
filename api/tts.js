export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  Eğer `req.method` "OPTIONS" ise, `res.status(200).end();` değerini döndürün.
  Eğer `req.method` "POST" değilse, `res.status(405).json({error:"Method not allowed"});` ile yanıtı döndürün.
  denemek {
    const { text, voiceId } = req.body;
    Eğer metin yoksa veya ses kimliği yoksa, res.status(400).json({"metin ve ses kimliği gerekli"}) ile hata mesajı gösterilip işlem sonlandırılır.
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      yöntem: "POST",
      başlıklar: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY
      },
      gövde: JSON.stringify({
        metin: metin.altdize(0, 800),
        model_id: "eleven_multilingual_v2",
        ses_ayarları: { kararlılık: 0,5, benzerlik_artırıcı: 0,75, hız: 0,9 }
      })
    });
    eğer (!response.ok) {
      const err = await response.json().catch(()=>({}));
      res.status(response.status).json({error: err.detail?.message || "TTS hatası: "+response.status});
      geri dönmek;
    }
    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.byteLength);
    res.status(200).send(Buffer.from(buffer));
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}