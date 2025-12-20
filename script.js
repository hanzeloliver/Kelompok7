// =========================
// Exploring Planet Aurora
// =========================

let playerName = "", playerAvatar = "", currentDay = 1, currentHour = 6, currentMinute = 0;
let gameInterval = null, statusInterval = null;

// Activity state
let currentActivity = null;
let activityStartTime = 0;
let activityElapsedMinutes = 0;
let activityInterval = null;
let activityAnimationFrame = null;

const playerStatus = { hunger: 50, sleep: 50, hygiene: 50, happiness: 50, money: 100 };

// Life Satisfaction Score tracking
let lifeSatisfactionScore = 0;
const scoreTracking = {
  activitiesPerformed: {},
  itemsUsed: {},
  areasVisited: new Set(),
  statBalanceHistory: []
};

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
  "eat": { name: "Eat Meal", placeLabel: "Kitchen", cost: 0, duration: 0.5, effects: { hunger: +30, happiness: +5 }, info: "Replenish your hunger at the base." },
  "sleep": { name: "Rest", placeLabel: "Bedroom", cost: 0, duration: 1, effects: { sleep: +40, hunger: -5 }, info: "Take a rest to restore energy." },
  "clean": { name: "Take Shower", placeLabel: "Bathroom", cost: 0, duration: 0.33, effects: { hygiene: +50, happiness: +5 }, info: "Stay clean and fresh." },
  "work": { name: "Repair Equipment", placeLabel: "Workshop", cost: -20, duration: 1, effects: { hygiene: -15, sleep: -10, happiness: -5 }, info: "Fix your exploration tools." },
  "explore": { name: "Explore Area", cost: 0, duration: 1, effects: { happiness: +10, sleep: -10, hygiene: -10 }, info: "Discover new parts of the planet." },
  "swim": { name: "Swim", cost: 0, duration: 0.75, effects: { happiness: +15, hygiene: +5, sleep: -10 }, info: "Enjoy a swim in the blue water." },
  "pray": { name: "Pray", cost: 0, duration: 0.5, effects: { happiness: +15 }, info: "Meditate at the ancient temple." },
  "meditate": { name: "Meditate", cost: 0, duration: 0.67, effects: { happiness: +10, sleep: +5 }, info: "Find inner peace." },
  "help_people": { name: "Help Locals", cost: -30, duration: 1, effects: { happiness: +10, sleep: -10 }, info: "Assist villagers nearby." },
  "buy_food": { name: "Buy Food", cost: 20, duration: 0.25, effects: { hunger: +25, happiness: +5 }, info: "Enjoy local delicacies." },
  "buy_drink": { name: "Buy Drink", cost: 15, duration: 0.17, effects: { hunger: +5, happiness: +10 }, info: "Have a refreshing drink." },
  "climb": { name: "Climb Peak", cost: 0, duration: 1, effects: { happiness: +10, sleep: -20, hunger: -10 }, info: "Climb the mountain peak." },
  "fishing": { name: "Fishing", cost: 0, duration: 1, effects: { happiness: +10, hunger: +10 }, info: "Try your luck catching fish." }
};

// === Items Data ===
const items = {
  "health_potion": { 
    name: "Health Potion", 
    description: "Restores hunger by 20", 
    price: 50, 
    effects: { hunger: +20 }, 
    icon: "🧪",
    consumable: true 
  },
  "energy_drink": { 
    name: "Energy Drink", 
    description: "Restores sleep by 25", 
    price: 40, 
    effects: { sleep: +25 }, 
    icon: "⚡",
    consumable: true 
  },
  "soap": { 
    name: "Luxury Soap", 
    description: "Restores hygiene by 30", 
    price: 30, 
    effects: { hygiene: +30 }, 
    icon: "🧼",
    consumable: true 
  },
  "happiness_pill": { 
    name: "Joy Pill", 
    description: "Restores happiness by 25", 
    price: 60, 
    effects: { happiness: +25 }, 
    icon: "💊",
    consumable: true 
  },
  "fishing_rod": { 
    name: "Fishing Rod", 
    description: "Unlocks better fishing rewards", 
    price: 150, 
    effects: {}, 
    icon: "🎣",
    consumable: false,
    unlocks: "better_fishing" 
  },
  "climbing_gear": { 
    name: "Climbing Gear", 
    description: "Reduces energy cost when climbing", 
    price: 200, 
    effects: {}, 
    icon: "🧗",
    consumable: false,
    unlocks: "efficient_climbing" 
  },
  "meditation_mat": { 
    name: "Meditation Mat", 
    description: "Enhances meditation effectiveness", 
    price: 100, 
    effects: {}, 
    icon: "🧘",
    consumable: false,
    unlocks: "better_meditation" 
  },
  "snorkel": { 
    name: "Snorkel Set", 
    description: "Swim longer without losing energy", 
    price: 120, 
    effects: {}, 
    icon: "🤿",
    consumable: false,
    unlocks: "better_swimming" 
  }
};

