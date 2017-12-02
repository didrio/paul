const paulAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

function LFO(wave, frequency, intensity) {
  if (wave === 'saw') wave = 'sawtooth';
  this.oscillator = new OscillatorNode(paulAudioCtx);
  this.gainNode = new GainNode(paulAudioCtx);
  this.oscillator.frequency.value = frequency;
  this.oscillator.type = wave;
  this.gainNode.gain.value = intensity;
  this.oscillator.connect(this.gainNode);
}

LFO.prototype.wave = function(wave) {
  if (wave === 'saw') wave = 'sawtooth';
  this.oscillator.type = wave;
  return this;
}

LFO.prototype.frequency = function (frequency) {
  this.oscillator.frequency.value = frequency;
  return this;
}

LFO.prototype.intensity = function (intensity) {
  this.gainNode.gain.value = intensity;
  return this;
}

function Filter(type = 'lowpass', frequency = 800, q = 0, detune = 0, gain = 0) {
  if (gain < -100) gain = -100;
  if (gain > 100) gain = 100;
  gain = (gain / 100) * 40;
  this.props = { type, frequency, q, detune, gain };
  this.filters = [];
}

Filter.prototype.to = function () {
  this.mod = {};
  return this;
}

Filter.prototype.over = function (ms) {
  if (this.interval) clearInterval(this.interval);
  let intervals = 0;
  const inveralMs = 20;
  const targetIntervals = ms / inveralMs;
  let freqPerInterval, qPerInterval, detunePerInterval, gainPerInterval;
  //FREQUENCY
  if (this.mod.frequency !== undefined) {
    const freqDifference = -(this.props.frequency - this.mod.frequency);
    freqPerInterval = (freqDifference / targetIntervals);
  }
  //Q
  if (this.mod.q !== undefined) {
    const qDifference = -(this.props.q - this.mod.q);
    qPerInterval = (qDifference / targetIntervals);
  }
  //DETUNE
  if (this.mod.detune !== undefined) {
    const detuneDifference = -(this.props.detune - this.mod.detune);
    detunePerInterval = (detuneDifference / targetIntervals);
  }
  //GAIN
  if (this.mod.gain !== undefined) {
    const gainDifference = -(this.props.gain - this.mod.gain);
    gainPerInterval = (gainDifference / targetIntervals);
  }
  //INTERVAL
  this.interval = setInterval(() => {
    intervals++;
    if (intervals === targetIntervals) {
      clearInterval(this.interval);
      this.mod = null;
    }
    this.filters.forEach(filter => {
      if (freqPerInterval) filter.frequency.value += freqPerInterval;
      if (qPerInterval) filter.Q.value += qPerInterval;
      if (detunePerInterval) filter.detune.value += detunePerInterval;
      if (gainPerInterval) filter.gain.value += gainPerInterval;
    });
  }, inveralMs);
}

Filter.prototype.type = function(type) {
  this.props.type = type;
  this.filters.forEach(filter => filter.type = type);
  return this;
}

Filter.prototype.frequency = function (frequency) {
  if (this.mod) {
    this.mod.frequency = frequency;
    return this;
  }
  this.props.frequency = frequency;
  this.filters.forEach(filter => filter.frequency.value = frequency);
  return this;
}

Filter.prototype.q = function (q) {
  if (this.mod) {
    this.mod.q = q;
    return this;
  }
  this.props.q = q;
  this.filters.forEach(filter => filter.Q.value = q);
  return this;
}

Filter.prototype.detune = function (detune) {
  if (this.mod) {
    this.mod.detune = detune;
    return this;
  }
  this.props.detune = detune;
  this.filters.forEach(filter => filter.detune.value = detune);
  return this;
}

