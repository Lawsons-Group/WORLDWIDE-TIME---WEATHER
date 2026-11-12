/* Weather scenes and locally synthesised, opt-in rain ambience. */
(function () {
  function sceneFor(forecast, timezone, now = Date.now() / 1000) {
    const code = forecast.current.weather_code;
    const weather = code >= 95 ? 'storm' : [71, 73, 75, 77, 85, 86].includes(code) ? 'snow'
      : [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code) ? 'rain'
      : [45, 48].includes(code) ? 'fog' : code >= 2 ? 'clouds' : 'clear';
    const dayKey = value => new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value * 1000));
    const index = forecast.daily.time.findIndex(t => dayKey(t) === dayKey(now));
    const rise = forecast.daily.sunrise[index], set = forecast.daily.sunset[index];
    let phase = forecast.current.is_day ? 'day' : 'night';
    let progress = 0.5;
    if (Number.isFinite(rise) && Number.isFinite(set) && set > rise) {
      phase = now < rise || now >= set ? 'night' : 'day';
      if (Math.abs(now - rise) < 2700) phase = 'dawn';
      else if (Math.abs(now - set) < 2700) phase = 'dusk';
      progress = Math.max(0, Math.min(1, (now - rise) / (set - rise)));
    }
    return { weather, phase, progress, wet: weather === 'rain' || weather === 'storm', heavy: [65, 67, 82, 95, 96, 99].includes(code) };
  }

  const sky = document.querySelector('.sky');
  const particles = document.createElement('div');
  particles.className = 'precipitation';
  for (let i = 0; i < 85; i++) {
    const drop = document.createElement('i');
    drop.style.cssText = `--x:${Math.random() * 110}%;--delay:${-Math.random() * 18}s;--speed:${0.6 + Math.random() * 0.6}s;--snow-speed:${7 + Math.random() * 9}s;--size:${2 + Math.random() * 4}px;--alpha:${0.18 + Math.random() * 0.35}`;
    particles.appendChild(drop);
  }
  sky.appendChild(particles);
  sky.insertAdjacentHTML('afterbegin', '<div class="stars"></div><div class="horizon-glow"></div>');
  sky.insertAdjacentHTML('beforeend', '<div class="mist"></div>');

  let state = null, context, source, gain, enabled = false, busy = false;
  const button = document.getElementById('sound');
  const hint = document.getElementById('soundHint');
  function label() {
    button.textContent = enabled ? '♫ Sound on' : '♪ Sound off';
    button.setAttribute('aria-pressed', String(enabled));
    hint.textContent = enabled ? state?.wet ? 'Gentle rain ambience' : 'Listening for rain · quiet for now' : 'Turn on for gentle rain sounds';
  }
  function soundLevel() {
    if (!context || !gain) return;
    const volume = enabled && state?.wet && !document.hidden ? (state.heavy ? 0.11 : 0.07) : 0;
    gain.gain.cancelScheduledValues(context.currentTime);
    gain.gain.setTargetAtTime(volume, context.currentTime, 0.7);
  }
  async function toggleSound() {
    if (busy) return;
    busy = true;
    button.disabled = true;
    try {
      if (!context) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) throw new Error('Audio is not supported');
        context = new Audio();
        const buffer = context.createBuffer(2, context.sampleRate * 6, context.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
          const samples = buffer.getChannelData(channel);
          for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
        }
        source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const lowpass = context.createBiquadFilter();
        lowpass.type = 'lowpass'; lowpass.frequency.value = 2400;
        const highpass = context.createBiquadFilter();
        highpass.type = 'highpass'; highpass.frequency.value = 350;
        gain = context.createGain(); gain.gain.value = 0;
        source.connect(highpass).connect(lowpass).connect(gain).connect(context.destination);
        source.start();
      }
      await context.resume();
      enabled = !enabled;
      label(); soundLevel();
    } catch {
      enabled = false;
      soundLevel(); label();
      hint.textContent = 'Audio unavailable. Try again in another browser.';
    } finally { busy = false; button.disabled = false; }
  }
  button.addEventListener('click', toggleSound);
  document.addEventListener('visibilitychange', soundLevel);
  function update(forecast, timezone) {
    if (!forecast) return;
    const next = sceneFor(forecast, timezone);
    document.body.dataset.weather = next.weather;
    document.body.dataset.phase = next.phase;
    sky.style.setProperty('--sun-x', `${15 + next.progress * 65}%`);
    sky.style.setProperty('--sun-y', `${35 - Math.sin(next.progress * Math.PI) * 25}%`);
    if (!state || state.wet !== next.wet || state.heavy !== next.heavy) {
      state = next; label(); soundLevel();
    } else state = next;
  }
  label();
  window.Atmosphere = { update, sceneFor };
})();
