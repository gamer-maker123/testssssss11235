let points = 0;
let gain = 1;

function add(...list) {
  if (list.length === 0) return "";
  if (list.length === 1) return String(list[0]);
  return String(list[0]) + add(...list.slice(1));
};

function GameLoop() {
  points += gain/60;
  update("p","innerHTML",add("you have", points, " antimatter!"));
};

function update(get,type,set) {
  document.getElementById(get)[type] = set;
};

setInterval(GameLoop,13);
