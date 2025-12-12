// =========================
// Exploring Planet Aurora
// =========================

let playerName = "", playerAvatar = "", currentDay = 1, currentHour = 6, currentMinute = 0;
let gameInterval = null, statusInterval = null;

const playerStatus = { hunger: 50, sleep: 50, hygiene: 50, happiness: 50, money: 100 };

// === Avatar List ===
const availableAvatars = [
  "images/avatar1.png",
  "images/avatar2.png",
  "images/avatar3.png",
  "images/avatar4.png"
];
let currentAvatarIndex = 0;

// Map state
let isInsideArea = false;
const WORLD_MAP_SRC = "images/WorldMap.png";

// inside-area player position (percent of map)
let insideX = 50;
let insideY = 50;

// world-map player position (percent of map)
let worldX = 20;
let worldY = 20;

// cached activity layout for current area
let currentAreaActivities = [];
let currentAreaExit = null;

// inside-area movement animation
let insideMoveRaf = null;


// === Location Data ===
const locations = {
  "Base": { name: "Base", coords: { top: "20%", left: "20%" }, up: null, down: "Lake", left: null, right: "Beach", activities: ["eat", "sleep", "clean", "work"] },
  "Beach": { name: "Beach", coords: { top: "20%", left: "80%" }, up: null, down: "Mountain", left: "Base", right: null, activities: ["explore", "swim", "buy_food", "buy_drink"] },
  "Temple": { name: "Temple", coords: { top: "50%", left: "50%" }, up: "Base", down: "Lake", left: "Lake", right: "Mountain", activities: ["pray", "meditate", "help_people"] },
  "Lake": { name: "Lake", coords: { top: "80%", left: "20%" }, up: "Base", down: null, left: null, right: "Temple", activities: ["fishing", "explore", "swim"] },
  "Mountain": { name: "Mountain", coords: { top: "80%", left: "80%" }, up: "Beach", down: null, left: "Temple", right: null, activities: ["climb", "explore", "meditate"] }
};
let currentLocation = "Base";

// === Activities ===
const activities = {
  "eat": { name: "Eat Meal", placeLabel: "Kitchen", cost: 0, effects: { hunger: +30, happiness: +5 }, info: "Replenish your hunger at the base." },
  "sleep": { name: "Rest", placeLabel: "Bedroom", cost: 0, effects: { sleep: +40, hunger: -5 }, info: "Take a rest to restore energy." },
  "clean": { name: "Take Shower", placeLabel: "Bathroom", cost: 0, effects: { hygiene: +50, happiness: +5 }, info: "Stay clean and fresh." },
  "work": { name: "Repair Equipment", placeLabel: "Workshop", cost: -20, effects: { hygiene: -15, sleep: -10, happiness: -5 }, info: "Fix your exploration tools." },
  "explore": { name: "Explore Area", cost: 0, effects: { happiness: +10, sleep: -10, hygiene: -10 }, info: "Discover new parts of the planet." },
  "swim": { name: "Swim", cost: 0, effects: { happiness: +15, hygiene: +5, sleep: -10 }, info: "Enjoy a swim in the blue water." },
  "pray": { name: "Pray", cost: 0, effects: { happiness: +15 }, info: "Meditate at the ancient temple." },
  "meditate": { name: "Meditate", cost: 0, effects: { happiness: +10, sleep: +5 }, info: "Find inner peace." },
  "help_people": { name: "Help Locals", cost: -30, effects: { happiness: +10, sleep: -10 }, info: "Assist villagers nearby." },
  "buy_food": { name: "Buy Food", cost: 20, effects: { hunger: +25, happiness: +5 }, info: "Enjoy local delicacies." },
  "buy_drink": { name: "Buy Drink", cost: 15, effects: { hunger: +5, happiness: +10 }, info: "Have a refreshing drink." },
  "climb": { name: "Climb Peak", cost: 0, effects: { happiness: +10, sleep: -20, hunger: -10 }, info: "Climb the mountain peak." },
  "fishing": { name: "Fishing", cost: 0, effects: { happiness: +10, hunger: +10 }, info: "Try your luck catching fish." }
};

