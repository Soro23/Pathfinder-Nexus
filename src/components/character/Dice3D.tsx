import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Group } from 'three'

const DIE_COLOR = '#e0a850'
const DIE_COLOR_DIM = '#8a6a2a'

function PolyhedronGeometry({ sides }: { sides: number }) {
  switch (sides) {
    case 4: return <tetrahedronGeometry args={[0.85]} />
    case 6: return <boxGeometry args={[1.15, 1.15, 1.15]} />
    case 8: return <octahedronGeometry args={[0.95]} />
    case 12: return <dodecahedronGeometry args={[0.85]} />
    case 20: return <icosahedronGeometry args={[0.9]} />
    default: return <icosahedronGeometry args={[0.9]} />
  }
}

// d10/d100: three.js no trae un trapezoedro pentagonal (la forma real del d10).
// Se aproxima con dos conos de base pentagonal unidos por la base, que da la
// silueta bipiramidal característica del d10 sin modelar las 10 caras reales.
function D10Shape({ color = DIE_COLOR }: { color?: string }) {
  return (
    <>
      <mesh position={[0, 0.45, 0]}>
        <coneGeometry args={[0.75, 0.85, 5]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0, -0.45, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.75, 0.85, 5]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </>
  )
}

function SpinningDie({ sides, spinning, seed }: { sides: number; spinning: boolean; seed: number }) {
  const ref = useRef<Group>(null)
  const speedX = 2.5 + (seed % 5) * 0.6
  const speedY = 2 + (seed % 3) * 0.8

  useFrame((_, delta) => {
    if (!ref.current || !spinning) return
    ref.current.rotation.x += speedX * delta
    ref.current.rotation.y += speedY * delta
  })

  if (sides === 100) {
    return (
      <group ref={ref}>
        <group position={[-0.3, 0.15, 0.2]} scale={0.8}><D10Shape /></group>
        <group position={[0.3, -0.15, -0.2]} scale={0.8}><D10Shape color={DIE_COLOR_DIM} /></group>
      </group>
    )
  }

  if (sides === 10) {
    return <group ref={ref}><D10Shape /></group>
  }

  return (
    <group ref={ref}>
      <mesh>
        <PolyhedronGeometry sides={sides} />
        <meshStandardMaterial color={DIE_COLOR} flatShading />
      </mesh>
    </group>
  )
}

interface Dice3DProps {
  sides: number
  count: number
  spinning: boolean
}

// Animación decorativa: no mapea caras/números reales (three.js no trae el
// modelo exacto de un d10 y texturizar cada cara de cada poliedro con el
// numero correcto queda fuera de alcance). El resultado numérico se muestra
// aparte una vez resuelta la tirada.
export function Dice3D({ sides, count, spinning }: Dice3DProps) {
  const visibleCount = Math.min(count, 6)
  const dice = Array.from({ length: visibleCount })
  const spacing = 1.7
  const startX = -((dice.length - 1) * spacing) / 2

  return (
    <Canvas camera={{ position: [0, 0, 4.5], fov: 40 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <directionalLight position={[-3, -2, -4]} intensity={0.4} />
      {dice.map((_, i) => (
        <group key={i} position={[startX + i * spacing, 0, 0]}>
          <SpinningDie sides={sides} spinning={spinning} seed={i + 1} />
        </group>
      ))}
    </Canvas>
  )
}
