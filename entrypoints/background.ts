import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import models from "./modele";
import { OpenAI } from "openai";


export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const dane = models.find(model => model.name === message.Mymodel);
    const dane2= models.find(model => model.name === "story");
    const dl = message.ll as "l1" | "l2" | "l3";
    if (message.type === 'ustaw') {
      (async () => {
        try {
          
          const model = new ChatOpenAI({
            model: message.znajdz ? "gpt-5-nano" : (dane?.id || "gpt-4o-mini"), 
            apiKey: import.meta.env.API_KEY,
            temperature: dane?.temperature || 1,
          });
          const chatPrompt = ChatPromptTemplate.fromMessages([
            ["system", message.znajdz? "Jesteś asystentem przeszukującym internet. Dla poniższego tekstu znajdź strony o podobnej treści.  " : (dane?.sys_prompt || "You are a helpful assistant that summarizes websites.")],
            [
              "user", 
              `${message.znajdz? "Output: WYŁĄCZNIE pełne linki URL, odzielaj każdy link z kolei znakiem <br>, bez numeracji, bez opisu, bez dodatkowego komentarza, możliwie jak najbardziej aktualne artykuły.  Jeśli nie ma wyników — wypisz dokładnie: NO_RESULTS.  Wyniki mogą być wyłącznie po polsku lub po angielsku. Odrzuć wszystkie strony w innych językach.  Tekst do przeszukania:":(dane?.prompt || "Summarize the following webpage in a lively, creative, and easy-to-read way. - Length: • Short → 1–2 punchy sentences with a hook.  - Make it engaging, not dry.  - Use a storytelling tone that captures the reader’s attention.  - Highlight the most important insights while keeping the language simple and memorable.  ")} ${dane?.[dl] || ""} ${dane?.prompt2 || ""} {website}`
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
    if(message.type==="ustaw2"){

      return true;
    }
    if (message.type === 'generateImage') {
      (async () => {
        try {
          const model=new ChatOpenAI({
            model: "gpt-5-nano", 
            apiKey: import.meta.env.API_KEY,
            temperature: 1,
          });
          const chatPrompt = ChatPromptTemplate.fromMessages([
            ["system", dane2?.sys_prompt || "You are a helpful assistant that turns text into a fantasy story."],
            ["user", `${dane2?.prompt} {website}`]
          ]);
          const promptValue = await chatPrompt.invoke({ website: message.prompt });
          const response2 = await model.invoke(promptValue);
          const contentStr = Array.isArray(response2.content)
            ? response2.content.map(c => typeof c === "string" ? c : (typeof c === "object" && "text" in c ? c.text : "")).join("")
            : (typeof response2.content === "string"
                ? response2.content
                : (response2.content && typeof response2.content === "object" && "text" in response2.content
                    ? (response2.content as { text: string }).text
                    : ""));
          const fantasyStory = JSON.parse(contentStr);
          sendResponse(fantasyStory);
          // Tutaj użyj OpenAI do wygenerowania obrazu na podstawie fantasyStory.image_prompt
          // const openai = new OpenAI({
          //   apiKey: import.meta.env.API_KEY,
          // });

          // const response = await openai.images.generate({
          //   model: "dall-e-3", // lub "dall-e-2"
          //   prompt: message.prompt,
          //   n: 1,
          //   size: "1024x1024", // "256x256", "512x512", "1024x1024"
          //   quality: "standard", // "standard" lub "hd" (tylko dla dall-e-3)
          //   style: "vivid" // "vivid" lub "natural" (tylko dla dall-e-3)
          // });

          // if (response.data && response.data.length > 0) {
          //   sendResponse({
          //     success: true,
          //     imageUrl: response.data[0].url,
          //     revisedPrompt: response.data[0].revised_prompt
          //   });
          // } else {
          //   sendResponse({
          //     success: false,
          //     error: "Brak danych obrazu w odpowiedzi."
          //   });
          // }
          } catch (error) {
          console.error('Błąd generowania obrazu:', error);
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : 'Nieznany błąd'
          });
        }
      })();
      
      return true;
    }
  });
});



