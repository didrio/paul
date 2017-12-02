const paulAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

function Filter(type = 'lowpass', frequency = 800, q = 0, detune = 0, gain = 10) {
  this.fType = type;
  this.fFrequency = frequency;
  this.fq = q;
  this.fDetune = detune;
  this.fGain = gain;
  this.filters = [];
}

Filter.prototype.type = function(type) {
  this.fType = type;
  this.filters.forEach(filter => filter.type = type);
}

Filter.prototype.frequency = function (frequency) {
  this.fFrequency = frequency;
  this.filters.forEach(filter => filter.frequency.value = frequency);
}

Filter.prototype.q = function (q) {
  this.fq = q;
  this.filters.forEach(filter => filter.Q.value = q);
}

Filter.prototype.detune = function (detune) {
  this.fDetune = detune;
  this.filters.forEach(filter => filter.detune.value = detune);
}

Filter.prototype.gain = function (gain) {
  this.fGain = gain;
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

Osc.prototype.add = function(filterNode) {
  const filter = new BiquadFilterNode(paulAudioCtx);
  filter.type = filterNode.fType;
  filter.frequency.value = filterNode.fFrequency;
  filter.Q.value = filterNode.fq;
  filter.detune.value = filterNode.fDetune;
  filter.gain.value = filterNode.fGain;
  this.lastNode.disconnect(paulAudioCtx.destination);
  this.lastNode.connect(filter);
  filter.connect(paulAudioCtx.destination);
  this.lastNode = filter;
  filterNode.filters.push(filter);
}

Osc.prototype.pan = function(pan) {
  if (pan < -50) pan = -50;
  else if (pan > 50) pan = 50;
  pan = pan / 50;
  this.pannerNode.pan.value = pan;
  return this;
}

Osc.prototype.play = function() {
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

Osc.prototype.gain = function(gain) {
  if (typeof gain !== 'number') throw new Error('Gain must be an integer');
  if (gain < 0) gain = 0;
  if (gain > 100) gain = 100;
  gain = gain / 100;
  this.gainNode.gain.value = gain;
  return this;
}

Osc.prototype.wave = function(wave) {
  if (wave === 'saw') wave = 'sawtooth';
  this.wave = wave;
  this.oscillator.type = wave;
  return this;
}

Osc.prototype.note = function(note) {
  switch (note) {
    case 'A': this.frequency = 440.00;
      break;
    case 'A#': this.frequency = 466.16;
      break;
    case 'Bb': this.frequency = 466.16;
      break;
    case 'B': this.frequency = 493.88;
      break;
    case 'C': this.frequency = 523.25;
      break;
    case 'C#': this.frequency = 554.37;
      break;
    case 'Db': this.frequency = 554.37;
      break;
    case 'D': this.frequency = 587.33;
      break;
    case 'D#': this.frequency = 622.25;
      break;
    case 'Eb': this.frequency = 622.25;
      break;
    case 'E': this.frequency = 659.25;
      break;
    case 'F': this.frequency = 698.46;
      break;
    case 'F#': this.frequency = 739.99;
      break;
    case 'Gb': this.frequency = 739.99;
      break;
    case 'G': this.frequency = 783.99;
      break;
    case 'G#': this.frequency = 830.61;
      break;
    case 'Ab': this.frequency = 830.61;
      break;
    default: this.frequency = 523.25;
  }
  this.oscillator.frequency.value = this.frequency * this.multiplier;
  return this;
}

Osc.prototype.octave = function(octave) {
  octave = Number(octave);
  if (octave < 0) octave = 0;
  else if (octave > 8) octave = 8;
  switch (octave) {
    case 1: this.multiplier = 0.125;
      break;
    case 2: this.multiplier = 0.25;
      break;
    case 3: this.multiplier = 0.5;
      break;
    case 4: this.multiplier = 1;
      break;
    case 5: this.multiplier = 2;
      break;
    case 6: this.multiplier = 4;
      break;
    case 7: this.multiplier = 8;
      break;
    case 8: this.multiplier = 16;
      break;
    default: this.multiplier = 1;
  }
  this.oscillator.frequency.value = this.frequency * this.multiplier;
  return this;
}