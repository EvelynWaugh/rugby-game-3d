import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky, useGLTF, OrbitControls, Grid } from '@react-three/drei'
import { FpvCamera } from '@/components/camera/fpv-camera'
import { Drone } from '@/components/drone/drone'
import { PlayableDrone } from '@/components/drone/drone-example'
import { PigSoldier, RedSoldier } from '@/components/enemies/pig-soldier'
import { Bullets } from '@/components/fx/bullets'
import { Particles, PigSplatParts, SmokeClouds } from '@/components/fx/explosion'
import { RugbyBall } from '@/components/munitions/rugby-ball'
import { ShelterMesh } from '@/components/structures/shelter'
import { Level1Outskirts } from '@/components/terrain/level-1-outskirts'
import { useGameLoop } from '@/hooks/use-game-loop'
import { useGameStore } from '@/stores/use-game-store'

function SceneLights() {
  return (
    <>
      <hemisphereLight args={['#87ceeb', '#2d5a27', 0.6]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        castShadow
        intensity={1.4}
        position={[30, 60, 20]}
        shadow-mapSize={[1024, 1024]}
      />
    </>
  )
}

function GameWorld() {
  useGameLoop()

  const soldiers = useGameStore((s) => s.soldiers)
  const shelters = useGameStore((s) => s.shelters)
  const munitions = useGameStore((s) => s.munitions)
  const bullets = useGameStore((s) => s.bullets)
  const particles = useGameStore((s) => s.particles)
  const smoke = useGameStore((s) => s.smoke)
  const pigParts = useGameStore((s) => s.pigParts)
  const gameState = useGameStore((s) => s.gameState)

  if (gameState !== 'playing' && gameState !== 'levelclear') return null

  return (
    <>
      <color attach="background" args={['#6eb5e8']} />
      <Sky sunPosition={[100, 40, 100]} turbidity={2} rayleigh={1.5} />
      <SceneLights />
      <fog attach="fog" args={['#87ceeb', 50, 220]} />

      <Level1Outskirts />
      <Drone />

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
      <SmokeClouds smoke={smoke} />
      <PigSplatParts parts={pigParts} />
      <FpvCamera />
    </>
  )
}

export function GameScene() {
  const gameState = useGameStore((s) => s.gameState)
  const showCanvas = gameState === 'playing' || gameState === 'levelclear'

  return (
    <div className="absolute inset-0 bg-[#07090d]">
      {showCanvas && (
        <Canvas
          shadows
          camera={{ fov: 75, near: 0.1, far: 600, position: [0, 12, 8] }}
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
useGLTF.preload('/models/drone/drone.glb');

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
          <PlayableDrone url="/models/drone/drone.glb" />
        </Suspense>

        {/* Camera Controls */}
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}