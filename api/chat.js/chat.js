export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({error:"Method not allowed"}); return; }

  try {
    const { messages, system } = req.body;
    
    const groqMessages = [];
    if (system) groqMessages.push({role:"system", content: system});
    groqMessages.push(...messages);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 800,
        messages: groqMessages
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(()=>({}));
      res.status(response.status).json({error: err.error?.message || "Groq hata: " + response.status});
      return;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    
    // Anthropic formatında döndür (App.jsx uyumlu)
    res.status(200).json({
      content: [{type:"text", text}]
    });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}