import { DIFFICULTIES } from '@/constants/difficulty'
import {
  CATCH_ALTITUDE,
  CATCH_RANGE,
  PIG_BULLET_SPEED,
  PIG_BULLET_SPREAD,
  PIG_CATCH_SPEED,
  PIG_FIRE_INTERVAL,
  PIG_RUN_SPEED,
  PIG_TURN_CHANCE,
  PIG_WALK_SPEED,
  RAM_ALT_MARGIN,
  RAM_DAMAGE,
  RAM_HORIZ,
  SCORE,
  SOLDIER_SHOOT_RANGE_SQ,
} from '@/constants/game'
import { PIG_CATCH_FRAMES, PIG_SHOOT_FRAMES, PIG_TARGET_HEIGHT } from '@/constants/models'
import { markSoldierDead } from '@/systems/soldier-death'
import type { Bullet, Drone, Munition, Soldier } from '@/types/game'
import { distXZ, rand, uid } from '@/utils/math'

const LEASH_RADIUS = 14
const DRONE_SPOT_RANGE = 22
const FLEE_RANGE = 14

function setHorizSpeed(s: Soldier, speed: number, dirX?: number, dirZ?: number) {
  let x = dirX ?? s.velocity.x
  let z = dirZ ?? s.velocity.z
  const mag = Math.hypot(x, z)
  if (mag < 0.0001) {
    const angle = Math.random() * Math.PI * 2
    x = Math.sin(angle)
    z = Math.cos(angle)
  } else {
    x /= mag
    z /= mag
  }
  s.velocity.x = x * speed
  s.velocity.z = z * speed
}

function steerPatrol(s: Soldier, speed: number) {
  const dx = s.spawnPosition.x - s.position.x
  const dz = s.spawnPosition.z - s.position.z
  const dist = Math.hypot(dx, dz)
  if (dist > LEASH_RADIUS * 0.72) {
    setHorizSpeed(s, speed, dx, dz)
    return
  }
  if (Math.random() < PIG_TURN_CHANCE) {
    const angle = Math.random() * Math.PI * 2
    setHorizSpeed(s, speed, Math.sin(angle), Math.cos(angle))
    return
  }
  setHorizSpeed(s, speed)
}

function leashToSpawn(s: Soldier) {
  const dx = s.position.x - s.spawnPosition.x
  const dz = s.position.z - s.spawnPosition.z
  const dist = Math.hypot(dx, dz)
  if (dist <= LEASH_RADIUS) return

  const pull = (dist - LEASH_RADIUS) * 0.08
  s.position.x -= (dx / dist) * pull
  s.position.z -= (dz / dist) * pull
  s.velocity.x *= 0.85
  s.velocity.z *= 0.85
}

function startFlee(s: Soldier, awayX: number, awayZ: number, speed: number) {
  const dd = Math.hypot(awayX, awayZ) || 1
  s.velocity.x = (awayX / dd) * speed
  s.velocity.z = (awayZ / dd) * speed
  s.behavior = 'flee'
  s.catchTimer = 0
  if (!s.weaponDropped) s.weaponDropped = true
}

function startCatch(s: Soldier, towardX: number, towardZ: number) {
  s.behavior = 'catch'
  s.catchTimer = PIG_CATCH_FRAMES
  setHorizSpeed(s, PIG_CATCH_SPEED, towardX, towardZ)
}

function droneHitsBody(drone: Drone, s: Soldier) {
  if (distXZ(drone.position, s.position) > RAM_HORIZ) return false
  const top = s.position.y + PIG_TARGET_HEIGHT + RAM_ALT_MARGIN
  const bot = s.position.y - 0.2
  return drone.position.y <= top && drone.position.y >= bot
}

function isWeaponFiring(s: Soldier) {
  if (s.dead || s.weaponDropped) return false
  return s.behavior === 'shoot'
}

function spawnPigBullet(s: Soldier, drone: Drone): Bullet {
  const muzzleY = s.position.y + 1.25
  const toX = drone.position.x - s.position.x
  const toY = drone.position.y - muzzleY
  const toZ = drone.position.z - s.position.z
  const dist = Math.hypot(toX, toY, toZ) || 1
  const eta = Math.min(dist / PIG_BULLET_SPEED, 36)

  let dx = toX + drone.velocity.x * eta + rand(-PIG_BULLET_SPREAD, PIG_BULLET_SPREAD) * dist
  let dy = toY + drone.velocity.y * eta + rand(-PIG_BULLET_SPREAD, PIG_BULLET_SPREAD) * dist
  let dz = toZ + drone.velocity.z * eta + rand(-PIG_BULLET_SPREAD, PIG_BULLET_SPREAD) * dist
  const aimDist = Math.hypot(dx, dy, dz) || 1
  dx /= aimDist
  dy /= aimDist
  dz /= aimDist

  return {
    id: uid('bullet'),
    position: {
      x: s.position.x + dx * 0.7,
      y: muzzleY + dy * 0.7,
      z: s.position.z + dz * 0.7,
    },
    velocity: {
      x: dx * PIG_BULLET_SPEED,
      y: dy * PIG_BULLET_SPEED,
      z: dz * PIG_BULLET_SPEED,
    },
    life: 140,
    enemy: true,
  }
}

