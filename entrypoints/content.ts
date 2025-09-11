export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    let lastSelection = '';
    let icon: HTMLElement | null = null;

    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() !== '') {
        lastSelection = selection.toString();
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        showIcon(rect);
      } else {
        lastSelection = '';
        removeIcon();
      }
    });

    document.addEventListener('mousedown', (event) => {
      if (icon && event.target === icon) {
        event.preventDefault();
        event.stopPropagation();
      }
    });

    document.addEventListener('click', (event) => {
      if (icon && event.target === icon) return;
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === '') {
        lastSelection = '';
        removeIcon();
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

    function showIcon(rect: DOMRect) {
      if (!icon) {
        icon = document.createElement('div');
        icon.innerHTML = '💡';
        icon.style.position = 'absolute';
        icon.style.left = `${rect.right + window.scrollX + 5}px`;
        icon.style.top = `${rect.top + window.scrollY}px`;
        icon.style.fontSize = '24px';
        icon.style.cursor = 'pointer';
        icon.style.zIndex = '9999';
        icon.style.background = 'white';
        icon.style.borderRadius = '50%';
        icon.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        icon.style.pointerEvents = 'auto';

        document.body.appendChild(icon);

        icon.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });

        icon.addEventListener('click', () => {
          chrome.runtime.sendMessage({ type: "openPopup", action: "tekscik2" });
          removeIcon();
        });
      } else {
        icon.style.left = `${rect.right + window.scrollX + 5}px`;
        icon.style.top = `${rect.top + window.scrollY}px`;
      }
    }

    function removeIcon() {
      if (icon) {
        document.body.removeChild(icon);
        icon = null;
      }
    }
  }
});