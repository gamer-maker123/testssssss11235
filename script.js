
const canvas = document.getElementById("myCanvas");
if (!canvas) {
  throw new Error("Canvas not found. Make sure the script runs after the canvas element exists.");
}

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("2D context not available.");
}

const size = 100;
const STORAGE_KEY = "baba-is-you-save";
const version = "0.0";
const changelog = [
  ["0.0", "added basic mechanics like Stop, Push, Win, You, as well as Is and And, made characters Baba, Flag, Wall and Box"]
];
const versionchange = [
  
]

const objects = [
  ["empty", 0, 0, ""],
  ["baba", "#FFFFFF", 0, ""],
  ["flag", "#FFFF00", 0, ""],
  ["wall", "#808080", 0, ""],
  ["box", "#B58B5A", 0, ""],
  ["baba_text", 0, 1, "baba"],
  ["flag_text", 0, 1, "flag"],
  ["is_text", 0, 1, "is"],
  ["you_text", 0, 1, "you"],
  ["win_text", 0, 1, "win"]
];

let levelpack = [
  [3, 3, "#404040", [[0, "baba", "you"], [0, "flag", "win"]], [1, 0, 0], [2, 2, 2]]
];

let level = 0;
let won = false;

function objsat(x,y) {
  let objs = [];
  let thislevel = levelpack[level];
  for (let i = 4; i < thislevel.length; i++) {
    if (thislevel[i][1] == x && thislevel[i][2] == y) {
      objs.push(thislevel[i]);
    };
  };
  return objs;
};

function ifobjat(type,x,y) {
  return objsat(x,y).some(obj => obj[0] == type);
};

function type(x) {
  return objects[x[0]][2];
};

function contains(x,y,depth) {
  if (depth == 0) {
    return x.includes(y);
  } else {
    let yisinx = false;
    for (let i = 0; i < x.length; i++) {
      if (contains(x[i],y,depth-1)) {
        yisinx = true;
      };
    };
    return yisinx;
  };
};


// Property names
const propertyNames = [
  "you", "win", "stop", "push", "pull",
  "sink", "defeat", "hot", "melt", "open",
  "shut", "weak", "move", "float"
];

// Check whether an ID is a physical object
function isObject(id) {
  return objects[id] !== undefined &&
    objects[id][2] === 0;
}

// Check whether an ID is text
function isTextObject(id) {
  return objects[id] !== undefined &&
    objects[id][2] >= 1;
}

// Get the word represented by a text object
function getTextWord(id) {
  if (!isTextObject(id)) return null;
  return objects[id][3];
}

// Find the object or text that a text block refers to
function getTextReferent(id) {
  let word = getTextWord(id);
  if (word === null) return -1;

  return objects.findIndex(obj => obj[0] === word);
}

// Check whether text refers to a physical object
function isTextReferringToObject(id) {
  let referent = getTextReferent(id);
  return referent !== -1 && isObject(referent);
}

// Check whether text refers to another text
function isMetaText(id) {
  let referent = getTextReferent(id);
  return referent !== -1 && isTextObject(referent);
}

// Get the nesting depth of meta-text
function getMetaLevel(id) {
  if (!isTextObject(id)) return -1;

  let referent = getTextReferent(id);

  if (referent === -1 || isObject(referent)) return 0;

  return 1 + getMetaLevel(referent);
}

// Check whether text is a property
function isPropertyText(id) {
  return isTextObject(id) &&
    propertyNames.includes(getTextWord(id));
}

// Check whether text is IS or AND
function isOperatorText(id) {
  return isTextObject(id) &&
    ["is", "and"].includes(getTextWord(id));
}

// Check for other text
function isOtherText(id) {
  return isTextObject(id) &&
    !isTextReferringToObject(id) &&
    !isMetaText(id) &&
    !isPropertyText(id) &&
    !isOperatorText(id);
}

// Check whether text can be a rule subject
function isRuleSubjectText(id) {
  return isTextReferringToObject(id) || isMetaText(id);
}

