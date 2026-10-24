export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  res.setHeader('X-Ses-Surum', '3');
  try {
    const body = req.body || {};
    const query = req.query || {};
    const text = String(body.text || query.text || 'Merhaba').slice(0, 5000);
    const language = String(body.language || query.language || 'ar-SA');
    const gender = body.gender || query.gender || 'male';
    const voiceId = body.voiceId || query.voiceId;
    const engine = String(body.engine || query.engine || '');
    const hizHam = parseFloat(body.hiz || query.hiz);
    const hiz = Number.isFinite(hizHam) ? Math.min(1.2, Math.max(0.6, hizHam)) : null;

    let elevenHata = '';
    const elevenDene = async () => {
      const key = process.env.ELEVENLABS_API_KEY;
      if (!voiceId || !key) { elevenHata = voiceId ? 'key-yok' : 'voiceId-yok'; return null; }
      const dene = (ayar) => fetch('https://api.elevenlabs.io/v1/text-to-speech/' + encodeURIComponent(voiceId), {
        method: 'POST',
        headers: { 'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: ayar })
      });
      try {
        const temel = { stability: 0.5, similarity_boost: 0.75 };
        let r = hiz ? await dene({ ...temel, speed: hiz }) : await dene(temel);
        if (!r.ok && hiz) r = await dene(temel);
        if (r.ok) return Buffer.from(await r.arrayBuffer());
        elevenHata = 'HTTP ' + r.status + ' ' + (await r.text().catch(() => '')).slice(0, 150);
      } catch (e) {
        elevenHata = 'istek-hatasi ' + String((e && e.message) || e).slice(0, 100);
      }
      return null;
    };

    const SESLER = {
      ar: ['ar-SA-ZariyahNeural', 'ar-SA-HamedNeural'],
      en: ['en-US-JennyNeural', 'en-US-GuyNeural'],
      tr: ['tr-TR-EmelNeural', 'tr-TR-AhmetNeural'],
      de: ['de-DE-KatjaNeural', 'de-DE-ConradNeural'],
      fr: ['fr-FR-DeniseNeural', 'fr-FR-HenriNeural'],
      es: ['es-ES-ElviraNeural', 'es-ES-AlvaroNeural'],
      ru: ['ru-RU-SvetlanaNeural', 'ru-RU-DmitryNeural'],
      it: ['it-IT-ElsaNeural', 'it-IT-DiegoNeural'],
      ja: ['ja-JP-NanamiNeural', 'ja-JP-KeitaNeural'],
      ko: ['ko-KR-SunHiNeural', 'ko-KR-InJoonNeural'],
      fa: ['fa-IR-DilaraNeural', 'fa-IR-FaridNeural'],
      he: ['he-IL-HilaNeural', 'he-IL-AvriNeural']
    };
    const azureDene = async () => {
      const speechKey = process.env.AZURE_SPEECH_KEY;
      const speechRegion = process.env.AZURE_SPEECH_REGION || 'eastus';
      if (!speechKey) return { hata: 'azure-key-yok' };
      try {
        const cift = SESLER[language.split('-')[0].toLowerCase()] || SESLER.ar;
        const voiceName = gender === 'female' ? cift[0] : cift[1];
        const kacis = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const oran = hiz ? Math.round((hiz - 1) * 100) : 0;
        const icerik = oran !== 0 ? '<prosody rate="' + (oran > 0 ? '+' : '') + oran + '%">' + kacis + '</prosody>' : kacis;
        const ssml = "<speak version='1.0' xml:lang='" + language + "'><voice xml:lang='" + language + "' name='" + voiceName + "'>" + icerik + "</voice></speak>";
        const r = await fetch('https://' + speechRegion + '.tts.speech.microsoft.com/cognitiveservices/v1', {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': speechKey,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
            'User-Agent': 'LisanOgren'
          },
          body: ssml
        });
        if (!r.ok) return { hata: 'HTTP ' + r.status + ' ' + (await r.text().catch(() => '')).slice(0, 120) };
        return { buf: Buffer.from(await r.arrayBuffer()) };
      } catch (e) {
        return { hata: 'istek-hatasi ' + String((e && e.message) || e).slice(0, 100) };
      }
    };

    let ses = null, kaynak = '', azureHata = '';
    if (engine === 'azure') {
      const a = await azureDene();
      if (a.buf) { ses = a.buf; kaynak = 'azure'; } else azureHata = a.hata;
      if (!ses) { const b = await elevenDene(); if (b) { ses = b; kaynak = 'elevenlabs'; } }
    } else {
      const b = await elevenDene();
      if (b) { ses = b; kaynak = 'elevenlabs'; }
      else { const a = await azureDene(); if (a.buf) { ses = a.buf; kaynak = 'azure'; } else azureHata = a.hata; }
    }
    if (!ses) return res.status(502).json({ error: 'Ses uretilemedi', eleven: elevenHata, azure: azureHata });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Ses-Kaynak', kaynak);
    if (kaynak === 'azure') res.setHeader('X-Eleven-Durum', encodeURIComponent(elevenHata || 'denenmedi'));
    return res.status(200).send(ses);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
