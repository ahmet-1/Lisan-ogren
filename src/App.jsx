import { useState, useRef, useEffect } from "react";
''
'// ─── RENKLER ───────────────────────────────────────────────────────────────'
const K = {
  bg:"#071510", bg2:"#0a1e13", bg3:"#0d2618", card:"#0f2c1c",
  bdr:"#1a3d26", bdr2:"#1f4d30", bdr3:"#266040",
  g2:"#2e7d32", g3:"#388e3c", g4:"#43a047", gL:"#66bb6a",
  t2:"#00695c", t3:"#00897b", tL:"#26a69a",
  tx:"#e8f5e9", tx2:"#a5d6a7", tx3:"#6a9e74", tx4:"#3d6b47",
  warn:"#f9a825", err:"#c62828", errL:"#ef5350", gold:"#f57f17",
};

// ─── VERİTABANI ─────────────────────────────────────────────────────────────
const DB = {
  g: k => { try { const v=localStorage.getItem("la_"+k); return v?JSON.parse(v):null; } catch { return null; } },
  s: (k,v) => { try { localStorage.setItem("la_"+k, JSON.stringify(v)); } catch {} },
  d: k => { try { localStorage.removeItem("la_"+k); } catch {} },
};

// Her hoca için ElevenLabs ses ID'si
const HOCA_SES = {
  // Erkek sesler
  "q1": "pNInz6obpgDQGcFmaJgB", // Adam - derin erkek
  "q2": "VR6AewLTigWG4xSOukaG", // Arnold - otoriter
  "a1": "pNInz6obpgDQGcFmaJgB",
  "a2": "VR6AewLTigWG4xSOukaG",
  "m1": "TxGEqnHWrfWFTfGW9XjX", // Josh - olgun
  "m2": "TxGEqnHWrfWFTfGW9XjX",
  "e1": "jBpfuIE2acCO8z3wKNLl", // Fin - British
  "e2": "jBpfuIE2acCO8z3wKNLl",
  "j1": "pNInz6obpgDQGcFmaJgB",
  "j2": "TxGEqnHWrfWFTfGW9XjX",
  // Kadın sesler
  "q3": "EXAVITQu4vr4xnSDxMaL", // Bella - yumuşak kadın
  "q4": "EXAVITQu4vr4xnSDxMaL",
  "a3": "EXAVITQu4vr4xnSDxMaL",
  "a4": "EXAVITQu4vr4xnSDxMaL",
  "m3": "EXAVITQu4vr4xnSDxMaL",
  "m4": "21m00Tcm4TlvDq8ikWAM", // Rachel - profesyonel kadın
  "e3": "21m00Tcm4TlvDq8ikWAM",
  "e4": "21m00Tcm4TlvDq8ikWAM",
  "j3": "EXAVITQu4vr4xnSDxMaL",
  "j4": "21m00Tcm4TlvDq8ikWAM",
  // Çocuk hocalar
  "default_child": "EXAVITQu4vr4xnSDxMaL",
};

const elevenTTS = async (metin, hocaId, dil_mic) => {
  const sesId = HOCA_SES[hocaId] || HOCA_SES["default_child"];
  try {
    const res = await fetch("/api/tts" + sesId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_KEY,
      },
      body: JSON.stringify({
        text: metin.substring(0, 500),
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: 0.9 }
      })
    });
    if (!res.ok) throw new Error("ElevenLabs hata: " + res.status);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    return new Promise((resolve) => {
      audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });
  } catch(e) {
    // ElevenLabs başarısız olursa tarayıcı sesini kullan
    console.warn("ElevenLabs fallback:", e.message);
    return new Promise((resolve) => {
      try {
        window.speechSynthesis?.cancel();
        const u = new SpeechSynthesisUtterance(metin.substring(0,200));
        u.lang = dil_mic || "tr-TR"; u.rate = 0.85;
        u.onend = resolve; u.onerror = resolve;
        window.speechSynthesis?.speak(u);
      } catch { resolve(); }
    });
  }
};

const getA = () => DB.g("adm") || { pw:"admin123", email:"", contactEmail:"", iban:"", bank:"", acName:"", users:[], pays:[] };
const setA = d => DB.s("adm", d);

// ── GİZLİ MÜFREDAT MOTORİ ──
const MUFREDAT = {
  english: {
    A1: { units:["Selamlaşma","Sayılar","Renkler","Aile"], grammar:["to be","have got","articles"], vocab:500, speaking:"Basit tanıtım cümleleri" },
    A2: { units:["Alışveriş","Yön sorma","Restoran","İş"], grammar:["Simple Present","Past Simple","Adjectives"], vocab:1000, speaking:"Günlük konuşma" },
    B1: { units:["Seyahat","Sağlık","Medya","Çevre"], grammar:["Present Perfect","Conditionals","Passive"], vocab:2000, speaking:"Fikir belirtme" },
    B2: { units:["İş hayatı","Politika","Kültür","Teknoloji"], grammar:["Advanced tenses","Reported speech","Modals"], vocab:4000, speaking:"Tartışma ve ikna" },
    C1: { units:["Akademik","Hukuk","Tıp","Edebiyat"], grammar:["Complex structures","Inversion","Cleft sentences"], vocab:8000, speaking:"Akıcı ve doğal" },
    C2: { units:["Native level","İdiomatic","Academic writing"], grammar:["All mastered"], vocab:16000, speaking:"Ana dil seviyesi" },
  },
  arabic: {
    A1: { units:["Arap alfabesi","Selamlaşma","Sayılar","Renkler"], grammar:["Harfler","Harekeler","Basit cümleler"], vocab:300, speaking:"Temel kelimeler" },
    A2: { units:["Aile","Ev","Gıda","Giyim"], grammar:["Müzekker/Müennes","İsim tamlaması","Fiil çekimi"], vocab:800, speaking:"Basit diyaloglar" },
    B1: { units:["Seyahat","Ticaret","Din hayatı","Medya"], grammar:["Sarf","Nahiv temelleri","Zamirler"], vocab:1500, speaking:"Günlük Arapça" },
    B2: { units:["Edebiyat","İş","Siyaset","Felsefe"], grammar:["İleri Nahiv","Belagat","Masdar"], vocab:3000, speaking:"Fesahat" },
    C1: { units:["Klasik Arapça","Tefsir dili","Fıkıh dili"], grammar:["Tam Nahiv-Sarf","Aruz"], vocab:6000, speaking:"Fasih Arapça" },
    C2: { units:["Arap edebiyatı","Şiir","Hitabet"], grammar:["Tam hakimiyet"], vocab:12000, speaking:"Ana dil seviyesi" },
  },
  quran: {
    A1: { units:["Elif-Ba","Harekeler","Tenvin","Sukun"], grammar:["Tecvid temelleri","Makharij"], vocab:0, speaking:"Harf telaffuzu" },
    A2: { units:["Kısa sureler","Fetha-Kesre-Damme","Med"], grammar:["İdğam","İhfa","İklab"], vocab:0, speaking:"Kısa sure okuma" },
    B1: { units:["Amme Cüzü","Tecvid kuralları","Makam"], grammar:["Kalb","Kalkale","Ğunne"], vocab:0, speaking:"Sure okuma" },
    B2: { units:["Hıfz başlangıç","Sure mealleri","Tefsir"], grammar:["İleri tecvid","Vakf-İbtida"], vocab:0, speaking:"Ezberleme" },
    C1: { units:["Hıfz orta","Kıraat","Makamlar"], grammar:["Riyayet","Dirayет"], vocab:0, speaking:"Makamla okuma" },
    C2: { units:["Hatim","İleri hıfz","Kıraat-ı seb'a"], grammar:["Tam hakimiyet"], vocab:0, speaking:"Hafız seviyesi" },
  },
  medrese: {
    A1: { units:["İman esasları","Namaz","Abdest","Taharet"], grammar:["Temel fıkıh","İbadet hükümleri"], vocab:200, speaking:"Dualar" },
    A2: { units:["Oruç","Zekat","Hac","Ahlak"], grammar:["Fıkıh usulü temelleri","Kelam"], vocab:500, speaking:"Dini konuşma" },
    B1: { units:["Hadis","Siyer","Tefsir","Kelam"], grammar:["Usul-ü fıkıh","Hadis usulü"], vocab:1000, speaking:"İlmi sohbet" },
    B2: { units:["İleri fıkıh","Kur'an ilimleri","Tasavvuf"], grammar:["Mantık","Belagat"], vocab:2000, speaking:"Müzakere" },
    C1: { units:["Müftülük bilgisi","Fetva","Mezhep farkları"], grammar:["İctihad usulü"], vocab:4000, speaking:"Alim düzeyi" },
    C2: { units:["Tam ilim hakimiyeti"], grammar:["Külliyat"], vocab:8000, speaking:"Müderris seviyesi" },
  },
  japanese: {
    A1: { units:["Hiragana","Katakana","Selamlaşma","Sayılar"], grammar:["は/が/を","Temel fiiller","Desu/Masu"], vocab:300, speaking:"Basit tanıtım" },
    A2: { units:["Alışveriş","Yön","Aile","Yemek"], grammar:["Te formu","Geçmiş zaman","Sıfatlar"], vocab:800, speaking:"Günlük konuşma" },
    B1: { units:["İş","Seyahat","Haber","Kültür"], grammar:["Passive","Causative","Conditionals","Keigo"], vocab:2000, speaking:"JLPT N3" },
    B2: { units:["İş Japonca","Medya","Edebiyat"], grammar:["İleri Keigo","Bağlaçlar","JLPT N2"], vocab:4000, speaking:"Akıcı" },
    C1: { units:["Akademik","Hukuk","Tıp"], grammar:["JLPT N1","Klasik Japonca"], vocab:8000, speaking:"Ana dil yakın" },
    C2: { units:["Ana dil","Edebiyat","Kanji tam"], grammar:["Tam hakimiyet"], vocab:16000, speaking:"Ana dil seviyesi" },
  },
  french: {
    A1: { units:["Alfabe","Selamlaşma","Renkler","Sayılar"], grammar:["Articles","Être/Avoir","Genre"], vocab:400, speaking:"Bonjour, merci" },
    A2: { units:["Aile","Ev","Yemek","Alışveriş"], grammar:["Passé composé","Imparfait","Pronoms"], vocab:1000, speaking:"Günlük Fransızca" },
    B1: { units:["Seyahat","İş","Medya","Kültür"], grammar:["Subjonctif","Conditionnel","Passif"], vocab:2000, speaking:"DELF B1" },
    B2: { units:["Politika","Edebiyat","Bilim"], grammar:["İleri subjonctif","Discours indirect"], vocab:4000, speaking:"DELF B2" },
    C1: { units:["Akademik Fransızca","Edebiyat","Felsefe"], grammar:["Tam hakimiyet"], vocab:8000, speaking:"Dalf C1" },
    C2: { units:["Fransız edebiyatı","Hitabet"], grammar:["Mükemmel"], vocab:16000, speaking:"Ana dil" },
  },
  spanish: {
    A1: { units:["Alfabe","Selamlaşma","Aile","Renkler"], grammar:["Ser/Estar","Artículos","Género"], vocab:400, speaking:"Hola, gracias" },
    A2: { units:["Alışveriş","Yön","Yemek","İş"], grammar:["Pretérito","Verbos reflexivos","Imperativo"], vocab:1000, speaking:"Günlük İspanyolca" },
    B1: { units:["Seyahat","Medya","Kültür","Çevre"], grammar:["Subjuntivo","Condicional","Passive"], vocab:2000, speaking:"DELE B1" },
    B2: { units:["İş","Politika","Edebiyat"], grammar:["İleri subjuntivo","Discurso indirecto"], vocab:4000, speaking:"DELE B2" },
    C1: { units:["Akademik","Hukuk","Tıp"], grammar:["Tam hakimiyet"], vocab:8000, speaking:"Ana dil yakın" },
    C2: { units:["Edebiyat","Hitabet"], grammar:["Mükemmel"], vocab:16000, speaking:"Ana dil" },
  },
};

// Müfredat prompt'u oluştur
const getMufredatPrompt = (dilId, seviye) => {
  const mf = MUFREDAT[dilId]?.[seviye];
  if (!mf) return "";
  return `
GIZLI MÜFREDAT (öğrenciye gösterme, sadece takip et):
Mevcut Seviye: ${seviye}
Üniteler: ${mf.units.join(", ")}
Gramer Konuları: ${mf.grammar.join(", ")}
Hedef Kelime: ${mf.vocab} kelime
Konuşma Hedefi: ${mf.speaking}
Bu bilgileri kullanarak dersi yönlendir. Öğrencinin seviyesine göre sorular sor, pratik yaptır.`;
};

// ── ÖĞRETMEN PERSONA SİSTEMİ ──
const PERSONA = {
  "q1": { stil:"Sabırlı ve metodolojik", ses:"Derin, ölçülü", hiz:0.70, duzeltme:"Nazikçe ve hemen düzelt, doğrusunu tekrar ettir", hitap:"kardeşim" },
  "q2": { stil:"Geleneksel medrese tarzı", ses:"Ciddi ama sıcak", hiz:0.75, duzeltme:"Yanlışı düzelt ve neden yanlış olduğunu açıkla", hitap:"kardeşim" },
  "q3": { stil:"Teşvik edici ve nazik", ses:"Yumuşak kadın sesi", hiz:0.80, duzeltme:"Önce teşvik et, sonra düzelt", hitap:"kardeşim" },
  "q4": { stil:"Akademik ve detaylı", ses:"Sakin kadın sesi", hiz:0.75, duzeltme:"Detaylı açıkla", hitap:"sevgili öğrencim" },
  "m1": { stil:"Hoca Efendi tarzı", ses:"Otoriter ama şefkatli", hiz:0.75, duzeltme:"Kaynak göstererek düzelt", hitap:"evladım" },
  "m2": { stil:"Müftü tarzı, resmi", ses:"Ağır başlı", hiz:0.70, duzeltme:"İlmi kaynak ver", hitap:"talebem" },
  "e1": { stil:"British profesyonel", ses:"Açık ve net", hiz:0.90, duzeltme:"Hemen düzelt ve örnek ver", hitap:"dear student" },
  "e3": { stil:"Amerikan enerjik", ses:"Hızlı ve pozitif", hiz:1.0, duzeltme:"Casual tarzda düzelt", hitap:"hey" },
  "j1": { stil:"Formal Japon", ses:"Sakin ve net", hiz:0.85, duzeltme:"Kibar şekilde düzelt", hitap:"san" },
  "default": { stil:"Sıcak ve motive edici", ses:"Doğal", hiz:0.85, duzeltme:"Nazikçe düzelt", hitap:"sevgili öğrencim" },
};

const getPersona = (hocaId) => PERSONA[hocaId] || PERSONA["default"];

// ── UZUN SÜRELİ HAFIZA SİSTEMİ ──
const getHafiza = (kulId, dilId) => DB.g("hf_"+kulId+"_"+dilId) || { hatalar:[], zayifAlanlar:[], telaffuzHatalari:[], toplamDers:0, sonDers:null };
const setHafiza = (kulId, dilId, data) => DB.s("hf_"+kulId+"_"+dilId, data);

const hataKaydet = (kulId, dilId, hata, tip) => {
  const h = getHafiza(kulId, dilId);
  const yeniHata = { hata, tip, tarih: new Date().toLocaleDateString("tr-TR"), tekrar:1 };
  const mevcutIdx = h.hatalar.findIndex(x => x.hata === hata);
  if (mevcutIdx > -1) h.hatalar[mevcutIdx].tekrar++;
  else h.hatalar.unshift(yeniHata);
  h.hatalar = h.hatalar.slice(0, 20); // Son 20 hata
  setHafiza(kulId, dilId, h);
};

const getHafizaPrompt = (kulId, dilId) => {
  const h = getHafiza(kulId, dilId);
  if (!kulId || h.hatalar.length === 0) return "";
  const enCokHatalar = h.hatalar.sort((a,b) => b.tekrar - a.tekrar).slice(0,5);
  return `
ÖĞRENCI HAFIZASI (gizli tut, sadece kullan):
Toplam ders: ${h.toplamDers}
Tekrarlayan hatalar: ${enCokHatalar.map(x => x.hata+"("+x.tekrar+"x)").join(", ")}
Zayıf alanlar: ${h.zayifAlanlar.join(", ")||"henüz yok"}
Bu bilgilere göre öğrencinin hatalarını takip et ve zayıf alanlara odaklan.`;
};

