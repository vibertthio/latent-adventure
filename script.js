const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (isMobile) {
  console.log("[mobile]");
}

const EDIT_LOOP = true;
const BPM = 120;
const INITIAL_DATA_INDEX = 0;
const NUMBER_OF_NOTES = 36;
const NUMBER_OF_BARS = 8;
const NUMBER_OF_INPUT_BARS = 2;
const NOTE_EXTENSION = 15;
const NOTES_PER_BAR = 16;

const controlPlayButton = document.getElementById("play-btn");
const playButtonTip = document.getElementById("play-btn-tip");
const controlEditPlayButton = document.getElementById("edit-play-btn");

// events
window.addEventListener("resize", () => {
  const canvas = document.getElementById("play-canvas");
  canvas.width = document.getElementById("canvas-container").clientWidth;
  canvas.height = document.getElementById("canvas-container").clientHeight;
});
function startEditingMode() {
  const splash = document.getElementById("edit-splash");
  splash.style.display = "block";
  // splash.style.opacity = 0;
  stopMainSequencer(true, false);
  document.getElementById("panel-container").style.display = "none";
  setTimeout(() => {
    splash.style.opacity = 1;
    editCanvasRect = editCanvas.getBoundingClientRect();
    // splash.classList.add("show");
    editing = true;
  }, 10);

  const editCanvasContainer = document.getElementById("edit-canvas-container");
  editCanvas.width = editCanvasContainer.clientWidth;
  editCanvas.height = editCanvasContainer.clientHeight;
}
document.getElementById("edit-btn").addEventListener("click", () => {
  // startEditingMode();
});
document.getElementById("play-btn").addEventListener("click", () => {
  // // console.log("audio context state", audioContext.state);
  // if (audioContext.state == "suspended") {
  //   // console.log("audioContext.resume");
  //   audioContext.resume();
  // }
  // if (sequencer.state === "started") {
  //   stopMainSequencer();
  // } else {
  //   startMainSequencer();
  // }
});
document.getElementById("play-again-btn").addEventListener("click", (e) => {
  // if (audioContext.state == "suspended") {
  //   // console.log("audioContext.resume");
  //   audioContext.resume();
  // }
  // startMainSequencer();
  // e.stopPropagation();
});

// methods

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

function closeEditSplash() {
  const splash = document.getElementById("edit-splash");
  // splash.classList.remove("show");
  splash.style.opacity = 0;
  editing = false;
  setTimeout(() => {
    splash.style.display = "none";
  }, 500);
}
function drawPatterns(ctx) {
  const { width, height } = ctx.canvas;
  const distance = width * 0.6;

  ctx.fillStyle = "rgba(0, 0, 200, 0.3)";
  // ctx.strokeStyle = "rgba(0, 0, 200, 1.0)";
  // ctx.lineWidth = 3;
  for (let side = 0; side < 2; side++) {
    const gridWidth = height * 0.3;
    const cornerRadius = height * 0.05;
    const gridPositionX =
      width * 0.5 - gridWidth * 0.5 - distance * (side ? -0.5 : 0.5);
    const gridPositionY = height * 0.5 - gridWidth * 0.5;

    ctx.save();
    ctx.translate(gridPositionX, gridPositionY);
    roundRect(
      ctx,
      0,
      0,
      gridWidth,
      gridWidth,
      {
        tl: cornerRadius,
        tr: cornerRadius,
        bl: cornerRadius,
        br: cornerRadius,
      },
      true,
      false
    );

    // draw melody or drum patterns
    const melody = side ? presetMelodies["Twinkle"] : presetMelodies["Dense"];
    drawMelody(ctx, gridWidth, gridWidth, melody);
    ctx.restore();
  }
}

function drawMelody(ctx, width, height, melody) {
  const { notes, totalQuantizedSteps } = melody;
  const wUnit = width / totalQuantizedSteps;
  const hUnit = height / 48;
  for (let i = 0; i < notes.length; i++) {
    ctx.save();
    const { pitch, quantizedStartStep, quantizedEndStep } = notes[i];
    ctx.translate(quantizedStartStep * wUnit, (96 - pitch) * hUnit);
    ctx.fillStyle = "rgb(50, 60, 60)";
    const w = (quantizedEndStep - quantizedStartStep) * wUnit;
    ctx.fillRect(0, 0, w, hUnit);
    ctx.restore();
  }
}

function stopMainSequencer(cancelEnvelopes = true, showPanel = true) {
  controlPlayButton.textContent = "► play";
  beat = -1;
  sequencer.stop();
  sequencer.cancel(audioContext.now());
  if (cancelEnvelopes) {
    piano.volume.rampTo(-100, 0.5);
    piano.releaseAll(audioContext.now());
  } else {
    // piano.volume.rampTo(-100, 5);
  }

  if (showPanel) {
    document.getElementById("panel-container").style.display = "flex";
  }
}
function startMainSequencer() {
  // console.log("start time", audioContext.now());
  // piano.releaseAll(audioContext.now());
  piano.releaseAll("+0.05");
  controlPlayButton.textContent = "stop";
  piano.volume.rampTo(0, 0);
  // sequencer.start(audioContext.now());
  sequencer.start("+0.1");

  document.getElementById("panel-container").style.display = "none";
}

// audio
// const audioContext = new Tone.Context();
// const AudioContextFunc = window.AudioContext || window.webkitAudioContext;
// const audioContext = new AudioContextFunc();
const audioContext = Tone.context;
let editing = false;
let waitingForResponse = false;
let currentUrlId;
let pianoroll;
let events;
let inputPianoroll;
let inputEvents;
let pianoLoading = true;

const play = (time = 0, pitch = 55, length = 8, vol = 0.3) => {
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

let beat = -1;
const sequencer = new Tone.Sequence(
  (time, b) => {
    // console.log(`b[${b}], time: ${time}`);
    beat = b;
    const es = events[b];
    if (es) {
      es.forEach(({ note, length }) => {
        play(time, note + NUMBER_OF_NOTES, length * 0.2);
      });
    }
    if (b >= NUMBER_OF_BARS * NOTES_PER_BAR - 1) {
      // console.log(`b[${b}]: stop`);
      stopMainSequencer(false);
      beat = -1;
    }
  },
  Array(NUMBER_OF_BARS * NOTES_PER_BAR)
    .fill(null)
    .map((_, i) => i),
  "16n"
);

const canvas = document.getElementById("play-canvas");
canvas.width = document.getElementById("canvas-container").clientWidth;
canvas.height = document.getElementById("canvas-container").clientHeight;

if (!canvas.getContext) {
  console.log("<canvas> not supported.");
}

document
  .getElementById("splash-play-btn")
  .addEventListener("click", async (e) => {
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

var piano = SampleLibrary.load({
  instruments: "piano",
});
Tone.Buffer.on("load", function () {
  // piano.sync();
  const reverb = new Tone.JCReverb(0.5).toMaster();
  piano.connect(reverb);
  pianoLoading = false;
  document.getElementById("splash-play-btn").classList.add("activated");
  console.log("Samples loaded");
});

console.log("Vibert 2020-06-07");
