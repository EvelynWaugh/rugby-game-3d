import { Suspense, useRef } from 'react'
import { DirectionalLight, Object3D } from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sky, useGLTF, OrbitControls, Grid } from '@react-three/drei'
import { FpvCamera } from '@/components/camera/fpv-camera'
import { Drone } from '@/components/drone/drone'
import { PlayableDrone } from '@/components/drone/drone-example'
import { PigSoldier, RedSoldier } from '@/components/enemies/pig-soldier'
import { BlastEffects } from '@/components/fx/blast-effects'
import { ImpactCamera, ImpactCameraFrame } from '@/components/camera/impact-camera'
import { Bullets } from '@/components/fx/bullets'
import { Particles } from '@/components/fx/explosion'
import { RugbyBall } from '@/components/munitions/rugby-ball'
import { ShelterMesh } from '@/components/structures/shelter'
import { WindStreaks, SectorHazards } from '@/components/fx/sector-effects'
import { SECTOR_COLORS } from '@/components/terrain/ground'
import { LevelTerrain } from '@/components/terrain/level-1-outskirts'
import { DRONE_MODEL } from '@/constants/models'
import { useGameLoop } from '@/hooks/use-game-loop'
import { useGameStore } from '@/stores/use-game-store'

function SceneLights({ sun }: { sun: string }) {
  const light = useRef<DirectionalLight>(null)
  const target = useRef<Object3D>(null)
  useFrame(() => {
    const pos = useGameStore.getState().drone?.position
    if (!pos || !light.current || !target.current) return
    target.current.position.set(pos.x, 0, pos.z)
    light.current.target = target.current
    light.current.position.set(pos.x - 25, 36, pos.z + 18)
  })
  return (
    <>
      <object3D ref={target} />
      <hemisphereLight args={['#87ceeb', '#2d5a27', 0.6]} />
      <ambientLight intensity={0.45} />
      <directionalLight ref={light}
        shadow-camera-left={-34} shadow-camera-right={34}
        shadow-camera-top={34} shadow-camera-bottom={-34}
        shadow-normalBias={0.035}
        castShadow
        intensity={1.7}
        color={sun}
        position={[30, 60, 20]}
        shadow-mapSize={[1024, 1024]}
      />
    </>
  )
}

function GameWorld() {
  useGameLoop()

  const level = useGameStore(s => s.level)
  const palette = SECTOR_COLORS[level - 1]
  const soldiers = useGameStore((s) => s.soldiers)
  const shelters = useGameStore((s) => s.shelters)
  const munitions = useGameStore((s) => s.munitions)
  const bullets = useGameStore((s) => s.bullets)
  const particles = useGameStore((s) => s.particles)
  const impactView = useGameStore(s => s.impactView)
  const crashed = useGameStore(s => s.aftermath?.groundCrash)
  const gameState = useGameStore((s) => s.gameState)

  if (gameState !== 'playing' && gameState !== 'aftermath' && gameState !== 'levelclear') return null

  return (
    <>
      <color attach="background" args={[palette.haze]} />
      <Sky sunPosition={[-110, 52 - level * 5, 75]} turbidity={4} rayleigh={1.15} />
      <SceneLights sun={palette.sun} />
      <fog attach="fog" args={[palette.haze, 40, 225]} />

      <LevelTerrain key={level} level={level} />
      <SectorHazards />
      {level >= 2 && <WindStreaks />}
      <BlastEffects />
      {!crashed && <Drone />}

      {soldiers.map((s) =>
        s.pig ? (
          <PigSoldier key={s.id} soldier={s} />
        ) : (
          <RedSoldier key={s.id} soldier={s} />
        ),
      )}

      {shelters.map((sh) => (
        <ShelterMesh key={sh.id} shelter={sh} />
      ))}

      {munitions.map((m) => (
        <RugbyBall key={m.id} munition={m} />
      ))}

      <Bullets bullets={bullets} />
      <Particles particles={particles} />
      {impactView && <ImpactCamera view={impactView} />}
      <FpvCamera />
    </>
  )
}

export function GameScene() {
  const gameState = useGameStore((s) => s.gameState)
  const showCanvas = gameState === 'playing' || gameState === 'aftermath' || gameState === 'levelclear'

  return (
    <div className="absolute inset-0 bg-[#07090d]">
      <ImpactCameraFrame />
      {showCanvas && (
        <Canvas
          dpr={[1, 1.5]}
          shadows
          camera={{ fov: 75, near: 0.05, far: 600, position: [0, 12, 8] }}
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            <GameWorld />
          </Suspense>
        </Canvas>
      )}
    </div>
  )
}


// function DroneModel({ url }: { url: string }) {
//   // useGLTF handles loading and caching automatically
//   const { scene } = useGLTF(url as string) as any;

//   return (
//     <primitive object={scene}>
//       {/* Local Axes Helper attached directly to the drone */}
//       {/* Red = X, Green = Y, Blue = Z */}
//       <axesHelper args={[2]} />
//     </primitive>
//   );
// }

// Pre-load the GLTF file to avoid pop-in
useGLTF.preload(DRONE_MODEL.path);

export function GameSceneExample() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      <Canvas camera={{ position: [3, 3, 5], fov: 60 }}>
        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 7]} intensity={2.0} />

        {/* Floor Grid */}
        <Grid 
          infiniteGrid 
          cellSize={1} 
          sectionSize={5} 
          fadeDistance={30} 
          sectionColor="#4f4f4f" 
          cellColor="#2f2f2f" 
        />

        {/* Suspense is required when using useGLTF */}
        <Suspense fallback={null}>
          <PlayableDrone url={DRONE_MODEL.path} />
        </Suspense>

        {/* Camera Controls */}
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}