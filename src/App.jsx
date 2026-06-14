import { useState, useRef, useEffect } from "react";

const K = {
  bg:"#071510",bg2:"#0a1e13",bg3:"#0d2618",card:"#0f2c1c",
  bdr:"#1a3d26",bdr2:"#1f4d30",bdr3:"#266040",
  g2:"#2e7d32",g3:"#388e3c",g4:"#43a047",gL:"#66bb6a",
  t2:"#00695c",t3:"#00897b",tL:"#26a69a",
  tx:"#e8f5e9",tx2:"#a5d6a7",tx3:"#6a9e74",tx4:"#3d6b47",
  warn:"#f9a825",err:"#c62828",errL:"#ef5350",gold:"#f57f17",
};

const DB = {
  g: k => { try { const v=localStorage.getItem("la_"+k); return v?JSON.parse(v):null; } catch { return null; } },
  s: (k,v) => { try { localStorage.setItem("la_"+k,JSON.stringify(v)); } catch {} },
  d: k => { try { localStorage.removeItem("la_"+k); } catch {} },
};


// ── MÜFREDAT - GERÇEK OKUL MÜFREDATı ───────────────────────────────────────
const MUFREDAT = {
  // MEDRESE - Klasik usul, gerçek medrese sırası
  medrese: {
    A1: "Elif-Ba (harf tanıma, mahreçler, harekeler, basit okuma). Tecvid temelleri: medler, ihfa, idğam, iklab, kalkale, vakıf kuralları. Namaz dua ve sureleri: Sübhaneke, Ettehiyyatü, Allahümme Salli, Allahümme Barik, kısa sureler. Temel ilmihal: iman esasları, İslam'ın şartları, abdest, gusül, namaz. Akaid başlangıcı: Allah'ın sıfatları, peygamberlik, ahiret, kader.",
    A2: "Arapça Sarf: fiil kalıpları, zamirler, isim çekimleri. Arapça Nahiv: irab, cümle yapısı, merfu-mansub-mecrur. Fıkıh temelleri: taharet, ibadetler temelleri.",
    B1: "Fıkıh orta: alım-satım, nikah, miras hükümleri. Hadis başlangıcı: Kırk Hadis, Riyazü's-Salihin seçmeleri. Hadis usulü temelleri.",
    B2: "Tefsir: kısa sure tefsirleri, tefsir usulü. Usul ilimleri: Usulü Fıkıh temelleri, Usulü Hadis.",
    C1: "Kapsamlı tefsir, Belagat, Mantık, ileri fıkıh meseleleri.",
    C2: "Müderris seviyesi: ictihat usulü, mezhep karşılaştırması, ilmi tartışma."
  },
  // KURAN - Tecvid ve hıfz yolu
  quran: {
    A1: "Elif-Ba: harf tanıma ve mahreçler. Harekeler: fetha, kesre, damme, tenvin, sükun, şedde. Basit kelime okuma.",
    A2: "Tecvid temelleri: med harfleri, nun sakin ve tenvin kuralları (ihfa, idğam, iklab, izhar). Kısa sureler: Fatiha, İhlas, Felak, Nas, Kevser, Asr.",
    B1: "Amme cüzü (30. cüz) sureleri. Kalkale, vakf-ibtida kuralları. Medd-i tabii ve medd-i lazım.",
    B2: "Hıfz programı: Amme cüzü ezberi. Makam çalışması: rast, hicaz, saba makamları.",
    C1: "İleri hıfz: son 5 cüz. Kıraat farklılıkları, Kıraat-ı Aşere temelleri.",
    C2: "Kıraat-ı Seb'a ve Aşere. Tam hıfz. İleri makam."
  },
  // ARAPÇA - Dil öğrenim yolu
  arabic: {
    A1: "Arap alfabesi, harekeler, basit kelimeler. Selamlaşma: Selam, nasılsın, teşekkür. Sayılar 1-10. Renkler ve temel isimler.",
    A2: "Temel cümle yapısı. İsim tamlaması (muzaf-muzafun ileyh). Müzekker-müennes. Basit fiil çekimleri (madi fiil). Günlük konuşma kalıpları.",
    B1: "Sarf: fiil kalıpları (bab sistemi), zamirler. Nahiv: irab, merfu-mansub-mecrur. Günlük konuşma ve okuma.",
    B2: "İleri nahiv: şartlı cümleler, ism-i fail, ism-i meful. Arapça metin okuma ve anlama.",
    C1: "Fesahat ve belagat. Klasik Arapça metin analizi. İleri konuşma.",
    C2: "Edebi Arapça, hitabet, şiir analizi."
  },
  // İNGİLİZCE - CEFR standardı
  english: {
    A1: "Alfabe, selamlaşma (Hello/Hi/Goodbye), sayılar 1-100, renkler, hayvanlar. 'To be' fiili: I am, You are, He is. Basit sorular: What is your name? How old are you?",
    A2: "Simple Present ve Past Simple. Günlük kelime hazinesi: aile, yiyecek, giysi. Present Continuous. Alışveriş ve yön sorma diyalogları.",
    B1: "Present Perfect, Future tenses. Conditionals (Type 1-2). Seyahat, sağlık, iş konuşmaları. CEFR B1 kelime hazinesi: 1500+ kelime.",
    B2: "Advanced tenses, Passive voice, Reported speech. Akademik ve iş İngilizcesi. Tartışma ve ikna. IELTS/TOEFL hazırlık.",
    C1: "Karmaşık gramer yapıları: Inversion, Cleft sentences. Akademik yazı. İleri konuşma. IELTS 7+ hazırlık.",
    C2: "Ana dil seviyesi. Edebi İngilizce, idiomatic expressions. IELTS 8-9 seviyesi."
  },
  // ALMANCA - Goethe Enstitüsü standardı
  german: {
    A1: "Almanca harfler ve telaffuz (ä, ö, ü, ß). Selamlaşma: Guten Tag, Wie heißen Sie? Sayılar, renkler. 'Sein' ve 'Haben' fiilleri. Basit cümleler.",
    A2: "Präsens çekimi. Perfekt ve Präteritum. Artikel (der/die/das). Günlük konuşma: alışveriş, restoran, yön. Zaman ifadeleri.",
    B1: "Konjunktiv II. Passivsatz. İş ve seyahat Almancası. Modalverben ileri kullanım. Goethe B1 hazırlık.",
    B2: "İleri gramer: Relativsätze, Konjunktiv I. Akademik Almanca. TestDaF hazırlık.",
    C1: "Karmaşık metin analizi. İleri yazma. DSH sınavı hazırlık.",
    C2: "Ana dil seviyesi Almanca."
  },
  // FRANSIZCA - DELF/DALF standardı
  french: {
    A1: "Fransız alfabesi, telaffuz. Être ve Avoir. Selamlaşma: Bonjour, Comment vous appelez-vous? Sayılar, renkler, aile.",
    A2: "Passé composé, Imparfait. Articles. Günlük konuşma. DELF A2 hazırlık.",
    B1: "Subjonctif présent. Conditionnel. Seyahat ve iş Fransızcası. DELF B1 hazırlık.",
    B2: "İleri subjonctif. Discours indirect. Akademik Fransızca. DELF B2.",
    C1: "İleri yazı ve konuşma. DALF C1 hazırlık.",
    C2: "Ana dil seviyesi. DALF C2."
  },
  // İTALYANCA
  italian: {
    A1: "İtalyan alfabesi. Essere ve Avere. Selamlaşma: Buongiorno, Come si chiama? Sayılar, renkler.",
    A2: "Passato prossimo. Imperfetto. Günlük diyaloglar: restoran, alışveriş. CILS A2.",
    B1: "Congiuntivo présente. Condizionale. CILS B1 hazırlık.",
    B2: "İleri gramer. Akademik İtalyanca. CILS B2.",
    C1: "İleri konuşma ve yazma. CILS C1.",
    C2: "Ana dil seviyesi."
  },
  // İSPANYOLCA - DELE standardı
  spanish: {
    A1: "İspanyol alfabesi. Ser ve Estar. Selamlaşma: Hola, ¿Cómo se llama? Sayılar, renkler, aile. DELE A1.",
    A2: "Pretérito indefinido. Reflexive fiiller. Günlük konuşma. DELE A2.",
    B1: "Subjuntivo. Condicional. Seyahat ve iş İspanyolcası. DELE B1.",
    B2: "İleri gramer. Discurso indirecto. DELE B2.",
    C1: "Akademik İspanyolca. DELE C1.",
    C2: "Ana dil seviyesi. DELE C2."
  },
  // JAPONCA - JLPT standardı
  japanese: {
    A1: "Hiragana (46 harf). Katakana (46 harf). Temel selamlaşma: こんにちは, ありがとう. Sayılar. JLPT N5 hazırlık.",
    A2: "Temel Kanji (100 karakter). Temel cümle yapısı: は/が/を. Desu/Masu formu. Günlük konuşma. JLPT N5.",
    B1: "Te formu, geçmiş zaman, sıfat çekimi. Orta Kanji (300). Keigo temelleri. JLPT N4-N3.",
    B2: "İleri Kanji (600+). Passive, Causative. İş Japonca. Keigo ileri. JLPT N2.",
    C1: "JLPT N1 hazırlık. Klasik Japonca temelleri. Akademik dil.",
    C2: "Ana dil seviyesi. Edebi Japonca."
  },
  // KORECE - TOPIK standardı
  korean: {
    A1: "Hangul alfabesi (자음/모음). Temel selamlaşma: 안녕하세요, 감사합니다. Sayılar (순수/한자). TOPIK I temelleri.",
    A2: "Temel gramer: 은/는/이/가/을/를. Zaman ekleri. Günlük konuşma. TOPIK I.",
    B1: "Orta gramer: 에서/에게/한테. K-Pop ve günlük dil. Yüksek saygı dili (존댓말). TOPIK II başlangıç.",
    B2: "İleri gramer. İş Koreceyi. Yazılı dil. TOPIK II orta.",
    C1: "İleri konuşma ve yazma. TOPIK II yüksek.",
    C2: "Ana dil seviyesi."
  },
  // RUSÇA
  russian: {
    A1: "Kiril alfabesi (33 harf). Selamlaşma: Привет, Как вас зовут? Sayılar, renkler. Temel fiiller.",
    A2: "Temel gramer: падежи (isim halleri) temelleri. Zaman çekimi. Günlük konuşma.",
    B1: "6 isim hali (падежи). Hareket fiilleri. Seyahat Rusçası. TORFL A1.",
    B2: "İleri gramer. Akademik Rusça. TORFL A2.",
    C1: "İleri konuşma. Edebi Rusça. TORFL B1.",
    C2: "Ana dil seviyesi."
  },
  // TÜRKÇE
  turkish: {
    A1: "Türk alfabesi. Selamlaşma: Merhaba, Adınız ne? Sayılar, renkler. Temel isim ve fiiller.",
    A2: "Hal ekleri: -e/-de/-den. Zaman çekimi: geniş, geçmiş, gelecek. Günlük konuşma. TÖMER A2.",
    B1: "İleri ekler: -ki, -ince, -dığı. Günlük konuşma ve yazma. TÖMER B1.",
    B2: "İleri gramer. Akademik Türkçe. TÖMER B2.",
    C1: "İleri yazı ve konuşma. YDS/YÖKDİL hazırlık.",
    C2: "Ana dil seviyesi."
  },
};

const getMufredat = (dilId, seviye) => MUFREDAT[dilId]?.[seviye] || "Temel "+dilId+" konuları";


const getA = () => DB.g("adm") || {pw:"admin123",email:"",contactEmail:"",iban:"",bank:"",acName:"",users:[],pays:[],ihtarlar:[]};
const setA = d => DB.s("adm",d);

const SEVIYELER = ["A1","A2","B1","B2","C1","C2"];
const getDG = (uid,did) => DB.g("dg_"+uid+"_"+did) || [];
const setDG = (uid,did,d) => DB.s("dg_"+uid+"_"+did,d);
const getSV = (uid,did) => DB.g("sv_"+uid+"_"+did) || "A1";
const setSV = (uid,did,sv) => DB.s("sv_"+uid+"_"+did,sv);

const DILLER = [
  {id:"quran",  ad:"Kur'an-ı Kerim",bayrak:"🕌",renk:"#0d2a14",vurgu:"#f9a825",mic:"ar-SA",mods:["Tecvid","Hıfz","Makam","Meal"],cats:["Tecvid","Hıfz","Makam","Sure Mealleri","Kıraat","Akaid"]},
  {id:"medrese",ad:"Medrese Eğitimi",bayrak:"📖",renk:"#1a0e00",vurgu:"#c8a045",mic:"ar-SA",mods:["Fıkıh","Akaid","Tefsir","Hadis"],cats:["Elif-Ba","Tecvid","Namaz Sureleri","İlmihal","Akaid","Sarf-Nahiv","Fıkıh","Hadis","Tefsir"]},
  {id:"arabic", ad:"Arapça",         bayrak:"🇸🇦",renk:"#2a0e0e",vurgu:"#ff8f00",mic:"ar-SA",mods:["Nahiv","Sarf","Konuşma","Okuma"],cats:["Genel","Günlük Hayat","Dini Konular","Seyahat","İş","Medya","Edebiyat"]},
  {id:"english",ad:"İngilizce",       bayrak:"🇬🇧",renk:"#0e1a2a",vurgu:"#ef5350",mic:"en-US",mods:["Grammar","Speaking","Vocabulary","IELTS"],cats:["Genel","Seyahat","İş","Akademik","Tıp","Teknoloji"]},
  {id:"german", ad:"Almanca",         bayrak:"🇩🇪",renk:"#1a1a0e",vurgu:"#fdd835",mic:"de-DE",mods:["Grammatik","Sprechen","Vokabeln","TestDaF"],cats:["Genel","Seyahat","İş","Akademik","Mühendislik"]},
  {id:"french", ad:"Fransızca",       bayrak:"🇫🇷",renk:"#0a1030",vurgu:"#ef5350",mic:"fr-FR",mods:["Grammaire","Conversation","Culture","DELF"],cats:["Genel","Seyahat","Sanat","İş","Mutfak"]},
  {id:"italian",ad:"İtalyanca",       bayrak:"🇮🇹",renk:"#0e2a0e",vurgu:"#ff8f00",mic:"it-IT",mods:["Grammatica","Conversazione","Cultura","CILS"],cats:["Genel","Seyahat","Mutfak","Moda","İş"]},
  {id:"spanish",ad:"İspanyolca",      bayrak:"🇪🇸",renk:"#2a1a0a",vurgu:"#ff8f00",mic:"es-ES",mods:["Gramática","Conversación","Cultura","DELE"],cats:["Genel","Seyahat","İş","Latin Kültürü"]},
  {id:"japanese",ad:"Japonca",        bayrak:"🇯🇵",renk:"#2a0a0a",vurgu:"#ff6b6b",mic:"ja-JP",mods:["Hiragana","Katakana","Konuşma","JLPT"],cats:["Genel","Seyahat","Anime","İş","JLPT"]},
  {id:"korean", ad:"Korece",          bayrak:"🇰🇷",renk:"#0a0a2a",vurgu:"#4fc3f7",mic:"ko-KR",mods:["Hangul","Gramer","Konuşma","TOPIK"],cats:["Genel","Seyahat","K-Pop","İş","TOPIK"]},
  {id:"russian",ad:"Rusça",           bayrak:"🇷🇺",renk:"#0a0a2a",vurgu:"#ef5350",mic:"ru-RU",mods:["Kiril","Gramer","Konuşma","TORFL"],cats:["Genel","Seyahat","Edebiyat","İş"]},
  {id:"turkish",ad:"Türkçe",          bayrak:"🇹🇷",renk:"#2a0a0a",vurgu:"#ecf0f1",mic:"tr-TR",mods:["Dilbilgisi","Konuşma","Yazma","TÖMER"],cats:["Genel","Günlük Hayat","İş","Akademik"]},
];

