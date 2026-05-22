# Orbit ID Card

An interactive ID card on a lanyard with real-time physics simulation — drag it, toss it, and watch it swing back to rest.

## Demo

Drag the card with your mouse or finger. Release with momentum to fling it; it swings back on a spring with the card itself reacting like a secondary pendulum hanging from the rope.

## Features

- **Drag interaction** — pointer/touch events with velocity sampling for realistic release behavior
- **Dual-spring physics** — the rope swings on one spring; the card hangs on a softer, slower secondary spring driven by the rope's angular acceleration
- **Responsive scaling** — the scene scales to fit any viewport height via a CSS `--scale` custom property
- **Auto-settle** — the animation loop stops itself once all motion falls below a threshold, saving CPU

## Stack

Plain HTML, CSS, and vanilla JavaScript — no dependencies, no build step.

## File structure

```
ID Card/
├── index.html      # markup
├── style.css       # layout and visual styles
├── script.js       # physics engine and drag handling
└── Image/
    ├── Lanyard.png
    └── Vector.png
```

## Running locally

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
npx serve .
```
