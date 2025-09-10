export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ustaw') {
      (async()=>{
        sendResponse(message.tekst+"Kaczka");
      })();
    }
    return true; 
  });
});
