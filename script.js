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
const LOWER_BAR_RATIO = 0.6;
const HIGHER_BAR_RATIO = 0.3;
const GRID_RATIO = isMobile ? 0.18 : 0.27;
const DISTANCE_RATIO = isMobile ? 0.7 : 0.6;
const RADIO_WIDTH_RATIO = isMobile ? 0.7 : 0.8;

const playButtonTip = document.getElementById("play-btn-tip");
const submitButton = document.getElementById("canvas-text-left");
const resultTextElement = document.getElementById("result-text");
const scoreElement = document.getElementById("play-btn");
const canvasLayer = document.getElementById("panel-container");
const endingButtonDivElement = document.getElementById("layer-button-div");
const loadingTextElement = document.getElementById("loading-div");
const commentTextElement = document.getElementById("comment");
const playAgainButton = document.getElementById("play-again-btn");

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
let score = 0;
let playing = true;
let won = false;
let hoverBlockIndex = -1;
let hoverRadioIndex = -1;

const canvas = document.getElementById("play-canvas");
canvas.width = document.getElementById("canvas-container").clientWidth;
canvas.height = document.getElementById("canvas-container").clientHeight;
const mousePosition = { x: 0, y: 0 };

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
// mvae.initialize();
mvae
  .interpolate([leftMelody, rightMelody], numberOfInterpolations + 2)
  .then((sample) => {
    interpolations = sample.slice(1, sample.length - 1);
    middleMelody = interpolations[ansIndex];
    canvasLayer.style.display = "none";
    modelLoading = false;
  });

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

if (!canvas.getContext) {
  console.log("<canvas> not supported.");
}

// events
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
window.addEventListener("resize", () => {
  const canvas = document.getElementById("play-canvas");
  canvas.width = document.getElementById("canvas-container").clientWidth;
  canvas.height = document.getElementById("canvas-container").clientHeight;
});

document
  .getElementById("canvas-container")
  .addEventListener("mousemove", (e) => {
    const { clientX, clientY } = e;
    const { width, height } = canvas;
    let canvasRect = canvas.getBoundingClientRect();
    const mouseX = clientX - canvasRect.left;
    const mouseY = clientY - canvasRect.top;
    hoverRadioIndex = -1;
    hoverBlockIndex = -1;
    if (
      Math.abs(mouseY - height * LOWER_BAR_RATIO) <
      height * GRID_RATIO * 0.5
    ) {
      const limit = width * DISTANCE_RATIO * RADIO_WIDTH_RATIO * 0.5;
      if (mouseX - width * 0.5 < -limit) {
        hoverBlockIndex = 0;
      } else if (mouseX - width * 0.5 > limit) {
        hoverBlockIndex = 1;
      } else {
        hoverRadioIndex = Math.floor(
          ((mouseX - width * (1 - DISTANCE_RATIO * RADIO_WIDTH_RATIO) * 0.5) /
            (width * DISTANCE_RATIO * RADIO_WIDTH_RATIO)) *
            numberOfInterpolations
        );
      }
    } else if (
      Math.abs(mouseY - height * HIGHER_BAR_RATIO) <
      height * GRID_RATIO * 0.5
    ) {
      hoverBlockIndex = 2;
    }
  });
