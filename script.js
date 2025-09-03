const heightsInput = document.getElementById("heights");
const renderBtn = document.getElementById("render");
const randomBtn = document.getElementById("random");
const svg = document.getElementById("chart");
const stats = {
  wrap: document.getElementById("stats"),
  n: document.getElementById("nVal"),
  water: document.getElementById("waterVal"),
  hmax: document.getElementById("hMaxVal"),
};

// Sample data
const sample = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
heightsInput.value = sample.join(",");

// Parse heights input
function parseHeights(text) {
  return text
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map(Number)
    .filter((x) => Number.isFinite(x) && x >= 0);
}

// Two-pointer algorithm
function trapTwoPointer(h) {
  let l = 0,
    r = h.length - 1;
  let lmax = 0,
    rmax = 0,
    water = 0;
  const waterAt = new Array(h.length).fill(0);

  while (l <= r) {
    if (h[l] <= h[r]) {
      if (h[l] >= lmax) lmax = h[l];
      else {
        const w = lmax - h[l];
        water += w;
        waterAt[l] = w;
      }
      l++;
    } else {
      if (h[r] >= rmax) rmax = h[r];
      else {
        const w = rmax - h[r];
        water += w;
        waterAt[r] = w;
      }
      r--;
    }
  }
  return { total: water, waterAt };
}

// Render SVG chart
function renderChart(h) {
  const n = h.length;
  const { total, waterAt } = trapTwoPointer(h);

  const width = 1200,
    height = 400,
    pad = 20;
  const maxH = Math.max(1, ...h);
  const bw = Math.floor((width - pad * 2) / n) - 2;
  const gap = 2;
  const scaleY = (height - pad * 2) / (maxH + Math.max(...waterAt, 1));

  svg.innerHTML = "";

  // Axis baseline
  const axis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  axis.setAttribute("x1", pad);
  axis.setAttribute("x2", width - pad);
  axis.setAttribute("y1", height - pad);
  axis.setAttribute("y2", height - pad);
  axis.setAttribute("class", "axis-line");
  svg.appendChild(axis);

  // Bars + water
  for (let i = 0; i < n; i++) {
    const x = pad + i * (bw + gap);
    const bh = h[i] * scaleY;
    const wb = waterAt[i] * scaleY;

    // Block
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", height - pad - bh);
    rect.setAttribute("width", bw);
    rect.setAttribute("height", bh);
    rect.setAttribute("class", "bar");
    svg.appendChild(rect);

    // Water
    if (waterAt[i] > 0) {
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

  stats.wrap.hidden = false;
  stats.n.textContent = n;
  stats.water.textContent = total;
  stats.hmax.textContent = maxH;
}

// Random heights
function randomHeights() {
  const n = Math.floor(Math.random() * 10) + 8;
  return Array.from({ length: n }, () => Math.floor(Math.random() * 7));
}

renderBtn.addEventListener("click", () => {
  const h = parseHeights(heightsInput.value);
  if (h.length === 0) {
    alert("Provide at least one non-negative integer.");
    return;
  }
  renderChart(h);
});

randomBtn.addEventListener("click", () => {
  const arr = randomHeights();
  heightsInput.value = arr.join(",");
  renderBtn.click();
});

// Initial render
renderBtn.click();
