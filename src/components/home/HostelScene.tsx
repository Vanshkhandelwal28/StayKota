import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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

const TEAL = '#0e5c63';
const TEAL_DARK = '#0a3d44';
const TERRACOTTA = '#c17a5c';
const PATH = '#efe4d4';
const TRUNK = '#6a5344';
const LEAF = '#6d8b68';

function FacadeWindows({
  x0,
  y0,
  z,
  cols,
  rows,
  colGap,
  rowGap,
}: {
  x0: number;
  y0: number;
  z: number;
  cols: number;
  rows: number;
  colGap: number;
  rowGap: number;
}) {
  const items = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * colGap;
      const y = y0 + r * rowGap;
      items.push(
        <group key={`${r}-${c}`} position={[x, y, z]}>
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[0.42, 0.54, 0.04]} />
            <meshStandardMaterial color={TEAL} roughness={0.62} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.3, 0.4, 0.05]} />
            <meshStandardMaterial color="#10262c" roughness={0.25} metalness={0.08} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.012, 0.4, 0.02]} />
            <meshStandardMaterial color="#d9efe8" roughness={0.4} />
          </mesh>
        </group>,
      );
    }
  }
  return <group>{items}</group>;
}

function Balcony({ position, width }: { position: [number, number, number]; width: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0.16]}>
        <boxGeometry args={[width, 0.06, 0.32]} />
        <meshStandardMaterial color={TEAL} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.16, 0.3]}>
        <boxGeometry args={[width, 0.04, 0.04]} />
        <meshStandardMaterial color={TEAL_DARK} />
      </mesh>
      {[-width / 2, width / 2].map((x) => (
        <mesh key={x} position={[x, 0.1, 0.3]}>
          <boxGeometry args={[0.04, 0.22, 0.04]} />
          <meshStandardMaterial color={TEAL_DARK} />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.045, 0.07, 0.44, 6]} />
        <meshStandardMaterial color={TRUNK} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.38, 10, 8]} />
        <meshStandardMaterial color={LEAF} roughness={0.88} />
      </mesh>
      <mesh position={[0.12, 0.78, 0.05]}>
        <sphereGeometry args={[0.26, 10, 8]} />
        <meshStandardMaterial color="#5f7d5c" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Pin({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.08, 12]} />
        <meshStandardMaterial color={TERRACOTTA} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.28, 6]} />
        <meshStandardMaterial color={TEAL_DARK} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <sphereGeometry args={[0.07, 12, 10]} />
        <meshStandardMaterial color={TERRACOTTA} roughness={0.45} />
      </mesh>
    </group>
  );
}