document.getElementById("canvas-container").addEventListener("click", (e) => {
  if (!playing || modelLoading) {
    return;
  }

  const { clientX, clientY } = e;
  const { width, height } = canvas;
  let canvasRect = canvas.getBoundingClientRect();
  const mouseX = clientX - canvasRect.left;
  const mouseY = clientY - canvasRect.top;

  if (Math.abs(mouseY - height * LOWER_BAR_RATIO) < height * GRID_RATIO * 0.5) {
    const limit = width * DISTANCE_RATIO * RADIO_WIDTH_RATIO * 0.5;
    if (mouseX - width * 0.5 < -limit) {
      playingMelodyIndex = 0;
      playMelody(leftMelody);
    } else if (mouseX - width * 0.5 > limit) {
      playingMelodyIndex = 1;
      playMelody(rightMelody);
    } else {
      selectedIndex = Math.floor(
        ((mouseX - width * (1 - DISTANCE_RATIO * RADIO_WIDTH_RATIO) * 0.5) /
          (width * DISTANCE_RATIO * RADIO_WIDTH_RATIO)) *
          numberOfInterpolations
      );
    }
  } else if (
    Math.abs(mouseY - height * HIGHER_BAR_RATIO) <
    height * GRID_RATIO * 0.5
  ) {
    playingMelodyIndex = 2;
    playMelody(interpolations[ansIndex]);
  }
});
submitButton.addEventListener("click", (e) => {
  e.stopPropagation();
  submitButton.textContent = "ok";
  resultTextElement.style.display = "none";

  if (!playing) {
    // 0. cover the canvas with loading splash
    if (part) {
      part.stop();
    }

    canvasLayer.style.display = "flex";
    if (!won) {
      updateScore(0);
    }
    updateGame();
    return;
  }

  if (selectedIndex === -1) {
    return;
  }

  playing = false;
  // check asnwer

  console.log(`ans index: ${ansIndex}, select index: ${selectedIndex}`);
  if (selectedIndex === ansIndex) {
    submitButton.textContent = "Next";
    resultTextElement.style.display = "block";
    resultTextElement.textContent = "Good Job!";
    updateScore(score + 1);
    won = true;
  } else {
    // lose
    // submitButton.classList.toggle("lose");
    // resultTextElement.style.display = "block";
    // resultTextElement.textContent = "Oh no, you lost!";
    submitButton.textContent = "Oh no!";
    won = false;
    canvasLayer.style.display = "flex";
    loadingTextElement.style.display = "none";
    endingButtonDivElement.style.display = "block";
    document.getElementById("final-score").textContent = score;

    if (score < 5) {
      commentTextElement.textContent = "Practice takes time!";
    } else if (score < 10) {
      commentTextElement.textContent = "You know some latent!";
    } else if (score < 15) {
      commentTextElement.textContent = "You are almost master!";
    } else if (score < 20) {
      commentTextElement.textContent = "Latent master is you!";
    } else {
      commentTextElement.textContent = "Latent guru arise..";
    }
  }
});
playAgainButton.addEventListener("click", (e) => {
  e.stopPropagation();
  submitButton.textContent = "ok";
  resultTextElement.style.display = "none";

  loadingTextElement.style.display = "block";
  endingButtonDivElement.style.display = "none";
  updateScore(0);
  updateGame();
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

function drawPatterns(ctx) {
  const { width, height } = ctx.canvas;
  const distance = width * DISTANCE_RATIO;
  const gridWidth = height * GRID_RATIO;
  const cornerRadius = height * 0.05;

  // ctx.strokeStyle = "rgba(0, 0, 200, 1.0)";
  // ctx.lineWidth = 3;
  ctx.save();

  ctx.translate(width * 0.5, height * LOWER_BAR_RATIO);

  // interpolated melody
  ctx.save();
  ctx.strokeStyle = COLORS[3];
  ctx.lineWidth = 3;
  let large = hoverBlockIndex === 2 ? 1.05 : 1;
  let gw = gridWidth * large;
  ctx.translate(
    -gw * 0.5,
    -gw * 0.5 - height * (LOWER_BAR_RATIO - HIGHER_BAR_RATIO)
  );
  if (selectedIndex !== -1) {
    const d = width * DISTANCE_RATIO * RADIO_WIDTH_RATIO;
    ctx.translate(
      -0.5 * d + (d * (selectedIndex + 1)) / (numberOfInterpolations + 1),
      0
    );
    ctx.fillStyle = COLORS[3];
    ctx.fillRect(gw * 0.5 - 2, gw + 8, 4, 25);
    // ctx.translate(-0.5 * d, 0);
  }
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
    false,
    true
  );
  if (middleMelody) {
    drawMelody(ctx, gw, gw, middleMelody, playingMelodyIndex === 2);
  }
  ctx.restore();

  for (let side = 0; side < 2; side++) {
    let large = hoverBlockIndex === side ? 1.05 : 1;
    const gw = gridWidth * large;
    const gridPositionX = -gw * 0.5 + distance * (side - 0.5);
    const gridPositionY = -gw * 0.5;
    ctx.save();
    ctx.translate(gridPositionX, gridPositionY);
    // ctx.fillStyle = COLORS[side];
    ctx.strokeStyle = COLORS[3];
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
      false,
      true
    );

    // draw melody or drum patterns
    const melody = side === 0 ? leftMelody : rightMelody;
    drawMelody(ctx, gw, gw, melody, side === playingMelodyIndex);

    ctx.restore();
  }

  // radio
  for (let i = 1; i < numberOfInterpolations + 1; i++) {
    const unit = gridWidth * 0.08;
    const dd = distance * RADIO_WIDTH_RATIO;
    const d = dd / (numberOfInterpolations + 1);
    const ratio = 1 + Math.sin(Date.now() * 0.005) * 0.1;
    let u = ratio * unit;
    // const x = -dd * 0.5 + d * i - u * 0.5;
    // const y = -u * 0.5;

    // ctx.fillStyle = blendRGBColors(COLORS[1], COLORS[0], i / nOfSquares);
    // ctx.fillRect(x, y, unit * ratio, unit * ratio);

    const x = -dd * 0.5 + d * i;
    const y = 0;

    if (i === hoverRadioIndex + 1) {
      u = unit * 1.5;
    }

    if (i === selectedIndex + 1) {
      ctx.beginPath();
      ctx.arc(x, y, u * 0.7, 0, 2 * Math.PI);
      ctx.fillStyle = blendRGBColors(
        COLORS[1],
        COLORS[0],
        i / numberOfInterpolations
      );
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y, u, 0, 2 * Math.PI);
    ctx.strokeStyle = blendRGBColors(
      COLORS[1],
      COLORS[0],
      i / numberOfInterpolations
    );
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}

function drawMelody(ctx, width, height, melody, drawProgress = false) {
  const { notes, totalQuantizedSteps } = melody;
  const wUnit = width / totalQuantizedSteps;
  const hUnit = height / 48;
  for (let i = 0; i < notes.length; i++) {
    const { pitch, quantizedStartStep, quantizedEndStep } = notes[i];
    if (pitch < 96 && pitch > 48) {
      ctx.save();
      ctx.translate(quantizedStartStep * wUnit, (96 - pitch) * hUnit);
      // ctx.fillStyle = COLORS[side];
      // ctx.fillStyle = COLORS[2];
      ctx.fillStyle = COLORS[3];
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

function updateScore(s) {
  score = s;
  scoreElement.textContent = `score: ${score}`;
}

function updateGame() {
  numberOfInterpolations = Math.floor(score / 5) + 3;
  // 1. update left and right melody
  // 2. wait for interpolations of left and right
  // 3. get a new ansIndex (random)
  // 4. show the new game
  const keys = Object.keys(presetMelodies);
  const leftIndex = Math.floor(Math.random() * keys.length);
  let rightIndex = Math.floor(Math.random() * keys.length);
  while (leftIndex === rightIndex) {
    rightIndex = Math.floor(Math.random() * keys.length);
  }
  console.log(`left: ${keys[leftIndex]}, right: ${keys[rightIndex]}`);
  leftMelody = presetMelodies[keys[leftIndex]];
  rightMelody = presetMelodies[keys[rightIndex]];
  selectedIndex = -1;
  ansIndex = Math.floor(Math.random() * numberOfInterpolations);
  mvae
    .interpolate([leftMelody, rightMelody], numberOfInterpolations + 2)
    .then((sample) => {
      interpolations = sample.slice(1, sample.length - 1);
      middleMelody = interpolations[ansIndex];
      canvasLayer.style.display = "none";
      playing = true;
    });
}
