const heightsInput = document.getElementById("heights");
const renderBtn = document.getElementById("render");
const animateBtn = document.getElementById("animate");
const resetBtn = document.getElementById("reset");
const randomBtn = document.getElementById("random");
const svg = document.getElementById("chart");
const stats = {
  wrap: document.getElementById("stats"),
  n: document.getElementById("nVal"),
  water: document.getElementById("waterVal"),
  hmax: document.getElementById("hMaxVal"),
};

let animationId = null; // holds setInterval
let currentState = null; // store algorithm state

// Parse heights input, sanitize negatives, clamp to integers, auto-correct input box
function parseHeights(text) {
  let arr = text
    .split(/[^0-9-]+/)     // split on non-numeric chars
    .filter(Boolean)       // drop empties
    .map(Number)           // convert to numbers
    .map((x) => {
      if (!Number.isFinite(x)) return 0;
      if (x < 0) return 0;
      return Math.floor(x);  // clamp to integer
    });

  // Auto-correct the input box display
  heightsInput.value = arr.join(",");

  return arr;
}


// Initialize state for animation
function initTwoPointer(h) {
  return {
    h,
    l: 0,
    r: h.length - 1,
    lmax: 0,
    rmax: 0,
    total: 0,
    waterAt: new Array(h.length).fill(0),
  };
}

// One step of the two-pointer algorithm
function stepTwoPointer(state) {
  const { h } = state;
  if (state.l > state.r) return false; // finished

  if (h[state.l] <= h[state.r]) {
    if (h[state.l] >= state.lmax) state.lmax = h[state.l];
    else {
      const w = state.lmax - h[state.l];
      state.total += w;
      state.waterAt[state.l] = w;
    }
    state.l++;
  } else {
    if (h[state.r] >= state.rmax) state.rmax = h[state.r];
    else {
      const w = state.rmax - h[state.r];
      state.total += w;
      state.waterAt[state.r] = w;
    }
    state.r--;
  }
  return true; // continue
}

// Render chart with current state
function renderChart(state) {
  const h = state.h;
  const n = h.length;
  const pad = 30,
    width = 1200,
    height = 400,
    bw = Math.floor((width - pad * 2) / n) - 2,
    gap = 2;
  const maxH = Math.max(1, ...h);
  const scaleY = (height - pad * 2) / (maxH + Math.max(...state.waterAt, 1));

  svg.innerHTML = "";

  // Horizontal grid lines + labels
  for (let yLevel = 0; yLevel <= maxH; yLevel++) {
    const y = height - pad - yLevel * scaleY;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", pad);
    line.setAttribute("x2", width - pad);
    line.setAttribute("y1", y);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "#1f2937");
    line.setAttribute("stroke-width", "0.5");
    line.setAttribute("stroke-dasharray", "2,2");
    svg.appendChild(line);

    // Height label
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", 5);
    text.setAttribute("y", y - 2);
    text.setAttribute("fill", "#64748b");
    text.setAttribute("font-size", "10");
    text.textContent = yLevel;
    svg.appendChild(text);
  }

  // Axis baseline
  const axis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  axis.setAttribute("x1", pad);
  axis.setAttribute("x2", width - pad);
  axis.setAttribute("y1", height - pad);
  axis.setAttribute("y2", height - pad);
  axis.setAttribute("class", "axis-line");
  svg.appendChild(axis);

  for (let i = 0; i < n; i++) {
    const x = pad + i * (bw + gap);
    const bh = h[i] * scaleY;
    const wb = state.waterAt[i] * scaleY;

    // Block
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", height - pad - bh);
    rect.setAttribute("width", bw);
    rect.setAttribute("height", bh);
    rect.setAttribute("class", "bar");
    svg.appendChild(rect);

    // Water
    if (state.waterAt[i] > 0) {
      const wRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      wRect.setAttribute("x", x);
      wRect.setAttribute("y", height - pad - bh - wb);
      wRect.setAttribute("width", bw);
      wRect.setAttribute("height", wb);
      wRect.setAttribute("class", "water");
      svg.appendChild(wRect);
    }
  }

  // Mark left and right pointers
  if (state.l < n) {
    const markerL = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    markerL.setAttribute("x", pad + state.l * (bw + gap));
    markerL.setAttribute("y", 0);
    markerL.setAttribute("width", bw);
    markerL.setAttribute("height", height);
    markerL.setAttribute("fill", "rgba(14,165,233,0.2)");
    svg.appendChild(markerL);
  }

  if (state.r >= 0) {
    const markerR = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    markerR.setAttribute("x", pad + state.r * (bw + gap));
    markerR.setAttribute("y", 0);
    markerR.setAttribute("width", bw);
    markerR.setAttribute("height", height);
    markerR.setAttribute("fill", "rgba(236,72,153,0.2)");
    svg.appendChild(markerR);
  }

  stats.wrap.hidden = false;
  stats.n.textContent = n;
  stats.water.textContent = state.total;
  stats.hmax.textContent = maxH;
}

// --- Controls ---

renderBtn.addEventListener("click", () => {
  const h = parseHeights(heightsInput.value);
  if (h.length === 0) {
    alert("Provide at least one non-negative integer.");
    return;
  }
  currentState = initTwoPointer(h);
  while (stepTwoPointer(currentState)) {}
  renderChart(currentState);
});

animateBtn.addEventListener("click", () => {
  const h = parseHeights(heightsInput.value);
  if (h.length === 0) {
    alert("Provide at least one non-negative integer.");
    return;
  }
  currentState = initTwoPointer(h);
  animationId = setInterval(() => {
    const cont = stepTwoPointer(currentState);
    renderChart(currentState);
    if (!cont) clearInterval(animationId);
  }, 500); // step every 500ms
});

resetBtn.addEventListener("click", () => {
  clearInterval(animationId);
  svg.innerHTML = "";
  stats.wrap.hidden = true;
  currentState = null;
});

randomBtn.addEventListener("click", () => {
  const n = Math.floor(Math.random() * 10) + 8;
  const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 7));
  heightsInput.value = arr.join(",");
  renderBtn.click();
});

// Initial render
renderBtn.click();
