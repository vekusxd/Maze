let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
ctx.translate(0.5, 0.5);

// ctx.fillStyle = "green";
// ctx.fillRect(10, 10, 100, 100);

let cellCount = 10;
let rows = [];

class Cell {
  constructor(x, y) {
    this.top = false;
    this.bottom = false;
    this.left = false;
    this.right = false;

    // write only for equality comparison
    this.x = x;
    this.y = y;

    this.parentSet = null;
  }
}

let genButton = document.querySelector("#generate-button");

genButton.addEventListener("click", () => {
  Generate();
});

const lineWidth = 1;
let rowWidth = canvas.clientWidth / cellCount - 0.1; //some magic stuff;
let rowHeight = canvas.clientHeight / cellCount - 0.1; //some magic stuff;

function makeRows(rows) {
  let currentRow = [];
  for (let q = 0; q < cellCount; q++) {
    let y = rows.length;
    // 1. create the first row, no cells are members of any set
    if (rows.length == 0) {
      for (let x = 0; x < cellCount; x++) {
        let c = new Cell(x, y);
        // c.top = true;
        currentRow.push(c);
      }
    }

    // 2. join any cells not members of a set to their own unique set
    for (let i = 0; i < currentRow.length; i++) {
      if (currentRow[i].parentSet == null) {
        currentRow[i].parentSet = new Set();
        currentRow[i].parentSet.add(currentRow[i]);
      }
    }

    // 3. create right walls, moving from left to right
    for (let i = 0; i < currentRow.length - 1; i++) {
      // if the current cell and the cell to the right
      // are members of the same set, always create a wall between them
      // if not, randomly add right walls
      if (
        currentRow[i].parentSet === currentRow[i + 1].parentSet ||
        randomBool()
      ) {
        currentRow[i].right = true;
      } else {
        // if no wall, union the sets
        currentRow[i].parentSet.union(currentRow[i + 1].parentSet);
      }
    }

    // 4. create bottom walls, moving from left to right
    for (let i = 0; i < currentRow.length; i++) {
      // if the cell is the only one in its set, don't make a bottom wall
      // if the cell is the only member of its set without a bottom wall, don't make a bottom wall
      // if not, randomly add a bottom wall
      if (
        currentRow[i].parentSet.size > 0 &&
        !(
          !currentRow[i].bottom && notBottomCount(currentRow[i].parentSet) == 1
        ) &&
        randomBool()
      ) {
        currentRow[i].bottom = true;
      }
    }

    //5. if it's the last row
    if (rows.length == cellCount - 1) {
      // add a bottom wall to every cell

      // if current cell and cell to right are different sets
      for (let i = 0; i < currentRow.length - 1; i++) {
        if (currentRow[i].parentSet != currentRow[i + 1].parentSet) {
          // remove the right wall
          currentRow[i].right = false;
          currentRow[i + 1].left = false;
          // union sets
          currentRow[i].parentSet.union(currentRow[i + 1].parentSet);
        }
      }
      // then output
      output(currentRow);
    } else {
      // output the current row
      output(currentRow);

      // remove all right walls
      for (let i = 0; i < currentRow.length - 1; i++) {
        currentRow[i].right = false;
      }
      //remove all cells with a bottom wall from their set
      for (let i = 0; i < currentRow.length; i++) {
        if (currentRow[i].bottom) {
          currentRow[i].parentSet.delete(currentRow[i]);
          currentRow[i].parentSet = null;
        }
      }
      // remove all bottom walls
      for (let i = 0; i < currentRow.length; i++) {
        currentRow[i].bottom = false;
      }
    }
  }

  // finally add the walls on the top and sides
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[i].length; j++) {
      if (i == 0) {
        rows[i][j].top = true;
      } else if (i == rows.length - 1) {
        rows[i][j].bottom = true;
      }

      if (j == 0) {
        rows[i][j].left = true;
      } else if (j == rows[i].length - 1) {
        rows[i][j].right = true;
      }
    }
  }

  //   rows[0][0].top = false;
  //   rows[rows.length - 1][rows[0].length - 1].bottom = false;
}

Set.prototype.union = function (setB) {
  for (let elem of setB) {
    elem.parentSet = this;
    this.add(elem);
  }
};

function randomBool() {
  return Math.random() < 0.5;
}

function notBottomCount(s) {
  var c = 0;
  s.forEach(function (x) {
    if (!x.bottom) c++;
  });
  return c;
}

function output(row) {
  rows.push(JSON.parse(JSON.stringify(row)));
  // then move y down
  for (var i = 0; i < row.length; i++) {
    row[i].y += 1;
  }
}

function Generate() {
  rows = new Array();
  const mazeSize = document.querySelector("#maze-size");
  cellCount = mazeSize.value;
  if (cellCount < 5) {
    mazeSize.value = 5;
    alert("Cell count can`t be less than 5!");
    cellCount = 5;
  }
  if (cellCount > 100) {
    mazeSize.value = 100;
    alert("Cell count can`t be more than 100!");
    cellCount = 100;
  }
  rowWidth = canvas.clientWidth / cellCount - 0.1; //some magic stuff;
  rowHeight = canvas.clientHeight / cellCount - 0.1; //some magic stuff;
  makeRows(rows);
  draw();
}

async function draw() {
  canvas.width = canvas.width;
  const visualize = document.querySelector("#visualize").checked;
  for (const row of rows) {
    for (const cell of row) {
      if (visualize) await sleep(1000 / cellCount);

      if (cell.top) {
        ctx.beginPath();
        ctx.moveTo(cell.x * rowWidth, cell.y * rowHeight);
        ctx.lineTo(cell.x * rowWidth + rowWidth, cell.y * rowHeight);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      }
      if (cell.bottom) {
        ctx.beginPath();
        ctx.moveTo(cell.x * rowWidth, cell.y * rowHeight + rowHeight);
        ctx.lineTo(
          cell.x * rowWidth + rowWidth,
          cell.y * rowHeight + rowHeight
        );
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      }
      if (cell.right) {
        ctx.beginPath();
        ctx.moveTo(cell.x * rowWidth + rowWidth, cell.y * rowHeight);
        ctx.lineTo(
          cell.x * rowWidth + rowWidth,
          cell.y * rowHeight + rowHeight
        );
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      }
      if (cell.left) {
        ctx.beginPath();
        ctx.moveTo(cell.x * rowWidth, cell.y * rowHeight);
        ctx.lineTo(cell.x * rowWidth, cell.y * rowHeight + rowHeight);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      }
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