const shopItems = {
  "Beach": ["health_potion", "energy_drink", "snorkel"],
  "Base": ["soap", "happiness_pill"],
  "Temple": ["meditation_mat", "happiness_pill"],
  "Mountain": ["climbing_gear", "energy_drink"],
  "Lake": ["fishing_rod", "health_potion"]
};

// Player inventory
let playerInventory = [];
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
    marker.addEventListener("click", () => {
      animateInsideMoveTo(pos.left, pos.top);
    });

    mapArea.appendChild(marker);
  });

  // --- Exit / Door ---
  if (currentLocation === "Base") {
    const doorPos = { top: 55, left: 50 };
    currentAreaExit = { x: doorPos.left, y: doorPos.top };

    const door = document.createElement("img");
    door.classList.add("map-location", "area-exit");
    door.alt = "Door";
    door.style.top = doorPos.top + "%";
    door.style.left = doorPos.left + "%";
    door.src = "https://placehold.co/80x80/111827/ffffff?text=Door";

    door.addEventListener("click", () => {
      moveInsideInstantTo(doorPos.left, doorPos.top);
    });

    mapArea.appendChild(door);
  } else {
    // FIXED: Add visible exit marker for other locations
    const exitPos = { top: 90, left: 50 };
    currentAreaExit = { x: exitPos.left, y: exitPos.top };

    const exitMarker = document.createElement("img");
    exitMarker.classList.add("map-location", "area-exit");
    exitMarker.alt = "Exit";
    exitMarker.style.top = exitPos.top + "%";
    exitMarker.style.left = exitPos.left + "%";
    exitMarker.src = "https://placehold.co/80x80/dc2626/ffffff?text=Exit";

    exitMarker.addEventListener("click", () => {
      animateInsideMoveTo(exitPos.left, exitPos.top);
    });

    mapArea.appendChild(exitMarker);
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
  const step = 3; // Changed from 2 to 3 (50% faster)
  if (direction === "up") worldY -= step;
  else if (direction === "down") worldY += step;
  else if (direction === "left") worldX -= step;
  else if (direction === "right") worldX += step;

  updatePlayerMapPosition();
}

function moveInside(direction) {
  // if the player uses manual movement, stop any click-to-move animation
  cancelInsideMove();

  const step = 3; // Changed from 2 to 3 (50% faster)
  if (direction === "up") insideY -= step;
  else if (direction === "down") insideY += step;
  else if (direction === "left") insideX -= step;
  else if (direction === "right") insideX += step;

  updateInsidePlayerPosition();
  checkActivityProximity();
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
  
  // Track area visited for score
  trackAreaVisited(currentLocation);
  
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
  if (!act) return;
  
  // Check if can afford
  if (act.cost > 0 && playerStatus.money < act.cost) {
    alert("Not enough money!");
    return;
  }
  
  // Check if already doing an activity
  if (currentActivity) {
    alert("You're already busy with another activity!");
    return;
  }
  
  // Apply item bonuses
  let modifiedAct = { ...act };
  
  // Fishing Rod bonus
  if (key === "fishing" && hasItem("fishing_rod")) {
    modifiedAct.effects = { ...modifiedAct.effects, happiness: (modifiedAct.effects.happiness || 0) + 5, hunger: (modifiedAct.effects.hunger || 0) + 10 };
  }
  
  // Climbing Gear bonus (reduces sleep loss)
  if (key === "climb" && hasItem("climbing_gear")) {
    modifiedAct.effects = { ...modifiedAct.effects, sleep: Math.max((modifiedAct.effects.sleep || 0) + 10, 0) };
  }
  
  // Meditation Mat bonus
  if (key === "meditate" && hasItem("meditation_mat")) {
    modifiedAct.effects = { ...modifiedAct.effects, happiness: (modifiedAct.effects.happiness || 0) + 5, sleep: (modifiedAct.effects.sleep || 0) + 5 };
  }
  
  // Snorkel bonus
  if (key === "swim" && hasItem("snorkel")) {
    modifiedAct.effects = { ...modifiedAct.effects, sleep: Math.max((modifiedAct.effects.sleep || 0) + 5, 0) };
  }
  
  // Start the activity
  startActivity(key, modifiedAct);
}

