const bufferContainer = document.getElementById("bufferContainer");
const numInput = document.getElementById("numInput");
const totalItemsInput = document.getElementById("totalItems");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const stateDisplay = document.getElementById("stateDisplay");
const mutexVal = document.getElementById("mutexVal");
const emptyVal = document.getElementById("emptyVal");
const fullVal = document.getElementById("fullVal");
const producedCountDisplay = document.getElementById("producedCount");
const consumedCountDisplay = document.getElementById("consumedCount");

let bufferSize = 0;
let totalItems = 0;
let producedCount = 0;
let consumedCount = 0;
let currentItem = 1;
let totalItemsToConsume = 0;

let mutex = 1, empty = 0, full = 0;
let running = false;

function updateSemaphoreDisplay() {
  mutexVal.innerText = mutex;
  emptyVal.innerText = empty;
  fullVal.innerText = full;
  producedCountDisplay.innerText = producedCount;
  consumedCountDisplay.innerText = consumedCount;
}

function wait(val) {
  return val - 1;
}

function signal(val) {
  return val + 1;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function producer() {
  while (producedCount < totalItems && running) {
    if (!running) {
      stateDisplay.innerText = "Simulation manually stopped.";
      return;
    }

    console.log(`Produced: ${producedCount} / ${totalItems}, Buffer full: ${full}, Empty: ${empty}`);

    if (full === bufferSize) {
      stateDisplay.innerText = "Buffer is full.";
      await sleep(1000);
      if (!running) return;

      if (consumedCount === totalItemsToConsume && producedCount < totalItems) {
        const remaining = totalItems - producedCount;
        stateDisplay.innerText = `Buffer is full. Remaining items to produce: ${remaining}`;
        await sleep(1000);
        if (!running) return;
        alert(`Buffer is full. Simulation stopped.\nRemaining items to produce: ${remaining}`);
        return;
      }
      continue;
    }

    if (empty > 0 && mutex === 1) {
      chefAnimation.goToAndPlay(0, true);
      mutex = wait(mutex);
      const slots = document.querySelectorAll(".buffer-item");
      for (let i = 0; i < slots.length; i++) {
        if (!slots[i].classList.contains("produced")) {
          slots[i].classList.add("produced");
          slots[i].innerHTML = `🍣<br>Item ${currentItem}`;
          stateDisplay.innerText = `Produced 👨🏻‍🍳🍣 Item ${currentItem}`;
          currentItem++;
          producedCount++;
          break;
        }
      }
      empty = wait(empty);
      full = signal(full);
      mutex = signal(mutex);
      updateSemaphoreDisplay();
      setTimeout(() => chefAnimation.stop(), 1000);
    }

    await sleep(1000);
    if (!running) return;
  }

  if (producedCount < totalItems) {
    const remaining = totalItems - producedCount;
    stateDisplay.innerText = `Buffer is full. Remaining items to produce: ${remaining}`;
  }
}

async function consumer() {
  while (consumedCount < totalItemsToConsume && running) {
    if (!running) {
      stateDisplay.innerText = "Simulation manually stopped.";
      return;
    }

    console.log(`Consumed: ${consumedCount} / ${totalItemsToConsume}, Buffer full: ${full}, Empty: ${empty}`);

    if (full === 0) {
      stateDisplay.innerText = "Buffer is empty.";
      await sleep(1000);
      if (!running) return;

      if (producedCount === totalItems && consumedCount < totalItemsToConsume) {
        const remaining = totalItemsToConsume - consumedCount;
        stateDisplay.innerText = `Buffer is empty. Remaining items to consume: ${remaining}`;
        await sleep(1000);
        if (!running) return;
        alert(`Buffer is empty. Simulation stopped.\nRemaining items to consume: ${remaining}`);
        return;
      }
      continue;
    }

    if (full > 0 && mutex === 1) {
      customerAnim.goToAndPlay(0, true);
      document.getElementById('customer-animation').classList.add('customer-active');
      mutex = wait(mutex);
      const slots = document.querySelectorAll(".buffer-item");
      for (let i = slots.length - 1; i >= 0; i--) {
        if (slots[i].classList.contains("produced")) {
          const item = slots[i].innerText.split('\n')[1];
          slots[i].classList.remove("produced");
          slots[i].innerHTML = "";
          stateDisplay.innerText = `Consumed 🍣 ${item}`;
          consumedCount++;
          break;
        }
      }
      full = wait(full);
      empty = signal(empty);
      mutex = signal(mutex);
      updateSemaphoreDisplay();
      setTimeout(() => {
        customerAnim.stop();
        document.getElementById('customer-animation').classList.remove('customer-active');
      }, 800);
    }

    await sleep(1200);
    if (!running) return;

    if (consumedCount < totalItemsToConsume) {
      const remaining = totalItemsToConsume - consumedCount;
      stateDisplay.innerText = `Remaining items to consume: ${remaining}`;
    }
  }

  if (consumedCount < totalItemsToConsume) {
    const remaining = totalItemsToConsume - consumedCount;
    stateDisplay.innerText = `Buffer is empty. Remaining items to consume: ${remaining}`;
  }

  if (producedCount === totalItems && consumedCount === totalItemsToConsume) {
    running = false;
    stateDisplay.innerText = "Simulation complete. All items produced and consumed.";
  }
}

startBtn.addEventListener("click", () => {
  bufferSize = parseInt(numInput.value);
  totalItems = parseInt(totalItemsInput.value);
  totalItemsToConsume = parseInt(document.getElementById("consumeItems").value); // New line

  if (isNaN(bufferSize) || bufferSize <= 0 || isNaN(totalItems) || totalItems <= 0 || isNaN(totalItemsToConsume) || totalItemsToConsume <= 0) {
    alert("Please enter valid numbers for buffer size, total items to produce, and total items to consume.");
    return;
  }

  bufferContainer.innerHTML = "";
  for (let i = 0; i < bufferSize; i++) {
    const div = document.createElement("div");
    div.classList.add("buffer-item");
    bufferContainer.appendChild(div);
  }

  empty = bufferSize;
  full = 0;
  mutex = 1;
  running = true;
  producedCount = 0;
  consumedCount = 0;
  currentItem = 1;

  updateSemaphoreDisplay();
  stateDisplay.innerText = "Simulation started!";
  producer();
  consumer();
});

stopBtn.addEventListener("click", () => {
  running = false;
  stateDisplay.innerText = "Simulation manually stopped.";
});

// Add this with your other DOM elements
const chefAnimContainer = document.getElementById('chef-animation');

// Load the animation
const chefAnimation = lottie.loadAnimation({
  container: chefAnimContainer,
  renderer: 'svg',
  loop: false,
  autoplay: false,
  path: 'chef-animation.json' // Path to your .lottie file
});

// Add this with your other DOM elements
const custAnimContainer = document.getElementById('customer-animation');
// Initialize customer animation
const customerAnim = lottie.loadAnimation({
  container: document.getElementById('customer-animation'),
  renderer: 'svg',
  loop: false,
  autoplay: false,
  path: 'customer-animation.json'
});

// For animations with specific "working" segment
chefAnimation.playSegments([10, 30], true); // Play frames 10-30
// Set animation speed to match your delay
chefAnimation.setSpeed(productionDelay/1000); 
chefAnimation.addEventListener('complete', () => {
  chefAnimation.goToAndStop(0, true); // Reset to first frame
});
// Add this after loading your animation
chefAnimation.addEventListener('DOMLoaded', () => {
  // Adjust dynamically if needed
  const titleImg = document.querySelector('.title-image');
  chefAnimContainer.style.height = `${titleImg.clientHeight * 0.8}px`;
});

// In your producer function:
chefAnimContainer.classList.add('active');
setTimeout(() => {
  chefAnimContainer.classList.remove('active');
}, 1000); // Match animation duration


// Set animation duration to match consumption speed
//customerAnim.setSpeed(1.2); // 1.2x speed to match 1200ms delay

// Or play specific eating segment
customerAnim.playSegments([10, 25], true); // Play frames 10-25
// Add error listeners
customerAnim.addEventListener('DOMLoaded', () => {
  // Adjust dynamically if needed
  const titleImg = document.querySelector('.title-image');
  custAnimContainer.style.height = `${titleImg.clientHeight * 0.8}px`;
});

// In your producer function:
custAnimContainer.classList.add('active');
setTimeout(() => {
  custAnimContainer.classList.remove('active');
}, 1000); // Match animation duration


// Verify DOM element exists
if (!document.getElementById('customer-animation')) {
  console.error("Customer animation container not found!");
}

// Check file loading
fetch('customer-animation.json')
  .then(response => {
    if (!response.ok) console.error("JSON file not found (404)");
    else console.log("File found!");
  })
  .catch(err => console.error("Fetch error:", err));
