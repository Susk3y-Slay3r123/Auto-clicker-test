// Enhanced autoclicker with overlay functionality
let isActive = false;
let position = null;
let cps = 220;
let timeLimit = 0;
let timerStart = 0;
let clickCount = 0;
let lastTime = performance.now();
let clickElement = null;
let updateInterval = null;
let clickers = [];
let overlay = null;

// Create overlay UI
function createOverlay() {
  if (overlay) return;
  
  overlay = document.createElement('div');
  overlay.id = 'ac-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999999;
    background: white;
    border: 1px solid #ccc;
    border-radius: 16px;
    padding: 16px;
    width: 240px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    font-family: Arial;
  `;
  
  overlay.innerHTML = `
    <strong>Overlay Autoclicker</strong>
    <div style="display:flex;margin:6px 0">
      <input id="ac-time" type="number" placeholder="Time (seconds)" style="width:60%;padding:6px">
      <button id="ac-timer" style="width:38%;padding:6px">Set Timer</button>
    </div>
    <button id="ac-cancel" style="width:100%;margin:6px 0;padding:8px;background:#ff5555;color:white">Cancel Timer</button>
    <div style="display:flex;margin:6px 0">
      <input id="ac-cps" type="number" placeholder="CPS (220)" value="220" style="width:60%;padding:6px">
      <button id="ac-setcps" style="width:38%;padding:6px">Set</button>
    </div>
    <button id="ac-set" style="width:100%;margin:6px 0;padding:8px">Set Click Spot</button>
    <button id="ac-toggle" style="width:100%;margin:6px 0;padding:8px">Start</button>
    <div id="ac-status">No spot selected</div>
  `;
  
  document.body.appendChild(overlay);
  
  // Set up event listeners
  document.getElementById('ac-toggle').addEventListener('click', toggleClicking);
  document.getElementById('ac-set').addEventListener('click', setClickSpot);
  document.getElementById('ac-setcps').addEventListener('click', () => {
    const newCps = parseInt(document.getElementById('ac-cps').value) || 220;
    setCPS(newCps);
  });
  document.getElementById('ac-timer').addEventListener('click', () => {
    const timeValue = parseFloat(document.getElementById('ac-time').value) || 0;
    setTimer(timeValue);
  });
  document.getElementById('ac-cancel').addEventListener('click', cancelTimer);
}

// Set click position
function setClickSpot() {
  document.body.style.cursor = 'crosshair';
  updateStatus('Click to set spot');
  
  const handleClick = (e) => {
    if (e.target.closest('#ac-overlay')) return;
    
    position = { x: e.clientX, y: e.clientY };
    document.body.style.cursor = 'default';
    document.removeEventListener('click', handleClick, true);
    updateStatus(`Spot: ${position.x}, ${position.y} | CPS: 0`);
  };
  
  document.addEventListener('click', handleClick, true);
}

// Toggle clicking on/off
function toggleClicking() {
  if (!position) {
    updateStatus('No spot selected');
    return;
  }
  
  isActive = !isActive;
  document.getElementById('ac-toggle').textContent = isActive ? 'Stop' : 'Start';
  
  if (isActive) {
    startClicking();
  } else {
    stopClicking();
  }
}

// Start the clicking process
function startClicking() {
  clickCount = 0;
  lastTime = performance.now();
  
  if (timeLimit > 0) {
    timerStart = performance.now();
  }
  
  updateInterval = setInterval(updateStatus, 1000);
  
  // Create multiple clickers for higher CPS
  for (let i = 0; i < 22; i++) {
    clickers.push(setTimeout(performClick, i * (1000 / cps / 22)));
  }
  
  clickers.push(setInterval(performClick, 1000 / cps));
}

// Stop the clicking process
function stopClicking() {
  clearInterval(updateInterval);
  clickers.forEach(clearInterval);
  clickers.forEach(clearTimeout);
  clickers = [];
  clickElement = null;
}

// Perform a click at the specified position
function performClick() {
  if (!isActive) return;
  
  try {
    if (!clickElement) clickElement = document.elementFromPoint(position.x, position.y);
    
    if (clickElement) {
      const events = ['mousedown', 'mouseup', 'click'];
      events.forEach(eventType => {
        clickElement.dispatchEvent(new MouseEvent(eventType, {
          bubbles: true,
          cancelable: true,
          view: window
        }));
      });
      clickCount++;
    }
  } catch (e) {
    // Ignore errors
  }
}

// Update status display
function updateStatus(customText = null) {
  const statusEl = document.getElementById('ac-status');
  if (!statusEl) return;
  
  if (customText) {
    statusEl.textContent = customText;
    return;
  }
  
  const now = performance.now();
  const elapsed = (now - lastTime) / 1000;
  const currentCPS = clickCount / elapsed;
  
  if (timeLimit > 0 && timerStart > 0
