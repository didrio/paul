const paulAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

function Filter(type = 'lowpass', frequency = 800, q = 0, detune = 0, gain = 10) {
  this.props = { type, frequency, q, detune, gain };
  this.filters = [];
}

Filter.prototype.type = function(type) {
  this.props.type = type;
  this.filters.forEach(filter => filter.type = type);
}

Filter.prototype.frequency = function (frequency) {
  this.props.frequency = frequency;
  this.filters.forEach(filter => filter.frequency.value = frequency);
}

Filter.prototype.q = function (q) {
  this.props.q = q;
  this.filters.forEach(filter => filter.Q.value = q);
}

Filter.prototype.detune = function (detune) {
  this.props.detune = detune;
  this.filters.forEach(filter => filter.detune.value = detune);
}

Filter.prototype.gain = function (gain) {
  this.props.gain = gain;
  this.filters.forEach(filter => filter.gain.value = gain);
}

function Osc(note, wave = 'sine', octave = 4) {
  this.oscillator = new OscillatorNode(paulAudioCtx);
  this.gainNode = new GainNode(paulAudioCtx);
  this.pannerNode = new StereoPannerNode(paulAudioCtx);
  this.gainNode.gain.value = 0.1;
  this.gainNode.gain.minValue = 0;
  this.gainNode.gain.maxValue = 1.5;
  this.muted = false;
  this.multiplier = 1;
  this.oscillator.connect(this.gainNode);
  this.gainNode.connect(this.pannerNode);
  this.pannerNode.connect(paulAudioCtx.destination);
  this.lastNode = this.pannerNode;
  this.note(note).octave(octave).wave(wave);
}

Osc.prototype.to = function () {
  this.mod = {};
  return this;
}

Osc.prototype.over = function (ms) {
  let intervals = 0;
  const inveralMs = 20;
  const targetIntervals = ms / inveralMs;
  let panPerInterval, freqPerInterval, gainPerInterval;
  //PAN
  if (this.mod.pan) {
    if (this.mod.pan * 50 < -50) this.mod.pan = -1;
    else if (this.mod.pan * 50 > 50) this.mod.pan = 1;
    let panDifference = Math.abs(this.pannerNode.pan.value * 50) + Math.abs(this.mod.pan * 50);
    if ((this.mod.pan * 50) < (this.pannerNode.pan.value * 50)) panDifference = -panDifference;
    panPerInterval = panDifference / targetIntervals;
  }
  //FREQUENCY
  if (this.mod.frequency) {
    const freqDifference = -(this.oscillator.frequency.value - this.mod.frequency);
    freqPerInterval = freqDifference / targetIntervals;
  }
  //INTERVAL
  const mod = setInterval(() => {
    if (intervals === targetIntervals) {
      clearInterval(mod);
      this.mod = null;
    }
    if (panPerInterval) this.pannerNode.pan.value += (panPerInterval / 50);
    if (freqPerInterval) this.oscillator.frequency.value += (freqPerInterval);
    intervals++;
  }, inveralMs);
}

Osc.prototype.pan = function(pan) {
  if (pan < -50) pan = -50;
  else if (pan > 50) pan = 50;
  pan = pan / 50;
  if (this.mod) {
    this.mod.pan = pan;
    return this;
  }
  this.pannerNode.pan.value = pan;
  return this;
}

Osc.prototype.gain = function(gain) {
  if (typeof gain !== 'number') throw new Error('Gain must be an integer');
  if (gain < 0) gain = 0;
  if (gain > 100) gain = 100;
  gain = gain / 100;
  if (this.mod) {
    this.mod.gain = gain;
    return this;
  }
  this.gainNode.gain.value = gain;
  return this;
}

Osc.prototype.note = function(note) {
  let frequency;
  switch (note) {
    case 'C': frequency = 261.63;
      break;
    case 'C#': frequency = 277.18;
      break;
    case 'Db': frequency = 277.18;
      break;
    case 'D': frequency = 293.66;
      break;
    case 'D#': frequency = 311.13;
      break;
    case 'Eb': frequency = 311.13;
      break;
    case 'E': frequency = 329.63;
      break;
    case 'F': frequency = 349.23;
      break;
    case 'F#': frequency = 369.99;
      break;
    case 'Gb': frequency = 369.99;
      break;
    case 'G': frequency = 392.00;
      break;
    case 'G#': frequency = 415.30;
      break;
    case 'Ab': frequency = 415.30;
      break;
    case 'A': frequency = 440.00;
      break;
    case 'A#': frequency = 466.16;
      break;
    case 'Bb': frequency = 466.16;
      break;
    case 'B': frequency = 493.88;
      break;
    default: frequency = 523.25;
  }
  if (this.mod) {
    if (!this.mod.frequency) this.mod.frequency = frequency * this.multiplier;
    else this.mod.frequency *= this.multiplier;
    this.freqWithoutMultiplier = frequency;
    return this;
  }
  this.freqWithoutMultiplier = frequency;
  this.oscillator.frequency.value = this.freqWithoutMultiplier * this.multiplier;
  return this;
}

Osc.prototype.octave = function(octave) {
  octave = Number(octave);
  if (octave < 0) octave = 0;
  else if (octave > 8) octave = 8;
  let mutliplier;
  switch (octave) {
    case 1: multiplier = 0.125;
      break;
    case 2: multiplier = 0.25;
      break;
    case 3: multiplier = 0.5;
      break;
    case 4: multiplier = 1;
      break;
    case 5: multiplier = 2;
      break;
    case 6: multiplier = 4;
      break;
    case 7: multiplier = 8;
      break;
    case 8: multiplier = 16;
      break;
    default: multiplier = 1;
  }
  if (this.mod) {
    if (!this.mod.frequency) this.mod.frequency = this.freqWithoutMultiplier * multiplier;
    else this.mod.frequency *= multiplier;
    this.multiplier = multiplier;
    return this;
  }
  this.multiplier = multiplier;
  this.oscillator.frequency.value = this.freqWithoutMultiplier * this.multiplier;
  return this;
}

Osc.prototype.play = function () {
  if (this.muted) {
    this.gainNode.connect(paulAudioCtx.destination);
    this.muted = false;
  } else this.oscillator.start();
  return this;
}

Osc.prototype.pause = function () {
  if (!this.muted) {
    this.gainNode.disconnect(paulAudioCtx.destination);
    this.muted = true;
  }
  return this;
}

Osc.prototype.add = function (filterNode) {
  const filter = new BiquadFilterNode(paulAudioCtx);
  filter.type = filterNode.props.type;
  filter.frequency.value = filterNode.props.frequency;
  filter.Q.value = filterNode.props.q;
  filter.detune.value = filterNode.props.detune;
  filter.gain.value = filterNode.props.gain;
  this.lastNode.disconnect(paulAudioCtx.destination);
  this.lastNode.connect(filter);
  filter.connect(paulAudioCtx.destination);
  this.lastNode = filter;
  filterNode.filters.push(filter);
}

Osc.prototype.wave = function (wave) {
  if (wave === 'saw') wave = 'sawtooth';
  this.wave = wave;
  this.oscillator.type = wave;
  return this;
}