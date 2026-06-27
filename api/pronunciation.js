export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  var body = req.body || {};
  var audioBase64 = body.audioBase64;
  var referenceText = body.referenceText;
  var language = body.language;

  if (!audioBase64 || !referenceText) {
    res.status(400).json({ error: "Eksik parametre" });
    return;
  }

  var key = process.env.AZURE_SPEECH_KEY;
  var region = process.env.AZURE_SPEECH_REGION || "eastus";

  if (!key) {
    res.status(500).json({ error: "Azure key tanimli degil" });
    return;
  }

  try {
    var config = {
      ReferenceText: referenceText.substring(0, 500),
      GradingSystem: "HundredMark",
      Granularity: "Phoneme",
      Dimension: "Comprehensive",
      EnableMiscue: true
    };
    var header = Buffer.from(JSON.stringify(config)).toString("base64");
    var audioBuffer = Buffer.from(audioBase64, "base64");
    var lang = language || "tr-TR";
    var url = "https://" + region + ".stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=" + lang;

    var response = await fetch(url, {
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
      var errText = await response.text();
      res.status(response.status).json({ error: "Azure hata: " + errText.substring(0, 200) });
      return;
    }

    var data = await response.json();
    var nbest = (data.NBest && data.NBest[0]) ? data.NBest[0] : {};
    var pa = nbest.PronunciationAssessment || {};
    var words = (nbest.Words || []).map(function(w) {
      var wpa = w.PronunciationAssessment || {};
      return { word: w.Word, accuracyScore: wpa.AccuracyScore !== undefined ? wpa.AccuracyScore : null, errorType: wpa.ErrorType || "None" };
    });

    res.status(200).json({
      recognizedText: data.DisplayText || "",
      accuracyScore: pa.AccuracyScore !== undefined ? pa.AccuracyScore : null,
      fluencyScore: pa.FluencyScore !== undefined ? pa.FluencyScore : null,
      completenessScore: pa.CompletenessScore !== undefined ? pa.CompletenessScore : null,
      pronScore: pa.PronScore !== undefined ? pa.PronScore : null,
      words: words
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}