// Compile rules
function compilerules() {
  let thislevel = levelpack[level].slice(4);
  let output = [];
  let newrules = [];
  let heads = [];

  // Get all text objects at a position
  function getTextAt(x, y) {
    return objsat(x, y).filter(obj =>
      isTextObject(obj[0])
    );
  }

  // Find possible rule heads
  for (let obj of thislevel) {
    let [id, x, y] = obj;

    if (!isRuleSubjectText(id)) continue;

    // Horizontal head
    let left = getTextAt(x - 1, y);

    if (!left.some(obj =>
      ["and", "is"].includes(getTextWord(obj[0]))
    )) {
      heads.push([x, y, 1, 0]);
    }

    // Vertical head
    let below = getTextAt(x, y - 1);

    if (!below.some(obj =>
      ["and", "is"].includes(getTextWord(obj[0]))
    )) {
      heads.push([x, y, 0, 1]);
    }
  }

  // Validate one side of a rule
  function validSide(words, check) {
    if (words.length === 0 || words.length % 2 === 0) {
      return false;
    }

    for (let i = 0; i < words.length; i++) {
      let word = getTextWord(words[i]);

      if (i % 2 === 0) {
        if (!check(words[i])) return false;
      } else {
        if (word !== "and") return false;
      }
    }

    return true;
  }

  // Compile one sentence
  function compileLine(x, y, dx, dy) {
    let possibilities = [[]];

    while (true) {
      let found = getTextAt(x, y);

      if (found.length === 0) break;

      let next = [];

      for (let possibility of possibilities) {
        for (let obj of found) {
          next.push([...possibility, obj[0]]);
        }
      }

      possibilities = next;
      x += dx;
      y += dy;
    }

    // Test every possible combination
    for (let tokens of possibilities) {
      let isPositions = [];

      for (let i = 0; i < tokens.length; i++) {
        if (getTextWord(tokens[i]) === "is") {
          isPositions.push(i);
        }
      }

      if (isPositions.length !== 1) continue;

      let isPosition = isPositions[0];

      let left = tokens.slice(0, isPosition);
      let right = tokens.slice(isPosition + 1);

      if (!validSide(left, isRuleSubjectText)) continue;
      if (!validSide(right, isPropertyText)) continue;

      let subjects = left
        .filter((_, i) => i % 2 === 0)
        .map(getTextWord);

      let properties = right
        .filter((_, i) => i % 2 === 0)
        .map(getTextWord);

      if (tokens.some(id => getTextWord(id) === "and")) {
        newrules.push([1, subjects, properties]);
      } else {
        newrules.push([0, subjects[0], properties[0]]);
      }
    }
  }

  // Compile every head
  for (let [x, y, dx, dy] of heads) {
    compileLine(x, y, dx, dy);
  }

  // Remove duplicates
  return newrules.filter((rule, i) =>
    newrules.findIndex(other =>
      JSON.stringify(other) === JSON.stringify(rule)
    ) === i
  );
  output = [levelpack[level][3],newrules];
  return output;
}

function saveGame() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ level }));
  } catch (error) {
    console.warn("Could not save game progress: ", error);
  };
};

function loadGame() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const data = JSON.parse(saved);
    if (Number.isInteger(data.level) && data.level >= 0 && data.level < levelpack.length) {
      level = data.level;
    };
  } catch (error) {
    console.warn("Could not load saved game progress: ", error);
  };
};

function show() {
  let thislevel = levelpack[level];
  canvas.width = thislevel[0] * size;
  canvas.height = thislevel[1] * size;

  ctx.fillStyle = thislevel[2];
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 4; i < thislevel.length; i++) {
    let [id, x, y] = thislevel[i];

    if (objects[id][2] == 1) {
      ctx.fillStyle = objects[id][1] == 0 ? thislevel[2] : objects[id][1];
      ctx.fillRect(x * size, (-y - 1 + thislevel[1]) * size, size, size);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(objects[id][3], (x + 0.5) * size, (-y - 0.5 + thislevel[1]) * size);
    } else {
      ctx.fillStyle = objects[id][1] == 0 ? thislevel[2] : objects[id][1];
      ctx.fillRect(x * size, (-y - 1 + thislevel[1]) * size, size, size);
    };
  };

  saveGame();
};

loadGame();
show();
