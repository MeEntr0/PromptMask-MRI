const canvas = document.getElementById("mriCanvas");
const ctx = canvas.getContext("2d");

const caseSelect = document.getElementById("caseSelect");
const viewerTitle = document.getElementById("viewerTitle");
const sliceSlider = document.getElementById("sliceSlider");
const sliceLabel = document.getElementById("sliceLabel");
const targetMeta = document.getElementById("targetMeta");
const promptInput = document.getElementById("promptInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const promptFeedback = document.getElementById("promptFeedback");
const targetGrid = document.getElementById("targetGrid");
const opacitySlider = document.getElementById("opacitySlider");
const opacityValue = document.getElementById("opacityValue");
const scanOverlay = document.getElementById("scanOverlay");
const scanOverlayText = document.getElementById("scanOverlayText");
const resetViewBtn = document.getElementById("resetViewBtn");
const exportBtn = document.getElementById("exportBtn");
const statusText = document.getElementById("statusText");
const targetText = document.getElementById("targetText");
const latencyText = document.getElementById("latencyText");
const historyList = document.getElementById("historyList");

const CASES = {
  "case-a": {
    title: "Pelvic T2 Case A",
    sliceBase: 18,
    seed: 7,
    shiftX: 0,
    shiftY: 0,
    scale: 1,
  },
  "case-b": {
    title: "Pelvic T2 Case B",
    sliceBase: 17,
    seed: 19,
    shiftX: 8,
    shiftY: -8,
    scale: 0.96,
  },
};

const TARGETS = [
  {
    id: "bladder",
    label: "Bladder",
    short: "bladder",
    aliases: ["bladder", "urinary bladder", "show bladder", "segment bladder"],
  },
  {
    id: "bone",
    label: "Bone",
    short: "bone",
    aliases: ["bone", "bones", "pelvic bone", "skeleton"],
  },
  {
    id: "obturator",
    label: "Obturator internus",
    short: "obturator internus",
    aliases: ["obturator", "obturator internus", "obturator muscle", "internal obturator"],
  },
  {
    id: "pz",
    label: "Prostate peripheral zone",
    short: "PZ",
    aliases: ["pz", "peripheral zone", "prostate pz", "prostate peripheral zone"],
  },
  {
    id: "tz",
    label: "Prostate transition zone",
    short: "TZ",
    aliases: ["tz", "transition zone", "prostate tz", "prostate transition zone"],
  },
  {
    id: "rectum",
    label: "Rectum",
    short: "rectum",
    aliases: ["rectum", "show rectum", "segment rectum", "bowel"],
  },
  {
    id: "seminal",
    label: "Seminal vesicle",
    short: "seminal vesicle",
    aliases: ["seminal vesicle", "seminal vesicles", "sv", "vesicle"],
  },
  {
    id: "nvb",
    label: "Neurovascular bundle",
    short: "NVB",
    aliases: ["nvb", "neurovascular bundle", "neuro vascular bundle", "nerve bundle"],
  },
];

const state = {
  caseId: "case-a",
  slice: 18,
  activeTarget: null,
  opacity: 0.58,
  color: "#15b8a6",
  isAnalyzing: false,
  history: [],
};

function normalizePrompt(value) {
  return value
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolvePrompt(value) {
  const prompt = normalizePrompt(value);
  if (!prompt) {
    return null;
  }

  const exact = TARGETS.find((target) =>
    target.aliases.some((alias) => prompt === normalizePrompt(alias)),
  );
  if (exact) {
    return exact;
  }

  return TARGETS.find((target) =>
    target.aliases.some((alias) => prompt.includes(normalizePrompt(alias))),
  );
}

function renderTargetButtons() {
  targetGrid.innerHTML = "";

  TARGETS.forEach((target) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "target-button";
    button.dataset.target = target.id;
    button.innerHTML = `${target.label}<span>${target.short}</span>`;
    button.addEventListener("click", () => {
      promptInput.value = target.short;
      analyzeTarget(target);
    });
    targetGrid.appendChild(button);
  });
}

function setActiveButton() {
  document.querySelectorAll(".target-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.target === state.activeTarget?.id);
  });
}

function seededNoise(x, y, seed) {
  const value = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return value - Math.floor(value);
}

function ellipsePath(context, x, y, radiusX, radiusY, rotation = 0) {
  context.beginPath();
  context.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
}

function fillEllipse(context, x, y, radiusX, radiusY, rotation, color) {
  ellipsePath(context, x, y, radiusX, radiusY, rotation);
  context.fillStyle = color;
  context.fill();
}

function strokeEllipse(context, x, y, radiusX, radiusY, rotation, color, width) {
  ellipsePath(context, x, y, radiusX, radiusY, rotation);
  context.strokeStyle = color;
  context.lineWidth = width;
  context.stroke();
}

function shapeConfig() {
  const c = CASES[state.caseId];
  const sliceOffset = (state.slice - c.sliceBase) * 2.2;
  const s = c.scale;
  const sx = c.shiftX;
  const sy = c.shiftY + sliceOffset * 0.3;

  return {
    bladder: [360 + sx, 244 + sy - sliceOffset * 0.25, 86 * s, 56 * s, 0.02],
    rectum: [360 + sx, 474 + sy + sliceOffset * 0.2, 46 * s, 66 * s, -0.02],
    pz: [360 + sx, 398 + sy, 76 * s, 48 * s, 0],
    tz: [360 + sx, 394 + sy, 42 * s, 28 * s, 0.03],
    seminalLeft: [304 + sx, 333 + sy, 38 * s, 19 * s, -0.42],
    seminalRight: [416 + sx, 333 + sy, 38 * s, 19 * s, 0.42],
    obturatorLeft: [218 + sx, 392 + sy, 36 * s, 116 * s, -0.45],
    obturatorRight: [502 + sx, 392 + sy, 36 * s, 116 * s, 0.45],
    boneLeft: [190 + sx, 314 + sy, 84 * s, 162 * s, -0.26],
    boneRight: [530 + sx, 314 + sy, 84 * s, 162 * s, 0.26],
    nvbLeft: [292 + sx, 408 + sy, 14 * s, 22 * s, -0.35],
    nvbRight: [428 + sx, 408 + sy, 14 * s, 22 * s, 0.35],
  };
}

function drawBaseImage() {
  const c = CASES[state.caseId];
  const image = ctx.createImageData(canvas.width, canvas.height);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const dx = (x - centerX) / 272;
      const dy = (y - centerY) / 308;
      const body = Math.max(0, 1 - dx * dx - dy * dy);
      const n = seededNoise(x * 0.012, y * 0.012, c.seed);
      const fine = seededNoise(x * 0.05, y * 0.05, c.seed + 4);
      const signal = Math.floor(18 + body * 80 + n * 18 + fine * 8);
      const index = (y * canvas.width + x) * 4;
      image.data[index] = signal;
      image.data[index + 1] = signal + 2;
      image.data[index + 2] = signal + 4;
      image.data[index + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);

  const g = shapeConfig();
  ctx.save();
  ctx.globalCompositeOperation = "source-over";

  fillEllipse(ctx, 360 + c.shiftX, 374 + c.shiftY, 232, 260, 0, "rgba(106, 118, 128, 0.55)");
  fillEllipse(ctx, 360 + c.shiftX, 374 + c.shiftY, 196, 228, 0, "rgba(86, 96, 107, 0.52)");

  strokeEllipse(ctx, ...g.boneLeft, "rgba(224, 228, 226, 0.78)", 24);
  strokeEllipse(ctx, ...g.boneRight, "rgba(224, 228, 226, 0.78)", 24);
  fillEllipse(ctx, ...g.boneLeft, "rgba(32, 38, 45, 0.82)");
  fillEllipse(ctx, ...g.boneRight, "rgba(32, 38, 45, 0.82)");

  fillEllipse(ctx, ...g.obturatorLeft, "rgba(72, 82, 92, 0.92)");
  fillEllipse(ctx, ...g.obturatorRight, "rgba(72, 82, 92, 0.92)");

  fillEllipse(ctx, ...g.bladder, "rgba(174, 184, 178, 0.82)");
  fillEllipse(ctx, ...g.rectum, "rgba(31, 35, 38, 0.98)");
  strokeEllipse(ctx, ...g.rectum, "rgba(122, 132, 136, 0.82)", 12);

  fillEllipse(ctx, ...g.seminalLeft, "rgba(124, 134, 139, 0.88)");
  fillEllipse(ctx, ...g.seminalRight, "rgba(124, 134, 139, 0.88)");
  fillEllipse(ctx, ...g.pz, "rgba(100, 112, 122, 0.96)");
  fillEllipse(ctx, ...g.tz, "rgba(153, 163, 160, 0.88)");

  fillEllipse(ctx, ...g.nvbLeft, "rgba(184, 190, 184, 0.86)");
  fillEllipse(ctx, ...g.nvbRight, "rgba(184, 190, 184, 0.86)");

  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(360, 18);
  ctx.lineTo(360, 702);
  ctx.moveTo(18, 360);
  ctx.lineTo(702, 360);
  ctx.stroke();

  ctx.restore();
}

function drawMask(targetId) {
  const g = shapeConfig();
  const color = state.color;
  const alpha = state.opacity;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;

  if (targetId === "bladder") {
    fillEllipse(ctx, ...g.bladder, color);
  }

  if (targetId === "bone") {
    strokeEllipse(ctx, ...g.boneLeft, color, 26);
    strokeEllipse(ctx, ...g.boneRight, color, 26);
  }

  if (targetId === "obturator") {
    fillEllipse(ctx, ...g.obturatorLeft, color);
    fillEllipse(ctx, ...g.obturatorRight, color);
  }

  if (targetId === "pz") {
    fillEllipse(ctx, ...g.pz, color);
  }

  if (targetId === "tz") {
    fillEllipse(ctx, ...g.tz, color);
  }

  if (targetId === "rectum") {
    strokeEllipse(ctx, ...g.rectum, color, 18);
  }

  if (targetId === "seminal") {
    fillEllipse(ctx, ...g.seminalLeft, color);
    fillEllipse(ctx, ...g.seminalRight, color);
  }

  if (targetId === "nvb") {
    fillEllipse(ctx, ...g.nvbLeft, color);
    fillEllipse(ctx, ...g.nvbRight, color);
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function renderCanvas() {
  drawBaseImage();

  if (state.activeTarget) {
    drawMask(state.activeTarget.id);
  }
}

function renderStatus() {
  const currentCase = CASES[state.caseId];
  viewerTitle.textContent = currentCase.title;
  sliceLabel.textContent = `Slice ${state.slice} / 32`;
  opacityValue.textContent = `${Math.round(state.opacity * 100)}%`;

  if (state.activeTarget) {
    targetMeta.textContent = state.activeTarget.label;
    targetText.textContent = state.activeTarget.short;
    exportBtn.disabled = false;
  } else {
    targetMeta.textContent = "No target selected";
    targetText.textContent = "None";
    exportBtn.disabled = true;
  }

  setActiveButton();
}

function renderHistory() {
  if (state.history.length === 0) {
    historyList.innerHTML = '<span class="empty-state">No generated masks yet.</span>';
    return;
  }

  historyList.innerHTML = "";
  state.history.slice(0, 6).forEach((item) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "history-chip";
    chip.textContent = item.short;
    chip.addEventListener("click", () => {
      promptInput.value = item.short;
      analyzeTarget(item, 500);
    });
    historyList.appendChild(chip);
  });
}

function setFeedback(message, type = "") {
  promptFeedback.textContent = message;
  promptFeedback.className = `feedback-line ${type}`.trim();
}

function addHistory(target) {
  state.history = [target, ...state.history.filter((item) => item.id !== target.id)];
  renderHistory();
}

function analyzeTarget(target, delay = null) {
  if (state.isAnalyzing) {
    return;
  }

  const latency = delay ?? Math.round(760 + Math.random() * 640);
  state.isAnalyzing = true;
  analyzeBtn.disabled = true;
  scanOverlay.classList.remove("hidden");
  scanOverlayText.textContent = `AI analyzing ${target.short}`;
  statusText.textContent = "Analyzing";
  latencyText.textContent = "--";
  setFeedback(`Mapped prompt to ${target.label}.`, "success");

  window.setTimeout(() => {
    state.activeTarget = target;
    state.isAnalyzing = false;
    analyzeBtn.disabled = false;
    scanOverlay.classList.add("hidden");
    statusText.textContent = "Mask generated";
    latencyText.textContent = `${latency} ms`;
    addHistory(target);
    renderCanvas();
    renderStatus();
  }, latency);
}

function handleAnalyze() {
  const target = resolvePrompt(promptInput.value);

  if (!target) {
    state.activeTarget = null;
    statusText.textContent = "Unsupported prompt";
    latencyText.textContent = "--";
    setFeedback("Unsupported target. Try bladder, rectum, PZ, TZ, seminal vesicle, obturator, bone, or NVB.", "error");
    renderCanvas();
    renderStatus();
    return;
  }

  analyzeTarget(target);
}

function resetView() {
  const currentCase = CASES[state.caseId];
  state.slice = currentCase.sliceBase;
  state.activeTarget = null;
  state.history = [];
  sliceSlider.value = String(state.slice);
  statusText.textContent = "Ready";
  latencyText.textContent = "--";
  setFeedback("Ready to parse a supported pelvic structure.");
  renderHistory();
  renderCanvas();
  renderStatus();
}

function exportPng() {
  const targetName = state.activeTarget ? state.activeTarget.short.replace(/\s+/g, "-") : "overlay";
  const anchor = document.createElement("a");
  anchor.download = `promptmask-${state.caseId}-${targetName}.png`;
  anchor.href = canvas.toDataURL("image/png");
  anchor.click();
}

caseSelect.addEventListener("change", () => {
  state.caseId = caseSelect.value;
  resetView();
});

sliceSlider.addEventListener("input", () => {
  state.slice = Number(sliceSlider.value);
  renderCanvas();
  renderStatus();
});

opacitySlider.addEventListener("input", () => {
  state.opacity = Number(opacitySlider.value) / 100;
  renderCanvas();
  renderStatus();
});

document.querySelectorAll(".swatch").forEach((swatch) => {
  swatch.addEventListener("click", () => {
    state.color = swatch.dataset.color;
    document.querySelectorAll(".swatch").forEach((item) => item.classList.remove("active"));
    swatch.classList.add("active");
    renderCanvas();
  });
});

promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleAnalyze();
  }
});

analyzeBtn.addEventListener("click", handleAnalyze);
resetViewBtn.addEventListener("click", resetView);
exportBtn.addEventListener("click", exportPng);

renderTargetButtons();
resetView();
