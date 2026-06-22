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
    const { audioBase64, referenceText, language } = req.body;
    if (!audioBase64 || !referenceText) {
      res.status(400).json({ error: "audioBase64 ve referenceText gerekli" });
      return;
    }
    const region = process.env.AZURE_SPEECH_REGION || "eastus";
    const key = process.env.AZURE_SPEECH_KEY;
    if (!key) {
      res.status(500).json({ error: "Azure key tanimli degil" });
      return;
    }
    const assessmentConfig = {
      ReferenceText: referenceText,
      GradingSystem: "HundredMark",
      Granularity: "Phoneme",
      Dimension: "Comprehensive",
      EnableMiscue: true
    };
    const pronAssessmentHeader = Buffer.from(JSON.stringify(assessmentConfig)).toString("base64");
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const lang = language || "tr-TR";
    const url = "https://" + region + ".stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=" + lang;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        "Pronunciation-Assessment": pronAssessmentHeader,
        "Accept": "application/json"
      },
      body: audioBuffer
    });
    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: "Azure hata: " + errText });
      return;
    }
    const data = await response.json();
    const nbest = data.NBest && data.NBest[0] ? data.NBest[0] : null;
    const pa = nbest && nbest.PronunciationAssessment ? nbest.PronunciationAssessment : {};
    const words = nbest && nbest.Words ? nbest.Words : [];
    const result = {
      recognizedText: data.DisplayText || "",
      accuracyScore: pa.AccuracyScore !== undefined ? pa.AccuracyScore : null,
      fluencyScore: pa.FluencyScore !== undefined ? pa.FluencyScore : null,
      completenessScore: pa.CompletenessScore !== undefined ? pa.CompletenessScore : null,
      pronScore: pa.PronScore !== undefined ? pa.PronScore : null,
      words: words.map(function (w) {
        const wpa = w.PronunciationAssessment || {};
        return {
          word: w.Word,
          accuracyScore: wpa.AccuracyScore !== undefined ? wpa.AccuracyScore : null,
          errorType: wpa.ErrorType || "None"
        };
      })
    };
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}