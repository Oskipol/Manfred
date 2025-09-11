export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ustaw') {
      (async () => {
        sendResponse(message.tekst);
      })();
    }

    if (message.type === "openPopup") {
      chrome.action.openPopup();
      chrome.runtime.sendMessage({ type: "popupAction", action: message.action });
    }

    return true; 
  });
});