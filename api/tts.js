let elevenKapaliSon = 0;
let elevenKapaliNeden = '';

const ELEVEN_DILLER = new Set(String(process.env.ELEVEN_DILLER || 'ar,en,tr,de,fr,es,ru,it,ja,ko').split(',').map((s) => s.trim()).filter(Boolean));
const ELEVEN_MODELLER = new Set(['eleven_flash_v2_5', 'eleven_turbo_v2_5', 'eleven_multilingual_v2']);

const SESLER = {
  ar: { f: ['ar-SA-ZariyahNeural', 'ar-EG-SalmaNeural', 'ar-AE-FatimaNeural'], m: ['ar-SA-HamedNeural', 'ar-EG-ShakirNeural', 'ar-AE-HamdanNeural'] },
  en: { f: ['en-US-JennyNeural', 'en-US-AriaNeural', 'en-GB-SoniaNeural', 'en-AU-NatashaNeural'], m: ['en-US-GuyNeural', 'en-US-DavisNeural', 'en-GB-RyanNeural', 'en-AU-WilliamNeural'] },
  tr: { f: ['tr-TR-EmelNeural'], m: ['tr-TR-AhmetNeural'] },
  de: { f: ['de-DE-KatjaNeural', 'de-DE-AmalaNeural', 'de-AT-IngridNeural'], m: ['de-DE-ConradNeural', 'de-DE-KillianNeural', 'de-AT-JonasNeural'] },
  fr: { f: ['fr-FR-DeniseNeural', 'fr-FR-EloiseNeural', 'fr-CA-SylvieNeural'], m: ['fr-FR-HenriNeural', 'fr-CA-JeanNeural'] },
  es: { f: ['es-ES-ElviraNeural', 'es-MX-DaliaNeural'], m: ['es-ES-AlvaroNeural', 'es-MX-JorgeNeural'] },
  ru: { f: ['ru-RU-SvetlanaNeural', 'ru-RU-DariyaNeural'], m: ['ru-RU-DmitryNeural'] },
  it: { f: ['it-IT-ElsaNeural', 'it-IT-IsabellaNeural'], m: ['it-IT-DiegoNeural', 'it-IT-BenignoNeural'] },
  ja: { f: ['ja-JP-NanamiNeural', 'ja-JP-AoiNeural'], m: ['ja-JP-KeitaNeural', 'ja-JP-DaichiNeural'] },
  ko: { f: ['ko-KR-SunHiNeural'], m: ['ko-KR-InJoonNeural', 'ko-KR-BongJinNeural'] },
  fa: { f: ['fa-IR-DilaraNeural'], m: ['fa-IR-FaridNeural'] },
  he: { f: ['he-IL-HilaNeural'], m: ['he-IL-AvriNeural'] }
};

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  res.setHeader('X-Ses-Surum', '4');
  try {
    const body = req.body || {};
    const query = req.query || {};
    const al = (k) => (body[k] !== undefined ? body[k] : query[k]);
    const text = String(al('text') || 'Merhaba').slice(0, 5000);
    const language = String(al('language') || 'ar-SA');
    const dilKod = language.split('-')[0].toLowerCase();
    const gender = al('gender') === 'female' ? 'female' : 'male';
    const voiceId = al('voiceId');
    const engine = String(al('engine') || '');
    const slotHam = parseInt(al('slot'), 10);
    const slot = Number.isFinite(slotHam) ? Math.abs(slotHam) : 0;
    const hizHam = parseFloat(al('hiz'));
    const hiz = Number.isFinite(hizHam) ? Math.min(1.2, Math.max(0.7, hizHam)) : null;
    const modelIstek = String(al('model') || process.env.ELEVEN_MODEL || '');
    const model = ELEVEN_MODELLER.has(modelIstek) ? modelIstek : 'eleven_flash_v2_5';

    let elevenHata = '';
    const elevenDene = async () => {
      const key = process.env.ELEVENLABS_API_KEY;
      if (!voiceId || !key) { elevenHata = voiceId ? 'key-yok' : 'voiceId-yok'; return null; }
      if (!ELEVEN_DILLER.has(dilKod)) { elevenHata = 'dil-elevenlabs-disi'; return null; }
      if (Date.now() < elevenKapaliSon) { elevenHata = 'gecici-kapali ' + elevenKapaliNeden; return null; }
      const adres = 'https://api.elevenlabs.io/v1/text-to-speech/' + encodeURIComponent(voiceId);
      const gonder = (govde) => fetch(adres, {
        method: 'POST',
        headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify(govde)
      });
      const ayar = { stability: 0.5, similarity_boost: 0.75 };
      const sade = { text, model_id: model, voice_settings: ayar };
      const zengin = {
        text,
        model_id: model,
        voice_settings: hiz ? { ...ayar, speed: hiz } : ayar,
        ...(model === 'eleven_multilingual_v2' ? {} : { language_code: dilKod })
      };
      try {
        let r = await gonder(zengin);
        if (!r.ok && r.status >= 400 && r.status < 500 && ![401, 402, 403, 429].includes(r.status)) r = await gonder(sade);
        if (r.ok) return Buffer.from(await r.arrayBuffer());
        const govdeMetni = (await r.text().catch(() => '')).slice(0, 200);
        elevenHata = 'HTTP ' + r.status + ' ' + govdeMetni;
        if (r.status === 401 || r.status === 402 || /quota|payment|invalid_api_key/i.test(govdeMetni)) {
          elevenKapaliSon = Date.now() + 10 * 60 * 1000;
          elevenKapaliNeden = 'HTTP ' + r.status;
        }
      } catch (e) {
        elevenHata = 'istek-hatasi ' + String((e && e.message) || e).slice(0, 100);
      }
      return null;
    };

    const azureDene = async () => {
      const anahtar = process.env.AZURE_SPEECH_KEY;
      const bolge = process.env.AZURE_SPEECH_REGION || 'eastus';
      if (!anahtar) return { hata: 'azure-key-yok' };
      const havuz = (SESLER[dilKod] || SESLER.tr)[gender === 'female' ? 'f' : 'm'];
      const adaylar = [havuz[slot % havuz.length], havuz[0]].filter((v, i, a) => a.indexOf(v) === i);
      const kacis = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const oran = hiz ? Math.round((hiz - 1) * 100) : 0;
      const icerik = oran !== 0 ? '<prosody rate="' + (oran > 0 ? '+' : '') + oran + '%">' + kacis + '</prosody>' : kacis;
      let sonHata = '';
      for (const sesAdi of adaylar) {
        try {
          const lokal = sesAdi.split('-').slice(0, 2).join('-');
          const ssml = "<speak version='1.0' xml:lang='" + lokal + "'><voice xml:lang='" + lokal + "' name='" + sesAdi + "'>" + icerik + '</voice></speak>';
          const r = await fetch('https://' + bolge + '.tts.speech.microsoft.com/cognitiveservices/v1', {
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': anahtar,
              'Content-Type': 'application/ssml+xml',
              'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
              'User-Agent': 'LisanOgren'
            },
            body: ssml
          });
          if (r.ok) return { buf: Buffer.from(await r.arrayBuffer()), ses: sesAdi };
          sonHata = sesAdi + ' HTTP ' + r.status + ' ' + (await r.text().catch(() => '')).slice(0, 100);
          if (r.status === 401 || r.status === 403 || r.status === 429) break;
        } catch (e) {
          sonHata = sesAdi + ' istek-hatasi ' + String((e && e.message) || e).slice(0, 80);
        }
      }
      return { hata: sonHata };
    };

    let sesVeri = null, kaynak = '', sesAdiSon = '', azureHata = '';
    const sira = engine === 'azure' ? ['azure', 'eleven'] : engine === 'eleven' ? ['eleven'] : ['eleven', 'azure'];
    for (const m of sira) {
      if (sesVeri) break;
      if (m === 'eleven') {
        const b = await elevenDene();
        if (b) { sesVeri = b; kaynak = 'elevenlabs'; sesAdiSon = model; }
      } else {
        const a = await azureDene();
        if (a.buf) { sesVeri = a.buf; kaynak = 'azure'; sesAdiSon = a.ses; } else azureHata = a.hata || '';
      }
    }
    if (!sesVeri) return res.status(502).json({ error: 'Ses uretilemedi', eleven: elevenHata, azure: azureHata });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Ses-Kaynak', kaynak);
    res.setHeader('X-Ses-Ad', sesAdiSon);
    res.setHeader('X-Eleven-Durum', encodeURIComponent(elevenHata || (kaynak === 'elevenlabs' ? 'tamam' : 'denenmedi')));
    return res.status(200).send(sesVeri);
  } catch (error) {
    return res.status(500).json({ error: String((error && error.message) || error) });
  }
}