// ── BİLGİ GÜVENLİĞİ - HALÜSİNASYON ÖNLEME ──
const getGuvenlikPrompt = (dilId) => {
  if (dilId === "quran") return `
KURAN GÜVENLİK KURALLARI:
- Sadece gerçek Kuran ayetleri ve sureler hakkında konuş
- Uydurma hadis veya ayet söyleme, bilmiyorsan "bilmiyorum" de
- Tecvid kuralları için klasik Türk tecvid kitaplarını referans al
- Kıraat farklılıkları için "rivayetlere göre farklılık olabilir" de`;
  if (dilId === "medrese") return `
MEDRESE GÜVENLİK KURALLARI:
- Sadece 4 büyük Sünni mezhebi (Hanefi, Maliki, Şafii, Hanbeli) kaynaklı bil ver
- Tartışmalı konularda "alimler arasında farklı görüşler vardır" de
- Fetvaya benzeyecek konularda "bir alime danışmanız gerekir" de
- Uydurma hadis söyleme, bilmiyorsan "bilmiyorum" de`;
  return "";
};


// ── SEVİYE & DERS GEÇMİŞİ SİSTEMİ ──
const SEVIYELER = ["A1","A2","B1","B2","C1","C2"];
const getDersGecmis = (kulId, dilId) => DB.g("dg_"+kulId+"_"+dilId) || [];
const setDersGecmis = (kulId, dilId, data) => DB.s("dg_"+kulId+"_"+dilId, data);
const getSeviye = (kulId, dilId) => DB.g("sv_"+kulId+"_"+dilId) || "A1";
const setSeviye = (kulId, dilId, sv) => DB.s("sv_"+kulId+"_"+dilId, sv);
const seviyeGuncelle = (kulId, dilId) => {
  const sayi = getDersGecmis(kulId, dilId).length;
  const idx = Math.min(Math.floor(sayi / 5), SEVIYELER.length - 1);
  const yeniSv = SEVIYELER[idx];
  setSeviye(kulId, dilId, yeniSv);
  return yeniSv;
};

// ─── PWA MANIFEST (Ana Ekrana Ekle) ─────────────────────────────────────────
// Bu index.html'de manifest.json ile yapılır - App.jsx'te useEffect ile ekleriz
function usePWA() {
  useEffect(() => {
    // Theme color
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = "theme-color"; document.head.appendChild(meta); }
    meta.content = "#071510";
    // Title
    document.title = "Lisan Öğren — AI Hoca ile 10 Dil Öğren";
  }, []);
}

// ─── DİLLER ─────────────────────────────────────────────────────────────────
const DILLER = [
  {id:"medrese", ad:"Medrese Eğitimi",  yerel:"التعليم الديني", bayrak:"📖", renk:"#1a0e00", vurgu:"#c8a045", acik:"Fıkıh, Akaid, Tefsir ve Hadis", mic:"ar-SA", mods:["Fıkıh","Akaid","Tefsir","Hadis","Feraiz"]},
  {id:"quran",  ad:"Kur'an-ı Kerim", yerel:"القرآن الكريم", bayrak:"🕌", renk:"#0d2a14", vurgu:"#f9a825", acik:"Tecvid, Makam ve Hıfz",        mic:"ar-SA", mods:["Tecvid","Makam","Hıfz","Sure Mealleri"]},
  {id:"arabic", ad:"Arapça",          yerel:"العربية",       bayrak:"🇪🇬", renk:"#2a0e0e", vurgu:"#ff8f00", acik:"Nahiv, Sarf ve Konuşma",       mic:"ar-SA", mods:["Nahiv","Sarf","Konuşma","Okuma-Yazma"]},
  {id:"english",ad:"İngilizce",        yerel:"English",       bayrak:"🇬🇧", renk:"#0e1a2a", vurgu:"#ef5350", acik:"British & American English",   mic:"en-US", mods:["Grammar","Speaking","Vocabulary","IELTS"]},
  {id:"german", ad:"Almanca",          yerel:"Deutsch",       bayrak:"🇩🇪", renk:"#1a1a0e", vurgu:"#fdd835", acik:"A1'den C2'ye Almanca",         mic:"de-DE", mods:["Grammatik","Sprechen","Vokabeln","TestDaF"]},
  {id:"italian",ad:"İtalyanca",        yerel:"Italiano",      bayrak:"🇮🇹", renk:"#0e2a0e", vurgu:"#ff8f00", acik:"La bella lingua italiana",     mic:"it-IT", mods:["Grammatica","Conversazione","Cultura","CILS"]},
  {id:"french", ad:"Fransızca",        yerel:"Français",      bayrak:"🇫🇷", renk:"#0a1030", vurgu:"#ef5350", acik:"La langue de l'amour",         mic:"fr-FR", mods:["Grammaire","Conversation","Culture","DELF"]},
  {id:"turkish",ad:"Türkçe",           yerel:"Türkçe",        bayrak:"🇹🇷", renk:"#2a0a0a", vurgu:"#ecf0f1", acik:"Ana dil & Yabancılara Türkçe", mic:"tr-TR", mods:["Dilbilgisi","Konuşma","Yazma","TÖMER"]},
  {id:"russian",ad:"Rusça",            yerel:"Русский",       bayrak:"🇷🇺", renk:"#0a0a2a", vurgu:"#ef5350", acik:"Kiril alfabesi & Konuşma",     mic:"ru-RU", mods:["Kiril","Gramer","Konuşma","TORFL"]},
  {id:"spanish",ad:"İspanyolca",       yerel:"Español",       bayrak:"🇪🇸", renk:"#2a1a0a", vurgu:"#ff8f00", acik:"Dünyanın en yaygın dili",      mic:"es-ES", mods:["Gramática","Conversación","Cultura","DELE"]},
];

const HOCALAR = {
  quran:[
    {id:"q1",ad:"Şeyh Ahmed Al-Ghamdi",   yer:"Mekke, S.Arabistan",  uz:"Tecvid & Hıfz Uzmanı",    p:4.9,n:1240,c:false},
    {id:"q2",ad:"Şeyh Omar Al-Fadil",     yer:"Medine, S.Arabistan", uz:"Makam & Kıraat Uzmanı",   p:4.8,n:980, c:false},
    {id:"q3",ad:"Üst. Meryem Al-Husseini",yer:"Kahire, Mısır",       uz:"Sure Mealleri & Tefsir",  p:4.9,n:1560,c:false},
    {id:"q4",ad:"Üst. Fatıma Al-Zahrawi", yer:"Güney Sina, Mısır",   uz:"Tecvid & Kıraat Uzmanı",  p:4.7,n:870, c:false},
    {id:"q5",ad:"Öğrt. Yusuf Al-Nuri",    yer:"Kahire, Mısır",       uz:"Çocuklara Kur'an & Hıfz", p:4.9,n:640, c:true},
    {id:"q6",ad:"Öğrt. Zeynep Al-Safa",   yer:"Medine, S.Arabistan", uz:"Çocuklara Tecvid",        p:4.8,n:510, c:true},
  ],
  medrese:[
    {id:"m1",ad:"Hoca Efendi Mahmud",     yer:"İstanbul, Türkiye",   uz:"Fıkıh & Akaid Uzmanı",    p:4.9,n:1100,c:false},
    {id:"m2",ad:"Müftü Ahmed Şükrü",      yer:"Konya, Türkiye",      uz:"Tefsir & Kur'an İlimleri", p:4.8,n:890, c:false},
    {id:"m3",ad:"Üst. Hafize Hanım",      yer:"Ankara, Türkiye",     uz:"Hadis & Siyer Uzmanı",     p:4.9,n:760, c:false},
    {id:"m4",ad:"Üst. Fatma Nur",         yer:"Bursa, Türkiye",      uz:"Fıkıh & Feraiz Uzmanı",    p:4.7,n:680, c:false},
    {id:"m5",ad:"Öğrt. Yusuf Hoca",       yer:"İstanbul, Türkiye",   uz:"Çocuklara Temel Din",      p:4.9,n:540, c:true},
    {id:"m6",ad:"Öğrt. Zehra Hanım",      yer:"Kayseri, Türkiye",    uz:"Çocuklara Kur'an & Dua",   p:4.8,n:490, c:true},
  ],
  arabic:[
    {id:"a1",ad:"Dr. Khalid Al-Mansouri",yer:"Kahire, Mısır", uz:"Nahiv & Sarf Uzmanı",    p:4.9,n:2100,c:false},
    {id:"a2",ad:"Prof. Yusuf Al-Azhari", yer:"Kahire, Mısır", uz:"Fesahat & Belağat",      p:4.8,n:1450,c:false},
    {id:"a3",ad:"Dr. Nour Al-Rashidi",   yer:"Bağdat, Irak",  uz:"Modern Arapça",          p:4.9,n:1890,c:false},
    {id:"a4",ad:"Üst. Layla Al-Baghdadi",yer:"Amman, Ürdün",  uz:"Nahiv & Okuma-Yazma",    p:4.7,n:1120,c:false},
    {id:"a5",ad:"Öğrt. Samir Al-Faruq", yer:"Kahire, Mısır", uz:"Çocuklara Temel Arapça", p:4.9,n:720, c:true},
    {id:"a6",ad:"Öğrt. Hana Al-Zubi",   yer:"Amman, Ürdün",  uz:"Çocuklara Arapça",       p:4.8,n:590, c:true},
  ],
  english:[
    {id:"e1",ad:"James Harrison",      yer:"Londra, İngiltere",    uz:"British English & IELTS",       p:4.9,n:3200,c:false},
    {id:"e2",ad:"Dr. William Clarke",  yer:"Oxford, İngiltere",    uz:"Academic English & Writing",    p:4.8,n:2100,c:false},
    {id:"e3",ad:"Sarah Mitchell",      yer:"New York, ABD",        uz:"American English & TOEFL",      p:4.9,n:2800,c:false},
    {id:"e4",ad:"Emma Thompson",       yer:"Manchester, İngiltere",uz:"Conversation & Pronunciation",  p:4.8,n:1950,c:false},
    {id:"e5",ad:"Tom Bradley",         yer:"Bristol, İngiltere",   uz:"Çocuklara Eğlenceli İngilizce", p:4.9,n:880, c:true},
    {id:"e6",ad:"Lucy Williams",       yer:"Edinburgh, İskoçya",   uz:"Çocuk İngilizcesi",             p:4.8,n:740, c:true},
  ],
  german:[
    {id:"g1",ad:"Prof. Klaus Weber", yer:"Berlin, Almanya",   uz:"Grammatik & TestDaF",        p:4.9,n:1800,c:false},
    {id:"g2",ad:"Dr. Hans Mueller",  yer:"Münih, Almanya",    uz:"İş Almancası & C2",          p:4.7,n:1200,c:false},
    {id:"g3",ad:"Anna Schneider",    yer:"Hamburg, Almanya",  uz:"Konuşma & Telaffuz",         p:4.9,n:2100,c:false},
    {id:"g4",ad:"Dr. Maria Fischer", yer:"Viyana, Avusturya", uz:"A1-B2 & Günlük Almanca",     p:4.8,n:1600,c:false},
    {id:"g5",ad:"Felix Braun",       yer:"Köln, Almanya",     uz:"Çocuklara Eğlenceli Almanca",p:4.9,n:650, c:true},
    {id:"g6",ad:"Lena Hoffmann",     yer:"Stuttgart, Almanya",uz:"Çocuk Almancası",            p:4.8,n:520, c:true},
  ],
  italian:[
    {id:"i1",ad:"Marco Rossi",           yer:"Roma, İtalya",    uz:"Conversazione & Cultura",  p:4.8,n:1400,c:false},
    {id:"i2",ad:"Prof. Antonio Bianchi", yer:"Floransa, İtalya",uz:"Grammatica & CILS",        p:4.9,n:1100,c:false},
    {id:"i3",ad:"Sofia De Luca",         yer:"Milano, İtalya",  uz:"Moda İtalyancası & İş",    p:4.9,n:1750,c:false},
    {id:"i4",ad:"Giulia Ferrari",        yer:"Napoli, İtalya",  uz:"Konuşma & Telaffuz",       p:4.7,n:980, c:false},
    {id:"i5",ad:"Luca Marino",           yer:"Torino, İtalya",  uz:"Çocuklara İtalyanca",      p:4.8,n:430, c:true},
    {id:"i6",ad:"Chiara Esposito",       yer:"Roma, İtalya",    uz:"Çocuk İtalyancası",        p:4.9,n:380, c:true},
  ],
  french:[
    {id:"f1",ad:"Pierre Dubois",       yer:"Paris, Fransa",    uz:"Grammaire & DELF",   p:4.8,n:1900,c:false},
    {id:"f2",ad:"Dr. Jean-Luc Martin", yer:"Lyon, Fransa",     uz:"Fransız Edebiyatı",  p:4.9,n:1200,c:false},
    {id:"f3",ad:"Marie Dupont",        yer:"Paris, Fransa",    uz:"Konuşma & Telaffuz", p:4.9,n:2300,c:false},
    {id:"f4",ad:"Camille Bernard",     yer:"Bordeaux, Fransa", uz:"İş Fransızcası",     p:4.7,n:1050,c:false},
    {id:"f5",ad:"Theo Laurent",        yer:"Marseille, Fransa",uz:"Çocuklara Fransızca",p:4.8,n:490, c:true},
    {id:"f6",ad:"Amelie Petit",        yer:"Nice, Fransa",     uz:"Çocuk Fransızcası",  p:4.9,n:420, c:true},
  ],
  japanese:[
    {id:"j1",ad:"Tanaka Hiroshi",  yer:"Tokyo, Japonya",   uz:"JLPT N1-N2 & İş Japonca", p:4.9,n:2200,c:false},
    {id:"j2",ad:"Yamamoto Kenji",  yer:"Osaka, Japonya",   uz:"Hiragana & Katakana",      p:4.8,n:1700,c:false},
    {id:"j3",ad:"Suzuki Yuki",     yer:"Tokyo, Japonya",   uz:"Konuşma & Günlük Japonca", p:4.9,n:2500,c:false},
    {id:"j4",ad:"Nakamura Hana",   yer:"Kyoto, Japonya",   uz:"Kültür & Başlangıç JLPT",  p:4.8,n:1900,c:false},
    {id:"j5",ad:"Öğrt. Sato Riku", yer:"Tokyo, Japonya",   uz:"Çocuklara Eğlenceli Japonca",p:4.9,n:680,c:true},
    {id:"j6",ad:"Öğrt. Ito Sakura",yer:"Osaka, Japonya",   uz:"Çocuk Japonca",            p:4.8,n:520, c:true},
  ],
  turkish:[
    {id:"t1",ad:"Prof. Mehmet Yıldız",yer:"İstanbul, Türkiye",uz:"Dilbilgisi & Yazma",      p:4.9,n:1500,c:false},
    {id:"t2",ad:"Dr. Ali Kaya",       yer:"Ankara, Türkiye",  uz:"Yabancılara Türkçe",      p:4.8,n:1100,c:false},
    {id:"t3",ad:"Prof. Ayşe Demir",   yer:"İstanbul, Türkiye",uz:"Konuşma & Telaffuz",      p:4.9,n:1900,c:false},
    {id:"t4",ad:"Dr. Zeynep Arslan",  yer:"Bursa, Türkiye",   uz:"Edebiyat & İleri Türkçe", p:4.8,n:1300,c:false},
    {id:"t5",ad:"Öğrt. Burak Şahin", yer:"İzmir, Türkiye",   uz:"Çocuklara Türkçe",        p:4.9,n:620, c:true},
    {id:"t6",ad:"Öğrt. Elif Kılıç",  yer:"Ankara, Türkiye",  uz:"Çocuk Türkçesi",          p:4.8,n:540, c:true},
  ],
  russian:[
    {id:"r1",ad:"Prof. Dmitri Volkov", yer:"Moskova, Rusya",      uz:"Kiril & Rus Grameri", p:4.9,n:1600,c:false},
    {id:"r2",ad:"Dr. Alexei Petrov",   yer:"St.Petersburg, Rusya",uz:"İş Rusçası & TORFL",  p:4.8,n:1200,c:false},
    {id:"r3",ad:"Dr. Natasha Ivanova", yer:"Moskova, Rusya",      uz:"Konuşma & Telaffuz",  p:4.9,n:2000,c:false},
    {id:"r4",ad:"Prof. Elena Sorokina",yer:"Kazan, Rusya",        uz:"Edebiyat & Rusça",    p:4.8,n:1400,c:false},
    {id:"r5",ad:"Öğrt. Ivan Novikov",  yer:"Moskova, Rusya",      uz:"Çocuklara Rusça",     p:4.9,n:560, c:true},
    {id:"r6",ad:"Öğrt. Olga Morozova", yer:"Novosibirsk, Rusya",  uz:"Çocuk Rusçası",       p:4.8,n:480, c:true},
  ],
  spanish:[
    {id:"s1",ad:"Prof. Carlos García",  yer:"Madrid, İspanya",   uz:"Gramática & DELE",           p:4.9,n:2400,c:false},
    {id:"s2",ad:"Dr. Miguel Rodríguez", yer:"Barselona, İspanya", uz:"İş İspanyolcası",            p:4.8,n:1800,c:false},
    {id:"s3",ad:"Ana Martínez",         yer:"Sevilla, İspanya",   uz:"Conversación",               p:4.9,n:2600,c:false},
    {id:"s4",ad:"Dr. Isabel López",     yer:"Valencia, İspanya",  uz:"Latin Amerika İspanyolcası", p:4.8,n:2100,c:false},
    {id:"s5",ad:"Öğrt. Diego Sánchez",  yer:"Madrid, İspanya",    uz:"Çocuklara İspanyolca",       p:4.9,n:720, c:true},
    {id:"s6",ad:"Öğrt. Lucía Fernández",yer:"Barselona, İspanya", uz:"Çocuk İspanyolcası",         p:4.8,n:640, c:true},
  ],
};