// === DOM References ===
const avatarPreview = document.getElementById("avatar-preview");
const avatarIndex = document.getElementById("avatar-index");
const prevAvatar = document.getElementById("prev-avatar");
const nextAvatar = document.getElementById("next-avatar");
const playerNameInput = document.getElementById("player-name");
const startButton = document.getElementById("start-game-button");

const characterSelectionScreen = document.getElementById("character-selection-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");

const gameDayDisplay = document.getElementById("game-day");
const gameTimeDisplay = document.getElementById("game-time");
const greeting = document.getElementById("greeting");

const hungerBar = document.getElementById("hunger-bar");
const sleepBar = document.getElementById("sleep-bar");
const hygieneBar = document.getElementById("hygiene-bar");
const happinessBar = document.getElementById("happiness-bar");
const moneyDisplay = document.getElementById("money-display");

const mapArea = document.getElementById("map-area");
const mapBackgroundImg = document.getElementById("map-background-img");
const playerMapIconContainer = document.getElementById("player-map-icon-container");
const playerMapIconImg = document.getElementById("player-map-icon-img");
const insidePlayer = document.getElementById("inside-player");
const activityPopup = document.getElementById("activity-popup");

const moveButtons = document.querySelectorAll(".move-btn");
const activityButtonsContainer = document.getElementById("activity-buttons");
const gameOverReason = document.getElementById("game-over-reason");
const restartButton = document.getElementById("restart-game-button");

// === Utility Functions ===
function updateAvatarSelection() {
  playerAvatar = availableAvatars[currentAvatarIndex];
  avatarPreview.src = playerAvatar;
  avatarIndex.textContent = `${currentAvatarIndex + 1}/${availableAvatars.length}`;
  startButton.disabled = !playerNameInput.value.trim();
}

function updateProgressBar(element, value) {
  const percent = Math.max(0, Math.min(100, value));
  element.style.width = percent + "%";
  element.textContent = Math.round(percent) + "%";
  element.classList.remove("low", "medium");
  if (percent < 25) element.classList.add("low");
  else if (percent < 50) element.classList.add("medium");
}

function updateStatusBars() {
  updateProgressBar(hungerBar, playerStatus.hunger);
  updateProgressBar(sleepBar, playerStatus.sleep);
  updateProgressBar(hygieneBar, playerStatus.hygiene);
  updateProgressBar(happinessBar, playerStatus.happiness);
  moneyDisplay.textContent = playerStatus.money;
  checkGameOver();
}

function updateGreeting() {
  let text = "Welcome, Explorer!";
  if (currentHour >= 5 && currentHour < 12) text = `Good Morning, ${playerName}!`;
  else if (currentHour >= 12 && currentHour < 17) text = `Good Afternoon, ${playerName}!`;
  else if (currentHour >= 17 && currentHour < 21) text = `Good Evening, ${playerName}!`;
  else text = `Good Night, ${playerName}!`;
  greeting.textContent = text;
}

function degradeStatus() {
  playerStatus.hunger -= 1;
  playerStatus.sleep -= 0.5;
  playerStatus.hygiene -= 0.5;
  if (playerStatus.hunger < 30 || playerStatus.sleep < 30) playerStatus.happiness -= 1;
  else playerStatus.happiness -= 0.2;
  updateStatusBars();
}

function updateGameTime() {
  currentMinute += 10;
  if (currentMinute >= 60) { currentMinute = 0; currentHour++; }
  if (currentHour >= 24) { currentHour = 0; currentDay++; }
  gameDayDisplay.textContent = `DAY ${currentDay}`;
  gameTimeDisplay.textContent = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
  updateGreeting();
}

// === Activities ===
function updateActivities() {
  activityButtonsContainer.innerHTML = "";

  const btn = document.createElement("button");
  btn.className = "activity-btn mx-auto";
  btn.textContent = isInsideArea ? "Leave Area" : "Enter Area";
  btn.onclick = () => {
    if (isInsideArea) {
      leaveArea();
    } else {
      enterArea();
    }
  };

  activityButtonsContainer.appendChild(btn);
}

// === Area / World Map Switching ===

