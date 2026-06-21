# Model manifest (tracked in git)

GLB binaries are gitignored (too large) but **must exist locally** for the game to run.

| Path | Purpose |
|------|---------|
| `drone/drone.glb` | Player drone |
| `ball/ball.glb` | Rugby munition |
| `weapon/ak/ak.glb` | AK attached to pigs |
| `pig/pig.glb` | Skinned pig — all animation clips in one file |

## Pig clips inside `pig/pig.glb`

| Clip name | Game state |
|-----------|------------|
| `Walk_Left_with_Gun` | Armed patrol |
| `Running` | Flee |
| `Archery_Aim_with_Lateral_Scan` | Aiming at drone |
| `Archery_Shot_2` | Firing |
| `Fall_Dead_from_Abdominal_Injury` | Ram death |
| `Shot_in_the_Back_and_Fall` | Munition death |

Registry: `src/constants/models.ts` (`PIG_MODEL`, `PIG_CLIPS`)