// ─── AVATAR ──────────────────────────────────────────────────────────────────
function Av({h, dil, sz=64}) {
  const ini = h.ad.split(" ").slice(-2).map(w=>w[0]).join("");
  return (
    <div style={{
      width:sz, height:sz, borderRadius:"50%", flexShrink:0, position:"relative",
      background:`linear-gradient(145deg,${dil.renk},${dil.renk}cc)`,
      border:`${sz>50?3:2}px solid ${dil.vurgu}`,
      display:"flex", alignItems:"center", justifyContent:"center",
      boxShadow:`0 0 20px ${dil.vurgu}33`
    }}>
      <span style={{fontSize:sz>80?28:sz>50?18:12, fontWeight:900, color:"#fff", fontFamily:"Georgia,serif"}}>{ini}</span>
      {h.c && sz>50 && (
        <div style={{position:"absolute",top:-4,right:-4,width:20,height:20,borderRadius:"50%",
          background:K.gold,border:`2px solid ${K.bg}`,display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:10,color:"#fff",fontWeight:700}}>★</div>
      )}
    </div>
  );
}

// ─── GİRİŞ / KAYIT MODAL ────────────────────────────────────────────────────
function AuthModal({ilkMod, kapat, basari}) {
  const [mod, setMod]     = useState(ilkMod || "giris");
  const [f, setF]         = useState({ad:"",email:"",tel:"",tc:"",dogum:"",sehir:"",sifre:"",sifre2:"",onay:false});
  const [h, setH]         = useState({});
  const [tamam, setTamam] = useState(false);
  const [mesaj, setMesaj] = useState("");

  const inp = (k, tip, yer) => (
    <div style={{marginBottom:10}}>
      <input type={tip} value={f[k]} placeholder={yer}
        onChange={e => { setF(p=>({...p,[k]:e.target.value})); setH(p=>({...p,[k]:""})); }}
        style={{width:"100%",padding:"10px 13px",background:K.bg3,
          border:`1px solid ${h[k]?K.err:K.bdr}`,borderRadius:9,
          color:K.tx,fontSize:13,outline:"none",boxSizing:"border-box"}} />
      {h[k] && <div style={{color:K.errL,fontSize:11,marginTop:3}}>{h[k]}</div>}
    </div>
  );

  const doGiris = () => {
    const e = {};
    if (!f.email) e.email = "E-posta gerekli";
    if (!f.sifre) e.sifre = "Şifre gerekli";
    if (Object.keys(e).length) { setH(e); return; }
    const a = getA();
    const u = (a.users||[]).find(x => x.email.toLowerCase()===f.email.toLowerCase() && x.pw===f.sifre);
    if (!u) { setH({sifre:"E-posta veya şifre hatalı"}); return; }
    basari(getA().users.find(x=>x.id===u.id) || u);
  };

  const doKayit = () => {
    const e = {};
    if (!f.ad.trim())  e.ad = "Zorunlu";
    if (!f.email.includes("@")) e.email = "Geçerli e-posta";
    if (!f.tel.trim()) e.tel = "Zorunlu";
    if (f.tc.length!==11 || !/^\d+$/.test(f.tc)) e.tc = "11 haneli TC";
    if (!f.dogum)      e.dogum = "Zorunlu";
    if (!f.sehir.trim()) e.sehir = "Zorunlu";
    if (f.sifre.length < 6)  e.sifre = "En az 6 karakter";
    if (f.sifre !== f.sifre2) e.sifre2 = "Şifreler eşleşmiyor";
    if (!f.onay) e.onay = "Onay zorunlu";
    if (Object.keys(e).length) { setH(e); return; }
    const a = getA();
    if ((a.users||[]).find(x=>x.email.toLowerCase()===f.email.toLowerCase())) {
      setH({email:"Bu e-posta zaten kayıtlı"}); return;
    }
    const yeni = {
      id:Date.now(), ad:f.ad, email:f.email, tel:f.tel, tc:f.tc,
      dogum:f.dogum, sehir:f.sehir, pw:f.sifre,
      plan:"Deneme", durum:"Deneme", dil:"—",
      tarih:new Date().toLocaleDateString("tr-TR"),
      odeme:"₺0", trialStart:Date.now(), hediye:false
    };
    setA({...a, users:[...(a.users||[]), yeni]});
    setTamam(true);
    basari(yeni);
  };

  const doSifre = () => {
    if (!f.email.includes("@")) { setH({email:"Geçerli e-posta girin"}); return; }
    setMesaj("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
  };

  const tabS = a => ({
    flex:1, padding:"10px", border:"none", cursor:"pointer", fontWeight:700, fontSize:13,
    background: a ? `linear-gradient(135deg,${K.g2},${K.t2})` : K.bg3,
    color: a ? "#fff" : K.tx3, borderRadius:8
  });
  const btnP = {width:"100%",padding:12,background:`linear-gradient(135deg,${K.g2},${K.t2})`,color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14,marginBottom:8};
  const btnG = {width:"100%",padding:11,background:"transparent",color:K.tx2,border:`1px solid ${K.bdr}`,borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:13,marginBottom:8};
  const lnk  = {background:"none",border:"none",color:K.tL,cursor:"pointer",fontSize:12,fontWeight:600};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9000}}>
      <div style={{background:K.card,borderRadius:22,padding:24,width:390,border:`1px solid ${K.bdr3}`,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.8)"}}>

        {/* Başlık */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          {mod !== "unuttu" && (
            <div style={{display:"flex",gap:6,flex:1}}>
              <button style={tabS(mod==="giris")} onClick={()=>{setMod("giris");setH({});}}>Giriş Yap</button>
              <button style={tabS(mod==="kayit")} onClick={()=>{setMod("kayit");setH({});setTamam(false);}}>Üye Ol</button>
            </div>
          )}
          {mod === "unuttu" && <div style={{color:K.tx,fontSize:16,fontWeight:700}}>Şifremi Unuttum</div>}
          <button onClick={kapat} style={{background:"none",border:"none",color:K.tx3,fontSize:22,cursor:"pointer",marginLeft:8}}>✕</button>
        </div>

        {/* ── GİRİŞ ── */}
        {mod === "giris" && <>
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>E-posta</div>
          {inp("email","email","ornek@mail.com")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>Şifre</div>
          {inp("sifre","password","••••••••")}
          <div style={{textAlign:"right",marginBottom:14}}>
            <button style={lnk} onClick={()=>{setMod("unuttu");setH({});setMesaj("");}}>
              Şifremi Unuttum
            </button>
          </div>
          <button style={btnP} onClick={doGiris}>Giriş Yap</button>
          <div style={{textAlign:"center",color:K.tx3,fontSize:12}}>
            Hesabın yok mu? <button style={lnk} onClick={()=>{setMod("kayit");setH({});setTamam(false);}}>Üye Ol</button>
          </div>
        </>}

        {/* ── KAYIT ── */}
        {mod === "kayit" && (tamam ? (
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:56,marginBottom:12}}>🎉</div>
            <div style={{color:K.tx,fontSize:20,fontWeight:700,marginBottom:8}}>Hoş Geldin!</div>
            <div style={{color:K.tx3,fontSize:13,marginBottom:20}}>5 günlük ücretsiz denemen başladı.</div>
            <button style={btnP} onClick={kapat}>Derse Başla →</button>
            <button style={btnG} onClick={kapat}>Ana Sayfaya Dön</button>
          </div>
        ) : <>
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>Ad Soyad</div>{inp("ad","text","İsim Soyisim")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>E-posta</div>{inp("email","email","ornek@mail.com")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>Telefon</div>{inp("tel","tel","05XX XXX XXXX")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>T.C. Kimlik No</div>{inp("tc","text","12345678901")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>Doğum Tarihi</div>{inp("dogum","date","")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>Şehir</div>{inp("sehir","text","İstanbul")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>Şifre</div>{inp("sifre","password","min 6 karakter")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>Şifre Tekrar</div>{inp("sifre2","password","tekrar girin")}
          <div style={{background:K.bg3,borderRadius:9,padding:11,marginBottom:12,border:`1px solid ${K.bdr}`}}>
            <label style={{display:"flex",gap:9,cursor:"pointer",alignItems:"flex-start"}}>
              <input type="checkbox" checked={f.onay} onChange={e=>setF(p=>({...p,onay:e.target.checked}))} style={{marginTop:2,width:15,height:15,accentColor:K.gL}}/>
              <span style={{color:K.tx3,fontSize:11,lineHeight:1.6}}>Platform hizmet kalitesi kontrolleri kapsamındaki denetim uygulamalarını ve gizlilik politikasını okudum, kabul ediyorum.</span>
            </label>
            {h.onay && <div style={{color:K.errL,fontSize:10,marginTop:4}}>{h.onay}</div>}
          </div>
          <button style={btnP} onClick={doKayit}>Kayıt Ol →</button>
          <div style={{textAlign:"center",color:K.tx3,fontSize:12}}>
            Zaten hesabın var mı? <button style={lnk} onClick={()=>{setMod("giris");setH({});}}>Giriş Yap</button>
          </div>
        </>)}

        {/* ── ŞİFREMİ UNUTTUM ── */}
        {mod === "unuttu" && (mesaj ? (
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:50,marginBottom:12}}>📧</div>
            <div style={{color:K.tx,fontSize:16,fontWeight:700,marginBottom:8}}>E-posta Gönderildi!</div>
            <div style={{color:K.tx3,fontSize:13,marginBottom:20}}>{mesaj}</div>
            <button style={btnP} onClick={()=>setMod("giris")}>Giriş Yap</button>
          </div>
        ) : <>
          <div style={{color:K.tx3,fontSize:12,marginBottom:14,lineHeight:1.6}}>Kayıtlı e-posta adresinizi girin. Şifre sıfırlama bağlantısı göndereceğiz.</div>
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>E-posta</div>
          {inp("email","email","ornek@mail.com")}
          <button style={btnP} onClick={doSifre}>Sıfırlama E-postası Gönder</button>
          <div style={{textAlign:"center"}}>
            <button style={lnk} onClick={()=>setMod("giris")}>← Giriş Yap'a Dön</button>
          </div>
        </>)}
      </div>
    </div>
  );
}

// ─── DERS EKRANI ─────────────────────────────────────────────────────────────
  function DersEkrani ({dilId, hoca, kul, kapat}) {
  const dil = DILLER.find(d => d.id === dilId);
  const [msgs, setMsgs]     = useState([]);
  const [yazi, setYazi]     = useState("");
  const [yukl, setYukl]     = useState(false);
  const [mikr, setMikr]     = useState(false);
  const [mikErr, setMikErr] = useState("");
  const [sure, setSure]     = useState(kul?.plan==="Deneme" ? 1200 : 0);
  const [dilMod, setDilMod] = useState(null);
  const [seviye, setSeviyeState] = useState(() => kul?.id ? getSeviye(kul.id, dilId) : "A1");
  const sonRef = useRef(null);
  const recRef = useRef(null);
  const konusmaRef = useRef(false);
  const dersBaslangic = useRef(Date.now());
  
  // Geri sayım
  useEffect(() => {
    if (kul?.plan === "Deneme") {
      const ti = setInterval(() => setSure(s => { if (s<=1){clearInterval(ti);return 0;} return s-1; }), 1000);
      return () => clearInterval(ti);
    }
  }, []);

  // Dil seçilince karşılama mesajı
  const BESMELE_DILLER = ["quran","arabic","medrese"];
  const BESMELE = "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0671\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650\n" +
    "Bismillâhirrahmânirrahîm\n" +
    "Rahman ve Rahim olan Allah'ın adıyla\n\n" +
    "\u0631\u064e\u0628\u0650\u0651 \u064a\u064e\u0633\u0650\u0651\u0631\u0652 \u0648\u064e\u0644\u064e\u0627 \u062a\u064f\u0639\u064e\u0633\u0650\u0651\u0631\u0652\u060c \u0631\u064e\u0628\u0650\u0651 \u062a\u064e\u0645\u0650\u0651\u0645\u0652 \u0628\u0650\u0627\u0644\u0652\u062e\u064e\u064a\u0652\u0631\u0650\n" +
    "Rabbî yessir ve lâ tuassir, rabbî temmim bil-hayr\n" +
    "Rabbim! Kolaylaştır, zorlaştırma. Rabbim! Hayırla tamamla.\n\n";

  useEffect(() => {
    if (!dilMod) return;
    const ad = kul?.ad?.split(" ")[0] || "";
    const besmeleVar = BESMELE_DILLER.includes(dilId);
    const on = besmeleVar ? BESMELE : "";
    let txt;
    if (dilMod === "tr")
      txt = `${on}Merhaba ${ad}! Ben ${hoca.ad}.\n\nUzmanlığım: ${hoca.uz}\n\nDersimizi Türkçe yapacağız. Mikrofona basarak sesli veya yazarak konuşabilirsin. Hayırlı dersler! 🤲`;
    else if (dilMod === "hedef")
      txt = `${on}Merhaba ${ad}! Ben ${hoca.ad}.\n\nUzmanlığım: ${hoca.uz}\n\n${dil.ad} dilinde ders yapacağız. Hazır mısın?`;
    else
      txt = `${on}Merhaba ${ad}! Ben ${hoca.ad}.\n\nUzmanlığım: ${hoca.uz}\n\nHem Türkçe hem ${dil.ad} kullanarak ders yapacağız. Hayırlı dersler! 🤲`;
    setMsgs([{r:"ai", t:txt}]);

    // Besmele + Rabbu Yessir sesli oku
    if (besmeleVar) {
      setTimeout(async () => {
        try {
          const besmeleSes = "Bismillahirrahmanirrahim. Rabbi yessir vela tuassir rabbi temmim bilhayr.";
          await elevenTTS(besmeleSes, hoca.id, "ar-SA");
        } catch {}
      }, 500);
    }
  }, [dilMod]);

  useEffect(() => { sonRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  // Sistem promptu
  const getMedresePrompt = () => {
    if (dilMod === "tr")
      return `Sen ${hoca.ad} adlı uzman bir medrese hocasısın. ${hoca.yer} kökenlisin. Uzmanlık: ${hoca.uz}. SADECE TÜRKÇE yanıt ver. Samimi, sabırlı ve şefkatli bir hoca gibi konuş. İslami adap ile başla. Öğrencinin sorularını Kuran ve Sünnet ışığında cevapla. Hataları nazikçe düzelt. Maks 3 paragraf.`;
    if (dilMod === "hedef")
      return `أنت ${hoca.ad}، مدرس ديني خبير. تخصصك: ${hoca.uz}. أجب فقط باللغة العربية. كن لطيفًا وصبورًا. صحح الأخطاء بلطف. ثلاث فقرات كحد أقصى.`;
    return `Sen ${hoca.ad} adlı uzman bir medrese hocasısın. ${hoca.yer} kökenlisin. Uzmanlık: ${hoca.uz}. Hem Türkçe hem Arapça kullan. Açıklamaları Türkçe yap, Arapça ibareleri Türkçe okunuşuyla da ver. Hataları nazikçe düzelt. Maks 3 paragraf.`;
  };

  const getPrompt = () => {
    const persona = getPersona(hoca.id);
    const mufredatInfo = getMufredatPrompt(dilId, seviye);
    const hafizaInfo = kul?.id ? getHafizaPrompt(kul.id, dilId) : "";
    const guvenlikBilgi = getGuvenlikPrompt(dilId);
    const guvenlik = " ÖNEMLI: Müstehcen veya hakaret içerikli mesajlara yanıt verme.";

    if (dilId === "medrese") {
      return getMedresePrompt() + mufredatInfo + hafizaInfo + guvenlikBilgi;
    }

    const temel = "Sen " + hoca.ad + " adlı uzman bir AI dil öğretmenisin. " + hoca.yer + " kökenlisin. " + dil.ad + " öğretiyorsun. Uzmanlık: " + hoca.uz + ".\n" +
      "Öğretme stili: " + persona.stil + "\nHata düzeltme: " + persona.duzeltme + "\n" +
      "Öğrencinin seviyesi: " + seviye + "\n" +
      mufredatInfo + "\n" + hafizaInfo + "\n" + guvenlikBilgi + "\n" + guvenlik;

    if (dilMod === "tr")
      return temel + "\nSADECE TÜRKÇE yanıt ver. Samimi konuş, tıpkı telefonda gibi. Hataları MUTLAKA düzelt. Maks 3 paragraf.";
    if (dilMod === "hedef")
      return temel + "\nSADECE " + dil.ad + " dilinde yanıt ver. Hataları MUTLAKA düzelt. Maks 3 paragraf.";
    return temel + "\nHem Türkçe hem " + dil.ad + " kullan. Hataları MUTLAKA düzelt. Maks 3 paragraf.";
  };

  // ── DİL SEÇİM EKRANI ──
  if (!dilMod) {
  (
      <div style={{position:"fixed",inset:0,background:K.bg,display:"flex",alignItems:"center",justifyContent:"center",zIndex:8000}}>
        <div style={{background:K.card,borderRadius:22,padding:36,width:400,border:`1px solid ${K.bdr3}`,textAlign:"center",boxShadow:"0 24px 64px rgba(0,0,0,0.8)"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}><Av h={hoca} dil={dil} sz={80}/></div>
          <div style={{color:K.tx,fontSize:18,fontWeight:800,marginBottom:4}}>{hoca.ad}</div>
          <div style={{color:dil.vurgu,fontSize:12,marginBottom:4}}>{hoca.yer}</div>
          <div style={{color:K.tx3,fontSize:13,marginBottom:24}}>{hoca.uz}</div>
          <div style={{color:K.tx2,fontSize:14,fontWeight:700,marginBottom:16}}>Ders dilini seç:</div>
          {[
            {id:"tr",     b:"🇹🇷 Türkçe",          a:"Hoca Türkçe açıklar ve konuşur"},
            {id:"hedef",  b:`${dil.bayrak} ${dil.ad}`, a:`Hoca ${dil.ad} konuşur`},
            {id:"iki",    b:"🔄 İkidilli",            a:`Türkçe + ${dil.ad} karışık`},
          ].map(s => (
            <div key={s.id} onClick={() => setDilMod(s.id)}
              style={{background:K.bg3,borderRadius:12,padding:"14px 18px",marginBottom:10,cursor:"pointer",border:`1px solid ${K.bdr}`,textAlign:"left"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=dil.vurgu;e.currentTarget.style.background="rgba(46,125,50,0.1)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=K.bdr;e.currentTarget.style.background=K.bg3;}}>
              <div style={{color:K.tx,fontWeight:700,fontSize:14}}>{s.b}</div>
              <div style={{color:K.tx3,fontSize:12,marginTop:3}}>{s.a}</div>
            </div>
          ))}
          <button onClick={kapat} style={{marginTop:10,padding:"9px 24px",background:"transparent",color:K.tx4,border:`1px solid ${K.bdr}`,borderRadius:9,cursor:"pointer",fontSize:13}}>← Geri</button>
        </div>
      </div>
    );
  }

  // ── TELEFON MODU MİKROFON ──
  const mikToggle = () => {
    if (konusmaRef.current) {
      // Mikrofonu kapat
      konusmaRef.current = false;
      try { recRef.current?.stop(); } catch {}
      setMikr(false);
      return;
    }
    // Mikrofonu aç - telefon gibi sürekli dinle
    konusmaRef.current = true;
    mikDinle();
  };

  const mikDinle = () => {
    if (!konusmaRef.current) return; // Kapatıldıysa dur
    setMikErr("");
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setMikErr("Tarayıcınız ses girişini desteklemiyor."); konusmaRef.current = false; return; }
    try {
      const r = new SR();
      // DİL SORUNU: Seçilen dile göre mikrofon dili
      // Türkçe seçtiyse TR dinle, hedef dil seçtiyse o dili dinle
      if (dilMod === "tr") r.lang = "tr-TR";
      else if (dilMod === "hedef") r.lang = dil.mic;
      else r.lang = "tr-TR"; // ikidilli modda Türkçe dinle
      r.continuous = false;
      r.interimResults = false;
      r.onstart = () => setMikr(true);
      r.onresult = e => {
        const metin = e.results[0][0].transcript;
        // Ekrana yaz - dile göre doğru dilde
        setMsgs(m => [...m, {r:"user", t:metin}]);
        // Hocanın yanıt vermesini bekle
        setMikr(false);
        gonderSesli(metin);
      };
      r.onerror = e => {
        setMikr(false);
        if (e.error === "no-speech") {
          // Sessizlik - tekrar dinlemeye başla
          if (konusmaRef.current) setTimeout(mikDinle, 500);
        } else if (e.error === "not-allowed") {
          setMikErr("Mikrofon izni reddedildi.");
          konusmaRef.current = false;
        } else {
          if (konusmaRef.current) setTimeout(mikDinle, 500);
        }
      };
      r.onend = () => {
        setMikr(false);
        // Hoca konuşmuyorsa tekrar dinlemeye başla
        if (konusmaRef.current && !yukl) {
          setTimeout(mikDinle, 800);
        }
      };
      recRef.current = r;
      r.start();
    } catch { setMikErr("Mikrofon başlatılamadı."); konusmaRef.current = false; }
  };

  // Uygunsuz içerik kontrolü
  const uygunsuzKelimeler = ["sex","porn","küfür","sik","orospu","amk","göt","meme","nude","hack","bomb","terör"];
  const uygunsuzMu = (txt) => uygunsuzKelimeler.some(k => txt.toLowerCase().includes(k));

  // Adaptif zorluk kontrolü
  const adaptifKontrol = () => {
    if (!kul?.id) return;
    const kulMsgSayisi = msgs.filter(m=>m.r==="user").length;
    if (kulMsgSayisi > 0 && kulMsgSayisi % 8 === 0) {
      const h = getHafiza(kul.id, dilId);
      const sonHatalar = (h.hatalar||[]).filter(x => x.tekrar > 2).length;
      const svIdx = SEVIYELER.indexOf(seviye);
      if (sonHatalar > 3 && svIdx > 0) {
        setSeviyeState(SEVIYELER[svIdx-1]);
      } else if (sonHatalar === 0 && kulMsgSayisi >= 10 && svIdx < SEVIYELER.length-1) {
        setSeviyeState(SEVIYELER[svIdx+1]);
      }
    }
  };

  const gonderSesli = async (txt) => {
    if (!txt || yukl) return;
    // Uygunsuz içerik kontrolü
    if (uygunsuzMu(txt)) {
      setMsgs(m => [...m, {r:"ai", t:"⚠️ UYARI: Bu tür içerikler platform kurallarına aykırıdır. Lütfen derse odaklanın. Tekrarında üyeliğiniz askıya alınabilir."}]);
      // Admin'e bildirim kaydet
      const a = getA();
      const uyari = {id:Date.now(), kulId:kul?.id, kulAd:kul?.ad, email:kul?.email, mesaj:txt, tarih:new Date().toLocaleString("tr-TR"), tip:"uygunsuz"};
      setA({...a, ihtarlar:[...(a.ihtarlar||[]), uyari]});
      if (konusmaRef.current) setTimeout(mikDinle, 1000);
      return;
    }
    setYukl(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:800,
          system: getPrompt(),
          messages: [
            ...msgs.filter(m=>m.r).map(m => ({role: m.r==="ai"?"assistant":"user", content:m.t})),
            {role:"user", content:txt}
          ]
        })
      });
      if (!res.ok) { const d=await res.json().catch(()=>({})); throw new Error(d?.error?.message || `Hata: ${res.status}`); }
      const d = await res.json();
      const yan = d.content?.[0]?.text;
      if (!yan) throw new Error("Yanıt alınamadı.");
      setMsgs(m => [...m, {r:"ai", t:yan}]);
      // Hafızaya hata kaydı - AI yanıtında "yanlış" veya "hata" geçiyorsa kaydet
      if (kul?.id && (yan.includes("yanlış") || yan.includes("hata") || yan.includes("doğrusu"))) {
        const h = getHafiza(kul.id, dilId);
        h.toplamDers = (h.toplamDers||0) + 1;
        h.sonDers = new Date().toLocaleDateString("tr-TR");
        setHafiza(kul.id, dilId, h);
      }
      // ElevenLabs ile sesli oku - bitince tekrar dinlemeye başla
      try {
        await elevenTTS(yan.substring(0, 500), hoca.id, dilMod==="hedef" ? dil.mic : "tr-TR");
        if (konusmaRef.current) setTimeout(mikDinle, 500);
      } catch {
        if (konusmaRef.current) setTimeout(mikDinle, 500);
      }
    } catch(e) {
      setMsgs(m => [...m, {r:"ai", t:`Bağlantı hatası: ${e.message}`}]);
      if (konusmaRef.current) setTimeout(mikDinle, 500);
    }
    setYukl(false);
  };

  const gonderMetin = async (txt) => {
    if (!txt || yukl) return;
    if (uygunsuzMu(txt)) {
      setMsgs(m => [...m, {r:"ai", t:"⚠️ UYARI: Bu tür içerikler platform kurallarına aykırıdır. Lütfen derse odaklanın. Tekrarında üyeliğiniz askıya alınabilir."}]);
      const a = getA();
      const uyari = {id:Date.now(), kulId:kul?.id, kulAd:kul?.ad||"Admin", email:kul?.email||"admin", mesaj:txt, tarih:new Date().toLocaleString("tr-TR"), tip:"uygunsuz"};
      setA({...a, ihtarlar:[...(a.ihtarlar||[]), uyari]});
      setYazi("");
      return;
    }
    setYazi(""); setYukl(true);
    setMsgs(m => [...m, {r:"user", t:txt}]);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:800,
          system: getPrompt(),
          messages: [
            ...msgs.filter(m=>m.r).map(m => ({role: m.r==="ai"?"assistant":"user", content:m.t})),
            {role:"user", content:txt}
          ]
        })
      });
      if (!res.ok) { const d=await res.json().catch(()=>({})); throw new Error(d?.error?.message || `Hata: ${res.status}`); }
      const d   = await res.json();
      const yan = d.content?.[0]?.text;
      if (!yan) throw new Error("Yanıt alınamadı.");
      setMsgs(m => [...m, {r:"ai", t:yan}]);
      try {
        window.speechSynthesis?.cancel();
        const u = new SpeechSynthesisUtterance(yan.substring(0,200));
        u.lang = dilMod==="hedef" ? dil.mic : "tr-TR";
        u.rate = 0.85; u.pitch = 1.1;
        window.speechSynthesis?.speak(u);
      } catch {}
    } catch(e) {
      setMsgs(m => [...m, {r:"ai", t:`Bağlantı hatası: ${e.message}. İnternet bağlantınızı kontrol edip tekrar deneyin.`}]);
    }
    setYukl(false);
  };

  const gonder = async () => {
    if (!yazi.trim() || yukl) return;
    const txt = yazi.trim(); setYazi(""); setYukl(true);
    setMsgs(m => [...m, {r:"user", t:txt}]);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:800,
          system: getPrompt(),
          messages: [
            ...msgs.filter(m=>m.r).map(m => ({role: m.r==="ai"?"assistant":"user", content:m.t})),
            {role:"user", content:txt}
          ]
        })
      });
      if (!res.ok) { const d=await res.json().catch(()=>({})); throw new Error(d?.error?.message || `Hata: ${res.status}`); }
      const d   = await res.json();
      const yan = d.content?.[0]?.text;
      if (!yan) throw new Error("Yanıt alınamadı.");
      setMsgs(m => [...m, {r:"ai", t:yan}]);
      try {
        window.speechSynthesis?.cancel();
        const u = new SpeechSynthesisUtterance(yan.substring(0,200));
        u.lang = dilMod==="hedef" ? dil.mic : "tr-TR";
        u.rate = 0.85; u.pitch = 1.1;
        window.speechSynthesis?.speak(u);
      } catch {}
    } catch(e) {
      setMsgs(m => [...m, {r:"ai", t:`Bağlantı hatası: ${e.message}. İnternet bağlantınızı kontrol edip tekrar deneyin.`}]);
    }
    setYukl(false);
  };

  const mm = String(Math.floor(sure/60)).padStart(2,"0");
  const ss = String(sure%60).padStart(2,"0");
  const dilLabel = dilMod==="tr" ? "🇹🇷 Türkçe" : dilMod==="hedef" ? `${dil.bayrak} ${dil.ad}` : "🔄 İkidilli";

