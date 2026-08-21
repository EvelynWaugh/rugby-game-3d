# Model manifest (tracked in git)

GLB binaries are gitignored (too large) but **must exist locally** for the game to run.

| Path | Purpose |
|------|---------|
| `drone/drone.glb` | Player drone — see **Drone** section in `public/models/README.md` |
| `ball/ball.glb` | Rugby munition |
| `weapon/ak/ak.glb` | AK attached to pigs |
| `pig/pig.glb` | Skinned pig — all animation clips in one file |
| `shelter/shelter.glb` | Destructible bunker (replaces the box placeholder) |
| `rat/rat.glb` | Skinned rats that patrol inside shelters |
| `trees/green-tree.glb` | Roadside trees on Outskirts |
| `trees/fallen-tree.glb` | Fallen log props |
| `trees/fallen-tree-2.glb` | Flat fallen-tree scatter |
| `trees/fallen-tree-3.glb` | Standing snag / leaning trunk |
| `crate/crate.glb` | Camp crates along the road |
| `granit/granit.glb` | Rocks |
| `dirt/dirt.glb` | Dirt mounds at the road edge |
| `damaged-wall/wall.glb` | Ruined wall fragments |
| `terrain/terrain.glb` | Ground patches beside the road |

## Pig clips inside `pig/pig.glb`

| Clip name | Game state |
|-----------|------------|
| `Walking` | Armed patrol |
| `Running` | Cowardly pigs flee |
| `Walk_Backward_While_Shooting` | Shooting (AK on RightHand) |
| `Leap_Right_and_Catch` | Catcher pigs leap at a nearby low drone |
| `Dead` | Ram or munition death |

Ignore `Armature|*|baselayer` (T-pose) and `*.001` duplicates. Registry: `src/constants/models.ts` (`PIG_MODEL`, `PIG_CLIPS`)

## Rat clips inside `rat/rat.glb`

| Clip name | Game state |
|-----------|------------|
| `Walking` | Patrol inside the shelter |
| `Fall_Dead_from_Abdominal_Injury` | Shelter destroyed |

Rats are constrained to the shelter interior (`SHELTER_INTERIOR_RATIO`). Registry: `RAT_MODEL`, `RAT_CLIPS`, `SHELTER_MODEL`.
