import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";


export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ustaw') {
      (async () => {
        try {
          const model = new ChatOpenAI({
            model: message.Mymodel || "gpt-4o-mini", 
            apiKey: import.meta.env.API_KEY,
            temperature: message.temperature || 0,
          });

          const chatPrompt = ChatPromptTemplate.fromMessages([
            ["system", message.systemPrompt || "You are a helpful assistant that summarizes websites."],
            [
              "user", 
              `${message.prompt}, website: {website}`
            ]
          ]);
          console.log(message.temperature);
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



