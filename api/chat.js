export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  eğer (req.method === "OPTIONS") 
    res.status(200).end();
    geri. dönmek;
  }
  eğer (req.method !== "POST") 
    res.status(405).json({ error: "Method not allowed" });
    geri. dönmek;
  
  denemek
    const  messages = system  =  req; body;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      yöntem: "POST",
      başlıklar: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "antropik-versiyon": "2023-06-01"
      },
      gövde: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        maksimum_token = sayısı, 600:
        sistem, sistem,
        mesajlar: mesajlar
      })
    });
    eğer (!response.ok) 
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error && errData.error.message ? errData.error.message : "API Hatası: " + response.status;
      res.status(response.status).json({ error: errMsg });
      geri. dönmek;
    
    const data = await response.json();
    const text = data.content && data.content[0] && data.content[0].text ? data.content[0].text : "";
    res.status(200).json({ content: [{ type: "text", text: text }] });
   yakala (e) 
    res.status(500).json({ error: e.message });
  