function startActivity(key, act) {
  currentActivity = {
    key: key,
    data: act,
    totalMinutes: act.duration,
    startX: insideX,
    startY: insideY
  };
  
  activityStartTime = Date.now();
  activityElapsedMinutes = 0;
  
  // Pay the cost immediately
  playerStatus.money -= act.cost;
  updateStatusBars();
  
  // Show activity UI
  showActivityUI();
  
  // Start gradual stat updates
  activityInterval = setInterval(updateActivityProgress, 100);
  
  // Start animation
  animateActivity();
}

function updateActivityProgress() {
  if (!currentActivity) return;
  
  const elapsed = Date.now() - activityStartTime;
  const totalDuration = currentActivity.totalMinutes * 60 * 1000; // convert minutes to ms
  const progress = Math.min(elapsed / totalDuration, 1);
  
  // Update elapsed minutes for time advancement
  activityElapsedMinutes = currentActivity.totalMinutes * progress;
  
  // Gradually apply effects
  for (const stat in currentActivity.data.effects) {
    const totalEffect = currentActivity.data.effects[stat];
    const currentValue = playerStatus[stat];
    const targetValue = Math.max(0, Math.min(100, currentValue + totalEffect * progress));
    
    // Smoothly interpolate
    playerStatus[stat] = currentValue + (targetValue - currentValue) * 0.1;
  }
  
  updateStatusBars();
  updateActivityUI(progress);
  
  // Check if complete
  if (progress >= 1) {
    completeActivity();
  }
}

function completeActivity() {
  if (!currentActivity) return;
  
  // Apply final stat values
  for (const stat in currentActivity.data.effects) {
    playerStatus[stat] = Math.max(0, Math.min(100, playerStatus[stat] + currentActivity.data.effects[stat]));
  }
  
  // Track activity for score
  trackActivity(currentActivity.key);

  // Advance time by activity duration
  advanceTime(currentActivity.totalMinutes);
  
  // Clean up
  clearInterval(activityInterval);
  cancelAnimationFrame(activityAnimationFrame);
  hideActivityUI();
  
  currentActivity = null;
  activityStartTime = 0;
  activityElapsedMinutes = 0;
  
  updateStatusBars();
}

function showActivityUI() {
  if (!currentActivity) return;
  
  const ui = document.createElement('div');
  ui.id = 'activity-ui';
  ui.className = 'activity-ui-container';
  ui.innerHTML = `
    <div class="activity-ui-content">
      <h3 class="activity-ui-title">${currentActivity.data.name}</h3>
      <div class="activity-ui-progress-container">
        <div id="activity-ui-progress-bar" class="activity-ui-progress-bar" style="width: 0%"></div>
      </div>
      <p class="activity-ui-time"><span id="activity-ui-time">0</span> / ${currentActivity.totalMinutes} min</p>
      <button id="fast-forward-btn" class="fast-forward-btn">⚡ Fast Forward</button>
    </div>
  `;
  
  document.body.appendChild(ui);
  
  document.getElementById('fast-forward-btn').addEventListener('click', fastForwardActivity);
}

function updateActivityUI(progress) {
  const progressBar = document.getElementById('activity-ui-progress-bar');
  const timeDisplay = document.getElementById('activity-ui-time');
  
  if (progressBar) {
    progressBar.style.width = (progress * 100) + '%';
  }
  
  if (timeDisplay) {
    timeDisplay.textContent = Math.floor(activityElapsedMinutes);
  }
}

function hideActivityUI() {
  const ui = document.getElementById('activity-ui');
  if (ui) {
    ui.remove();
  }
}

function animateActivity() {
  if (!currentActivity) return;
  
  const animate = () => {
    if (!currentActivity) return;
    
    // Simple bobbing animation
    const time = Date.now() * 0.003;
    const offsetY = Math.sin(time) * 3;
    
    if (insidePlayer) {
      insidePlayer.style.transform = `translate(-50%, calc(-50% + ${offsetY}px))`;
    }
    
    activityAnimationFrame = requestAnimationFrame(animate);
  };
  
  animate();
}