const HOCALAR = {
  quran:[
    {id:"q1",ad:"Şeyh Ahmed Al-Ghamdi",   yer:"Mekke",     uz:"Tecvid & Hıfz",    p:4.9,n:1240,c:false},
    {id:"q2",ad:"Şeyh Omar Al-Fadil",     yer:"Medine",    uz:"Makam & Kıraat",   p:4.8,n:980, c:false},
    {id:"q3",ad:"Üst. Meryem Al-Husseini",yer:"Kahire",    uz:"Sure Mealleri",    p:4.9,n:1560,c:false},
    {id:"q4",ad:"Üst. Fatıma Al-Zahrawi", yer:"Mısır",     uz:"Tecvid & Kıraat",  p:4.7,n:870, c:false},
    {id:"q5",ad:"Öğrt. Yusuf Al-Nuri",    yer:"Kahire",    uz:"Çocuklara Kuran",  p:4.9,n:640, c:true},
    {id:"q6",ad:"Öğrt. Zeynep Al-Safa",   yer:"Medine",    uz:"Çocuklara Tecvid", p:4.8,n:510, c:true},
  ],
  medrese:[
    {id:"m1",ad:"Hoca Efendi Mahmud",  yer:"İstanbul",uz:"Fıkıh & Akaid",    p:4.9,n:1100,c:false},
    {id:"m2",ad:"Müftü Ahmed Şükrü",   yer:"Konya",   uz:"Tefsir & Kuran",   p:4.8,n:890, c:false},
    {id:"m3",ad:"Üst. Hafize Hanım",   yer:"Ankara",  uz:"Hadis & Siyer",    p:4.9,n:760, c:false},
    {id:"m4",ad:"Üst. Fatma Nur",      yer:"Bursa",   uz:"Fıkıh & Feraiz",   p:4.7,n:680, c:false},
    {id:"m5",ad:"Öğrt. Yusuf Hoca",    yer:"İstanbul",uz:"Çocuklara Din",    p:4.9,n:540, c:true},
    {id:"m6",ad:"Öğrt. Zehra Hanım",   yer:"Kayseri", uz:"Çocuklara Kuran",  p:4.8,n:490, c:true},
  ],
  arabic:[
    {id:"a1",ad:"Dr. Khalid Al-Mansouri",yer:"Kahire", uz:"Nahiv & Sarf",     p:4.9,n:2100,c:false},
    {id:"a2",ad:"Prof. Yusuf Al-Azhari", yer:"Kahire", uz:"Fesahat",          p:4.8,n:1450,c:false},
    {id:"a3",ad:"Dr. Nour Al-Rashidi",   yer:"Bağdat", uz:"Modern Arapça",    p:4.9,n:1890,c:false},
    {id:"a4",ad:"Üst. Layla Al-Baghdadi",yer:"Amman",  uz:"Okuma-Yazma",      p:4.7,n:1120,c:false},
    {id:"a5",ad:"Öğrt. Samir Al-Faruq", yer:"Kahire", uz:"Çocuklara Arapça", p:4.9,n:720, c:true},
    {id:"a6",ad:"Öğrt. Hana Al-Zubi",   yer:"Amman",  uz:"Çocuklara Arapça", p:4.8,n:590, c:true},
  ],
  english:[
    {id:"e1",ad:"James Harrison",     yer:"Londra",    uz:"British & IELTS",  p:4.9,n:3200,c:false},
    {id:"e2",ad:"Dr. William Clarke", yer:"Oxford",    uz:"Academic Writing", p:4.8,n:2100,c:false},
    {id:"e3",ad:"Sarah Mitchell",     yer:"New York",  uz:"American & TOEFL", p:4.9,n:2800,c:false},
    {id:"e4",ad:"Emma Thompson",      yer:"Manchester",uz:"Conversation",     p:4.8,n:1950,c:false},
    {id:"e5",ad:"Tom Bradley",        yer:"Bristol",   uz:"Çocuklara İngilizce",p:4.9,n:880,c:true},
    {id:"e6",ad:"Lucy Williams",      yer:"Edinburgh", uz:"Çocuk İngilizcesi",p:4.8,n:740, c:true},
  ],
  german:[
    {id:"g1",ad:"Prof. Klaus Weber",  yer:"Berlin",    uz:"Grammatik & TestDaF",p:4.9,n:1800,c:false},
    {id:"g2",ad:"Dr. Hans Mueller",   yer:"Münih",     uz:"İş Almancası",     p:4.7,n:1200,c:false},
    {id:"g3",ad:"Anna Schneider",     yer:"Hamburg",   uz:"Konuşma",          p:4.9,n:2100,c:false},
    {id:"g4",ad:"Dr. Maria Fischer",  yer:"Viyana",    uz:"A1-B2",            p:4.8,n:1600,c:false},
    {id:"g5",ad:"Felix Braun",        yer:"Köln",      uz:"Çocuklara Almanca",p:4.9,n:650, c:true},
    {id:"g6",ad:"Lena Hoffmann",      yer:"Stuttgart", uz:"Çocuk Almancası",  p:4.8,n:520, c:true},
  ],
  french:[
    {id:"f1",ad:"Pierre Dubois",      yer:"Paris",     uz:"Grammaire & DELF", p:4.8,n:1900,c:false},
    {id:"f2",ad:"Dr. Jean-Luc Martin",yer:"Lyon",      uz:"Edebiyat",         p:4.9,n:1200,c:false},
    {id:"f3",ad:"Marie Dupont",       yer:"Paris",     uz:"Conversation",     p:4.9,n:2300,c:false},
    {id:"f4",ad:"Camille Bernard",    yer:"Bordeaux",  uz:"İş Fransızcası",   p:4.7,n:1050,c:false},
    {id:"f5",ad:"Theo Laurent",       yer:"Marseille", uz:"Çocuklara Fransızca",p:4.8,n:490,c:true},
    {id:"f6",ad:"Amelie Petit",       yer:"Nice",      uz:"Çocuk Fransızcası",p:4.9,n:420, c:true},
  ],
  italian:[
    {id:"i1",ad:"Marco Rossi",        yer:"Roma",      uz:"Conversazione",    p:4.8,n:1400,c:false},
    {id:"i2",ad:"Prof. Antonio B.",   yer:"Floransa",  uz:"Grammatica",       p:4.9,n:1100,c:false},
    {id:"i3",ad:"Sofia De Luca",      yer:"Milano",    uz:"Moda & İş",        p:4.9,n:1750,c:false},
    {id:"i4",ad:"Giulia Ferrari",     yer:"Napoli",    uz:"Konuşma",          p:4.7,n:980, c:false},
    {id:"i5",ad:"Luca Marino",        yer:"Torino",    uz:"Çocuklara İtalyanca",p:4.8,n:430,c:true},
    {id:"i6",ad:"Chiara Esposito",    yer:"Roma",      uz:"Çocuk İtalyancası",p:4.9,n:380, c:true},
  ],
  spanish:[
    {id:"s1",ad:"Prof. Carlos García",yer:"Madrid",    uz:"Gramática & DELE", p:4.9,n:2400,c:false},
    {id:"s2",ad:"Dr. Miguel R.",      yer:"Barselona", uz:"İş İspanyolcası",  p:4.8,n:1800,c:false},
    {id:"s3",ad:"Ana Martínez",       yer:"Sevilla",   uz:"Conversación",     p:4.9,n:2600,c:false},
    {id:"s4",ad:"Dr. Isabel López",   yer:"Valencia",  uz:"Latin Amerika",    p:4.8,n:2100,c:false},
    {id:"s5",ad:"Öğrt. Diego S.",     yer:"Madrid",    uz:"Çocuklara İspanyolca",p:4.9,n:720,c:true},
    {id:"s6",ad:"Öğrt. Lucía F.",     yer:"Barselona", uz:"Çocuk İspanyolcası",p:4.8,n:640,c:true},
  ],
  japanese:[
    {id:"j1",ad:"Tanaka Hiroshi",     yer:"Tokyo",     uz:"JLPT N1-N2",       p:4.9,n:2200,c:false},
    {id:"j2",ad:"Yamamoto Kenji",     yer:"Osaka",     uz:"Hiragana&Katakana",p:4.8,n:1700,c:false},
    {id:"j3",ad:"Suzuki Yuki",        yer:"Tokyo",     uz:"Günlük Japonca",   p:4.9,n:2500,c:false},
    {id:"j4",ad:"Nakamura Hana",      yer:"Kyoto",     uz:"Kültür & JLPT",    p:4.8,n:1900,c:false},
    {id:"j5",ad:"Öğrt. Sato Riku",    yer:"Tokyo",     uz:"Çocuklara Japonca",p:4.9,n:680, c:true},
    {id:"j6",ad:"Öğrt. Ito Sakura",   yer:"Osaka",     uz:"Çocuk Japonca",    p:4.8,n:520, c:true},
  ],
  korean:[
    {id:"k1",ad:"Kim Jisoo",          yer:"Seul",      uz:"TOPIK & Gramer",   p:4.9,n:1900,c:false},
    {id:"k2",ad:"Park Minjun",        yer:"Busan",     uz:"Günlük Korece",    p:4.8,n:1500,c:false},
    {id:"k3",ad:"Lee Sooyeon",        yer:"Seul",      uz:"K-Pop & Kültür",   p:4.9,n:2100,c:false},
    {id:"k4",ad:"Choi Hyunwoo",       yer:"Incheon",   uz:"İş Koreceyi",      p:4.8,n:1300,c:false},
    {id:"k5",ad:"Öğrt. Jung Jiho",    yer:"Seul",      uz:"Çocuklara Korece", p:4.9,n:620, c:true},
    {id:"k6",ad:"Öğrt. Han Miso",     yer:"Daegu",     uz:"Çocuk Koreceyi",   p:4.8,n:540, c:true},
  ],
  russian:[
    {id:"r1",ad:"Prof. Dmitri Volkov",yer:"Moskova",   uz:"Kiril & Gramer",   p:4.9,n:1600,c:false},
    {id:"r2",ad:"Dr. Alexei Petrov",  yer:"St.Petersburg",uz:"İş Rusçası",    p:4.8,n:1200,c:false},
    {id:"r3",ad:"Dr. Natasha Ivanova",yer:"Moskova",   uz:"Konuşma",          p:4.9,n:2000,c:false},
    {id:"r4",ad:"Prof. Elena S.",     yer:"Kazan",     uz:"Edebiyat",         p:4.8,n:1400,c:false},
    {id:"r5",ad:"Öğrt. Ivan Novikov", yer:"Moskova",   uz:"Çocuklara Rusça",  p:4.9,n:560, c:true},
    {id:"r6",ad:"Öğrt. Olga M.",      yer:"Novosibirsk",uz:"Çocuk Rusçası",   p:4.8,n:480, c:true},
  ],
  turkish:[
    {id:"t1",ad:"Prof. Mehmet Yıldız",yer:"İstanbul",  uz:"Dilbilgisi",       p:4.9,n:1500,c:false},
    {id:"t2",ad:"Dr. Ali Kaya",       yer:"Ankara",    uz:"Yabancılara Türkçe",p:4.8,n:1100,c:false},
    {id:"t3",ad:"Prof. Ayşe Demir",   yer:"İstanbul",  uz:"Konuşma",          p:4.9,n:1900,c:false},
    {id:"t4",ad:"Dr. Zeynep Arslan",  yer:"Bursa",     uz:"İleri Türkçe",     p:4.8,n:1300,c:false},
    {id:"t5",ad:"Öğrt. Burak Şahin",  yer:"İzmir",     uz:"Çocuklara Türkçe", p:4.9,n:620, c:true},
    {id:"t6",ad:"Öğrt. Elif Kılıç",   yer:"Ankara",    uz:"Çocuk Türkçesi",   p:4.8,n:540, c:true},
  ],
};

const BESMELE_DILLER = ["quran","arabic","medrese"];
const BESMELE_METNI = "Bismillahirrahmanirrahim\nRahman ve Rahim olan Allah'ın adıyla\n\nRabbi yessir ve la tuassir, rabbi temmim bilhayr\nRabbim kolaylaştır, zorlaştırma. Rabbim hayırla tamamla.\n\n";

const UYGUNSUZ = ["sex","porn","küfür","sik","orospu","amk","göt","nude","hack","bomb","terör"];
const uygunsuzMu = txt => UYGUNSUZ.some(k => txt.toLowerCase().includes(k));

function Av({h, dil, sz=64}) {
  const ini = h.ad.split(" ").slice(-2).map(w=>w[0]).join("");
  return (
    <div style={{width:sz,height:sz,borderRadius:"50%",flexShrink:0,position:"relative",
      background:"linear-gradient(145deg,"+dil.renk+","+dil.renk+"cc)",
      border:(sz>50?3:2)+"px solid "+dil.vurgu,
      display:"flex",alignItems:"center",justifyContent:"center",
      boxShadow:"0 0 20px "+dil.vurgu+"33"}}>
      <span style={{fontSize:sz>80?28:sz>50?18:12,fontWeight:900,color:"#fff",fontFamily:"Georgia,serif"}}>{ini}</span>
      {h.c && sz>50 && (
        <div style={{position:"absolute",top:-4,right:-4,width:20,height:20,borderRadius:"50%",
          background:K.gold,border:"2px solid "+K.bg,display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:10,color:"#fff",fontWeight:700}}>★</div>
      )}
    </div>
  );
}

async function sesliOku(metin, hocaId, dil_mic) {
  try {
    // ElevenLabs ses ID - DOĞRU kadın/erkek eşleştirme
    // ERKEK: Adam=pNInz6obpgDQGcFmaJgB, Arnold=VR6AewLTigWG4xSOukaG, Josh=TxGEqnHWrfWFTfGW9XjX
    // KADIN: Bella=EXAVITQu4vr4xnSDxMaL, Rachel=21m00Tcm4TlvDq8ikWAM, Elli=MF3mGyEYCl7XYWbV9V6O
    // ÇOCUK ERKEK: Charlie=IKne3meq5aSn9XLyUdCD
    // ÇOCUK KIZ: Aria=9BWtsMINqrJLrRacOk9x
    const HOCA_SES = {
      // Kuran (q1,q2=erkek | q3,q4=kadın | q5=çocuk erkek | q6=çocuk kız)
      q1:"pNInz6obpgDQGcFmaJgB", q2:"VR6AewLTigWG4xSOukaG",  // erkek
      q3:"EXAVITQu4vr4xnSDxMaL", q4:"MF3mGyEYCl7XYWbV9V6O",  // kadın
      q5:"IKne3meq5aSn9XLyUdCD", q6:"9BWtsMINqrJLrRacOk9x",   // çocuk
      m1:"TxGEqnHWrfWFTfGW9XjX", m2:"pNInz6obpgDQGcFmaJgB",  // erkek
      m3:"21m00Tcm4TlvDq8ikWAM", m4:"EXAVITQu4vr4xnSDxMaL",  // kadın
      m5:"IKne3meq5aSn9XLyUdCD", m6:"9BWtsMINqrJLrRacOk9x",   // çocuk
      e1:"jBpfuIE2acCO8z3wKNLl", e2:"VR6AewLTigWG4xSOukaG",   // erkek
      e3:"21m00Tcm4TlvDq8ikWAM", e4:"EXAVITQu4vr4xnSDxMaL",  // kadın
      e5:"IKne3meq5aSn9XLyUdCD", e6:"9BWtsMINqrJLrRacOk9x",   // çocuk
      g1:"VR6AewLTigWG4xSOukaG", g2:"pNInz6obpgDQGcFmaJgB",  // erkek
      g3:"EXAVITQu4vr4xnSDxMaL", g4:"21m00Tcm4TlvDq8ikWAM",  // kadın
      g5:"IKne3meq5aSn9XLyUdCD", g6:"9BWtsMINqrJLrRacOk9x",   // çocuk
      f1:"VR6AewLTigWG4xSOukaG", f2:"TxGEqnHWrfWFTfGW9XjX",  // erkek
      f3:"EXAVITQu4vr4xnSDxMaL", f4:"21m00Tcm4TlvDq8ikWAM",  // kadın
      f5:"IKne3meq5aSn9XLyUdCD", f6:"9BWtsMINqrJLrRacOk9x",   // çocuk
      j1:"VR6AewLTigWG4xSOukaG", j2:"pNInz6obpgDQGcFmaJgB",  // erkek
      j3:"EXAVITQu4vr4xnSDxMaL", j4:"21m00Tcm4TlvDq8ikWAM",  // kadın
      j5:"IKne3meq5aSn9XLyUdCD", j6:"9BWtsMINqrJLrRacOk9x",   // çocuk
      k1:"EXAVITQu4vr4xnSDxMaL", k2:"pNInz6obpgDQGcFmaJgB",  // kadın,erkek
      k3:"21m00Tcm4TlvDq8ikWAM", k4:"VR6AewLTigWG4xSOukaG",  // kadın,erkek
      k5:"IKne3meq5aSn9XLyUdCD", k6:"9BWtsMINqrJLrRacOk9x",   // çocuk
      r1:"VR6AewLTigWG4xSOukaG", r2:"pNInz6obpgDQGcFmaJgB",  // erkek
      r3:"EXAVITQu4vr4xnSDxMaL", r4:"21m00Tcm4TlvDq8ikWAM",  // kadın
      r5:"IKne3meq5aSn9XLyUdCD", r6:"9BWtsMINqrJLrRacOk9x",   // çocuk
      t1:"VR6AewLTigWG4xSOukaG", t2:"pNInz6obpgDQGcFmaJgB",  // erkek
      t3:"EXAVITQu4vr4xnSDxMaL", t4:"21m00Tcm4TlvDq8ikWAM",  // kadın
      t5:"IKne3meq5aSn9XLyUdCD", t6:"9BWtsMINqrJLrRacOk9x",   // çocuk
      a1:"pNInz6obpgDQGcFmaJgB", a2:"VR6AewLTigWG4xSOukaG",  // erkek
      a3:"EXAVITQu4vr4xnSDxMaL", a4:"21m00Tcm4TlvDq8ikWAM",  // kadın
      a5:"IKne3meq5aSn9XLyUdCD", a6:"9BWtsMINqrJLrRacOk9x",   // çocuk
      i1:"VR6AewLTigWG4xSOukaG", i2:"pNInz6obpgDQGcFmaJgB",  // erkek
      i3:"EXAVITQu4vr4xnSDxMaL", i4:"21m00Tcm4TlvDq8ikWAM",  // kadın
      i5:"IKne3meq5aSn9XLyUdCD", i6:"9BWtsMINqrJLrRacOk9x",   // çocuk
      s1:"VR6AewLTigWG4xSOukaG", s2:"pNInz6obpgDQGcFmaJgB",  // erkek
      s3:"EXAVITQu4vr4xnSDxMaL", s4:"21m00Tcm4TlvDq8ikWAM",  // kadın
      s5:"IKne3meq5aSn9XLyUdCD", s6:"9BWtsMINqrJLrRacOk9x",   // çocuk
      default:"EXAVITQu4vr4xnSDxMaL",
    };
    const voiceId = HOCA_SES[hocaId] || HOCA_SES.default;
    const res = await fetch("/api/tts", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({text:metin.substring(0,500), voiceId})
    });
    if (!res.ok) throw new Error("tts hata");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    return new Promise(resolve => {
      audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
      audio.onerror = () => { URL.revokeObjectURL(url); tarayiciSes(metin, dil_mic).then(resolve); };
      audio.play().catch(() => tarayiciSes(metin, dil_mic).then(resolve));
    });
  } catch {
    return tarayiciSes(metin, dil_mic);
  }
}

