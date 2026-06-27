var tokenlar = {};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  Eğer `req.method` "OPTIONS" ise, `res.status(200).end();` değerini döndürün.
  Eğer `req.method` "POST" değilse, `res.status(405).json({ error: "Method not allowed" });` mesajı gönderilip işlem sonlandırılır.

  var gövde = istek gövdesi || {};
  var eylem = gövde.eylem;
  var email = body.email;
  var token = body.token;
  var newPassword = body.newPassword;

  if (action === "send") {
    Eğer e-posta adresi yoksa, işlem durumu 400 olarak ayarlandı ve hata mesajı "E-posta gerekli" şeklinde bir değerle gösterildi. Ardından işlem geri döndürüldü.
    if (!process.env.RESEND_API_KEY) { res.status(500).json({ error: "Email servisi yapılandirilmamis" }); return; }

    var resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    tokens[resetToken] = { email: email, expires: Date.now() + 3600000 };

    var appUrl = "https://lisan-ogren-3806.vercel.app";
    var resetLink = appUrl + "?reset=" + resetToken;

    denemek {
      var r = await fetch("https://api.resend.com/emails", {
        yöntem: "POST",
        başlıklar: {
          "Content-Type": "application/json",
          "Yetkilendirme": "Taşıyıcı" + process.env.RESEND_API_KEY
        },
        gövde: JSON.stringify({
          From: "Lisan Ögren <onboarding@resend.dev>",
          kime: [email],
          konu: "Şifre Şifirlama - Lisan Ögren",
          html: "<div style='font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;'>" +
            "<h2 style='color:#2e7d32;'>Lisan Ögren - Sifre Sifirlama</h2>" +
            "<p>Sifre sifirlama talebiniz alindi.</p>" +
            "<p>Asagidaki butona tikleyerek yeni şifrenizi belirleyebilirsiniz.</p>" +
            "<p>Bu bağlantı <strong>1 saat</strong> gecelidir.</p>" +
            "<a href='" + resetLink + "' style='display:inline-block;padding:12px 24px;background:#2e7d32;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;margin:16px 0;'>Sifremi Sifirla</a>" +
            "<p style='color:#999;font-size:12px;'>Bu e-postayı boyut talep etmediğiniz takdirde görmeden gelebilirsiniz.</p>" +
            "</div>"
        })
      });

      eğer (!r.ok) {
        var err = await r.json().catch(function() { return {}; });
        res.status(500).json({ error: "Email gonderilemedi: " + (err.message || r.status) });
        geri dönmek;
      }

      res.status(200).json({ ok: true });
    } yakala (e) {
      res.status(500).json({ error: e.message });
    }

  } aksi takdirde eğer (eylem === "doğrula") {
    Eğer token yoksa, res.status(400).json({ error: "Token gerekli" }); işlemi sonlandırın.
    var data = tokens[token];
    Eğer veri yoksa, res.status(400).json({ error: "Gecersiz token" }); işlemi sonlandırın.
    if (Date.now() > data.expires) {
      token'ları sil[token];
      res.status(400).json({ error: "Token suresi dolmus" });
      geri dönmek;
    }
    res.status(200).json({ ok: true, email: data.email });

  } aksi takdirde eğer (eylem === "sıfırla") {
    Eğer token yoksa veya yeni parola yoksa, res.status(400).json({ error: "Eksik parametre" }); işlemi sonlandırın.
    var tdata = tokens[token];
    Eğer veri yoksa, durum 400 olarak ayarlanıp JSON'a "Gecersiz token" hatası yazdırılır ve işlem durdurulur.
    if (Date.now() > tdata.expires) {
      token'ları sil[token];
      res.status(400).json({ error: "Token suresi dolmus" });
      geri dönmek;
    }
    var temail = tdata.email;
    token'ları sil[token];
    res.status(200).json({ ok: true, email: temail });

  } başka {
    res.status(400).json({ error: "Gecersiz action" });
  }
}