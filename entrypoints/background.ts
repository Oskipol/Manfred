import { rag } from "./backgroundAI/rag";


export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ustaw') {
      (async () => {
        try {
          const tabs = await chrome.tabs.query({active: true, currentWindow: true})
          const currentUrl = tabs[0]?.url
          console.log('powinno generowac')
          if(!currentUrl) {
            throw new Error('Nie można pobrać url')
          }
          const answer = await rag(currentUrl)
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



