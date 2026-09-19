export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION || 'eastus';

    if (!speechKey) {
      return res.status(500).json({ error: 'Azure Speech Key eksik' });
    }

    const body = req.body || {};
    const query = req.query || {};
    const text = body.text || query.text || 'Merhaba';
    const language = body.language || query.language || 'ar-SA';
    const gender = body.gender || query.gender || 'male';

    let voiceName = 'ar-SA-HamedNeural';
    if (language.startsWith('ar')) {
      voiceName = gender === 'female' ? 'ar-SA-ZariyahNeural' : 'ar-SA-HamedNeural';
    } else if (language.startsWith('en')) {
      voiceName = gender === 'female' ? 'en-US-JennyNeural' : 'en-US-GuyNeural';
    } else if (language.startsWith('tr')) {
      voiceName = gender === 'female' ? 'tr-TR-EmelNeural' : 'tr-TR-AhmetNeural';
    } else if (language.startsWith('de')) {
      voiceName = gender === 'female' ? 'de-DE-KatjaNeural' : 'de-DE-ConradNeural';
    } else if (language.startsWith('fr')) {
      voiceName = gender === 'female' ? 'fr-FR-DeniseNeural' : 'fr-FR-HenriNeural';
    } else if (language.startsWith('es')) {
      voiceName = gender === 'female' ? 'es-ES-ElviraNeural' : 'es-ES-AlvaroNeural';
    } else if (language.startsWith('ru')) {
      voiceName = gender === 'female' ? 'ru-RU-SvetlanaNeural' : 'ru-RU-DmitryNeural';
    }

    const ssml = `<speak version='1.0' xml:lang='${language}'><voice xml:lang='${language}' name='${voiceName}'>${text}</voice></speak>`;

    const ttsUrl = `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'LisanOgren'
      },
      body: ssml
    });

    if (!response.ok) {
      const errTxt = await response.text();
      return res.status(response.status).json({ error: 'Azure TTS hatası', details: errTxt });
    }

    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    return res.status(200).send(Buffer.from(audioBuffer));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
