let started = false;
let paused = false;
let cubePoints = [];
let cornerPoints = [];
let num = 8;
let cx, cy;
let theCanvas;
let parentSelector = ".left-panel";

function setup() {
  // create canvas sized to parent element
  const parentDiv = document.querySelector(parentSelector);
  if (!parentDiv) {
    // fallback: create a full-window canvas if parent missing
    theCanvas = createCanvas(windowWidth, windowHeight);
    theCanvas.style("display", "block");
    cx = width / 2;
    cy = height / 2;
    initCorners();
    noLoop();
    return;
  }

  // ensure parent has a height (if using flex/grid it usually will)
  if (getComputedStyle(parentDiv).height === "0px") {
    // force a min-height so canvas will show; you can remove this if you prefer controlling CSS externally
    parentDiv.style.minHeight = "300px";
  }

  let w = Math.max(1, parentDiv.clientWidth);
  let h = Math.max(1, parentDiv.clientHeight);

  theCanvas = createCanvas(w, h);
  theCanvas.parent(parentDiv);

  // ensure the canvas visually fills the parent container
  theCanvas.style("display", "block");        // removes inline-block whitespace
  theCanvas.elt.style.width = "100%";        // element width 100% of parent
  theCanvas.elt.style.height = "100%";       // element height 100% of parent
  theCanvas.elt.style.objectFit = "cover";   // try to keep it covering nicely

  colorMode(RGB, 255, 255, 255, 100);
  frameRate(60);

  cx = width / 2;
  cy = height / 2;
  initCorners();
  background(255);
  noLoop(); // we'll loop after user clicks to start
}

function windowResized() {
  const parentDiv = document.querySelector(parentSelector);
  if (parentDiv) {
    let w = Math.max(1, parentDiv.clientWidth);
    let h = Math.max(1, parentDiv.clientHeight);
    resizeCanvas(w, h);
    // keep the canvas element sized to the parent
    theCanvas.elt.style.width = "100%";
    theCanvas.elt.style.height = "100%";
    cx = width / 2;
    cy = height / 2;
    background(255);
    initCorners();
    redraw();
  } else {
    resizeCanvas(windowWidth, windowHeight);
    cx = width / 2;
    cy = height / 2;
    initCorners();
  }
}

function draw() {
  if (!started) {
    background(255);
    fill(100);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(min(24, width * 0.03));
    text("Click to Start", width / 2, height / 2);
  } else if (!paused) {
    background(255);
    drawStuff();
  }
}

function mousePressed() {
  // Only start if click is inside our parent panel (prevents accidental starts)
  const parentDiv = document.querySelector(parentSelector);
  if (parentDiv) {
    const rect = parentDiv.getBoundingClientRect();
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
      started = true;
      loop();
    }
  } else {
    started = true;
    loop();
  }
}

function keyPressed() {
  if (key === 'p' || key === 'P') paused = !paused;
}

function initCorners() {
  // pick cube size relative to the smaller of width/height
  let size = min(width, height) * 0.22;
  cubePoints = [
    createVector(-size, -size, -size),
    createVector(size, -size, -size),
    createVector(-size, size, -size),
    createVector(size, size, -size),
    createVector(-size, -size, size),
    createVector(size, -size, size),
    createVector(-size, size, size),
    createVector(size, size, size)
  ];
}

function drawStuff() {
  let rotX = (width / 2 - mouseX) / (max(width, height) * 2.0);
  let rotY = (height / 2 - mouseY) / (max(width, height) * 2.0);

  // make a copy/temporary rotated positions so original geometry doesn't accumulate rotations too quickly
  rotatePoints(rotX, rotY);
  projectPoints();
  stroke(0, 40);
  noFill();
  strokeWeight(1.2);

  // edges of a cube
  const edges = [
    [0,1],[0,2],[1,3],[2,3],
    [4,5],[4,6],[5,7],[6,7],
    [0,4],[1,5],[2,6],[3,7]
  ];
  for (let e of edges) {
    let a = cornerPoints[e[0]];
    let b = cornerPoints[e[1]];
    line(a.x, a.y, b.x, b.y);
  }
}

function projectPoints() {
  cornerPoints = [];
  for (let p of cubePoints) {
    // simple perspective projection
    let perspective = 200 / (p.z + 400);
    let x2d = p.x * perspective + width / 2;
    let y2d = p.y * perspective + height / 2;
    cornerPoints.push(createVector(x2d, y2d));
  }
}

function rotatePoints(ax, ay) {
  // small incremental rotation that mutates the cubePoints so interaction is smooth
  for (let i = 0; i < cubePoints.length; i++) {
    let p = cubePoints[i];

    // rotate around Y (vertical axis)
    let rx = p.x * cos(ay) - p.z * sin(ay);
    let rz = p.x * sin(ay) + p.z * cos(ay);

    // rotate around X (horizontal axis)
    let ry = p.y * cos(ax) - rz * sin(ax);
    rz = p.y * sin(ax) + rz * cos(ax);

    p.x = rx;
    p.y = ry;
    p.z = rz;
  }
}
