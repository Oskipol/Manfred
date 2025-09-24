import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { chatWithModel } from "../entrypoints/backgroundAI/chatWithModel"; // <- Twój kod który podałeś (możesz tam wkleić całość)

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/chat", async (req, res) => {
  try {
    const { url, question, session } = req.body;
    const answer = await chatWithModel(url, question, session);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Coś poszło nie tak" });
  }
});

app.listen(3001, () => {
  console.log("🚀 API działa na http://localhost:3001");
});