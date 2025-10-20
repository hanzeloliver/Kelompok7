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
  "eat": { name: "Eat Meal", cost: 0, effects: { hunger: +30, happiness: +5 }, info: "Replenish your hunger at the base." },
  "sleep": { name: "Rest", cost: 0, effects: { sleep: +40, hunger: -5 }, info: "Take a rest to restore energy." },
  "clean": { name: "Take Shower", cost: 0, effects: { hygiene: +50, happiness: +5 }, info: "Stay clean and fresh." },
  "work": { name: "Repair Equipment", cost: -20, effects: { hygiene: -15, sleep: -10, happiness: -5 }, info: "Fix your exploration tools." },
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
const playerMapIconContainer = document.getElementById("player-map-icon-container");
const playerMapIconImg = document.getElementById("player-map-icon-img");

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
  const loc = locations[currentLocation];
  loc.activities.forEach(key => {
    const act = activities[key];
    const btn = document.createElement("button");
    btn.className = "activity-btn";
    btn.textContent = act.name;
    btn.onclick = () => performActivity(key);
    activityButtonsContainer.appendChild(btn);
  });
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

    // klik marker untuk teleport
    marker.addEventListener('click', () => {
      currentLocation = locationKey;
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
  const locationData = locations[currentLocation];
  if (locationData && locationData.coords) {
    playerMapIconContainer.style.top = locationData.coords.top;
    playerMapIconContainer.style.left = locationData.coords.left;
    playerMapIconContainer.style.display = "flex";
  } else {
    playerMapIconContainer.style.display = "none";
  }
}

// === Movement ===
function movePlayer(direction) {
  const next = locations[currentLocation][direction];
  if (next && locations[next]) {
    currentLocation = next;
    updatePlayerMapPosition();
    playerMapIconContainer.classList.add("shake");
    setTimeout(() => playerMapIconContainer.classList.remove("shake"), 300);
    updateActivities();
    updateStatusBars();
  } else {
    playerMapIconContainer.classList.add("shake");
    setTimeout(() => playerMapIconContainer.classList.remove("shake"), 300);
  }
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
  createMapMarkers();
  updatePlayerMapPosition();

  updateStatusBars();
  updateActivities();
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
restartButton.addEventListener("click", restartGame);

// === Initialize App ===
updateAvatarSelection();
playerMapIconContainer.style.display = "none";
