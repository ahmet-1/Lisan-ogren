import { useState, useRef, useEffect } from "react";

/* ─────────────────────────────────────────────
   RENK PALETİ
───────────────────────────────────────────── */
const K = {
  bg:"#071512", bg2:"#0a1e14", bg3:"#0d2618",
  card:"#0f2c1c", card2:"#122f1f",
  bdr:"#1a4028", bdr2:"#1f5030", bdr3:"#266040",
  g1:"#1b5e20", g2:"#2e7d32", g3:"#388e3c", g4:"#43a047", gL:"#66bb6a",
  t1:"#004d40", t2:"#00695c", t3:"#00897b", tL:"#26a69a",
  tx:"#e8f5e9", tx2:"#a5d6a7", tx3:"#6a9e74", tx4:"#3d6b47",
  warn:"#f9a825", err:"#c62828", errL:"#ef5350", gold:"#f57f17",
};

/* ─────────────────────────────────────────────
   VERİTABANI — localStorage (Vercel uyumlu)
───────────────────────────────────────────── */
const DB = {
  g: (k) => { try { const v = localStorage.getItem("la_"+k); return v ? JSON.parse(v) : null; } catch { return null; } },
  s: (k, v) => { try { localStorage.setItem("la_"+k, JSON.stringify(v)); } catch {} },
  d: (k) => { try { localStorage.removeItem("la_"+k); } catch {} },
};

const defaultAdmin = { pw:"admin123", email:"", contactEmail:"", iban:"", bank:"", acName:"", users:[], pays:[] };
const getA = () => DB.g("adm") || defaultAdmin;
const setA = (d) => DB.s("adm", d);

/* ─────────────────────────────────────────────
   DİLLER
───────────────────────────────────────────── */
const DILLER = [
  {id:"quran",  ad:"Kur'an-ı Kerim", yerel:"القرآن الكريم", bayrak:"🕌", renk:"#0d2a14", vurgu:"#f9a825", acik:"Tecvid, Makam ve Hıfz",       mic:"ar-SA", moduller:["Tecvid","Makam","Hıfz","Sure Mealleri"]},
  {id:"arabic", ad:"Arapça",         yerel:"العربية",        bayrak:"🇪🇬", renk:"#2a0e0e", vurgu:"#ff8f00", acik:"Nahiv, Sarf ve Konuşma",       mic:"ar-SA", moduller:["Nahiv","Sarf","Konuşma","Okuma-Yazma"]},
  {id:"english",ad:"İngilizce",       yerel:"English",        bayrak:"🇬🇧", renk:"#0e1a2a", vurgu:"#ef5350", acik:"British & American English",   mic:"en-US", moduller:["Grammar","Speaking","Vocabulary","IELTS"]},
  {id:"german", ad:"Almanca",         yerel:"Deutsch",        bayrak:"🇩🇪", renk:"#1a1a0e", vurgu:"#fdd835", acik:"A1'den C2'ye Almanca",          mic:"de-DE", moduller:["Grammatik","Sprechen","Vokabeln","TestDaF"]},
  {id:"italian",ad:"İtalyanca",       yerel:"Italiano",       bayrak:"🇮🇹", renk:"#0e2a0e", vurgu:"#ff8f00", acik:"La bella lingua italiana",      mic:"it-IT", moduller:["Grammatica","Conversazione","Cultura","CILS"]},
  {id:"french", ad:"Fransızca",       yerel:"Français",       bayrak:"🇫🇷", renk:"#0a1030", vurgu:"#ef5350", acik:"La langue de l'amour",          mic:"fr-FR", moduller:["Grammaire","Conversation","Culture","DELF"]},
  {id:"chinese",ad:"Çince",           yerel:"中文",            bayrak:"🇨🇳", renk:"#2a0a0a", vurgu:"#fdd835", acik:"Mandarin & HSK",                 mic:"zh-CN", moduller:["Pinyin","Hanzi","Konuşma","HSK"]},
  {id:"turkish",ad:"Türkçe",          yerel:"Türkçe",         bayrak:"🇹🇷", renk:"#2a0a0a", vurgu:"#ecf0f1", acik:"Ana dil & Yabancılara Türkçe",  mic:"tr-TR", moduller:["Dilbilgisi","Konuşma","Yazma","TÖMER"]},
  {id:"russian",ad:"Rusça",           yerel:"Русский",        bayrak:"🇷🇺", renk:"#0a0a2a", vurgu:"#ef5350", acik:"Kiril alfabesi & Konuşma",       mic:"ru-RU", moduller:["Kiril","Gramer","Konuşma","TORFL"]},
  {id:"spanish",ad:"İspanyolca",      yerel:"Español",        bayrak:"🇪🇸", renk:"#2a1a0a", vurgu:"#ff8f00", acik:"Dünyanın en yaygın dili",        mic:"es-ES", moduller:["Gramática","Conversación","Cultura","DELE"]},
];

/* ─────────────────────────────────────────────
   HOCALAR
───────────────────────────────────────────── */
const HOCALAR = {
  quran:[
    {id:"q1",ad:"Şeyh Ahmed Al-Ghamdi",    yer:"Mekke, S.Arabistan",   uz:"Tecvid & Hıfz Uzmanı",    p:4.9,n:1240,c:false},
    {id:"q2",ad:"Şeyh Omar Al-Fadil",      yer:"Medine, S.Arabistan",  uz:"Makam & Kıraat Uzmanı",   p:4.8,n:980, c:false},
    {id:"q3",ad:"Üst. Meryem Al-Husseini", yer:"Kahire, Mısır",        uz:"Sure Mealleri & Tefsir",  p:4.9,n:1560,c:false},
    {id:"q4",ad:"Üst. Fatıma Al-Zahrawi",  yer:"Güney Sina, Mısır",    uz:"Tecvid & Kıraat Uzmanı",  p:4.7,n:870, c:false},
    {id:"q5",ad:"Öğrt. Yusuf Al-Nuri",     yer:"Kahire, Mısır",        uz:"Çocuklara Kur'an & Hıfz", p:4.9,n:640, c:true},
    {id:"q6",ad:"Öğrt. Zeynep Al-Safa",    yer:"Medine, S.Arabistan",  uz:"Çocuklara Tecvid",        p:4.8,n:510, c:true},
  ],
  arabic:[
    {id:"a1",ad:"Dr. Khalid Al-Mansouri", yer:"Kahire, Mısır", uz:"Nahiv & Sarf Uzmanı",    p:4.9,n:2100,c:false},
    {id:"a2",ad:"Prof. Yusuf Al-Azhari",  yer:"Kahire, Mısır", uz:"Fesahat & Belağat",      p:4.8,n:1450,c:false},
    {id:"a3",ad:"Dr. Nour Al-Rashidi",    yer:"Bağdat, Irak",  uz:"Modern Arapça",          p:4.9,n:1890,c:false},
    {id:"a4",ad:"Üst. Layla Al-Baghdadi", yer:"Amman, Ürdün",  uz:"Nahiv & Okuma-Yazma",    p:4.7,n:1120,c:false},
    {id:"a5",ad:"Öğrt. Samir Al-Faruq",   yer:"Kahire, Mısır", uz:"Çocuklara Temel Arapça", p:4.9,n:720, c:true},
    {id:"a6",ad:"Öğrt. Hana Al-Zubi",     yer:"Amman, Ürdün",  uz:"Çocuklara Arapça",       p:4.8,n:590, c:true},
  ],
  english:[
    {id:"e1",ad:"James Harrison",   yer:"Londra, İngiltere",    uz:"British English & IELTS",       p:4.9,n:3200,c:false},
    {id:"e2",ad:"Dr. William Clarke",yer:"Oxford, İngiltere",   uz:"Academic English & Writing",    p:4.8,n:2100,c:false},
    {id:"e3",ad:"Sarah Mitchell",   yer:"New York, ABD",        uz:"American English & TOEFL",      p:4.9,n:2800,c:false},
    {id:"e4",ad:"Emma Thompson",    yer:"Manchester, İngiltere",uz:"Conversation & Pronunciation",  p:4.8,n:1950,c:false},
    {id:"e5",ad:"Tom Bradley",      yer:"Bristol, İngiltere",   uz:"Çocuklara Eğlenceli İngilizce", p:4.9,n:880, c:true},
    {id:"e6",ad:"Lucy Williams",    yer:"Edinburgh, İskoçya",   uz:"Çocuk İngilizcesi",             p:4.8,n:740, c:true},
  ],
  german:[
    {id:"g1",ad:"Prof. Klaus Weber", yer:"Berlin, Almanya",   uz:"Grammatik & TestDaF",         p:4.9,n:1800,c:false},
    {id:"g2",ad:"Dr. Hans Mueller",  yer:"Münih, Almanya",    uz:"İş Almancası & C2",           p:4.7,n:1200,c:false},
    {id:"g3",ad:"Anna Schneider",    yer:"Hamburg, Almanya",  uz:"Konuşma & Telaffuz",          p:4.9,n:2100,c:false},
    {id:"g4",ad:"Dr. Maria Fischer", yer:"Viyana, Avusturya", uz:"A1-B2 & Günlük Almanca",     p:4.8,n:1600,c:false},
    {id:"g5",ad:"Felix Braun",       yer:"Köln, Almanya",     uz:"Çocuklara Eğlenceli Almanca", p:4.9,n:650, c:true},
    {id:"g6",ad:"Lena Hoffmann",     yer:"Stuttgart, Almanya",uz:"Çocuk Almancası",             p:4.8,n:520, c:true},
  ],
  italian:[
    {id:"i1",ad:"Marco Rossi",           yer:"Roma, İtalya",     uz:"Conversazione & Cultura", p:4.8,n:1400,c:false},
    {id:"i2",ad:"Prof. Antonio Bianchi", yer:"Floransa, İtalya", uz:"Grammatica & CILS",       p:4.9,n:1100,c:false},
    {id:"i3",ad:"Sofia De Luca",         yer:"Milano, İtalya",   uz:"Moda İtalyancası & İş",   p:4.9,n:1750,c:false},
    {id:"i4",ad:"Giulia Ferrari",        yer:"Napoli, İtalya",   uz:"Konuşma & Telaffuz",      p:4.7,n:980, c:false},
    {id:"i5",ad:"Luca Marino",           yer:"Torino, İtalya",   uz:"Çocuklara İtalyanca",     p:4.8,n:430, c:true},
    {id:"i6",ad:"Chiara Esposito",       yer:"Roma, İtalya",     uz:"Çocuk İtalyancası",       p:4.9,n:380, c:true},
  ],
  french:[
    {id:"f1",ad:"Pierre Dubois",       yer:"Paris, Fransa",    uz:"Grammaire & DELF",   p:4.8,n:1900,c:false},
    {id:"f2",ad:"Dr. Jean-Luc Martin", yer:"Lyon, Fransa",     uz:"Fransız Edebiyatı",  p:4.9,n:1200,c:false},
    {id:"f3",ad:"Marie Dupont",        yer:"Paris, Fransa",    uz:"Konuşma & Telaffuz", p:4.9,n:2300,c:false},
    {id:"f4",ad:"Camille Bernard",     yer:"Bordeaux, Fransa", uz:"İş Fransızcası",     p:4.7,n:1050,c:false},
    {id:"f5",ad:"Theo Laurent",        yer:"Marseille, Fransa",uz:"Çocuklara Fransızca",p:4.8,n:490, c:true},
    {id:"f6",ad:"Amelie Petit",        yer:"Nice, Fransa",     uz:"Çocuk Fransızcası",  p:4.9,n:420, c:true},
  ],
  chinese:[
    {id:"c1",ad:"Wang Wei",  yer:"Pekin, Çin",     uz:"Pinyin & HSK 1-4",     p:4.8,n:2100,c:false},
    {id:"c2",ad:"Li Jian",   yer:"Şanghay, Çin",   uz:"İş Çincesi & HSK 5-6", p:4.9,n:1600,c:false},
    {id:"c3",ad:"Lin Mei",   yer:"Pekin, Çin",     uz:"Hanzi & Konuşma",      p:4.9,n:2400,c:false},
    {id:"c4",ad:"Zhang Li",  yer:"Chengdu, Çin",   uz:"Başlangıç Çincesi",    p:4.8,n:1800,c:false},
    {id:"c5",ad:"Chen Hao",  yer:"Guangzhou, Çin", uz:"Çocuklara Çince",      p:4.9,n:580, c:true},
    {id:"c6",ad:"Xiao Ying", yer:"Pekin, Çin",     uz:"Çocuk Çincesi",        p:4.8,n:490, c:true},
  ],
  turkish:[
    {id:"t1",ad:"Prof. Mehmet Yıldız", yer:"İstanbul, Türkiye",uz:"Dilbilgisi & Yazma",      p:4.9,n:1500,c:false},
    {id:"t2",ad:"Dr. Ali Kaya",        yer:"Ankara, Türkiye",  uz:"Yabancılara Türkçe",      p:4.8,n:1100,c:false},
    {id:"t3",ad:"Prof. Ayşe Demir",    yer:"İstanbul, Türkiye",uz:"Konuşma & Telaffuz",      p:4.9,n:1900,c:false},
    {id:"t4",ad:"Dr. Zeynep Arslan",   yer:"Bursa, Türkiye",   uz:"Edebiyat & İleri Türkçe", p:4.8,n:1300,c:false},
    {id:"t5",ad:"Öğrt. Burak Şahin",   yer:"İzmir, Türkiye",   uz:"Çocuklara Türkçe",        p:4.9,n:620, c:true},
    {id:"t6",ad:"Öğrt. Elif Kılıç",    yer:"Ankara, Türkiye",  uz:"Çocuk Türkçesi",          p:4.8,n:540, c:true},
  ],
  russian:[
    {id:"r1",ad:"Prof. Dmitri Volkov",  yer:"Moskova, Rusya",       uz:"Kiril & Rus Grameri", p:4.9,n:1600,c:false},
    {id:"r2",ad:"Dr. Alexei Petrov",    yer:"St.Petersburg, Rusya", uz:"İş Rusçası & TORFL",  p:4.8,n:1200,c:false},
    {id:"r3",ad:"Dr. Natasha Ivanova",  yer:"Moskova, Rusya",       uz:"Konuşma & Telaffuz",  p:4.9,n:2000,c:false},
    {id:"r4",ad:"Prof. Elena Sorokina", yer:"Kazan, Rusya",         uz:"Edebiyat & Rusça",    p:4.8,n:1400,c:false},
    {id:"r5",ad:"Öğrt. Ivan Novikov",   yer:"Moskova, Rusya",       uz:"Çocuklara Rusça",     p:4.9,n:560, c:true},
    {id:"r6",ad:"Öğrt. Olga Morozova",  yer:"Novosibirsk, Rusya",   uz:"Çocuk Rusçası",       p:4.8,n:480, c:true},
  ],
  spanish:[
    {id:"s1",ad:"Prof. Carlos García",   yer:"Madrid, İspanya",    uz:"Gramática & DELE",           p:4.9,n:2400,c:false},
    {id:"s2",ad:"Dr. Miguel Rodríguez",  yer:"Barselona, İspanya",  uz:"İş İspanyolcası",            p:4.8,n:1800,c:false},
    {id:"s3",ad:"Ana Martínez",          yer:"Sevilla, İspanya",    uz:"Conversación",               p:4.9,n:2600,c:false},
    {id:"s4",ad:"Dr. Isabel López",      yer:"Valencia, İspanya",   uz:"Latin Amerika İspanyolcası", p:4.8,n:2100,c:false},
    {id:"s5",ad:"Öğrt. Diego Sánchez",   yer:"Madrid, İspanya",     uz:"Çocuklara İspanyolca",       p:4.9,n:720, c:true},
    {id:"s6",ad:"Öğrt. Lucía Fernández", yer:"Barselona, İspanya",  uz:"Çocuk İspanyolcası",         p:4.8,n:640, c:true},
  ],
};

