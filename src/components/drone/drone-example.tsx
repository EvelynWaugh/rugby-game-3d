import  { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const keys = { KeyW: false, KeyS: false, KeyA: false, KeyD: false, ArrowUp: false, ArrowDown: false };

export function PlayableDrone({ url }: { url: string }) {
  const { scene } = useGLTF(url as string) as any;
  const droneRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.code in keys) (keys as any)[e.code as keyof typeof keys] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code in keys) (keys as any)[e.code as keyof typeof keys] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    console.log('useFrame', state);
    if (!droneRef.current) return;

    const moveSpeed = 5 * delta;
    const turnSpeed = 2 * delta;

    // 1. Altitude (Up / Down along Green axis)
    if (keys.ArrowUp) droneRef.current.position.z += moveSpeed;   // Green Up
    if (keys.ArrowDown) droneRef.current.position.z -= moveSpeed; // Green Down

    // 2. Yaw Rotation (Turning left/right around the Green vertical axis)
    if (keys.KeyA) droneRef.current.rotation.z += turnSpeed;
    if (keys.KeyD) droneRef.current.rotation.z -= turnSpeed;

    // 3. Moving Forward / Backward along Yellow Axis
    // Define forward as moving away from camera (-Yellow direction)
    const forwardVector = new THREE.Vector3(0, -1, 0);
    
    // Rotate vector to match the drone's current facing direction
    forwardVector.applyQuaternion(droneRef.current.quaternion);

    if (keys.KeyW) {
      // Fly Forward (Away from camera)
      droneRef.current.position.addScaledVector(forwardVector, moveSpeed);
    }
    if (keys.KeyS) {
      // Fly Backward (Toward camera)
      droneRef.current.position.addScaledVector(forwardVector, -moveSpeed);
    }
  });

  return (
    <group ref={droneRef}>
      <axesHelper args={[2]} />
      <primitive object={scene} />
    </group>
  );
}