export interface SoldierUpdateResult {
  bullets: Bullet[]
  ramKills: Soldier[]
  scoreDelta: number
  droneDamage: number
  droneHit: number
}

export function updateSoldiers({
  soldiers,
  drone,
  munitions,
  difficulty,
  ewActive,
}: {
  soldiers: Soldier[]
  drone: Drone
  munitions: Munition[]
  difficulty: keyof typeof DIFFICULTIES
  ewActive: boolean
}): SoldierUpdateResult {
  const ds = DIFFICULTIES[difficulty]
  const bullets: Bullet[] = []
  const ramKills: Soldier[] = []
  let scoreDelta = 0
  let droneDamage = 0
  let droneHit = 0

  for (const s of soldiers) {
    if (s.dead) continue

    if (ewActive) {
      if (s.jamOff > 0) { s.jamOff--; s.visible = false; continue }
      if (Math.random() < 0.15) { s.jamOff = Math.floor(2 + Math.random() * 9); s.visible = false; continue }
      s.visible = true
    } else {
      s.visible = true
    }

    if (s.shootTimer > 0) {
      s.shootTimer--
      if (s.shootTimer <= 0 && s.behavior === 'shoot') s.behavior = 'biped'
    }

    if ((s.fireCool ?? 0) > 0) s.fireCool--

    if (s.catchTimer > 0) {
      s.catchTimer--
      if (s.catchTimer <= 0 && s.behavior === 'catch') s.behavior = 'biped'
    }

    s.position.x += s.velocity.x
    s.position.z += s.velocity.z
    leashToSpawn(s)

    const horiz = distXZ(drone.position, s.position)
    if (!s.immune && droneHitsBody(drone, s)) {
      markSoldierDead(s, 'shot')
      ramKills.push(s)
      scoreDelta += s.pig ? SCORE.pigRam : SCORE.redSoldier
      if (!droneHit) {
        droneDamage += RAM_DAMAGE
        droneHit = 8
      }
      continue
    }

    const spd = s.pig ? PIG_WALK_SPEED : PIG_WALK_SPEED * 0.7
    const dx = drone.position.x - s.position.x
    const dz = drone.position.z - s.position.z
    const rangeSq = dx * dx + dz * dz
    const inShootRange = rangeSq < SOLDIER_SHOOT_RANGE_SQ
    const seesDrone = horiz < DRONE_SPOT_RANGE
    const droneCatchable = horiz < CATCH_RANGE && drone.position.y < CATCH_ALTITUDE

    if (s.behavior !== 'shoot') {
      let flee = false
      for (const m of munitions) {
        if (m.alt < 0.4 && distXZ(s.position, m.position) < 9) {
          startFlee(s, s.position.x - m.position.x, s.position.z - m.position.z, PIG_RUN_SPEED)
          flee = true
          break
        }
      }

      if (!flee && seesDrone && s.cowardly && horiz < FLEE_RANGE) {
        startFlee(s, s.position.x - drone.position.x, s.position.z - drone.position.z, PIG_RUN_SPEED)
        flee = true
      } else if (!flee && s.behavior === 'flee') {
        s.behavior = 'biped'
      } else if (!flee && s.catcher && droneCatchable && s.behavior !== 'catch') {
        startCatch(s, dx, dz)
      } else if (!flee && s.behavior === 'catch') {
        // hold leap until catchTimer expires
      } else if (!flee && inShootRange && s.cool > 0 && s.cool <= 35) {
        s.behavior = 'aim'
      } else if (!flee && s.behavior === 'aim' && (s.cool > 35 || !inShootRange)) {
        s.behavior = 'biped'
      } else if (!flee && s.behavior !== 'aim') {
        s.behavior = 'biped'
      }
    }

    if (s.behavior === 'shoot') {
      const dist = Math.sqrt(rangeSq) || 1
      s.velocity.x = -(dx / dist) * PIG_WALK_SPEED * 0.65
      s.velocity.z = -(dz / dist) * PIG_WALK_SPEED * 0.65
    } else if (s.behavior === 'aim') {
      s.velocity.x = 0
      s.velocity.z = 0
    } else if (s.behavior === 'catch') {
      setHorizSpeed(s, PIG_CATCH_SPEED, dx, dz)
    } else if (s.behavior === 'flee') {
      setHorizSpeed(s, PIG_RUN_SPEED)
    } else {
      steerPatrol(s, spd)
    }

    s.cool--
    if (s.cool <= 0 && s.behavior !== 'flee' && s.behavior !== 'catch') {
      s.cool = rand(70, 160) * ds.enemyRate
      if (inShootRange && !s.weaponDropped) {
        s.behavior = 'shoot'
        s.shootTimer = PIG_SHOOT_FRAMES
      }
    }

    if (isWeaponFiring(s) && inShootRange && (s.fireCool ?? 0) <= 0) {
      s.fireCool = PIG_FIRE_INTERVAL
      bullets.push(spawnPigBullet(s, drone))
    }
  }

  return { bullets, ramKills, scoreDelta, droneDamage, droneHit }
}
