# 3D Models

Your GLB files are loaded from:

- `public/models/drone/drone.glb`
- `public/models/pig/pig.glb`

Models are auto-centered and scaled to fit the scene. Tune size in `src/constants/game.ts`:

```ts
DRONE_MODEL_CONFIG.targetSize  // default 2.5
PIG_MODEL_CONFIG.targetSize    // default 2.2
```

If a model faces the wrong way, adjust `rotationY` in the same file.