(
    <div style={{position:"fixed",inset:0,background:K.bg,display:"flex",flexDirection:"column",zIndex:8000}}>
      <style>{`.nk{animation:nk 1s var(--d,0s) infinite}@keyframes nk{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}@keyframes tt{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* Güvenlik bandı */}
      <div style={{background:"rgba(27,94,32,0.2)",padding:"4px 16px",fontSize:11,color:K.gL,textAlign:"center",borderBottom:`1px solid ${K.g2}44`}}>
        🔒 Platform hizmet kalitesi kapsamında denetlenebilir — Kayıt yapılmaz
      </div>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",background:`linear-gradient(135deg,${dil.renk}ee,${dil.renk}99)`,borderBottom:`2px solid ${dil.vurgu}`}}>
        <Av h={hoca} dil={dil} sz={46}/>
        <div style={{flex:1}}>
          <div style={{color:"#fff",fontWeight:700,fontSize:14}}>{hoca.ad}</div>
          <div style={{color:dil.vurgu,fontSize:11}}>{hoca.yer} • {hoca.uz}</div>
        </div>
        <div style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"4px 10px",textAlign:"center"}}>
          <div style={{fontSize:9,color:"#aaa"}}>SEVİYE</div>
          <div style={{fontWeight:800,color:K.gL,fontSize:15}}>{seviye}</div>
        </div>
        <div style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"4px 10px",fontSize:11,color:"#fff",cursor:"pointer"}}
          onClick={() => { setDilMod(null); setMsgs([]); }}>{dilLabel} ↺</div>
        {kul?.plan==="Deneme" && sure>0 && (
          <div style={{background:"rgba(0,0,0,0.4)",borderRadius:8,padding:"4px 12px",textAlign:"center"}}>
            <div style={{fontSize:9,color:"#aaa"}}>KALAN</div>
            <div style={{fontWeight:800,color:sure<300?K.errL:dil.vurgu,fontSize:17}}>{mm}:{ss}</div>
          </div>
        )}
        <button onClick={()=>{
          // Dersi geçmişe kaydet
          if(kul?.id && dilMod){
            const sure = Math.floor((Date.now()-dersBaslangic.current)/60000);
            const gecmis = getDersGecmis(kul.id, dilId);
            const yeniDers = {
              id:Date.now(), tarih:new Date().toLocaleDateString("tr-TR"),
              saat:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"}),
              hoca:hoca.ad, dilMod, sure, mesajSayisi:msgs.filter(m=>m.r==="user").length,
              seviye, ozet: msgs.filter(m=>m.r==="user").slice(-1)[0]?.t || ""
            };
            setDersGecmis(kul.id, dilId, [...gecmis, yeniDers]);
            const yeniSv = seviyeGuncelle(kul.id, dilId);
            if(yeniSv !== seviye) alert("🎉 Tebrikler! " + yeniSv + " seviyesine ulaştınız!");
          }
          kapat();
        }} style={{background:"rgba(255,255,255,0.12)",border:"none",color:"#fff",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontWeight:700}}>✕ Çıkış</button>
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* Sol panel */}
        <div style={{width:190,background:K.bg2,borderRight:`1px solid ${K.bdr}`,padding:10,display:"flex",flexDirection:"column",gap:10,overflowY:"auto"}}>
          <div style={{background:K.card,borderRadius:10,padding:12,border:`1px solid ${K.bdr2}`,textAlign:"center"}}>
            <div style={{fontSize:9,color:K.tx4,marginBottom:8,fontWeight:700,letterSpacing:1}}>AI HOCAN</div>
            <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Av h={hoca} dil={dil} sz={76}/></div>
            <div style={{color:K.tx,fontWeight:700,fontSize:13}}>{hoca.ad}</div>
            <div style={{color:dil.vurgu,fontSize:10,marginTop:3}}>{hoca.yer}</div>
            <div style={{color:K.tx3,fontSize:10,marginTop:3}}>{hoca.uz}</div>
            <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:8}}>
              <span style={{color:dil.vurgu,fontSize:12}}>⭐ {hoca.p}</span>
              <span style={{color:K.tx4,fontSize:11}}>{hoca.n.toLocaleString()}</span>
            </div>
            {yukl && <div style={{marginTop:6,color:K.gL,fontSize:10,animation:"tt 1s infinite"}}>Yanıt yazıyor...</div>}
          </div>
          <div style={{background:K.card,borderRadius:10,padding:12,border:`1px solid ${K.bdr}`,textAlign:"center"}}>
            <div style={{fontSize:9,color:K.tx4,marginBottom:6,fontWeight:700,letterSpacing:1}}>KAMERA</div>
            <div style={{background:K.bg3,borderRadius:8,padding:"12px 10px"}}>
              <div style={{fontSize:22}}>📷</div>
              <div style={{color:K.warn,fontSize:11,fontWeight:700,marginTop:4}}>Yakında!</div>
            </div>
          </div>
          {mikErr && <div style={{background:"rgba(198,40,40,0.12)",borderRadius:8,padding:10,color:K.errL,fontSize:11,border:`1px solid ${K.err}44`}}>{mikErr}</div>}
          <div style={{background:K.card,borderRadius:10,padding:12}}>
            <div style={{fontSize:9,color:K.tx4,marginBottom:8,fontWeight:700,letterSpacing:1}}>MODÜLLER</div>
            {dil.mods.map(m => <div key={m} style={{padding:"6px 10px",borderRadius:7,marginBottom:4,background:K.bg3,color:K.tx2,fontSize:11,borderLeft:`3px solid ${dil.vurgu}55`}}>{m}</div>)}
          </div>
          <div style={{background:K.card,borderRadius:10,padding:12,textAlign:"center"}}>
            <div style={{fontSize:9,color:K.tx4,marginBottom:6,fontWeight:700,letterSpacing:1}}>DERS DİLİ</div>
            <div style={{color:K.gL,fontSize:12,fontWeight:600}}>{dilLabel}</div>
            <button onClick={() => { setDilMod(null); setMsgs([]); }}
              style={{width:"100%",marginTop:8,padding:"7px",borderRadius:7,background:"rgba(46,125,50,0.12)",color:K.gL,border:`1px solid ${K.g2}44`,cursor:"pointer",fontSize:11,fontWeight:600}}>
              Dil Değiştir
            </button>
          </div>
        </div>

        {/* Sohbet */}
        <div style={{flex:1,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12}}>
            {msgs.map((m,i) => (
              <div key={i} style={{display:"flex",justifyContent:m.r==="user"?"flex-end":"flex-start",gap:8,alignItems:"flex-start"}}>
                {m.r==="ai" && <Av h={hoca} dil={dil} sz={32}/>}
                <div style={{maxWidth:"70%"}}>
                  <div style={{fontSize:10,color:K.tx4,marginBottom:3,textAlign:m.r==="user"?"right":"left"}}>
                    {m.r==="user" ? "Sen" : "🤖 "+hoca.ad.split(" ")[0]}
                  </div>
                  <div style={{padding:"11px 14px",borderRadius:16,color:K.tx,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap",
                    background: m.r==="user" ? `linear-gradient(135deg,${K.g2},${K.t2})` : K.card,
                    borderBottomRightRadius: m.r==="user" ? 4 : 16,
                    borderBottomLeftRadius:  m.r==="ai"   ? 4 : 16,
                    border: m.r==="ai" ? `1px solid ${K.bdr}` : "none"}}>
                    {m.t}
                  </div>
                </div>
              </div>
            ))}
            {yukl && (
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Av h={hoca} dil={dil} sz={32}/>
                <div style={{background:K.card,borderRadius:16,padding:"10px 16px",border:`1px solid ${K.bdr}`,display:"flex",gap:4,alignItems:"center"}}>
                  {[0,1,2].map(i => <div key={i} className="nk" style={{"--d":`${i*0.18}s`,width:7,height:7,borderRadius:"50%",background:K.gL}}/>)}
                </div>
              </div>
            )}
            <div ref={sonRef}/>
          </div>

          {/* Input */}
          <div style={{padding:12,borderTop:`1px solid ${K.bdr}`,background:K.bg2}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={mikToggle}
                style={{width:46,height:46,borderRadius:"50%",
                  background:mikr?"rgba(198,40,40,0.25)":K.bg3,
                  border:`2px solid ${mikr?K.errL:K.g3}`,cursor:"pointer",fontSize:19,flexShrink:0,
                  animation:mikr?"tt 0.5s infinite":"none",userSelect:"none",WebkitUserSelect:"none",
                  boxShadow:mikr?`0 0 20px ${K.errL}55`:"none"}}>
                {mikr ? "🔴" : "🎤"}
              </button>
              <input value={yazi} onChange={e=>setYazi(e.target.value)}
                onKeyDown={e => e.key==="Enter" && !e.shiftKey && gonder()}
                placeholder={mikr ? "🎤 Dinliyorum... (tekrar bas gönder)" : "Mesaj yaz veya 🎤 bas konuş..."}
                style={{flex:1,background:K.bg3,border:`1px solid ${K.bdr}`,borderRadius:10,padding:"12px 14px",color:K.tx,fontSize:13,outline:"none"}}/>
              <button onClick={gonder} disabled={yukl || !yazi.trim()}
                style={{padding:"12px 20px",borderRadius:10,fontWeight:700,fontSize:15,border:"none",flexShrink:0,
                  cursor: yukl||!yazi.trim() ? "not-allowed" : "pointer",
                  background: yukl||!yazi.trim() ? K.bg3 : `linear-gradient(135deg,${K.g2},${K.t2})`,
                  color: yukl||!yazi.trim() ? K.tx4 : "#fff"}}>➤</button>
            </div>
            <div style={{textAlign:"center",color:K.tx4,fontSize:10,marginTop:5}}>
              🎤 Bas konuş, tekrar bas gönder • ⌨️ Yaz Enter'a bas • Her konuşma ekrana yazılır
            </div>
          </div>
        </div>
      </div>
    </div>
  );


// ─── ADMİN PANELİ ────────────────────────────────────────────────────────────
function AdminPanel({kapat, admCikis}) {
  const [sekme, setSekme] = useState("dash");
  const [cfg, setCfg]     = useState(getA());
  const [kayd, setKayd]   = useState(false);
  const [hE, setHE]       = useState(""); const [hT, setHT] = useState("7 Gün"); const [hOk, setHOk] = useState(false); const [hErr, setHErr] = useState("");
  const [p1, setP1]       = useState(""); const [p2, setP2] = useState(""); const [pMsg, setPMsg] = useState("");
  const [izle, setIzle]   = useState(null);

  const kaydet = y => { setCfg(y); setA(y); setKayd(true); setTimeout(()=>setKayd(false),2000); };

  const kul  = cfg.users || [];
  const ode  = cfg.pays  || [];
  const toplam = kul.length;
  const aktif  = kul.filter(u=>u.durum==="Aktif").length;
  const deneme = kul.filter(u=>u.durum==="Deneme").length;
  const bekl   = ode.filter(o=>o.d==="bekle").length;
  const gelir  = kul.reduce((t,u)=>{ const n=parseInt((u.odeme||"0").replace(/[^0-9]/g,"")); return t+(isNaN(n)?0:n); }, 0);

  const onayOde = id => {
    const o = ode.find(x=>x.id===id); if (!o) return;
    kaydet({...cfg,
      pays: ode.map(x => x.id===id ? {...x,d:"ok"} : x),
      users: kul.map(u => u.email===o.email ? {...u,plan:o.plan,durum:"Aktif",odeme:`₺${parseInt((u.odeme||"0").replace(/[^0-9]/g,""))+(o.tutar||299)}`} : u)
    });
  };

  const hediye = () => {
    if (!hE.includes("@")) { setHErr("Geçerli e-posta girin"); return; }
    const u = kul.find(x=>x.email===hE);
    if (!u) { setHErr("Kayıtlı kullanıcıda bulunamadı"); return; }
    kaydet({...cfg, users:kul.map(x=>x.email===hE?{...x,plan:hT,durum:"Aktif",hediye:true}:x)});
    setHOk(true);
  };

  const sifreDegis = () => {
    if (p1.length<6)   { setPMsg("En az 6 karakter"); return; }
    if (p1 !== p2)     { setPMsg("Şifreler eşleşmiyor"); return; }
    kaydet({...cfg, pw:p1}); setPMsg("✅ Güncellendi!"); setP1(""); setP2("");
  };

  const gI  = {width:"100%",padding:"10px 12px",background:K.bg3,border:`1px solid ${K.bdr}`,borderRadius:9,color:K.tx,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:11};
  const kd  = {background:K.card,borderRadius:12,padding:16,border:`1px solid ${K.bdr}`,marginBottom:14};
  const bG  = {padding:"10px 18px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:13,border:"none",background:`linear-gradient(135deg,${K.g2},${K.t2})`,color:"#fff"};
  const lnk = {background:"none",border:"none",color:K.tL,cursor:"pointer",fontSize:12,fontWeight:600};

  const SEKMELER = [
    ["dash","📊","Dashboard"],["kul","👥","Kullanıcılar"],["ode","💳","Ödemeler"],
    ["ders","📡","Aktif Dersler"],["iht","⚠️","İhtar Geçmişi"],["hed","🎁","Hediye Ver"],["bil","🔔","Bildirimler"],["set","⚙️","Ayarlar"]
  ];

  return (
    <div style={{position:"fixed",inset:0,background:K.bg,zIndex:7000,display:"flex"}}>
      {/* Sidebar */}
      <div style={{width:210,background:K.bg2,borderRight:`1px solid ${K.bdr}`,display:"flex",flexDirection:"column",padding:14,gap:3}}>
        {/* Logo — tıklayınca uygulamaya dön */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,paddingBottom:14,borderBottom:`1px solid ${K.bdr}`,cursor:"pointer"}}
          onClick={kapat}>
          <div style={{width:34,height:34,borderRadius:9,background:`linear-gradient(135deg,${K.g4},${K.t3})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:17}}>L</div>
          <span style={{fontWeight:900,color:K.tx,fontSize:15}}>Lisan <span style={{color:K.gL}}>Öğren</span></span>
        </div>
        {SEKMELER.map(([id,ic,lb]) => (
          <button key={id} onClick={()=>setSekme(id)}
            style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:9,border:"none",
              background:sekme===id?"rgba(46,125,50,0.18)":"transparent",
              color:sekme===id?K.gL:K.tx4,cursor:"pointer",fontSize:12,textAlign:"left",fontWeight:sekme===id?700:400,
              borderLeft:sekme===id?`3px solid ${K.g3}`:"3px solid transparent"}}>
            {ic} {lb}
          </button>
        ))}
        <div style={{flex:1}}/>
        <button onClick={kapat} style={{padding:"10px 12px",borderRadius:9,border:`1px solid ${K.bdr}`,background:"transparent",color:K.tx4,cursor:"pointer",fontSize:12,marginBottom:6}}>
          ← Uygulamaya Dön
        </button>
        <button onClick={admCikis} style={{padding:"8px 12px",borderRadius:9,border:`1px solid ${K.err}44`,background:"rgba(198,40,40,0.08)",color:K.errL,cursor:"pointer",fontSize:11}}>
          🚪 Admin Çıkışı
        </button>
      </div>

      {/* İçerik */}
      <div style={{flex:1,overflowY:"auto",padding:22}}>

        {sekme==="dash" && <>
          <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Dashboard</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
            {[{l:"Toplam Kullanıcı",v:toplam,c:K.gL},{l:"Aktif Abonelik",v:aktif,c:K.tL},{l:"Deneme Süreci",v:deneme,c:K.warn},
              {l:"Bekleyen Ödeme",v:bekl,c:K.errL},{l:"Toplam Gelir",v:`₺${gelir.toLocaleString()}`,c:K.warn},{l:"Toplam Hoca",v:60,c:K.gL}
            ].map(s => (
              <div key={s.l} style={{...kd,marginBottom:0,padding:16}}>
                <div style={{fontSize:24,fontWeight:900,color:s.c,marginBottom:3}}>{s.v}</div>
                <div style={{color:K.tx4,fontSize:11}}>{s.l}</div>
              </div>
            ))}
          </div>
          {cfg.contactEmail && <div style={kd}><div style={{color:K.tx2,fontSize:12,marginBottom:4,fontWeight:600}}>İletişim E-postası</div><div style={{color:K.gL,fontSize:15,fontWeight:700}}>{cfg.contactEmail}</div></div>}
          {cfg.iban && <div style={kd}><div style={{color:K.tx2,fontSize:12,marginBottom:8,fontWeight:600}}>IBAN</div><div style={{color:K.tx3,fontSize:13,lineHeight:2}}>{cfg.acName}<br/><strong style={{color:K.gL,fontFamily:"monospace"}}>{cfg.iban}</strong><br/>{cfg.bank}</div></div>}
        </>}

        {sekme==="kul" && <>
          <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Kullanıcılar ({toplam})</div>
          {kul.length===0 ? <div style={{...kd,color:K.tx4,textAlign:"center",padding:30}}>Henüz kayıtlı kullanıcı yok</div> : (
            <div style={{...kd,padding:0,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 0.8fr",padding:"9px 14px",background:K.bg3,fontSize:9,color:K.tx4,fontWeight:700,letterSpacing:0.5}}>
                {["AD / E-POSTA","TEL / TC","PLAN","DURUM","GELİR"].map(h=><div key={h}>{h}</div>)}
              </div>
              {kul.map(u => (
                <div key={u.id} style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 0.8fr",padding:"11px 14px",borderTop:`1px solid ${K.bdr}`,alignItems:"center"}}>
                  <div><div style={{color:K.tx,fontSize:12,fontWeight:600}}>{u.ad}</div><div style={{color:K.tx4,fontSize:10}}>{u.email}</div><div style={{color:K.tx4,fontSize:10}}>{u.tarih}</div></div>
                  <div><div style={{color:K.tx2,fontSize:11}}>{u.tel||"—"}</div><div style={{color:K.tx4,fontSize:10}}>{u.tc?`TC: ${u.tc}`:""}</div></div>
                  <div style={{color:K.tx2,fontSize:11}}>{u.plan}{u.hediye&&<span style={{color:K.gL}}> 🎁</span>}</div>
                  <div style={{display:"inline-block",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:600,
                    background:u.durum==="Aktif"?"rgba(46,125,50,0.18)":u.durum==="Deneme"?"rgba(249,168,37,0.15)":"rgba(198,40,40,0.15)",
                    color:u.durum==="Aktif"?K.gL:u.durum==="Deneme"?K.warn:K.errL}}>{u.durum}</div>
                  <div style={{color:K.warn,fontSize:12,fontWeight:700}}>{u.odeme}</div>
                </div>
              ))}
            </div>
          )}
        </>}

        {sekme==="ode" && <>
          <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Ödemeler</div>
          {!cfg.iban && <div style={{background:"rgba(249,168,37,0.1)",border:`1px solid ${K.warn}44`,borderRadius:10,padding:14,marginBottom:14}}><div style={{color:K.warn,fontWeight:700,marginBottom:4}}>⚠️ IBAN girilmemiş</div><div style={{color:K.tx4,fontSize:12}}>Ayarlar sekmesinden IBAN ekleyin.</div></div>}
          {cfg.iban && <div style={kd}><div style={{color:K.tx2,fontWeight:700,marginBottom:10}}>Aktif IBAN</div><div style={{color:K.tx3,fontSize:13,lineHeight:2.2}}>{cfg.acName}<br/><strong style={{color:K.gL,fontFamily:"monospace",fontSize:14}}>{cfg.iban}</strong><br/>{cfg.bank}</div></div>}
          <div style={{color:K.tx,fontWeight:700,marginBottom:12,fontSize:14}}>Bekleyen ({bekl})</div>
          {ode.filter(o=>o.d==="bekle").length===0 ? <div style={{...kd,color:K.tx4,textAlign:"center",fontSize:13}}>Bekleyen ödeme yok</div> :
            ode.filter(o=>o.d==="bekle").map(o => (
              <div key={o.id} style={{...kd,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{color:K.tx,fontWeight:700}}>{o.ad}</div><div style={{color:K.tx4,fontSize:11,marginTop:2}}>{o.email} • {o.plan} • {o.tarih}</div></div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{color:K.warn,fontSize:16,fontWeight:700}}>₺{o.tutar}</div>
                  <button onClick={()=>onayOde(o.id)} style={bG}>✓ Onayla</button>
                </div>
              </div>
            ))}
          <div style={{color:K.tx,fontWeight:700,marginBottom:12,fontSize:14,marginTop:16}}>Onaylananlar</div>
          {ode.filter(o=>o.d==="ok").length===0 ? <div style={{...kd,color:K.tx4,textAlign:"center",fontSize:13}}>Henüz yok</div> :
            ode.filter(o=>o.d==="ok").map(o => (
              <div key={o.id} style={{...kd,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{color:K.tx,fontSize:12}}>{o.ad} — {o.plan}</div></div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{color:K.warn,fontWeight:700}}>₺{o.tutar}</div>
                  <div style={{background:"rgba(46,125,50,0.15)",color:K.gL,borderRadius:5,padding:"2px 8px",fontSize:10,fontWeight:600}}>✓ Onaylı</div>
                </div>
              </div>
            ))}
        </>}

        {sekme==="ders" && <>
          <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:8}}>Aktif Dersler</div>
          <div style={{color:K.tx4,fontSize:12,marginBottom:16}}>Hizmet kalitesi kapsamında izleyebilirsiniz.</div>
          {kul.filter(u=>u.durum==="Aktif").length===0 ? <div style={{...kd,color:K.tx4,textAlign:"center",padding:30}}>Şu an aktif ders yok</div> :
            kul.filter(u=>u.durum==="Aktif").map(u => (
              <div key={u.id} style={{...kd,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{color:K.tx,fontWeight:700}}>{u.ad}</div><div style={{color:K.tx4,fontSize:11,marginTop:2}}>{u.email} • {u.plan}</div></div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{background:"rgba(46,125,50,0.12)",color:K.gL,borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700}}>AKTİF</div>
                  <button onClick={()=>setIzle(u)} style={{padding:"7px 12px",borderRadius:7,background:K.bg3,color:K.tL,border:`1px solid ${K.bdr2}`,cursor:"pointer",fontSize:11,fontWeight:600}}>👁 İzle</button>
                </div>
              </div>
            ))}
          {izle && (
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}}>
              <div style={{background:K.card,borderRadius:18,padding:26,width:360,border:`1px solid ${K.bdr3}`}}>
                <div style={{color:K.tx,fontSize:16,fontWeight:700,marginBottom:4}}>👁 İzleme Modu</div>
                <div style={{color:K.tx4,fontSize:12,marginBottom:14}}>{izle.ad}</div>
                <div style={{background:"rgba(249,168,37,0.08)",borderRadius:10,padding:12,border:`1px solid ${K.warn}33`,marginBottom:14}}>
                  <div style={{color:K.tx4,fontSize:11,lineHeight:1.8}}>• Kullanıcı sizin katıldığınızı görmez<br/>• Kayıt yapılmaz<br/>• Yalnızca hizmet kalitesi denetimi</div>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>setIzle(null)} style={{flex:1,padding:10,background:"transparent",color:K.tx4,border:`1px solid ${K.bdr}`,borderRadius:9,cursor:"pointer"}}>İptal</button>
                  <button onClick={()=>setIzle(null)} style={{...bG,flex:2}}>Derse Katıl</button>
                </div>
              </div>
            </div>
          )}
        </>}

        {sekme==="hed" && <>
          <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Hediye Ver</div>
          <div style={{...kd,maxWidth:440}}>
            {hOk ? (
              <div style={{textAlign:"center",padding:16}}>
                <div style={{fontSize:50,marginBottom:12}}>🎁</div>
                <div style={{color:K.tx,fontSize:18,fontWeight:700,marginBottom:6}}>Gönderildi!</div>
                <div style={{color:K.tx4,fontSize:12,marginBottom:16}}>{hE} → {hT} Ücretsiz</div>
                <button onClick={()=>{setHOk(false);setHE("");}} style={bG}>Tamam</button>
              </div>
            ) : <>
              <div style={{color:K.tx4,fontSize:11,marginBottom:4}}>Kullanıcı E-postası</div>
              <input value={hE} onChange={e=>{setHE(e.target.value);setHErr("");}} placeholder="ornek@mail.com" style={gI}/>
              {hErr && <div style={{color:K.errL,fontSize:11,marginBottom:8}}>{hErr}</div>}
              <div style={{color:K.tx4,fontSize:11,marginBottom:8}}>Hediye Türü</div>
              {["7 Gün","1 Ay","3 Ay","Yıllık","Sınırsız"].map(g => (
                <div key={g} onClick={()=>setHT(g)}
                  style={{padding:"10px 14px",borderRadius:9,background:hT===g?"rgba(46,125,50,0.2)":K.bg3,border:`1px solid ${hT===g?K.g3:K.bdr}`,color:hT===g?K.gL:K.tx2,cursor:"pointer",marginBottom:7,fontSize:12,fontWeight:hT===g?700:400}}>
                  🎁 {g} Ücretsiz
                </div>
              ))}
              <button onClick={hediye} style={{...bG,width:"100%",padding:"12px",marginTop:4,fontSize:14}}>Hediye Gönder</button>
            </>}
          </div>
        </>}

        {sekme==="bil" && <>
          <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Bildirim Gönder</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[
              {t:"Premium Teşvik",  m:"5 günlük denemeniz bitiyor! Premium'a geçin."},
              {t:"Özel İndirim",    m:"Bu hafta yıllık plana özel indirim!"},
              {t:"Yeni Hoca",       m:"Yeni hocalarımız uygulamaya katıldı!"},
              {t:"Ders Hatırlatma", m:"Bugün ders yapmadınız. Hocanız bekliyor."},
            ].map(n => (
              <div key={n.t} style={{...kd,marginBottom:0}}>
                <div style={{color:K.tx,fontWeight:700,marginBottom:6,fontSize:13}}>{n.t}</div>
                <div style={{color:K.tx4,fontSize:11,lineHeight:1.6,marginBottom:10}}>{n.m}</div>
                <button onClick={()=>alert("Bildirim gönderildi!")}
                  style={{width:"100%",padding:"7px",borderRadius:7,background:"rgba(46,125,50,0.12)",color:K.gL,border:`1px solid ${K.g2}44`,cursor:"pointer",fontSize:11,fontWeight:600}}>
                  Tüm Kullanıcılara Gönder
                </button>
              </div>
            ))}
          </div>
        </>}

        {sekme==="iht" && <>
          <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:8}}>⚠️ İhtar Geçmişi</div>
          <div style={{color:K.tx4,fontSize:12,marginBottom:16}}>Uygunsuz içerik gönderen kullanıcılar otomatik kaydedilir.</div>
          {(getA().ihtarlar||[]).length===0 ? (
            <div style={{background:K.card,borderRadius:12,padding:30,border:`1px solid ${K.bdr}`,textAlign:"center",color:K.tx4}}>Henüz ihtar kaydı yok ✓</div>
          ) : [...(getA().ihtarlar||[])].reverse().map(ih => (
            <div key={ih.id} style={{background:K.card,borderRadius:12,padding:16,border:`1px solid ${K.err}44`,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div>
                  <div style={{color:K.tx,fontWeight:700}}>{ih.kulAd}</div>
                  <div style={{color:K.tx4,fontSize:11}}>{ih.email} • {ih.tarih}</div>
                </div>
                <div style={{background:"rgba(198,40,40,0.15)",color:K.errL,borderRadius:6,padding:"2px 10px",fontSize:11,fontWeight:700,height:"fit-content"}}>⚠️ UYARI</div>
              </div>
              <div style={{background:K.bg3,borderRadius:8,padding:10,color:K.tx3,fontSize:12,fontStyle:"italic"}}>"{ih.mesaj}"</div>
              <div style={{display:"flex",gap:8,marginTop:10}}>
                <button onClick={()=>{
                  const a=getA();
                  const u=a.users.find(x=>x.id===ih.kulId);
                  if(u){setA({...a,users:a.users.map(x=>x.id===ih.kulId?{...x,durum:"Askıya Alındı"}:x)});alert(`${u.ad} üyeliği askıya alındı.`);}
                }} style={{padding:"6px 14px",borderRadius:7,background:"rgba(198,40,40,0.15)",color:K.errL,border:`1px solid ${K.err}44`,cursor:"pointer",fontSize:12,fontWeight:600}}>
                  Üyeliği Askıya Al
                </button>
                <button onClick={()=>{
                  const a=getA();
                  setA({...a,ihtarlar:(a.ihtarlar||[]).filter(x=>x.id!==ih.id)});
                  window.location.reload();
                }} style={{padding:"6px 14px",borderRadius:7,background:K.bg3,color:K.tx4,border:`1px solid ${K.bdr}`,cursor:"pointer",fontSize:12}}>
                  Kaydı Sil
                </button>
              </div>
            </div>
          ))}
        </>}

        {sekme==="set" && <>
          <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Ayarlar</div>
          <div style={kd}>
            <div style={{color:K.tx,fontWeight:700,marginBottom:14,fontSize:14}}>👤 Hesap</div>
            <div style={{color:K.tx4,fontSize:11,marginBottom:4}}>Yönetici E-postası</div>
            <input value={cfg.email||""} onChange={e=>setCfg(s=>({...s,email:e.target.value}))} placeholder="admin@linguaai.com" style={gI}/>
            <div style={{color:K.tx4,fontSize:11,marginBottom:4}}>İletişim E-postası (Kullanıcılara Görünür)</div>
            <input value={cfg.contactEmail||""} onChange={e=>setCfg(s=>({...s,contactEmail:e.target.value}))} placeholder="iletisim@linguaai.com" style={gI}/>
          </div>
          <div style={kd}>
            <div style={{color:K.tx,fontWeight:700,marginBottom:14,fontSize:14}}>💳 IBAN Bilgileri</div>
            <div style={{color:K.tx4,fontSize:11,marginBottom:4}}>Hesap Sahibi</div>
            <input value={cfg.acName||""} onChange={e=>setCfg(s=>({...s,acName:e.target.value}))} placeholder="Ad Soyad" style={gI}/>
            <div style={{color:K.tx4,fontSize:11,marginBottom:4}}>IBAN</div>
            <input value={cfg.iban||""} onChange={e=>setCfg(s=>({...s,iban:e.target.value}))} placeholder="TR00 0000 0000 0000 0000 0000 00" style={gI}/>
            <div style={{color:K.tx4,fontSize:11,marginBottom:4}}>Banka Adı</div>
            <input value={cfg.bank||""} onChange={e=>setCfg(s=>({...s,bank:e.target.value}))} placeholder="Ziraat Bankası" style={gI}/>
          </div>
          <div style={kd}>
            <div style={{color:K.tx,fontWeight:700,marginBottom:6,fontSize:14}}>🔐 Şifre Değiştir</div>
            <div style={{color:K.tx4,fontSize:11,marginBottom:11}}>Mevcut şifre: admin123 (varsayılan)</div>
            <input type="password" value={p1} onChange={e=>setP1(e.target.value)} placeholder="Yeni şifre" style={gI}/>
            <input type="password" value={p2} onChange={e=>setP2(e.target.value)} placeholder="Tekrar girin" style={gI}/>
            {pMsg && <div style={{color:pMsg.startsWith("✅")?K.gL:K.errL,fontSize:12,marginBottom:10}}>{pMsg}</div>}
            <button onClick={sifreDegis} style={{padding:"9px 18px",background:"rgba(46,125,50,0.15)",color:K.gL,border:`1px solid ${K.g2}55`,borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12}}>Şifreyi Güncelle</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <button onClick={()=>kaydet(cfg)} style={{...bG,padding:"13px 28px",fontSize:15}}>💾 Tüm Ayarları Kaydet</button>
            {kayd && <div style={{color:K.gL,fontSize:13,fontWeight:600}}>✅ Kaydedildi!</div>}
          </div>
        </>}

      </div>
    </div>
  );
}

