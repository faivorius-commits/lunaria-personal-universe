import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function moonTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 256, 256);
  grd.addColorStop(0, "#fff1f8"); grd.addColorStop(1, "#e6dcff");
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 256, y = Math.random() * 256, r = 4 + Math.random() * 18;
    const cg = g.createRadialGradient(x, y, 0, x, y, r);
    cg.addColorStop(0, "rgba(200,170,230,0.55)"); cg.addColorStop(1, "rgba(200,170,230,0)");
    g.fillStyle = cg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Floating({ children, speed = 1, amp = 0.15, spin = 0.2, position }: { children: React.ReactNode; speed?: number; amp?: number; spin?: number; position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const seed = useMemo(() => Math.random() * 10, []);
  useFrame((s) => {
    const g = ref.current; if (!g) return;
    const t = s.clock.elapsedTime * speed + seed;
    g.position.y = position[1] + Math.sin(t) * amp;
    g.rotation.y += spin * 0.01;
  });
  return <group ref={ref} position={position}>{children}</group>;
}

function Stars({ count = 160 }) {
  const geo = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { p[i * 3] = (Math.random() - 0.5) * 16; p[i * 3 + 1] = (Math.random() - 0.5) * 9; p[i * 3 + 2] = -2 - Math.random() * 6; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); return g;
  }, [count]);
  const ref = useRef<THREE.Points>(null);
  useFrame((s) => { if (ref.current) ref.current.rotation.z = s.clock.elapsedTime * 0.01; });
  return <points ref={ref} geometry={geo}><pointsMaterial size={0.06} color="#ffffff" transparent opacity={0.9} /></points>;
}

function Rig() {
  useFrame((s) => {
    s.camera.position.x += (s.pointer.x * 0.6 - s.camera.position.x) * 0.04;
    s.camera.position.y += (s.pointer.y * 0.4 - s.camera.position.y) * 0.04;
    s.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Scene3D({ variant = "dashboard" }: { variant?: "dashboard" | "lock" }) {
  const tex = useMemo(() => moonTexture(), []);
  const lock = variant === "lock";
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 5, 5]} intensity={1.6} color="#ffe6f4" />
      <pointLight position={[-4, -2, 3]} intensity={18} color="#a9b8ff" />
      <Stars />
      <Rig />
      <Floating position={lock ? [0, 0.3, 0] : [2.2, 0.4, 0]} amp={0.2} spin={0.3}>
        <mesh>
          <sphereGeometry args={[lock ? 1.3 : 1, 48, 48]} />
          <meshStandardMaterial map={tex} roughness={0.85} emissive="#f6c6ff" emissiveIntensity={0.18} />
        </mesh>
      </Floating>
      {!lock && (
        <>
          <Floating position={[-2.6, 0.9, -1]} speed={0.8} spin={0.6}>
            <mesh><sphereGeometry args={[0.45, 32, 32]} /><meshStandardMaterial color="#9fb4ff" roughness={0.4} /></mesh>
            <mesh rotation={[1.2, 0.2, 0]}><torusGeometry args={[0.75, 0.05, 12, 64]} /><meshStandardMaterial color="#ffc4e4" metalness={0.3} roughness={0.3} /></mesh>
          </Floating>
          <Floating position={[-1.2, -1.1, 0.5]} speed={1.3} spin={1.2}>
            <mesh><octahedronGeometry args={[0.32]} /><meshPhysicalMaterial color="#e7b8ff" roughness={0.1} transmission={0.6} thickness={0.5} /></mesh>
          </Floating>
          <Floating position={[0.6, 1.4, -1.5]} speed={0.6}>
            <mesh><sphereGeometry args={[0.22, 24, 24]} /><meshStandardMaterial color="#ffb3d1" roughness={0.5} /></mesh>
          </Floating>
        </>
      )}
      {lock && (
        <Floating position={[1.7, -0.8, 0.6]} speed={1.2} spin={1.5}>
          <mesh><octahedronGeometry args={[0.35]} /><meshPhysicalMaterial color="#c8b8ff" roughness={0.1} transmission={0.6} thickness={0.5} /></mesh>
        </Floating>
      )}
    </Canvas>
  );
}
