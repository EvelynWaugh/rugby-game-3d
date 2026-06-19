# 3D Models

All asset paths and scale targets live in **`src/constants/models.ts`**.

## Layout

```
public/models/
  drone/drone.glb          — player drone
  ball/ball.glb            — rugby munition
  weapon/ak/ak.glb         — attached to pigs (pigs have no built-in gun)
  pig/*.glb                — one file per animation clip
```

## Pig animations

| State | GLB file |
|-------|----------|
| Walk (armed) | `Pig_Animation_Walk_Left_with_Gun_withSkin.glb` + AK model |
| Run / flee | `PIg_Animation_Running_withSkin.glb` |
| Aim | `Pig_Animation_Archery_Aim_with_Lateral_Scan_withSkin.glb` |
| Death (ram) | `Pig_Animation_Fall_Dead_from_Abdominal_Injury_withSkin.glb` |
| Death (munition) | `PIg_Animation_Shot_in_the_Back_and_Fall_withSkin.glb` |

## Tuning scale

Edit `targetSize` in `src/constants/models.ts` — every model is auto-centered and fitted to that world-unit size.

Weapon attach offset: `WEAPON_AK.attach` in the same file.
