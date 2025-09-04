export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    let lastSelection = '';
    
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() !== '') {
        lastSelection = selection.toString();
      } else {
        lastSelection = '';
      }
    });

    document.addEventListener('click', () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === '') {
        lastSelection = '';
      }
    });
    
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'tekscik') {
        sendResponse(document.body.innerText);
      }
      if (message.type === 'tekscik2') {
        const currentSelection = window.getSelection()?.toString();
        sendResponse(currentSelection || lastSelection || "Nic nie zaznaczono");
      }
    });
   
  },
});
