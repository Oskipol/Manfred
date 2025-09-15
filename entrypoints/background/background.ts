import { proccessPage } from "./pageProcess";
import { promptTemplate } from "./promptTemplate";
import { rag } from "./rag";
import { summarize } from "./summarize";

export default defineBackground(() => {
  let currentRetriever: any = null;
  let currentUrl: any = null;

  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if(message.type === 'currentUrl') {
      currentUrl = message.url
      currentRetriever = await proccessPage(currentUrl)
      sendResponse({success: true, message: "Retriever created"})
    }

    if (message.type === 'ustaw') {
      if (!currentRetriever) return sendResponse({ success: false, error: "No retriever ready" });
  
      const summary = await rag(currentUrl, 'Summarize this website in polish')
      console.log(summary)
      sendResponse({success: true, summary})
    }

    if (message.type === "openPopup") {
      chrome.action.openPopup();

    }

    return true; 
  });
});