/* ─────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────── */
function Av({ h, dil, sz = 64 }) {
  const bas = h.ad.split(" ").slice(-2).map(w => w[0]).join("");
  return (
    <div style={{width:sz,height:sz,borderRadius:"50%",flexShrink:0,position:"relative",
      background:`linear-gradient(145deg,${dil.renk},${dil.renk}cc)`,
      border:`${sz>50?3:2}px solid ${dil.vurgu}`,display:"flex",alignItems:"center",
      justifyContent:"center",boxShadow:`0 0 20px ${dil.vurgu}33`}}>
      <span style={{fontSize:sz>80?28:sz>50?18:12,fontWeight:900,color:"#fff",fontFamily:"Georgia,serif"}}>{bas}</span>
      {h.c&&sz>50&&(
        <div style={{position:"absolute",top:-4,right:-4,width:20,height:20,borderRadius:"50%",
          background:K.gold,border:`2px solid ${K.bg}`,display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:10,color:"#fff",fontWeight:700}}>★</div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   AUTH MODAL (Giriş / Kayıt / Şifremi Unuttum)
───────────────────────────────────────────── */
function AuthModal({ ilkMod, kapat, basari }) {
  const [mod, setMod]     = useState(ilkMod || "giris");
  const [form, setForm]   = useState({ad:"",email:"",tel:"",tc:"",dogum:"",sehir:"",sifre:"",sifre2:"",onay:false});
  const [hatalar, setH]   = useState({});
  const [tamam, setTamam] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukl] = useState(false);

  const inp = (k, tip="text", yer="") => (
    <div style={{marginBottom:12}}>
      <input type={tip} value={form[k]} placeholder={yer}
        onChange={e=>{setForm(p=>({...p,[k]:e.target.value}));setH(p=>({...p,[k]:""}));}}
        style={{width:"100%",padding:"11px 14px",background:K.bg3,
          border:`1px solid ${hatalar[k]?K.err:K.bdr}`,borderRadius:9,
          color:K.tx,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
      {hatalar[k]&&<div style={{color:K.errL,fontSize:11,marginTop:3}}>{hatalar[k]}</div>}
    </div>
  );

  const girisYap = () => {
    const h={};
    if(!form.email) h.email="E-posta gerekli";
    if(!form.sifre) h.sifre="Şifre gerekli";
    if(Object.keys(h).length){setH(h);return;}
    setYukl(true);
    setTimeout(()=>{
      const a=getA();
      const u=(a.users||[]).find(x=>x.email.toLowerCase()===form.email.toLowerCase()&&x.pw===form.sifre);
      setYukl(false);
      if(!u){setH({sifre:"E-posta veya şifre hatalı"});return;}
      basari(u);
    },300);
  };

  const kayitOl = () => {
    const h={};
    if(!form.ad.trim())                    h.ad="Zorunlu";
    if(!form.email.includes("@"))          h.email="Geçerli e-posta girin";
    if(!form.tel.trim())                   h.tel="Zorunlu";
    if(form.tc.length!==11||!/^\d+$/.test(form.tc)) h.tc="11 haneli TC giriniz";
    if(!form.dogum)                        h.dogum="Zorunlu";
    if(!form.sehir.trim())                 h.sehir="Zorunlu";
    if(form.sifre.length<6)               h.sifre="En az 6 karakter";
    if(form.sifre!==form.sifre2)          h.sifre2="Şifreler eşleşmiyor";
    if(!form.onay)                         h.onay="Onay zorunlu";
    if(Object.keys(h).length){setH(h);return;}
    const a=getA();
    if((a.users||[]).find(x=>x.email.toLowerCase()===form.email.toLowerCase())){
      setH({email:"Bu e-posta zaten kayıtlı"});return;
    }
    setYukl(true);
    const yeni={
      id:Date.now(),ad:form.ad,email:form.email,tel:form.tel,
      tc:form.tc,dogum:form.dogum,sehir:form.sehir,pw:form.sifre,
      plan:"Deneme",durum:"Deneme",dil:"—",
      tarih:new Date().toLocaleDateString("tr-TR"),
      odeme:"₺0",trialStart:Date.now(),hediye:false,
    };
    setA({...a,users:[...(a.users||[]),yeni]});
    setYukl(false);
    setTamam(true);
    basari(yeni);
  };

  const sSifre = () => {
    if(!form.email.includes("@")){setH({email:"Geçerli e-posta girin"});return;}
    const a=getA();
    const u=(a.users||[]).find(x=>x.email.toLowerCase()===form.email.toLowerCase());
    if(!u){setH({email:"Bu e-posta ile kayıtlı kullanıcı bulunamadı"});return;}
    setMesaj(`Şifre sıfırlama bağlantısı ${form.email} adresine gönderildi. (Demo: Şifreniz — ${u.pw})`);
  };

  const tabSt = aktif=>({flex:1,padding:"10px",border:"none",cursor:"pointer",fontWeight:700,fontSize:13,
    background:aktif?`linear-gradient(135deg,${K.g2},${K.t2})`:K.bg3,
    color:aktif?"#fff":K.tx3,borderRadius:8});
  const btnSt = {width:"100%",padding:13,background:`linear-gradient(135deg,${K.g2},${K.t2})`,
    color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14,marginBottom:8};
  const lnkSt = {background:"none",border:"none",color:K.tL,cursor:"pointer",fontSize:12,fontWeight:600};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",
      alignItems:"center",justifyContent:"center",zIndex:9000}}>
      <div style={{background:K.card,borderRadius:22,padding:26,width:410,maxWidth:"95vw",
        border:`1px solid ${K.bdr3}`,maxHeight:"94vh",overflowY:"auto",
        boxShadow:"0 24px 64px rgba(0,0,0,0.8)"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          {mod!=="unuttu"&&(
            <div style={{display:"flex",gap:6,flex:1}}>
              <button style={tabSt(mod==="giris")} onClick={()=>{setMod("giris");setH({});setMesaj("");}}>Giriş Yap</button>
              <button style={tabSt(mod==="kayit")} onClick={()=>{setMod("kayit");setH({});setTamam(false);}}>Üye Ol</button>
            </div>
          )}
          {mod==="unuttu"&&<div style={{color:K.tx,fontSize:16,fontWeight:700}}>Şifremi Unuttum</div>}
          <button onClick={kapat} style={{background:"none",border:"none",color:K.tx3,fontSize:22,cursor:"pointer",marginLeft:8}}>✕</button>
        </div>

        {/* GİRİŞ */}
        {mod==="giris"&&<>
          <div style={{color:K.tx3,fontSize:11,marginBottom:4}}>E-posta</div>
          {inp("email","email","ornek@mail.com")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:4}}>Şifre</div>
          {inp("sifre","password","••••••••")}
          <div style={{textAlign:"right",marginBottom:14}}>
            <button style={lnkSt} onClick={()=>{setMod("unuttu");setH({});setMesaj("");}}>Şifremi Unuttum</button>
          </div>
          <button style={{...btnSt,opacity:yukleniyor?0.7:1}} onClick={girisYap} disabled={yukleniyor}>
            {yukleniyor?"Giriş yapılıyor...":"Giriş Yap"}
          </button>
          <div style={{textAlign:"center",color:K.tx3,fontSize:12}}>
            Hesabın yok mu? <button style={lnkSt} onClick={()=>{setMod("kayit");setH({});setTamam(false);}}>Üye Ol</button>
          </div>
        </>}

        {/* KAYIT */}
        {mod==="kayit"&&(tamam?(
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:56,marginBottom:12}}>🎉</div>
            <div style={{color:K.tx,fontSize:20,fontWeight:700,marginBottom:8}}>Hoş Geldin!</div>
            <div style={{color:K.tx3,fontSize:13,marginBottom:20}}>5 günlük ücretsiz denemen başladı.</div>
            <button style={btnSt} onClick={kapat}>Derse Başla →</button>
          </div>
        ):<>
          <div style={{color:K.tx3,fontSize:11,marginBottom:4}}>Ad Soyad</div>{inp("ad","text","Ahmet Yılmaz")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:4}}>E-posta</div>{inp("email","email","ornek@mail.com")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:4}}>Telefon</div>{inp("tel","tel","05XX XXX XXXX")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:4}}>T.C. Kimlik No</div>{inp("tc","text","12345678901")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:4}}>Doğum Tarihi</div>{inp("dogum","date","")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:4}}>Şehir</div>{inp("sehir","text","İstanbul")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:4}}>Şifre</div>{inp("sifre","password","min 6 karakter")}
          <div style={{color:K.tx3,fontSize:11,marginBottom:4}}>Şifre Tekrar</div>{inp("sifre2","password","tekrar girin")}
          <div style={{background:K.bg3,borderRadius:9,padding:12,marginBottom:13,border:`1px solid ${K.bdr}`}}>
            <label style={{display:"flex",gap:9,cursor:"pointer",alignItems:"flex-start"}}>
              <input type="checkbox" checked={form.onay} onChange={e=>setForm(p=>({...p,onay:e.target.checked}))}
                style={{marginTop:2,width:15,height:15,accentColor:K.gL}}/>
              <span style={{color:K.tx3,fontSize:11,lineHeight:1.6}}>
                Platform hizmet kalitesi kontrolleri kapsamındaki gizlilik politikasını okudum, kabul ediyorum.
              </span>
            </label>
            {hatalar.onay&&<div style={{color:K.errL,fontSize:10,marginTop:4}}>{hatalar.onay}</div>}
          </div>
          <button style={{...btnSt,opacity:yukleniyor?0.7:1}} onClick={kayitOl} disabled={yukleniyor}>
            {yukleniyor?"Kaydediliyor...":"Kayıt Ol →"}
          </button>
          <div style={{textAlign:"center",color:K.tx3,fontSize:12}}>
            Zaten hesabın var mı? <button style={lnkSt} onClick={()=>{setMod("giris");setH({});}}>Giriş Yap</button>
          </div>
        </>)}

        {/* ŞİFREMİ UNUTTUM */}
        {mod==="unuttu"&&(mesaj?(
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:50,marginBottom:12}}>📧</div>
            <div style={{color:K.tx,fontSize:16,fontWeight:700,marginBottom:8}}>Bağlantı Gönderildi!</div>
            <div style={{color:K.tx3,fontSize:12,marginBottom:20,lineHeight:1.7}}>{mesaj}</div>
            <button style={btnSt} onClick={()=>setMod("giris")}>Giriş Yap</button>
          </div>
        ):<>
          <div style={{color:K.tx3,fontSize:12,marginBottom:14,lineHeight:1.6}}>
            Kayıtlı e-posta adresinizi girin. Şifre bilgisini göndereceğiz.
          </div>
          <div style={{color:K.tx3,fontSize:11,marginBottom:4}}>E-posta</div>
          {inp("email","email","ornek@mail.com")}
          <button style={btnSt} onClick={sSifre}>Şifremi Gönder</button>
          <div style={{textAlign:"center"}}>
            <button style={lnkSt} onClick={()=>setMod("giris")}>← Geri Dön</button>
          </div>
        </>)}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DERS EKRANI
