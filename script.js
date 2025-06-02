document.addEventListener("DOMContentLoaded", () => {

  // Timer and cat spawn variables
  let startTime = 0;
  let elapsedTime = 0;
  let timerInterval = null;
  let lastCatSpawn = 0;
  let isRunning = false;

  // Grabbing relevant DOM elements
  const clock = document.getElementById("clock");
  const toggleBtn = document.getElementById("toggleBtn");
  const restartBtn = document.getElementById("restartBtn");
  const intervalInput = document.getElementById("intervalInput");
  const intervalUnit = document.getElementById("intervalUnit");
  const catContainer = document.getElementById("catContainer");

  // jQuery UI draggable (not used yet)
  $(function () {
    $(".draggable").draggable();
  });

  // Convert ms to hh:mm:ss
  function timeToString(time) {
    const hrs = Math.floor(time / 3600000);
    const mins = Math.floor((time % 3600000) / 60000);
    const secs = Math.floor((time % 60000) / 1000);

    return (
      String(hrs).padStart(2, '0') + ':' +
      String(mins).padStart(2, '0') + ':' +
      String(secs).padStart(2, '0')
    );
  }

  // Update the visible timer
  function print(txt) {
    clock.textContent = txt;
  }

  // Creates and randomly places a cat image inside the container
  function spawnCat() {
    const catImg = document.createElement("img");
    catImg.src = "images/cat.png";
    catImg.alt = "Cute cat";
    catImg.classList.add("cat");

    const containerRect = catContainer.getBoundingClientRect();
    const maxX = containerRect.width - 50;
    const maxY = containerRect.height - 50;

    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    catImg.style.position = "absolute";
    catImg.style.left = `${randomX}px`;
    catImg.style.top = `${randomY}px`;

    catContainer.appendChild(catImg);
  }

  // Reads and converts the interval input into ms
  function getSpawnInterval() {
    const value = parseInt(intervalInput.value, 10);
    const unit = intervalUnit.value;

    if (isNaN(value) || value <= 0) {
      alert("Please enter a valid spawn interval (number greater than 0).");
      throw new Error("Invalid spawn interval");
    }

    return unit === "minutes" ? value * 60000 : value * 1000;
  }

  // Starts the timer and handles spawning logic
  function startTimer() {
    startTime = Date.now() - elapsedTime;
    lastCatSpawn = elapsedTime;

    timerInterval = setInterval(() => {
      elapsedTime = Date.now() - startTime;
      print(timeToString(elapsedTime));

      let interval;
      try {
        interval = getSpawnInterval(); // Validate + get interval
      } catch {
        toggleTimer(false); // Stop timer if invalid input
        return;
      }

      // Time to spawn one or more cats
      if (elapsedTime - lastCatSpawn >= interval) {
        const intervalsPassed = Math.floor((elapsedTime - lastCatSpawn) / interval);
        lastCatSpawn += intervalsPassed * interval;
        for (let i = 0; i < intervalsPassed; i++) {
          spawnCat();
        }
      }
    }, 1000);
  }

  // Stops the timer
  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Toggles between play/pause; can force state
  function toggleTimer(forceState) {
    isRunning = typeof forceState === "boolean" ? forceState : !isRunning;

    if (isRunning) {
      startTimer();
      toggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      toggleBtn.setAttribute("aria-label", "Pause Timer");
    } else {
      stopTimer();
      toggleBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      toggleBtn.setAttribute("aria-label", "Start Timer");
    }
  }

  // Reset everything to initial state
  function restart() {
    stopTimer();
    elapsedTime = 0;
    lastCatSpawn = 0;
    print("00:00:00");
    catContainer.innerHTML = ""; // Clear cats
    toggleTimer(false); // Make sure it's not running
  }

  // Start or pause when toggle button is clicked
  toggleBtn.addEventListener("click", () => {
    if (!isRunning) {
      try {
        getSpawnInterval(); // Prevent starting if input is bad
      } catch {
        return;
      }
    }
    toggleTimer();
  });

  // Settings modal logic
  const openSettingsBtn = document.getElementById("openSettingsBtn");
  const closeSettingsBtn = document.getElementById("closeSettingsBtn");
  const settingsModal = document.getElementById("settingsModal"); 

  openSettingsBtn.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
  });

  closeSettingsBtn.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  });

  restartBtn.addEventListener("click", restart);

  // Show 00:00:00 when page loads
  print("00:00:00");
});
