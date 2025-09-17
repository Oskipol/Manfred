import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";


export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ustaw') {
      (async () => {
        try {
          const model = new ChatOpenAI({
            model: "gpt-4o-mini", 
            apiKey: import.meta.env.API_KEY,
          });

          const chatPrompt = ChatPromptTemplate.fromMessages([
            ["system", "You are a helpful assistant that summarizes websites."],
            [
              "user", 
              "Summarize the page in less than 700 characters. This should be a continuous text. Highlight the most important information. website: {website}"
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