function tarayiciSes(metin, lang) {
  return new Promise(resolve => {
    try {
      window.speechSynthesis?.cancel();
      const u = new SpeechSynthesisUtterance(metin.substring(0,300));
      u.lang = lang || "tr-TR";
      u.rate = 0.82;
      u.pitch = 1.05;
      u.volume = 1.0;
      // Daha doğal ses için uygun ses seç
      const sesler = window.speechSynthesis.getVoices();
      const uygunSes = sesler.find(s => s.lang.startsWith(lang?.split("-")[0]||"tr") && !s.name.includes("Google"));
      if (uygunSes) u.voice = uygunSes;
      u.onend = resolve; u.onerror = resolve;
      window.speechSynthesis?.speak(u);
    } catch { resolve(); }
  });
}

async function aiYanit(msgs, system) {
  const res = await fetch("/api/chat", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({messages:msgs, system})
  });
  if (!res.ok) {
    const d = await res.json().catch(()=>({}));
    throw new Error(d.error || "Sunucu hatası: "+res.status);
  }
  const d = await res.json();
  return d.content?.[0]?.text || "";
}

function AuthModal({ilkMod, kapat, basari}) {
  const [mod, setMod] = useState(ilkMod||"giris");
  const [f, setF] = useState({ad:"",email:"",tel:"",tc:"",dogum:"",sehir:"",sifre:"",sifre2:"",onay:false});
  const [h, setH] = useState({});
  const [tamam, setTamam] = useState(false);
  const [mesaj, setMesaj] = useState("");

  const inp = (k, tip, yer) => (
    <div style={{marginBottom:10}}>
      <input type={tip} value={f[k]} placeholder={yer}
        onChange={e=>{setF(p=>({...p,[k]:e.target.value}));setH(p=>({...p,[k]:""}));}}
        style={{width:"100%",padding:"10px 13px",background:K.bg3,
          border:"1px solid "+(h[k]?K.err:K.bdr),borderRadius:9,
          color:K.tx,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
      {h[k] && <div style={{color:K.errL,fontSize:11,marginTop:3}}>{h[k]}</div>}
    </div>
  );

  const doGiris = () => {
    const e={};
    if(!f.email) e.email="E-posta gerekli";
    if(!f.sifre) e.sifre="Şifre gerekli";
    if(Object.keys(e).length){setH(e);return;}
    const a=getA();
    const u=(a.users||[]).find(x=>x.email.toLowerCase()===f.email.toLowerCase()&&x.pw===f.sifre);
    if(!u){setH({sifre:"E-posta veya şifre hatalı"});return;}
    basari(u);
  };

  const doKayit = () => {
    const e={};
    if(!f.ad.trim()) e.ad="Zorunlu";
    if(!f.email.includes("@")) e.email="Geçerli e-posta";
    if(!f.tel.trim()) e.tel="Zorunlu";
    if(f.tc.length!==11||!/^\d+$/.test(f.tc)) e.tc="11 haneli TC";
    if(!f.dogum) e.dogum="Zorunlu";
    if(!f.sehir.trim()) e.sehir="Zorunlu";
    if(f.sifre.length<6) e.sifre="En az 6 karakter";
    if(f.sifre!==f.sifre2) e.sifre2="Şifreler eşleşmiyor";
    if(!f.onay) e.onay="Zorunlu";
    if(Object.keys(e).length){setH(e);return;}
    const a=getA();
    if((a.users||[]).find(x=>x.email.toLowerCase()===f.email.toLowerCase())){setH({email:"Bu e-posta kayıtlı"});return;}
    const yeni={id:Date.now(),ad:f.ad,email:f.email,tel:f.tel,tc:f.tc,dogum:f.dogum,
      sehir:f.sehir,pw:f.sifre,plan:"Deneme",durum:"Deneme",
      tarih:new Date().toLocaleDateString("tr-TR"),odeme:"₺0",trialStart:Date.now(),hediye:false};
    setA({...a,users:[...(a.users||[]),yeni]});
    setTamam(true);
    basari(yeni);
  };

  const doSifre = () => {
    if(!f.email.includes("@")){setH({email:"Geçerli e-posta girin"});return;}
    setMesaj("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
  };

  const tabS = a => ({flex:1,padding:"10px",border:"none",cursor:"pointer",fontWeight:700,fontSize:13,
    background:a?"linear-gradient(135deg,"+K.g2+","+K.t2+")":K.bg3,
    color:a?"#fff":K.tx3,borderRadius:8});
  const btnP = {width:"100%",padding:12,background:"linear-gradient(135deg,"+K.g2+","+K.t2+")",
    color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14,marginBottom:8};
  const btnG = {width:"100%",padding:11,background:"transparent",color:K.tx2,
    border:"1px solid "+K.bdr,borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:13,marginBottom:8};
  const lnk = {background:"none",border:"none",color:K.tL,cursor:"pointer",fontSize:12,fontWeight:600};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",
      alignItems:"center",justifyContent:"center",zIndex:9000}}>
      <div style={{background:K.card,borderRadius:22,padding:24,width:390,
        border:"1px solid "+K.bdr3,maxHeight:"92vh",overflowY:"auto",
        boxShadow:"0 24px 64px rgba(0,0,0,0.8)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          {mod!=="unuttu" && (
            <div style={{display:"flex",gap:6,flex:1}}>
              <button style={tabS(mod==="giris")} onClick={()=>{setMod("giris");setH({});}}>Giriş Yap</button>
              <button style={tabS(mod==="kayit")} onClick={()=>{setMod("kayit");setH({});setTamam(false);}}>Üye Ol</button>
            </div>
          )}
          {mod==="unuttu" && <div style={{color:K.tx,fontSize:16,fontWeight:700}}>Şifremi Unuttum</div>}
          <button onClick={kapat} style={{background:"none",border:"none",color:K.tx3,fontSize:22,cursor:"pointer",marginLeft:8}}>✕</button>
        </div>

        {mod==="giris" && <>
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>E-posta</div>
          {inp("email","email","ornek@mail.com")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>Şifre</div>
          {inp("sifre","password","••••••••")}
          <div style={{textAlign:"right",marginBottom:14}}>
            <button style={lnk} onClick={()=>{setMod("unuttu");setH({});setMesaj("");}}>Şifremi Unuttum</button>
          </div>
          <button style={btnP} onClick={doGiris}>Giriş Yap</button>
          <div style={{textAlign:"center",color:K.tx3,fontSize:12}}>
            Hesabın yok mu? <button style={lnk} onClick={()=>{setMod("kayit");setH({});setTamam(false);}}>Üye Ol</button>
          </div>
        </>}

        {mod==="kayit" && (tamam ? (
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:56,marginBottom:12}}>🎉</div>
            <div style={{color:K.tx,fontSize:20,fontWeight:700,marginBottom:8}}>Hoş Geldin!</div>
            <div style={{color:K.tx3,fontSize:13,marginBottom:20}}>5 günlük ücretsiz denemen başladı.</div>
            <button style={btnP} onClick={kapat}>Derse Başla →</button>
            <button style={btnG} onClick={kapat}>Ana Sayfaya Dön</button>
          </div>
        ) : <>
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>Ad Soyad</div>{inp("ad","text","Ahmet Yılmaz")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>E-posta</div>{inp("email","email","ornek@mail.com")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>Telefon</div>{inp("tel","tel","05XX XXX XXXX")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>T.C. Kimlik No</div>{inp("tc","text","12345678901")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>Doğum Tarihi</div>{inp("dogum","date","")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>Şehir</div>{inp("sehir","text","İstanbul")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>Şifre</div>{inp("sifre","password","min 6 karakter")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>Şifre Tekrar</div>{inp("sifre2","password","tekrar girin")}
          <div style={{background:K.bg3,borderRadius:9,padding:11,marginBottom:12,border:"1px solid "+K.bdr}}>
            <label style={{display:"flex",gap:9,cursor:"pointer",alignItems:"flex-start"}}>
              <input type="checkbox" checked={f.onay} onChange={e=>setF(p=>({...p,onay:e.target.checked}))}
                style={{marginTop:2,width:15,height:15,accentColor:K.gL}}/>
              <span style={{color:K.tx3,fontSize:11,lineHeight:1.6}}>
                Platform hizmet kalitesi kontrolleri kapsamındaki denetim uygulamalarını ve gizlilik politikasını okudum, kabul ediyorum.
              </span>
            </label>
            {h.onay && <div style={{color:K.errL,fontSize:10,marginTop:4}}>{h.onay}</div>}
          </div>
          <button style={btnP} onClick={doKayit}>Kayıt Ol →</button>
          <div style={{textAlign:"center",color:K.tx3,fontSize:12}}>
            Zaten hesabın var mı? <button style={lnk} onClick={()=>{setMod("giris");setH({});}}>Giriş Yap</button>
          </div>
        </>)}

        {mod==="unuttu" && (mesaj ? (
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:50,marginBottom:12}}>📧</div>
            <div style={{color:K.tx,fontSize:16,fontWeight:700,marginBottom:8}}>E-posta Gönderildi!</div>
            <div style={{color:K.tx3,fontSize:13,marginBottom:20}}>{mesaj}</div>
            <button style={btnP} onClick={()=>setMod("giris")}>Giriş Yap</button>
          </div>
        ) : <>
          <div style={{color:K.tx3,fontSize:12,marginBottom:14,lineHeight:1.6}}>Kayıtlı e-postanızı girin.</div>
          <div style={{color:K.tx3,fontSize:11,marginBottom:3}}>E-posta</div>
          {inp("email","email","ornek@mail.com")}
          <button style={btnP} onClick={doSifre}>Sıfırlama E-postası Gönder</button>
          <div style={{textAlign:"center"}}>
            <button style={lnk} onClick={()=>setMod("giris")}>← Geri Dön</button>
          </div>
        </>)}
      </div>
    </div>
  );
}

function DersEkrani({dilId, hoca, kul, kapat}) {
  const dil = DILLER.find(d=>d.id===dilId);
  // WhatsApp mantığı - önceki ders geçmişini yükle
  const [msgs, setMsgs] = useState(() => {
    if (!kul?.id || !dilId || !hoca?.id) return [];
    const dg = getDG(kul.id, dilId+"_"+hoca.id);
    return dg.length > 0 ? dg : [];
  });
  const [yazi, setYazi] = useState("");
  const [yukl, setYukl] = useState(false);
  const [mikr, setMikr] = useState(false);
  const [mikErr, setMikErr] = useState("");
  const [sure, setSure] = useState(kul?.plan==="Deneme"?1200:0);
  const [dilMod, setDilMod] = useState(null);
  const [sesliMod, setSesliMod] = useState(false); // true=sesli, false=yazılı
  const SEVIYE_ACIKLAMA = {
    A1: "Başlangıç — Sıfırdan başlıyorum",
    A2: "Temel — Basit cümleler kurabiliyorum",
    B1: "Orta Alt — Günlük konuşabilirim",
    B2: "Orta Üst — Akıcı konuşabiliyorum",
    C1: "İleri — Neredeyse ana dil gibi",
    C2: "Uzman — Ana dil seviyesi"
  };

  const [seviye, setSeviye] = useState(() => {
    if (!kul?.id) return "A1";
    const sv = getSV(kul.id, dilId);
    return sv || "A1";
  });
  const [kategori, setKategori] = useState("Genel");
  const sonRef = useRef(null);
  const recRef = useRef(null);
  const konusmaRef = useRef(false);
  const baslangic = useRef(Date.now());

  useEffect(() => {
    if (kul?.plan==="Deneme") {
      const ti = setInterval(()=>setSure(s=>{if(s<=1){clearInterval(ti);return 0;}return s-1;}),1000);
      return ()=>clearInterval(ti);
    }
  },[]);

  useEffect(() => {
    if (!dilMod) return;
    const ad = kul?.ad?.split(" ")[0]||"";
    const besmele = BESMELE_DILLER.includes(dilId) ? BESMELE_METNI : "";
    // Önceki ders geçmişini al
    const oncekiDersler = kul?.id ? getDG(kul.id, dilId) : [];
    const sonDers = oncekiDersler.length > 0 ? oncekiDersler[oncekiDersler.length-1] : null;
    const devamMesaj = sonDers 
      ? "Son dersimizde "+sonDers.kategori+" konusunu işlemiştik. Kaldığımız yerden devam edelim.\n\n"
      : "Bu seninle ilk dersimiz. "+seviye+" seviyesinden başlayacağız.\n\n";

    const dersPlani = seviye==="A1" 
      ? "Bugün temel "+dil.ad+" konularını öğreneceğiz: selamlaşma, kendini tanıtma ve temel kelimeler."
      : seviye==="A2"
      ? "Bugün günlük konuşma kalıpları ve basit cümleler üzerinde çalışacağız."
      : seviye==="B1"
      ? "Bugün orta seviye konuşma pratiği ve gramer konularını işleyeceğiz."
      : seviye==="B2"
      ? "Bugün ileri konuşma ve yazma becerilerini geliştireceğiz."
      : "Bugün ileri düzey "+dil.ad+" pratiği yapacağız.";

    const seviyeAcik = {A1:"Başlangıç",A2:"Temel",B1:"Orta Alt",B2:"Orta Üst",C1:"İleri",C2:"Uzman"};
    const ilkDersMi = oncekiDersler.length === 0;
    
    let karsilamaTxt;
    // Medrese/Kuran için özel başlangıç sorusu
    const diniBaslangic = (dilId==="medrese"||dilId==="quran") ? 
      "\n\n📋 Sana birkaç soru sormam gerekiyor:\n"+
      "1️⃣ Kur'an harflerini (Elif-Ba) biliyor musun?\n"+
      "2️⃣ Kur'an okuyabiliyor musun?\n"+
      "3️⃣ Tecvid biliyor musun?\n"+
      "4️⃣ Namaz surelerini ve dualarını biliyor musun?\n\n"+
      "Cevabına göre seni doğru yerden başlatacağım. Türkçe cevapleyebilirsin." : 
      "\n\n"+dil.ad+" seviyeni doğrulamak için: "+
      (seviye==="A1"||seviye==="A2" ? dil.ad+" dilinde kendinizi tanıtır mısınız?" : 
       "Bugünkü "+seviye+" seviyesi konusu hakkında ne biliyorsunuz?");

    if (ilkDersMi) {
      karsilamaTxt = besmele +
        "Merhaba "+ad+"! Ben "+hoca.ad+", "+hoca.uz+" uzmanıyım. 👋\n\n"+
        "Seninle ilk dersimiz! "+seviye+" ("+seviyeAcik[seviye]+") seviyesini seçmişsin."+
        diniBaslangic+
        "\n\n💡 "+dil.ad+" dersine hoş geldin! 🎓";
    } else {
      karsilamaTxt = besmele +
        "Tekrar hoş geldin "+ad+"! Ben "+hoca.ad+". 😊\n\n"+
        "Son dersimizde: "+sonDers.kategori+" konusunu "+sonDers.seviye+" seviyesinde işlemiştik.\n\n"+
        "📚 Bugün kaldığımız yerden devam ediyoruz:\n"+
        getMufredat(dilId, seviye)+"\n\n"+
        "Hazır mısın? Başlayalım!\n\n💡 İpucu: 🎤 butona bas sesli konuş, ya da klavyeyle yaz.";
    }
    const txt = karsilamaTxt;
    setMsgs([{r:"ai",t:txt}]);
    // Besmele - sadece sesli modda oku
    if (BESMELE_DILLER.includes(dilId) && sesliMod) {
      setTimeout(async ()=>{
        const tamBesmele = "Bismillahirrahmanirrahim. Rabbi yessir vela la tuassir, rabbi temmim bil hayr. Vela hawle vela kuvvete illa billahil aliyyil azim.";
        await sesliOku(tamBesmele, hoca.id, "ar-SA");
      },500);
    }
  },[dilMod]);

  useEffect(()=>{sonRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const getPrompt = () => {
    const ad = kul?.ad?.split(" ")[0] || "Öğrenci";
    const oncekiDersler = kul?.id ? getDG(kul.id, dilId) : [];
    const sonDers = oncekiDersler.length > 0 ? oncekiDersler[oncekiDersler.length-1] : null;

    const buSeviyeMufredat = getMufredat(dilId, seviye);
    const gecmisOzet = sonDers ? "Son ders: "+sonDers.tarih+", konu: "+sonDers.kategori+", seviye: "+sonDers.seviye+"." : "İlk ders.";

    // DİL KURALI - KESİN
    let dilKurali = "";
    if (dilMod === "tr") {
      dilKurali = "ZORUNLU KURAL: SADECE TÜRKÇE YAZ. Başka hiçbir dil kullanma. Rusça, Japonca, İngilizce kelime YASAK. ANCAK: Arapça kelimeler öğretilirken doğru Arapça harflerle yaz (örn: كَلَم = Kalem, لا تُعَسِّر = la tuassir). Yanlış Arapça yazma!";
    } else if (dilMod === "hedef") {
      dilKurali = "ZORUNLU KURAL: SADECE "+dil.ad.toUpperCase()+" dilinde yaz. Türkçe dahil başka dil YASAK.";
    } else {
      dilKurali = "ZORUNLU KURAL: Açıklamaları TÜRKÇE yap. "+dil.ad+" örnekler ver. ASLA dil karıştırma. Cümlenin yarısı Türkçe yarısı başka dil OLMAZ.";
    }

    // ÇOCUK TARZI
    const cocukTarz = hoca.c ?
      "SEN BİR ÇOCUK ÖĞRETMENİSİN! Çok eğlenceli, sevimli ve neşeli konuş 😊🌟🎉. Çocuklara hitap et. Basit kelimeler kullan. Her konuyu oyun gibi anlat. Övgü cümleleri ekle (Aferin! Harika! Süper!). Emoji kullan." : "";

    // OKUL MANTIĞI - MÜFREDAT TAKİBİ
    const okulMantigi = "Sen bir "+dil.ad+" öğretmenisin, okul mantığında ders yap:\n"+
      "1. "+ad+" öğrencinin seviyesi "+seviye+". Bu seviyede konu: "+getMufredat(dilId, seviye)+"\n"+
      "2. "+gecmisOzet+" Kaldığı yerden devam et.\n"+
      "3. Önce bu dersin konusunu anlat, sonra öğrenciye alıştırma yaptır.\n"+
      "4. Her yanıttan sonra bir pratik soru sor.\n"+
      "5. Öğrenci hata yaparsa hemen nazikçe düzelt.\n"+
      "6. Cümleleri MUTLAKA tam bitir. Yarım bırakma.\n"+
      "7. Her zaman AYNI doğru bilgiyi ver. Tutarsız olma.\n"+
      "8. Asla Duolingo veya başka uygulama önerme. Sen en iyi öğretmensin.";

    // DİNİ DERSLER ÖZEL KURAL
    const diniKural = (dilId==="medrese"||dilId==="quran") ?
      "DİNİ DERS KURALLARI - KESİNLİKLE UYULMALI (İHLAL ETME):\n"+
      "- Medrese sırası: 1.Kuran 2.Arapça 3.Fıkıh 4.Hadis 5.Tefsir 6.Akaid. Bu ASLA değişmez.\n"+
      "- Namaz duaları ve ayetleri TAM ver, eksik verme, özetleme.\n"+
      "- Ettehiyyatü namazda okunan duadır, Kuran suresi DEĞİLDİR.\n"+
      "- Arapça kelimeleri MUTLAKA doğru Arapça harflerle yaz. Kalem = قَلَم (doğru). Kalem = كَلَم (YANLIŞ).\n"+
      "- Dua ve ayetleri TAM yaz, yarım bırakma. Rabbu yessir duasının tamamı: رَبِّ يَسِّرْ وَلَا تُعَسِّرْ، رَبِّ تَمِّمْ بِالْخَيْرِ\n"+
      "- Emin olmadığın bilgiyi KESINLIKLE üretme. Yanlis bilgi vermek haramdır.\n"+
      "- Kuran ayet numaraları söylerken SADECE emin olduğunu söyle, uydurma.\n"+
      "- Var olmayan ayet, hadis uydurma. Bilmiyorsan: 'Bu konuda kesin bilgim yok, güvenilir bir kaynaktan doğrulayın' de.\n"+
      "- Dua veya sure istenince: Arapça metin + Türkçe okunuş + Anlam + Kaynak ver.\n"+
      "- Fıkıh konularında önce görüş birliği olan bilgiyi ver." : "";

    return okulMantigi+"\n"+dilKurali+"\n"+cocukTarz+"\n"+diniKural+
      "\nHoca: "+hoca.ad+". Uzmanlık: "+hoca.uz+". Kategori: "+kategori+"."+
      "\n"+(sesliMod?"Öğrenci sesli konuşuyor, kısa net yanıt ver.":"Öğrenci yazıyor, yazılı yanıt ver.")+
      "\nŞİMDİ DERSE BAŞLA. "+seviye+" seviyesine göre bugünkü konuyu tanıt, öğrenciye soru sor.";
  };


  const gonder = async (txt) => {
    if (!txt||!txt.trim()||yukl) return;
    const metin = txt.trim();
    if (uygunsuzMu(metin)) {
      const a = getA();
      const kulIhtarlar = (a.ihtarlar||[]).filter(x=>x.email===kul?.email).length;
      const yeniIhtar = {id:Date.now(),kulAd:kul?.ad||"",email:kul?.email||"",mesaj:metin,tarih:new Date().toLocaleString("tr-TR")};
      setA({...a, ihtarlar:[...(a.ihtarlar||[]), yeniIhtar]});
      if (kulIhtarlar >= 2) {
        // 3. uyarı - üyeliği sil
        setA({...a,
          users:(a.users||[]).filter(x=>x.email!==kul?.email),
          ihtarlar:[...(a.ihtarlar||[]), yeniIhtar]
        });
        setMsgs(m=>[...m,{r:"ai",t:"🚫 HESABINIZ KALICI OLARAK SİLİNDİ. Uygunsuz içerik politikamızı 3 kez ihlal ettiniz. Bu karar geri alınamaz."}]);
        setTimeout(()=>{ DB.d("kul"); window.location.reload(); }, 3000);
      } else {
        setMsgs(m=>[...m,{r:"ai",t:"⚠️ UYARI "+(kulIhtarlar+1)+"/3: Bu içerik platform kurallarına aykırıdır. 3 uyarıda üyeliğiniz kalıcı olarak silinecektir."}]);
      }
      return;
    }
    setYazi(""); setYukl(true);
    const yeniMsgs = [...msgs, {r:"user", t:metin}];
    setMsgs(yeniMsgs);
    if (kul?.id) setDG(kul.id, dilId+"_"+hoca.id, yeniMsgs.slice(-50));
    try {
      const history = msgs.filter(m=>m.r).map(m=>({role:m.r==="ai"?"assistant":"user",content:m.t}));
      const yan = await aiYanit([...history,{role:"user",content:metin}], getPrompt());
      const guncelMsgs = [...msgs, {r:"user",t:metin}, {r:"ai",t:yan}];
    setMsgs(m => {
      const yeni = [...m, {r:"ai",t:yan}];
      if (kul?.id) setDG(kul.id, dilId+"_"+hoca.id, yeni.slice(-50));
      return yeni;
    });
      // Sesli yanıt - her zaman çal (ElevenLabs varsa), yoksa tarayıcı sesi
    try {
      await sesliOku(yan.substring(0,600), hoca.id, dilMod==="hedef"?dil.mic:"tr-TR");
    } catch(sesErr) {
      console.warn("Ses hatası:", sesErr);
    }
    if (sesliMod && konusmaRef.current) setTimeout(mikDinle, 800);
      if (konusmaRef.current) mikDinle();
    } catch(e) {
      setMsgs(m=>[...m,{r:"ai",t:"Bağlantı hatası: "+e.message+". Tekrar deneyin."}]);
    }
    setYukl(false);
  };

  const mikDinle = () => {
    if (!konusmaRef.current) return;
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if (!SR) { setMikErr("Ses girişi desteklenmiyor."); return; }
    try {
      const r = new SR();
      r.lang = dilMod==="hedef"?dil.mic:"tr-TR";
      r.continuous=true;
      r.interimResults=true;
      r.maxAlternatives=1;
      if(r.speechRecognitionList) r.serviceURI = "";
      r.onstart=()=>setMikr(true);
      let birikmisSonuc = "";
      let sessizlikTimer = null;
      
      r.onresult=e=>{
        // Sessizlik timer'ı sıfırla - konuşma devam ediyor
        if(sessizlikTimer) clearTimeout(sessizlikTimer);
        
        let araMetin = "";
        for(let i=e.resultIndex; i<e.results.length; i++){
          if(e.results[i].isFinal){
            birikmisSonuc += e.results[i][0].transcript + " ";
          } else {
            araMetin = e.results[i][0].transcript;
          }
        }
        setYazi(birikmisSonuc + araMetin);
        
        // 2.5 saniye sessizlik sonra gönder (nefes alınca hemen kapanmasın)
        sessizlikTimer = setTimeout(() => {
          if(birikmisSonuc.trim()) {
            r.stop();
          }
        }, 2500);
      };
      
      r.onspeechend = () => {
        // Konuşma bitti ama 2 saniye bekle - belki devam edecek
        if(sessizlikTimer) clearTimeout(sessizlikTimer);
        sessizlikTimer = setTimeout(() => {
          r.stop();
        }, 2000);
      };
      r.onerror=e=>{setMikr(false); if(e.error!=="no-speech"&&e.error!=="aborted"){setMikErr("Ses algılanamadı."); setTimeout(()=>setMikErr(""),3000);}};
      r.onend=()=>{
        if(sessizlikTimer) clearTimeout(sessizlikTimer);
        setMikr(false);
        const sonucMetin = birikmisSonuc.trim();
        if(sonucMetin){
          birikmisSonuc = "";
          gonder(sonucMetin);
        } else if(konusmaRef.current) {
          // Hiç ses algılanmadıysa tekrar dinle
          setTimeout(mikDinle, 500);
        }
      };
      recRef.current=r; r.start();
    } catch {setMikErr("Mikrofon başlatılamadı.");}
  };

  const mikToggle = () => {
    setSesliMod(!konusmaRef.current); // Mikrofon açılınca sesli mod
    if (konusmaRef.current) {
      konusmaRef.current=false;
      try{recRef.current?.stop();}catch{}
      setMikr(false);
    } else {
      konusmaRef.current=true;
      mikDinle();
    }
  };

  const dersKapat = () => {
    konusmaRef.current=false;
    try{recRef.current?.stop();}catch{}
    if (kul?.id && dilMod) {
      const sure2 = Math.floor((Date.now()-baslangic.current)/60000);
      const gecmis = getDG(kul.id,dilId);
      setDG(kul.id,dilId,[...gecmis,{id:Date.now(),tarih:new Date().toLocaleDateString("tr-TR"),
        hoca:hoca.ad,dilMod,kategori,sure:sure2,seviye,
        ozet:msgs.filter(m=>m.r==="user").slice(-1)[0]?.t||""}]);
      const idx = Math.min(Math.floor((gecmis.length+1)/5), SEVIYELER.length-1);
      const yeniSv = SEVIYELER[idx];
      setSV(kul.id,dilId,yeniSv);
      if (yeniSv!==seviye) alert("🎉 Tebrikler! "+yeniSv+" seviyesine ulaştınız!");
    }
    kapat();
  };

  const mm = String(Math.floor(sure/60)).padStart(2,"0");
  const ss = String(sure%60).padStart(2,"0");
  const dilLabel = dilMod==="tr"?"🇹🇷 Türkçe":dilMod==="hedef"?dil.bayrak+" "+dil.ad:"🔄 İkidilli";

  if (!dilMod) {
    return (
      <div style={{position:"fixed",inset:0,background:K.bg,display:"flex",alignItems:"center",justifyContent:"center",zIndex:8000}}>
        <div style={{background:K.card,borderRadius:22,padding:36,width:420,border:"1px solid "+K.bdr3,
          textAlign:"center",boxShadow:"0 24px 64px rgba(0,0,0,0.8)",maxHeight:"90vh",overflowY:"auto"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}><Av h={hoca} dil={dil} sz={80}/></div>
          <div style={{color:K.tx,fontSize:18,fontWeight:800,marginBottom:4}}>{hoca.ad}</div>
          <div style={{color:dil.vurgu,fontSize:12,marginBottom:4}}>{hoca.yer}</div>
          <div style={{color:K.tx3,fontSize:13,marginBottom:20}}>{hoca.uz}</div>

          {/* SEVİYE SEÇİMİ */}
          <div style={{marginBottom:20}}>
            <div style={{color:K.tx2,fontSize:13,fontWeight:700,marginBottom:10}}>📊 Seviyeni Seç:</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
              {["A1","A2","B1","B2","C1","C2"].map(sv=>(
                <button key={sv} onClick={()=>setSeviye(sv)}
                  style={{padding:"8px 14px",borderRadius:10,cursor:"pointer",fontSize:12,fontWeight:seviye===sv?700:400,
                    background:seviye===sv?"linear-gradient(135deg,"+K.g2+","+K.t2+")":K.bg3,
                    color:seviye===sv?"#fff":K.tx3,border:"1px solid "+(seviye===sv?K.g3:K.bdr),
                    textAlign:"center",minWidth:60}}>
                  <div style={{fontSize:13,fontWeight:700}}>{sv}</div>
                  <div style={{fontSize:9,opacity:0.8,marginTop:1}}>
                    {sv==="A1"?"Başlangıç":sv==="A2"?"Temel":sv==="B1"?"Orta":sv==="B2"?"Orta Üst":sv==="C1"?"İleri":"Uzman"}
                  </div>
                </button>
              ))}
            </div>
            <div style={{textAlign:"center",marginTop:8,color:K.tx4,fontSize:11}}>
              Mevcut: <strong style={{color:K.gL}}>{seviye}</strong> — {SEVIYE_ACIKLAMA[seviye]}
            </div>
          </div>

          {dil.cats && <>
            <div style={{color:K.tx2,fontSize:13,fontWeight:700,marginBottom:10}}>📚 Konu Kategorisi:</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:20}}>
              {dil.cats.map(cat=>(
                <button key={cat} onClick={()=>setKategori(cat)}
                  style={{padding:"6px 12px",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:kategori===cat?700:400,
                    background:kategori===cat?"linear-gradient(135deg,"+K.g2+","+K.t2+")":K.bg3,
                    color:kategori===cat?"#fff":K.tx3,border:"1px solid "+(kategori===cat?K.g3:K.bdr)}}>
                  {cat}
                </button>
              ))}
            </div>
          </>}

          <div style={{color:K.tx2,fontSize:14,fontWeight:700,marginBottom:16}}>Ders Dilini Seç:</div>
          {[
            {id:"tr",    b:"🇹🇷 Türkçe",         a:"Hoca Türkçe anlatır"},
            {id:"hedef", b:dil.bayrak+" "+dil.ad, a:"Hoca "+dil.ad+" konuşur"},
            {id:"iki",   b:"🔄 İkidilli",          a:"Türkçe + "+dil.ad},
          ].map(s=>(
            <div key={s.id} onClick={()=>setDilMod(s.id)}
              style={{background:K.bg3,borderRadius:12,padding:"14px 18px",marginBottom:10,
                cursor:"pointer",border:"1px solid "+K.bdr,textAlign:"left"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=dil.vurgu;e.currentTarget.style.background="rgba(46,125,50,0.1)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=K.bdr;e.currentTarget.style.background=K.bg3;}}>
              <div style={{color:K.tx,fontWeight:700,fontSize:14}}>{s.b}</div>
              <div style={{color:K.tx3,fontSize:12,marginTop:3}}>{s.a}</div>
            </div>
          ))}
          <button onClick={kapat} style={{marginTop:10,padding:"9px 24px",background:"transparent",
            color:K.tx4,border:"1px solid "+K.bdr,borderRadius:9,cursor:"pointer",fontSize:13}}>← Geri</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{position:"fixed",inset:0,background:K.bg,display:"flex",flexDirection:"column",zIndex:8000}}>
      <style>{".nk{animation:nk 1s var(--d,0s) infinite}@keyframes nk{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}@keyframes tt{0%,100%{opacity:1}50%{opacity:.4}}"}</style>
      <div style={{background:"rgba(27,94,32,0.2)",padding:"4px 16px",fontSize:11,color:K.gL,textAlign:"center",borderBottom:"1px solid "+K.g2+"44"}}>
        🔒 Platform hizmet kalitesi kapsamında denetlenebilir — Kayıt yapılmaz
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",
        background:"linear-gradient(135deg,"+dil.renk+"ee,"+dil.renk+"99)",borderBottom:"2px solid "+dil.vurgu}}>
        <Av h={hoca} dil={dil} sz={46}/>
        <div style={{flex:1}}>
          <div style={{color:"#fff",fontWeight:700,fontSize:14}}>{hoca.ad}</div>
          <div style={{color:dil.vurgu,fontSize:11}}>{hoca.yer+" • "+hoca.uz}</div>
        </div>
        <div style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"3px 10px",textAlign:"center"}}>
          <div style={{fontSize:9,color:"#aaa"}}>SEVİYE</div>
          <div style={{fontWeight:800,color:K.gL,fontSize:15}}>{seviye}</div>
          <div style={{fontSize:9,color:"#aaa"}}>{SEVIYE_ACIKLAMA[seviye]?.split("—")[0]}</div>
        </div>
        <div style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"3px 8px",fontSize:11,color:"#fff",cursor:"pointer"}}
          onClick={()=>{setDilMod(null);setMsgs([]);konusmaRef.current=false;}}>{dilLabel} ↺</div>
        {kul?.plan==="Deneme"&&sure>0&&(
          <div style={{background:"rgba(0,0,0,0.4)",borderRadius:8,padding:"4px 12px",textAlign:"center"}}>
            <div style={{fontSize:9,color:"#aaa"}}>KALAN</div>
            <div style={{fontWeight:800,color:sure<300?K.errL:dil.vurgu,fontSize:17}}>{mm}:{ss}</div>
          </div>
        )}
        <button onClick={dersKapat} style={{background:"rgba(255,255,255,0.12)",border:"none",color:"#fff",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontWeight:700}}>✕ Çıkış</button>
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <div style={{width:185,background:K.bg2,borderRight:"1px solid "+K.bdr,padding:10,display:"flex",flexDirection:"column",gap:8,overflowY:"auto"}}>
          <div style={{background:K.card,borderRadius:10,padding:12,border:"1px solid "+K.bdr2,textAlign:"center"}}>
            <div style={{fontSize:9,color:K.tx4,marginBottom:8,fontWeight:700,letterSpacing:1}}>AI HOCAN</div>
            <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Av h={hoca} dil={dil} sz={72}/></div>
            <div style={{color:K.tx,fontWeight:700,fontSize:12}}>{hoca.ad}</div>
            <div style={{color:dil.vurgu,fontSize:10,marginTop:2}}>{hoca.yer}</div>
            <div style={{color:K.gL,fontSize:16,fontWeight:900,marginTop:6}}>{seviye}</div>
            {yukl&&<div style={{marginTop:6,color:K.gL,fontSize:10,animation:"tt 1s infinite"}}>Yanıt yazıyor...</div>}
          </div>
          <div style={{background:K.card,borderRadius:10,padding:10,border:"1px solid "+K.bdr,textAlign:"center"}}>
            <div style={{fontSize:9,color:K.tx4,marginBottom:4,fontWeight:700}}>KAMERA</div>
            <div style={{background:K.bg3,borderRadius:7,padding:10}}>
              <div style={{fontSize:20}}>📷</div>
              <div style={{color:K.warn,fontSize:10,fontWeight:700,marginTop:3}}>Yakında!</div>
            </div>
          </div>
          {mikErr&&<div style={{background:"rgba(198,40,40,0.12)",borderRadius:8,padding:8,color:K.errL,fontSize:11}}>{mikErr}</div>}
          <div style={{background:K.card,borderRadius:10,padding:10}}>
            <div style={{fontSize:9,color:K.tx4,marginBottom:6,fontWeight:700}}>MODÜLLER</div>
            {dil.mods.map(m=><div key={m} style={{padding:"5px 8px",borderRadius:6,marginBottom:3,background:K.bg3,color:K.tx2,fontSize:11,borderLeft:"3px solid "+dil.vurgu+"55"}}>{m}</div>)}
          </div>
          <div style={{background:K.card,borderRadius:10,padding:10,textAlign:"center"}}>
            <div style={{fontSize:9,color:K.tx4,marginBottom:4,fontWeight:700}}>KATEGORİ</div>
            <div style={{color:K.gL,fontSize:11,fontWeight:600}}>{kategori}</div>
          </div>
          <div style={{background:K.card,borderRadius:10,padding:10,textAlign:"center"}}>
            <div style={{color:K.tx4,fontSize:10}}>{konusmaRef.current?"🔴 Dinliyorum":"🎤 Mikrofon kapalı"}</div>
          </div>
        </div>

        <div style={{flex:1,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.r==="user"?"flex-end":"flex-start",gap:8,alignItems:"flex-start"}}>
                {m.r==="ai"&&<Av h={hoca} dil={dil} sz={32}/>}
                <div style={{maxWidth:"70%"}}>
                  <div style={{fontSize:10,color:K.tx4,marginBottom:2,textAlign:m.r==="user"?"right":"left"}}>
                    {m.r==="user"?"Sen":"🤖 "+hoca.ad.split(" ")[0]}
                  </div>
                  <div style={{padding:"13px 16px",borderRadius:16,color:K.tx,fontSize:15,lineHeight:1.8,whiteSpace:"pre-wrap",
                    background:m.r==="user"?"linear-gradient(135deg,"+K.g2+","+K.t2+")":K.card,
                    borderBottomRightRadius:m.r==="user"?4:16,
                    borderBottomLeftRadius:m.r==="ai"?4:16,
                    border:m.r==="ai"?"1px solid "+K.bdr:"none"}}>
                    {m.t}
                  </div>
                </div>
              </div>
            ))}
            {yukl&&(
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Av h={hoca} dil={dil} sz={32}/>
                <div style={{background:K.card,borderRadius:16,padding:"10px 16px",border:"1px solid "+K.bdr,display:"flex",gap:4,alignItems:"center"}}>
                  {[0,1,2].map(i=><div key={i} className="nk" style={{"--d":i*0.18+"s",width:7,height:7,borderRadius:"50%",background:K.gL}}/>)}
                </div>
              </div>
            )}
            <div ref={sonRef}/>
          </div>
          <div style={{padding:12,borderTop:"1px solid "+K.bdr,background:K.bg2}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={mikToggle}
                style={{width:46,height:46,borderRadius:"50%",
                  background:konusmaRef.current?"rgba(198,40,40,0.25)":K.bg3,
                  border:"2px solid "+(konusmaRef.current?K.errL:K.g3),
                  cursor:"pointer",fontSize:19,flexShrink:0,
                  animation:mikr?"tt 0.5s infinite":"none",
                  boxShadow:konusmaRef.current?"0 0 20px "+K.errL+"55":"none"}}>
                {mikr?"🔴":konusmaRef.current?"🟢":"🎤"}
              </button>
              <input value={yazi} onChange={e=>setYazi(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&gonder(yazi)}
                placeholder={mikr?"Dinliyorum...":konusmaRef.current?"Konuşuyor veya yaz...":"Mesaj yaz veya 🎤 bas..."}
                style={{flex:1,background:K.bg3,border:"1px solid "+K.bdr,borderRadius:10,
                  padding:"12px 14px",color:K.tx,fontSize:15,outline:"none"}}/>
              <button onClick={()=>gonder(yazi)} disabled={yukl||!yazi.trim()}
                style={{padding:"12px 20px",borderRadius:10,fontWeight:700,fontSize:15,border:"none",flexShrink:0,
                  cursor:yukl||!yazi.trim()?"not-allowed":"pointer",
                  background:yukl||!yazi.trim()?K.bg3:"linear-gradient(135deg,"+K.g2+","+K.t2+")",
                  color:yukl||!yazi.trim()?K.tx4:"#fff"}}>➤</button>
            </div>
            <div style={{textAlign:"center",color:K.tx4,fontSize:10,marginTop:5}}>
              🎤 Bas → telefon gibi konuş → tekrar bas kapat • ⌨️ Yaz Enter'a bas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({kapat, admCikis}) {
  const [sekme, setSekme] = useState("dash");
  const [cfg, setCfg] = useState(getA());
  const [kayd, setKayd] = useState(false);
  const [hE,setHE]=useState(""); const [hT,setHT]=useState("7 Gün"); const [hOk,setHOk]=useState(false); const [hErr,setHErr]=useState("");
  const [p1,setP1]=useState(""); const [p2,setP2]=useState(""); const [pMsg,setPMsg]=useState("");

  const kaydet = y => { setCfg(y); setA(y); setKayd(true); setTimeout(()=>setKayd(false),2000); };
  const kul = cfg.users||[]; const ode = cfg.pays||[];
  const toplam=kul.length; const aktif=kul.filter(u=>u.durum==="Aktif").length;
  const deneme=kul.filter(u=>u.durum==="Deneme").length;
  const bekl=(ode).filter(o=>o.d==="bekle").length;
  const gelir=kul.reduce((t,u)=>{const n=parseInt((u.odeme||"0").replace(/[^0-9]/g,""));return t+(isNaN(n)?0:n);},0);

  const onayOde = id => {
    const o=ode.find(x=>x.id===id); if(!o)return;
    kaydet({...cfg,
      pays:ode.map(x=>x.id===id?{...x,d:"ok"}:x),
      users:kul.map(u=>u.email===o.email?{...u,plan:o.plan,durum:"Aktif",
        odeme:"₺"+(parseInt((u.odeme||"0").replace(/[^0-9]/g,""))+(o.tutar||299))}:u)
    });
  };

  const hediye = () => {
    if(!hE.includes("@")){setHErr("Geçerli e-posta");return;}
    const u=kul.find(x=>x.email===hE);
    if(!u){setHErr("Kullanıcı bulunamadı");return;}
    kaydet({...cfg,users:kul.map(x=>x.email===hE?{...x,plan:hT,durum:"Aktif",hediye:true}:x)});
    setHOk(true);
  };

  const sifreDegis = () => {
    if(p1.length<6){setPMsg("En az 6 karakter");return;}
    if(p1!==p2){setPMsg("Şifreler eşleşmiyor");return;}
    kaydet({...cfg,pw:p1}); setPMsg("✅ Güncellendi!"); setP1(""); setP2("");
  };

  const gI={width:"100%",padding:"10px 12px",background:K.bg3,border:"1px solid "+K.bdr,
    borderRadius:9,color:K.tx,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:11};
  const kd={background:K.card,borderRadius:12,padding:16,border:"1px solid "+K.bdr,marginBottom:14};
  const bG={padding:"10px 18px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:13,
    border:"none",background:"linear-gradient(135deg,"+K.g2+","+K.t2+")",color:"#fff"};

  const SEKMELER=[
    ["dash","📊","Dashboard"],["kul","👥","Kullanıcılar"],["ode","💳","Ödemeler"],
    ["ders","📡","Aktif Dersler"],["iht","⚠️","İhtar Geçmişi"],["hed","🎁","Hediye Ver"],["bil","🔔","Bildirimler"],["set","⚙️","Ayarlar"]
  ];

  return (
    <div style={{position:"fixed",inset:0,background:K.bg,zIndex:7000,display:"flex"}}>
      <div style={{width:210,background:K.bg2,borderRight:"1px solid "+K.bdr,display:"flex",flexDirection:"column",padding:14,gap:3}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,paddingBottom:14,
          borderBottom:"1px solid "+K.bdr,cursor:"pointer"}} onClick={kapat}>
          <div style={{width:34,height:34,borderRadius:9,
            background:"linear-gradient(135deg,"+K.g4+","+K.t3+")",
            display:"flex",alignItems:"center",justifyContent:"center",
            color:"#fff",fontWeight:900,fontSize:17}}>L</div>
          <span style={{fontWeight:900,color:K.tx,fontSize:15}}>Lisan <span style={{color:K.gL}}>Öğren</span></span>
        </div>
        {SEKMELER.map(([id,ic,lb])=>(
          <button key={id} onClick={()=>setSekme(id)}
            style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:9,border:"none",
              background:sekme===id?"rgba(46,125,50,0.18)":"transparent",
              color:sekme===id?K.gL:K.tx4,cursor:"pointer",fontSize:12,textAlign:"left",
              fontWeight:sekme===id?700:400,borderLeft:sekme===id?"3px solid "+K.g3:"3px solid transparent"}}>
            {ic} {lb}
          </button>
        ))}
        <div style={{flex:1}}/>
        <button onClick={kapat} style={{padding:"10px 12px",borderRadius:9,border:"1px solid "+K.bdr,background:"transparent",color:K.tx4,cursor:"pointer",fontSize:12,marginBottom:6}}>
          ← Uygulamaya Dön
        </button>
        <button onClick={admCikis} style={{padding:"8px 12px",borderRadius:9,border:"1px solid "+K.err+"44",background:"rgba(198,40,40,0.08)",color:K.errL,cursor:"pointer",fontSize:11}}>
          🚪 Admin Çıkışı
        </button>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:22}}>

        {sekme==="dash"&&<>
          <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Dashboard</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
            {[{l:"Toplam Kullanıcı",v:toplam,c:K.gL},{l:"Aktif Abonelik",v:aktif,c:K.tL},
              {l:"Deneme Süreci",v:deneme,c:K.warn},{l:"Bekleyen Ödeme",v:bekl,c:K.errL},
              {l:"Toplam Gelir",v:"₺"+gelir.toLocaleString(),c:K.warn},{l:"Toplam Hoca",v:72,c:K.gL}
            ].map(s=>(
              <div key={s.l} style={{...kd,marginBottom:0,padding:16}}>
                <div style={{fontSize:24,fontWeight:900,color:s.c,marginBottom:3}}>{s.v}</div>
                <div style={{color:K.tx4,fontSize:11}}>{s.l}</div>
              </div>
            ))}
          </div>
          {cfg.iban&&<div style={kd}><div style={{color:K.tx2,fontSize:12,marginBottom:8,fontWeight:600}}>IBAN</div>
            <div style={{color:K.tx3,fontSize:13}}>{cfg.acName}<br/><strong style={{color:K.gL,fontFamily:"monospace"}}>{cfg.iban}</strong><br/>{cfg.bank}</div></div>}
        </>}

        {sekme==="kul"&&<>
          <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Kullanıcılar ({toplam})</div>
          {kul.length===0?<div style={{...kd,color:K.tx4,textAlign:"center",padding:30}}>Henüz kayıtlı kullanıcı yok</div>:(
            <div style={{...kd,padding:0,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 0.8fr",padding:"9px 14px",
                background:K.bg3,fontSize:9,color:K.tx4,fontWeight:700}}>
                {["AD / E-POSTA","TEL / TC","PLAN","DURUM","GELİR"].map(h=><div key={h}>{h}</div>)}
              </div>
              {kul.map(u=>(
                <div key={u.id} style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 0.8fr",
                  padding:"11px 14px",borderTop:"1px solid "+K.bdr,alignItems:"center"}}>
                  <div><div style={{color:K.tx,fontSize:12,fontWeight:600}}>{u.ad}</div>
                    <div style={{color:K.tx4,fontSize:10}}>{u.email}</div>
                    <div style={{color:K.tx4,fontSize:10}}>{u.tarih}</div></div>
                  <div><div style={{color:K.tx2,fontSize:11}}>{u.tel||"—"}</div>
                    <div style={{color:K.tx4,fontSize:10}}>{u.tc?"TC: "+u.tc:""}</div></div>
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

        {sekme==="ode"&&<>
          <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Ödemeler</div>
          {!cfg.iban&&<div style={{background:"rgba(249,168,37,0.1)",border:"1px solid "+K.warn+"44",
            borderRadius:10,padding:14,marginBottom:14}}>
            <div style={{color:K.warn,fontWeight:700}}>⚠️ IBAN girilmemiş — Ayarlardan ekleyin</div></div>}
          <div style={{color:K.tx,fontWeight:700,marginBottom:12}}>Bekleyen ({bekl})</div>
          {ode.filter(o=>o.d==="bekle").length===0?
            <div style={{...kd,color:K.tx4,textAlign:"center"}}>Bekleyen ödeme yok</div>:
            ode.filter(o=>o.d==="bekle").map(o=>(
              <div key={o.id} style={{...kd,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{color:K.tx,fontWeight:700}}>{o.ad}</div>
                  <div style={{color:K.tx4,fontSize:11}}>{o.email+" • "+o.plan+" • "+o.tarih}</div></div>
                <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{color:K.warn,fontWeight:700}}>₺{o.tutar}</div>
                  {o.dekont && (
                    <img src={o.dekont} style={{width:60,height:40,objectFit:"cover",borderRadius:5,cursor:"pointer",border:"1px solid "+K.bdr}}
                      onClick={()=>window.open(o.dekont,"_blank")} title="Dekonta tıkla büyüt"/>
                  )}
                  {!o.dekont && <span style={{color:K.tx4,fontSize:10}}>Dekont yok</span>}
                  <button onClick={()=>onayOde(o.id)} style={bG}>✓ Onayla</button>
                </div>
              </div>
            ))}
        </>}

        {sekme==="ders"&&<>
          <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:8}}>📡 Aktif Dersler</div>
          <div style={{color:K.tx4,fontSize:12,marginBottom:16}}>Öğrencilerin aktif derslerini izleyebilirsiniz.</div>
          {kul.filter(u=>u.durum==="Aktif"||u.durum==="Deneme").length===0
            ? <div style={{...kd,color:K.tx4,textAlign:"center",padding:30}}>Şu an aktif ders yok</div>
            : kul.filter(u=>u.durum==="Aktif"||u.durum==="Deneme").map(u=>(
              <div key={u.id} style={{...kd,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{color:K.tx,fontWeight:700}}>{u.ad}</div>
                  <div style={{color:K.tx4,fontSize:11,marginTop:2}}>{u.email} • {u.plan} • {u.durum}</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{background:"rgba(46,125,50,0.12)",color:K.gL,borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700}}>{u.durum}</div>
                  <button onClick={()=>alert(u.ad+" öğrencisinin dersini izlemek için yakında kameralı ders özelliği eklenecek.")}
                    style={{padding:"7px 12px",borderRadius:7,background:K.bg3,color:K.tL,
                      border:"1px solid "+K.bdr2,cursor:"pointer",fontSize:11,fontWeight:600}}>
                    👁 İzle
                  </button>
                </div>
              </div>
            ))
          }
        </>}

        {sekme==="iht"&&<>
          <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:8}}>⚠️ İhtar Geçmişi</div>
          <div style={{color:K.tx4,fontSize:12,marginBottom:16}}>Uygunsuz içerik gönderen kullanıcılar otomatik kaydedilir.</div>
          {(cfg.ihtarlar||[]).length===0?
            <div style={{...kd,color:K.tx4,textAlign:"center",padding:30}}>İhtar kaydı yok ✓</div>:
            [...(cfg.ihtarlar||[])].reverse().map(ih=>(
              <div key={ih.id} style={{...kd,border:"1px solid "+K.err+"44"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <div><div style={{color:K.tx,fontWeight:700}}>{ih.kulAd}</div>
                    <div style={{color:K.tx4,fontSize:11}}>{ih.email+" • "+ih.tarih}</div></div>
                  <div style={{background:"rgba(198,40,40,0.15)",color:K.errL,borderRadius:6,
                    padding:"2px 10px",fontSize:11,fontWeight:700}}>⚠️ UYARI</div>
                </div>
                <div style={{background:K.bg3,borderRadius:8,padding:10,color:K.tx3,fontSize:12,fontStyle:"italic"}}>
                  "{ih.mesaj}"
                </div>
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <button onClick={()=>{
                    const a=getA();
                    setA({...a,users:(a.users||[]).map(x=>x.email===ih.email?{...x,durum:"Askıya Alındı"}:x)});
                    alert(ih.kulAd+" üyeliği askıya alındı.");
                    setCfg(getA());
                  }} style={{padding:"6px 14px",borderRadius:7,background:"rgba(198,40,40,0.15)",
                    color:K.errL,border:"1px solid "+K.err+"44",cursor:"pointer",fontSize:12,fontWeight:600}}>
                    Üyeliği Askıya Al
                  </button>
                  <button onClick={()=>{
                    const a=getA();
                    setA({...a,ihtarlar:(a.ihtarlar||[]).filter(x=>x.id!==ih.id)});
                    setCfg(getA());
                  }} style={{padding:"6px 14px",borderRadius:7,background:K.bg3,
                    color:K.tx4,border:"1px solid "+K.bdr,cursor:"pointer",fontSize:12}}>
                    Kaydı Sil
                  </button>
                </div>
              </div>
            ))}
        </>}

        {sekme==="hed"&&<>
          <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Hediye Ver</div>
          <div style={{...kd,maxWidth:440}}>
            {hOk?(
              <div style={{textAlign:"center",padding:16}}>
                <div style={{fontSize:50,marginBottom:12}}>🎁</div>
                <div style={{color:K.tx,fontSize:18,fontWeight:700,marginBottom:6}}>Gönderildi!</div>
                <button onClick={()=>{setHOk(false);setHE("");}} style={bG}>Tamam</button>
              </div>
            ):(
              <>
                <div style={{color:K.tx4,fontSize:11,marginBottom:4}}>Kullanıcı E-postası</div>
                <input value={hE} onChange={e=>{setHE(e.target.value);setHErr("");}} placeholder="ornek@mail.com" style={gI}/>
                {hErr&&<div style={{color:K.errL,fontSize:11,marginBottom:8}}>{hErr}</div>}
                <div style={{color:K.tx4,fontSize:11,marginBottom:8}}>Hediye Türü</div>
                {["7 Gün","1 Ay","3 Ay","Yıllık","Sınırsız"].map(g=>(
                  <div key={g} onClick={()=>setHT(g)}
                    style={{padding:"10px 14px",borderRadius:9,
                      background:hT===g?"rgba(46,125,50,0.2)":K.bg3,
                      border:"1px solid "+(hT===g?K.g3:K.bdr),
                      color:hT===g?K.gL:K.tx2,cursor:"pointer",marginBottom:7,fontSize:12}}>
                    🎁 {g} Ücretsiz
                  </div>
                ))}
                <button onClick={hediye} style={{...bG,width:"100%",padding:"12px",marginTop:4}}>Hediye Gönder</button>
              </>
            )}
          </div>
        </>}

        {sekme==="bil"&&<>
          <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Bildirim Gönder</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[{t:"Premium Teşvik",m:"5 günlük denemeniz bitiyor!"},
              {t:"Özel İndirim",m:"Bu hafta yıllık plana indirim!"},
              {t:"Yeni Hoca",m:"Yeni hocalarımız katıldı!"},
              {t:"Ders Hatırlatma",m:"Bugün ders yapmadınız."}].map(n=>(
              <div key={n.t} style={{...kd,marginBottom:0}}>
                <div style={{color:K.tx,fontWeight:700,marginBottom:6,fontSize:13}}>{n.t}</div>
                <div style={{color:K.tx4,fontSize:11,lineHeight:1.6,marginBottom:10}}>{n.m}</div>
                <button onClick={()=>alert("Bildirim gönderildi!")}
                  style={{width:"100%",padding:"7px",borderRadius:7,background:"rgba(46,125,50,0.12)",
                    color:K.gL,border:"1px solid "+K.g2+"44",cursor:"pointer",fontSize:11}}>
                  Tüm Kullanıcılara Gönder
                </button>
              </div>
            ))}
          </div>
        </>}

        {sekme==="set"&&<>
          <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Ayarlar</div>
          <div style={kd}>
            <div style={{color:K.tx,fontWeight:700,marginBottom:14,fontSize:14}}>👤 Hesap</div>
            <div style={{color:K.tx4,fontSize:11,marginBottom:4}}>Yönetici E-postası</div>
            <input value={cfg.email||""} onChange={e=>setCfg(s=>({...s,email:e.target.value}))} placeholder="admin@lisanogre.com" style={gI}/>
            <div style={{color:K.tx4,fontSize:11,marginBottom:4}}>İletişim E-postası</div>
            <input value={cfg.contactEmail||""} onChange={e=>setCfg(s=>({...s,contactEmail:e.target.value}))} placeholder="iletisim@lisanogre.com" style={gI}/>
          </div>
          <div style={kd}>
            <div style={{color:K.tx,fontWeight:700,marginBottom:14,fontSize:14}}>💳 IBAN</div>
            <div style={{color:K.tx4,fontSize:11,marginBottom:4}}>Hesap Sahibi</div>
            <input value={cfg.acName||""} onChange={e=>setCfg(s=>({...s,acName:e.target.value}))} placeholder="Ad Soyad" style={gI}/>
            <div style={{color:K.tx4,fontSize:11,marginBottom:4}}>IBAN</div>
            <input value={cfg.iban||""} onChange={e=>setCfg(s=>({...s,iban:e.target.value}))} placeholder="TR00 0000..." style={gI}/>
            <div style={{color:K.tx4,fontSize:11,marginBottom:4}}>Banka</div>
            <input value={cfg.bank||""} onChange={e=>setCfg(s=>({...s,bank:e.target.value}))} placeholder="Ziraat Bankası" style={gI}/>
          </div>
          <div style={kd}>
            <div style={{color:K.tx,fontWeight:700,marginBottom:6,fontSize:14}}>🔐 Şifre Değiştir</div>
            <input type="password" value={p1} onChange={e=>setP1(e.target.value)} placeholder="Yeni şifre" style={gI}/>
            <input type="password" value={p2} onChange={e=>setP2(e.target.value)} placeholder="Tekrar girin" style={gI}/>
            {pMsg&&<div style={{color:pMsg.startsWith("✅")?K.gL:K.errL,fontSize:12,marginBottom:10}}>{pMsg}</div>}
            <button onClick={sifreDegis} style={{padding:"9px 18px",background:"rgba(46,125,50,0.15)",
              color:K.gL,border:"1px solid "+K.g2+"55",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12}}>
              Şifreyi Güncelle
            </button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <button onClick={()=>kaydet(cfg)} style={{...bG,padding:"13px 28px",fontSize:15}}>💾 Kaydet</button>
            {kayd&&<div style={{color:K.gL,fontSize:13,fontWeight:600}}>✅ Kaydedildi!</div>}
          </div>
        </>}

      </div>
    </div>
  );
}

