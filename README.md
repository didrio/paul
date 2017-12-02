# About

Paul.js is an abstraction library built on top of the Web Audio API's oscillator and filter features. It's intended to simplify the API and make it easier to work with, especially for those with a musical background. 

# CDN

```
CDN coming soon.
```

# Use

We'll create a new oscillator and start it.

*Osc(note: String, wave: String, octave:Number)*
```js
const myOsc = new Osc('C', 'triangle', 4);
myOsc.play();
```

We can change certain properties on the oscillator by calling functions on it. 

```js
myOsc.note('A');
myOsc.wave('saw');
myOsc.octave(3);
myOsc.gain(6);
myOsc.pan(-15);
```

Gain is within a 0 - 100 range and pan is within a -50 to 50 range (L to R).

Now let's chain these functions together.  

```js
myOsc.note('C#').wave('sine').octave(6).gain(10).pan(20);
```

The functions work in any order. 

```js
myOsc.gain(8).pan(0).wave('square').octave(2).note('eb');
```

This chaining becomes useful when using the ```to``` and ```over``` functions, which allow us to transition between two oscillator states over the amount of time (in milliseconds) passed into ```over```.

```js
myOsc.to().note('A').octave(5).over(3000);
```

```js
myOsc.gain(0).octave(7).to().note('e').octave(4).gain(6).over(1000);
```

Let's add a filter! 

*Filter(type: String, frequency: Number, q: Number, detune: Number, gain: Number)*
```js
const myFilter = new Filter('highpass', 1200);
```

Again we can change individual properties on the filter. 

```js
myFilter.type('highshelf');
myFilter.frequency(800);
myFilter.q(10);
myFilter.detune(100);
myFilter.gain(-70);
```

And then we'll add the filter to our oscillator. 

```js
myOsc.filter(myFilter);
```

And do a sweep. 

```js
myFilter.type('lowpass').frequency(100).q(30).to().frequency(20000).q(10).over(5000);
```

Finally we'll create an LFO.

*LFO(wave: String, frequency: Number, intensity: Number)*
```js
const myLfo = new LFO('saw', 10, 200);
```

Then pass it into our oscillator. 
```js
myOsc.lfo(myLfo, 'frequency');
```

We can also affect the 'gain' and 'pan' of the oscillator with the LFO. And again we can change the LFO's properties. 
```js
myLfo.wave('sine');
myLfo.frequency(5);
myLfo.intensity(150);
```

And end. 
```js
myOsc.pause();
```

And now this.
```js
const note1 = new Osc('C', 'saw', 5);
const note2 = new Osc('E', 'saw', 4);
const note3 = new Osc('G', 'saw', 4);
const bass = new Osc('F', 'triangle', 1);
note1.gain(10);
note2.gain(10);
note3.gain(10);
bass.gain(15);
note1.play();
note2.play();
note3.play();

const lowpass = new Filter('lowpass');
note1.filter(lowpass);
note2.filter(lowpass);
note3.filter(lowpass);

lowpass.frequency(200).q(20).to().frequency(20000).q(5).over(15000);

setTimeout(() => {
  note1.to().note('E').over(400);
  note2.to().note('B').over(400);
  note3.to().note('Ab').over(400);
}, 1600);

setTimeout(() => {
  note1.to().note('A').octave(4).over(400);
  note2.to().note('C').over(400);
  note3.to().note('E').over(400);
}, 3600);

setTimeout(() => {
  note1.to().note('A').octave(4).over(400);
  note2.to().note('F').pan(-10).over(400);
  note3.to().note('C').pan(10).over(400);
}, 5600);

setTimeout(() => {
  note1.to().note('C').over(400);
  note2.to().note('E').pan(-20).over(400);
  note3.to().note('G').pan(20).over(400);
  bass.play();
  bass.to().note('C').octave(2).over(200);
}, 7600);

setTimeout(() => {
  note1.to().note('E').over(400);
  note2.to().note('B').pan(-30).over(400);
  note3.to().note('Ab').pan(30).over(400);
  bass.to().note('E').over(200);
}, 9600);

setTimeout(() => {
  note1.to().note('A').octave(4).over(400);
  note2.to().note('C').pan(-40).over(400);
  note3.to().note('E').pan(40).over(400);
  bass.to().note('A').over(200);
}, 11600);

setTimeout(() => {
  note1.to().note('A').octave(4).over(400);
  note2.to().note('F').pan(-50).over(400);
  note3.to().note('C').pan(50).over(400);
  bass.to().note('F').over(200);
}, 13600);
```