───────────────────────────────────────────── */
// Bu dosyayı mevcut App.jsx'teki DersEkrani fonksiyonuyla değiştir
// Değişiklikler:
// 1. Ders başlamadan dil seçimi (Türkçe / Hedef Dil / İkidilli)
// 2. Sesli konuşma da ekrana yazılır
// 3. Her yanıt hem yazılı hem sesli gelir

function DersEkrani({dilId, hoca, kul, kapat}){
  const dil = DILLER.find(d=>d.id===dilId);
  const [msgs, setMsgs]     = useState([]);
  const [yazi, setYazi]     = useState("");
  const [yukl, setYukl]     = useState(false);
  const [mikr, setMikr]     = useState(false);
  const [mikErr, setMikErr] = useState("");
  const [sure, setSure]     = useState(kul?.plan==="Deneme"?1200:0);
  const [dilMod, setDilMod] = useState(null); // null=seçilmedi, "tr"=türkçe, "hedef"=hedef dil, "iki"=ikidilli
  const sonRef = useRef(null);
  const recRef = useRef(null);

  useEffect(()=>{
    if(kul?.plan==="Deneme"){
      const ti=setInterval(()=>setSure(s=>{if(s<=1){clearInterval(ti);return 0;}return s-1;}),1000);
      return()=>clearInterval(ti);
    }
  },[]);

  useEffect(()=>{
    if(dilMod){
      const karsilamaMesaji = dilMod==="tr"
        ? `Merhaba ${kul?.ad?.split(" ")[0]||""}! Ben ${hoca.ad}. ${dil.ad} dersine hoş geldin!\n\nUzmanlığım: ${hoca.uz}\n\nDersimizi Türkçe olarak işleyeceğiz. Mikrofona basarak sesli veya yazarak konuşabilirsin. Başlayalım!`
        : dilMod==="hedef"
        ? `Hello/Merhaba ${kul?.ad?.split(" ")[0]||""}! I am ${hoca.ad}. Welcome to your ${dil.ad} lesson!\n\nWe will conduct our lesson in ${dil.ad}. You can speak by pressing the microphone or type. Let's begin!`
        : `Merhaba ${kul?.ad?.split(" ")[0]||""}! Ben ${hoca.ad}. ${dil.ad} dersine hoş geldin!\n\nHem Türkçe hem ${dil.ad} kullanarak ders işleyeceğiz. Mikrofona basarak sesli veya yazarak konuşabilirsin. Başlayalım!`;
      setMsgs([{r:"ai", t:karsilamaMesaji, sesli:false}]);
    }
  },[dilMod]);

  useEffect(()=>{sonRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  // Dil seçim ekranı
  if(!dilMod){
    return(
      <div style={{position:"fixed",inset:0,background:K.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:8000}}>
        <div style={{background:K.card,borderRadius:22,padding:36,width:400,border:`1px solid ${K.bdr3}`,textAlign:"center",boxShadow:"0 24px 64px rgba(0,0,0,0.8)"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}><Av h={hoca} dil={dil} sz={80}/></div>
          <div style={{color:K.tx,fontSize:18,fontWeight:800,marginBottom:4}}>{hoca.ad}</div>
          <div style={{color:dil.vurgu,fontSize:12,marginBottom:6}}>{hoca.yer}</div>
          <div style={{color:K.tx3,fontSize:13,marginBottom:24}}>{hoca.uz}</div>
          
          <div style={{color:K.tx2,fontSize:14,fontWeight:700,marginBottom:16}}>Ders dilini seç:</div>
          
          {[
            {id:"tr",    baslik:"🇹🇷 Türkçe",          acik:"Hoca Türkçe konuşur ve yazar"},
            {id:"hedef", baslik:`${dil.bayrak} ${dil.ad}`, acik:`Hoca ${dil.ad} konuşur ve yazar`},
            {id:"iki",   baslik:"🔄 İkidilli",           acik:`Hem Türkçe hem ${dil.ad} karışık`},
          ].map(s=>(
            <div key={s.id} onClick={()=>setDilMod(s.id)}
              style={{background:K.bg3,borderRadius:12,padding:"14px 18px",marginBottom:10,cursor:"pointer",
                border:`1px solid ${K.bdr}`,textAlign:"left",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=dil.vurgu;e.currentTarget.style.background="rgba(46,125,50,0.1)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=K.bdr;e.currentTarget.style.background=K.bg3;}}>
              <div style={{color:K.tx,fontWeight:700,fontSize:14}}>{s.baslik}</div>
              <div style={{color:K.tx3,fontSize:12,marginTop:3}}>{s.acik}</div>
            </div>
          ))}
          
          <button onClick={kapat} style={{marginTop:10,padding:"9px 24px",background:"transparent",color:K.tx4,border:`1px solid ${K.bdr}`,borderRadius:9,cursor:"pointer",fontSize:13}}>
            ← Geri
          </button>
        </div>
      </div>
    );
  }

  const sistemPrompt = dilMod==="tr"
    ? `Sen ${hoca.ad} adlı AI dil öğretmenisin. ${hoca.yer} kökenlisin. ${dil.ad} dersi veriyorsun. Uzmanlık: ${hoca.uz}. SADECE TÜRKÇE yanıt ver. Örnekleri ${dil.yerel} dilinde ver ama açıklamaları Türkçe yap. Sıcak, sabırlı ve motive edici ol. Hataları nazikçe düzelt. Maksimum 3 paragraf.`
    : dilMod==="hedef"
    ? `You are ${hoca.ad}, an AI language teacher from ${hoca.yer}. You teach ${dil.ad}. Specialty: ${hoca.uz}. ONLY respond in ${dil.ad}. Be warm, patient and motivating. Gently correct mistakes. Maximum 3 paragraphs.`
    : `Sen ${hoca.ad} adlı AI dil öğretmenisin. ${hoca.yer} kökenlisin. ${dil.ad} dersi veriyorsun. Uzmanlık: ${hoca.uz}. Hem Türkçe hem ${dil.ad} kullanarak yanıt ver. Açıklamaları Türkçe yap, örnekleri ${dil.yerel} dilinde ver, her örneğin Türkçe çevirisini de ekle. Sıcak, sabırlı ve motive edici ol. Hataları nazikçe düzelt. Maksimum 3 paragraf.`;

  const mikBasla=()=>{
    setMikErr("");
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){setMikErr("Tarayıcınız ses girişini desteklemiyor. Lütfen yazarak devam edin.");return;}
    try{
      const r=new SR();
      // Dil moduna göre mikrofon dili
      r.lang = dilMod==="hedef" ? dil.mic : "tr-TR";
      r.continuous=false; r.interimResults=false;
      r.onstart=()=>setMikr(true);
      r.onresult=e=>{
        const metin = e.results[0][0].transcript;
        setYazi(metin); // Hem input'a yaz
        setMikr(false);
      };
      r.onerror=e=>{
        setMikr(false);
        setMikErr(e.error==="not-allowed"?"Mikrofon izni reddedildi. Tarayıcı ayarlarından izin verin.":"Ses algılanamadı, tekrar dene.");
        setTimeout(()=>setMikErr(""),4000);
      };
      r.onend=()=>setMikr(false);
      recRef.current=r; r.start();
    }catch{setMikErr("Mikrofon başlatılamadı.");}
  };
  const mikBirak=()=>{try{recRef.current?.stop();}catch{}setMikr(false);};

  const gonder=async(metinOverride)=>{
    const txt=(metinOverride||yazi).trim();
    if(!txt||yukl)return;
    setYazi(""); setYukl(true);
    // Mesajı ekrana yaz (sesli geldiyse de yazılır)
    setMsgs(m=>[...m,{r:"user",t:txt}]);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:800,
          system:sistemPrompt,
          messages:[...msgs.filter(m=>m.r).map(m=>({role:m.r==="ai"?"assistant":"user",content:m.t})),{role:"user",content:txt}]
        })
      });
      if(!res.ok){const d=await res.json().catch(()=>({}));throw new Error(d?.error?.message||`Hata: ${res.status}`);}
      const d=await res.json();
      const y=d.content?.[0]?.text;
      if(!y)throw new Error("Yanıt alınamadı.");
      
      // Yanıtı ekrana yaz
      setMsgs(m=>[...m,{r:"ai",t:y}]);
      
      // Sesli oku
      try{
        window.speechSynthesis?.cancel();
        const u=new SpeechSynthesisUtterance(y.substring(0,200));
        u.lang = dilMod==="hedef" ? dil.mic : "tr-TR";
        u.rate=0.85; u.pitch=1.1;
        window.speechSynthesis?.speak(u);
      }catch{}
    }catch(e){
      setMsgs(m=>[...m,{r:"ai",t:`Bağlantı hatası: ${e.message}. İnternet bağlantınızı kontrol edip tekrar deneyin.`}]);
    }
    setYukl(false);
  };

  // Mikrofon bırakıldığında otomatik gönder
  const mikBirakVeGonder=()=>{
    try{recRef.current?.stop();}catch{}
    setMikr(false);
    // Kısa bekleme sonra input'taki metni gönder
    setTimeout(()=>{
      const input = document.getElementById("dersInput");
      if(input && input.value.trim()){
        gonder(input.value.trim());
      }
    }, 500);
  };

  const mm=String(Math.floor(sure/60)).padStart(2,"0");
  const ss=String(sure%60).padStart(2,"0");
  const dilModLabel = dilMod==="tr" ? "🇹🇷 Türkçe" : dilMod==="hedef" ? `${dil.bayrak} ${dil.ad}` : "🔄 İkidilli";

  return(
    <div style={{position:"fixed",inset:0,background:K.bg,display:"flex",flexDirection:"column",zIndex:8000}}>
      <style>{`.nk{animation:nk 1s var(--d,0s) infinite}@keyframes nk{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}@keyframes tt{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      
      {/* Güvenlik bandı */}
      <div style={{background:"rgba(27,94,32,0.2)",padding:"4px 16px",fontSize:11,color:K.gL,textAlign:"center",borderBottom:`1px solid ${K.g2}44`}}>
        🔒 Platform hizmet kalitesi kapsamında denetlenebilir — Kayıt yapılmaz
      </div>
      
      {/* Başlık */}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",background:`linear-gradient(135deg,${dil.renk}ee,${dil.renk}99)`,borderBottom:`2px solid ${dil.vurgu}`}}>
        <Av h={hoca} dil={dil} sz={46}/>
        <div style={{flex:1}}>
          <div style={{color:"#fff",fontWeight:700,fontSize:14}}>{hoca.ad}</div>
          <div style={{color:dil.vurgu,fontSize:11}}>{hoca.yer} • {hoca.uz}</div>
        </div>
        {/* Dil modu göstergesi */}
        <div style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"4px 10px",fontSize:11,color:"#fff",cursor:"pointer"}}
          onClick={()=>{setDilMod(null);setMsgs([]);}}>
          {dilModLabel} ↺
        </div>
        {kul?.plan==="Deneme"&&sure>0&&(
          <div style={{background:"rgba(0,0,0,0.4)",borderRadius:8,padding:"4px 12px",textAlign:"center"}}>
            <div style={{fontSize:9,color:"#aaa"}}>KALAN</div>
            <div style={{fontWeight:800,color:sure<300?K.errL:dil.vurgu,fontSize:17}}>{mm}:{ss}</div>
          </div>
        )}
        <button onClick={kapat} style={{background:"rgba(255,255,255,0.12)",border:"none",color:"#fff",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontWeight:700}}>✕ Çıkış</button>
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
            {yukl&&<div style={{marginTop:6,color:K.gL,fontSize:10,animation:"tt 1s infinite"}}>Yanıt yazıyor...</div>}
          </div>
          
          <div style={{background:K.card,borderRadius:10,padding:12,border:`1px solid ${K.bdr}`,textAlign:"center"}}>
            <div style={{fontSize:9,color:K.tx4,marginBottom:6,fontWeight:700,letterSpacing:1}}>KAMERA</div>
            <div style={{background:K.bg3,borderRadius:8,padding:"12px 10px"}}>
              <div style={{fontSize:22}}>📷</div>
              <div style={{color:K.warn,fontSize:11,fontWeight:700,marginTop:4}}>Yakında!</div>
              <div style={{color:K.tx4,fontSize:10,marginTop:3}}>Güncellemeyle gelecek</div>
            </div>
          </div>
          
          {mikErr&&<div style={{background:"rgba(198,40,40,0.12)",borderRadius:8,padding:10,color:K.errL,fontSize:11,border:`1px solid ${K.err}44`}}>{mikErr}</div>}
          
          <div style={{background:K.card,borderRadius:10,padding:12}}>
            <div style={{fontSize:9,color:K.tx4,marginBottom:8,fontWeight:700,letterSpacing:1}}>MODÜLLER</div>
            {dil.mods.map(m=><div key={m} style={{padding:"6px 10px",borderRadius:7,marginBottom:4,background:K.bg3,color:K.tx2,fontSize:11,borderLeft:`3px solid ${dil.vurgu}55`}}>{m}</div>)}
          </div>
          
          <div style={{background:K.card,borderRadius:10,padding:12}}>
            <div style={{fontSize:9,color:K.tx4,marginBottom:8,fontWeight:700,letterSpacing:1}}>DERS DİLİ</div>
            <div style={{color:K.gL,fontSize:12,fontWeight:600,textAlign:"center"}}>{dilModLabel}</div>
            <button onClick={()=>{setDilMod(null);setMsgs([]);}}
              style={{width:"100%",marginTop:8,padding:"7px",borderRadius:7,background:"rgba(46,125,50,0.12)",color:K.gL,border:`1px solid ${K.g2}44`,cursor:"pointer",fontSize:11,fontWeight:600}}>
              Dil Değiştir
            </button>
          </div>
        </div>

        {/* Sohbet alanı */}
        <div style={{flex:1,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.r==="user"?"flex-end":"flex-start",gap:8,alignItems:"flex-start"}}>
                {m.r==="ai"&&<Av h={hoca} dil={dil} sz={32}/>}
                <div style={{maxWidth:"70%"}}>
                  {/* Kim konuştu etiketi */}
                  <div style={{fontSize:10,color:K.tx4,marginBottom:3,textAlign:m.r==="user"?"right":"left"}}>
                    {m.r==="user"?"Sen":"🤖 "+hoca.ad.split(" ")[0]}
                  </div>
                  <div style={{padding:"11px 14px",borderRadius:16,color:K.tx,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap",
                    background:m.r==="user"?`linear-gradient(135deg,${K.g2},${K.t2})`:K.card,
                    borderBottomRightRadius:m.r==="user"?4:16,
                    borderBottomLeftRadius:m.r==="ai"?4:16,
                    border:m.r==="ai"?`1px solid ${K.bdr}`:"none"}}>
                    {m.t}
                  </div>
                </div>
              </div>
            ))}
            {yukl&&(
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Av h={hoca} dil={dil} sz={32}/>
                <div style={{background:K.card,borderRadius:16,padding:"10px 16px",border:`1px solid ${K.bdr}`,display:"flex",gap:4,alignItems:"center"}}>
                  {[0,1,2].map(i=><div key={i} className="nk" style={{"--d":`${i*0.18}s`,width:7,height:7,borderRadius:"50%",background:K.gL}}/>)}
                </div>
              </div>
            )}
            <div ref={sonRef}/>
          </div>
          
          {/* Input alanı */}
          <div style={{padding:12,borderTop:`1px solid ${K.bdr}`,background:K.bg2}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button
                onMouseDown={mikBasla}
                onMouseUp={mikBirakVeGonder}
                onTouchStart={e=>{e.preventDefault();mikBasla();}}
                onTouchEnd={e=>{e.preventDefault();mikBirakVeGonder();}}
                style={{width:46,height:46,borderRadius:"50%",
                  background:mikr?"rgba(198,40,40,0.3)":K.bg3,
                  border:`2px solid ${mikr?K.errL:K.g3}`,
                  cursor:"pointer",fontSize:19,flexShrink:0,
                  animation:mikr?"tt 0.5s infinite":"none",
                  userSelect:"none",WebkitUserSelect:"none",
                  boxShadow:mikr?"0 0 20px rgba(239,83,80,0.5)":"none"}}>
                {mikr?"🔴":"🎤"}
              </button>
              <input
                id="dersInput"
                value={yazi}
                onChange={e=>setYazi(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&gonder()}
                placeholder={mikr?"Dinliyorum...":"Mesaj yaz veya 🎤 basılı tut konuş..."}
                style={{flex:1,background:mikr?"rgba(239,83,80,0.1)":K.bg3,
                  border:`1px solid ${mikr?K.errL:K.bdr}`,
                  borderRadius:10,padding:"12px 14px",color:K.tx,fontSize:13,outline:"none",
                  transition:"all 0.2s"}}/>
              <button onClick={()=>gonder()} disabled={yukl||!yazi.trim()}
                style={{padding:"12px 20px",borderRadius:10,fontWeight:700,fontSize:15,border:"none",flexShrink:0,
                  cursor:yukl||!yazi.trim()?"not-allowed":"pointer",
                  background:yukl||!yazi.trim()?K.bg3:`linear-gradient(135deg,${K.g2},${K.t2})`,
                  color:yukl||!yazi.trim()?K.tx4:"#fff"}}>➤</button>
            </div>
            <div style={{textAlign:"center",color:K.tx4,fontSize:10,marginTop:5}}>
              🎤 Basılı tut konuş, bırak gönder • ⌨️ Yaz Enter'a bas • Her konuşma ekrana yazılır
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ADMİN PANELİ
───────────────────────────────────────────── */
function AdminPaneli({ kapat }) {
  const [sekme, setSekme] = useState("dash");
  const [ayar, setAyar]   = useState(getA());
  const [kayd, setKayd]   = useState(false);
  const [hE,setHE]=useState(""); const [hT,setHT]=useState("7 Gün");
  const [hOk,setHOk]=useState(false); const [hErr,setHErr]=useState("");
  const [p1,setP1]=useState(""); const [p2,setP2]=useState("");
  const [pMsg,setPMsg]=useState(""); const [izle,setIzle]=useState(null);
  const [iForm,setIF]=useState({ad:"",email:"",tel:"",mesaj:""});
  const [iGonder,setIG]=useState(false);

  const kaydet = (y)=>{setAyar(y);setA(y);setKayd(true);setTimeout(()=>setKayd(false),2000);};

  const kullar   = ayar.users||[];
  const odemeler = ayar.pays||[];
  const toplam   = kullar.length;
  const aktif    = kullar.filter(u=>u.durum==="Aktif").length;
  const deneme   = kullar.filter(u=>u.durum==="Deneme").length;
  const bekleyen = odemeler.filter(o=>o.d==="bekle").length;
  const gelir    = kullar.reduce((t,u)=>{
    const n=parseInt((u.odeme||"0").replace(/[^0-9]/g,""));
    return t+(isNaN(n)?0:n);
  },0);

  const onayOde = (id)=>{
    const o=odemeler.find(x=>x.id===id); if(!o) return;
    kaydet({...ayar,
      pays:odemeler.map(x=>x.id===id?{...x,d:"ok"}:x),
      users:kullar.map(u=>u.email===o.email?{
        ...u,plan:o.plan,durum:"Aktif",
        odeme:`₺${(parseInt((u.odeme||"0").replace(/[^0-9]/g,""))||0)+(o.tutar||299)}`
      }:u)
    });
  };

  const hediyeGonder = ()=>{
    if(!hE.includes("@")){setHErr("Geçerli e-posta girin");return;}
    const u=kullar.find(x=>x.email.toLowerCase()===hE.toLowerCase());
    if(!u){setHErr("Bu e-posta kayıtlı kullanıcılarda bulunamadı");return;}
    kaydet({...ayar,users:kullar.map(x=>x.email.toLowerCase()===hE.toLowerCase()?{...x,plan:hT,durum:"Aktif",hediye:true}:x)});
    setHOk(true);
  };

  const sifreDegis = ()=>{
    if(p1.length<6){setPMsg("En az 6 karakter");return;}
    if(p1!==p2){setPMsg("Şifreler eşleşmiyor");return;}
    kaydet({...ayar,pw:p1});
    setPMsg("✅ Şifre güncellendi!");
    setP1(""); setP2("");
  };

  const gI={width:"100%",padding:"10px 12px",background:K.bg3,border:`1px solid ${K.bdr}`,
    borderRadius:9,color:K.tx,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:12};
  const kD={background:K.card,borderRadius:12,padding:16,border:`1px solid ${K.bdr}`,marginBottom:14};
  const bG={padding:"10px 20px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:13,
    border:"none",background:`linear-gradient(135deg,${K.g2},${K.t2})`,color:"#fff"};

  const SEKMELER=[
    ["dash","📊","Dashboard"],["kullar","👥","Kullanıcılar"],
    ["odeme","💳","Ödemeler"],["dersler","📡","Aktif Dersler"],
    ["hediye","🎁","Hediye Ver"],["bildir","🔔","Bildirimler"],["ayarlar","⚙️","Ayarlar"]
  ];

  return(
    <div style={{position:"fixed",inset:0,background:K.bg,zIndex:7000,display:"flex",fontFamily:"inherit"}}>
      {/* SOL MENÜ */}
      <div style={{width:210,background:K.bg2,borderRight:`1px solid ${K.bdr}`,
        display:"flex",flexDirection:"column",padding:14,gap:3,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,paddingBottom:14,borderBottom:`1px solid ${K.bdr}`}}>
          <div style={{width:34,height:34,borderRadius:9,background:`linear-gradient(135deg,${K.g4},${K.t3})`,
            display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:17}}>L</div>
          <span style={{fontWeight:900,color:K.tx,fontSize:15}}>Lingua<span style={{color:K.gL}}>AI</span></span>
        </div>
        <div style={{fontSize:9,color:K.tx4,marginBottom:5,letterSpacing:1,fontWeight:700,paddingLeft:3}}>YÖNETİCİ PANELİ</div>
        {SEKMELER.map(([id,ic,lb])=>(
          <button key={id} onClick={()=>setSekme(id)}
            style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:9,border:"none",
              background:sekme===id?"rgba(46,125,50,0.18)":"transparent",
              color:sekme===id?K.gL:K.tx4,cursor:"pointer",fontSize:12,textAlign:"left",
              fontWeight:sekme===id?700:400,borderLeft:sekme===id?`3px solid ${K.g3}`:"3px solid transparent"}}>
            {ic} {lb}
          </button>
        ))}
        <div style={{flex:1}}/>
        <button onClick={kapat}
          style={{padding:"10px 12px",borderRadius:9,border:`1px solid ${K.bdr}`,
            background:"transparent",color:K.tx4,cursor:"pointer",fontSize:12}}>
          ← Uygulamaya Dön
        </button>
      </div>

      {/* İÇERİK */}
      <div style={{flex:1,overflowY:"auto",padding:22}}>

        {sekme==="dash"&&(
          <div>
            <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Dashboard</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:16}}>
              {[
                {l:"Toplam Kullanıcı",v:toplam,c:K.gL},
                {l:"Aktif Abonelik",v:aktif,c:K.tL},
                {l:"Deneme Süreci",v:deneme,c:K.warn},
                {l:"Bekleyen Ödeme",v:bekleyen,c:K.errL},
                {l:"Toplam Gelir",v:`₺${gelir.toLocaleString()}`,c:K.warn},
                {l:"Toplam Hoca",v:60,c:K.gL}
              ].map(s=>(
                <div key={s.l} style={{...kD,marginBottom:0,padding:16}}>
                  <div style={{fontSize:22,fontWeight:900,color:s.c,marginBottom:3}}>{s.v}</div>
                  <div style={{color:K.tx4,fontSize:11}}>{s.l}</div>
                </div>
              ))}
            </div>
            {ayar.contactEmail&&<div style={kD}><div style={{color:K.tx2,fontSize:12,marginBottom:4,fontWeight:600}}>İletişim E-postası</div><div style={{color:K.gL,fontSize:15,fontWeight:700}}>{ayar.contactEmail}</div></div>}
            {ayar.iban&&<div style={kD}><div style={{color:K.tx2,fontSize:12,marginBottom:8,fontWeight:600}}>IBAN</div><div style={{color:K.tx3,fontSize:13,lineHeight:2}}>{ayar.acName}<br/><strong style={{color:K.gL,fontFamily:"monospace"}}>{ayar.iban}</strong><br/>{ayar.bank}</div></div>}
          </div>
        )}

        {sekme==="kullar"&&(
          <div>
            <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Kullanıcılar ({toplam})</div>
            {kullar.length===0?(
              <div style={{...kD,color:K.tx4,textAlign:"center",padding:30}}>Henüz kayıtlı kullanıcı yok</div>
            ):(
              <div style={{...kD,padding:0,overflow:"hidden"}}>
                <div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 0.8fr",padding:"9px 14px",
                  background:K.bg3,fontSize:9,color:K.tx4,fontWeight:700,letterSpacing:0.5}}>
                  {["AD / E-POSTA","TEL / TC","PLAN","DURUM","GELİR"].map(h=><div key={h}>{h}</div>)}
                </div>
                {kullar.map(u=>(
                  <div key={u.id} style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 0.8fr",
                    padding:"11px 14px",borderTop:`1px solid ${K.bdr}`,alignItems:"center"}}>
                    <div>
                      <div style={{color:K.tx,fontSize:12,fontWeight:600}}>{u.ad}</div>
                      <div style={{color:K.tx4,fontSize:10}}>{u.email}</div>
                      <div style={{color:K.tx4,fontSize:10}}>{u.tarih}</div>
                    </div>
                    <div>
                      <div style={{color:K.tx2,fontSize:11}}>{u.tel||"—"}</div>
                      <div style={{color:K.tx4,fontSize:10}}>{u.tc?`TC: ${u.tc}`:""}</div>
                    </div>
                    <div style={{color:K.tx2,fontSize:11}}>{u.plan}{u.hediye&&<span style={{color:K.gL}}> 🎁</span>}</div>
                    <div style={{display:"inline-block",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:600,
                      background:u.durum==="Aktif"?"rgba(46,125,50,0.18)":u.durum==="Deneme"?"rgba(249,168,37,0.15)":"rgba(198,40,40,0.15)",
                      color:u.durum==="Aktif"?K.gL:u.durum==="Deneme"?K.warn:K.errL}}>{u.durum}</div>
                    <div style={{color:K.warn,fontSize:12,fontWeight:700}}>{u.odeme}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {sekme==="odeme"&&(
          <div>
            <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Ödemeler</div>
            {!ayar.iban&&<div style={{background:"rgba(249,168,37,0.1)",border:`1px solid ${K.warn}44`,
              borderRadius:10,padding:14,marginBottom:14}}>
              <div style={{color:K.warn,fontWeight:700,marginBottom:4}}>⚠️ IBAN girilmemiş</div>
              <div style={{color:K.tx4,fontSize:12}}>Ayarlar sekmesinden IBAN ekleyin.</div>
            </div>}
            {ayar.iban&&<div style={kD}><div style={{color:K.tx2,fontWeight:700,marginBottom:10}}>Aktif IBAN</div>
              <div style={{color:K.tx3,fontSize:13,lineHeight:2.2}}>{ayar.acName}<br/>
              <strong style={{color:K.gL,fontFamily:"monospace",fontSize:14}}>{ayar.iban}</strong><br/>{ayar.bank}</div>
            </div>}
            <div style={{color:K.tx,fontWeight:700,marginBottom:12,fontSize:14}}>Bekleyen ({bekleyen})</div>
            {odemeler.filter(o=>o.d==="bekle").length===0?(
              <div style={{...kD,color:K.tx4,textAlign:"center",fontSize:13}}>Bekleyen ödeme yok</div>
            ):odemeler.filter(o=>o.d==="bekle").map(o=>(
              <div key={o.id} style={{...kD,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{color:K.tx,fontWeight:700}}>{o.ad}</div>
                  <div style={{color:K.tx4,fontSize:11,marginTop:2}}>{o.email} • {o.plan} • {o.tarih}</div>
                </div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{color:K.warn,fontSize:16,fontWeight:700}}>₺{o.tutar}</div>
                  <button onClick={()=>onayOde(o.id)} style={bG}>✓ Onayla</button>
                </div>
              </div>
            ))}
            <div style={{color:K.tx,fontWeight:700,marginBottom:12,fontSize:14,marginTop:16}}>Onaylananlar</div>
            {odemeler.filter(o=>o.d==="ok").length===0?(
              <div style={{...kD,color:K.tx4,textAlign:"center",fontSize:13}}>Henüz yok</div>
            ):odemeler.filter(o=>o.d==="ok").map(o=>(
              <div key={o.id} style={{...kD,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{color:K.tx,fontSize:12}}>{o.ad} — {o.plan}</div></div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{color:K.warn,fontWeight:700}}>₺{o.tutar}</div>
                  <div style={{background:"rgba(46,125,50,0.15)",color:K.gL,borderRadius:5,padding:"2px 8px",fontSize:10,fontWeight:600}}>✓ Onaylı</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {sekme==="dersler"&&(
          <div>
            <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:8}}>Aktif Dersler</div>
            <div style={{color:K.tx4,fontSize:12,marginBottom:16}}>Hizmet kalitesi kapsamında izleyebilirsiniz.</div>
            {kullar.filter(u=>u.durum==="Aktif").length===0?(
              <div style={{...kD,color:K.tx4,textAlign:"center",padding:30}}>Şu an aktif ders yok</div>
            ):kullar.filter(u=>u.durum==="Aktif").map(u=>(
              <div key={u.id} style={{...kD,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{color:K.tx,fontWeight:700}}>{u.ad}</div>
                  <div style={{color:K.tx4,fontSize:11,marginTop:2}}>{u.email} • {u.plan}</div>
                </div>
                <button onClick={()=>setIzle(u)} style={{padding:"7px 12px",borderRadius:7,
                  background:K.bg3,color:K.tL,border:`1px solid ${K.bdr2}`,cursor:"pointer",fontSize:11,fontWeight:600}}>
                  👁 İzle
                </button>
              </div>
            ))}
            {izle&&(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",
                alignItems:"center",justifyContent:"center",zIndex:9999}}>
                <div style={{background:K.card,borderRadius:18,padding:26,width:360,border:`1px solid ${K.bdr3}`}}>
                  <div style={{color:K.tx,fontSize:16,fontWeight:700,marginBottom:4}}>👁 İzleme Modu</div>
                  <div style={{color:K.tx4,fontSize:12,marginBottom:14}}>{izle.ad} — {izle.email}</div>
                  <div style={{background:"rgba(249,168,37,0.08)",borderRadius:10,padding:12,
                    border:`1px solid ${K.warn}33`,marginBottom:14}}>
                    <div style={{color:K.tx4,fontSize:11,lineHeight:1.8}}>
                      • Kullanıcı sizin katıldığınızı görmez<br/>
                      • Kayıt yapılmaz<br/>
                      • Yalnızca denetim amaçlıdır
                    </div>
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={()=>setIzle(null)} style={{flex:1,padding:10,background:"transparent",
                      color:K.tx4,border:`1px solid ${K.bdr}`,borderRadius:9,cursor:"pointer"}}>İptal</button>
                    <button onClick={()=>setIzle(null)} style={{...bG,flex:2}}>Tamam</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {sekme==="hediye"&&(
          <div>
            <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Hediye Ver</div>
            <div style={{...kD,maxWidth:440}}>
              {hOk?(
                <div style={{textAlign:"center",padding:16}}>
                  <div style={{fontSize:50,marginBottom:12}}>🎁</div>
                  <div style={{color:K.tx,fontSize:18,fontWeight:700,marginBottom:6}}>Gönderildi!</div>
                  <div style={{color:K.tx4,fontSize:12,marginBottom:16}}>{hE} → {hT} Ücretsiz</div>
                  <button onClick={()=>{setHOk(false);setHE("");}} style={bG}>Tamam</button>
                </div>
              ):(
                <>
                  <div style={{color:K.tx2,fontSize:12,marginBottom:14,lineHeight:1.6}}>
                    Kayıtlı kullanıcının e-postasını girerek ücretsiz kullanım hediye edin.
                  </div>
                  <div style={{color:K.tx4,fontSize:11,marginBottom:5}}>Kullanıcı E-postası</div>
                  <input value={hE} onChange={e=>{setHE(e.target.value);setHErr("");}}
                    placeholder="ornek@mail.com" style={gI}/>
                  {hErr&&<div style={{color:K.errL,fontSize:11,marginBottom:8}}>{hErr}</div>}
                  <div style={{color:K.tx4,fontSize:11,marginBottom:8}}>Hediye Türü</div>
                  {["7 Gün","1 Ay","3 Ay","Yıllık","Sınırsız"].map(g=>(
                    <div key={g} onClick={()=>setHT(g)}
                      style={{padding:"10px 14px",borderRadius:9,
                        background:hT===g?"rgba(46,125,50,0.2)":K.bg3,
                        border:`1px solid ${hT===g?K.g3:K.bdr}`,
                        color:hT===g?K.gL:K.tx2,cursor:"pointer",marginBottom:7,fontSize:12,fontWeight:hT===g?700:400}}>
                      🎁 {g} Ücretsiz
                    </div>
                  ))}
                  <button onClick={hediyeGonder} style={{...bG,width:"100%",padding:"12px",marginTop:4,fontSize:14}}>
                    Hediye Gönder
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {sekme==="bildir"&&(
          <div>
            <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Bildirim Gönder</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                {t:"Premium Teşvik",m:"5 günlük denemeniz bitiyor! Premium'a geçin."},
                {t:"Özel İndirim",m:"Bu hafta yıllık plana özel indirim!"},
                {t:"Yeni Hoca",m:"Yeni hocalarımız uygulamaya katıldı!"},
                {t:"Ders Hatırlatma",m:"Bugün ders yapmadınız. Hocanız bekliyor."}
              ].map(n=>(
                <div key={n.t} style={{...kD,marginBottom:0}}>
                  <div style={{color:K.tx,fontWeight:700,marginBottom:6,fontSize:13}}>{n.t}</div>
                  <div style={{color:K.tx4,fontSize:11,lineHeight:1.6,marginBottom:10}}>{n.m}</div>
                  <button onClick={()=>alert("Bildirim gönderildi: "+n.t)}
                    style={{width:"100%",padding:"7px",borderRadius:7,background:"rgba(46,125,50,0.12)",
                      color:K.gL,border:`1px solid ${K.g1}44`,cursor:"pointer",fontSize:11,fontWeight:600}}>
                    Tüm Kullanıcılara Gönder
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {sekme==="ayarlar"&&(
          <div>
            <div style={{fontSize:20,fontWeight:800,color:K.tx,marginBottom:16}}>Ayarlar</div>
            <div style={kD}>
              <div style={{color:K.tx,fontWeight:700,marginBottom:14,fontSize:14}}>👤 Hesap Bilgileri</div>
              <div style={{color:K.tx4,fontSize:11,marginBottom:5}}>Yönetici E-postası</div>
              <input value={ayar.email||""} onChange={e=>setAyar(s=>({...s,email:e.target.value}))}
                placeholder="admin@linguaai.com" style={gI}/>
              <div style={{color:K.tx4,fontSize:11,marginBottom:5}}>Kullanıcılara Gösterilen İletişim E-postası</div>
              <input value={ayar.contactEmail||""} onChange={e=>setAyar(s=>({...s,contactEmail:e.target.value}))}
                placeholder="iletisim@linguaai.com" style={gI}/>
            </div>
            <div style={kD}>
              <div style={{color:K.tx,fontWeight:700,marginBottom:14,fontSize:14}}>💳 IBAN Bilgileri</div>
              <div style={{color:K.tx4,fontSize:11,marginBottom:5}}>Hesap Sahibi</div>
              <input value={ayar.acName||""} onChange={e=>setAyar(s=>({...s,acName:e.target.value}))}
                placeholder="Ad Soyad" style={gI}/>
              <div style={{color:K.tx4,fontSize:11,marginBottom:5}}>IBAN</div>
              <input value={ayar.iban||""} onChange={e=>setAyar(s=>({...s,iban:e.target.value}))}
                placeholder="TR00 0000 0000 0000 0000 0000 00" style={gI}/>
              <div style={{color:K.tx4,fontSize:11,marginBottom:5}}>Banka Adı</div>
              <input value={ayar.bank||""} onChange={e=>setAyar(s=>({...s,bank:e.target.value}))}
                placeholder="Ziraat Bankası" style={gI}/>
            </div>
            <div style={kD}>
              <div style={{color:K.tx,fontWeight:700,marginBottom:6,fontSize:14}}>🔐 Şifre Değiştir</div>
              <input type="password" value={p1} onChange={e=>setP1(e.target.value)}
                placeholder="Yeni şifre (min 6 karakter)" style={gI}/>
              <input type="password" value={p2} onChange={e=>setP2(e.target.value)}
                placeholder="Şifreyi tekrar girin" style={gI}/>
              {pMsg&&<div style={{color:pMsg.startsWith("✅")?K.gL:K.errL,fontSize:12,marginBottom:10}}>{pMsg}</div>}
              <button onClick={sifreDegis} style={{padding:"9px 18px",background:"rgba(46,125,50,0.15)",
                color:K.gL,border:`1px solid ${K.g1}55`,borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12}}>
                Şifreyi Güncelle
              </button>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <button onClick={()=>kaydet(ayar)} style={bG}>💾 Tüm Ayarları Kaydet</button>
              {kayd&&<div style={{color:K.gL,fontSize:13,fontWeight:600}}>✅ Kaydedildi!</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ANA UYGULAMA
───────────────────────────────────────────── */
export default function App() {
  const [kullanici,  setKul]  = useState(()=>DB.g("kul"));
  const [adminGiris, setAdG]  = useState(()=>DB.g("adGiris")===true);
  const [adminAcik,  setAdA]  = useState(false);
  const [sayfa,      setSayfa]= useState("ana");
  const [dilSec,     setDS]   = useState(null);
  const [cocukMod,   setCM]   = useState(false);
  const [ders,       setDers] = useState(null);
  const [authAcik,   setAuth] = useState(false);
  const [authMod,    setAMod] = useState("giris");
  const [adminModal, setAMod2]= useState(false);
  const [adminSifre, setAS]   = useState("");
  const [adminHata,  setAH]   = useState("");
  const [adminUnuttu,setAUnuttu]= useState(false);
  const [admSfMesaj, setASFM] = useState("");
  const [odemePlan,  setOP]   = useState(null);
  const [iFm, setIFm] = useState({ad:"",email:"",mesaj:""});
  const [iGonderildi,setIGon] = useState(false);
  const [iGonderiyor,setIGonderiyor] = useState(false);
  const kulGiris = (u)=>{ setKul(u); DB.s("kul",u); };
  const kulCikis = ()=>{ setKul(null); DB.d("kul"); };

  const admGiris = ()=>{
    const a=getA();
    if(adminSifre===a.pw){
      setAdG(true); DB.s("adGiris",true);
      setAdA(true); setAMod2(false);
      setAS(""); setAH(""); setAUnuttu(false);
    } else {
      setAH("Yanlış şifre. Tekrar deneyin.");
    }
  };

  const admSifreHatirlat = ()=>{
    // Demo: Admin şifresi localStorage'dan okunur
    const a=getA();
    setASFM(`Mevcut admin şifreniz: ${a.pw}`);
  };

  const dersGirebilir = ()=>{
    if(adminGiris) return true;
    if(!kullanici) return false;
    if(kullanici.durum==="Aktif") return true;
    if(kullanici.durum==="Deneme") return (Date.now()-kullanici.trialStart)/(1000*60*60*24)<5;
    return false;
  };
const mesajGonder = async()=>{
  if(!iFm.ad.trim()||!iFm.email.includes("@")||!iFm.mesaj.trim()){
    alert("Lütfen tüm alanları doldurun.");return;
  }
  setIGonderiyor(true);
  try{
    const r=await fetch("https://formspree.io/f/mwvzegkg",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name:iFm.ad,email:iFm.email,message:iFm.mesaj})
    });
    if(r.ok) setIGon(true);
    else alert("Mail gönderilemedi, tekrar deneyin.");
  }catch(e){
    alert("Mail gönderilemedi, tekrar deneyin.");
  }
  setIGonderiyor(false);
};
  const git = (s)=>{ setSayfa(s); setDS(null); };
  const adm = getA();

  const hocaDersBasla = (h, dl)=>{
    if(!kullanici&&!adminGiris){setAMod("kayit");setAuth(true);return;}
    if(!dersGirebilir()){setOP({id:"up",ad:"Premium Üyelik",fiyat:"₺299",donem:"/ay",tutar:299});return;}
    const k=adminGiris?{id:"admin",ad:"Admin",plan:"Sınırsız",durum:"Aktif",trialStart:0}:kullanici;
    setDers({dil:dl.id,hoca:h,kul:k});
  };

  if(adminAcik) return <AdminPaneli kapat={()=>setAdA(false)}/>;
  if(ders) return <DersEkrani dilId={ders.dil} hoca={ders.hoca} kullanici={ders.kul||kullanici} kapat={()=>setDers(null)}/>;

  const bP={padding:"13px 28px",background:`linear-gradient(135deg,${K.g2},${K.t2})`,color:"#fff",
    border:"none",borderRadius:12,cursor:"pointer",fontWeight:700,fontSize:14,
    boxShadow:`0 4px 20px ${K.g2}55`};
  const bS={padding:"13px 28px",background:"transparent",color:K.tx2,
    border:`1px solid ${K.bdr}`,borderRadius:12,cursor:"pointer",fontWeight:600,fontSize:14};
  const gI2={width:"100%",padding:"11px 13px",background:K.bg3,border:`1px solid ${K.bdr}`,
    borderRadius:9,color:K.tx,fontSize:13,outline:"none",boxSizing:"border-box"};

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(170deg,${K.bg},${K.bg2} 50%,${K.bg})`,
      fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <style>{`
        @keyframes y0{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes y1{0%,100%{transform:translateY(-5px)}50%{transform:translateY(7px)}}
        @keyframes y2{0%,100%{transform:translateY(4px)}50%{transform:translateY(-8px)}}
        @keyframes gir{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes titret{0%,100%{opacity:1}50%{opacity:.4}}
        *{box-sizing:border-box}
        input,textarea,button{font-family:inherit}
      `}</style>

      {/* NAVBAR */}
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"13px 22px",borderBottom:`1px solid ${K.bdr}`,
        background:"rgba(7,21,16,0.97)",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(20px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>git("ana")}>
          <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${K.g4},${K.t3})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            color:"#fff",fontWeight:900,fontSize:18,boxShadow:`0 2px 14px ${K.g2}66`}}>L</div>
          <span style={{fontSize:20,fontWeight:900,color:K.tx}}>Lingua</span>
          <span style={{fontSize:20,fontWeight:900,color:K.gL}}>AI</span>
          <span style={{marginLeft:4,background:"rgba(46,125,50,0.15)",border:`1px solid ${K.g1}44`,
            borderRadius:5,padding:"1px 6px",fontSize:9,color:K.gL,fontWeight:700}}>DİL ÖĞRENME</span>
        </div>

        <div style={{display:"flex",gap:3}}>
          {[["ana","Ana Sayfa"],["diller","Diller"],["fiyatlar","Fiyatlar"],["iletisim","İletişim"]].map(([s,l])=>(
            <button key={s} onClick={()=>git(s)}
              style={{padding:"7px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,
                fontWeight:sayfa===s?700:400,
                background:sayfa===s?"rgba(46,125,50,0.2)":"transparent",
                color:sayfa===s?K.gL:K.tx3}}>{l}</button>
          ))}
        </div>

        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          {adminGiris&&(
            <div style={{background:"rgba(249,168,37,0.12)",borderRadius:8,padding:"5px 10px",
              fontSize:11,color:K.warn,fontWeight:700,border:`1px solid ${K.warn}44`}}>⚙ Admin</div>
          )}
          {kullanici?(
            <>
              <div style={{background:"rgba(46,125,50,0.12)",borderRadius:8,padding:"6px 12px",
                fontSize:12,color:K.gL,fontWeight:600,border:`1px solid ${K.g1}44`}}>
                👤 {kullanici.ad.split(" ")[0]}
                <span style={{color:kullanici.durum==="Aktif"?K.gL:K.warn,fontSize:10,marginLeft:4}}>{kullanici.durum}</span>
              </div>
              <button onClick={kulCikis} style={{padding:"6px 10px",borderRadius:8,
                border:`1px solid ${K.bdr}`,background:"transparent",color:K.tx4,cursor:"pointer",fontSize:11}}>Çıkış</button>
            </>
          ):(
            <>
              <button onClick={()=>{setAMod("giris");setAuth(true);}}
                style={{padding:"7px 13px",borderRadius:8,border:`1px solid ${K.bdr}`,
                  background:"transparent",color:K.tx2,cursor:"pointer",fontSize:12,fontWeight:600}}>Giriş</button>
              <button onClick={()=>{setAMod("kayit");setAuth(true);}}
                style={{padding:"7px 14px",borderRadius:8,background:`linear-gradient(135deg,${K.g2},${K.t2})`,
                  color:"#fff",border:"none",cursor:"pointer",fontWeight:700,fontSize:12}}>Üye Ol</button>
            </>
          )}
          {adminGiris?(
<>
<button onClick={()=>setAdA(true)} style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${K.warn}44`,background:"rgba(249,168,37,0.1)",color:K.warn,cursor:"pointer",fontSize:11,fontWeight:700}}>Panel</button>
<button onClick={()=>{setAdG(false);DB.d("adGiris");}} style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${K.bdr}`,background:"transparent",color:K.tx4,cursor:"pointer",fontSize:11}}>Admin Çıkış</button>
</>
):(
            <button onClick={()=>{setAMod2(true);setAH("");setAS("");setAUnuttu(false);setASFM("");}}
              style={{padding:"6px 9px",borderRadius:8,border:`1px solid ${K.bdr}`,
                background:"transparent",color:K.tx4,cursor:"pointer",fontSize:11}}>⚙</button>
          )}
        </div>
      </nav>

      {/* ANA SAYFA */}
      {sayfa==="ana"&&(
        <div style={{animation:"gir 0.5s ease"}}>
          <div style={{textAlign:"center",padding:"68px 22px 42px"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,
              background:"rgba(46,125,50,0.1)",border:"1px solid rgba(46,125,50,0.25)",
              borderRadius:20,padding:"5px 16px",fontSize:11,color:K.gL,marginBottom:22,fontWeight:600}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:K.gL,display:"inline-block"}}/>
              5 Gün Ücretsiz • Yazılı & Sesli AI Hoca • 10 Dil
            </div>
            <h1 style={{fontSize:"clamp(32px,6vw,52px)",fontWeight:900,lineHeight:1.1,
              margin:"0 auto 18px",maxWidth:650,letterSpacing:-1.5,color:K.tx}}>
              AI Hocanla<br/>
              <span style={{background:`linear-gradient(90deg,${K.gL},${K.tL})`,
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>10 Dil Öğren</span>
            </h1>
            <p style={{fontSize:15,color:K.tx3,maxWidth:440,margin:"0 auto 30px",lineHeight:1.8}}>
              Yaz veya mikrofona bas, AI dil hocanla birebir ders al.<br/>
              Kameralı özellik yakında güncellemeyle geliyor!
            </p>
            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
              <button style={bP} onClick={()=>{if(kullanici||adminGiris)git("diller");else{setAMod("kayit");setAuth(true);}}}>
                Ücretsiz Başla →
              </button>
              <button style={bS} onClick={()=>git("fiyatlar")}>Fiyatlar</button>
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"center",gap:18,padding:"0 22px 36px",flexWrap:"wrap",alignItems:"flex-end"}}>
            {[
              {ad:"Şeyh Ahmed Al-Ghamdi",dil:DILLER[0],a:0},
              {ad:"Sarah Mitchell",dil:DILLER[2],a:1},
              {ad:"Dr. Natasha Ivanova",dil:DILLER[8],a:2},
              {ad:"Prof. Carlos García",dil:DILLER[9],a:0},
              {ad:"Lin Mei",dil:DILLER[6],a:1},
              {ad:"Prof. Klaus Weber",dil:DILLER[3],a:2},
            ].map((h,i)=>(
              <div key={i} style={{textAlign:"center",animation:`y${h.a} ${2.8+i*0.25}s ease-in-out infinite`,cursor:"pointer"}}
                onClick={()=>git("diller")}>
                <Av h={{...h,c:false}} dil={h.dil} sz={72}/>
                <div style={{color:K.tx4,fontSize:10,marginTop:7}}>{h.dil.ad}</div>
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:12,padding:"0 22px 36px",justifyContent:"center",flexWrap:"wrap"}}>
            {[
              {t:"🎤 Sesli Konuşma",d:"Mikrofona bas, hocanla sesli konuş"},
              {t:"✍️ Yazılı Ders",d:"İstediğin konuda yazarak pratik yap"},
              {t:"🌍 10 Dil",d:"Kur'an dahil 10 dil, 60 farklı hoca"},
              {t:"👶 Çocuk Modu",d:"Her dilde özel çocuk hocaları"},
            ].map(f=>(
              <div key={f.t} style={{background:K.card,borderRadius:14,padding:"18px 16px",
                width:190,border:`1px solid ${K.bdr}`,textAlign:"center"}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:6,color:K.tx}}>{f.t}</div>
                <div style={{color:K.tx4,fontSize:11,lineHeight:1.6}}>{f.d}</div>
              </div>
            ))}
          </div>

          <div style={{padding:"0 22px 58px",textAlign:"center"}}>
            <div style={{fontSize:13,fontWeight:700,color:K.tx4,marginBottom:16}}>10 Dil</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
              {DILLER.map(d=>(
                <button key={d.id} onClick={()=>{setDS(d);git("diller");}}
                  style={{background:K.card,border:`1px solid ${K.bdr}`,borderRadius:10,
                    padding:"8px 14px",cursor:"pointer",color:K.tx3,
                    display:"flex",alignItems:"center",gap:7,fontSize:12}}>
                  <span style={{fontSize:16}}>{d.bayrak}</span>{d.ad}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DİLLER */}
      {sayfa==="diller"&&!dilSec&&(
        <div style={{padding:"26px 22px"}}>
          <div style={{textAlign:"center",marginBottom:26}}>
            <h2 style={{fontSize:26,fontWeight:800,marginBottom:6,color:K.tx}}>Dil Seç</h2>
            <p style={{color:K.tx4,fontSize:13}}>Her dilde yetişkin ve çocuklara özel hocanlar</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",
            gap:16,maxWidth:1000,margin:"0 auto"}}>
            {DILLER.map(d=>(
              <div key={d.id} onClick={()=>setDS(d)}
                style={{background:K.card,borderRadius:16,overflow:"hidden",
                  border:`1px solid ${K.bdr}`,cursor:"pointer",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=d.vurgu;e.currentTarget.style.transform="translateY(-3px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=K.bdr;e.currentTarget.style.transform="translateY(0)";}}>
                <div style={{background:`linear-gradient(135deg,${d.renk},${d.renk}cc)`,
                  padding:"16px 16px 12px",borderBottom:`3px solid ${d.vurgu}`}}>
                  <div style={{fontSize:26}}>{d.bayrak}</div>
                  <div style={{fontSize:17,fontWeight:800,marginTop:5,color:"#fff"}}>{d.ad}</div>
                  <div style={{color:d.vurgu,fontSize:12,marginTop:2}}>{d.yerel}</div>
                </div>
                <div style={{padding:14}}>
                  <div style={{color:K.tx4,fontSize:11,marginBottom:10}}>{d.acik}</div>
                  <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:12}}>
                    {d.moduller.map(m=>(
                      <span key={m} style={{background:K.bg3,border:`1px solid ${d.vurgu}22`,
                        borderRadius:4,padding:"2px 6px",fontSize:10,color:K.tx4}}>{m}</span>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:4,alignItems:"center"}}>
                    {HOCALAR[d.id].filter(h=>!h.c).slice(0,4).map(h=><Av key={h.id} h={h} dil={d} sz={26}/>)}
                    <div style={{background:K.bg3,borderRadius:5,padding:"2px 7px",fontSize:9,color:K.tL,fontWeight:600}}>+2 Çocuk</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOCA SEÇ */}
      {sayfa==="diller"&&dilSec&&(
        <div style={{padding:"26px 22px"}}>
          <button onClick={()=>setDS(null)}
            style={{background:"none",border:"none",color:K.tx4,cursor:"pointer",fontSize:12,marginBottom:16}}>
            ← Geri
          </button>
          <div style={{textAlign:"center",marginBottom:22}}>
            <div style={{fontSize:32,marginBottom:6}}>{dilSec.bayrak}</div>
            <h2 style={{fontSize:22,fontWeight:800,marginBottom:5,color:K.tx}}>{dilSec.ad} — Hocanı Seç</h2>
            <p style={{color:K.tx4,fontSize:12}}>2 erkek + 2 kadın yetişkin • 1 erkek + 1 kadın çocuk</p>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:22}}>
            {[false,true].map(k=>(
              <button key={String(k)} onClick={()=>setCM(k)}
                style={{padding:"9px 22px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12,
                  border:`1px solid ${cocukMod===k?dilSec.vurgu:K.bdr}`,
                  background:cocukMod===k?"rgba(46,125,50,0.12)":"transparent",
                  color:cocukMod===k?dilSec.vurgu:K.tx4}}>
                {k?"👶 Çocuklara Özel":"🎓 Yetişkin Hocaları"}
              </button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",
            gap:16,maxWidth:900,margin:"0 auto"}}>
            {HOCALAR[dilSec.id].filter(h=>h.c===cocukMod).map(h=>(
              <div key={h.id}
                style={{background:K.card,borderRadius:16,padding:18,border:`1px solid ${K.bdr}`,
                  textAlign:"center",cursor:"pointer",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=dilSec.vurgu;e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=K.bdr;e.currentTarget.style.transform="translateY(0)";}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
                  <Av h={h} dil={dilSec} sz={80}/>
                </div>
                {h.c&&<div style={{background:"rgba(249,168,37,0.12)",color:K.warn,borderRadius:6,
                  padding:"2px 8px",fontSize:10,fontWeight:700,marginBottom:8,display:"inline-block",
                  border:`1px solid ${K.warn}33`}}>👶 Çocuklara Özel</div>}
                <div style={{fontWeight:700,fontSize:14,marginBottom:3,color:K.tx}}>{h.ad}</div>
                <div style={{color:K.tx4,fontSize:11,marginBottom:7}}>{h.yer}</div>
                <div style={{background:K.bg3,borderRadius:7,padding:"3px 9px",fontSize:11,
                  color:K.tx2,marginBottom:10,display:"inline-block"}}>{h.uz}</div>
                <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:14}}>
                  <span style={{color:dilSec.vurgu,fontSize:12,fontWeight:600}}>⭐ {h.p}</span>
                  <span style={{color:K.tx4,fontSize:11}}>{h.n.toLocaleString()}</span>
                </div>
                <button
                  onClick={(e)=>{e.stopPropagation();hocaDersBasla(h,dilSec);}}
                  style={{width:"100%",padding:"9px",borderRadius:9,
                    background:`linear-gradient(135deg,${K.g2},${K.t2})`,
                    color:"#fff",border:"none",cursor:"pointer",fontWeight:700,fontSize:12}}>
                  🎤 Derse Başla
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FİYATLAR */}
      {sayfa==="fiyatlar"&&(
        <div style={{padding:"50px 22px",textAlign:"center"}}>
          <h2 style={{fontSize:30,fontWeight:800,marginBottom:8,color:K.tx}}>Fiyatlandırma</h2>
          <p style={{color:K.tx4,marginBottom:38,fontSize:14}}>5 gün ücretsiz dene, havale ile öde</p>
          <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
            {[
              {id:"d",ad:"5 Günlük Deneme",fiyat:"Ücretsiz",donem:"",hl:false,
                oz:["1 dil","Günde 20 dk","Yazılı AI hoca","Sesli konuşma"]},
              {id:"a",ad:"Aylık Plan",fiyat:"₺299",donem:"/ay",hl:false,tutar:299,
                oz:["Tüm 10 dil","Sınırsız ders","4+2 hoca","Çocuk hocaları"]},
              {id:"y",ad:"Yıllık Plan",fiyat:"₺1990",donem:"/yıl",hl:true,tutar:1990,
                oz:["Tüm 10 dil","Sınırsız ders","4+2 hoca","Çocuk hocaları","Öncelikli destek","%44 tasarruf"]},
            ].map(p=>(
              <div key={p.id}
                style={{background:p.hl?`linear-gradient(135deg,${K.bg2},${K.bg3})`:K.card,
                  border:p.hl?`2px solid ${K.g3}`:`1px solid ${K.bdr}`,
                  borderRadius:20,padding:26,width:245,position:"relative",transition:"transform 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                {p.hl&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",
                  background:`linear-gradient(135deg,${K.g3},${K.t3})`,color:"#fff",
                  borderRadius:18,padding:"3px 14px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>⭐ EN POPÜLER</div>}
                <div style={{fontSize:15,fontWeight:700,marginBottom:7,color:K.tx}}>{p.ad}</div>
                <div style={{marginBottom:18}}>
                  <span style={{fontSize:34,fontWeight:900,color:p.hl?K.gL:K.tx}}>{p.fiyat}</span>
                  <span style={{color:K.tx4,fontSize:13}}>{p.donem}</span>
                </div>
                {p.oz.map(o=>(
                  <div key={o} style={{display:"flex",gap:7,marginBottom:7,textAlign:"left"}}>
                    <span style={{color:K.gL,fontWeight:700}}>✓</span>
                    <span style={{color:K.tx3,fontSize:12}}>{o}</span>
                  </div>
                ))}
                <button onClick={()=>{
                  if(p.id==="d"){
                    if(kullanici||adminGiris) git("diller");
                    else{setAMod("kayit");setAuth(true);}
                  } else {
                    if(!kullanici){setAMod("kayit");setAuth(true);}
                    else setOP(p);
                  }
                }} style={{width:"100%",marginTop:18,padding:11,borderRadius:10,fontWeight:700,
                  fontSize:13,cursor:"pointer",
                  background:p.hl?`linear-gradient(135deg,${K.g2},${K.t2})`:p.id==="d"?"transparent":K.bg3,
                  color:p.hl?"#fff":K.tx2,
                  border:p.id==="d"?`1px solid ${K.g2}`:p.hl?"none":`1px solid ${K.bdr}`}}>
                  {p.id==="d"?"Ücretsiz Başla":"Havale ile Satın Al"}
                </button>
              </div>
            ))}
          </div>
          {adm.iban&&(
            <div style={{marginTop:34,background:K.card,borderRadius:14,padding:22,
              maxWidth:440,margin:"34px auto 0",border:`1px solid ${K.bdr}`,textAlign:"left"}}>
              <div style={{color:K.tx,fontWeight:700,marginBottom:10,fontSize:14}}>💳 Havale Bilgileri</div>
              <div style={{color:K.tx4,fontSize:13,lineHeight:2.2}}>
                Ad Soyad: <strong style={{color:K.tx}}>{adm.acName}</strong><br/>
                IBAN: <strong style={{color:K.gL,fontFamily:"monospace"}}>{adm.iban}</strong><br/>
                Banka: <strong style={{color:K.tx}}>{adm.bank}</strong>
              </div>
              <div style={{background:"rgba(46,125,50,0.08)",borderRadius:8,padding:10,
                marginTop:10,border:`1px solid ${K.g1}44`}}>
                <div style={{color:K.tx4,fontSize:11,lineHeight:1.7}}>
                  Açıklama kısmına e-posta adresinizi yazın.<br/>
                  Onaydan sonra üyeliğiniz aktifleşir (max 2 saat).
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* İLETİŞİM */}
      {sayfa==="iletisim"&&(
        <div style={{padding:"50px 22px",maxWidth:500,margin:"0 auto"}}>
          <h2 style={{fontSize:26,fontWeight:800,marginBottom:8,color:K.tx}}>İletişim</h2>
          <p style={{color:K.tx4,marginBottom:26,fontSize:14}}>Sorularınız için bize ulaşın</p>
          <div style={{background:K.card,borderRadius:16,padding:24,border:`1px solid ${K.bdr}`}}>
            {adm.contactEmail&&(
              <div style={{marginBottom:20,paddingBottom:20,borderBottom:`1px solid ${K.bdr}`}}>
                <div style={{color:K.tx4,fontSize:12,marginBottom:6}}>📧 E-posta ile ulaşın</div>
                <a href={`mailto:${adm.contactEmail}`}
                  style={{color:K.gL,fontSize:17,fontWeight:700,textDecoration:"none"}}>
                  {adm.contactEmail}
                </a>
              </div>
            )}
            {iGonderildi?(
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{fontSize:50,marginBottom:12}}>✅</div>
                <div style={{color:K.tx,fontSize:18,fontWeight:700,marginBottom:8}}>Mesajınız Alındı!</div>
                <div style={{color:K.tx3,fontSize:13,marginBottom:20}}>En kısa sürede dönüş yapacağız.</div>
                <button onClick={()=>{setIGon(false);setIFm({ad:"",email:"",mesaj:""});}}
                  style={{padding:"10px 24px",background:`linear-gradient(135deg,${K.g2},${K.t2})`,
                    color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700}}>
                  Yeni Mesaj
                </button>
              </div>
            ):(
              <>
                <div style={{color:K.tx4,fontSize:12,marginBottom:12}}>💬 Mesaj Gönderin</div>
                <div style={{marginBottom:10}}>
                  <input
                    value={iFm.ad}
                    onChange={e=>setIFm(f=>({...f,ad:e.target.value}))}
                    placeholder="Adınız Soyadınız"
                    style={{...gI2}}/>
                </div>
                <div style={{marginBottom:10}}>
                  <input
                    type="email"
                    value={iFm.email}
                    onChange={e=>setIFm(f=>({...f,email:e.target.value}))}
                    placeholder="E-posta adresiniz"
                    style={{...gI2}}/>
                </div>
                <div style={{marginBottom:14}}>
                  <textarea
                    value={iFm.mesaj}
                    onChange={e=>setIFm(f=>({...f,mesaj:e.target.value}))}
                    placeholder="Mesajınız..."
                    rows={4}
                    style={{...gI2,resize:"vertical"}}/>
                </div><button
  onClick={mesajGonder}
  disabled={iGonderiyor}
  style={{width:"100%",padding:12,background:`linear-gradient(135deg,${K.g2},${K.t2})`,
    color:"#fff",border:"none",borderRadius:10,cursor:iGonderiyor?"not-allowed":"pointer",
    fontWeight:700,fontSize:14,opacity:iGonderiyor?0.7:1}}>
  {iGonderiyor?"Gönderiliyor...":"Mesaj Gönder"}
</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {authAcik&&(
        <AuthModal ilkMod={authMod} kapat={()=>setAuth(false)}
          basari={(u)=>{kulGiris(u);setAuth(false);git("diller");}}/>
      )}

      {/* ÖDEME MODAL */}
      {odemePlan&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",
          alignItems:"center",justifyContent:"center",zIndex:9000}}>
          <div style={{background:K.card,borderRadius:20,padding:26,width:400,maxWidth:"95vw",
            border:`1px solid ${K.bdr3}`,boxShadow:"0 24px 64px rgba(0,0,0,0.8)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
              <div>
                <div style={{color:K.tx,fontSize:16,fontWeight:700}}>Ödeme — {odemePlan.ad}</div>
                <div style={{color:K.tx4,fontSize:11,marginTop:2}}>{odemePlan.fiyat}{odemePlan.donem}</div>
              </div>
              <button onClick={()=>setOP(null)}
                style={{background:"none",border:"none",color:K.tx4,fontSize:18,cursor:"pointer"}}>✕</button>
            </div>
            {adm.iban?(
              <div style={{background:K.bg3,borderRadius:11,padding:15,marginBottom:14,border:`1px solid ${K.bdr}`}}>
                <div style={{color:K.tx,fontWeight:700,marginBottom:9,fontSize:13}}>Havale Bilgileri</div>
                <div style={{color:K.tx4,fontSize:12,lineHeight:2.2}}>
                  Ad Soyad: <strong style={{color:K.tx}}>{adm.acName}</strong><br/>
                  IBAN: <strong style={{color:K.gL,fontFamily:"monospace"}}>{adm.iban}</strong><br/>
                  Tutar: <strong style={{color:K.warn}}>{odemePlan.fiyat}</strong>
                </div>
                <div style={{background:"rgba(46,125,50,0.08)",borderRadius:7,padding:9,marginTop:9,border:`1px solid ${K.g1}44`}}>
                  <div style={{color:K.tx4,fontSize:11}}>
                    Açıklama kısmına: <strong style={{color:K.tx}}>{kullanici?.email}</strong>
                  </div>
                </div>
              </div>
            ):(
              <div style={{color:K.tx4,fontSize:13,marginBottom:14,padding:14,background:K.bg3,borderRadius:10}}>
                IBAN henüz girilmemiş. İletişim sayfasından bize ulaşın.
              </div>
            )}
            <button onClick={()=>{
              const a=getA();
              const ny={id:Date.now(),ad:kullanici?.ad||"",email:kullanici?.email||"",
                tutar:odemePlan.tutar||0,plan:odemePlan.ad,
                tarih:new Date().toLocaleDateString("tr-TR"),d:"bekle"};
              setA({...a,pays:[...(a.pays||[]),ny]});
              alert("Bildiriminiz alındı! Admin onayladıktan sonra üyeliğiniz aktifleşecektir.");
              setOP(null);
            }} style={{width:"100%",padding:12,background:`linear-gradient(135deg,${K.g2},${K.t2})`,
              color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13}}>
              ✓ Havaleyi Yaptım, Bildir
            </button>
          </div>
        </div>
      )}

      {/* ADMİN GİRİŞ MODAL */}
      {adminModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",
          alignItems:"center",justifyContent:"center",zIndex:9000}}>
          <div style={{background:K.card,borderRadius:18,padding:26,width:320,maxWidth:"95vw",
            border:`1px solid ${K.bdr3}`,boxShadow:"0 24px 64px rgba(0,0,0,0.8)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
              <div style={{color:K.tx,fontSize:15,fontWeight:700}}>
                {adminUnuttu?"🔑 Admin Şifre Hatırlatma":"⚙ Yönetici Girişi"}
              </div>
              <button onClick={()=>{setAMod2(false);setAH("");setAS("");setAUnuttu(false);setASFM("");}}
                style={{background:"none",border:"none",color:K.tx4,fontSize:18,cursor:"pointer"}}>✕</button>
            </div>

            {adminUnuttu?(
              <>
                <div style={{color:K.tx4,fontSize:12,marginBottom:14,lineHeight:1.6}}>
                  Demo modunda admin şifrenizi aşağıda görebilirsiniz. Gerçek uygulamada e-posta gönderilir.
                </div>
                {admSfMesaj&&(
                  <div style={{background:"rgba(46,125,50,0.1)",border:`1px solid ${K.g1}44`,
                    borderRadius:9,padding:12,marginBottom:14,color:K.gL,fontSize:13,fontWeight:600}}>
                    {admSfMesaj}
                  </div>
                )}
                <button onClick={admSifreHatirlat}
                  style={{width:"100%",padding:11,background:`linear-gradient(135deg,${K.g2},${K.t2})`,
                    color:"#fff",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,marginBottom:10}}>
                  Şifremi Göster
                </button>
                <div style={{textAlign:"center"}}>
                  <button onClick={()=>{setAUnuttu(false);setASFM("");}}
                    style={{background:"none",border:"none",color:K.tL,cursor:"pointer",fontSize:12,fontWeight:600}}>
                    ← Giriş Sayfasına Dön
                  </button>
                </div>
              </>
            ):(
              <>
                <input
                  type="password"
                  value={adminSifre}
                  placeholder="Yönetici şifresi"
                  onChange={e=>{setAS(e.target.value);setAH("");}}
                  onKeyDown={e=>e.key==="Enter"&&admGiris()}
                  style={{width:"100%",padding:"11px 13px",background:K.bg3,
                    border:`1px solid ${adminHata?K.err:K.bdr}`,borderRadius:9,
                    color:K.tx,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:6}}/>
                {adminHata&&<div style={{color:K.errL,fontSize:11,marginBottom:8}}>{adminHata}</div>}
                <div style={{textAlign:"right",marginBottom:12}}>
                  <button onClick={()=>{setAUnuttu(true);setAH("");setASFM("");}}
                    style={{background:"none",border:"none",color:K.tL,cursor:"pointer",fontSize:11,fontWeight:600}}>
                    Şifremi Unuttum
                  </button>
                </div>
                <div style={{display:"flex",gap:9}}>
                  <button onClick={()=>{setAMod2(false);setAH("");setAS("");}}
                    style={{flex:1,padding:10,background:"transparent",color:K.tx4,
                      border:`1px solid ${K.bdr}`,borderRadius:9,cursor:"pointer"}}>İptal</button>
                  <button onClick={admGiris}
                    style={{flex:1,padding:10,background:`linear-gradient(135deg,${K.g2},${K.t2})`,
                      color:"#fff",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700}}>Giriş</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
