document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle');
  const cpsInput = document.getElementById('cps');
  const setCps = document.getElementById('setcps');
  const timerInput = document.getElementById('timer');
  const setTimer = document.getElementById('settimer');
  const cancel = document.getElementById('cancel');
  const status = document.getElementById('status');

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    toggle.addEventListener('click', () => {
      chrome.tabs.sendMessage(tabId, { action: 'toggle' });
    });

    setCps.addEventListener('click', () => {
      const cps = parseInt(cpsInput.value) || 220;
      chrome.tabs.sendMessage(tabId, { action: 'setCps', value: cps });
    });

    setTimer.addEventListener('click', () => {
      const timer = parseFloat(timerInput.value) || 0;
      chrome.tabs.sendMessage(tabId, { action: 'setTimer', value: timer });
    });

    cancel.addEventListener('click', () => {
      chrome.tabs.sendMessage(tabId, { action: 'cancelTimer' });
    });

    // Listen for status updates
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'statusUpdate') {
        status.textContent = message.status;
      }
    });
  });
});