function getAreaLabelForLocation(locKey) {
  if (locKey === "Base") return "House";
  if (locKey === "Beach") return "Beach";
  if (locKey === "Temple") return "Temple";
  if (locKey === "Lake") return "Lake";
  if (locKey === "Mountain") return "Mountain";
  const loc = locations[locKey];
  return loc && loc.name ? loc.name : "Area";
}

function hideActivityPopup() {
  if (!activityPopup) return;
  activityPopup.classList.add("hidden");
  activityPopup.innerHTML = "";
}

function showActivityPopup(activity) {
  if (!activityPopup) return;

  activityPopup.innerHTML = `
    <button class="popup-btn">Do ${activity.name}</button>
  `;

  activityPopup.style.left = (insideX + 8) + "%";
  activityPopup.style.top = insideY + "%";
  activityPopup.classList.remove("hidden");

  const btn = activityPopup.querySelector("button");
  if (btn) {
    btn.onclick = () => {
      performActivity(activity.key);
      hideActivityPopup();
    };
  }
}

function showLeaveAreaPopup() {
  if (!activityPopup) return;
  // For Base, we treat it as "House" so the button reads naturally.
  const label = (currentLocation === "Base") ? "House" : getAreaLabelForLocation(currentLocation);

  activityPopup.innerHTML = `
    <button class="popup-btn">${currentLocation === "Base" ? "Exit House" : `Leave ${label}`}</button>
  `;

  activityPopup.style.left = (insideX + 8) + "%";
  activityPopup.style.top = insideY + "%";
  activityPopup.classList.remove("hidden");

  const btn = activityPopup.querySelector("button");
  if (btn) {
    btn.onclick = () => {
      leaveArea();
      hideActivityPopup();
    };
  }
}

function cancelInsideMove() {
  if (insideMoveRaf) {
    cancelAnimationFrame(insideMoveRaf);
    insideMoveRaf = null;
  }
}

// Instantly move the avatar inside an area (no animation).
// Useful for "door" / teleport-like targets.
function moveInsideInstantTo(targetX, targetY) {
  if (!isInsideArea) return;

  cancelInsideMove();
  hideActivityPopup();

  insideX = Math.max(5, Math.min(95, targetX));
  insideY = Math.max(5, Math.min(95, targetY));
  updateInsidePlayerPosition();

  // After arriving, decide whether to show any popup.
  checkActivityProximity();
}

function animateInsideMoveTo(targetX, targetY, durationMs = 450) {
  if (!isInsideArea) return;

  cancelInsideMove();
  hideActivityPopup();

  // clamp target
  const tx = Math.max(5, Math.min(95, targetX));
  const ty = Math.max(5, Math.min(95, targetY));

  const startX = insideX;
  const startY = insideY;
  const startT = performance.now();

  const step = (now) => {
    const t = Math.min(1, (now - startT) / durationMs);

    // easeInOut (smooth like the world-map transition)
    const eased = t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;

    insideX = startX + (tx - startX) * eased;
    insideY = startY + (ty - startY) * eased;
    updateInsidePlayerPosition();

    if (t < 1) {
      insideMoveRaf = requestAnimationFrame(step);
    } else {
      insideMoveRaf = null;
      // after arriving, evaluate proximity to show the popup
      checkActivityProximity();
    }
  };

  insideMoveRaf = requestAnimationFrame(step);
}


