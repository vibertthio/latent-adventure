// generates an array where indices correspond to midi notes
const everyNote = "C,C#,D,D#,E,F,F#,G,G#,A,A#,B,"
  .repeat(20)
  .split(",")
  .map(function (x, i) {
    return x + "" + Math.floor(i / 12);
  });

//returns the midi pitch value for the given note.
//returns -1 if not found
function toMidi(note) {
  return everyNote.indexOf(note);
}

function midi(m) {
  return Tone.Frequency(m, "midi");
}
function toDb(value) {
  return 20 * Math.log(1 - value);
}

const presetMelodies = {
  Twinkle: {
    notes: [
      { pitch: 60, quantizedStartStep: 0, quantizedEndStep: 2 },
      { pitch: 60, quantizedStartStep: 2, quantizedEndStep: 4 },
      { pitch: 67, quantizedStartStep: 4, quantizedEndStep: 6 },
      { pitch: 67, quantizedStartStep: 6, quantizedEndStep: 8 },
      { pitch: 69, quantizedStartStep: 8, quantizedEndStep: 10 },
      { pitch: 69, quantizedStartStep: 10, quantizedEndStep: 12 },
      { pitch: 67, quantizedStartStep: 12, quantizedEndStep: 16 },
      { pitch: 65, quantizedStartStep: 16, quantizedEndStep: 18 },
      { pitch: 65, quantizedStartStep: 18, quantizedEndStep: 20 },
      { pitch: 64, quantizedStartStep: 20, quantizedEndStep: 22 },
      { pitch: 64, quantizedStartStep: 22, quantizedEndStep: 24 },
      { pitch: 62, quantizedStartStep: 24, quantizedEndStep: 26 },
      { pitch: 62, quantizedStartStep: 26, quantizedEndStep: 28 },
      { pitch: 60, quantizedStartStep: 28, quantizedEndStep: 32 },
    ],
    quantizationInfo: { stepsPerQuarter: 4 },
    tempos: [{ time: 0, qpm: 120 }],
    totalQuantizedSteps: 32,
  },
  Sparse: {
    notes: [
      { pitch: 64, quantizedStartStep: 0, quantizedEndStep: 1 },
      { pitch: 62, quantizedStartStep: 1, quantizedEndStep: 2 },
      { pitch: 64, quantizedStartStep: 2, quantizedEndStep: 3 },
      { pitch: 65, quantizedStartStep: 3, quantizedEndStep: 4 },
      { pitch: 67, quantizedStartStep: 4, quantizedEndStep: 8 },
      { pitch: 60, quantizedStartStep: 16, quantizedEndStep: 17 },
      { pitch: 59, quantizedStartStep: 17, quantizedEndStep: 18 },
      { pitch: 60, quantizedStartStep: 18, quantizedEndStep: 19 },
      { pitch: 62, quantizedStartStep: 19, quantizedEndStep: 20 },
      { pitch: 64, quantizedStartStep: 20, quantizedEndStep: 24 },
    ],
    quantizationInfo: { stepsPerQuarter: 4 },
    tempos: [{ time: 0, qpm: 120 }],
    totalQuantizedSteps: 32,
  },
  Arpeggiated: {
    notes: [
      { pitch: 48, quantizedStartStep: 0, quantizedEndStep: 2 },
      { pitch: 52, quantizedStartStep: 2, quantizedEndStep: 4 },
      { pitch: 55, quantizedStartStep: 4, quantizedEndStep: 6 },
      { pitch: 60, quantizedStartStep: 6, quantizedEndStep: 8 },
      { pitch: 64, quantizedStartStep: 8, quantizedEndStep: 10 },
      { pitch: 67, quantizedStartStep: 10, quantizedEndStep: 12 },
      { pitch: 64, quantizedStartStep: 12, quantizedEndStep: 14 },
      { pitch: 60, quantizedStartStep: 14, quantizedEndStep: 16 },
      { pitch: 57, quantizedStartStep: 16, quantizedEndStep: 18 },
      { pitch: 60, quantizedStartStep: 18, quantizedEndStep: 20 },
      { pitch: 64, quantizedStartStep: 20, quantizedEndStep: 22 },
      { pitch: 69, quantizedStartStep: 22, quantizedEndStep: 24 },
      { pitch: 72, quantizedStartStep: 24, quantizedEndStep: 26 },
      { pitch: 76, quantizedStartStep: 26, quantizedEndStep: 28 },
      { pitch: 72, quantizedStartStep: 28, quantizedEndStep: 30 },
      { pitch: 69, quantizedStartStep: 30, quantizedEndStep: 32 },
    ],
    quantizationInfo: { stepsPerQuarter: 4 },
    tempos: [{ time: 0, qpm: 120 }],
    totalQuantizedSteps: 32,
  },
  Dense: {
    notes: [
      { pitch: 72, quantizedStartStep: 0, quantizedEndStep: 1 },
      { pitch: 75, quantizedStartStep: 1, quantizedEndStep: 2 },
      { pitch: 80, quantizedStartStep: 2, quantizedEndStep: 3 },
      { pitch: 75, quantizedStartStep: 3, quantizedEndStep: 4 },
      { pitch: 84, quantizedStartStep: 4, quantizedEndStep: 5 },
      { pitch: 80, quantizedStartStep: 5, quantizedEndStep: 6 },
      { pitch: 75, quantizedStartStep: 6, quantizedEndStep: 7 },
      { pitch: 72, quantizedStartStep: 7, quantizedEndStep: 8 },
      { pitch: 74, quantizedStartStep: 8, quantizedEndStep: 9 },
      { pitch: 77, quantizedStartStep: 9, quantizedEndStep: 10 },
      { pitch: 82, quantizedStartStep: 10, quantizedEndStep: 11 },
      { pitch: 77, quantizedStartStep: 11, quantizedEndStep: 12 },
      { pitch: 86, quantizedStartStep: 12, quantizedEndStep: 13 },
      { pitch: 82, quantizedStartStep: 13, quantizedEndStep: 14 },
      { pitch: 77, quantizedStartStep: 14, quantizedEndStep: 15 },
      { pitch: 74, quantizedStartStep: 15, quantizedEndStep: 16 },
      { pitch: 75, quantizedStartStep: 16, quantizedEndStep: 17 },
      { pitch: 79, quantizedStartStep: 17, quantizedEndStep: 18 },
      { pitch: 84, quantizedStartStep: 18, quantizedEndStep: 19 },
      { pitch: 79, quantizedStartStep: 19, quantizedEndStep: 20 },
      { pitch: 87, quantizedStartStep: 20, quantizedEndStep: 21 },
      { pitch: 84, quantizedStartStep: 21, quantizedEndStep: 22 },
      { pitch: 79, quantizedStartStep: 22, quantizedEndStep: 23 },
      { pitch: 75, quantizedStartStep: 23, quantizedEndStep: 24 },
      { pitch: 75, quantizedStartStep: 24, quantizedEndStep: 25 },
      { pitch: 79, quantizedStartStep: 25, quantizedEndStep: 26 },
      { pitch: 84, quantizedStartStep: 26, quantizedEndStep: 27 },
      { pitch: 84, quantizedStartStep: 27, quantizedEndStep: 28 },
      { pitch: 87, quantizedStartStep: 28, quantizedEndStep: 29 },
      { pitch: 91, quantizedStartStep: 29, quantizedEndStep: 30 },
      { pitch: 84, quantizedStartStep: 30, quantizedEndStep: 31 },
      { pitch: 91, quantizedStartStep: 31, quantizedEndStep: 32 },
    ],
    quantizationInfo: { stepsPerQuarter: 4 },
    tempos: [{ time: 0, qpm: 120 }],
    totalQuantizedSteps: 32,
  },
  Bounce: {
    notes: [
      { pitch: 64, quantizedStartStep: 0, quantizedEndStep: 2 },
      { pitch: 60, quantizedStartStep: 2, quantizedEndStep: 4 },
      { pitch: 64, quantizedStartStep: 4, quantizedEndStep: 6 },
      { pitch: 60, quantizedStartStep: 6, quantizedEndStep: 8 },
      { pitch: 65, quantizedStartStep: 8, quantizedEndStep: 10 },
      { pitch: 60, quantizedStartStep: 10, quantizedEndStep: 12 },
      { pitch: 65, quantizedStartStep: 12, quantizedEndStep: 14 },
      { pitch: 60, quantizedStartStep: 14, quantizedEndStep: 16 },
      { pitch: 67, quantizedStartStep: 16, quantizedEndStep: 18 },
      { pitch: 60, quantizedStartStep: 18, quantizedEndStep: 20 },
      { pitch: 67, quantizedStartStep: 20, quantizedEndStep: 22 },
      { pitch: 60, quantizedStartStep: 22, quantizedEndStep: 24 },
      { pitch: 62, quantizedStartStep: 24, quantizedEndStep: 26 },
      { pitch: 59, quantizedStartStep: 26, quantizedEndStep: 28 },
      { pitch: 62, quantizedStartStep: 28, quantizedEndStep: 30 },
      { pitch: 59, quantizedStartStep: 30, quantizedEndStep: 32 },
    ],
    quantizationInfo: { stepsPerQuarter: 4 },
    tempos: [{ time: 0, qpm: 120 }],
    totalQuantizedSteps: 32,
  },
  "Melody 1": {
    notes: [
      { pitch: toMidi("A4"), quantizedStartStep: 0, quantizedEndStep: 4 },
      { pitch: toMidi("D5"), quantizedStartStep: 4, quantizedEndStep: 6 },
      { pitch: toMidi("E5"), quantizedStartStep: 6, quantizedEndStep: 8 },
      { pitch: toMidi("F5"), quantizedStartStep: 8, quantizedEndStep: 10 },
      { pitch: toMidi("D5"), quantizedStartStep: 10, quantizedEndStep: 12 },
      { pitch: toMidi("E5"), quantizedStartStep: 12, quantizedEndStep: 16 },
      { pitch: toMidi("C5"), quantizedStartStep: 16, quantizedEndStep: 20 },
      { pitch: toMidi("D5"), quantizedStartStep: 20, quantizedEndStep: 26 },
      { pitch: toMidi("A4"), quantizedStartStep: 26, quantizedEndStep: 28 },
      { pitch: toMidi("A4"), quantizedStartStep: 28, quantizedEndStep: 32 },
    ],
    quantizationInfo: { stepsPerQuarter: 4 },
    tempos: [{ time: 0, qpm: 120 }],
    totalQuantizedSteps: 32,
  },
  "Melody 2": {
    notes: [
      { pitch: 50, quantizedStartStep: 0, quantizedEndStep: 1 },
      { pitch: 53, quantizedStartStep: 1, quantizedEndStep: 2 },
      { pitch: 58, quantizedStartStep: 2, quantizedEndStep: 3 },
      { pitch: 58, quantizedStartStep: 3, quantizedEndStep: 4 },
      { pitch: 58, quantizedStartStep: 4, quantizedEndStep: 5 },
      { pitch: 53, quantizedStartStep: 5, quantizedEndStep: 6 },
      { pitch: 53, quantizedStartStep: 6, quantizedEndStep: 7 },
      { pitch: 53, quantizedStartStep: 7, quantizedEndStep: 8 },
      { pitch: 52, quantizedStartStep: 8, quantizedEndStep: 9 },
      { pitch: 55, quantizedStartStep: 9, quantizedEndStep: 10 },
      { pitch: 60, quantizedStartStep: 10, quantizedEndStep: 11 },
      { pitch: 60, quantizedStartStep: 11, quantizedEndStep: 12 },
      { pitch: 60, quantizedStartStep: 12, quantizedEndStep: 13 },
      { pitch: 60, quantizedStartStep: 13, quantizedEndStep: 14 },
      { pitch: 60, quantizedStartStep: 14, quantizedEndStep: 15 },
      { pitch: 52, quantizedStartStep: 15, quantizedEndStep: 16 },
      { pitch: 57, quantizedStartStep: 16, quantizedEndStep: 17 },
      { pitch: 57, quantizedStartStep: 17, quantizedEndStep: 18 },
      { pitch: 57, quantizedStartStep: 18, quantizedEndStep: 19 },
      { pitch: 65, quantizedStartStep: 19, quantizedEndStep: 20 },
      { pitch: 65, quantizedStartStep: 20, quantizedEndStep: 21 },
      { pitch: 65, quantizedStartStep: 21, quantizedEndStep: 22 },
      { pitch: 57, quantizedStartStep: 22, quantizedEndStep: 23 },
      { pitch: 57, quantizedStartStep: 23, quantizedEndStep: 24 },
      { pitch: 57, quantizedStartStep: 24, quantizedEndStep: 25 },
      { pitch: 57, quantizedStartStep: 25, quantizedEndStep: 26 },
      { pitch: 62, quantizedStartStep: 26, quantizedEndStep: 27 },
      { pitch: 62, quantizedStartStep: 27, quantizedEndStep: 28 },
      { pitch: 65, quantizedStartStep: 28, quantizedEndStep: 29 },
      { pitch: 65, quantizedStartStep: 29, quantizedEndStep: 30 },
      { pitch: 69, quantizedStartStep: 30, quantizedEndStep: 31 },
      { pitch: 69, quantizedStartStep: 31, quantizedEndStep: 32 },
    ],
    quantizationInfo: { stepsPerQuarter: 4 },
    tempos: [{ time: 0, qpm: 120 }],
    totalQuantizedSteps: 32,
  },
  "Get Luck": {
    notes: [
      { pitch: 50, quantizedStartStep: 0, quantizedEndStep: 5 },
      { pitch: 49, quantizedStartStep: 5, quantizedEndStep: 6 },
      { pitch: 50, quantizedStartStep: 6, quantizedEndStep: 7 },
      { pitch: 54, quantizedStartStep: 7, quantizedEndStep: 13 },
      { pitch: 54, quantizedStartStep: 13, quantizedEndStep: 14 },
      { pitch: 56, quantizedStartStep: 14, quantizedEndStep: 15 },
      { pitch: 57, quantizedStartStep: 15, quantizedEndStep: 21 },
      { pitch: 57, quantizedStartStep: 21, quantizedEndStep: 22 },
      { pitch: 59, quantizedStartStep: 22, quantizedEndStep: 23 },
      { pitch: 59, quantizedStartStep: 22, quantizedEndStep: 23 },
      { pitch: 56, quantizedStartStep: 23, quantizedEndStep: 31 },
      { pitch: 50, quantizedStartStep: 31, quantizedEndStep: 32 },
    ],
    quantizationInfo: { stepsPerQuarter: 4 },
    tempos: [{ time: 0, qpm: 120 }],
    totalQuantizedSteps: 32,
  },
  "Hey Jude": {
    notes: [
      { pitch: 52, quantizedStartStep: 0, quantizedEndStep: 4 },

      { pitch: 52, quantizedStartStep: 5, quantizedEndStep: 6 },
      { pitch: 55, quantizedStartStep: 6, quantizedEndStep: 7 },
      { pitch: 57, quantizedStartStep: 7, quantizedEndStep: 8 },
      { pitch: 50, quantizedStartStep: 8, quantizedEndStep: 12 },

      { pitch: 50, quantizedStartStep: 14, quantizedEndStep: 15 },
      { pitch: 52, quantizedStartStep: 15, quantizedEndStep: 16 },
      { pitch: 53, quantizedStartStep: 16, quantizedEndStep: 18 },

      { pitch: 60, quantizedStartStep: 18, quantizedEndStep: 21 },
      { pitch: 60, quantizedStartStep: 21, quantizedEndStep: 22 },
      { pitch: 59, quantizedStartStep: 22, quantizedEndStep: 23 },
      { pitch: 55, quantizedStartStep: 23, quantizedEndStep: 24 },
      { pitch: 57, quantizedStartStep: 24, quantizedEndStep: 25 },
      { pitch: 55, quantizedStartStep: 25, quantizedEndStep: 26 },
      { pitch: 53, quantizedStartStep: 26, quantizedEndStep: 27 },
      { pitch: 52, quantizedStartStep: 27, quantizedEndStep: 30 },

      { pitch: 55, quantizedStartStep: 31, quantizedEndStep: 32 },
    ],
    quantizationInfo: { stepsPerQuarter: 4 },
    tempos: [{ time: 0, qpm: 120 }],
    totalQuantizedSteps: 32,
  },
};

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === "undefined") {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius.br,
    y + height
  );
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}

function blendRGBColors(c0, c1, p) {
  const f = c0.split(", "),
    t = c1.split(", "),
    R = parseInt(f[0].slice(4)),
    G = parseInt(f[1]),
    B = parseInt(f[2]);
  return (
    "rgb( " +
    (Math.round((parseInt(t[0].slice(4)) - R) * p) + R) +
    ", " +
    (Math.round((parseInt(t[1]) - G) * p) + G) +
    ", " +
    (Math.round((parseInt(t[2]) - B) * p) + B) +
    ") "
  );
}