Filter.prototype.gain = function (gain) {
  if (this.mod) {
    this.mod.gain = gain;
    return this;
  }
  if (gain < -100) gain = -100;
  if (gain > 100) gain = 100;
  gain = (gain / 100) * 40;
  this.props.gain = gain;
  this.filters.forEach(filter => filter.gain.value = gain);
  return this;
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
  if (this.interval) clearInterval(this.interval);
  let intervals = 0;
  const inveralMs = 20;
  const targetIntervals = ms / inveralMs;
  let panPerInterval, freqPerInterval, gainPerInterval;
  //PAN
  if (this.mod.pan !== undefined) {
    if (this.mod.pan * 50 < -50) this.mod.pan = -1;
    else if (this.mod.pan * 50 > 50) this.mod.pan = 1;
    let panDifference = Math.abs(this.pannerNode.pan.value * 50) + Math.abs(this.mod.pan * 50);
    if ((this.mod.pan * 50) < (this.pannerNode.pan.value * 50)) panDifference = -panDifference;
    panPerInterval = panDifference / targetIntervals;
  }
  //FREQUENCY
  if (this.mod.frequency !== undefined) {
    const freqDifference = -(this.oscillator.frequency.value - this.mod.frequency);
    freqPerInterval = (freqDifference / targetIntervals);
  }
  //GAIN
  if (this.mod.gain !== undefined) {
    const gainDifference = -(this.gainNode.gain.value - this.mod.gain);
    gainPerInterval = gainDifference / targetIntervals;
  }
  //INTERVAL
  this.interval = setInterval(() => {
    intervals++;
    if (intervals === targetIntervals) {
      clearInterval(this.interval);
      this.mod = null;
    }
    if (panPerInterval) this.pannerNode.pan.value += (panPerInterval / 50);
    if (freqPerInterval) this.oscillator.frequency.value += (freqPerInterval);
    if (gainPerInterval) this.gainNode.gain.value += (gainPerInterval);
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
    case 'c':
    case 'C': frequency = 261.63;
      break;
    case 'c#':
    case 'C#': frequency = 277.18;
      break;
    case 'db':
    case 'Db': frequency = 277.18;
      break;
    case 'd':
    case 'D': frequency = 293.66;
      break;
    case 'd#':
    case 'D#': frequency = 311.13;
      break;
    case 'eb':
    case 'Eb': frequency = 311.13;
      break;
    case 'e':
    case 'E': frequency = 329.63;
      break;
    case 'f':
    case 'F': frequency = 349.23;
      break;
    case 'f#':
    case 'F#': frequency = 369.99;
      break;
    case 'gb':
    case 'Gb': frequency = 369.99;
      break;
    case 'g':
    case 'G': frequency = 392.00;
      break;
    case 'g#':
    case 'G#': frequency = 415.30;
      break;
    case 'ab':
    case 'Ab': frequency = 415.30;
      break;
    case 'a':
    case 'A': frequency = 440.00;
      break;
    case 'a#':
    case 'A#': frequency = 466.16;
      break;
    case 'bb':
    case 'Bb': frequency = 466.16;
      break;
    case 'b':
    case 'B': frequency = 493.88;
      break;
    default: frequency = 261.63;
  }
  if (this.mod) {
    this.mod.frequency = frequency * this.multiplier;
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
    this.mod.frequency = this.freqWithoutMultiplier * multiplier;
    this.multiplier = multiplier;
    return this;
  }
  this.multiplier = multiplier;
  this.oscillator.frequency.value = this.freqWithoutMultiplier * this.multiplier;
  return this;
}

Osc.prototype.wave = function (wave) {
  if (wave === 'saw') wave = 'sawtooth';
  this.oscillator.type = wave;
  return this;
}

Osc.prototype.play = function () {
  if (this.muted) {
    this.lastNode.connect(paulAudioCtx.destination);
    this.muted = false;
  } else this.oscillator.start();
  return this;
}

Osc.prototype.pause = function () {
  if (!this.muted) {
    this.lastNode.disconnect(paulAudioCtx.destination);
    this.muted = true;
  }
  return this;
}

Osc.prototype.filter = function (filterNode) {
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

Osc.prototype.lfo = function (lfo, destination) {
  switch (destination) {
    case 'frequency': 
      lfo.gainNode.connect(this.oscillator.frequency);
      lfo.oscillator.start();
      break;
    case 'gain':
      if (lfo.gainNode.gain.value > 100) lfo.gainNode.gain.value = 100;
      if (lfo.gainNode.gain.value < 0) lfo.gainNode.gain.value = 0;
      lfo.gainNode.gain.value = lfo.gainNode.gain.value / 100;
      lfo.gainNode.connect(this.gainNode.gain);
      lfo.oscillator.start();
      break;
    case 'pan':
      if (lfo.gainNode.gain.value < -50) lfo.gainNode.gain.value = -50;
      else if (lfo.gainNode.gain.value > 50) lfo.gainNode.gain.value = 50;
      lfo.gainNode.gain.value = lfo.gainNode.gain.value / 50;
      lfo.gainNode.connect(this.pannerNode.pan);
      lfo.oscillator.start();
      break;
  }
}