// compute activity positions for the current area (no icons)
function renderAreaActivities() {
  // clear any existing map markers (world locations or previous area icons)
  const oldMarkers = mapArea.querySelectorAll(".map-location");
  oldMarkers.forEach(m => m.remove());

  currentAreaActivities = [];
  currentAreaExit = null;
  const loc = locations[currentLocation];
  if (!loc || !loc.activities) return;

  const acts = loc.activities;
  const positions = [
    { top: 40, left: 30 },
    { top: 40, left: 70 },
    { top: 70, left: 30 },
    { top: 70, left: 70 }
  ];

  acts.forEach((key, index) => {
    const act = activities[key];
    if (!act) return;

    // choose position slot for this activity
    const pos = positions[Math.min(index, positions.length - 1)];

    // record logical position for movement / popup detection
    currentAreaActivities.push({
      key,
      name: act.name,
      x: pos.left,
      y: pos.top
    });

    // create visible circular button on the map
    const marker = document.createElement("img");
    marker.classList.add("map-location", "area-activity");
    marker.alt = act.name;

    marker.style.top = pos.top + "%";
    marker.style.left = pos.left + "%";

    // use placeLabel on the circle (e.g. "Kitchen"), defaulting to activity name
    const circleLabel = act.placeLabel || act.name;
    const label = encodeURIComponent(circleLabel);
    marker.src = `https://placehold.co/80x80/2563eb/ffffff?text=${label}`;

    // Clicking the circle moves the avatar to that spot.
    // The activity only happens when the popup button is pressed.
    marker.addEventListener("click", () => {
      animateInsideMoveTo(pos.left, pos.top);
    });

    mapArea.appendChild(marker);
  });

  // --- Exit / Door ---
  // Base/Home gets a clickable "Door" circle in the middle of the house.
  // Other areas keep a generic (invisible) exit spot near the bottom center.
  if (currentLocation === "Base") {
    const doorPos = { top: 55, left: 50 };
    currentAreaExit = { x: doorPos.left, y: doorPos.top };

    const door = document.createElement("img");
    door.classList.add("map-location", "area-exit");
    door.alt = "Door";
    door.style.top = doorPos.top + "%";
    door.style.left = doorPos.left + "%";
    door.src = "https://placehold.co/80x80/111827/ffffff?text=Door";

    // Click-to-move instantly to the door
    door.addEventListener("click", () => {
      moveInsideInstantTo(doorPos.left, doorPos.top);
    });

    mapArea.appendChild(door);
  } else {
    // define a generic exit spot near bottom center for leave-area popup
    currentAreaExit = { x: 50, y: 90 };
  }
}

function updateInsidePlayerPosition() {
  if (!insidePlayer) return;

  // clamp within bounds
  insideX = Math.max(5, Math.min(95, insideX));
  insideY = Math.max(5, Math.min(95, insideY));

  insidePlayer.style.left = insideX + "%";
  insidePlayer.style.top = insideY + "%";
}


function getLocationCoords(locKey) {
  const loc = locations[locKey];
  if (!loc || !loc.coords) return null;
  const top = parseFloat(loc.coords.top);
  const left = parseFloat(loc.coords.left);
  return { top, left };
}

function syncWorldPositionToCurrentLocation() {
  const coords = getLocationCoords(currentLocation);
  if (coords) {
    worldY = coords.top;
    worldX = coords.left;
  }
}

function moveOnWorld(direction) {
  const step = 2;
  if (direction === "up") worldY -= step;
  else if (direction === "down") worldY += step;
  else if (direction === "left") worldX -= step;
  else if (direction === "right") worldX += step;

  updatePlayerMapPosition();
}

function showEnterLocationPopup(locationKey) {
  if (!activityPopup) return;
  const loc = locations[locationKey];
  if (!loc) return;

  const areaLabel = getAreaLabelForLocation(locationKey);
  activityPopup.innerHTML = `
    <button class="popup-btn">Enter ${areaLabel}</button>
  `;

  activityPopup.style.left = (worldX + 8) + "%";
  activityPopup.style.top = worldY + "%";
  activityPopup.classList.remove("hidden");

  const btn = activityPopup.querySelector("button");
  if (btn) {
    btn.onclick = () => {
      currentLocation = locationKey;
      enterArea();
    };
  }
}

function checkWorldProximity() {
  if (isInsideArea) return;

  hideActivityPopup();

  let nearestKey = null;
  let nearestDist = Infinity;

  for (const locKey in locations) {
    const coords = getLocationCoords(locKey);
    if (!coords) continue;
    const dx = worldX - coords.left;
    const dy = worldY - coords.top;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestKey = locKey;
    }
  }

  if (nearestKey && nearestDist < 8) {
    currentLocation = nearestKey;
    showEnterLocationPopup(nearestKey);
  }
}

