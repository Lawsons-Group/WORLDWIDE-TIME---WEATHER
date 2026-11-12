# Atmos — Worldwide Time & Weather

A responsive weather dashboard with an animated atmospheric landscape, a live location-aware clock, worldwide city search, optional device location, hourly forecasts and a seven-day outlook.

## Run locally

No build or API key is required. From this folder run `python -m http.server 8080 --directory dist`, then open http://localhost:8080. Alternatively serve the `dist` folder with any static web server. Location access requires HTTPS or localhost.

## Features

- Clock updates every second in the selected location's timezone; 12/24-hour toggle.
- Latest available weather refreshes every five minutes, with a manual refresh control.
- Celsius/Fahrenheit toggle, remembered location and preferences in browser local storage.
- Animated day/night and weather-dependent sky, responsive layout, reduced-motion support.
- Sunrise/sunset-aware dawn, daylight, dusk and night scenes for the selected city; drifting clouds, animated rain, snowfall, fog and starry clear nights.
- Optional gentle rain ambience, generated locally with Web Audio. Click **Sound off** to enable it; browsers require a user gesture before audio. Sound fades with rain conditions, stays quiet in dry weather, and mutes while the tab is hidden. No audio downloads or microphone access.
- Current conditions, feels-like temperature, wind, humidity, rain chance, sunrise and sunset.
- Worldwide city search, next 24 hours and seven-day forecast.
- Network errors preserve previous weather and offer retry. No fabricated weather data.

Weather and geocoding are provided by [Open-Meteo](https://open-meteo.com/). Its free endpoint is for non-commercial use; review its terms before commercial deployment. Weather represents the latest available model data, not a continuous sensor feed. Time follows the device clock and uses IANA timezones. Google Fonts are optional; system fonts are used if unavailable.

## Deployment

Deploy the contents of `dist` to any static host. `.openai/hosting.json` links this checkout to its private Sites deployment. No passwords, API keys, or tokens are included in the app.

Run `node test-atmosphere.cjs` to verify weather-code and daylight scene selection. Use `node serve.mjs` for a dependency-free local preview at http://localhost:8080.