function fastForwardActivity() {
  if (!currentActivity) return;
  
  // Instantly apply all effects
  for (const stat in currentActivity.data.effects) {
    playerStatus[stat] = Math.max(0, Math.min(100, playerStatus[stat] + currentActivity.data.effects[stat]));
  }
  
  // Advance time by full duration
  advanceTime(currentActivity.totalMinutes);
  
  // Clean up
  clearInterval(activityInterval);
  cancelAnimationFrame(activityAnimationFrame);
  hideActivityUI();
  
  currentActivity = null;
  activityStartTime = 0;
  activityElapsedMinutes = 0;
  
  updateStatusBars();
}
function buyItem(itemKey) {
  const item = items[itemKey];
  if (!item) return;
  
  if (playerStatus.money < item.price) {
    alert("Not enough money!");
    return;
  }
  
  playerStatus.money -= item.price;
  playerInventory.push(itemKey);
  updateStatusBars();
  
  alert(`✅ Purchased ${item.name}!`);
  
  // Refresh inventory UI if open
  if (document.getElementById('inventory-modal')) {
    showInventory();
  }
}

function useItem(itemKey, index) {
  const item = items[itemKey];
  if (!item) return;
  
  // Apply effects
  for (const stat in item.effects) {
    playerStatus[stat] = Math.max(0, Math.min(100, playerStatus[stat] + item.effects[stat]));
  }
  
  // Track item used for score
  trackItemUsed(itemKey);
  
  // Remove from inventory if consumable
  if (item.consumable) {
    playerInventory.splice(index, 1);
  }
  
  updateStatusBars();
  
  // Refresh inventory UI
  showInventory();
}

function hasItem(itemKey) {
  return playerInventory.includes(itemKey);
}