// ─── ANA UYGULAMA ─────────────────────────────────────────────────────────────
export default function App() {
  usePWA();

  const [kul,     setKul]     = useState(() => DB.g("kul"));
  const [adGir,   setAdGir]   = useState(() => DB.g("adGir") === true);
  const [adAcik,  setAdAcik]  = useState(false);
  const [sayfa,   setSayfa]   = useState("ana");
  const [dilSec,  setDilSec]  = useState(null);
  const [cocuk,   setCocuk]   = useState(false);
  const [ders,    setDers]    = useState(null);

  const [authAcik, setAuthAcik] = useState(false);
  const [authMod,  setAuthMod]  = useState("giris");
  const [adModal,  setAdModal]  = useState(false);
  const [adSifre,  setAdSifre]  = useState("");
  const [adHata,   setAdHata]   = useState("");
  const [adUnuttu, setAdUnuttu] = useState(false);
  const [odePlan,  setOdePlan]  = useState(null);

  // PWA — Ana ekrana ekle promptu
  const [pwaPrompt, setPwaPrompt] = useState(null);
  useEffect(() => {
    const handler = e => { e.preventDefault(); setPwaPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const kulGiris = u => { setKul(u); DB.s("kul", u); };
  const kulCikis = () => { setKul(null); DB.d("kul"); };
  const admKapat = () => { setAdAcik(false); };  // Sadece paneli kapat, oturumu kapatma
  const admCikis = () => { setAdAcik(false); setAdGir(false); DB.d("adGir"); };  // Gerçek çıkış
  const admGiris = () => {
    const a = getA();
    if (adSifre === a.pw) {
      setAdGir(true); DB.s("adGir", true);
      setAdAcik(true); setAdModal(false);
      setAdSifre(""); setAdHata(""); setAdUnuttu(false);
    } else setAdHata("Yanlış şifre");
  };

  const dersGir = () => {
    if (DB.g("adGir") === true || adGir) return true;
    if (!kul) return false;
    if (kul.durum === "Aktif") return true;
    if (kul.durum === "Deneme") return (Date.now() - kul.trialStart) / 86400000 < 5;
    return false;
  };

  const git = s => { setSayfa(s); setDilSec(null); };
  const adm = getA();

  // Ekranlar
  if (adAcik) return <AdminPanel kapat={admKapat} admCikis={admCikis}/>;
  if (ders) return <DersEkrani dilId={ders.dil} hoca={ders.hoca} kul={ders.kul || kul} kapat={()=>setDers(null)}/>;

  const bP  = {padding:"13px 28px",background:`linear-gradient(135deg,${K.g2},${K.t2})`,color:"#fff",border:"none",borderRadius:12,cursor:"pointer",fontWeight:700,fontSize:14,boxShadow:`0 4px 20px ${K.g2}55`};
  const bS  = {padding:"13px 28px",background:"transparent",color:K.tx2,border:`1px solid ${K.bdr}`,borderRadius:12,cursor:"pointer",fontWeight:600,fontSize:14};
  const gI2 = {width:"100%",padding:"11px 13px",background:K.bg3,border:`1px solid ${K.bdr}`,borderRadius:9,color:K.tx,fontSize:13,outline:"none",boxSizing:"border-box"};

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(170deg,${K.bg},${K.bg2} 50%,${K.bg})`,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <style>{`*{box-sizing:border-box}
        @keyframes y0{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes y1{0%,100%{transform:translateY(-5px)}50%{transform:translateY(7px)}}
        @keyframes y2{0%,100%{transform:translateY(4px)}50%{transform:translateY(-8px)}}
        @keyframes gir{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* PWA — Ana ekrana ekle banner */}
      {pwaPrompt && (
        <div style={{background:`linear-gradient(135deg,${K.g2},${K.t2})`,padding:"10px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:16}}>L</div>
            <span style={{color:"#fff",fontSize:13,fontWeight:600}}>Lisan Öğren'yi ana ekrana ekle — uygulama gibi kullan!</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{ pwaPrompt.prompt(); setPwaPrompt(null); }}
              style={{padding:"7px 16px",background:"#fff",color:K.g2,border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12}}>
              📲 Ekle
            </button>
            <button onClick={()=>setPwaPrompt(null)}
              style={{padding:"7px 12px",background:"transparent",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:8,cursor:"pointer",fontSize:12}}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 22px",borderBottom:`1px solid ${K.bdr}`,background:"rgba(7,21,16,0.97)",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(20px)"}}>
        {/* Logo — her zaman ana sayfaya */}
        <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>git("ana")}>
          <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${K.g4},${K.t3})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:18,boxShadow:`0 2px 14px ${K.g2}66`}}>L</div>
          <span style={{fontSize:20,fontWeight:900,color:K.tx}}>Lisan </span>
          <span style={{fontSize:20,fontWeight:900,color:K.gL}}>Öğren</span>
        </div>

        <div style={{display:"flex",gap:3}}>
          {[["ana","Ana Sayfa"],["diller","Diller"],["fiyatlar","Fiyatlar"],["iletisim","İletişim"]].map(([s,l]) => (
            <button key={s} onClick={()=>git(s)} style={{padding:"7px 13px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:sayfa===s?700:400,background:sayfa===s?"rgba(46,125,50,0.2)":"transparent",color:sayfa===s?K.gL:K.tx3}}>{l}</button>
          ))}
        </div>

        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          {kul ? (
            <>
              <div style={{background:"rgba(46,125,50,0.12)",borderRadius:8,padding:"6px 13px",fontSize:12,color:K.gL,fontWeight:600,border:`1px solid ${K.g2}33`,cursor:"pointer"}}
                onClick={()=>git("profil")}>
                👤 {kul.ad.split(" ")[0]}
                <span style={{color:kul.durum==="Aktif"?K.gL:K.warn,fontSize:10,marginLeft:5}}>{kul.durum}</span>
              </div>
              <button onClick={kulCikis} style={{padding:"6px 11px",borderRadius:8,border:`1px solid ${K.bdr}`,background:"transparent",color:K.tx4,cursor:"pointer",fontSize:11}}>Çıkış</button>
            </>
          ) : (
            <>
              <button onClick={()=>{setAuthMod("giris");setAuthAcik(true);}} style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${K.bdr}`,background:"transparent",color:K.tx2,cursor:"pointer",fontSize:12,fontWeight:600}}>Giriş Yap</button>
              <button onClick={()=>{setAuthMod("kayit");setAuthAcik(true);}} style={{padding:"7px 16px",borderRadius:8,background:`linear-gradient(135deg,${K.g2},${K.t2})`,color:"#fff",border:"none",cursor:"pointer",fontWeight:700,fontSize:12}}>Üye Ol</button>
            </>
          )}
          {adGir ? (
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <div style={{background:"rgba(46,125,50,0.15)",borderRadius:8,padding:"6px 12px",fontSize:12,color:K.gL,fontWeight:700,border:`1px solid ${K.g2}44`,cursor:"pointer"}}
                onClick={()=>setAdAcik(true)}>
                🔧 Admin
              </div>
              <button onClick={admCikis} style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${K.err}44`,background:"rgba(198,40,40,0.08)",color:K.errL,cursor:"pointer",fontSize:11}}>Çıkış</button>
            </div>
          ) : (
            <button onClick={()=>{setAdModal(true);setAdHata("");setAdSifre("");setAdUnuttu(false);}} style={{padding:"6px 9px",borderRadius:8,border:`1px solid ${K.bdr}`,background:"transparent",color:K.tx4,cursor:"pointer",fontSize:10}}>⚙</button>
          )}
        </div>
      </nav>

      {/* ANA SAYFA */}
      {sayfa==="ana" && (
        <div style={{animation:"gir 0.5s ease"}}>
          <div style={{textAlign:"center",padding:"68px 22px 42px"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(46,125,50,0.1)",border:"1px solid rgba(46,125,50,0.25)",borderRadius:20,padding:"5px 16px",fontSize:11,color:K.gL,marginBottom:22,fontWeight:600}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:K.gL,display:"inline-block"}}/>
              5 Gün Ücretsiz • Yazılı & Sesli AI Hoca • 10 Dil
            </div>
            <h1 style={{fontSize:48,fontWeight:900,lineHeight:1.08,margin:"0 auto 18px",maxWidth:650,letterSpacing:-1.5,color:K.tx}}>
              AI Hocanla<br/>
              <span style={{background:`linear-gradient(90deg,${K.gL},${K.tL})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>10 Dil Öğren</span>
            </h1>
            <p style={{fontSize:15,color:K.tx3,maxWidth:440,margin:"0 auto 30px",lineHeight:1.8}}>Yaz veya mikrofona bas, AI hocanla birebir ders yap.<br/>Kameralı özellik yakında güncellemeyle geliyor!</p>
            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
              <button style={bP} onClick={()=>{ if(kul)git("diller"); else{setAuthMod("kayit");setAuthAcik(true);} }}>Ücretsiz Başla →</button>
              <button style={bS} onClick={()=>git("fiyatlar")}>Fiyatlar</button>
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"center",gap:18,padding:"0 22px 36px",flexWrap:"wrap",alignItems:"flex-end"}}>
            {[
              {ad:"Şeyh Ahmed Al-Ghamdi",p:4.9,n:1240,c:false,uz:"Tecvid",dil:DILLER[0],a:0},
              {ad:"Sarah Mitchell",p:4.9,n:2800,c:false,uz:"English",dil:DILLER[2],a:1},
              {ad:"Dr. Natasha Ivanova",p:4.9,n:2000,c:false,uz:"Rusça",dil:DILLER[8],a:2},
              {ad:"Prof. Carlos García",p:4.9,n:2400,c:false,uz:"Español",dil:DILLER[9],a:0},
              {ad:"Suzuki Yuki",p:4.9,n:2500,c:false,uz:"日本語",dil:DILLER[6],a:1},
              {ad:"Prof. Klaus Weber",p:4.9,n:1800,c:false,uz:"Deutsch",dil:DILLER[3],a:2},
            ].map((h,i) => (
              <div key={i} style={{textAlign:"center",animation:`y${h.a} ${2.8+i*0.25}s ease-in-out infinite`,cursor:"pointer"}} onClick={()=>git("diller")}>
                <Av h={h} dil={h.dil} sz={72}/>
                <div style={{color:K.tx4,fontSize:10,marginTop:7}}>{h.dil.ad}</div>
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:12,padding:"0 22px 36px",justifyContent:"center",flexWrap:"wrap"}}>
            {[
              {t:"🎤 Sesli Konuşma",d:"Mikrofona bas, hocanla sesli konuş"},
              {t:"✍️ Yazılı Ders",  d:"İstediğin konuda yazarak pratik yap"},
              {t:"🌍 10 Dil",       d:"Kur'an dahil 10 dil, 60 farklı hoca"},
              {t:"👶 Çocuk Modu",   d:"Her dilde özel çocuk hocaları"},
            ].map(f => (
              <div key={f.t} style={{background:K.card,borderRadius:14,padding:"18px 16px",width:190,border:`1px solid ${K.bdr}`,textAlign:"center"}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:6,color:K.tx}}>{f.t}</div>
                <div style={{color:K.tx4,fontSize:11,lineHeight:1.6}}>{f.d}</div>
              </div>
            ))}
          </div>

          <div style={{padding:"0 22px 58px",textAlign:"center"}}>
            <div style={{fontSize:13,fontWeight:700,color:K.tx4,marginBottom:16}}>10 Dil</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
              {DILLER.map(d => (
                <button key={d.id} onClick={()=>{setDilSec(d);git("diller");}}
                  style={{background:K.card,border:`1px solid ${K.bdr}`,borderRadius:10,padding:"8px 14px",cursor:"pointer",color:K.tx3,display:"flex",alignItems:"center",gap:7,fontSize:12}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=d.vurgu;e.currentTarget.style.color=K.tx;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=K.bdr;e.currentTarget.style.color=K.tx3;}}>
                  <span style={{fontSize:16}}>{d.bayrak}</span>{d.ad}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DİLLER */}
      {sayfa==="diller" && !dilSec && (
        <div style={{padding:"26px 22px"}}>
          <div style={{textAlign:"center",marginBottom:26}}>
            <h2 style={{fontSize:26,fontWeight:800,marginBottom:6,color:K.tx}}>Dil Seç</h2>
            <p style={{color:K.tx4,fontSize:13}}>Her dilde yetişkin ve çocuklara özel hocanlar</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16,maxWidth:1000,margin:"0 auto"}}>
            {DILLER.map(d => (
              <div key={d.id} onClick={()=>setDilSec(d)}
                style={{background:K.card,borderRadius:16,overflow:"hidden",border:`1px solid ${K.bdr}`,cursor:"pointer",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=d.vurgu;e.currentTarget.style.transform="translateY(-3px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=K.bdr;e.currentTarget.style.transform="translateY(0)";}}>
                <div style={{background:`linear-gradient(135deg,${d.renk},${d.renk}cc)`,padding:"16px 16px 12px",borderBottom:`3px solid ${d.vurgu}`}}>
                  <div style={{fontSize:26}}>{d.bayrak}</div>
                  <div style={{fontSize:17,fontWeight:800,marginTop:5,color:"#fff"}}>{d.ad}</div>
                  <div style={{color:d.vurgu,fontSize:12,marginTop:2}}>{d.yerel}</div>
                </div>
                <div style={{padding:14}}>
                  <div style={{color:K.tx4,fontSize:11,marginBottom:10}}>{d.acik}</div>
                  <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:12}}>
                    {d.mods.map(m => <span key={m} style={{background:K.bg3,border:`1px solid ${d.vurgu}22`,borderRadius:4,padding:"2px 6px",fontSize:10,color:K.tx4}}>{m}</span>)}
                  </div>
                  <div style={{display:"flex",gap:4,alignItems:"center"}}>
                    {HOCALAR[d.id].filter(h=>!h.c).map(h => <Av key={h.id} h={h} dil={d} sz={26}/>)}
                    <div style={{background:K.bg3,borderRadius:5,padding:"2px 7px",fontSize:9,color:K.tL,fontWeight:600}}>+2 Çocuk</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOCA SEÇ */}
      {sayfa==="diller" && dilSec && (
        <div style={{padding:"26px 22px"}}>
          <button onClick={()=>setDilSec(null)} style={{background:"none",border:"none",color:K.tx4,cursor:"pointer",fontSize:12,marginBottom:16}}>← Geri</button>
          <div style={{textAlign:"center",marginBottom:22}}>
            <div style={{fontSize:32,marginBottom:6}}>{dilSec.bayrak}</div>
            <h2 style={{fontSize:22,fontWeight:800,marginBottom:5,color:K.tx}}>{dilSec.ad} — Hocanı Seç</h2>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:22}}>
            {[false,true].map(k => (
              <button key={String(k)} onClick={()=>setCocuk(k)}
                style={{padding:"9px 22px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12,border:`1px solid ${cocuk===k?dilSec.vurgu:K.bdr}`,background:cocuk===k?"rgba(46,125,50,0.12)":"transparent",color:cocuk===k?dilSec.vurgu:K.tx4}}>
                {k ? "👶 Çocuklara Özel" : "🎓 Yetişkin Hocaları"}
              </button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:16,maxWidth:900,margin:"0 auto"}}>
            {HOCALAR[dilSec.id].filter(h=>h.c===cocuk).map(h => (
              <div key={h.id}
                style={{background:K.card,borderRadius:16,padding:18,border:`1px solid ${K.bdr}`,textAlign:"center",cursor:"pointer",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=dilSec.vurgu;e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=K.bdr;e.currentTarget.style.transform="translateY(0)";}}
                onClick={()=>{
                  if (!kul && !adGir) { setAuthMod("kayit"); setAuthAcik(true); return; }
                  if (!dersGir()) { setOdePlan({id:"up",ad:"Premium Üyelik",fiyat:"₺299",donem:"/ay",tutar:299}); return; }
                  const k2 = adGir ? {id:"admin",ad:"Admin",plan:"Sınırsız",durum:"Aktif",trialStart:0} : kul;
                  setDers({dil:dilSec.id, hoca:h, kul:k2});
                }}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Av h={h} dil={dilSec} sz={80}/></div>
                {h.c && <div style={{background:"rgba(249,168,37,0.12)",color:K.warn,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,marginBottom:8,display:"inline-block",border:`1px solid ${K.warn}33`}}>👶 Çocuklara Özel</div>}
                <div style={{fontWeight:700,fontSize:14,marginBottom:3,color:K.tx}}>{h.ad}</div>
                <div style={{color:K.tx4,fontSize:11,marginBottom:7}}>{h.yer}</div>
                <div style={{background:K.bg3,borderRadius:7,padding:"3px 9px",fontSize:11,color:K.tx2,marginBottom:10,display:"inline-block"}}>{h.uz}</div>
                <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:14}}>
                  <span style={{color:dilSec.vurgu,fontSize:12,fontWeight:600}}>⭐ {h.p}</span>
                  <span style={{color:K.tx4,fontSize:11}}>{h.n.toLocaleString()}</span>
                </div>
                <button style={{width:"100%",padding:"9px",borderRadius:9,background:`linear-gradient(135deg,${K.g2},${K.t2})`,color:"#fff",border:"none",cursor:"pointer",fontWeight:700,fontSize:12}}>🎤 Derse Başla</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FİYATLAR */}
      {sayfa==="fiyatlar" && (
        <div style={{padding:"50px 22px",textAlign:"center"}}>
          <h2 style={{fontSize:30,fontWeight:800,marginBottom:8,color:K.tx}}>Fiyatlandırma</h2>
          <p style={{color:K.tx4,marginBottom:38,fontSize:14}}>5 gün ücretsiz dene, havale ile öde</p>
          <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
            {[
              {id:"d",ad:"5 Günlük Deneme",fiyat:"Ücretsiz",donem:"",hl:false,oz:["1 dil","Günde 20 dk","Yazılı AI hoca","Sesli konuşma"]},
              {id:"a",ad:"Aylık Plan",fiyat:"₺299",donem:"/ay",hl:false,tutar:299,oz:["Tüm 10 dil","Sınırsız ders","4+2 hoca","Çocuk hocaları"]},
              {id:"y",ad:"Yıllık Plan",fiyat:"₺1990",donem:"/yıl",hl:true,tutar:1990,oz:["Tüm 10 dil","Sınırsız ders","4+2 hoca","Çocuk hocaları","Öncelikli destek","%44 tasarruf"]},
            ].map(p => (
              <div key={p.id}
                style={{background:p.hl?`linear-gradient(135deg,${K.bg2},${K.bg3})`:K.card,border:p.hl?`2px solid ${K.g3}`:`1px solid ${K.bdr}`,borderRadius:20,padding:26,width:245,position:"relative",transition:"transform 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                {p.hl && <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:`linear-gradient(135deg,${K.g3},${K.t3})`,color:"#fff",borderRadius:18,padding:"3px 14px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>⭐ EN POPÜLER</div>}
                <div style={{fontSize:15,fontWeight:700,marginBottom:7,color:K.tx}}>{p.ad}</div>
                <div style={{marginBottom:18}}><span style={{fontSize:34,fontWeight:900,color:p.hl?K.gL:K.tx}}>{p.fiyat}</span><span style={{color:K.tx4,fontSize:13}}>{p.donem}</span></div>
                {p.oz.map(o => <div key={o} style={{display:"flex",gap:7,marginBottom:7,textAlign:"left"}}><span style={{color:K.gL,fontWeight:700}}>✓</span><span style={{color:K.tx3,fontSize:12}}>{o}</span></div>)}
                <button onClick={()=>{
                  if (p.id==="d") { if(kul)git("diller"); else{setAuthMod("kayit");setAuthAcik(true);} }
                  else { if(!kul){setAuthMod("kayit");setAuthAcik(true);} else setOdePlan(p); }
                }} style={{width:"100%",marginTop:18,padding:11,borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",background:p.hl?`linear-gradient(135deg,${K.g2},${K.t2})`:p.id==="d"?"transparent":K.bg3,color:p.hl?"#fff":K.tx2,border:p.id==="d"?`1px solid ${K.g2}`:p.hl?"none":`1px solid ${K.bdr}`}}>
                  {p.id==="d" ? "Ücretsiz Başla" : "Havale ile Satın Al"}
                </button>
              </div>
            ))}
          </div>
          {adm.iban && (
            <div style={{marginTop:34,background:K.card,borderRadius:14,padding:22,maxWidth:440,margin:"34px auto 0",border:`1px solid ${K.bdr}`,textAlign:"left"}}>
              <div style={{color:K.tx,fontWeight:700,marginBottom:10,fontSize:14}}>💳 Havale Bilgileri</div>
              <div style={{color:K.tx4,fontSize:13,lineHeight:2.2}}>Ad: <strong style={{color:K.tx}}>{adm.acName}</strong><br/>IBAN: <strong style={{color:K.gL,fontFamily:"monospace"}}>{adm.iban}</strong><br/>Banka: <strong style={{color:K.tx}}>{adm.bank}</strong></div>
              <div style={{background:"rgba(46,125,50,0.08)",borderRadius:8,padding:10,marginTop:10,border:`1px solid ${K.g2}33`}}>
                <div style={{color:K.tx4,fontSize:11,lineHeight:1.7}}>Açıklama kısmına e-postanızı yazın. Onaydan sonra aktifleşir (max 2 saat).</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PROFİL & DERS GEÇMİŞİ */}
      {sayfa==="profil" && kul && (
        <div style={{padding:"26px 22px",maxWidth:800,margin:"0 auto"}}>
          {/* Profil başlık */}
          <div style={{background:K.card,borderRadius:16,padding:22,border:`1px solid ${K.bdr}`,marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:`linear-gradient(135deg,${K.g2},${K.t2})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:24}}>
                {kul.ad[0]}
              </div>
              <div style={{flex:1}}>
                <div style={{color:K.tx,fontSize:20,fontWeight:800}}>{kul.ad}</div>
                <div style={{color:K.tx4,fontSize:12,marginTop:2}}>{kul.email}</div>
                <div style={{display:"flex",gap:10,marginTop:6,flexWrap:"wrap"}}>
                  <span style={{background:"rgba(46,125,50,0.15)",color:K.gL,borderRadius:6,padding:"2px 10px",fontSize:11,fontWeight:600}}>{kul.plan}</span>
                  <span style={{background:"rgba(46,125,50,0.1)",color:K.tx3,borderRadius:6,padding:"2px 10px",fontSize:11}}>📅 {kul.tarih}'den beri üye</span>
                  <span style={{background:"rgba(46,125,50,0.1)",color:K.tx3,borderRadius:6,padding:"2px 10px",fontSize:11}}>📍 {kul.sehir}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dil seviyeleri */}
          <div style={{color:K.tx,fontSize:16,fontWeight:700,marginBottom:12}}>📊 Dil Seviyelerin</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:24}}>
            {DILLER.map(d => {
              const sv = getSeviye(kul.id, d.id);
              const dersler = getDersGecmis(kul.id, d.id);
              if(dersler.length === 0) return null;
              return(
                <div key={d.id} style={{background:K.card,borderRadius:12,padding:14,border:`1px solid ${K.bdr}`,textAlign:"center",cursor:"pointer"}}
                  onClick={()=>{setDilSec(d);git("diller");}}>
                  <div style={{fontSize:24,marginBottom:6}}>{d.bayrak}</div>
                  <div style={{color:K.tx,fontWeight:700,fontSize:13}}>{d.ad}</div>
                  <div style={{color:K.gL,fontSize:20,fontWeight:900,margin:"6px 0"}}>{sv}</div>
                  <div style={{color:K.tx4,fontSize:11}}>{dersler.length} ders yapıldı</div>
                  <div style={{background:K.bg3,borderRadius:4,height:4,marginTop:8}}>
                    <div style={{background:`linear-gradient(90deg,${K.g2},${K.tL})`,height:4,borderRadius:4,width:(SEVIYELER.indexOf(sv)+1)*100/6+"%"}}/>
                  </div>
                </div>
              );
            }).filter(Boolean)}
          </div>

          {/* Ders geçmişi - dil seç */}
          <div style={{color:K.tx,fontSize:16,fontWeight:700,marginBottom:12}}>📚 Ders Geçmişi</div>
          {DILLER.map(d => {
            const dersler = getDersGecmis(kul.id, d.id);
            if(dersler.length === 0) return null;
            return(
              <div key={d.id} style={{background:K.card,borderRadius:14,padding:16,border:`1px solid ${K.bdr}`,marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <span style={{fontSize:20}}>{d.bayrak}</span>
                  <span style={{color:K.tx,fontWeight:700,fontSize:14}}>{d.ad}</span>
                  <span style={{color:K.gL,fontWeight:700,fontSize:13,marginLeft:"auto"}}>{getSeviye(kul.id,d.id)} Seviye</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[...dersler].reverse().slice(0,5).map((dr,i) => (
                    <div key={dr.id} style={{background:K.bg3,borderRadius:9,padding:"10px 14px",border:`1px solid ${K.bdr}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <div style={{color:K.tx,fontSize:12,fontWeight:600}}>{dr.tarih} {dr.saat}</div>
                          <div style={{color:K.tx4,fontSize:11,marginTop:2}}>{dr.hoca} • {dr.mesajSayisi} mesaj • {dr.sure} dk</div>
                          {dr.ozet && <div style={{color:K.tx3,fontSize:11,marginTop:4,fontStyle:"italic"}}>Son: "{dr.ozet.substring(0,60)}{dr.ozet.length>60?"...":""}"</div>}
                        </div>
                        <div style={{background:"rgba(46,125,50,0.15)",color:K.gL,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}}>{dr.seviye}</div>
                      </div>
                    </div>
                  ))}
                  {dersler.length > 5 && <div style={{color:K.tx4,fontSize:12,textAlign:"center"}}>+{dersler.length-5} ders daha</div>}
                </div>
                <button onClick={()=>{setDilSec(d);git("diller");}}
                  style={{width:"100%",marginTop:12,padding:"9px",borderRadius:9,background:`linear-gradient(135deg,${K.g2},${K.t2})`,color:"#fff",border:"none",cursor:"pointer",fontWeight:700,fontSize:12}}>
                  🎤 Kaldığım Yerden Devam Et ({getSeviye(kul.id,d.id)})
                </button>
              </div>
            );
          }).filter(Boolean)}

          {DILLER.every(d => getDersGecmis(kul.id, d.id).length === 0) && (
            <div style={{background:K.card,borderRadius:12,padding:30,border:`1px solid ${K.bdr}`,textAlign:"center",color:K.tx4}}>
              Henüz ders geçmişin yok. Hemen başla! 🚀
            </div>
          )}
        </div>
      )}

      {/* İLETİŞİM */}
      {sayfa==="iletisim" && (
        <div style={{padding:"50px 22px",maxWidth:500,margin:"0 auto"}}>
          <h2 style={{fontSize:26,fontWeight:800,marginBottom:8,color:K.tx}}>İletişim</h2>
          <p style={{color:K.tx4,marginBottom:26,fontSize:14}}>Sorularınız için bize ulaşın</p>
          <div style={{background:K.card,borderRadius:16,padding:24,border:`1px solid ${K.bdr}`}}>
            {adm.contactEmail && (
              <div style={{marginBottom:20}}>
                <div style={{color:K.tx4,fontSize:12,marginBottom:6}}>E-posta</div>
                <a href={`mailto:${adm.contactEmail}`} style={{color:K.gL,fontSize:17,fontWeight:700,textDecoration:"none"}}>{adm.contactEmail}</a>
              </div>
            )}
            <div style={{borderTop:`1px solid ${K.bdr}`,paddingTop:18}}>
              <div style={{color:K.tx4,fontSize:12,marginBottom:12}}>Mesaj Gönderin</div>
              <input placeholder="Adınız"    style={{...gI2,marginBottom:10}}/>
              <input placeholder="E-postanız" type="email" style={{...gI2,marginBottom:10}}/>
              <textarea placeholder="Mesajınız..." rows={4} style={{...gI2,resize:"vertical",marginBottom:14}}/>
              <button onClick={()=>alert("Mesajınız alındı! En kısa sürede dönüş yapacağız.")}
                style={{width:"100%",padding:12,background:`linear-gradient(135deg,${K.g2},${K.t2})`,color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14}}>
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALLER ── */}

      {authAcik && (
        <AuthModal ilkMod={authMod} kapat={()=>setAuthAcik(false)}
          basari={u=>{kulGiris(u);setAuthAcik(false);git("diller");}}/>
      )}

      {odePlan && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9000}}>
          <div style={{background:K.card,borderRadius:20,padding:26,width:390,border:`1px solid ${K.bdr3}`,boxShadow:"0 24px 64px rgba(0,0,0,0.8)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
              <div><div style={{color:K.tx,fontSize:16,fontWeight:700}}>Ödeme — {odePlan.ad}</div><div style={{color:K.tx4,fontSize:11,marginTop:2}}>{odePlan.fiyat}{odePlan.donem}</div></div>
              <button onClick={()=>setOdePlan(null)} style={{background:"none",border:"none",color:K.tx4,fontSize:18,cursor:"pointer"}}>✕</button>
            </div>
            {adm.iban ? (
              <div style={{background:K.bg3,borderRadius:11,padding:15,marginBottom:14,border:`1px solid ${K.bdr}`}}>
                <div style={{color:K.tx,fontWeight:700,marginBottom:9,fontSize:13}}>Havale Bilgileri</div>
                <div style={{color:K.tx4,fontSize:12,lineHeight:2.2}}>Ad: <strong style={{color:K.tx}}>{adm.acName}</strong><br/>IBAN: <strong style={{color:K.gL,fontFamily:"monospace"}}>{adm.iban}</strong><br/>Tutar: <strong style={{color:K.warn}}>{odePlan.fiyat}</strong></div>
                <div style={{background:"rgba(46,125,50,0.08)",borderRadius:7,padding:9,marginTop:9,border:`1px solid ${K.g2}33`}}>
                  <div style={{color:K.tx4,fontSize:11}}>Açıklama: <strong style={{color:K.tx}}>{kul?.email}</strong></div>
                </div>
              </div>
            ) : <div style={{color:K.tx4,fontSize:13,marginBottom:14,padding:14,background:K.bg3,borderRadius:10}}>IBAN henüz girilmemiş. Ayarlardan ekleyin.</div>}
            <button onClick={()=>{
              const a=getA();
              const ny={id:Date.now(),ad:kul?.ad||"",email:kul?.email||"",tutar:odePlan.tutar||0,plan:odePlan.ad,tarih:new Date().toLocaleDateString("tr-TR"),d:"bekle"};
              setA({...a,pays:[...(a.pays||[]),ny]});
              alert("Bildiriminiz alındı! Admin onayladıktan sonra üyeliğiniz aktifleşecektir.");
              setOdePlan(null);
            }} style={{width:"100%",padding:12,background:`linear-gradient(135deg,${K.g2},${K.t2})`,color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13}}>
              ✓ Havaleyi Yaptım, Bildir
            </button>
          </div>
        </div>
      )}

      {/* ADMİN GİRİŞ MODALI */}
      {adModal && ( 
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9000}}>
          <div style={{background:K.card,borderRadius:18,padding:26,width:320,border:`1px solid ${K.bdr3}`,boxShadow:"0 24px 64px rgba(0,0,0,0.8)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
              <div style={{color:K.tx,fontSize:15,fontWeight:700}}>{adUnuttu ? "Admin Şifresi Sıfırla" : "Yönetici Girişi"}</div>
              <button onClick={()=>{setAdModal(false);setAdHata("");setAdSifre("");setAdUnuttu(false);}} style={{background:"none",border:"none",color:K.tx3,fontSize:18,cursor:"pointer"}}>✕</button>
            </div>

            {!adUnuttu ? (
              <>
                <input type="password" value={adSifre} placeholder="Yönetici şifresi"
                  onChange={e=>{setAdSifre(e.target.value);setAdHata("");}}
                  onKeyDown={e=>e.key==="Enter"&&admGiris()}
                  style={{width:"100%",padding:"11px 13px",background:K.bg3,border:`1px solid ${adHata?K.err:K.bdr}`,borderRadius:9,color:K.tx,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:6}}/>
                {adHata && <div style={{color:K.errL,fontSize:11,marginBottom:8}}>{adHata}</div>}
                <div style={{textAlign:"right",marginBottom:14}}>
                  <button onClick={()=>setAdUnuttu(true)} style={{background:"none",border:"none",color:K.tL,cursor:"pointer",fontSize:12,fontWeight:600}}>Şifremi Unuttum</button>
                </div>
                <div style={{display:"flex",gap:9}}>
                  <button onClick={()=>{setAdModal(false);setAdHata("");setAdSifre("");}} style={{flex:1,padding:10,background:"transparent",color:K.tx4,border:`1px solid ${K.bdr}`,borderRadius:9,cursor:"pointer"}}>İptal</button>
                  <button onClick={admGiris} style={{flex:1,padding:10,background:`linear-gradient(135deg,${K.g2},${K.t2})`,color:"#fff",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700}}>Giriş</button>
                </div>
              </>
            ) : (
              <>
                <div style={{color:K.tx3,fontSize:12,marginBottom:14,lineHeight:1.6}}>Yeni admin şifresi belirleyin. Mevcut şifreyi bilmeniz gerekmez.</div>
                <input type="password" placeholder="Yeni şifre (min 6 karakter)"
                  id="newAdminPw1"
                  style={{width:"100%",padding:"11px 13px",background:K.bg3,border:`1px solid ${K.bdr}`,borderRadius:9,color:K.tx,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
                <input type="password" placeholder="Tekrar girin"
                  id="newAdminPw2"
                  style={{width:"100%",padding:"11px 13px",background:K.bg3,border:`1px solid ${K.bdr}`,borderRadius:9,color:K.tx,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:14}}/>
                <button onClick={()=>{
                  const pw1 = document.getElementById("newAdminPw1").value;
                  const pw2 = document.getElementById("newAdminPw2").value;
                  if (!pw1 || pw1.length<6) { alert("En az 6 karakter girin!"); return; }
                  if (pw1 !== pw2) { alert("Şifreler eşleşmiyor!"); return; }
                  const a = getA(); setA({...a,pw:pw1});
                  alert(`✅ Admin şifresi güncellendi!\n\nYeni şifre: ${pw1}\n\nBu şifreyi not edin!`);
                  setAdUnuttu(false); setAdModal(false);
                }} style={{width:"100%",padding:12,background:`linear-gradient(135deg,${K.g2},${K.t2})`,color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14,marginBottom:8}}>
                  Şifreyi Güncelle
                </button>
                <div style={{textAlign:"center"}}>
                  <button onClick={()=>setAdUnuttu(false)} style={{background:"none",border:"none",color:K.tL,cursor:"pointer",fontSize:12,fontWeight:600}}>← Geri Dön</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );

