console.log("Vibert 2020-06-07");

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (isMobile) {
  console.log("[mobile]");
}
const { Part } = Tone;
const BPM = 120;
const COLORS = [
  // "rgb(255, 178, 230)",
  // "rgb(140, 255, 218)",
  // "rgb(229, 117, 66)",
  // "rgb(230, 194, 41)",
  // "rgb(30, 150, 252)",
  // "rgb(162, 214, 249)",
  "rgb(55, 63, 255)",
  "rgb(55, 63, 255)",
  "rgba(255, 255, 232, 1)",
  "rgb(55, 63, 255)",
];

const MINOR_SCREEN_RATIO = 0.3;

const LOWER_BAR_RATIO = 0.6;
const HIGHER_BAR_RATIO = 0.3;
const GRID_RATIO = isMobile ? 0.18 : 0.27;
const DISTANCE_RATIO = isMobile ? 0.7 : 0.6;
const RADIO_WIDTH_RATIO = isMobile ? 0.7 : 0.8;

const playButtonTip = document.getElementById("play-btn-tip");
const submitButton = document.getElementById("canvas-text-left");
const stepsElement = document.getElementById("play-btn");
const canvasLayer = document.getElementById("panel-container");
const endingButtonDivElement = document.getElementById("layer-button-div");
const loadingTextElement = document.getElementById("loading-div");
const commentTextElement = document.getElementById("comment");
const playAgainButton = document.getElementById("play-again-btn");
const canvasContainer = document.getElementById("canvas-container");
const splashPlayButton = document.getElementById("splash-play-btn");

let part;
const synth = new Tone.PolySynth(3, Tone.Synth, {
  oscillator: {
    // "type": "fatsawtooth",
    type: "triangle8",
    // "type": "square",
    count: 1,
    spread: 30,
  },
  envelope: {
    attack: 0.01,
    decay: 0.1,
    sustain: 0.5,
    release: 0.4,
    attackCurve: "exponential",
  },
}).toMaster();
let leftMelody = presetMelodies["Twinkle"];
let rightMelody = presetMelodies["Bounce"];
let middleMelody;

let interpolations;
let numberOfInterpolations = 3;
let ansIndex = 2;
let selectedIndex = -1;
let playingMelodyIndex = 0;
let steps = 0;
let playing = true;
let won = false;
let hoverBlockIndex = -1;
let hoverRadioIndex = -1;

// new variables

// canvas initialization
const canvas = document.getElementById("play-canvas");
canvas.width = document.getElementById("canvas-container").clientWidth;
canvas.height = document.getElementById("canvas-container").clientHeight;

if (!canvas.getContext) {
  console.log("<canvas> not supported.");
}

// music initialization
let nOfBlocks = 5;
let melodies = [];
let destinationMelodies = [];
let positions = [];
let displayPositions = [];
let displayRotateParas = [
  { freq: 0.1, phase: 1.5 },
  { freq: 0.11, phase: 0.5 },
  { freq: 0.09, phase: 0.1 },
  { freq: 0.12, phase: 2.5 },
  { freq: 0.08, phase: 1.0 },
];

const audioContext = Tone.context;
let editing = false;
let waitingForResponse = false;
let currentUrlId;
let pianoroll;
let events;
let inputPianoroll;
let inputEvents;
let pianoLoading = true;
let modelLoading = true;
const mvae = new music_vae.MusicVAE(
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small"
);
initMelodiesAndPositions();
getMelodies();
const piano = SampleLibrary.load({
  instruments: "piano",
});
const playPianoNote = (time = 0, pitch = 55, length = 8, vol = 0.3) => {
  // console.log("time", time);
  // console.log("play currentTime", audioContext.now());
  // console.log("pitch", pitch);
  piano.triggerAttackRelease(
    Tone.Frequency(pitch, "midi"),
    length * 0.5,
    time,
    vol
  );
};
Tone.Buffer.on("load", () => {
  // piano.sync();
  const reverb = new Tone.JCReverb(0.5).toMaster();
  piano.connect(reverb);
  pianoLoading = false;
  document.getElementById("splash-play-btn").classList.add("activated");
  console.log("Samples loaded");
});

// events

splashPlayButton.addEventListener("click", async (e) => {
  document.getElementById("wrapper").style.visibility = "visible";
  const splash = document.getElementById("splash");
  splash.style.opacity = 0;
  setTimeout(() => {
    splash.style.display = "none";
  }, 300);
  if (audioContext.state == "suspended") {
    console.log("audioContext.resume");
    audioContext.resume();
  }

  setup();
  draw();
});
window.addEventListener("resize", () => {
  const canvas = document.getElementById("play-canvas");
  canvas.width = document.getElementById("canvas-container").clientWidth;
  canvas.height = document.getElementById("canvas-container").clientHeight;
});
canvasContainer.addEventListener("mousemove", (e) => {
  const { clientX, clientY } = e;
  const { width, height } = canvas;
  let canvasRect = canvas.getBoundingClientRect();
  const mouseX = clientX - canvasRect.left;
  const mouseY = clientY - canvasRect.top;

  const gridWidth = width * GRID_RATIO;

  hoverRadioIndex = -1;
  hoverBlockIndex = -1;

  if (mouseX < width * MINOR_SCREEN_RATIO) {
    hoverBlockIndex = nOfBlocks;
  }

  for (let i = 0; i < nOfBlocks; i++) {
    if (
      Math.abs(
        mouseX -
          positions[i].x * (1 - MINOR_SCREEN_RATIO) * width -
          MINOR_SCREEN_RATIO * width
      ) <
        gridWidth * 0.5 &&
      Math.abs(mouseY - positions[i].y * height) < gridWidth * 0.5
    ) {
      hoverBlockIndex = i;
    }
  }
});
canvasContainer.addEventListener("click", (e) => {
  if (!playing || modelLoading) {
    return;
  }

  const { clientX, clientY } = e;
  const { width, height } = canvas;
  let canvasRect = canvas.getBoundingClientRect();
  const mouseX = clientX - canvasRect.left;
  const mouseY = clientY - canvasRect.top;

  const gridWidth = width * GRID_RATIO;

  if (mouseX < width * MINOR_SCREEN_RATIO) {
    playingMelodyIndex = 5;
    playMelody(melodies[5]);
  }

  for (let i = 0; i < nOfBlocks; i++) {
    if (
      Math.abs(
        mouseX -
          positions[i].x * (1 - MINOR_SCREEN_RATIO) * width -
          MINOR_SCREEN_RATIO * width
      ) <
        gridWidth * 0.5 &&
      Math.abs(mouseY - positions[i].y * height) < gridWidth * 0.5
    ) {
      if (i !== 0) {
        selectedIndex = i;
      }
      playingMelodyIndex = i;
      playMelody(melodies[i]);
    }
  }
});
submitButton.addEventListener("click", (e) => {
  if (selectedIndex === -1) {
    return;
  }

  if (part) {
    part.stop();
  }

  // 1. replace melodies[0] with the selected
  melodies[0] = melodies[selectedIndex];
  selectedIndex = -1;
  playingMelodyIndex = -1;

  // 2. increment the steps
  updateSteps(steps + 1);

  // 3. get loading layer
  modelLoading = false;
  canvasLayer.style.display = "flex";

  // 4. use the model
  getMelodies();
});
playAgainButton.addEventListener("click", (e) => {
  e.stopPropagation();

  loadingTextElement.style.display = "block";
  endingButtonDivElement.style.display = "none";

  reset();
});
canvasLayer.addEventListener("click", (e) => {
  e.stopPropagation();
});
// methods
function initMelodiesAndPositions() {
  melodies[0] = presetMelodies["Twinkle"];
  melodies[5] = presetMelodies["Bounce"];

  // placeholders
  melodies[1] = presetMelodies["Arpeggiated"];
  melodies[2] = presetMelodies["Dense"];
  melodies[3] = presetMelodies["Melody 1"];
  melodies[4] = presetMelodies["Melody 2"];

  destinationMelodies[0] = melodies[5];
  destinationMelodies[1] = presetMelodies["Arpeggiated"];
  destinationMelodies[2] = presetMelodies["Dense"];
  destinationMelodies[3] = presetMelodies["Melody 1"];
  // destinationMelodies[4] = presetMelodies["Melody 2"];

  positions[0] = { x: 0.5, y: 0.5 };
  positions[1] = { x: 0.2, y: 0.25 };
  positions[2] = { x: 0.8, y: 0.25 };
  positions[3] = { x: 0.2, y: 0.75 };
  positions[4] = { x: 0.8, y: 0.75 };

  displayPositions = positions.map(({ x, y }) => ({
    x,
    y,
  }));
}
function setup() {
  Tone.Transport.start();
  Tone.Transport.bpm.value = BPM;
}
function draw() {
  // do things
  let ctx = canvas.getContext("2d");
  const { width, height } = ctx.canvas;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255, 255, 255, 1)";
  ctx.fillRect(0, 0, width, height);

  drawPatterns(ctx);

  requestAnimationFrame(() => {
    draw();
  });
}

function drawPatterns(ctx) {
  drawLayout(ctx);
  drawTarget(ctx);
  drawMap(ctx);
}

function drawLayout(ctx) {
  const { width, height } = ctx.canvas;
  const barWidth = 10;
  const minorWidth = width * MINOR_SCREEN_RATIO;
  ctx.fillStyle = "rgba(0, 0, 200, 0.6)";
  ctx.fillRect(minorWidth, 0, barWidth, height);
  ctx.fillStyle = "rgba(0, 0, 200, 0.3)";
  ctx.fillRect(0, 0, minorWidth, height);
}

function drawTarget(ctx) {
  const { width, height } = ctx.canvas;
  const gridWidth = height * GRID_RATIO;
  const cornerRadius = height * 0.05;
  const ww = width * MINOR_SCREEN_RATIO;

  ctx.save();
  ctx.strokeStyle = COLORS[3];
  ctx.lineWidth = 3;
  let large = hoverBlockIndex === 5 ? 1.05 : 1;
  let gw = gridWidth * large;
  ctx.translate((ww - gw) * 0.5, (height - gw) * 0.5);
  ctx.fillStyle = "rgb(255, 255, 255)";
  roundRect(
    ctx,
    0,
    0,
    gw,
    gw,
    {
      tl: cornerRadius,
      tr: cornerRadius,
      bl: cornerRadius,
      br: cornerRadius,
    },
    true,
    true
  );
  if (melodies[5]) {
    drawMelody(ctx, gw, gw, melodies[5], playingMelodyIndex === 5);
  }
  ctx.restore();
}