function Campus() {
  const group = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();
  useFrame((state) => {
    if (!group.current || reduced) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.16) * 0.045;
  });

  const wall = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f7f1e8', roughness: 0.9 }), []);
  const annexWall = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e7efe8', roughness: 0.94 }), []);
  const farWall = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ddd4c8', roughness: 0.95 }), []);
  const roof = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c17a5c', roughness: 0.78 }), []);
  const trim = useMemo(() => new THREE.MeshStandardMaterial({ color: TEAL, roughness: 0.55 }), []);

  return (
    <group ref={group}>
      {/* ground sits under every object */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[4.6, 48]} />
        <meshStandardMaterial color="#b7c9b0" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.15, 0.008, 0.15]} receiveShadow>
        <circleGeometry args={[3.15, 40]} />
        <meshStandardMaterial color="#d5e3cc" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 1.55]} receiveShadow>
        <planeGeometry args={[1.05, 2.15]} />
        <meshStandardMaterial color={PATH} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.55, 0.016, 0.35]} receiveShadow>
        <planeGeometry args={[1.35, 0.62]} />
        <meshStandardMaterial color={PATH} roughness={0.95} />
      </mesh>

      {/* main hostel — origin at ground, height 3.05 */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 1.52, 0]} material={wall} castShadow receiveShadow>
          <boxGeometry args={[2.2, 3.05, 1.45]} />
        </mesh>
        {/* roof slab and parapet, seated on the top face */}
        <mesh position={[0, 3.1, 0]} material={roof}>
          <boxGeometry args={[2.36, 0.1, 1.6]} />
        </mesh>
        <mesh position={[0, 3.2, 0.72]}>
          <boxGeometry args={[2.36, 0.12, 0.08]} />
          <meshStandardMaterial color="#b56d52" />
        </mesh>
        {/* vertical piers so the front is not a blank wall */}
        {[-0.95, 0.95].map((x) => (
          <mesh key={x} position={[x, 1.52, 0.74]} material={trim}>
            <boxGeometry args={[0.08, 3.05, 0.06]} />
          </mesh>
        ))}
        <FacadeWindows x0={-0.66} y0={0.55} z={0.74} cols={3} rows={4} colGap={0.66} rowGap={0.68} />
        <Balcony position={[-0.66, 1.95, 0.72]} width={1.35} />
        <Balcony position={[0.33, 2.63, 0.72]} width={0.85} />
        {/* entrance, door bottom on the ground plane */}
        <mesh position={[0, 0.42, 0.76]}>
          <boxGeometry args={[0.46, 0.84, 0.06]} />
          <meshStandardMaterial color="#24383e" />
        </mesh>
        <mesh position={[0, 0.92, 0.86]} material={trim}>
          <boxGeometry args={[0.78, 0.06, 0.28]} />
        </mesh>
        {/* both side faces — the three-quarter view shows one of them */}
        {[-1.13, 1.13].map((x) =>
          [0.62, 1.38, 2.14].map((y) =>
            [-0.28, 0.28].map((z) => (
              <mesh key={`${x}-${y}-${z}`} position={[x, y, z]} castShadow>
                <boxGeometry args={[0.07, 0.36, 0.22]} />
                <meshStandardMaterial color="#10262c" roughness={0.28} metalness={0.06} />
              </mesh>
            )),
          ),
        )}
      </group>

      {/* lower annex, shares the ground */}
      <group position={[-1.85, 0, -0.15]}>
        <mesh position={[0, 0.95, 0]} material={annexWall} castShadow receiveShadow>
          <boxGeometry args={[1.15, 1.9, 1.15]} />
        </mesh>
        <mesh position={[0, 1.95, 0]} material={roof}>
          <boxGeometry args={[1.28, 0.08, 1.28]} />
        </mesh>
        <FacadeWindows x0={-0.22} y0={0.48} z={0.6} cols={2} rows={2} colGap={0.46} rowGap={0.7} />
      </group>

      {/* distant low block, grounded, smaller so the hostel stays the focus */}
      <mesh position={[2.05, 0.55, -0.85]} material={farWall} castShadow receiveShadow>
        <boxGeometry args={[0.95, 1.1, 0.8]} />
      </mesh>
      <mesh position={[2.05, 1.14, -0.85]} material={roof}>
        <boxGeometry args={[1.05, 0.07, 0.9]} />
      </mesh>

      <Tree position={[-2.55, 0, 1.15]} scale={1} />
      <Tree position={[1.85, 0, 1.35]} scale={0.9} />
      <Tree position={[2.45, 0, 0.15]} scale={0.7} />

      {/* markers sit on the path and the annex roof, not in empty air */}
      <Pin position={[0.55, 0.02, 1.85]} />
      <Pin position={[-1.85, 2.0, 0.15]} />
    </group>
  );
}

function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(5.15, 3.35, 5.35);
    camera.lookAt(0, 1.25, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
}

function SceneFallback() {
  return (
    <svg viewBox="0 0 480 420" className="w-full h-full" role="img" aria-label="Illustrated hostel building in Kota">
      <rect width="480" height="420" fill="#e7efe4" />
      <ellipse cx="240" cy="340" rx="170" ry="28" fill="#d5e0cf" />
      <rect x="150" y="110" width="180" height="210" rx="4" fill="#f4efe6" />
      <rect x="142" y="98" width="196" height="14" fill="#c17a5c" />
      <rect x="78" y="175" width="84" height="145" fill="#efe8dc" />
      {Array.from({ length: 12 }).map((_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return <rect key={i} x={172 + col * 48} y={132 + row * 46} width="22" height="30" fill="#1a3036" />;
      })}
      <rect x="214" y="268" width="36" height="52" fill="#24383e" />
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
      camera={{ position: [5.15, 3.35, 5.35], fov: 32, near: 0.1, far: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      frameloop={reduced ? 'demand' : 'always'}
      onCreated={({ gl, camera }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.setClearColor('#e4eee0', 1);
        camera.lookAt(0, 1.25, 0);
      }}
    >
      <CameraRig />
      <ambientLight intensity={0.42} />
      <hemisphereLight args={['#fff6ea', '#7d9476', 0.55]} />
      <directionalLight
        position={[4.2, 7.2, 3.2]}
        intensity={1.45}
        color="#fff3e4"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={18}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-3.5, 2.4, -2]} intensity={0.28} color="#d7ebe6" />
      <Suspense fallback={null}>
        <Campus />
      </Suspense>
    </Canvas>
  );
}
