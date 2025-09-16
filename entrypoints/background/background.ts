import { proccessPage } from "./pageProcess";
import { summarizeWeb } from "./simpleChat";


export default defineBackground(() => {
  let currentRetriever: any = null;
  let currentUrl: any = null;
  let currentSummary: any = null;

  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if(message.type === 'currentUrl') {
      currentUrl = message.url
      currentRetriever = await proccessPage(currentUrl)
    }

    if (message.type === "openPopup") {
      chrome.action.openPopup();
    }

    if(message.type === 'ustaw') {
      (async () => {
        currentSummary = await summarizeWeb(currentRetriever);
        sendResponse(currentSummary)
      })
      
      return true;
    }

    return true; 
  });
});