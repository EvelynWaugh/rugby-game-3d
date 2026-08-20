# Model manifest (tracked in git)

GLB binaries are gitignored (too large) but **must exist locally** for the game to run.

| Path | Purpose |
|------|---------|
| `drone/drone.glb` | Player drone — see **Drone** section in `public/models/README.md` |
| `ball/ball.glb` | Rugby munition |
| `weapon/ak/ak.glb` | AK attached to pigs |
| `pig/pig.glb` | Skinned pig — all animation clips in one file |

## Pig clips inside `pig/pig.glb`

| Clip name | Game state |
|-----------|------------|
| `Walking` | Armed patrol (in-place clip; world move in `update-soldiers.ts`) |
| `Running` | Flee |
| `Walking` paused | Aim / shoot (no dedicated clips) |
| `Dead` | Ram or munition death |

Ignore `Armature|*|baselayer` (T-pose) and `*.001` duplicates. Registry: `src/constants/models.ts` (`PIG_MODEL`, `PIG_CLIPS`)
