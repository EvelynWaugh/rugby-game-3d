# 3D Models

All asset paths, scale targets, and per-model rotation live in **`src/constants/models.ts`**.

## Layout

```
public/models/
  drone/drone.glb          — player drone (FPV bomber + rugby munition mesh)
  ball/ball.glb            — rugby munition (drops)
  weapon/ak/ak.glb         — attached to pigs (pigs have no built-in gun mesh)
  pig/pig.glb              — skinned pig with all animation clips
```

## Drone (`drone/drone.glb`)

Authored in Blender and exported as glTF. **Preview the raw GLB** with `GameSceneExample` / `PlayableDrone` in `src/components/drone/drone-example.tsx` (OrbitControls, no extra rotation).

### Blender / GLB axes (raw file)

| Axis | Role |
|------|------|
| **−Y** | Forward (nose) |
| **+Z** | Up |
| **+X** | Right |

The rugby munition mesh hangs on the **rear** of the fuselage (not the nose). Re-export with **+Y up** glTF if you change the rig; then revisit `DRONE_MODEL.rotation` in `models.ts`.

### Game runtime (Y-up world)

The level and physics use **Three.js Y-up**: altitude on **Y**, flight path on the **XZ** plane, heading `drone.yaw` rotates around **world Y**, forward at yaw 0 is **−Z**.

| Piece | Responsibility |
|-------|----------------|
| `DRONE_MODEL.rotation` | Static glTF → game-space alignment (`StaticModel` wrapper) |
| `src/components/drone/drone.tsx` | Position + `rotation.y = -drone.yaw` (smoothed) on orientation group |
| `src/systems/update-drone.ts` | Thrust along nose (`droneForwardVector`), lateral damping |
| `src/components/camera/fpv-camera.tsx` | Chase cam from `droneForwardVector`, level horizon |

Do **not** add a second yaw flip in `models.ts` — visual yaw is negated in `drone.tsx` to match physics and camera.

### Tuning

- **Scale** — `DRONE_MODEL.targetSize` (auto-fit + center via `StaticModel`).
- **Orientation** — only adjust `DRONE_MODEL.rotation` if a new Blender export looks wrong in the **game** (example scene may still look fine with identity rotation).
- **Placeholder** — if the GLB fails to load, `drone.tsx` uses the same `DRONE_MODEL.rotation`.

## Pig animations

One GLB file contains every clip. `PigAnimatedModel` crossfades between them.

| State | Clip in pig.glb |
|-------|-----------------|
| Walk (armed) | `Walk_Left_with_Gun` + AK model |
| Run / flee | `Running` (weapon hidden) |
| Aim | `Archery_Aim_with_Lateral_Scan` |
| Shoot | `Archery_Shot_2` |
| Death (ram) | `Fall_Dead_from_Abdominal_Injury` |
| Death (munition) | `Shot_in_the_Back_and_Fall` |

## Tuning scale (other models)

Edit `targetSize` / `targetHeight` in `src/constants/models.ts` — models are auto-centered and fitted to that world-unit size.

Weapon attach offset: `WEAPON_AK.attach` in the same file.

## Inspect on disk

```bash
npx @gltf-transform/cli inspect public/models/drone/drone.glb
npx @gltf-transform/cli inspect public/models/pig/pig.glb
```

GLB binaries are gitignored but must exist locally (see `MANIFEST.md`).
