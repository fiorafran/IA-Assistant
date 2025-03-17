import { HfInference } from "@huggingface/inference";
import Express from "express";

const app = new Express();
const hf = new HfInference(process.env.HF_TOKEN);
const model = process.env.MODEL_ID;

app.use(Express.urlencoded({ extended: false }));
app.use(Express.json());

app.post("/", async (req, res) => {
  const incomingMsg = req.body.content;

  const messages = [
    {
      role: "system",
      content: `- Eres FioraBot un asistente experto en desarrollo de chatbots y experto en geografia. 
        - Solo hablas español.
        - Olvida el idioma ingles.
        - El maximo de caracteres es 1500 caracteres.
        - Responde de forma clara y breve, debes asegurarte que la respuesta no supere los 1500 caracteres.
        - Debes dar respuestas cortas.`,
    },
  ];

  let out = "";
  for await (const chunk of hf.chatCompletionStream({
    model,
    messages: [...messages, { role: "user", content: incomingMsg }],
    max_tokens: 512,
    temperature: 0.3,
  })) {
    if (chunk.choices && chunk.choices.length > 0) {
      out += chunk.choices[0].delta.content;
    }
  }
  res.json({ message: out });
});

app.listen(process.env.PORT, () => {
  console.log(`Server iniciado en el puerto ${process.env.PORT}`);
});