function checkActivityProximity() {
  if (!isInsideArea) return;
  hideActivityPopup();

  let found = false;
  for (const act of currentAreaActivities) {
    const dx = insideX - act.x;
    const dy = insideY - act.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10) { // within 10% radius
      showActivityPopup(act);
      found = true;
      break;
    }
  }

  if (found) return;

  // if close to exit spot, show leave-area popup
  if (currentAreaExit) {
    const dx = insideX - currentAreaExit.x;
    const dy = insideY - currentAreaExit.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10) {
      showLeaveAreaPopup();
    }
  }
}

function moveInside(direction) {
  // if the player uses manual movement, stop any click-to-move animation
  cancelInsideMove();

  const step = 2;
  if (direction === "up") insideY -= step;
  else if (direction === "down") insideY += step;
  else if (direction === "left") insideX -= step;
  else if (direction === "right") insideX += step;

  updateInsidePlayerPosition();
  checkActivityProximity();
}

function showWorldMap() {
  cancelInsideMove();
  isInsideArea = false;
  mapBackgroundImg.src = WORLD_MAP_SRC;

  // hide inside player & popup
  if (insidePlayer) {
    insidePlayer.classList.add("hidden");
  }
  hideActivityPopup();

  // recreate world markers and player icon
  createMapMarkers();
  syncWorldPositionToCurrentLocation();
  updatePlayerMapPosition();
  playerMapIconContainer.style.display = "flex";

  // navigation is available on world map
  moveButtons.forEach(btn => btn.disabled = false);

  updateActivities();
}

function enterArea() {
  if (isInsideArea) return;
  isInsideArea = true;

  cancelInsideMove();

  // choose background based on location
  let bgSrc = WORLD_MAP_SRC;
  if (currentLocation === "Base") bgSrc = "images/home.png";
  else if (currentLocation === "Beach") bgSrc = "images/beach.png";
  else if (currentLocation === "Temple") bgSrc = "images/temple.png";
  else if (currentLocation === "Lake") bgSrc = "images/lake.png";
  else if (currentLocation === "Mountain") bgSrc = "images/mountain.png";

  mapBackgroundImg.src = bgSrc;

  // hide world player icon
  playerMapIconContainer.style.display = "none";

  // reset inside position and show avatar
  // (For Base/Home we start away from the door so it won't instantly trigger exit popup)
  if (currentLocation === "Base") {
    insideX = 50;
    insideY = 75;
  } else {
    insideX = 50;
    insideY = 50;
  }
  if (insidePlayer) {
    insidePlayer.src = playerAvatar;
    insidePlayer.classList.remove("hidden");
  }
  updateInsidePlayerPosition();

  renderAreaActivities();
  hideActivityPopup();
  updateActivities();
}

function leaveArea() {
  showWorldMap();
}

function performActivity(key) {
  const act = activities[key];
  if (act.cost > 0 && playerStatus.money < act.cost) return;
  playerStatus.money -= act.cost;
  for (const stat in act.effects) {
    playerStatus[stat] = Math.max(0, Math.min(100, playerStatus[stat] + act.effects[stat]));
  }
  updateStatusBars();
}

// === MAP SYSTEM ===
function createMapMarkers() {
  const oldMarkers = mapArea.querySelectorAll('.map-location');
  oldMarkers.forEach(m => m.remove());

  for (const locationKey in locations) {
    const locationData = locations[locationKey];
    if (!locationData.coords) continue;

    const marker = document.createElement('img');
    marker.classList.add('map-location');
    marker.id = `map-loc-${locationKey.toLowerCase()}`;
    marker.style.top = locationData.coords.top;
    marker.style.left = locationData.coords.left;
    marker.alt = locationData.name;

    // small logo markers
    let markerSrc = `https://placehold.co/40x40/999/FFF?text=${locationKey}`;
    if (locationKey === 'Base') markerSrc = 'images/home.png';
    else if (locationKey === 'Beach') markerSrc = 'images/beach.png';
    else if (locationKey === 'Temple') markerSrc = 'images/temple.png';
    else if (locationKey === 'Lake') markerSrc = 'images/lake.png';
    else if (locationKey === 'Mountain') markerSrc = 'images/mountain.png';
    marker.src = markerSrc;

    // klik marker untuk teleport dan sinkronkan posisi dunia
    marker.addEventListener('click', () => {
      currentLocation = locationKey;
      syncWorldPositionToCurrentLocation();
      updatePlayerMapPosition();
      updateActivities();
      updateStatusBars();
    });

    mapArea.appendChild(marker);
  }

  // tampilkan ikon pemain di atas semua marker
  mapArea.appendChild(playerMapIconContainer);
}

