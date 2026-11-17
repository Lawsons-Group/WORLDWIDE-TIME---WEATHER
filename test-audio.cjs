const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const elements = {}, events = {}, gains = [], oscillators = [];
const element = () => ({ style: { setProperty() {} }, dataset: {}, appendChild() {}, insertAdjacentHTML() {}, setAttribute() {}, addEventListener(name, callback) { this[name] = callback; } });
const param = () => ({ value: 0, cancelScheduledValues() {}, setTargetAtTime(v) { this.target = v; }, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} });
const audioNode = () => ({ connect(next) { return next; }, disconnect() {}, start() {}, stop() {}, frequency: param() });
class AudioContext {
  constructor() { this.currentTime = 0; this.sampleRate = 100; this.state = 'running'; this.destination = {}; }
  createBuffer() { return { getChannelData() { return new Float32Array(600); } }; }
  createBufferSource() { return audioNode(); }
  createBiquadFilter() { return audioNode(); }
  createGain() { const n = { ...audioNode(), gain: param() }; gains.push(n); return n; }
  createOscillator() { const n = audioNode(); oscillators.push(n); return n; }
  async resume() {}
}
const document = { hidden: false, querySelector: element, createElement: element, getElementById(id) { return elements[id] ||= element(); }, body: element(), addEventListener(name, callback) { events[name] = callback; } };
const context = { window: { AudioContext }, document, Intl, Date, Math, setInterval() {} };
vm.runInNewContext(readFileSync('dist/atmosphere.js', 'utf8'), context);
const now = Date.now() / 1000;
const forecast = (code, night = false) => ({ current: { weather_code: code, is_day: !night }, daily: { time: [now], sunrise: [night ? now - 40000 : now - 3600], sunset: [night ? now - 3600 : now + 3600] } });
async function run() {
  const update = (code, night) => context.window.Atmosphere.update(forecast(code, night), 'UTC');
  update(61, true);
  await elements.sound.click();
  assert.equal(gains[0].gain.target, 1, 'Sound enabled');
  assert.equal(gains[1].gain.target, 0.07, 'Rain plays at night');
  assert.equal(gains[2].gain.target, 0, 'Night insects do not play over rain');
  update(0, false);
  assert.equal(gains[1].gain.target, 0, 'Rain fades out when sunny');
  assert.equal(gains[2].gain.target, 0.13, 'Birdsong fades in');
  assert.match(elements.soundHint.textContent, /birdsong/);
  assert.equal(oscillators.length, 4, 'Bird phrase is scheduled');
  update(0, true);
  assert.match(elements.soundHint.textContent, /crickets/);
  assert.equal(oscillators.length, 11, 'Night insect phrase is scheduled');
  document.hidden = true; events.visibilitychange();
  assert.equal(gains[0].gain.target, 0, 'Hidden tab muted');
  document.hidden = false; events.visibilitychange();
  await elements.sound.click();
  assert.equal(gains[0].gain.target, 0, 'Toggle mutes every ambience');
  assert.equal(elements.sound.textContent, '♪ Sound off');
  console.log('Passed: audio routing, rainy-night priority, bird and cricket scheduling, hidden-tab mute and sound toggle.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
