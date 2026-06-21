# 3D Models

All asset paths and scale targets live in **`src/constants/models.ts`**.

## Layout

```
public/models/
  drone/drone.glb          — player drone
  ball/ball.glb            — rugby munition
  weapon/ak/ak.glb         — attached to pigs (pigs have no built-in gun mesh)
  pig/pig.glb              — skinned pig with all animation clips
```

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

## Tuning scale

Edit `targetSize` / `targetHeight` in `src/constants/models.ts` — every model is auto-centered and fitted to that world-unit size.

Weapon attach offset: `WEAPON_AK.attach` in the same file.
