const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const size = 100;
const STORAGE_KEY = "baba-is-you-save";
const objects = [
  ["empty",0],
  ["baba","#FFFFFF"],
  ["flag","#FFFF00"]
];

let levelpack = [
  [3,3,"#404040",[[0,"baba","you"],[0,"flag","win"]],[1,0,0],[2,2,2]]
];
let level = 0;
let won = False;

function saveGame() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ level }));
  } catch (error) {
    console.warn("Could not save game progress: ", error);
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
    console.warn("Could not load saved game progress: ", error);
  }
}

function update(get,type,set) {
  document.getElementById(get)[type] = set;
};

function show() {
  update("myCanvas","width",levelpack[level][0]*size);
  update("myCanvas","height",levelpack[level][1]*size);
  ctx.fillStyle = levelpack[level][2];
  ctx.fillRect(0,0,canvas.width,canvas.height);
  for (let i = 4; i < levelpack[level].length; i++) {
    let thislevel = levelpack[level];
    let [id,x,y] = thislevel[i];
    if (id == 0) {
      ctx.fillStyle = levelpack[level][2];
    } else {
      ctx.fillStyle = objects[id][1];
    };
    ctx.fillRect(x*size,(-y-1+thislevel[1])*size,size,size);
  };
  saveGame();
};

loadGame();
show();
