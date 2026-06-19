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
      res.status(400).json({
        error: "audioBase64 ve referenceText gerekli"
      });
      return;
    }

    const region = process.env.AZURE_SPEECH_REGION || "eastus";
    const key = process.env.AZURE_SPEECH_KEY;

    if (!key) {
      res.status(500).json({ error: "Azure key tanımlı değil" });
      return;
    }

    const pronAssessmentParams = Buffer.from(
      JSON.stringify({
        ReferenceText: referenceText,
        GradingSystem: "HundredMark",
        Granularity: "Phoneme",
        Dimension: "Comprehensive",
        EnableMiscue: true
      })
    ).toString("base64");

    const audioBuffer = Buffer.from(audioBase64, "base64");

    const url =
      `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${language || "tr-TR"}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        "Pronunciation-Assessment": pronAssessmentParams,
        "Accept": "application/json"
      },
      body: audioBuffer
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({
        error: "Azure hatası: " + errText
      });
      return;
    }

    const data = await response.json();
    const nbest = data.NBest?.[0];

    const result = {
      recognizedText: data.DisplayText || "",
      accuracyScore:
        nbest?.PronunciationAssessment?.AccuracyScore ?? null,
      fluencyScore:
        nbest?.PronunciationAssessment?.FluencyScore ?? null,
      completenessScore:
        nbest?.PronunciationAssessment?.CompletenessScore ?? null,
      pronScore:
        nbest?.PronunciationAssessment?.PronScore ?? null,
      words: (nbest?.Words || []).map(w => ({
        word: w.Word,
        accuracyScore:
          w.PronunciationAssessment?.AccuracyScore ?? null,
        errorType:
          w.PronunciationAssessment?.ErrorType || "None"
      }))
    };

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}