const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

let levelpack = [
  [3,3,"#404040",[[0,"baba","you"],[0,"flag","win"]],["baba",0,0],["flag",2,2]]
];
let level = 0;

function update(get,type,set) {
  document.getElementById(get)[type] = set;
};
ctx.fillStyle = levelpack[level][2]
ctx.fillRect(10,10,200,200);