export default function App() {
  const [kul, setKul] = useState(()=>DB.g("kul"));
  const [adGir, setAdGir] = useState(()=>DB.g("adGir")===true);
  const [adAcik, setAdAcik] = useState(false);
  const [sayfa, setSayfa] = useState("ana");
  const [dilSec, setDilSec] = useState(null);
  const [cocuk, setCocuk] = useState(false);
  const [ders, setDers] = useState(null);
  const [authAcik, setAuthAcik] = useState(false);
  const [authMod, setAuthMod] = useState("giris");
  const [adModal, setAdModal] = useState(false);
  const [adSifre, setAdSifre] = useState("");
  const [adHata, setAdHata] = useState("");
  const [adUnuttu, setAdUnuttu] = useState(false);
  const [odePlan, setOdePlan] = useState(null);
  const [pwaPrompt, setPwaPrompt] = useState(null);

  useEffect(()=>{
    document.title = "Lisan Öğren — AI Hoca ile 10 Dil Öğren";
    let meta = document.querySelector('meta[name="theme-color"]');
    if(!meta){meta=document.createElement('meta');meta.name="theme-color";document.head.appendChild(meta);}
    meta.content="#071510";
    const handler = e => {e.preventDefault(); setPwaPrompt(e);};
    window.addEventListener("beforeinstallprompt", handler);
    return ()=>window.removeEventListener("beforeinstallprompt", handler);
  },[]);

  const kulGiris = u => { setKul(u); DB.s("kul",u); };
  const kulCikis = () => { setKul(null); DB.d("kul"); };
  const admKapat = () => { setAdAcik(false); };
  const admCikis = () => { setAdAcik(false); setAdGir(false); DB.d("adGir"); };
  const admGiris = () => {
    const a = getA();
    if(adSifre===a.pw){
      setAdGir(true); DB.s("adGir",true);
      setAdAcik(true); setAdModal(false);
      setAdSifre(""); setAdHata(""); setAdUnuttu(false);
    } else setAdHata("Yanlış şifre");
  };

  const dersGir = () => {
    if(adGir) return true;
    if(!kul) return false;
    if(kul.durum==="Aktif") return true;
    if(kul.durum==="Deneme") return (Date.now()-kul.trialStart)/86400000 < 5;
    return false;
  };

  const git = s => { setSayfa(s); setDilSec(null); };
  const adm = getA();

  if(adAcik) return <AdminPanel kapat={admKapat} admCikis={admCikis}/>;
  if(ders) return <DersEkrani dilId={ders.dil} hoca={ders.hoca} kul={ders.kul||kul} kapat={()=>setDers(null)}/>;

  const bP={padding:"13px 28px",background:"linear-gradient(135deg,"+K.g2+","+K.t2+")",color:"#fff",border:"none",borderRadius:12,cursor:"pointer",fontWeight:700,fontSize:14,boxShadow:"0 4px 20px "+K.g2+"55"};
  const bS={padding:"13px 28px",background:"transparent",color:K.tx2,border:"1px solid "+K.bdr,borderRadius:12,cursor:"pointer",fontWeight:600,fontSize:14};
  const gI2={width:"100%",padding:"11px 13px",background:K.bg3,border:"1px solid "+K.bdr,borderRadius:9,color:K.tx,fontSize:13,outline:"none",boxSizing:"border-box"};

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(170deg,"+K.bg+","+K.bg2+" 50%,"+K.bg+")",fontFamily:"'Segoe UI',system-ui,sans-serif",fontSize:"16px"}}>
      <style>{`*{box-sizing:border-box}
        @keyframes y0{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes y1{0%,100%{transform:translateY(-5px)}50%{transform:translateY(7px)}}
        @keyframes y2{0%,100%{transform:translateY(4px)}50%{transform:translateY(-8px)}}
        @keyframes gir{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {pwaPrompt&&(
        <div style={{background:"linear-gradient(135deg,"+K.g2+","+K.t2+")",padding:"10px 22px",
          display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <span style={{color:"#fff",fontSize:13,fontWeight:600}}>📲 Lisan Öğren'i ana ekrana ekle — uygulama gibi kullan!</span>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{pwaPrompt.prompt();setPwaPrompt(null);}}
              style={{padding:"7px 16px",background:"#fff",color:K.g2,border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12}}>
              Ekle
            </button>
            <button onClick={()=>setPwaPrompt(null)}
              style={{padding:"7px 12px",background:"transparent",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:8,cursor:"pointer",fontSize:12}}>✕</button>
          </div>
        </div>
      )}

      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 22px",
        borderBottom:"1px solid "+K.bdr,background:"rgba(7,21,16,0.97)",
        position:"sticky",top:0,zIndex:100,backdropFilter:"blur(20px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>git("ana")}>
          <div style={{width:36,height:36,borderRadius:10,
            background:"linear-gradient(135deg,"+K.g4+","+K.t3+")",
            display:"flex",alignItems:"center",justifyContent:"center",
            color:"#fff",fontWeight:900,fontSize:18,boxShadow:"0 2px 14px "+K.g2+"66"}}>L</div>
          <span style={{fontSize:20,fontWeight:900,color:K.tx}}>Lisan </span>
          <span style={{fontSize:20,fontWeight:900,color:K.gL}}>Öğren</span>
        </div>
        <div style={{display:"flex",gap:3}}>
          {[["ana","Ana Sayfa"],["diller","Diller"],["fiyatlar","Fiyatlar"],["iletisim","İletişim"]].map(([s,l])=>(
            <button key={s} onClick={()=>git(s)} style={{padding:"7px 13px",borderRadius:8,border:"none",
              cursor:"pointer",fontSize:12,fontWeight:sayfa===s?700:400,
              background:sayfa===s?"rgba(46,125,50,0.2)":"transparent",
              color:sayfa===s?K.gL:K.tx3}}>{l}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          {kul?(
            <>
              <div style={{background:"rgba(46,125,50,0.12)",borderRadius:8,padding:"6px 13px",
                fontSize:12,color:K.gL,fontWeight:600,border:"1px solid "+K.g2+"33",cursor:"pointer"}}
                onClick={()=>git("profil")}>
                👤 {kul.ad.split(" ")[0]}
                <span style={{color:kul.durum==="Aktif"?K.gL:K.warn,fontSize:10,marginLeft:5}}>{kul.durum}</span>
              </div>
              <button onClick={kulCikis} style={{padding:"6px 11px",borderRadius:8,border:"1px solid "+K.bdr,background:"transparent",color:K.tx4,cursor:"pointer",fontSize:11}}>Çıkış</button>
            </>
          ):(
            <>
              <button onClick={()=>{setAuthMod("giris");setAuthAcik(true);}}
                style={{padding:"7px 14px",borderRadius:8,border:"1px solid "+K.bdr,background:"transparent",color:K.tx2,cursor:"pointer",fontSize:12,fontWeight:600}}>Giriş Yap</button>
              <button onClick={()=>{setAuthMod("kayit");setAuthAcik(true);}}
                style={{padding:"7px 16px",borderRadius:8,background:"linear-gradient(135deg,"+K.g2+","+K.t2+")",color:"#fff",border:"none",cursor:"pointer",fontWeight:700,fontSize:12}}>Üye Ol</button>
            </>
          )}
          {adGir?(
            <div style={{background:"rgba(46,125,50,0.15)",borderRadius:8,padding:"6px 12px",
              fontSize:12,color:K.gL,fontWeight:700,border:"1px solid "+K.g2+"44",cursor:"pointer"}}
              onClick={()=>setAdAcik(true)}>🔧 Admin</div>
          ):(
            <button onClick={()=>{setAdModal(true);setAdHata("");setAdSifre("");setAdUnuttu(false);}}
              style={{padding:"6px 9px",borderRadius:8,border:"1px solid "+K.bdr,background:"transparent",color:K.tx4,cursor:"pointer",fontSize:10}}>⚙</button>
          )}
        </div>
      </nav>

      {sayfa==="ana"&&(
        <div style={{animation:"gir 0.5s ease"}}>
          <div style={{textAlign:"center",padding:"68px 22px 42px"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(46,125,50,0.1)",
              border:"1px solid rgba(46,125,50,0.25)",borderRadius:20,padding:"5px 16px",
              fontSize:11,color:K.gL,marginBottom:22,fontWeight:600}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:K.gL,display:"inline-block"}}/>
              5 Gün Ücretsiz • Yazılı & Sesli AI Hoca • 12 Dil
            </div>
            <h1 style={{fontSize:48,fontWeight:900,lineHeight:1.08,margin:"0 auto 18px",maxWidth:650,letterSpacing:-1.5,color:K.tx}}>
              AI Hocanla<br/>
              <span style={{background:"linear-gradient(90deg,"+K.gL+","+K.tL+")",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                12 Dil Öğren
              </span>
            </h1>
            <p style={{fontSize:15,color:K.tx3,maxWidth:440,margin:"0 auto 30px",lineHeight:1.8}}>
              Yaz veya mikrofona bas, AI hocanla birebir ders yap.<br/>Kameralı özellik yakında geliyor!
            </p>
            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
              <button style={bP} onClick={()=>{if(kul)git("diller");else{setAuthMod("kayit");setAuthAcik(true);}}}>Ücretsiz Başla →</button>
              <button style={bS} onClick={()=>git("fiyatlar")}>Fiyatlar</button>
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"center",gap:18,padding:"0 22px 36px",flexWrap:"wrap",alignItems:"flex-end"}}>
            {[
              {ad:"Şeyh Ahmed",p:4.9,n:1240,c:false,uz:"Tecvid",dil:DILLER[0],a:0},
              {ad:"Sarah Mitchell",p:4.9,n:2800,c:false,uz:"English",dil:DILLER[3],a:1},
              {ad:"Tanaka Hiroshi",p:4.9,n:2200,c:false,uz:"日本語",dil:DILLER[8],a:2},
              {ad:"Kim Jisoo",p:4.9,n:1900,c:false,uz:"한국어",dil:DILLER[9],a:0},
              {ad:"Marie Dupont",p:4.9,n:2300,c:false,uz:"Français",dil:DILLER[5],a:1},
              {ad:"Prof. Klaus",p:4.9,n:1800,c:false,uz:"Deutsch",dil:DILLER[4],a:2},
            ].map((h,i)=>(
              <div key={i} style={{textAlign:"center",animation:"y"+h.a+" "+(2.8+i*0.25)+"s ease-in-out infinite",cursor:"pointer"}} onClick={()=>git("diller")}>
                <Av h={h} dil={h.dil} sz={72}/>
                <div style={{color:K.tx4,fontSize:10,marginTop:7}}>{h.dil.ad}</div>
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:12,padding:"0 22px 36px",justifyContent:"center",flexWrap:"wrap"}}>
            {[
              {t:"🎤 Telefon Modu",d:"Bas konuş, hocanla sesli diyalog"},
              {t:"✍️ Yazılı Ders",d:"İstediğin konuda pratik yap"},
              {t:"🌍 12 Dil",d:"Kuran dahil 12 dil, 72 hoca"},
              {t:"👶 Çocuk Modu",d:"Her dilde özel çocuk hocaları"},
            ].map(f=>(
              <div key={f.t} style={{background:K.card,borderRadius:14,padding:"18px 16px",width:190,border:"1px solid "+K.bdr,textAlign:"center"}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:6,color:K.tx}}>{f.t}</div>
                <div style={{color:K.tx4,fontSize:11,lineHeight:1.6}}>{f.d}</div>
              </div>
            ))}
          </div>

          <div style={{padding:"0 22px 58px",textAlign:"center"}}>
            <div style={{fontSize:13,fontWeight:700,color:K.tx4,marginBottom:16}}>12 Dil</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
              {DILLER.map(d=>(
                <button key={d.id} onClick={()=>{setDilSec(d);git("diller");}}
                  style={{background:K.card,border:"1px solid "+K.bdr,borderRadius:10,padding:"8px 14px",
                    cursor:"pointer",color:K.tx3,display:"flex",alignItems:"center",gap:7,fontSize:12}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=d.vurgu;e.currentTarget.style.color=K.tx;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=K.bdr;e.currentTarget.style.color=K.tx3;}}>
                  <span style={{fontSize:16}}>{d.bayrak}</span>{d.ad}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {sayfa==="diller"&&!dilSec&&(
        <div style={{padding:"26px 22px"}}>
          <div style={{textAlign:"center",marginBottom:26}}>
            <h2 style={{fontSize:26,fontWeight:800,marginBottom:6,color:K.tx}}>Dil Seç</h2>
            <p style={{color:K.tx4,fontSize:13}}>12 dil, 72 hoca — yetişkin ve çocuklara özel</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16,maxWidth:1100,margin:"0 auto"}}>
            {DILLER.map(d=>(
              <div key={d.id} onClick={()=>setDilSec(d)}
                style={{background:K.card,borderRadius:16,overflow:"hidden",border:"1px solid "+K.bdr,cursor:"pointer",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=d.vurgu;e.currentTarget.style.transform="translateY(-3px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=K.bdr;e.currentTarget.style.transform="translateY(0)";}}>
                <div style={{background:"linear-gradient(135deg,"+d.renk+","+d.renk+"cc)",padding:"16px",borderBottom:"3px solid "+d.vurgu}}>
                  <div style={{fontSize:26}}>{d.bayrak}</div>
                  <div style={{fontSize:17,fontWeight:800,marginTop:5,color:"#fff"}}>{d.ad}</div>
                </div>
                <div style={{padding:14}}>
                  <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:10}}>
                    {d.mods.map(m=><span key={m} style={{background:K.bg3,border:"1px solid "+d.vurgu+"22",borderRadius:4,padding:"2px 6px",fontSize:10,color:K.tx4}}>{m}</span>)}
                  </div>
                  <div style={{display:"flex",gap:4,alignItems:"center"}}>
                    {HOCALAR[d.id].filter(h=>!h.c).map(h=><Av key={h.id} h={h} dil={d} sz={26}/>)}
                    <div style={{background:K.bg3,borderRadius:5,padding:"2px 7px",fontSize:9,color:K.tL,fontWeight:600}}>+2 Çocuk</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sayfa==="diller"&&dilSec&&(
        <div style={{padding:"26px 22px"}}>
          <button onClick={()=>setDilSec(null)} style={{background:"none",border:"none",color:K.tx4,cursor:"pointer",fontSize:12,marginBottom:16}}>← Geri</button>
          <div style={{textAlign:"center",marginBottom:22}}>
            <div style={{fontSize:32,marginBottom:6}}>{dilSec.bayrak}</div>
            <h2 style={{fontSize:22,fontWeight:800,marginBottom:5,color:K.tx}}>{dilSec.ad} — Hocanı Seç</h2>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:22}}>
            {[false,true].map(k=>(
              <button key={String(k)} onClick={()=>setCocuk(k)}
                style={{padding:"9px 22px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12,
                  border:"1px solid "+(cocuk===k?dilSec.vurgu:K.bdr),
                  background:cocuk===k?"rgba(46,125,50,0.12)":"transparent",
                  color:cocuk===k?dilSec.vurgu:K.tx4}}>
                {k?"👶 Çocuklara Özel":"🎓 Yetişkin Hocaları"}
              </button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:16,maxWidth:900,margin:"0 auto"}}>
            {HOCALAR[dilSec.id].filter(h=>h.c===cocuk).map(h=>(
              <div key={h.id}
                style={{background:K.card,borderRadius:16,padding:18,border:"1px solid "+K.bdr,textAlign:"center",cursor:"pointer",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=dilSec.vurgu;e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=K.bdr;e.currentTarget.style.transform="translateY(0)";}}
                onClick={()=>{
                  if(!kul&&!adGir){setAuthMod("kayit");setAuthAcik(true);return;}
                  if(!dersGir()){setOdePlan({id:"up",ad:"Premium Üyelik",fiyat:"₺299",donem:"/ay",tutar:299});return;}
                  const k2 = adGir?{id:"admin",ad:"Admin",plan:"Sınırsız",durum:"Aktif",trialStart:0}:kul;
                  setDers({dil:dilSec.id,hoca:h,kul:k2});
                }}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Av h={h} dil={dilSec} sz={80}/></div>
                {h.c&&<div style={{background:"rgba(249,168,37,0.12)",color:K.warn,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,marginBottom:8,display:"inline-block"}}>👶 Çocuklara Özel</div>}
                <div style={{fontWeight:700,fontSize:14,marginBottom:3,color:K.tx}}>{h.ad}</div>
                <div style={{color:K.tx4,fontSize:11,marginBottom:7}}>{h.yer}</div>
                <div style={{background:K.bg3,borderRadius:7,padding:"3px 9px",fontSize:11,color:K.tx2,marginBottom:10,display:"inline-block"}}>{h.uz}</div>
                <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:14}}>
                  <span style={{color:dilSec.vurgu,fontSize:12,fontWeight:600}}>⭐ {h.p}</span>
                  <span style={{color:K.tx4,fontSize:11}}>{h.n.toLocaleString()}</span>
                </div>
                <button style={{width:"100%",padding:"9px",borderRadius:9,background:"linear-gradient(135deg,"+K.g2+","+K.t2+")",color:"#fff",border:"none",cursor:"pointer",fontWeight:700,fontSize:12}}>🎤 Derse Başla</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {sayfa==="profil"&&kul&&(
        <div style={{padding:"26px 22px",maxWidth:800,margin:"0 auto"}}>
          <div style={{background:K.card,borderRadius:16,padding:22,border:"1px solid "+K.bdr,marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,"+K.g2+","+K.t2+")",
                display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:24}}>
                {kul.ad[0]}
              </div>
              <div style={{flex:1}}>
                <div style={{color:K.tx,fontSize:20,fontWeight:800}}>{kul.ad}</div>
                <div style={{color:K.tx4,fontSize:12,marginTop:2}}>{kul.email}</div>
                <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                  <span style={{background:"rgba(46,125,50,0.15)",color:K.gL,borderRadius:6,padding:"2px 10px",fontSize:11,fontWeight:600}}>{kul.plan}</span>
                  <span style={{background:"rgba(46,125,50,0.1)",color:K.tx3,borderRadius:6,padding:"2px 10px",fontSize:11}}>{kul.sehir}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{color:K.tx,fontSize:16,fontWeight:700,marginBottom:12}}>📊 Dil Seviyelerin</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:24}}>
            {DILLER.map(d=>{
              const dersler = getDG(kul.id,d.id);
              if(dersler.length===0) return null;
              const sv = getSV(kul.id,d.id);
              return(
                <div key={d.id} style={{background:K.card,borderRadius:12,padding:14,border:"1px solid "+K.bdr,textAlign:"center",cursor:"pointer"}}
                  onClick={()=>{setDilSec(d);git("diller");}}>
                  <div style={{fontSize:24,marginBottom:6}}>{d.bayrak}</div>
                  <div style={{color:K.tx,fontWeight:700,fontSize:13}}>{d.ad}</div>
                  <div style={{color:K.gL,fontSize:20,fontWeight:900,margin:"6px 0"}}>{sv}</div>
                  <div style={{color:K.tx4,fontSize:11}}>{dersler.length} ders</div>
                  <div style={{background:K.bg3,borderRadius:4,height:4,marginTop:8}}>
                    <div style={{background:"linear-gradient(90deg,"+K.g2+","+K.tL+")",height:4,borderRadius:4,
                      width:((SEVIYELER.indexOf(sv)+1)*100/6)+"%"}}/>
                  </div>
                </div>
              );
            }).filter(Boolean)}
          </div>

          {DILLER.map(d=>{
            const dersler = getDG(kul.id,d.id);
            if(dersler.length===0) return null;
            return(
              <div key={d.id} style={{background:K.card,borderRadius:14,padding:16,border:"1px solid "+K.bdr,marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <span style={{fontSize:20}}>{d.bayrak}</span>
                  <span style={{color:K.tx,fontWeight:700,fontSize:14}}>{d.ad}</span>
                  <span style={{color:K.gL,fontWeight:700,fontSize:13,marginLeft:"auto"}}>{getSV(kul.id,d.id)}</span>
                </div>
                {[...dersler].reverse().slice(0,3).map(dr=>(
                  <div key={dr.id} style={{background:K.bg3,borderRadius:9,padding:"10px 14px",border:"1px solid "+K.bdr,marginBottom:6}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{color:K.tx,fontSize:14,fontWeight:600}}>{dr.tarih} {dr.saat||""}</div>
                        <div style={{color:K.tx4,fontSize:11,marginTop:2}}>{dr.hoca+" • "+dr.sure+" dk • "+dr.kategori}</div>
                      </div>
                      <div style={{background:"rgba(46,125,50,0.15)",color:K.gL,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}}>{dr.seviye}</div>
                    </div>
                  </div>
                ))}
                <button onClick={()=>{setDilSec(d);git("diller");}}
                  style={{width:"100%",marginTop:8,padding:"9px",borderRadius:9,
                    background:"linear-gradient(135deg,"+K.g2+","+K.t2+")",
                    color:"#fff",border:"none",cursor:"pointer",fontWeight:700,fontSize:12}}>
                  🎤 Kaldığım Yerden Devam Et ({getSV(kul.id,d.id)})
                </button>
              </div>
            );
          }).filter(Boolean)}

          {DILLER.every(d=>getDG(kul.id,d.id).length===0)&&(
            <div style={{background:K.card,borderRadius:12,padding:30,border:"1px solid "+K.bdr,textAlign:"center",color:K.tx4}}>
              Henüz ders geçmişin yok. Hemen başla! 🚀
            </div>
          )}
        </div>
      )}

      {sayfa==="fiyatlar"&&(
        <div style={{padding:"50px 22px",textAlign:"center"}}>
          <h2 style={{fontSize:30,fontWeight:800,marginBottom:8,color:K.tx}}>Fiyatlandırma</h2>
          <p style={{color:K.tx4,marginBottom:38,fontSize:14}}>5 gün ücretsiz dene, havale ile öde</p>
          <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
            {[
              {id:"d",ad:"5 Günlük Deneme",fiyat:"Ücretsiz",donem:"",hl:false,oz:["1 dil","Günde 20 dk","Yazılı AI hoca","Sesli konuşma"]},
              {id:"a",ad:"Aylık Plan",fiyat:"₺299",donem:"/ay",hl:false,tutar:299,oz:["Tüm 12 dil","Sınırsız ders","4+2 hoca","Çocuk hocaları"]},
              {id:"y",ad:"Yıllık Plan",fiyat:"₺1990",donem:"/yıl",hl:true,tutar:1990,oz:["Tüm 12 dil","Sınırsız ders","4+2 hoca","Çocuk hocaları","Öncelikli destek","%44 tasarruf"]},
            ].map(p=>(
              <div key={p.id}
                style={{background:p.hl?"linear-gradient(135deg,"+K.bg2+","+K.bg3+")":K.card,
                  border:p.hl?"2px solid "+K.g3:"1px solid "+K.bdr,
                  borderRadius:20,padding:26,width:245,position:"relative",transition:"transform 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                {p.hl&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",
                  background:"linear-gradient(135deg,"+K.g3+","+K.t3+")",color:"#fff",
                  borderRadius:18,padding:"3px 14px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>⭐ EN POPÜLER</div>}
                <div style={{fontSize:15,fontWeight:700,marginBottom:7,color:K.tx}}>{p.ad}</div>
                <div style={{marginBottom:18}}>
                  <span style={{fontSize:34,fontWeight:900,color:p.hl?K.gL:K.tx}}>{p.fiyat}</span>
                  <span style={{color:K.tx4,fontSize:13}}>{p.donem}</span>
                </div>
                {p.oz.map(o=><div key={o} style={{display:"flex",gap:7,marginBottom:7,textAlign:"left"}}>
                  <span style={{color:K.gL,fontWeight:700}}>✓</span>
                  <span style={{color:K.tx3,fontSize:12}}>{o}</span>
                </div>)}
                <button onClick={()=>{
                  if(p.id==="d"){if(kul)git("diller");else{setAuthMod("kayit");setAuthAcik(true);}}
                  else{if(!kul){setAuthMod("kayit");setAuthAcik(true);}else setOdePlan(p);}
                }} style={{width:"100%",marginTop:18,padding:11,borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",
                  background:p.hl?"linear-gradient(135deg,"+K.g2+","+K.t2+")":p.id==="d"?"transparent":K.bg3,
                  color:p.hl?"#fff":K.tx2,
                  border:p.id==="d"?"1px solid "+K.g2:p.hl?"none":"1px solid "+K.bdr}}>
                  {p.id==="d"?"Ücretsiz Başla":"Havale ile Satın Al"}
                </button>
              </div>
            ))}
          </div>
          {adm.iban&&(
            <div style={{marginTop:34,background:K.card,borderRadius:14,padding:22,maxWidth:440,
              margin:"34px auto 0",border:"1px solid "+K.bdr,textAlign:"left"}}>
              <div style={{color:K.tx,fontWeight:700,marginBottom:10,fontSize:14}}>💳 Havale Bilgileri</div>
              <div style={{color:K.tx4,fontSize:13,lineHeight:2.2}}>
                Ad: <strong style={{color:K.tx}}>{adm.acName}</strong><br/>
                IBAN: <strong style={{color:K.gL,fontFamily:"monospace"}}>{adm.iban}</strong><br/>
                Banka: <strong style={{color:K.tx}}>{adm.bank}</strong>
              </div>
              <div style={{background:"rgba(46,125,50,0.08)",borderRadius:8,padding:10,marginTop:10}}>
                <div style={{color:K.tx4,fontSize:11}}>Açıklama: e-postanızı yazın. Onaydan sonra aktifleşir (max 2 saat).</div>
              </div>
            </div>
          )}
        </div>
      )}

      {sayfa==="iletisim"&&(
        <div style={{padding:"50px 22px",maxWidth:500,margin:"0 auto"}}>
          <h2 style={{fontSize:26,fontWeight:800,marginBottom:8,color:K.tx}}>İletişim</h2>
          <div style={{background:K.card,borderRadius:16,padding:24,border:"1px solid "+K.bdr}}>
            {adm.contactEmail&&(
              <div style={{marginBottom:20}}>
                <div style={{color:K.tx4,fontSize:12,marginBottom:6}}>E-posta</div>
                <a href={"mailto:"+adm.contactEmail} style={{color:K.gL,fontSize:17,fontWeight:700,textDecoration:"none"}}>{adm.contactEmail}</a>
              </div>
            )}
            <div style={{borderTop:"1px solid "+K.bdr,paddingTop:18}}>
              <div style={{color:K.tx4,fontSize:12,marginBottom:12}}>Mesaj Gönderin</div>
              <input placeholder="Adınız" style={{...gI2,marginBottom:10}}/>
              <input placeholder="E-postanız" type="email" style={{...gI2,marginBottom:10}}/>
              <textarea placeholder="Mesajınız..." rows={4} style={{...gI2,resize:"vertical",marginBottom:10}}/>
              <label style={{display:"block",background:K.bg3,border:"1px dashed "+K.bdr,borderRadius:9,
                padding:"10px",textAlign:"center",cursor:"pointer",marginBottom:14}}>
                <input type="file" accept="image/*,application/pdf" style={{display:"none"}}
                  onChange={e=>{
                    const f=e.target.files[0];
                    if(f) e.target.parentElement.querySelector("span").textContent="📎 "+f.name;
                  }}/>
                <span style={{color:K.tx3,fontSize:12}}>📎 Dosya veya fotoğraf ekle (isteğe bağlı)</span>
              </label>
              <button onClick={()=>alert("Mesajınız alındı! En kısa sürede dönüş yapacağız.")}
                style={{width:"100%",padding:12,background:"linear-gradient(135deg,"+K.g2+","+K.t2+")",
                  color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14}}>
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}

      {authAcik&&<AuthModal ilkMod={authMod} kapat={()=>setAuthAcik(false)} basari={u=>{kulGiris(u);setAuthAcik(false);git("diller");}}/>}

      {odePlan&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9000}}>
          <div style={{background:K.card,borderRadius:20,padding:26,width:390,border:"1px solid "+K.bdr3,boxShadow:"0 24px 64px rgba(0,0,0,0.8)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
              <div>
                <div style={{color:K.tx,fontSize:16,fontWeight:700}}>{"Ödeme — "+odePlan.ad}</div>
                <div style={{color:K.tx4,fontSize:11,marginTop:2}}>{odePlan.fiyat+odePlan.donem}</div>
              </div>
              <button onClick={()=>setOdePlan(null)} style={{background:"none",border:"none",color:K.tx4,fontSize:18,cursor:"pointer"}}>✕</button>
            </div>
            {adm.iban?(
              <div style={{background:K.bg3,borderRadius:11,padding:15,marginBottom:14,border:"1px solid "+K.bdr}}>
                <div style={{color:K.tx,fontWeight:700,marginBottom:9,fontSize:13}}>Havale Bilgileri</div>
                <div style={{color:K.tx4,fontSize:12,lineHeight:2.2}}>
                  Ad: <strong style={{color:K.tx}}>{adm.acName}</strong><br/>
                  IBAN: <strong style={{color:K.gL,fontFamily:"monospace"}}>{adm.iban}</strong><br/>
                  Tutar: <strong style={{color:K.warn}}>{odePlan.fiyat}</strong>
                </div>
                <div style={{background:"rgba(46,125,50,0.08)",borderRadius:7,padding:9,marginTop:9}}>
                  <div style={{color:K.tx4,fontSize:11}}>Açıklama: <strong style={{color:K.tx}}>{kul?.email}</strong></div>
                </div>
              </div>
            ):<div style={{color:K.tx4,fontSize:13,marginBottom:14,padding:14,background:K.bg3,borderRadius:10}}>IBAN girilmemiş.</div>}
            <div style={{marginBottom:12}}>
              <div style={{color:K.tx4,fontSize:12,marginBottom:8}}>📎 Dekont Fotoğrafı (İsteğe Bağlı)</div>
              <label style={{display:"block",background:K.bg3,border:"1px dashed "+K.bdr2,borderRadius:9,
                padding:"14px",textAlign:"center",cursor:"pointer"}}>
                <input type="file" accept="image/*" style={{display:"none"}}
                  onChange={e=>{
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => {
                      window._dekontBase64 = ev.target.result;
                      document.getElementById("dekontOnizleme").src = ev.target.result;
                      document.getElementById("dekontOnizleme").style.display = "block";
                      document.getElementById("dekontLabel").textContent = file.name;
                    };
                    reader.readAsDataURL(file);
                  }}/>
                <div id="dekontLabel" style={{color:K.tx3,fontSize:12}}>📸 Dekont fotoğrafı seç</div>
                <img id="dekontOnizleme" style={{display:"none",width:"100%",marginTop:8,borderRadius:6,maxHeight:120,objectFit:"cover"}}/>
              </label>
            </div>
            <button onClick={()=>{
              const a=getA();
              const ny={id:Date.now(),ad:kul?.ad||"",email:kul?.email||"",tutar:odePlan.tutar||0,
                plan:odePlan.ad,tarih:new Date().toLocaleDateString("tr-TR"),d:"bekle",
                dekont:window._dekontBase64||null};
              setA({...a,pays:[...(a.pays||[]),ny]});
              window._dekontBase64 = null;
              alert("✅ Bildiriminiz alındı!\nAdmin onayından sonra (max 2 saat) üyeliğiniz aktifleşir.\nSorularınız için iletişim sayfasından ulaşabilirsiniz.");
              setOdePlan(null);
            }} style={{width:"100%",padding:12,background:"linear-gradient(135deg,"+K.g2+","+K.t2+")",
              color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13}}>
              ✓ Havaleyi Yaptım, Bildir
            </button>
          </div>
        </div>
      )}

      {adModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9000}}>
          <div style={{background:K.card,borderRadius:18,padding:26,width:320,border:"1px solid "+K.bdr3,boxShadow:"0 24px 64px rgba(0,0,0,0.8)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
              <div style={{color:K.tx,fontSize:15,fontWeight:700}}>{adUnuttu?"Admin Şifre Sıfırla":"Yönetici Girişi"}</div>
              <button onClick={()=>{setAdModal(false);setAdHata("");setAdSifre("");setAdUnuttu(false);}}
                style={{background:"none",border:"none",color:K.tx3,fontSize:18,cursor:"pointer"}}>✕</button>
            </div>
            {!adUnuttu?(
              <>
                <input type="password" value={adSifre} placeholder="Yönetici şifresi"
                  onChange={e=>{setAdSifre(e.target.value);setAdHata("");}}
                  onKeyDown={e=>e.key==="Enter"&&admGiris()}
                  style={{width:"100%",padding:"11px 13px",background:K.bg3,
                    border:"1px solid "+(adHata?K.err:K.bdr),borderRadius:9,
                    color:K.tx,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:6}}/>
                {adHata&&<div style={{color:K.errL,fontSize:11,marginBottom:8}}>{adHata}</div>}
                <div style={{textAlign:"right",marginBottom:14}}>
                  <button onClick={()=>setAdUnuttu(true)} style={{background:"none",border:"none",color:K.tL,cursor:"pointer",fontSize:12,fontWeight:600}}>Şifremi Unuttum</button>
                </div>
                <div style={{display:"flex",gap:9}}>
                  <button onClick={()=>{setAdModal(false);setAdHata("");setAdSifre("");}}
                    style={{flex:1,padding:10,background:"transparent",color:K.tx4,border:"1px solid "+K.bdr,borderRadius:9,cursor:"pointer"}}>İptal</button>
                  <button onClick={admGiris}
                    style={{flex:1,padding:10,background:"linear-gradient(135deg,"+K.g2+","+K.t2+")",
                      color:"#fff",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700}}>Giriş</button>
                </div>
              </>
            ):(
              <>
                <div style={{color:K.tx3,fontSize:12,marginBottom:14}}>Yeni admin şifresi belirleyin.</div>
                <input type="password" id="np1" placeholder="Yeni şifre (min 6)"
                  style={{width:"100%",padding:"11px 13px",background:K.bg3,border:"1px solid "+K.bdr,
                    borderRadius:9,color:K.tx,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
                <input type="password" id="np2" placeholder="Tekrar girin"
                  style={{width:"100%",padding:"11px 13px",background:K.bg3,border:"1px solid "+K.bdr,
                    borderRadius:9,color:K.tx,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:14}}/>
                <button onClick={()=>{
                  const pw1=document.getElementById("np1").value;
                  const pw2=document.getElementById("np2").value;
                  if(!pw1||pw1.length<6){alert("En az 6 karakter!");return;}
                  if(pw1!==pw2){alert("Şifreler eşleşmiyor!");return;}
                  const a=getA(); setA({...a,pw:pw1});
                  alert("✅ Şifre güncellendi: "+pw1+"\nNot edin!");
                  setAdUnuttu(false); setAdModal(false);
                }} style={{width:"100%",padding:12,background:"linear-gradient(135deg,"+K.g2+","+K.t2+")",
                  color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14,marginBottom:8}}>
                  Şifreyi Güncelle
                </button>
                <div style={{textAlign:"center"}}>
                  <button onClick={()=>setAdUnuttu(false)} style={{background:"none",border:"none",color:K.tL,cursor:"pointer",fontSize:12}}>← Geri Dön</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
