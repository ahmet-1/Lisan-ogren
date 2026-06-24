export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  Eğer `req.method` "OPTIONS" ise, `res.status(200).end();` değerini döndürün.
  Eğer `req.method` "POST" değilse, `res.status(405).json({ error: "Method not allowed" });` mesajı gönderilip işlem sonlandırılır.

  const { audioBase64, referenceText, language } = req.body || {};
  Eğer (!audioBase64 || !referenceText) ise {
    res.status(400).json({ error: "Eksik parametre" });
    geri dönmek;
  }

  sabit anahtar = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION || "eastus";
  if (!key) { res.status(500).json({ error: "Azure key tanımlı değil" }); geri dönmek; }

  denemek {
    sabit yapılandırma = {
      ReferansMetni: referenceText.substring(0, 500),
      Notlandırma Sistemi: "Yüz Puan",
      Granülerlik: "Fonem",
      Boyut: "Kapsamlı",
      EnableMiscue: true
    };
    const header = Buffer.from(JSON.stringify(config)).toString("base64");
    const audioBuffer = Buffer.from(audioBase64, "base64");
    sabit dil = dil || "tr-TR";
    const url = "https://" + region + ".stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=" + lang;

    sabit yanıt = await fetch(url, {
      yöntem: "POST",
      başlıklar: {
        "Ocp-Apim-Subscription-Key": anahtar,
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        "Telaffuz Değerlendirmesi": başlık,
        "Kabul Et": "application/json"
      },
      gövde: ses arabelleği
    });

    eğer (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: "Azure hatası: " + errText.substring(0, 200) });
      geri dönmek;
    }

    const data = await response.json();
    const nbest = data.NBest?.[0] || {};
    const pa = nbest.PronunciationAssessment || {};
    sabit kelimeler = (nbest.Words || []).map(w => ({
      kelime: w.Word,
      accuracyScore: w.PronunciationAssessment?.AccuracyScore ?? null,
      hataTürü: w.TelaffuzDeğerlendirmesi?.HataTürü || "Yok"
    }));

    res.status(200).json({
      tanınanMetin: data.DisplayText || "",
      doğrulukSkoru: pa.AccuracyScore ?? null,
      akıcılıkSkoru: pa.AkıcılıkSkoru ?? null,
      TamamlamaSkoru: pa.TamamlamaSkoru ?? null,
      pronScore: pa.PronScore ?? null,
      kelimeler
    });
  } yakala (e) {
    res.status(500).json({ error: e.message });
  }
}