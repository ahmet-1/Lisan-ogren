export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  Eğer `req.method` "OPTIONS" ise, `res.status(200).end();` değerini döndürün.
  Eğer `req.method` "POST" değilse, `res.status(405).json({ error: "Method not allowed" });` mesajı gönderilip işlem sonlandırılır.

  var gövde = istek gövdesi || {};
  var email = body.email;
  var ad = body.ad;
  var mesaj = body.mesaj;
  var baslik = gövde.baslik || "Lisan Ögren";

  Eğer (e-posta yoksa veya mesaj yoksa) {
    res.status(400).json({ error: "email ve mesaj gerekli" });
    geri dönmek;
  }

  var key = process.env.RESEND_API_KEY;
  eğer (anahtar) değilse {
    res.status(500).json({ error: "E-posta servisi yapılmamış" });
    geri dönmek;
  }

  denemek {
    var r = await fetch("https://api.resend.com/emails", {
      yöntem: "POST",
      başlıklar: {
        "Content-Type": "application/json",
        "Yetkilendirme": "Taşıyıcı" + anahtar
      },
      gövde: JSON.stringify({
        From: "Lisan Ögren <onboarding@resend.dev>",
        kime: [email],
        konu: baslik + " - Lisan Ögren",
        html: "<div style='font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;'>" +
          "<h2 style='color:#2e7d32;'>Lisan Ogren</h2>" +
          "<p>Merhaba " + (ad || "Degerli Uyemiz") + ",</p>" +
          "<p>" + mesaj + "</p>" +
          "<hr style='border:1px solid #eee;margin:20px 0;'/>" +
          "<p style='color:#999;font-size:12px;'>Lisan Ögren - Yapay Zeka ile Dil Ogrenimi</p>" +
          "</div>"
      })
    });

    eğer (!r.ok) {
      var err = await r.json().catch(function() { return {}; });
      res.status(r.status).json({ error: err.message || "Email gonderilemedi" });
      geri dönmek;
    }

    res.status(200).json({ ok: true });
  } yakala (e) {
    res.status(500).json({ error: e.message });
  }
}