function drawMap(ctx) {
  const { width, height } = ctx.canvas;
  const gridWidth = height * GRID_RATIO;
  const cornerRadius = height * 0.05;
  const ww = width * (1 - MINOR_SCREEN_RATIO);

  ctx.save();
  ctx.translate(width * MINOR_SCREEN_RATIO, 0);
  const t = Date.now();

  for (let i = 1; i < nOfBlocks; i++) {
    const { freq, phase } = displayRotateParas[i];
    displayPositions[i].x =
      positions[i].x + Math.sin(freq * t * 0.01 + phase) * 0.01;
    displayPositions[i].y =
      positions[i].y + Math.cos(freq * t * 0.01 + phase) * 0.01;

    const startX = displayPositions[0].x * ww;
    const startY = displayPositions[0].y * height;

    const endX = displayPositions[i].x * ww;
    const endY = displayPositions[i].y * height;
    ctx.save();
    ctx.strokeStyle = COLORS[3];
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      startX,
      endY,
      (startX + endX) * 0.5,
      (startY + endY) * 0.5
    );
    ctx.quadraticCurveTo(endX, startY, endX, endY);
    ctx.stroke();
    ctx.restore();
  }
  for (let i = 0; i < nOfBlocks; i++) {
    let large = hoverBlockIndex === i ? 1.05 : 1;
    const gw = gridWidth * large;
    const gridPositionX = displayPositions[i].x * ww - gw * 0.5;
    const gridPositionY = displayPositions[i].y * height - gw * 0.5;

    ctx.save();
    ctx.translate(gridPositionX, gridPositionY);
    ctx.strokeStyle = COLORS[3];
    ctx.fillStyle = "rgb(255, 255, 255)";
    if (i === selectedIndex) {
      ctx.fillStyle = COLORS[3];
    }
    ctx.lineWidth = 3;
    roundRect(
      ctx,
      0,
      0,
      gw,
      gw,
      {
        tl: cornerRadius,
        tr: cornerRadius,
        bl: cornerRadius,
        br: cornerRadius,
      },
      true,
      true
    );

    // draw melody or drum patterns
    if (melodies[i]) {
      const color = i === selectedIndex ? "#fff" : COLORS[3];
      drawMelody(ctx, gw, gw, melodies[i], i === playingMelodyIndex, color);
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawMelody(
  ctx,
  width,
  height,
  melody,
  drawProgress = false,
  color = COLORS[3]
) {
  const { notes, totalQuantizedSteps } = melody;
  const wUnit = width / totalQuantizedSteps;
  const hUnit = height / 48;
  for (let i = 0; i < notes.length; i++) {
    const { pitch, quantizedStartStep, quantizedEndStep } = notes[i];
    if (pitch < 96 && pitch > 48) {
      ctx.save();
      ctx.translate(quantizedStartStep * wUnit, (96 - pitch) * hUnit);

      ctx.fillStyle = color;

      if (drawProgress && part && part.state === "started" && part.progress) {
        if (
          part.progress > quantizedStartStep / totalQuantizedSteps &&
          part.progress < quantizedEndStep / totalQuantizedSteps
        ) {
          ctx.fillStyle = "rgba(0, 150, 0)";
        }
      }
      const w = (quantizedEndStep - quantizedStartStep) * wUnit * 0.85;
      ctx.fillRect(0, 0, w, hUnit);
      ctx.restore();
    }
  }

  if (drawProgress && part && part.state === "started" && part.progress) {
    let alpha = 1;
    if (part.progress < 0.2) {
      alpha = Math.pow(part.progress / 0.2, 2);
    } else if (part.progress > 0.8) {
      alpha = Math.pow((1 - part.progress) / 0.2, 2);
    }
    ctx.fillStyle = `rgba(0, 150, 0, ${alpha})`;
    ctx.fillRect(width * part.progress, 0, 5, height);
  }
}

function playMelody(melody) {
  const notes = melody.notes.map((note) => {
    const s = note.quantizedStartStep;
    return {
      time: `${Math.floor(s / 16)}:${Math.floor(s / 4) % 4}:${s % 4}`,
      note: Tone.Frequency(note.pitch, "midi"),
      length: note.quantizedEndStep - note.quantizedStartStep,
    };
  });

  if (part) {
    part.stop();
  }

  part = new Part((time, value) => {
    playPianoNote(time, value.note, value.length);
  }, notes);
  part.loop = 1;
  part.loopEnd = "2:0:0";
  part.start("+0.1");
  part.stop("+2m");
}
function updateSteps(s) {
  steps = s;
  stepsElement.textContent = `steps: ${steps}`;
}

async function getMelodies() {
  const scale = 4;

  const [nowTensor, destTensors, targetTensor] = await Promise.all([
    mvae.encode([melodies[0]]),
    mvae.encode(destinationMelodies),
    mvae.encode([melodies[nOfBlocks]]),
  ]);

  // console.log("distance: ", nowTensor.sub(targetTensor).print());
  const [dist] = await nowTensor.sub(targetTensor).norm().data();
  console.log("dist", dist);
  if (dist < 0.1) {
    canvasLayer.style.display = "flex";
    loadingTextElement.style.display = "none";
    endingButtonDivElement.style.display = "block";
    document.getElementById("final-score").textContent = steps;

    if (steps < 5) {
      commentTextElement.textContent = "Latent guru arise..!";
    } else if (steps < 10) {
      commentTextElement.textContent = "Latent master is you!";
    } else if (steps < 15) {
      commentTextElement.textContent = "You did great!";
    } else if (steps < 20) {
      commentTextElement.textContent = "Practice takes time!";
    } else {
      commentTextElement.textContent = "go go go!";
    }

    return;
  }

  let tensors = tf.stack(Array(4).fill(nowTensor)).reshape([4, 256]);

  // console.log("tensors", tensors);
  // console.log("dest tensors", destTensors);

  const diffTensors = destTensors.sub(tensors);
  let norms = tf
    .stack(Array(256).fill(diffTensors.norm(undefined, 1)), 1)
    .reshape([4, 256]);
  tensors = tensors.add(diffTensors.div(norms).mul(tf.scalar(scale)));

  const newMelodies = await mvae.decode(tensors);
  melodies.splice(1, 4, ...newMelodies);

  await delay(500);

  modelLoading = false;
  canvasLayer.style.display = "none";
}

async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

function reset() {
  updateSteps(0);
  initMelodiesAndPositions();
  getMelodies();
}
