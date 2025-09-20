import { rag } from "./backgroundAI/rag";


export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ustaw') {
      (async () => {
        try {
          console.log('powinno generowac')
          const answer = await rag('sigma url trzeba przekazac ale nie wiem jak i zmienic ten hardcodowany w rag.ts')
          sendResponse({answer})
        } catch (error) {
          console.error('Błąd AI:', error);
          sendResponse(`Błąd: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
        }
      })();
      
      return true; 
    }
  });
});



