export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  Eğer `req.method` "OPTIONS" ise, `res.status(200).end();` değerini döndürün.
  Eğer `req.method` "POST" değilse, `res.status(405).json({error:"Method not allowed"});` ile yanıtı döndürün.
  denemek {
    const { messages, system } = req.body;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      yöntem: "POST",
      başlıklar: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "antropik-versiyon": "2023-06-01"
      },
      gövde: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        maksimum_token sayısı: 2000,
        sistem: sistem,
        mesajlar: mesajlar
      })
    });
    eğer (!response.ok) {
      const err = await response.json().catch(()=>({}));
      res.status(response.status).json({error: err.error?.message || "API Hatası: "+response.status});
      geri dönmek;
    }
    const data = await response.json();
    sabit metin = data.content?.[0]?.text || "";
    res.status(200).json({content:[{type:"text",text}]});
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}