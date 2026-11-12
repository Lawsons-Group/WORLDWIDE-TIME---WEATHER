const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const node = () => ({ style: { setProperty() {} }, dataset: {}, appendChild() {}, insertAdjacentHTML() {}, addEventListener() {}, setAttribute() {} });
const context = { window: {}, Intl, Date, Math, document: { querySelector: node, createElement: node, getElementById: node, body: node(), addEventListener() {} } };
vm.runInNewContext(readFileSync('dist/atmosphere.js', 'utf8'), context);
const scene = context.window.Atmosphere.sceneFor;
const epoch = s => Date.parse(s) / 1000;
const forecast = code => ({ current: { weather_code: code, is_day: 1 }, daily: { time: [epoch('2026-11-12T00:00Z')], sunrise: [epoch('2026-11-12T07:00Z')], sunset: [epoch('2026-11-12T17:00Z')] } });
for (const [code, expected] of [[0,'clear'],[2,'clouds'],[3,'clouds'],[45,'fog'],[48,'fog'],[51,'rain'],[57,'rain'],[61,'rain'],[67,'rain'],[71,'snow'],[77,'snow'],[80,'rain'],[82,'rain'],[85,'snow'],[86,'snow'],[95,'storm'],[99,'storm']]) {
  const result = scene(forecast(code), 'Europe/London', epoch('2026-11-12T12:00Z'));
  assert.equal(result.weather, expected, `WMO code ${code}`);
  assert.equal(result.wet, ['rain','storm'].includes(expected));
}
for (const [hour, expected] of [['03:00','night'],['06:40','dawn'],['07:20','dawn'],['12:00','day'],['16:40','dusk'],['17:20','dusk'],['20:00','night']]) {
  assert.equal(scene(forecast(61), 'Europe/London', epoch(`2026-11-12T${hour}Z`)).phase, expected);
}
const polar = forecast(0); polar.daily.sunrise = [null]; polar.daily.sunset = [null]; polar.current.is_day = 0;
assert.equal(scene(polar, 'Arctic/Longyearbyen', epoch('2026-11-12T12:00Z')).phase, 'night');
assert.equal(scene(forecast(65), 'Europe/London', epoch('2026-11-12T12:00Z')).heavy, true);
assert.equal(scene(forecast(61), 'Europe/London', epoch('2026-11-12T12:00Z')).heavy, false);
console.log('Passed: weather code mapping, precipitation type, daylight boundaries, polar fallback, rain intensity.');
