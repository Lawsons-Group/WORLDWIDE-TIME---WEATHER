(function () {
  const dialog = document.getElementById('hourDetails');
  const list = document.getElementById('hourDetailGrid');
  const hourly = document.getElementById('hourly');
  let forecast, timezone, unit, city, selectedTime = null;

  function detailsFor(hourlyData, index, temperatureUnit) {
    const value = (key, suffix = '', decimals = 0) => {
      const n = hourlyData[key]?.[index];
      return Number.isFinite(n) ? n.toFixed(decimals) + suffix : 'Unavailable';
    };
    const temperature = key => {
      const n = hourlyData[key]?.[index];
      return Number.isFinite(n) ? Math.round(temperatureUnit === 'f' ? n * 9 / 5 + 32 : n) + (temperatureUnit === 'f' ? '°F' : '°C') : 'Unavailable';
    };
    const bearing = hourlyData.wind_direction_10m?.[index];
    const direction = Number.isFinite(bearing) ? ['N','NE','E','SE','S','SW','W','NW'][Math.round(bearing / 45) % 8] : '';
    return [
      ['Temperature', temperature('temperature_2m')],
      ['Feels like', temperature('apparent_temperature')],
      ['Rain chance', value('precipitation_probability', '%')],
      ['Precipitation', value('precipitation', ' mm', 1)],
      ['Humidity', value('relative_humidity_2m', '%')],
      ['Wind', value('wind_speed_10m', ' km/h') + (direction ? ' ' + direction : '')],
      ['Cloud cover', value('cloud_cover', '%')]
    ];
  }
  function fill(index) {
    const stamp = forecast.time[index];
    const label = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(stamp * 1000));
    document.getElementById('hourDetailTitle').textContent = label;
    document.getElementById('hourDetailPlace').textContent = city + ' · ' + timezone.replaceAll('_', ' ');
    const card = hourly.querySelector(`[data-hour-index="${index}"]`);
    document.getElementById('hourDetailCondition').textContent = card?.querySelector('b')?.getAttribute('aria-label') || 'Hourly forecast';
    document.getElementById('hourDetailIcon').textContent = card?.querySelector('b')?.textContent || '';
    list.replaceChildren();
    for (const [label, value] of detailsFor(forecast, index, unit)) {
      const item = document.createElement('div');
      const term = document.createElement('dt'); term.textContent = label;
      const description = document.createElement('dd'); description.textContent = value;
      item.append(term, description); list.appendChild(item);
    }
  }
  hourly.addEventListener('click', event => {
    const card = event.target.closest('button[data-hour-index]');
    if (!card || !forecast) return;
    const index = Number(card.dataset.hourIndex);
    if (!Number.isInteger(index) || !Number.isFinite(forecast.time[index])) return;
    selectedTime = forecast.time[index]; fill(index); dialog.showModal();
  });
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    const index = forecast?.time.indexOf(selectedTime);
    hourly.querySelector(`[data-hour-index="${index}"]`)?.focus({ preventScroll: true });
    selectedTime = null;
  });
  function setForecast(next, zone, temperatureUnit, name) {
    if (city !== name && dialog.open) dialog.close();
    forecast = next; timezone = zone; unit = temperatureUnit; city = name;
    if (dialog.open) {
      const index = forecast.time.indexOf(selectedTime);
      if (index < 0) dialog.close(); else fill(index);
    }
  }
  window.HourDetails = { setForecast, detailsFor };
})();
