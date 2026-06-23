export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  eğer (req.method === "OPTIONS") {
    res.status(200).end();
    geri dönmek;
  }
  eğer (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    geri dönmek;
  }
  denemek {
    const { audioBase64, referenceText, language } = req.body;
    Eğer (!audioBase64 || !referenceText) ise {
      res.status(400).json({ error: "audioBase64 ve referenceText gerekli" });
      geri dönmek;
    }
    const region = process.env.AZURE_SPEECH_REGION || "eastus";
    sabit anahtar = process.env.AZURE_SPEECH_KEY;
    eğer (anahtar) değilse {
      res.status(500).json({ error: "Azure key tanimli değil" });
      geri dönmek;
    }
    sabit assessmentConfig = {
      ReferansMetni: referansMetni,
      Notlandırma Sistemi: "Yüz Puan",
      Granülerlik: "Fonem",
      Boyut: "Kapsamlı",
      EnableMiscue: true
    };
    const pronAssessmentHeader = Buffer.from(JSON.stringify(assessmentConfig)).toString("base64");
    const audioBuffer = Buffer.from(audioBase64, "base64");
    sabit dil = dil || "tr-TR";
    const url = "https://" + region + ".stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=" + lang;
    sabit yanıt = await fetch(url, {
      yöntem: "POST",
      başlıklar: {
        "Ocp-Apim-Subscription-Key": anahtar,
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        "Telaffuz Değerlendirmesi": pronAssessmentHeader,
        "Kabul Et": "application/json"
      },
      gövde: ses arabelleği
    });
    eğer (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: "Azure hatası: " + errText });
      geri dönmek;
    }
    const data = await response.json();
    const nbest = data.NBest && data.NBest[0] ? data.NBest[0] : null;
    const pa = nbest && nbest.PronunciationAssessment ? nbest.PronunciationAssessment : {};
    const words = nbest && nbest.Words ? nbest.Words : [];
    sabit sonuç = {
      tanınanMetin: data.DisplayText || "",
      doğrulukSkoru: pa.AccuracyScore !== undefined ? pa.AccuracyScore : null,
      akıcılıkSkoru: pa.AkıcılıkSkoru !== tanımsız ? pa.AkıcılıkSkoru : null,
      Tamamlanma Puanı: pa.CompletenessScore !== undefined ? pa.CompletenessScore : null,
      pronScore: pa.PronScore !== undefined ? pa.PronScore : null,
      kelimeler: kelimeler.map(fonksiyon (w) {
        const wpa = w.PronunciationAssessment || {};
        geri dönmek {
          kelime: w.Word,
          accuracyScore: wpa.AccuracyScore !== undefined ? wpa.AccuracyScore : null,
          hataTürü: wpa.ErrorType || "Yok"
        };
      })
    };
    res.status(200).json(result);
  } yakala (e) {
    res.status(500).json({ error: e.message });
  }
}