import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const DIE_COLOR = '#e0a850'
const ROLL_DURATION = 1.4 // segundos

// d10: three.js no trae un trapezoedro pentagonal (la forma real de un d10).
// Se aproxima uniendo dos conos de base pentagonal por su base — dos veces 5
// caras triangulares = 10 caras reales con normales propias, suficiente para
// numerarlas y hacer que el dado se asiente en la cara correcta.
function buildD10Geometry(): THREE.BufferGeometry {
  const top = new THREE.ConeGeometry(0.75, 0.85, 5, 1, true)
  top.translate(0, 0.425, 0)
  const bottom = new THREE.ConeGeometry(0.75, 0.85, 5, 1, true)
  bottom.rotateX(Math.PI)
  bottom.translate(0, -0.425, 0)
  return mergeGeometries([top, bottom]) ?? top
}

function buildDieGeometry(sides: number): THREE.BufferGeometry {
  switch (sides) {
    case 4: return new THREE.TetrahedronGeometry(0.85)
    case 6: return new THREE.BoxGeometry(1.15, 1.15, 1.15)
    case 8: return new THREE.OctahedronGeometry(0.95)
    case 12: return new THREE.DodecahedronGeometry(0.85)
    case 20: return new THREE.IcosahedronGeometry(0.9)
    case 10:
    case 100: return buildD10Geometry()
    default: return new THREE.IcosahedronGeometry(0.9)
  }
}

interface Face {
  normal: THREE.Vector3
  centroid: THREE.Vector3
}

// Agrupa los triángulos de la geometría por normal compartida — cada grupo es
// una cara real del poliedro (p.ej. las 2 mitades de un cuadrado en un cubo,
// o los 3 triángulos que forman un pentágono en un dodecaedro). Funciona igual
// para los 5 sólidos platónicos sin necesitar lógica particular por tipo.
function computeFaces(geometry: THREE.BufferGeometry): Face[] {
  const geo = geometry.index ? geometry.toNonIndexed() : geometry
  const pos = geo.getAttribute('position')
  const triCount = pos.count / 3
  const groups: { normal: THREE.Vector3; sum: THREE.Vector3; count: number }[] = []

  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const n = new THREE.Vector3()
  const centroid = new THREE.Vector3()

  for (let i = 0; i < triCount; i++) {
    a.fromBufferAttribute(pos, i * 3)
    b.fromBufferAttribute(pos, i * 3 + 1)
    c.fromBufferAttribute(pos, i * 3 + 2)
    THREE.Triangle.getNormal(a, b, c, n)
    centroid.copy(a).add(b).add(c).divideScalar(3)

    const match = groups.find((g) => g.normal.angleTo(n) < 0.05)
    if (match) {
      match.sum.add(centroid)
      match.count++
    } else {
      groups.push({ normal: n.clone(), sum: centroid.clone(), count: 1 })
    }
  }

  return groups.map((g) => ({ normal: g.normal, centroid: g.sum.divideScalar(g.count) }))
}

const textureCache = new Map<string, THREE.CanvasTexture>()

function getNumberTexture(label: string): THREE.CanvasTexture {
  const cached = textureCache.get(label)
  if (cached) return cached
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#141210'
  ctx.beginPath()
  ctx.arc(64, 64, 56, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = DIE_COLOR
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.fillStyle = DIE_COLOR
  ctx.font = `bold ${label.length > 2 ? 44 : 60}px "Fira Code", monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 64, 70)
  const texture = new THREE.CanvasTexture(canvas)
  textureCache.set(label, texture)
  return texture
}

function FaceLabel({ label, position }: { label: string; position: THREE.Vector3 }) {
  const texture = useMemo(() => getNumberTexture(label), [label])
  return (
    <sprite position={position} scale={[0.5, 0.5, 0.5]}>
      <spriteMaterial map={texture} transparent />
    </sprite>
  )
}

// Gira rápido y decreciente mientras converge (slerp con ease-out) hacia la
// orientación final que deja `targetNormal` mirando a cámara (+Z) — así el
// dado termina mostrando la cara correcta, no una al azar.
function useSettlingRotation(targetQuat: THREE.Quaternion, duration: number) {
  const ref = useRef<THREE.Group>(null)
  const anim = useRef<{ start: THREE.Quaternion; axis: THREE.Vector3; elapsed: number; done: boolean } | null>(null)
  if (!anim.current) {
    anim.current = {
      start: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
      ),
      axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      elapsed: 0,
      done: false,
    }
  }

  useFrame((_, delta) => {
    const a = anim.current!
    if (!ref.current || a.done) return
    a.elapsed += delta
    const t = Math.min(a.elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)

    const base = new THREE.Quaternion().slerpQuaternions(a.start, targetQuat, eased)
    const spin = new THREE.Quaternion().setFromAxisAngle(a.axis, (1 - eased) * 10)
    ref.current.quaternion.copy(base).multiply(spin)

    if (t >= 1) {
      a.done = true
      ref.current.quaternion.copy(targetQuat)
    }
  })

  return ref
}

interface DieMeshProps {
  sides: number
  value: number
}

function DieMesh({ sides, value }: DieMeshProps) {
  const geometry = useMemo(() => buildDieGeometry(sides), [sides])
  const faces = useMemo(() => computeFaces(geometry), [geometry])
  const faceCount = faces.length

  // d100 es decorativo: el motor lo tira como un valor plano 1-100 (no como
  // decenas+unidades), así que no hay una cara "correcta" real que mostrar —
  // se asienta en una cara al azar pero estable durante toda la tirada.
  const targetIndex = useMemo(() => {
    if (sides === 100) return Math.floor(Math.random() * faceCount)
    return ((value - 1) % faceCount + faceCount) % faceCount
  }, [sides, value, faceCount])

  const targetQuat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(faces[targetIndex].normal.clone().normalize(), new THREE.Vector3(0, 0, 1)),
    [faces, targetIndex]
  )

  const ref = useSettlingRotation(targetQuat, ROLL_DURATION)

  return (
    <group ref={ref}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={DIE_COLOR} flatShading />
      </mesh>
      {sides !== 100 && faces.map((f, i) => (
        <FaceLabel key={i} label={String(i + 1)} position={f.centroid.clone().addScaledVector(f.normal, 0.08)} />
      ))}
    </group>
  )
}

export interface DieRoll {
  sides: number
  value: number
}

interface Dice3DProps {
  dice: DieRoll[]
  onSettled?: () => void
}

// Anima cada dado desde un giro rápido hasta asentarse en su cara correcta.
// onSettled se dispara una sola vez, cuando termina la duración compartida
// por todos los dados de la tirada (ROLL_DURATION).
export function Dice3D({ dice, onSettled }: Dice3DProps) {
  useEffect(() => {
    if (!onSettled) return
    const timeout = setTimeout(onSettled, ROLL_DURATION * 1000)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visible = dice.slice(0, 6)
  const spacing = 1.9
  const startX = -((visible.length - 1) * spacing) / 2

  return (
    <Canvas camera={{ position: [0, 0, 4.5], fov: 40 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} />
      <directionalLight position={[-3, -2, -4]} intensity={0.5} />
      {visible.map((d, i) => (
        <group key={i} position={[startX + i * spacing, 0, 0]}>
          <DieMesh sides={d.sides} value={d.value} />
        </group>
      ))}
    </Canvas>
  )
}
