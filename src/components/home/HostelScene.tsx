import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return reduced;
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function WindowGrid({
  width,
  floors,
  cols,
  origin,
  rotY = 0,
}: {
  width: number;
  floors: number;
  cols: number;
  origin: [number, number, number];
  rotY?: number;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = floors * cols;
  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const dummy = new THREE.Object3D();
    const gapX = width / (cols + 0.4);
    let i = 0;
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < cols; c++) {
        dummy.position.set(origin[0] - width / 2 + gapX * (c + 0.7), origin[1] + f * 0.72, origin[2]);
        dummy.rotation.set(0, rotY, 0);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
        i++;
      }
    }
    m.instanceMatrix.needsUpdate = true;
  }, [width, floors, cols, origin, rotY]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.28, 0.38, 0.04]} />
      <meshStandardMaterial color="#16343a" roughness={0.35} metalness={0.05} />
    </instancedMesh>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.55, 6]} />
        <meshStandardMaterial color="#6b5344" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <sphereGeometry args={[0.32, 12, 10]} />
        <meshStandardMaterial color="#6f8f6a" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Pin({ position, delay }: { position: [number, number, number]; delay: number }) {
  const ref = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();
  useFrame((state) => {
    if (!ref.current || reduced) return;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2 + delay) * 0.06;
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial color="#c4785a" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.22, 6]} />
        <meshStandardMaterial color="#0f3d45" />
      </mesh>
    </group>
  );
}

function Campus() {
  const group = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();
  useFrame((state) => {
    if (!group.current || reduced) return;
    group.current.rotation.y = -0.55 + Math.sin(state.clock.elapsedTime * 0.18) * 0.07;
  });

  const cream = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f3eee6', roughness: 0.82 }), []);
  const teal = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0f5c63', roughness: 0.55 }), []);
  const terracotta = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c4785a', roughness: 0.7 }), []);
  const navy = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1c2b33', roughness: 0.6 }), []);

  return (
    <group ref={group} rotation={[0.08, -0.55, 0]} position={[0.15, -0.35, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[4.2, 40]} />
        <meshStandardMaterial color="#d7e0d2" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0, 1.15]}>
        <planeGeometry args={[1.1, 2.2]} />
        <meshStandardMaterial color="#efe6d8" />
      </mesh>

      <mesh position={[0, 1.55, 0]} material={cream} castShadow>
        <boxGeometry args={[2.35, 3.1, 1.55]} />
      </mesh>
      <mesh position={[0, 3.18, 0]} material={terracotta}>
        <boxGeometry args={[2.5, 0.12, 1.7]} />
      </mesh>
      <mesh position={[0, 0.18, 0.8]} material={teal}>
        <boxGeometry args={[0.7, 0.36, 0.18]} />
      </mesh>
      <mesh position={[0, 0.55, 0.78]} material={navy}>
        <boxGeometry args={[0.42, 0.55, 0.06]} />
      </mesh>

      {[1.05, 1.75, 2.45].map((y) => (
        <mesh key={y} position={[0, y, 0.8]} material={teal}>
          <boxGeometry args={[1.7, 0.05, 0.22]} />
        </mesh>
      ))}

      <WindowGrid width={2.0} floors={4} cols={4} origin={[0, 0.72, 0.8]} />

      <mesh position={[-1.85, 1.05, 0.15]} material={cream} castShadow>
        <boxGeometry args={[1.15, 2.1, 1.2]} />
      </mesh>
      <mesh position={[-1.85, 2.16, 0.15]} material={terracotta}>
        <boxGeometry args={[1.25, 0.1, 1.32]} />
      </mesh>
      <WindowGrid width={0.9} floors={3} cols={2} origin={[-1.85, 0.45, 0.78]} />

      <mesh position={[1.7, 0.7, -0.35]} material={cream}>
        <boxGeometry args={[0.9, 1.35, 0.9]} />
      </mesh>

      <Tree position={[-2.5, 0, 1.35]} />
      <Tree position={[2.15, 0, 1.2]} />
      <Tree position={[1.35, 0, -1.45]} />
      <Pin position={[-0.7, 3.35, 0.2]} delay={0} />
      <Pin position={[1.55, 1.7, 0.1]} delay={1.2} />
      <Pin position={[-1.9, 2.45, 0.4]} delay={2.1} />
    </group>
  );
}

function SceneFallback() {
  return (
    <svg viewBox="0 0 480 420" className="w-full h-full" role="img" aria-label="Illustrated hostel building in Kota">
      <rect width="480" height="420" fill="#e7efe4" />
      <ellipse cx="240" cy="340" rx="170" ry="28" fill="#d5e0cf" />
      <rect x="150" y="120" width="180" height="200" rx="6" fill="#f3eee6" />
      <rect x="145" y="108" width="190" height="16" fill="#c4785a" />
      <rect x="70" y="180" width="90" height="140" rx="4" fill="#efe8dc" />
      <rect x="66" y="170" width="98" height="12" fill="#c4785a" />
      {Array.from({ length: 12 }).map((_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return <rect key={i} x={168 + col * 40} y={145 + row * 46} width="22" height="28" rx="2" fill="#16343a" />;
      })}
      <rect x="220" y="270" width="40" height="50" fill="#1c2b33" />
      <circle cx="118" cy="300" r="22" fill="#6f8f6a" />
      <circle cx="360" cy="292" r="26" fill="#6f8f6a" />
    </svg>
  );
}

export function HostelCanvas() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    setOk(hasWebGL());
  }, []);

  if (ok === false || failed) return <SceneFallback />;
  if (ok === null) return <div className="w-full h-full bg-[#e7efe4]" aria-hidden />;

  return (
    <Canvas
      camera={{ position: [5.4, 3.4, 6.2], fov: 32 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={reduced ? 'demand' : 'always'}
      onCreated={({ gl }) => {
        gl.setClearColor('#e7efe4', 1);
      }}
      onError={() => setFailed(true)}
      aria-label="Three dimensional view of a hostel building"
    >
      <ambientLight intensity={0.85} />
      <hemisphereLight args={['#f7f3ec', '#8aa882', 0.45]} />
      <directionalLight position={[6, 8, 4]} intensity={1.15} />
      <Suspense fallback={null}>
        <Campus />
      </Suspense>
    </Canvas>
  );
}