function updatePlayerMapPosition() {
  // if world position is not yet initialized, sync to current location
  if (!Number.isFinite(worldX) || !Number.isFinite(worldY)) {
    syncWorldPositionToCurrentLocation();
  }

  // clamp within bounds
  worldX = Math.max(5, Math.min(95, worldX));
  worldY = Math.max(5, Math.min(95, worldY));

  playerMapIconContainer.style.top = worldY + "%";
  playerMapIconContainer.style.left = worldX + "%";
  playerMapIconContainer.style.display = "flex";

  checkWorldProximity();
}

// === Movement ===

function movePlayer(direction) {
  // when inside an area, move the avatar within the interior map
  if (isInsideArea) {
    moveInside(direction);
    return;
  }

  // free movement on the world map
  moveOnWorld(direction);
  playerMapIconContainer.classList.add("shake");
  setTimeout(() => playerMapIconContainer.classList.remove("shake"), 300);
}

// === Game State ===
function checkGameOver() {
  let reason = "";
  if (playerStatus.hunger <= 0) reason = "starvation";
  else if (playerStatus.sleep <= 0) reason = "exhaustion";
  else if (playerStatus.hygiene <= 0) reason = "infection";
  else if (playerStatus.happiness <= 0) reason = "despair";
  if (reason) endGame(reason);
}

function endGame(reason) {
  clearInterval(gameInterval);
  clearInterval(statusInterval);
  gameOverReason.textContent = `You fainted from ${reason}. You survived ${currentDay} days.`;
  gameScreen.classList.add("hidden");
  gameOverScreen.classList.remove("hidden");
}

function startGame() {
  playerName = playerNameInput.value.trim();
  if (!playerName) return alert("Please enter your name first!");
  characterSelectionScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  playerMapIconImg.src = playerAvatar;

  // start on world map view
  showWorldMap();

  updateStatusBars();
  updateGreeting();

  gameInterval = setInterval(updateGameTime, 1000);
  statusInterval = setInterval(degradeStatus, 3000);
}

function restartGame() {
  clearInterval(gameInterval);
  clearInterval(statusInterval);
  Object.assign(playerStatus, { hunger: 50, sleep: 50, hygiene: 50, happiness: 50, money: 100 });
  currentDay = 1; currentHour = 6; currentMinute = 0; currentLocation = "Base";
  gameOverScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  characterSelectionScreen.classList.remove("hidden");
  playerNameInput.value = "";
  currentAvatarIndex = 0;
  updateAvatarSelection();
}

// === Event Listeners ===
prevAvatar.addEventListener("click", () => {
  currentAvatarIndex = (currentAvatarIndex - 1 + availableAvatars.length) % availableAvatars.length;
  updateAvatarSelection();
});
nextAvatar.addEventListener("click", () => {
  currentAvatarIndex = (currentAvatarIndex + 1) % availableAvatars.length;
  updateAvatarSelection();
});
playerNameInput.addEventListener("input", () => startButton.disabled = !playerNameInput.value.trim());
startButton.addEventListener("click", startGame);
moveButtons.forEach(btn => btn.addEventListener("click", () => movePlayer(btn.id.split("-")[1])));

document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (key === "ArrowUp") {
    movePlayer("up");
  } else if (key === "ArrowDown") {
    movePlayer("down");
  } else if (key === "ArrowLeft") {
    movePlayer("left");
  } else if (key === "ArrowRight") {
    movePlayer("right");
  }
});

restartButton.addEventListener("click", restartGame);

// === Initialize App ===
updateAvatarSelection();
playerMapIconContainer.style.display = "none";
