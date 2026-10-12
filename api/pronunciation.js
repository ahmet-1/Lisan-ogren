export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { audioBase64, referenceText, language, mimeType } = req.body || {};
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION || 'eastus';
    if (!key) return res.status(500).json({ error: 'Azure Speech API anahtarı eksik.' });
    if (!audioBase64) return res.status(400).json({ error: 'Ses kaydı alınamadı.' });

    const lang = language || 'ar-SA';
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const contentType = (mimeType && mimeType.includes('webm')) ? 'audio/webm; codecs=opus'
      : (mimeType && mimeType.includes('mp4')) ? 'audio/mp4'
      : 'audio/wav; codecs=audio/pcm; samplerate=16000';
    const url = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${lang}&format=detailed`;
    const temizle = (t) => (t || '').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?؟،]/g, '').trim();

    const azure = async (extra) => {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': contentType, 'Ocp-Apim-Subscription-Key': key, ...extra },
        body: audioBuffer
      });
      const t = await r.text();
      let j = null;
      try { j = JSON.parse(t); } catch (e) {}
      return { status: r.status, json: j };
    };

    // 1) Referans verilmediyse önce öğrencinin ne söylediğini anla
    let ref = temizle(referenceText);
    if (!ref) {
      const a = await azure({});
      if (a.status === 401 || a.status === 403) {
        return res.status(200).json({ error: 'Azure anahtarı reddedildi (' + a.status + ').' });
      }
      const n = a.json && a.json.NBest && a.json.NBest[0];
      ref = temizle(n ? (n.Display || n.Lexical || '') : '');
      if (!ref) {
        const durum = (a.json && a.json.RecognitionStatus) || a.status;
        return res.status(200).json({ error: 'Ne söylediğiniz anlaşılamadı. Mikrofona yakın ve net söyleyin. (Azure: ' + durum + ')' });
      }
    }

    // 2) Söylenen metne göre telaffuzu puanla
    const pronConfig = { ReferenceText: ref, GradingSystem: 'HundredMark', Granularity: 'Word', Dimension: 'Comprehensive', EnableMiscue: true };
    const header = Buffer.from(JSON.stringify(pronConfig)).toString('base64');
    const b = await azure({ 'Pronunciation-Assessment': header });
    const nbest = b.json && b.json.NBest && b.json.NBest[0];
    if (!nbest) {
      return res.status(200).json({ error: 'Telaffuz puanı alınamadı.', okunanMetin: ref });
    }
    const pa = nbest.PronunciationAssessment || nbest;
    if (typeof pa.PronScore !== 'number') {
      return res.status(200).json({ error: 'Bu dil için Azure telaffuz puanı vermiyor olabilir. Söylediğiniz: ' + ref, okunanMetin: ref });
    }

    const words = (nbest.Words || []).map(w => {
      const wa = w.PronunciationAssessment || w;
      const wScore = typeof wa.AccuracyScore === 'number' ? wa.AccuracyScore : 0;
      const errorType = wa.ErrorType || 'None';
      let durum = 'dogru', durumMesaj = 'Doğru';
      if (errorType === 'Mispronunciation' || wScore < 60) { durum = 'yanlis'; durumMesaj = 'Hatalı Telaffuz'; }
      else if (errorType === 'Omission') { durum = 'atlanmis'; durumMesaj = 'Atlandı / Okunmadı'; }
      else if (wScore < 80) { durum = 'orta'; durumMesaj = 'Geliştirilebilir'; }
      return { word: w.Word, accuracyScore: Math.round(wScore), durum, durumMesaj };
    });

    return res.status(200).json({
      pronScore: Math.round(pa.PronScore || 0),
      accuracyScore: Math.round(pa.AccuracyScore || 0),
      fluencyScore: Math.round(pa.FluencyScore || 0),
      words,
      hataliKelimeler: words.filter(w => w.durum === 'yanlis' || w.durum === 'atlanmis'),
      okunanMetin: ref
    });
  } catch (err) {
    return res.status(200).json({ error: 'Değerlendirme yapılamadı, lütfen tekrar deneyin.' });
  }
}
