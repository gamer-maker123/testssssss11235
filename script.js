const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const size = 100;
const STORAGE_KEY = "baba-is-you-save";

let levelpack = [
  [3,3,"#404040",[[0,"baba","you"],[0,"flag","win"]],["baba",0,0],["flag",2,2]]
];
let level = 0;

function saveGame() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ level }));
  } catch (error) {
    console.warn("Could not save game progress:", error);
  }
}

function loadGame() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const data = JSON.parse(saved);
    if (Number.isInteger(data.level) && data.level >= 0) {
      level = data.level;
    }
  } catch (error) {
    console.warn("Could not load saved game progress:", error);
  }
}

function update(get,type,set) {
  document.getElementById(get)[type] = set;
};

function show() {
  update("myCanvas","width",levelpack[level][0]*size)
  update("myCanvas","height",levelpack[level][1]*size)
  ctx.fillStyle = levelpack[level][2]
  ctx.fillRect(0,0,canvas.width,canvas.height);
  saveGame();
};

loadGame();
show();
