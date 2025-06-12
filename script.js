document.addEventListener("DOMContentLoaded", () => {
  // Timer and state stuff
  let startTime = 0;
  let elapsedTime = 0;
  let timerInterval = null;
  let lastCatSpawn = 0;
  let isRunning = false;

  // Grab all the stuff I’ll be using
  const clock = document.getElementById("clock");
  const toggleBtn = document.getElementById("toggleBtn");
  const restartBtn = document.getElementById("restartBtn");
  const intervalInput = document.getElementById("intervalInput");
  const intervalUnit = document.getElementById("intervalUnit");
  const catContainer = document.getElementById("catContainer");
  const spawnSound = document.getElementById("meowSound");

  // Turns ms into hh:mm:ss format
  function timeToString(time) {
    const hrs = Math.floor(time / 3600000);
    const mins = Math.floor((time % 3600000) / 60000);
    const secs = Math.floor((time % 60000) / 1000);
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Update timer visually
  function print(txt) {
    clock.textContent = txt;
  }

  // Spawns a cat and makes sure it doesn't block UI stuff
  function spawnCat() {
    const catImg = document.createElement("img");
    catImg.src = "images/cat.png";
    catImg.alt = "Cute cat";
    catImg.classList.add("cat", "draggable", "ui-widget-content");

    // Make sure it doesn't overlap with timer or settings button
    const containerRect = catContainer.getBoundingClientRect();
    const timerRect = clock.getBoundingClientRect();
    const settingsRect = document.getElementById("openSettingsBtn").getBoundingClientRect();

    const maxX = containerRect.width - 50;
    const maxY = containerRect.height - 50;

    let randomX, randomY, overlap = true, attempts = 0;

    while (overlap && attempts < 100) {
      randomX = Math.random() * maxX;
      randomY = Math.random() * maxY;

      const catRect = {
        left: containerRect.left + randomX,
        right: containerRect.left + randomX + 50,
        top: containerRect.top + randomY,
        bottom: containerRect.top + randomY + 50,
      };

      const overlapsTimer = !(
        catRect.right < timerRect.left ||
        catRect.left > timerRect.right ||
        catRect.bottom < timerRect.top ||
        catRect.top > timerRect.bottom
      );

      const overlapsSettings = !(
        catRect.right < settingsRect.left ||
        catRect.left > settingsRect.right ||
        catRect.bottom < settingsRect.top ||
        catRect.top > settingsRect.bottom
      );

      overlap = overlapsTimer || overlapsSettings;
      attempts++;
    }

    // Place cat on screen
    catImg.style.left = `${randomX}px`;
    catImg.style.top = `${randomY}px`;
    catContainer.appendChild(catImg);

    // Make cat draggable and meow on drag start
    $(catImg).draggable({
      start: function () {
        if (catImg.movementInterval) clearInterval(catImg.movementInterval);
        catImg.src = "images/cat-drag.png";

        const meow = document.getElementById("meowSound");
        meow.currentTime = 0;
        meow.play().catch(err => {
          console.warn("Autoplay blocked:", err);
        });
      },
      stop: function () {
        moveCat(catImg);
      },
    });

    moveCat(catImg);
  }

  // Reads user input and converts it to ms
  function getSpawnInterval() {
    const value = parseInt(intervalInput.value, 10);
    const unit = intervalUnit.value;
    if (isNaN(value) || value <= 0) {
      alert("Please enter a valid spawn interval.");
      throw new Error("Invalid spawn interval");
    }
    return unit === "minutes" ? value * 60000 : value * 1000;
  }

  // Moves the cat around randomly and changes its image depending on direction
  function moveCat(catImg) {
    if (catImg.movementInterval) clearInterval(catImg.movementInterval);

    const horizontal = ["left", "right"];
    const vertical = ["up", "down"];
    let hDir = horizontal[Math.floor(Math.random() * 2)];
    let vDir = vertical[Math.floor(Math.random() * 2)];

    function updateDirection() {
      hDir = horizontal[Math.floor(Math.random() * 2)];
      vDir = vertical[Math.floor(Math.random() * 2)];
      const frontOrBack = vDir === "down" ? "front" : "back";
      catImg.src = `images/cat-${frontOrBack}-${hDir}.png`;
    }

    updateDirection();

    catImg.movementInterval = setInterval(() => {
      const step = 3;
      let left = parseFloat(catImg.style.left) || 0;
      let top = parseFloat(catImg.style.top) || 0;

      if (hDir === "left") left -= step;
      if (hDir === "right") left += step;
      if (vDir === "up") top -= step;
      if (vDir === "down") top += step;

      const maxX = catContainer.clientWidth - catImg.offsetWidth;
      const maxY = catContainer.clientHeight - catImg.offsetHeight;

      left = Math.max(0, Math.min(left, maxX));
      top = Math.max(0, Math.min(top, maxY));

      catImg.style.left = `${left}px`;
      catImg.style.top = `${top}px`;

      if (Math.random() < 0.02) updateDirection();
    }, 100);
  }

  // Starts the timer + cat spawning logic
  function startTimer() {
    startTime = Date.now() - elapsedTime;
    lastCatSpawn = elapsedTime;
    timerInterval = setInterval(() => {
      elapsedTime = Date.now() - startTime;
      print(timeToString(elapsedTime));
      let interval;
      try {
        interval = getSpawnInterval();
      } catch {
        toggleTimer(false);
        return;
      }
      if (elapsedTime - lastCatSpawn >= interval) {
        const intervalsPassed = Math.floor((elapsedTime - lastCatSpawn) / interval);
        lastCatSpawn += intervalsPassed * interval;
        for (let i = 0; i < intervalsPassed; i++) spawnCat();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Play/Pause toggle
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

  // Reset everything and clear cats
  function restart() {
    stopTimer();
    elapsedTime = 0;
    lastCatSpawn = 0;
    print("00:00:00");
    catContainer.innerHTML = "";
    toggleTimer(false);
  }

  // Button click events
  toggleBtn.addEventListener("click", () => {
    if (!isRunning) {
      try {
        getSpawnInterval();
      } catch {
        return;
      }
    }
    toggleTimer();
  });

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
  print("00:00:00"); // default time when page loads
});
