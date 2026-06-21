# AGIS — Prototype v0.1

> Conversation controls a spatial world.

A single-page React Three Fiber app that proves natural language can drive a 3D scene.
Type a command, the **router** (hardcoded rules, **no AI**) decides what to render, and the canvas responds — with smooth camera transitions and fade in/out. No reloads, no dashboards, no auth, no database.

## Stack
- React 18 + Vite
- React Three Fiber + drei + three.js
- Plain JS router with hardcoded regex rules

## Commands the router understands
| Input | Router output |
| --- | --- |
| `show cube` | `{ "renderer": "cube" }` |
| `show sphere` | `{ "renderer": "sphere" }` |

The router also accepts `display`, `render`, `give`, `draw` as verbs and bare `cube` / `sphere` keywords.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## How it works
1. `src/router.js` — pure function, input string → descriptor object. Hardcoded rules only.
2. `src/Scene.jsx` — R3F canvas reads the active renderer; camera eases to the object's target position, objects fade via lerped opacity.
3. `src/App.jsx` — wires input → router → canvas.

No AI. No backend. No database. Just conversation → space.