function showShop() {
  const availableItems = shopItems[currentLocation] || [];
  
  if (availableItems.length === 0) {
    alert("No shop available at this location!");
    return;
  }
  
  let shopHTML = `
    <div id="shop-modal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>🏪 Shop - ${currentLocation}</h2>
          <button onclick="closeShop()" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="shop-grid">
  `;
  
  availableItems.forEach(itemKey => {
    const item = items[itemKey];
    const owned = hasItem(itemKey) && !item.consumable;
    
    shopHTML += `
      <div class="shop-item ${owned ? 'owned' : ''}">
        <div class="item-icon">${item.icon}</div>
        <div class="item-info">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <div class="item-price">💎 ${item.price}</div>
        </div>
        <button 
          onclick="buyItem('${itemKey}')" 
          class="buy-btn"
          ${owned ? 'disabled' : ''}
        >
          ${owned ? 'Owned' : 'Buy'}
        </button>
      </div>
    `;
  });
  
  shopHTML += `
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', shopHTML);
}

function closeShop() {
  const modal = document.getElementById('shop-modal');
  if (modal) modal.remove();
}

function showInventory() {
  let inventoryHTML = `
    <div id="inventory-modal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>🎒 Inventory</h2>
          <button onclick="closeInventory()" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
  `;
  
  if (playerInventory.length === 0) {
    inventoryHTML += `<p class="empty-message">Your inventory is empty. Visit shops to buy items!</p>`;
  } else {
    inventoryHTML += `<div class="inventory-grid">`;
    
    playerInventory.forEach((itemKey, index) => {
      const item = items[itemKey];
      
      inventoryHTML += `
        <div class="inventory-item">
          <div class="item-icon-large">${item.icon}</div>
          <div class="item-info">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            ${item.consumable ? 
              `<button onclick="useItem('${itemKey}', ${index})" class="use-btn">Use</button>` :
              `<span class="equipped-badge">Equipped</span>`
            }
          </div>
        </div>
      `;
    });
    
    inventoryHTML += `</div>`;
  }
  
  inventoryHTML += `
        </div>
      </div>
    </div>
  `;
  
  // Remove existing modal if any
  const existingModal = document.getElementById('inventory-modal');
  if (existingModal) existingModal.remove();
  
  document.body.insertAdjacentHTML('beforeend', inventoryHTML);
}

function closeInventory() {
  const modal = document.getElementById('inventory-modal');
  if (modal) modal.remove();
}

function advanceTime(minutes) {
  currentMinute += minutes;
  while (currentMinute >= 60) {
    currentMinute -= 60;
    currentHour++;
  }
  while (currentHour >= 24) {
    currentHour -= 24;
    currentDay++;
  }
  
  gameDayDisplay.textContent = `DAY ${currentDay}`;
  gameTimeDisplay.textContent = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
  updateGreeting();
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
  
  const finalScore = calculateLifeSatisfactionScore();
  
  gameOverReason.textContent = `You fainted from ${reason}. You survived ${currentDay} days.`;
  gameOverReason.innerHTML += `<br><br>🌟 <strong>Final Life Satisfaction Score: ${finalScore}</strong><br>`;
  gameOverReason.innerHTML += `<small>Activities: ${Object.keys(scoreTracking.activitiesPerformed).length} | `;
  gameOverReason.innerHTML += `Areas Visited: ${scoreTracking.areasVisited.size} | `;
  gameOverReason.innerHTML += `Items Used: ${Object.keys(scoreTracking.itemsUsed).length}</small>`;
  
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

// === Continuous Movement System ===
const keysPressed = new Set();
let movementInterval = null;

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  
  // Check if it's a movement key
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
    event.preventDefault(); // Prevent page scrolling
    keysPressed.add(key);
    
    // Start continuous movement if not already running
    if (!movementInterval) {
      movementInterval = setInterval(() => {
        if (keysPressed.has("arrowup") || keysPressed.has("w")) {
          movePlayer("up");
        }
        if (keysPressed.has("arrowdown") || keysPressed.has("s")) {
          movePlayer("down");
        }
        if (keysPressed.has("arrowleft") || keysPressed.has("a")) {
          movePlayer("left");
        }
        if (keysPressed.has("arrowright") || keysPressed.has("d")) {
          movePlayer("right");
        }
      }, 50); // Movement tick every 50ms (faster = smoother)
    }
  }
});

document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  keysPressed.delete(key);
  
  // Stop movement interval when no keys are pressed
  if (keysPressed.size === 0 && movementInterval) {
    clearInterval(movementInterval);
    movementInterval = null;
  }
});

restartButton.addEventListener("click", restartGame);

// === Initialize App ===
updateAvatarSelection();
playerMapIconContainer.style.display = "none";

// === Life Satisfaction Score System ===

function calculateLifeSatisfactionScore() {
  let score = 0;
  
  // 1. Stat Balance Score (max 100 points)
  const avgStat = (playerStatus.hunger + playerStatus.sleep + playerStatus.hygiene + playerStatus.happiness) / 4;
  const statVariance = Math.sqrt(
    (Math.pow(playerStatus.hunger - avgStat, 2) + 
     Math.pow(playerStatus.sleep - avgStat, 2) + 
     Math.pow(playerStatus.hygiene - avgStat, 2) + 
     Math.pow(playerStatus.happiness - avgStat, 2)) / 4
  );
  
  // Reward balanced stats (low variance is good)
  const balanceScore = Math.max(0, 100 - statVariance);
  score += balanceScore;
  
  // 2. Activities Variety Score (max 150 points)
  const activityCount = Object.keys(scoreTracking.activitiesPerformed).length;
  const activityScore = Math.min(150, activityCount * 15);
  score += activityScore;
  
  // 3. Items Used Score (max 100 points)
  const itemsUsedCount = Object.keys(scoreTracking.itemsUsed).length;
  const itemScore = Math.min(100, itemsUsedCount * 20);
  score += itemScore;
  
  // 4. Area Exploration Score (max 150 points)
  const areasVisitedCount = scoreTracking.areasVisited.size;
  const explorationScore = areasVisitedCount * 30;
  score += explorationScore;
  
  // 5. Survival Bonus (days survived * 10)
  const survivalBonus = currentDay * 10;
  score += survivalBonus;
  
  return Math.round(score);
}

function updateLifeSatisfactionScore() {
  lifeSatisfactionScore = calculateLifeSatisfactionScore();
  const scoreDisplay = document.getElementById('satisfaction-score');
  if (scoreDisplay) {
    scoreDisplay.textContent = lifeSatisfactionScore;
  }
}

function trackActivity(activityKey) {
  if (!scoreTracking.activitiesPerformed[activityKey]) {
    scoreTracking.activitiesPerformed[activityKey] = 0;
  }
  scoreTracking.activitiesPerformed[activityKey]++;
  updateLifeSatisfactionScore();
}

function trackItemUsed(itemKey) {
  if (!scoreTracking.itemsUsed[itemKey]) {
    scoreTracking.itemsUsed[itemKey] = 0;
  }
  scoreTracking.itemsUsed[itemKey]++;
  updateLifeSatisfactionScore();
}

function trackAreaVisited(locationKey) {
  scoreTracking.areasVisited.add(locationKey);
  updateLifeSatisfactionScore();
}