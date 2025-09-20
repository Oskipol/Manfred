import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import models from "./modele";

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const dane = models.find(model => model.name === message.Mymodel);
    const dl = message.ll as "l1" | "l2" | "l3";
    if (message.type === 'ustaw') {
      (async () => {
        try {
          const model = new ChatOpenAI({
            model: dane?.id || "gpt-4o-mini", 
            apiKey: import.meta.env.API_KEY,
            temperature: dane?.temperature || 1,
          });
          const chatPrompt = ChatPromptTemplate.fromMessages([
            ["system", dane?.sys_prompt || "You are a helpful assistant that summarizes websites."],
            [
              "user", 
              `${dane?.prompt || "Summarize the following webpage in a lively, creative, and easy-to-read way. - Length: • Short → 1–2 punchy sentences with a hook.  - Make it engaging, not dry.  - Use a storytelling tone that captures the reader’s attention.  - Highlight the most important insights while keeping the language simple and memorable.  "} ${dane?.[dl] || ""} ${dane?.prompt2 || ""} {website}`
            ]
          ]);
          const promptValue = await chatPrompt.invoke({ website: message.tekst });
          const response = await model.invoke(promptValue);
          
          sendResponse(response.content);
        } catch (error) {
          console.error('Błąd AI:', error);
          sendResponse(`Błąd: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
        }
      })();
      
      return true; 
    }
  });
});



