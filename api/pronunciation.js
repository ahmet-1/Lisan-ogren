export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const { audioBase64, referenceText, language } = req.body || {};
  if (!audioBase64 || !referenceText) {
    res.status(400).json({ error: "Eksik parametre" });
    return;
  }

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION || "eastus";
  if (!key) { res.status(500).json({ error: "Azure key tanımlı değil" }); return; }

  try {
    const config = {
      ReferenceText: referenceText.substring(0, 500),
      GradingSystem: "HundredMark",
      Granularity: "Phoneme",
      Dimension: "Comprehensive",
      EnableMiscue: true
    };
    const header = Buffer.from(JSON.stringify(config)).toString("base64");
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const lang = language || "tr-TR";
    const url = "https://" + region + ".stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=" + lang;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        "Pronunciation-Assessment": header,
        "Accept": "application/json"
      },
      body: audioBuffer
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: "Azure hata: " + errText.substring(0, 200) });
      return;
    }

    const data = await response.json();
    const nbest = data.NBest?.[0] || {};
    const pa = nbest.PronunciationAssessment || {};
    const words = (nbest.Words || []).map(w => ({
      word: w.Word,
      accuracyScore: w.PronunciationAssessment?.AccuracyScore ?? null,
      errorType: w.PronunciationAssessment?.ErrorType || "None"
    }));

    res.status(200).json({
      recognizedText: data.DisplayText || "",
      accuracyScore: pa.AccuracyScore ?? null,
      fluencyScore: pa.FluencyScore ?? null,
      completenessScore: pa.CompletenessScore ?? null,
      pronScore: pa.PronScore ?? null,
      words
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}