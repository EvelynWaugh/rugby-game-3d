# Rugby Game 3D

A React Three Fiber port of the 2D rugby drone game. Fly an FPV drone, drop rugby munitions on pig soldiers, and clear each level's objectives.

## Stack

- **React 19** + **Vite** + **TypeScript**
- **React Three Fiber** + **drei** for 3D rendering
- **Zustand** for game state
- **NextUI** + **Tailwind CSS** for HUD / menus

## Getting started

```bash
pnpm install
pnpm dev
```

3D models (`*.glb`) are gitignored but must exist under `public/models/`. See `public/models/MANIFEST.md` for the required file list.

## Controls

| Key | Action |
|-----|--------|
| W / ↑ | Forward |
| S / ↓ | Back |
| A / ← | Turn left |
| D / → | Turn right |
| R / F | Altitude up / down |
| Space | Drop munition |

## Architecture

| Area | Location |
|------|----------|
| Game rules (pure functions) | `src/systems/` |
| State | `src/stores/` |
| 3D components | `src/components/` |
| Asset registry | `src/constants/models.ts` |
| Levels | `src/constants/levels.ts` |

Game logic stays out of R3F components — the loop in `use-game-loop.ts` calls system functions each frame.

## Pig soldiers

All pig animation clips live in a **single** `public/models/pig/pig.glb`. `PigAnimatedModel` crossfades between clips:

- **walkGun** → patrol
- **aim** → tracking drone before shot
- **shoot** → firing (one-shot clip)
- **run** → flee (cowardly pigs drop their AK)
- **death** → abdominal (ram) or shot (explosion)

Behavior is driven in `src/systems/update-soldiers.ts`; rendering in `src/components/enemies/pig-soldier.tsx`.

## Cursor rules

Project conventions for agents live in `.cursor/rules/`:

- `react-three-fiber.mdc` — R3F / React style
- `game-systems.mdc` — keep logic in `src/systems/`
- `local-assets.mdc` — GLB layout on disk
- `pig-animations.mdc` — pig clip names and state machine

## Original game

Behavior is ported from `rugby-game/rugby-game.html` when in doubt.
